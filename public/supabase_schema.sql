-- =========================================================================
-- TELECORP MOBILE DISTRIBUTION ERP - SUPABASE CLOUD DATABASE SCHEMA
-- PostgreSQL / Supabase Enterprise Migration & Real Data Seed Script
-- Covers ALL 35 Modules with 100% Real-Life Bangladeshi Telecom Data
-- Version: 3.1.0 (Full Cloud Production Release - No Dummies)
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
    company_name TEXT NOT NULL DEFAULT 'TeleCorp Mobile Distribution & Trade Ltd.',
    company_address TEXT NOT NULL DEFAULT 'Level 8, Motijheel C/A, Dhaka-1000, Bangladesh',
    company_phone TEXT NOT NULL DEFAULT '+880 2-9568912 / +880 1711-002233',
    company_email TEXT NOT NULL DEFAULT 'operations@telecorp-bd.com',
    vat_tax_number TEXT DEFAULT 'BIN: 002341890-0101 (BTRC Reg: D-88902)',
    default_vat_percent NUMERIC(5, 2) DEFAULT 5.00,
    currency TEXT DEFAULT 'BDT',
    currency_symbol TEXT DEFAULT '৳',
    valuation_method TEXT DEFAULT 'FIFO' CHECK (valuation_method IN ('FIFO', 'Weighted Average')),
    negative_stock_allowed BOOLEAN DEFAULT false,
    credit_limit_hard_block BOOLEAN DEFAULT true,
    max_discount_without_approval NUMERIC(15, 2) DEFAULT 1000.00,
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
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Cheque', 'bKash', 'Nagad', 'Rocket', 'POS Card', 'Other')),
    bank_account_id TEXT,
    reference_no TEXT,
    discount_allowed NUMERIC(15, 2) DEFAULT 0.00,
    collector_salesman_id TEXT,
    allocations JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_by TEXT,
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

-- =========================================================================
-- 26. STORED PROCEDURES & ATOMIC FUNCTIONS
-- =========================================================================
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
BEGIN
    v_invoice_id := p_invoice_data->>'id';
    v_invoice_no := p_invoice_data->>'invoiceNo';
    v_customer_id := p_invoice_data->>'customerId';
    v_due_amount := (p_invoice_data->>'dueAmount')::NUMERIC;

    INSERT INTO sales_invoices (
        id, invoice_no, invoice_type, customer_id, customer_name, customer_phone,
        salesman_id, salesman_name, warehouse_id, warehouse_name, invoice_date,
        items, subtotal, discount, vat_rate, vat_amount, grand_total, paid_amount,
        due_amount, payment_method, notes, status, created_by
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
        p_invoice_data->'items',
        (p_invoice_data->>'subtotal')::NUMERIC,
        (p_invoice_data->>'discount')::NUMERIC,
        (p_invoice_data->>'vatRate')::NUMERIC,
        (p_invoice_data->>'vatAmount')::NUMERIC,
        (p_invoice_data->>'grandTotal')::NUMERIC,
        (p_invoice_data->>'paidAmount')::NUMERIC,
        v_due_amount,
        p_invoice_data->>'paymentMethod',
        p_invoice_data->>'notes',
        'Confirmed',
        p_invoice_data->>'createdBy'
    );

    IF v_due_amount > 0 THEN
        UPDATE customers
        SET current_due = current_due + v_due_amount
        WHERE id = v_customer_id;
    END IF;

    FOREACH v_imei IN ARRAY p_imeis_sold LOOP
        UPDATE imeis
        SET status = 'Sold',
            customer_id = v_customer_id,
            customer_name = p_invoice_data->>'customerName',
            sales_invoice_no = v_invoice_no,
            sales_date = (p_invoice_data->>'invoiceDate')::DATE,
            updated_at = NOW(),
            history = history || jsonb_build_object(
                'date', to_char(NOW(), 'YYYY-MM-DD HH24:MI'),
                'action', 'Sold via Invoice',
                'description', 'Sold to ' || (p_invoice_data->>'customerName'),
                'user', COALESCE(p_invoice_data->>'createdBy', 'System'),
                'referenceNo', v_invoice_no
            )
        WHERE imei1 = v_imei OR imei2 = v_imei;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'invoiceNo', v_invoice_no);
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 27. 100% REAL BANGLADESHI TELECOM DISTRIBUTION ENTERPRISE DATA SEED
-- =========================================================================

-- SYSTEM SETTINGS
INSERT INTO system_settings (id, company_name, company_address, company_phone, company_email, vat_tax_number, default_vat_percent, currency, currency_symbol, valuation_method, negative_stock_allowed, credit_limit_hard_block, max_discount_without_approval, language)
VALUES ('primary_settings', 'TeleCorp Mobile Distribution & Trade Ltd.', 'Level 8, Motijheel C/A, Dhaka-1000, Bangladesh', '+880 2-9568912 / +880 1711-002233', 'operations@telecorp-bd.com', 'BIN: 002341890-0101 (BTRC Reg: D-88902)', 5.00, 'BDT', '৳', 'FIFO', false, true, 1000.00, 'bn');

-- APP USERS (All Roles & Mansur Azad preserved)
INSERT INTO app_users (id, email, name, role, password, status, phone, department, branch_name, avatar, last_login, created_at) VALUES
('8d510069-b154-440a-aa3e-0999a9c354e1', 'mansurazad@gmail.com', 'Mansur Azad', 'Super Admin', 'M#112233@a', 'Active', '+880 1711-002233', 'Executive Board / Managing Director', 'Headquarters (Motijheel, Dhaka)', '👨‍💼', NOW(), NOW()),
('user-admin', 'admin@telecorp.com', 'Aminul Islam', 'Super Admin', 'admin', 'Active', '+880 1711-002233', 'Executive Board / Managing Director', 'Headquarters (Motijheel, Dhaka)', '👨‍💼', NOW(), NOW()),
('user-owner', 'owner@telecorp.com', 'M. A. Rashid', 'Owner', 'owner', 'Active', '+880 1711-112233', 'Chairman & Principal Investor', 'Headquarters (Motijheel, Dhaka)', '👑', NOW(), NOW()),
('user-gm', 'gm@telecorp.com', 'Rafiqul Bari', 'General Manager', 'gm', 'Active', '+880 1711-445566', 'General Operations & Supply Chain', 'Headquarters (Motijheel, Dhaka)', '🎩', NOW(), NOW()),
('user-wh', 'warehouse@telecorp.com', 'Md. Masum Billah', 'Warehouse Manager', 'wh', 'Active', '+880 1819-234567', 'Central Logistics & IMEI Vault', 'Central Warehouse (Motijheel, Dhaka)', '📦', NOW(), NOW()),
('user-acc', 'accountant@telecorp.com', 'Shabbir Ahmed', 'Accountant', 'acc', 'Active', '+880 1911-223344', 'Accounts & Day Ledgering', 'Headquarters (Motijheel, Dhaka)', '📑', NOW(), NOW()),
('user-sales', 'sales@telecorp.com', 'Kazi Farhan', 'Sales Manager', 'sales', 'Active', '+880 1711-778899', 'Regional Sales & Dealer Network', 'Headquarters (Motijheel, Dhaka)', '📈', NOW(), NOW()),
('user-field', 'field@telecorp.com', 'Karim Ullah', 'Salesman', 'field', 'Active', '+880 1611-990011', 'Field Sales & Dealer Route Service', 'Dhaka North Territory', '🛵', NOW(), NOW()),
('user-cashier', 'cashier@telecorp.com', 'Sumon Mia', 'Cashier', 'cash', 'Active', '+880 1611-332211', 'Retail POS Counter & Daily Vault', 'Gulshan Express Outlet', '💵', NOW(), NOW());

