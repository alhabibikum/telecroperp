/**
 * Form History Service
 * Provides persistent history suggestions for all form inputs across TeleCorp ERP.
 * Stores recent values in localStorage and seeds with domain-specific ERP defaults.
 */

const STORAGE_KEY = 'telecorp_form_field_history';
const MAX_HISTORY_PER_FIELD = 20;

// Domain-specific seed entries
const SEED_HISTORY: Record<string, string[]> = {
  model: [
    'Galaxy S24 Ultra',
    'Galaxy A55 5G',
    'Galaxy A35 5G',
    'iPhone 15 Pro Max',
    'iPhone 16 Pro',
    'Redmi Note 13 Pro',
    'Redmi 13C',
    'Vivo V30 5G',
    'Vivo Y28',
    'Realme 12 Pro+ 5G',
    'Realme C67'
  ],
  brand: [
    'Samsung',
    'Apple',
    'Xiaomi',
    'Vivo',
    'Realme',
    'Oppo',
    'OnePlus',
    'Honor',
    'Infinix',
    'Tecno'
  ],
  brandName: [
    'Samsung',
    'Apple',
    'Xiaomi',
    'Vivo',
    'Realme',
    'Oppo',
    'OnePlus'
  ],
  sku: [
    'SAM-S24U-12-512',
    'SAM-A55-8-128',
    'SAM-A35-8-128',
    'IPH-15PM-256',
    'XIA-RN13P-8-256',
    'VIV-V30-12-256',
    'RLM-12P-8-256'
  ],
  ram: ['4GB', '6GB', '8GB', '12GB', '16GB'],
  storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  color: [
    'Midnight Black',
    'Phantom White',
    'Titanium Silver',
    'Titanium Gray',
    'Deep Blue',
    'Emerald Green',
    'Aurora Purple',
    'Sunset Gold'
  ],
  networkRegion: [
    'Official BD (BTRC Approved)',
    'Official Global Variant',
    'Official Indian Variant',
    'Authorized Distributor Warranty'
  ],
  shopName: [
    'City Telecom & Electronics',
    'New Mobile Zone',
    'Prime Gadget Hub',
    'Trust Mobile Gallery',
    'Dhaka Mobile Palace',
    'Chittagong Smart Point',
    'Al-Madina Telecom'
  ],
  ownerName: [
    'Md. Rafiqul Islam',
    'Kamrul Hassan',
    'Tariqul Islam',
    'Abdur Rahim',
    'Nazmul Hossain',
    'Shakil Ahmed'
  ],
  mobile: [
    '01711223344',
    '01819887766',
    '01911445566',
    '01612334455',
    '01715001122',
    '01312345678'
  ],
  area: [
    'Mirpur-10',
    'Mirpur-1',
    'Motijheel',
    'Uttara Sector 3',
    'Uttara Sector 7',
    'Dhanmondi 27',
    'Gulshan-1',
    'Banani',
    'Mohakhali',
    'Chawkbazar',
    'Agrabad',
    'GEC Circle'
  ],
  district: [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh',
    'Comilla',
    'Gazipur',
    'Narayanganj'
  ],
  address: [
    'Shop #12, Ground Floor, Eastern Plaza, Hatirpool, Dhaka',
    'Shop #45, 2nd Floor, Rapa Plaza, Dhanmondi, Dhaka',
    'Level-4, Block-B, Jamuna Future Park, Kuril, Dhaka',
    'Level-5, Bashundhara City Shopping Complex, Panthapath, Dhaka',
    'Shop #08, Shah Ali Plaza, Mirpur-10, Dhaka',
    'Sanmar Ocean City, GEC, Chittagong'
  ],
  companyName: [
    'Excel Technologies Ltd.',
    'Smart Technologies BD Ltd.',
    'Flora Limited',
    'Global Brand Pvt Ltd.',
    'Star Tech & Engineering Ltd.',
    'Ryans Computers'
  ],
  contactPerson: [
    'Mohammad Ali',
    'Mahmudur Rahman',
    'Faruk Hossain',
    'Sayed Ahmed',
    'Tanvir Hasan'
  ],
  returnReason: [
    'Display flickering / Touch screen defect',
    'Dead on Arrival (DOA) - Power not turning on',
    'Network signal drop / SIM reader error',
    'Battery draining fast / Charging port loose',
    'Customer exchanged for higher RAM/storage model',
    'Packaging sealed box damage during courier transit',
    'Camera focusing issue / Lens blur'
  ],
  notes: [
    'Paid in full via Bank Real-Time Transfer.',
    'Immediate courier dispatch via Steadfast Courier.',
    'Replacement unit issued under official BTRC warranty.',
    'Delivered with verified genuine IMEI warranty card.',
    'Special wholesale discount approved by management.'
  ],
  referenceNo: [
    'CHQ-BRAC-',
    'EFT-EBL-',
    'BEFTN-',
    'BKASH-TRX-',
    'NAGAD-TXN-',
    'RTGS-DBBL-'
  ],
  description: [
    'Office Internet & Broadband Bill payment',
    'Showroom Electricity (DESCO) prepaid recharge',
    'Staff lunch and field transport conveyance',
    'Showroom branding & display shelf renovation',
    'Thermal paper roll & invoice printing stationery purchase',
    'Packaging bubble wrap & security seal tape'
  ],
  payee: [
    'DESCO Prepaid',
    'Amber IT Broadband',
    'Steadfast Courier Ltd.',
    'RedX Logistics',
    'Daraz Express Logistics',
    'City Printing Press'
  ],
  reason: [
    'Regular monthly settlement',
    'Discount adjustment credit note',
    'Defective stock return voucher',
    'Inter-warehouse transfer stock reconciliation'
  ],
  condition: [
    'Sealed Box / Brand New Condition',
    'Open Box - Pristine Condition (All Accessories Intact)',
    'Used / Minor Scratches',
    'Hardware Defect / RMA'
  ]
};

