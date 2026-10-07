import { getSupabaseClient } from './supabase';

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export interface SyncQueueItem {
  id: string;
  timestamp: string;
  table: string;
  action: SyncAction;
  recordId: string;
  data?: any;
  description: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  error?: string;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'TELECORP_OFFLINE_SYNC_QUEUE_V1';

/**
 * Retrieve the current offline sync queue from LocalStorage
 */
export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read sync queue from localStorage:', err);
    return [];
  }
};

/**
 * Save the sync queue to LocalStorage and dispatch change event
 */
const saveSyncQueue = (queue: SyncQueueItem[]) => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telecorp-sync-queue-updated', {
        detail: {
          pendingCount: queue.filter(q => q.status === 'pending' || q.status === 'failed').length,
          queue
        }
      }));
    }
  } catch (err) {
    console.error('Failed to write sync queue to localStorage:', err);
  }
};

/**
 * Enqueue a mutation (Create, Update, Delete) when any change happens in the ERP
 */
export const enqueueChange = (
  table: string,
  action: SyncAction,
  recordId: string,
  data?: any,
  description?: string
) => {
  const queue = getSyncQueue();
  const readableDesc = description || `${action} on ${table} (ID: ${recordId})`;

  // Smart deduplication:
  // If record was added offline and now deleted before ever syncing, remove both!
  if (action === 'DELETE') {
    const pendingInsertIdx = queue.findIndex(
      q => q.table === table && q.recordId === recordId && q.action === 'INSERT' && (q.status === 'pending' || q.status === 'failed')
    );
    if (pendingInsertIdx >= 0) {
      queue.splice(pendingInsertIdx, 1);
      saveSyncQueue(queue);
      return;
    }
  }

  // If there is already a pending UPDATE/UPSERT for this record, merge the latest data
  const existingIdx = queue.findIndex(
    q => q.table === table && q.recordId === recordId && (q.action === 'UPDATE' || q.action === 'UPSERT') && (q.status === 'pending' || q.status === 'failed')
  );

  if (existingIdx >= 0 && (action === 'UPDATE' || action === 'UPSERT')) {
    queue[existingIdx].data = { ...queue[existingIdx].data, ...data };
    queue[existingIdx].timestamp = new Date().toISOString();
    queue[existingIdx].description = readableDesc;
    queue[existingIdx].status = 'pending';
    saveSyncQueue(queue);
  } else {
    const newItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      table,
      action,
      recordId,
      data,
      description: readableDesc,
      status: 'pending',
      retryCount: 0
    };
    queue.push(newItem);
    saveSyncQueue(queue);
  }

  // If online, trigger processing in background
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    processSyncQueue().catch(err => {
      console.warn('Background sync error:', err);
    });
  }
};

/**
 * Map application camelCase objects to Supabase snake_case table columns
 */
