import {
  Brand,
  Product,
  IMEIRecord,
  Warehouse,
  Supplier,
  Customer,
  SalesInvoice,
  PurchaseInvoice,
  Salesman,
  BankAccount,
  CashTransaction,
  Expense,
  ExpenseCategory,
  AccountCOA,
  JournalEntry,
  AuditLog,
  SystemAlert,
  SystemSettings,
  StockTransfer,
  CustomerReturn,
  WarrantyClaim,
  BrandIncentiveScheme,
  DeliveryChallan,
  PriceDropClaim,
  SmsLog,
  CommissionDisbursement,
  EMIPlan,
  MoneyReceipt,
  SalesmanVisit,
  CustomerFollowUp,
  DayClosingRecord,
  PhoneExchangeTransaction,
  BankStatementEntry
} from '../types/erp';

import {
  firozaSettings,
  firozaBrands,
  firozaWarehouses,
  firozaSuppliers,
  firozaSalesmen,
  firozaCustomers,
  firozaProducts,
  firozaIMEIs,
  firozaBankAccounts
} from './firozaMigratedData';

// Master Data exported from Firoza Enterprise Excel_Export
export const initialSettings: SystemSettings = firozaSettings;
export const initialBrands: Brand[] = firozaBrands;
export const initialWarehouses: Warehouse[] = firozaWarehouses;
export const initialSuppliers: Supplier[] = firozaSuppliers;
export const initialSalesmen: Salesman[] = firozaSalesmen;
export const initialCustomers: Customer[] = firozaCustomers;
export const initialProducts: Product[] = firozaProducts;
export const initialIMEIs: IMEIRecord[] = firozaIMEIs;
export const initialBankAccounts: BankAccount[] = firozaBankAccounts;

export const initialCashTransactions: CashTransaction[] = [];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 'expcat-1', name: 'Office & Warehouse Rent', description: 'Konabari New Market office & warehouse rental' },
  { id: 'expcat-2', name: 'Staff Salaries & Allowances', description: 'Monthly fixed employee payroll' },
  { id: 'expcat-3', name: 'Salesman Commission', description: 'Field collection and sales target incentives' },
  { id: 'expcat-4', name: 'Logistics, Courier & Transport', description: 'Van transport and courier charges' },
  { id: 'expcat-5', name: 'Dealer Marketing & Branding', description: 'Retailer gifts, banners and promotional campaigns' },
  { id: 'expcat-6', name: 'Utilities & Connectivity', description: 'Electricity, fiber internet and cloud servers' },
  { id: 'expcat-7', name: 'Banking & Gateway Fees', description: 'Bank charges, bKash/Nagad merchant fees' }
];

export const initialExpenses: Expense[] = [];

