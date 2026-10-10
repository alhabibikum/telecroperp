import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  PlusCircle,
  Search,
  CheckCircle,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileText,
  X
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { PaymentMethodType, Expense, ExpenseCategory } from '../../types/erp';
import { RowActions, EditModal } from '../common/CrudKit';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

const CategoryManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = useERP();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = addExpenseCategory({ name, description: desc });
    if (res.success) {
      setName('');
      setDesc('');
      setErr(null);
    } else setErr(res.error || 'Failed');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Manage Expense Categories</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-4 overflow-y-auto space-y-3 text-xs">
          <form onSubmit={add} className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="New category name" className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg" />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg" />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg cursor-pointer">Add</button>
          </form>
          {err && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">{err}</div>}
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {expenseCategories.map(c => (
              <li key={c.id} className="p-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.description}</div>
                </div>
                <RowActions
                  onEdit={() => setEditing(c)}
                  onDelete={() => deleteExpenseCategory(c.id)}
                  deleteTitle={`Delete category ${c.name}?`}
                  deleteMessage="Categories that already have expenses cannot be deleted."
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      {editing && (
        <EditModal
          title={`Edit Category - ${editing.name}`}
          initial={editing}
          fields={[
            { key: 'name', label: 'Category Name', required: true },
            { key: 'description', label: 'Description', type: 'textarea' }
          ]}
          onSave={v => updateExpenseCategory(editing.id, v as Partial<ExpenseCategory>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    expenseCategories,
    bankAccounts,
    chartOfAccounts,
    cashTransactions,
    warehouses,
    createExpense,
    updateExpense,
    deleteExpense
  } = useERP();
  const { showSuccess } = useToast();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<Expense | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [recipientName, setRecipientName] = useState('');
  const [voucherRef, setVoucherRef] = useState('');
  const [description, setDescription] = useState('');
  const [approvedBy, setApprovedBy] = useState('Masum Billah');
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Available liquid balances
  const openingVaultCash = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0;
  const totalCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const currentCashInHand = Math.max(0, openingVaultCash + totalCashIn - totalCashOut);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cat = expenseCategories.find(c => c.id === categoryId);
    if (!cat) {
      setFormError('অনুগ্রহ করে একটি বৈধ খরচের খাত নির্বাচন করুন।');
      return;
    }

    if (!amount || amount <= 0) {
      setFormError('খরচের পরিমাণ অবশ্যই ০ এর বেশি হতে হবে।');
      return;
    }

    if (paymentMethod === 'Cash' && amount > currentCashInHand) {
      setFormError(`অপর্যাপ্ত ক্যাশ ব্যালেন্স! বর্তমান ক্যাশ ইন হ্যান্ড ৳${currentCashInHand.toLocaleString('en-IN')} কিন্তু আপনি খরচ করতে চাচ্ছেন ৳${amount.toLocaleString('en-IN')}।`);
      return;
    }

    if (paymentMethod !== 'Cash') {
      const bAcc = bankAccounts.find(b => b.id === bankAccountId);
      if (bAcc && amount > bAcc.currentBalance) {
        setFormError(`অপর্যাপ্ত ব্যাংক ব্যালেন্স! ${bAcc.bankName} অ্যাকাউন্টে ব্যালেন্স রয়েছে ৳${bAcc.currentBalance.toLocaleString('en-IN')} কিন্তু খরচ ৳${amount.toLocaleString('en-IN')}।`);
        return;
      }
    }

    createExpense({
      date: expenseDate || new Date().toISOString().split('T')[0],
      categoryId: cat.id,
      categoryName: cat.name,
      amount,
      paymentMethod,
      bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
      warehouseId: warehouseId || undefined,
      description,
      approvedBy,
      recipientName: recipientName.trim() || undefined,
      voucherRef: voucherRef.trim() || undefined
    });

    if (description) {
      recordFieldHistory('description', description);
    }
    if (approvedBy) {
      recordFieldHistory('ownerName', approvedBy);
    }

    const msg = `খরচ ভাউচার ৳${amount.toLocaleString('en-IN')} (${cat.name}) সফলভাবে বুক করা হয়েছে।`;
    showSuccess(msg, {
      title: 'খরচ এন্ট্রি সফল',
      duration: 4000
    });
    setAddSuccessMsg(msg);
    setStatusMsg(msg);
    setDescription('');
    setRecipientName('');
    setVoucherRef('');
    setAmount(0);
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Period filter
      if (filterPeriod !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (filterPeriod === 'today' && !exp.date.startsWith(today)) return false;
        if (filterPeriod === 'this_month') {
          const currentMonth = today.slice(0, 7);
          if (!exp.date.startsWith(currentMonth)) return false;
        }
      }

      // Category filter
      if (filterCategory !== 'all' && exp.categoryId !== filterCategory) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNo = exp.expenseNo.toLowerCase().includes(q);
        const matchCat = exp.categoryName.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchUser = (exp.approvedBy || '').toLowerCase().includes(q);
        const matchRec = (exp.recipientName || '').toLowerCase().includes(q);
        return matchNo || matchCat || matchDesc || matchUser || matchRec;
      }

      return true;
    });
  }, [expenses, searchTerm, filterCategory, filterPeriod]);

  const totalFilteredExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Operational & Overhead Expense Management (দৈনিক খরচ ও ব্যয়)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            অফিস ভাড়া, স্টাফ ভাতা, যাতায়াত খরচ ও ডাবল-এন্ট্রি লেজার পোস্টিং
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Manage Categories
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setAddSuccessMsg(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Recorded Expenses</div>
          <div className="text-lg font-black text-slate-900 mt-1">{formatBDT(totalFilteredExpense)}</div>
          <div className="text-[10px] text-slate-400 mt-1">ফিল্টারকৃত মোট খরচ ভাউচার: {filteredExpenses.length}টি</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Expense Categories</div>
          <div className="text-lg font-black text-blue-700 mt-1">{expenseCategories.length} Standard Heads</div>
          <div className="text-[10px] text-slate-400 mt-1">অফিসিয়াল খরচের অনুমোদিত খাতসমূহ</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Available Liquid Cash</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{formatBDT(currentCashInHand)}</div>
          <div className="text-[10px] text-slate-400 mt-1">বর্তমান হাতে নগদ (ক্যাশ ইন হ্যান্ড)</div>
        </div>
      </div>

      {/* Expenses Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Toolbar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ভাউচার #, খাত বা বিবরণ দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">খাত:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="all">সকল খাত</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">সময়কাল:</span>
              <select
                value={filterPeriod}
                onChange={e => setFilterPeriod(e.target.value)}
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
                <th className="p-3">Expense Voucher #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Expense Head</th>
                <th className="p-3">Narration / Details</th>
                <th className="p-3">Recipient / Memo</th>
                <th className="p-3">Payment Channel</th>
                <th className="p-3">Authorized By</th>
                <th className="p-3 text-right">Amount (BDT)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    কোনো খরচ ভাউচার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-blue-700">{exp.expenseNo}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{formatDate(exp.date)}</td>
                    <td className="p-3 font-semibold text-slate-900">{exp.categoryName}</td>
                    <td className="p-3 text-slate-600 max-w-xs">{exp.description}</td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {exp.recipientName && <div>{exp.recipientName}</div>}
                      {exp.voucherRef && <div className="text-slate-400 font-mono text-[10px]">Ref: {exp.voucherRef}</div>}
                      {!exp.recipientName && !exp.voucherRef && <span className="text-slate-400">-</span>}
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{exp.approvedBy}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatBDT(exp.amount)}</td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => setSelectedVoucherForPrint(exp)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title="ভাউচার স্লিপ প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <RowActions
                        onEdit={() => setEditing(exp)}
                        onDelete={() => deleteExpense(exp.id)}
                        deleteTitle={`Delete expense ${exp.expenseNo}?`}
                        deleteMessage="The payment is reversed in cash/bank and general ledger accounts. To change amount, delete and re-record the expense."
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Record Business Expense (নতুন খরচ ভাউচার)</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              {addSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{addSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddSuccessMsg(null);
                    }}
                    className="text-[11px] underline text-emerald-700 hover:text-emerald-900 font-medium shrink-0 cursor-pointer"
                  >
                    উইন্ডো বন্ধ করুন
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Date and Warehouse */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Date (তারিখ) *</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch / Facility (শাখা)</label>
                  <select
                    value={warehouseId}
                    onChange={e => setWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Head / Category (খরচের খাত) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (টাকার পরিমাণ ৳) *</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(parseFloat(e.target.value) || 0);
                    setFormError(null);
                    setAddSuccessMsg(null);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-black text-sm text-blue-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode (পেমেন্ট চ্যানেল)</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value as PaymentMethodType);
                      setFormError(null);
                      setAddSuccessMsg(null);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash in Hand (হাতে নগদ)</option>
                    <option value="Bank Transfer">Bank Transfer (বাণিজ্যিক ব্যাংক)</option>
                    <option value="bKash">bKash Merchant</option>
                  </select>
                  {paymentMethod === 'Cash' && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      হাতে নগদ: <b className="text-emerald-700">{formatBDT(currentCashInHand)}</b>
                    </p>
                  )}
                </div>
                {paymentMethod !== 'Cash' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Debit Bank (ব্যাংক অ্যাকাউন্ট)</label>
                    <select
                      value={bankAccountId}
                      onChange={(e) => {
                        setBankAccountId(e.target.value);
                        setFormError(null);
                        setAddSuccessMsg(null);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id}>{b.bankName} ({formatBDT(b.currentBalance)})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name (টাকা গ্রহণকারী)</label>
                  <input
                    type="text"
                    placeholder="e.g. Karim Driver / Shundarban Courier"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Memo / Voucher Ref (বিল/ক্যাশ মেমো)</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-992 / CN-44"
                    value={voucherRef}
                    onChange={e => setVoucherRef(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Narration / Voucher Description *</label>
                <HistoryInput
                  historyKey="description"
                  placeholder="যেমন: শোরুমের এসি মেরামত ও সার্ভিসিং চার্জ"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFormError(null);
                    setAddSuccessMsg(null);
                  }}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized By (অনুমোদনকারী)</label>
                <HistoryInput
                  historyKey="ownerName"
                  placeholder="e.g. Masum Billah"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save & Post to Books (সংরক্ষণ ও লেজার পোস্টিং)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Expense Voucher Slip Modal */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Expense Payment Voucher #{selectedVoucherForPrint.expenseNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black text-slate-900">TELECORP ERP EXPENSE VOUCHER</h2>
                <p className="text-[11px] text-slate-500">Official Payment Disbursement Slip</p>
                <p className="text-[11px] text-slate-500">Date: {formatDate(selectedVoucherForPrint.date)}</p>
              </div>

              <div className="space-y-2 py-2 border-b border-dashed border-slate-300 text-slate-700">
                <div className="flex justify-between">
                  <span>Voucher Number:</span>
                  <span className="font-bold">{selectedVoucherForPrint.expenseNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense Head:</span>
                  <span className="font-bold">{selectedVoucherForPrint.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Channel:</span>
                  <span className="font-bold">{selectedVoucherForPrint.paymentMethod}</span>
                </div>
                {selectedVoucherForPrint.recipientName && (
                  <div className="flex justify-between">
                    <span>Payee / Recipient:</span>
                    <span className="font-bold">{selectedVoucherForPrint.recipientName}</span>
                  </div>
                )}
                {selectedVoucherForPrint.voucherRef && (
                  <div className="flex justify-between">
                    <span>Bill / Memo Ref:</span>
                    <span className="font-bold">{selectedVoucherForPrint.voucherRef}</span>
                  </div>
                )}
              </div>

              <div className="py-2 border-b border-dashed border-slate-300">
                <span className="text-slate-500 block mb-1">Particulars / Narration:</span>
                <p className="font-semibold text-slate-900">{selectedVoucherForPrint.description}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Disbursed Amount:</span>
                <span className="text-base text-blue-900">{formatBDT(selectedVoucherForPrint.amount)}</span>
              </div>

              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1">
                  Prepared By
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Checked & Passed By
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Approved By: {selectedVoucherForPrint.approvedBy}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}

      {editing && (
        <EditModal
          title={`Edit Expense - ${editing.expenseNo}`}
          initial={editing}
          fields={[
            { key: 'date', label: 'Date', type: 'date' },
            {
              key: 'categoryId',
              label: 'Expense Head',
              type: 'select',
              options: expenseCategories.map(c => ({ value: c.id, label: c.name }))
            },
            { key: 'description', label: 'Narration', type: 'textarea', required: true },
            { key: 'recipientName', label: 'Recipient' },
            { key: 'voucherRef', label: 'Voucher Ref' },
            { key: 'approvedBy', label: 'Authorized By' }
          ]}
          onSave={v => {
            const cat = expenseCategories.find(c => c.id === v.categoryId);
            return updateExpense(editing.id, { ...v, categoryName: cat?.name ?? editing.categoryName } as Partial<Expense>);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
