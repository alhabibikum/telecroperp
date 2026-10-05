import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
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
  SupplierReturn,
  Salesman,
  SalesmanVisit,
  CustomerFollowUp,
  DayClosingRecord,
  PhoneExchangeTransaction,
  BankStatementEntry,
  BankAccount,
  CashTransaction,
  Expense,
  ExpenseCategory,
  AccountCOA,
  JournalEntry,
  AuditLog,
  SystemAlert,
  SystemSettings,
  UserRole,
  PaymentAllocationItem,
  PaymentMethodType,
  ReturnCondition,
  WarrantyClaim,
  BrandIncentiveScheme,
  DeliveryChallan,
  DeliveryStatus,
  PriceDropClaim,
  SmsLog,
  AuthUser,
  BackupSnapshot,
  CrudResult
} from '../types/erp';
import {
  initialBrands,
  initialProducts,
  initialIMEIs,
  initialWarehouses,
  initialSuppliers,
  initialCustomers,
  initialSalesInvoices,
  initialPurchases,
  initialStockTransfers,
  initialCustomerReturns,
  initialSalesmen,
  initialSalesmanVisits,
  initialCustomerFollowUps,
  initialDayClosings,
  initialPhoneExchanges,
  initialBankStatements,
  initialWarrantyClaims,
  initialBrandIncentives,
  initialDeliveryChallans,
  initialPriceDropClaims,
  initialSmsLogs,
  initialBankAccounts,
  initialCashTransactions,
  initialExpenses,
  initialExpenseCategories,
  initialCOA,
  initialJournalEntries,
  initialAlerts,
  initialAuditLogs,
  initialSettings
} from '../data/initialData';
import { getSupabaseClient } from '../lib/supabase';
import {
  enqueueChange,
  processSyncQueue,
  getPendingSyncCount,
  getSyncQueue,
  SyncQueueItem
} from '../lib/syncEngine';

// Modular Action Slices
import {
  PurchaseContextBundle,
  executeCreatePurchase,
  executeUpdatePurchaseInvoiceMeta,
  executeCancelPurchase,
  executePaySupplier,
  executeProcessSupplierReturn,
  executeCreatePriceDropClaim,
  executeUpdatePriceDropStatus
} from './actions/purchaseActions';
import {
  SalesContextBundle,
  executeCreateSale,
  executeUpdateSaleInvoiceMeta,
  executeCancelSale,
  executeCollectCustomerPayment,
  executeProcessCustomerReturn,
  executeProcessPhoneExchange,
  executeCreateDeliveryChallan,
  executeUpdateDeliveryStatus,
  executeSettleChallanCod
} from './actions/salesActions';
import {
  AccountingContextBundle,
  executeCreateExpense,
  executeUpdateExpense,
  executeDeleteExpense,
  executeAddBankAccount,
  executeUpdateBankAccount,
  executeDeleteBankAccount,
  executeAddExpenseCategory,
  executeUpdateExpenseCategory,
  executeDeleteExpenseCategory,
  executeAddAccount,
  executeUpdateAccount,
  executeDeleteAccount,
  executeReconcileBankTransaction,
  executeReconcileStatementEntry,
  executeAddBankStatementEntry,
  executePerformDayClosing
} from './actions/accountingActions';
import {
  MasterDataContextBundle,
  executeAddBrand,
  executeUpdateBrand,
  executeDeleteBrand,
  executeAddProduct,
  executeUpdateProduct,
  executeDeleteProduct,
  executeAddSupplier,
  executeUpdateSupplier,
  executeDeleteSupplier,
  executeAddCustomer,
  executeUpdateCustomer,
  executeDeleteCustomer,
  executeAddSalesman,
  executeUpdateSalesman,
  executeDeleteSalesman,
  executeAddWarehouse,
  executeUpdateWarehouse,
  executeDeleteWarehouse,
  executeTransferStock,
  executeCreateSalesmanVisit,
  executeUpdateSalesmanVisit,
  executeDeleteSalesmanVisit,
  executeAddCustomerFollowUp,
  executeUpdateFollowUp,
  executeDeleteFollowUp,
  executeUpdateFollowUpStatus,
  executeAddWarrantyClaim,
  executeUpdateWarrantyStatus,
  executeAddBrandIncentiveScheme,
  executeUpdateBrandIncentiveStatus,
  executeBulkImportData,
  executeSendSmsNotification
} from './actions/masterDataActions';
import {
  SystemContextBundle,
  executeCreateUser,
  executeUpdateUser,
  executeDeleteUser,
  executeToggleUserStatus,
  executeResetUserPassword,
  executeExportJSON,
  executeImportJSON,
  executeCreateBackupSnapshot,
  executeRestoreFromSnapshot,
  executeDeleteSnapshot,
  executePurgeTransactionalData,
  executeFactoryResetFullWipe
} from './actions/systemActions';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Admin': ['*'],
  'Owner': ['*'],
  'General Manager': ['*'],
  'Sales Manager': [
    'dashboard', 'imei-trace', 'alert-center',
    'wholesale-sales', 'retail-pos', 'delivery-dispatch', 'due-ageing', 'due-collection',
    'sms-marketing', 'price-drop', 'brand-incentives',
    'customers', 'salesmen', 'salesman-app', 'field-visits',
    'reports', 'custom-reports'
  ],
  'Salesman': [
    'dashboard', 'salesman-app', 'field-visits', 'wholesale-sales',
    'due-collection', 'customers', 'imei-trace'
  ],
  'Warehouse Manager': [
    'dashboard', 'inventory', 'imei-trace', 'barcode-labels', 'brands',
    'warehouses', 'stock-transfers', 'purchases', 'delivery-dispatch',
    'returns', 'warranty-service', 'phone-exchange', 'data-import', 'alert-center'
  ],
  'Accounts Manager': [
    'dashboard', 'cash-bank', 'bank-reconciliation', 'day-closing', 'expenses',
    'accounting', 'due-ageing', 'due-collection', 'wholesale-sales', 'purchases',
    'suppliers', 'customers', 'brand-incentives', 'price-drop', 'reports',
    'custom-reports', 'audit-logs'
  ],
  'Accountant': [
    'dashboard', 'cash-bank', 'bank-reconciliation', 'day-closing', 'expenses',
    'accounting', 'due-ageing', 'due-collection', 'wholesale-sales', 'purchases',
    'suppliers', 'customers', 'reports'
  ],
  'Cashier': [
    'dashboard', 'retail-pos', 'due-collection', 'phone-exchange',
    'day-closing', 'imei-trace', 'wholesale-sales'
  ]
};

export const hasPermission = (role: UserRole, viewId: string): boolean => {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  if (allowed.includes('*')) return true;
  return allowed.includes(viewId);
};

export const demoUsers: AuthUser[] = [
  {
    id: 'user-admin',
    name: 'Aminul Islam',
    email: 'admin@telecorp.com',
    role: 'Super Admin',
    password: 'admin',
    status: 'Active',
    phone: '+880 1711-002233',
    department: 'Executive Board / Managing Director',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    avatar: '👨‍💼',
    lastLogin: '2026-10-04 09:15',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-owner',
    name: 'M. A. Rashid',
    email: 'owner@telecorp.com',
    role: 'Owner',
    password: 'owner',
    status: 'Active',
    phone: '+880 1711-112233',
    department: 'Chairman & Principal Investor',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    avatar: '👑',
    lastLogin: '2026-10-04 08:00',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-gm',
    name: 'Rafiqul Bari',
    email: 'gm@telecorp.com',
    role: 'General Manager',
    password: 'gm',
    status: 'Active',
    phone: '+880 1711-445566',
    department: 'General Operations & Supply Chain',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    avatar: '🎩',
    lastLogin: '2026-10-04 08:30',
    createdAt: '2026-01-05'
  },
  {
    id: 'user-sales',
    name: 'Tanvir Hasan',
    email: 'sales@telecorp.com',
    role: 'Sales Manager',
    password: 'sales',
    status: 'Active',
    phone: '+880 1712-334455',
    department: 'Wholesale Distribution & Dealer Sales',
    branchName: 'Dhaka Division Hub',
    avatar: '💼',
    lastLogin: '2026-10-04 08:45',
    createdAt: '2026-01-10'
  },
  {
    id: 'user-wh',
    name: 'Masum Billah',
    email: 'warehouse@telecorp.com',
    role: 'Warehouse Manager',
    password: 'wh',
    status: 'Active',
    phone: '+880 1819-556677',
    department: 'Central Logistics & Serial IMEI Registry',
    branchName: 'Central Warehouse (Motijheel)',
    avatar: '📦',
    lastLogin: '2026-10-04 08:30',
    createdAt: '2026-01-10'
  },
  {
    id: 'user-accounts',
    name: 'Farhana Akter',
    email: 'accounts@telecorp.com',
    role: 'Accounts Manager',
    password: 'accounts',
    status: 'Active',
    phone: '+880 1911-778899',
    department: 'Finance, Banking & Audit',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    avatar: '📊',
    lastLogin: '2026-10-04 09:00',
    createdAt: '2026-01-12'
  },
  {
    id: 'user-accountant',
    name: 'Shabbir Ahmed',
    email: 'accountant@telecorp.com',
    role: 'Accountant',
    password: 'acc',
    status: 'Active',
    phone: '+880 1911-223344',
    department: 'Accounts & Day Ledgering',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    avatar: '📑',
    lastLogin: '2026-10-04 09:10',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-field',
    name: 'Karim Ullah',
    email: 'field@telecorp.com',
    role: 'Salesman',
    password: 'field',
    status: 'Active',
    phone: '+880 1611-990011',
    department: 'Field Sales & Dealer Route Service',
    branchName: 'Dhaka North Territory',
    avatar: '🛵',
    lastLogin: '2026-10-04 09:30',
    createdAt: '2026-02-01'
  },
  {
    id: 'user-cashier',
    name: 'Sumon Mia',
    email: 'cashier@telecorp.com',
    role: 'Cashier',
    password: 'cash',
    status: 'Active',
    phone: '+880 1611-332211',
    department: 'Retail POS Counter & Daily Vault',
    branchName: 'Gulshan Express Outlet',
    avatar: '💵',
    lastLogin: '2026-10-04 09:20',
    createdAt: '2026-02-05'
  }
];