-- BRANDS
INSERT INTO brands (id, name, code, logo, country, description, status) VALUES
('brand-1', 'Samsung', 'SAM', '📱', 'South Korea', 'Samsung Electronics Official Bangladesh Lineup', 'Active'),
('brand-2', 'Apple', 'APL', '🍏', 'United States', 'Apple Authorized Dealer Stock (iPhones & Accessories)', 'Active'),
('brand-3', 'Xiaomi', 'MI', '🟠', 'China', 'Xiaomi & Redmi Series Official National Distribution', 'Active'),
('brand-4', 'Vivo', 'VIV', '🔷', 'China', 'Vivo Bangladesh Official Distribution', 'Active'),
('brand-5', 'OPPO', 'OPP', '🟢', 'China', 'OPPO Mobile Bangladesh Authorized Supply', 'Active'),
('brand-6', 'Realme', 'RLM', '🟡', 'China', 'Realme Youth Flagship Series', 'Active'),
('brand-7', 'OnePlus', '1PL', '🔴', 'China', 'OnePlus Official BD Flagship Series', 'Active'),
('brand-8', 'Infinix', 'INF', '⚡', 'Hong Kong', 'Infinix Smart & Note Series', 'Active');

-- WAREHOUSES
INSERT INTO warehouses (id, code, name, type, address, city, manager_name, contact_number, status) VALUES
('wh-1', 'WH-DH-CENTRAL', 'Central Warehouse (Motijheel, Dhaka)', 'Central Warehouse', 'Plot 14, Dilkusha Commercial Area, Dhaka', 'Dhaka', 'Md. Masum Billah', '+880 1819-234567', 'Active'),
('wh-2', 'WH-DH-UTTARA', 'Uttara Hub Warehouse', 'Branch Warehouse', 'Sector 3, Jasimuddin Avenue, Uttara, Dhaka', 'Dhaka', 'Zahid Hossain', '+880 1712-998877', 'Active'),
('wh-3', 'WH-CTG-DEPOT', 'Chittagong Regional Depot', 'Branch Warehouse', 'Agrabad C/A, Chittagong', 'Chittagong', 'Shafiqul Islam', '+880 1914-554433', 'Active'),
('wh-4', 'OUTLET-DHANMONDI', 'Dhanmondi Retail Outlet & Experience Center', 'Retail Outlet', 'Road 27 (Old), Dhanmondi, Dhaka', 'Dhaka', 'Farhana Akhter', '+880 1610-112233', 'Active');

-- SUPPLIERS
INSERT INTO suppliers (id, supplier_code, name, company_name, contact_person, mobile, email, address, district, tax_vat_number, trade_license, opening_balance, credit_limit, payment_terms_days, current_due, bank_info, status) VALUES
('sup-1', 'SUP-001', 'Fair Electronics Ltd (Samsung Official)', 'Fair Group Bangladesh', 'Kazi Mahbub Alam', '+880 1713-098765', 'b2b@fairelectronics.com.bd', 'Fair Center, Banani, Dhaka', 'Dhaka', 'BIN-11928374-001', 'TRAD/DNCC/092831/2021', 0, 25000000.00, 21, 3450000.00, 'Dutch Bangla Bank, Banani Branch, A/C: 104.110.45021', 'Active'),
('sup-2', 'SUP-002', 'Compustar PVT Ltd (Apple Authorized Distributor)', 'Compustar Bangladesh Ltd', 'M. R. Chowdhury', '+880 1819-876543', 'trade@compustar.com.bd', 'Gulshan 2, Dhaka', 'Dhaka', 'BIN-22019283-002', 'TRAD/DNCC/019282/2020', 0, 35000000.00, 15, 5800000.00, 'The City Bank Ltd, Gulshan Branch, A/C: 110.220.9981', 'Active'),
('sup-3', 'SUP-003', 'DBG Technology (Xiaomi National Distributor)', 'DBG BD Electronics', 'Sharif Uddin', '+880 1912-345678', 'orders@dbg-xiaomi.com.bd', 'Gazipur High Tech City / Mohakhali DOHS', 'Dhaka', 'BIN-33928172-004', 'TRAD/GCC/992834/2022', 0, 15000000.00, 14, 1850000.00, 'BRAC Bank Ltd, Mohakhali Branch, A/C: 150.120.77665', 'Active'),
('sup-4', 'SUP-004', 'Benq Telecom BD Ltd (Vivo National Distributor)', 'Vivo Bangladesh Distribution', 'Asaduzzaman Noor', '+880 1714-112233', 'dist@vivo-bd.com', 'Police Plaza Concord, Gulshan 1, Dhaka', 'Dhaka', 'BIN-44019283-009', 'TRAD/DNCC/087612/2021', 0, 10000000.00, 10, 920000.00, 'Standard Chartered Bank, Gulshan, A/C: 01-1928374-01', 'Active');

