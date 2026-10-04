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
  SmsLog
} from '../types/erp';

export const initialSettings: SystemSettings = {
  companyName: 'TeleCorp Mobile Distribution & Trade Ltd.',
  companyAddress: 'Level 8, Motijheel C/A, Dhaka-1000, Bangladesh',
  companyPhone: '+880 2-9568912 / +880 1711-002233',
  companyEmail: 'operations@telecorp-bd.com',
  vatTaxNumber: 'BIN: 002341890-0101 (BTRC Reg: D-88902)',
  defaultVatPercent: 5,
  currency: 'BDT',
  currencySymbol: '৳',
  valuationMethod: 'FIFO',
  negativeStockAllowed: false,
  creditLimitHardBlock: false, // will give warning and require manager approval
  maxDiscountWithoutApproval: 7.5,
  language: 'en'
};

export const initialBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'Samsung',
    code: 'SAM',
    logo: '📱',
    status: 'Active',
    description: 'Samsung Electronics Official Bangladesh Lineup'
  },
  {
    id: 'brand-2',
    name: 'Apple',
    code: 'APL',
    logo: '🍏',
    status: 'Active',
    description: 'Apple Authorized Dealer Stock (iPhones & Accessories)'
  },
  {
    id: 'brand-3',
    name: 'Xiaomi',
    code: 'MI',
    logo: '🟠',
    status: 'Active',
    description: 'Xiaomi & Redmi Series Official National Distribution'
  },
  {
    id: 'brand-4',
    name: 'Vivo',
    code: 'VIV',
    logo: '🔷',
    status: 'Active',
    description: 'Vivo Bangladesh Official Distribution'
  },
  {
    id: 'brand-5',
    name: 'OPPO',
    code: 'OPP',
    logo: '🟢',
    status: 'Active',
    description: 'OPPO Mobile Bangladesh Authorized Supply'
  },
  {
    id: 'brand-6',
    name: 'Realme',
    code: 'RLM',
    logo: '🟡',
    status: 'Active',
    description: 'Realme Youth Flagship Series'
  },
  {
    id: 'brand-7',
    name: 'OnePlus',
    code: '1PL',
    logo: '🔴',
    status: 'Active',
    description: 'OnePlus Official BD Flagship Series'
  },
  {
    id: 'brand-8',
    name: 'Infinix',
    code: 'INF',
    logo: '⚡',
    status: 'Active',
    description: 'Infinix Smart & Note Series'
  }
];

