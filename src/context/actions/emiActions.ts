import type React from 'react';
import type {
  EMIPlan,
  EMIInstallment,
  Customer,
  IMEIRecord,
  CashTransaction,
  BankAccount,
  SalesInvoice,
  JournalEntry,
  MoneyReceipt,
  SmsLog,
  UserRole,
  AuthUser,
  PaymentMethodType
} from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';
import type { EnqueueChangeFn, AddAuditFn } from './types';

export interface EMIContextBundle {
  emiPlans: EMIPlan[];
  setEmiPlans: React.Dispatch<React.SetStateAction<EMIPlan[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  imeis: IMEIRecord[];
  setImeis: React.Dispatch<React.SetStateAction<IMEIRecord[]>>;
  cashTransactions: CashTransaction[];
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  smsLogs: SmsLog[];
  setSmsLogs: React.Dispatch<React.SetStateAction<SmsLog[]>>;
  salesInvoices?: SalesInvoice[];
  setSalesInvoices?: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  journalEntries?: JournalEntry[];
  setJournalEntries?: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  moneyReceipts?: MoneyReceipt[];
  setMoneyReceipts?: React.Dispatch<React.SetStateAction<MoneyReceipt[]>>;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;
  currentUserRole: UserRole;
  currentUser: AuthUser | null;
}

const todayStr = () => new Date().toISOString().split('T')[0];

/**
 * Add months to a date string (YYYY-MM-DD)
 */
const addMonthsToDate = (dateStr: string, monthsToAdd: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split('T')[0];
};

/**
 * Create a new Hire-Purchase / EMI Plan
 */
export const executeCreateEMIPlan = (
  planInput: Omit<EMIPlan, 'id' | 'planNo' | 'status' | 'installments' | 'totalPaid' | 'totalRemaining' | 'overdueCount' | 'createdAt' | 'financedAmount' | 'monthlyInstallment'>,
  ctx: EMIContextBundle
): { success: boolean; planNo?: string; error?: string } => {
  const {
    emiPlans,
    setEmiPlans,
    customers,
    setCustomers,
    imeis,
    setImeis,
    setCashTransactions,
    salesInvoices,
    setSalesInvoices,
    journalEntries,
    setJournalEntries,
    enqueueChange,
    addAudit,
    currentUser,
    currentUserRole
  } = ctx;

  // Validate IMEI
  const targetImei = imeis.find(i => i.imei1 === planInput.imei);
  if (!targetImei) {
    return { success: false, error: `আইএমইআই (${planInput.imei}) ডাটাবেজে পাওয়া যায়নি!` };
  }
  if (targetImei.status !== 'In Stock') {
    return { success: false, error: `আইএমইআই (${planInput.imei}) বর্তমানে '${targetImei.status}' অবস্থায় রয়েছে, এটি স্টকে নেই!` };
  }

  const planCount = emiPlans.length;
  const planNo = `EMI-2026-${String(planCount + 101).padStart(4, '0')}`;
  const planId = `emi-plan-${Date.now()}`;
  const invoiceNo = `SAL-EMI-${String(planCount + 101).padStart(4, '0')}`;

  // Financed calculation
  const principalAmount = Math.max(0, planInput.totalPrice - planInput.downPayment);
  const totalInterest = Math.round(principalAmount * ((planInput.interestRate || 0) / 100));
  const financedAmount = principalAmount + totalInterest;
  const tenure = Math.max(1, planInput.tenureMonths || 6);
  const monthlyInstallment = Math.round(financedAmount / tenure);

  // Generate Installment Schedule
  const installments: EMIInstallment[] = [];
  const startD = planInput.startDate || todayStr();

  for (let i = 1; i <= tenure; i++) {
    const dueDate = addMonthsToDate(startD, i);
    // Adjust last installment for any rounding difference
    const isLast = i === tenure;
    const amount = isLast ? (financedAmount - monthlyInstallment * (tenure - 1)) : monthlyInstallment;

    installments.push({
      installmentNo: i,
      dueDate,
      amount,
      paidAmount: 0,
      lateFee: 0,
      status: 'Pending'
    });
  }

  const newPlan: EMIPlan = {
    ...planInput,
    id: planId,
    planNo,
    invoiceNo,
    financedAmount,
    monthlyInstallment,
    status: 'Active',
    installments,
    totalPaid: planInput.downPayment,
    totalRemaining: financedAmount,
    overdueCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  // 1. Save Plan
  setEmiPlans(prev => [newPlan, ...prev]);
  enqueueChange('emi_plans', 'INSERT', planId, newPlan, `নতুন ইএমআই প্ল্যান (#${planNo})`);

  // 2. Mark IMEI as Sold via EMI
  setImeis(prev => prev.map(i => {
    if (i.imei1 === planInput.imei) {
      return {
        ...i,
        status: 'Sold' as const,
        customerId: planInput.customerId,
        customerName: planInput.customerName,
        salesInvoiceNo: invoiceNo,
        salesDate: startD,
        history: [
          ...(i.history || []),
          {
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: 'Sold via EMI Hire-Purchase',
            description: `Sold to ${planInput.customerName} on EMI Plan #${planNo}. Down payment: ৳${planInput.downPayment.toLocaleString()}`,
            user: currentUser?.name || currentUserRole,
            referenceNo: planNo
          }
        ]
      };
    }
    return i;
  }));
  enqueueChange('imeis', 'UPDATE', targetImei.id, {
    ...targetImei,
    status: 'Sold',
    customerId: planInput.customerId,
    customerName: planInput.customerName,
    salesInvoiceNo: invoiceNo,
    salesDate: startD
  }, `আইএমইআই ইএমআই-তে বিক্রয় (${planInput.imei})`);

  // 3. Record Down Payment in Cash Transaction
  if (planInput.downPayment > 0) {
    const cashTx: CashTransaction = {
      id: `cash-emi-dp-${Date.now()}`,
      date: startD,
      type: 'Cash In',
      category: 'Customer Sale',
      amount: planInput.downPayment,
      description: `ইএমআই ডাউন পেমেন্ট গ্রহণ - প্ল্যান #${planNo} (${planInput.customerName})`,
      referenceNo: planNo,
      performedBy: currentUser?.name || currentUserRole,
      warehouseId: planInput.warehouseId || targetImei.warehouseId,
      customerId: planInput.customerId
    };
    setCashTransactions(prev => [cashTx, ...prev]);
    enqueueChange('cash_transactions', 'INSERT', cashTx.id, cashTx, `ইএমআই ডাউন পেমেন্ট (${planNo})`);
  }

  // 4. Create Official SalesInvoice for EMI sale (Single Source of Truth)
  if (setSalesInvoices) {
    const totalContractValue = planInput.totalPrice + totalInterest;
    const newInvoice: SalesInvoice = {
      id: `inv-emi-${Date.now()}`,
      invoiceNo,
      invoiceType: 'Hire Purchase (EMI)',
      customerId: planInput.customerId,
      customerName: planInput.customerName,
      customerPhone: planInput.customerMobile,
      warehouseId: planInput.warehouseId || targetImei.warehouseId || 'wh-1',
      warehouseName: planInput.warehouseName || targetImei.warehouseName || 'Central Warehouse',
      invoiceDate: startD,
      dueDate: addMonthsToDate(startD, tenure),
      items: [
        {
          id: `item-${Date.now()}`,
          productId: planInput.productId,
          productName: planInput.productName,
          variantId: targetImei.variantId || 'var-1',
          variantDesc: planInput.variantDesc || '',
          quantity: 1,
          unitPrice: planInput.totalPrice,
          unitCost: targetImei.purchaseCost || 0,
          discount: 0,
          vatRate: 0,
          vatAmount: 0,
          totalAmount: planInput.totalPrice,
          imeiList: [planInput.imei]
        }
      ],
      subTotal: planInput.totalPrice,
      discountTotal: 0,
      vatTotal: 0,
      grandTotal: totalContractValue,
      paidAmount: planInput.downPayment,
      dueAmount: financedAmount,
      payments: planInput.downPayment > 0 ? [
        {
          method: 'Cash',
          amount: planInput.downPayment,
          date: startD,
          reference: `DP-${planNo}`
        }
      ] : [],
      status: planInput.downPayment >= totalContractValue ? 'Paid' : 'Partial',
      notes: `EMI Plan #${planNo} (${tenure} কিস্তি @ ${planInput.interestRate || 0}% মুনাফা)`,
      createdAt: new Date().toISOString()
    };
    setSalesInvoices(prev => [newInvoice, ...prev]);
    enqueueChange('sales_invoices', 'INSERT', newInvoice.id, newInvoice, `ইএমআই সেলস ইনভয়েস (#${invoiceNo})`);
  }

  // 5. Update Customer Current Due balance
  setCustomers(prev => prev.map(c => {
    if (c.id === planInput.customerId) {
      const updatedCust: Customer = {
        ...c,
        currentDue: c.currentDue + financedAmount
      };
      enqueueChange('customers', 'UPDATE', c.id, updatedCust, `ইএমআই চুক্তি বকেয়া যোগ (${c.shopName})`);
      return updatedCust;
    }
    return c;
  }));

  // 6. Post Double-Entry Accounting Journal Voucher (JV)
  if (setJournalEntries) {
    const jvNo = generateDocNumber('JV', (journalEntries?.length || 0) + 1);
    const totalContract = financedAmount + planInput.downPayment;
    const newJv: JournalEntry = {
      id: `jv-emi-${Date.now()}`,
      voucherNo: jvNo,
      date: startD,
      voucherType: 'Sales Voucher',
      referenceNo: planNo,
      description: `EMI Hire-Purchase Sale of ${planInput.productName} (${planInput.imei}) to ${planInput.customerName}`,
      lines: [
        ...(planInput.downPayment > 0 ? [
          {
            accountCode: '1000',
            accountName: 'Cash in Hand (Main Vault)',
            debit: planInput.downPayment,
            credit: 0,
            memo: `EMI Down Payment for Plan #${planNo}`
          }
        ] : []),
        {
          accountCode: '1020',
          accountName: 'Accounts Receivable (Customer Due)',
          debit: financedAmount,
          credit: 0,
          memo: `EMI Principal + Finance Receivable for Plan #${planNo}`
        },
        {
          accountCode: '4000',
          accountName: 'Sales Revenue',
          debit: 0,
          credit: planInput.totalPrice,
          memo: `Sales value of ${planInput.productName}`
        },
        ...(totalInterest > 0 ? [
          {
            accountCode: '4050',
            accountName: 'Finance / Interest Income',
            debit: 0,
            credit: totalInterest,
            memo: `Interest on EMI Plan #${planNo}`
          }
        ] : []),
        {
          accountCode: '5000',
          accountName: 'Cost of Goods Sold (COGS)',
          debit: targetImei.purchaseCost || 0,
          credit: 0,
          memo: `Cost of IMEI ${planInput.imei}`
        },
        {
          accountCode: '1050',
          accountName: 'Merchandise Inventory',
          debit: 0,
          credit: targetImei.purchaseCost || 0,
          memo: `Inventory outflow of IMEI ${planInput.imei}`
        }
      ],
      totalDebit: totalContract + (targetImei.purchaseCost || 0),
      totalCredit: totalContract + (targetImei.purchaseCost || 0),
      createdBy: currentUser?.name || currentUserRole,
      createdAt: startD
    };
    setJournalEntries(prev => [newJv, ...prev]);
    enqueueChange('journal_entries', 'INSERT', newJv.id, newJv, `ইএমআই সেলস জার্নাল #${jvNo}`);
  }

  addAudit(
    `Created EMI Plan #${planNo} (Invoice #${invoiceNo}) for ${planInput.customerName}`,
    'EMI & Hire Purchase',
    planNo,
    undefined,
    `Total: ৳${planInput.totalPrice}, DP: ৳${planInput.downPayment}, Financed: ৳${financedAmount}`
  );

  return { success: true, planNo };
};

/**
 * Collect Installment Payment
 */
export const executeCollectInstallmentPayment = (
  planId: string,
  installmentNo: number,
  payment: {
    paidAmount: number;
    lateFee?: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    transactionRef?: string;
  },
  ctx: EMIContextBundle
): { success: boolean; error?: string } => {
  const {
    emiPlans,
    setEmiPlans,
    customers,
    setCustomers,
    setCashTransactions,
    bankAccounts,
    setBankAccounts,
    salesInvoices,
    setSalesInvoices,
    journalEntries,
    setJournalEntries,
    moneyReceipts,
    setMoneyReceipts,
    enqueueChange,
    addAudit,
    currentUser,
    currentUserRole
  } = ctx;

  const plan = emiPlans.find(p => p.id === planId);
  if (!plan) return { success: false, error: 'ইএমআই চুক্তিটি পাওয়া যায়নি!' };

  const instIndex = plan.installments.findIndex(i => i.installmentNo === installmentNo);
  if (instIndex === -1) return { success: false, error: 'কিস্তির নম্বরটি সঠিক নয়!' };

  const targetInst = plan.installments[instIndex];
  if (targetInst.status === 'Paid') {
    return { success: false, error: 'এই কিস্তিটি ইতিমধ্যে পরিশোধ করা হয়েছে!' };
  }

  const receiptNo = `RCP-EMI-${Date.now().toString().substring(7)}`;
  const paidD = todayStr();
  const lateFee = payment.lateFee || 0;
  const netPaidForPrincipal = payment.paidAmount;

  const updatedInstallments = plan.installments.map((inst, idx) => {
    if (idx === instIndex) {
      return {
        ...inst,
        paidAmount: netPaidForPrincipal,
        paidDate: paidD,
        lateFee,
        status: 'Paid' as const,
        paymentMethod: payment.paymentMethod,
        transactionRef: payment.transactionRef || undefined,
        receiptNo
      };
    }
    return inst;
  });

  const remainingInstallments = updatedInstallments.filter(i => i.status !== 'Paid');
  const isCompleted = remainingInstallments.length === 0;
  const newOverdueCount = updatedInstallments.filter(i => i.status === 'Overdue').length;

  const newTotalPaid = plan.totalPaid + netPaidForPrincipal + lateFee;
  const newTotalRemaining = Math.max(0, plan.totalRemaining - netPaidForPrincipal);

  const updatedPlan: EMIPlan = {
    ...plan,
    installments: updatedInstallments,
    totalPaid: newTotalPaid,
    totalRemaining: newTotalRemaining,
    overdueCount: newOverdueCount,
    status: isCompleted ? 'Completed' : 'Active'
  };

  setEmiPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
  enqueueChange('emi_plans', 'UPDATE', planId, updatedPlan, `কিস্তি #${installmentNo} আদায় (${plan.planNo})`);

  // 1. Record Payment in Financials (Cash or Bank)
  const totalAmountReceived = netPaidForPrincipal + lateFee;
  if (payment.paymentMethod === 'Cash') {
    const cashTx: CashTransaction = {
      id: `cash-emi-inst-${Date.now()}`,
      date: paidD,
      type: 'Cash In',
      category: 'Due Collection',
      amount: totalAmountReceived,
      description: `ইএমআই কিস্তি #${installmentNo} আদায় - প্ল্যান #${plan.planNo} (${plan.customerName})`,
      referenceNo: receiptNo,
      performedBy: currentUser?.name || currentUserRole,
      warehouseId: (plan as any).warehouseId,
      customerId: plan.customerId
    };
    setCashTransactions(prev => [cashTx, ...prev]);
    enqueueChange('cash_transactions', 'INSERT', cashTx.id, cashTx, `ইএমআই কিস্তি আদায় (${receiptNo})`);
  } else {
    // Deposit to specified bank or first bank
    setBankAccounts(prev => {
      if (prev.length === 0) return prev;
      const targetIndex = payment.bankAccountId ? prev.findIndex(b => b.id === payment.bankAccountId) : 0;
      const idx = targetIndex >= 0 ? targetIndex : 0;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], currentBalance: updated[idx].currentBalance + totalAmountReceived };
      enqueueChange('bank_accounts', 'UPDATE', updated[idx].id, updated[idx], `ইএমআই ব্যাংক জমা (${updated[idx].bankName})`);
      return updated;
    });
  }

