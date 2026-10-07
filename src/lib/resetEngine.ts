import { getSupabaseClient } from './supabase';
import { clearSyncQueue, mapToSupabasePayload } from './syncEngine';
import {
  initialBrands,
  initialProducts,
  initialIMEIs,
  initialWarehouses,
  initialSuppliers,
  initialCustomers,
  initialSalesInvoices,
  initialPurchases,
  initialStockTransfers,
  initialCustomerReturns,
  initialSalesmen,
  initialBankAccounts,
  initialCashTransactions,
  initialExpenses,
  initialExpenseCategories,
  initialCOA,
  initialJournalEntries,
  initialAlerts,
  initialAuditLogs,
  initialSettings,
  initialSalesmanVisits,
  initialCustomerFollowUps,
  initialDayClosings,
  initialPhoneExchanges,
  initialBankStatements,
  initialWarrantyClaims,
  initialBrandIncentives,
  initialDeliveryChallans,
  initialPriceDropClaims,
  initialSmsLogs,
  initialMoneyReceipts,
  initialEMIPlans,
  initialCommissionDisbursements
} from '../data/initialData';
import { demoUsers } from '../context/ERPContext';
import { AuthUser } from '../types/erp';

// Transaction tables in foreign-key safe deletion order (children first)
export const TRANSACTION_TABLES = [
  'customer_follow_ups',
  'salesman_visits',
  'phone_exchange_records',
  'price_drop_claims',
  'delivery_challans',
  'brand_incentive_schemes',
  'warranty_claims',
  'supplier_returns',
  'customer_returns',
  'stock_transfers',
  'sales_invoices',
  'purchase_invoices',
  'emi_plans',
  'commission_disbursements',
  'money_receipts',
  'bank_statements',
  'bank_transactions',
  'cash_transactions',
  'expenses',
  'day_closings',
  'journal_entries',
  'sms_logs'
];

// Master tables in foreign-key safe deletion order
export const MASTER_TABLES = [
  'imeis',
  'product_variants',
  'products',
  'brands',
  'chart_of_accounts',
  'bank_accounts',
  'expense_categories',
  'customers',
  'suppliers',
  'salesmen',
  'warehouses',
  'system_alerts',
  'backup_snapshots',
  'audit_logs'
];

/**
 * Purge only transactional rows from Supabase cloud database.
 * Preserves products, brands, warehouses, suppliers, customers, salesmen, bank accounts.
 */
export const purgeCloudTransactions = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase ক্লাউড ডেটাবেস কনফিগার করা নেই বা অফলাইন।' };
  }

  try {
    // 1. Delete all transactional tables in FK-safe order
    for (const table of TRANSACTION_TABLES) {
      const { error } = await supabase.from(table).delete().neq('id', '_never_matches_dummy_');
      if (error) {
        console.warn(`Warning during purging table ${table}:`, error.message);
      }
    }

    // 2. Reset all IMEIs in Supabase to 'In Stock'
    await supabase.from('imeis').update({
      status: 'In Stock',
      customer_id: null,
      sold_date: null
    }).neq('id', '_never_matches_dummy_');

    // 3. Reset Customer and Supplier dues to 0
    await supabase.from('customers').update({ current_due: 0 }).neq('id', '_never_matches_dummy_');
    await supabase.from('suppliers').update({ current_due: 0 }).neq('id', '_never_matches_dummy_');

    // 4. Reset Bank Accounts and Cash In Hand balances to 0
    await supabase.from('bank_accounts').update({ current_balance: 0, opening_balance: 0 }).neq('id', '_never_matches_dummy_');
    await supabase.from('chart_of_accounts').update({ balance: 0 }).in('code', ['1000', '1010']);

    return {
      success: true,
      message: 'সুপাবেস ক্লাউডের সমস্ত সেলস, পারচেজ ও ট্রানজ্যাকশন সফলভাবে মুছে ফেলা হয়েছে।'
    };
  } catch (err: any) {
    console.error('Failed to purge cloud transactions:', err);
    return { success: false, message: err.message || 'ক্লাউড ট্রানজ্যাকশন রিসেট ব্যর্থ হয়েছে।' };
  }
};

/**
 * Wipe all data from Supabase cloud database completely in FK-safe order.
 */