export const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Central Warehouse (Motijheel, Dhaka)',
    code: 'WH-DH-CENTRAL',
    type: 'Central Warehouse',
    address: 'Plot 14, Dilkusha Commercial Area, Dhaka',
    city: 'Dhaka',
    managerName: 'Md. Masum Billah',
    contactNumber: '+880 1819-234567',
    status: 'Active'
  },
  {
    id: 'wh-2',
    name: 'Uttara Hub Warehouse',
    code: 'WH-DH-UTTARA',
    type: 'Branch Warehouse',
    address: 'Sector 3, Jasimuddin Avenue, Uttara, Dhaka',
    city: 'Dhaka',
    managerName: 'Zahid Hossain',
    contactNumber: '+880 1712-998877',
    status: 'Active'
  },
  {
    id: 'wh-3',
    name: 'Chittagong Regional Depot',
    code: 'WH-CTG-DEPOT',
    type: 'Branch Warehouse',
    address: 'Agrabad C/A, Chittagong',
    city: 'Chittagong',
    managerName: 'Shafiqul Islam',
    contactNumber: '+880 1914-554433',
    status: 'Active'
  },
  {
    id: 'wh-4',
    name: 'Dhanmondi Retail Outlet & Experience Center',
    code: 'OUTLET-DHANMONDI',
    type: 'Retail Outlet',
    address: 'Road 27 (Old), Dhanmondi, Dhaka',
    city: 'Dhaka',
    managerName: 'Farhana Akhter',
    contactNumber: '+880 1610-112233',
    status: 'Active'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    supplierCode: 'SUP-001',
    name: 'Fair Electronics Ltd (Samsung Official)',
    companyName: 'Fair Group Bangladesh',
    contactPerson: 'Kazi Mahbub Alam',
    mobile: '+880 1713-098765',
    email: 'b2b@fairelectronics.com.bd',
    address: 'Fair Center, Banani, Dhaka',
    district: 'Dhaka',
    taxVatNumber: 'BIN-11928374-001',
    tradeLicense: 'TRAD/DNCC/092831/2021',
    openingBalance: 0,
    creditLimit: 25000000,
    paymentTermsDays: 21,
    currentDue: 3450000,
    bankInfo: 'Dutch Bangla Bank, Banani Branch, A/C: 104.110.45021',
    status: 'Active',
    notes: 'Official Samsung local assembly partner'
  },
  {
    id: 'sup-2',
    supplierCode: 'SUP-002',
    name: 'Compustar PVT Ltd (Apple Authorized Distributor)',
    companyName: 'Compustar Bangladesh Ltd',
    contactPerson: 'M. R. Chowdhury',
    mobile: '+880 1819-876543',
    email: 'trade@compustar.com.bd',
    address: 'Gulshan 2, Dhaka',
    district: 'Dhaka',
    taxVatNumber: 'BIN-22019283-002',
    tradeLicense: 'TRAD/DNCC/019282/2020',
    openingBalance: 0,
    creditLimit: 35000000,
    paymentTermsDays: 15,
    currentDue: 5800000,
    bankInfo: 'The City Bank Ltd, Gulshan Branch, A/C: 110.220.9981',
    status: 'Active',
    notes: 'Official Apple warranty products'
  },
  {
    id: 'sup-3',
    supplierCode: 'SUP-003',
    name: 'DBG Technology (Xiaomi National Distributor)',
    companyName: 'DBG BD Electronics',
    contactPerson: 'Sharif Uddin',
    mobile: '+880 1912-345678',
    email: 'orders@dbg-xiaomi.com.bd',
    address: 'Gazipur High Tech City / Mohakhali DOHS',
    district: 'Dhaka',
    taxVatNumber: 'BIN-33928172-004',
    tradeLicense: 'TRAD/GCC/992834/2022',
    openingBalance: 0,
    creditLimit: 15000000,
    paymentTermsDays: 14,
    currentDue: 1850000,
    bankInfo: 'BRAC Bank Ltd, Mohakhali Branch, A/C: 150.120.77665',
    status: 'Active'
  },
  {
    id: 'sup-4',
    supplierCode: 'SUP-004',
    name: 'Benq Telecom BD Ltd (Vivo National Distributor)',
    companyName: 'Vivo Bangladesh Distribution',
    contactPerson: 'Asaduzzaman Noor',
    mobile: '+880 1714-112233',
    email: 'dist@vivo-bd.com',
    address: 'Police Plaza Concord, Gulshan 1, Dhaka',
    district: 'Dhaka',
    taxVatNumber: 'BIN-44019283-009',
    tradeLicense: 'TRAD/DNCC/087612/2021',
    openingBalance: 0,
    creditLimit: 10000000,
    paymentTermsDays: 10,
    currentDue: 920000,
    bankInfo: 'Standard Chartered Bank, Gulshan, A/C: 01-1928374-01',
    status: 'Active'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    brandId: 'brand-1',
    brandName: 'Samsung',
    model: 'Galaxy S24 Ultra 5G',
    category: 'Smartphone',
    networkRegion: 'Official BD (BTRC Approved)',
    warrantyPeriodMonths: 12,
    description: 'Flagship AI smartphone with Titanium Frame, Snapdragon 8 Gen 3, S-Pen included.',
    status: 'Active',
    variants: [
      {
        id: 'var-s24u-1',
        sku: 'SAM-S24U-12-256-BLK',
        ram: '12GB',
        storage: '256GB',
        color: 'Titanium Black',
        purchasePrice: 172000,
        dealerPrice: 184000,
        wholesalePrice: 186000,
        retailPrice: 199999,
        minSellingPrice: 182000,
        maxDiscount: 5,
        reorderLevel: 5,
        currentStock: 12
      },
      {
        id: 'var-s24u-2',
        sku: 'SAM-S24U-12-512-GRY',
        ram: '12GB',
        storage: '512GB',
        color: 'Titanium Gray',
        purchasePrice: 194000,
        dealerPrice: 206000,
        wholesalePrice: 208000,
        retailPrice: 224999,
        minSellingPrice: 204000,
        maxDiscount: 5,
        reorderLevel: 4,
        currentStock: 8
      }
    ]
  },
  {
    id: 'prod-2',
    brandId: 'brand-2',
    brandName: 'Apple',
    model: 'iPhone 16 Pro Max',
    category: 'Smartphone',
    networkRegion: 'BTRC Official 1-Year Warranty',
    warrantyPeriodMonths: 12,
    description: 'Apple A18 Pro Chip, 48MP Fusion Camera, Grade 5 Titanium.',
    status: 'Active',
    variants: [
      {
        id: 'var-ip16pm-1',
        sku: 'APL-16PM-256-NAT',
        ram: '8GB',
        storage: '256GB',
        color: 'Natural Titanium',
        purchasePrice: 196000,
        dealerPrice: 207000,
        wholesalePrice: 209000,
        retailPrice: 229999,
        minSellingPrice: 205000,
        maxDiscount: 4,
        reorderLevel: 5,
        currentStock: 15
      },
      {
        id: 'var-ip16pm-2',
        sku: 'APL-16PM-512-DES',
        ram: '8GB',
        storage: '512GB',
        color: 'Desert Titanium',
        purchasePrice: 228000,
        dealerPrice: 241000,
        wholesalePrice: 243000,
        retailPrice: 264999,
        minSellingPrice: 239000,
        maxDiscount: 4,
        reorderLevel: 3,
        currentStock: 6
      }
    ]
  },
  {
    id: 'prod-3',
    brandId: 'brand-3',
    brandName: 'Xiaomi',
    model: 'Redmi Note 13 Pro 4G',
    category: 'Smartphone',
    networkRegion: 'Official BD (Made in Bangladesh)',
    warrantyPeriodMonths: 12,
    description: '200MP OIS Camera, 120Hz AMOLED Display, 67W Turbo Charge.',
    status: 'Active',
    variants: [
      {
        id: 'var-rn13p-1',
        sku: 'MI-RN13P-8-256-BLK',
        ram: '8GB',
        storage: '256GB',
        color: 'Midnight Black',
        purchasePrice: 28500,
        dealerPrice: 30800,
        wholesalePrice: 31200,
        retailPrice: 33999,
        minSellingPrice: 30500,
        maxDiscount: 6,
        reorderLevel: 15,
        currentStock: 28
      },
      {
        id: 'var-rn13p-2',
        sku: 'MI-RN13P-8-256-GRN',
        ram: '8GB',
        storage: '256GB',
        color: 'Forest Green',
        purchasePrice: 28500,
        dealerPrice: 30800,
        wholesalePrice: 31200,
        retailPrice: 33999,
        minSellingPrice: 30500,
        maxDiscount: 6,
        reorderLevel: 15,
        currentStock: 22
      }
    ]
  },
  {
    id: 'prod-4',
    brandId: 'brand-4',
    brandName: 'Vivo',
    model: 'Vivo V30 5G',
    category: 'Smartphone',
    networkRegion: 'Official BD Made',
    warrantyPeriodMonths: 12,
    description: 'Studio-Quality Aura Light Portrait, Snapdragon 7 Gen 3, 5000mAh Battery 80W.',
    status: 'Active',
    variants: [
      {
        id: 'var-v30-1',
        sku: 'VIV-V30-12-256-PEA',
        ram: '12GB',
        storage: '256GB',
        color: 'Peacock Green',
        purchasePrice: 48000,
        dealerPrice: 52000,
        wholesalePrice: 52800,
        retailPrice: 57999,
        minSellingPrice: 51500,
        maxDiscount: 5,
        reorderLevel: 8,
        currentStock: 14
      }
    ]
  },
  {
    id: 'prod-5',
    brandId: 'brand-5',
    brandName: 'OPPO',
    model: 'OPPO Reno 12 5G',
    category: 'Smartphone',
    networkRegion: 'Official BD',
    warrantyPeriodMonths: 12,
    description: 'AI Portrait Expert, Futuristic Fluid Design, MediaTek Dimensity 7300-Energy.',
    status: 'Active',
    variants: [
      {
        id: 'var-reno12-1',
        sku: 'OPP-R12-12-256-SIL',
        ram: '12GB',
        storage: '256GB',
        color: 'Astro Silver',
        purchasePrice: 49500,
        dealerPrice: 53500,
        wholesalePrice: 54200,
        retailPrice: 59990,
        minSellingPrice: 53000,
        maxDiscount: 5,
        reorderLevel: 10,
        currentStock: 16
      }
    ]
  },
  {
    id: 'prod-6',
    brandId: 'brand-6',
    brandName: 'Realme',
    model: 'Realme 12 Pro+ 5G',
    category: 'Smartphone',
    networkRegion: 'Official BD',
    warrantyPeriodMonths: 12,
    description: 'Periscope Portrait Camera, Luxury Watch Design, Snapdragon 7s Gen 2.',
    status: 'Active',
    variants: [
      {
        id: 'var-rl12p-1',
        sku: 'RLM-12PP-8-256-BLU',
        ram: '8GB',
        storage: '256GB',
        color: 'Submarine Blue',
        purchasePrice: 42000,
        dealerPrice: 45500,
        wholesalePrice: 46000,
        retailPrice: 49999,
        minSellingPrice: 45000,
        maxDiscount: 5,
        reorderLevel: 8,
        currentStock: 18
      }
    ]
  }
];

