export type Currency = 'BDT';

export type UserRole = 
  | 'Super Admin'
  | 'Owner'
  | 'General Manager'
  | 'Accounts Manager'
  | 'Sales Manager'
  | 'Warehouse Manager'
  | 'Salesman'
  | 'Cashier'
  | 'Accountant';

export type IMEIStatus = 
  | 'In Stock'
  | 'Sold'
  | 'Reserved'
  | 'Returned'
  | 'Damaged'
  | 'Warranty'
  | 'Supplier Return'
  | 'Customer Return'
  | 'Lost/Blocked'
  | 'Transferred';

export type ReturnCondition = 
  | 'Sealed'
  | 'Open Box'
  | 'Used'
  | 'Damaged'
  | 'Defective'
  | 'Missing Accessories';

export type PaymentMethodType = 
  | 'Cash'
  | 'Bank Transfer'
  | 'Cheque'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'POS Card'
  | 'Other';

export interface Brand {
  id: string;
  name: string;
  code: string;
  logo: string;
  status: 'Active' | 'Inactive';
  description: string;
  supplierCount?: number;
  productCount?: number;
  totalSoldUnits?: number;
  totalRevenue?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  ram: string;
  storage: string;
  color: string;
  purchasePrice: number;
  dealerPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  minSellingPrice: number;
  maxDiscount: number;
  reorderLevel: number;
  currentStock: number;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  model: string;
  category: 'Smartphone' | 'Feature Phone' | 'Tablet' | 'Accessories';
  networkRegion: string; // e.g. "Global / BTRC Approved", "Official BD", "Unofficial"
  warrantyPeriodMonths: number;
  description: string;
  variants: ProductVariant[];
  status: 'Active' | 'Discontinued';
}

export interface IMEIRecord {
  id: string;
  imei1: string;
  imei2?: string;
  serialNumber?: string;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string; // e.g. "12GB/256GB - Titanium Black"
  brandName: string;
  purchaseCost: number;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceNo: string;
  purchaseDate: string;
  warehouseId: string;
  warehouseName: string;
  status: IMEIStatus;
  condition: 'Brand New' | 'Open Box' | 'Damaged' | 'Refurbished';
  customerId?: string;
  customerName?: string;
  salesInvoiceNo?: string;
  salesDate?: string;
  salesPrice?: number;
  returnReason?: string;
  warrantyExpiry?: string;
  history: Array<{
    date: string;
    action: string;
    description: string;
    user: string;
    referenceNo?: string;
  }>;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: 'Central Warehouse' | 'Branch Warehouse' | 'Retail Outlet' | 'Salesman Van';
  address: string;
  city: string;
  managerName: string;
  contactNumber: string;
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  alternativeMobile?: string;
  email: string;
  address: string;
  district: string;
  taxVatNumber: string;
  tradeLicense: string;
  openingBalance: number;
  creditLimit: number;
  paymentTermsDays: number;
  currentDue: number;
  bankInfo: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  quantity: number;
  unitCost: number;
  discount: number;
  vatRate: number; // e.g. 5%
  totalCost: number;
  imeis: string[]; // List of IMEI 1 registered
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  dueDate: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseItem[];
  subTotal: number;
  discountTotal: number;
  vatTotal: number;
  otherCost: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethodType;
  bankAccountId?: string;
  referenceNo?: string;
  status: 'Received' | 'Partially Paid' | 'Paid' | 'Returned' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  alternativeMobile?: string;
  email?: string;
  address: string;
  area: string;
  district: string;
  tradeLicense?: string;
  nid?: string;
  creditLimit: number;
  allowedDueDays: number;
  salesmanId?: string;
  salesmanName?: string;
  customerType: 'Wholesale Dealer' | 'Sub-Dealer' | 'Retail Shop' | 'Corporate' | 'Walk-in';
  openingBalance: number;
  currentDue: number;
  status: 'Active' | 'Suspended' | 'Blocked';
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // for gross profit calculation
  discount: number;
  vatAmount: number;
  totalAmount: number;
  imeiList: string[]; // IMEIs assigned to this sale
}

