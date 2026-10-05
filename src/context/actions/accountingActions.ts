import type React from 'react';
import type {
  Expense,
  ExpenseCategory,
  BankAccount,
  BankStatementEntry,
  CashTransaction,
  AccountCOA,
  JournalEntry,
  DayClosingRecord,
  PurchaseInvoice,
  SalesInvoice,
  CrudResult,
  UserRole
} from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';
import { EnqueueChangeFn, AddAuditFn } from './types';
import { fail, todayStr, reverseJournalsHelper, pushCashHelper, adjustBankHelper } from './helpers';

export interface AccountingContextBundle {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  expenseCategories: ExpenseCategory[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  bankStatements: BankStatementEntry[];
  setBankStatements: React.Dispatch<React.SetStateAction<BankStatementEntry[]>>;
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
  chartOfAccounts: AccountCOA[];
  setChartOfAccounts: React.Dispatch<React.SetStateAction<AccountCOA[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  dayClosings: DayClosingRecord[];
  setDayClosings: React.Dispatch<React.SetStateAction<DayClosingRecord[]>>;
  purchaseInvoices: PurchaseInvoice[];
  salesInvoices: SalesInvoice[];
  currentUserRole: UserRole;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;
}

export const executeCreateExpense = (
  data: Omit<Expense, 'id' | 'expenseNo' | 'createdAt'>,
  ctx: AccountingContextBundle
): { success: boolean; error?: string } => {
  const {
    expenses,
    setExpenses,
    setCashTransactions,
    setBankAccounts,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const expenseNo = generateDocNumber('EXP', expenses.length);
  const today = todayStr();

  const newExpense: Expense = {
    ...data,
    id: `exp-${Date.now()}`,
    expenseNo,
    createdAt: today
  };

  if (data.paymentMethod === 'Cash') {
    pushCashHelper(setCashTransactions, 'Cash Out', 'Expense', data.amount, expenseNo, `${data.categoryName}: ${data.description}`, currentUserRole);
  } else if (data.bankAccountId) {
    adjustBankHelper(setBankAccounts, data.bankAccountId, -data.amount);
  }

  // Double-entry Journal: Dr. Operating Expenses, Cr. Cash/Bank
  const jvNo = generateDocNumber('JV', journalEntries.length);
  const newJv: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNo: jvNo,
    date: data.date,
    voucherType: 'Payment Voucher',
    referenceNo: expenseNo,
    description: `Expense: ${data.categoryName} - ${data.description}`,
    lines: [
      {
        accountCode: '6000',
        accountName: 'Operating Expenses (Rent, Salary, Transport)',
        debit: data.amount,
        credit: 0,
        memo: data.description
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

  setExpenses(prev => [newExpense, ...prev]);
  setJournalEntries(prev => [newJv, ...prev]);

  enqueueChange('expenses', 'INSERT', newExpense.id, newExpense, `নতুন খরচ রেকর্ড #${expenseNo}`);
  addAudit('Recorded Business Expense', 'Expense', expenseNo, undefined, `Category: ${data.categoryName}, Amount: ৳ ${data.amount}`);

  return { success: true };
};

export const executeUpdateExpense = (
  id: string,
  data: Partial<Pick<Expense, 'date' | 'categoryId' | 'categoryName' | 'description' | 'recipientName' | 'voucherRef' | 'approvedBy'>>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { expenses, setExpenses, enqueueChange, addAudit } = ctx;
  const old = expenses.find(e => e.id === id);
  if (!old) return fail('Expense not found.');
  const updated = { ...old, ...data };
  setExpenses(prev => prev.map(e => (e.id === id ? updated : e)));
  enqueueChange('expenses', 'UPDATE', id, updated, `খরচ ভাউচার আপডেট (${old.expenseNo})`);
  addAudit('Updated Expense', 'Expense', old.expenseNo, old.description, data.description || old.description);
  return { success: true };
};

export const executeDeleteExpense = (
  id: string,
  ctx: AccountingContextBundle
): CrudResult => {
  const {
    expenses,
    setExpenses,
    setCashTransactions,
    setBankAccounts,
    journalEntries,
    setJournalEntries,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const exp = expenses.find(e => e.id === id);
  if (!exp) return fail('Expense not found.');

  if (exp.paymentMethod === 'Cash') {
    pushCashHelper(setCashTransactions, 'Cash In', 'Expense', exp.amount, exp.expenseNo, `Reversal of deleted expense ${exp.expenseNo}`, currentUserRole);
  } else {
    adjustBankHelper(setBankAccounts, exp.bankAccountId, exp.amount);
  }

  reverseJournalsHelper(journalEntries, setJournalEntries, currentUserRole, exp.expenseNo, `Deleted expense ${exp.expenseNo}`);
  setExpenses(prev => prev.filter(e => e.id !== id));
  enqueueChange('expenses', 'DELETE', id, null, `খরচ ভাউচার ডিলিট (${exp.expenseNo})`);
  addAudit('Deleted Expense', 'Expense', exp.expenseNo, `${exp.categoryName}: ৳ ${exp.amount}`);
  return { success: true };
};

export const executeAddBankAccount = (
  data: Omit<BankAccount, 'id' | 'currentBalance'>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { setBankAccounts, enqueueChange, addAudit } = ctx;
  const acc: BankAccount = { ...data, id: `bank-${Date.now()}`, currentBalance: data.openingBalance };
  setBankAccounts(prev => [...prev, acc]);
  enqueueChange('bank_accounts', 'INSERT', acc.id, acc, `নতুন ব্যাংক একাউন্ট (${data.bankName})`);
  addAudit('Added Bank Account', 'Banking', data.accountNumber, undefined, `${data.bankName} - ${data.accountName}`);
  return { success: true };
};

export const executeUpdateBankAccount = (
  id: string,
  data: Partial<Pick<BankAccount, 'bankName' | 'branch' | 'accountName' | 'accountNumber' | 'accountType' | 'status'>>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { bankAccounts, setBankAccounts, enqueueChange, addAudit } = ctx;
  const old = bankAccounts.find(b => b.id === id);
  if (!old) return fail('Bank account not found.');
  const updated = { ...old, ...data };
  setBankAccounts(prev => prev.map(b => (b.id === id ? updated : b)));
  enqueueChange('bank_accounts', 'UPDATE', id, updated, `ব্যাংক একাউন্ট আপডেট (${data.bankName || old.bankName})`);
  addAudit('Updated Bank Account', 'Banking', old.accountNumber, old.bankName, data.bankName || old.bankName);
  return { success: true };
};

export const executeDeleteBankAccount = (
  id: string,
  ctx: AccountingContextBundle
): CrudResult => {
  const { bankAccounts, setBankAccounts, expenses, purchaseInvoices, salesInvoices, enqueueChange, addAudit } = ctx;
  const acc = bankAccounts.find(b => b.id === id);
  if (!acc) return fail('Bank account not found.');
  const used =
    expenses.some(e => e.bankAccountId === id) ||
    purchaseInvoices.some(p => p.bankAccountId === id) ||
    salesInvoices.some(s => s.payments.some(p => p.bankAccountId === id));
  if (used) return fail('Cannot delete: transactions reference this account. Mark it Inactive instead.');
  if (acc.currentBalance !== 0) return fail(`Cannot delete: account holds a balance of ৳ ${acc.currentBalance.toLocaleString()}.`);
  setBankAccounts(prev => prev.filter(b => b.id !== id));
  enqueueChange('bank_accounts', 'DELETE', id, null, `ব্যাংক একাউন্ট ডিলিট (${acc.bankName})`);
  addAudit('Deleted Bank Account', 'Banking', acc.accountNumber, acc.bankName);
  return { success: true };
};

export const executeAddExpenseCategory = (
  data: Omit<ExpenseCategory, 'id'>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { expenseCategories, setExpenseCategories, enqueueChange, addAudit } = ctx;
  if (expenseCategories.some(c => c.name.toLowerCase() === data.name.trim().toLowerCase())) {
    return fail('A category with this name already exists.');
  }
  const cat = { ...data, name: data.name.trim(), id: `expcat-${Date.now()}` };
  setExpenseCategories(prev => [...prev, cat]);
  enqueueChange('expense_categories', 'INSERT', cat.id, cat, `নতুন খরচ ক্যাটাগরি (${data.name})`);
  addAudit('Added Expense Category', 'Expense', data.name, undefined, data.name);
  return { success: true };
};

export const executeUpdateExpenseCategory = (
  id: string,
  data: Partial<Omit<ExpenseCategory, 'id'>>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { expenseCategories, setExpenseCategories, setExpenses, enqueueChange, addAudit } = ctx;
  const old = expenseCategories.find(c => c.id === id);
  if (!old) return fail('Category not found.');
  const updated = { ...old, ...data };
  setExpenseCategories(prev => prev.map(c => (c.id === id ? updated : c)));
  if (data.name && data.name !== old.name) {
    setExpenses(prev => prev.map(e => (e.categoryId === id ? { ...e, categoryName: data.name! } : e)));
  }
  enqueueChange('expense_categories', 'UPDATE', id, updated, `খরচ ক্যাটাগরি আপডেট (${data.name || old.name})`);
  addAudit('Updated Expense Category', 'Expense', old.name, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteExpenseCategory = (
  id: string,
  ctx: AccountingContextBundle
): CrudResult => {
  const { expenseCategories, setExpenseCategories, expenses, enqueueChange, addAudit } = ctx;
  const cat = expenseCategories.find(c => c.id === id);
  if (!cat) return fail('Category not found.');
  if (expenses.some(e => e.categoryId === id)) return fail('Cannot delete: expenses are recorded under this category.');
  setExpenseCategories(prev => prev.filter(c => c.id !== id));
  enqueueChange('expense_categories', 'DELETE', id, null, `খরচ ক্যাটাগরি ডিলিট (${cat.name})`);
  addAudit('Deleted Expense Category', 'Expense', cat.name, cat.name);
  return { success: true };
};

export const executeAddAccount = (
  data: AccountCOA,
  ctx: AccountingContextBundle
): CrudResult => {
  const { chartOfAccounts, setChartOfAccounts, enqueueChange, addAudit } = ctx;
  if (chartOfAccounts.some(a => a.code === data.code)) return fail(`Account code ${data.code} already exists.`);
  setChartOfAccounts(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)));
  enqueueChange('chart_of_accounts', 'INSERT', data.code, data, `নতুন লেজার একাউন্ট (${data.name})`);
  addAudit('Added Ledger Account', 'Accounting', data.code, undefined, data.name);
  return { success: true };
};

export const executeUpdateAccount = (
  code: string,
  data: Partial<Omit<AccountCOA, 'code' | 'balance'>>,
  ctx: AccountingContextBundle
): CrudResult => {
  const { chartOfAccounts, setChartOfAccounts, enqueueChange, addAudit } = ctx;
  const old = chartOfAccounts.find(a => a.code === code);
  if (!old) return fail('Account not found.');
  const updated = { ...old, ...data };
  setChartOfAccounts(prev => prev.map(a => (a.code === code ? updated : a)));
  enqueueChange('chart_of_accounts', 'UPDATE', code, updated, `লেজার একাউন্ট আপডেট (${data.name || old.name})`);
  addAudit('Updated Ledger Account', 'Accounting', code, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteAccount = (
  code: string,
  ctx: AccountingContextBundle
): CrudResult => {
  const { chartOfAccounts, setChartOfAccounts, journalEntries, enqueueChange, addAudit } = ctx;
  const acc = chartOfAccounts.find(a => a.code === code);
  if (!acc) return fail('Account not found.');
  if (journalEntries.some(j => j.lines.some(l => l.accountCode === code))) {
    return fail('Cannot delete: journal entries have posted to this account.');
  }
  setChartOfAccounts(prev => prev.filter(a => a.code !== code));
  enqueueChange('chart_of_accounts', 'DELETE', code, null, `লেজার একাউন্ট মুছে ফেলা (${acc.name})`);
  addAudit('Deleted Ledger Account', 'Accounting', code, acc.name);
  return { success: true };
};

export const executeReconcileBankTransaction = (
  bankAccountId: string,
  txnId: string,
  ctx: AccountingContextBundle
) => {
  ctx.addAudit('Reconciled Bank Transaction', 'Banking', txnId, 'Unreconciled', 'Reconciled');
};

export const executeReconcileStatementEntry = (
  id: string,
  status: BankStatementEntry['status'],
  matchedSystemTxnId: string | undefined,
  ctx: AccountingContextBundle
) => {
  const { setBankStatements, enqueueChange, addAudit } = ctx;
  let updatedEntry: BankStatementEntry | undefined;
  setBankStatements(prev =>
    prev.map(s => {
      if (s.id === id) {
        updatedEntry = { ...s, status, matchedSystemTxnId };
        return updatedEntry;
      }
      return s;
    })
  );
  if (updatedEntry) {
    enqueueChange('bank_statements', 'UPDATE', id, updatedEntry, `ব্যাংক স্টেটমেন্ট রিকনসাইল (${status})`);
  }
  addAudit('Reconciled Bank Statement Entry', 'Bank Reconciliation', id, undefined, `Status: ${status}`);
};

export const executeAddBankStatementEntry = (
  entry: Omit<BankStatementEntry, 'id'>,
  ctx: AccountingContextBundle
): { success: boolean; id: string } => {
  const { setBankStatements, enqueueChange, addAudit } = ctx;
  const newEntry: BankStatementEntry = {
    ...entry,
    id: `st-${Date.now()}`
  };
  setBankStatements(prev => [newEntry, ...prev]);
  enqueueChange('bank_statements', 'INSERT', newEntry.id, newEntry, `নতুন ব্যাংক স্টেটমেন্ট এন্ট্রি (${newEntry.referenceNo})`);
  addAudit('Added Bank Statement Entry', 'Bank Reconciliation', newEntry.id, undefined, `Ref: ${newEntry.referenceNo}, Status: ${newEntry.status}`);
  return { success: true, id: newEntry.id };
};

export const executePerformDayClosing = (
  data: Omit<DayClosingRecord, 'id' | 'closingNo' | 'createdAt'>,
  ctx: AccountingContextBundle
): { success: boolean; closingNo: string } => {
  const { setDayClosings, enqueueChange, addAudit } = ctx;
  const closingNo = `DAY-CLOSE-${data.date}`;
  const newClosing: DayClosingRecord = {
    ...data,
    id: `close-${Date.now()}`,
    closingNo,
    createdAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
  };
  setDayClosings(prev => [newClosing, ...prev]);
  enqueueChange('day_closings', 'INSERT', newClosing.id, newClosing, `দিন সমাপ্তি ক্লোজিং #${closingNo}`);
  addAudit('Performed End-of-Day Closing', 'Day Closing', closingNo, undefined, `Expected: ৳ ${data.expectedClosingCash}, Actual: ৳ ${data.actualPhysicalCash}, Status: ${data.status}`);
  return { success: true, closingNo };
};
