-- =========================================================================
-- TELECORP MOBILE DISTRIBUTION ERP - SUPABASE CLOUD DATABASE SCHEMA
-- PostgreSQL / Supabase Enterprise Migration & Real Data Seed Script
-- Covers ALL 35 Modules with 100% Real-Life Bangladeshi Telecom Data
-- Version: 4.0.0 (Clean Production Enterprise Release - Zero Demo Data)
-- =========================================================================

-- Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 0. CLEAN RESET (Drop old/incomplete tables to ensure fresh synchronization)
-- =========================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS backup_snapshots CASCADE;
DROP TABLE IF EXISTS gateway_configs CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS salesman_visits CASCADE;
DROP TABLE IF EXISTS customer_follow_ups CASCADE;
DROP TABLE IF EXISTS phone_exchange_records CASCADE;
DROP TABLE IF EXISTS price_drop_claims CASCADE;
DROP TABLE IF EXISTS delivery_challans CASCADE;
DROP TABLE IF EXISTS brand_incentive_schemes CASCADE;
DROP TABLE IF EXISTS warranty_claims CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS day_closings CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS cash_transactions CASCADE;
DROP TABLE IF EXISTS bank_statements CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS emi_plans CASCADE;
DROP TABLE IF EXISTS commission_disbursements CASCADE;
DROP TABLE IF EXISTS money_receipts CASCADE;
DROP TABLE IF EXISTS supplier_returns CASCADE;
DROP TABLE IF EXISTS customer_returns CASCADE;
DROP TABLE IF EXISTS stock_transfers CASCADE;
DROP TABLE IF EXISTS sales_invoices CASCADE;
DROP TABLE IF EXISTS purchase_invoices CASCADE;
DROP TABLE IF EXISTS imeis CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS salesmen CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- =========================================================================
-- 1. AUTH & USERS (Profiles & RBAC 9 Enterprise Roles)
-- =========================================================================
CREATE TABLE app_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Salesman',
    password TEXT NOT NULL DEFAULT '123456',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    phone TEXT,
    department TEXT,
    branch_name TEXT,
    avatar TEXT DEFAULT '👤',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. SYSTEM SETTINGS & COMPANY PROFILE
