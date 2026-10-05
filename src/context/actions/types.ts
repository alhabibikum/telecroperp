import type React from 'react';
import type {
  PurchaseInvoice,
  SalesInvoice,
  IMEIRecord,
  Product,
  Customer,
  Supplier,
  Salesman,
  Warehouse,
  BankAccount,
  CashTransaction,
  Expense,
  ExpenseCategory,
  AccountCOA,
  JournalEntry,
  SystemAlert,
  AuditLog,
  SystemSettings,
  UserRole,
  SalesmanVisit,
  CustomerFollowUp,
  DayClosingRecord,
  PhoneExchangeTransaction,
  BankStatementEntry,
  SupplierReturn,
  CustomerReturn,
  WarrantyClaim,
  BrandIncentiveScheme,
  DeliveryChallan,
  PriceDropClaim,
  SmsLog,
  AuthUser,
  BackupSnapshot,
  CrudResult,
  PaymentMethodType,
  Brand,
  StockTransfer
} from '../../types/erp';
import { enqueueChange } from '../../lib/syncEngine';

export type EnqueueChangeFn = typeof enqueueChange;
export type AddAuditFn = (action: string, module: string, referenceNo?: string, previousValue?: string, newValue?: string) => void;

export const fail = (error: string): CrudResult => ({ success: false, error });
export const ok = (id?: string): CrudResult => ({ success: true, id });
