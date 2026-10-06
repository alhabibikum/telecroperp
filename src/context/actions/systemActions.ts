import type React from 'react';
import type {
  AuthUser,
  BackupSnapshot,
  Brand,
  Product,
  IMEIRecord,
  Warehouse,
  Supplier,
  Customer,
  SalesInvoice,
  PurchaseInvoice,
  StockTransfer,
  CustomerReturn,
  Salesman,
  BankAccount,
  CashTransaction,
  Expense,
  AccountCOA,
  JournalEntry,
  AuditLog,
  SystemSettings,
  SalesmanVisit,
  CustomerFollowUp,
  DayClosingRecord,
  PhoneExchangeTransaction,
  BankStatementEntry,
  SupplierReturn,
  WarrantyClaim,
  BrandIncentiveScheme,
  DeliveryChallan,
  PriceDropClaim,
  SmsLog,
  CrudResult,
  UserRole,
  ExpenseCategory,
  SystemAlert
} from '../../types/erp';
import { EnqueueChangeFn, AddAuditFn } from './types';
import { clearSyncQueue } from '../../lib/syncEngine';
import { getSupabaseClient } from '../../lib/supabase';
import { purgeCloudTransactions, seedCloudCleanSlate } from '../../lib/resetEngine';
import {
  initialWarehouses,
  initialBankAccounts,
  initialExpenseCategories,
  initialCOA,
  initialSettings
} from '../../data/initialData';
import { demoUsers } from '../ERPContext';

export interface SystemContextBundle {
  users: AuthUser[];
  setUsers: React.Dispatch<React.SetStateAction<AuthUser[]>>;
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  setCurrentUserRole: (role: UserRole) => void;
  backupSnapshots: BackupSnapshot[];
  setBackupSnapshots: React.Dispatch<React.SetStateAction<BackupSnapshot[]>>;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;

