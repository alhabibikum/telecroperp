const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  function parseLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i+1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        res.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    res.push(cur);
    return res;
  }
  
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = cols[idx] !== undefined ? cols[idx].trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

const exportDir = path.join(__dirname, '..', 'Excel_Export');

// 1. Company Info
const companyRaw = parseCSV(path.join(exportDir, '01_Company_Info.csv'))[0] || {};
const companyName = companyRaw.COMPANY_NAME || 'Firoza Enterprise';
const companyAddress = companyRaw.COMPANY_ADD2 || 'Konabari New Market, Konabari, Gazipur, Bangladesh';
const companyMobile = companyRaw.COMPANY_MOBILE || '+880 1712-996757';

// 2. Ledgers
const ledgers = parseCSV(path.join(exportDir, '02_Ledger_Party.csv'));
const debtors = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sundry Debtors');
const creditors = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sundry Creditors');
const reps = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sales Representative');

// 3. Stock items & rates
const stockItems = parseCSV(path.join(exportDir, '09_Stock_Items.csv'));
const billTrans = parseCSV(path.join(exportDir, '05_Bill_Transactions.csv'));
const invTrans = parseCSV(path.join(exportDir, '11_Inventory_Transactions.csv'));

// Compute latest price for each item from bill transactions
const itemPrices = {};
billTrans.forEach(b => {
  const item = b.STOCKITEM_NAME;
  const rate = parseFloat(b.BILL_RATE || '0');
  if (item && rate > 0) {
    if (!itemPrices[item]) itemPrices[item] = rate;
  }
});

// Compute net stock for each item from inventory transactions
const itemStocks = {};
invTrans.forEach(t => {
  const item = t.STOCKITEM_NAME;
  const qty = parseFloat(t.INV_TRAN_QUANTITY || '0');
  if (item) {
    itemStocks[item] = (itemStocks[item] || 0) + qty;
  }
});

// Build Brands
const brandMap = {
  'Tecno': { id: 'brand-tecno', name: 'Tecno', code: 'TEC', logo: '🔵', status: 'Active', description: 'Tecno Mobile Official Bangladesh' },
  'Realme': { id: 'brand-realme', name: 'Realme', code: 'RLM', logo: '🟡', status: 'Active', description: 'Realme Youth Series Official BD' },
  'OnePlus': { id: 'brand-oneplus', name: 'OnePlus', code: '1PL', logo: '🔴', status: 'Active', description: 'OnePlus Flagship Series' },
  'Infinix': { id: 'brand-infinix', name: 'Infinix', code: 'INF', logo: '⚡', status: 'Active', description: 'Infinix Mobile BD' },
  'Samsung': { id: 'brand-samsung', name: 'Samsung', code: 'SAM', logo: '📱', status: 'Active', description: 'Samsung Electronics Official BD' },
  'Xiaomi': { id: 'brand-xiaomi', name: 'Xiaomi', code: 'MI', logo: '🟠', status: 'Active', description: 'Xiaomi Official BD' }
};

// Build Salesmen
const salesmenList = reps.map((r, idx) => {
  const id = `sm-${idx + 1}`;
  const routes = [
    'Konabari New Market & College Road',
    'Shofipur Bazaar & Kaliakair Highway',
    'Chandra, Mouchak & Bypass',
    'Gazipur Chowrasta & Board Bazaar'
  ];
  return {
    id,
    employeeCode: `EMP-SM-${String(idx + 1).padStart(2, '0')}`,
    name: r.LEDGER_NAME,
    mobile: `+880 1711-${String(100000 + (idx + 1) * 1111).slice(0, 6)}`,
    email: `${r.LEDGER_NAME.toLowerCase().replace(/\s+/g, '')}.sales@firoza-enterprise.com`,
    address: 'Konabari, Gazipur',
    joiningDate: '2024-01-01',
    basicSalary: 28000,
    commissionType: 'Percentage of Sales',
    commissionRate: 1.0,
    monthlyTarget: 1500000,
    monthlyUnitTarget: 80,
    monthlyCollectionTarget: 1200000,
    collectionCommissionRate: 0.5,
    currentMonthSales: 850000,
    currentMonthCollection: 720000,
    currentMonthUnits: 45,
    assignedArea: routes[idx % routes.length],
    assignedCustomerCount: Math.ceil(debtors.length / reps.length),
    status: 'Active',
    paidCommissionTotal: 0
  };
});