export interface PaymentSplit {
  method: PaymentMethodType;
  amount: number;
  bankAccountId?: string;
  transactionRef?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  invoiceType: 'Wholesale' | 'Retail POS';
  customerId: string;
  customerName: string;
  customerPhone: string;
  salesmanId?: string;
  salesmanName?: string;
  warehouseId: string;
  warehouseName: string;
  invoiceDate: string;
  dueDate: string;
  items: SaleItem[];
  subTotal: number;
  discountTotal: number;
  vatTotal: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  payments: PaymentSplit[];
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Cancelled' | 'Returned';
  commissionEarned?: number;
  notes?: string;
  createdAt: string;
}

export interface PaymentAllocationItem {
  invoiceId: string;
  invoiceNo: string;
  invoiceDate: string;
  originalDue: number;
  allocatedAmount: number;
  remainingDue: number;
}

export interface PaymentCollection {
  id: string;
  collectionNo: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  bankAccountId?: string;
  transactionRef?: string;
  collectorSalesmanId?: string;
  collectorName?: string;
  allocations: PaymentAllocationItem[];
  notes?: string;
  createdAt: string;
}

export interface CustomerReturn {
  id: string;
  returnNo: string;
  originalInvoiceNo: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  imei: string;
  productName: string;
  variantDesc: string;
  returnReason: string;
  condition: ReturnCondition;
  refundOrCreditAmount: number;
  restockWarehouseId: string;
  restockStatus: 'Restocked' | 'Sent to Damaged' | 'Supplier Return Pending';
  commissionReversed: number;
  approvedBy: string;
  status: 'Approved' | 'Pending';
  notes?: string;
  createdAt: string;
}

export interface SupplierReturn {
  id: string;
  returnNo: string;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceNo: string;
  imei: string;
  productName: string;
  variantDesc: string;
  returnDate: string;
  returnReason: string;
  amount: number;
  status: 'Completed' | 'Pending Adjustment';
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  transferDate: string;
  items: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantDesc: string;
    quantity: number;
    imeis: string[];
  }>;
  totalQuantity: number;
  status: 'Requested' | 'Approved' | 'Dispatched' | 'Received' | 'Cancelled';
  dispatchedBy?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesmanTargetSlab {
  minPercent: number;
  maxPercent: number;
  commissionRate: number; // percentage or multiplier
  bonusAmount?: number;
}

export interface CommissionDisbursement {
  id: string;
  disbursementNo: string;
  salesmanId: string;
  salesmanName: string;
  month: string; // e.g. "2026-10"
  date: string;
  salesAmount: number;
  collectionAmount: number;
  salesCommission: number;
  collectionCommission: number;
  bonusAmount: number;
  deductionAmount: number;
  netPayable: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash';
  bankAccountId?: string;
  referenceNo?: string;
  status: 'Approved' | 'Paid';
  paidAt?: string;
  notes?: string;
}

export interface Salesman {
  id: string;
  employeeCode: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  joiningDate: string;
  basicSalary: number;
  commissionType: 'Percentage of Sales' | 'Percentage of Gross Profit' | 'Fixed Per Unit' | 'Target Based';
  commissionRate: number; // e.g. 1% of sales or 5% of profit or 200 BDT/unit
  monthlyTarget: number; // Sales revenue target in BDT
  monthlyUnitTarget?: number; // Target handset units (e.g. 200 pcs)
  monthlyCollectionTarget?: number; // Target collections in BDT
  collectionCommissionRate?: number; // % on collection (e.g. 0.5%)
  targetSlabs?: SalesmanTargetSlab[];
  currentMonthSales: number;
  currentMonthCollection: number;
  currentMonthUnits?: number;
  assignedArea: string;
  assignedCustomerCount: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  paidCommissionTotal?: number;
}

