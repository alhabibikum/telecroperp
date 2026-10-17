const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
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

console.log('=== COMPANY INFO ===');
const company = parseCSV(path.join(exportDir, '01_Company_Info.csv'));
console.log(company);

console.log('\n=== LEDGERS OVERVIEW ===');
const ledgers = parseCSV(path.join(exportDir, '02_Ledger_Party.csv'));
console.log('Total Ledgers:', ledgers.length);
const groups = {};
ledgers.forEach(l => {
  const g = l.LEDGER_PARENT_GROUP || 'Unknown';
  groups[g] = (groups[g] || 0) + 1;
});
console.log('Groups breakdown:', groups);

console.log('\n=== SUNDRY DEBTORS (Customers) SAMPLE ===');
const debtors = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sundry Debtors');
console.log('Debtors count:', debtors.length);
console.log('First 5 debtors:', debtors.slice(0, 5).map(d => ({
  name: d.LEDGER_NAME,
  mobile: d.LEDGER_MOBILE,
  address: d.LEDGER_ADDRESS1,
  city: d.LEDGER_CITY,
  closing: d.LEDGER_CLOSING_BALANCE,
  nature: d.LEDGER_NATURE
})));

console.log('\n=== SUNDRY CREDITORS (Suppliers) ===');
const creditors = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sundry Creditors');
console.log('Creditors count:', creditors.length);
console.log(creditors.map(c => ({
  name: c.LEDGER_NAME,
  mobile: c.LEDGER_MOBILE,
  closing: c.LEDGER_CLOSING_BALANCE,
  nature: c.LEDGER_NATURE
})));

console.log('\n=== SALES REPRESENTATIVES ===');
const reps = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Sales Representative');
console.log('Reps count:', reps.length);
console.log(reps.map(r => ({
  name: r.LEDGER_NAME,
  closing: r.LEDGER_CLOSING_BALANCE
})));

console.log('\n=== BANK & CASH ===');
const bank = ledgers.filter(l => l.LEDGER_PARENT_GROUP === 'Bank Accounts' || l.LEDGER_PARENT_GROUP === 'Cash in Hand');
console.log(bank.map(b => ({
  name: b.LEDGER_NAME,
  group: b.LEDGER_PARENT_GROUP,
  closing: b.LEDGER_CLOSING_BALANCE
})));

console.log('\n=== STOCK ITEMS ===');
const stockItems = parseCSV(path.join(exportDir, '09_Stock_Items.csv'));
console.log('Stock items count:', stockItems.length);
console.log('First 10 stock items:', stockItems.slice(0, 10).map(s => ({
  name: s.STOCKITEM_NAME,
  group: s.STOCKGROUP_NAME,
  openBal: s.STOCKITEM_OPENING_BALANCE,
  openRate: s.STOCKITEM_OPENING_RATE,
  closeBal: s.STOCKITEM_CLOSING_BALANCE
})));

console.log('\n=== BILL TRANSACTIONS SAMPLE (for price lookup) ===');
const bills = parseCSV(path.join(exportDir, '05_Bill_Transactions.csv'));
console.log('Bill transactions count:', bills.length);
// Find recent price for stock items
const itemPrices = {};
bills.forEach(b => {
  const item = b.STOCKITEM_NAME;
  const rate = parseFloat(b.BILL_RATE || '0');
  if (item && rate > 0) {
    if (!itemPrices[item]) {
      itemPrices[item] = rate;
    }
  }
});
console.log('Stock items with found rates from bills:', Object.keys(itemPrices).length);
console.log('Sample item rates:', Object.entries(itemPrices).slice(0, 10));