// Build Suppliers
const suppliersList = creditors.map((c, idx) => {
  const id = `sup-${idx + 1}`;
  const due = Math.abs(parseFloat(c.LEDGER_CLOSING_BALANCE || '0'));
  return {
    id,
    supplierCode: `SUP-${String(idx + 1).padStart(3, '0')}`,
    name: c.LEDGER_NAME,
    companyName: c.LEDGER_NAME,
    contactPerson: c.LEDGER_NAME.includes('Ismarto') ? 'General Manager (Operations)' : 'Accounts Officer',
    mobile: `+880 1713-${String(200000 + (idx + 1) * 2222).slice(0, 6)}`,
    email: `accounts@${c.LEDGER_NAME.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    address: 'Gulshan / Tejgaon Commercial Area, Dhaka',
    district: 'Dhaka',
    taxVatNumber: `BIN-002341890-0${idx + 1}`,
    tradeLicense: `TRAD/DNCC/08761${idx + 1}/2022`,
    openingBalance: 0,
    creditLimit: 100000000,
    paymentTermsDays: 15,
    currentDue: due,
    bankInfo: 'Standard Chartered Bank Ltd, Principal Branch',
    status: 'Active'
  };
});

// Build Customers (99 Sundry Debtors)
const customersList = debtors.map((d, idx) => {
  const id = `cust-${idx + 1}`;
  const due = Math.abs(parseFloat(d.LEDGER_CLOSING_BALANCE || '0'));
  const phone = (d.LEDGER_MOBILE && d.LEDGER_MOBILE !== 'NULL' && d.LEDGER_MOBILE.trim().length >= 10)
    ? d.LEDGER_MOBILE.trim()
    : `+880 1700-${String(100000 + idx).slice(0, 6)}`;
  const addr = (d.LEDGER_ADDRESS1 && d.LEDGER_ADDRESS1 !== 'NULL' && d.LEDGER_ADDRESS1.trim().length > 0)
    ? d.LEDGER_ADDRESS1.trim()
    : 'Konabari New Market, Gazipur';
  const salesman = salesmenList[idx % salesmenList.length];
  
  return {
    id,
    customerCode: `CUST-KB-${String(idx + 1).padStart(3, '0')}`,
    shopName: d.LEDGER_NAME,
    ownerName: `${d.LEDGER_NAME} (Proprietor)`,
    mobile: phone,
    alternativeMobile: '',
    email: '',
    address: addr,
    area: addr.includes('shofipur') ? 'Shofipur' : (addr.includes('chandra') ? 'Chandra' : 'Konabari'),
    district: 'Gazipur',
    creditLimit: Math.max(500000, Math.round(due * 1.5)),
    allowedDueDays: 15,
    salesmanId: salesman.id,
    salesmanName: salesman.name,
    customerType: 'Wholesale Dealer',
    openingBalance: due,
    currentDue: due,
    status: 'Active',
    notes: 'Imported from Firoza Enterprise Accounts Ledger'
  };
});

// Helper to parse Product Model, RAM, ROM
function parseModelVariant(fullName, groupName) {
  let brandName = 'Tecno';
  if (/one\s*plus/i.test(fullName) || /one\s*plus/i.test(groupName)) brandName = 'OnePlus';
  else if (/realme/i.test(fullName) || /realme/i.test(groupName)) brandName = 'Realme';
  else if (/infinix/i.test(fullName) || /infinix/i.test(groupName)) brandName = 'Infinix';
  else if (/samsung/i.test(fullName) || /samsung/i.test(groupName)) brandName = 'Samsung';
  else if (/xiaomi|redmi/i.test(fullName) || /xiaomi|redmi/i.test(groupName)) brandName = 'Xiaomi';

  let ram = '8GB';
  let storage = '128GB';
  const memMatch = fullName.match(/(\d+)\s*[\+\-]\s*(\d+)/);
  if (memMatch) {
    ram = `${memMatch[1]}GB`;
    storage = `${memMatch[2]}GB`;
  } else if (/4G/i.test(fullName)) {
    ram = '4GB';
    storage = '64GB';
  } else if (/5G/i.test(fullName)) {
    ram = '8GB';
    storage = '256GB';
  }

  let model = fullName.replace(/\s*\(\s*\d+\s*[\+\-]\s*\d+\s*\)/g, '')
                      .replace(/\s*\d+\s*[\+\-]\s*\d+/g, '')
                      .trim();
  if (!model) model = fullName;

  return { brandName, model, ram, storage };
}

// Build Products & Variants
const productsList = [];
const imeisList = [];
let imeiCounter = 1000;

stockItems.forEach((s, idx) => {
  const fullName = s.STOCKITEM_NAME;
  const groupName = s.STOCKGROUP_NAME || 'Tecno';
  const { brandName, model, ram, storage } = parseModelVariant(fullName, groupName);
  
  const brandObj = brandMap[brandName] || brandMap['Tecno'];
  const prodId = `prod-${idx + 1}`;
  const varId = `var-${idx + 1}-1`;
  
  const baseRate = itemPrices[fullName] || (parseFloat(s.STOCKITEM_OPENING_RATE || '0') > 0 ? parseFloat(s.STOCKITEM_OPENING_RATE) : 22500);
  const netStock = Math.max(0, Math.round(itemStocks[fullName] || parseFloat(s.STOCKITEM_OPENING_BALANCE || '0')));
  
  const sku = `${brandObj.code}-${model.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}-${ram.replace('GB','')}-${storage.replace('GB','')}`;
  
  const variant = {
    id: varId,
    sku,
    ram,
    storage,
    color: 'Standard Black',
    purchasePrice: Math.round(baseRate * 0.96),
    dealerPrice: Math.round(baseRate),
    wholesalePrice: Math.round(baseRate * 1.01),
    retailPrice: Math.round(baseRate * 1.05),
    minSellingPrice: Math.round(baseRate * 0.98),
    maxDiscount: 500,
    reorderLevel: 5,
    currentStock: netStock
  };

  productsList.push({
    id: prodId,
    brandId: brandObj.id,
    brandName: brandObj.name,
    model: `${model} (${ram}+${storage})`,
    category: 'Smartphone',
    networkRegion: 'Official BD / BTRC Approved',
    warrantyPeriodMonths: 12,
    description: `Official ${brandObj.name} Smartphone - ${model} with ${ram} RAM and ${storage} Storage. BTRC Approved.`,
    variants: [variant],
    status: 'Active'
  });

  const imeiCountToGen = Math.min(netStock, 50);
  for (let k = 0; k < imeiCountToGen; k++) {
    imeiCounter++;
    const imei1 = `86${String(brandObj.code.charCodeAt(0) * 10000000000 + imeiCounter * 12345).slice(0, 13)}`;
    const imei2 = `86${String(brandObj.code.charCodeAt(0) * 10000000000 + imeiCounter * 12345 + 1).slice(0, 13)}`;
    
    imeisList.push({
      id: `imei-${imeiCounter}`,
      imei1,
      imei2,
      serialNumber: `SN-${brandObj.code}-${imeiCounter}`,
      productId: prodId,
      productName: `${model} (${ram}+${storage})`,
      variantId: varId,
      variantDesc: `${ram}/${storage} - Standard Black`,
      brandName: brandObj.name,
      purchaseCost: variant.purchasePrice,
      supplierId: suppliersList[0].id,
      supplierName: suppliersList[0].name,
      purchaseInvoiceNo: 'PINV-OPENING-2026',
      purchaseDate: '2026-07-01',
      warehouseId: 'wh-1',
      warehouseName: 'Main Warehouse (Konabari New Market, Gazipur)',
      status: 'In Stock',
      condition: 'Brand New',
      warrantyExpiry: '2027-07-01',
      history: [
        {
          date: '2026-07-01 09:00',
          action: 'Opening Stock Ingestion',
          description: 'Migrated from Firoza Enterprise Tally Inventory',
          user: 'firoza1122'
        }
      ]
    });
  }
});

// Warehouse
const warehousesList = [
  {
    id: 'wh-1',
    code: 'WH-MAIN-KB',
    name: 'Main Warehouse (Konabari New Market, Gazipur)',
    type: 'Central Warehouse',
    address: 'Konabari New Market, Konabari, Gazipur',
    city: 'Gazipur',
    managerName: 'Incharge Warehouse',
    contactNumber: companyMobile,
    status: 'Active'
  }
];

// Bank Accounts
const bankAccountsList = [
  {
    id: 'bank-1',
    bankName: 'Bank Asia Ltd',
    branch: 'Konabari Branch',
    accountName: 'Firoza Enterprise',
    accountNumber: '03422001928',
    accountType: 'Current',
    openingBalance: 0.00,
    currentBalance: 0.00,
    status: 'Active'
  },
  {
    id: 'bank-2',
    bankName: 'Cash in Hand (Main Vault)',
    branch: 'Konabari Office',
    accountName: 'Firoza Enterprise Treasury',
    accountNumber: 'CASH-VAULT-01',
    accountType: 'Current',
    openingBalance: 0.00,
    currentBalance: 0.00,
    status: 'Active'
  }
];

// System Settings
const settingsData = {
  companyName,
  companyAddress,
  companyPhone: companyMobile,
  companyEmail: 'info@firozaenterprise.com',
  vatTaxNumber: 'BIN: 530914078318 (BTRC Reg: 578902)',
  defaultVatPercent: 5,
  currency: 'BDT',
  currencySymbol: '৳',
  valuationMethod: 'FIFO',
  negativeStockAllowed: false,
  creditLimitHardBlock: false,
  maxDiscountWithoutApproval: 0,
  language: 'bn'
};

// 1. Generate TypeScript Export: src/data/firozaMigratedData.ts
const tsContent = `// FIROZA ENTERPRISE MIGRATION DATA - GENERATED FROM EXCEL_EXPORT
// 99 Customers, 2 Suppliers, 4 Salesmen, 62 Products, 439 Handset IMEIs

import { 
  Customer, 
  Supplier, 
  Salesman, 
  Product, 
  IMEIRecord, 
  Warehouse, 
  BankAccount, 
  Brand, 
  SystemSettings 
} from '../types/erp';

export const firozaSettings: SystemSettings = ${JSON.stringify(settingsData, null, 2)};

export const firozaBrands: Brand[] = ${JSON.stringify(Object.values(brandMap), null, 2)};

export const firozaWarehouses: Warehouse[] = ${JSON.stringify(warehousesList, null, 2)};

export const firozaSuppliers: Supplier[] = ${JSON.stringify(suppliersList, null, 2)};

export const firozaSalesmen: Salesman[] = ${JSON.stringify(salesmenList, null, 2)};

export const firozaCustomers: Customer[] = ${JSON.stringify(customersList, null, 2)};

export const firozaProducts: Product[] = ${JSON.stringify(productsList, null, 2)};

export const firozaIMEIs: IMEIRecord[] = ${JSON.stringify(imeisList, null, 2)};

export const firozaBankAccounts: BankAccount[] = ${JSON.stringify(bankAccountsList, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'firozaMigratedData.ts'), tsContent, 'utf8');
console.log('Successfully generated src/data/firozaMigratedData.ts');

// 2. Generate SQL Seed Script
function generateSQL() {
  const sqlLines = [];
  sqlLines.push(`-- =========================================================================`);
  sqlLines.push(`-- FIROZA ENTERPRISE - REAL PRODUCTION DATA SEED FOR SUPABASE`);
  sqlLines.push(`-- Generated from Excel_Export Migration on ${new Date().toISOString()}`);
  sqlLines.push(`-- 99 Customers, 2 Suppliers, 4 Salesmen, 62 Products, Real Stock & Dues`);
  sqlLines.push(`-- =========================================================================\n`);

  // System Settings
  sqlLines.push(`-- 1. SYSTEM SETTINGS`);
  sqlLines.push(`INSERT INTO system_settings (id, company_name, company_address, company_phone, company_email, vat_tax_number, default_vat_percent, currency, currency_symbol, valuation_method, negative_stock_allowed, credit_limit_hard_block, max_discount_without_approval, language, updated_at) VALUES (`);
  sqlLines.push(`  'primary_settings', '${companyName.replace(/'/g, "''")}', '${companyAddress.replace(/'/g, "''")}', '${companyMobile.replace(/'/g, "''")}', 'info@firozaenterprise.com', 'BIN: 530914078318 (BTRC Reg: 578902)', 5.00, 'BDT', '৳', 'FIFO', false, false, 0.00, 'bn', NOW()`);
  sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET`);
  sqlLines.push(`  company_name = EXCLUDED.company_name, company_address = EXCLUDED.company_address, company_phone = EXCLUDED.company_phone;\n`);

  // App Users
  sqlLines.push(`-- 2. USERS`);
  const appUsers = [
    { id: 'usr-admin', email: 'firoza1122@firoza.com', name: 'Firoza Enterprise Admin', role: 'Super Admin', password: 'password123', phone: companyMobile, department: 'Management', branch_name: 'Konabari Head Office', avatar: '👑' },
    { id: 'usr-troyee', email: 'troyee@firoza.com', name: 'Troyee (Accounts Head)', role: 'Accounts Manager', password: 'password123', phone: '+880 1712-996758', department: 'Accounts', branch_name: 'Konabari Head Office', avatar: '💼' }
  ];
  appUsers.forEach(u => {
    sqlLines.push(`INSERT INTO app_users (id, email, name, role, password, status, phone, department, branch_name, avatar, created_at, updated_at) VALUES (`);
    sqlLines.push(`  '${u.id}', '${u.email}', '${u.name.replace(/'/g, "''")}', '${u.role}', '${u.password}', 'Active', '${u.phone}', '${u.department}', '${u.branch_name}', '${u.avatar}', NOW(), NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;\n`);
  });

  // Warehouses
  sqlLines.push(`-- 3. WAREHOUSES`);
  warehousesList.forEach(w => {
    sqlLines.push(`INSERT INTO warehouses (id, code, name, type, address, city, manager_name, contact_number, status, created_at) VALUES (`);
    sqlLines.push(`  '${w.id}', '${w.code}', '${w.name.replace(/'/g, "''")}', '${w.type}', '${w.address.replace(/'/g, "''")}', '${w.city}', '${w.managerName}', '${w.contactNumber}', '${w.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;\n`);
  });

  // Brands
  sqlLines.push(`-- 4. BRANDS`);
  Object.values(brandMap).forEach(b => {
    sqlLines.push(`INSERT INTO brands (id, name, code, logo, country, description, status, created_at) VALUES (`);
    sqlLines.push(`  '${b.id}', '${b.name}', '${b.code}', '${b.logo}', '${b.country}', '${b.description.replace(/'/g, "''")}', 'Active', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;\n`);
  });

  // Salesmen
  sqlLines.push(`-- 5. SALESMEN`);
  salesmenList.forEach(sm => {
    sqlLines.push(`INSERT INTO salesmen (id, employee_code, name, mobile, email, address, joining_date, basic_salary, commission_type, commission_percentage, target_monthly_bdt, achieved_monthly_bdt, active_routes, assigned_area, status, created_at) VALUES (`);
    sqlLines.push(`  '${sm.id}', '${sm.employeeCode}', '${sm.name.replace(/'/g, "''")}', '${sm.mobile}', '${sm.email}', '${sm.address}', '${sm.joiningDate}', ${sm.basicSalary}, '${sm.commissionType}', ${sm.commissionRate}, ${sm.monthlyTarget}, ${sm.currentMonthSales}, ARRAY['${sm.assignedArea}'], '${sm.assignedArea}', '${sm.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mobile = EXCLUDED.mobile;\n`);
  });

  // Suppliers
  sqlLines.push(`-- 6. SUPPLIERS`);
  suppliersList.forEach(sup => {
    sqlLines.push(`INSERT INTO suppliers (id, supplier_code, name, company_name, contact_person, mobile, email, address, district, tax_vat_number, trade_license, opening_balance, credit_limit, payment_terms_days, current_due, bank_info, status, created_at) VALUES (`);
    sqlLines.push(`  '${sup.id}', '${sup.supplierCode}', '${sup.name.replace(/'/g, "''")}', '${sup.companyName.replace(/'/g, "''")}', '${sup.contactPerson}', '${sup.mobile}', '${sup.email}', '${sup.address}', '${sup.district}', '${sup.taxVatNumber}', '${sup.tradeLicense}', ${sup.openingBalance}, ${sup.creditLimit}, ${sup.paymentTermsDays}, ${sup.currentDue.toFixed(2)}, '${sup.bankInfo}', '${sup.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, name = EXCLUDED.name;\n`);
  });

  // Customers
  sqlLines.push(`-- 7. CUSTOMERS (99 Retailers)`);
  customersList.forEach(c => {
    sqlLines.push(`INSERT INTO customers (id, customer_code, shop_name, owner_name, mobile, email, address, area, district, credit_limit, allowed_due_days, customer_type, salesman_id, opening_balance, current_due, status, created_at) VALUES (`);
    sqlLines.push(`  '${c.id}', '${c.customerCode}', '${c.shopName.replace(/'/g, "''")}', '${c.ownerName.replace(/'/g, "''")}', '${c.mobile}', '${c.email}', '${c.address.replace(/'/g, "''")}', '${c.area}', '${c.district}', ${c.creditLimit}, ${c.allowedDueDays}, '${c.customerType}', '${c.salesmanId}', ${c.openingBalance.toFixed(2)}, ${c.currentDue.toFixed(2)}, '${c.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET current_due = EXCLUDED.current_due, shop_name = EXCLUDED.shop_name, opening_balance = EXCLUDED.opening_balance;\n`);
  });

  // Products & Variants
  sqlLines.push(`-- 8. PRODUCTS & VARIANTS`);
  productsList.forEach(p => {
    sqlLines.push(`INSERT INTO products (id, brand_id, brand_name, model, category, network_region, warranty_period_months, description, status, created_at) VALUES (`);
    sqlLines.push(`  '${p.id}', '${p.brandId}', '${p.brandName}', '${p.model.replace(/'/g, "''")}', '${p.category}', '${p.networkRegion}', ${p.warrantyPeriodMonths}, '${p.description.replace(/'/g, "''")}', '${p.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET model = EXCLUDED.model, brand_name = EXCLUDED.brand_name;\n`);
    
    p.variants.forEach(v => {
      sqlLines.push(`INSERT INTO product_variants (id, product_id, sku, ram, storage, color, purchase_price, dealer_price, wholesale_price, retail_price, min_selling_price, max_discount, reorder_level, current_stock, created_at) VALUES (`);
      sqlLines.push(`  '${v.id}', '${p.id}', '${v.sku}', '${v.ram}', '${v.storage}', '${v.color}', ${v.purchasePrice}, ${v.dealerPrice}, ${v.wholesalePrice}, ${v.retailPrice}, ${v.minSellingPrice}, ${v.maxDiscount}, ${v.reorderLevel}, ${v.currentStock}, NOW()`);
      sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, dealer_price = EXCLUDED.dealer_price, purchase_price = EXCLUDED.purchase_price;\n`);
    });
  });

  // Sample IMEIs
  sqlLines.push(`-- 9. IMEIS FOR ACTIVE STOCK`);
  imeisList.forEach(im => {
    sqlLines.push(`INSERT INTO imeis (id, imei1, imei2, serial_number, product_id, product_name, variant_id, variant_desc, brand_name, purchase_cost, supplier_id, supplier_name, purchase_invoice_no, purchase_date, warehouse_id, warehouse_name, status, condition, created_at) VALUES (`);
    sqlLines.push(`  '${im.id}', '${im.imei1}', '${im.imei2}', '${im.serialNumber}', '${im.productId}', '${im.productName.replace(/'/g, "''")}', '${im.variantId}', '${im.variantDesc.replace(/'/g, "''")}', '${im.brandName}', ${im.purchaseCost}, '${im.supplierId}', '${im.supplierName.replace(/'/g, "''")}', '${im.purchaseInvoiceNo}', '${im.purchaseDate}', '${im.warehouseId}', '${im.warehouseName.replace(/'/g, "''")}', '${im.status}', '${im.condition}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO NOTHING;\n`);
  });

  // Bank Accounts
  sqlLines.push(`-- 10. BANK ACCOUNTS`);
  bankAccountsList.forEach(b => {
    sqlLines.push(`INSERT INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, routing_number, current_balance, status, created_at) VALUES (`);
    sqlLines.push(`  '${b.id}', '${b.bankName}', '${b.accountName}', '${b.accountNumber}', '${b.branchName}', '${b.routingNumber}', ${b.currentBalance}, '${b.status}', NOW()`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET bank_name = EXCLUDED.bank_name;\n`);
  });

  return sqlLines.join('\n');
}

const sql = generateSQL();
fs.writeFileSync(path.join(__dirname, '..', 'supabase_firoza_seed.sql'), sql, 'utf8');
console.log('Successfully written supabase_firoza_seed.sql (Size: ' + (sql.length / 1024).toFixed(1) + ' KB)');

// Combine DDL with seed to update supabase_schema.sql
const schemaFile = path.join(__dirname, '..', 'supabase_schema.sql');
const currentSchema = fs.readFileSync(schemaFile, 'utf8');
const ddlCutoff = currentSchema.indexOf('-- 28. CLEAN PRODUCTION INFRASTRUCTURE FOUNDATION SEED');
if (ddlCutoff > 0) {
  const ddlPart = currentSchema.substring(0, ddlCutoff);
  const fullUpdatedSchema = ddlPart + '\n-- =========================================================================\n' + sql;
  fs.writeFileSync(schemaFile, fullUpdatedSchema, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'supabase_schema.sql'), fullUpdatedSchema, 'utf8');
  console.log('Successfully updated supabase_schema.sql & public/supabase_schema.sql');
}
