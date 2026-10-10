-- =========================================================================
-- FIROZA ENTERPRISE - REAL PRODUCTION DATA SEED FOR SUPABASE
-- Generated from Excel_Export Migration on 2026-10-10T07:29:09.892Z
-- 99 Customers, 2 Suppliers, 4 Salesmen, 62 Products, Real Stock & Dues
-- =========================================================================

-- 1. SYSTEM SETTINGS
INSERT INTO system_settings (id, company_name, company_address, company_phone, company_email, vat_tax_number, default_vat_percent, currency, currency_symbol, valuation_method, negative_stock_allowed, credit_limit_hard_block, max_discount_without_approval, language, updated_at) VALUES (
  'primary_settings', 'Firoza Enterprise', 'Konabari New Market, Konabari Gazipur', '01712996757', 'info@firozaenterprise.com', 'BIN: 530914078318 (BTRC Reg: 578902)', 5.00, 'BDT', '৳', 'FIFO', false, false, 0.00, 'bn', NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name, company_address = EXCLUDED.company_address, company_phone = EXCLUDED.company_phone;

-- 2. USERS
INSERT INTO app_users (id, email, name, role, password, status, phone, department, branch_name, avatar, created_at, updated_at) VALUES (
  'usr-admin', 'firoza1122@firoza.com', 'Firoza Enterprise Admin', 'Super Admin', 'password123', 'Active', '01712996757', 'Management', 'Konabari Head Office', '👑', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

INSERT INTO app_users (id, email, name, role, password, status, phone, department, branch_name, avatar, created_at, updated_at) VALUES (
  'usr-troyee', 'troyee@firoza.com', 'Troyee (Accounts Head)', 'Accounts Manager', 'password123', 'Active', '+880 1712-996758', 'Accounts', 'Konabari Head Office', '💼', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- 3. WAREHOUSES
INSERT INTO warehouses (id, code, name, type, address, city, manager_name, contact_number, status, created_at) VALUES (
  'wh-1', 'WH-MAIN-KB', 'Main Warehouse (Konabari New Market, Gazipur)', 'Central Warehouse', 'Konabari New Market, Konabari, Gazipur', 'Gazipur', 'Incharge Warehouse', '01712996757', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- 4. BRANDS
INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-tecno', 'Tecno', 'TEC', '🔵', 'undefined', 'Tecno Mobile Official Bangladesh', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-realme', 'Realme', 'RLM', '🟡', 'undefined', 'Realme Youth Series Official BD', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-oneplus', 'OnePlus', '1PL', '🔴', 'undefined', 'OnePlus Flagship Series', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-infinix', 'Infinix', 'INF', '⚡', 'undefined', 'Infinix Mobile BD', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-samsung', 'Samsung', 'SAM', '📱', 'undefined', 'Samsung Electronics Official BD', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (
  'brand-xiaomi', 'Xiaomi', 'MI', '🟠', 'undefined', 'Xiaomi Official BD', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 5. SALESMEN
INSERT INTO salesmen (id, employee_code, name, mobile, email, address, joining_date, basic_salary, commission_type, commission_percentage, target_monthly_bdt, achieved_monthly_bdt, active_routes, assigned_area, status, created_at) VALUES (
  'sm-1', 'EMP-SM-01', 'Farhad', '+880 1711-101111', 'farhad.sales@firoza-enterprise.com', 'Konabari, Gazipur', '2024-01-01', 28000, 'Percentage of Sales', 1, 1500000, 850000, ARRAY['Konabari New Market & College Road'], 'Konabari New Market & College Road', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mobile = EXCLUDED.mobile;

INSERT INTO salesmen (id, employee_code, name, mobile, email, address, joining_date, basic_salary, commission_type, commission_percentage, target_monthly_bdt, achieved_monthly_bdt, active_routes, assigned_area, status, created_at) VALUES (
  'sm-2', 'EMP-SM-02', 'Sajib', '+880 1711-102222', 'sajib.sales@firoza-enterprise.com', 'Konabari, Gazipur', '2024-01-01', 28000, 'Percentage of Sales', 1, 1500000, 850000, ARRAY['Shofipur Bazaar & Kaliakair Highway'], 'Shofipur Bazaar & Kaliakair Highway', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mobile = EXCLUDED.mobile;

INSERT INTO salesmen (id, employee_code, name, mobile, email, address, joining_date, basic_salary, commission_type, commission_percentage, target_monthly_bdt, achieved_monthly_bdt, active_routes, assigned_area, status, created_at) VALUES (
  'sm-3', 'EMP-SM-03', 'Sakin', '+880 1711-103333', 'sakin.sales@firoza-enterprise.com', 'Konabari, Gazipur', '2024-01-01', 28000, 'Percentage of Sales', 1, 1500000, 850000, ARRAY['Chandra, Mouchak & Bypass'], 'Chandra, Mouchak & Bypass', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mobile = EXCLUDED.mobile;

INSERT INTO salesmen (id, employee_code, name, mobile, email, address, joining_date, basic_salary, commission_type, commission_percentage, target_monthly_bdt, achieved_monthly_bdt, active_routes, assigned_area, status, created_at) VALUES (
  'sm-4', 'EMP-SM-04', 'Sumon', '+880 1711-104444', 'sumon.sales@firoza-enterprise.com', 'Konabari, Gazipur', '2024-01-01', 28000, 'Percentage of Sales', 1, 1500000, 850000, ARRAY['Gazipur Chowrasta & Board Bazaar'], 'Gazipur Chowrasta & Board Bazaar', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mobile = EXCLUDED.mobile;

-- 6. SUPPLIERS
INSERT INTO suppliers (id, supplier_code, name, company_name, contact_person, mobile, email, address, district, tax_vat_number, trade_license, opening_balance, credit_limit, payment_terms_days, current_due, bank_info, status, created_at) VALUES (
  'sup-1', 'SUP-001', 'Ismarto Technology BD Ltd.', 'Ismarto Technology BD Ltd.', 'General Manager (Operations)', '+880 1713-202222', 'accounts@ismartotechnologybdltd.com', 'Gulshan / Tejgaon Commercial Area, Dhaka', 'Dhaka', 'BIN-002341890-01', 'TRAD/DNCC/087611/2022', 0, 100000000, 15, 63456266.80, 'Standard Chartered Bank Ltd, Principal Branch', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, name = EXCLUDED.name;

INSERT INTO suppliers (id, supplier_code, name, company_name, contact_person, mobile, email, address, district, tax_vat_number, trade_license, opening_balance, credit_limit, payment_terms_days, current_due, bank_info, status, created_at) VALUES (
  'sup-2', 'SUP-002', 'One Plus', 'One Plus', 'Accounts Officer', '+880 1713-204444', 'accounts@oneplus.com', 'Gulshan / Tejgaon Commercial Area, Dhaka', 'Dhaka', 'BIN-002341890-02', 'TRAD/DNCC/087612/2022', 0, 100000000, 15, 0.00, 'Standard Chartered Bank Ltd, Principal Branch', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, name = EXCLUDED.name;

-- 7. CUSTOMERS (99 Retailers)
INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-1', 'CUST-KB-001', '7 Star', '7 Star (Proprietor)', '+880 1700-100000', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 233.83, 233.83, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-2', 'CUST-KB-002', 'Abdullah Telecom', 'Abdullah Telecom (Proprietor)', '01711980449', '', 'shofipur', 'Shofipur', 'Gazipur', 652704, 15, 'Wholesale Dealer', 'sm-2', 435135.71, 435135.71, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-3', 'CUST-KB-003', 'Abid Telecom', 'Abid Telecom (Proprietor)', '+880 1700-100002', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 563662, 15, 'Wholesale Dealer', 'sm-3', 375774.90, 375774.90, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-4', 'CUST-KB-004', 'Abir TSM', 'Abir TSM (Proprietor)', '+880 1700-100003', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 32920.00, 32920.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-5', 'CUST-KB-005', 'Afnan Telecom', 'Afnan Telecom (Proprietor)', '+880 1700-100004', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 17248.23, 17248.23, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-6', 'CUST-KB-006', 'Akib Telecom', 'Akib Telecom (Proprietor)', '+880 1700-100005', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 4916.55, 4916.55, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-7', 'CUST-KB-007', 'AL Baraka', 'AL Baraka (Proprietor)', '+880 1700-100006', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 66068.00, 66068.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-8', 'CUST-KB-008', 'AL Mamun', 'AL Mamun (Proprietor)', '+880 1700-100007', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 36386.85, 36386.85, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-9', 'CUST-KB-009', 'Apallo Mobile', 'Apallo Mobile (Proprietor)', '+880 1700-100008', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 4167.00, 4167.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-10', 'CUST-KB-010', 'Apple Network', 'Apple Network (Proprietor)', '+880 1700-100009', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 236285.00, 236285.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-11', 'CUST-KB-011', 'Asm Ronib', 'Asm Ronib (Proprietor)', '+880 1700-100010', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 46645.00, 46645.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-12', 'CUST-KB-012', 'Bhai Bon Electronic', 'Bhai Bon Electronic (Proprietor)', '01712549425', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 395.00, 395.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-13', 'CUST-KB-013', 'Big Mobile Park 2', 'Big Mobile Park 2 (Proprietor)', '01717899324', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 685.15, 685.15, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-14', 'CUST-KB-014', 'Bismillah Telecom', 'Bismillah Telecom (Proprietor)', '+880 1700-100013', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 48300.00, 48300.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-15', 'CUST-KB-015', 'BS Mowcak', 'BS Mowcak (Proprietor)', '+880 1700-100014', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 2182918, 15, 'Wholesale Dealer', 'sm-3', 1455278.80, 1455278.80, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-16', 'CUST-KB-016', 'Csm', 'Csm (Proprietor)', '+880 1700-100015', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 2212215, 15, 'Wholesale Dealer', 'sm-4', 1474810.00, 1474810.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-17', 'CUST-KB-017', 'Dhaka Sojib', 'Dhaka Sojib (Proprietor)', '+880 1700-100016', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 19286.32, 19286.32, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-18', 'CUST-KB-018', 'E Samprity Bangladesh LTD', 'E Samprity Bangladesh LTD (Proprietor)', '+880 1700-100017', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 8781598, 15, 'Wholesale Dealer', 'sm-2', 5854398.45, 5854398.45, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-19', 'CUST-KB-019', 'Famely Enterprise', 'Famely Enterprise (Proprietor)', '+880 1700-100018', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 34794.12, 34794.12, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-20', 'CUST-KB-020', 'Faruk Telecom', 'Faruk Telecom (Proprietor)', '+880 1700-100019', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 267467.28, 267467.28, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-21', 'CUST-KB-021', 'Firoza Enterprise BS', 'Firoza Enterprise BS (Proprietor)', '+880 1700-100020', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 1044790, 15, 'Wholesale Dealer', 'sm-1', 696526.82, 696526.82, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-22', 'CUST-KB-022', 'Forhad HM', 'Forhad HM (Proprietor)', '+880 1700-100021', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 109895.00, 109895.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-23', 'CUST-KB-023', 'Friend Mobile', 'Friend Mobile (Proprietor)', '+880 1700-100022', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 60728.93, 60728.93, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-24', 'CUST-KB-024', 'G@G', 'G@G (Proprietor)', '01716602558', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 38.00, 38.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-25', 'CUST-KB-025', 'Gazi Smart Zone', 'Gazi Smart Zone (Proprietor)', '01740779779', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 103010.11, 103010.11, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-26', 'CUST-KB-026', 'H.M', 'H.M (Proprietor)', '+880 1700-100025', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 6810.84, 6810.84, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-27', 'CUST-KB-027', 'Hafiur Oppo', 'Hafiur Oppo (Proprietor)', '+880 1700-100026', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 2.95, 2.95, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-28', 'CUST-KB-028', 'Haramain Business Point', 'Haramain Business Point (Proprietor)', '+880 1700-100027', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 492.32, 492.32, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-29', 'CUST-KB-029', 'Jakir Telecom Forhad', 'Jakir Telecom Forhad (Proprietor)', '+880 1700-100028', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 19078.00, 19078.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-30', 'CUST-KB-030', 'Jannat', 'Jannat (Proprietor)', '+880 1700-100029', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 278244.10, 278244.10, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-31', 'CUST-KB-031', 'Juneid Telecom', 'Juneid Telecom (Proprietor)', '+880 1700-100030', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 245844.96, 245844.96, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-32', 'CUST-KB-032', 'Kafi', 'Kafi (Proprietor)', '+880 1700-100031', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 20.00, 20.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-33', 'CUST-KB-033', 'Khatija Telecom', 'Khatija Telecom (Proprietor)', '+880 1700-100032', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-34', 'CUST-KB-034', 'Lotas BO', 'Lotas BO (Proprietor)', '+880 1700-100033', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 6.00, 6.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-35', 'CUST-KB-035', 'Ma Showroom', 'Ma Showroom (Proprietor)', '+880 1700-100034', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-36', 'CUST-KB-036', 'Mahabub Enterprise (Sumon)', 'Mahabub Enterprise (Sumon) (Proprietor)', '+880 1700-100035', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 1446117, 15, 'Wholesale Dealer', 'sm-4', 964077.85, 964077.85, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-37', 'CUST-KB-037', 'Makka Telecom', 'Makka Telecom (Proprietor)', '01778869828', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 80297.48, 80297.48, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-38', 'CUST-KB-038', 'Master', 'Master (Proprietor)', '+880 1700-100037', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 76405.95, 76405.95, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-39', 'CUST-KB-039', 'Masum Kashipur', 'Masum Kashipur (Proprietor)', '+880 1700-100038', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 37.75, 37.75, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-40', 'CUST-KB-040', 'Matbor Telecom', 'Matbor Telecom (Proprietor)', '+880 1700-100039', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 34607.12, 34607.12, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-41', 'CUST-KB-041', 'Max Telecom', 'Max Telecom (Proprietor)', '+880 1700-100040', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 348.00, 348.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-42', 'CUST-KB-042', 'Mobile City', 'Mobile City (Proprietor)', '+880 1700-100041', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 111485.78, 111485.78, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-43', 'CUST-KB-043', 'Mobile Fair', 'Mobile Fair (Proprietor)', '+880 1700-100042', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 26172.80, 26172.80, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-44', 'CUST-KB-044', 'Mobile Park Shofipur', 'Mobile Park Shofipur (Proprietor)', '+880 1700-100043', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 675487, 15, 'Wholesale Dealer', 'sm-4', 450324.40, 450324.40, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-45', 'CUST-KB-045', 'Mobile Shop', 'Mobile Shop (Proprietor)', '+880 1700-100044', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 7367.00, 7367.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-46', 'CUST-KB-046', 'Mobile Word', 'Mobile Word (Proprietor)', '+880 1700-100045', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 60.00, 60.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-47', 'CUST-KB-047', 'Moden Sojib Sr', 'Moden Sojib Sr (Proprietor)', '+880 1700-100046', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 573419, 15, 'Wholesale Dealer', 'sm-3', 382279.65, 382279.65, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-48', 'CUST-KB-048', 'Modern Telecom', 'Modern Telecom (Proprietor)', '01720310400', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 85555.10, 85555.10, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-49', 'CUST-KB-049', 'Molla Mobile Zone', 'Molla Mobile Zone (Proprietor)', '+880 1700-100048', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 195275.40, 195275.40, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-50', 'CUST-KB-050', 'Moon Star', 'Moon Star (Proprietor)', '+880 1700-100049', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 201620.28, 201620.28, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-51', 'CUST-KB-051', 'Movie Exape', 'Movie Exape (Proprietor)', '+880 1700-100050', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 9986.50, 9986.50, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-52', 'CUST-KB-052', 'Mridha', 'Mridha (Proprietor)', '+880 1700-100051', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 90.00, 90.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-53', 'CUST-KB-053', 'Nabin Bhai', 'Nabin Bhai (Proprietor)', '+880 1700-100052', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 4234.15, 4234.15, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-54', 'CUST-KB-054', 'Nur Alam (Sumon)', 'Nur Alam (Sumon) (Proprietor)', '+880 1700-100053', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 142147.70, 142147.70, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-55', 'CUST-KB-055', 'Nur Nahar', 'Nur Nahar (Proprietor)', '01736060992', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 180.00, 180.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-56', 'CUST-KB-056', 'One Plus  Juwel SR', 'One Plus  Juwel SR (Proprietor)', '+880 1700-100055', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 26300.00, 26300.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-57', 'CUST-KB-057', 'One Plus Amir', 'One Plus Amir (Proprietor)', '+880 1700-100056', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-58', 'CUST-KB-058', 'One Plus Apallo', 'One Plus Apallo (Proprietor)', '+880 1700-100057', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 60.00, 60.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-59', 'CUST-KB-059', 'One Plus Big Mobile', 'One Plus Big Mobile (Proprietor)', '+880 1700-100058', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 290.00, 290.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-60', 'CUST-KB-060', 'One Plus Master Telecom', 'One Plus Master Telecom (Proprietor)', '+880 1700-100059', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 80.00, 80.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-61', 'CUST-KB-061', 'One Plus Mobile Fair', 'One Plus Mobile Fair (Proprietor)', '+880 1700-100060', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 24470.00, 24470.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-62', 'CUST-KB-062', 'One Plus Mokka', 'One Plus Mokka (Proprietor)', '+880 1700-100061', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 22630.00, 22630.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-63', 'CUST-KB-063', 'One Plus Mooon Star', 'One Plus Mooon Star (Proprietor)', '+880 1700-100062', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-64', 'CUST-KB-064', 'One Plus Sajib SR', 'One Plus Sajib SR (Proprietor)', '+880 1700-100063', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-65', 'CUST-KB-065', 'One Plus Sajib Telecom', 'One Plus Sajib Telecom (Proprietor)', '+880 1700-100064', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-66', 'CUST-KB-066', 'one plus Shohag OSR', 'one plus Shohag OSR (Proprietor)', '+880 1700-100065', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-67', 'CUST-KB-067', 'One Plus Sompoity', 'One Plus Sompoity (Proprietor)', '+880 1700-100066', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 1430.00, 1430.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-68', 'CUST-KB-068', 'One Plus SR Telecom', 'One Plus SR Telecom (Proprietor)', '+880 1700-100067', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 6360.00, 6360.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-69', 'CUST-KB-069', 'One Plus Tandra 2', 'One Plus Tandra 2 (Proprietor)', '+880 1700-100068', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 2880.00, 2880.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-70', 'CUST-KB-070', 'Rabbi', 'Rabbi (Proprietor)', '+880 1700-100069', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 3160.00, 3160.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-71', 'CUST-KB-071', 'Rafsan Telecom (sumon)', 'Rafsan Telecom (sumon) (Proprietor)', '+880 1700-100070', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 66056.95, 66056.95, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-72', 'CUST-KB-072', 'Raju Mobile Zone', 'Raju Mobile Zone (Proprietor)', '+880 1700-100071', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 105951.95, 105951.95, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-73', 'CUST-KB-073', 'Razu Mobile', 'Razu Mobile (Proprietor)', '01725532509', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-74', 'CUST-KB-074', 'Robiul Telecom Sojib', 'Robiul Telecom Sojib (Proprietor)', '+880 1700-100073', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 140142.46, 140142.46, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-75', 'CUST-KB-075', 'Ruhul Almin Khan Dealer', 'Ruhul Almin Khan Dealer (Proprietor)', '+880 1700-100074', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 225848.40, 225848.40, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-76', 'CUST-KB-076', 'S.K Media', 'S.K Media (Proprietor)', '+880 1700-100075', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-77', 'CUST-KB-077', 'Saddam Telecom', 'Saddam Telecom (Proprietor)', '+880 1700-100076', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 698266, 15, 'Wholesale Dealer', 'sm-1', 465510.59, 465510.59, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-78', 'CUST-KB-078', 'Saha Mobile', 'Saha Mobile (Proprietor)', '+880 1700-100077', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 67122.73, 67122.73, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-79', 'CUST-KB-079', 'Sajib Telecom', 'Sajib Telecom (Proprietor)', '+880 1700-100078', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 7.10, 7.10, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-80', 'CUST-KB-080', 'Shadhin Bagla Telecom', 'Shadhin Bagla Telecom (Proprietor)', '+880 1700-100079', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 709.63, 709.63, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-81', 'CUST-KB-081', 'Sher E Bangla', 'Sher E Bangla (Proprietor)', '+880 1700-100080', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 825.00, 825.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-82', 'CUST-KB-082', 'Sk Oppo Zone', 'Sk Oppo Zone (Proprietor)', '+880 1700-100081', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 0.45, 0.45, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-83', 'CUST-KB-083', 'Smart Tech', 'Smart Tech (Proprietor)', '+880 1700-100082', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 833217, 15, 'Wholesale Dealer', 'sm-3', 555477.95, 555477.95, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-84', 'CUST-KB-084', 'Sojib SR', 'Sojib SR (Proprietor)', '+880 1700-100083', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 142950.70, 142950.70, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-85', 'CUST-KB-085', 'Somprity', 'Somprity (Proprietor)', '+880 1700-100084', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 1686169, 15, 'Wholesale Dealer', 'sm-1', 1124112.72, 1124112.72, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-86', 'CUST-KB-086', 'SONDI', 'SONDI (Proprietor)', '+880 1700-100085', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 125.00, 125.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-87', 'CUST-KB-087', 'Sr Telecom', 'Sr Telecom (Proprietor)', '+880 1700-100086', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 26490.00, 26490.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-88', 'CUST-KB-088', 'Sumaiya Telecom', 'Sumaiya Telecom (Proprietor)', '+880 1700-100087', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 32164.00, 32164.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-89', 'CUST-KB-089', 'Sumon SR', 'Sumon SR (Proprietor)', '+880 1700-100088', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 321754.93, 321754.93, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-90', 'CUST-KB-090', 'Tandra Dealer TSm', 'Tandra Dealer TSm (Proprietor)', '+880 1700-100089', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 106511.30, 106511.30, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-91', 'CUST-KB-091', 'Tangail TSM', 'Tangail TSM (Proprietor)', '+880 1700-100090', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 0.00, 0.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-92', 'CUST-KB-092', 'Tawhid Enterprise Ja.....', 'Tawhid Enterprise Ja..... (Proprietor)', '+880 1700-100091', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 64600.00, 64600.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-93', 'CUST-KB-093', 'Tondra 2', 'Tondra 2 (Proprietor)', '+880 1700-100092', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 637109, 15, 'Wholesale Dealer', 'sm-1', 424739.54, 424739.54, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-94', 'CUST-KB-094', 'Tsm', 'Tsm (Proprietor)', '+880 1700-100093', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 1192188, 15, 'Wholesale Dealer', 'sm-2', 794792.30, 794792.30, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-95', 'CUST-KB-095', 'TSM Abid', 'TSM Abid (Proprietor)', '+880 1700-100094', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 19160.00, 19160.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-96', 'CUST-KB-096', 'Tuser Sojib Sr', 'Tuser Sojib Sr (Proprietor)', '+880 1700-100095', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-4', 45540.04, 45540.04, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-97', 'CUST-KB-097', 'Zahid Mowna', 'Zahid Mowna (Proprietor)', '+880 1700-100096', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-1', 54500.00, 54500.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-98', 'CUST-KB-098', 'Zisan Telecom', 'Zisan Telecom (Proprietor)', '+880 1700-100097', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-2', 13264.00, 13264.00, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (
  'cust-99', 'CUST-KB-099', 'Zunaid Board Bazar', 'Zunaid Board Bazar (Proprietor)', '+880 1700-100098', '', 'Konabari New Market, Gazipur', 'Konabari', 'Gazipur', 500000, 15, 'Wholesale Dealer', 'sm-3', 0.75, 0.75, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;

-- 8. PRODUCTS & VARIANTS
INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-1', 'brand-tecno', 'Tecno', 'Camon 40 Pro 5G (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 40 Pro 5G with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-1-1', 'prod-1', 'TEC-CAMON40P-8-256', '8GB', '256GB', 'Standard Black', 31699, 33020, 33350, 34671, 32360, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-2', 'brand-tecno', 'Tecno', 'Camon 40 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 40 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-2-1', 'prod-2', 'TEC-CAMON40-8-128', '8GB', '128GB', 'Standard Black', 20371, 21220, 21432, 22281, 20796, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-3', 'brand-tecno', 'Tecno', 'Camon 50 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 50 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-3-1', 'prod-3', 'TEC-CAMON50-8-128', '8GB', '128GB', 'Standard Black', 30907, 32195, 32517, 33805, 31551, 500, 5, 30, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-4', 'brand-tecno', 'Tecno', 'Camon 50 (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 50 with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-4-1', 'prod-4', 'TEC-CAMON50-8-256', '8GB', '256GB', 'Standard Black', 35328, 36800, 37168, 38640, 36064, 500, 5, 28, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-5', 'brand-tecno', 'Tecno', 'Camon 50 Ultra (12GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 50 Ultra with 12GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-5-1', 'prod-5', 'TEC-CAMON50U-12-256', '12GB', '256GB', 'Standard Black', 42576, 44350, 44794, 46568, 43463, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-6', 'brand-tecno', 'Tecno', 'Camon 50 Ultra (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon 50 Ultra with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-6-1', 'prod-6', 'TEC-CAMON50U-8-256', '8GB', '256GB', 'Standard Black', 42576, 44350, 44794, 46568, 43463, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-7', 'brand-tecno', 'Tecno', 'Camon Air (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon Air with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-7-1', 'prod-7', 'TEC-CAMONAIR-8-128', '8GB', '128GB', 'Standard Black', 39756, 41413, 41827, 43484, 40585, 500, 5, 4, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-8', 'brand-tecno', 'Tecno', 'Camon Air (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon Air with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-8-1', 'prod-8', 'TEC-CAMONAIR-8-256', '8GB', '256GB', 'Standard Black', 44171, 46011, 46471, 48312, 45091, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-9', 'brand-tecno', 'Tecno', 'Camon Slim (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon Slim with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-9-1', 'prod-9', 'TEC-CAMONSLI-8-256', '8GB', '256GB', 'Standard Black', 53003, 55211, 55763, 57972, 54107, 500, 5, 3, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-10', 'brand-tecno', 'Tecno', 'Camon30 (12GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon30 with 12GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-10-1', 'prod-10', 'TEC-CAMON30-12-256', '12GB', '256GB', 'Standard Black', 26592, 27700, 27977, 29085, 27146, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-11', 'brand-tecno', 'Tecno', 'Camon30S (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon30S with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-11-1', 'prod-11', 'TEC-CAMON30S-8-256', '8GB', '256GB', 'Standard Black', 26760, 27875, 28154, 29269, 27318, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-12', 'brand-tecno', 'Tecno', 'Camon40 (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon40 with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-12-1', 'prod-12', 'TEC-CAMON40-8-256', '8GB', '256GB', 'Standard Black', 21734, 22640, 22866, 23772, 22187, 500, 5, 29, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-13', 'brand-tecno', 'Tecno', 'Camon40 Pro (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Camon40 Pro with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-13-1', 'prod-13', 'TEC-CAMON40P-8-128', '8GB', '128GB', 'Standard Black', 25354, 26410, 26674, 27731, 25882, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-14', 'brand-tecno', 'Tecno', 'Go 3 (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Go 3 with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-14-1', 'prod-14', 'TEC-GO3-4-128', '4GB', '128GB', 'Standard Black', 14578, 15185, 15337, 15944, 14881, 500, 5, 25, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-15', 'brand-tecno', 'Tecno', 'Go 3 (4GB+64GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Go 3 with 4GB RAM and 64GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-15-1', 'prod-15', 'TEC-GO3-4-64', '4GB', '64GB', 'Standard Black', 13728, 14300, 14443, 15015, 14014, 500, 5, 2475, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-16', 'brand-tecno', 'Tecno', 'GO1 (3GB+64GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - GO1 with 3GB RAM and 64GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-16-1', 'prod-16', 'TEC-GO1-3-64', '3GB', '64GB', 'Standard Black', 9101, 9480, 9575, 9954, 9290, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-17', 'brand-tecno', 'Tecno', 'GO1 (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - GO1 with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-17-1', 'prod-17', 'TEC-GO1-4-128', '4GB', '128GB', 'Standard Black', 12000, 12500, 12625, 13125, 12250, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-18', 'brand-tecno', 'Tecno', 'GO1 (4GB+64GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - GO1 with 4GB RAM and 64GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-18-1', 'prod-18', 'TEC-GO1-4-64', '4GB', '64GB', 'Standard Black', 10008, 10425, 10529, 10946, 10217, 500, 5, 268, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-19', 'brand-tecno', 'Tecno', 'Go2 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Go2 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-19-1', 'prod-19', 'TEC-GO2-8-128', '8GB', '128GB', 'Standard Black', 9974, 10390, 10494, 10910, 10182, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-20', 'brand-tecno', 'Tecno', 'Go2 (3GB+64GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Go2 with 3GB RAM and 64GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-20-1', 'prod-20', 'TEC-GO2-3-64', '3GB', '64GB', 'Standard Black', 8814, 9181, 9273, 9640, 8997, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-21', 'brand-tecno', 'Tecno', 'Live 40c (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live 40c with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-21-1', 'prod-21', 'TEC-LIVE40C-8-128', '8GB', '128GB', 'Standard Black', 8429, 8780, 8868, 9219, 8604, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-22', 'brand-tecno', 'Tecno', 'Live Demo 40pro+ (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo 40pro+ with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-22-1', 'prod-22', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 16851, 17553, 17729, 18431, 17202, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-23', 'brand-tecno', 'Tecno', 'Live Demo Camon 50 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Camon 50 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-23-1', 'prod-23', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 20894, 21765, 21983, 22853, 21330, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-24', 'brand-tecno', 'Tecno', 'Live Demo Go2 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Go2 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-24-1', 'prod-24', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 6720, 7000, 7070, 7350, 6860, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-25', 'brand-tecno', 'Tecno', 'Live Demo Go3 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Go3 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-25-1', 'prod-25', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 21600, 22500, 22725, 23625, 22050, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-26', 'brand-tecno', 'Tecno', 'Live Demo Pova 7 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Pova 7 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-26-1', 'prod-26', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 23590, 24573, 24819, 25802, 24082, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-27', 'brand-tecno', 'Tecno', 'Live Demo Pova Cave (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Pova Cave with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-27-1', 'prod-27', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 22176, 23100, 23331, 24255, 22638, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-28', 'brand-tecno', 'Tecno', 'LIVE DEMO Pova Curve 2 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - LIVE DEMO Pova Curve 2 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-28-1', 'prod-28', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 24864, 25900, 26159, 27195, 25382, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-29', 'brand-tecno', 'Tecno', 'Live DEMO Pova Silm (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live DEMO Pova Silm with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-29-1', 'prod-29', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 20220, 21063, 21274, 22116, 20642, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-30', 'brand-tecno', 'Tecno', 'Live Demo Spark 40 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Spark 40 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-30-1', 'prod-30', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 9437, 9830, 9928, 10322, 9633, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-31', 'brand-tecno', 'Tecno', 'Live Demo Spark 40 5G (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Spark 40 5G with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-31-1', 'prod-31', 'TEC-LIVEDEMO-8-256', '8GB', '256GB', 'Standard Black', 11459, 11936, 12055, 12533, 11697, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-32', 'brand-tecno', 'Tecno', 'Live Demo Spark 40 Pro (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Spark 40 Pro with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-32-1', 'prod-32', 'TEC-LIVEDEMO-8-128', '8GB', '128GB', 'Standard Black', 13480, 14042, 14182, 14744, 13761, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-33', 'brand-tecno', 'Tecno', 'Live Demo Spark 50 (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Spark 50 with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-33-1', 'prod-33', 'TEC-LIVEDEMO-4-128', '4GB', '128GB', 'Standard Black', 11760, 12250, 12373, 12863, 12005, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-34', 'brand-tecno', 'Tecno', 'Live Demo Spark 50 5G (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Live Demo Spark 50 5G with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-34-1', 'prod-34', 'TEC-LIVEDEMO-8-256', '8GB', '256GB', 'Standard Black', 16128, 16800, 16968, 17640, 16464, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-35', 'brand-oneplus', 'OnePlus', 'N30 SE (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official OnePlus Smartphone - N30 SE with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-35-1', 'prod-35', '1PL-N30SE-8-128', '8GB', '128GB', 'Standard Black', 14400, 15000, 15150, 15750, 14700, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-36', 'brand-oneplus', 'OnePlus', 'One Plus C4 Light (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official OnePlus Smartphone - One Plus C4 Light with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-36-1', 'prod-36', '1PL-ONEPLUSC-8-128', '8GB', '128GB', 'Standard Black', 20544, 21400, 21614, 22470, 20972, 500, 5, 2, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-37', 'brand-tecno', 'Tecno', 'Pova 7 Pro (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Pova 7 Pro with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-37-1', 'prod-37', 'TEC-POVA7PRO-8-128', '8GB', '128GB', 'Standard Black', 31699, 33020, 33350, 34671, 32360, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-38', 'brand-tecno', 'Tecno', 'Pova Carve (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Pova Carve with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-38-1', 'prod-38', 'TEC-POVACARV-8-128', '8GB', '128GB', 'Standard Black', 29904, 31150, 31462, 32708, 30527, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-39', 'brand-tecno', 'Tecno', 'Pova Curve 2 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Pova Curve 2 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-39-1', 'prod-39', 'TEC-POVACURV-8-128', '8GB', '128GB', 'Standard Black', 36230, 37740, 38117, 39627, 36985, 500, 5, 16, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-40', 'brand-tecno', 'Tecno', 'Pova Curve 2 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Pova Curve 2 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-40-1', 'prod-40', 'TEC-POVACURV-8-128', '8GB', '128GB', 'Standard Black', 33514, 34910, 35259, 36656, 34212, 500, 5, 9, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-41', 'brand-tecno', 'Tecno', 'Pova Slim (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Pova Slim with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-41-1', 'prod-41', 'TEC-POVASLIM-8-128', '8GB', '128GB', 'Standard Black', 26490, 27594, 27870, 28974, 27042, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-42', 'brand-tecno', 'Tecno', 'SP 50 4G (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - SP 50 4G with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-42-1', 'prod-42', 'TEC-SP504G-8-256', '8GB', '256GB', 'Standard Black', 21600, 22500, 22725, 23625, 22050, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-43', 'brand-tecno', 'Tecno', 'Spark 20C (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 20C with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-43-1', 'prod-43', 'TEC-SPARK20C-4-128', '4GB', '128GB', 'Standard Black', 10867, 11320, 11433, 11886, 11094, 500, 5, 5, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-44', 'brand-tecno', 'Tecno', 'Spark 30 (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 30 with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-44-1', 'prod-44', 'TEC-SPARK30-8-128', '8GB', '128GB', 'Standard Black', 16291, 16970, 17140, 17819, 16631, 500, 5, 11, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-45', 'brand-tecno', 'Tecno', 'Spark 30C (6GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 30C with 6GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-45-1', 'prod-45', 'TEC-SPARK30C-6-128', '6GB', '128GB', 'Standard Black', 12739, 13270, 13403, 13934, 13005, 500, 5, 45, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-46', 'brand-tecno', 'Tecno', 'Spark 30C (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 30C with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-46-1', 'prod-46', 'TEC-SPARK30C-8-256', '8GB', '256GB', 'Standard Black', 21600, 22500, 22725, 23625, 22050, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-47', 'brand-tecno', 'Tecno', 'Spark 40 5G (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 40 5G with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-47-1', 'prod-47', 'TEC-SPARK405-8-256', '8GB', '256GB', 'Standard Black', 15398, 16040, 16200, 16842, 15719, 500, 5, 2, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-48', 'brand-tecno', 'Tecno', 'Spark 40 Pro (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 40 Pro with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-48-1', 'prod-48', 'TEC-SPARK40P-8-128', '8GB', '128GB', 'Standard Black', 20832, 21700, 21917, 22785, 21266, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-49', 'brand-tecno', 'Tecno', 'Spark 40 (8GB+256GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 40 with 8GB RAM and 256GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-49-1', 'prod-49', 'TEC-SPARK40-8-256', '8GB', '256GB', 'Standard Black', 18125, 18880, 19069, 19824, 18502, 500, 5, 2, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-50', 'brand-tecno', 'Tecno', 'Spark 40c (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 40c with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-50-1', 'prod-50', 'TEC-SPARK40C-4-128', '4GB', '128GB', 'Standard Black', 11318, 11790, 11908, 12380, 11554, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-51', 'brand-tecno', 'Tecno', 'Spark 50 (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50 with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-51-1', 'prod-51', 'TEC-SPARK50-4-128', '4GB', '128GB', 'Standard Black', 17203, 17920, 18099, 18816, 17562, 500, 5, 27, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-52', 'brand-tecno', 'Tecno', 'Spark 50 (6GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50 with 6GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-52-1', 'prod-52', 'TEC-SPARK50-6-128', '6GB', '128GB', 'Standard Black', 19924, 20754, 20962, 21792, 20339, 500, 5, 336, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-53', 'brand-tecno', 'Tecno', 'Spark 50 5G (6GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50 5G with 6GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-53-1', 'prod-53', 'TEC-SPARK505-6-128', '6GB', '128GB', 'Standard Black', 21974, 22890, 23119, 24035, 22432, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-54', 'brand-tecno', 'Tecno', 'Spark 50 Pro (6GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50 Pro with 6GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-54-1', 'prod-54', 'TEC-SPARK50P-6-128', '6GB', '128GB', 'Standard Black', 23844, 24838, 25086, 26080, 24341, 500, 5, 5, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-55', 'brand-tecno', 'Tecno', 'Spark 50c (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50c with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-55-1', 'prod-55', 'TEC-SPARK50C-4-128', '4GB', '128GB', 'Standard Black', 21204, 22088, 22309, 23192, 21646, 500, 5, 12, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-56', 'brand-tecno', 'Tecno', 'Spark 50c (4GB+64GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark 50c with 4GB RAM and 64GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-56-1', 'prod-56', 'TEC-SPARK50C-4-64', '4GB', '64GB', 'Standard Black', 19450, 20260, 20463, 21273, 19855, 500, 5, 12, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-57', 'brand-tecno', 'Tecno', 'Spark30 Pro (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark30 Pro with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-57-1', 'prod-57', 'TEC-SPARK30P-8-128', '8GB', '128GB', 'Standard Black', 18115, 18870, 19059, 19814, 18493, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-58', 'brand-tecno', 'Tecno', 'Spark40 (6GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark40 with 6GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-58-1', 'prod-58', 'TEC-SPARK40-6-128', '6GB', '128GB', 'Standard Black', 14995, 15620, 15776, 16401, 15308, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-59', 'brand-tecno', 'Tecno', 'Spark40 Pro Pius (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark40 Pro Pius with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-59-1', 'prod-59', 'TEC-SPARK40P-8-128', '8GB', '128GB', 'Standard Black', 22646, 23590, 23826, 24770, 23118, 500, 5, 0, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-60', 'brand-tecno', 'Tecno', 'Spark50 Pro (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark50 Pro with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-60-1', 'prod-60', 'TEC-SPARK50P-4-128', '4GB', '128GB', 'Standard Black', 22098, 23019, 23249, 24170, 22559, 500, 5, 4, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-61', 'brand-tecno', 'Tecno', 'Spark50 Pro Luiv Demo (8GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Spark50 Pro Luiv Demo with 8GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-61-1', 'prod-61', 'TEC-SPARK50P-8-128', '8GB', '128GB', 'Standard Black', 18202, 18960, 19150, 19908, 18581, 500, 5, 1, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (
  'prod-62', 'brand-tecno', 'Tecno', 'Tablet Megapad (4GB+128GB)', 'Smartphone', 'Official BD / BTRC Approved', 12, 'Official Tecno Smartphone - Tablet Megapad with 4GB RAM and 128GB Storage. BTRC Approved.', 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;

INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (
  'var-62-1', 'prod-62', 'TEC-TABLETME-4-128', '4GB', '128GB', 'Standard Black', 18542, 19315, 19508, 20281, 18929, 500, 5, 5, NOW()
) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;

-- 9. IMEIS FOR ACTIVE STOCK
INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1001', '86840012357345', '86840012357346', 'SN-TEC-1001', 'prod-1', 'Camon 40 Pro 5G (8GB+256GB)', 'var-1-1', '8GB/256GB - Standard Black', 'Tecno', 31699, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1002', '86840012369690', '86840012369691', 'SN-TEC-1002', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1003', '86840012382035', '86840012382036', 'SN-TEC-1003', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1004', '86840012394380', '86840012394381', 'SN-TEC-1004', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1005', '86840012406725', '86840012406726', 'SN-TEC-1005', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1006', '86840012419070', '86840012419071', 'SN-TEC-1006', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1007', '86840012431415', '86840012431416', 'SN-TEC-1007', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1008', '86840012443760', '86840012443761', 'SN-TEC-1008', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1009', '86840012456105', '86840012456106', 'SN-TEC-1009', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1010', '86840012468450', '86840012468451', 'SN-TEC-1010', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1011', '86840012480795', '86840012480796', 'SN-TEC-1011', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1012', '86840012493140', '86840012493141', 'SN-TEC-1012', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1013', '86840012505485', '86840012505486', 'SN-TEC-1013', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1014', '86840012517830', '86840012517831', 'SN-TEC-1014', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1015', '86840012530175', '86840012530176', 'SN-TEC-1015', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1016', '86840012542520', '86840012542521', 'SN-TEC-1016', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1017', '86840012554865', '86840012554866', 'SN-TEC-1017', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1018', '86840012567210', '86840012567211', 'SN-TEC-1018', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1019', '86840012579555', '86840012579556', 'SN-TEC-1019', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1020', '86840012591900', '86840012591901', 'SN-TEC-1020', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1021', '86840012604245', '86840012604246', 'SN-TEC-1021', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1022', '86840012616590', '86840012616591', 'SN-TEC-1022', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1023', '86840012628935', '86840012628936', 'SN-TEC-1023', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1024', '86840012641280', '86840012641281', 'SN-TEC-1024', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1025', '86840012653625', '86840012653626', 'SN-TEC-1025', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1026', '86840012665970', '86840012665971', 'SN-TEC-1026', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1027', '86840012678315', '86840012678316', 'SN-TEC-1027', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1028', '86840012690660', '86840012690661', 'SN-TEC-1028', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1029', '86840012703005', '86840012703006', 'SN-TEC-1029', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1030', '86840012715350', '86840012715351', 'SN-TEC-1030', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1031', '86840012727695', '86840012727696', 'SN-TEC-1031', 'prod-3', 'Camon 50 (8GB+128GB)', 'var-3-1', '8GB/128GB - Standard Black', 'Tecno', 30907, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1032', '86840012740040', '86840012740041', 'SN-TEC-1032', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1033', '86840012752385', '86840012752386', 'SN-TEC-1033', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1034', '86840012764730', '86840012764731', 'SN-TEC-1034', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1035', '86840012777075', '86840012777076', 'SN-TEC-1035', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1036', '86840012789420', '86840012789421', 'SN-TEC-1036', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1037', '86840012801765', '86840012801766', 'SN-TEC-1037', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1038', '86840012814110', '86840012814111', 'SN-TEC-1038', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1039', '86840012826455', '86840012826456', 'SN-TEC-1039', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1040', '86840012838800', '86840012838801', 'SN-TEC-1040', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1041', '86840012851145', '86840012851146', 'SN-TEC-1041', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1042', '86840012863490', '86840012863491', 'SN-TEC-1042', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1043', '86840012875835', '86840012875836', 'SN-TEC-1043', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1044', '86840012888180', '86840012888181', 'SN-TEC-1044', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1045', '86840012900525', '86840012900526', 'SN-TEC-1045', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1046', '86840012912870', '86840012912871', 'SN-TEC-1046', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1047', '86840012925215', '86840012925216', 'SN-TEC-1047', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1048', '86840012937560', '86840012937561', 'SN-TEC-1048', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1049', '86840012949905', '86840012949906', 'SN-TEC-1049', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1050', '86840012962250', '86840012962251', 'SN-TEC-1050', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1051', '86840012974595', '86840012974596', 'SN-TEC-1051', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1052', '86840012986940', '86840012986941', 'SN-TEC-1052', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1053', '86840012999285', '86840012999286', 'SN-TEC-1053', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1054', '86840013011630', '86840013011631', 'SN-TEC-1054', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1055', '86840013023975', '86840013023976', 'SN-TEC-1055', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1056', '86840013036320', '86840013036321', 'SN-TEC-1056', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1057', '86840013048665', '86840013048666', 'SN-TEC-1057', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1058', '86840013061010', '86840013061011', 'SN-TEC-1058', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1059', '86840013073355', '86840013073356', 'SN-TEC-1059', 'prod-4', 'Camon 50 (8GB+256GB)', 'var-4-1', '8GB/256GB - Standard Black', 'Tecno', 35328, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1060', '86840013085700', '86840013085701', 'SN-TEC-1060', 'prod-6', 'Camon 50 Ultra (8GB+256GB)', 'var-6-1', '8GB/256GB - Standard Black', 'Tecno', 42576, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1061', '86840013098045', '86840013098046', 'SN-TEC-1061', 'prod-7', 'Camon Air (8GB+128GB)', 'var-7-1', '8GB/128GB - Standard Black', 'Tecno', 39756, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1062', '86840013110390', '86840013110391', 'SN-TEC-1062', 'prod-7', 'Camon Air (8GB+128GB)', 'var-7-1', '8GB/128GB - Standard Black', 'Tecno', 39756, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1063', '86840013122735', '86840013122736', 'SN-TEC-1063', 'prod-7', 'Camon Air (8GB+128GB)', 'var-7-1', '8GB/128GB - Standard Black', 'Tecno', 39756, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1064', '86840013135080', '86840013135081', 'SN-TEC-1064', 'prod-7', 'Camon Air (8GB+128GB)', 'var-7-1', '8GB/128GB - Standard Black', 'Tecno', 39756, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1065', '86840013147425', '86840013147426', 'SN-TEC-1065', 'prod-9', 'Camon Slim (8GB+256GB)', 'var-9-1', '8GB/256GB - Standard Black', 'Tecno', 53003, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1066', '86840013159770', '86840013159771', 'SN-TEC-1066', 'prod-9', 'Camon Slim (8GB+256GB)', 'var-9-1', '8GB/256GB - Standard Black', 'Tecno', 53003, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1067', '86840013172115', '86840013172116', 'SN-TEC-1067', 'prod-9', 'Camon Slim (8GB+256GB)', 'var-9-1', '8GB/256GB - Standard Black', 'Tecno', 53003, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1068', '86840013184460', '86840013184461', 'SN-TEC-1068', 'prod-10', 'Camon30 (12GB+256GB)', 'var-10-1', '12GB/256GB - Standard Black', 'Tecno', 26592, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1069', '86840013196805', '86840013196806', 'SN-TEC-1069', 'prod-11', 'Camon30S (8GB+256GB)', 'var-11-1', '8GB/256GB - Standard Black', 'Tecno', 26760, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1070', '86840013209150', '86840013209151', 'SN-TEC-1070', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1071', '86840013221495', '86840013221496', 'SN-TEC-1071', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1072', '86840013233840', '86840013233841', 'SN-TEC-1072', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1073', '86840013246185', '86840013246186', 'SN-TEC-1073', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1074', '86840013258530', '86840013258531', 'SN-TEC-1074', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1075', '86840013270875', '86840013270876', 'SN-TEC-1075', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1076', '86840013283220', '86840013283221', 'SN-TEC-1076', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1077', '86840013295565', '86840013295566', 'SN-TEC-1077', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1078', '86840013307910', '86840013307911', 'SN-TEC-1078', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1079', '86840013320255', '86840013320256', 'SN-TEC-1079', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1080', '86840013332600', '86840013332601', 'SN-TEC-1080', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1081', '86840013344945', '86840013344946', 'SN-TEC-1081', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1082', '86840013357290', '86840013357291', 'SN-TEC-1082', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1083', '86840013369635', '86840013369636', 'SN-TEC-1083', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1084', '86840013381980', '86840013381981', 'SN-TEC-1084', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1085', '86840013394325', '86840013394326', 'SN-TEC-1085', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1086', '86840013406670', '86840013406671', 'SN-TEC-1086', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1087', '86840013419015', '86840013419016', 'SN-TEC-1087', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1088', '86840013431360', '86840013431361', 'SN-TEC-1088', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1089', '86840013443705', '86840013443706', 'SN-TEC-1089', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1090', '86840013456050', '86840013456051', 'SN-TEC-1090', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1091', '86840013468395', '86840013468396', 'SN-TEC-1091', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1092', '86840013480740', '86840013480741', 'SN-TEC-1092', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1093', '86840013493085', '86840013493086', 'SN-TEC-1093', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1094', '86840013505430', '86840013505431', 'SN-TEC-1094', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1095', '86840013517775', '86840013517776', 'SN-TEC-1095', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1096', '86840013530120', '86840013530121', 'SN-TEC-1096', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1097', '86840013542465', '86840013542466', 'SN-TEC-1097', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1098', '86840013554810', '86840013554811', 'SN-TEC-1098', 'prod-12', 'Camon40 (8GB+256GB)', 'var-12-1', '8GB/256GB - Standard Black', 'Tecno', 21734, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1099', '86840013567155', '86840013567156', 'SN-TEC-1099', 'prod-13', 'Camon40 Pro (8GB+128GB)', 'var-13-1', '8GB/128GB - Standard Black', 'Tecno', 25354, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1100', '86840013579500', '86840013579501', 'SN-TEC-1100', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1101', '86840013591845', '86840013591846', 'SN-TEC-1101', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1102', '86840013604190', '86840013604191', 'SN-TEC-1102', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1103', '86840013616535', '86840013616536', 'SN-TEC-1103', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1104', '86840013628880', '86840013628881', 'SN-TEC-1104', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1105', '86840013641225', '86840013641226', 'SN-TEC-1105', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1106', '86840013653570', '86840013653571', 'SN-TEC-1106', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1107', '86840013665915', '86840013665916', 'SN-TEC-1107', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1108', '86840013678260', '86840013678261', 'SN-TEC-1108', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1109', '86840013690605', '86840013690606', 'SN-TEC-1109', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1110', '86840013702950', '86840013702951', 'SN-TEC-1110', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1111', '86840013715295', '86840013715296', 'SN-TEC-1111', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1112', '86840013727640', '86840013727641', 'SN-TEC-1112', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1113', '86840013739985', '86840013739986', 'SN-TEC-1113', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1114', '86840013752330', '86840013752331', 'SN-TEC-1114', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1115', '86840013764675', '86840013764676', 'SN-TEC-1115', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1116', '86840013777020', '86840013777021', 'SN-TEC-1116', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1117', '86840013789365', '86840013789366', 'SN-TEC-1117', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1118', '86840013801710', '86840013801711', 'SN-TEC-1118', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1119', '86840013814055', '86840013814056', 'SN-TEC-1119', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1120', '86840013826400', '86840013826401', 'SN-TEC-1120', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1121', '86840013838745', '86840013838746', 'SN-TEC-1121', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1122', '86840013851090', '86840013851091', 'SN-TEC-1122', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1123', '86840013863435', '86840013863436', 'SN-TEC-1123', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1124', '86840013875780', '86840013875781', 'SN-TEC-1124', 'prod-14', 'Go 3 (4GB+128GB)', 'var-14-1', '4GB/128GB - Standard Black', 'Tecno', 14578, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1125', '86840013888125', '86840013888126', 'SN-TEC-1125', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1126', '86840013900470', '86840013900471', 'SN-TEC-1126', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1127', '86840013912815', '86840013912816', 'SN-TEC-1127', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1128', '86840013925160', '86840013925161', 'SN-TEC-1128', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1129', '86840013937505', '86840013937506', 'SN-TEC-1129', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1130', '86840013949850', '86840013949851', 'SN-TEC-1130', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1131', '86840013962195', '86840013962196', 'SN-TEC-1131', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1132', '86840013974540', '86840013974541', 'SN-TEC-1132', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1133', '86840013986885', '86840013986886', 'SN-TEC-1133', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1134', '86840013999230', '86840013999231', 'SN-TEC-1134', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1135', '86840014011575', '86840014011576', 'SN-TEC-1135', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1136', '86840014023920', '86840014023921', 'SN-TEC-1136', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1137', '86840014036265', '86840014036266', 'SN-TEC-1137', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1138', '86840014048610', '86840014048611', 'SN-TEC-1138', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1139', '86840014060955', '86840014060956', 'SN-TEC-1139', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1140', '86840014073300', '86840014073301', 'SN-TEC-1140', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1141', '86840014085645', '86840014085646', 'SN-TEC-1141', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1142', '86840014097990', '86840014097991', 'SN-TEC-1142', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1143', '86840014110335', '86840014110336', 'SN-TEC-1143', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1144', '86840014122680', '86840014122681', 'SN-TEC-1144', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1145', '86840014135025', '86840014135026', 'SN-TEC-1145', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1146', '86840014147370', '86840014147371', 'SN-TEC-1146', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1147', '86840014159715', '86840014159716', 'SN-TEC-1147', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1148', '86840014172060', '86840014172061', 'SN-TEC-1148', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1149', '86840014184405', '86840014184406', 'SN-TEC-1149', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1150', '86840014196750', '86840014196751', 'SN-TEC-1150', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1151', '86840014209095', '86840014209096', 'SN-TEC-1151', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1152', '86840014221440', '86840014221441', 'SN-TEC-1152', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1153', '86840014233785', '86840014233786', 'SN-TEC-1153', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1154', '86840014246130', '86840014246131', 'SN-TEC-1154', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1155', '86840014258475', '86840014258476', 'SN-TEC-1155', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1156', '86840014270820', '86840014270821', 'SN-TEC-1156', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1157', '86840014283165', '86840014283166', 'SN-TEC-1157', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1158', '86840014295510', '86840014295511', 'SN-TEC-1158', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1159', '86840014307855', '86840014307856', 'SN-TEC-1159', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1160', '86840014320200', '86840014320201', 'SN-TEC-1160', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1161', '86840014332545', '86840014332546', 'SN-TEC-1161', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1162', '86840014344890', '86840014344891', 'SN-TEC-1162', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1163', '86840014357235', '86840014357236', 'SN-TEC-1163', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1164', '86840014369580', '86840014369581', 'SN-TEC-1164', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1165', '86840014381925', '86840014381926', 'SN-TEC-1165', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1166', '86840014394270', '86840014394271', 'SN-TEC-1166', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1167', '86840014406615', '86840014406616', 'SN-TEC-1167', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1168', '86840014418960', '86840014418961', 'SN-TEC-1168', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1169', '86840014431305', '86840014431306', 'SN-TEC-1169', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1170', '86840014443650', '86840014443651', 'SN-TEC-1170', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1171', '86840014455995', '86840014455996', 'SN-TEC-1171', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1172', '86840014468340', '86840014468341', 'SN-TEC-1172', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1173', '86840014480685', '86840014480686', 'SN-TEC-1173', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1174', '86840014493030', '86840014493031', 'SN-TEC-1174', 'prod-15', 'Go 3 (4GB+64GB)', 'var-15-1', '4GB/64GB - Standard Black', 'Tecno', 13728, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1175', '86840014505375', '86840014505376', 'SN-TEC-1175', 'prod-16', 'GO1 (3GB+64GB)', 'var-16-1', '3GB/64GB - Standard Black', 'Tecno', 9101, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1176', '86840014517720', '86840014517721', 'SN-TEC-1176', 'prod-17', 'GO1 (4GB+128GB)', 'var-17-1', '4GB/128GB - Standard Black', 'Tecno', 12000, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1177', '86840014530065', '86840014530066', 'SN-TEC-1177', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1178', '86840014542410', '86840014542411', 'SN-TEC-1178', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1179', '86840014554755', '86840014554756', 'SN-TEC-1179', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1180', '86840014567100', '86840014567101', 'SN-TEC-1180', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1181', '86840014579445', '86840014579446', 'SN-TEC-1181', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1182', '86840014591790', '86840014591791', 'SN-TEC-1182', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1183', '86840014604135', '86840014604136', 'SN-TEC-1183', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1184', '86840014616480', '86840014616481', 'SN-TEC-1184', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1185', '86840014628825', '86840014628826', 'SN-TEC-1185', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1186', '86840014641170', '86840014641171', 'SN-TEC-1186', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1187', '86840014653515', '86840014653516', 'SN-TEC-1187', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1188', '86840014665860', '86840014665861', 'SN-TEC-1188', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1189', '86840014678205', '86840014678206', 'SN-TEC-1189', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1190', '86840014690550', '86840014690551', 'SN-TEC-1190', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1191', '86840014702895', '86840014702896', 'SN-TEC-1191', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1192', '86840014715240', '86840014715241', 'SN-TEC-1192', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1193', '86840014727585', '86840014727586', 'SN-TEC-1193', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1194', '86840014739930', '86840014739931', 'SN-TEC-1194', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1195', '86840014752275', '86840014752276', 'SN-TEC-1195', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1196', '86840014764620', '86840014764621', 'SN-TEC-1196', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1197', '86840014776965', '86840014776966', 'SN-TEC-1197', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1198', '86840014789310', '86840014789311', 'SN-TEC-1198', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1199', '86840014801655', '86840014801656', 'SN-TEC-1199', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1200', '86840014814000', '86840014814001', 'SN-TEC-1200', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1201', '86840014826345', '86840014826346', 'SN-TEC-1201', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1202', '86840014838690', '86840014838691', 'SN-TEC-1202', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1203', '86840014851035', '86840014851036', 'SN-TEC-1203', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1204', '86840014863380', '86840014863381', 'SN-TEC-1204', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1205', '86840014875725', '86840014875726', 'SN-TEC-1205', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1206', '86840014888070', '86840014888071', 'SN-TEC-1206', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1207', '86840014900415', '86840014900416', 'SN-TEC-1207', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1208', '86840014912760', '86840014912761', 'SN-TEC-1208', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1209', '86840014925105', '86840014925106', 'SN-TEC-1209', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1210', '86840014937450', '86840014937451', 'SN-TEC-1210', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1211', '86840014949795', '86840014949796', 'SN-TEC-1211', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1212', '86840014962140', '86840014962141', 'SN-TEC-1212', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1213', '86840014974485', '86840014974486', 'SN-TEC-1213', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1214', '86840014986830', '86840014986831', 'SN-TEC-1214', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1215', '86840014999175', '86840014999176', 'SN-TEC-1215', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1216', '86840015011520', '86840015011521', 'SN-TEC-1216', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1217', '86840015023865', '86840015023866', 'SN-TEC-1217', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1218', '86840015036210', '86840015036211', 'SN-TEC-1218', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1219', '86840015048555', '86840015048556', 'SN-TEC-1219', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1220', '86840015060900', '86840015060901', 'SN-TEC-1220', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1221', '86840015073245', '86840015073246', 'SN-TEC-1221', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1222', '86840015085590', '86840015085591', 'SN-TEC-1222', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1223', '86840015097935', '86840015097936', 'SN-TEC-1223', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1224', '86840015110280', '86840015110281', 'SN-TEC-1224', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1225', '86840015122625', '86840015122626', 'SN-TEC-1225', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1226', '86840015134970', '86840015134971', 'SN-TEC-1226', 'prod-18', 'GO1 (4GB+64GB)', 'var-18-1', '4GB/64GB - Standard Black', 'Tecno', 10008, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1227', '86840015147315', '86840015147316', 'SN-TEC-1227', 'prod-24', 'Live Demo Go2 (8GB+128GB)', 'var-24-1', '8GB/128GB - Standard Black', 'Tecno', 6720, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1228', '86840015159660', '86840015159661', 'SN-TEC-1228', 'prod-30', 'Live Demo Spark 40 (8GB+128GB)', 'var-30-1', '8GB/128GB - Standard Black', 'Tecno', 9437, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1229', '86840015172005', '86840015172006', 'SN-TEC-1229', 'prod-31', 'Live Demo Spark 40 5G (8GB+256GB)', 'var-31-1', '8GB/256GB - Standard Black', 'Tecno', 11459, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1230', '86490015184350', '86490015184351', 'SN-1PL-1230', 'prod-35', 'N30 SE (8GB+128GB)', 'var-35-1', '8GB/128GB - Standard Black', 'OnePlus', 14400, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1231', '86490015196695', '86490015196696', 'SN-1PL-1231', 'prod-36', 'One Plus C4 Light (8GB+128GB)', 'var-36-1', '8GB/128GB - Standard Black', 'OnePlus', 20544, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1232', '86490015209040', '86490015209041', 'SN-1PL-1232', 'prod-36', 'One Plus C4 Light (8GB+128GB)', 'var-36-1', '8GB/128GB - Standard Black', 'OnePlus', 20544, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1233', '86840015221385', '86840015221386', 'SN-TEC-1233', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1234', '86840015233730', '86840015233731', 'SN-TEC-1234', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1235', '86840015246075', '86840015246076', 'SN-TEC-1235', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1236', '86840015258420', '86840015258421', 'SN-TEC-1236', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1237', '86840015270765', '86840015270766', 'SN-TEC-1237', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1238', '86840015283110', '86840015283111', 'SN-TEC-1238', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1239', '86840015295455', '86840015295456', 'SN-TEC-1239', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1240', '86840015307800', '86840015307801', 'SN-TEC-1240', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1241', '86840015320145', '86840015320146', 'SN-TEC-1241', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1242', '86840015332490', '86840015332491', 'SN-TEC-1242', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1243', '86840015344835', '86840015344836', 'SN-TEC-1243', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1244', '86840015357180', '86840015357181', 'SN-TEC-1244', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1245', '86840015369525', '86840015369526', 'SN-TEC-1245', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1246', '86840015381870', '86840015381871', 'SN-TEC-1246', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1247', '86840015394215', '86840015394216', 'SN-TEC-1247', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1248', '86840015406560', '86840015406561', 'SN-TEC-1248', 'prod-39', 'Pova Curve 2 (8GB+128GB)', 'var-39-1', '8GB/128GB - Standard Black', 'Tecno', 36230, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1249', '86840015418905', '86840015418906', 'SN-TEC-1249', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1250', '86840015431250', '86840015431251', 'SN-TEC-1250', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1251', '86840015443595', '86840015443596', 'SN-TEC-1251', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1252', '86840015455940', '86840015455941', 'SN-TEC-1252', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1253', '86840015468285', '86840015468286', 'SN-TEC-1253', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1254', '86840015480630', '86840015480631', 'SN-TEC-1254', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1255', '86840015492975', '86840015492976', 'SN-TEC-1255', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1256', '86840015505320', '86840015505321', 'SN-TEC-1256', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1257', '86840015517665', '86840015517666', 'SN-TEC-1257', 'prod-40', 'Pova Curve 2 (8GB+128GB)', 'var-40-1', '8GB/128GB - Standard Black', 'Tecno', 33514, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1258', '86840015530010', '86840015530011', 'SN-TEC-1258', 'prod-43', 'Spark 20C (4GB+128GB)', 'var-43-1', '4GB/128GB - Standard Black', 'Tecno', 10867, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1259', '86840015542355', '86840015542356', 'SN-TEC-1259', 'prod-43', 'Spark 20C (4GB+128GB)', 'var-43-1', '4GB/128GB - Standard Black', 'Tecno', 10867, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1260', '86840015554700', '86840015554701', 'SN-TEC-1260', 'prod-43', 'Spark 20C (4GB+128GB)', 'var-43-1', '4GB/128GB - Standard Black', 'Tecno', 10867, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1261', '86840015567045', '86840015567046', 'SN-TEC-1261', 'prod-43', 'Spark 20C (4GB+128GB)', 'var-43-1', '4GB/128GB - Standard Black', 'Tecno', 10867, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1262', '86840015579390', '86840015579391', 'SN-TEC-1262', 'prod-43', 'Spark 20C (4GB+128GB)', 'var-43-1', '4GB/128GB - Standard Black', 'Tecno', 10867, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1263', '86840015591735', '86840015591736', 'SN-TEC-1263', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1264', '86840015604080', '86840015604081', 'SN-TEC-1264', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1265', '86840015616425', '86840015616426', 'SN-TEC-1265', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1266', '86840015628770', '86840015628771', 'SN-TEC-1266', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1267', '86840015641115', '86840015641116', 'SN-TEC-1267', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1268', '86840015653460', '86840015653461', 'SN-TEC-1268', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1269', '86840015665805', '86840015665806', 'SN-TEC-1269', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1270', '86840015678150', '86840015678151', 'SN-TEC-1270', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1271', '86840015690495', '86840015690496', 'SN-TEC-1271', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1272', '86840015702840', '86840015702841', 'SN-TEC-1272', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1273', '86840015715185', '86840015715186', 'SN-TEC-1273', 'prod-44', 'Spark 30 (8GB+128GB)', 'var-44-1', '8GB/128GB - Standard Black', 'Tecno', 16291, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1274', '86840015727530', '86840015727531', 'SN-TEC-1274', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1275', '86840015739875', '86840015739876', 'SN-TEC-1275', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1276', '86840015752220', '86840015752221', 'SN-TEC-1276', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1277', '86840015764565', '86840015764566', 'SN-TEC-1277', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1278', '86840015776910', '86840015776911', 'SN-TEC-1278', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1279', '86840015789255', '86840015789256', 'SN-TEC-1279', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1280', '86840015801600', '86840015801601', 'SN-TEC-1280', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1281', '86840015813945', '86840015813946', 'SN-TEC-1281', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1282', '86840015826290', '86840015826291', 'SN-TEC-1282', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1283', '86840015838635', '86840015838636', 'SN-TEC-1283', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1284', '86840015850980', '86840015850981', 'SN-TEC-1284', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1285', '86840015863325', '86840015863326', 'SN-TEC-1285', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1286', '86840015875670', '86840015875671', 'SN-TEC-1286', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1287', '86840015888015', '86840015888016', 'SN-TEC-1287', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1288', '86840015900360', '86840015900361', 'SN-TEC-1288', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1289', '86840015912705', '86840015912706', 'SN-TEC-1289', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1290', '86840015925050', '86840015925051', 'SN-TEC-1290', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1291', '86840015937395', '86840015937396', 'SN-TEC-1291', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1292', '86840015949740', '86840015949741', 'SN-TEC-1292', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1293', '86840015962085', '86840015962086', 'SN-TEC-1293', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1294', '86840015974430', '86840015974431', 'SN-TEC-1294', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1295', '86840015986775', '86840015986776', 'SN-TEC-1295', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1296', '86840015999120', '86840015999121', 'SN-TEC-1296', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1297', '86840016011465', '86840016011466', 'SN-TEC-1297', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1298', '86840016023810', '86840016023811', 'SN-TEC-1298', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1299', '86840016036155', '86840016036156', 'SN-TEC-1299', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1300', '86840016048500', '86840016048501', 'SN-TEC-1300', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1301', '86840016060845', '86840016060846', 'SN-TEC-1301', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1302', '86840016073190', '86840016073191', 'SN-TEC-1302', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1303', '86840016085535', '86840016085536', 'SN-TEC-1303', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1304', '86840016097880', '86840016097881', 'SN-TEC-1304', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1305', '86840016110225', '86840016110226', 'SN-TEC-1305', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1306', '86840016122570', '86840016122571', 'SN-TEC-1306', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1307', '86840016134915', '86840016134916', 'SN-TEC-1307', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1308', '86840016147260', '86840016147261', 'SN-TEC-1308', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1309', '86840016159605', '86840016159606', 'SN-TEC-1309', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1310', '86840016171950', '86840016171951', 'SN-TEC-1310', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1311', '86840016184295', '86840016184296', 'SN-TEC-1311', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1312', '86840016196640', '86840016196641', 'SN-TEC-1312', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1313', '86840016208985', '86840016208986', 'SN-TEC-1313', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1314', '86840016221330', '86840016221331', 'SN-TEC-1314', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1315', '86840016233675', '86840016233676', 'SN-TEC-1315', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1316', '86840016246020', '86840016246021', 'SN-TEC-1316', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1317', '86840016258365', '86840016258366', 'SN-TEC-1317', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1318', '86840016270710', '86840016270711', 'SN-TEC-1318', 'prod-45', 'Spark 30C (6GB+128GB)', 'var-45-1', '6GB/128GB - Standard Black', 'Tecno', 12739, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1319', '86840016283055', '86840016283056', 'SN-TEC-1319', 'prod-47', 'Spark 40 5G (8GB+256GB)', 'var-47-1', '8GB/256GB - Standard Black', 'Tecno', 15398, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1320', '86840016295400', '86840016295401', 'SN-TEC-1320', 'prod-47', 'Spark 40 5G (8GB+256GB)', 'var-47-1', '8GB/256GB - Standard Black', 'Tecno', 15398, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1321', '86840016307745', '86840016307746', 'SN-TEC-1321', 'prod-49', 'Spark 40 (8GB+256GB)', 'var-49-1', '8GB/256GB - Standard Black', 'Tecno', 18125, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1322', '86840016320090', '86840016320091', 'SN-TEC-1322', 'prod-49', 'Spark 40 (8GB+256GB)', 'var-49-1', '8GB/256GB - Standard Black', 'Tecno', 18125, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1323', '86840016332435', '86840016332436', 'SN-TEC-1323', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1324', '86840016344780', '86840016344781', 'SN-TEC-1324', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1325', '86840016357125', '86840016357126', 'SN-TEC-1325', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1326', '86840016369470', '86840016369471', 'SN-TEC-1326', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1327', '86840016381815', '86840016381816', 'SN-TEC-1327', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1328', '86840016394160', '86840016394161', 'SN-TEC-1328', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1329', '86840016406505', '86840016406506', 'SN-TEC-1329', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1330', '86840016418850', '86840016418851', 'SN-TEC-1330', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1331', '86840016431195', '86840016431196', 'SN-TEC-1331', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1332', '86840016443540', '86840016443541', 'SN-TEC-1332', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1333', '86840016455885', '86840016455886', 'SN-TEC-1333', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1334', '86840016468230', '86840016468231', 'SN-TEC-1334', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1335', '86840016480575', '86840016480576', 'SN-TEC-1335', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1336', '86840016492920', '86840016492921', 'SN-TEC-1336', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1337', '86840016505265', '86840016505266', 'SN-TEC-1337', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1338', '86840016517610', '86840016517611', 'SN-TEC-1338', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1339', '86840016529955', '86840016529956', 'SN-TEC-1339', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1340', '86840016542300', '86840016542301', 'SN-TEC-1340', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1341', '86840016554645', '86840016554646', 'SN-TEC-1341', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1342', '86840016566990', '86840016566991', 'SN-TEC-1342', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1343', '86840016579335', '86840016579336', 'SN-TEC-1343', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1344', '86840016591680', '86840016591681', 'SN-TEC-1344', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1345', '86840016604025', '86840016604026', 'SN-TEC-1345', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1346', '86840016616370', '86840016616371', 'SN-TEC-1346', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1347', '86840016628715', '86840016628716', 'SN-TEC-1347', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1348', '86840016641060', '86840016641061', 'SN-TEC-1348', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1349', '86840016653405', '86840016653406', 'SN-TEC-1349', 'prod-51', 'Spark 50 (4GB+128GB)', 'var-51-1', '4GB/128GB - Standard Black', 'Tecno', 17203, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1350', '86840016665750', '86840016665751', 'SN-TEC-1350', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1351', '86840016678095', '86840016678096', 'SN-TEC-1351', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1352', '86840016690440', '86840016690441', 'SN-TEC-1352', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1353', '86840016702785', '86840016702786', 'SN-TEC-1353', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1354', '86840016715130', '86840016715131', 'SN-TEC-1354', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1355', '86840016727475', '86840016727476', 'SN-TEC-1355', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1356', '86840016739820', '86840016739821', 'SN-TEC-1356', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1357', '86840016752165', '86840016752166', 'SN-TEC-1357', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1358', '86840016764510', '86840016764511', 'SN-TEC-1358', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1359', '86840016776855', '86840016776856', 'SN-TEC-1359', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1360', '86840016789200', '86840016789201', 'SN-TEC-1360', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1361', '86840016801545', '86840016801546', 'SN-TEC-1361', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1362', '86840016813890', '86840016813891', 'SN-TEC-1362', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1363', '86840016826235', '86840016826236', 'SN-TEC-1363', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1364', '86840016838580', '86840016838581', 'SN-TEC-1364', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1365', '86840016850925', '86840016850926', 'SN-TEC-1365', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1366', '86840016863270', '86840016863271', 'SN-TEC-1366', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1367', '86840016875615', '86840016875616', 'SN-TEC-1367', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1368', '86840016887960', '86840016887961', 'SN-TEC-1368', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1369', '86840016900305', '86840016900306', 'SN-TEC-1369', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1370', '86840016912650', '86840016912651', 'SN-TEC-1370', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1371', '86840016924995', '86840016924996', 'SN-TEC-1371', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1372', '86840016937340', '86840016937341', 'SN-TEC-1372', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1373', '86840016949685', '86840016949686', 'SN-TEC-1373', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1374', '86840016962030', '86840016962031', 'SN-TEC-1374', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1375', '86840016974375', '86840016974376', 'SN-TEC-1375', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1376', '86840016986720', '86840016986721', 'SN-TEC-1376', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1377', '86840016999065', '86840016999066', 'SN-TEC-1377', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1378', '86840017011410', '86840017011411', 'SN-TEC-1378', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1379', '86840017023755', '86840017023756', 'SN-TEC-1379', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1380', '86840017036100', '86840017036101', 'SN-TEC-1380', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1381', '86840017048445', '86840017048446', 'SN-TEC-1381', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1382', '86840017060790', '86840017060791', 'SN-TEC-1382', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1383', '86840017073135', '86840017073136', 'SN-TEC-1383', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1384', '86840017085480', '86840017085481', 'SN-TEC-1384', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1385', '86840017097825', '86840017097826', 'SN-TEC-1385', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1386', '86840017110170', '86840017110171', 'SN-TEC-1386', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1387', '86840017122515', '86840017122516', 'SN-TEC-1387', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1388', '86840017134860', '86840017134861', 'SN-TEC-1388', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1389', '86840017147205', '86840017147206', 'SN-TEC-1389', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1390', '86840017159550', '86840017159551', 'SN-TEC-1390', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1391', '86840017171895', '86840017171896', 'SN-TEC-1391', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1392', '86840017184240', '86840017184241', 'SN-TEC-1392', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1393', '86840017196585', '86840017196586', 'SN-TEC-1393', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1394', '86840017208930', '86840017208931', 'SN-TEC-1394', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1395', '86840017221275', '86840017221276', 'SN-TEC-1395', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1396', '86840017233620', '86840017233621', 'SN-TEC-1396', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1397', '86840017245965', '86840017245966', 'SN-TEC-1397', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1398', '86840017258310', '86840017258311', 'SN-TEC-1398', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1399', '86840017270655', '86840017270656', 'SN-TEC-1399', 'prod-52', 'Spark 50 (6GB+128GB)', 'var-52-1', '6GB/128GB - Standard Black', 'Tecno', 19924, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1400', '86840017283000', '86840017283001', 'SN-TEC-1400', 'prod-54', 'Spark 50 Pro (6GB+128GB)', 'var-54-1', '6GB/128GB - Standard Black', 'Tecno', 23844, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1401', '86840017295345', '86840017295346', 'SN-TEC-1401', 'prod-54', 'Spark 50 Pro (6GB+128GB)', 'var-54-1', '6GB/128GB - Standard Black', 'Tecno', 23844, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1402', '86840017307690', '86840017307691', 'SN-TEC-1402', 'prod-54', 'Spark 50 Pro (6GB+128GB)', 'var-54-1', '6GB/128GB - Standard Black', 'Tecno', 23844, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1403', '86840017320035', '86840017320036', 'SN-TEC-1403', 'prod-54', 'Spark 50 Pro (6GB+128GB)', 'var-54-1', '6GB/128GB - Standard Black', 'Tecno', 23844, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1404', '86840017332380', '86840017332381', 'SN-TEC-1404', 'prod-54', 'Spark 50 Pro (6GB+128GB)', 'var-54-1', '6GB/128GB - Standard Black', 'Tecno', 23844, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1405', '86840017344725', '86840017344726', 'SN-TEC-1405', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1406', '86840017357070', '86840017357071', 'SN-TEC-1406', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1407', '86840017369415', '86840017369416', 'SN-TEC-1407', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1408', '86840017381760', '86840017381761', 'SN-TEC-1408', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1409', '86840017394105', '86840017394106', 'SN-TEC-1409', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1410', '86840017406450', '86840017406451', 'SN-TEC-1410', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1411', '86840017418795', '86840017418796', 'SN-TEC-1411', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1412', '86840017431140', '86840017431141', 'SN-TEC-1412', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1413', '86840017443485', '86840017443486', 'SN-TEC-1413', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1414', '86840017455830', '86840017455831', 'SN-TEC-1414', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1415', '86840017468175', '86840017468176', 'SN-TEC-1415', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1416', '86840017480520', '86840017480521', 'SN-TEC-1416', 'prod-55', 'Spark 50c (4GB+128GB)', 'var-55-1', '4GB/128GB - Standard Black', 'Tecno', 21204, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1417', '86840017492865', '86840017492866', 'SN-TEC-1417', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1418', '86840017505210', '86840017505211', 'SN-TEC-1418', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1419', '86840017517555', '86840017517556', 'SN-TEC-1419', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1420', '86840017529900', '86840017529901', 'SN-TEC-1420', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1421', '86840017542245', '86840017542246', 'SN-TEC-1421', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1422', '86840017554590', '86840017554591', 'SN-TEC-1422', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1423', '86840017566935', '86840017566936', 'SN-TEC-1423', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1424', '86840017579280', '86840017579281', 'SN-TEC-1424', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1425', '86840017591625', '86840017591626', 'SN-TEC-1425', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1426', '86840017603970', '86840017603971', 'SN-TEC-1426', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1427', '86840017616315', '86840017616316', 'SN-TEC-1427', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1428', '86840017628660', '86840017628661', 'SN-TEC-1428', 'prod-56', 'Spark 50c (4GB+64GB)', 'var-56-1', '4GB/64GB - Standard Black', 'Tecno', 19450, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1429', '86840017641005', '86840017641006', 'SN-TEC-1429', 'prod-57', 'Spark30 Pro (8GB+128GB)', 'var-57-1', '8GB/128GB - Standard Black', 'Tecno', 18115, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1430', '86840017653350', '86840017653351', 'SN-TEC-1430', 'prod-60', 'Spark50 Pro (4GB+128GB)', 'var-60-1', '4GB/128GB - Standard Black', 'Tecno', 22098, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1431', '86840017665695', '86840017665696', 'SN-TEC-1431', 'prod-60', 'Spark50 Pro (4GB+128GB)', 'var-60-1', '4GB/128GB - Standard Black', 'Tecno', 22098, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1432', '86840017678040', '86840017678041', 'SN-TEC-1432', 'prod-60', 'Spark50 Pro (4GB+128GB)', 'var-60-1', '4GB/128GB - Standard Black', 'Tecno', 22098, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1433', '86840017690385', '86840017690386', 'SN-TEC-1433', 'prod-60', 'Spark50 Pro (4GB+128GB)', 'var-60-1', '4GB/128GB - Standard Black', 'Tecno', 22098, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1434', '86840017702730', '86840017702731', 'SN-TEC-1434', 'prod-61', 'Spark50 Pro Luiv Demo (8GB+128GB)', 'var-61-1', '8GB/128GB - Standard Black', 'Tecno', 18202, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1435', '86840017715075', '86840017715076', 'SN-TEC-1435', 'prod-62', 'Tablet Megapad (4GB+128GB)', 'var-62-1', '4GB/128GB - Standard Black', 'Tecno', 18542, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1436', '86840017727420', '86840017727421', 'SN-TEC-1436', 'prod-62', 'Tablet Megapad (4GB+128GB)', 'var-62-1', '4GB/128GB - Standard Black', 'Tecno', 18542, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1437', '86840017739765', '86840017739766', 'SN-TEC-1437', 'prod-62', 'Tablet Megapad (4GB+128GB)', 'var-62-1', '4GB/128GB - Standard Black', 'Tecno', 18542, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1438', '86840017752110', '86840017752111', 'SN-TEC-1438', 'prod-62', 'Tablet Megapad (4GB+128GB)', 'var-62-1', '4GB/128GB - Standard Black', 'Tecno', 18542, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (
  'imei-1439', '86840017764455', '86840017764456', 'SN-TEC-1439', 'prod-62', 'Tablet Megapad (4GB+128GB)', 'var-62-1', '4GB/128GB - Standard Black', 'Tecno', 18542, 'sup-1', 'Ismarto Technology BD Ltd.', 'PINV-OPENING-2026', '2026-07-01', 'wh-1', 'Main Warehouse (Konabari New Market, Gazipur)', 'In Stock', 'Brand New', NOW()
) ON CONFLICT (id) DO NOTHING;

-- 10. BANK ACCOUNTS
INSERT INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, routing_number, current_balance, status, created_at) VALUES (
  'bank-1', 'Bank Asia Ltd', 'Firoza Enterprise', '03422001928', 'undefined', 'undefined', 0, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET bank_name = EXCLUDED.bank_name;

INSERT INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, routing_number, current_balance, status, created_at) VALUES (
  'bank-2', 'Cash in Hand (Main Vault)', 'Firoza Enterprise Treasury', 'CASH-VAULT-01', 'undefined', 'undefined', 0, 'Active', NOW()
) ON CONFLICT (id) DO UPDATE SET bank_name = EXCLUDED.bank_name;