  // Complete data slice access for backups, export, and reset
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  imeis: IMEIRecord[];
  setImeis: React.Dispatch<React.SetStateAction<IMEIRecord[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  salesInvoices: SalesInvoice[];
  setSalesInvoices: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  purchaseInvoices: PurchaseInvoice[];
  setPurchaseInvoices: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  stockTransfers: StockTransfer[];
  setStockTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
  customerReturns: CustomerReturn[];
  setCustomerReturns: React.Dispatch<React.SetStateAction<CustomerReturn[]>>;
  salesmen: Salesman[];
  setSalesmen: React.Dispatch<React.SetStateAction<Salesman[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  cashTransactions: CashTransaction[];
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  expenseCategories: ExpenseCategory[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  chartOfAccounts: AccountCOA[];
  setChartOfAccounts: React.Dispatch<React.SetStateAction<AccountCOA[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  alerts: SystemAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<SystemAlert[]>>;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  salesmanVisits: SalesmanVisit[];
  setSalesmanVisits: React.Dispatch<React.SetStateAction<SalesmanVisit[]>>;
  customerFollowUps: CustomerFollowUp[];
  setCustomerFollowUps: React.Dispatch<React.SetStateAction<CustomerFollowUp[]>>;
  dayClosings: DayClosingRecord[];
  setDayClosings: React.Dispatch<React.SetStateAction<DayClosingRecord[]>>;
  phoneExchanges: PhoneExchangeTransaction[];
  setPhoneExchanges: React.Dispatch<React.SetStateAction<PhoneExchangeTransaction[]>>;
  bankStatements: BankStatementEntry[];
  setBankStatements: React.Dispatch<React.SetStateAction<BankStatementEntry[]>>;
  supplierReturns: SupplierReturn[];
  setSupplierReturns: React.Dispatch<React.SetStateAction<SupplierReturn[]>>;
  warrantyClaims: WarrantyClaim[];
  setWarrantyClaims: React.Dispatch<React.SetStateAction<WarrantyClaim[]>>;
  brandIncentives: BrandIncentiveScheme[];
  setBrandIncentives: React.Dispatch<React.SetStateAction<BrandIncentiveScheme[]>>;
  deliveryChallans: DeliveryChallan[];
  setDeliveryChallans: React.Dispatch<React.SetStateAction<DeliveryChallan[]>>;
  priceDropClaims: PriceDropClaim[];
  setPriceDropClaims: React.Dispatch<React.SetStateAction<PriceDropClaim[]>>;
  smsLogs: SmsLog[];
  setSmsLogs: React.Dispatch<React.SetStateAction<SmsLog[]>>;
  resetToDemoData: () => Promise<{ success: boolean; message: string }> | void;
}

// User Management & RBAC CRUD
export const executeCreateUser = (
  userData: Omit<AuthUser, 'id'>,
  ctx: SystemContextBundle
): CrudResult => {
  const { users, setUsers, enqueueChange, addAudit } = ctx;
  const trimmedEmail = (userData.email || '').trim().toLowerCase();
  if (!trimmedEmail) {
    return { success: false, error: 'ইউজারের ইমেইল অ্যাড্রেস আবশ্যক।' };
  }
  const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
  if (existing) {
    return { success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট বিদ্যমান রয়েছে।' };
  }
  const newUser: AuthUser = {
    ...userData,
    id: `user-${Date.now()}`,
    email: trimmedEmail,
    status: userData.status || 'Active',
    createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
  };
  setUsers(prev => [newUser, ...prev]);

  enqueueChange('app_users', 'INSERT', newUser.id, newUser, `নতুন ইউজার তৈরি (${newUser.name} - ${newUser.role})`);
  addAudit(`User Created (${newUser.name} - ${newUser.role})`, 'User Management', newUser.email);
  return { success: true };
};

export const executeUpdateUser = (
  id: string,
  userData: Partial<AuthUser>,
  ctx: SystemContextBundle
): CrudResult => {
  const { users, setUsers, currentUser, setCurrentUser, setCurrentUserRole, enqueueChange, addAudit } = ctx;
  const target = users.find(u => u.id === id);
  if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };

  const updated = { ...target, ...userData };
  setUsers(prev => prev.map(u => u.id === id ? updated : u));

  if (currentUser?.id === id) {
    const updatedCurrent: AuthUser = { ...currentUser, ...userData };
    setCurrentUser(updatedCurrent);
    if (userData.role) setCurrentUserRole(userData.role);
    try {
      localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(updatedCurrent));
    } catch (e) {
      console.error(e);
    }
  }

  enqueueChange('app_users', 'UPDATE', id, updated, `ইউজার প্রোফাইল আপডেট (${target.name})`);
  addAudit(`User Profile Updated (${target.name} - ${target.role})`, 'User Management', target.email);
  return { success: true };
};

export const executeDeleteUser = (
  id: string,
  ctx: SystemContextBundle
): CrudResult => {
  const { users, setUsers, currentUser, enqueueChange, addAudit } = ctx;
  const target = users.find(u => u.id === id);
  if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
  if (target.id === currentUser?.id) {
    return { success: false, error: 'বর্তমানে লগইন থাকা সক্রিয় একাউন্ট মুছে ফেলা সম্ভব নয়।' };
  }
  setUsers(prev => prev.filter(u => u.id !== id));

  enqueueChange('app_users', 'DELETE', id, null, `ইউজার একাউন্ট মুছে ফেলা (${target.name})`);
  addAudit(`User Account Deleted (${target.name} - ${target.role})`, 'User Management', target.email);
  return { success: true };
};

export const executeToggleUserStatus = (
  id: string,
  ctx: SystemContextBundle
): CrudResult => {
  const { users, setUsers, currentUser, enqueueChange, addAudit } = ctx;
  const target = users.find(u => u.id === id);
  if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
  if (target.id === currentUser?.id) {
    return { success: false, error: 'নিজের সক্রিয় একাউন্ট স্থগিত (Suspend) করা যাবে না।' };
  }
  const newStatus: 'Active' | 'Suspended' = target.status === 'Active' ? 'Suspended' : 'Active';
  setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

  enqueueChange('app_users', 'UPDATE', id, { id, status: newStatus }, `ইউজার স্ট্যাটাস পরিবর্তন (${target.name} - ${newStatus})`);
  addAudit(`User Status Changed to ${newStatus} (${target.name})`, 'User Management', target.email);
  return { success: true };
};

export const executeResetUserPassword = (
  id: string,
  newPassword: string,
  ctx: SystemContextBundle
): CrudResult => {
  const { users, setUsers, enqueueChange, addAudit } = ctx;
  const target = users.find(u => u.id === id);
  if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
  const trimmedPass = (newPassword || '').trim();
  if (trimmedPass.length < 3) {
    return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে।' };
  }
  setUsers(prev => prev.map(u => u.id === id ? { ...u, password: trimmedPass } : u));

  enqueueChange('app_users', 'UPDATE', id, { id, password: trimmedPass }, `ইউজার পাসওয়ার্ড রিসেট (${target.name})`);
  addAudit(`User Password Reset (${target.name})`, 'Security', target.email);
  return { success: true };
};

export const executeExportJSON = (ctx: SystemContextBundle) => {
  const backupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    brands: ctx.brands,
    products: ctx.products,
    imeis: ctx.imeis,
    warehouses: ctx.warehouses,
    suppliers: ctx.suppliers,
    customers: ctx.customers,
    salesInvoices: ctx.salesInvoices,
    purchaseInvoices: ctx.purchaseInvoices,
    stockTransfers: ctx.stockTransfers,
    customerReturns: ctx.customerReturns,
    salesmen: ctx.salesmen,
    bankAccounts: ctx.bankAccounts,
    cashTransactions: ctx.cashTransactions,
    expenses: ctx.expenses,
    chartOfAccounts: ctx.chartOfAccounts,
    journalEntries: ctx.journalEntries,
    auditLogs: ctx.auditLogs,
    settings: ctx.settings,
    salesmanVisits: ctx.salesmanVisits,
    customerFollowUps: ctx.customerFollowUps,
    dayClosings: ctx.dayClosings,
    phoneExchanges: ctx.phoneExchanges,
    bankStatements: ctx.bankStatements,
    supplierReturns: ctx.supplierReturns,
    warrantyClaims: ctx.warrantyClaims,
    brandIncentives: ctx.brandIncentives,
    deliveryChallans: ctx.deliveryChallans,
    priceDropClaims: ctx.priceDropClaims,
    smsLogs: ctx.smsLogs
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TeleCorp_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const executeImportJSON = (jsonData: string, ctx: SystemContextBundle): boolean => {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed.products && parsed.customers && parsed.suppliers) {
      if (parsed.brands) ctx.setBrands(parsed.brands);
      if (parsed.products) ctx.setProducts(parsed.products);
      if (parsed.imeis) ctx.setImeis(parsed.imeis);
      if (parsed.warehouses) ctx.setWarehouses(parsed.warehouses);
      if (parsed.suppliers) ctx.setSuppliers(parsed.suppliers);
      if (parsed.customers) ctx.setCustomers(parsed.customers);
      if (parsed.salesInvoices) ctx.setSalesInvoices(parsed.salesInvoices);
      if (parsed.purchaseInvoices) ctx.setPurchaseInvoices(parsed.purchaseInvoices);
      if (parsed.stockTransfers) ctx.setStockTransfers(parsed.stockTransfers);
      if (parsed.customerReturns) ctx.setCustomerReturns(parsed.customerReturns);
      if (parsed.salesmen) ctx.setSalesmen(parsed.salesmen);
      if (parsed.bankAccounts) ctx.setBankAccounts(parsed.bankAccounts);
      if (parsed.cashTransactions) ctx.setCashTransactions(parsed.cashTransactions);
      if (parsed.expenses) ctx.setExpenses(parsed.expenses);
      if (parsed.chartOfAccounts) ctx.setChartOfAccounts(parsed.chartOfAccounts);
      if (parsed.journalEntries) ctx.setJournalEntries(parsed.journalEntries);
      if (parsed.settings) ctx.setSettings(parsed.settings);
      if (parsed.salesmanVisits) ctx.setSalesmanVisits(parsed.salesmanVisits);
      if (parsed.customerFollowUps) ctx.setCustomerFollowUps(parsed.customerFollowUps);
      if (parsed.dayClosings) ctx.setDayClosings(parsed.dayClosings);
      if (parsed.phoneExchanges) ctx.setPhoneExchanges(parsed.phoneExchanges);
      if (parsed.bankStatements) ctx.setBankStatements(parsed.bankStatements);
      if (parsed.supplierReturns) ctx.setSupplierReturns(parsed.supplierReturns);
      if (parsed.warrantyClaims) ctx.setWarrantyClaims(parsed.warrantyClaims);
      if (parsed.brandIncentives) ctx.setBrandIncentives(parsed.brandIncentives);
      if (parsed.deliveryChallans) ctx.setDeliveryChallans(parsed.deliveryChallans);
      if (parsed.priceDropClaims) ctx.setPriceDropClaims(parsed.priceDropClaims);
      if (parsed.smsLogs) ctx.setSmsLogs(parsed.smsLogs);
      ctx.addAudit('Restored System Backup from JSON', 'Backup & Restore', 'SYSTEM', undefined, 'Full State Overwritten');
      return true;
    }
  } catch (e) {
    console.error('Invalid JSON backup file', e);
  }
  return false;
};

export const executeCreateBackupSnapshot = (
  name: string | undefined,
  ctx: SystemContextBundle
): BackupSnapshot => {
  const {
    brands, products, imeis, warehouses, suppliers, customers,
    salesInvoices, purchaseInvoices, stockTransfers, customerReturns,
    salesmen, bankAccounts, cashTransactions, expenses, chartOfAccounts,
    journalEntries, auditLogs, settings, salesmanVisits, customerFollowUps,
    dayClosings, phoneExchanges, bankStatements, supplierReturns,
    warrantyClaims, brandIncentives, deliveryChallans, priceDropClaims,
    smsLogs, setBackupSnapshots, addAudit
  } = ctx;

  const currentFullState = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    brands, products, imeis, warehouses, suppliers, customers,
    salesInvoices, purchaseInvoices, stockTransfers, customerReturns,
    salesmen, bankAccounts, cashTransactions, expenses, chartOfAccounts,
    journalEntries, auditLogs, settings, salesmanVisits, customerFollowUps,
    dayClosings, phoneExchanges, bankStatements, supplierReturns,
    warrantyClaims, brandIncentives, deliveryChallans, priceDropClaims,
    smsLogs
  };

  const jsonStr = JSON.stringify(currentFullState, null, 2);
  const newSnapshot: BackupSnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
    name: name || `Manual Snapshot - ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`,
    sizeBytes: new Blob([jsonStr]).size,
    recordCounts: {
      products: products.length,
      imeis: imeis.length,
      customers: customers.length,
      invoices: salesInvoices.length,
      purchases: purchaseInvoices.length
    },
    dataJson: jsonStr
  };