  // 2. Reduce Customer Outstanding Due
  setCustomers(prev => prev.map(c => {
    if (c.id === plan.customerId) {
      const updatedCust: Customer = {
        ...c,
        currentDue: Math.max(0, c.currentDue - netPaidForPrincipal)
      };
      enqueueChange('customers', 'UPDATE', c.id, updatedCust, `ইএমআই কিস্তি বাকি হ্রাস (${c.shopName})`);
      return updatedCust;
    }
    return c;
  }));

  // 3. Update Associated Sales Invoice
  const relatedInvoiceNo = plan.invoiceNo || `SAL-EMI-${plan.planNo.replace('EMI-', '')}`;
  if (setSalesInvoices) {
    setSalesInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === relatedInvoiceNo || inv.invoiceNo === plan.invoiceNo) {
        const newPaid = inv.paidAmount + netPaidForPrincipal;
        const newDue = Math.max(0, inv.dueAmount - netPaidForPrincipal);
        const updatedInvoice: SalesInvoice = {
          ...inv,
          paidAmount: newPaid,
          dueAmount: newDue,
          status: (newDue <= 0 ? 'Paid' : 'Partial') as any,
          payments: [
            ...(inv.payments || []),
            {
              method: payment.paymentMethod,
              amount: netPaidForPrincipal,
              date: paidD,
              reference: receiptNo
            }
          ]
        };
        enqueueChange('sales_invoices', 'UPDATE', inv.id, updatedInvoice, `ইএমআই কিস্তি ইনভয়েস আপডেট (#${inv.invoiceNo})`);
        return updatedInvoice;
      }
      return inv;
    }));
  }

  // 4. Generate Money Receipt (MR) for audit & customer statements
  if (setMoneyReceipts) {
    const mrNo = generateDocNumber('MR', (moneyReceipts?.length || 0) + 1);
    const newReceipt: MoneyReceipt = {
      id: `mr-emi-${Date.now()}`,
      receiptNo: mrNo,
      date: paidD,
      customerId: plan.customerId,
      customerName: plan.customerName,
      customerPhone: plan.customerMobile,
      shopName: plan.customerName,
      area: plan.customerAddress || 'Retail Client',
      amount: totalAmountReceived,
      paymentMethod: payment.paymentMethod,
      transactionRef: receiptNo,
      referenceInvoice: relatedInvoiceNo,
      notes: `ইএমআই কিস্তি #${installmentNo} (${plan.planNo})${lateFee > 0 ? ` (লেট ফি: ৳${lateFee})` : ''}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };
    setMoneyReceipts(prev => [newReceipt, ...(prev || [])]);
    enqueueChange('money_receipts', 'INSERT', newReceipt.id, newReceipt, `ইএমআই মানি রিসিট #${mrNo}`);
  }

  // 5. Post Double-Entry Accounting Journal Entry (JV)
  if (setJournalEntries) {
    const jvNo = generateDocNumber('JV', (journalEntries?.length || 0) + 1);
    const newJv: JournalEntry = {
      id: `jv-emi-rcp-${Date.now()}`,
      voucherNo: jvNo,
      date: paidD,
      voucherType: 'Receipt Voucher',
      referenceNo: receiptNo,
      description: `EMI Installment #${installmentNo} from ${plan.customerName} (Plan: ${plan.planNo})`,
      lines: [
        {
          accountCode: payment.paymentMethod === 'Cash' ? '1000' : '1010',
          accountName: payment.paymentMethod === 'Cash' ? 'Cash in Hand (Main Vault)' : 'Bank Accounts',
          debit: totalAmountReceived,
          credit: 0,
          memo: `Received via ${payment.paymentMethod}`
        },
        {
          accountCode: '1020',
          accountName: 'Accounts Receivable (Customer Due)',
          debit: 0,
          credit: netPaidForPrincipal,
          memo: `Principal installment #${installmentNo} for ${plan.planNo}`
        },
        ...(lateFee > 0 ? [
          {
            accountCode: '4080',
            accountName: 'Late Fee / Penalty Income',
            debit: 0,
            credit: lateFee,
            memo: `Late fee on installment #${installmentNo}`
          }
        ] : [])
      ],
      totalDebit: totalAmountReceived,
      totalCredit: totalAmountReceived,
      createdBy: currentUser?.name || currentUserRole,
      createdAt: paidD
    };
    setJournalEntries(prev => [newJv, ...prev]);
    enqueueChange('journal_entries', 'INSERT', newJv.id, newJv, `ইএমআই আদায় জার্নাল #${jvNo}`);
  }

  addAudit(
    `Collected Installment #${installmentNo} for EMI #${plan.planNo} (Receipt #${receiptNo})`,
    'EMI & Hire Purchase',
    receiptNo,
    undefined,
    `Received: ৳${totalAmountReceived} via ${payment.paymentMethod} from ${plan.customerName}`
  );

  return { success: true };
};