-- =========================================================================
CREATE TABLE system_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_settings',
    company_name TEXT NOT NULL DEFAULT 'FIROZA ENTERPRISES',
    company_address TEXT NOT NULL DEFAULT 'NADIM VILLA, Level 4, CENTRAL JAME MOSJID, KONABARI, GAZIPUR, Bangladesh',
    company_phone TEXT NOT NULL DEFAULT '+880 1122000 / +880 712996757',
    company_email TEXT NOT NULL DEFAULT 'info@fibrozaenterprises.com',
    vat_tax_number TEXT DEFAULT 'BIN: 530914078318 (BTRC Reg: 578902)',
    default_vat_percent NUMERIC(5, 2) DEFAULT 5.00,
    currency TEXT DEFAULT 'BDT',
    currency_symbol TEXT DEFAULT '৳',
    valuation_method TEXT DEFAULT 'FIFO' CHECK (valuation_method IN ('FIFO', 'Weighted Average')),
    negative_stock_allowed BOOLEAN DEFAULT false,
    credit_limit_hard_block BOOLEAN DEFAULT true,
    max_discount_without_approval NUMERIC(15, 2) DEFAULT 0.00,
    language TEXT DEFAULT 'bn' CHECK (language IN ('en', 'bn')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 3. MASTER DATA (Brands, Warehouses, Suppliers, Customers, Staff)
-- =========================================================================
CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    logo TEXT,
    country TEXT DEFAULT 'China',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE warehouses (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Branch Warehouse' CHECK (type IN ('Central Warehouse', 'Branch Warehouse', 'Retail Outlet', 'Salesman Van')),
    address TEXT,
    city TEXT DEFAULT 'Dhaka',
    manager_name TEXT,
    contact_number TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE suppliers (
    id TEXT PRIMARY KEY,
    supplier_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    mobile TEXT NOT NULL,
    alternative_mobile TEXT,
    email TEXT,
    address TEXT,
    district TEXT DEFAULT 'Dhaka',
    tax_vat_number TEXT,
    trade_license TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    credit_limit NUMERIC(15, 2) DEFAULT 10000000.00,
    payment_terms_days INTEGER DEFAULT 15,
    current_due NUMERIC(15, 2) DEFAULT 0.00,
    bank_info TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    customer_code TEXT UNIQUE NOT NULL,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    alternative_mobile TEXT,
    email TEXT,
    address TEXT,
    area TEXT,
    district TEXT DEFAULT 'Dhaka',
    division TEXT DEFAULT 'Dhaka',
    nid_number TEXT,
    trade_license TEXT,
    credit_limit NUMERIC(15, 2) DEFAULT 200000.00,
    allowed_due_days INTEGER DEFAULT 15,
    customer_type TEXT DEFAULT 'Wholesale Dealer' CHECK (customer_type IN ('Wholesale Dealer', 'Retail Shop', 'Corporate Client', 'Walk-in Retail', 'Sub-Dealer', 'Corporate', 'Walk-in')),
    salesman_id TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_due NUMERIC(15, 2) DEFAULT 0.00,
    security_cheque_info TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Blocked', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE salesmen (
    id TEXT PRIMARY KEY,
    employee_code TEXT UNIQUE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    address TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    basic_salary NUMERIC(15, 2) DEFAULT 25000.00,
    commission_type TEXT DEFAULT 'Percentage of Sales',
    commission_percentage NUMERIC(5, 2) DEFAULT 1.00,
    target_monthly_bdt NUMERIC(15, 2) DEFAULT 1000000.00,
    achieved_monthly_bdt NUMERIC(15, 2) DEFAULT 0.00,
    active_routes TEXT[],
    assigned_area TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 4. PRODUCTS & VARIANTS
-- =========================================================================
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
    brand_name TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT DEFAULT 'Smartphone' CHECK (category IN ('Smartphone', 'Feature Phone', 'Tablet', 'Accessories')),
    network_region TEXT DEFAULT 'Official BD / BTRC Approved',
    warranty_period_months INTEGER DEFAULT 12,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    color TEXT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL,
    dealer_price NUMERIC(15, 2) NOT NULL,
    wholesale_price NUMERIC(15, 2) NOT NULL,
    retail_price NUMERIC(15, 2) NOT NULL,
    min_selling_price NUMERIC(15, 2) NOT NULL,
    max_discount NUMERIC(15, 2) DEFAULT 500.00,
    reorder_level INTEGER DEFAULT 5,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 5. SERIALIZED IMEI INVENTORY (15-Digit Tracking Engine)
-- =========================================================================
CREATE TABLE imeis (
    id TEXT PRIMARY KEY,
    imei1 VARCHAR(18) UNIQUE NOT NULL,
    imei2 VARCHAR(18),
    serial_number TEXT,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    variant_desc TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    purchase_cost NUMERIC(15, 2) NOT NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    purchase_invoice_no TEXT,
    purchase_date DATE DEFAULT CURRENT_DATE,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    warehouse_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Sold', 'Reserved', 'In Transit', 'Returned', 'Damaged', 'Warranty', 'Supplier Return', 'Customer Return', 'Lost/Blocked', 'Transferred')),
    condition TEXT DEFAULT 'Brand New' CHECK (condition IN ('Brand New', 'Open Box', 'Damaged', 'Refurbished')),
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    sales_invoice_no TEXT,
    sales_date DATE,
    sales_price NUMERIC(15, 2),
    return_reason TEXT,
    warranty_expiry DATE,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_imeis_imei1 ON imeis(imei1);
CREATE INDEX idx_imeis_imei2 ON imeis(imei2);
CREATE INDEX idx_imeis_warehouse ON imeis(warehouse_id);
CREATE INDEX idx_imeis_status ON imeis(status);
CREATE INDEX idx_imeis_product ON imeis(product_id);

-- =========================================================================
-- 6. PURCHASES & INWARD CONSIGNMENTS
-- =========================================================================
CREATE TABLE purchase_invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    warehouse_name TEXT NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    vat_total NUMERIC(15, 2) DEFAULT 0.00,
    transport_cost NUMERIC(15, 2) DEFAULT 0.00,
    other_expenses NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    due_amount NUMERIC(15, 2) NOT NULL,
    payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Partial', 'Unpaid', 'Received', 'Partially Paid', 'Returned', 'Cancelled')),
    payment_method TEXT DEFAULT 'Bank Transfer',
    bank_account_id TEXT,
    reference_no TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Received' CHECK (status IN ('Draft', 'Received', 'Void', 'Partially Paid', 'Paid', 'Returned', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 7. SALES & BILLING (Wholesale & Express Retail POS)
-- =========================================================================
CREATE TABLE sales_invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    invoice_type TEXT NOT NULL DEFAULT 'Wholesale' CHECK (invoice_type IN ('Wholesale', 'Retail POS')),
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    salesman_id TEXT REFERENCES salesmen(id) ON DELETE SET NULL,
    salesman_name TEXT,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    warehouse_name TEXT NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    vat_rate NUMERIC(5, 2) DEFAULT 0.00,
    vat_amount NUMERIC(15, 2) DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    due_amount NUMERIC(15, 2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Cheque', 'bKash', 'Nagad', 'Rocket', 'POS Card', 'Other', 'Split Payment', 'Credit Due')),
    payments JSONB DEFAULT '[]'::jsonb,
    commission_earned NUMERIC(15, 2) DEFAULT 0.00,
    notes TEXT,
    delivery_status TEXT DEFAULT 'Delivered' CHECK (delivery_status IN ('Pending Dispatch', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled', 'Returned')),
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Draft', 'Confirmed', 'Void', 'Paid', 'Partial', 'Unpaid', 'Cancelled', 'Returned')),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_invoice_no ON sales_invoices(invoice_no);
CREATE INDEX idx_sales_customer ON sales_invoices(customer_id);
CREATE INDEX idx_sales_date ON sales_invoices(invoice_date);

-- =========================================================================
-- 8. STOCK TRANSFERS BETWEEN WAREHOUSES
-- =========================================================================
CREATE TABLE stock_transfers (
    id TEXT PRIMARY KEY,
    transfer_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    from_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    from_warehouse_name TEXT NOT NULL,
    to_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    to_warehouse_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    imeis TEXT[] NOT NULL DEFAULT '{}',
    total_units INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'In Transit', 'Completed', 'Cancelled', 'Requested', 'Approved', 'Dispatched', 'Received')),
    requested_by TEXT,
    dispatched_by TEXT,
    received_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 9. RETURNS (Customer & Supplier RMA)
-- =========================================================================
CREATE TABLE customer_returns (
    id TEXT PRIMARY KEY,
    return_no TEXT UNIQUE NOT NULL,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sales_invoice_no TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    variant_desc TEXT NOT NULL,
    imei TEXT NOT NULL,
    condition TEXT NOT NULL DEFAULT 'Sealed' CHECK (condition IN ('Sealed', 'Open Box', 'Used', 'Damaged', 'Defective', 'Missing Accessories')),
    return_reason TEXT NOT NULL,
    action_taken TEXT DEFAULT 'Credit Note',
    refund_or_credit_amount NUMERIC(15, 2) NOT NULL,
    restock_warehouse_id TEXT REFERENCES warehouses(id),
    restock_status TEXT DEFAULT 'Restocked',
    commission_reversed NUMERIC(15, 2) DEFAULT 0.00,
    approved_by TEXT,
    status TEXT NOT NULL DEFAULT 'Processed' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Processed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supplier_returns (
    id TEXT PRIMARY KEY,
    return_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id),
    supplier_name TEXT NOT NULL,
    purchase_invoice_no TEXT,
    product_id TEXT REFERENCES products(id),
    product_name TEXT NOT NULL,
    variant_desc TEXT NOT NULL,
    imei TEXT NOT NULL,
    reason TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Sent to Brand', 'Replaced', 'Credit Received', 'Completed', 'Pending Adjustment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 10. DUE COLLECTIONS & MONEY RECEIPTS
-- =========================================================================
CREATE TABLE money_receipts (
    id TEXT PRIMARY KEY,
    receipt_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    shop_name TEXT,
    area TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    discount_waiver NUMERIC(15, 2) DEFAULT 0.00,
    payment_method TEXT NOT NULL,
    bank_account_id TEXT,
    bank_name TEXT,
    transaction_ref TEXT,
    collector_salesman_id TEXT,
    collector_salesman_name TEXT,
    reference_invoice TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Voided')),
    allocations JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 10B. EMI & HIRE-PURCHASE FINANCING PLANS
-- =========================================================================
CREATE TABLE emi_plans (
    id TEXT PRIMARY KEY,
    plan_no TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_address TEXT,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    variant_desc TEXT,
    imei TEXT NOT NULL,
    invoice_no TEXT,
    warehouse_id TEXT,
    warehouse_name TEXT,
    total_price NUMERIC(15, 2) NOT NULL,
    down_payment NUMERIC(15, 2) NOT NULL,
    financed_amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) DEFAULT 0.00,
    tenure_months INTEGER NOT NULL,
    monthly_installment NUMERIC(15, 2) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Defaulted', 'Cancelled')),
    guarantor JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '{}'::jsonb,
    installments JSONB DEFAULT '[]'::jsonb,
    total_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_remaining NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    overdue_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 10C. SALESMAN COMMISSION DISBURSEMENTS
-- =========================================================================
CREATE TABLE commission_disbursements (
    id TEXT PRIMARY KEY,
    disbursement_no TEXT UNIQUE NOT NULL,
    salesman_id TEXT NOT NULL REFERENCES salesmen(id),
    salesman_name TEXT NOT NULL,
    month TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sales_amount NUMERIC(15, 2) DEFAULT 0.00,
    collection_amount NUMERIC(15, 2) DEFAULT 0.00,
    sales_commission NUMERIC(15, 2) DEFAULT 0.00,
    collection_commission NUMERIC(15, 2) DEFAULT 0.00,
    bonus_amount NUMERIC(15, 2) DEFAULT 0.00,
    deduction_amount NUMERIC(15, 2) DEFAULT 0.00,
    net_payable NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    bank_account_id TEXT,
    reference_no TEXT,
    status TEXT NOT NULL DEFAULT 'Paid' CHECK (status IN ('Approved', 'Paid')),
    paid_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 11. BANKING, CASH & EXPENSES
-- =========================================================================
CREATE TABLE bank_accounts (
    id TEXT PRIMARY KEY,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    branch_name TEXT,
    account_type TEXT DEFAULT 'Current',
    routing_number TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bank_transactions (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
    bank_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('Deposit', 'Withdrawal', 'Customer Payment', 'Supplier Payment', 'Expense', 'Bank Charge', 'Transfer')),
    reference_no TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    reconciled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bank_statements (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_no TEXT,
    debit NUMERIC(15, 2) DEFAULT 0.00,
    credit NUMERIC(15, 2) DEFAULT 0.00,
    matched_system_txn_id TEXT,
    status TEXT NOT NULL DEFAULT 'Unmatched' CHECK (status IN ('Matched', 'Unmatched', 'Bank Charge', 'Interest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cash_transactions (
    id TEXT PRIMARY KEY,
    voucher_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('Cash In', 'Cash Out')),
    category TEXT NOT NULL CHECK (category IN ('Customer Sale', 'Due Collection', 'Supplier Payment', 'Expense', 'Cash To Bank', 'Other')),
    amount NUMERIC(15, 2) NOT NULL,
    reference_no TEXT,
    description TEXT NOT NULL,
    performed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expense_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    expense_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id TEXT,
    category_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    bank_account_id TEXT REFERENCES bank_accounts(id),
    description TEXT NOT NULL,
    recipient_name TEXT,
    voucher_ref TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE day_closings (
    id TEXT PRIMARY KEY,
    closing_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    cashier_name TEXT NOT NULL,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    warehouse_name TEXT NOT NULL,
    opening_cash NUMERIC(15, 2) NOT NULL,
    cash_sales_total NUMERIC(15, 2) NOT NULL,
    due_collections_total NUMERIC(15, 2) NOT NULL,
    cash_expenses_total NUMERIC(15, 2) NOT NULL,
    bank_deposits_total NUMERIC(15, 2) NOT NULL,
    expected_closing_cash NUMERIC(15, 2) NOT NULL,
    actual_physical_cash NUMERIC(15, 2) NOT NULL,
    discrepancy NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Balanced' CHECK (status IN ('Balanced', 'Shortage', 'Surplus')),
    verified_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 12. DOUBLE-ENTRY ACCOUNTING (General Ledger, Journal & COA)
-- =========================================================================
CREATE TABLE chart_of_accounts (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    nature TEXT NOT NULL CHECK (nature IN ('Debit', 'Credit')),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    voucher_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    voucher_type TEXT NOT NULL CHECK (voucher_type IN ('Sales Voucher', 'Purchase Voucher', 'Receipt Voucher', 'Payment Voucher', 'Journal Voucher', 'Return Voucher')),
    reference_no TEXT,
    description TEXT NOT NULL,
    lines JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_debit NUMERIC(15, 2) NOT NULL,
    total_credit NUMERIC(15, 2) NOT NULL,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 13. WARRANTY & RMA SERVICE CENTER (WarrantyServiceView.tsx)
-- =========================================================================
CREATE TABLE warranty_claims (
    id TEXT PRIMARY KEY,
    rma_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    brand_name TEXT NOT NULL,
    product_model TEXT NOT NULL,
    imei VARCHAR(18) NOT NULL,
    purchase_invoice_no TEXT,
    purchase_date DATE,
    problem_description TEXT NOT NULL,
    physical_condition TEXT,
    accessories_included TEXT,
    service_center_name TEXT NOT NULL,
    service_center_job_no TEXT,
    status TEXT NOT NULL DEFAULT 'Received' CHECK (status IN ('Received', 'Dispatched to Service Center', 'In Repair', 'Repaired', 'Replaced', 'Delivered to Customer', 'Rejected')),
    replacement_imei VARCHAR(18),
    repair_cost_customer NUMERIC(15, 2) DEFAULT 0.00,
    delivery_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 14. BRAND INCENTIVE SCHEMES (BrandIncentivesView.tsx)
-- =========================================================================
CREATE TABLE brand_incentive_schemes (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES brands(id),
    brand_name TEXT NOT NULL,
    scheme_title TEXT NOT NULL,
    period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_units INTEGER NOT NULL,
    achieved_units INTEGER DEFAULT 0,
    slabs JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_incentive_earned NUMERIC(15, 2) DEFAULT 0.00,
    claim_status TEXT NOT NULL DEFAULT 'In Progress' CHECK (claim_status IN ('In Progress', 'Claim Submitted', 'Approved & Credited', 'Settled')),
    supplier_credit_note_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 15. DISPATCH & COURIER LOGISTICS (DeliveryDispatchView.tsx)
-- =========================================================================
CREATE TABLE delivery_challans (
    id TEXT PRIMARY KEY,
    challan_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_no TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT NOT NULL,
    district TEXT DEFAULT 'Dhaka',
    courier_partner TEXT NOT NULL CHECK (courier_partner IN ('Sundarban Courier', 'SA Paribahan', 'Steadfast Courier', 'RedX', 'Pathao Courier', 'Company Van Delivery')),
    consignment_no TEXT,
    is_cod BOOLEAN DEFAULT false,
    cod_amount NUMERIC(15, 2) DEFAULT 0.00,
    cod_status TEXT DEFAULT 'Not Applicable' CHECK (cod_status IN ('Pending', 'Collected & Settled', 'Not Applicable')),
    delivery_status TEXT NOT NULL DEFAULT 'Pending Dispatch' CHECK (delivery_status IN ('Pending Dispatch', 'Dispatched', 'In Transit', 'Delivered', 'Returned')),
    driver_name TEXT,
    driver_phone TEXT,
    total_cartons INTEGER DEFAULT 1,
    imei_list TEXT[] DEFAULT '{}',
    remarks TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 16. BRAND PRICE DROP PROTECTION CLAIMS (PriceDropClaimView.tsx)
-- =========================================================================
CREATE TABLE price_drop_claims (
    id TEXT PRIMARY KEY,
    claim_no TEXT UNIQUE NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    brand_name TEXT NOT NULL,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id),
    supplier_name TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_model TEXT NOT NULL,
    variant_desc TEXT NOT NULL,
    old_purchase_cost NUMERIC(15, 2) NOT NULL,
    new_purchase_cost NUMERIC(15, 2) NOT NULL,
    drop_per_unit NUMERIC(15, 2) NOT NULL,
    eligible_stock_count INTEGER NOT NULL,
    total_claim_amount NUMERIC(15, 2) NOT NULL,
    claim_status TEXT NOT NULL DEFAULT 'Draft' CHECK (claim_status IN ('Draft', 'Submitted to Brand', 'Approved & Credited', 'Rejected')),
    credit_note_no TEXT,
    announcement_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 17. PHONE EXCHANGE & BUYBACK COUNTER (PhoneExchangeView.tsx)
-- =========================================================================
CREATE TABLE phone_exchange_records (
    id TEXT PRIMARY KEY,
    exchange_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    salesman_id TEXT,
    salesman_name TEXT,
    old_brand TEXT NOT NULL,
    old_model TEXT NOT NULL,
    old_imei VARCHAR(18) NOT NULL,
    old_condition TEXT NOT NULL,
    assessed_value NUMERIC(15, 2) NOT NULL,
    new_product_id TEXT NOT NULL REFERENCES products(id),
    new_product_name TEXT NOT NULL,
    new_variant_desc TEXT NOT NULL,
    new_imei VARCHAR(18) NOT NULL,
    new_phone_price NUMERIC(15, 2) NOT NULL,
    net_payable_amount NUMERIC(15, 2) NOT NULL,
    amount_paid_now NUMERIC(15, 2) NOT NULL,
    due_amount NUMERIC(15, 2) DEFAULT 0.00,
    payment_method TEXT NOT NULL,
    bank_account_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 18. CUSTOMER DUE FOLLOW-UP SCHEDULE (CustomersView.tsx / FieldVisitsView.tsx)
-- =========================================================================
CREATE TABLE customer_follow_ups (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    salesman_id TEXT,
    salesman_name TEXT,
    scheduled_date DATE NOT NULL,
    contact_number TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('Due Payment Follow-up', 'Overdue Recovery', 'Order Booking', 'Credit Limit Review')),
    current_due_amount NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted - Promised Payment', 'Completed', 'Disputed / No Response')),
    promised_date DATE,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 19. FIELD DSR SALESMAN VISITS (FieldVisitsView.tsx / SalesmanMobileAppView.tsx)
-- =========================================================================
CREATE TABLE salesman_visits (
    id TEXT PRIMARY KEY,
    salesman_id TEXT NOT NULL,
    salesman_name TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT,
    shop_name TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    outcome_notes TEXT,
    order_amount_booked NUMERIC(15, 2) DEFAULT 0.00,
    collection_amount NUMERIC(15, 2) DEFAULT 0.00,
    next_follow_up_date DATE,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 20. SMS & WHATSAPP MARKETING CAMPAIGNS (SmsMarketingView.tsx)
-- =========================================================================
CREATE TABLE sms_logs (
    id TEXT PRIMARY KEY,
    recipient_phone TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('Invoice Alert', 'Due Reminder', 'Payment Receipt', 'Warranty Update', 'Promotional Campaign')),
    message_body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Delivered', 'Sent', 'Failed')),
    masking TEXT DEFAULT 'TELECORP',
    sms_units INTEGER DEFAULT 1
);

-- =========================================================================
-- 21. SYSTEM ALERTS & RISK NOTIFICATIONS (AlertCenterView.tsx)
-- =========================================================================
CREATE TABLE system_alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'reminder', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT false,
    link_module TEXT,
    reference_id TEXT
);

-- =========================================================================
-- 22. API GATEWAYS & COURIER CREDENTIALS (ApiIntegrationsView.tsx)
-- =========================================================================
CREATE TABLE gateway_configs (
    id TEXT PRIMARY KEY,
    service_name TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    environment TEXT DEFAULT 'Live' CHECK (environment IN ('Sandbox', 'Live')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 23. BACKUP SNAPSHOTS ARCHIVES (SettingsView.tsx)
-- =========================================================================
CREATE TABLE backup_snapshots (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    record_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_json TEXT NOT NULL
);

-- =========================================================================
-- 24. AUDIT TRAIL LOGS (AuditLogsView.tsx)
-- =========================================================================
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_role TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    reference_id TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    details TEXT
);

-- =========================================================================
-- 25. SECURITY: DISABLE RLS & GRANT ACCESSIBILITY TO CONNECTED ERP
-- =========================================================================
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE salesmen DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE imeis DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE emi_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_disbursements DISABLE ROW LEVEL SECURITY;
ALTER TABLE money_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE day_closings DISABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_incentive_schemes DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_challans DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_drop_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE phone_exchange_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE salesman_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE gateway_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE backup_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- =========================================================================
-- 26. STORED PROCEDURES, TRIGGERS & ATOMIC BUSINESS FUNCTIONS
-- =========================================================================

-- Trigger Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON system_settings;
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_imeis_updated_at ON imeis;
CREATE TRIGGER trg_imeis_updated_at BEFORE UPDATE ON imeis FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_warranty_claims_updated_at ON warranty_claims;
CREATE TRIGGER trg_warranty_claims_updated_at BEFORE UPDATE ON warranty_claims FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customer_follow_ups_updated_at ON customer_follow_ups;
CREATE TRIGGER trg_customer_follow_ups_updated_at BEFORE UPDATE ON customer_follow_ups FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_gateway_configs_updated_at ON gateway_configs;
CREATE TRIGGER trg_gateway_configs_updated_at BEFORE UPDATE ON gateway_configs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Atomic Wholesale & POS Sales Execution Procedure
CREATE OR REPLACE FUNCTION process_wholesale_sale(
    p_invoice_data JSONB,
    p_imeis_sold TEXT[]
) RETURNS JSONB AS $$
DECLARE
    v_invoice_id TEXT;
    v_invoice_no TEXT;
    v_customer_id TEXT;
    v_due_amount NUMERIC(15, 2);
    v_imei TEXT;
    v_item JSONB;
BEGIN
    v_invoice_id := p_invoice_data->>'id';
    v_invoice_no := p_invoice_data->>'invoiceNo';
    v_customer_id := p_invoice_data->>'customerId';
    v_due_amount := COALESCE((p_invoice_data->>'dueAmount')::NUMERIC, 0.00);

    INSERT INTO sales_invoices (
        id, invoice_no, invoice_type, customer_id, customer_name, customer_phone,
        salesman_id, salesman_name, warehouse_id, warehouse_name, invoice_date,
        due_date, items, subtotal, discount, vat_rate, vat_amount, grand_total, paid_amount,
        due_amount, payment_method, payments, commission_earned, notes, delivery_status,
        status, created_by
    ) VALUES (
        v_invoice_id,
        v_invoice_no,
        COALESCE(p_invoice_data->>'invoiceType', 'Wholesale'),
        v_customer_id,
        p_invoice_data->>'customerName',
        p_invoice_data->>'customerPhone',
        p_invoice_data->>'salesmanId',
        p_invoice_data->>'salesmanName',
        p_invoice_data->>'warehouseId',
        p_invoice_data->>'warehouseName',
        (p_invoice_data->>'invoiceDate')::DATE,
        CASE WHEN p_invoice_data->>'dueDate' IS NOT NULL THEN (p_invoice_data->>'dueDate')::DATE ELSE NULL END,
        COALESCE(p_invoice_data->'items', '[]'::jsonb),
        COALESCE((p_invoice_data->>'subtotal')::NUMERIC, 0.00),
        COALESCE((p_invoice_data->>'discount')::NUMERIC, 0.00),
        COALESCE((p_invoice_data->>'vatRate')::NUMERIC, 0.00),
        COALESCE((p_invoice_data->>'vatAmount')::NUMERIC, 0.00),
        COALESCE((p_invoice_data->>'grandTotal')::NUMERIC, 0.00),
        COALESCE((p_invoice_data->>'paidAmount')::NUMERIC, 0.00),
        v_due_amount,
        COALESCE(p_invoice_data->>'paymentMethod', 'Cash'),
        COALESCE(p_invoice_data->'payments', '[]'::jsonb),
        COALESCE((p_invoice_data->>'commissionEarned')::NUMERIC, 0.00),
        p_invoice_data->>'notes',
        COALESCE(p_invoice_data->>'deliveryStatus', 'Delivered'),
        'Confirmed',
        COALESCE(p_invoice_data->>'createdBy', 'System')
    )
    ON CONFLICT (invoice_no) DO UPDATE SET
        items = EXCLUDED.items,
        subtotal = EXCLUDED.subtotal,
        grand_total = EXCLUDED.grand_total,
        paid_amount = EXCLUDED.paid_amount,
        due_amount = EXCLUDED.due_amount,
        status = EXCLUDED.status;

    -- Update Customer Due atomically
    IF v_due_amount > 0 AND v_customer_id IS NOT NULL THEN
        UPDATE customers
        SET current_due = current_due + v_due_amount
        WHERE id = v_customer_id;
    END IF;

    -- Update Sold IMEIs status and log lifecycle history
    IF p_imeis_sold IS NOT NULL AND array_length(p_imeis_sold, 1) > 0 THEN
        FOREACH v_imei IN ARRAY p_imeis_sold LOOP
            UPDATE imeis
            SET status = 'Sold',
                customer_id = v_customer_id,
                customer_name = p_invoice_data->>'customerName',
                sales_invoice_no = v_invoice_no,
                sales_date = (p_invoice_data->>'invoiceDate')::DATE,
                updated_at = NOW(),
                history = COALESCE(history, '[]'::jsonb) || jsonb_build_object(
                    'date', to_char(NOW(), 'YYYY-MM-DD HH24:MI'),
                    'action', 'Sold via Invoice',
                    'description', 'Sold to ' || COALESCE(p_invoice_data->>'customerName', 'Customer'),
                    'user', COALESCE(p_invoice_data->>'createdBy', 'System'),
                    'referenceNo', v_invoice_no
                )
            WHERE imei1 = v_imei OR imei2 = v_imei;
        END LOOP;
    END IF;

    -- Deduct current stock from product variants safely
    IF p_invoice_data->'items' IS NOT NULL THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_invoice_data->'items') LOOP
            IF v_item->>'variantId' IS NOT NULL THEN
                UPDATE product_variants
                SET current_stock = GREATEST(0, current_stock - COALESCE((v_item->>'quantity')::INTEGER, 1))
                WHERE id = v_item->>'variantId';
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object('success', true, 'invoiceNo', v_invoice_no);
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 27. HIGH-PERFORMANCE PRODUCTION SEARCH & TRANSACTION INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_no ON purchase_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier ON purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_date ON purchase_invoices(purchase_date);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_mobile ON suppliers(mobile);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_money_receipts_customer ON money_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_money_receipts_date ON money_receipts(date);
CREATE INDEX IF NOT EXISTS idx_money_receipts_receipt_no ON money_receipts(receipt_no);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_transfer_no ON stock_transfers(transfer_no);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_wh ON stock_transfers(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_wh ON stock_transfers(to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_voucher ON cash_transactions(voucher_no);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_voucher ON journal_entries(voucher_no);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_delivery_challans_no ON delivery_challans(challan_no);
CREATE INDEX IF NOT EXISTS idx_delivery_challans_invoice ON delivery_challans(invoice_no);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);

-- =========================================================================
-- 28. CLEAN PRODUCTION INFRASTRUCTURE FOUNDATION SEED (ZERO DEMO DATA)
-- =========================================================================
-- NOTE:
-- This section seeds ONLY the structural enterprise baseline:
-- 1. System Settings & Corporate Information (customizable from Settings)
-- 2. Super Admin User accounts for direct production authentication
-- 3. Primary Central Warehouse with 0 stock
-- 4. National Smartphone Brand Taxonomy with 0 products
-- 5. Standard 24 Chart of Accounts (COA) with exactly 0.00 balances
-- 6. Operational Expense Categories with 0 expenses
-- 7. Gateway Integration templates ready for real API keys
--
-- ALL transactional tables remain 100% CLEAN (0 sales, 0 purchases,
-- 0 fake IMEIs, 0 fake customers, 0 fake dues, 0 fake supplier debts).
-- =========================================================================

-- 1. SYSTEM SETTINGS & COMPANY PROFILE
INSERT INTO system_settings (
    id,
    company_name,
    company_address,
    company_phone,
    company_email,
    vat_tax_number,
    default_vat_percent,
    currency,
    currency_symbol,
    valuation_method,
    negative_stock_allowed,
    credit_limit_hard_block,
    max_discount_without_approval,
    language,
    updated_at
) VALUES (
    'primary_settings',
    'FIROZA ENTERPRISES',
    'NADIM VILLA, Level 4, CENTRAL JAME MOSJID, KONABARI, GAZIPUR, Bangladesh',
    '+880 1122000 / +880 712996757',
    'info@fibrozaenterprises.com',
    'BIN: 530914078318 (BTRC Reg: 578902)',
    5.00,
    'BDT',
    '৳',
    'FIFO',
    false,
    true,
    0.00,
    'bn',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    company_address = EXCLUDED.company_address,
    company_phone = EXCLUDED.company_phone,
    company_email = EXCLUDED.company_email,
    vat_tax_number = EXCLUDED.vat_tax_number,
    default_vat_percent = EXCLUDED.default_vat_percent,
    currency = EXCLUDED.currency,
    currency_symbol = EXCLUDED.currency_symbol,
    valuation_method = EXCLUDED.valuation_method,
    negative_stock_allowed = EXCLUDED.negative_stock_allowed,
    credit_limit_hard_block = EXCLUDED.credit_limit_hard_block,
    max_discount_without_approval = EXCLUDED.max_discount_without_approval,
    language = EXCLUDED.language,
    updated_at = NOW();

-- 2. ESSENTIAL ADMINISTRATIVE USERS (Super Admin RBAC)
INSERT INTO app_users (id, email, name, role, password, status, phone, department, branch_name, avatar, last_login, created_at, updated_at) VALUES
('8d510069-b154-440a-aa3e-0999a9c354e1', 'mansurazad@gmail.com', 'Mansur Azad', 'Super Admin', 'M#112233@a', 'Active', '+880 1711-002233', 'Executive Board / Managing Director', 'Headquarters (Motijheel, Dhaka)', '👨‍💼', NOW(), NOW(), NOW()),
('user-admin', 'admin@telecorp.com', 'System Administrator', 'Super Admin', 'admin', 'Active', '+880 1711-002233', 'IT & Systems Operations', 'Headquarters (Motijheel, Dhaka)', '👨‍💼', NOW(), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    password = EXCLUDED.password,
    status = EXCLUDED.status,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    branch_name = EXCLUDED.branch_name,
    updated_at = NOW();

-- 3. PRIMARY CENTRAL WAREHOUSE (1 Central Location, 0 Stock)
INSERT INTO warehouses (id, code, name, type, address, city, manager_name, contact_number, status, created_at) VALUES
('wh-1', 'WH-CENTRAL', 'Central Warehouse (Main Distribution Hub)', 'Central Warehouse', 'Motijheel Commercial Area, Dhaka-1000', 'Dhaka', 'Operations Manager', '+880 1711-002233', 'Active', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    type = EXCLUDED.type,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    status = EXCLUDED.status;

-- 4. OFFICIAL BANGLADESHI SMARTPHONE BRAND TAXONOMY (Standard Reference Directory)
INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES
('brand-1', 'Samsung', 'SAM', '📱', 'South Korea', 'Samsung Electronics Official Bangladesh Lineup', 'Active', NOW()),
('brand-2', 'Apple', 'APL', '🍏', 'United States', 'Apple Authorized Dealer Stock (iPhones & Accessories)', 'Active', NOW()),
('brand-3', 'Xiaomi', 'MI', '🟠', 'China', 'Xiaomi & Redmi Series Official National Distribution', 'Active', NOW()),
('brand-4', 'Vivo', 'VIV', '🔷', 'China', 'Vivo Bangladesh Official Distribution', 'Active', NOW()),
('brand-5', 'OPPO', 'OPP', '🟢', 'China', 'OPPO Mobile Bangladesh Authorized Supply', 'Active', NOW()),
('brand-6', 'Realme', 'RLM', '🟡', 'China', 'Realme Youth Flagship Series', 'Active', NOW()),
('brand-7', 'OnePlus', '1PL', '🔴', 'China', 'OnePlus Official BD Flagship Series', 'Active', NOW()),
('brand-8', 'Infinix', 'INF', '⚡', 'Hong Kong', 'Infinix Smart & Note Series', 'Active', NOW()),
('brand-9', 'Tecno', 'TEC', '🔵', 'Hong Kong', 'Tecno Mobile Camon & Spark Series', 'Active', NOW()),
('brand-10', 'Honor', 'HNR', '💠', 'China', 'Honor Magic & X Series Official BD', 'Active', NOW()),
('brand-11', 'Motorola', 'MOT', '🦇', 'United States', 'Motorola Edge & G Series', 'Active', NOW()),
('brand-12', 'Nokia', 'NOK', '📞', 'Finland', 'HMD Global Nokia Devices', 'Active', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    logo = EXCLUDED.logo,
    status = EXCLUDED.status;

-- 5. STANDARD 24 CHART OF ACCOUNTS (General Ledger Foundation, STRICTLY 0.00 BALANCES)
INSERT INTO chart_of_accounts (id, code, name, type, nature, balance, description, is_system, created_at) VALUES
('coa-1010', '1010', 'Cash in Hand (Main Vault)', 'Asset', 'Debit', 0.00, 'Physical cash in central vault & branch cash drawers', true, NOW()),
('coa-1020', '1020', 'Bank Operating Accounts', 'Asset', 'Debit', 0.00, 'All commercial bank operational checking/current accounts', true, NOW()),
('coa-1030', '1030', 'Accounts Receivable (Trade Debtors)', 'Asset', 'Debit', 0.00, 'Outstanding credit balance owed by dealer network', true, NOW()),
('coa-1040', '1040', 'Merchandise Inventory Asset', 'Asset', 'Debit', 0.00, 'Current total valuation of serialized smartphone stock', true, NOW()),
('coa-1050', '1050', 'Advance to Suppliers / Importers', 'Asset', 'Debit', 0.00, 'Advance consignments and LC payments to brand distributors', true, NOW()),
('coa-1060', '1060', 'Undeposited Funds / Cash in Transit', 'Asset', 'Debit', 0.00, 'Funds collected by DSR salesmen pending bank deposit', true, NOW()),
('coa-2010', '2010', 'Accounts Payable (Trade Creditors)', 'Liability', 'Credit', 0.00, 'Credit dues owed to national mobile importers & brands', true, NOW()),
('coa-2020', '2020', 'Output VAT Payable (NBR / BTRC)', 'Liability', 'Credit', 0.00, 'Value Added Tax collected from invoices pending NBR deposit', true, NOW()),
('coa-2030', '2030', 'Customer Security Deposits', 'Liability', 'Credit', 0.00, 'Security caution money held from wholesale dealers', true, NOW()),
('coa-2040', '2040', 'Accrued Salaries & Operational Payables', 'Liability', 'Credit', 0.00, 'Salaries and recurring dues payable at month end', true, NOW()),
('coa-3010', '3010', 'Shareholders Paid-Up Capital', 'Equity', 'Credit', 0.00, 'Principal investment and equity capital by owners', true, NOW()),
('coa-3020', '3020', 'Retained Earnings', 'Equity', 'Credit', 0.00, 'Cumulative business net profit carried forward', true, NOW()),
('coa-3030', '3030', 'Owner Drawings / Dividends', 'Equity', 'Debit', 0.00, 'Drawings or dividend disbursements taken by shareholders', true, NOW()),
('coa-4010', '4010', 'Wholesale Handset Sales Revenue', 'Revenue', 'Credit', 0.00, 'Turnover from B2B dealership & regional distribution sales', true, NOW()),
('coa-4020', '4020', 'Retail POS Sales Revenue', 'Revenue', 'Credit', 0.00, 'Direct walk-in counter retail smartphone & accessory revenue', true, NOW()),
('coa-4030', '4030', 'Brand Target Incentives & Sell-Out Rebates', 'Revenue', 'Credit', 0.00, 'Quarterly volume rebates & price protection credits from brands', true, NOW()),
('coa-4040', '4040', 'Other Operating Income', 'Revenue', 'Credit', 0.00, 'RMA service commissions, exchange scrap margin, etc.', true, NOW()),
('coa-5010', '5010', 'Cost of Goods Sold (COGS)', 'Expense', 'Debit', 0.00, 'Direct landed cost of smartphones and accessories sold', true, NOW()),
('coa-5020', '5020', 'Logistics, Courier & Freight Charges', 'Expense', 'Debit', 0.00, 'Steadfast, Sundarban, van transport and delivery costs', true, NOW()),
('coa-5030', '5030', 'Warehouse & Showroom Lease Rent', 'Expense', 'Debit', 0.00, 'Monthly lease rent for warehouse hub and retail experience centers', true, NOW()),
('coa-5040', '5040', 'Staff Salaries, TA/DA & Commissions', 'Expense', 'Debit', 0.00, 'Employee base payroll and salesman field collection commissions', true, NOW()),
('coa-5050', '5050', 'Utilities, Internet & Cloud Server Hosting', 'Expense', 'Debit', 0.00, 'Electricity, broadband fiber, Supabase cloud & telecom bills', true, NOW()),
('coa-5060', '5060', 'Branding, Signboards & Dealer Marketing', 'Expense', 'Debit', 0.00, 'Dealer shop branding, leaflets, promotional campaigns', true, NOW()),
('coa-5070', '5070', 'Bank Charges & MFS Gateway Fees', 'Expense', 'Debit', 0.00, 'Bank transaction charges, bKash/Nagad merchant checkout fees', true, NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    nature = EXCLUDED.nature,
    balance = EXCLUDED.balance,
    description = EXCLUDED.description;

-- 6. STANDARD OPERATIONAL EXPENSE CATEGORIES
INSERT INTO expense_categories (id, name, description, created_at) VALUES
('exp-cat-1', 'Logistics & Courier Delivery', 'Courier partner charges (Steadfast, Sundarban, SA Paribahan) and fuel', NOW()),
('exp-cat-2', 'Showroom & Warehouse Rent', 'Monthly lease rentals for central warehouse hub and regional branch outlets', NOW()),
('exp-cat-3', 'Staff Salaries & Field Allowance', 'Executive staff salaries, TA/DA, and field salesman daily allowances', NOW()),
('exp-cat-4', 'Marketing & Dealer Incentives', 'Signboard branding, shop banners, retail gifts and promotions', NOW()),
('exp-cat-5', 'Office Utilities & Connectivity', 'High-speed internet, electricity, cloud hosting and enterprise software', NOW()),
('exp-cat-6', 'Repairs, Hardware & Office Maintenance', 'Packaging equipment, barcode printers, electrical and facility repairs', NOW()),
('exp-cat-7', 'Banking, Financial & MFS Gateway Fees', 'Bank annual maintenance charges, checkbooks, bKash merchant charges', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 7. GATEWAY CONFIGURATION TEMPLATES (Ready for Live Production API Credentials)
INSERT INTO gateway_configs (id, service_name, provider, credentials, is_active, environment, updated_at) VALUES
('gw-sms', 'sms', 'Greenweb / Onnorokom SMS Gateway (Bangladesh)', '{"apiUrl":"https://api.greenweb.com.bd/api.php","token":"","senderId":"TELECORP"}'::jsonb, false, 'Live', NOW()),
('gw-bkash', 'bkash', 'bKash Tokenized Merchant Checkout API', '{"appKey":"","appSecret":"","username":"","password":"","merchantNumber":""}'::jsonb, false, 'Live', NOW()),
('gw-courier', 'steadfast', 'Steadfast Courier Logistics API', '{"apiKey":"","secretKey":"","baseUrl":"https://portal.steadfast.com.bd/api/v1"}'::jsonb, false, 'Live', NOW())
ON CONFLICT (id) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    provider = EXCLUDED.provider,
    updated_at = NOW();
