/**
 * SUPABASE SEED RUNNER SCRIPT
 * ============================
 * এই স্ক্রিপ্টটি supabase_schema.sql এবং supabase_firoza_seed.sql ফাইল দুটি
 * Supabase PostgreSQL ডাটাবেজে execute করবে।
 * 
 * রান করতে: node scripts/run_supabase_seed.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
// .env ফাইল থেকে পড়ুন
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const value = trimmed.substring(eqIdx + 1).trim();
          env[key] = value;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Service role key - আপনার Supabase Dashboard > Settings > API থেকে পাবেন
// ANON key দিয়ে SQL execute করা যায় না, service_role key লাগবে
// কিন্তু আমরা REST API এর বদলে /rest/v1/rpc বা SQL Editor API ব্যবহার করব
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL পাওয়া যায়নি .env ফাইলে');
  process.exit(1);
}

console.log('🚀 FIROZA ENTERPRISE - Supabase Data Seeder');
console.log('============================================');
console.log(`📡 Supabase URL: ${SUPABASE_URL}`);

// SQL কে ছোট ছোট ব্যাচে ভাগ করার ফাংশন
function splitSqlStatements(sql) {
  // Statement গুলো ; দিয়ে শেষ হয়, সেগুলো আলাদা করুন
  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDollarQuote = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    
    if (char === "'" && !inDollarQuote) {
      inSingleQuote = !inSingleQuote;
    }
    
    current += char;
    
    if (char === ';' && !inSingleQuote && !inDollarQuote) {
      const stmt = current.trim();
      if (stmt.length > 1) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  return statements.filter(s => s.length > 0 && s !== ';');
}

// Supabase REST API দিয়ে SQL execute করার ফাংশন
function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(SUPABASE_URL);
    const hostname = urlObj.hostname;
    
    const key = SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    
    // Supabase SQL endpoint
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Direct PostgreSQL connection string বের করার ফাংশন
function getDbConnectionInfo() {
  const urlObj = new URL(SUPABASE_URL);
  const projectRef = urlObj.hostname.split('.')[0];
  return {
    projectRef,
    dbHost: `db.${urlObj.hostname}`,
    dbPort: 5432,
    dbName: 'postgres',
    dbUser: 'postgres',
    connectionString: `postgresql://postgres:[YOUR-PASSWORD]@db.${urlObj.hostname}:5432/postgres`
  };
}

// মূল ফাংশন - Supabase Dashboard SQL Editor-এর জন্য নির্দেশনা দেখাবে
async function main() {
  const dbInfo = getDbConnectionInfo();
  
  console.log('\n📋 আপনার Supabase Project Information:');
  console.log('========================================');
  console.log(`🔗 Project URL: ${SUPABASE_URL}`);
  console.log(`🔑 Project Ref: ${dbInfo.projectRef}`);
  console.log(`🗄️  DB Host: ${dbInfo.dbHost}`);
  
  console.log('\n⚠️  IMPORTANT: Supabase-এ ডাটা যুক্ত করার পদ্ধতি:');
  console.log('====================================================');
  console.log('\n🎯 পদ্ধতি ১: Supabase Dashboard SQL Editor (সবচেয়ে সহজ)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`1. এই লিংকে যান: https://supabase.com/dashboard/project/${dbInfo.projectRef}/sql/new`);
  console.log('2. প্রথমে supabase_schema.sql ফাইলের সম্পূর্ণ কন্টেন্ট paste করুন এবং RUN করুন');
  console.log('3. তারপর supabase_firoza_seed.sql ফাইলের সম্পূর্ণ কন্টেন্ট paste করুন এবং RUN করুন');
  
  // SQL ফাইলগুলোর size চেক করুন
  const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
  const seedPath = path.join(__dirname, '..', 'supabase_firoza_seed.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schemaSize = fs.statSync(schemaPath).size;
    console.log(`\n📄 supabase_schema.sql: ${(schemaSize / 1024).toFixed(1)} KB`);
  }
  
  if (fs.existsSync(seedPath)) {
    const seedSize = fs.statSync(seedPath).size;
    console.log(`📄 supabase_firoza_seed.sql: ${(seedSize / 1024).toFixed(1)} KB`);
  }

  console.log('\n🎯 পদ্ধতি ২: psql CLI দিয়ে (যদি PostgreSQL installed থাকে)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`psql "postgresql://postgres.${dbInfo.projectRef}:[DB-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f supabase_schema.sql`);
  console.log(`psql "postgresql://postgres.${dbInfo.projectRef}:[DB-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f supabase_firoza_seed.sql`);
  
  console.log('\n🎯 পদ্ধতি ৩: Supabase CLI দিয়ে');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.${dbInfo.projectRef}.supabase.co:5432/postgres"`);

  // Validate করুন SQL ফাইলগুলো ঠিক আছে কিনা
  console.log('\n🔍 SQL ফাইল Validation:');
  console.log('========================');
  
  if (fs.existsSync(seedPath)) {
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    const lines = seedContent.split('\n').length;
    const insertCount = (seedContent.match(/^INSERT INTO/gm) || []).length;
    const tables = [...new Set((seedContent.match(/INSERT INTO (\w+)/g) || []).map(m => m.replace('INSERT INTO ', '')))];
    
    console.log(`✅ supabase_firoza_seed.sql:`);
    console.log(`   - মোট লাইন: ${lines}`);
    console.log(`   - মোট INSERT স্টেটমেন্ট: ${insertCount}`);
    console.log(`   - ব্যবহৃত টেবিল: ${tables.join(', ')}`);
  }
  
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const createCount = (schemaContent.match(/^CREATE TABLE/gm) || []).length;
    const tableNames = (schemaContent.match(/CREATE TABLE (\w+)/g) || []).map(m => m.replace('CREATE TABLE ', ''));
    
    console.log(`\n✅ supabase_schema.sql:`);
    console.log(`   - CREATE TABLE স্টেটমেন্ট: ${createCount}`);
    console.log(`   - টেবিল সমূহ: ${tableNames.join(', ')}`);
  }

  // ডাটা সারসংক্ষেপ
  if (fs.existsSync(seedPath)) {
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    const customerCount = (seedContent.match(/INSERT INTO customers/g) || []).length;
    const productCount = (seedContent.match(/INSERT INTO products/g) || []).length;
    const variantCount = (seedContent.match(/INSERT INTO product_variants/g) || []).length;
    const imeiCount = (seedContent.match(/INSERT INTO imeis/g) || []).length;
    const supplierCount = (seedContent.match(/INSERT INTO suppliers/g) || []).length;
    const salesmanCount = (seedContent.match(/INSERT INTO salesmen/g) || []).length;
    const brandCount = (seedContent.match(/INSERT INTO brands/g) || []).length;
    
    console.log('\n📊 Seed ডাটার সারসংক্ষেপ (supabase_firoza_seed.sql):');
    console.log('======================================================');
    console.log(`  👥 Customers (ডিলার/গ্রাহক): ${customerCount} জন`);
    console.log(`  🏪 Suppliers (সরবরাহকারী): ${supplierCount} জন`);
    console.log(`  👨‍💼 Salesmen (সেলসম্যান): ${salesmanCount} জন`);
    console.log(`  📱 Products (পণ্য মডেল): ${productCount} টি`);
    console.log(`  🎨 Product Variants (ভেরিয়েন্ট): ${variantCount} টি`);
    console.log(`  📋 IMEI Records: ${imeiCount} টি`);
    console.log(`  🏷️  Brands (ব্র্যান্ড): ${brandCount} টি`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('⚡ দ্রুত সমাধান:');
  console.log('='.repeat(60));
  console.log(`\n👉 এখনই এই লিংকে যান এবং SQL Editor খুলুন:`);
  console.log(`   https://supabase.com/dashboard/project/${dbInfo.projectRef}/sql/new`);
  console.log('\n📌 স্টেপ ১: supabase_schema.sql এর সম্পূর্ণ কন্টেন্ট copy করে paste করুন → RUN করুন');
  console.log('📌 স্টেপ ২: supabase_firoza_seed.sql এর সম্পূর্ণ কন্টেন্ট copy করে paste করুন → RUN করুন');
  console.log('\n✅ এরপর সফটওয়্যার রিফ্রেশ করলেই সমস্ত ডাটা দেখা যাবে!');
}

main().catch(console.error);
