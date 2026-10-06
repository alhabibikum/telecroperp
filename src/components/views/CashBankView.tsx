import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { formatBDT, formatDateTime } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { BankAccount } from '../../types/erp';

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
    reconcileBankTransaction,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    resetCashAndBankBalances,
    setVaultOpeningCash
  } = useERP();

  const [activeTab, setActiveTab] = useState<'bank' | 'cash'>('bank');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [showSetVaultModal, setShowSetVaultModal] = useState(false);
  const [vaultCashInput, setVaultCashInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const totalBankFunds = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const openingVault = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0;
  const currentCashInHand = openingVault + totalCashIn - totalCashOut;

  const handleOpenSetVault = () => {
    setVaultCashInput(openingVault.toString());
    setShowSetVaultModal(true);
  };

  const handleSaveVaultCash = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(vaultCashInput) || 0;
    setVaultOpeningCash(val);
    setShowSetVaultModal(false);
    setStatusMsg(`ভল্ট ক্যাশ প্রারম্ভিক ব্যালেন্স ৳${val.toLocaleString('en-IN')} এ সফলভাবে আপডেট করা হয়েছে।`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleResetAllBalances = () => {
    if (confirm('আপনি কি নিশ্চিত যে ক্যাশ ইন হ্যান্ড (ভল্ট ক্যাশ) এবং সকল ব্যাংক অ্যাকাউন্টের বর্তমান ও প্রারম্ভিক ব্যালেন্স শূন্য (৳ ০) করতে চান?')) {
      resetCashAndBankBalances();
      setStatusMsg('সকল ক্যাশ ও ব্যাংক অ্যাকাউন্ট ব্যালেন্স সফলভাবে রিসেট (৳ ০) করা হয়েছে!');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cash Book & Multi-Bank Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Vault cash book, commercial current accounts (DBBL, City, BRAC) and MFS merchant gateways (bKash/Nagad)
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
              <span>+ Add Account</span>
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
            {bankAccounts.map(b => (
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
                  <span>Reconciliation: <b className="text-emerald-700">Reconciled</b></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => reconcileBankTransaction(b.id, `REC-${Date.now()}`)}
                      className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Match</span>
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
            ))}
          </div>
        </div>
      ) : (
        /* Daily Cash Book Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      কোনো ক্যাশ লেনদেন রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  cashTransactions.map(tx => (
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
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    onChange={e => setVaultCashInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  এটি হিসাব নম্বর ১০০০ (Cash in Hand / Main Vault)-এর ব্যালেন্স হিসেবে সেট হবে। রিসেট করার পর বা ড্রয়ারের প্রারম্ভিক ক্যাশ পরিবর্তনের জন্য এটি ব্যবহার করুন।
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
    </div>
  );
};