  setBackupSnapshots(prev => [newSnapshot, ...prev]);
  addAudit(`Created Backup Snapshot: ${newSnapshot.name}`, 'Backup & Restore', newSnapshot.id);
  return newSnapshot;
};

export const executeRestoreFromSnapshot = (
  snapshotId: string,
  ctx: SystemContextBundle
): boolean => {
  const { backupSnapshots, addAudit } = ctx;
  const snap = backupSnapshots.find(s => s.id === snapshotId);
  if (!snap || !snap.dataJson) return false;
  const ok = executeImportJSON(snap.dataJson, ctx);
  if (ok) {
    addAudit(`Reverted System to Snapshot: ${snap.name}`, 'Backup & Restore', snap.id);
  }
  return ok;
};

export const executeDeleteSnapshot = (
  snapshotId: string,
  ctx: SystemContextBundle
) => {
  const { setBackupSnapshots, addAudit } = ctx;
  setBackupSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  addAudit(`Deleted Snapshot ${snapshotId}`, 'Backup & Restore', snapshotId);
};

export const executePurgeTransactionalData = async (
  ctx: SystemContextBundle
): Promise<{ success: boolean; message: string }> => {
  const {
    setSalesInvoices, setPurchaseInvoices, setStockTransfers, setCustomerReturns,
    setSupplierReturns, setCashTransactions, setExpenses, setDayClosings,
    setPhoneExchanges, setDeliveryChallans, setPriceDropClaims, setSmsLogs,
    setWarrantyClaims, setBrandIncentives, setCustomerFollowUps, setSalesmanVisits,
    setBankStatements, setJournalEntries, setAlerts, setBankAccounts, setSalesmen,
    setImeis, setCustomers, setSuppliers, addAudit
  } = ctx;

  // 1. Safety snapshot
  executeCreateBackupSnapshot('Auto Safety Snapshot (Pre-Transaction Purge)', ctx);

  // 2. Clear offline sync queue
  clearSyncQueue();

  // 3. Clear all transaction states
  setSalesInvoices([]);
  setPurchaseInvoices([]);
  setStockTransfers([]);
  setCustomerReturns([]);
  setSupplierReturns([]);
  setCashTransactions([]);
  setExpenses([]);
  setDayClosings([]);
  setPhoneExchanges([]);
  setDeliveryChallans([]);
  setPriceDropClaims([]);
  setSmsLogs([]);
  setWarrantyClaims([]);
  setBrandIncentives([]);
  setCustomerFollowUps([]);
  setSalesmanVisits([]);
  setBankStatements([]);
  setJournalEntries([]);
  setAlerts([]);

  // Reset all IMEIs back to 'In Stock'
  setImeis(prev => prev.map(i => ({ ...i, status: 'In Stock' as const, customerId: undefined, soldDate: undefined })));

  // Reset Customer and Supplier Dues to 0
  setCustomers(prev => prev.map(c => ({ ...c, currentDue: 0 })));
  setSuppliers(prev => prev.map(s => ({ ...s, currentDue: 0 })));

  // Reset Bank Account balances to opening balances
  setBankAccounts(prev => prev.map(b => ({ ...b, currentBalance: b.openingBalance })));

  // Reset Salesmen achieved monthly targets, collections and units to 0
  setSalesmen(prev => prev.map(s => ({ ...s, currentMonthSales: 0, currentMonthCollection: 0, currentMonthUnits: 0, paidCommissionTotal: 0 })));

  // 4. Cloud Purge (Supabase)
  let cloudDetail = '';
  const supabase = getSupabaseClient();
  if (supabase) {
    const cloudRes = await purgeCloudTransactions();
    cloudDetail = cloudRes.success
      ? ' (সুপাবেস ক্লাউড থেকেও সমস্ত ট্রানজ্যাকশন মোছা হয়েছে)'
      : ` (ক্লাউড ট্রানজ্যাকশন আপডেটে সতর্কতা: ${cloudRes.message})`;
  }

  addAudit('Purged All Transaction Records (Fresh Year Cycle Reset)', 'System Maintenance', 'SYSTEM');
  return {
    success: true,
    message: `সকল সেলস ও ট্রানজ্যাকশন সফলভাবে মুছে ফেলা হয়েছে${cloudDetail}`
  };
};