export const initialIMEIs: IMEIRecord[] = [
  // Galaxy S24 Ultra in stock
  {
    id: 'imei-s24-101',
    imei1: '358921104592011',
    imei2: '358921104592012',
    serialNumber: 'RF9X400AKP1',
    productId: 'prod-1',
    productName: 'Samsung Galaxy S24 Ultra 5G',
    variantId: 'var-s24u-1',
    variantDesc: '12GB/256GB - Titanium Black',
    brandName: 'Samsung',
    purchaseCost: 172000,
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung Official)',
    purchaseInvoiceNo: 'PUR-2026-000101',
    purchaseDate: '2026-09-12',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-12',
    history: [
      {
        date: '2026-09-12 11:20',
        action: 'Goods Received',
        description: 'Received from Fair Electronics Ltd via Invoice PUR-2026-000101',
        user: 'Masum Billah',
        referenceNo: 'PUR-2026-000101'
      }
    ]
  },
  {
    id: 'imei-s24-102',
    imei1: '358921104592029',
    imei2: '358921104592030',
    serialNumber: 'RF9X400AKP2',
    productId: 'prod-1',
    productName: 'Samsung Galaxy S24 Ultra 5G',
    variantId: 'var-s24u-1',
    variantDesc: '12GB/256GB - Titanium Black',
    brandName: 'Samsung',
    purchaseCost: 172000,
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung Official)',
    purchaseInvoiceNo: 'PUR-2026-000101',
    purchaseDate: '2026-09-12',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-12',
    history: [
      {
        date: '2026-09-12 11:20',
        action: 'Goods Received',
        description: 'Received from Fair Electronics Ltd via Invoice PUR-2026-000101',
        user: 'Masum Billah'
      }
    ]
  },
  {
    id: 'imei-s24-103',
    imei1: '358921104592037',
    imei2: '358921104592038',
    serialNumber: 'RF9X400AKP3',
    productId: 'prod-1',
    productName: 'Samsung Galaxy S24 Ultra 5G',
    variantId: 'var-s24u-2',
    variantDesc: '12GB/512GB - Titanium Gray',
    brandName: 'Samsung',
    purchaseCost: 194000,
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung Official)',
    purchaseInvoiceNo: 'PUR-2026-000101',
    purchaseDate: '2026-09-12',
    warehouseId: 'wh-2',
    warehouseName: 'Uttara Hub Warehouse',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-12',
    history: [
      {
        date: '2026-09-12 11:20',
        action: 'Goods Received',
        description: 'Received at Central Warehouse',
        user: 'Masum Billah'
      },
      {
        date: '2026-09-15 14:10',
        action: 'Stock Transferred',
        description: 'Transferred from Central to Uttara Hub (TRF-2026-000042)',
        user: 'Zahid Hossain',
        referenceNo: 'TRF-2026-000042'
      }
    ]
  },
  // Sold S24 Ultra
  {
    id: 'imei-s24-104',
    imei1: '358921104592045',
    imei2: '358921104592046',
    serialNumber: 'RF9X400AKP4',
    productId: 'prod-1',
    productName: 'Samsung Galaxy S24 Ultra 5G',
    variantId: 'var-s24u-1',
    variantDesc: '12GB/256GB - Titanium Black',
    brandName: 'Samsung',
    purchaseCost: 172000,
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung Official)',
    purchaseInvoiceNo: 'PUR-2026-000101',
    purchaseDate: '2026-09-12',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'Sold',
    condition: 'Brand New',
    customerId: 'cust-1',
    customerName: 'Rongdhanu Telecom (Mirpur-10)',
    salesInvoiceNo: 'SAL-2026-000210',
    salesDate: '2026-09-20',
    salesPrice: 185000,
    warrantyExpiry: '2027-09-20',
    history: [
      {
        date: '2026-09-12 11:20',
        action: 'Goods Received',
        description: 'Received from Fair Electronics',
        user: 'Masum Billah'
      },
      {
        date: '2026-09-20 15:45',
        action: 'Wholesale Sold',
        description: 'Sold to Rongdhanu Telecom via SAL-2026-000210',
        user: 'Tanvir Ahmed (Salesman)',
        referenceNo: 'SAL-2026-000210'
      }
    ]
  },
  // Apple iPhone 16 Pro Max
  {
    id: 'imei-ip16-201',
    imei1: '359841103982001',
    imei2: '359841103982002',
    serialNumber: 'F2LXYZ901AP',
    productId: 'prod-2',
    productName: 'Apple iPhone 16 Pro Max',
    variantId: 'var-ip16pm-1',
    variantDesc: '8GB/256GB - Natural Titanium',
    brandName: 'Apple',
    purchaseCost: 196000,
    supplierId: 'sup-2',
    supplierName: 'Compustar PVT Ltd (Apple Authorized Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000102',
    purchaseDate: '2026-09-18',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-18',
    history: [
      {
        date: '2026-09-18 10:00',
        action: 'Goods Received',
        description: 'Received from Compustar BD via PUR-2026-000102',
        user: 'Masum Billah'
      }
    ]
  },
  {
    id: 'imei-ip16-202',
    imei1: '359841103982019',
    imei2: '359841103982020',
    serialNumber: 'F2LXYZ902AP',
    productId: 'prod-2',
    productName: 'Apple iPhone 16 Pro Max',
    variantId: 'var-ip16pm-1',
    variantDesc: '8GB/256GB - Natural Titanium',
    brandName: 'Apple',
    purchaseCost: 196000,
    supplierId: 'sup-2',
    supplierName: 'Compustar PVT Ltd (Apple Authorized Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000102',
    purchaseDate: '2026-09-18',
    warehouseId: 'wh-4',
    warehouseName: 'Dhanmondi Retail Outlet & Experience Center',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-18',
    history: [
      {
        date: '2026-09-18 10:00',
        action: 'Goods Received',
        description: 'Received at Central Warehouse',
        user: 'Masum Billah'
      },
      {
        date: '2026-09-22 11:30',
        action: 'Stock Transferred',
        description: 'Transferred to Dhanmondi Retail Outlet for display/POS (TRF-2026-000045)',
        user: 'Farhana Akhter',
        referenceNo: 'TRF-2026-000045'
      }
    ]
  },
  // Returned iPhone (Customer Return)
  {
    id: 'imei-ip16-203',
    imei1: '359841103982035',
    imei2: '359841103982036',
    serialNumber: 'F2LXYZ903AP',
    productId: 'prod-2',
    productName: 'Apple iPhone 16 Pro Max',
    variantId: 'var-ip16pm-2',
    variantDesc: '8GB/512GB - Desert Titanium',
    brandName: 'Apple',
    purchaseCost: 228000,
    supplierId: 'sup-2',
    supplierName: 'Compustar PVT Ltd (Apple Authorized Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000102',
    purchaseDate: '2026-09-18',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'Returned',
    condition: 'Open Box',
    customerId: 'cust-3',
    customerName: 'Prime Gadgets BD (Bashundhara City)',
    salesInvoiceNo: 'SAL-2026-000215',
    salesDate: '2026-09-25',
    salesPrice: 242000,
    returnReason: 'Customer wanted Natural Titanium color exchange, box opened but pristine.',
    warrantyExpiry: '2027-09-18',
    history: [
      {
        date: '2026-09-18 10:00',
        action: 'Goods Received',
        description: 'Purchased from Compustar',
        user: 'Masum Billah'
      },
      {
        date: '2026-09-25 16:30',
        action: 'Wholesale Sold',
        description: 'Sold to Prime Gadgets BD',
        user: 'Tanvir Ahmed'
      },
      {
        date: '2026-09-28 12:00',
        action: 'Customer Return Approved',
        description: 'Returned by Prime Gadgets BD (RET-2026-000012) - Reason: Color exchange request',
        user: 'Super Admin',
        referenceNo: 'RET-2026-000012'
      }
    ]
  },
  // Xiaomi Redmi Note 13 Pro
  {
    id: 'imei-rn13-301',
    imei1: '864201057819201',
    imei2: '864201057819202',
    serialNumber: 'XIAO928192801',
    productId: 'prod-3',
    productName: 'Xiaomi Redmi Note 13 Pro 4G',
    variantId: 'var-rn13p-1',
    variantDesc: '8GB/256GB - Midnight Black',
    brandName: 'Xiaomi',
    purchaseCost: 28500,
    supplierId: 'sup-3',
    supplierName: 'DBG Technology (Xiaomi National Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000103',
    purchaseDate: '2026-09-22',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-22',
    history: [
      {
        date: '2026-09-22 14:00',
        action: 'Goods Received',
        description: 'Received from DBG Technology',
        user: 'Masum Billah'
      }
    ]
  },
  {
    id: 'imei-rn13-302',
    imei1: '864201057819203',
    imei2: '864201057819204',
    serialNumber: 'XIAO928192802',
    productId: 'prod-3',
    productName: 'Xiaomi Redmi Note 13 Pro 4G',
    variantId: 'var-rn13p-1',
    variantDesc: '8GB/256GB - Midnight Black',
    brandName: 'Xiaomi',
    purchaseCost: 28500,
    supplierId: 'sup-3',
    supplierName: 'DBG Technology (Xiaomi National Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000103',
    purchaseDate: '2026-09-22',
    warehouseId: 'wh-3',
    warehouseName: 'Chittagong Regional Depot',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-22',
    history: [
      {
        date: '2026-09-22 14:00',
        action: 'Goods Received',
        description: 'Received from DBG Technology',
        user: 'Masum Billah'
      },
      {
        date: '2026-09-24 09:30',
        action: 'Stock Transferred',
        description: 'Dispatched to Chittagong Regional Depot (TRF-2026-000044)',
        user: 'Shafiqul Islam'
      }
    ]
  },
  {
    id: 'imei-v30-401',
    imei1: '860192837465011',
    imei2: '860192837465012',
    serialNumber: 'VIV2026991A',
    productId: 'prod-4',
    productName: 'Vivo V30 5G',
    variantId: 'var-v30-1',
    variantDesc: '12GB/256GB - Peacock Green',
    brandName: 'Vivo',
    purchaseCost: 48000,
    supplierId: 'sup-4',
    supplierName: 'Benq Telecom BD Ltd (Vivo National Distributor)',
    purchaseInvoiceNo: 'PUR-2026-000104',
    purchaseDate: '2026-09-26',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    status: 'In Stock',
    condition: 'Brand New',
    warrantyExpiry: '2027-09-26',
    history: [
      {
        date: '2026-09-26 15:10',
        action: 'Goods Received',
        description: 'Received from Benq Telecom',
        user: 'Masum Billah'
      }
    ]
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    customerCode: 'CUST-MIRPUR-001',
    shopName: 'Rongdhanu Telecom & Gadget',
    ownerName: 'Al-Haj Nurul Islam',
    mobile: '+880 1711-234567',
    alternativeMobile: '+880 1911-234567',
    email: 'rongdhanu.mirpur@gmail.com',
    address: 'Shop # 14-16, Shah Ali Plaza (Level 2), Mirpur-10 Circle',
    area: 'Mirpur-10',
    district: 'Dhaka',
    tradeLicense: 'TRAD/DNCC/110928/2021',
    nid: '19762691234000192',
    creditLimit: 1200000, // ৳ 12 Lakh limit
    allowedDueDays: 30,
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    customerType: 'Wholesale Dealer',
    openingBalance: 150000,
    currentDue: 585000, // Over 48% credit utilized
    status: 'Active',
    notes: 'Premium wholesale partner. Regular payment track record.'
  },
  {
    id: 'cust-2',
    customerCode: 'CUST-CTG-002',
    shopName: 'Bismillah Mobile Care & Wholesale',
    ownerName: 'Hazi Mohammad Yunus',
    mobile: '+880 1819-765432',
    email: 'bismillah.chawkbazar@yahoo.com',
    address: 'Keari Elysium Shopping Complex (Ground Floor), Chawkbazar',
    area: 'Chawkbazar',
    district: 'Chittagong',
    tradeLicense: 'TRAD/CCC/209182/2020',
    creditLimit: 2000000, // ৳ 20 Lakh
    allowedDueDays: 21,
    salesmanId: 'sm-3',
    salesmanName: 'Ariful Islam',
    customerType: 'Wholesale Dealer',
    openingBalance: 300000,
    currentDue: 1850000, // 92.5% credit limit reached! Warning condition!
    status: 'Active',
    notes: 'Large volume dealer in Chittagong region. Requires follow-up.'
  },
  {
    id: 'cust-3',
    customerCode: 'CUST-BASH-003',
    shopName: 'Prime Gadgets BD',
    ownerName: 'Engr. Shamim Reza',
    mobile: '+880 1678-112233',
    email: 'primegadgets.bd@gmail.com',
    address: 'Shop # 68, Level 5, Block B, Bashundhara City Mall, Panthapath',
    area: 'Panthapath',
    district: 'Dhaka',
    tradeLicense: 'TRAD/DNCC/998231/2022',
    creditLimit: 1500000,
    allowedDueDays: 15,
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    customerType: 'Sub-Dealer',
    openingBalance: 0,
    currentDue: 450000,
    status: 'Active',
    notes: 'High-end Apple and Samsung flagship outlet.'
  },
  {
    id: 'cust-4',
    customerCode: 'CUST-OLDDH-004',
    shopName: 'Modern Telecommunication',
    ownerName: 'Kamrul Ahsan Babu',
    mobile: '+880 1715-998811',
    address: 'Islam Market, Chawk Circular Road, Chawkbazar',
    area: 'Old Dhaka',
    district: 'Dhaka',
    tradeLicense: 'TRAD/DSCC/019283/2023',
    creditLimit: 800000,
    allowedDueDays: 14,
    salesmanId: 'sm-2',
    salesmanName: 'Kamrul Hasan',
    customerType: 'Retail Shop',
    openingBalance: 0,
    currentDue: 120000,
    status: 'Active'
  },
  {
    id: 'cust-5',
    customerCode: 'CUST-WALK-005',
    shopName: 'Direct Walk-in Retail Customer',
    ownerName: 'Cash Counter Customer',
    mobile: '+880 1700-000000',
    address: 'Dhanmondi Retail Outlet Point of Sale',
    area: 'Dhanmondi',
    district: 'Dhaka',
    creditLimit: 0,
    allowedDueDays: 0,
    customerType: 'Walk-in',
    openingBalance: 0,
    currentDue: 0,
    status: 'Active'
  }
];