// Normalize varied field names to canonical key
export function normalizeHistoryKey(keyOrName: string): string {
  if (!keyOrName) return 'general';
  const clean = keyOrName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (clean.includes('model') || clean.includes('handset')) return 'model';
  if (clean.includes('brand')) return 'brand';
  if (clean.includes('sku')) return 'sku';
  if (clean.includes('ram')) return 'ram';
  if (clean.includes('storage') || clean.includes('rom')) return 'storage';
  if (clean.includes('color')) return 'color';
  if (clean.includes('network') || clean.includes('btrc')) return 'networkRegion';
  if (clean.includes('shop') || clean.includes('outlet')) return 'shopName';
  if (clean.includes('owner') || clean.includes('proprietor')) return 'ownerName';
  if (clean.includes('mobile') || clean.includes('phone') || clean.includes('contact')) return 'mobile';
  if (clean.includes('area') || clean.includes('market')) return 'area';
  if (clean.includes('district') || clean.includes('city')) return 'district';
  if (clean.includes('address')) return 'address';
  if (clean.includes('supplier') || clean.includes('company')) return 'companyName';
  if (clean.includes('reason')) return 'returnReason';
  if (clean.includes('note') || clean.includes('remark')) return 'notes';
  if (clean.includes('ref') || clean.includes('transaction')) return 'referenceNo';
  if (clean.includes('desc') || clean.includes('details')) return 'description';
  if (clean.includes('payee') || clean.includes('beneficiary')) return 'payee';
  if (clean.includes('condition')) return 'condition';

  return keyOrName;
}

// Load all saved history from localStorage
function loadHistoryStore(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save history store to localStorage
function saveHistoryStore(store: Record<string, string[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

/**
 * Get suggestions for a specific field key and optional query.
 */
export function getFieldHistory(fieldKey: string, query: string = ''): string[] {
  const normKey = normalizeHistoryKey(fieldKey);
  const store = loadHistoryStore();

  const userHistory = store[normKey] || [];
  const seedHistory = SEED_HISTORY[normKey] || [];

  // Combine user history first, then domain seeds, unique
  const combined = Array.from(new Set([...userHistory, ...seedHistory]));

  const q = query.trim().toLowerCase();
  if (!q) {
    return combined.slice(0, MAX_HISTORY_PER_FIELD);
  }

  return combined
    .filter(item => item.toLowerCase().includes(q))
    .slice(0, MAX_HISTORY_PER_FIELD);
}

/**
 * Add a value to field history.
 */
export function recordFieldHistory(fieldKey: string, value: string | number | undefined | null): void {
  if (value === undefined || value === null) return;
  const str = String(value).trim();
  if (!str || str.length < 2) return;

  const normKey = normalizeHistoryKey(fieldKey);
  const store = loadHistoryStore();
  const current = store[normKey] || SEED_HISTORY[normKey] || [];

  // Move value to front, remove duplicates
  const updated = [str, ...current.filter(item => item.toLowerCase() !== str.toLowerCase())].slice(
    0,
    MAX_HISTORY_PER_FIELD
  );

  store[normKey] = updated;
  saveHistoryStore(store);
}

/**
 * Record multiple fields from a form data record.
 */
export function recordFormHistory(record: Record<string, any>): void {
  if (!record || typeof record !== 'object') return;
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' || typeof val === 'number') {
      recordFieldHistory(key, val);
    }
  }
}

/**
 * Remove a single item from a field's history.
 */
export function removeFieldHistoryItem(fieldKey: string, value: string): void {
  const normKey = normalizeHistoryKey(fieldKey);
  const store = loadHistoryStore();
  if (!store[normKey]) return;

  store[normKey] = store[normKey].filter(item => item !== value);
  saveHistoryStore(store);
}

/**
 * Clear all history for a specific field key.
 */
export function clearFieldHistory(fieldKey: string): void {
  const normKey = normalizeHistoryKey(fieldKey);
  const store = loadHistoryStore();
  delete store[normKey];
  saveHistoryStore(store);
}
