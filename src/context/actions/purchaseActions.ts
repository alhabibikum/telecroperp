import type React from 'react';
import type {
  PurchaseInvoice,
  IMEIRecord,
  Product,
  Supplier,
  BankAccount,
  CashTransaction,
  JournalEntry,
  PriceDropClaim,
  SupplierReturn,
  CrudResult,
  UserRole
} from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';
import { EnqueueChangeFn, AddAuditFn } from './types';
import { fail, todayStr, reverseJournalsHelper, pushCashHelper, adjustBankHelper } from './helpers';

export interface PurchaseContextBundle {
  purchaseInvoices: PurchaseInvoice[];
  setPurchaseInvoices: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  imeis: IMEIRecord[];
  setImeis: React.Dispatch<React.SetStateAction<IMEIRecord[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  supplierReturns: SupplierReturn[];
  setSupplierReturns: React.Dispatch<React.SetStateAction<SupplierReturn[]>>;
  priceDropClaims: PriceDropClaim[];
  setPriceDropClaims: React.Dispatch<React.SetStateAction<PriceDropClaim[]>>;
  currentUserRole: UserRole;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;
}

export const executeCreatePurchase = (
  purchaseData: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'createdAt'>,
  imeisToRegister: Array<{ imei1: string; imei2?: string; serialNumber?: string; variantId: string; productId: string }>,
  ctx: PurchaseContextBundle
) => {
  const {
    purchaseInvoices,
    setPurchaseInvoices,
    imeis,
    setImeis,
    products,
    setProducts,
    suppliers,
    setSuppliers,
    setBankAccounts,
    setCashTransactions,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const existingImeis = new Set(imeis.map(i => i.imei1));
  for (const item of imeisToRegister) {
    if (existingImeis.has(item.imei1)) {
      return { success: false, error: `Duplicate IMEI detected: ${item.imei1} already exists in the system!` };
    }
  }

  const invoiceNo = generateDocNumber('PUR', purchaseInvoices.length);
  const purchaseId = `pur-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  const newPurchase: PurchaseInvoice = {
    ...purchaseData,
    id: purchaseId,
    invoiceNo,
    createdAt: today
  };

  const newImeiRecords: IMEIRecord[] = imeisToRegister.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const variant = prod?.variants.find(v => v.id === item.variantId);
    return {
      id: `imei-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      imei1: item.imei1,
      imei2: item.imei2,
      serialNumber: item.serialNumber,
      productId: item.productId,
      productName: prod?.model || 'Mobile Device',
      variantId: item.variantId,
      variantDesc: variant ? `${variant.ram}/${variant.storage} - ${variant.color}` : 'Standard',
      brandName: prod?.brandName || 'Multi-Brand',
      purchaseCost: variant?.purchasePrice || 0,
      supplierId: purchaseData.supplierId,
      supplierName: purchaseData.supplierName,
      purchaseInvoiceNo: invoiceNo,
      purchaseDate: purchaseData.purchaseDate,
      warehouseId: purchaseData.warehouseId,
      warehouseName: purchaseData.warehouseName,
      status: 'In Stock',
      condition: 'Brand New',
      history: [
        {
          date: `${purchaseData.purchaseDate} 10:00`,
          action: 'Goods Received',
          description: `Received from ${purchaseData.supplierName} under invoice ${invoiceNo}`,
          user: currentUserRole,
          referenceNo: invoiceNo
        }
      ]
    };
  });

  setProducts(prev =>
    prev.map(p => ({
      ...p,
      variants: p.variants.map(v => {
        const registeredCount = imeisToRegister.filter(i => i.variantId === v.id).length;
        return registeredCount > 0 ? { ...v, currentStock: v.currentStock + registeredCount } : v;
      })
    }))
  );

  setSuppliers(prev =>
    prev.map(s =>
      s.id === purchaseData.supplierId
        ? { ...s, currentDue: s.currentDue + purchaseData.dueAmount }
        : s
    )
  );

  if (purchaseData.paidAmount > 0) {
    if (purchaseData.paymentMethod === 'Cash') {
      setCashTransactions(prev => [
        {
          id: `cash-${Date.now()}`,
          date: `${today} 11:00`,
          type: 'Cash Out',
          category: 'Supplier Payment',
          amount: purchaseData.paidAmount,
          referenceNo: invoiceNo,
          description: `Advance/Cash paid for purchase ${invoiceNo} to ${purchaseData.supplierName}`,
          performedBy: currentUserRole
        },
        ...prev
      ]);
    } else if (purchaseData.bankAccountId) {
      setBankAccounts(prev =>
        prev.map(b =>
          b.id === purchaseData.bankAccountId
            ? { ...b, currentBalance: b.currentBalance - purchaseData.paidAmount }
            : b
        )
      );
    }
  }

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: purchaseData.purchaseDate,
    voucherType: 'Purchase Voucher',
    referenceNo: invoiceNo,
    description: `Purchase of mobile inventory from ${purchaseData.supplierName}`,
    lines: [
      {
        accountCode: '1050',
        accountName: 'Merchandise Inventory (Mobile Stock)',
        debit: purchaseData.grandTotal,
        credit: 0,
        memo: `Inventory received for ${invoiceNo}`
      },
      ...(purchaseData.dueAmount > 0
        ? [
          {
            accountCode: '2000',
            accountName: 'Accounts Payable (Supplier Due)',
            debit: 0,
            credit: purchaseData.dueAmount,
            memo: `Payable to ${purchaseData.supplierName}`
          }
        ]
        : []),
      ...(purchaseData.paidAmount > 0
        ? [
          {
            accountCode: purchaseData.paymentMethod === 'Cash' ? '1000' : '1010',
            accountName: purchaseData.paymentMethod === 'Cash' ? 'Cash in Hand' : 'Bank Accounts',
            debit: 0,
            credit: purchaseData.paidAmount,
            memo: `Paid via ${purchaseData.paymentMethod}`
          }
        ]
        : [])
    ],
    totalDebit: purchaseData.grandTotal,
    totalCredit: purchaseData.grandTotal,
    createdBy: currentUserRole,
    createdAt: today
  };

  setImeis(prev => [...newImeiRecords, ...prev]);
  setPurchaseInvoices(prev => [newPurchase, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);

  enqueueChange('purchase_invoices', 'INSERT', newPurchase.id, newPurchase, `নতুন পারচেজ ইনভয়েস #${invoiceNo}`);
  newImeiRecords.forEach(im => {
    enqueueChange('imeis', 'INSERT', im.id, im, `IMEI স্টক ইনওয়ার্ড #${im.imei1}`);
  });
  if (purchaseData.dueAmount > 0) {
    const sup = suppliers.find(s => s.id === purchaseData.supplierId);
    if (sup) {
      enqueueChange('suppliers', 'UPDATE', sup.id, { ...sup, currentDue: sup.currentDue + purchaseData.dueAmount }, `সাপ্লায়ার পাওনা আপডেট (${sup.name})`);
    }
  }

  addAudit('Created Purchase & Bulk IMEI Inward', 'Purchase', invoiceNo, undefined, `Supplier: ${purchaseData.supplierName}, Total: ৳ ${purchaseData.grandTotal}, IMEIs: ${newImeiRecords.length}`);

  return { success: true, invoiceNo };
};