export const initialSalesmen: Salesman[] = [
  {
    id: 'sm-1',
    employeeCode: 'EMP-SM-01',
    name: 'Tanvir Ahmed',
    mobile: '+880 1711-445566',
    email: 'tanvir.sales@telecorp-bd.com',
    address: 'Mirpur DOHS, Dhaka',
    joiningDate: '2023-01-15',
    basicSalary: 35000,
    commissionType: 'Percentage of Sales',
    commissionRate: 1.0, // 1% of total invoice sales
    monthlyTarget: 5000000, // 50 Lakh BDT
    currentMonthSales: 3850000,
    currentMonthCollection: 3100000,
    assignedArea: 'Mirpur, Uttara, Gazipur Route',
    assignedCustomerCount: 14,
    status: 'Active'
  },
  {
    id: 'sm-2',
    employeeCode: 'EMP-SM-02',
    name: 'Kamrul Hasan',
    mobile: '+880 1819-332211',
    email: 'kamrul.sales@telecorp-bd.com',
    address: 'Lalbagh, Old Dhaka',
    joiningDate: '2023-06-01',
    basicSalary: 32000,
    commissionType: 'Percentage of Gross Profit',
    commissionRate: 6.0, // 6% of gross profit
    monthlyTarget: 4000000,
    currentMonthSales: 2900000,
    currentMonthCollection: 2650000,
    assignedArea: 'Old Dhaka, Narayanganj, Keraniganj',
    assignedCustomerCount: 18,
    status: 'Active'
  },
  {
    id: 'sm-3',
    employeeCode: 'EMP-SM-03',
    name: 'Ariful Islam',
    mobile: '+880 1913-778899',
    email: 'arif.ctg@telecorp-bd.com',
    address: 'Halishahar, Chittagong',
    joiningDate: '2024-02-10',
    basicSalary: 35000,
    commissionType: 'Fixed Per Unit',
    commissionRate: 350, // 350 BDT per phone sold
    monthlyTarget: 6000000,
    currentMonthSales: 4400000,
    currentMonthCollection: 3800000,
    assignedArea: 'Chittagong Metro, Cox’s Bazar',
    assignedCustomerCount: 12,
    status: 'Active'
  }
];

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Dutch-Bangla Bank Limited (DBBL)',
    branch: 'Principal Branch, Motijheel, Dhaka',
    accountName: 'TeleCorp Mobile Distribution & Trade Ltd.',
    accountNumber: '104.120.9876543',
    accountType: 'Current',
    openingBalance: 5000000,
    currentBalance: 7420000,
    status: 'Active'
  },
  {
    id: 'bank-2',
    bankName: 'The City Bank Ltd',
    branch: 'Gulshan Corporate Branch',
    accountName: 'TeleCorp Mobile Distribution Ltd.',
    accountNumber: '110.220.4499110',
    accountType: 'Current',
    openingBalance: 3000000,
    currentBalance: 4680000,
    status: 'Active'
  },
  {
    id: 'bank-3',
    bankName: 'bKash Merchant Account',
    branch: 'Direct Merchant Gateway (API Ready)',
    accountName: 'TeleCorp Mobile Retail',
    accountNumber: '01711-002233',
    accountType: 'MFS Merchant (bKash/Nagad)',
    openingBalance: 450000,
    currentBalance: 890000,
    status: 'Active'
  },
  {
    id: 'bank-4',
    bankName: 'BRAC Bank PLC',
    branch: 'Agrabad Branch, Chittagong',
    accountName: 'TeleCorp Mobile CTG Operations',
    accountNumber: '150.110.8877665',
    accountType: 'Current',
    openingBalance: 1200000,
    currentBalance: 2150000,
    status: 'Active'
  }
];