export const wipeAllCloudData = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase ক্লাউড ডেটাবেস কনফিগার করা নেই বা অফলাইন।' };
  }

  try {
    // 1. Wipe transaction tables first
    for (const table of TRANSACTION_TABLES) {
      await supabase.from(table).delete().neq('id', '_never_matches_dummy_');
    }

    // 2. Wipe master data tables in FK-safe order
    for (const table of MASTER_TABLES) {
      await supabase.from(table).delete().neq('id', '_never_matches_dummy_');
    }

    // 3. Wipe non-admin users from app_users
    await supabase.from('app_users').delete().not('id', 'in', '("user-admin","8d510069-b154-440a-aa3e-0999a9c354e1")');

    return {
      success: true,
      message: 'সুপাবেস ক্লাউড সম্পূর্ণ পরিষ্কার (Wipe) করা হয়েছে।'
    };
  } catch (err: any) {
    console.error('Failed to wipe all cloud data:', err);
    return { success: false, message: err.message || 'ক্লাউড ডেটাবেস ওয়াইপ ব্যর্থ হয়েছে।' };
  }
};

/**
 * Seed standard demo dataset into Supabase cloud database
 */
export const seedCloudDemoData = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase ক্লাউড ডেটাবেস কনফিগার করা নেই বা অফলাইন।' };
  }

  try {
    // First wipe cleanly
    await wipeAllCloudData();

    // Helper to batch insert
    const insertBatch = async (table: string, items: any[]) => {
      const payloads = items.map(item => mapToSupabasePayload(table, item));
      for (let i = 0; i < payloads.length; i += 40) {
        const chunk = payloads.slice(i, i + 40);
        await supabase.from(table).upsert(chunk, { onConflict: 'id' });
      }
    };

    // 1. Settings & Users
    await supabase.from('system_settings').upsert(
      mapToSupabasePayload('system_settings', initialSettings),
      { onConflict: 'id' }
    );

    const userPayloads = demoUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      password: u.password,
      password_hash: u.password,
      phone: u.phone,
      department: u.department,
      branch_name: u.branchName,
      avatar: u.avatar,
      status: u.status
    }));
    await supabase.from('app_users').upsert(userPayloads, { onConflict: 'id' });

    // 2. Masters (Brands, Warehouses, Suppliers, Customers, Salesmen, Accounts)
    await insertBatch('brands', initialBrands);
    await insertBatch('warehouses', initialWarehouses);
    await insertBatch('suppliers', initialSuppliers);
    await insertBatch('customers', initialCustomers);
    await insertBatch('salesmen', initialSalesmen);
    await insertBatch('bank_accounts', initialBankAccounts);
    await insertBatch('expense_categories', initialExpenseCategories);
    await insertBatch('chart_of_accounts', initialCOA);

    // 3. Products & Variants
    await insertBatch('products', initialProducts);
    const variants = initialProducts.flatMap(p =>
      (p.variants || []).map(v => ({
        id: v.id,
        product_id: p.id,
        sku: v.sku,
        ram: v.ram,
        storage: v.storage,
        color: v.color,
        purchase_price: v.purchasePrice ?? 0,
        dealer_price: v.dealerPrice ?? 0,
        wholesale_price: v.wholesalePrice ?? v.dealerPrice ?? 0,
        retail_price: v.retailPrice ?? 0,
        min_selling_price: v.minSellingPrice ?? v.dealerPrice ?? 0,
        max_discount: v.maxDiscount ?? 500,
        reorder_level: v.reorderLevel ?? 5,
        current_stock: v.currentStock ?? 0
      }))
    );
    if (variants.length > 0) {
      await supabase.from('product_variants').upsert(variants, { onConflict: 'id' });
    }

    // 4. IMEIs
    await insertBatch('imeis', initialIMEIs);

    // 5. Transactions
    await insertBatch('sales_invoices', initialSalesInvoices);
    await insertBatch('purchase_invoices', initialPurchases);
    await insertBatch('stock_transfers', initialStockTransfers);
    await insertBatch('customer_returns', initialCustomerReturns);
    await insertBatch('cash_transactions', initialCashTransactions);
    await insertBatch('expenses', initialExpenses);
    await insertBatch('journal_entries', initialJournalEntries);
    await insertBatch('system_alerts', initialAlerts);
    await insertBatch('day_closings', initialDayClosings);
    await insertBatch('salesman_visits', initialSalesmanVisits);
    await insertBatch('customer_follow_ups', initialCustomerFollowUps);
    await insertBatch('phone_exchange_records', initialPhoneExchanges);
    await insertBatch('bank_statements', initialBankStatements);
    await insertBatch('warranty_claims', initialWarrantyClaims);
    await insertBatch('brand_incentive_schemes', initialBrandIncentives);
    await insertBatch('delivery_challans', initialDeliveryChallans);
    await insertBatch('price_drop_claims', initialPriceDropClaims);
    await insertBatch('sms_logs', initialSmsLogs);
    await insertBatch('money_receipts', initialMoneyReceipts);
    await insertBatch('emi_plans', initialEMIPlans);
    await insertBatch('commission_disbursements', initialCommissionDisbursements);

    return {
      success: true,
      message: 'সুপাবেস ক্লাউডে স্ট্যান্ডার্ড ডেমো ডাটাবেস সফলভাবে রিস্টোর হয়েছে।'
    };
  } catch (err: any) {
    console.error('Failed to seed cloud demo data:', err);
    return { success: false, message: err.message || 'ক্লাউড ডেমো ডাটা সিডিং ব্যর্থ হয়েছে।' };
  }
};

