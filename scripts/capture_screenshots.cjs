const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgeExecutable = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = path.resolve('public/screenshots');

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const views = [
  { id: 'dashboard', filename: '01_dashboard.png' },
  { id: 'purchase', filename: '02_purchase.png' },
  { id: 'wholesale-sales', filename: '03_wholesale_sales.png' },
  { id: 'retail-pos', filename: '04_retail_pos.png' },
  { id: 'due-collection', filename: '05_due_collection.png' },
  { id: 'emi-installment', filename: '06_emi_installment.png' },
  { id: 'stock-transfers', filename: '07_stock_transfers.png' },
  { id: 'day-closing', filename: '08_day_closing.png' },
  { id: 'inventory', filename: '09_inventory.png' },
  { id: 'settings', filename: '10_settings.png' }
];

console.log('Capturing real screenshots from TeleCorp ERP (http://localhost:3000)...');

for (const v of views) {
  const targetFile = path.join(screenshotDir, v.filename);
  const url = `http://localhost:3000/?view=${v.id}`;
  console.log(`Capturing view [${v.id}] -> ${v.filename}...`);
  try {
    execSync(`"${edgeExecutable}" --headless --disable-gpu --window-size=1280,820 --hide-scrollbars --screenshot="${targetFile}" "${url}"`, {
      stdio: 'inherit'
    });
    if (fs.existsSync(targetFile)) {
      const size = (fs.statSync(targetFile).size / 1024).toFixed(1);
      console.log(`✅ [${v.id}] Captured: ${size} KB`);
    }
  } catch (err) {
    console.error(`❌ Failed capturing ${v.id}:`, err);
  }
}

console.log('Screenshot capture process finished!');