export const initialCashTransactions: CashTransaction[] = [
  {
    id: 'cash-1',
    date: '2026-10-03 10:00',
    type: 'Cash In',
    category: 'Due Collection',
    amount: 150000,
    referenceNo: 'REC-2026-000091',
    description: 'Received cash collection from Rongdhanu Telecom via Tanvir Ahmed',
    performedBy: 'Cashier Farhana'
  },
  {
    id: 'cash-2',
    date: '2026-10-03 12:30',
    type: 'Cash Out',
    category: 'Expense',
    amount: 18500,
    referenceNo: 'EXP-2026-000045',
    description: 'Office tea, snacks, stationery and courier delivery dispatch',
    performedBy: 'Accounts Masum'
  },
  {
    id: 'cash-3',
    date: '2026-10-03 17:00',
    type: 'Cash In',
    category: 'Customer Sale',
    amount: 57999,
    referenceNo: 'SAL-2026-000216',
    description: 'POS Retail Cash Sale of Vivo V30 5G at Dhanmondi outlet',
    performedBy: 'Cashier Farhana'
  }
];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 'expcat-1', name: 'Office Rent & Utilities', description: 'Head office, warehouse & outlet rentals, electricity, internet' },
  { id: 'expcat-2', name: 'Salaries & Allowances', description: 'Monthly employee fixed payroll' },
  { id: 'expcat-3', name: 'Salesman Commission', description: 'Incentive payments upon target achievement' },
  { id: 'expcat-4', name: 'Transport & Freight', description: 'Courier, van transport, inter-depot logistics' },
  { id: 'expcat-5', name: 'Marketing & Promotion', description: 'Dealer banners, retailer gifts, digital ads' },
  { id: 'expcat-6', name: 'Repair & Maintenance', description: 'Office IT, CCTV, AC servicing' },
  { id: 'expcat-7', name: 'Bank Charges & Gateway Fees', description: 'Transaction commission and chequebook fees' }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    expenseNo: 'EXP-2026-000041',
    date: '2026-10-01',
    categoryId: 'expcat-1',
    categoryName: 'Office Rent & Utilities',
    amount: 180000,
    paymentMethod: 'Bank Transfer',
    bankAccountId: 'bank-1',
    description: 'Central Warehouse & Motijheel Office Rent for October 2026',
    approvedBy: 'General Manager',
    createdAt: '2026-10-01'
  },
  {
    id: 'exp-2',
    expenseNo: 'EXP-2026-000042',
    date: '2026-10-02',
    categoryId: 'expcat-4',
    categoryName: 'Transport & Freight',
    amount: 24500,
    paymentMethod: 'Cash',
    description: 'Chittagong secure courier transport van for 100 units consignment',
    approvedBy: 'Warehouse Manager',
    createdAt: '2026-10-02'
  }
];

export const initialCOA: AccountCOA[] = [
  { code: '1000', name: 'Cash in Hand (Main Vault & Till)', type: 'Asset', nature: 'Debit', balance: 685000, description: 'Physical cash at central office & retail cash registers' },
  { code: '1010', name: 'Bank Accounts (DBBL, City, BRAC, bKash)', type: 'Asset', nature: 'Debit', balance: 15140000, description: 'Liquid cash balances across commercial banks & MFS' },
  { code: '1020', name: 'Accounts Receivable (Customer Due)', type: 'Asset', nature: 'Debit', balance: 3005000, description: 'Total outstanding balances due from wholesale dealers' },
  { code: '1050', name: 'Merchandise Inventory (Mobile Stock)', type: 'Asset', nature: 'Debit', balance: 22840000, description: 'Valuation of all smartphones & devices across all warehouses' },
  { code: '2000', name: 'Accounts Payable (Supplier Due)', type: 'Liability', nature: 'Credit', balance: 12020000, description: 'Total outstanding payables due to official brand suppliers' },
  { code: '2050', name: 'Accrued Expenses & VAT Payable', type: 'Liability', nature: 'Credit', balance: 420000, description: '5% NBR VAT collected awaiting treasury deposit' },
  { code: '3000', name: 'Owner Capital & Retained Earnings', type: 'Equity', nature: 'Credit', balance: 25000000, description: 'Initial paid-up capital & accumulated profits' },
  { code: '4000', name: 'Wholesale Sales Revenue', type: 'Revenue', nature: 'Credit', balance: 14850000, description: 'Revenue generated from dealer sales' },
  { code: '4010', name: 'Retail POS Sales Revenue', type: 'Revenue', nature: 'Credit', balance: 2680000, description: 'Direct counter retail sales' },
  { code: '4090', name: 'Sales Returns & Allowances', type: 'Revenue', nature: 'Debit', balance: 242000, description: 'Customer returns contra-revenue' },
  { code: '5000', name: 'Cost of Goods Sold (COGS)', type: 'Expense', nature: 'Debit', balance: 14920000, description: 'Direct purchase cost of units sold' },
  { code: '6000', name: 'Operating Expenses (Rent, Salary, Transport)', type: 'Expense', nature: 'Debit', balance: 845000, description: 'General & administrative overheads' },
  { code: '6050', name: 'Salesman Commission Expense', type: 'Expense', nature: 'Debit', balance: 175000, description: 'Commission earned by field sales officers' }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'jv-1',
    voucherNo: 'JV-2026-000001',
    date: '2026-09-12',
    voucherType: 'Purchase Voucher',
    referenceNo: 'PUR-2026-000101',
    description: 'Purchase of Samsung Galaxy S24 Ultra consignment from Fair Electronics Ltd',
    lines: [
      { accountCode: '1050', accountName: 'Merchandise Inventory', debit: 3450000, credit: 0, memo: 'Stock received 20 units' },
      { accountCode: '2000', accountName: 'Accounts Payable', credit: 3450000, debit: 0, memo: 'Supplier credit payable 21 days' }
    ],
    totalDebit: 3450000,
    totalCredit: 3450000,
    createdBy: 'Accounts Masum',
    createdAt: '2026-09-12'
  },
  {
    id: 'jv-2',
    voucherNo: 'JV-2026-000002',
    date: '2026-09-20',
    voucherType: 'Sales Voucher',
    referenceNo: 'SAL-2026-000210',
    description: 'Wholesale sale to Rongdhanu Telecom (Mirpur)',
    lines: [
      { accountCode: '1020', accountName: 'Accounts Receivable', debit: 370000, credit: 0, memo: 'Invoice due 30 days' },
      { accountCode: '4000', accountName: 'Wholesale Sales Revenue', credit: 370000, debit: 0, memo: '2 units Galaxy S24 Ultra sold' },
      { accountCode: '5000', accountName: 'Cost of Goods Sold', debit: 344000, credit: 0, memo: 'Cost recognition' },
      { accountCode: '1050', accountName: 'Merchandise Inventory', credit: 344000, debit: 0, memo: 'Stock reduction' }
    ],
    totalDebit: 714000,
    totalCredit: 714000,
    createdBy: 'Tanvir Ahmed',
    createdAt: '2026-09-20'
  }
];