export const executeUpdatePurchaseInvoiceMeta = (
  id: string,
  data: Partial<Pick<PurchaseInvoice, 'notes' | 'dueDate' | 'referenceNo'>>,
  ctx: Pick<PurchaseContextBundle, 'purchaseInvoices' | 'setPurchaseInvoices' | 'enqueueChange' | 'addAudit'>
): CrudResult => {
  const { purchaseInvoices, setPurchaseInvoices, enqueueChange, addAudit } = ctx;
  const pur = purchaseInvoices.find(p => p.id === id);
  if (!pur) return fail('Purchase not found.');
  if (pur.status === 'Cancelled') return fail('Cancelled purchases cannot be edited.');
  const updated = { ...pur, ...data };
  setPurchaseInvoices(prev => prev.map(p => (p.id === id ? updated : p)));
  enqueueChange('purchase_invoices', 'UPDATE', id, updated, `পারচেজ তথ্য আপডেট #${pur.invoiceNo}`);
  addAudit('Edited Purchase Details', 'Purchase', pur.invoiceNo, undefined, JSON.stringify(data));
  return { success: true };
};

export const executeCancelPurchase = (
  id: string,
  reason: string | undefined,
  ctx: PurchaseContextBundle
): CrudResult => {
  const {
    purchaseInvoices,
    setPurchaseInvoices,
    imeis,
    setImeis,
    setProducts,
    suppliers,
    setSuppliers,
    supplierReturns,
    setCashTransactions,
    setBankAccounts,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const pur = purchaseInvoices.find(p => p.id === id);
  if (!pur) return fail('Purchase not found.');
  if (pur.status === 'Cancelled') return fail('This purchase is already cancelled.');
  if (pur.status === 'Returned') return fail('This purchase has been returned and cannot be cancelled.');
  if (supplierReturns.some(r => r.purchaseInvoiceNo === pur.invoiceNo)) {
    return fail('Cannot cancel: supplier returns exist against this purchase.');
  }
  const received = imeis.filter(i => i.purchaseInvoiceNo === pur.invoiceNo);
  const moved = received.filter(i => i.status !== 'In Stock');
  if (moved.length > 0) {
    return fail(`Cannot cancel: ${moved.length} unit(s) from this purchase are already sold/moved (e.g. ${moved[0].imei1}).`);
  }

  setImeis(prev => prev.filter(i => i.purchaseInvoiceNo !== pur.invoiceNo));
  received.forEach(im => {
    enqueueChange('imeis', 'DELETE', im.id, null, `IMEI পারচেজ ক্যান্সেলেশনে অপসারিত #${im.imei1}`);
  });

  setProducts(prev =>
    prev.map(p => ({
      ...p,
      variants: p.variants.map(v => {
        const qty = received.filter(i => i.variantId === v.id).length;
        return qty > 0 ? { ...v, currentStock: Math.max(0, v.currentStock - qty) } : v;
      })
    }))
  );
  setSuppliers(prev =>
    prev.map(s => (s.id === pur.supplierId ? { ...s, currentDue: Math.max(0, s.currentDue - pur.dueAmount) } : s))
  );
  if (pur.dueAmount > 0) {
    const sup = suppliers.find(s => s.id === pur.supplierId);
    if (sup) {
      enqueueChange('suppliers', 'UPDATE', sup.id, {
        ...sup,
        currentDue: Math.max(0, sup.currentDue - pur.dueAmount)
      }, `সাপ্লায়ার পাওনা রিভার্স (${sup.name})`);
    }
  }
  if (pur.paidAmount > 0) {
    if (pur.paymentMethod === 'Cash') {
      pushCashHelper(setCashTransactions, 'Cash In', 'Supplier Payment', pur.paidAmount, pur.invoiceNo, `Refund/reversal for cancelled purchase ${pur.invoiceNo}`, currentUserRole);
    } else {
      adjustBankHelper(setBankAccounts, pur.bankAccountId, pur.paidAmount);
    }
  }
  reverseJournalsHelper(journalEntries, setJournalEntries, pur.invoiceNo, `Cancelled purchase ${pur.invoiceNo}`, currentUserRole);
  const today = todayStr();
  const updatedPur = { ...pur, status: 'Cancelled' as const, notes: `${pur.notes ? pur.notes + ' | ' : ''}CANCELLED ${today}${reason ? ': ' + reason : ''}` };
  setPurchaseInvoices(prev =>
    prev.map(p => (p.id === id ? updatedPur : p))
  );
  enqueueChange('purchase_invoices', 'UPDATE', id, updatedPur, `পারচেজ বাতিল #${pur.invoiceNo}`);
  addAudit('Cancelled Purchase Invoice', 'Purchase', pur.invoiceNo, `Total ৳ ${pur.grandTotal}`, reason || 'Cancelled');
  return { success: true };
};

export const executePaySupplier = (
  data: {
    supplierId: string;
    amount: number;
    paymentMethod: any;
    bankAccountId?: string;
    referenceNo: string;
    notes?: string;
  },
  ctx: Pick<PurchaseContextBundle, 'suppliers' | 'setSuppliers' | 'bankAccounts' | 'setBankAccounts' | 'setCashTransactions' | 'journalEntries' | 'setJournalEntries' | 'currentUserRole' | 'enqueueChange' | 'addAudit'>
) => {
  const { suppliers, setSuppliers, bankAccounts, setBankAccounts, setCashTransactions, journalEntries, setJournalEntries, currentUserRole, enqueueChange, addAudit } = ctx;
  const supplier = suppliers.find(s => s.id === data.supplierId);
  if (!supplier) return { success: false, error: 'Supplier not found' };

  const payNo = generateDocNumber('PAY', 50);
  const today = new Date().toISOString().split('T')[0];

  const updatedDue = Math.max(0, supplier.currentDue - data.amount);
  const updatedSupplier = { ...supplier, currentDue: updatedDue };
  setSuppliers(prev =>
    prev.map(s =>
      s.id === data.supplierId ? updatedSupplier : s
    )
  );
  enqueueChange('suppliers', 'UPDATE', supplier.id, updatedSupplier, `সাপ্লায়ার পাওনা পরিশোধ (${supplier.name})`);

  if (data.paymentMethod === 'Cash') {
    const cashEntry: CashTransaction = {
      id: `cash-${Date.now()}`,
      voucherNo: payNo,
      date: `${today} 15:00`,
      type: 'Cash Out',
      category: 'Supplier Payment',
      amount: data.amount,
      referenceNo: payNo,
      description: `Payment to supplier ${supplier.name}`,
      performedBy: currentUserRole
    };
    setCashTransactions(prev => [cashEntry, ...prev]);
    enqueueChange('cash_transactions', 'INSERT', cashEntry.id, cashEntry, `সাপ্লায়ার ক্যাশ পরিশোধ #${payNo}`);
  } else if (data.bankAccountId) {
    const targetBank = bankAccounts.find(b => b.id === data.bankAccountId);
    if (targetBank) {
      const updatedBank = { ...targetBank, currentBalance: targetBank.currentBalance - data.amount };
      setBankAccounts(prev =>
        prev.map(b => (b.id === data.bankAccountId ? updatedBank : b))
      );
      enqueueChange('bank_accounts', 'UPDATE', targetBank.id, updatedBank, `ব্যাংক ব্যালেন্স হ্রাস (${targetBank.bankName})`);
    }
  }

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Payment Voucher',
    referenceNo: payNo,
    description: `Payment to supplier ${supplier.name}`,
    lines: [
      {
        accountCode: '2000',
        accountName: 'Accounts Payable (Supplier Due)',
        debit: data.amount,
        credit: 0,
        memo: `Reduced payable to ${supplier.name}`
      },
      {
        accountCode: data.paymentMethod === 'Cash' ? '1000' : '1010',
        accountName: data.paymentMethod === 'Cash' ? 'Cash in Hand' : 'Bank Accounts',
        debit: 0,
        credit: data.amount,
        memo: `Disbursed via ${data.paymentMethod}`
      }
    ],
    totalDebit: data.amount,
    totalCredit: data.amount,
    createdBy: currentUserRole,
    createdAt: today
  };

  setJournalEntries(prev => [newJv, ...prev]);
  addAudit('Made Supplier Payment', 'Supplier Payment', payNo, `Supplier: ${supplier.name}`, `Amount: ৳ ${data.amount}`);

  return { success: true };
};

