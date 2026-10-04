import React, { createContext, useContext, useState, useEffect } from 'react';
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
  BackupSnapshot
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
import { generateDocNumber } from '../utils/formatters';
import { getSupabaseClient } from '../lib/supabase';
import {
  enqueueChange,
  processSyncQueue,
  getPendingSyncCount,
  getSyncQueue,
  SyncQueueItem
} from '../lib/syncEngine';

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

export interface CrudResult {
  success: boolean;
  error?: string;
}

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

  // Sync and hydrate all enterprise entities from Supabase Cloud on initialization
  useEffect(() => {
    const syncAllFromSupabase = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }
      const supabase = getSupabaseClient();
      if (!supabase) return;
      try {
        setIsSyncing(true);
        // Step 0: Transmit all offline changes to Supabase Cloud first!
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

        // 5. Sync Customers (Dealers)
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

        // 7. Sync Products & Variants
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
      }
    };

    syncAllFromSupabase();

    // Listen to network status transitions: auto-push all offline changes when online!
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
  }, []);

  const syncCloudData = async (): Promise<{ success: boolean; message: string }> => {
    return triggerManualSync();
  };

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
  ]);

  const addAudit = (action: string, module: string, referenceNo: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      user: currentUserRole === 'Super Admin' ? 'Super Admin (Aminul Islam)' : `${currentUserRole} User`,
      role: currentUserRole,
      action,
      module,
      referenceNo,
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

  // 1. PURCHASE ENGINE
  const createPurchase = (
    purchaseData: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'createdAt'>,
    imeisToRegister: Array<{ imei1: string; imei2?: string; serialNumber?: string; variantId: string; productId: string }>
  ) => {
    // Validate uniqueness of IMEIs against existing database
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

    // Register all IMEIs with supplier, cost, warehouse, and history
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

    // Update Product Variant current stocks
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        variants: p.variants.map(v => {
          const registeredCount = imeisToRegister.filter(i => i.variantId === v.id).length;
          return registeredCount > 0 ? { ...v, currentStock: v.currentStock + registeredCount } : v;
        })
      }))
    );

    // Update Supplier Due
    setSuppliers(prev =>
      prev.map(s =>
        s.id === purchaseData.supplierId
          ? { ...s, currentDue: s.currentDue + purchaseData.dueAmount }
          : s
      )
    );

    // If immediate cash or bank paid
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

    // Double-entry Journal Entry: Dr. Inventory, Cr. Accounts Payable (and Cr. Cash/Bank for paid amount)
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

    // Enqueue for offline-first cloud sync
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

  // 2. SALES ENGINE (Wholesale & Retail POS)
  const createSale = (saleData: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'createdAt'>) => {
    const customer = customers.find(c => c.id === saleData.customerId);
    
    // Credit Limit Verification:
    if (customer && customer.customerType !== 'Walk-in') {
      const projectedDue = customer.currentDue + saleData.dueAmount;
      if (customer.creditLimit > 0 && projectedDue > customer.creditLimit) {
        if (settings.creditLimitHardBlock && currentUserRole !== 'Super Admin' && currentUserRole !== 'Owner') {
          return {
            success: false,
            error: `Credit limit exceeded! Customer limit is ৳ ${customer.creditLimit.toLocaleString()}, current due is ৳ ${customer.currentDue.toLocaleString()}. Selling with ৳ ${saleData.dueAmount.toLocaleString()} due requires Super Admin / Owner approval.`
          };
        } else {
          // Add warning alert
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

    // Verify all selected IMEIs are In Stock
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

    // Calculate Salesman commission if salesman is assigned
    let commissionEarned = 0;
    if (saleData.salesmanId) {
      const sm = salesmen.find(s => s.id === saleData.salesmanId);
      if (sm) {
        if (sm.commissionType === 'Percentage of Sales') {
          commissionEarned = (saleData.grandTotal * sm.commissionRate) / 100;
        } else if (sm.commissionType === 'Percentage of Gross Profit') {
          const totalCost = saleData.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
          const grossProfit = Math.max(0, saleData.grandTotal - totalCost);
          commissionEarned = (grossProfit * sm.commissionRate) / 100;
        } else if (sm.commissionType === 'Fixed Per Unit') {
          const totalUnits = saleData.items.reduce((acc, item) => acc + item.quantity, 0);
          commissionEarned = totalUnits * sm.commissionRate;
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

    // Update IMEIs to 'Sold'
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

    // Update Product Stock
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        variants: p.variants.map(v => {
          const soldItem = saleData.items.find(item => item.variantId === v.id);
          return soldItem ? { ...v, currentStock: Math.max(0, v.currentStock - soldItem.quantity) } : v;
        })
      }))
    );

    // Update Customer Due
    if (customer && customer.customerType !== 'Walk-in') {
      setCustomers(prev =>
        prev.map(c =>
          c.id === saleData.customerId
            ? { ...c, currentDue: c.currentDue + saleData.dueAmount }
            : c
        )
      );
    }

    // Process immediate payments
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
              description: `Cash received for sale invoice ${invoiceNo} from ${saleData.customerName}`,
              performedBy: currentUserRole
            },
            ...prev
          ]);
        } else if (p.bankAccountId) {
          setBankAccounts(prev =>
            prev.map(b =>
              b.id === p.bankAccountId
                ? { ...b, currentBalance: b.currentBalance + p.amount }
                : b
            )
          );
        }
      }
    });

    // Update salesman stats
    if (saleData.salesmanId) {
      setSalesmen(prev =>
        prev.map(s =>
          s.id === saleData.salesmanId
            ? {
                ...s,
                currentMonthSales: s.currentMonthSales + saleData.grandTotal,
                currentMonthCollection: s.currentMonthCollection + saleData.paidAmount
              }
            : s
        )
      );
    }

    // Double-entry Journal Entry:
    // Dr. Accounts Receivable (for due amount)
    // Dr. Cash in Hand / Bank (for paid amount)
    // Cr. Sales Revenue (Wholesale / Retail)
    // Dr. COGS
    // Cr. Merchandise Inventory
    const totalCostOfSale = saleData.items.reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);
    const jvNo = generateDocNumber('JV', journalEntries.length);
    const revAccountCode = saleData.invoiceType === 'Wholesale' ? '4000' : '4010';
    const revAccountName = saleData.invoiceType === 'Wholesale' ? 'Wholesale Sales Revenue' : 'Retail POS Sales Revenue';

    const jvLines = [
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
      ...(saleData.paidAmount > 0
        ? [
            {
              accountCode: '1000',
              accountName: 'Cash in Hand (Main Vault & Till)',
              debit: saleData.paidAmount,
              credit: 0,
              memo: `Paid at invoice issue via ${saleData.payments.map(p => p.method).join(', ')}`
            }
          ]
        : []),
      {
        accountCode: revAccountCode,
        accountName: revAccountName,
        debit: 0,
        credit: saleData.grandTotal,
        memo: `Sale recognition ${invoiceNo}`
      },
      {
        accountCode: '5000',
        accountName: 'Cost of Goods Sold (COGS)',
        debit: totalCostOfSale,
        credit: 0,
        memo: `Cost of units sold on ${invoiceNo}`
      },
      {
        accountCode: '1050',
        accountName: 'Merchandise Inventory (Mobile Stock)',
        debit: 0,
        credit: totalCostOfSale,
        memo: `Inventory reduction for ${invoiceNo}`
      }
    ];

    const newJv: JournalEntry = {
      id: `jv-${Date.now()}`,
      voucherNo: jvNo,
      date: saleData.invoiceDate,
      voucherType: 'Sales Voucher',
      referenceNo: invoiceNo,
      description: `Sales revenue & COGS posting for invoice ${invoiceNo}`,
      lines: jvLines,
      totalDebit: saleData.grandTotal + totalCostOfSale,
      totalCredit: saleData.grandTotal + totalCostOfSale,
      createdBy: currentUserRole,
      createdAt: today
    };

    setSalesInvoices(prev => [newSaleInvoice, ...prev]);
    setJournalEntries(prev => [newJv, ...prev]);

    // Enqueue for offline-first cloud sync
    enqueueChange('sales_invoices', 'INSERT', newSaleInvoice.id, newSaleInvoice, `নতুন সেলস ইনভয়েস তৈরি #${invoiceNo}`);
    if (customer && customer.customerType !== 'Walk-in') {
      const updatedCust = { ...customer, currentDue: customer.currentDue + saleData.dueAmount };
      enqueueChange('customers', 'UPDATE', updatedCust.id, updatedCust, `কাস্টমার বকেয়া আপডেট (${updatedCust.shopName})`);
    }
    for (const imeiNum of requestedImeis) {
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
    }

    addAudit('Created Sales Invoice', 'Sales', invoiceNo, undefined, `Customer: ${saleData.customerName}, Total: ৳ ${saleData.grandTotal}, Paid: ৳ ${saleData.paidAmount}`);

    return { success: true, invoiceNo };
  };

  // 3. PAYMENT COLLECTION & ALLOCATION
  const collectCustomerPayment = (data: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    transactionRef?: string;
    collectorSalesmanId?: string;
    allocations: PaymentAllocationItem[];
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    const collectionNo = generateDocNumber('REC', 100);
    const today = new Date().toISOString().split('T')[0];

    // Adjust each allocated invoice's paid and due amounts
    setSalesInvoices(prev =>
      prev.map(inv => {
        const alloc = data.allocations.find(a => a.invoiceId === inv.id || a.invoiceNo === inv.invoiceNo);
        if (alloc && alloc.allocatedAmount > 0) {
          const newPaid = inv.paidAmount + alloc.allocatedAmount;
          const newDue = Math.max(0, inv.grandTotal - newPaid);
          return {
            ...inv,
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newDue === 0 ? 'Paid' : 'Partial'
          };
        }
        return inv;
      })
    );

    // Reduce Customer Due
    setCustomers(prev =>
      prev.map(c =>
        c.id === data.customerId
          ? { ...c, currentDue: Math.max(0, c.currentDue - data.amount) }
          : c
      )
    );

    // Update Cash or Bank
    if (data.paymentMethod === 'Cash') {
      setCashTransactions(prev => [
        {
          id: `cash-${Date.now()}`,
          date: `${today} 14:00`,
          type: 'Cash In',
          category: 'Due Collection',
          amount: data.amount,
          referenceNo: collectionNo,
          description: `Due collection from ${customer.shopName} (${data.notes || ''})`,
          performedBy: currentUserRole
        },
        ...prev
      ]);
    } else if (data.bankAccountId) {
      setBankAccounts(prev =>
        prev.map(b =>
          b.id === data.bankAccountId
            ? { ...b, currentBalance: b.currentBalance + data.amount }
            : b
        )
      );
    }

    // Double-entry Journal: Dr. Cash/Bank, Cr. Accounts Receivable
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

    // Enqueue for offline-first cloud sync
    const receiptRecord = {
      id: `rec-${Date.now()}`,
      receipt_no: collectionNo,
      date: today,
      customer_id: data.customerId,
      customer_name: customer.shopName,
      amount: data.amount,
      payment_method: data.paymentMethod,
      collector_salesman_id: data.collectorSalesmanId || null,
      notes: data.notes || ''
    };
    enqueueChange('money_receipts', 'INSERT', receiptRecord.id, receiptRecord, `বকেয়া কালেকশন রসিদ #${collectionNo}`);
    enqueueChange('customers', 'UPDATE', customer.id, {
      ...customer,
      currentDue: Math.max(0, customer.currentDue - data.amount)
    }, `কাস্টমার বকেয়া হ্রাস (${customer.shopName})`);

    addAudit('Collected Customer Due Payment', 'Payment', collectionNo, `Previous Due: ৳ ${customer.currentDue}`, `Collected: ৳ ${data.amount} via ${data.paymentMethod}`);

    return { success: true, collectionNo };
  };

  // 4. SUPPLIER PAYMENT
  const paySupplier = (data: {
    supplierId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    bankAccountId?: string;
    referenceNo: string;
    notes?: string;
  }) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    const payNo = generateDocNumber('PAY', 50);
    const today = new Date().toISOString().split('T')[0];

    // Decrement supplier due
    setSuppliers(prev =>
      prev.map(s =>
        s.id === data.supplierId
          ? { ...s, currentDue: Math.max(0, s.currentDue - data.amount) }
          : s
      )
    );

    // Record Cash or Bank
    if (data.paymentMethod === 'Cash') {
      setCashTransactions(prev => [
        {
          id: `cash-${Date.now()}`,
          date: `${today} 15:00`,
          type: 'Cash Out',
          category: 'Supplier Payment',
          amount: data.amount,
          referenceNo: payNo,
          description: `Payment to supplier ${supplier.name}`,
          performedBy: currentUserRole
        },
        ...prev
      ]);
    } else if (data.bankAccountId) {
      setBankAccounts(prev =>
        prev.map(b =>
          b.id === data.bankAccountId
            ? { ...b, currentBalance: b.currentBalance - data.amount }
            : b
        )
      );
    }

    // Double-entry Journal: Dr. Accounts Payable, Cr. Cash/Bank
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

  // 5. CUSTOMER RETURN & IMEI RESTOCKING
  const processCustomerReturn = (data: {
    originalInvoiceNo: string;
    customerId: string;
    imei: string;
    returnReason: string;
    condition: ReturnCondition;
    refundOrCreditAmount: number;
    restockWarehouseId: string;
  }) => {
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

    // Update IMEI record status and history
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

    // If restocked into sellable inventory, increase variant stock
    if (!isDamaged) {
      setProducts(prev =>
        prev.map(p =>
          p.id === imeiRecord.productId
            ? {
                ...p,
                variants: p.variants.map(v =>
                  v.id === imeiRecord.variantId ? { ...v, currentStock: v.currentStock + 1 } : v
                )
              }
            : p
        )
      );
    }

    // Credit customer balance (reduce due)
    setCustomers(prev =>
      prev.map(c =>
        c.id === data.customerId
          ? { ...c, currentDue: Math.max(0, c.currentDue - data.refundOrCreditAmount) }
          : c
      )
    );

    // Double-entry Journal:
    // Dr. Sales Returns & Allowances (contra-revenue)
    // Cr. Accounts Receivable
    // Dr. Inventory (at cost)
    // Cr. COGS (reversal)
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
    addAudit('Approved Customer Return', 'Returns', returnNo, undefined, `IMEI: ${data.imei}, Credit: ৳ ${data.refundOrCreditAmount}`);

    return { success: true, returnNo };
  };

  // 6. STOCK TRANSFER
  const transferStock = (data: {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    items: Array<{ productId: string; variantId: string; imeis: string[] }>;
    notes?: string;
  }) => {
    const src = warehouses.find(w => w.id === data.sourceWarehouseId);
    const dest = warehouses.find(w => w.id === data.destinationWarehouseId);
    if (!src || !dest) return { success: false, error: 'Invalid warehouse selection' };

    const transferNo = generateDocNumber('TRF', stockTransfers.length);
    const today = new Date().toISOString().split('T')[0];

    const allTransferImeis = data.items.flatMap(i => i.imeis);

    // Update each IMEI's current warehouse
    setImeis(prev =>
      prev.map(i => {
        if (allTransferImeis.includes(i.imei1)) {
          return {
            ...i,
            warehouseId: dest.id,
            warehouseName: dest.name,
            history: [
              ...i.history,
              {
                date: `${today} 14:00`,
                action: 'Stock Transferred',
                description: `Transferred from ${src.name} to ${dest.name} (${transferNo})`,
                user: currentUserRole,
                referenceNo: transferNo
              }
            ]
          };
        }
        return i;
      })
    );

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNo,
      sourceWarehouseId: src.id,
      sourceWarehouseName: src.name,
      destinationWarehouseId: dest.id,
      destinationWarehouseName: dest.name,
      transferDate: today,
      items: data.items.map(it => {
        const prod = products.find(p => p.id === it.productId);
        const variant = prod?.variants.find(v => v.id === it.variantId);
        return {
          productId: it.productId,
          productName: prod?.model || 'Product',
          variantId: it.variantId,
          variantDesc: variant ? `${variant.ram}/${variant.storage} - ${variant.color}` : '',
          quantity: it.imeis.length,
          imeis: it.imeis
        };
      }),
      totalQuantity: allTransferImeis.length,
      status: 'Received',
      dispatchedBy: currentUserRole,
      receivedBy: dest.managerName,
      notes: data.notes,
      createdAt: today
    };

    setStockTransfers(prev => [newTransfer, ...prev]);
    addAudit('Dispatched Stock Transfer', 'Stock Transfer', transferNo, undefined, `From: ${src.name} To: ${dest.name}, Units: ${allTransferImeis.length}`);

    return { success: true, transferNo };
  };

  // 7. EXPENSES
  const createExpense = (data: Omit<Expense, 'id' | 'expenseNo' | 'createdAt'>) => {
    const expenseNo = generateDocNumber('EXP', expenses.length);
    const today = new Date().toISOString().split('T')[0];

    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNo,
      createdAt: today
    };

    if (data.paymentMethod === 'Cash') {
      setCashTransactions(prev => [
        {
          id: `cash-${Date.now()}`,
          date: `${today} 12:00`,
          type: 'Cash Out',
          category: 'Expense',
          amount: data.amount,
          referenceNo: expenseNo,
          description: `${data.categoryName}: ${data.description}`,
          performedBy: currentUserRole
        },
        ...prev
      ]);
    } else if (data.bankAccountId) {
      setBankAccounts(prev =>
        prev.map(b =>
          b.id === data.bankAccountId ? { ...b, currentBalance: b.currentBalance - data.amount } : b
        )
      );
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
    addAudit('Recorded Business Expense', 'Expense', expenseNo, undefined, `Category: ${data.categoryName}, Amount: ৳ ${data.amount}`);

    return { success: true };
  };

  // 8. ENTITY CREATORS
  const addBrand = (b: Omit<Brand, 'id'>) => {
    const id = `brand-${Date.now()}`;
    const newBrand = { ...b, id };
    setBrands(prev => [...prev, newBrand]);
    enqueueChange('brands', 'INSERT', id, newBrand, `নতুন ব্র্যান্ড যুক্ত (${b.name})`);
    addAudit('Added Brand', 'Brand Master', b.code, undefined, b.name);
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const newProd = { ...p, id };
    setProducts(prev => [...prev, newProd]);
    enqueueChange('products', 'INSERT', id, newProd, `নতুন প্রোডাক্ট মডেল যুক্ত (${p.model})`);
    addAudit('Added Product Model', 'Product Master', p.model, undefined, `${p.brandName} - ${p.model}`);
  };

  const addSupplier = (s: Omit<Supplier, 'id' | 'supplierCode'>) => {
    const code = `SUP-${(suppliers.length + 1).toString().padStart(3, '0')}`;
    const newSup: Supplier = { ...s, id: `sup-${Date.now()}`, supplierCode: code };
    setSuppliers(prev => [...prev, newSup]);
    enqueueChange('suppliers', 'INSERT', newSup.id, newSup, `নতুন সাপ্লায়ার যুক্ত (${s.name})`);
    addAudit('Added Supplier', 'Supplier Master', code, undefined, s.name);
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'customerCode'>) => {
    const code = `CUST-${(customers.length + 1).toString().padStart(3, '0')}`;
    const newCust: Customer = { ...c, id: `cust-${Date.now()}`, customerCode: code };
    setCustomers(prev => [...prev, newCust]);
    enqueueChange('customers', 'INSERT', newCust.id, newCust, `নতুন কাস্টমার যুক্ত (${c.shopName})`);
    addAudit('Added Customer / Dealer', 'Customer Master', code, undefined, `${c.shopName} (${c.ownerName})`);
  };

  const addSalesman = (sm: Omit<Salesman, 'id' | 'employeeCode'>) => {
    const code = `EMP-SM-${(salesmen.length + 1).toString().padStart(2, '0')}`;
    const newSm: Salesman = { ...sm, id: `sm-${Date.now()}`, employeeCode: code };
    setSalesmen(prev => [...prev, newSm]);
    enqueueChange('salesmen', 'INSERT', newSm.id, newSm, `নতুন সেলসম্যান যুক্ত (${sm.name})`);
    addAudit('Added Salesman', 'Salesman Master', code, undefined, sm.name);
  };

  const addWarehouse = (wh: Omit<Warehouse, 'id' | 'code'>) => {
    const code = `WH-${wh.city.toUpperCase().substring(0, 3)}-${(warehouses.length + 1).toString().padStart(2, '0')}`;
    const newWh: Warehouse = { ...wh, id: `wh-${Date.now()}`, code };
    setWarehouses(prev => [...prev, newWh]);
    enqueueChange('warehouses', 'INSERT', newWh.id, newWh, `নতুন ওয়্যারহাউস যুক্ত (${wh.name})`);
    addAudit('Added Warehouse / Outlet', 'Warehouse Master', code, undefined, wh.name);
  };

  // ==========================================================
  // 8b. UPDATE / DELETE / VOID  (CRUD completion)
  // ==========================================================
  const todayStr = () => new Date().toISOString().split('T')[0];
  const fail = (error: string): CrudResult => ({ success: false, error });

  /** Posts mirror-image journal entries for every voucher tied to a document. */
  const reverseJournals = (referenceNo: string, label: string) => {
    const originals = journalEntries.filter(
      j => j.referenceNo === referenceNo && !j.description.startsWith('REVERSAL')
    );
    if (originals.length === 0) return;
    const today = todayStr();
    const reversals: JournalEntry[] = originals.map((j, idx) => ({
      ...j,
      id: `jv-rev-${Date.now()}-${idx}`,
      voucherNo: generateDocNumber('JV', journalEntries.length + idx),
      date: today,
      voucherType: 'Journal Voucher',
      description: `REVERSAL (${label}): ${j.description}`,
      lines: j.lines.map(l => ({ ...l, debit: l.credit, credit: l.debit, memo: `Reversal - ${l.memo}` })),
      createdBy: currentUserRole,
      createdAt: today
    }));
    setJournalEntries(prev => [...reversals, ...prev]);
  };

  const pushCash = (type: 'Cash In' | 'Cash Out', category: CashTransaction['category'], amount: number, referenceNo: string, description: string) => {
    setCashTransactions(prev => [
      {
        id: `cash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: `${todayStr()} 12:00`,
        type,
        category,
        amount,
        referenceNo,
        description,
        performedBy: currentUserRole
      },
      ...prev
    ]);
  };

  const adjustBank = (bankAccountId: string | undefined, delta: number) => {
    if (!bankAccountId) return;
    setBankAccounts(prev =>
      prev.map(b => (b.id === bankAccountId ? { ...b, currentBalance: b.currentBalance + delta } : b))
    );
  };

  // ---- Brands ----
  const updateBrand = (id: string, data: Partial<Omit<Brand, 'id'>>): CrudResult => {
    const old = brands.find(b => b.id === id);
    if (!old) return fail('Brand not found.');
    if (data.code && brands.some(b => b.id !== id && b.code.toLowerCase() === data.code!.toLowerCase())) {
      return fail(`Brand code ${data.code} is already used by another brand.`);
    }
    setBrands(prev => prev.map(b => (b.id === id ? { ...b, ...data } : b)));
    if (data.name && data.name !== old.name) {
      setProducts(prev => prev.map(p => (p.brandId === id ? { ...p, brandName: data.name! } : p)));
      setImeis(prev => prev.map(i => (i.brandName === old.name ? { ...i, brandName: data.name! } : i)));
    }
    enqueueChange('brands', 'UPDATE', id, { ...old, ...data }, `ব্র্যান্ড আপডেট (${data.name || old.name})`);
    addAudit('Updated Brand', 'Brand Master', old.code, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteBrand = (id: string): CrudResult => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return fail('Brand not found.');
    const used = products.filter(p => p.brandId === id).length;
    if (used > 0) return fail(`Cannot delete: ${used} product model(s) belong to ${brand.name}. Delete or reassign them first, or mark the brand Inactive.`);
    setBrands(prev => prev.filter(b => b.id !== id));
    enqueueChange('brands', 'DELETE', id, null, `ব্র্যান্ড মুছে ফেলা (${brand.name})`);
    addAudit('Deleted Brand', 'Brand Master', brand.code, brand.name);
    return { success: true };
  };

  // ---- Products ----
  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>): CrudResult => {
    const old = products.find(p => p.id === id);
    if (!old) return fail('Product not found.');
    let variants = old.variants;
    if (data.variants) {
      const removed = old.variants.filter(ov => !data.variants!.some(nv => nv.id === ov.id));
      for (const rv of removed) {
        if (imeis.some(i => i.variantId === rv.id)) {
          return fail(`Cannot remove variant ${rv.sku}: IMEI records exist for it.`);
        }
      }
      // Stock is system-controlled (purchases/sales) - never overwritten by an edit form.
      variants = data.variants.map(nv => {
        const ov = old.variants.find(v => v.id === nv.id);
        return { ...nv, currentStock: ov ? ov.currentStock : nv.currentStock };
      });
    }
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...data, variants } : p)));
    if (data.model && data.model !== old.model) {
      setImeis(prev => prev.map(i => (i.productId === id ? { ...i, productName: data.model! } : i)));
    }
    enqueueChange('products', 'UPDATE', id, { ...old, ...data, variants }, `প্রোডাক্ট মডেল আপডেট (${data.model || old.model})`);
    addAudit('Updated Product Model', 'Product Master', old.model, old.model, data.model || old.model);
    return { success: true };
  };

  const deleteProduct = (id: string): CrudResult => {
    const prod = products.find(p => p.id === id);
    if (!prod) return fail('Product not found.');
    const used = imeis.filter(i => i.productId === id).length;
    if (used > 0) return fail(`Cannot delete: ${used} IMEI record(s) exist for ${prod.model}. Mark it Discontinued instead.`);
    setProducts(prev => prev.filter(p => p.id !== id));
    enqueueChange('products', 'DELETE', id, null, `প্রোডাক্ট ডিলিট (${prod.model})`);
    addAudit('Deleted Product Model', 'Product Master', prod.model, `${prod.brandName} - ${prod.model}`);
    return { success: true };
  };

  // ---- Suppliers ----
  const updateSupplier = (id: string, data: Partial<Omit<Supplier, 'id' | 'supplierCode'>>): CrudResult => {
    const old = suppliers.find(s => s.id === id);
    if (!old) return fail('Supplier not found.');
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    if (data.name && data.name !== old.name) {
      setImeis(prev => prev.map(i => (i.supplierId === id ? { ...i, supplierName: data.name! } : i)));
      setPurchaseInvoices(prev => prev.map(p => (p.supplierId === id ? { ...p, supplierName: data.name! } : p)));
    }
    enqueueChange('suppliers', 'UPDATE', id, { ...old, ...data }, `সাপ্লায়ার তথ্য আপডেট (${data.name || old.name})`);
    addAudit('Updated Supplier', 'Supplier Master', old.supplierCode, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteSupplier = (id: string): CrudResult => {
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return fail('Supplier not found.');
    if (purchaseInvoices.some(p => p.supplierId === id)) return fail('Cannot delete: purchase invoices exist for this supplier. Mark it Inactive instead.');
    if (sup.currentDue > 0) return fail(`Cannot delete: outstanding payable of ৳ ${sup.currentDue.toLocaleString()}.`);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    enqueueChange('suppliers', 'DELETE', id, null, `সাপ্লায়ার ডিলিট (${sup.name})`);
    addAudit('Deleted Supplier', 'Supplier Master', sup.supplierCode, sup.name);
    return { success: true };
  };

  // ---- Customers ----
  const updateCustomer = (id: string, data: Partial<Omit<Customer, 'id' | 'customerCode'>>): CrudResult => {
    const old = customers.find(c => c.id === id);
    if (!old) return fail('Customer not found.');
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
    enqueueChange('customers', 'UPDATE', id, { ...old, ...data }, `কাস্টমার তথ্য আপডেট (${data.shopName || old.shopName})`);
    addAudit('Updated Customer / Dealer', 'Customer Master', old.customerCode, old.shopName, data.shopName || old.shopName);
    return { success: true };
  };

  const deleteCustomer = (id: string): CrudResult => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return fail('Customer not found.');
    if (salesInvoices.some(s => s.customerId === id)) return fail('Cannot delete: sales invoices exist for this customer. Mark it Suspended/Blocked instead.');
    if (cust.currentDue > 0) return fail(`Cannot delete: outstanding due of ৳ ${cust.currentDue.toLocaleString()}.`);
    setCustomers(prev => prev.filter(c => c.id !== id));
    setCustomerFollowUps(prev => prev.filter(f => f.customerId !== id));
    enqueueChange('customers', 'DELETE', id, null, `কাস্টমার ডিলিট (${cust.shopName})`);
    addAudit('Deleted Customer / Dealer', 'Customer Master', cust.customerCode, cust.shopName);
    return { success: true };
  };

  // ---- Salesmen ----
  const updateSalesman = (id: string, data: Partial<Omit<Salesman, 'id' | 'employeeCode'>>): CrudResult => {
    const old = salesmen.find(s => s.id === id);
    if (!old) return fail('Salesman not found.');
    setSalesmen(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    if (data.name && data.name !== old.name) {
      setCustomers(prev => prev.map(c => (c.salesmanId === id ? { ...c, salesmanName: data.name! } : c)));
    }
    enqueueChange('salesmen', 'UPDATE', id, { ...old, ...data }, `সেলসম্যান তথ্য আপডেট (${data.name || old.name})`);
    addAudit('Updated Salesman', 'Salesman Master', old.employeeCode, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteSalesman = (id: string): CrudResult => {
    const sm = salesmen.find(s => s.id === id);
    if (!sm) return fail('Salesman not found.');
    if (salesInvoices.some(s => s.salesmanId === id)) return fail('Cannot delete: sales invoices are attributed to this salesman. Mark them Inactive instead.');
    setSalesmen(prev => prev.filter(s => s.id !== id));
    setCustomers(prev => prev.map(c => (c.salesmanId === id ? { ...c, salesmanId: undefined, salesmanName: undefined } : c)));
    enqueueChange('salesmen', 'DELETE', id, null, `সেলসম্যান ডিলিট (${sm.name})`);
    addAudit('Deleted Salesman', 'Salesman Master', sm.employeeCode, sm.name);
    return { success: true };
  };

  // ---- Warehouses ----
  const updateWarehouse = (id: string, data: Partial<Omit<Warehouse, 'id' | 'code'>>): CrudResult => {
    const old = warehouses.find(w => w.id === id);
    if (!old) return fail('Warehouse not found.');
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
    if (data.name && data.name !== old.name) {
      setImeis(prev => prev.map(i => (i.warehouseId === id ? { ...i, warehouseName: data.name! } : i)));
    }
    enqueueChange('warehouses', 'UPDATE', id, { ...old, ...data }, `ওয়্যারহাউস তথ্য আপডেট (${data.name || old.name})`);
    addAudit('Updated Warehouse / Outlet', 'Warehouse Master', old.code, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteWarehouse = (id: string): CrudResult => {
    const wh = warehouses.find(w => w.id === id);
    if (!wh) return fail('Warehouse not found.');
    const inUse =
      imeis.some(i => i.warehouseId === id) ||
      purchaseInvoices.some(p => p.warehouseId === id) ||
      salesInvoices.some(s => s.warehouseId === id) ||
      stockTransfers.some(t => t.sourceWarehouseId === id || t.destinationWarehouseId === id);
    if (inUse) return fail('Cannot delete: stock or documents reference this location. Mark it Inactive instead.');
    setWarehouses(prev => prev.filter(w => w.id !== id));
    enqueueChange('warehouses', 'DELETE', id, null, `ওয়্যারহাউস মুছে ফেলা (${wh.name})`);
    addAudit('Deleted Warehouse / Outlet', 'Warehouse Master', wh.code, wh.name);
    return { success: true };
  };

  // ---- Bank accounts ----
  const addBankAccount = (data: Omit<BankAccount, 'id' | 'currentBalance'>): CrudResult => {
    const acc: BankAccount = { ...data, id: `bank-${Date.now()}`, currentBalance: data.openingBalance };
    setBankAccounts(prev => [...prev, acc]);
    addAudit('Added Bank Account', 'Banking', data.accountNumber, undefined, `${data.bankName} - ${data.accountName}`);
    return { success: true };
  };

  const updateBankAccount = (id: string, data: Partial<Pick<BankAccount, 'bankName' | 'branch' | 'accountName' | 'accountNumber' | 'accountType' | 'status'>>): CrudResult => {
    const old = bankAccounts.find(b => b.id === id);
    if (!old) return fail('Bank account not found.');
    setBankAccounts(prev => prev.map(b => (b.id === id ? { ...b, ...data } : b)));
    addAudit('Updated Bank Account', 'Banking', old.accountNumber, old.bankName, data.bankName || old.bankName);
    return { success: true };
  };

  const deleteBankAccount = (id: string): CrudResult => {
    const acc = bankAccounts.find(b => b.id === id);
    if (!acc) return fail('Bank account not found.');
    const used =
      expenses.some(e => e.bankAccountId === id) ||
      purchaseInvoices.some(p => p.bankAccountId === id) ||
      salesInvoices.some(s => s.payments.some(p => p.bankAccountId === id));
    if (used) return fail('Cannot delete: transactions reference this account. Mark it Inactive instead.');
    if (acc.currentBalance !== 0) return fail(`Cannot delete: account holds a balance of ৳ ${acc.currentBalance.toLocaleString()}.`);
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    addAudit('Deleted Bank Account', 'Banking', acc.accountNumber, acc.bankName);
    return { success: true };
  };

  // ---- Expense categories ----
  const addExpenseCategory = (data: Omit<ExpenseCategory, 'id'>): CrudResult => {
    if (expenseCategories.some(c => c.name.toLowerCase() === data.name.trim().toLowerCase())) return fail('A category with this name already exists.');
    setExpenseCategories(prev => [...prev, { ...data, name: data.name.trim(), id: `expcat-${Date.now()}` }]);
    addAudit('Added Expense Category', 'Expense', data.name, undefined, data.name);
    return { success: true };
  };

  const updateExpenseCategory = (id: string, data: Partial<Omit<ExpenseCategory, 'id'>>): CrudResult => {
    const old = expenseCategories.find(c => c.id === id);
    if (!old) return fail('Category not found.');
    setExpenseCategories(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
    if (data.name && data.name !== old.name) {
      setExpenses(prev => prev.map(e => (e.categoryId === id ? { ...e, categoryName: data.name! } : e)));
    }
    addAudit('Updated Expense Category', 'Expense', old.name, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteExpenseCategory = (id: string): CrudResult => {
    const cat = expenseCategories.find(c => c.id === id);
    if (!cat) return fail('Category not found.');
    if (expenses.some(e => e.categoryId === id)) return fail('Cannot delete: expenses are recorded under this category.');
    setExpenseCategories(prev => prev.filter(c => c.id !== id));
    addAudit('Deleted Expense Category', 'Expense', cat.name, cat.name);
    return { success: true };
  };

  // ---- Chart of accounts ----
  const addAccount = (data: AccountCOA): CrudResult => {
    if (chartOfAccounts.some(a => a.code === data.code)) return fail(`Account code ${data.code} already exists.`);
    setChartOfAccounts(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)));
    addAudit('Added Ledger Account', 'Accounting', data.code, undefined, data.name);
    return { success: true };
  };

  const updateAccount = (code: string, data: Partial<Omit<AccountCOA, 'code' | 'balance'>>): CrudResult => {
    const old = chartOfAccounts.find(a => a.code === code);
    if (!old) return fail('Account not found.');
    setChartOfAccounts(prev => prev.map(a => (a.code === code ? { ...a, ...data } : a)));
    addAudit('Updated Ledger Account', 'Accounting', code, old.name, data.name || old.name);
    return { success: true };
  };

  const deleteAccount = (code: string): CrudResult => {
    const acc = chartOfAccounts.find(a => a.code === code);
    if (!acc) return fail('Account not found.');
    if (journalEntries.some(j => j.lines.some(l => l.accountCode === code))) return fail('Cannot delete: journal entries have posted to this account.');
    setChartOfAccounts(prev => prev.filter(a => a.code !== code));
    addAudit('Deleted Ledger Account', 'Accounting', code, acc.name);
    return { success: true };
  };

  // ---- Expenses ----
  const updateExpense = (id: string, data: Partial<Pick<Expense, 'date' | 'categoryId' | 'categoryName' | 'description' | 'recipientName' | 'voucherRef' | 'approvedBy'>>): CrudResult => {
    const old = expenses.find(e => e.id === id);
    if (!old) return fail('Expense not found.');
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
    addAudit('Updated Expense', 'Expense', old.expenseNo, old.description, data.description || old.description);
    return { success: true };
  };

  const deleteExpense = (id: string): CrudResult => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return fail('Expense not found.');
    if (exp.paymentMethod === 'Cash') {
      pushCash('Cash In', 'Expense', exp.amount, exp.expenseNo, `Reversal of deleted expense ${exp.expenseNo}`);
    } else {
      adjustBank(exp.bankAccountId, exp.amount);
    }
    reverseJournals(exp.expenseNo, `Deleted expense ${exp.expenseNo}`);
    setExpenses(prev => prev.filter(e => e.id !== id));
    addAudit('Deleted Expense', 'Expense', exp.expenseNo, `${exp.categoryName}: ৳ ${exp.amount}`);
    return { success: true };
  };

  // ---- Sales invoices ----
  const updateSaleInvoiceMeta = (id: string, data: Partial<Pick<SalesInvoice, 'notes' | 'dueDate'>>): CrudResult => {
    const inv = salesInvoices.find(s => s.id === id);
    if (!inv) return fail('Invoice not found.');
    if (inv.status === 'Cancelled') return fail('Cancelled invoices cannot be edited.');
    setSalesInvoices(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    addAudit('Edited Sales Invoice Details', 'Sales', inv.invoiceNo, undefined, JSON.stringify(data));
    return { success: true };
  };

  /** Voids a sale and reverses stock, IMEIs, dues, cash/bank and ledger postings. */
  const cancelSale = (id: string, reason?: string): CrudResult => {
    const inv = salesInvoices.find(s => s.id === id);
    if (!inv) return fail('Invoice not found.');
    if (inv.status === 'Cancelled') return fail('This invoice is already cancelled.');
    if (inv.status === 'Returned') return fail('This invoice has been returned and cannot be cancelled.');
    if (customerReturns.some(r => r.originalInvoiceNo === inv.invoiceNo)) {
      return fail('Cannot cancel: customer returns exist against this invoice.');
    }
    const originalPaid = inv.payments.reduce((a, p) => a + p.amount, 0);
    if (inv.paidAmount > originalPaid + 0.01) {
      return fail('Cannot cancel: later due collections were applied to this invoice. Handle via customer return / refund instead.');
    }
    const imeiNums = inv.items.flatMap(i => i.imeiList);
    for (const num of imeiNums) {
      const rec = imeis.find(i => i.imei1 === num);
      if (!rec || rec.status !== 'Sold' || rec.salesInvoiceNo !== inv.invoiceNo) {
        return fail(`Cannot cancel: IMEI ${num} is no longer in 'Sold' state for this invoice.`);
      }
    }

    const today = todayStr();
    setImeis(prev =>
      prev.map(i =>
        imeiNums.includes(i.imei1)
          ? {
              ...i,
              status: 'In Stock',
              customerId: undefined,
              customerName: undefined,
              salesInvoiceNo: undefined,
              salesDate: undefined,
              salesPrice: undefined,
              warrantyExpiry: undefined,
              history: [
                ...i.history,
                {
                  date: `${today} 12:00`,
                  action: 'Sale Cancelled',
                  description: `Invoice ${inv.invoiceNo} cancelled${reason ? ` (${reason})` : ''}; unit returned to stock`,
                  user: currentUserRole,
                  referenceNo: inv.invoiceNo
                }
              ]
            }
          : i
      )
    );
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
    if (customer && customer.customerType !== 'Walk-in') {
      setCustomers(prev =>
        prev.map(c => (c.id === inv.customerId ? { ...c, currentDue: Math.max(0, c.currentDue - inv.dueAmount) } : c))
      );
    }
    inv.payments.forEach(p => {
      if (p.amount <= 0) return;
      if (p.method === 'Cash') {
        pushCash('Cash Out', 'Customer Sale', p.amount, inv.invoiceNo, `Refund/reversal for cancelled invoice ${inv.invoiceNo}`);
      } else {
        adjustBank(p.bankAccountId, -p.amount);
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
    reverseJournals(inv.invoiceNo, `Cancelled sale ${inv.invoiceNo}`);
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

  // ---- Purchase invoices ----
  const updatePurchaseInvoiceMeta = (id: string, data: Partial<Pick<PurchaseInvoice, 'notes' | 'dueDate' | 'referenceNo'>>): CrudResult => {
    const pur = purchaseInvoices.find(p => p.id === id);
    if (!pur) return fail('Purchase not found.');
    if (pur.status === 'Cancelled') return fail('Cancelled purchases cannot be edited.');
    setPurchaseInvoices(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    addAudit('Edited Purchase Details', 'Purchase', pur.invoiceNo, undefined, JSON.stringify(data));
    return { success: true };
  };

  /** Voids a purchase: removes received IMEIs, stock, supplier payable, cash/bank and ledger postings. */
  const cancelPurchase = (id: string, reason?: string): CrudResult => {
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
    if (pur.paidAmount > 0) {
      if (pur.paymentMethod === 'Cash') {
        pushCash('Cash In', 'Supplier Payment', pur.paidAmount, pur.invoiceNo, `Refund/reversal for cancelled purchase ${pur.invoiceNo}`);
      } else {
        adjustBank(pur.bankAccountId, pur.paidAmount);
      }
    }
    reverseJournals(pur.invoiceNo, `Cancelled purchase ${pur.invoiceNo}`);
    const today = todayStr();
    setPurchaseInvoices(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: 'Cancelled', notes: `${p.notes ? p.notes + ' | ' : ''}CANCELLED ${today}${reason ? ': ' + reason : ''}` }
          : p
      )
    );
    addAudit('Cancelled Purchase Invoice', 'Purchase', pur.invoiceNo, `Total ৳ ${pur.grandTotal}`, reason || 'Cancelled');
    return { success: true };
  };

  // ---- Field visits & follow-ups ----
  const updateSalesmanVisit = (id: string, data: Partial<Omit<SalesmanVisit, 'id'>>): CrudResult => {
    const old = salesmanVisits.find(v => v.id === id);
    if (!old) return fail('Visit not found.');
    setSalesmanVisits(prev => prev.map(v => (v.id === id ? { ...v, ...data } : v)));
    addAudit('Updated Field Visit', 'Field Visits', id, undefined, data.outcomeNotes || old.outcomeNotes);
    return { success: true };
  };

  const deleteSalesmanVisit = (id: string): CrudResult => {
    const old = salesmanVisits.find(v => v.id === id);
    if (!old) return fail('Visit not found.');
    setSalesmanVisits(prev => prev.filter(v => v.id !== id));
    addAudit('Deleted Field Visit', 'Field Visits', id, `${old.salesmanName} -> ${old.shopName}`);
    return { success: true };
  };

  const updateFollowUp = (id: string, data: Partial<Omit<CustomerFollowUp, 'id' | 'updatedAt'>>): CrudResult => {
    const old = customerFollowUps.find(f => f.id === id);
    if (!old) return fail('Follow-up not found.');
    const stamp = new Date().toISOString().replace('T', ' ').substr(0, 16);
    setCustomerFollowUps(prev => prev.map(f => (f.id === id ? { ...f, ...data, updatedAt: stamp } : f)));
    addAudit('Edited Follow-up', 'Customer Follow-up', id, undefined, old.shopName);
    return { success: true };
  };

  const deleteFollowUp = (id: string): CrudResult => {
    const old = customerFollowUps.find(f => f.id === id);
    if (!old) return fail('Follow-up not found.');
    setCustomerFollowUps(prev => prev.filter(f => f.id !== id));
    addAudit('Deleted Follow-up', 'Customer Follow-up', id, old.shopName);
    return { success: true };
  };

  const reconcileBankTransaction = (bankAccountId: string, txnId: string) => {
    addAudit('Reconciled Bank Transaction', 'Banking', txnId, 'Unreconciled', 'Reconciled');
  };

  const reconcileStatementEntry = (id: string, status: BankStatementEntry['status'], matchedSystemTxnId?: string) => {
    setBankStatements(prev =>
      prev.map(s => s.id === id ? { ...s, status, matchedSystemTxnId } : s)
    );
    addAudit('Reconciled Bank Statement Entry', 'Bank Reconciliation', id, undefined, `Status: ${status}`);
  };

  // 9. NEW ADVANCED MODULES

  // Salesman Field Visits
  const createSalesmanVisit = (visitData: Omit<SalesmanVisit, 'id'>) => {
    const newVisit: SalesmanVisit = {
      ...visitData,
      id: `visit-${Date.now()}`
    };
    setSalesmanVisits(prev => [newVisit, ...prev]);
    addAudit('Logged Field Sales Visit', 'Field Visits', newVisit.id, undefined, `${visitData.salesmanName} -> ${visitData.shopName}`);
    return { success: true };
  };

  // Customer Follow-ups
  const addCustomerFollowUp = (fupData: Omit<CustomerFollowUp, 'id' | 'updatedAt'>) => {
    const newFup: CustomerFollowUp = {
      ...fupData,
      id: `fup-${Date.now()}`,
      updatedAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };
    setCustomerFollowUps(prev => [newFup, ...prev]);
    addAudit('Scheduled Customer Follow-up', 'Customer Follow-up', newFup.id, undefined, `${fupData.shopName} (${fupData.purpose})`);
  };

  const updateFollowUpStatus = (id: string, status: CustomerFollowUp['status'], notes?: string, promisedDate?: string) => {
    setCustomerFollowUps(prev =>
      prev.map(f => f.id === id ? {
        ...f,
        status,
        notes: notes ? `${f.notes} | Update: ${notes}` : f.notes,
        promisedDate: promisedDate || f.promisedDate,
        updatedAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
      } : f)
    );
    addAudit('Updated Follow-up Status', 'Customer Follow-up', id, undefined, status);
  };

  // Day Closing / Shift Handover
  const performDayClosing = (data: Omit<DayClosingRecord, 'id' | 'closingNo' | 'createdAt'>) => {
    const closingNo = `DAY-CLOSE-${data.date}`;
    const newClosing: DayClosingRecord = {
      ...data,
      id: `close-${Date.now()}`,
      closingNo,
      createdAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    };
    setDayClosings(prev => [newClosing, ...prev]);
    addAudit('Performed End-of-Day Closing', 'Day Closing', closingNo, undefined, `Expected: ৳ ${data.expectedClosingCash}, Actual: ৳ ${data.actualPhysicalCash}, Status: ${data.status}`);
    return { success: true, closingNo };
  };

  // Old Phone Trade-in / Exchange
  const processPhoneExchange = (data: Omit<PhoneExchangeTransaction, 'id' | 'exchangeNo' | 'createdAt'>) => {
    const exchangeNo = generateDocNumber('EXCH' as any, phoneExchanges.length);
    const today = new Date().toISOString().split('T')[0];

    // Find the new phone IMEI to verify
    const newImeiRecord = imeis.find(i => i.imei1 === data.newIMEI);
    if (!newImeiRecord || newImeiRecord.status !== 'In Stock') {
      return { success: false, error: 'New handset selected for exchange is not available in stock!' };
    }

    // Mark new phone as sold
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

    // Register old phone as a refurbished/used IMEI in stock
    const oldImeiEntry: IMEIRecord = {
      id: `imei-used-${Date.now()}`,
      imei1: data.oldIMEI,
      productId: 'prod-exchange',
      productName: `${data.oldBrand} ${data.oldModel} (Pre-owned)`,
      variantId: 'var-used',
      variantDesc: `Pre-owned / Trade-in (${data.oldCondition})`,
      brandName: data.oldBrand,
      purchaseCost: data.assessedValue,
      supplierId: 'sup-tradein',
      supplierName: `Trade-in from ${data.customerName}`,
      purchaseInvoiceNo: exchangeNo,
      purchaseDate: today,
      warehouseId: 'wh-1',
      warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
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

    // Update customer due if dueAmount > 0
    if (data.dueAmount > 0) {
      setCustomers(prev =>
        prev.map(c => c.id === data.customerId ? { ...c, currentDue: c.currentDue + data.dueAmount } : c)
      );
    }

    // Post Double-Entry Journal:
    // Dr. Inventory (Pre-owned stock) assessedValue
    // Dr. Cash/Bank/AR amountPaidNow + dueAmount
    // Cr. Sales Revenue newPhonePrice
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
    addAudit('Processed Handset Trade-in Exchange', 'Exchange', exchangeNo, undefined, `Old: ${data.oldModel} (৳ ${data.assessedValue}) -> New: ${data.newProductName}`);

    return { success: true, exchangeNo };
  };

  // Supplier Return
  const processSupplierReturn = (data: {
    supplierId: string;
    purchaseInvoiceNo?: string;
    imei: string;
    returnReason: string;
    amount: number;
  }) => {
    const imeiRecord = imeis.find(i => i.imei1 === data.imei);
    const sup = suppliers.find(s => s.id === data.supplierId);
    if (!sup) return { success: false, error: 'Supplier not found' };

    const returnNo = generateDocNumber('RET', supplierReturns.length + 50);
    const today = new Date().toISOString().split('T')[0];

    // Update IMEI status
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

    // Reduce Supplier Payable
    setSuppliers(prev =>
      prev.map(s => s.id === data.supplierId ? { ...s, currentDue: Math.max(0, s.currentDue - data.amount) } : s)
    );

    // Double-entry Journal: Dr. Accounts Payable, Cr. Merchandise Inventory
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
    addAudit('Returned Stock to Supplier', 'Supplier Return', returnNo, undefined, `Supplier: ${sup.name}, IMEI: ${data.imei}, Value: ৳ ${data.amount}`);

    return { success: true, returnNo };
  };

  // Bulk Data Import
  const bulkImportData = (entityType: 'customers' | 'suppliers' | 'products' | 'imeis', rows: any[]) => {
    let count = 0;
    if (entityType === 'customers') {
      const newCusts: Customer[] = rows.map((r, idx) => ({
        id: `cust-imp-${Date.now()}-${idx}`,
        customerCode: `CUST-${(customers.length + idx + 1).toString().padStart(3, '0')}`,
        shopName: r.shopName || 'Imported Dealer',
        ownerName: r.ownerName || '',
        mobile: r.mobile || '01700-000000',
        address: r.address || '',
        area: r.area || 'Dhaka',
        district: r.district || 'Dhaka',
        creditLimit: parseFloat(r.creditLimit) || 200000,
        allowedDueDays: parseInt(r.allowedDueDays) || 15,
        customerType: 'Wholesale Dealer',
        openingBalance: parseFloat(r.openingBalance) || 0,
        currentDue: parseFloat(r.openingBalance) || 0,
        status: 'Active'
      }));
      setCustomers(prev => [...prev, ...newCusts]);
      count = newCusts.length;
    } else if (entityType === 'suppliers') {
      const newSups: Supplier[] = rows.map((r, idx) => ({
        id: `sup-imp-${Date.now()}-${idx}`,
        supplierCode: `SUP-${(suppliers.length + idx + 1).toString().padStart(3, '0')}`,
        name: r.name || 'Imported Supplier',
        companyName: r.companyName || '',
        contactPerson: r.contactPerson || '',
        mobile: r.mobile || '',
        email: r.email || '',
        address: r.address || '',
        district: r.district || 'Dhaka',
        taxVatNumber: r.taxVatNumber || '',
        tradeLicense: r.tradeLicense || '',
        openingBalance: parseFloat(r.openingBalance) || 0,
        creditLimit: parseFloat(r.creditLimit) || 10000000,
        paymentTermsDays: parseInt(r.paymentTermsDays) || 15,
        currentDue: parseFloat(r.openingBalance) || 0,
        bankInfo: r.bankInfo || '',
        status: 'Active'
      }));
      setSuppliers(prev => [...prev, ...newSups]);
      count = newSups.length;
    } else if (entityType === 'products') {
      const newProds: Product[] = rows.map((r, idx) => ({
        id: `prod-imp-${Date.now()}-${idx}`,
        brandId: brands[0]?.id || 'brand-1',
        brandName: r.brandName || brands[0]?.name || 'Samsung',
        model: r.model || 'Imported Handset',
        category: 'Smartphone',
        networkRegion: 'Official BD / BTRC Approved',
        warrantyPeriodMonths: 12,
        description: r.description || 'Imported product catalog',
        variants: [
          {
            id: `var-imp-${Date.now()}-${idx}`,
            sku: r.sku || `SKU-IMP-${idx}`,
            ram: r.ram || '8GB',
            storage: r.storage || '128GB',
            color: r.color || 'Black',
            purchasePrice: parseFloat(r.purchasePrice) || 20000,
            dealerPrice: parseFloat(r.dealerPrice) || 23000,
            wholesalePrice: parseFloat(r.dealerPrice) || 23000,
            retailPrice: parseFloat(r.retailPrice) || 25000,
            minSellingPrice: parseFloat(r.dealerPrice) || 22000,
            maxDiscount: 1000,
            reorderLevel: 5,
            currentStock: 0
          }
        ],
        status: 'Active'
      }));
      setProducts(prev => [...prev, ...newProds]);
      count = newProds.length;
    } else if (entityType === 'imeis') {
      const firstProd = products[0];
      const firstWh = warehouses[0];
      const firstSup = suppliers[0];
      const newImeis: IMEIRecord[] = rows.map((r, idx) => {
        const prod = products.find(p => p.model.toLowerCase() === (r.model || '').toLowerCase()) || firstProd;
        const brand = r.brandName || prod?.brandName || 'Brand';
        const model = r.model || prod?.model || 'Imported Phone';
        const ram = r.ram || prod?.variants[0]?.ram || '8GB';
        const storage = r.storage || prod?.variants[0]?.storage || '128GB';
        const color = r.color || prod?.variants[0]?.color || 'Black';
        return {
          id: `imei-imp-${Date.now()}-${idx}`,
          imei1: (r.imei1 || `8600000000${idx}`).trim(),
          imei2: (r.imei2 || '').trim(),
          serialNumber: r.serialNumber || `SN-${idx}`,
          productId: prod?.id || 'prod-1',
          productName: model,
          variantId: prod?.variants[0]?.id || 'var-1',
          variantDesc: `${ram}/${storage} - ${color}`,
          brandName: brand,
          purchaseCost: parseFloat(r.purchaseCost) || 20000,
          purchaseInvoiceNo: `IMP-INV-${Date.now()}`,
          purchaseDate: new Date().toISOString().split('T')[0],
          warehouseId: firstWh?.id || 'wh-1',
          warehouseName: firstWh?.name || 'Central Warehouse',
          supplierId: firstSup?.id || 'sup-1',
          supplierName: firstSup?.name || 'Supplier Importer',
          status: 'In Stock' as const,
          condition: 'Brand New' as const,
          history: [
            {
              date: new Date().toISOString().replace('T', ' ').substr(0, 16),
              action: 'Bulk Inward Imported',
              description: 'Imported via CSV Data Import Hub',
              user: currentUser?.name || currentUserRole
            }
          ]
        };
      });
      setImeis(prev => [...prev, ...newImeis]);
      count = newImeis.length;
    }
    addAudit(`Bulk Imported ${count} ${entityType}`, 'Bulk Import', 'IMPORT', undefined, `Added ${count} records`);
    return { success: true, count };
  };

  const addWarrantyClaim = (claim: Omit<WarrantyClaim, 'id' | 'rmaNumber'>) => {
    const rmaNumber = `RMA-${new Date().getFullYear()}-${(warrantyClaims.length + 1).toString().padStart(4, '0')}`;
    const newClaim: WarrantyClaim = {
      ...claim,
      id: `rma-${Date.now()}`,
      rmaNumber
    };
    setWarrantyClaims(prev => [newClaim, ...prev]);

    // Update IMEI status to Warranty
    setImeis(prev => prev.map(i => {
      if (i.imei1 === claim.imei) {
        return {
          ...i,
          status: 'Warranty' as const,
          history: [
            ...(i.history || []),
            {
              date: new Date().toISOString().replace('T', ' ').substr(0, 16),
              action: 'Warranty Claim Registered',
              description: `RMA ${rmaNumber} created. Issue: ${claim.problemDescription}`,
              user: currentUserRole,
              referenceNo: rmaNumber
            }
          ]
        };
      }
      return i;
    }));

    addAudit(`Created Warranty Claim ${rmaNumber} for IMEI ${claim.imei}`, 'Warranty RMA', rmaNumber);
    return { success: true, rmaNumber };
  };

  const updateWarrantyStatus = (id: string, status: WarrantyClaim['status'], updates?: Partial<WarrantyClaim>) => {
    setWarrantyClaims(prev => prev.map(c => {
      if (c.id === id) {
        const updated = {
          ...c,
          status,
          ...(updates || {})
        };
        addAudit(`Updated RMA ${c.rmaNumber} status to ${status}`, 'Warranty RMA', c.rmaNumber);
        return updated;
      }
      return c;
    }));
  };

  const addBrandIncentiveScheme = (scheme: Omit<BrandIncentiveScheme, 'id'>) => {
    const newScheme: BrandIncentiveScheme = {
      ...scheme,
      id: `scheme-${Date.now()}`
    };
    setBrandIncentives(prev => [newScheme, ...prev]);
    addAudit(`Added Brand Incentive Scheme: ${scheme.schemeTitle}`, 'Brand Target Scheme', scheme.brandName);
  };

  const updateBrandIncentiveStatus = (id: string, status: BrandIncentiveScheme['claimStatus'], creditNoteNo?: string) => {
    setBrandIncentives(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          claimStatus: status,
          supplierCreditNoteNo: creditNoteNo || s.supplierCreditNoteNo
        };
      }
      return s;
    }));
    addAudit(`Updated Brand Incentive Status to ${status}`, 'Brand Target Scheme', id);
  };

  const createDeliveryChallan = (data: Omit<DeliveryChallan, 'id' | 'challanNo'>) => {
    const challanNo = `CH-${new Date().getFullYear()}-${(deliveryChallans.length + 1).toString().padStart(5, '0')}`;
    const newChallan: DeliveryChallan = {
      ...data,
      id: `ch-${Date.now()}`,
      challanNo
    };
    setDeliveryChallans(prev => [newChallan, ...prev]);
    addAudit(`Generated Delivery Challan ${challanNo} for Invoice ${data.invoiceNo}`, 'Dispatch Logistics', challanNo);
    return { success: true, challanNo };
  };

  const updateDeliveryStatus = (id: string, status: DeliveryStatus, deliveredAt?: string) => {
    setDeliveryChallans(prev => prev.map(ch => {
      if (ch.id === id) {
        return {
          ...ch,
          deliveryStatus: status,
          deliveredAt: status === 'Delivered' ? (deliveredAt || new Date().toISOString().replace('T', ' ').substr(0, 16)) : ch.deliveredAt
        };
      }
      return ch;
    }));
    addAudit(`Updated Delivery Challan ${id} status to ${status}`, 'Dispatch Logistics', id);
  };

  const settleChallanCod = (id: string, bankAccountId?: string) => {
    const challan = deliveryChallans.find(c => c.id === id);
    if (!challan || !challan.isCOD || challan.codAmount <= 0) return;

    setDeliveryChallans(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, codStatus: 'Collected & Settled', deliveryStatus: 'Delivered' };
      }
      return c;
    }));

    // Deposit to bank or cash
    if (bankAccountId) {
      setBankAccounts(prev => prev.map(b => b.id === bankAccountId ? { ...b, currentBalance: b.currentBalance + challan.codAmount } : b));
    }

    addAudit(`Settled Courier COD ৳${challan.codAmount} for Challan ${challan.challanNo}`, 'Cash & Bank', challan.challanNo);
  };

  const createPriceDropClaim = (claim: Omit<PriceDropClaim, 'id' | 'claimNo'>) => {
    const claimNo = `PDC-${new Date().getFullYear()}-${(priceDropClaims.length + 1).toString().padStart(4, '0')}`;
    const newClaim: PriceDropClaim = {
      ...claim,
      id: `pdc-${Date.now()}`,
      claimNo
    };
    setPriceDropClaims(prev => [newClaim, ...prev]);
    addAudit(`Created Brand Price Drop Claim ${claimNo} for ${claim.productModel}`, 'Price Protection', claimNo);
    return { success: true, claimNo };
  };

  const updatePriceDropStatus = (id: string, status: PriceDropClaim['claimStatus'], creditNoteNo?: string) => {
    setPriceDropClaims(prev => prev.map(c => {
      if (c.id === id) {
        const updated = {
          ...c,
          claimStatus: status,
          creditNoteNo: creditNoteNo || c.creditNoteNo
        };

        // If approved and credited, reduce supplier payable ledger
        if (status === 'Approved & Credited') {
          setSuppliers(sups => sups.map(s => {
            if (s.id === c.supplierId) {
              return { ...s, currentDue: Math.max(0, s.currentDue - c.totalClaimAmount) };
            }
            return s;
          }));
        }

        return updated;
      }
      return c;
    }));
    addAudit(`Updated Price Drop Claim status to ${status}`, 'Price Protection', id);
  };

  const sendSmsNotification = (sms: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => {
    const newSms: SmsLog = {
      ...sms,
      id: `sms-${Date.now()}`,
      sentAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
      status: 'Delivered'
    };
    setSmsLogs(prev => [newSms, ...prev]);
    addAudit(`Dispatched SMS to ${sms.recipientPhone}`, 'SMS Gateway', sms.recipientName);
    return { success: true };
  };

  // Reset to initial demo state
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

  const exportJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
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
      chartOfAccounts,
      journalEntries,
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
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TeleCorp_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && parsed.customers && parsed.suppliers) {
        if (parsed.brands) setBrands(parsed.brands);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.imeis) setImeis(parsed.imeis);
        if (parsed.warehouses) setWarehouses(parsed.warehouses);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.salesInvoices) setSalesInvoices(parsed.salesInvoices);
        if (parsed.purchaseInvoices) setPurchaseInvoices(parsed.purchaseInvoices);
        if (parsed.stockTransfers) setStockTransfers(parsed.stockTransfers);
        if (parsed.customerReturns) setCustomerReturns(parsed.customerReturns);
        if (parsed.salesmen) setSalesmen(parsed.salesmen);
        if (parsed.bankAccounts) setBankAccounts(parsed.bankAccounts);
        if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.chartOfAccounts) setChartOfAccounts(parsed.chartOfAccounts);
        if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.salesmanVisits) setSalesmanVisits(parsed.salesmanVisits);
        if (parsed.customerFollowUps) setCustomerFollowUps(parsed.customerFollowUps);
        if (parsed.dayClosings) setDayClosings(parsed.dayClosings);
        if (parsed.phoneExchanges) setPhoneExchanges(parsed.phoneExchanges);
        if (parsed.bankStatements) setBankStatements(parsed.bankStatements);
        if (parsed.supplierReturns) setSupplierReturns(parsed.supplierReturns);
        if (parsed.warrantyClaims) setWarrantyClaims(parsed.warrantyClaims);
        if (parsed.brandIncentives) setBrandIncentives(parsed.brandIncentives);
        if (parsed.deliveryChallans) setDeliveryChallans(parsed.deliveryChallans);
        if (parsed.priceDropClaims) setPriceDropClaims(parsed.priceDropClaims);
        if (parsed.smsLogs) setSmsLogs(parsed.smsLogs);
        addAudit('Restored System Backup from JSON', 'Backup & Restore', 'SYSTEM', undefined, 'Full State Overwritten');
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON backup file', e);
    }
    return false;
  };

  // User Management & RBAC CRUD
  const createUser = (userData: Omit<AuthUser, 'id'>): CrudResult => {
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

    // Enqueue for offline sync & live sync
    enqueueChange('app_users', 'INSERT', newUser.id, newUser, `নতুন ইউজার তৈরি (${newUser.name} - ${newUser.role})`);

    addAudit(`User Created (${newUser.name} - ${newUser.role})`, 'User Management', newUser.email);
    return { success: true };
  };

  const updateUser = (id: string, userData: Partial<AuthUser>): CrudResult => {
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

    // Enqueue for offline sync & live sync
    enqueueChange('app_users', 'UPDATE', id, updated, `ইউজার প্রোফাইল আপডেট (${target.name})`);

    addAudit(`User Profile Updated (${target.name} - ${target.role})`, 'User Management', target.email);
    return { success: true };
  };

  const deleteUser = (id: string): CrudResult => {
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    if (target.id === currentUser?.id) {
      return { success: false, error: 'বর্তমানে লগইন থাকা সক্রিয় একাউন্ট মুছে ফেলা সম্ভব নয়।' };
    }
    setUsers(prev => prev.filter(u => u.id !== id));

    // Enqueue for offline sync & live sync
    enqueueChange('app_users', 'DELETE', id, null, `ইউজার একাউন্ট মুছে ফেলা (${target.name})`);

    addAudit(`User Account Deleted (${target.name} - ${target.role})`, 'User Management', target.email);
    return { success: true };
  };

  const toggleUserStatus = (id: string): CrudResult => {
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    if (target.id === currentUser?.id) {
      return { success: false, error: 'নিজের সক্রিয় একাউন্ট স্থগিত (Suspend) করা যাবে না।' };
    }
    const newStatus: 'Active' | 'Suspended' = target.status === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

    // Enqueue for offline sync & live sync
    enqueueChange('app_users', 'UPDATE', id, { id, status: newStatus }, `ইউজার স্ট্যাটাস পরিবর্তন (${target.name} - ${newStatus})`);

    addAudit(`User Status Changed to ${newStatus} (${target.name})`, 'User Management', target.email);
    return { success: true };
  };

  const resetUserPassword = (id: string, newPassword: string): CrudResult => {
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    const trimmedPass = (newPassword || '').trim();
    if (trimmedPass.length < 3) {
      return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: trimmedPass } : u));

    // Enqueue for offline sync & live sync
    enqueueChange('app_users', 'UPDATE', id, { id, password: trimmedPass }, `ইউজার পাসওয়ার্ড রিসেট (${target.name})`);

    addAudit(`User Password Reset (${target.name})`, 'Security', target.email);
    return { success: true };
  };

  // Real-Time Authentication & Login Functions (Supabase Cloud + Local Fallback)
  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'দয়া করে আপনার রেজিস্টার্ড ইমেইল অ্যাড্রেস প্রদান করুন।' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'দয়া করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।' };
    }

    // 1. First, check live Supabase app_users table & Supabase Auth (if online)
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
          // Check password
          if (sbUser.password && sbUser.password !== trimmedPass) {
            return { success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' };
          }
          if (sbUser.status === 'Suspended') {
            return { success: false, error: 'এই অ্যাকাউন্টটি স্থগিত (Suspended) করা হয়েছে। সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।' };
          }

          // Normalize role
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

          // Update lastLogin in Supabase
          supabase.from('app_users').update({
            last_login: new Date().toISOString()
          }).eq('id', sbUser.id).then(() => {});

          // Merge into local users state so UI lists it
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

    // 2. Fallback to local users list
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

  // Snapshot Backup & Reset Engine
  const createBackupSnapshot = (name?: string): BackupSnapshot => {
    const currentFullState = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
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
      chartOfAccounts,
      journalEntries,
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

  const restoreFromSnapshot = (snapshotId: string): boolean => {
    const snap = backupSnapshots.find(s => s.id === snapshotId);
    if (!snap || !snap.dataJson) return false;
    const ok = importJSON(snap.dataJson);
    if (ok) {
      addAudit(`Reverted System to Snapshot: ${snap.name}`, 'Backup & Restore', snap.id);
    }
    return ok;
  };

  const deleteSnapshot = (snapshotId: string) => {
    setBackupSnapshots(prev => prev.filter(s => s.id !== snapshotId));
    addAudit(`Deleted Snapshot ${snapshotId}`, 'Backup & Restore', snapshotId);
  };

  const purgeTransactionalData = () => {
    // Take safety snapshot first!
    createBackupSnapshot('Auto Safety Snapshot (Pre-Transaction Purge)');

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

    // Reset all IMEIs back to 'In Stock'
    setImeis(prev => prev.map(i => ({ ...i, status: 'In Stock' as const })));

    // Reset Customer and Supplier Dues to 0
    setCustomers(prev => prev.map(c => ({ ...c, currentDue: 0 })));
    setSuppliers(prev => prev.map(s => ({ ...s, currentDue: 0 })));

    addAudit('Purged All Transaction Records (Fresh Year Cycle Reset)', 'System Maintenance', 'SYSTEM');
  };

  const factoryResetFullWipe = () => {
    createBackupSnapshot('Auto Safety Snapshot (Pre-Factory Wipe)');
    resetToDemoData();
    addAudit('Executed Complete Factory Reset', 'System Maintenance', 'SYSTEM');
  };

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