export const initialSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'SAL-2026-000210',
    invoiceType: 'Wholesale',
    customerId: 'cust-1',
    customerName: 'Rongdhanu Telecom & Gadget',
    customerPhone: '+880 1711-234567',
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    invoiceDate: '2026-09-20',
    dueDate: '2026-10-20', // Due in 16 days
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Samsung Galaxy S24 Ultra 5G',
        variantId: 'var-s24u-1',
        variantDesc: '12GB/256GB - Titanium Black',
        quantity: 2,
        unitPrice: 185000,
        unitCost: 172000,
        discount: 0,
        vatAmount: 0,
        totalAmount: 370000,
        imeiList: ['358921104592045']
      }
    ],
    subTotal: 370000,
    discountTotal: 0,
    vatTotal: 0,
    grandTotal: 370000,
    paidAmount: 100000,
    dueAmount: 270000,
    payments: [
      { method: 'Bank Transfer', amount: 100000, bankAccountId: 'bank-1', transactionRef: 'FT-998811' }
    ],
    status: 'Partial',
    commissionEarned: 3700,
    notes: 'Payment received via City Bank EFT. Balance in 30 days.',
    createdAt: '2026-09-20'
  },
  {
    id: 'inv-2',
    invoiceNo: 'SAL-2026-000201',
    invoiceType: 'Wholesale',
    customerId: 'cust-2',
    customerName: 'Bismillah Mobile Care & Wholesale',
    customerPhone: '+880 1819-765432',
    salesmanId: 'sm-3',
    salesmanName: 'Ariful Islam',
    warehouseId: 'wh-3',
    warehouseName: 'Chittagong Regional Depot',
    invoiceDate: '2026-08-15', // 50 days ago -> 31-60 days Overdue!
    dueDate: '2026-09-05',
    items: [
      {
        id: 'item-2',
        productId: 'prod-3',
        productName: 'Xiaomi Redmi Note 13 Pro 4G',
        variantId: 'var-rn13p-1',
        variantDesc: '8GB/256GB - Midnight Black',
        quantity: 20,
        unitPrice: 31000,
        unitCost: 28500,
        discount: 10000,
        vatAmount: 0,
        totalAmount: 610000,
        imeiList: []
      }
    ],
    subTotal: 620000,
    discountTotal: 10000,
    vatTotal: 0,
    grandTotal: 610000,
    paidAmount: 200000,
    dueAmount: 410000,
    payments: [{ method: 'Cheque', amount: 200000, transactionRef: 'CQ-667788' }],
    status: 'Partial',
    commissionEarned: 7000,
    notes: 'Cheque cleared on 25-Aug. Reminder sent for ৳4,10,000 balance.',
    createdAt: '2026-08-15'
  }
];

export const initialPurchases: PurchaseInvoice[] = [
  {
    id: 'pur-1',
    invoiceNo: 'PUR-2026-000101',
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung Official)',
    purchaseDate: '2026-09-12',
    dueDate: '2026-10-03',
    warehouseId: 'wh-1',
    warehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    items: [
      {
        id: 'pitem-1',
        productId: 'prod-1',
        productName: 'Samsung Galaxy S24 Ultra 5G',
        variantId: 'var-s24u-1',
        variantDesc: '12GB/256GB - Titanium Black',
        quantity: 20,
        unitCost: 172000,
        discount: 0,
        vatRate: 0,
        totalCost: 3440000,
        imeis: ['358921104592011', '358921104592029', '358921104592045']
      }
    ],
    subTotal: 3440000,
    discountTotal: 0,
    vatTotal: 0,
    otherCost: 10000,
    grandTotal: 3450000,
    paidAmount: 1500000,
    dueAmount: 1950000,
    paymentMethod: 'Bank Transfer',
    bankAccountId: 'bank-1',
    status: 'Partially Paid',
    notes: '20 units consignment. 10 Lakh payment scheduled on due date.',
    createdAt: '2026-09-12'
  }
];

export const initialStockTransfers: StockTransfer[] = [
  {
    id: 'trf-1',
    transferNo: 'TRF-2026-000042',
    sourceWarehouseId: 'wh-1',
    sourceWarehouseName: 'Central Warehouse (Motijheel, Dhaka)',
    destinationWarehouseId: 'wh-2',
    destinationWarehouseName: 'Uttara Hub Warehouse',
    transferDate: '2026-09-15',
    items: [
      {
        productId: 'prod-1',
        productName: 'Samsung Galaxy S24 Ultra 5G',
        variantId: 'var-s24u-2',
        variantDesc: '12GB/512GB - Titanium Gray',
        quantity: 1,
        imeis: ['358921104592037']
      }
    ],
    totalQuantity: 1,
    status: 'Received',
    dispatchedBy: 'Masum Billah',
    receivedBy: 'Zahid Hossain',
    notes: 'Emergency transfer for Uttara corporate client delivery.',
    createdAt: '2026-09-15'
  }
];

export const initialCustomerReturns: CustomerReturn[] = [
  {
    id: 'ret-1',
    returnNo: 'RET-2026-000012',
    originalInvoiceNo: 'SAL-2026-000215',
    customerId: 'cust-3',
    customerName: 'Prime Gadgets BD (Bashundhara City)',
    returnDate: '2026-09-28',
    imei: '359841103982035',
    productName: 'Apple iPhone 16 Pro Max',
    variantDesc: '8GB/512GB - Desert Titanium',
    returnReason: 'Dealer customer requested Natural Titanium exchange. Box opened but brand new unit.',
    condition: 'Open Box',
    refundOrCreditAmount: 242000,
    restockWarehouseId: 'wh-1',
    restockStatus: 'Restocked',
    commissionReversed: 2420,
    approvedBy: 'Super Admin',
    status: 'Approved',
    notes: 'Credit note issued against dealer account #cust-3.',
    createdAt: '2026-09-28'
  }
];

export const initialAlerts: SystemAlert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    title: 'Customer Credit Limit Breach Warning',
    message: 'Bismillah Mobile Care (Chittagong) has utilized 92.5% of credit limit (৳ 18,50,000 / ৳ 20,00,000). Further credit sales require Director approval.',
    timestamp: '2026-10-04 08:30',
    read: false,
    linkModule: 'customers',
    referenceId: 'cust-2'
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Overdue Receivable: 50 Days Overdue',
    message: 'Invoice SAL-2026-000201 for Bismillah Mobile Care has ৳ 4,10,000 overdue for 30+ days. Salesman Ariful Islam assigned for physical recovery.',
    timestamp: '2026-10-04 09:00',
    read: false,
    linkModule: 'due-ageing',
    referenceId: 'inv-2'
  },
  {
    id: 'alert-3',
    type: 'reminder',
    title: 'Upcoming Supplier Payment Due',
    message: 'Fair Electronics Ltd payment of ৳ 19,50,000 against PUR-2026-000101 was due on 03-Oct. Check bank funds for RTGS transfer.',
    timestamp: '2026-10-04 09:15',
    read: false,
    linkModule: 'suppliers',
    referenceId: 'sup-1'
  },
  {
    id: 'alert-4',
    type: 'info',
    title: 'Low Stock Alert: Galaxy S24 Ultra 512GB',
    message: 'Current stock is 8 units across all hubs, approaching reorder threshold of 4 units. Consider raising Purchase Order.',
    timestamp: '2026-10-03 16:00',
    read: true,
    linkModule: 'inventory'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-03 18:22:10',
    user: 'Super Admin (Aminul Islam)',
    role: 'Super Admin',
    action: 'Approved Customer Return',
    module: 'Customer Return',
    referenceNo: 'RET-2026-000012',
    oldValue: 'Status: Pending',
    newValue: 'Status: Approved | Credit: ৳ 242,000',
    ipAddress: '103.220.198.42 (Dhaka, BD)'
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-03 14:15:00',
    user: 'Tanvir Ahmed',
    role: 'Salesman',
    action: 'Created Wholesale Invoice',
    module: 'Sales',
    referenceNo: 'SAL-2026-000210',
    oldValue: 'Draft',
    newValue: 'Total: ৳ 370,000 | Paid: ৳ 100,000 | Due: ৳ 270,000',
    ipAddress: '119.30.38.10 (Mirpur Mobile)'
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-02 11:05:44',
    user: 'Masum Billah',
    role: 'Warehouse Manager',
    action: 'Dispatched Stock Transfer',
    module: 'Stock Transfer',
    referenceNo: 'TRF-2026-000042',
    oldValue: 'Requested',
    newValue: 'Dispatched to Uttara Hub',
    ipAddress: '103.220.198.42'
  }
];