export const executeProcessSupplierReturn = (
  data: {
    supplierId: string;
    purchaseInvoiceNo?: string;
    imei: string;
    returnReason: string;
    amount: number;
  },
  ctx: Pick<PurchaseContextBundle, 'imeis' | 'setImeis' | 'suppliers' | 'setSuppliers' | 'supplierReturns' | 'setSupplierReturns' | 'journalEntries' | 'setJournalEntries' | 'currentUserRole' | 'enqueueChange' | 'addAudit'>
) => {
  const { imeis, setImeis, suppliers, setSuppliers, supplierReturns, setSupplierReturns, journalEntries, setJournalEntries, currentUserRole, enqueueChange, addAudit } = ctx;
  const imeiRecord = imeis.find(i => i.imei1 === data.imei);
  const sup = suppliers.find(s => s.id === data.supplierId);
  if (!sup) return { success: false, error: 'Supplier not found' };

  const returnNo = generateDocNumber('RET', supplierReturns.length + 50);
  const today = new Date().toISOString().split('T')[0];

  setImeis(prev =>
    prev.map(i => i.imei1 === data.imei ? {
      ...i,
      status: 'Supplier Return',
      history: [
        ...i.history,
        {
          date: `${today} 15:00`,
          action: 'Returned to Supplier',
          description: `Returned to ${sup.name} via ${returnNo} (Reason: ${data.returnReason})`,
          user: currentUserRole,
          referenceNo: returnNo
        }
      ]
    } : i)
  );
  if (imeiRecord) {
    enqueueChange('imeis', 'UPDATE', imeiRecord.id, {
      ...imeiRecord,
      status: 'Supplier Return'
    }, `IMEI সাপ্লায়ার রিটার্ন #${data.imei}`);
  }

  const updatedDue = Math.max(0, sup.currentDue - data.amount);
  const updatedSup = { ...sup, currentDue: updatedDue };
  setSuppliers(prev =>
    prev.map(s => s.id === data.supplierId ? updatedSup : s)
  );
  enqueueChange('suppliers', 'UPDATE', sup.id, updatedSup, `সাপ্লায়ার পাওনা হ্রাস (${sup.name})`);

  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: today,
    voucherType: 'Return Voucher',
    referenceNo: returnNo,
    description: `Supplier Return to ${sup.name} for IMEI ${data.imei}`,
    lines: [
      {
        accountCode: '2000',
        accountName: 'Accounts Payable (Supplier Due)',
        debit: data.amount,
        credit: 0,
        memo: `Reduced payable to ${sup.name}`
      },
      {
        accountCode: '1050',
        accountName: 'Merchandise Inventory (Mobile Stock)',
        debit: 0,
        credit: data.amount,
        memo: `Stock reduction on supplier return`
      }
    ],
    totalDebit: data.amount,
    totalCredit: data.amount,
    createdBy: currentUserRole,
    createdAt: today
  };

  const newSupReturn: SupplierReturn = {
    id: `supret-${Date.now()}`,
    returnNo,
    supplierId: sup.id,
    supplierName: sup.name,
    purchaseInvoiceNo: data.purchaseInvoiceNo || 'N/A',
    imei: data.imei,
    productName: imeiRecord?.productName || 'Mobile Handset',
    variantDesc: imeiRecord?.variantDesc || '',
    returnDate: today,
    returnReason: data.returnReason,
    amount: data.amount,
    status: 'Completed',
    createdAt: today
  };

  setSupplierReturns(prev => [newSupReturn, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);
  enqueueChange('supplier_returns', 'INSERT', newSupReturn.id, newSupReturn, `সাপ্লায়ার রিটার্ন #${returnNo}`);
  addAudit('Returned Stock to Supplier', 'Supplier Return', returnNo, undefined, `Supplier: ${sup.name}, IMEI: ${data.imei}, Value: ৳ ${data.amount}`);

  return { success: true, returnNo };
};

