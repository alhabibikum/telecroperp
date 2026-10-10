/**
 * supabase_schema.sql এ duplicate SKU fix করার স্ক্রিপ্ট
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
let content = fs.readFileSync(schemaPath, 'utf8');

const skuTracker = {};
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const varMatch = line.match(/^\s+'(var-\d+-\d+)',\s+'(prod-\d+)',\s+'([^']+)',/);
  
  if (varMatch) {
    const varId = varMatch[1];
    const prodId = varMatch[2];
    const sku = varMatch[3];
    
    if (!skuTracker[sku]) skuTracker[sku] = 0;
    skuTracker[sku]++;
    
    if (skuTracker[sku] > 1) {
      const newSku = sku + '-' + varId.replace('var-', 'V').replace(/-\d+$/, '');
      const fixedLine = line.replace(`'${sku}'`, `'${newSku}'`);
      fixedLines.push(fixedLine);
      console.log(`Fixed schema: '${sku}' → '${newSku}' (${varId})`);
    } else {
      fixedLines.push(line);
    }
  } else {
    fixedLines.push(line);
  }
}

fs.writeFileSync(schemaPath, fixedLines.join('\n'), 'utf8');

const dupCount = Object.entries(skuTracker).filter(([k, v]) => v > 1);
console.log('\n✅ schema.sql fix সম্পন্ন!');
console.log('Fixed duplicates:', dupCount.length, 'types');
