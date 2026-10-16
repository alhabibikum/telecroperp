/**
 * Seed ফাইলে duplicate SKU fix করার স্ক্রিপ্ট
 * প্রতিটি variant-এর SKU-তে variant ID suffix যোগ করে unique করা হবে
 */

const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'supabase_firoza_seed.sql');
let content = fs.readFileSync(seedPath, 'utf8');

// প্রতিটি product_variants INSERT খুঁজুন এবং SKU fix করুন
// Format: INSERT INTO product_variants (id, product_id, sku, ...) VALUES (
//   'var-XX-1', 'prod-XX', 'SKU-VALUE', ...
const skuTracker = {};

// Regex: product_variants VALUES এর পরে 'var-id', 'prod-id', 'SKU' pattern ধরুন
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // product_variants INSERT এর VALUES line ধরুন
  // এই line এ থাকবে: 'var-XX-X', 'prod-XX', 'SKU-VALUE', ...
  const varMatch = line.match(/^\s+'(var-\d+-\d+)',\s+'(prod-\d+)',\s+'([^']+)',/);
  
  if (varMatch) {
    const varId = varMatch[1];
    const prodId = varMatch[2];
    const sku = varMatch[3];
    
    if (!skuTracker[sku]) {
      skuTracker[sku] = 0;
    }
    skuTracker[sku]++;
    
    if (skuTracker[sku] > 1) {
      // Duplicate SKU - suffix যোগ করুন
      const newSku = sku + '-' + varId.replace('var-', 'V').replace(/-\d+$/, '');
      const fixedLine = line.replace(`'${sku}'`, `'${newSku}'`);
      fixedLines.push(fixedLine);
      console.log(`Fixed: '${sku}' → '${newSku}' (${varId})`);
    } else {
      fixedLines.push(line);
    }
  } else {
    fixedLines.push(line);
  }
}

const fixedContent = fixedLines.join('\n');
fs.writeFileSync(seedPath, fixedContent, 'utf8');

// Verify করুন
const dupCount = Object.entries(skuTracker).filter(([k, v]) => v > 1);
console.log('\n✅ Fix সম্পন্ন!');
console.log('Original duplicates found:', dupCount.length);
console.log('Duplicate SKUs that were fixed:', dupCount.map(([k, v]) => `${k} (${v}x)`).join(', '));
