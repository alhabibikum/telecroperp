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
      q => q.table === table && q.recordId === recordId && q.action === 'INSERT' && q.status === 'pending'
    );
    if (pendingInsertIdx >= 0) {
      queue.splice(pendingInsertIdx, 1);
      saveSyncQueue(queue);
      return;
    }
  }

  // If there is already a pending UPDATE/UPSERT for this record, merge the latest data
  const existingIdx = queue.findIndex(
    q => q.table === table && q.recordId === recordId && (q.action === 'UPDATE' || q.action === 'UPSERT') && q.status === 'pending'
  );

  if (existingIdx >= 0 && (action === 'UPDATE' || action === 'UPSERT')) {
    queue[existingIdx].data = { ...queue[existingIdx].data, ...data };
    queue[existingIdx].timestamp = new Date().toISOString();
    queue[existingIdx].description = readableDesc;
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

  // If online, immediately trigger async processing in background
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    processSyncQueue().catch(err => {
      console.warn('Background sync error:', err);
    });
  }
};

/**
 * Map application camelCase objects to Supabase snake_case table columns
 */
const mapToSupabasePayload = (table: string, data: any): any => {
  if (!data || typeof data !== 'object') return data;

  switch (table) {
    case 'customers':
      return {
        id: data.id,
        customer_code: data.customerCode || data.id,
        shop_name: data.shopName,
        owner_name: data.ownerName,
        mobile: data.mobile,
        alternative_mobile: data.alternativeMobile || null,
        email: data.email || null,
        address: data.address || '',
        area: data.area || '',
        district: data.district || 'Dhaka',
        division: data.division || 'Dhaka',
        nid_number: data.nidNumber || null,
        trade_license: data.tradeLicense || null,
        credit_limit: data.creditLimit ?? 200000,
        allowed_due_days: data.allowedDueDays ?? 15,
        customer_type: data.customerType || 'Wholesale Dealer',
        salesman_id: data.salesmanId || null,
        opening_balance: data.openingBalance ?? 0,
        current_due: data.currentDue ?? 0,
        security_cheque_info: data.securityChequeInfo || null,
        status: data.status || 'Active'
      };

    case 'suppliers':
      return {
        id: data.id,
        supplier_code: data.supplierCode || data.id,
        name: data.name,
        company_name: data.companyName,
        contact_person: data.contactPerson || null,
        mobile: data.mobile,
        alternative_mobile: data.alternativeMobile || null,
        email: data.email || null,
        address: data.address || '',
        district: data.district || 'Dhaka',
        tax_vat_number: data.taxVatNumber || null,
        trade_license: data.tradeLicense || null,
        opening_balance: data.openingBalance ?? 0,
        credit_limit: data.creditLimit ?? 10000000,
        payment_terms_days: data.paymentTermsDays ?? 15,
        current_due: data.currentDue ?? 0,
        bank_info: data.bankInfo || null,
        status: data.status || 'Active'
      };

    case 'salesmen':
      return {
        id: data.id,
        employee_code: data.employeeCode || data.id,
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        address: data.address || '',
        joining_date: data.joiningDate || new Date().toISOString().split('T')[0],
        basic_salary: data.basicSalary ?? 25000,
        commission_type: data.commissionType || 'Percentage of Sales',
        commission_percentage: data.commissionRate ?? 1,
        target_monthly_bdt: data.monthlyTarget ?? 1000000,
        achieved_monthly_bdt: data.currentMonthSales ?? 0,
        assigned_area: data.assignedArea || 'Dhaka Territory',
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
        manager_name: data.managerName || '',
        contact_number: data.contactNumber || '',
        status: data.status || 'Active'
      };

    case 'products':
      return {
        id: data.id,
        brand_id: data.brandId || null,
        brand_name: data.brandName,
        model: data.model,
        category: data.category || 'Smartphone',
        network_region: data.networkRegion || 'Official BD (BTRC Approved)',
        warranty_period_months: data.warrantyPeriodMonths ?? 12,
        description: data.description || '',
        status: data.status || 'Active'
      };

    case 'imeis':
      return {
        id: data.id,
        imei1: data.imei1,
        imei2: data.imei2 || null,
        serial_number: data.serialNumber || null,
        product_id: data.productId,
        product_name: data.productName,
        variant_id: data.variantId,
        variant_desc: data.variantDesc,
        brand_name: data.brandName,
        purchase_cost: data.purchaseCost ?? 0,
        supplier_id: data.supplierId || null,
        supplier_name: data.supplierName || null,
        purchase_invoice_no: data.purchaseInvoiceNo || null,
        purchase_date: data.purchaseDate || new Date().toISOString().split('T')[0],
        warehouse_id: data.warehouseId,
        warehouse_name: data.warehouseName,
        status: data.status || 'In Stock',
        condition: data.condition || 'Brand New',
        customer_id: data.customerId || null,
        customer_name: data.customerName || null,
        sales_invoice_no: data.salesInvoiceNo || null,
        sales_date: data.salesDate || null,
        sales_price: data.salesPrice || null,
        return_reason: data.returnReason || null,
        warranty_expiry: data.warrantyExpiry || null,
        history: data.history || []
      };

    case 'sales_invoices':
      return {
        id: data.id,
        invoice_no: data.invoiceNo,
        invoice_type: data.invoiceType || 'Wholesale',
        customer_id: data.customerId,
        customer_name: data.customerName,
        customer_phone: data.customerPhone || null,
        salesman_id: data.salesmanId || null,
        salesman_name: data.salesmanName || null,
        warehouse_id: data.warehouseId,
        warehouse_name: data.warehouseName,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        sub_total: data.subTotal ?? 0,
        discount_total: data.discountTotal ?? 0,
        vat_total: data.vatTotal ?? 0,
        grand_total: data.grandTotal ?? 0,
        paid_amount: data.paidAmount ?? 0,
        due_amount: data.dueAmount ?? 0,
        payment_method: data.paymentMethod || 'Cash',
        status: data.status || 'Unpaid',
        notes: data.notes || '',
        items: data.items || [],
        payments: data.payments || []
      };

    case 'purchase_invoices':
      return {
        id: data.id,
        invoice_no: data.invoiceNo,
        supplier_id: data.supplierId,
        supplier_name: data.supplierName,
        purchase_date: data.purchaseDate,
        due_date: data.dueDate,
        warehouse_id: data.warehouseId,
        warehouse_name: data.warehouseName,
        items: data.items || [],
        sub_total: data.subTotal ?? 0,
        discount_total: data.discountTotal ?? 0,
        vat_total: data.vatTotal ?? 0,
        other_cost: data.otherCost ?? 0,
        grand_total: data.grandTotal ?? 0,
        paid_amount: data.paidAmount ?? 0,
        due_amount: data.dueAmount ?? 0,
        payment_method: data.paymentMethod || 'Cash',
        reference_no: data.referenceNo || null,
        status: data.status || 'Received',
        notes: data.notes || ''
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
        branch_name: data.branchName || null,
        avatar: data.avatar || '👤'
      };

    case 'system_settings':
      return {
        id: 'primary_settings',
        company_name: data.companyName,
        company_address: data.companyAddress,
        company_phone: data.companyPhone,
        company_email: data.companyEmail,
        currency: data.currency || 'BDT',
        language: data.language || 'bn',
        updated_at: new Date().toISOString()
      };

    default:
      return data;
  }
};