export const executeFactoryResetFullWipe = async (
  ctx: SystemContextBundle,
  adminUser?: AuthUser
): Promise<{ success: boolean; message: string }> => {
  const {
    setBrands, setProducts, setImeis, setWarehouses, setSuppliers,
    setCustomers, setSalesInvoices, setPurchaseInvoices, setStockTransfers,
    setCustomerReturns, setSupplierReturns, setSalesmen, setBankAccounts,
    setCashTransactions, setExpenses, setExpenseCategories, setChartOfAccounts,
    setJournalEntries, setAlerts, setAuditLogs, setSettings, setSalesmanVisits,
    setCustomerFollowUps, setDayClosings, setPhoneExchanges, setBankStatements,
    setWarrantyClaims, setBrandIncentives, setDeliveryChallans, setPriceDropClaims,
    setSmsLogs, setUsers, currentUser, setCurrentUser, addAudit
  } = ctx;

  // 1. Safety snapshot
  executeCreateBackupSnapshot('Auto Safety Snapshot (Pre-Factory Wipe)', ctx);

  // 2. Clear offline sync queue
  clearSyncQueue();

  // 3. Keep or setup Admin user
  const activeAdmin: AuthUser = adminUser || (currentUser?.role === 'Super Admin' ? currentUser : demoUsers[0]);

  // 4. Reset React states to Clean Business Slate (Zero products, zero transactions)
  setBrands([]);
  setProducts([]);
  setImeis([]);
  setWarehouses([initialWarehouses[0]]);
  setSuppliers([]);
  setCustomers([]);
  setSalesInvoices([]);
  setPurchaseInvoices([]);
  setStockTransfers([]);
  setCustomerReturns([]);
  setSupplierReturns([]);
  setSalesmen([]);
  setBankAccounts([{
    ...initialBankAccounts[0],
    openingBalance: 0,
    currentBalance: 0
  }]);
  setCashTransactions([]);
  setExpenses([]);
  setExpenseCategories(initialExpenseCategories);
  setChartOfAccounts(initialCOA);
  setJournalEntries([]);
  setAlerts([]);
  setAuditLogs([{
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
    user: activeAdmin.name,
    role: 'Super Admin',
    action: 'Executed Complete Factory Reset (Clean Slate)',
    module: 'System Maintenance',
    referenceNo: 'SYSTEM',
    ipAddress: '127.0.0.1'
  }]);
  setSettings(initialSettings);
  setSalesmanVisits([]);
  setCustomerFollowUps([]);
  setDayClosings([]);
  setPhoneExchanges([]);
  setBankStatements([]);
  setWarrantyClaims([]);
  setBrandIncentives([]);
  setDeliveryChallans([]);
  setPriceDropClaims([]);
  setSmsLogs([]);

  // 5. Update Users
  setUsers([activeAdmin]);
  try {
    localStorage.setItem('TELECORP_USERS_LIST', JSON.stringify([activeAdmin]));
    setCurrentUser(activeAdmin);
    localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(activeAdmin));
    localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
  } catch (err) {
    console.error('Failed to update local storage users during factory reset:', err);
  }

  // 6. Cloud Clean Slate (Supabase)
  let cloudDetail = '';
  const supabase = getSupabaseClient();
  if (supabase) {
    const cloudRes = await seedCloudCleanSlate(activeAdmin);
    cloudDetail = cloudRes.success
      ? ' (সুপাবেস ক্লাউড সম্পূর্ণ শূন্য ও ফ্রেশ করা হয়েছে)'
      : ` (ক্লাউড রিসেটে সতর্কতা: ${cloudRes.message})`;
  }

  addAudit('Executed Complete Factory Reset', 'System Maintenance', 'SYSTEM');
  return {
    success: true,
    message: `সম্পূর্ণ সিস্টেম ফ্যাক্টরি রিসেট সফল হয়েছে। নতুন ব্যবসার জন্য ফ্রেশ ডাটাবেস প্রস্তুত${cloudDetail}`
  };
};