export const executeCreatePriceDropClaim = (
  claim: Omit<PriceDropClaim, 'id' | 'claimNo'>,
  ctx: Pick<PurchaseContextBundle, 'priceDropClaims' | 'setPriceDropClaims' | 'enqueueChange' | 'addAudit'>
) => {
  const { priceDropClaims, setPriceDropClaims, enqueueChange, addAudit } = ctx;
  const claimNo = `PDC-${new Date().getFullYear()}-${(priceDropClaims.length + 1).toString().padStart(4, '0')}`;
  const newClaim: PriceDropClaim = {
    ...claim,
    id: `pdc-${Date.now()}`,
    claimNo
  };
  setPriceDropClaims(prev => [newClaim, ...prev]);
  enqueueChange('price_drop_claims', 'INSERT', newClaim.id, newClaim, `প্রাইস ড্রপ ক্লেইম #${claimNo}`);
  addAudit(`Created Brand Price Drop Claim ${claimNo} for ${claim.productModel}`, 'Price Protection', claimNo);
  return { success: true, claimNo };
};

export const executeUpdatePriceDropStatus = (
  id: string,
  status: PriceDropClaim['claimStatus'],
  creditNoteNo: string | undefined,
  ctx: Pick<PurchaseContextBundle, 'setPriceDropClaims' | 'setSuppliers' | 'enqueueChange' | 'addAudit'>
) => {
  const { setPriceDropClaims, setSuppliers, enqueueChange, addAudit } = ctx;
  setPriceDropClaims(prev => prev.map(c => {
    if (c.id === id) {
      const updated = {
        ...c,
        claimStatus: status,
        creditNoteNo: creditNoteNo || c.creditNoteNo
      };

      if (status === 'Approved & Credited') {
        setSuppliers(sups => sups.map(s => {
          if (s.id === c.supplierId) {
            const updatedSup = { ...s, currentDue: Math.max(0, s.currentDue - c.totalClaimAmount) };
            enqueueChange('suppliers', 'UPDATE', s.id, updatedSup, `প্রাইস ড্রপ ক্লেইম ক্রেডিট নোট (${s.name})`);
            return updatedSup;
          }
          return s;
        }));
      }

      enqueueChange('price_drop_claims', 'UPDATE', id, updated, `প্রাইস ড্রপ ক্লেইম আপডেট #${c.claimNo}`);
      addAudit(`Updated Price Drop Claim ${c.claimNo}`, 'Price Protection', c.claimNo, c.claimStatus, status);
      return updated;
    }
    return c;
  }));
};