/**
 * Send automated SMS reminder for upcoming or overdue EMI installment
 */
export const executeSendEMIReminderSMS = (
  planId: string,
  installmentNo: number,
  ctx: EMIContextBundle
): { success: boolean; error?: string } => {
  const { emiPlans, setSmsLogs, enqueueChange, addAudit } = ctx;

  const plan = emiPlans.find(p => p.id === planId);
  if (!plan) return { success: false, error: 'প্ল্যান পাওয়া যায়নি' };

  const inst = plan.installments.find(i => i.installmentNo === installmentNo);
  if (!inst) return { success: false, error: 'কিস্তি পাওয়া যায়নি' };

  const msgBody = `প্রিয় ${plan.customerName}, আপনার স্মার্টফোন কিস্তি #${plan.planNo}-এর কিস্তি নং ${installmentNo} (টাকা: ${inst.amount.toLocaleString()}) আগামী ${inst.dueDate} তারিখের মধ্যে পরিশোধের জন্য অনুরোধ করা হচ্ছে। হটলাইন: 01711-002233। টেলিকর্প।`;

  const newSms: SmsLog = {
    id: `sms-emi-${Date.now()}`,
    recipientPhone: plan.customerMobile,
    recipientName: plan.customerName,
    messageType: 'Due Reminder',
    messageBody: msgBody,
    sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'Delivered',
    masking: 'TeleCorp',
    smsUnits: 1
  };

  setSmsLogs(prev => [newSms, ...prev]);
  enqueueChange('sms_logs', 'INSERT', newSms.id, newSms, `ইএমআই তাগাদা এসএমএস (${plan.customerMobile})`);
  addAudit(`Dispatched EMI Reminder SMS to ${plan.customerMobile}`, 'EMI & Hire Purchase', plan.planNo);

  return { success: true };
};