export const mapToSupabasePayload = (table: string, data: any): any => {
  if (!data || typeof data !== 'object') return data;

  switch (table) {
    case 'customers':
      return {
        id: data.id,
        customer_code: data.customerCode || data.customer_code || data.id,
        shop_name: data.shopName || data.shop_name,
        owner_name: data.ownerName || data.owner_name || '',
        mobile: data.mobile,
        alternative_mobile: data.alternativeMobile || data.alternative_mobile || null,
        email: data.email || null,
        address: data.address || '',
        area: data.area || '',
        district: data.district || 'Dhaka',
        division: data.division || 'Dhaka',
        nid_number: data.nidNumber || data.nid_number || null,
        trade_license: data.tradeLicense || data.trade_license || null,
        credit_limit: data.creditLimit ?? data.credit_limit ?? 200000,
        allowed_due_days: data.allowedDueDays ?? data.allowed_due_days ?? 15,
        customer_type: data.customerType || data.customer_type || 'Wholesale Dealer',
        salesman_id: data.salesmanId || data.salesman_id || null,
        opening_balance: data.openingBalance ?? data.opening_balance ?? 0,
        current_due: data.currentDue ?? data.current_due ?? 0,
        security_cheque_info: data.securityChequeInfo || data.security_cheque_info || null,
        status: data.status || 'Active'
      };

    case 'suppliers':
      return {
        id: data.id,
        supplier_code: data.supplierCode || data.supplier_code || data.id,
        name: data.name,
        company_name: data.companyName || data.company_name || data.name,
        contact_person: data.contactPerson || data.contact_person || null,
        mobile: data.mobile,
        alternative_mobile: data.alternativeMobile || data.alternative_mobile || null,
        email: data.email || null,
        address: data.address || '',
        district: data.district || 'Dhaka',
        tax_vat_number: data.taxVatNumber || data.tax_vat_number || null,
        trade_license: data.tradeLicense || data.trade_license || null,
        opening_balance: data.openingBalance ?? data.opening_balance ?? 0,
        credit_limit: data.creditLimit ?? data.credit_limit ?? 10000000,
        payment_terms_days: data.paymentTermsDays ?? data.payment_terms_days ?? 15,
        current_due: data.currentDue ?? data.current_due ?? 0,
        bank_info: data.bankInfo || data.bank_info || null,
        status: data.status || 'Active'
      };

    case 'salesmen':
      return {
        id: data.id,
        employee_code: data.employeeCode || data.employee_code || data.id,
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        address: data.address || '',
        joining_date: data.joiningDate || data.joining_date || new Date().toISOString().split('T')[0],
        basic_salary: data.basicSalary ?? data.basic_salary ?? 25000,
        commission_type: data.commissionType || data.commission_type || 'Percentage of Sales',
        commission_percentage: data.commissionRate ?? data.commission_percentage ?? 1,
        target_monthly_bdt: data.monthlyTarget ?? data.target_monthly_bdt ?? 1000000,
        achieved_monthly_bdt: data.currentMonthSales ?? data.achieved_monthly_bdt ?? 0,
        assigned_area: data.assignedArea || data.assigned_area || 'Dhaka Territory',
        status: data.status || 'Active'
      };

    case 'brands':
      return {
        id: data.id,
        name: data.name,
        code: data.code || null,
        logo: data.logo || '📱',
        status: data.status || 'Active',
        description: data.description || ''
      };

    case 'warehouses':
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type || 'Branch Warehouse',
        address: data.address || '',
        city: data.city || 'Dhaka',
        manager_name: data.managerName || data.manager_name || '',
        contact_number: data.contactNumber || data.contact_number || '',
        status: data.status || 'Active'
      };

    case 'products':
      return {
        id: data.id,
        brand_id: data.brandId || data.brand_id || null,
        brand_name: data.brandName || data.brand_name || 'Samsung',
        model: data.model,
        category: data.category || 'Smartphone',
        network_region: data.networkRegion || data.network_region || 'Official BD (BTRC Approved)',
        warranty_period_months: data.warrantyPeriodMonths ?? data.warranty_period_months ?? 12,
        description: data.description || '',
        status: data.status || 'Active'
      };

    case 'imeis':
      return {
        id: data.id,
        imei1: data.imei1,
        imei2: data.imei2 || null,
        serial_number: data.serialNumber || data.serial_number || null,
        product_id: data.productId || data.product_id,
        product_name: data.productName || data.product_name,
        variant_id: data.variantId || data.variant_id,
        variant_desc: data.variantDesc || data.variant_desc || '',
        brand_name: data.brandName || data.brand_name || 'Brand',
        purchase_cost: data.purchaseCost ?? data.purchase_cost ?? 0,
        supplier_id: data.supplierId || data.supplier_id || null,
        supplier_name: data.supplierName || data.supplier_name || null,
        purchase_invoice_no: data.purchaseInvoiceNo || data.purchase_invoice_no || null,
        purchase_date: data.purchaseDate || data.purchase_date || new Date().toISOString().split('T')[0],
        warehouse_id: data.warehouseId || data.warehouse_id,
        warehouse_name: data.warehouseName || data.warehouse_name || 'Central Warehouse',
        status: data.status || 'In Stock',
        condition: data.condition || 'Brand New',
        customer_id: data.customerId || data.customer_id || null,
        customer_name: data.customerName || data.customer_name || null,
        sales_invoice_no: data.salesInvoiceNo || data.sales_invoice_no || null,
        sales_date: data.salesDate || data.sales_date || null,
        sales_price: data.salesPrice ?? data.sales_price ?? null,
        return_reason: data.returnReason || data.return_reason || null,
        warranty_expiry: data.warrantyExpiry || data.warranty_expiry || null,
        history: data.history || []
      };

    case 'sales_invoices':
      return {
        id: data.id,
        invoice_no: data.invoiceNo || data.invoice_no,
        invoice_type: data.invoiceType || data.invoice_type || 'Wholesale',
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_phone: data.customerPhone || data.customer_phone || null,
        salesman_id: data.salesmanId || data.salesman_id || null,
        salesman_name: data.salesmanName || data.salesman_name || null,
        warehouse_id: data.warehouseId || data.warehouse_id,
        warehouse_name: data.warehouseName || data.warehouse_name,
        invoice_date: data.invoiceDate || data.invoice_date || new Date().toISOString().split('T')[0],
        due_date: data.dueDate || data.due_date || data.invoiceDate || null,
        items: data.items || [],
        subtotal: data.subTotal ?? data.subtotal ?? 0,
        discount: data.discountTotal ?? data.discount ?? 0,
        vat_rate: data.vatRate ?? data.vat_rate ?? 0,
        vat_amount: data.vatTotal ?? data.vatAmount ?? data.vat_amount ?? 0,
        grand_total: data.grandTotal ?? data.grand_total ?? 0,
        paid_amount: data.paidAmount ?? data.paid_amount ?? 0,
        due_amount: data.dueAmount ?? data.due_amount ?? 0,
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        payments: data.payments || [],
        commission_earned: data.commissionEarned ?? data.commission_earned ?? 0,
        notes: data.notes || '',
        delivery_status: data.deliveryStatus || data.delivery_status || 'Delivered',
        status: data.status || 'Confirmed',
        created_by: data.createdBy || data.created_by || null
      };

    case 'purchase_invoices':
      return {
        id: data.id,
        invoice_no: data.invoiceNo || data.invoice_no,
        supplier_id: data.supplierId || data.supplier_id,
        supplier_name: data.supplierName || data.supplier_name,
        purchase_date: data.purchaseDate || data.purchase_date || new Date().toISOString().split('T')[0],
        due_date: data.dueDate || data.due_date || data.purchaseDate || null,
        warehouse_id: data.warehouseId || data.warehouse_id,
        warehouse_name: data.warehouseName || data.warehouse_name,
        items: data.items || [],
        subtotal: data.subTotal ?? data.subtotal ?? 0,
        discount_total: data.discountTotal ?? data.discount_total ?? 0,
        vat_total: data.vatTotal ?? data.vat_total ?? 0,
        transport_cost: data.transportCost ?? data.transport_cost ?? 0,
        other_expenses: data.otherCost ?? data.other_expenses ?? 0,
        total_amount: data.grandTotal ?? data.totalAmount ?? data.total_amount ?? 0,
        paid_amount: data.paidAmount ?? data.paid_amount ?? 0,
        due_amount: data.dueAmount ?? data.due_amount ?? 0,
        payment_status: data.paymentStatus || data.payment_status || (data.dueAmount > 0 ? 'Partial' : 'Paid'),
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        reference_no: data.referenceNo || data.reference_no || null,
        status: data.status || 'Received',
        notes: data.notes || ''
      };

    case 'bank_accounts':
      return {
        id: data.id,
        bank_name: data.bankName || data.bank_name,
        account_name: data.accountName || data.account_name,
        account_number: data.accountNumber || data.account_number,
        branch_name: data.branch || data.branchName || data.branch_name || null,
        account_type: data.accountType || data.account_type || 'Current',
        routing_number: data.routingNumber || data.routing_number || null,
        opening_balance: data.openingBalance ?? data.opening_balance ?? 0,
        current_balance: data.currentBalance ?? data.current_balance ?? data.openingBalance ?? 0,
        status: data.status || 'Active'
      };

    case 'bank_transactions':
      return {
        id: data.id,
        bank_account_id: data.bankAccountId || data.bank_account_id,
        bank_name: data.bankName || data.bank_name || 'Bank',
        date: data.date || new Date().toISOString().split('T')[0],
        type: data.type,
        reference_no: data.referenceNo || data.reference_no || null,
        amount: data.amount ?? 0,
        balance_after: data.balanceAfter ?? data.balance_after ?? 0,
        description: data.description || '',
        reconciled: Boolean(data.reconciled)
      };

    case 'bank_statements':
      return {
        id: data.id,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        reference_no: data.referenceNo || data.reference_no || null,
        debit: data.debit ?? 0,
        credit: data.credit ?? 0,
        matched_system_txn_id: data.matchedSystemTxnId || data.matched_system_txn_id || null,
        status: data.status || 'Unmatched'
      };

    case 'cash_transactions':
      return {
        id: data.id,
        voucher_no: data.voucherNo || data.referenceNo || data.voucher_no || `CSH-${Date.now()}`,
        date: data.date || new Date().toISOString().split('T')[0],
        type: data.type,
        category: data.category,
        amount: data.amount ?? 0,
        reference_no: data.referenceNo || data.reference_no || null,
        description: data.description || '',
        performed_by: data.performedBy || data.performed_by || null
      };

    case 'expenses':
      return {
        id: data.id,
        expense_no: data.expenseNo || data.expense_no,
        date: data.date || new Date().toISOString().split('T')[0],
        category_id: data.categoryId || data.category_id || null,
        category_name: data.categoryName || data.category_name,
        amount: data.amount ?? 0,
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        description: data.description || '',
        recipient_name: data.recipientName || data.recipient_name || null,
        voucher_ref: data.voucherRef || data.voucher_ref || null,
        approved_by: data.approvedBy || data.approved_by || null
      };

    case 'expense_categories':
      return {
        id: data.id,
        name: data.name,
        description: data.description || ''
      };

    case 'chart_of_accounts':
      return {
        id: data.code || data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        nature: data.nature,
        balance: data.balance ?? 0,
        description: data.description || '',
        is_system: Boolean(data.isSystem ?? data.is_system)
      };

    case 'journal_entries':
      return {
        id: data.id,
        voucher_no: data.voucherNo || data.voucher_no,
        date: data.date || new Date().toISOString().split('T')[0],
        voucher_type: data.voucherType || data.voucher_type || 'Journal Voucher',
        reference_no: data.referenceNo || data.reference_no || null,
        description: data.description || '',
        lines: data.lines || [],
        total_debit: data.totalDebit ?? data.total_debit ?? 0,
        total_credit: data.totalCredit ?? data.total_credit ?? 0,
        created_by: data.createdBy || data.created_by || null
      };

    case 'stock_transfers':
      return {
        id: data.id,
        transfer_no: data.transferNo || data.transfer_no,
        date: data.transferDate || data.date || new Date().toISOString().split('T')[0],
        from_warehouse_id: data.sourceWarehouseId || data.from_warehouse_id,
        from_warehouse_name: data.sourceWarehouseName || data.from_warehouse_name,
        to_warehouse_id: data.destinationWarehouseId || data.to_warehouse_id,
        to_warehouse_name: data.destinationWarehouseName || data.to_warehouse_name,
        items: data.items || [],
        imeis: data.imeis || (data.items ? data.items.flatMap((it: any) => it.imeis || []) : []),
        total_units: data.totalQuantity ?? data.totalUnits ?? data.total_units ?? 0,
        status: data.status || 'Received',
        requested_by: data.requestedBy || data.requested_by || null,
        dispatched_by: data.dispatchedBy || data.dispatched_by || null,
        received_by: data.receivedBy || data.received_by || null,
        notes: data.notes || ''
      };

    case 'customer_returns':
      return {
        id: data.id,
        return_no: data.returnNo || data.return_no,
        return_date: data.returnDate || data.return_date || new Date().toISOString().split('T')[0],
        sales_invoice_no: data.originalInvoiceNo || data.sales_invoice_no,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        product_id: data.productId || data.product_id || 'prod-1',
        product_name: data.productName || data.product_name,
        variant_id: data.variantId || data.variant_id || 'var-1',
        variant_desc: data.variantDesc || data.variant_desc || '',
        imei: data.imei,
        condition: data.condition || 'Sealed',
        return_reason: data.returnReason || data.return_reason || 'Customer Return',
        action_taken: data.actionTaken || data.action_taken || 'Credit Note',
        refund_or_credit_amount: data.refundOrCreditAmount ?? data.refund_or_credit_amount ?? 0,
        restock_warehouse_id: data.restockWarehouseId || data.restock_warehouse_id || null,
        restock_status: data.restockStatus || data.restock_status || 'Restocked',
        commission_reversed: data.commissionReversed ?? data.commission_reversed ?? 0,
        approved_by: data.approvedBy || data.approved_by || null,
        status: data.status || 'Processed',
        notes: data.notes || ''
      };

    case 'supplier_returns':
      return {
        id: data.id,
        return_no: data.returnNo || data.return_no,
        date: data.date || new Date().toISOString().split('T')[0],
        supplier_id: data.supplierId || data.supplier_id,
        supplier_name: data.supplierName || data.supplier_name,
        purchase_invoice_no: data.purchaseInvoiceNo || data.purchase_invoice_no || null,
        product_id: data.productId || data.product_id || null,
        product_name: data.productName || data.product_name || 'Handset',
        variant_desc: data.variantDesc || data.variant_desc || '',
        imei: data.imei,
        reason: data.returnReason || data.reason || 'Supplier Defect Return',
        amount: data.amount ?? 0,
        status: data.status || 'Completed'
      };

    case 'money_receipts':
      return {
        id: data.id,
        receipt_no: data.receiptNo || data.receipt_no,
        date: data.date || new Date().toISOString().split('T')[0],
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_phone: data.customerPhone || data.customer_phone || null,
        shop_name: data.shopName || data.shop_name || null,
        area: data.area || null,
        amount: data.amount ?? 0,
        discount_waiver: data.discountWaiver ?? data.discount_waiver ?? data.discountAllowed ?? data.discount_allowed ?? 0,
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        bank_name: data.bankName || data.bank_name || null,
        transaction_ref: data.transactionRef || data.transaction_ref || data.referenceNo || data.reference_no || null,
        collector_salesman_id: data.collectorSalesmanId || data.collector_salesman_id || null,
        collector_salesman_name: data.collectorSalesmanName || data.collector_salesman_name || null,
        reference_invoice: data.referenceInvoice || data.reference_invoice || null,
        notes: data.notes || '',
        status: data.status || 'Confirmed',
        allocations: data.allocations || [],
        created_by: data.createdBy || data.created_by || null
      };

    case 'emi_plans':
      return {
        id: data.id,
        plan_no: data.planNo || data.plan_no,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_mobile: data.customerMobile || data.customer_mobile,
        customer_address: data.customerAddress || data.customer_address || null,
        product_id: data.productId || data.product_id,
        product_name: data.productName || data.product_name,
        variant_desc: data.variantDesc || data.variant_desc || '',
        imei: data.imei,
        invoice_no: data.invoiceNo || data.invoice_no || null,
        warehouse_id: data.warehouseId || data.warehouse_id || 'wh-1',
        warehouse_name: data.warehouseName || data.warehouse_name || 'Main Warehouse',
        total_price: data.totalPrice ?? data.total_price ?? 0,
        down_payment: data.downPayment ?? data.down_payment ?? 0,
        financed_amount: data.financedAmount ?? data.financed_amount ?? 0,
        interest_rate: data.interestRate ?? data.interest_rate ?? 0,
        tenure_months: data.tenureMonths ?? data.tenure_months ?? 6,
        monthly_installment: data.monthlyInstallment ?? data.monthly_installment ?? 0,
        start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
        status: data.status || 'Active',
        guarantor: data.guarantor || {},
        documents: data.documents || {},
        installments: data.installments || [],
        total_paid: data.totalPaid ?? data.total_paid ?? 0,
        total_remaining: data.totalRemaining ?? data.total_remaining ?? 0,
        overdue_count: data.overdueCount ?? data.overdue_count ?? 0,
        notes: data.notes || ''
      };

    case 'commission_disbursements':
      return {
        id: data.id,
        disbursement_no: data.disbursementNo || data.disbursement_no,
        salesman_id: data.salesmanId || data.salesman_id,
        salesman_name: data.salesmanName || data.salesman_name,
        month: data.month,
        date: data.date || new Date().toISOString().split('T')[0],
        sales_amount: data.salesAmount ?? data.sales_amount ?? 0,
        collection_amount: data.collectionAmount ?? data.collection_amount ?? 0,
        sales_commission: data.salesCommission ?? data.sales_commission ?? 0,
        collection_commission: data.collectionCommission ?? data.collection_commission ?? 0,
        bonus_amount: data.bonusAmount ?? data.bonus_amount ?? 0,
        deduction_amount: data.deductionAmount ?? data.deduction_amount ?? 0,
        net_payable: data.netPayable ?? data.net_payable ?? 0,
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        reference_no: data.referenceNo || data.reference_no || null,
        status: data.status || 'Paid',
        paid_at: data.paidAt || data.paid_at || null
      };

    case 'warranty_claims':
      return {
        id: data.id,
        rma_number: data.rmaNumber || data.rma_number,
        date: data.date || new Date().toISOString().split('T')[0],
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_phone: data.customerPhone || data.customer_phone || null,
        brand_name: data.brandName || data.brand_name || 'Brand',
        product_model: data.productModel || data.product_model,
        imei: data.imei,
        purchase_invoice_no: data.purchaseInvoiceNo || data.purchase_invoice_no || null,
        purchase_date: data.purchaseDate || data.purchase_date || null,
        problem_description: data.problemDescription || data.problem_description,
        physical_condition: data.physicalCondition || data.physical_condition || '',
        accessories_included: data.accessoriesIncluded || data.accessories_included || '',
        service_center_name: data.serviceCenterName || data.service_center_name || 'TeleCorp Central Service Center',
        service_center_job_no: data.serviceCenterJobNo || data.service_center_job_no || null,
        status: data.status || 'Received',
        replacement_imei: data.replacementIMEI || data.replacement_imei || null,
        repair_cost_customer: data.repairCostCustomer ?? data.repair_cost_customer ?? 0,
        delivery_date: data.deliveryDate || data.delivery_date || null,
        remarks: data.remarks || null
      };

    case 'brand_incentive_schemes':
      return {
        id: data.id,
        brand_id: data.brandId || data.brand_id,
        brand_name: data.brandName || data.brand_name,
        scheme_title: data.schemeTitle || data.scheme_title,
        period: data.period || 'Monthly',
        start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.endDate || data.end_date || new Date().toISOString().split('T')[0],
        target_units: data.targetUnits ?? data.target_units ?? 0,
        achieved_units: data.achievedUnits ?? data.achieved_units ?? 0,
        slabs: data.slabs || [],
        total_incentive_earned: data.totalIncentiveEarned ?? data.total_incentive_earned ?? 0,
        claim_status: data.claimStatus || data.claim_status || 'In Progress',
        supplier_credit_note_no: data.supplierCreditNoteNo || data.supplier_credit_note_no || null
      };

    case 'delivery_challans':
      return {
        id: data.id,
        challan_no: data.challanNo || data.challan_no,
        date: data.date || new Date().toISOString().split('T')[0],
        invoice_no: data.invoiceNo || data.invoice_no,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_phone: data.customerPhone || data.customer_phone || null,
        delivery_address: data.deliveryAddress || data.delivery_address || 'Dhaka',
        district: data.district || 'Dhaka',
        courier_partner: data.courierPartner || data.courier_partner || 'Steadfast Courier',
        consignment_no: data.consignmentNo || data.consignment_no || null,
        is_cod: Boolean(data.isCOD ?? data.is_cod),
        cod_amount: data.codAmount ?? data.cod_amount ?? 0,
        cod_status: data.codStatus || data.cod_status || 'Not Applicable',
        delivery_status: data.deliveryStatus || data.delivery_status || 'Pending Dispatch',
        driver_name: data.driverName || data.driver_name || null,
        driver_phone: data.driverPhone || data.driver_phone || null,
        total_cartons: data.totalCartons ?? data.total_cartons ?? 1,
        imei_list: data.imeiList || data.imei_list || [],
        remarks: data.remarks || null,
        delivered_at: data.deliveredAt || data.delivered_at || null
      };

    case 'price_drop_claims':
      return {
        id: data.id,
        claim_no: data.claimNo || data.claim_no,
        claim_date: data.claimDate || data.claim_date || new Date().toISOString().split('T')[0],
        brand_name: data.brandName || data.brand_name,
        supplier_id: data.supplierId || data.supplier_id,
        supplier_name: data.supplierName || data.supplier_name,
        product_id: data.productId || data.product_id,
        product_model: data.productModel || data.product_model,
        variant_desc: data.variantDesc || data.variant_desc || '',
        old_purchase_cost: data.oldPurchaseCost ?? data.old_purchase_cost ?? 0,
        new_purchase_cost: data.newPurchaseCost ?? data.new_purchase_cost ?? 0,
        drop_per_unit: data.dropPerUnit ?? data.drop_per_unit ?? 0,
        eligible_stock_count: data.eligibleStockCount ?? data.eligible_stock_count ?? 0,
        total_claim_amount: data.totalClaimAmount ?? data.total_claim_amount ?? 0,
        claim_status: data.claimStatus || data.claim_status || 'Draft',
        credit_note_no: data.creditNoteNo || data.credit_note_no || null,
        announcement_ref: data.announcementRef || data.announcement_ref || null
      };

    case 'phone_exchange_records':
      return {
        id: data.id,
        exchange_no: data.exchangeNo || data.exchange_no,
        date: data.date || new Date().toISOString().split('T')[0],
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        customer_phone: data.customerPhone || data.customer_phone || null,
        salesman_id: data.salesmanId || data.salesman_id || null,
        salesman_name: data.salesmanName || data.salesman_name || null,
        old_brand: data.oldBrand || data.old_brand,
        old_model: data.oldModel || data.old_model,
        old_imei: data.oldIMEI || data.old_imei,
        old_condition: data.oldCondition || data.old_condition || 'Used',
        assessed_value: data.assessedValue ?? data.assessed_value ?? 0,
        new_product_id: data.newProductId || data.new_product_id,
        new_product_name: data.newProductName || data.new_product_name,
        new_variant_desc: data.newVariantDesc || data.new_variant_desc || '',
        new_imei: data.newIMEI || data.new_imei,
        new_phone_price: data.newPhonePrice ?? data.new_phone_price ?? 0,
        net_payable_amount: data.netPayableAmount ?? data.net_payable_amount ?? 0,
        amount_paid_now: data.amountPaidNow ?? data.amount_paid_now ?? 0,
        due_amount: data.dueAmount ?? data.due_amount ?? 0,
        payment_method: data.paymentMethod || data.payment_method || 'Cash',
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        notes: data.notes || null
      };

    case 'customer_follow_ups': {
      const allowedPurposes = ['Due Payment Follow-up', 'Overdue Recovery', 'Order Booking', 'Credit Limit Review'];
      const purpose = allowedPurposes.find(p => p.toLowerCase() === (data.purpose || '').toLowerCase()) || 'Due Payment Follow-up';
      const allowedStatus = ['Pending', 'Contacted - Promised Payment', 'Completed', 'Disputed / No Response'];
      const status = allowedStatus.find(s => s.toLowerCase() === (data.status || '').toLowerCase()) || 'Pending';

      return {
        id: data.id,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        shop_name: data.shopName || data.shop_name,
        salesman_id: data.salesmanId || data.salesman_id || null,
        salesman_name: data.salesmanName || data.salesman_name || null,
        scheduled_date: data.scheduledDate || data.scheduled_date || new Date().toISOString().split('T')[0],
        contact_number: data.contactNumber || data.contact_number || '01700-000000',
        purpose,
        current_due_amount: data.currentDueAmount ?? data.current_due_amount ?? 0,
        status,
        promised_date: data.promisedDate || data.promised_date || null,
        notes: data.notes || '',
        updated_at: data.updatedAt || data.updated_at || new Date().toISOString()
      };
    }

    case 'salesman_visits':
      return {
        id: data.id,
        salesman_id: data.salesmanId || data.salesman_id,
        salesman_name: data.salesmanName || data.salesman_name,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name || null,
        shop_name: data.shopName || data.shop_name,
        visit_date: data.visitDate || data.visit_date || new Date().toISOString().split('T')[0],
        purpose: data.purpose || 'Route Visit',
        outcome_notes: data.outcomeNotes || data.outcome_notes || '',
        order_amount_booked: data.orderAmountBooked ?? data.order_amount_booked ?? 0,
        collection_amount: data.collectionAmount ?? data.collection_amount ?? 0,
        next_follow_up_date: data.nextFollowUpDate || data.next_follow_up_date || null,
        status: data.status || 'Completed'
      };

    case 'day_closings':
      return {
        id: data.id,
        closing_no: data.closingNo || data.closing_no,
        date: data.date || new Date().toISOString().split('T')[0],
        cashier_name: data.cashierName || data.cashier_name,
        warehouse_id: data.warehouseId || data.warehouse_id,
        warehouse_name: data.warehouseName || data.warehouse_name || 'Central Warehouse',
        opening_cash: data.openingCash ?? data.opening_cash ?? 0,
        cash_sales_total: data.cashSalesTotal ?? data.cash_sales_total ?? 0,
        due_collections_total: data.dueCollectionsTotal ?? data.due_collections_total ?? 0,
        cash_expenses_total: data.cashExpensesTotal ?? data.cash_expenses_total ?? 0,
        bank_deposits_total: data.bankDepositsTotal ?? data.bank_deposits_total ?? 0,
        expected_closing_cash: data.expectedClosingCash ?? data.expected_closing_cash ?? 0,
        actual_physical_cash: data.actualPhysicalCash ?? data.actual_physical_cash ?? 0,
        discrepancy: data.discrepancy ?? 0,
        status: data.status || 'Balanced',
        verified_by: data.verifiedBy || data.verified_by || null,
        notes: data.notes || ''
      };

    case 'sms_logs':
      return {
        id: data.id,
        recipient_phone: data.recipientPhone || data.recipient_phone,
        recipient_name: data.recipientName || data.recipient_name,
        message_type: data.messageType || data.message_type || 'Transactional',
        message_body: data.messageBody || data.message_body,
        sent_at: data.sentAt || data.sent_at || new Date().toISOString(),
        status: data.status || 'Delivered',
        masking: data.masking || 'TeleCorp',
        sms_units: data.smsUnits ?? data.sms_units ?? 1
      };

    case 'system_alerts':
      return {
        id: data.id,
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        read: Boolean(data.read),
        link_module: data.linkModule || data.link_module || null,
        reference_id: data.referenceId || data.reference_id || null
      };

    case 'app_users':
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        password: data.password || '123456',
        status: data.status || 'Active',
        phone: data.phone || null,
        department: data.department || null,
        branch_name: data.branchName || data.branch_name || null,
        avatar: data.avatar || '👤'
      };

    case 'bank_statements':
      return {
        id: data.id,
        bank_account_id: data.bankAccountId || data.bank_account_id || null,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        reference_no: data.referenceNo || data.reference_no || '',
        debit: data.debit ?? 0,
        credit: data.credit ?? 0,
        matched_system_txn_id: data.matchedSystemTxnId || data.matched_system_txn_id || null,
        status: data.status || 'Unmatched'
      };

    case 'system_settings':
      return {
        id: 'primary_settings',
        company_name: data.companyName || data.company_name,
        company_address: data.companyAddress || data.company_address,
        company_phone: data.companyPhone || data.company_phone,
        company_email: data.companyEmail || data.company_email,
        currency: data.currency || 'BDT',
        language: data.language || 'bn',
        updated_at: new Date().toISOString()
      };

    default:
      return data;
  }
};