export const initialSalesmanVisits = [
  {
    id: 'visit-1',
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    customerId: 'cust-1',
    customerName: 'Al-Haj Nurul Islam',
    shopName: 'Rongdhanu Telecom & Gadget (Mirpur-10)',
    visitDate: '2026-10-03 11:30',
    purpose: 'Payment Follow-up' as const,
    outcomeNotes: 'Collected ৳1,50,000 cash against overdue balance. Dealer requested 5 units Galaxy S24 Ultra delivery next Monday.',
    orderCollectedAmount: 925000,
    paymentCollectedAmount: 150000,
    nextFollowUpDate: '2026-10-08'
  },
  {
    id: 'visit-2',
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    customerId: 'cust-3',
    customerName: 'Engr. Shamim Reza',
    shopName: 'Prime Gadgets BD (Bashundhara City)',
    visitDate: '2026-10-02 15:00',
    purpose: 'Order Collection' as const,
    outcomeNotes: 'Inspected display counter. Customer requested 2 units iPhone 16 Pro Max 256GB.',
    orderCollectedAmount: 418000,
    paymentCollectedAmount: 0,
    nextFollowUpDate: '2026-10-10'
  }
];

export const initialCustomerFollowUps = [
  {
    id: 'fup-1',
    customerId: 'cust-2',
    customerName: 'Hazi Mohammad Yunus',
    shopName: 'Bismillah Mobile Care & Wholesale (Chittagong)',
    salesmanId: 'sm-3',
    salesmanName: 'Ariful Islam',
    scheduledDate: '2026-10-05',
    contactNumber: '+880 1819-765432',
    purpose: 'Overdue Recovery' as const,
    currentDueAmount: 1850000,
    status: 'Contacted - Promised Payment' as const,
    promisedDate: '2026-10-07',
    notes: 'Dealer proprietor promised to issue BEFTN transfer of ৳ 5,00,000 on Wednesday.',
    updatedAt: '2026-10-03 17:00'
  },
  {
    id: 'fup-2',
    customerId: 'cust-1',
    customerName: 'Al-Haj Nurul Islam',
    shopName: 'Rongdhanu Telecom & Gadget',
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    scheduledDate: '2026-10-06',
    contactNumber: '+880 1711-234567',
    purpose: 'Due Payment Follow-up' as const,
    currentDueAmount: 585000,
    status: 'Pending' as const,
    notes: 'Follow-up for remaining ৳4,35,000 due from September invoice.',
    updatedAt: '2026-10-03 10:00'
  }
];

export const initialDayClosings = [
  {
    id: 'closing-1',
    closingNo: 'DAY-CLOSE-2026-10-03',
    date: '2026-10-03',
    cashierName: 'Farhana Akhter',
    warehouseId: 'wh-4',
    warehouseName: 'Dhanmondi Retail Outlet & Experience Center',
    openingCash: 50000,
    cashSalesTotal: 57999,
    dueCollectionsTotal: 150000,
    cashExpensesTotal: 18500,
    bankDepositsTotal: 100000,
    expectedClosingCash: 139499,
    actualPhysicalCash: 139499,
    discrepancy: 0,
    status: 'Balanced' as const,
    verifiedBy: 'Masum Billah (Manager)',
    notes: 'Till counted and cash sealed in night drop safe. Zero variance.',
    createdAt: '2026-10-03 20:30'
  }
];

export const initialPhoneExchanges = [
  {
    id: 'exch-1',
    exchangeNo: 'EXCH-2026-000001',
    date: '2026-09-29',
    customerId: 'cust-1',
    customerName: 'Rongdhanu Telecom & Gadget',
    customerPhone: '+880 1711-234567',
    salesmanId: 'sm-1',
    salesmanName: 'Tanvir Ahmed',
    oldBrand: 'Samsung',
    oldModel: 'Galaxy S22 Ultra 5G (12/256)',
    oldIMEI: '354891109928101',
    oldCondition: 'Used' as const,
    assessedValue: 45000,
    newProductId: 'prod-1',
    newProductName: 'Samsung Galaxy S24 Ultra 5G',
    newVariantDesc: '12GB/256GB - Titanium Black',
    newIMEI: '358921104592045',
    newPhonePrice: 185000,
    netPayableAmount: 140000,
    amountPaidNow: 40000,
    dueAmount: 100000,
    paymentMethod: 'bKash' as const,
    notes: 'Customer upgraded to S24 Ultra. Old S22 Ultra added to Pre-owned stock bin.',
    createdAt: '2026-09-29'
  }
];

export const initialBankStatements = [
  {
    id: 'stmt-1',
    date: '2026-10-02',
    description: 'BEFTN CR - Rongdhanu Telecom',
    referenceNo: 'FT-998811',
    debit: 0,
    credit: 100000,
    matchedSystemTxnId: 'cash-1',
    status: 'Matched' as const
  },
  {
    id: 'stmt-2',
    date: '2026-10-03',
    description: 'Monthly Maintenance & SMS Alert Fee',
    referenceNo: 'CHG-9921',
    debit: 575,
    credit: 0,
    status: 'Bank Charge' as const
  },
  {
    id: 'stmt-3',
    date: '2026-10-03',
    description: 'RTGS IN - Chawkbazar Mobile Payment',
    referenceNo: 'RTGS-002931',
    debit: 0,
    credit: 250000,
    status: 'Unmatched' as const
  }
];

export const initialWarrantyClaims: WarrantyClaim[] = [
  {
    id: 'rma-1',
    rmaNumber: 'RMA-2026-0089',
    date: '2026-10-01',
    customerId: 'cust-1',
    customerName: 'Md. Hafizur Rahman (Popular Telecom)',
    customerPhone: '01712-334455',
    brandName: 'Samsung',
    productModel: 'Galaxy S24 Ultra 5G (12GB/256GB)',
    imei: '352849102938475',
    purchaseInvoiceNo: 'INV-2026-0001',
    purchaseDate: '2026-10-01',
    problemDescription: 'Display green vertical line appeared after software update. No physical or liquid drop damage.',
    physicalCondition: 'Good condition, minor scratches on back frame, original box provided.',
    accessoriesIncluded: 'Box, S-Pen, Type-C cable',
    serviceCenterName: 'Samsung Authorized Customer Care, Jamuna Future Park',
    serviceCenterJobNo: 'SAM-CARE-99210',
    status: 'In Repair',
    repairCostCustomer: 0,
    remarks: 'Under official manufacturer 12-month panel warranty. Awaiting motherboard/panel replacement.'
  },
  {
    id: 'rma-2',
    rmaNumber: 'RMA-2026-0090',
    date: '2026-09-28',
    customerId: 'cust-2',
    customerName: 'Jashim Uddin (Trust Mobile World)',
    customerPhone: '01819-223344',
    brandName: 'Xiaomi',
    productModel: 'Redmi Note 13 Pro 4G',
    imei: '864201048291034',
    purchaseInvoiceNo: 'INV-2026-0002',
    purchaseDate: '2026-09-25',
    problemDescription: 'Dead on Arrival (DOA) - device shuts down randomly and fails to charge beyond 12%.',
    physicalCondition: 'Brand new flawless condition, all stickers intact.',
    accessoriesIncluded: 'Original 67W fast charger, original retail box, silicon case',
    serviceCenterName: 'Xiaomi Service Center, Agrabad Chittagong',
    serviceCenterJobNo: 'MI-CTG-4410',
    status: 'Replaced',
    replacementIMEI: '864201048299999',
    repairCostCustomer: 0,
    deliveryDate: '2026-10-03',
    remarks: 'Approved for DOA swap replacement unit by Xiaomi national distributor.'
  }
];