/**
 * Delete / Cancel an EMI Plan
 */
export const executeDeleteEMIPlan = (
  planId: string,
  ctx: EMIContextBundle
): { success: boolean; error?: string } => {
  const { emiPlans, setEmiPlans, imeis, setImeis, customers, setCustomers, salesInvoices, setSalesInvoices, enqueueChange, addAudit } = ctx;

  const plan = emiPlans.find(p => p.id === planId);
  if (!plan) return { success: false, error: 'প্ল্যান পাওয়া যায়নি' };

  // Revert IMEI back to In Stock
  setImeis(prev => prev.map(i => {
    if (i.imei1 === plan.imei) {
      return {
        ...i,
        status: 'In Stock' as const,
        customerId: undefined,
        customerName: undefined,
        salesInvoiceNo: undefined
      };
    }
    return i;
  }));

  // Revert customer outstanding due for the uncollected portion
  if (setCustomers && plan.totalRemaining > 0) {
    setCustomers(prev => prev.map(c => {
      if (c.id === plan.customerId) {
        const updatedCust = { ...c, currentDue: Math.max(0, c.currentDue - plan.totalRemaining) };
        enqueueChange('customers', 'UPDATE', c.id, updatedCust, `ইএমআই বাতিল: বকেয়া রিভার্সাল (${c.shopName})`);
        return updatedCust;
      }
      return c;
    }));
  }

  // Cancel associated sales invoice
  if (setSalesInvoices && plan.invoiceNo) {
    setSalesInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === plan.invoiceNo) {
        return { ...inv, status: 'Cancelled' as const, dueAmount: 0 };
      }
      return inv;
    }));
  }

  setEmiPlans(prev => prev.filter(p => p.id !== planId));
  enqueueChange('emi_plans', 'DELETE', planId, undefined, `ইএমআই প্ল্যান বাতিল (#${plan.planNo})`);
  addAudit(`Cancelled & Deleted EMI Plan #${plan.planNo}`, 'EMI & Hire Purchase', plan.planNo);

  return { success: true };
};