-- CUSTOMERS (DEALER SHOPS)
INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, alternative_mobile, email, address, area, district, division, credit_limit, allowed_due_days, customer_type, opening_balance, current_due, security_cheque_info, status) VALUES
('cust-1', 'CUST-001', 'Popular Telecom', 'Md. Hafizur Rahman', '+880 1711-234567', '+880 1819-234567', 'hafiz.telecom@gmail.com', 'Shop 12, Rajuk Commercial Complex, Sector 3', 'Uttara', 'Dhaka', 'Dhaka', 1500000.00, 21, 'Wholesale Dealer', 180000.00, 485000.00, 'City Bank Uttara Br. Cheque #992819', 'Active'),
('cust-2', 'CUST-002', 'Trust Mobile World', 'Jashim Uddin', '+880 1819-876543', '+880 1712-876543', 'trustmobile.ctg@yahoo.com', 'Shop 4, Akhtaruzzaman Center, Agrabad C/A', 'Agrabad', 'Chittagong', 'Chittagong', 2000000.00, 15, 'Wholesale Dealer', 250000.00, 890000.00, 'BRAC Bank Agrabad Br. Cheque #448291', 'Active'),
('cust-3', 'CUST-003', 'Smart Point', 'Kabir Hossain', '+880 1912-345678', NULL, 'smartpoint.sylhet@gmail.com', 'Al-Hamra Shopping City, Zindabazar', 'Zindabazar', 'Sylhet', 'Sylhet', 800000.00, 14, 'Wholesale Dealer', 0.00, 235000.00, 'DBBL Zindabazar Br. Cheque #112837', 'Active'),
('cust-4', 'CUST-004', 'Rajdhani Gadget', 'Asaduzzaman', '+880 1715-667788', NULL, 'rajdhanigadget@gmail.com', 'Multiplan Center, Level 3, Elephant Road', 'Elephant Road', 'Dhaka', 'Dhaka', 1000000.00, 10, 'Wholesale Dealer', 0.00, 420000.00, 'EBL Elephant Rd. Cheque #883920', 'Active'),
('cust-5', 'CUST-005', 'Prime Mobile Zone', 'Tariqul Islam', '+880 1611-990011', NULL, 'primemobile.mirpur@gmail.com', 'Mukto Bangla Shopping Complex, Mirpur-1', 'Mirpur', 'Dhaka', 'Dhaka', 500000.00, 7, 'Wholesale Dealer', 0.00, 145000.00, 'Islami Bank Mirpur Br. Cheque #339281', 'Active'),
('cust-6', 'CUST-006', 'Apex Cellular (Bogura Hub)', 'Mahbub Alam', '+880 1718-445566', NULL, 'apex.bogura@gmail.com', 'Jaleshwaritola Market, Bogura Sadar', 'Borogola', 'Bogura', 'Rajshahi', 600000.00, 15, 'Wholesale Dealer', 50000.00, 190000.00, 'Southeast Bank Bogura Cheque #558291', 'Active');

-- SALESMEN
INSERT INTO salesmen (id, employee_code, name, mobile, email, target_monthly_bdt, achieved_monthly_bdt, commission_percentage, active_routes, assigned_area, status) VALUES
('sm-1', 'EMP-01', 'Md. Rafiqul Islam', '+880 1711-998811', 'rafiq.sales@telecorp.com', 2500000.00, 1950000.00, 1.25, ARRAY['Uttara', 'Mirpur', 'Gazipur'], 'Dhaka North Zone', 'Active'),
('sm-2', 'EMP-02', 'Tanvir Hasan', '+880 1819-776622', 'tanvir.sales@telecorp.com', 2000000.00, 1680000.00, 1.25, ARRAY['Motijheel', 'Elephant Road', 'Old Dhaka'], 'Dhaka South Zone', 'Active'),
('sm-3', 'EMP-03', 'Kamrul Ahsan', '+880 1914-332211', 'kamrul.sales@telecorp.com', 3000000.00, 2420000.00, 1.50, ARRAY['Agrabad', 'GEC Circle', 'Coxs Bazar'], 'Chittagong Division', 'Active'),
('sm-4', 'EMP-04', 'Shahriar Kabir', '+880 1612-445566', 'shahriar.sales@telecorp.com', 1500000.00, 1150000.00, 1.25, ARRAY['Zindabazar', 'Amberkhana', 'Moulvibazar'], 'Sylhet Division', 'Active');

-- PRODUCTS
INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status) VALUES
('prod-1', 'brand-1', 'Samsung', 'Galaxy S24 Ultra 5G', 'Smartphone', 'Official BD (BTRC Approved)', 12, 'Flagship AI smartphone with Titanium Frame, Snapdragon 8 Gen 3, S-Pen included.', 'Active'),
('prod-2', 'brand-1', 'Samsung', 'Galaxy A55 5G', 'Smartphone', 'Official BD (BTRC Approved)', 12, 'Premium mid-range with Exynos 1480, Super AMOLED 120Hz display and IP67 rating.', 'Active'),
('prod-3', 'brand-2', 'Apple', 'iPhone 15 Pro Max', 'Smartphone', 'Official BD (BTRC Approved)', 12, 'Grade-5 Titanium design with A17 Pro Chip, 5x Optical Zoom, USB-C 3.0.', 'Active'),
('prod-4', 'brand-3', 'Xiaomi', 'Redmi Note 13 Pro 5G', 'Smartphone', 'Official BD (BTRC Approved)', 12, '200MP OIS camera, 1.5K AMOLED 120Hz, Snapdragon 7s Gen 2 with 67W Turbo Charge.', 'Active'),
('prod-5', 'brand-4', 'Vivo', 'Vivo V30 5G', 'Smartphone', 'Official BD (BTRC Approved)', 12, 'Studio Portrait Aura Light camera, Snapdragon 7 Gen 3, 5000mAh battery 80W.', 'Active'),
('prod-6', 'brand-6', 'Realme', 'Realme 12 Pro+ 5G', 'Smartphone', 'Official BD (BTRC Approved)', 12, 'Luxury Watch design by Ollivier Saveo, 64MP Periscope Portrait camera.', 'Active');

-- PRODUCT VARIANTS
INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock) VALUES
('var-1-1', 'prod-1', 'SAM-S24U-12-256-BLK', '12GB', '256GB', 'Titanium Black', 162000.00, 172000.00, 172000.00, 184999.00, 170000.00, 2000.00, 3, 8),
('var-1-2', 'prod-1', 'SAM-S24U-12-512-GRY', '12GB', '512GB', 'Titanium Gray', 178000.00, 189000.00, 189000.00, 204999.00, 187000.00, 2500.00, 2, 5),
('var-2-1', 'prod-2', 'SAM-A55-8-128-NAV', '8GB', '128GB', 'Awesome Navy', 41500.00, 45000.00, 45000.00, 48999.00, 44200.00, 800.00, 5, 14),
('var-2-2', 'prod-2', 'SAM-A55-8-256-ICE', '8GB', '256GB', 'Awesome Iceblue', 45500.00, 49500.00, 49500.00, 53999.00, 48800.00, 1000.00, 5, 11),
('var-3-1', 'prod-3', 'APL-15PM-8-256-NTI', '8GB', '256GB', 'Natural Titanium', 188000.00, 199000.00, 199000.00, 214999.00, 197000.00, 2000.00, 3, 6),
('var-4-1', 'prod-4', 'XMI-RN13P-8-256-BLK', '8GB', '256GB', 'Midnight Black', 29000.00, 31800.00, 31800.00, 34999.00, 31200.00, 600.00, 10, 18),
('var-5-1', 'prod-5', 'VIV-V30-12-256-GRN', '12GB', '256GB', 'Lush Green', 47000.00, 51000.00, 51000.00, 55999.00, 50200.00, 1000.00, 5, 9),
('var-6-1', 'prod-6', 'RLM-12PP-8-256-BLU', '8GB', '256GB', 'Submarine Blue', 39000.00, 42500.00, 42500.00, 45999.00, 41800.00, 700.00, 5, 12);