let isSyncing = false;

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
    return {
      success: false,
      totalPending: getSyncQueue().filter(q => q.status === 'pending').length,
      syncedCount: 0,
      failedCount: 0,
      message: 'একটি সিঙ্ক প্রক্রিয়া ইতিমধ্যে চলছে।'
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const pending = getSyncQueue().filter(q => q.status === 'pending').length;
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
  const pendingItems = queue.filter(q => q.status === 'pending' || q.status === 'failed');

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
                purchase_price: v.purchasePrice,
                dealer_price: v.dealerPrice,
                wholesale_price: v.wholesalePrice || v.dealerPrice,
                retail_price: v.retailPrice,
                min_selling_price: v.minSellingPrice || v.dealerPrice,
                max_discount: v.maxDiscount || 500,
                reorder_level: v.reorderLevel || 5,
                current_stock: v.currentStock || 0
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
      : `${syncedCount}টি পরিবর্তন সিঙ্ক হয়েছে, ${failedCount}টি ব্যর্থ হয়েছে। নেটওয়ার্ক চেক করুন।`;

    return {
      success: failedCount === 0,
      totalPending: queue.length,
      syncedCount,
      failedCount,
      message
    };
  } finally {
    isSyncing = false;
  }
};

/**
 * Get count of pending items waiting to sync
 */
export const getPendingSyncCount = (): number => {
  return getSyncQueue().filter(q => q.status === 'pending' || q.status === 'failed').length;
};
