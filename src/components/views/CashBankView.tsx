import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Wallet,
  Building,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Edit3,
  Coins,
  Check,
  X,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { formatBDT, formatDateTime, formatDate } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { BankAccount, CashTransaction } from '../../types/erp';
import { useToast } from '../common/ToastNotificationSystem';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';

const bankFields: FieldDef[] = [
  { key: 'bankName', label: 'Bank / Gateway Name', required: true },
  { key: 'branch', label: 'Branch Name' },
  { key: 'accountName', label: 'Account Holder Name', required: true },
  { key: 'accountNumber', label: 'Account / Wallet Number', required: true },
  {
    key: 'accountType',
    label: 'Account Category',
    type: 'select',
    options: ['Current', 'Savings', 'MFS Merchant (bKash/Nagad)']
  },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
];

const newBankFields: FieldDef[] = [
  ...bankFields,
  { key: 'openingBalance', label: 'Opening Balance (৳)', type: 'number', required: true }
];

export const CashBankView: React.FC = () => {
  const {
    bankAccounts,
    cashTransactions,
    chartOfAccounts,
    customers,
    suppliers,
    bankStatements,
    reconcileBankTransaction,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    resetCashAndBankBalances,
    setVaultOpeningCash,
    addCashTransaction,
    updateCashTransaction,
    deleteCashTransaction,
    currentUserRole
  } = useERP();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'bank' | 'cash'>('bank');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [showSetVaultModal, setShowSetVaultModal] = useState(false);
  const [vaultCashInput, setVaultCashInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [vaultSuccessMsg, setVaultSuccessMsg] = useState<string | null>(null);

  // Cash Transaction CRUD State
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [editingCashTx, setEditingCashTx] = useState<CashTransaction | null>(null);
  const [cashType, setCashType] = useState<'Cash In' | 'Cash Out'>('Cash In');
  const [cashCategory, setCashCategory] = useState<CashTransaction['category']>('Expense');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cashDesc, setCashDesc] = useState('');
  const [cashRef, setCashRef] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [cashError, setCashError] = useState<string | null>(null);
  const [addCashSuccessMsg, setAddCashSuccessMsg] = useState<string | null>(null);

  // Quick Bank Statements Viewer Modal
  const [viewingBankStatements, setViewingBankStatements] = useState<BankAccount | null>(null);

  // Cash Book Filters
  const [cashSearch, setCashSearch] = useState('');
  const [cashFilterCategory, setCashFilterCategory] = useState<string>('all');
  const [cashFilterPeriod, setCashFilterPeriod] = useState<string>('all');

  const totalBankFunds = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const openingVault = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0;
  const currentCashInHand = openingVault + totalCashIn - totalCashOut;

  const handleOpenSetVault = () => {
    setVaultCashInput(openingVault.toString());
    setVaultSuccessMsg(null);
    setShowSetVaultModal(true);
  };

  const handleSaveVaultCash = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(vaultCashInput) || 0;
    setVaultOpeningCash(val);
    const msg = `ভল্ট ক্যাশ প্রারম্ভিক ব্যালেন্স ৳${val.toLocaleString('en-IN')} এ সফলভাবে আপডেট করা হয়েছে।`;
    setVaultSuccessMsg(msg);
    setStatusMsg(msg);
    showSuccess(msg, { title: 'ভল্ট ক্যাশ আপডেট সফল' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleResetAllBalances = () => {
    if (confirm('আপনি কি নিশ্চিত যে ক্যাশ ইন হ্যান্ড (ভল্ট ক্যাশ) এবং সকল ব্যাংক অ্যাকাউন্টের বর্তমান ও প্রারম্ভিক ব্যালেন্স শূন্য (৳ ০) করতে চান?')) {
      resetCashAndBankBalances();
      setStatusMsg('সকল ক্যাশ ও ব্যাংক অ্যাকাউন্ট ব্যালেন্স সফলভাবে রিসেট (৳ ০) করা হয়েছে!');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleAddCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCashError(null);
    const amt = parseFloat(cashAmount);
    if (!amt || amt <= 0) {
      setCashError('অনুগ্রহ করে ০ এর বেশি বৈধ টাকার পরিমাণ দিন।');
      return;
    }
    if (cashType === 'Cash Out' && amt > currentCashInHand) {
      setCashError(`অপর্যাপ্ত ক্যাশ ব্যালেন্স! বর্তমান ভল্ট ও টিল ক্যাশ ৳${currentCashInHand.toLocaleString('en-IN')} কিন্তু আপনি খরচ করতে চেয়েছেন ৳${amt.toLocaleString('en-IN')}।`);
      return;
    }

    if (cashCategory === 'Cash To Bank' && cashType === 'Cash Out' && !selectedBankId) {
      setCashError('অনুগ্রহ করে টাকা জমা দেওয়ার ব্যাংক অ্যাকাউন্ট নির্বাচন করুন।');
      return;
    }

    const finalRef = cashRef.trim() || `CSH-${Date.now().toString().slice(-6)}`;
    const finalDesc = cashDesc.trim() || `${cashType} Entry`;
    const res = addCashTransaction({
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`,
      type: cashType,
      category: cashCategory,
      amount: amt,
      referenceNo: finalRef,
      description: finalDesc,
      performedBy: currentUserRole,
      bankAccountId: cashCategory === 'Cash To Bank' ? selectedBankId : undefined,
      customerId: (cashCategory === 'Due Collection' || cashCategory === 'Customer Sale') && selectedCustomerId ? selectedCustomerId : undefined,
      supplierId: cashCategory === 'Supplier Payment' && selectedSupplierId ? selectedSupplierId : undefined
    });

    if (res.success) {
      if (cashRef.trim()) recordFieldHistory('referenceNo', cashRef.trim());
      if (cashDesc.trim()) recordFieldHistory('description', cashDesc.trim());

      const msg = `নতুন ক্যাশ ${cashType === 'Cash In' ? 'ইনফ্লো (+)' : 'আউটফ্লো (-)'} ৳${amt.toLocaleString('en-IN')} সফলভাবে রেকর্ড করা হয়েছে।`;
      showSuccess(msg, { title: 'ক্যাশ ট্রানজেকশন সফল' });
      setAddCashSuccessMsg(msg);
      setStatusMsg(msg);
      setCashAmount('');
      setCashDesc('');
      setCashRef('');
    } else {
      setCashError(res.error || 'ক্যাশ লেনদেন সেভ করা সম্ভব হয়নি।');
    }
  };

  const handleDeleteCash = (id: string, refNo: string, amount: number) => {
    if (confirm(`আপনি কি নিশ্চিত যে ক্যাশ ভাউচার #${refNo} (৳${amount.toLocaleString('en-IN')}) মুছে ফেলতে চান?`)) {
      const res = deleteCashTransaction(id);
      if (res.success) {
        setStatusMsg(`ক্যাশ ভাউচার #${refNo} সফলভাবে মুছে ফেলা হয়েছে।`);
        setTimeout(() => setStatusMsg(null), 4000);
      }
    }
  };

  // Filtered Cash Transactions
  const filteredCashTransactions = useMemo(() => {
    return cashTransactions.filter(tx => {
      // Period filter
      if (cashFilterPeriod !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (cashFilterPeriod === 'today' && !tx.date.startsWith(today)) return false;
        if (cashFilterPeriod === 'this_month') {
          const currentMonth = today.slice(0, 7);
          if (!tx.date.startsWith(currentMonth)) return false;
        }
      }

      // Category filter
      if (cashFilterCategory !== 'all' && tx.category !== cashFilterCategory) {
        return false;
      }

      // Search filter
      if (cashSearch.trim()) {
        const q = cashSearch.toLowerCase();
        const matchRef = tx.referenceNo.toLowerCase().includes(q);
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchUser = tx.performedBy.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        return matchRef || matchDesc || matchUser || matchCat;
      }

      return true;
    });
  }, [cashTransactions, cashSearch, cashFilterCategory, cashFilterPeriod]);

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cash Book & Multi-Bank Management (ক্যাশ ও ব্যাংক লেজার)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ভল্ট ও ড্রয়ার ক্যাশ বুক, বাণিজ্যিক ব্যাংক অ্যাকাউন্টস (DBBL, City, BRAC) ও এমএফএস মার্চেন্ট ওয়ালেট
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenSetVault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer"
            title="ভল্ট বা ক্যাশ ড্রয়ারের প্রারম্ভিক ক্যাশ সেট করুন"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>ভল্ট ক্যাশ সেট</span>
          </button>

          <button
            onClick={handleResetAllBalances}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
            title="সকল ক্যাশ ও ব্যাংক ব্যালেন্স শূন্য (৳ ০) রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>ব্যালেন্স রিসেট (০)</span>
          </button>

          {activeTab === 'bank' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Bank Account</span>
            </button>
          )}

          {activeTab === 'cash' && (
            <button
              onClick={() => {
                setCashError(null);
                setAddCashSuccessMsg(null);
                setShowAddCashModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ ক্যাশ লেনদেন এন্ট্রি</span>
            </button>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'bank' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Bank Accounts ({bankAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'cash' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Daily Cash Book
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Liquid Bank Balances</div>
          <div className="text-xl font-black text-slate-900 mt-1">{formatBDT(totalBankFunds)}</div>
          <div className="text-[10px] text-slate-400 mt-1">মোট সক্রিয় ব্যাংক অ্যাকাউন্ট: {bankAccounts.filter(b => b.status === 'Active').length}টি</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-slate-500 uppercase font-semibold text-[10px]">Cash in Hand (Main Vault & Till)</div>
            <button
              onClick={handleOpenSetVault}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>ওপেনিং ক্যাশ</span>
            </button>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatBDT(currentCashInHand)}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            ওপেনিং: {formatBDT(openingVault)} | ইন: +{formatBDT(totalCashIn)} | আউট: -{formatBDT(totalCashOut)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Liquid Solvency</div>
          <div className="text-xl font-black text-blue-700 mt-1">{formatBDT(totalBankFunds + currentCashInHand)}</div>
          <div className="text-[10px] text-slate-400 mt-1">ক্যাশ ও ব্যাংক মোট তাৎক্ষণিক নগদ তারল্য</div>
        </div>
      </div>

      {activeTab === 'bank' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map(b => {
              const matchedStatements = bankStatements.filter(st => st.bankAccountId === b.id);
              const unmatchedCount = matchedStatements.filter(st => st.status === 'Unmatched').length;

              return (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{b.bankName}</h3>
                      <div className="text-xs text-slate-500">{b.branch}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {b.accountType}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-bold text-slate-800">{b.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-medium text-slate-700">{b.accountName}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Current Ledger Balance:</span>
                      <span className="font-extrabold text-sm text-emerald-700">{formatBDT(b.currentBalance)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Reconciliation:{' '}
                      <b className={unmatchedCount > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                        {unmatchedCount > 0 ? `${unmatchedCount} Unmatched Items` : 'Reconciled'}
                      </b>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingBankStatements(b)}
                        className="flex items-center gap-1 text-blue-600 hover:underline font-semibold cursor-pointer"
                        title="এই অ্যাকাউন্টের স্টেটমেন্ট এন্ট্রি দেখুন"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>View Statement</span>
                      </button>
                      <RowActions
                        onEdit={() => setEditing(b)}
                        onDelete={() => deleteBankAccount(b.id)}
                        deleteTitle={`Delete bank account ${b.bankName}?`}
                        deleteMessage="Bank accounts with recorded transactions or non-zero balances cannot be deleted; mark them Inactive instead."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Daily Cash Book Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Daily Cash Book Log & Movement Statement
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Opening Balance: <b>{formatBDT(openingVault)}</b> • Inflows: <b>{formatBDT(totalCashIn)}</b> • Outflows: <b>{formatBDT(totalCashOut)}</b>
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Closing Cash in Vault</div>
              <div className="text-base font-extrabold text-emerald-700">{formatBDT(currentCashInHand)}</div>
            </div>
          </div>

          {/* Cash Book Filtering Toolbar */}
          <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="রেফারেন্স, বিবরণ বা ক্যাটাগরি খুঁজুন..."
                value={cashSearch}
                onChange={e => setCashSearch(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">ক্যাটাগরি:</span>
                <select
                  value={cashFilterCategory}
                  onChange={e => setCashFilterCategory(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  <option value="Expense">Expense</option>
                  <option value="Customer Sale">Customer Sale</option>
                  <option value="Due Collection">Due Collection</option>
                  <option value="Supplier Payment">Supplier Payment</option>
                  <option value="Cash To Bank">Cash To Bank</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">সময়কাল:</span>
                <select
                  value={cashFilterPeriod}
                  onChange={e => setCashFilterPeriod(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="all">সব সময়</option>
                  <option value="today">আজকের দিন</option>
                  <option value="this_month">চলতি মাস</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description & Reference</th>
                  <th className="p-3">Responsible User</th>
                  <th className="p-3 text-right">Inflow (Cash In)</th>
                  <th className="p-3 text-right">Outflow (Cash Out)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCashTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      কোনো ক্যাশ লেনদেন রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredCashTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 text-slate-600 font-mono text-[11px]">
                        {tx.date}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.type === 'Cash In' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {tx.category}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{tx.description}</div>
                        <div className="font-mono text-[10px] text-blue-600 font-semibold">{tx.referenceNo}</div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {tx.performedBy}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">
                        {tx.type === 'Cash In' ? formatBDT(tx.amount) : '-'}
                      </td>
                      <td className="p-3 text-right font-extrabold text-rose-700">
                        {tx.type === 'Cash Out' ? formatBDT(tx.amount) : '-'}
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setEditingCashTx(tx)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer"
                          title="বিবরণ ও রেফারেন্স এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCash(tx.id, tx.referenceNo, tx.amount)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="ক্যাশ লেনদেন রেকর্ড ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <EditModal
          title="Add New Commercial Bank / Gateway Account"
          initial={{
            bankName: '',
            branch: '',
            accountName: '',
            accountNumber: '',
            accountType: 'Current',
            openingBalance: 0,
            status: 'Active'
          }}
          fields={newBankFields}
          saveLabel="Save Account"
          onSave={v => addBankAccount(v as any)}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Bank Account Modal */}
      {editing && (
        <EditModal
          title={`Edit Account - ${editing.bankName}`}
          initial={editing}
          fields={bankFields}
          onSave={v => updateBankAccount(editing.id, v as Partial<BankAccount>)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Set Opening Vault Cash Modal */}
      {showSetVaultModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ভল্ট প্রারম্ভিক ক্যাশ নির্ধারণ</h3>
                  <p className="text-[11px] text-slate-500">Vault & Cash in Hand Opening Balance</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetVaultModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVaultCash} className="space-y-4">
              {vaultSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{vaultSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSetVaultModal(false);
                      setVaultSuccessMsg(null);
                    }}
                    className="text-[11px] underline text-emerald-700 hover:text-emerald-900 font-medium shrink-0 cursor-pointer"
                  >
                    উইন্ডো বন্ধ করুন
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রারম্ভিক নগদ টাকার পরিমাণ (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={vaultCashInput}
                    onChange={e => {
                      setVaultCashInput(e.target.value);
                      setVaultSuccessMsg(null);
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  এটি হিসাব নম্বর ১০০০ (Cash in Hand / Main Vault)-এর ব্যালেন্স হিসেবে সেট হবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetVaultModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Cash Transaction Modal */}
      {showAddCashModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
                  cashType === 'Cash In' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ম্যানুয়াল ক্যাশ লেনদেন এন্ট্রি</h3>
                  <p className="text-[11px] text-slate-500">ভল্ট ও টিল ড্রয়ারের দৈনিক ক্যাশ ইনফ্লো / আউটফ্লো</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCashModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cashError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{cashError}</span>
              </div>
            )}

            {addCashSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{addCashSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCashModal(false);
                    setAddCashSuccessMsg(null);
                  }}
                  className="text-[11px] underline text-emerald-700 hover:text-emerald-900 font-medium shrink-0 cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              </div>
            )}

            <form onSubmit={handleAddCashSubmit} className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setCashType('Cash In');
                    setCashError(null);
                    setAddCashSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    cashType === 'Cash In' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + ক্যাশ ইন (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCashType('Cash Out');
                    setCashError(null);
                    setAddCashSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    cashType === 'Cash Out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - ক্যাশ আউট (Outflow)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টাকার পরিমাণ (৳) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={cashAmount}
                    onChange={e => {
                      setCashAmount(e.target.value);
                      setCashError(null);
                      setAddCashSuccessMsg(null);
                    }}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                {cashType === 'Cash Out' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    বর্তমান ক্যাশ ইন হ্যান্ড: <b className="text-emerald-700">{formatBDT(currentCashInHand)}</b>
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  লেনদেনের খাত / ক্যাটাগরি *
                </label>
                <select
                  value={cashCategory}
                  onChange={e => {
                    setCashCategory(e.target.value as any);
                    setAddCashSuccessMsg(null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Expense">অফিস অপারেশনাল খরচ (Expense)</option>
                  <option value="Customer Sale">কাস্টমার সেলস কালেকশন (Customer Sale)</option>
                  <option value="Due Collection">বকেয়া কালেকশন (Due Collection)</option>
                  <option value="Supplier Payment">সাপ্লায়ার নগদ পেমেন্ট (Supplier Payment)</option>
                  <option value="Cash To Bank">ক্যাশ টু ব্যাংক ডিপোজিট (Cash To Bank)</option>
                  <option value="Other">অন্যান্য নগদ লেনদেন (Other)</option>
                </select>
              </div>

              {/* Bank Account dropdown when Cash To Bank is selected */}
              {cashCategory === 'Cash To Bank' && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    ডিপোজিট করার ব্যাংক অ্যাকাউন্ট নির্বাচন করুন *
                  </label>
                  <select
                    value={selectedBankId}
                    onChange={e => setSelectedBankId(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800"
                    required
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNumber} (ব্যালেন্স: {formatBDT(b.currentBalance)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-700 mt-1">
                    ✓ ক্যাশ আউট সম্পন্ন হলে স্বয়ংক্রিয়ভাবে নির্বাচিত ব্যাংকের ব্যালেন্স বৃদ্ধি পাবে।
                  </p>
                </div>
              )}

              {/* Customer dropdown when Customer Due Collection is selected */}
              {(cashCategory === 'Due Collection' || cashCategory === 'Customer Sale') && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    সংশ্লিষ্ট কাস্টমার / ডিলার (ঐচ্ছিক)
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="">-- কোনো নির্দিষ্ট কাস্টমার নয় --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.shopName} ({c.ownerName}) - {c.mobile} (বর্তমান বকেয়া: {formatBDT(c.currentDue)})
                      </option>
                    ))}
                  </select>
                  {selectedCustomerId && (
                    <p className="text-[10px] text-emerald-700 mt-1">
                      ✓ কাস্টমার বকেয়া কালেকশন রেকর্ড হলে কাস্টমারের ডিউ কমে যাবে।
                    </p>
                  )}
                </div>
              )}

              {/* Supplier dropdown when Supplier Payment is selected */}
              {cashCategory === 'Supplier Payment' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    সংশ্লিষ্ট সাপ্লায়ার (ঐচ্ছিক)
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="">-- কোনো নির্দিষ্ট সাপ্লায়ার নয় --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (প্রদেয় বকেয়া: {formatBDT(s.currentDue)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রেফারেন্স / ভাউচার নম্বর (ঐচ্ছিক)
                </label>
                <HistoryInput
                  historyKey="referenceNo"
                  value={cashRef}
                  onChange={(e) => {
                    setCashRef(e.target.value);
                    setAddCashSuccessMsg(null);
                  }}
                  placeholder="e.g. VOUCHER-101 / RECEIPT-55"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিবরণ / বর্ণনা
                </label>
                <HistoryInput
                  historyKey="description"
                  value={cashDesc}
                  onChange={(e) => {
                    setCashDesc(e.target.value);
                    setAddCashSuccessMsg(null);
                  }}
                  placeholder="লেনদেনের প্রয়োজনীয় বিস্তারিত লিখুন..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCashModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                    cashType === 'Cash In' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>ক্যাশ এন্ট্রি সম্পন্ন করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cash Transaction Modal */}
      {editingCashTx && (
        <EditModal
          title={`Edit Cash Entry - ${editingCashTx.referenceNo}`}
          initial={editingCashTx}
          fields={[
            { key: 'description', label: 'Description', type: 'textarea', required: true },
            { key: 'referenceNo', label: 'Reference No', required: true }
          ]}
          onSave={v => {
            const res = updateCashTransaction(editingCashTx.id, v as Partial<CashTransaction>);
            if (res.success) {
              showSuccess('ক্যাশ ট্রানজেকশন সফলভাবে আপডেট করা হয়েছে।');
            }
            return res;
          }}
          onClose={() => setEditingCashTx(null)}
        />
      )}

      {/* View Bank Statement Entries Modal */}
      {viewingBankStatements && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Bank Statement Details: {viewingBankStatements.bankName}
                </h3>
                <p className="text-xs text-slate-500">
                  Account #{viewingBankStatements.accountNumber} • Current Balance: <b className="text-emerald-700">{formatBDT(viewingBankStatements.currentBalance)}</b>
                </p>
              </div>
              <button
                onClick={() => setViewingBankStatements(null)}
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
                    <th className="p-2">Description</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2 text-right">Debit (Out)</th>
                    <th className="p-2 text-right">Credit (In)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankStatements.filter(s => s.bankAccountId === viewingBankStatements.id).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                        এই ব্যাংকে কোনো স্টেটমেন্ট এন্ট্রি রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    bankStatements
                      .filter(s => s.bankAccountId === viewingBankStatements.id)
                      .map(st => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono text-slate-600">{formatDate(st.date)}</td>
                          <td className="p-2 font-medium text-slate-800">{st.description}</td>
                          <td className="p-2 font-mono text-blue-600">{st.referenceNo}</td>
                          <td className="p-2 text-right font-bold text-rose-700">
                            {st.debit > 0 ? formatBDT(st.debit) : '-'}
                          </td>
                          <td className="p-2 text-right font-bold text-emerald-700">
                            {st.credit > 0 ? formatBDT(st.credit) : '-'}
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingBankStatements(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                উইন্ডো বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