// Clean 24-head Chart of Accounts matching Firoza Opening Trial Balance
export const initialCOA: AccountCOA[] = [
  { code: '1010', name: 'Cash in Hand (Main Vault)', type: 'Asset', nature: 'Debit', balance: 0, description: 'Physical cash in central vault & cash drawers' },
  { code: '1020', name: 'Bank Operating Accounts', type: 'Asset', nature: 'Debit', balance: 0, description: 'Bank Asia operating current account' },
  { code: '1030', name: 'Accounts Receivable (Trade Debtors)', type: 'Asset', nature: 'Debit', balance: 19590465.62, description: 'Total outstanding dues owed by 99 retail dealer shops' },
  { code: '1040', name: 'Merchandise Inventory Asset', type: 'Asset', nature: 'Debit', balance: 49883868.00, description: 'Landed valuation of 2,900+ active handset stock' },
  { code: '1050', name: 'Advance to Suppliers / Importers', type: 'Asset', nature: 'Debit', balance: 0, description: 'Advance consignments and LC payments' },
  { code: '1060', name: 'Undeposited Funds / Cash in Transit', type: 'Asset', nature: 'Debit', balance: 0, description: 'Funds collected by salesmen pending bank deposit' },
  { code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'Liability', nature: 'Credit', balance: 63456266.80, description: 'Credit dues owed to Ismarto Technology BD Ltd' },
  { code: '2020', name: 'Output VAT Payable (NBR / BTRC)', type: 'Liability', nature: 'Credit', balance: 0, description: 'VAT collected awaiting treasury deposit' },
  { code: '2030', name: 'Customer Security Deposits', type: 'Liability', nature: 'Credit', balance: 0, description: 'Caution security money held from dealers' },
  { code: '2040', name: 'Accrued Salaries & Operational Payables', type: 'Liability', nature: 'Credit', balance: 0, description: 'Salaries and expenses payable' },
  { code: '3010', name: 'Shareholders Paid-Up Capital', type: 'Equity', nature: 'Credit', balance: 6018066.82, description: 'Net owner equity & accumulated capital' },
  { code: '3020', name: 'Retained Earnings', type: 'Equity', nature: 'Credit', balance: 0, description: 'Cumulative business net profit' },
  { code: '3030', name: 'Owner Drawings / Dividends', type: 'Equity', nature: 'Debit', balance: 0, description: 'Drawings or dividend disbursements taken by shareholders' },
  { code: '4010', name: 'Wholesale Handset Sales Revenue', type: 'Revenue', nature: 'Credit', balance: 0, description: 'Revenue from wholesale dealer orders' },
  { code: '4020', name: 'Retail POS Sales Revenue', type: 'Revenue', nature: 'Credit', balance: 0, description: 'Direct counter retail sales' },
  { code: '4030', name: 'Brand Target Incentives & Sell-Out Rebates', type: 'Revenue', nature: 'Credit', balance: 0, description: 'Quarterly volume rebates from brand distributors' },
  { code: '4040', name: 'Other Operating Income', type: 'Revenue', nature: 'Credit', balance: 0, description: 'RMA service commissions and miscellaneous income' },
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'Expense', nature: 'Debit', balance: 0, description: 'Direct procurement cost of phones sold' },
  { code: '5020', name: 'Logistics, Courier & Freight Charges', type: 'Expense', nature: 'Debit', balance: 0, description: 'Van transport and courier charges' },
  { code: '5030', name: 'Warehouse & Office Lease Rent', type: 'Expense', nature: 'Debit', balance: 0, description: 'Konabari New Market warehouse rent' },
  { code: '5040', name: 'Staff Salaries, TA/DA & Commissions', type: 'Expense', nature: 'Debit', balance: 0, description: 'Employee payroll and salesman field collection commissions' },
  { code: '5050', name: 'Utilities, Internet & Cloud Server Hosting', type: 'Expense', nature: 'Debit', balance: 0, description: 'Electricity, fiber internet and cloud bills' },
  { code: '5060', name: 'Branding, Signboards & Dealer Marketing', type: 'Expense', nature: 'Debit', balance: 0, description: 'Dealer shop branding and promotional items' },
  { code: '5070', name: 'Bank Charges & MFS Gateway Fees', type: 'Expense', nature: 'Debit', balance: 0, description: 'Bank charges and bKash checkout merchant fees' }
];

export const initialJournalEntries: JournalEntry[] = [];
export const initialSalesInvoices: SalesInvoice[] = [];
export const initialPurchases: PurchaseInvoice[] = [];
export const initialStockTransfers: StockTransfer[] = [];
export const initialCustomerReturns: CustomerReturn[] = [];
export const initialAlerts: SystemAlert[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialSalesmanVisits: SalesmanVisit[] = [];
export const initialCustomerFollowUps: CustomerFollowUp[] = [];
export const initialDayClosings: DayClosingRecord[] = [];
export const initialPhoneExchanges: PhoneExchangeTransaction[] = [];
export const initialBankStatements: BankStatementEntry[] = [];
export const initialWarrantyClaims: WarrantyClaim[] = [];
export const initialBrandIncentives: BrandIncentiveScheme[] = [];
export const initialDeliveryChallans: DeliveryChallan[] = [];
export const initialPriceDropClaims: PriceDropClaim[] = [];
export const initialSmsLogs: SmsLog[] = [];
export const initialEMIPlans: EMIPlan[] = [];
export const initialMoneyReceipts: MoneyReceipt[] = [];
export const initialCommissionDisbursements: CommissionDisbursement[] = [];