export type { CrudResult };

interface ERPContextType {
  // Auth & Session
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  demoUsers: AuthUser[];
  users: AuthUser[];
  hasPermission: (role: UserRole, viewId: string) => boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (userId: string) => { success: boolean; error?: string };
  logout: () => void;
  createUser: (userData: Omit<AuthUser, 'id'>) => CrudResult;
  updateUser: (id: string, userData: Partial<AuthUser>) => CrudResult;
  deleteUser: (id: string) => CrudResult;
  toggleUserStatus: (id: string) => CrudResult;
  resetUserPassword: (id: string, newPassword: string) => CrudResult;

  // State
  brands: Brand[];
  products: Product[];
  imeis: IMEIRecord[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers: Customer[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  stockTransfers: StockTransfer[];
  customerReturns: CustomerReturn[];
  salesmen: Salesman[];
  bankAccounts: BankAccount[];
  cashTransactions: CashTransaction[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  chartOfAccounts: AccountCOA[];
  journalEntries: JournalEntry[];
  alerts: SystemAlert[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  currentUserRole: UserRole;
  salesmanVisits: SalesmanVisit[];
  customerFollowUps: CustomerFollowUp[];
  dayClosings: DayClosingRecord[];
  phoneExchanges: PhoneExchangeTransaction[];
  bankStatements: BankStatementEntry[];
  supplierReturns: SupplierReturn[];
  warrantyClaims: WarrantyClaim[];
  brandIncentives: BrandIncentiveScheme[];
  deliveryChallans: DeliveryChallan[];
  priceDropClaims: PriceDropClaim[];
  smsLogs: SmsLog[];

  // Actions
  setCurrentUserRole: (role: UserRole) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  markAlertRead: (alertId: string) => void;
  clearAllAlerts: () => void;

  // Business Transactions
  createPurchase: (purchase: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'createdAt'>, imeisToRegister: Array<{ imei1: string; imei2?: string; serialNumber?: string; variantId: string; productId: string }>) => { success: boolean; error?: string; invoiceNo?: string };
  createSale: (sale: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'createdAt'>) => { success: boolean; error?: string; invoiceNo?: string };
  collectCustomerPayment: (data: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    transactionRef?: string;
    collectorSalesmanId?: string;
    allocations: PaymentAllocationItem[];
    notes?: string;
  }) => { success: boolean; collectionNo?: string; error?: string };
  paySupplier: (data: {
    supplierId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    referenceNo: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  processCustomerReturn: (data: {
    originalInvoiceNo: string;
    customerId: string;
    imei: string;
    returnReason: string;
    condition: ReturnCondition;
    refundOrCreditAmount: number;
    restockWarehouseId: string;
  }) => { success: boolean; returnNo?: string; error?: string };
  processSupplierReturn: (data: {
    supplierId: string;
    purchaseInvoiceNo?: string;
    imei: string;
    returnReason: string;
    amount: number;
  }) => { success: boolean; returnNo?: string; error?: string };
  transferStock: (data: {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    items: Array<{ productId: string; variantId: string; imeis: string[] }>;
    notes?: string;
  }) => { success: boolean; transferNo?: string; error?: string };
  createExpense: (data: Omit<Expense, 'id' | 'expenseNo' | 'createdAt'>) => { success: boolean; error?: string };
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'supplierCode'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'customerCode'>) => void;
  addSalesman: (salesman: Omit<Salesman, 'id' | 'employeeCode'>) => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'code'>) => void;
  reconcileBankTransaction: (bankAccountId: string, txnId: string) => void;
  reconcileStatementEntry: (id: string, status: BankStatementEntry['status'], matchedSystemTxnId?: string) => void;

  // CRUD completion: Update / Delete / Void
  updateBrand: (id: string, data: Partial<Omit<Brand, 'id'>>) => CrudResult;
  deleteBrand: (id: string) => CrudResult;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => CrudResult;
  deleteProduct: (id: string) => CrudResult;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, 'id' | 'supplierCode'>>) => CrudResult;
  deleteSupplier: (id: string) => CrudResult;
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'customerCode'>>) => CrudResult;
  deleteCustomer: (id: string) => CrudResult;
  updateSalesman: (id: string, data: Partial<Omit<Salesman, 'id' | 'employeeCode'>>) => CrudResult;
  deleteSalesman: (id: string) => CrudResult;
  updateWarehouse: (id: string, data: Partial<Omit<Warehouse, 'id' | 'code'>>) => CrudResult;
  deleteWarehouse: (id: string) => CrudResult;
  addBankAccount: (data: Omit<BankAccount, 'id' | 'currentBalance'>) => CrudResult;
  updateBankAccount: (id: string, data: Partial<Pick<BankAccount, 'bankName' | 'branch' | 'accountName' | 'accountNumber' | 'accountType' | 'status'>>) => CrudResult;
  deleteBankAccount: (id: string) => CrudResult;
  addExpenseCategory: (data: Omit<ExpenseCategory, 'id'>) => CrudResult;
  updateExpenseCategory: (id: string, data: Partial<Omit<ExpenseCategory, 'id'>>) => CrudResult;
  deleteExpenseCategory: (id: string) => CrudResult;
  addAccount: (data: AccountCOA) => CrudResult;
  updateAccount: (code: string, data: Partial<Omit<AccountCOA, 'code' | 'balance'>>) => CrudResult;
  deleteAccount: (code: string) => CrudResult;
  updateExpense: (id: string, data: Partial<Pick<Expense, 'date' | 'categoryId' | 'categoryName' | 'description' | 'recipientName' | 'voucherRef' | 'approvedBy'>>) => CrudResult;
  deleteExpense: (id: string) => CrudResult;
  updateSaleInvoiceMeta: (id: string, data: Partial<Pick<SalesInvoice, 'notes' | 'dueDate'>>) => CrudResult;
  cancelSale: (id: string, reason?: string) => CrudResult;
  updatePurchaseInvoiceMeta: (id: string, data: Partial<Pick<PurchaseInvoice, 'notes' | 'dueDate' | 'referenceNo'>>) => CrudResult;
  cancelPurchase: (id: string, reason?: string) => CrudResult;
  updateSalesmanVisit: (id: string, data: Partial<Omit<SalesmanVisit, 'id'>>) => CrudResult;
  deleteSalesmanVisit: (id: string) => CrudResult;
  updateFollowUp: (id: string, data: Partial<Omit<CustomerFollowUp, 'id' | 'updatedAt'>>) => CrudResult;
  deleteFollowUp: (id: string) => CrudResult;

  // New modules: Visits, Followups, Day Closing, Phone Exchange, Bulk Import
  createSalesmanVisit: (visit: Omit<SalesmanVisit, 'id'>) => { success: boolean };
  addCustomerFollowUp: (fup: Omit<CustomerFollowUp, 'id' | 'updatedAt'>) => void;
  updateFollowUpStatus: (id: string, status: CustomerFollowUp['status'], notes?: string, promisedDate?: string) => void;
  performDayClosing: (data: Omit<DayClosingRecord, 'id' | 'closingNo' | 'createdAt'>) => { success: boolean; closingNo: string };
  processPhoneExchange: (data: Omit<PhoneExchangeTransaction, 'id' | 'exchangeNo' | 'createdAt'>) => { success: boolean; exchangeNo?: string; error?: string };
  bulkImportData: (entityType: 'customers' | 'suppliers' | 'products' | 'imeis', rows: any[]) => { success: boolean; count: number };
  addWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'rmaNumber'>) => { success: boolean; rmaNumber: string };
  updateWarrantyStatus: (id: string, status: WarrantyClaim['status'], updates?: Partial<WarrantyClaim>) => void;
  addBrandIncentiveScheme: (scheme: Omit<BrandIncentiveScheme, 'id'>) => void;
  updateBrandIncentiveStatus: (id: string, status: BrandIncentiveScheme['claimStatus'], creditNoteNo?: string) => void;
  createDeliveryChallan: (data: Omit<DeliveryChallan, 'id' | 'challanNo'>) => { success: boolean; challanNo: string };
  updateDeliveryStatus: (id: string, status: DeliveryStatus, deliveredAt?: string) => void;
  settleChallanCod: (id: string, bankAccountId?: string) => void;
  createPriceDropClaim: (claim: Omit<PriceDropClaim, 'id' | 'claimNo'>) => { success: boolean; claimNo: string };
  updatePriceDropStatus: (id: string, status: PriceDropClaim['claimStatus'], creditNoteNo?: string) => void;
  sendSmsNotification: (sms: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => { success: boolean };
  addBankStatementEntry: (entry: Omit<BankStatementEntry, 'id'>) => { success: boolean; id: string };

  // Network & Cloud Sync
  isOnline: boolean;
  pendingSyncCount: number;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  syncCloudData: () => Promise<{ success: boolean; message: string }>;
  triggerManualSync: () => Promise<{ success: boolean; message: string; syncedCount: number }>;

  // Data Management, Backup & Reset
  resetToDemoData: () => void;
  exportJSON: () => void;
  importJSON: (jsonData: string) => boolean;
  backupSnapshots: BackupSnapshot[];
  createBackupSnapshot: (name?: string) => BackupSnapshot;
  restoreFromSnapshot: (snapshotId: string) => boolean;
  deleteSnapshot: (snapshotId: string) => void;
  purgeTransactionalData: () => void;
  factoryResetFullWipe: () => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

const STORAGE_KEY = 'TELECORP_MOBILE_ERP_STATE_V1';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to initial seeded data
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load ERP state from localStorage', e);
    }
    return null;
  };

  const savedState = loadState();

  const [brands, setBrands] = useState<Brand[]>(savedState?.brands || initialBrands);
  const [products, setProducts] = useState<Product[]>(savedState?.products || initialProducts);
  const [imeis, setImeis] = useState<IMEIRecord[]>(savedState?.imeis || initialIMEIs);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(savedState?.warehouses || initialWarehouses);
  const [suppliers, setSuppliers] = useState<Supplier[]>(savedState?.suppliers || initialSuppliers);
  const [customers, setCustomers] = useState<Customer[]>(savedState?.customers || initialCustomers);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(savedState?.salesInvoices || initialSalesInvoices);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(savedState?.purchaseInvoices || initialPurchases);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(savedState?.stockTransfers || initialStockTransfers);
  const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>(savedState?.customerReturns || initialCustomerReturns);
  const [salesmen, setSalesmen] = useState<Salesman[]>(savedState?.salesmen || initialSalesmen);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(savedState?.bankAccounts || initialBankAccounts);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(savedState?.cashTransactions || initialCashTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(savedState?.expenses || initialExpenses);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(savedState?.expenseCategories || initialExpenseCategories);
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountCOA[]>(savedState?.chartOfAccounts || initialCOA);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(savedState?.journalEntries || initialJournalEntries);
  const [alerts, setAlerts] = useState<SystemAlert[]>(savedState?.alerts || initialAlerts);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(savedState?.auditLogs || initialAuditLogs);
  const [settings, setSettings] = useState<SystemSettings>(savedState?.settings || initialSettings);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Super Admin');

  // New modules states
  const [salesmanVisits, setSalesmanVisits] = useState<SalesmanVisit[]>(savedState?.salesmanVisits || initialSalesmanVisits);
  const [customerFollowUps, setCustomerFollowUps] = useState<CustomerFollowUp[]>(savedState?.customerFollowUps || initialCustomerFollowUps);
  const [dayClosings, setDayClosings] = useState<DayClosingRecord[]>(savedState?.dayClosings || initialDayClosings);
  const [phoneExchanges, setPhoneExchanges] = useState<PhoneExchangeTransaction[]>(savedState?.phoneExchanges || initialPhoneExchanges);
  const [bankStatements, setBankStatements] = useState<BankStatementEntry[]>(savedState?.bankStatements || initialBankStatements);
  const [supplierReturns, setSupplierReturns] = useState<SupplierReturn[]>(savedState?.supplierReturns || []);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(savedState?.warrantyClaims || initialWarrantyClaims);
  const [brandIncentives, setBrandIncentives] = useState<BrandIncentiveScheme[]>(savedState?.brandIncentives || initialBrandIncentives);
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>(savedState?.deliveryChallans || initialDeliveryChallans);
  const [priceDropClaims, setPriceDropClaims] = useState<PriceDropClaim[]>(savedState?.priceDropClaims || initialPriceDropClaims);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(savedState?.smsLogs || initialSmsLogs);

  // Users Management State (Real-Time RBAC)
  const [users, setUsers] = useState<AuthUser[]>(() => {
    try {
      const saved = localStorage.getItem('TELECORP_USERS_LIST');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return demoUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('TELECORP_USERS_LIST', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  // Auth User Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const authState = localStorage.getItem('TELECORP_AUTH_STATE');
      if (authState === 'logged_out') {
        return null;
      }
      const savedUser = localStorage.getItem('TELECORP_AUTH_USER');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return demoUsers[0];
  });

  // Backup Snapshots State
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('TELECORP_BACKUP_SNAPSHOTS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'snap-seed-initial',
        timestamp: '2026-10-01 10:00:00',
        name: 'System Initial Baseline Snapshot (Q4 Launch)',
        sizeBytes: 52400,
        recordCounts: {
          products: 5,
          imeis: 16,
          customers: 6,
          invoices: 4,
          purchases: 3
        },
        dataJson: ''
      }
    ];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
      localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(currentUser));
      setCurrentUserRole(currentUser.role);
    } else {
      localStorage.setItem('TELECORP_AUTH_STATE', 'logged_out');
      localStorage.removeItem('TELECORP_AUTH_USER');
    }
  }, [currentUser]);

  // Network Online/Offline Detection State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Offline Sync Queue State
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => getSyncQueue());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleQueueUpdate = () => {
      setSyncQueue(getSyncQueue());
      setPendingSyncCount(getPendingSyncCount());
    };

    window.addEventListener('telecorp-sync-queue-updated', handleQueueUpdate);
    return () => {
      window.removeEventListener('telecorp-sync-queue-updated', handleQueueUpdate);
    };
  }, []);

  // Sync and hydrate all enterprise entities from Supabase Cloud
  const syncAllFromSupabase = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      setIsSyncing(true);
      await processSyncQueue();
      setSyncQueue(getSyncQueue());
      setPendingSyncCount(getPendingSyncCount());

      // 1. Sync App Users
      const { data: userData } = await supabase.from('app_users').select('*');
      if (userData && userData.length > 0) {
        const cloudUsers: AuthUser[] = userData.map((sbUser: any) => {
          let normalizedRole: UserRole = 'Salesman';
          const r = (sbUser.role || '').toLowerCase();
          if (r === 'super admin' || r === 'admin' || r === 'owner') normalizedRole = 'Super Admin';
          else if (r.includes('account')) normalizedRole = 'Accountant';
          else if (r.includes('warehouse')) normalizedRole = 'Warehouse Manager';
          else if (r.includes('cashier')) normalizedRole = 'Cashier';
          else if (r.includes('sales manager')) normalizedRole = 'Sales Manager';
          else if (r.includes('sales')) normalizedRole = 'Salesman';
          else normalizedRole = 'Super Admin';

          return {
            id: sbUser.id,
            email: sbUser.email,
            name: sbUser.name,
            role: normalizedRole,
            password: sbUser.password,
            status: sbUser.status || 'Active',
            phone: sbUser.phone || undefined,
            department: sbUser.department || undefined,
            branchName: sbUser.branch_name || undefined,
            avatar: sbUser.avatar || '👨‍💼',
            lastLogin: sbUser.last_login || undefined,
            createdAt: sbUser.created_at || undefined
          };
        });

        setUsers(prev => {
          const merged = [...prev];
          cloudUsers.forEach(cu => {
            const idx = merged.findIndex(u => u.email.toLowerCase() === cu.email.toLowerCase());
            if (idx >= 0) {
              merged[idx] = cu;
            } else {
              merged.unshift(cu);
            }
          });
          return merged;
        });
      }

      // 2. Sync Brands
      const { data: brandData } = await supabase.from('brands').select('*');
      if (brandData && brandData.length > 0) {
        setBrands(brandData.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code || b.name.substring(0, 3).toUpperCase(),
          logo: b.logo || '📱',
          status: b.status || 'Active',
          description: b.description || ''
        })));
      }

      // 3. Sync Warehouses
      const { data: whData } = await supabase.from('warehouses').select('*');
      if (whData && whData.length > 0) {
        setWarehouses(whData.map((w: any) => ({
          id: w.id,
          name: w.name,
          code: w.code,
          type: w.type,
          address: w.address || '',
          city: w.city || 'Dhaka',
          managerName: w.manager_name || '',
          contactNumber: w.contact_number || '',
          status: w.status || 'Active'
        })));
      }

      // 4. Sync Suppliers
      const { data: supData } = await supabase.from('suppliers').select('*');
      if (supData && supData.length > 0) {
        setSuppliers(supData.map((s: any) => ({
          id: s.id,
          supplierCode: s.supplier_code,
          name: s.name,
          companyName: s.company_name,
          contactPerson: s.contact_person || '',
          mobile: s.mobile,
          alternativeMobile: s.alternative_mobile,
          email: s.email || '',
          address: s.address || '',
          district: s.district || 'Dhaka',
          taxVatNumber: s.tax_vat_number || '',
          tradeLicense: s.trade_license || '',
          openingBalance: Number(s.opening_balance || 0),
          creditLimit: Number(s.credit_limit || 10000000),
          paymentTermsDays: Number(s.payment_terms_days || 15),
          currentDue: Number(s.current_due || 0),
          bankInfo: s.bank_info || '',
          status: s.status || 'Active'
        })));
      }

      // 5. Sync Customers
      const { data: custData } = await supabase.from('customers').select('*');
      if (custData && custData.length > 0) {
        setCustomers(custData.map((c: any) => ({
          id: c.id,
          customerCode: c.customer_code,
          shopName: c.shop_name,
          ownerName: c.owner_name,
          mobile: c.mobile,
          alternativeMobile: c.alternative_mobile,
          email: c.email || '',
          address: c.address || '',
          area: c.area || '',
          district: c.district || 'Dhaka',
          division: c.division || 'Dhaka',
          nidNumber: c.nid_number,
          tradeLicense: c.trade_license,
          creditLimit: Number(c.credit_limit || 200000),
          allowedDueDays: Number(c.allowed_due_days || 15),
          customerType: c.customer_type || 'Wholesale Dealer',
          salesmanId: c.salesman_id,
          openingBalance: Number(c.opening_balance || 0),
          currentDue: Number(c.current_due || 0),
          securityChequeInfo: c.security_cheque_info,
          status: c.status || 'Active'
        })));
      }

      // 6. Sync Salesmen
      const { data: smData } = await supabase.from('salesmen').select('*');
      if (smData && smData.length > 0) {
        setSalesmen(smData.map((sm: any) => ({
          id: sm.id,
          employeeCode: sm.employee_code || sm.id,
          name: sm.name,
          mobile: sm.mobile,
          email: sm.email || '',
          address: sm.address || 'Dhaka, Bangladesh',
          joiningDate: sm.joining_date || '2026-01-01',
          basicSalary: Number(sm.basic_salary || 25000),
          commissionType: sm.commission_type || 'Percentage of Sales',
          commissionRate: Number(sm.commission_percentage || 1),
          monthlyTarget: Number(sm.target_monthly_bdt || 1000000),
          currentMonthSales: Number(sm.achieved_monthly_bdt || 0),
          currentMonthCollection: Number(sm.achieved_monthly_bdt || 0) * 0.8,
          assignedArea: sm.assigned_area || 'Dhaka Territory',
          assignedCustomerCount: 15,
          status: sm.status || 'Active'
        })));
      }

      // 7. Sync Products
      const { data: prodData } = await supabase.from('products').select('*');
      const { data: varData } = await supabase.from('product_variants').select('*');
      if (prodData && prodData.length > 0) {
        const mappedProds: Product[] = prodData.map((p: any) => ({
          id: p.id,
          brandId: p.brand_id || 'brand-1',
          brandName: p.brand_name,
          model: p.model,
          category: p.category || 'Smartphone',
          networkRegion: p.network_region || 'Official BD (BTRC Approved)',
          warrantyPeriodMonths: Number(p.warranty_period_months || 12),
          description: p.description || '',
          status: p.status || 'Active',
          variants: (varData || []).filter((v: any) => v.product_id === p.id).map((v: any) => ({
            id: v.id,
            sku: v.sku,
            ram: v.ram,
            storage: v.storage,
            color: v.color,
            purchasePrice: Number(v.purchase_price),
            dealerPrice: Number(v.dealer_price),
            wholesalePrice: Number(v.wholesale_price || v.dealer_price),
            retailPrice: Number(v.retail_price),
            minSellingPrice: Number(v.min_selling_price || v.dealer_price),
            maxDiscount: Number(v.max_discount || 500),
            reorderLevel: Number(v.reorder_level || 5),
            currentStock: Number(v.current_stock || 0)
          }))
        }));
        setProducts(mappedProds);
      }

      // 8. Sync Serialized IMEIs
      const { data: imeiData } = await supabase.from('imeis').select('*');
      if (imeiData && imeiData.length > 0) {
        setImeis(imeiData.map((i: any) => ({
          id: i.id,
          imei1: i.imei1,
          imei2: i.imei2,
          serialNumber: i.serial_number,
          productId: i.product_id,
          productName: i.product_name,
          variantId: i.variant_id,
          variantDesc: i.variant_desc,
          brandName: i.brand_name,
          purchaseCost: Number(i.purchase_cost),
          supplierId: i.supplier_id || 'sup-1',
          supplierName: i.supplier_name || '',
          purchaseInvoiceNo: i.purchase_invoice_no || '',
          purchaseDate: i.purchase_date || new Date().toISOString().split('T')[0],
          warehouseId: i.warehouse_id,
          warehouseName: i.warehouse_name,
          status: i.status || 'In Stock',
          condition: i.condition || 'Brand New',
          customerId: i.customer_id,
          customerName: i.customer_name,
          salesInvoiceNo: i.sales_invoice_no,
          salesDate: i.sales_date,
          salesPrice: i.sales_price ? Number(i.sales_price) : undefined,
          returnReason: i.return_reason,
          warrantyExpiry: i.warranty_expiry,
          history: i.history || []
        })));
      }

      // 9. Sync Bank Accounts
      const { data: bankData } = await supabase.from('bank_accounts').select('*');
      if (bankData && bankData.length > 0) {
        setBankAccounts(bankData.map((b: any) => ({
          id: b.id,
          bankName: b.bank_name,
          branch: b.branch_name || '',
          accountName: b.account_name,
          accountNumber: b.account_number,
          accountType: b.account_type || 'Current',
          openingBalance: Number(b.opening_balance || 0),
          currentBalance: Number(b.current_balance || 0),
          status: b.status || 'Active'
        })));
      }

      // 10. Sync Chart of Accounts
      const { data: coaData } = await supabase.from('chart_of_accounts').select('*');
      if (coaData && coaData.length > 0) {
        setChartOfAccounts(coaData.map((c: any) => ({
          code: c.code,
          name: c.name,
          type: c.type,
          nature: c.nature,
          balance: Number(c.balance || 0),
          description: c.description || ''
        })));
      }

      // 11. Sync Sales Invoices
      const { data: salesData } = await supabase.from('sales_invoices').select('*');
      if (salesData && salesData.length > 0) {
        setSalesInvoices(salesData.map((s: any) => ({
          id: s.id,
          invoiceNo: s.invoice_no,
          invoiceType: s.invoice_type || 'Wholesale',
          customerId: s.customer_id,
          customerName: s.customer_name,
          customerPhone: s.customer_phone || '',
          salesmanId: s.salesman_id,
          salesmanName: s.salesman_name,
          warehouseId: s.warehouse_id,
          warehouseName: s.warehouse_name,
          invoiceDate: s.invoice_date,
          dueDate: s.due_date || s.invoice_date,
          items: s.items || [],
          subTotal: Number(s.subtotal || 0),
          discountTotal: Number(s.discount || 0),
          vatTotal: Number(s.vat_amount || 0),
          grandTotal: Number(s.grand_total || 0),
          paidAmount: Number(s.paid_amount || 0),
          dueAmount: Number(s.due_amount || 0),
          payments: s.payments || [],
          commissionEarned: Number(s.commission_earned || 0),
          notes: s.notes,
          status: s.status || 'Confirmed',
          createdAt: s.created_at || s.invoice_date
        })));
      }

      // 12. Sync Purchase Invoices
      const { data: purchData } = await supabase.from('purchase_invoices').select('*');
      if (purchData && purchData.length > 0) {
        setPurchaseInvoices(purchData.map((p: any) => ({
          id: p.id,
          invoiceNo: p.invoice_no,
          supplierId: p.supplier_id,
          supplierName: p.supplier_name,
          purchaseDate: p.purchase_date,
          dueDate: p.due_date || p.purchase_date,
          warehouseId: p.warehouse_id,
          warehouseName: p.warehouse_name,
          items: p.items || [],
          subTotal: Number(p.subtotal || 0),
          discountTotal: Number(p.discount_total || 0),
          vatTotal: Number(p.vat_total || 0),
          otherCost: Number(p.transport_cost || 0) + Number(p.other_expenses || 0),
          grandTotal: Number(p.total_amount || 0),
          paidAmount: Number(p.paid_amount || 0),
          dueAmount: Number(p.due_amount || 0),
          paymentMethod: p.payment_method || 'Bank Transfer',
          bankAccountId: p.bank_account_id,
          referenceNo: p.reference_no,
          status: p.status || 'Received',
          notes: p.notes,
          createdAt: p.created_at || p.purchase_date
        })));
      }

      // 13. Sync Expenses
      const { data: expData } = await supabase.from('expenses').select('*');
      if (expData && expData.length > 0) {
        setExpenses(expData.map((e: any) => ({
          id: e.id,
          expenseNo: e.expense_no,
          date: e.date,
          categoryId: e.category_id || 'exp-cat-1',
          categoryName: e.category_name,
          amount: Number(e.amount || 0),
          paymentMethod: e.payment_method || 'Cash',
          bankAccountId: e.bank_account_id,
          description: e.description,
          recipientName: e.recipient_name,
          voucherRef: e.voucher_ref,
          approvedBy: e.approved_by || 'Management',
          createdAt: e.created_at || e.date
        })));
      }

      // 14. Sync Expense Categories
      const { data: expCatData } = await supabase.from('expense_categories').select('*');
      if (expCatData && expCatData.length > 0) {
        setExpenseCategories(expCatData.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || ''
        })));
      }

      // 15. Sync Cash Transactions
      const { data: cashData } = await supabase.from('cash_transactions').select('*');
      if (cashData && cashData.length > 0) {
        setCashTransactions(cashData.map((c: any) => ({
          id: c.id,
          date: c.date,
          type: c.type,
          category: c.category,
          amount: Number(c.amount || 0),
          referenceNo: c.reference_no || '',
          description: c.description,
          performedBy: c.performed_by || 'Cashier'
        })));
      }

      // 16. Sync Warranty Claims
      const { data: wcData } = await supabase.from('warranty_claims').select('*');
      if (wcData && wcData.length > 0) {
        setWarrantyClaims(wcData.map((w: any) => ({
          id: w.id,
          rmaNumber: w.rma_number,
          date: w.date,
          customerId: w.customer_id,
          customerName: w.customer_name,
          customerPhone: w.customer_phone || '',
          brandName: w.brand_name,
          productModel: w.product_model,
          imei: w.imei,
          purchaseInvoiceNo: w.purchase_invoice_no,
          purchaseDate: w.purchase_date,
          problemDescription: w.problem_description,
          physicalCondition: w.physical_condition || '',
          accessoriesIncluded: w.accessories_included || '',
          serviceCenterName: w.service_center_name,
          serviceCenterJobNo: w.service_center_job_no,
          status: w.status || 'Received',
          replacementIMEI: w.replacement_imei,
          repairCostCustomer: Number(w.repair_cost_customer || 0),
          deliveryDate: w.delivery_date,
          remarks: w.remarks
        })));
      }

      // 17. Sync Brand Incentives
      const { data: bisData } = await supabase.from('brand_incentive_schemes').select('*');
      if (bisData && bisData.length > 0) {
        setBrandIncentives(bisData.map((b: any) => ({
          id: b.id,
          brandId: b.brand_id,
          brandName: b.brand_name,
          schemeTitle: b.scheme_title,
          period: b.period,
          startDate: b.start_date,
          endDate: b.end_date,
          targetUnits: Number(b.target_units || 0),
          achievedUnits: Number(b.achieved_units || 0),
          slabs: b.slabs || [],
          totalIncentiveEarned: Number(b.total_incentive_earned || 0),
          claimStatus: b.claim_status || 'In Progress',
          supplierCreditNoteNo: b.supplier_credit_note_no
        })));
      }

      // 18. Sync Delivery Challans
      const { data: chData } = await supabase.from('delivery_challans').select('*');
      if (chData && chData.length > 0) {
        setDeliveryChallans(chData.map((c: any) => ({
          id: c.id,
          challanNo: c.challan_no,
          date: c.date,
          invoiceNo: c.invoice_no,
          customerId: c.customer_id,
          customerName: c.customer_name,
          customerPhone: c.customer_phone || '',
          deliveryAddress: c.delivery_address,
          district: c.district || 'Dhaka',
          courierPartner: c.courier_partner || 'Steadfast Courier',
          consignmentNo: c.consignment_no,
          isCOD: Boolean(c.is_cod),
          codAmount: Number(c.cod_amount || 0),
          codStatus: c.cod_status || 'Not Applicable',
          deliveryStatus: c.delivery_status || 'Pending Dispatch',
          driverName: c.driver_name,
          driverPhone: c.driver_phone,
          totalCartons: Number(c.total_cartons || 1),
          imeiList: c.imei_list || [],
          remarks: c.remarks,
          deliveredAt: c.delivered_at
        })));
      }

      // 19. Sync Price Drop Claims
      const { data: pdcData } = await supabase.from('price_drop_claims').select('*');
      if (pdcData && pdcData.length > 0) {
        setPriceDropClaims(pdcData.map((p: any) => ({
          id: p.id,
          claimNo: p.claim_no,
          claimDate: p.claim_date,
          brandName: p.brand_name,
          supplierId: p.supplier_id,
          supplierName: p.supplier_name,
          productId: p.product_id,
          productModel: p.product_model,
          variantDesc: p.variant_desc,
          oldPurchaseCost: Number(p.old_purchase_cost || 0),
          newPurchaseCost: Number(p.new_purchase_cost || 0),
          dropPerUnit: Number(p.drop_per_unit || 0),
          eligibleStockCount: Number(p.eligible_stock_count || 0),
          totalClaimAmount: Number(p.total_claim_amount || 0),
          claimStatus: p.claim_status || 'Draft',
          creditNoteNo: p.credit_note_no,
          announcementRef: p.announcement_ref
        })));
      }

      // 20. Sync Phone Exchanges
      const { data: excData } = await supabase.from('phone_exchange_records').select('*');
      if (excData && excData.length > 0) {
        setPhoneExchanges(excData.map((e: any) => ({
          id: e.id,
          exchangeNo: e.exchange_no,
          date: e.date,
          customerId: e.customer_id,
          customerName: e.customer_name,
          customerPhone: e.customer_phone || '',
          salesmanId: e.salesman_id,
          salesmanName: e.salesman_name,
          oldBrand: e.old_brand,
          oldModel: e.old_model,
          oldIMEI: e.old_imei,
          oldCondition: e.old_condition || 'Used',
          assessedValue: Number(e.assessed_value || 0),
          newProductId: e.new_product_id,
          newProductName: e.new_product_name,
          newVariantDesc: e.new_variant_desc,
          newIMEI: e.new_imei,
          newPhonePrice: Number(e.new_phone_price || 0),
          netPayableAmount: Number(e.net_payable_amount || 0),
          amountPaidNow: Number(e.amount_paid_now || 0),
          dueAmount: Number(e.due_amount || 0),
          paymentMethod: e.payment_method || 'Cash',
          bankAccountId: e.bank_account_id,
          notes: e.notes,
          createdAt: e.created_at || e.date
        })));
      }

      // 21. Sync Customer Follow Ups
      const { data: fupData } = await supabase.from('customer_follow_ups').select('*');
      if (fupData && fupData.length > 0) {
        setCustomerFollowUps(fupData.map((f: any) => ({
          id: f.id,
          customerId: f.customer_id,
          customerName: f.customer_name,
          shopName: f.shop_name,
          salesmanId: f.salesman_id,
          salesmanName: f.salesman_name,
          scheduledDate: f.scheduled_date,
          contactNumber: f.contact_number,
          purpose: f.purpose,
          currentDueAmount: Number(f.current_due_amount || 0),
          status: f.status || 'Pending',
          promisedDate: f.promised_date,
          notes: f.notes || '',
          updatedAt: f.updated_at || f.scheduled_date
        })));
      }

      // 22. Sync Salesman Visits
      const { data: svData } = await supabase.from('salesman_visits').select('*');
      if (svData && svData.length > 0) {
        setSalesmanVisits(svData.map((v: any) => ({
          id: v.id,
          salesmanId: v.salesman_id,
          salesmanName: v.salesman_name,
          customerId: v.customer_id,
          customerName: v.customer_name || '',
          shopName: v.shop_name,
          visitDate: v.visit_date || v.date,
          purpose: v.purpose || 'Relationship',
          outcomeNotes: v.outcome_notes || v.notes || '',
          orderCollectedAmount: Number(v.order_amount_booked || 0),
          paymentCollectedAmount: Number(v.collection_amount || 0),
          nextFollowUpDate: v.next_follow_up_date
        })));
      }

      // 23. Sync Day Closings
      const { data: dcData } = await supabase.from('day_closings').select('*');
      if (dcData && dcData.length > 0) {
        setDayClosings(dcData.map((d: any) => ({
          id: d.id,
          closingNo: d.closing_no,
          date: d.date,
          cashierName: d.cashier_name,
          warehouseId: d.warehouse_id,
          warehouseName: d.warehouse_name,
          openingCash: Number(d.opening_cash || 0),
          cashSalesTotal: Number(d.cash_sales_total || 0),
          dueCollectionsTotal: Number(d.due_collections_total || 0),
          cashExpensesTotal: Number(d.cash_expenses_total || 0),
          bankDepositsTotal: Number(d.bank_deposits_total || 0),
          expectedClosingCash: Number(d.expected_closing_cash || 0),
          actualPhysicalCash: Number(d.actual_physical_cash || 0),
          discrepancy: Number(d.discrepancy || 0),
          status: d.status || 'Balanced',
          verifiedBy: d.verified_by || '',
          notes: d.notes,
          createdAt: d.created_at || d.date
        })));
      }

      // 24. Sync Stock Transfers
      const { data: trData } = await supabase.from('stock_transfers').select('*');
      if (trData && trData.length > 0) {
        setStockTransfers(trData.map((t: any) => ({
          id: t.id,
          transferNo: t.transfer_no,
          sourceWarehouseId: t.from_warehouse_id,
          sourceWarehouseName: t.from_warehouse_name,
          destinationWarehouseId: t.to_warehouse_id,
          destinationWarehouseName: t.to_warehouse_name,
          transferDate: t.date,
          items: t.items || [],
          totalQuantity: Number(t.total_units || 0),
          status: t.status || 'Completed',
          dispatchedBy: t.dispatched_by,
          receivedBy: t.received_by,
          notes: t.notes,
          createdAt: t.created_at || t.date
        })));
      }

      // 25. Sync Customer Returns
      const { data: retData } = await supabase.from('customer_returns').select('*');
      if (retData && retData.length > 0) {
        setCustomerReturns(retData.map((r: any) => ({
          id: r.id,
          returnNo: r.return_no,
          originalInvoiceNo: r.sales_invoice_no,
          customerId: r.customer_id,
          customerName: r.customer_name,
          returnDate: r.return_date,
          imei: r.imei,
          productName: r.product_name,
          variantDesc: r.variant_desc,
          returnReason: r.return_reason,
          condition: r.condition || 'Sealed',
          refundOrCreditAmount: Number(r.refund_or_credit_amount || 0),
          restockWarehouseId: r.restock_warehouse_id || 'wh-1',
          restockStatus: r.restock_status || 'Restocked',
          commissionReversed: Number(r.commission_reversed || 0),
          approvedBy: r.approved_by || 'Management',
          status: r.status || 'Approved',
          notes: r.notes,
          createdAt: r.created_at || r.return_date
        })));
      }

      // 26. Sync Supplier Returns
      const { data: sretData } = await supabase.from('supplier_returns').select('*');
      if (sretData && sretData.length > 0) {
        setSupplierReturns(sretData.map((s: any) => ({
          id: s.id,
          returnNo: s.return_no,
          supplierId: s.supplier_id,
          supplierName: s.supplier_name,
          purchaseInvoiceNo: s.purchase_invoice_no || '',
          imei: s.imei,
          productName: s.product_name,
          variantDesc: s.variant_desc,
          returnDate: s.date,
          returnReason: s.reason,
          amount: Number(s.amount || 0),
          status: s.status || 'Completed',
          createdAt: s.created_at || s.date
        })));
      }

      // 27. Sync System Settings
      const { data: setArr } = await supabase.from('system_settings').select('*').limit(1);
      if (setArr && setArr.length > 0) {
        const s = setArr[0];
        setSettings({
          companyName: s.company_name,
          companyAddress: s.company_address,
          companyPhone: s.company_phone,
          companyEmail: s.company_email,
          vatTaxNumber: s.vat_tax_number,
          defaultVatPercent: Number(s.default_vat_percent || 5),
          currency: 'BDT',
          currencySymbol: s.currency_symbol || '৳',
          valuationMethod: s.valuation_method || 'FIFO',
          negativeStockAllowed: Boolean(s.negative_stock_allowed),
          creditLimitHardBlock: Boolean(s.credit_limit_hard_block),
          maxDiscountWithoutApproval: Number(s.max_discount_without_approval || 1000),
          language: s.language || 'bn'
        });
      }

      // 28. Sync Alerts
      const { data: alertData } = await supabase.from('system_alerts').select('*');
      if (alertData && alertData.length > 0) {
        setAlerts(alertData.map((a: any) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          message: a.message,
          timestamp: a.timestamp,
          read: Boolean(a.read),
          linkModule: a.link_module,
          referenceId: a.reference_id
        })));
      }

      // 29. Sync SMS Logs
      const { data: smsData } = await supabase.from('sms_logs').select('*');
      if (smsData && smsData.length > 0) {
        setSmsLogs(smsData.map((s: any) => ({
          id: s.id,
          recipientPhone: s.recipient_phone,
          recipientName: s.recipient_name,
          messageType: s.message_type,
          messageBody: s.message_body,
          sentAt: s.sent_at,
          status: s.status || 'Sent',
          masking: s.masking || 'TELECORP',
          smsUnits: Number(s.sms_units || 1)
        })));
      }
    } catch (err) {
      console.warn('Failed to sync entities from Supabase on init:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncAllFromSupabase();

    const handleOnline = async () => {
      setIsOnline(true);
      await syncAllFromSupabase();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllFromSupabase]);

  const triggerManualSync = async (): Promise<{ success: boolean; message: string; syncedCount: number }> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, message: 'আপনার ডিভাইস বর্তমানে অফলাইনে রয়েছে। ইন্টারনেট সংযুক্ত হলে সিঙ্ক করা যাবে।', syncedCount: 0 };
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase ক্লাউড ডেটাবেস কনফিগার করা নেই।', syncedCount: 0 };
    }
    try {
      setIsSyncing(true);
      const pushRes = await processSyncQueue();
      setSyncQueue(getSyncQueue());
      setPendingSyncCount(getPendingSyncCount());
      await syncAllFromSupabase();
      return {
        success: pushRes.success,
        message: pushRes.message,
        syncedCount: pushRes.syncedCount
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'সিঙ্ক ব্যর্থ হয়েছে।', syncedCount: 0 };
    } finally {
      setIsSyncing(false);
    }
  };

  const syncCloudData = async (): Promise<{ success: boolean; message: string }> => {
    return triggerManualSync();
  };

  useEffect(() => {
    try {
      localStorage.setItem('TELECORP_BACKUP_SNAPSHOTS', JSON.stringify(backupSnapshots));
    } catch (e) {
      console.error(e);
    }
  }, [backupSnapshots]);

  // Sync to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        brands,
        products,
        imeis,
        warehouses,
        suppliers,
        customers,
        salesInvoices,
        purchaseInvoices,
        stockTransfers,
        customerReturns,
        salesmen,
        bankAccounts,
        cashTransactions,
        expenses,
        expenseCategories,
        chartOfAccounts,
        journalEntries,
        alerts,
        auditLogs,
        settings,
        salesmanVisits,
        customerFollowUps,
        dayClosings,
        phoneExchanges,
        bankStatements,
        supplierReturns,
        warrantyClaims,
        brandIncentives,
        deliveryChallans,
        priceDropClaims,
        smsLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving ERP state to localStorage', e);
    }
  }, [
    brands, products, imeis, warehouses, suppliers, customers,
    salesInvoices, purchaseInvoices, stockTransfers, customerReturns,
    salesmen, bankAccounts, cashTransactions, expenses, expenseCategories,
    chartOfAccounts, journalEntries, alerts, auditLogs, settings,
    salesmanVisits, customerFollowUps, dayClosings, phoneExchanges,
    bankStatements, supplierReturns, warrantyClaims, brandIncentives,
    deliveryChallans, priceDropClaims, smsLogs
  ]);

  const addAudit = (action: string, module: string, referenceNo?: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      user: currentUserRole === 'Super Admin' ? 'Super Admin (Aminul Islam)' : `${currentUserRole} User`,
      role: currentUserRole,
      action,
      module,
      referenceNo: referenceNo || '',
      oldValue,
      newValue,
      ipAddress: '103.220.198.42 (Dhaka, BD)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      enqueueChange('system_settings', 'UPDATE', 'primary_settings', updated, 'সিস্টেম সেটিংস পরিবর্তন');
      return updated;
    });
    addAudit('Updated System Settings', 'Settings', 'SYSTEM', 'Prior Config', JSON.stringify(newSettings));
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBrands(initialBrands);
    setProducts(initialProducts);
    setImeis(initialIMEIs);
    setWarehouses(initialWarehouses);
    setSuppliers(initialSuppliers);
    setCustomers(initialCustomers);
    setSalesInvoices(initialSalesInvoices);
    setPurchaseInvoices(initialPurchases);
    setStockTransfers(initialStockTransfers);
    setCustomerReturns(initialCustomerReturns);
    setSalesmen(initialSalesmen);
    setBankAccounts(initialBankAccounts);
    setCashTransactions(initialCashTransactions);
    setExpenses(initialExpenses);
    setChartOfAccounts(initialCOA);
    setJournalEntries(initialJournalEntries);
    setAlerts(initialAlerts);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    setSalesmanVisits(initialSalesmanVisits);
    setCustomerFollowUps(initialCustomerFollowUps);
    setDayClosings(initialDayClosings);
    setPhoneExchanges(initialPhoneExchanges);
    setBankStatements(initialBankStatements);
    setSupplierReturns([]);
    setWarrantyClaims(initialWarrantyClaims);
    setBrandIncentives(initialBrandIncentives);
    setDeliveryChallans(initialDeliveryChallans);
    setPriceDropClaims(initialPriceDropClaims);
    setSmsLogs(initialSmsLogs);
  };

  // Auth Operations
  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'দয়া করে আপনার রেজিস্টার্ড ইমেইল অ্যাড্রেস প্রদান করুন।' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'দয়া করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।' };
    }

    const supabase = getSupabaseClient();
    const canCheckSupabase = supabase && (typeof navigator === 'undefined' || navigator.onLine);

    if (canCheckSupabase) {
      try {
        const fetchPromise = supabase
          .from('app_users')
          .select('*')
          .ilike('email', trimmedEmail)
          .limit(1);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cloud login timeout')), 3500)
        );

        const { data: sbUsers } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (sbUsers && sbUsers.length > 0) {
          const sbUser = sbUsers[0];
          if (sbUser.password && sbUser.password !== trimmedPass) {
            return { success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' };
          }
          if (sbUser.status === 'Suspended') {
            return { success: false, error: 'এই অ্যাকাউন্টটি স্থগিত (Suspended) করা হয়েছে। সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।' };
          }

          let normalizedRole: UserRole = 'Salesman';
          const r = (sbUser.role || '').toLowerCase();
          if (r === 'super admin' || r === 'admin' || r === 'owner') normalizedRole = 'Super Admin';
          else if (r.includes('account')) normalizedRole = 'Accountant';
          else if (r.includes('warehouse')) normalizedRole = 'Warehouse Manager';
          else if (r.includes('cashier')) normalizedRole = 'Cashier';
          else if (r.includes('sales manager')) normalizedRole = 'Sales Manager';
          else if (r.includes('sales')) normalizedRole = 'Salesman';
          else normalizedRole = 'Super Admin';

          const mappedUser: AuthUser = {
            id: sbUser.id,
            email: sbUser.email,
            name: sbUser.name,
            role: normalizedRole,
            password: sbUser.password,
            status: sbUser.status || 'Active',
            phone: sbUser.phone || undefined,
            department: sbUser.department || undefined,
            branchName: sbUser.branch_name || undefined,
            avatar: sbUser.avatar || '👨‍💼',
            lastLogin: new Date().toISOString().replace('T', ' ').substr(0, 16)
          };

          supabase.from('app_users').update({
            last_login: new Date().toISOString()
          }).eq('id', sbUser.id).then(() => { });

          setUsers(prev => {
            const idx = prev.findIndex(u => u.email.toLowerCase() === trimmedEmail);
            if (idx >= 0) {
              const cp = [...prev];
              cp[idx] = mappedUser;
              return cp;
            }
            return [mappedUser, ...prev];
          });

          setCurrentUser(mappedUser);
          setCurrentUserRole(mappedUser.role);

          try {
            localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
            localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(mappedUser));
          } catch (e) {
            console.error('LocalStorage write error', e);
          }

          addAudit(`User Logged In via Supabase Cloud (${mappedUser.name})`, 'Authentication', mappedUser.email);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase authentication check failed, falling back to local users list', err);
      }
    }

    let user = users.find(u => u.email.toLowerCase() === trimmedEmail || u.id === trimmedEmail);

    if (!user) {
      return { success: false, error: 'এই ইমেইল ঠিকানায় কোনো ইউজার একাউন্ট খুঁজে পাওয়া যায়নি।' };
    }

    if (user.password && user.password !== trimmedPass) {
      return { success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' };
    }

    if (user.status === 'Suspended') {
      return { success: false, error: 'এই অ্যাকাউন্টটি স্থগিত (Suspended) করা হয়েছে। সিস্টেম অ্যাডমিন বা ম্যানেজারের সাথে যোগাযোগ করুন।' };
    }

    const updatedUser: AuthUser = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setCurrentUserRole(user.role);

    try {
      localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
      localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    addAudit(`User Logged In (${user.name})`, 'Authentication', user.email);
    return { success: true };
  };

  const loginAsDemoUser = (userId: string) => {
    const user = users.find(u => u.id === userId) || users[0];
    if (user.status === 'Suspended') {
      return { success: false, error: 'স্থগিত (Suspended) একাউন্টে সরাসরি প্রবেশ নিষিদ্ধ।' };
    }

    const updatedUser: AuthUser = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setCurrentUserRole(user.role);

    try {
      localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
      localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    addAudit(`Role Switch: Switched to ${user.name} (${user.role})`, 'Authentication', user.email);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addAudit(`User Logged Out (${currentUser.name})`, 'Authentication', currentUser.email);
    }
    setCurrentUser(null);
    setCurrentUserRole('Super Admin');
    try {
      localStorage.setItem('TELECORP_AUTH_STATE', 'logged_out');
      localStorage.removeItem('TELECORP_AUTH_USER');
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  };

  // Modular Context Bundles
  const purchaseBundle: PurchaseContextBundle = {
    purchaseInvoices,
    setPurchaseInvoices,
    imeis,
    setImeis,
    products,
    setProducts,
    suppliers,
    setSuppliers,
    bankAccounts,
    setBankAccounts,
    setCashTransactions,
    journalEntries,
    setJournalEntries,
    supplierReturns,
    setSupplierReturns,
    priceDropClaims,
    setPriceDropClaims,
    currentUserRole,
    enqueueChange,
    addAudit
  };

  const salesBundle: SalesContextBundle = {
    salesInvoices,
    setSalesInvoices,
    imeis,
    setImeis,
    products,
    setProducts,
    customers,
    setCustomers,
    salesmen,
    setSalesmen,
    bankAccounts,
    setBankAccounts,
    setCashTransactions,
    journalEntries,
    setJournalEntries,
    customerReturns,
    setCustomerReturns,
    phoneExchanges,
    setPhoneExchanges,
    deliveryChallans,
    setDeliveryChallans,
    settings,
    alerts,
    setAlerts,
    currentUserRole,
    enqueueChange,
    addAudit
  };

  const accountingBundle: AccountingContextBundle = {
    expenses,
    setExpenses,
    expenseCategories,
    setExpenseCategories,
    bankAccounts,
    setBankAccounts,
    bankStatements,
    setBankStatements,
    setCashTransactions,
    chartOfAccounts,
    setChartOfAccounts,
    journalEntries,
    setJournalEntries,
    dayClosings,
    setDayClosings,
    purchaseInvoices,
    salesInvoices,
    currentUserRole,
    enqueueChange,
    addAudit
  };

  const masterDataBundle: MasterDataContextBundle = {
    brands,
    setBrands,
    products,
    setProducts,
    imeis,
    setImeis,
    suppliers,
    setSuppliers,
    customers,
    setCustomers,
    salesmen,
    setSalesmen,
    warehouses,
    setWarehouses,
    stockTransfers,
    setStockTransfers,
    salesmanVisits,
    setSalesmanVisits,
    customerFollowUps,
    setCustomerFollowUps,
    warrantyClaims,
    setWarrantyClaims,
    brandIncentives,
    setBrandIncentives,
    smsLogs,
    setSmsLogs,
    salesInvoices,
    purchaseInvoices,
    setPurchaseInvoices,
    currentUser,
    currentUserRole,
    enqueueChange,
    addAudit
  };

  const systemBundle: SystemContextBundle = {
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    setCurrentUserRole,
    backupSnapshots,
    setBackupSnapshots,
    enqueueChange,
    addAudit,
    brands, setBrands,
    products, setProducts,
    imeis, setImeis,
    warehouses, setWarehouses,
    suppliers, setSuppliers,
    customers, setCustomers,
    salesInvoices, setSalesInvoices,
    purchaseInvoices, setPurchaseInvoices,
    stockTransfers, setStockTransfers,
    customerReturns, setCustomerReturns,
    salesmen, setSalesmen,
    bankAccounts, setBankAccounts,
    cashTransactions, setCashTransactions,
    expenses, setExpenses,
    chartOfAccounts, setChartOfAccounts,
    journalEntries, setJournalEntries,
    auditLogs, setAuditLogs,
    settings, setSettings,
    salesmanVisits, setSalesmanVisits,
    customerFollowUps, setCustomerFollowUps,
    dayClosings, setDayClosings,
    phoneExchanges, setPhoneExchanges,
    bankStatements, setBankStatements,
    supplierReturns, setSupplierReturns,
    warrantyClaims, setWarrantyClaims,
    brandIncentives, setBrandIncentives,
    deliveryChallans, setDeliveryChallans,
    priceDropClaims, setPriceDropClaims,
    smsLogs, setSmsLogs,
    resetToDemoData
  };

  // Modular Action Delegations
  // Purchases & Supplier Operations
  const createPurchase = (
    purchase: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'createdAt'>,
    imeisToRegister: Array<{ imei1: string; imei2?: string; serialNumber?: string; variantId: string; productId: string }>
  ) => executeCreatePurchase(purchase, imeisToRegister, purchaseBundle);

  const updatePurchaseInvoiceMeta = (
    id: string,
    data: Partial<Pick<PurchaseInvoice, 'notes' | 'dueDate' | 'referenceNo'>>
  ) => executeUpdatePurchaseInvoiceMeta(id, data, purchaseBundle);

  const cancelPurchase = (id: string, reason?: string) => executeCancelPurchase(id, reason, purchaseBundle);
  const paySupplier = (data: {
    supplierId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    referenceNo: string;
    notes?: string;
  }) => executePaySupplier(data, purchaseBundle);

  const processSupplierReturn = (data: {
    supplierId: string;
    purchaseInvoiceNo?: string;
    imei: string;
    returnReason: string;
    amount: number;
  }) => executeProcessSupplierReturn(data, purchaseBundle);

  const createPriceDropClaim = (claim: Omit<PriceDropClaim, 'id' | 'claimNo'>) =>
    executeCreatePriceDropClaim(claim, purchaseBundle);

  const updatePriceDropStatus = (id: string, status: PriceDropClaim['claimStatus'], creditNoteNo?: string) =>
    executeUpdatePriceDropStatus(id, status, creditNoteNo, purchaseBundle);

  // Sales & Customer Operations
  const createSale = (sale: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'createdAt'>) =>
    executeCreateSale(sale, salesBundle);

  const updateSaleInvoiceMeta = (id: string, data: Partial<Pick<SalesInvoice, 'notes' | 'dueDate'>>) =>
    executeUpdateSaleInvoiceMeta(id, data, salesBundle);

  const cancelSale = (id: string, reason?: string) => executeCancelSale(id, reason, salesBundle);

  const collectCustomerPayment = (data: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    transactionRef?: string;
    collectorSalesmanId?: string;
    allocations: PaymentAllocationItem[];
    notes?: string;
  }) => executeCollectCustomerPayment(data, salesBundle);

  const processCustomerReturn = (data: {
    originalInvoiceNo: string;
    customerId: string;
    imei: string;
    returnReason: string;
    condition: ReturnCondition;
    refundOrCreditAmount: number;
    restockWarehouseId: string;
  }) => executeProcessCustomerReturn(data, salesBundle);

  const processPhoneExchange = (data: Omit<PhoneExchangeTransaction, 'id' | 'exchangeNo' | 'createdAt'>) =>
    executeProcessPhoneExchange(data, salesBundle);

  const createDeliveryChallan = (data: Omit<DeliveryChallan, 'id' | 'challanNo'>) =>
    executeCreateDeliveryChallan(data, salesBundle);

  const updateDeliveryStatus = (id: string, status: DeliveryStatus, deliveredAt?: string) =>
    executeUpdateDeliveryStatus(id, status, deliveredAt, salesBundle);

  const settleChallanCod = (id: string, bankAccountId?: string) =>
    executeSettleChallanCod(id, bankAccountId, salesBundle);

  // Accounting Operations
  const createExpense = (data: Omit<Expense, 'id' | 'expenseNo' | 'createdAt'>) =>
    executeCreateExpense(data, accountingBundle);

  const updateExpense = (
    id: string,
    data: Partial<Pick<Expense, 'date' | 'categoryId' | 'categoryName' | 'description' | 'recipientName' | 'voucherRef' | 'approvedBy'>>
  ) => executeUpdateExpense(id, data, accountingBundle);

  const deleteExpense = (id: string) => executeDeleteExpense(id, accountingBundle);

  const addBankAccount = (data: Omit<BankAccount, 'id' | 'currentBalance'>) =>
    executeAddBankAccount(data, accountingBundle);

  const updateBankAccount = (
    id: string,
    data: Partial<Pick<BankAccount, 'bankName' | 'branch' | 'accountName' | 'accountNumber' | 'accountType' | 'status'>>
  ) => executeUpdateBankAccount(id, data, accountingBundle);

  const deleteBankAccount = (id: string) => executeDeleteBankAccount(id, accountingBundle);

  const addExpenseCategory = (data: Omit<ExpenseCategory, 'id'>) =>
    executeAddExpenseCategory(data, accountingBundle);

  const updateExpenseCategory = (id: string, data: Partial<Omit<ExpenseCategory, 'id'>>) =>
    executeUpdateExpenseCategory(id, data, accountingBundle);

  const deleteExpenseCategory = (id: string) => executeDeleteExpenseCategory(id, accountingBundle);

  const addAccount = (data: AccountCOA) => executeAddAccount(data, accountingBundle);

  const updateAccount = (code: string, data: Partial<Omit<AccountCOA, 'code' | 'balance'>>) =>
    executeUpdateAccount(code, data, accountingBundle);

  const deleteAccount = (code: string) => executeDeleteAccount(code, accountingBundle);

  const reconcileBankTransaction = (bankAccountId: string, txnId: string) =>
    executeReconcileBankTransaction(bankAccountId, txnId, accountingBundle);

  const reconcileStatementEntry = (id: string, status: BankStatementEntry['status'], matchedSystemTxnId?: string) =>
    executeReconcileStatementEntry(id, status, matchedSystemTxnId, accountingBundle);

  const addBankStatementEntry = (entry: Omit<BankStatementEntry, 'id'>) =>
    executeAddBankStatementEntry(entry, accountingBundle);

  const performDayClosing = (data: Omit<DayClosingRecord, 'id' | 'closingNo' | 'createdAt'>) =>
    executePerformDayClosing(data, accountingBundle);

  // Master Data Operations
  const addBrand = (b: Omit<Brand, 'id'>) => executeAddBrand(b, masterDataBundle);
  const updateBrand = (id: string, data: Partial<Omit<Brand, 'id'>>) => executeUpdateBrand(id, data, masterDataBundle);
  const deleteBrand = (id: string) => executeDeleteBrand(id, masterDataBundle);

  const addProduct = (p: Omit<Product, 'id'>) => executeAddProduct(p, masterDataBundle);
  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>) => executeUpdateProduct(id, data, masterDataBundle);
  const deleteProduct = (id: string) => executeDeleteProduct(id, masterDataBundle);

  const addSupplier = (s: Omit<Supplier, 'id' | 'supplierCode'>) => executeAddSupplier(s, masterDataBundle);
  const updateSupplier = (id: string, data: Partial<Omit<Supplier, 'id' | 'supplierCode'>>) => executeUpdateSupplier(id, data, masterDataBundle);
  const deleteSupplier = (id: string) => executeDeleteSupplier(id, masterDataBundle);

  const addCustomer = (c: Omit<Customer, 'id' | 'customerCode'>) => executeAddCustomer(c, masterDataBundle);
  const updateCustomer = (id: string, data: Partial<Omit<Customer, 'id' | 'customerCode'>>) => executeUpdateCustomer(id, data, masterDataBundle);
  const deleteCustomer = (id: string) => executeDeleteCustomer(id, masterDataBundle);

  const addSalesman = (sm: Omit<Salesman, 'id' | 'employeeCode'>) => executeAddSalesman(sm, masterDataBundle);
  const updateSalesman = (id: string, data: Partial<Omit<Salesman, 'id' | 'employeeCode'>>) => executeUpdateSalesman(id, data, masterDataBundle);
  const deleteSalesman = (id: string) => executeDeleteSalesman(id, masterDataBundle);

  const addWarehouse = (wh: Omit<Warehouse, 'id' | 'code'>) => executeAddWarehouse(wh, masterDataBundle);
  const updateWarehouse = (id: string, data: Partial<Omit<Warehouse, 'id' | 'code'>>) => executeUpdateWarehouse(id, data, masterDataBundle);
  const deleteWarehouse = (id: string) => executeDeleteWarehouse(id, masterDataBundle);

  const transferStock = (data: {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    items: Array<{ productId: string; variantId: string; imeis: string[] }>;
    notes?: string;
  }) => executeTransferStock(data, masterDataBundle);

  const createSalesmanVisit = (visit: Omit<SalesmanVisit, 'id'>) => executeCreateSalesmanVisit(visit, masterDataBundle);
  const updateSalesmanVisit = (id: string, data: Partial<Omit<SalesmanVisit, 'id'>>) => executeUpdateSalesmanVisit(id, data, masterDataBundle);
  const deleteSalesmanVisit = (id: string) => executeDeleteSalesmanVisit(id, masterDataBundle);

  const addCustomerFollowUp = (fup: Omit<CustomerFollowUp, 'id' | 'updatedAt'>) => executeAddCustomerFollowUp(fup, masterDataBundle);
  const updateFollowUp = (id: string, data: Partial<Omit<CustomerFollowUp, 'id' | 'updatedAt'>>) => executeUpdateFollowUp(id, data, masterDataBundle);
  const deleteFollowUp = (id: string) => executeDeleteFollowUp(id, masterDataBundle);
  const updateFollowUpStatus = (id: string, status: CustomerFollowUp['status'], notes?: string, promisedDate?: string) =>
    executeUpdateFollowUpStatus(id, status, notes, promisedDate, masterDataBundle);

  const addWarrantyClaim = (claim: Omit<WarrantyClaim, 'id' | 'rmaNumber'>) => executeAddWarrantyClaim(claim, masterDataBundle);
  const updateWarrantyStatus = (id: string, status: WarrantyClaim['status'], updates?: Partial<WarrantyClaim>) =>
    executeUpdateWarrantyStatus(id, status, updates, masterDataBundle);

  const addBrandIncentiveScheme = (scheme: Omit<BrandIncentiveScheme, 'id'>) => executeAddBrandIncentiveScheme(scheme, masterDataBundle);
  const updateBrandIncentiveStatus = (id: string, status: BrandIncentiveScheme['claimStatus'], creditNoteNo?: string) =>
    executeUpdateBrandIncentiveStatus(id, status, creditNoteNo, masterDataBundle);

  const bulkImportData = (entityType: 'customers' | 'suppliers' | 'products' | 'imeis', rows: any[]) =>
    executeBulkImportData(entityType, rows, masterDataBundle);

  const sendSmsNotification = (sms: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => executeSendSmsNotification(sms, masterDataBundle);

  // System & RBAC Operations
  const createUser = (userData: Omit<AuthUser, 'id'>) => executeCreateUser(userData, systemBundle);
  const updateUser = (id: string, userData: Partial<AuthUser>) => executeUpdateUser(id, userData, systemBundle);
  const deleteUser = (id: string) => executeDeleteUser(id, systemBundle);
  const toggleUserStatus = (id: string) => executeToggleUserStatus(id, systemBundle);
  const resetUserPassword = (id: string, newPassword: string) => executeResetUserPassword(id, newPassword, systemBundle);

  const exportJSON = () => executeExportJSON(systemBundle);
  const importJSON = (jsonData: string) => executeImportJSON(jsonData, systemBundle);
  const createBackupSnapshot = (name?: string) => executeCreateBackupSnapshot(name, systemBundle);
  const restoreFromSnapshot = (snapshotId: string) => executeRestoreFromSnapshot(snapshotId, systemBundle);
  const deleteSnapshot = (snapshotId: string) => executeDeleteSnapshot(snapshotId, systemBundle);
  const purgeTransactionalData = () => executePurgeTransactionalData(systemBundle);
  const factoryResetFullWipe = () => executeFactoryResetFullWipe(systemBundle);

  return (
    <ERPContext.Provider
      value={{
        brands,
        products,
        imeis,
        warehouses,
        suppliers,
        customers,
        salesInvoices,
        purchaseInvoices,
        stockTransfers,
        customerReturns,
        salesmen,
        bankAccounts,
        cashTransactions,
        expenses,
        expenseCategories,
        chartOfAccounts,
        journalEntries,
        alerts,
        auditLogs,
        settings,
        currentUserRole,
        salesmanVisits,
        customerFollowUps,
        dayClosings,
        phoneExchanges,
        bankStatements,
        supplierReturns,
        warrantyClaims,
        brandIncentives,
        deliveryChallans,
        priceDropClaims,
        smsLogs,
        setCurrentUserRole,
        updateSettings,
        markAlertRead,
        clearAllAlerts,
        createPurchase,
        createSale,
        collectCustomerPayment,
        paySupplier,
        processCustomerReturn,
        processSupplierReturn,
        transferStock,
        createExpense,
        addBrand,
        addProduct,
        addSupplier,
        addCustomer,
        addSalesman,
        addWarehouse,
        reconcileBankTransaction,
        reconcileStatementEntry,
        updateBrand,
        deleteBrand,
        updateProduct,
        deleteProduct,
        updateSupplier,
        deleteSupplier,
        updateCustomer,
        deleteCustomer,
        updateSalesman,
        deleteSalesman,
        updateWarehouse,
        deleteWarehouse,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        updateExpense,
        deleteExpense,
        updateSaleInvoiceMeta,
        cancelSale,
        updatePurchaseInvoiceMeta,
        cancelPurchase,
        updateSalesmanVisit,
        deleteSalesmanVisit,
        updateFollowUp,
        deleteFollowUp,
        createSalesmanVisit,
        addCustomerFollowUp,
        updateFollowUpStatus,
        performDayClosing,
        processPhoneExchange,
        bulkImportData,
        addWarrantyClaim,
        updateWarrantyStatus,
        addBrandIncentiveScheme,
        updateBrandIncentiveStatus,
        createDeliveryChallan,
        updateDeliveryStatus,
        settleChallanCod,
        createPriceDropClaim,
        updatePriceDropStatus,
        sendSmsNotification,
        addBankStatementEntry,
        isOnline,
        pendingSyncCount,
        syncQueue,
        isSyncing,
        syncCloudData,
        triggerManualSync,
        resetToDemoData,
        exportJSON,
        importJSON,
        currentUser,
        isAuthenticated: !!currentUser,
        demoUsers,
        users,
        hasPermission,
        login,
        loginAsDemoUser,
        logout,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        backupSnapshots,
        createBackupSnapshot,
        restoreFromSnapshot,
        deleteSnapshot,
        purgeTransactionalData,
        factoryResetFullWipe
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