export interface SalesmanVisit {
  id: string;
  salesmanId: string;
  salesmanName: string;
  customerId: string;
  customerName: string;
  shopName: string;
  visitDate: string;
  purpose: 'Order Collection' | 'Payment Follow-up' | 'Stock Checking' | 'Relationship';
  outcomeNotes: string;
  orderCollectedAmount?: number;
  paymentCollectedAmount?: number;
  nextFollowUpDate?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  accountType: 'Current' | 'Savings' | 'MFS Merchant (bKash/Nagad)';
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  bankName: string;
  date: string;
  type: 'Deposit' | 'Withdrawal' | 'Customer Payment' | 'Supplier Payment' | 'Expense' | 'Bank Charge' | 'Transfer';
  referenceNo: string;
  amount: number;
  balanceAfter: number;
  description: string;
  reconciled: boolean;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'Cash In' | 'Cash Out';
  category: 'Customer Sale' | 'Due Collection' | 'Supplier Payment' | 'Expense' | 'Cash To Bank' | 'Other';
  amount: number;
  referenceNo: string;
  voucherNo?: string;
  description: string;
  performedBy: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  expenseNo: string;
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  bankAccountId?: string;
  description: string;
  approvedBy: string;
  recipientName?: string;
  voucherRef?: string;
  createdAt: string;
}

export interface AccountCOA {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  nature: 'Debit' | 'Credit';
  balance: number;
  description: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  voucherType: 'Sales Voucher' | 'Purchase Voucher' | 'Receipt Voucher' | 'Payment Voucher' | 'Journal Voucher' | 'Return Voucher';
  referenceNo: string;
  description: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  referenceNo: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'reminder' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkModule?: string;
  referenceId?: string;
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  customerName: string;
  shopName: string;
  salesmanId?: string;
  salesmanName?: string;
  scheduledDate: string;
  contactNumber: string;
  purpose: 'Due Payment Follow-up' | 'Overdue Recovery' | 'Order Booking' | 'Credit Limit Review';
  currentDueAmount: number;
  status: 'Pending' | 'Contacted - Promised Payment' | 'Completed' | 'Disputed / No Response';
  promisedDate?: string;
  notes: string;
  updatedAt: string;
}

export interface DayClosingRecord {
  id: string;
  closingNo: string;
  date: string;
  cashierName: string;
  warehouseId: string;
  warehouseName: string;
  openingCash: number;
  cashSalesTotal: number;
  dueCollectionsTotal: number;
  cashExpensesTotal: number;
  bankDepositsTotal: number;
  expectedClosingCash: number;
  actualPhysicalCash: number;
  discrepancy: number; // actual - expected
  status: 'Balanced' | 'Shortage' | 'Surplus';
  verifiedBy: string;
  notes?: string;
  createdAt: string;
}

export interface PhoneExchangeTransaction {
  id: string;
  exchangeNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  salesmanId?: string;
  salesmanName?: string;
  // Old Phone appraisal
  oldBrand: string;
  oldModel: string;
  oldIMEI: string;
  oldCondition: ReturnCondition;
  assessedValue: number;
  // New Phone
  newProductId: string;
  newProductName: string;
  newVariantDesc: string;
  newIMEI: string;
  newPhonePrice: number;
  // Financial calculation
  netPayableAmount: number; // newPhonePrice - assessedValue
  amountPaidNow: number;
  dueAmount: number;
  paymentMethod: PaymentMethodType;
  bankAccountId?: string;
  notes?: string;
  createdAt: string;
}

export interface BankStatementEntry {
  id: string;
  bankAccountId?: string;
  date: string;
  description: string;
  referenceNo: string;
  debit: number; // money out
  credit: number; // money in
  matchedSystemTxnId?: string;
  status: 'Matched' | 'Unmatched' | 'Bank Charge' | 'Interest';
}

