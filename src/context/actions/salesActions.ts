import type React from 'react';
import type {
  SalesInvoice,
  IMEIRecord,
  Product,
  Customer,
  Salesman,
  BankAccount,
  CashTransaction,
  JournalEntry,
  CustomerReturn,
  PhoneExchangeTransaction,
  DeliveryChallan,
  DeliveryStatus,
  ReturnCondition,
  PaymentAllocationItem,
  PaymentMethodType,
  SystemSettings,
  SystemAlert,
  CommissionDisbursement,
  MoneyReceipt,
  SmsLog,
  CrudResult,
  UserRole
} from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';
import { EnqueueChangeFn, AddAuditFn } from './types';
import { fail, todayStr, reverseJournalsHelper, pushCashHelper, adjustBankHelper } from './helpers';

export interface SalesContextBundle {
  salesInvoices: SalesInvoice[];
  setSalesInvoices: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  imeis: IMEIRecord[];
  setImeis: React.Dispatch<React.SetStateAction<IMEIRecord[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  salesmen: Salesman[];
  setSalesmen: React.Dispatch<React.SetStateAction<Salesman[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  customerReturns: CustomerReturn[];
  setCustomerReturns: React.Dispatch<React.SetStateAction<CustomerReturn[]>>;
  phoneExchanges: PhoneExchangeTransaction[];
  setPhoneExchanges: React.Dispatch<React.SetStateAction<PhoneExchangeTransaction[]>>;
  deliveryChallans: DeliveryChallan[];
  setDeliveryChallans: React.Dispatch<React.SetStateAction<DeliveryChallan[]>>;
  settings: SystemSettings;
  alerts: SystemAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<SystemAlert[]>>;
  moneyReceipts?: MoneyReceipt[];
  setMoneyReceipts?: React.Dispatch<React.SetStateAction<MoneyReceipt[]>>;
  sendSmsNotification?: (sms: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => void;
  currentUserRole: UserRole;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;
}

export const executeCreateSale = (
  saleData: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'createdAt'>,
  ctx: SalesContextBundle
) => {
  const {
    customers,
    settings,
    currentUserRole,
    setAlerts,
    imeis,
    salesInvoices,
    salesmen,
    setSalesmen,
    setImeis,
    setProducts,
    setCustomers,
    setCashTransactions,
    bankAccounts,
    setBankAccounts,
    journalEntries,
    setJournalEntries,
    setSalesInvoices,
    enqueueChange,
    addAudit
  } = ctx;

  const customer = customers.find(c => c.id === saleData.customerId);

  if (customer && customer.customerType !== 'Walk-in') {
    const projectedDue = customer.currentDue + saleData.dueAmount;
    if (customer.creditLimit > 0 && projectedDue > customer.creditLimit) {
      if (settings.creditLimitHardBlock && currentUserRole !== 'Super Admin' && currentUserRole !== 'Owner') {
        return {
          success: false,
          error: `Credit limit exceeded! Customer limit is ৳ ${customer.creditLimit.toLocaleString()}, current due is ৳ ${customer.currentDue.toLocaleString()}. Selling with ৳ ${saleData.dueAmount.toLocaleString()} due requires Super Admin / Owner approval.`
        };
      } else {
        setAlerts(prev => [
          {
            id: `alert-${Date.now()}`,
            type: 'critical',
            title: 'Credit Limit Overridden for Sale',
            message: `Sale invoice created for ${customer.shopName} with due ৳ ${saleData.dueAmount.toLocaleString()}, exceeding limit by ৳ ${(projectedDue - customer.creditLimit).toLocaleString()}.`,
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
            read: false,
            linkModule: 'sales'
          },
          ...prev
        ]);
      }
    }
  }

  const requestedImeis: string[] = [];
  saleData.items.forEach(item => {
    requestedImeis.push(...item.imeiList);
  });

  for (const imeiNum of requestedImeis) {
    const record = imeis.find(i => i.imei1 === imeiNum);
    if (!record) {
      return { success: false, error: `IMEI ${imeiNum} not found in database!` };
    }
    if (record.status !== 'In Stock') {
      return { success: false, error: `IMEI ${imeiNum} is currently '${record.status}'. Only 'In Stock' phones can be sold.` };
    }
  }

  const invoiceNo = generateDocNumber('SAL', salesInvoices.length);
  const today = new Date().toISOString().split('T')[0];

  let commissionEarned = 0;
  if (saleData.salesmanId) {
    const sm = salesmen.find(s => s.id === saleData.salesmanId);
    if (sm) {
      const totalUnits = saleData.items.reduce((acc, item) => acc + item.quantity, 0);
      const totalCost = saleData.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
      const grossProfit = Math.max(0, saleData.grandTotal - totalCost);

      if (sm.commissionType === 'Percentage of Sales') {
        commissionEarned = (saleData.grandTotal * sm.commissionRate) / 100;
      } else if (sm.commissionType === 'Percentage of Gross Profit') {
        commissionEarned = (grossProfit * sm.commissionRate) / 100;
      } else if (sm.commissionType === 'Fixed Per Unit') {
        commissionEarned = totalUnits * sm.commissionRate;
      } else if (sm.commissionType === 'Target Based') {
        // Multiplier based on monthly target progress
        const projectedSales = (sm.currentMonthSales || 0) + saleData.grandTotal;
        const target = sm.monthlyTarget || 1;
        const achievementPct = (projectedSales / target) * 100;
        let rateMultiplier = 1;
        if (achievementPct < 75) rateMultiplier = 0.6;
        else if (achievementPct < 100) rateMultiplier = 0.9;
        else if (achievementPct < 120) rateMultiplier = 1.2;
        else rateMultiplier = 1.5;
        commissionEarned = (saleData.grandTotal * (sm.commissionRate * rateMultiplier)) / 100;
      }
    }
  }

  const newSaleInvoice: SalesInvoice = {
    ...saleData,
    id: `sale-${Date.now()}`,
    invoiceNo,
    commissionEarned,
    createdAt: today
  };

  setImeis(prev =>
    prev.map(i => {
      if (requestedImeis.includes(i.imei1)) {
        return {
          ...i,
          status: 'Sold',
          customerId: saleData.customerId,
          customerName: saleData.customerName,
          salesInvoiceNo: invoiceNo,
          salesDate: saleData.invoiceDate,
          history: [
            ...i.history,
            {
              date: `${saleData.invoiceDate} 15:30`,
              action: saleData.invoiceType === 'Wholesale' ? 'Wholesale Sold' : 'Retail POS Sold',
              description: `Sold to ${saleData.customerName} via invoice ${invoiceNo}`,
              user: currentUserRole,
              referenceNo: invoiceNo
            }
          ]
        };
      }
      return i;
    })
  );

  setProducts(prev =>
    prev.map(p => ({
      ...p,
      variants: p.variants.map(v => {
        const soldItem = saleData.items.find(item => item.variantId === v.id);
        return soldItem ? { ...v, currentStock: Math.max(0, v.currentStock - soldItem.quantity) } : v;
      })
    }))
  );

  if (customer) {
    setCustomers(prev =>
      prev.map(c =>
        c.id === saleData.customerId
          ? { ...c, currentDue: c.currentDue + saleData.dueAmount }
          : c
      )
    );
  }

  saleData.payments.forEach(p => {
    if (p.amount > 0) {
      if (p.method === 'Cash') {
        setCashTransactions(prev => [
          {
            id: `cash-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            date: `${today} 16:00`,
            type: 'Cash In',
            category: 'Customer Sale',
            amount: p.amount,
            referenceNo: invoiceNo,
            description: `Payment received for invoice ${invoiceNo} from ${saleData.customerName}`,
            performedBy: currentUserRole,
            warehouseId: saleData.warehouseId,
            customerId: saleData.customerId
          },
          ...prev
        ]);
      } else {
        const targetBankId = p.bankAccountId || (bankAccounts[0]?.id);
        if (targetBankId) {
          setBankAccounts(prev =>
            prev.map(b =>
              b.id === targetBankId
                ? { ...b, currentBalance: b.currentBalance + p.amount }
                : b
            )
          );
        }
      }
    }
  });

  const totalCost = saleData.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: saleData.invoiceDate,
    voucherType: 'Sales Voucher',
    referenceNo: invoiceNo,
    description: `Sales Invoice to ${saleData.customerName} (${saleData.invoiceType})`,
    lines: [
      ...(saleData.dueAmount > 0
        ? [
          {
            accountCode: '1020',
            accountName: 'Accounts Receivable (Customer Due)',
            debit: saleData.dueAmount,
            credit: 0,
            memo: `Receivable from ${saleData.customerName}`
          }
        ]
        : []),
      ...saleData.payments
        .filter(p => p.amount > 0)
        .map(p => ({
          accountCode: p.method === 'Cash' ? '1000' : '1010',
          accountName: p.method === 'Cash' ? 'Cash in Hand' : 'Bank Accounts',
          debit: p.amount,
          credit: 0,
          memo: `Received via ${p.method}`
        })),
      {
        accountCode: saleData.invoiceType === 'Wholesale' ? '4000' : '4010',
        accountName: saleData.invoiceType === 'Wholesale' ? 'Wholesale Mobile Sales Revenue' : 'Retail POS Sales Revenue',
        debit: 0,
        credit: saleData.grandTotal,
        memo: `Gross Revenue billed on ${invoiceNo}`
      },
      {
        accountCode: '5000',
        accountName: 'Cost of Goods Sold (COGS - Handsets)',
        debit: totalCost,
        credit: 0,
        memo: `Cost of mobile handsets sold on ${invoiceNo}`
      },
      {
        accountCode: '1050',
        accountName: 'Merchandise Inventory (Mobile Stock)',
        debit: 0,
        credit: totalCost,
        memo: `Inventory reduction for ${invoiceNo}`
      }
    ],
    totalDebit: saleData.grandTotal + totalCost,
    totalCredit: saleData.grandTotal + totalCost,
    createdBy: currentUserRole,
    createdAt: today
  };

  setSalesInvoices(prev => [newSaleInvoice, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);

  if (saleData.salesmanId) {
    const totalSoldUnits = saleData.items.reduce((acc, item) => acc + item.quantity, 0);
    setSalesmen(prev =>
      prev.map(s =>
        s.id === saleData.salesmanId
          ? {
              ...s,
              currentMonthSales: (s.currentMonthSales || 0) + saleData.grandTotal,
              currentMonthUnits: (s.currentMonthUnits || 0) + totalSoldUnits
            }
          : s
      )
    );
  }

  enqueueChange('sales_invoices', 'INSERT', newSaleInvoice.id, newSaleInvoice, `নতুন সেলস ইনভয়েস #${invoiceNo}`);
  requestedImeis.forEach(imeiNum => {
    const imRecord = imeis.find(i => i.imei1 === imeiNum);
    if (imRecord) {
      enqueueChange('imeis', 'UPDATE', imRecord.id, {
        ...imRecord,
        status: 'Sold',
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        salesInvoiceNo: invoiceNo,
        salesDate: saleData.invoiceDate
      }, `IMEI সেল্স আউট #${imeiNum}`);
    }
  });

  if (customer && customer.customerType !== 'Walk-in' && saleData.dueAmount > 0) {
    enqueueChange('customers', 'UPDATE', customer.id, {
      ...customer,
      currentDue: customer.currentDue + saleData.dueAmount
    }, `কাস্টমার বকেয়া বৃদ্ধি (${customer.shopName})`);
  }

  addAudit('Created Sales Invoice', 'Sales', invoiceNo, undefined, `Customer: ${saleData.customerName}, Total: ৳ ${saleData.grandTotal}, Paid: ৳ ${saleData.paidAmount}, Due: ৳ ${saleData.dueAmount}`);

  // Auto-send SMS to Customer if enabled
  if (ctx.sendSmsNotification && (settings.apiIntegrations?.autoSmsOnSale ?? true) && customer?.mobile) {
    const text = `প্রিয় ${customer.ownerName || customer.shopName}, TeleCorp থেকে আপনার ইনভয়েস #${invoiceNo} সম্পন্ন হয়েছে। মোট: ৳${saleData.grandTotal.toLocaleString()}, পরিশোধ: ৳${saleData.paidAmount.toLocaleString()}, বকেয়া: ৳${saleData.dueAmount.toLocaleString()}। ধন্যবাদ!`;
    ctx.sendSmsNotification({
      recipientPhone: customer.mobile,
      recipientName: customer.shopName,
      messageType: 'Invoice Alert',
      messageBody: text,
      masking: settings.apiIntegrations?.smsSenderId || 'TeleCorp',
      smsUnits: 1
    });
  }

  return { success: true, invoiceNo };
};

export const executeUpdateSaleInvoiceMeta = (
  id: string,
  data: Partial<Pick<SalesInvoice, 'notes' | 'dueDate'>>,
  ctx: Pick<SalesContextBundle, 'salesInvoices' | 'setSalesInvoices' | 'enqueueChange' | 'addAudit'>
): CrudResult => {
  const { salesInvoices, setSalesInvoices, enqueueChange, addAudit } = ctx;
  const inv = salesInvoices.find(s => s.id === id);
  if (!inv) return fail('Invoice not found.');
  if (inv.status === 'Cancelled') return fail('Cancelled invoices cannot be edited.');
  const updated = { ...inv, ...data };
  setSalesInvoices(prev => prev.map(s => (s.id === id ? updated : s)));
  enqueueChange('sales_invoices', 'UPDATE', id, updated, `ইনভয়েস তথ্য আপডেট #${inv.invoiceNo}`);
  addAudit('Edited Sales Invoice Details', 'Sales', inv.invoiceNo, undefined, JSON.stringify(data));
  return { success: true };
};

export const executeCancelSale = (
  id: string,
  reason: string | undefined,
  ctx: SalesContextBundle
): CrudResult => {
  const {
    salesInvoices,
    setSalesInvoices,
    imeis,
    setImeis,
    setProducts,
    customers,
    setCustomers,
    setCashTransactions,
    bankAccounts,
    setBankAccounts,
    salesmen,
    setSalesmen,
    customerReturns,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const inv = salesInvoices.find(s => s.id === id);
  if (!inv) return fail('Invoice not found.');
  if (inv.status === 'Cancelled') return fail('This invoice is already cancelled.');
  if (customerReturns.some(r => r.originalInvoiceNo === inv.invoiceNo)) {
    return fail('Cannot cancel: returns already exist against this invoice. Please manage returns first.');
  }

  const today = todayStr();
  const soldImeis = inv.items.flatMap(it => it.imeiList || []);
  const originalPaid = inv.paidAmount;

  setImeis(prev =>
    prev.map(i => {
      if (soldImeis.includes(i.imei1)) {
        return {
          ...i,
          status: 'In Stock' as const,
          customerId: undefined,
          customerName: undefined,
          salesInvoiceNo: undefined,
          salesDate: undefined,
          history: [
            ...i.history,
            {
              date: `${today} 10:00`,
              action: 'Sale Cancelled - Restocked',
              description: `Invoice ${inv.invoiceNo} cancelled (${reason || 'Voided'}). Returned to stock.`,
              user: currentUserRole,
              referenceNo: inv.invoiceNo
            }
          ]
        };
      }
      return i;
    })
  );

  soldImeis.forEach(num => {
    const im = imeis.find(i => i.imei1 === num);
    if (im) {
      enqueueChange('imeis', 'UPDATE', im.id, {
        ...im,
        status: 'In Stock',
        customerId: null,
        customerName: null,
        salesInvoiceNo: null,
        salesDate: null
      }, `IMEI সেল ক্যান্সেলেশনে রিস্টক #${num}`);
    }
  });

  setProducts(prev =>
    prev.map(p => ({
      ...p,
      variants: p.variants.map(v => {
        const qty = inv.items.filter(it => it.variantId === v.id).reduce((a, it) => a + it.quantity, 0);
        return qty > 0 ? { ...v, currentStock: v.currentStock + qty } : v;
      })
    }))
  );

  const customer = customers.find(c => c.id === inv.customerId);
  if (customer) {
    setCustomers(prev =>
      prev.map(c => (c.id === inv.customerId ? { ...c, currentDue: Math.max(0, c.currentDue - inv.dueAmount) } : c))
    );
  }

  inv.payments.forEach(p => {
    if (p.amount <= 0) return;
    if (p.method === 'Cash') {
      pushCashHelper(
        setCashTransactions,
        'Cash Out',
        'Customer Sale',
        p.amount,
        inv.invoiceNo,
        `Refund/reversal for cancelled invoice ${inv.invoiceNo}`,
        currentUserRole,
        {
          warehouseId: inv.warehouseId,
          customerId: inv.customerId
        }
      );
    } else {
      adjustBankHelper(setBankAccounts, p.bankAccountId || bankAccounts[0]?.id, -p.amount);
    }
  });

  if (inv.salesmanId) {
    setSalesmen(prev =>
      prev.map(s =>
        s.id === inv.salesmanId
          ? {
            ...s,
            currentMonthSales: Math.max(0, s.currentMonthSales - inv.grandTotal),
            currentMonthCollection: Math.max(0, s.currentMonthCollection - originalPaid)
          }
          : s
      )
    );
  }

  reverseJournalsHelper(journalEntries, setJournalEntries, inv.invoiceNo, `Cancelled sale ${inv.invoiceNo}`, currentUserRole);

  setSalesInvoices(prev =>
    prev.map(s =>
      s.id === id
        ? { ...s, status: 'Cancelled', notes: `${s.notes ? s.notes + ' | ' : ''}CANCELLED ${today}${reason ? ': ' + reason : ''}` }
        : s
    )
  );
  enqueueChange('sales_invoices', 'UPDATE', id, { id, status: 'Cancelled' }, `সেলস ইনভয়েস বাতিল #${inv.invoiceNo}`);
  if (customer && customer.customerType !== 'Walk-in') {
    enqueueChange('customers', 'UPDATE', customer.id, { ...customer, currentDue: Math.max(0, customer.currentDue - inv.dueAmount) }, `কাস্টমার বকেয়া রিভার্স (${customer.shopName})`);
  }
  addAudit('Cancelled Sales Invoice', 'Sales', inv.invoiceNo, `Total ৳ ${inv.grandTotal}`, reason || 'Cancelled');
  return { success: true };
};

export const executeCollectCustomerPayment = (
  data: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    transactionRef?: string;
    collectorSalesmanId?: string;
    allocations: PaymentAllocationItem[];
    notes?: string;
  },
  ctx: Pick<SalesContextBundle, 'customers' | 'setCustomers' | 'salesInvoices' | 'setSalesInvoices' | 'salesmen' | 'setSalesmen' | 'bankAccounts' | 'setBankAccounts' | 'setCashTransactions' | 'journalEntries' | 'setJournalEntries' | 'setMoneyReceipts' | 'settings' | 'sendSmsNotification' | 'currentUserRole' | 'enqueueChange' | 'addAudit'>
) => {
  const { customers, setCustomers, salesInvoices, setSalesInvoices, salesmen, setSalesmen, bankAccounts, setBankAccounts, setCashTransactions, journalEntries, setJournalEntries, setMoneyReceipts, settings, sendSmsNotification, currentUserRole, enqueueChange, addAudit } = ctx;
  const customer = customers.find(c => c.id === data.customerId);
  if (!customer) return { success: false, error: 'Customer not found' };

  const collectionNo = generateDocNumber('REC', 100);
  const today = new Date().toISOString().split('T')[0];

  setCustomers(prev =>
    prev.map(c =>
      c.id === data.customerId
        ? { ...c, currentDue: Math.max(0, c.currentDue - data.amount) }
        : c
    )
  );

  let remaining = data.amount;
  const updatedInvoices = salesInvoices.map(inv => {
    if (inv.customerId === data.customerId && inv.dueAmount > 0 && remaining > 0) {
      const applyAmount = Math.min(inv.dueAmount, remaining);
      remaining -= applyAmount;
      const newPaid = inv.paidAmount + applyAmount;
      const newDue = inv.dueAmount - applyAmount;
      const newStatus: SalesInvoice['status'] = newDue === 0 ? 'Paid' : 'Partial';

      return {
        ...inv,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus,
        payments: [
          ...inv.payments,
          {
            method: data.paymentMethod,
            amount: applyAmount,
            date: today,
            reference: data.transactionRef || collectionNo
          }
        ]
      };
    }
    return inv;
  });
  setSalesInvoices(updatedInvoices);

  if (data.collectorSalesmanId) {
    setSalesmen(prev =>
      prev.map(s =>
        s.id === data.collectorSalesmanId
          ? { ...s, currentMonthCollection: (s.currentMonthCollection || 0) + data.amount }
          : s
      )
    );
  }

  const linkedInvoice = salesInvoices.find(inv => inv.customerId === data.customerId);
  const targetWarehouseId = (data as any).warehouseId || linkedInvoice?.warehouseId;

  if (data.paymentMethod === 'Cash') {
    setCashTransactions(prev => [
      {
        id: `cash-${Date.now()}`,
        date: `${today} 14:00`,
        type: 'Cash In',
        category: 'Due Collection',
        amount: data.amount,
        referenceNo: collectionNo,
        description: `Customer payment from ${customer.shopName} (Ref: ${data.transactionRef || collectionNo})`,
        performedBy: currentUserRole,
        warehouseId: targetWarehouseId,
        customerId: data.customerId
      },
      ...prev
    ]);
  } else {
    const targetBankId = data.bankAccountId || bankAccounts[0]?.id;
    if (targetBankId) {
      setBankAccounts(prev =>
        prev.map(b =>
          b.id === targetBankId
            ? { ...b, currentBalance: b.currentBalance + data.amount }
            : b
        )
      );
    }
  }

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Receipt Voucher',
    referenceNo: collectionNo,
    description: `Payment receipt from ${customer.shopName}`,
    lines: [
      {
        accountCode: data.paymentMethod === 'Cash' ? '1000' : '1010',
        accountName: data.paymentMethod === 'Cash' ? 'Cash in Hand (Main Vault)' : 'Bank Accounts',
        debit: data.amount,
        credit: 0,
        memo: `Received via ${data.paymentMethod} (Ref: ${data.transactionRef || collectionNo})`
      },
      {
        accountCode: '1020',
        accountName: 'Accounts Receivable (Customer Due)',
        debit: 0,
        credit: data.amount,
        memo: `Applied against customer ${customer.shopName} outstanding balance`
      }
    ],
    totalDebit: data.amount,
    totalCredit: data.amount,
    createdBy: currentUserRole,
    createdAt: today
  };

  setJournalEntries(prev => [newJv, ...prev]);

  const receiptNo = `MR-${collectionNo.replace('REC-', '')}`;
  const newReceipt: MoneyReceipt = {
    id: `mr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    receiptNo,
    date: today,
    customerId: customer.id,
    customerName: customer.ownerName || customer.shopName,
    customerPhone: customer.mobile,
    shopName: customer.shopName,
    area: customer.area,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    bankAccountId: data.bankAccountId,
    bankName: bankAccounts.find(b => b.id === data.bankAccountId)?.bankName,
    transactionRef: data.transactionRef || collectionNo,
    collectorSalesmanId: data.collectorSalesmanId,
    collectorSalesmanName: salesmen.find(s => s.id === data.collectorSalesmanId)?.name,
    referenceInvoice: data.allocations?.[0]?.invoiceNo || collectionNo,
    notes: data.notes,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  if (setMoneyReceipts) {
    setMoneyReceipts(prev => [newReceipt, ...prev]);
  }

  enqueueChange('money_receipts', 'INSERT', newReceipt.id, newReceipt, `বকেয়া কালেকশন রসিদ #${receiptNo}`);
  enqueueChange('customers', 'UPDATE', customer.id, {
    ...customer,
    currentDue: Math.max(0, customer.currentDue - data.amount)
  }, `কাস্টমার বকেয়া হ্রাস (${customer.shopName})`);

  addAudit('Collected Customer Due Payment', 'Payment', receiptNo, `Previous Due: ৳ ${customer.currentDue}`, `Collected: ৳ ${data.amount} via ${data.paymentMethod}`);

  // Auto-send SMS receipt to Customer if enabled
  if (sendSmsNotification && (settings?.apiIntegrations?.autoSmsOnSale ?? true) && customer.mobile) {
    const remainingDue = Math.max(0, customer.currentDue - data.amount);
    sendSmsNotification({
      recipientPhone: customer.mobile,
      recipientName: customer.shopName,
      messageType: 'Payment Receipt',
      messageBody: `প্রিয় ${customer.ownerName || customer.shopName}, TeleCorp-এ আপনার ৳${data.amount.toLocaleString()} জমা গ্রহণ করা হয়েছে। মানি রিসিট #${receiptNo}। বর্তমান অবশিষ্ট বকেয়া: ৳${remainingDue.toLocaleString()}। ধন্যবাদ!`,
      masking: settings?.apiIntegrations?.smsSenderId || 'TeleCorp',
      smsUnits: 1
    });
  }

  return { success: true, collectionNo: receiptNo };
};

export const executeProcessCustomerReturn = (
  data: {
    originalInvoiceNo: string;
    customerId: string;
    imei: string;
    returnReason: string;
    condition: ReturnCondition;
    refundOrCreditAmount: number;
    restockWarehouseId: string;
  },
  ctx: Pick<SalesContextBundle, 'imeis' | 'setImeis' | 'products' | 'setProducts' | 'customers' | 'setCustomers' | 'customerReturns' | 'setCustomerReturns' | 'journalEntries' | 'setJournalEntries' | 'currentUserRole' | 'enqueueChange' | 'addAudit'>
) => {
  const { imeis, setImeis, products, setProducts, customers, setCustomers, customerReturns, setCustomerReturns, journalEntries, setJournalEntries, currentUserRole, enqueueChange, addAudit } = ctx;
  const imeiRecord = imeis.find(i => i.imei1 === data.imei);
  if (!imeiRecord) return { success: false, error: 'IMEI not found in database!' };
  if (imeiRecord.status !== 'Sold') {
    return { success: false, error: `IMEI ${data.imei} is currently '${imeiRecord.status}'. Only previously 'Sold' units can be returned.` };
  }

  const returnNo = generateDocNumber('RET', customerReturns.length);
  const today = new Date().toISOString().split('T')[0];
  const isDamaged = data.condition === 'Damaged' || data.condition === 'Defective';
  const restockStatus = isDamaged ? 'Sent to Damaged' : 'Restocked';

  const newReturn: CustomerReturn = {
    id: `ret-${Date.now()}`,
    returnNo,
    originalInvoiceNo: data.originalInvoiceNo,
    customerId: data.customerId,
    customerName: imeiRecord.customerName || 'Customer',
    returnDate: today,
    imei: data.imei,
    productName: imeiRecord.productName,
    variantDesc: imeiRecord.variantDesc,
    returnReason: data.returnReason,
    condition: data.condition,
    refundOrCreditAmount: data.refundOrCreditAmount,
    restockWarehouseId: data.restockWarehouseId,
    restockStatus,
    commissionReversed: 0,
    approvedBy: currentUserRole,
    status: 'Approved',
    createdAt: today
  };

  setImeis(prev =>
    prev.map(i =>
      i.imei1 === data.imei
        ? {
          ...i,
          status: isDamaged ? 'Damaged' : 'Returned',
          condition: isDamaged ? 'Damaged' : 'Open Box',
          warehouseId: data.restockWarehouseId,
          returnReason: data.returnReason,
          history: [
            ...i.history,
            {
              date: `${today} 12:00`,
              action: 'Customer Return Approved',
              description: `Returned via ${returnNo} (Reason: ${data.returnReason})`,
              user: currentUserRole,
              referenceNo: returnNo
            }
          ]
        }
        : i
    )
  );

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Return Voucher',
    referenceNo: returnNo,
    description: `Customer Return of IMEI ${data.imei} from invoice ${data.originalInvoiceNo}`,
    lines: [
      {
        accountCode: '4090',
        accountName: 'Sales Returns & Allowances',
        debit: data.refundOrCreditAmount,
        credit: 0,
        memo: `Return credit to customer`
      },
      {
        accountCode: '1020',
        accountName: 'Accounts Receivable (Customer Due)',
        debit: 0,
        credit: data.refundOrCreditAmount,
        memo: `Reduced due on return ${returnNo}`
      },
      ...(!isDamaged
        ? [
          {
            accountCode: '1050',
            accountName: 'Merchandise Inventory',
            debit: imeiRecord.purchaseCost,
            credit: 0,
            memo: `Restock cost of ${imeiRecord.productName}`
          },
          {
            accountCode: '5000',
            accountName: 'Cost of Goods Sold (COGS)',
            debit: 0,
            credit: imeiRecord.purchaseCost,
            memo: `COGS reversal on return`
          }
        ]
        : [])
    ],
    totalDebit: data.refundOrCreditAmount + (!isDamaged ? imeiRecord.purchaseCost : 0),
    totalCredit: data.refundOrCreditAmount + (!isDamaged ? imeiRecord.purchaseCost : 0),
    createdBy: currentUserRole,
    createdAt: today
  };

  setCustomerReturns(prev => [newReturn, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);

  enqueueChange('customer_returns', 'INSERT', newReturn.id, newReturn, `কাস্টমার রিটার্ন #${returnNo}`);
  enqueueChange('imeis', 'UPDATE', imeiRecord.id, {
    ...imeiRecord,
    status: isDamaged ? 'Damaged' : 'Returned',
    condition: isDamaged ? 'Damaged' : 'Open Box',
    warehouseId: data.restockWarehouseId,
    returnReason: data.returnReason
  }, `IMEI রিটার্ন স্ট্যাটাস #${data.imei}`);
  if (data.customerId) {
    setCustomers(prev =>
      prev.map(c => c.id === data.customerId ? { ...c, currentDue: Math.max(0, c.currentDue - data.refundOrCreditAmount) } : c)
    );
    const cust = customers.find(c => c.id === data.customerId);
    if (cust) {
      const updatedCust = { ...cust, currentDue: Math.max(0, cust.currentDue - data.refundOrCreditAmount) };
      enqueueChange('customers', 'UPDATE', cust.id, updatedCust, `কাস্টমার বকেয়া রিভার্স (${cust.shopName})`);
    }
  }

  // Restore inventory variant stock count if unit was restocked (not damaged)
  if (!isDamaged && imeiRecord.productId && imeiRecord.variantId) {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== imeiRecord.productId) return p;
        return {
          ...p,
          variants: p.variants.map(v => v.id === imeiRecord.variantId ? { ...v, currentStock: v.currentStock + 1 } : v)
        };
      })
    );
  }

  addAudit('Approved Customer Return', 'Returns', returnNo, undefined, `IMEI: ${data.imei}, Credit: ৳ ${data.refundOrCreditAmount}`);

  return { success: true, returnNo };
};

export const executeProcessPhoneExchange = (
  data: Omit<PhoneExchangeTransaction, 'id' | 'exchangeNo' | 'createdAt'>,
  ctx: Pick<
    SalesContextBundle,
    | 'imeis'
    | 'setImeis'
    | 'products'
    | 'setProducts'
    | 'customers'
    | 'setCustomers'
    | 'bankAccounts'
    | 'setBankAccounts'
    | 'setCashTransactions'
    | 'phoneExchanges'
    | 'setPhoneExchanges'
    | 'journalEntries'
    | 'setJournalEntries'
    | 'currentUserRole'
    | 'enqueueChange'
    | 'addAudit'
  >
) => {
  const {
    imeis,
    setImeis,
    products,
    setProducts,
    customers,
    setCustomers,
    bankAccounts,
    setBankAccounts,
    setCashTransactions,
    phoneExchanges,
    setPhoneExchanges,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;
  const exchangeNo = generateDocNumber('EXCH' as any, phoneExchanges.length);
  const today = new Date().toISOString().split('T')[0];

  const newImeiRecord = imeis.find(i => i.imei1 === data.newIMEI);
  if (!newImeiRecord || newImeiRecord.status !== 'In Stock') {
    return { success: false, error: 'New handset selected for exchange is not available in stock!' };
  }

  // 1. Transition Outgoing New Handset IMEI to 'Sold'
  setImeis(prev =>
    prev.map(i => i.imei1 === data.newIMEI ? {
      ...i,
      status: 'Sold',
      customerId: data.customerId,
      customerName: data.customerName,
      salesInvoiceNo: exchangeNo,
      salesDate: today,
      history: [
        ...i.history,
        {
          date: `${today} 16:30`,
          action: 'Phone Exchange Sold',
          description: `Sold in exchange for old ${data.oldBrand} ${data.oldModel} (${data.oldIMEI})`,
          user: currentUserRole,
          referenceNo: exchangeNo
        }
      ]
    } : i)
  );
  enqueueChange('imeis', 'UPDATE', newImeiRecord.id, {
    ...newImeiRecord,
    status: 'Sold',
    customerId: data.customerId,
    customerName: data.customerName,
    salesInvoiceNo: exchangeNo,
    salesDate: today
  }, `IMEI এক্সচেঞ্জ সেল #${data.newIMEI}`);

  // 2. Decrement Sold Handset Product Inventory Stock
  setProducts(prev => prev.map(p => {
    if (p.id === newImeiRecord.productId) {
      const updated = {
        ...p,
        variants: p.variants.map(v =>
          v.id === newImeiRecord.variantId
            ? { ...v, currentStock: Math.max(0, v.currentStock - 1) }
            : v
        )
      };
      enqueueChange('products', 'UPDATE', p.id, updated, `হ্যান্ডসেট স্টক হ্রাস (এক্সচেঞ্জ সেল)`);
      return updated;
    }
    return p;
  }));

  // 3. Create or Update Product Master for this specific Pre-Owned Model
  const preOwnedModelName = `${data.oldBrand} ${data.oldModel} (Pre-owned)`;
  const skuSlug = `USED-${data.oldBrand.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${data.oldModel.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  
  let targetProductId = '';
  let targetVariantId = '';

  const existingPreOwnedProd = products.find(
    p => p.brandName.toLowerCase() === data.oldBrand.toLowerCase() &&
         p.model.toLowerCase() === preOwnedModelName.toLowerCase()
  );

  if (existingPreOwnedProd) {
    targetProductId = existingPreOwnedProd.id;
    const existingVar = existingPreOwnedProd.variants[0];
    targetVariantId = existingVar ? existingVar.id : `var-used-${Date.now()}`;

    setProducts(prev => prev.map(p => {
      if (p.id === targetProductId) {
        const updatedVariants = p.variants.map(v =>
          v.id === targetVariantId ? { ...v, currentStock: v.currentStock + 1, purchasePrice: data.assessedValue } : v
        );
        const updated = { ...p, variants: updatedVariants };
        enqueueChange('products', 'UPDATE', p.id, updated, `প্রি-ওনড (${preOwnedModelName}) স্টক বৃদ্ধি`);
        return updated;
      }
      return p;
    }));
  } else {
    targetProductId = `prod-used-${Date.now()}`;
    targetVariantId = `var-used-${Date.now()}`;
    const newPreOwned: Product = {
      id: targetProductId,
      brandId: `brand-${data.oldBrand.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      brandName: data.oldBrand,
      model: preOwnedModelName,
      category: 'Smartphone',
      networkRegion: 'Pre-owned / Secondary Market',
      warrantyPeriodMonths: 1,
      description: `Certified customer trade-in / pre-owned device in ${data.oldCondition} condition.`,
      status: 'Active',
      variants: [
        {
          id: targetVariantId,
          sku: skuSlug,
          color: 'Assorted',
          storage: 'Standard',
          ram: 'Standard',
          purchasePrice: data.assessedValue,
          dealerPrice: data.assessedValue,
          wholesalePrice: data.assessedValue,
          retailPrice: Math.round(data.assessedValue * 1.15),
          minSellingPrice: data.assessedValue,
          maxDiscount: 0,
          reorderLevel: 0,
          currentStock: 1
        }
      ]
    };
    setProducts(prev => [newPreOwned, ...prev]);
    enqueueChange('products', 'INSERT', newPreOwned.id, newPreOwned, `নতুন এক্সচেঞ্জ প্রোডাক্ট মাস্টার (${preOwnedModelName})`);
  }

  // 4. Register Incoming Pre-Owned Handset in IMEI Records with real product & variant IDs
  const oldImeiEntry: IMEIRecord = {
    id: `imei-used-${Date.now()}`,
    imei1: data.oldIMEI,
    productId: targetProductId,
    productName: preOwnedModelName,
    variantId: targetVariantId,
    variantDesc: `Pre-owned / Trade-in (${data.oldCondition})`,
    brandName: data.oldBrand,
    purchaseCost: data.assessedValue,
    supplierId: 'sup-tradein',
    supplierName: `Trade-in from ${data.customerName}`,
    purchaseInvoiceNo: exchangeNo,
    purchaseDate: today,
    warehouseId: (data as any).warehouseId || newImeiRecord.warehouseId || 'wh-1',
    warehouseName: (data as any).warehouseName || newImeiRecord.warehouseName || 'Central Warehouse',
    status: 'In Stock',
    condition: data.oldCondition === 'Used' ? 'Open Box' : 'Refurbished',
    history: [
      {
        date: `${today} 16:30`,
        action: 'Trade-in Inward',
        description: `Acquired in exchange against ${data.newProductName} (${data.newIMEI})`,
        user: currentUserRole,
        referenceNo: exchangeNo
      }
    ]
  };
  setImeis(prev => [oldImeiEntry, ...prev]);
  enqueueChange('imeis', 'INSERT', oldImeiEntry.id, oldImeiEntry, `পুরাতন ফোন স্টক ইনওয়ার্ড #${data.oldIMEI}`);

  if (data.dueAmount > 0) {
    setCustomers(prev =>
      prev.map(c => c.id === data.customerId ? { ...c, currentDue: c.currentDue + data.dueAmount } : c)
    );
    const cust = customers.find(c => c.id === data.customerId);
    if (cust) {
      enqueueChange('customers', 'UPDATE', cust.id, { ...cust, currentDue: cust.currentDue + data.dueAmount }, `কাস্টমার এক্সচেঞ্জ বকেয়া বৃদ্ধি (${cust.shopName})`);
    }
  }

  if (data.amountPaidNow > 0) {
    if (data.paymentMethod === 'Cash') {
      pushCashHelper(
        setCashTransactions,
        'Cash In',
        'Customer Sale',
        data.amountPaidNow,
        exchangeNo,
        `Exchange differential cash received (${exchangeNo}) from ${data.customerName}`,
        currentUserRole,
        {
          warehouseId: (data as any).warehouseId || newImeiRecord.warehouseId,
          customerId: data.customerId
        }
      );
    } else {
      const targetBankId = data.bankAccountId || bankAccounts[0]?.id;
      if (targetBankId) {
        adjustBankHelper(
          setBankAccounts,
          targetBankId,
          data.amountPaidNow
        );
      }
    }
  }

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Journal Voucher',
    referenceNo: exchangeNo,
    description: `Phone Exchange: Old ${data.oldModel} for New ${data.newProductName}`,
    lines: [
      {
        accountCode: '1050',
        accountName: 'Merchandise Inventory (Pre-owned)',
        debit: data.assessedValue,
        credit: 0,
        memo: `Trade-in intake ${data.oldIMEI}`
      },
      ...(data.amountPaidNow > 0 ? [{
        accountCode: data.paymentMethod === 'Cash' ? '1000' : '1010',
        accountName: data.paymentMethod === 'Cash' ? 'Cash in Hand' : 'Bank Accounts',
        debit: data.amountPaidNow,
        credit: 0,
        memo: `Exchange differential cash received`
      }] : []),
      ...(data.dueAmount > 0 ? [{
        accountCode: '1020',
        accountName: 'Accounts Receivable',
        debit: data.dueAmount,
        credit: 0,
        memo: `Exchange remaining balance due`
      }] : []),
      {
        accountCode: '4010',
        accountName: 'Retail POS Sales Revenue',
        debit: 0,
        credit: data.newPhonePrice,
        memo: `Gross selling price of ${data.newProductName}`
      }
    ],
    totalDebit: data.newPhonePrice,
    totalCredit: data.newPhonePrice,
    createdBy: currentUserRole,
    createdAt: today
  };

  const newExchange: PhoneExchangeTransaction = {
    ...data,
    id: `exch-${Date.now()}`,
    exchangeNo,
    createdAt: today
  };

  setPhoneExchanges(prev => [newExchange, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);
  enqueueChange('phone_exchange_records', 'INSERT', newExchange.id, newExchange, `ফোন এক্সচেঞ্জ ডিল #${exchangeNo}`);
  addAudit(`Executed Device Trade-in / Exchange ${exchangeNo}`, 'Exchange Desk', exchangeNo);

  return { success: true, exchangeNo };
};

export const executeCreateDeliveryChallan = (
  data: Omit<DeliveryChallan, 'id' | 'challanNo'>,
  ctx: Pick<SalesContextBundle, 'deliveryChallans' | 'setDeliveryChallans' | 'enqueueChange' | 'addAudit'>
) => {
  const { deliveryChallans, setDeliveryChallans, enqueueChange, addAudit } = ctx;
  const challanNo = `CH-${new Date().getFullYear()}-${(deliveryChallans.length + 1).toString().padStart(5, '0')}`;
  const newChallan: DeliveryChallan = {
    ...data,
    id: `ch-${Date.now()}`,
    challanNo
  };
  setDeliveryChallans(prev => [newChallan, ...prev]);
  enqueueChange('delivery_challans', 'INSERT', newChallan.id, newChallan, `ডেলিভারি চালান তৈরি #${challanNo}`);
  addAudit(`Generated Delivery Challan ${challanNo} for Invoice ${data.invoiceNo}`, 'Dispatch Logistics', challanNo);
  return { success: true, challanNo };
};

export const executeUpdateDeliveryStatus = (
  id: string,
  status: DeliveryStatus,
  deliveredAt: string | undefined,
  ctx: Pick<SalesContextBundle, 'setDeliveryChallans' | 'enqueueChange' | 'addAudit'>
) => {
  const { setDeliveryChallans, enqueueChange, addAudit } = ctx;
  setDeliveryChallans(prev => prev.map(ch => {
    if (ch.id === id) {
      const updated = {
        ...ch,
        deliveryStatus: status,
        deliveredAt: status === 'Delivered' ? (deliveredAt || new Date().toISOString().replace('T', ' ').substr(0, 16)) : ch.deliveredAt
      };
      enqueueChange('delivery_challans', 'UPDATE', id, updated, `চালান ডেলিভারি স্ট্যাটাস #${ch.challanNo}`);
      return updated;
    }
    return ch;
  }));
  addAudit(`Updated Delivery Challan ${id} status to ${status}`, 'Dispatch Logistics', id);
};

export const executeSettleChallanCod = (
  id: string,
  bankAccountId: string | undefined,
  ctx: Pick<
    SalesContextBundle,
    | 'deliveryChallans'
    | 'setDeliveryChallans'
    | 'salesInvoices'
    | 'setSalesInvoices'
    | 'customers'
    | 'setCustomers'
    | 'bankAccounts'
    | 'setBankAccounts'
    | 'setCashTransactions'
    | 'journalEntries'
    | 'setJournalEntries'
    | 'moneyReceipts'
    | 'setMoneyReceipts'
    | 'currentUserRole'
    | 'enqueueChange'
    | 'addAudit'
  >
) => {
  const {
    deliveryChallans,
    setDeliveryChallans,
    salesInvoices,
    setSalesInvoices,
    customers,
    setCustomers,
    bankAccounts,
    setBankAccounts,
    setCashTransactions,
    journalEntries,
    setJournalEntries,
    moneyReceipts,
    setMoneyReceipts,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const challan = deliveryChallans.find(c => c.id === id);
  if (!challan || !challan.isCOD || challan.codAmount <= 0) return;
  if (challan.codStatus === 'Collected & Settled') return;

  const today = todayStr();
  const codAmount = challan.codAmount;

  // 1. Update Challan status
  const updatedChallan: DeliveryChallan = {
    ...challan,
    codStatus: 'Collected & Settled',
    deliveryStatus: 'Delivered',
    deliveredAt: challan.deliveredAt || `${today} 15:00`
  };
  setDeliveryChallans(prev => prev.map(c => c.id === id ? updatedChallan : c));
  enqueueChange('delivery_challans', 'UPDATE', id, updatedChallan, `চালান সিওডি আদায় ও সেটেল্ড #${challan.challanNo}`);

  // 2. Deposit into Bank Account or Vault Cash
  const targetInvoice = salesInvoices.find(inv => inv.invoiceNo === challan.invoiceNo);

  if (bankAccountId) {
    const bank = bankAccounts.find(b => b.id === bankAccountId);
    if (bank) {
      const updatedBank = { ...bank, currentBalance: bank.currentBalance + codAmount };
      setBankAccounts(prev => prev.map(b => b.id === bankAccountId ? updatedBank : b));
      enqueueChange('bank_accounts', 'UPDATE', bank.id, updatedBank, `সিওডি ব্যাংক জমা (${bank.bankName})`);
    }
  } else {
    pushCashHelper(
      setCashTransactions,
      'Cash In',
      'Due Collection',
      codAmount,
      challan.challanNo,
      `Courier COD remittance for Challan ${challan.challanNo} (${challan.courierPartner})`,
      currentUserRole,
      {
        warehouseId: targetInvoice?.warehouseId,
        customerId: targetInvoice?.customerId
      }
    );
  }

  // 3. Update Sales Invoice payment and due balances
  if (targetInvoice) {
    const newPaidAmount = targetInvoice.paidAmount + codAmount;
    const newDueAmount = Math.max(0, targetInvoice.dueAmount - codAmount);
    const newStatus = newDueAmount <= 0 ? 'Paid' : 'Partial';
    const newPayments = [
      ...(targetInvoice.payments || []),
      {
        method: bankAccountId ? ('Bank' as PaymentMethodType) : ('Cash' as PaymentMethodType),
        amount: codAmount,
        date: today,
        reference: `COD-${challan.challanNo}`
      }
    ];

    const updatedInvoice: SalesInvoice = {
      ...targetInvoice,
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      status: newStatus,
      payments: newPayments
    };

    setSalesInvoices(prev => prev.map(inv => inv.id === targetInvoice.id ? updatedInvoice : inv));
    enqueueChange('sales_invoices', 'UPDATE', targetInvoice.id, updatedInvoice, `সিওডি আদায় ইনভয়েস আপডেট #${targetInvoice.invoiceNo}`);
  }

  // 4. Update Customer Outstanding Due
  const customerId = challan.customerId || targetInvoice?.customerId;
  if (customerId) {
    const targetCust = customers.find(c => c.id === customerId);
    if (targetCust) {
      const newCustomerDue = Math.max(0, targetCust.currentDue - codAmount);
      const updatedCustomer: Customer = {
        ...targetCust,
        currentDue: newCustomerDue
      };
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      enqueueChange('customers', 'UPDATE', targetCust.id, updatedCustomer, `সিওডি কাস্টমার বকেয়া হ্রাস (${targetCust.shopName})`);
    }
  }

  // 5. Generate Money Receipt (MR) for Audit & Statements
  if (setMoneyReceipts) {
    const mrNo = generateDocNumber('MR', (moneyReceipts?.length || 0) + 1);
    const newReceipt: MoneyReceipt = {
      id: `mr-cod-${Date.now()}`,
      receiptNo: mrNo,
      date: today,
      customerId: customerId || 'cust-unknown',
      customerName: challan.customerName,
      customerPhone: challan.customerPhone || '',
      shopName: challan.customerName,
      area: challan.district || 'Dhaka Territory',
      amount: codAmount,
      paymentMethod: bankAccountId ? 'Bank Transfer' : 'Cash',
      bankAccountId: bankAccountId || undefined,
      transactionRef: `COD-${challan.consignmentNo || challan.challanNo}`,
      referenceInvoice: challan.invoiceNo,
      notes: `Courier COD settled via ${challan.courierPartner} (Challan #${challan.challanNo})`,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };
    setMoneyReceipts(prev => [newReceipt, ...(prev || [])]);
    enqueueChange('money_receipts', 'INSERT', newReceipt.id, newReceipt, `সিওডি মানি রিসিট #${mrNo}`);
  }

  // 6. Post Double-Entry Accounting Journal Entry (JV)
  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-cod-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Receipt Voucher',
    referenceNo: challan.challanNo,
    description: `Courier COD Settlement for Challan ${challan.challanNo} (Invoice: ${challan.invoiceNo})`,
    lines: [
      {
        accountCode: bankAccountId ? '1010' : '1000',
        accountName: bankAccountId ? 'Bank Accounts' : 'Cash in Hand (Main Vault)',
        debit: codAmount,
        credit: 0,
        memo: `COD Remittance received via ${challan.courierPartner}`
      },
      {
        accountCode: '1020',
        accountName: 'Accounts Receivable (Customer Due)',
        debit: 0,
        credit: codAmount,
        memo: `Due cleared on wholesale invoice ${challan.invoiceNo}`
      }
    ],
    totalDebit: codAmount,
    totalCredit: codAmount,
    createdBy: currentUserRole,
    createdAt: today
  };
  setJournalEntries(prev => [newJv, ...prev]);
  enqueueChange('journal_entries', 'INSERT', newJv.id, newJv, `সিওডি জার্নাল ভাউচার #${jvNo}`);

  addAudit(
    `Settled Courier COD ৳${codAmount.toLocaleString()} for Challan ${challan.challanNo} (Invoice: ${challan.invoiceNo})`,
    'Dispatch Logistics',
    challan.challanNo
  );
};