export const initialBrandIncentives: BrandIncentiveScheme[] = [
  {
    id: 'scheme-1',
    brandId: 'brand-1',
    brandName: 'Samsung',
    schemeTitle: 'Samsung Durga Puja & Q4 Festival Target Bonus',
    period: 'Q4 2026 (Oct 01 - Dec 31)',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    targetUnits: 150,
    achievedUnits: 42,
    slabs: [
      { minUnits: 50, incentivePerUnit: 400 },
      { minUnits: 100, incentivePerUnit: 750 },
      { minUnits: 150, incentivePerUnit: 1200 }
    ],
    totalIncentiveEarned: 16800, // 42 * 400 preliminary
    claimStatus: 'In Progress'
  },
  {
    id: 'scheme-2',
    brandId: 'brand-3',
    brandName: 'Xiaomi',
    schemeTitle: 'Redmi Note 13 Series Volume Accelerator Scheme',
    period: 'Q3-Q4 2026 Special Program',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    targetUnits: 200,
    achievedUnits: 135,
    slabs: [
      { minUnits: 50, incentivePerUnit: 300 },
      { minUnits: 100, incentivePerUnit: 600 },
      { minUnits: 200, incentivePerUnit: 1000 }
    ],
    totalIncentiveEarned: 81000, // 135 * 600
    claimStatus: 'Claim Submitted'
  }
];

export const initialDeliveryChallans: DeliveryChallan[] = [
  {
    id: 'ch-1',
    challanNo: 'CH-2026-00441',
    date: '2026-10-03',
    invoiceNo: 'INV-2026-000101',
    customerId: 'cust-1',
    customerName: 'Prime Gadgets BD',
    customerPhone: '01712-345678',
    deliveryAddress: 'Shop 42, Level 3, Jamuna Future Park, Bashundhara, Dhaka',
    district: 'Dhaka',
    courierPartner: 'Sundarban Courier',
    consignmentNo: 'SC-DHK-992104',
    isCOD: false,
    codAmount: 0,
    codStatus: 'Not Applicable',
    deliveryStatus: 'In Transit',
    totalCartons: 2,
    imeiList: ['354892110482901', '354892110482902'],
    remarks: 'Fragile electronics. Handover to shop manager Tanvir Ahmed.'
  },
  {
    id: 'ch-2',
    challanNo: 'CH-2026-00442',
    date: '2026-10-02',
    invoiceNo: 'INV-2026-000102',
    customerId: 'cust-2',
    customerName: 'Trust Mobile World',
    customerPhone: '01819-876543',
    deliveryAddress: 'Holding 88, Agrabad C/A, Chattogram',
    district: 'Chattogram',
    courierPartner: 'SA Paribahan',
    consignmentNo: 'SAP-CTG-881290',
    isCOD: true,
    codAmount: 250000,
    codStatus: 'Pending',
    deliveryStatus: 'Dispatched',
    totalCartons: 3,
    imeiList: ['864201048291001', '864201048291002', '864201048291003'],
    remarks: 'Collect ৳2,50,000 cash on delivery before handover.'
  },
  {
    id: 'ch-3',
    challanNo: 'CH-2026-00439',
    date: '2026-10-01',
    invoiceNo: 'INV-2026-000098',
    customerId: 'cust-4',
    customerName: 'Popular Telecom',
    customerPhone: '01911-334455',
    deliveryAddress: 'Sector 3, Uttara Model Town, Dhaka',
    district: 'Dhaka',
    courierPartner: 'Company Van Delivery',
    consignmentNo: 'VAN-TRIP-04',
    driverName: 'Alamgir Hossain',
    driverPhone: '01722-998877',
    isCOD: false,
    codAmount: 0,
    codStatus: 'Not Applicable',
    deliveryStatus: 'Delivered',
    totalCartons: 1,
    imeiList: ['354892110482905'],
    remarks: 'Direct delivery by company delivery van.',
    deliveredAt: '2026-10-01 16:30'
  }
];

export const initialPriceDropClaims: PriceDropClaim[] = [
  {
    id: 'pdc-1',
    claimNo: 'PDC-2026-0012',
    claimDate: '2026-09-28',
    brandName: 'Samsung',
    supplierId: 'sup-1',
    supplierName: 'Fair Electronics Ltd (Samsung National Distributor)',
    productId: 'prod-1',
    productModel: 'Samsung Galaxy S24 Ultra',
    variantDesc: '12GB/256GB - Titanium Gray',
    oldPurchaseCost: 145000,
    newPurchaseCost: 139000,
    dropPerUnit: 6000,
    eligibleStockCount: 5,
    totalClaimAmount: 30000,
    claimStatus: 'Approved & Credited',
    creditNoteNo: 'CN-SAM-2026-081',
    announcementRef: 'SEC-BD-PRICEDROP-CIRCULAR-0928'
  },
  {
    id: 'pdc-2',
    claimNo: 'PDC-2026-0015',
    claimDate: '2026-10-02',
    brandName: 'Xiaomi',
    supplierId: 'sup-3',
    supplierName: 'DBG Technology (Xiaomi National Distributor)',
    productId: 'prod-3',
    productModel: 'Xiaomi Redmi Note 13 Pro 4G',
    variantDesc: '8GB/256GB - Midnight Black',
    oldPurchaseCost: 28500,
    newPurchaseCost: 26500,
    dropPerUnit: 2000,
    eligibleStockCount: 8,
    totalClaimAmount: 16000,
    claimStatus: 'Submitted to Brand',
    announcementRef: 'MI-BD-PRICE-REVISION-Q4'
  }
];

export const initialSmsLogs: SmsLog[] = [
  {
    id: 'sms-1',
    recipientPhone: '01712-345678',
    recipientName: 'Prime Gadgets BD',
    messageType: 'Invoice Alert',
    messageBody: 'Dear Prime Gadgets BD, Invoice #INV-2026-000101 of BDT 1,85,000 has been generated. Thank you for business with TeleCorp.',
    sentAt: '2026-10-03 11:42',
    status: 'Delivered',
    masking: 'TeleCorp',
    smsUnits: 1
  },
  {
    id: 'sms-2',
    recipientPhone: '01819-876543',
    recipientName: 'Trust Mobile World',
    messageType: 'Due Reminder',
    messageBody: 'Dear Dealer, your total due with TeleCorp is BDT 12,50,000. Kindly arrange settlement to maintain your credit score.',
    sentAt: '2026-10-02 09:30',
    status: 'Delivered',
    masking: 'TeleCorp',
    smsUnits: 1
  },
  {
    id: 'sms-3',
    recipientPhone: '01711-223344',
    recipientName: 'Star Telecommunication',
    messageType: 'Payment Receipt',
    messageBody: 'Payment Confirmation: Received BDT 4,00,000 via Bank Transfer. Your current outstanding due is BDT 2,50,000. TeleCorp.',
    sentAt: '2026-10-01 15:20',
    status: 'Delivered',
    masking: 'TeleCorp',
    smsUnits: 1
  },
  {
    id: 'sms-4',
    recipientPhone: '01799-112233',
    recipientName: 'Chawkbazar Mobile Store',
    messageType: 'Warranty Update',
    messageBody: 'RMA Alert: Your warranty device IMEI 864201048291005 has been inspected & replaced with new IMEI 864201048299999. TeleCorp.',
    sentAt: '2026-10-03 17:10',
    status: 'Delivered',
    masking: 'TeleCorp',
    smsUnits: 1
  }
];