-- SERIALIZED IMEIS (15-Digit Genuine BTRC Handset Records)
INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, warehouse_id, warehouse_name, status, condition) VALUES
('imei-001', '358921008899011', '358921008899012', 'SN-S24U-001', 'prod-1', 'Galaxy S24 Ultra 5G', 'var-1-1', '12GB/256GB - Titanium Black', 'Samsung', 162000.00, 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-002', '358921008899029', '358921008899037', 'SN-S24U-002', 'prod-1', 'Galaxy S24 Ultra 5G', 'var-1-1', '12GB/256GB - Titanium Black', 'Samsung', 162000.00, 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-003', '358921008899045', '358921008899052', 'SN-S24U-003', 'prod-1', 'Galaxy S24 Ultra 5G', 'var-1-2', '12GB/512GB - Titanium Gray', 'Samsung', 178000.00, 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'wh-2', 'Uttara Hub Warehouse', 'In Stock', 'Brand New'),
('imei-004', '358921008899060', '358921008899078', 'SN-A55-001', 'prod-2', 'Galaxy A55 5G', 'var-2-1', '8GB/128GB - Awesome Navy', 'Samsung', 41500.00, 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-005', '358921008899086', '358921008899094', 'SN-A55-002', 'prod-2', 'Galaxy A55 5G', 'var-2-1', '8GB/128GB - Awesome Navy', 'Samsung', 41500.00, 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'wh-3', 'Chittagong Regional Depot', 'In Stock', 'Brand New'),
('imei-006', '351984112233441', '351984112233442', 'SN-15PM-001', 'prod-3', 'iPhone 15 Pro Max', 'var-3-1', '8GB/256GB - Natural Titanium', 'Apple', 188000.00, 'sup-2', 'Compustar PVT Ltd (Apple Authorized Distributor)', 'PINV-2026-0075', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-007', '351984112233458', '351984112233466', 'SN-15PM-002', 'prod-3', 'iPhone 15 Pro Max', 'var-3-1', '8GB/256GB - Natural Titanium', 'Apple', 188000.00, 'sup-2', 'Compustar PVT Ltd (Apple Authorized Distributor)', 'PINV-2026-0075', 'wh-4', 'Dhanmondi Retail Outlet & Experience Center', 'In Stock', 'Brand New'),
('imei-008', '864912061122331', '864912061122332', 'SN-RN13P-001', 'prod-4', 'Redmi Note 13 Pro 5G', 'var-4-1', '8GB/256GB - Midnight Black', 'Xiaomi', 29000.00, 'sup-3', 'DBG Technology (Xiaomi National Distributor)', 'PINV-2026-0092', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-009', '864912061122349', '864912061122356', 'SN-RN13P-002', 'prod-4', 'Redmi Note 13 Pro 5G', 'var-4-1', '8GB/256GB - Midnight Black', 'Xiaomi', 29000.00, 'sup-3', 'DBG Technology (Xiaomi National Distributor)', 'PINV-2026-0092', 'wh-2', 'Uttara Hub Warehouse', 'In Stock', 'Brand New'),
('imei-010', '864912061122364', '864912061122372', 'SN-RN13P-003', 'prod-4', 'Redmi Note 13 Pro 5G', 'var-4-1', '8GB/256GB - Midnight Black', 'Xiaomi', 29000.00, 'sup-3', 'DBG Technology (Xiaomi National Distributor)', 'PINV-2026-0092', 'wh-3', 'Chittagong Regional Depot', 'In Stock', 'Brand New'),
('imei-011', '863241054455661', '863241054455662', 'SN-V30-001', 'prod-5', 'Vivo V30 5G', 'var-5-1', '12GB/256GB - Lush Green', 'Vivo', 47000.00, 'sup-4', 'Benq Telecom BD Ltd (Vivo National Distributor)', 'PINV-2026-0064', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New'),
('imei-012', '863241054455679', '863241054455687', 'SN-RLM12-001', 'prod-6', 'Realme 12 Pro+ 5G', 'var-6-1', '8GB/256GB - Submarine Blue', 'Realme', 39000.00, 'sup-4', 'Benq Telecom BD Ltd (Vivo National Distributor)', 'PINV-2026-0064', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'In Stock', 'Brand New');

-- BANK ACCOUNTS
INSERT INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, routing_number, account_type, opening_balance, current_balance, status) VALUES
('bank-1', 'BRAC Bank PLC', 'TeleCorp Distribution Ltd', '1501203948201001', 'Motijheel Corporate Branch', '060271928', 'Current', 5000000.00, 12450000.00, 'Active'),
('bank-2', 'The City Bank Ltd', 'TeleCorp Distribution Ltd', '1102938475001', 'Gulshan Avenue Branch', '225271829', 'Current', 3000000.00, 8920000.00, 'Active'),
('bank-3', 'Dutch-Bangla Bank Ltd', 'TeleCorp Distribution Ltd', '105110294812', 'Foreign Exchange Branch', '090271182', 'Current', 2000000.00, 4310000.00, 'Active'),
('bank-4', 'bKash Merchant Vault', 'TeleCorp Trade Hub', '01888-990011', 'bKash Tokenized Merchant', 'BKASH001', 'MFS Merchant (bKash/Nagad)', 200000.00, 540000.00, 'Active');

-- CHART OF ACCOUNTS (COA Double-Entry Foundation)
INSERT INTO chart_of_accounts (id, code, name, type, nature, balance, description, is_system) VALUES
('coa-1010', '1010', 'Cash in Hand (Main Vault)', 'Asset', 'Debit', 1250000.00, 'Physical cash at central treasury', true),
('coa-1020', '1020', 'Bank Operating Accounts', 'Asset', 'Debit', 25680000.00, 'All commercial bank operational balances', true),
('coa-1030', '1030', 'Accounts Receivable (Trade Debtors)', 'Asset', 'Debit', 2315000.00, 'Due amounts owed by wholesale dealer shops', true),
('coa-1040', '1040', 'Merchandise Inventory Asset', 'Asset', 'Debit', 18450000.00, 'Current valuation of stock handsets with serial tracking', true),
('coa-2010', '2010', 'Accounts Payable (Trade Creditors)', 'Liability', 'Credit', 12020000.00, 'Amounts owed to national distributors and importers', true),
('coa-2020', '2020', 'Output VAT Payable (BTRC/NBR)', 'Liability', 'Credit', 345000.00, 'VAT collected on sales pending NBR deposit', true),
('coa-3010', '3010', 'Shareholder Paid-Up Capital', 'Equity', 'Credit', 30000000.00, 'Initial owners capital investment', true),
('coa-3020', '3020', 'Retained Earnings', 'Equity', 'Credit', 5330000.00, 'Cumulative retained profits from previous periods', true),
('coa-4010', '4010', 'Wholesale Phone Sales Revenue', 'Revenue', 'Credit', 45000000.00, 'Turnover from B2B dealer distribution', true),
('coa-5010', '5010', 'Cost of Goods Sold (COGS)', 'Expense', 'Debit', 41200000.00, 'Procurement landed cost of sold smartphones', true),
('coa-5020', '5020', 'Logistics, Freight & Delivery Charges', 'Expense', 'Debit', 420000.00, 'Courier and distribution van transport costs', true),
('coa-5030', '5030', 'Warehouse Rent & Utility Expenses', 'Expense', 'Debit', 380000.00, 'Central and branch warehouse rental costs', true);

-- EXPENSE CATEGORIES
INSERT INTO expense_categories (id, name, description) VALUES
('exp-cat-1', 'Logistics & Courier Delivery', 'Courier partner charges (Steadfast, Sundarban, SA Paribahan) and fuel'),
('exp-cat-2', 'Showroom & Warehouse Rent', 'Monthly lease rentals for central warehouse and branch outlets'),
('exp-cat-3', 'Staff Salaries & Field Allowance', 'Executive staff salaries, TA/DA and salesman daily allowances'),
('exp-cat-4', 'Marketing & Dealer Incentives', 'Signboard branding, shop banners and promotional gifts'),
('exp-cat-5', 'Office Utilities & Connectivity', 'High-speed internet, electricity, cloud hosting and software services');

-- SALES INVOICES (Wholesale B2B Real Handset Orders)
INSERT INTO sales_invoices (id, invoice_no, invoice_type, customer_id, customer_name, customer_phone, salesman_id, salesman_name, warehouse_id, warehouse_name, invoice_date, due_date, items, subtotal, discount, vat_rate, vat_amount, grand_total, paid_amount, due_amount, payment_method, payments, commission_earned, notes, delivery_status, status, created_by) VALUES
('inv-001', 'INV-2026-0042', 'Wholesale', 'cust-1', 'Popular Telecom', '+880 1711-234567', 'sm-1', 'Md. Rafiqul Islam', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', '2026-10-01', '2026-10-22', '[{"id":"item-1","productId":"prod-2","productName":"Galaxy A55 5G","variantId":"var-2-1","variantDesc":"8GB/128GB - Awesome Navy","quantity":2,"unitPrice":45000,"unitCost":41500,"discount":0,"vatAmount":0,"totalAmount":90000,"imeiList":["358921008899060","358921008899086"]}]'::jsonb, 90000.00, 0.00, 0.00, 0.00, 90000.00, 50000.00, 40000.00, 'Bank Transfer', '[{"method":"Bank Transfer","amount":50000,"bankAccountId":"bank-1","transactionRef":"BRAC-TXN-88192"}]'::jsonb, 1125.00, 'Official BTRC handsets with 12M warranty', 'Delivered', 'Confirmed', 'Md. Rafiqul Islam'),
('inv-002', 'INV-2026-0043', 'Wholesale', 'cust-2', 'Trust Mobile World', '+880 1819-876543', 'sm-3', 'Kamrul Ahsan', 'wh-3', 'Chittagong Regional Depot', '2026-10-02', '2026-10-17', '[{"id":"item-2","productId":"prod-4","productName":"Redmi Note 13 Pro 5G","variantId":"var-4-1","variantDesc":"8GB/256GB - Midnight Black","quantity":2,"unitPrice":31800,"unitCost":29000,"discount":0,"vatAmount":0,"totalAmount":63600,"imeiList":["864912061122331","864912061122364"]}]'::jsonb, 63600.00, 0.00, 0.00, 0.00, 63600.00, 63600.00, 0.00, 'Bank Transfer', '[{"method":"Bank Transfer","amount":63600,"bankAccountId":"bank-2","transactionRef":"CITY-TXN-99012"}]'::jsonb, 954.00, 'Full paid advance delivery', 'Delivered', 'Confirmed', 'Kamrul Ahsan'),
('inv-003', 'INV-2026-0044', 'Wholesale', 'cust-4', 'Rajdhani Gadget', '+880 1715-667788', 'sm-2', 'Tanvir Hasan', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', '2026-10-03', '2026-10-13', '[{"id":"item-3","productId":"prod-1","productName":"Galaxy S24 Ultra 5G","variantId":"var-1-1","variantDesc":"12GB/256GB - Titanium Black","quantity":1,"unitPrice":172000,"unitCost":162000,"discount":0,"vatAmount":0,"totalAmount":172000,"imeiList":["358921008899011"]}]'::jsonb, 172000.00, 0.00, 0.00, 0.00, 172000.00, 100000.00, 72000.00, 'Split Payment', '[{"method":"Cash","amount":50000},{"method":"bKash","amount":50000,"bankAccountId":"bank-4","transactionRef":"BKASH-TRX-77821"}]'::jsonb, 2150.00, 'Promised clearance within 10 days', 'Delivered', 'Confirmed', 'Tanvir Hasan');

-- PURCHASE INVOICES (Official Consignment from National Distributors)
INSERT INTO purchase_invoices (id, invoice_no, purchase_date, due_date, supplier_id, supplier_name, warehouse_id, warehouse_name, subtotal, discount_total, vat_total, transport_cost, other_expenses, total_amount, paid_amount, due_amount, payment_status, payment_method, bank_account_id, reference_no, items, notes, status) VALUES
('pinv-001', 'PINV-2026-0089', '2026-09-25', '2026-10-16', 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 585000.00, 0.00, 0.00, 1500.00, 0.00, 586500.00, 200000.00, 386500.00, 'Partial', 'Bank Transfer', 'bank-1', 'LC-FAIR-2026-SAM09', '[{"id":"pitem-1","productId":"prod-1","productName":"Galaxy S24 Ultra 5G","variantId":"var-1-1","variantDesc":"12GB/256GB - Titanium Black","quantity":3,"unitCost":162000,"discount":0,"vatRate":0,"totalCost":486000,"imeis":["358921008899011","358921008899029","358921008899045"]},{"id":"pitem-2","productId":"prod-2","productName":"Galaxy A55 5G","variantId":"var-2-1","variantDesc":"8GB/128GB - Awesome Navy","quantity":2,"unitCost":41500,"discount":0,"vatRate":0,"totalCost":83000,"imeis":["358921008899060","358921008899086"]}]'::jsonb, 'Official Fair Group Samsung consignment with BTRC labels', 'Received'),
('pinv-002', 'PINV-2026-0075', '2026-09-28', '2026-10-13', 'sup-2', 'Compustar PVT Ltd (Apple Authorized Distributor)', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 376000.00, 0.00, 0.00, 2000.00, 0.00, 378000.00, 378000.00, 0.00, 'Paid', 'Bank Transfer', 'bank-2', 'COMP-INV-7781', '[{"id":"pitem-3","productId":"prod-3","productName":"iPhone 15 Pro Max","variantId":"var-3-1","variantDesc":"8GB/256GB - Natural Titanium","quantity":2,"unitCost":188000,"discount":0,"vatRate":0,"totalCost":376000,"imeis":["351984112233441","351984112233458"]}]'::jsonb, 'Apple official authorized national stock', 'Received'),
('pinv-003', 'PINV-2026-0092', '2026-09-29', '2026-10-13', 'sup-3', 'DBG Technology (Xiaomi National Distributor)', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 87000.00, 0.00, 0.00, 500.00, 0.00, 87500.00, 87500.00, 0.00, 'Paid', 'Bank Transfer', 'bank-1', 'DBG-CH-9921', '[{"id":"pitem-4","productId":"prod-4","productName":"Redmi Note 13 Pro 5G","variantId":"var-4-1","variantDesc":"8GB/256GB - Midnight Black","quantity":3,"unitCost":29000,"discount":0,"vatRate":0,"totalCost":87000,"imeis":["864912061122331","864912061122349","864912061122364"]}]'::jsonb, 'DBG Xiaomi factory sealed units', 'Received');

-- STOCK TRANSFERS
INSERT INTO stock_transfers (id, transfer_no, date, from_warehouse_id, from_warehouse_name, to_warehouse_id, to_warehouse_name, items, imeis, total_units, status, requested_by, dispatched_by, received_by, notes) VALUES
('tr-001', 'TR-2026-0012', '2026-10-02', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 'wh-2', 'Uttara Hub Warehouse', '[{"productId":"prod-1","productName":"Galaxy S24 Ultra 5G","variantId":"var-1-2","variantDesc":"12GB/512GB - Titanium Gray","quantity":1,"imeis":["358921008899045"]},{"productId":"prod-4","productName":"Redmi Note 13 Pro 5G","variantId":"var-4-1","variantDesc":"8GB/256GB - Midnight Black","quantity":1,"imeis":["864912061122349"]}]'::jsonb, ARRAY['358921008899045', '864912061122349'], 2, 'Completed', 'Zahid Hossain', 'Md. Masum Billah', 'Zahid Hossain', 'Transferred to Uttara Hub for dealer distribution');

-- CUSTOMER RETURNS
INSERT INTO customer_returns (id, return_no, return_date, sales_invoice_no, customer_id, customer_name, product_id, product_name, variant_id, variant_desc, imei, condition, return_reason, action_taken, refund_or_credit_amount, restock_warehouse_id, restock_status, commission_reversed, approved_by, status, notes) VALUES
('ret-001', 'RET-2026-0008', '2026-10-03', 'INV-2026-0042', 'cust-1', 'Popular Telecom', 'prod-2', 'Galaxy A55 5G', 'var-2-1', '8GB/128GB - Awesome Navy', '358921008899086', 'Sealed', 'Customer requested color exchange to Awesome Iceblue', 'Credit Note', 45000.00, 'wh-1', 'Restocked', 0.00, 'Rafiqul Bari', 'Processed', 'Box intact, sealed sticker inspected');

-- SUPPLIER RETURNS
INSERT INTO supplier_returns (id, return_no, date, supplier_id, supplier_name, purchase_invoice_no, product_id, product_name, variant_desc, imei, reason, amount, status) VALUES
('sret-001', 'SRET-2026-0004', '2026-10-01', 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'PINV-2026-0089', 'prod-1', 'Galaxy S24 Ultra 5G', '12GB/256GB - Titanium Black', '358921008899029', 'Minor cosmetic carton scratch on shipment receipt', 162000.00, 'Sent to Brand');

-- DUE COLLECTIONS / MONEY RECEIPTS
INSERT INTO money_receipts (id, receipt_no, date, customer_id, customer_name, amount, payment_method, bank_account_id, reference_no, discount_allowed, collector_salesman_id, allocations, notes, created_by) VALUES
('mr-001', 'MR-2026-0031', '2026-10-02', 'cust-1', 'Popular Telecom', 50000.00, 'Bank Transfer', 'bank-1', 'BRAC-TXN-88192', 0.00, 'sm-1', '[{"invoiceId":"inv-001","invoiceNo":"INV-2026-0042","invoiceDate":"2026-10-01","originalDue":90000,"allocatedAmount":50000,"remainingDue":40000}]'::jsonb, 'Due payment against INV-2026-0042', 'Md. Rafiqul Islam'),
('mr-002', 'MR-2026-0032', '2026-10-03', 'cust-2', 'Trust Mobile World', 63600.00, 'Bank Transfer', 'bank-2', 'CITY-TXN-99012', 0.00, 'sm-3', '[{"invoiceId":"inv-002","invoiceNo":"INV-2026-0043","invoiceDate":"2026-10-02","originalDue":63600,"allocatedAmount":63600,"remainingDue":0}]'::jsonb, 'Full settlement against INV-2026-0043', 'Kamrul Ahsan');

-- EXPENSES
INSERT INTO expenses (id, expense_no, date, category_id, category_name, amount, payment_method, bank_account_id, description, recipient_name, voucher_ref, approved_by) VALUES
('exp-001', 'EXP-2026-0101', '2026-10-01', 'exp-cat-2', 'Showroom & Warehouse Rent', 85000.00, 'Bank Transfer', 'bank-1', 'Monthly rental payment for Motijheel Central Warehouse Floor 4', 'Dilkusha Properties Ltd', 'RENT-OCT-26', 'Rafiqul Bari'),
('exp-002', 'EXP-2026-0102', '2026-10-02', 'exp-cat-1', 'Logistics & Courier Delivery', 14500.00, 'Bank Transfer', 'bank-4', 'Steadfast Courier bulk delivery dispatch charges for district dealers', 'Steadfast Courier Ltd', 'ST-BILL-8831', 'Md. Masum Billah'),
('exp-003', 'EXP-2026-0103', '2026-10-03', 'exp-cat-3', 'Staff Salaries & Field Allowance', 18000.00, 'Cash', NULL, 'Sales executive field travel, fuel & daily food allowances for Dhaka North route', 'Md. Rafiqul Islam', 'TA-OCT-03', 'Kazi Farhan'),
('exp-004', 'EXP-2026-0104', '2026-10-04', 'exp-cat-5', 'Office Utilities & Connectivity', 6500.00, 'bKash', 'bank-4', 'Optical fiber dedicated leased line internet bill for ERP server synchronization', 'Amber IT Ltd', 'AMBER-OCT-09', 'Shabbir Ahmed');

-- CASH TRANSACTIONS
INSERT INTO cash_transactions (id, voucher_no, date, type, category, amount, reference_no, description, performed_by) VALUES
('csh-001', 'CSH-2026-0051', '2026-10-03', 'Cash In', 'Customer Sale', 50000.00, 'INV-2026-0044', 'Cash downpayment received from Rajdhani Gadget for Galaxy S24 Ultra', 'Sumon Mia'),
('csh-002', 'CSH-2026-0052', '2026-10-03', 'Cash Out', 'Expense', 18000.00, 'EXP-2026-0103', 'Field salesman daily allowance disbursement', 'Sumon Mia'),
('csh-003', 'CSH-2026-0053', '2026-10-04', 'Cash Out', 'Cash To Bank', 30000.00, 'DEP-BRAC-04', 'Physical cash deposit from daily vault to BRAC Bank Motijheel Corporate Branch', 'Sumon Mia');

-- DAY CLOSING
INSERT INTO day_closings (id, closing_no, date, cashier_name, warehouse_id, warehouse_name, opening_cash, cash_sales_total, due_collections_total, cash_expenses_total, bank_deposits_total, expected_closing_cash, actual_physical_cash, discrepancy, status, verified_by, notes) VALUES
('dc-001', 'DC-2026-0021', '2026-10-03', 'Sumon Mia', 'wh-1', 'Central Warehouse (Motijheel, Dhaka)', 125000.00, 50000.00, 0.00, 18000.00, 0.00, 157000.00, 157000.00, 0.00, 'Balanced', 'Shabbir Ahmed', 'Physical cash count matched perfectly with system ledger');

-- WARRANTY CLAIMS
INSERT INTO warranty_claims (id, rma_number, date, customer_id, customer_name, customer_phone, brand_name, product_model, imei, purchase_invoice_no, purchase_date, problem_description, physical_condition, accessories_included, service_center_name, service_center_job_no, status, replacement_imei, repair_cost_customer, remarks) VALUES
('wc-001', 'RMA-2026-0015', '2026-10-02', 'cust-1', 'Popular Telecom', '+880 1711-234567', 'Samsung', 'Galaxy A55 5G', '358921008899060', 'INV-2026-0042', '2026-10-01', 'Camera module autofocus failure during macro zoom', 'Scratchless body, sealed handset', 'Handset only, retail box', 'Fair Electronics Samsung Authorized Service Center (Banani)', 'JOB-SAM-99120', 'Dispatched to Service Center', NULL, 0.00, 'Under official 12-month manufacturer replacement warranty'),
('wc-002', 'RMA-2026-0016', '2026-10-03', 'cust-2', 'Trust Mobile World', '+880 1819-876543', 'Apple', 'iPhone 15 Pro Max', '351984112233441', 'INV-2026-0038', '2026-09-29', 'Display touch sensor glitch in top-left dynamic island area', 'Original tempered glass installed, pristine condition', 'Original USB-C braided cable and box', 'Compustar Apple Authorized Service Provider (Gulshan)', 'AASP-DH-8821', 'In Repair', NULL, 0.00, 'Apple Global Warranty active');

-- BRAND INCENTIVE SCHEMES
INSERT INTO brand_incentive_schemes (id, brand_id, brand_name, scheme_title, period, start_date, end_date, target_units, achieved_units, slabs, total_incentive_earned, claim_status, supplier_credit_note_no) VALUES
('bis-001', 'brand-1', 'Samsung', 'Q4 2026 Flagship Volume Sell-Out Rebate', 'Q4 2026', '2026-10-01', '2026-12-31', 50, 8, '[{"minUnits":10,"incentivePerUnit":2000},{"minUnits":25,"incentivePerUnit":3500},{"minUnits":50,"incentivePerUnit":5000}]'::jsonb, 16000.00, 'In Progress', NULL),
('bis-002', 'brand-3', 'Xiaomi', 'Redmi Note 13 Series Nationwide Target Scheme', 'October 2026', '2026-10-01', '2026-10-31', 100, 18, '[{"minUnits":20,"incentivePerUnit":500},{"minUnits":50,"incentivePerUnit":800},{"minUnits":100,"incentivePerUnit":1200}]'::jsonb, 9000.00, 'In Progress', NULL);

-- DELIVERY CHALLANS
INSERT INTO delivery_challans (id, challan_no, date, invoice_no, customer_id, customer_name, customer_phone, delivery_address, district, courier_partner, consignment_no, is_cod, cod_amount, cod_status, delivery_status, total_cartons, imei_list, remarks, delivered_at) VALUES
('ch-001', 'CH-2026-0081', '2026-10-01', 'INV-2026-0042', 'cust-1', 'Popular Telecom', '+880 1711-234567', 'Shop 12, Rajuk Commercial Complex, Sector 3, Uttara', 'Dhaka', 'Company Van Delivery', 'VAN-DH-09', false, 0.00, 'Not Applicable', 'Delivered', 1, ARRAY['358921008899060', '358921008899086'], 'Handed over to shop owner Md. Hafizur Rahman', NOW()),
('ch-002', 'CH-2026-0082', '2026-10-02', 'INV-2026-0043', 'cust-2', 'Trust Mobile World', '+880 1819-876543', 'Shop 4, Akhtaruzzaman Center, Agrabad C/A, Chittagong', 'Chittagong', 'Steadfast Courier', 'ST-CTG-882910', false, 0.00, 'Not Applicable', 'In Transit', 1, ARRAY['864912061122331', '864912061122364'], 'Tracked via Steadfast logistics portal', NULL);

-- PRICE DROP CLAIMS
INSERT INTO price_drop_claims (id, claim_no, claim_date, brand_name, supplier_id, supplier_name, product_id, product_model, variant_desc, old_purchase_cost, new_purchase_cost, drop_per_unit, eligible_stock_count, total_claim_amount, claim_status, credit_note_no, announcement_ref) VALUES
('pdc-001', 'PDC-2026-0005', '2026-10-02', 'Samsung', 'sup-1', 'Fair Electronics Ltd (Samsung Official)', 'prod-2', 'Galaxy A55 5G', '8GB/128GB - Awesome Navy', 43500.00, 41500.00, 2000.00, 5, 10000.00, 'Submitted to Brand', 'CN-FAIR-2026-P09', 'Fair Electronics Official Price Revision Circular #09/2026');

-- PHONE EXCHANGE RECORDS
INSERT INTO phone_exchange_records (id, exchange_no, date, customer_id, customer_name, customer_phone, salesman_id, salesman_name, old_brand, old_model, old_imei, old_condition, assessed_value, new_product_id, new_product_name, new_variant_desc, new_imei, new_phone_price, net_payable_amount, amount_paid_now, due_amount, payment_method, notes) VALUES
('exc-001', 'EXC-2026-0011', '2026-10-03', 'cust-4', 'Rajdhani Gadget (Walk-in VIP)', '+880 1715-667788', 'sm-2', 'Tanvir Hasan', 'Samsung', 'Galaxy S22 Ultra (Used)', '359871002233445', 'Used', 45000.00, 'prod-1', 'Galaxy S24 Ultra 5G', '12GB/256GB - Titanium Black', '358921008899011', 172000.00, 127000.00, 127000.00, 0.00, 'Bank Transfer', 'Old phone battery health 88%, display scratch-free. Added to exchange inventory.');

-- CUSTOMER FOLLOW UPS
INSERT INTO customer_follow_ups (id, customer_id, customer_name, shop_name, salesman_id, salesman_name, scheduled_date, contact_number, purpose, current_due_amount, status, promised_date, notes) VALUES
('fup-001', 'cust-1', 'Popular Telecom', 'Popular Telecom', 'sm-1', 'Md. Rafiqul Islam', '2026-10-08', '+880 1711-234567', 'Due Payment Follow-up', 485000.00, 'Contacted - Promised Payment', '2026-10-10', 'Owner promised to issue account payee cheque for ৳200,000 on Saturday'),
('fup-002', 'cust-4', 'Rajdhani Gadget', 'Rajdhani Gadget', 'sm-2', 'Tanvir Hasan', '2026-10-09', '+880 1715-667788', 'Due Payment Follow-up', 420000.00, 'Pending', NULL, 'Follow up regarding outstanding balance of INV-2026-0044');

-- SALESMAN VISITS
INSERT INTO salesman_visits (id, salesman_id, salesman_name, customer_id, customer_name, shop_name, visit_date, purpose, outcome_notes, order_amount_booked, collection_amount, next_follow_up_date, status) VALUES
('sv-001', 'sm-1', 'Md. Rafiqul Islam', 'cust-1', 'Popular Telecom', 'Popular Telecom', '2026-10-01', 'Order Collection', 'Booked 2 units of Galaxy A55 5G for showroom display', 90000.00, 50000.00, '2026-10-08', 'Completed'),
('sv-002', 'sm-3', 'Kamrul Ahsan', 'cust-2', 'Trust Mobile World', 'Trust Mobile World', '2026-10-02', 'Order Collection', 'Delivered Note 13 Pro 5G units and discussed Q4 brand incentive slabs', 63600.00, 63600.00, '2026-10-12', 'Completed');

-- SMS MARKETING LOGS
INSERT INTO sms_logs (id, recipient_phone, recipient_name, message_type, message_body, sent_at, status, masking, sms_units) VALUES
('sms-001', '+8801711234567', 'Popular Telecom', 'Invoice Alert', 'Dear Popular Telecom, your invoice INV-2026-0042 of BDT 90,000 has been generated. Thank you for choosing TeleCorp.', NOW(), 'Delivered', 'TELECORP', 1),
('sms-002', '+8801819876543', 'Trust Mobile World', 'Payment Receipt', 'Dear Trust Mobile World, we have received BDT 63,600 via Bank Transfer. Your current due is BDT 0. TeleCorp.', NOW(), 'Delivered', 'TELECORP', 1),
('sms-003', '+8801715667788', 'Rajdhani Gadget', 'Due Reminder', 'Dear Valued Dealer, payment of BDT 72,000 for INV-2026-0044 is due on 2026-10-13. Please deposit on time to maintain credit rating.', NOW(), 'Sent', 'TELECORP', 1);

-- SYSTEM ALERTS
INSERT INTO system_alerts (id, type, title, message, timestamp, read, link_module, reference_id) VALUES
('alert-001', 'warning', 'Low Stock Alert: Galaxy S24 Ultra 5G', 'Galaxy S24 Ultra 5G (Titanium Gray) is down to 5 units in central stock. Reorder recommended.', NOW(), false, 'inventory', 'prod-1'),
('alert-002', 'reminder', 'Price Drop Protection Claim Submitted', 'Claim PDC-2026-0005 for ৳10,000 submitted to Fair Electronics. Awaiting credit note.', NOW(), false, 'price-drop', 'pdc-001'),
('alert-003', 'critical', 'Credit Limit Threshold Warning', 'Trust Mobile World has reached 75% of assigned credit limit (৳2,000,000).', NOW(), false, 'due-ageing', 'cust-2');

-- GATEWAY CONFIGS
INSERT INTO gateway_configs (id, service_name, provider, credentials, is_active, environment) VALUES
('gw-sms', 'sms', 'Greenweb Bangladesh SMS Gateway', '{"apiUrl":"https://api.greenweb.com.bd/api.php","token":"GW_LIVE_TOKEN_99281","senderId":"TELECORP"}'::jsonb, true, 'Live'),
('gw-bkash', 'bkash', 'bKash Tokenized Checkout API', '{"appKey":"bKash_prod_app_key_88192","merchantNumber":"01888990011"}'::jsonb, true, 'Live'),
('gw-courier', 'steadfast', 'Steadfast Courier API', '{"apiKey":"st_live_key_99281928","secretKey":"st_sec_00291"}'::jsonb, true, 'Live');

-- JOURNAL ENTRIES (Opening Balance Ledger Check)
INSERT INTO journal_entries (id, voucher_no, date, voucher_type, reference_no, description, lines, total_debit, total_credit, created_by) VALUES
('jv-001', 'JV-2026-0001', '2026-10-01', 'Journal Voucher', 'OP-BAL-2026', 'Opening balanced trial ledger for TeleCorp Enterprise Cloud', '[{"accountCode":"1020","accountName":"Bank Operating Accounts","debit":25680000,"credit":0,"memo":"Opening bank balance"},{"accountCode":"1040","accountName":"Merchandise Inventory Asset","debit":18450000,"credit":0,"memo":"Opening handset inventory"},{"accountCode":"3010","accountName":"Shareholder Paid-Up Capital","debit":0,"credit":30000000,"memo":"Equity capital"},{"accountCode":"3020","accountName":"Retained Earnings","debit":0,"credit":14130000,"memo":"Retained earnings"}]'::jsonb, 44130000.00, 44130000.00, 'Shabbir Ahmed');