export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  vatTaxNumber: string;
  defaultVatPercent: number;
  currency: string;
  currencySymbol: string;
  valuationMethod: 'FIFO' | 'Weighted Average';
  negativeStockAllowed: boolean;
  creditLimitHardBlock: boolean;
  maxDiscountWithoutApproval: number;
  language: 'en' | 'bn';
  apiIntegrations?: {
    smsProvider?: 'Greenweb' | 'Onnorokom' | 'Twilio' | 'SSL Wireless';
    smsApiKey?: string;
    smsSenderId?: string;
    autoSmsOnSale?: boolean;
    autoSmsOnDue?: boolean;
    bkashMerchant?: string;
    bkashAppKey?: string;
    bkashAppSecret?: string;
    bkashEnvironment?: 'Sandbox' | 'Live';
    nagadMerchant?: string;
    nagadPublicKey?: string;
    sslStoreId?: string;
    sslStorePass?: string;
    steadfastApiKey?: string;
    steadfastSecret?: string;
    pathaoClientId?: string;
    pathaoSecret?: string;
    autoSyncTracking?: boolean;
    btrcEirToken?: string;
    btrcWebhookUrl?: string;
    btrcAutoReport?: boolean;
  };
}

export type WarrantyStatus =
  | 'Received'
  | 'Dispatched to Service Center'
  | 'In Repair'
  | 'Repaired'
  | 'Replaced'
  | 'Delivered to Customer'
  | 'Rejected';

export interface WarrantyClaim {
  id: string;
  rmaNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  brandName: string;
  productModel: string;
  imei: string;
  purchaseInvoiceNo?: string;
  purchaseDate?: string;
  problemDescription: string;
  physicalCondition: string;
  accessoriesIncluded: string;
  serviceCenterName: string;
  serviceCenterJobNo?: string;
  status: WarrantyStatus;
  replacementIMEI?: string;
  repairCostCustomer: number;
  deliveryDate?: string;
  remarks?: string;
}

export interface IncentiveSlab {
  minUnits: number;
  incentivePerUnit: number;
}

export interface BrandIncentiveScheme {
  id: string;
  brandId: string;
  brandName: string;
  schemeTitle: string;
  period: string;
  startDate: string;
  endDate: string;
  targetUnits: number;
  achievedUnits: number;
  slabs: IncentiveSlab[];
  totalIncentiveEarned: number;
  claimStatus: 'In Progress' | 'Claim Submitted' | 'Approved & Credited' | 'Settled';
  supplierCreditNoteNo?: string;
}

export type CourierPartner = 'Sundarban Courier' | 'SA Paribahan' | 'Steadfast Courier' | 'RedX' | 'Pathao Courier' | 'Company Van Delivery';

export type DeliveryStatus = 'Pending Dispatch' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned';

export interface DeliveryChallan {
  id: string;
  challanNo: string;
  date: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  courierPartner: CourierPartner;
  consignmentNo?: string;
  isCOD: boolean;
  codAmount: number;
  codStatus: 'Pending' | 'Collected & Settled' | 'Not Applicable';
  deliveryStatus: DeliveryStatus;
  driverName?: string;
  driverPhone?: string;
  totalCartons: number;
  imeiList: string[];
  remarks?: string;
  deliveredAt?: string;
}

export interface PriceDropClaim {
  id: string;
  claimNo: string;
  claimDate: string;
  brandName: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productModel: string;
  variantDesc: string;
  oldPurchaseCost: number;
  newPurchaseCost: number;
  dropPerUnit: number;
  eligibleStockCount: number;
  totalClaimAmount: number;
  claimStatus: 'Draft' | 'Submitted to Brand' | 'Approved & Credited' | 'Rejected';
  creditNoteNo?: string;
  announcementRef?: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  messageType: 'Invoice Alert' | 'Due Reminder' | 'Payment Receipt' | 'Warranty Update' | 'Promotional Campaign';
  messageBody: string;
  sentAt: string;
  status: 'Delivered' | 'Sent' | 'Failed';
  masking: string;
  smsUnits: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  status: 'Active' | 'Suspended';
  avatar?: string;
  phone?: string;
  department?: string;
  branchName?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  name: string;
  sizeBytes: number;
  recordCounts: {
    products: number;
    imeis: number;
    customers: number;
    invoices: number;
    purchases: number;
  };
  dataJson: string;
}

export interface CrudResult {
  success: boolean;
  error?: string;
  id?: string;
}



