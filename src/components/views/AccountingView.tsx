import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  BookOpen,
  FileSpreadsheet,
  Layers,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileText,
  Printer,
  PlusCircle,
  Calendar,
  Search,
  Filter,
  X,
  ArrowRight,
  Eye,
  Trash2
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { AccountCOA, JournalEntry, JournalLine } from '../../types/erp';
import { useToast } from '../common/ToastNotificationSystem';

const coaEditFields: FieldDef[] = [
  { key: 'name', label: 'Account Name', required: true },
  { key: 'type', label: 'Category', type: 'select', options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] },
  { key: 'nature', label: 'Normal Balance', type: 'select', options: ['Debit', 'Credit'] },
  { key: 'description', label: 'Description', type: 'textarea' }
];

const coaAddFields: FieldDef[] = [
  { key: 'code', label: 'Account Code (e.g. 1060)', required: true },
  ...coaEditFields,
  { key: 'balance', label: 'Opening Balance (৳)', type: 'number' }
];

export const AccountingView: React.FC = () => {
  const {
    chartOfAccounts,
    journalEntries,
    salesInvoices,
    purchaseInvoices,
    customerReturns,
    commissionDisbursements,
    expenses,
    bankAccounts,
    cashTransactions,
    customers,
    suppliers,
    imeis,
    addAccount,
    updateAccount,
    deleteAccount,
    createJournalEntry
  } = useERP();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'pl' | 'bs' | 'tb' | 'journal' | 'coa'>('pl');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCOA | null>(null);

  // Date period filter
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this_month' | 'this_year'>('all');

  // Ledger Drilldown State
  const [drilldownAccount, setDrilldownAccount] = useState<AccountCOA | null>(null);

  // Manual Journal Voucher Modal State
  const [showAddJvModal, setShowAddJvModal] = useState(false);
  const [jvDate, setJvDate] = useState(new Date().toISOString().split('T')[0]);
  const [jvRef, setJvRef] = useState('');
  const [jvDescription, setJvDescription] = useState('');
  const [jvLines, setJvLines] = useState<Array<{ accountCode: string; memo: string; debit: number; credit: number }>>([
    { accountCode: chartOfAccounts[0]?.code || '1000', memo: '', debit: 0, credit: 0 },
    { accountCode: chartOfAccounts[1]?.code || '6000', memo: '', debit: 0, credit: 0 }
  ]);
  const [jvError, setJvError] = useState<string | null>(null);

  // Period filtering helper
  const isDateInPeriod = (dateStr?: string) => {
    if (!dateStr) return true;
    if (periodFilter === 'all') return true;
    const today = new Date().toISOString().split('T')[0];
    if (periodFilter === 'today') return dateStr.startsWith(today);
    if (periodFilter === 'this_month') return dateStr.startsWith(today.slice(0, 7));
    if (periodFilter === 'this_year') return dateStr.startsWith(today.slice(0, 4));
    return true;
  };

  // Filtered transactions for P&L
  const filteredSalesInvoices = useMemo(() => salesInvoices.filter(i => isDateInPeriod(i.invoiceDate)), [salesInvoices, periodFilter]);
  const filteredCustomerReturns = useMemo(() => customerReturns.filter(r => isDateInPeriod(r.returnDate)), [customerReturns, periodFilter]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInPeriod(e.date)), [expenses, periodFilter]);
  const filteredCommissions = useMemo(() => commissionDisbursements.filter(c => isDateInPeriod(c.date || c.paidAt)), [commissionDisbursements, periodFilter]);

  // Real-time P&L calculation
  const totalGrossSales = filteredSalesInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalSalesReturns = filteredCustomerReturns.reduce((acc, r) => acc + r.refundOrCreditAmount, 0);
  const netSalesRevenue = Math.max(0, totalGrossSales - totalSalesReturns);

  const totalCOGS = filteredSalesInvoices.reduce((acc, inv) => {
    return acc + inv.items.reduce((s, it) => s + (it.unitCost * it.quantity), 0);
  }, 0);

  const grossProfit = Math.max(0, netSalesRevenue - totalCOGS);
  const grossMarginPercent = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100).toFixed(1) : '0';

  // Dynamic Salesman Commission calculation
  const totalSalesmanCommission =
    filteredCommissions.filter(d => d.status === 'Paid').reduce((s, d) => s + d.netPayable, 0) ||
    filteredSalesInvoices.reduce((s, inv) => s + (inv.commissionEarned || 0), 0) ||
    (chartOfAccounts.find(a => a.code === '6050')?.balance ?? 0);

  const totalOperatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0) + totalSalesmanCommission;
  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = netSalesRevenue > 0 ? ((netOperatingProfit / netSalesRevenue) * 100).toFixed(1) : '0';

  // Dynamic Balance Sheet numbers (Single Source of Truth)
  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const inventoryValuation = inStockImeis.reduce((acc, i) => acc + i.purchaseCost, 0);
  const accountsReceivable = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const bankBalances = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);

  const openingVaultCash = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0;
  const totalCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const cashInHand = Math.max(0, openingVaultCash + totalCashIn - totalCashOut);

  const totalCurrentAssets = inventoryValuation + accountsReceivable + bankBalances + cashInHand;

  const accountsPayable = suppliers.reduce((acc, s) => acc + s.currentDue, 0);
  const netVatPayable = salesInvoices.reduce((acc, i) => acc + (i.vatTotal || 0), 0) - purchaseInvoices.reduce((acc, p) => acc + (p.vatTotal || 0), 0);
  const accruedVat = netVatPayable > 0 ? netVatPayable : (chartOfAccounts.find(a => a.code === '2050')?.balance ?? 0);
  const totalLiabilities = accountsPayable + accruedVat;

  const ownerCapital = chartOfAccounts.find(a => a.code === '3000')?.balance ?? 0;
  const priorRetainedEarnings = chartOfAccounts.find(a => a.code === '3050')?.balance ?? 0;
  const ownerDrawings = chartOfAccounts.find(a => a.code === '3020')?.balance ?? 0;
  const retainedEarnings = priorRetainedEarnings + netOperatingProfit - ownerDrawings;
  const totalEquity = ownerCapital + retainedEarnings;

  // Manual JV line helpers
  const handleAddJvLine = () => {
    setJvLines(prev => [...prev, { accountCode: chartOfAccounts[0]?.code || '', memo: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveJvLine = (index: number) => {
    if (jvLines.length <= 2) return;
    setJvLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateJvLine = (index: number, field: string, val: any) => {
    setJvLines(prev => prev.map((l, i) => i === index ? { ...l, [field]: val } : l));
  };

  const totalJvDebit = jvLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalJvCredit = jvLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isJvBalanced = Math.abs(totalJvDebit - totalJvCredit) < 0.01 && totalJvDebit > 0;

  const handleSaveJv = (e: React.FormEvent) => {
    e.preventDefault();
    setJvError(null);
    if (!isJvBalanced) {
      setJvError(`ডেবিট (৳${totalJvDebit}) এবং ক্রেডিট (৳${totalJvCredit}) সমান হতে হবে এবং ০ এর বেশি হতে হবে।`);
      return;
    }

    const formattedLines: JournalLine[] = jvLines.map(l => {
      const acc = chartOfAccounts.find(a => a.code === l.accountCode);
      return {
        accountCode: l.accountCode,
        accountName: acc?.name || 'Account',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo || jvDescription || 'Manual Journal'
      };
    });

    const res = createJournalEntry({
      date: jvDate,
      voucherType: 'Journal Voucher',
      referenceNo: jvRef || `MANUAL-${Date.now().toString().slice(-5)}`,
      description: jvDescription || 'Manual adjusting journal voucher',
      lines: formattedLines,
      totalDebit: totalJvDebit,
      totalCredit: totalJvCredit,
      createdBy: 'Accountant'
    });

    if (res.success) {
      showSuccess('ম্যানুয়াল জার্নাল ভাউচার সফলভাবে তৈরি এবং পোস্টিং সম্পন্ন হয়েছে!');
      setShowAddJvModal(false);
      setJvDescription('');
      setJvRef('');
      setJvLines([
        { accountCode: chartOfAccounts[0]?.code || '1000', memo: '', debit: 0, credit: 0 },
        { accountCode: chartOfAccounts[1]?.code || '6000', memo: '', debit: 0, credit: 0 }
      ]);
    } else {
      setJvError(res.error || 'জার্নাল সেভ করা সম্ভব হয়নি।');
    }
  };

  // Ledger Statement for Drilldown Account
  const accountLedgerLines = useMemo(() => {
    if (!drilldownAccount) return [];
    const lines: Array<{
      voucherNo: string;
      date: string;
      voucherType: string;
      referenceNo: string;
      memo: string;
      debit: number;
      credit: number;
    }> = [];

    journalEntries.forEach(jv => {
      jv.lines.forEach(line => {
        if (line.accountCode === drilldownAccount.code) {
          lines.push({
            voucherNo: jv.voucherNo,
            date: jv.date,
            voucherType: jv.voucherType,
            referenceNo: jv.referenceNo,
            memo: line.memo || jv.description,
            debit: line.debit,
            credit: line.credit
          });
        }
      });
    });

    return lines.sort((a, b) => b.date.localeCompare(a.date));
  }, [drilldownAccount, journalEntries]);

  const currentPeriodLabel =
    periodFilter === 'all' ? 'All Transactions (সর্বমোট)' :
    periodFilter === 'today' ? `Today (${formatDate(new Date().toISOString().split('T')[0])})` :
    periodFilter === 'this_month' ? 'Current Month (চলতি মাস)' : 'Current Financial Year (চলতি বছর)';

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              General Ledger & Double-Entry Financial Statements
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            দ্বৈত দাখিলা হিসাব পদ্ধতি অনুযায়ী রিয়েল-টাইম লাভ-ক্ষতি, ব্যালেন্স শিট, রেওয়ামিল ও জার্নাল ভাউচার
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">সব সময় (All Time)</option>
              <option value="today">আজকের দিন (Today)</option>
              <option value="this_month">চলতি মাস (This Month)</option>
              <option value="this_year">চলতি বছর (This Year)</option>
            </select>
          </div>

          {/* Tab Switcher */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('pl')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'pl' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Profit & Loss
            </button>
            <button
              onClick={() => setActiveTab('bs')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'bs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setActiveTab('tb')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'tb' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Trial Balance
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'journal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Journal Vouchers ({journalEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('coa')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'coa' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Chart of Accounts
            </button>
          </div>
        </div>
      </div>

      {/* 1. PROFIT & LOSS STATEMENT */}
      {activeTab === 'pl' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Statement of Comprehensive Profit & Loss (লাভ-ক্ষতি বিবরণী)
              </h3>
              <p className="text-xs text-slate-500">Period: {currentPeriodLabel} (BDT ৳)</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            {/* Revenue Section */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Operating Revenues (পরিচালন রাজস্ব)
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Wholesale & Dealer Sales Revenue</span>
                <span className="font-bold text-slate-900">{formatBDT(totalGrossSales)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Less: Sales Returns & Defect Allowances</span>
                <span className="font-bold">-{formatBDT(totalSalesReturns)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                <span>Net Operating Revenue (নিট বিক্রয় আয়)</span>
                <span>{formatBDT(netSalesRevenue)}</span>
              </div>
            </div>

            {/* COGS Section */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Cost of Goods Sold - COGS (বিক্রিত পণ্যের ব্যয়)
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Direct Purchase Cost of Handsets Dispatched</span>
                <span className="font-bold text-slate-900">{formatBDT(totalCOGS)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-800 pt-2 border-t border-slate-200">
                <span>Gross Trading Profit (মোট মুনাফা - Margin: {grossMarginPercent}%)</span>
                <span>{formatBDT(grossProfit)}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Operating Expenses (পরিচালন ব্যয়সমূহ)
              </div>
              {filteredExpenses.map(exp => (
                <div key={exp.id} className="flex justify-between text-slate-600">
                  <span>{exp.categoryName} ({exp.description})</span>
                  <span className="font-medium text-slate-800">{formatBDT(exp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-600">
                <span>Salesman Commission & Field Incentives</span>
                <span className="font-medium text-slate-800">{formatBDT(totalSalesmanCommission)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Operating Overheads (মোট পরিচালন ব্যয়)</span>
                <span>{formatBDT(totalOperatingExpenses)}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-900">
              <div>
                <div>Net Operating Profit for the Period (নিট পরিচালন মুনাফা)</div>
                <div className="text-xs text-emerald-700 font-normal">Net Profit Margin: {netMarginPercent}%</div>
              </div>
              <div className="text-xl">{formatBDT(netOperatingProfit)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BALANCE SHEET */}
      {activeTab === 'bs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Statement of Financial Position (Balance Sheet - উদ্বৃত্ত পত্র)
              </h3>
              <p className="text-xs text-slate-500">As of: {formatDate(new Date().toISOString().split('T')[0])} (BDT ৳)</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Balance Sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Assets */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-blue-900 uppercase tracking-wider border-b-2 border-blue-600 pb-1">
                Assets (সম্পদসমূহ)
              </h4>

              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Current Assets (চলতি সম্পদ)</div>
                <div className="flex justify-between text-slate-600">
                  <span>Merchandise Inventory (Mobile Stock)</span>
                  <span className="font-bold text-slate-800">{formatBDT(inventoryValuation)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Accounts Receivable (Customer Due)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accountsReceivable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Bank Accounts (DBBL, City, BRAC, bKash)</span>
                  <span className="font-bold text-slate-800">{formatBDT(bankBalances)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cash in Hand (Main Vault & Till)</span>
                  <span className="font-bold text-slate-800">{formatBDT(cashInHand)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between font-extrabold text-sm text-blue-950">
                <span>Total Assets (মোট সম্পদ)</span>
                <span>{formatBDT(totalCurrentAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-indigo-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1">
                Liabilities & Owner Equity (দায় ও মালিকানাস্বত্ব)
              </h4>

              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Current Liabilities (চলতি দায়)</div>
                <div className="flex justify-between text-slate-600">
                  <span>Accounts Payable (Supplier Due)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accountsPayable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Accrued VAT & Tax Payable (NBR)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accruedVat)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total Liabilities (মোট দায়)</span>
                  <span>{formatBDT(totalLiabilities)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Owner Equity (মালিকানাস্বত্ব)</div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid-Up Capital (পরিশোধিত মূলধন)</span>
                  <span className="font-bold text-slate-800">{formatBDT(ownerCapital)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Retained Earnings (Beginning)</span>
                  <span className="font-medium text-slate-700">{formatBDT(priorRetainedEarnings)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Period Net Income (চলতি লাভ)</span>
                  <span className="font-bold text-emerald-700">{formatBDT(netOperatingProfit)}</span>
                </div>
                {ownerDrawings > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Less: Owner Drawings (উত্তোলন)</span>
                    <span className="font-medium text-rose-600">({formatBDT(ownerDrawings)})</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-100">
                  <span>Accumulated Retained Earnings</span>
                  <span className="font-bold text-emerald-700">{formatBDT(retainedEarnings)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total Equity (মোট মালিকানাস্বত্ব)</span>
                  <span>{formatBDT(totalEquity)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex justify-between font-extrabold text-sm text-indigo-950">
                <span>Total Liabilities & Equity (মোট দায় ও স্বত্ব)</span>
                <span>{formatBDT(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRIAL BALANCE */}
      {activeTab === 'tb' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Trial Balance (রেওয়ামিল - গাণিতিক শুদ্ধতা যাচাই)
              </h3>
              <p className="text-xs text-slate-500">প্রতিটি হিসাবের ডেবিট ও ক্রেডিট উদ্বৃত্ত (ক্লিক করে লেজার দেখুন)</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Accounts Synchronized</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Account Code</th>
                  <th className="p-3">Account Title</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3 text-right">Debit Balance (BDT)</th>
                  <th className="p-3 text-right">Credit Balance (BDT)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartOfAccounts.map(acc => (
                  <tr key={acc.code} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-blue-700">{acc.code}</td>
                    <td className="p-3 font-semibold text-slate-800">{acc.name}</td>
                    <td className="p-3 text-slate-500">{acc.type}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {acc.nature === 'Debit' ? formatBDT(acc.balance) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {acc.nature === 'Credit' ? formatBDT(acc.balance) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setDrilldownAccount(acc)}
                        className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold cursor-pointer"
                      >
                        লেজার স্টেটমেন্ট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. JOURNAL VOUCHERS */}
      {activeTab === 'journal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Journal Voucher Audit Register (জাবেদা রেজিস্টার)
              </h3>
              <p className="text-xs text-slate-500">বিক্রয়, ক্রয়, কালেকশন, ব্যয় এবং ম্যানুয়াল জাবেদা দাখিলাসমূহ</p>
            </div>
            <button
              onClick={() => {
                setJvError(null);
                setShowAddJvModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Create Manual Journal Voucher</span>
            </button>
          </div>

          <div className="space-y-4">
            {journalEntries.map(entry => (
              <div key={entry.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{entry.voucherNo}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {entry.voucherType}
                    </span>
                    <span className="text-slate-400 font-mono">Ref: {entry.referenceNo}</span>
                  </div>
                  <div className="text-slate-500">
                    {formatDate(entry.date)} • Created by <b className="text-slate-800">{entry.createdBy}</b>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium">{entry.description}</p>

                {/* Lines */}
                <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase text-[9px] font-bold">
                    <tr>
                      <th className="p-2">Account Code & Title</th>
                      <th className="p-2">Memo / Narration</th>
                      <th className="p-2 text-right">Debit (৳)</th>
                      <th className="p-2 text-right">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entry.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <span className="font-mono text-blue-700 font-bold">{line.accountCode}</span> - {line.accountName}
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{line.memo}</td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {line.debit > 0 ? formatBDT(line.debit) : '-'}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {line.credit > 0 ? formatBDT(line.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Standard Chart of Accounts (COA - হিসাব তালিকা)
              </h3>
              <p className="text-xs text-slate-500">সম্পদ, দায়, মূলধন, রাজস্ব ও ব্যয়ের কোডভিত্তিক হিসাব সূচি</p>
            </div>
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <span>+ Add Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {chartOfAccounts.map(coa => (
              <div key={coa.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-blue-700 text-sm">{coa.code}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    coa.type === 'Asset' ? 'bg-blue-100 text-blue-800' :
                    coa.type === 'Liability' ? 'bg-rose-100 text-rose-800' :
                    coa.type === 'Revenue' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {coa.type} ({coa.nature})
                  </span>
                </div>
                <div className="font-bold text-slate-900">{coa.name}</div>
                <p className="text-slate-500 text-[11px]">{coa.description}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <span className="font-extrabold text-slate-800">
                    Balance: {formatBDT(coa.balance)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDrilldownAccount(coa)}
                      className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      লেজার দেখুন
                    </button>
                    <RowActions
                      onEdit={() => setEditingAccount(coa)}
                      onDelete={() => deleteAccount(coa.code)}
                      deleteTitle={`Delete Account ${coa.code} - ${coa.name}?`}
                      deleteMessage="Accounts that have journal entries posted to them cannot be deleted."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Journal Entry Modal */}
      {showAddJvModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Create Manual Journal Voucher (JV)</h3>
                <p className="text-xs text-slate-500">অ্যাডজাস্টিং, ডেপ্রিসিয়েশন বা ম্যানুয়াল সমন্বয় জাবেদা দাখিলা</p>
              </div>
              <button
                onClick={() => setShowAddJvModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {jvError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{jvError}</span>
              </div>
            )}

            <form onSubmit={handleSaveJv} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher Date *</label>
                  <input
                    type="date"
                    value={jvDate}
                    onChange={e => setJvDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / Supporting Doc</label>
                  <input
                    type="text"
                    placeholder="e.g. AUDIT-ADJ-01"
                    value={jvRef}
                    onChange={e => setJvRef(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Narration / Description *</label>
                <input
                  type="text"
                  placeholder="জাবেদার সামগ্রিক কারণ লিখুন..."
                  value={jvDescription}
                  onChange={e => setJvDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Journal Lines Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Journal Lines (হিসাব খাতসমূহ)</span>
                  <button
                    type="button"
                    onClick={handleAddJvLine}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Line</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2 w-56">Account Head</th>
                        <th className="p-2">Line Memo</th>
                        <th className="p-2 w-28 text-right">Debit (৳)</th>
                        <th className="p-2 w-28 text-right">Credit (৳)</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jvLines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select
                              value={line.accountCode}
                              onChange={e => handleUpdateJvLine(idx, 'accountCode', e.target.value)}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                            >
                              {chartOfAccounts.map(a => (
                                <option key={a.code} value={a.code}>
                                  {a.code} - {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Memo"
                              value={line.memo}
                              onChange={e => handleUpdateJvLine(idx, 'memo', e.target.value)}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={line.debit || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateJvLine(idx, 'debit', val);
                                if (val > 0) handleUpdateJvLine(idx, 'credit', 0);
                              }}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={line.credit || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateJvLine(idx, 'credit', val);
                                if (val > 0) handleUpdateJvLine(idx, 'debit', 0);
                              }}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {jvLines.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveJvLine(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="p-2 text-right">Total (মোট):</td>
                        <td className="p-2 text-right font-mono text-slate-900">{formatBDT(totalJvDebit)}</td>
                        <td className="p-2 text-right font-mono text-slate-900">{formatBDT(totalJvCredit)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  isJvBalanced ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                }`}>
                  <span>{isJvBalanced ? '✓ জাবেদা দাখিলা ডেবিট ও ক্রেডিট সমান হয়েছে' : '✕ ডেবিট ও ক্রেডিট সমান নয়'}</span>
                  <span>পার্থক্য: {formatBDT(Math.abs(totalJvDebit - totalJvCredit))}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJvModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!isJvBalanced}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Ledger Drilldown Modal */}
      {drilldownAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  General Ledger Statement: {drilldownAccount.code} - {drilldownAccount.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Classification: <b>{drilldownAccount.type}</b> ({drilldownAccount.nature} Nature) • Current Balance: <b className="text-blue-700">{formatBDT(drilldownAccount.balance)}</b>
                </p>
              </div>
              <button
                onClick={() => setDrilldownAccount(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-3">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Voucher #</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Narration / Memo</th>
                    <th className="p-2 text-right">Debit (৳)</th>
                    <th className="p-2 text-right">Credit (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountLedgerLines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                        এই অ্যাকাউন্টের কোনো লেনদেন বা জার্নাল এন্ট্রি পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    accountLedgerLines.map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-600">{formatDate(l.date)}</td>
                        <td className="p-2 font-mono text-blue-600 font-bold">{l.voucherNo}</td>
                        <td className="p-2 text-[10px] text-slate-500">{l.voucherType}</td>
                        <td className="p-2 text-slate-800">{l.memo}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{l.debit > 0 ? formatBDT(l.debit) : '-'}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{l.credit > 0 ? formatBDT(l.credit) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                মোট ট্রানজেকশন লাইন: {accountLedgerLines.length}টি
              </span>
              <button
                type="button"
                onClick={() => setDrilldownAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <EditModal
          title="Add General Ledger Account"
          initial={{
            code: '',
            name: '',
            type: 'Asset',
            nature: 'Debit',
            balance: 0,
            description: ''
          }}
          fields={coaAddFields}
          saveLabel="Create Account"
          onSave={v => addAccount(v as AccountCOA)}
          onClose={() => setShowAddAccount(false)}
        />
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <EditModal
          title={`Edit Account - ${editingAccount.code} (${editingAccount.name})`}
          initial={editingAccount}
          fields={coaEditFields}
          onSave={v => updateAccount(editingAccount.code, v as Partial<AccountCOA>)}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
};