/**
 * Clean Fresh Start (Zero-data production slate) in Supabase cloud database
 */
export const seedCloudCleanSlate = async (adminUser?: AuthUser): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase ক্লাউড ডেটাবেস কনফিগার করা নেই বা অফলাইন।' };
  }

  try {
    // 1. Wipe all data completely
    await wipeAllCloudData();

    // 2. Seed only system settings
    await supabase.from('system_settings').upsert(
      mapToSupabasePayload('system_settings', initialSettings),
      { onConflict: 'id' }
    );

    // 3. Seed Super Admin user
    const admin = adminUser || demoUsers[0];
    await supabase.from('app_users').upsert({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'Super Admin',
      password: admin.password || 'M#112233@a',
      password_hash: admin.password || 'admin',
      phone: admin.phone || '+880 1711-002233',
      department: 'Executive Board',
      branch_name: 'Headquarters (Main)',
      avatar: admin.avatar || '👨‍💼',
      status: 'Active'
    }, { onConflict: 'id' });

    // 4. Seed 1 Primary Central Warehouse
    const mainWh = initialWarehouses[0];
    await supabase.from('warehouses').upsert({
      id: mainWh.id,
      code: mainWh.code,
      name: mainWh.name,
      type: 'Central Warehouse',
      address: mainWh.address,
      city: mainWh.city,
      manager_name: admin.name,
      contact_number: admin.phone || mainWh.contactNumber,
      status: 'Active'
    }, { onConflict: 'id' });

    // 5. Seed 1 Primary Cash / Bank Account with 0 balance
    const mainBank = initialBankAccounts[0];
    await supabase.from('bank_accounts').upsert({
      id: mainBank.id,
      bank_name: mainBank.bankName,
      branch: mainBank.branch,
      account_name: mainBank.accountName,
      account_number: mainBank.accountNumber,
      account_type: mainBank.accountType,
      opening_balance: 0,
      current_balance: 0,
      status: 'Active'
    }, { onConflict: 'id' });

    // 6. Seed default Expense Categories and Chart of Accounts for standard bookkeeping
    const expPayloads = initialExpenseCategories.map(ec => mapToSupabasePayload('expense_categories', ec));
    await supabase.from('expense_categories').upsert(expPayloads, { onConflict: 'id' });

    const coaPayloads = initialCOA.map(coa => mapToSupabasePayload('chart_of_accounts', coa));
    await supabase.from('chart_of_accounts').upsert(coaPayloads, { onConflict: 'id' });

    return {
      success: true,
      message: 'সুপাবেস ক্লাউডে সম্পূর্ণ ফ্রেশ ক্লিন প্রোডাকশন ডাটাবেস তৈরি হয়েছে।'
    };
  } catch (err: any) {
    console.error('Failed to seed cloud clean slate:', err);
    return { success: false, message: err.message || 'ক্লাউড ক্লিন স্লেট প্রস্তুতিতে ত্রুটি।' };
  }
};