let isSyncing = false;
let needsReSync = false;

/**
 * Process all pending mutations in the sync queue and transmit to Supabase Cloud
 */
export const processSyncQueue = async (): Promise<{
  success: boolean;
  totalPending: number;
  syncedCount: number;
  failedCount: number;
  message: string;
}> => {
  if (isSyncing) {
    needsReSync = true;
    return {
      success: false,
      totalPending: getSyncQueue().filter(q => q.status === 'pending' || q.status === 'failed').length,
      syncedCount: 0,
      failedCount: 0,
      message: 'একটি সিঙ্ক প্রক্রিয়া ইতিমধ্যে চলছে।'
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const pending = getSyncQueue().filter(q => q.status === 'pending' || q.status === 'failed').length;
    return {
      success: false,
      totalPending: pending,
      syncedCount: 0,
      failedCount: 0,
      message: `ডিভাইস অফলাইনে রয়েছে। ${pending}টি পরিবর্তন অফলাইনে সংরক্ষিত আছে।`
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      totalPending: 0,
      syncedCount: 0,
      failedCount: 0,
      message: 'Supabase ক্লাউড ডেটাবেস সক্রিয় করা নেই।'
    };
  }

  isSyncing = true;
  let queue = getSyncQueue();
  // Filter items that need syncing and have not exceeded 5 failed retries
  const pendingItems = queue.filter(q => (q.status === 'pending' || q.status === 'failed') && (q.retryCount || 0) < 5);

  if (pendingItems.length === 0) {
    isSyncing = false;
    return {
      success: true,
      totalPending: 0,
      syncedCount: 0,
      failedCount: 0,
      message: 'সকল তথ্য ইতিমধ্যে ক্লাউডের সাথে সম্পূর্ণ সিঙ্ক রয়েছে।'
    };
  }

  let syncedCount = 0;
  let failedCount = 0;

  try {
    for (const item of pendingItems) {
      item.status = 'syncing';
      saveSyncQueue(queue);

      try {
        if (item.action === 'DELETE') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.recordId);

          if (error) throw error;
        } else {
          // INSERT / UPDATE / UPSERT
          const payload = mapToSupabasePayload(item.table, item.data);
          const { error } = await supabase
            .from(item.table)
            .upsert(payload, { onConflict: 'id' });

          if (error) throw error;

          // If product has variants, also upsert product_variants
          if (item.table === 'products' && item.data?.variants && Array.isArray(item.data.variants)) {
            for (const v of item.data.variants) {
              const variantPayload = {
                id: v.id,
                product_id: item.recordId,
                sku: v.sku,
                ram: v.ram,
                storage: v.storage,
                color: v.color,
                purchase_price: v.purchasePrice ?? v.purchase_price ?? 0,
                dealer_price: v.dealerPrice ?? v.dealer_price ?? 0,
                wholesale_price: v.wholesalePrice ?? v.wholesale_price ?? v.dealerPrice ?? 0,
                retail_price: v.retailPrice ?? v.retail_price ?? 0,
                min_selling_price: v.minSellingPrice ?? v.min_selling_price ?? v.dealerPrice ?? 0,
                max_discount: v.maxDiscount ?? v.max_discount ?? 500,
                reorder_level: v.reorderLevel ?? v.reorder_level ?? 5,
                current_stock: v.currentStock ?? v.current_stock ?? 0
              };
              await supabase.from('product_variants').upsert(variantPayload, { onConflict: 'id' });
            }
          }
        }

        item.status = 'synced';
        item.error = undefined;
        syncedCount++;
      } catch (err: any) {
        console.warn(`Failed to sync item ${item.id} (${item.table}):`, err);
        item.status = 'failed';
        item.error = err.message || 'Unknown Supabase sync error';
        item.retryCount = (item.retryCount || 0) + 1;
        failedCount++;
      }
    }

    // Clean up successfully synced items from queue to keep storage lightweight
    queue = queue.filter(q => q.status !== 'synced');
    saveSyncQueue(queue);

    const message = failedCount === 0
      ? `অফলাইনে করা ${syncedCount}টি পরিবর্তন সফলভাবে ক্লাউডে সিঙ্ক ও আপডেট হয়েছে!`
      : `${syncedCount}টি পরিবর্তন সিঙ্ক হয়েছে, ${failedCount}টি সাময়িকভাবে ব্যর্থ হয়েছে। নেটওয়ার্ক চেক করুন।`;

    return {
      success: failedCount === 0,
      totalPending: queue.length,
      syncedCount,
      failedCount,
      message
    };
  } finally {
    isSyncing = false;
    if (needsReSync) {
      needsReSync = false;
      setTimeout(() => {
        processSyncQueue().catch(e => console.warn('Deferred sync queue run error:', e));
      }, 100);
    }
  }
};

/**
 * Get count of pending items waiting to sync
 */
export const getPendingSyncCount = (): number => {
  return getSyncQueue().filter(q => q.status === 'pending' || q.status === 'failed').length;
};

/**
 * Clear the offline sync queue from LocalStorage and dispatch event
 */
export const clearSyncQueue = () => {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telecorp-sync-queue-updated', {
        detail: {
          pendingCount: 0,
          queue: []
        }
      }));
    }
  } catch (err) {
    console.error('Failed to clear sync queue from localStorage:', err);
  }
};
