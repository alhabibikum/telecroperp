import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  PlusCircle,
  Search,
  CheckCircle,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { PaymentMethodType, Expense, ExpenseCategory } from '../../types/erp';
import { RowActions, EditModal } from '../common/CrudKit';

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
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg">Add</button>
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
    createExpense,
    updateExpense,
    deleteExpense
  } = useERP();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [approvedBy, setApprovedBy] = useState('Masum Billah');
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
      date: new Date().toISOString().split('T')[0],
      categoryId: cat.id,
      categoryName: cat.name,
      amount,
      paymentMethod,
      bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
      description,
      approvedBy
    });

    setShowAddModal(false);
    setDescription('');
    setStatusMsg(`খরচ ভাউচার ৳${amount.toLocaleString('en-IN')} (${cat.name}) সফলভাবে বুক করা হয়েছে।`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Operational & Overhead Expense Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Office rents, staff allowances, transport logistics and double-entry general ledger posting
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
          <div className="text-lg font-black text-slate-900 mt-1">{formatBDT(totalExpense)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Expense Categories</div>
          <div className="text-lg font-black text-blue-700 mt-1">{expenseCategories.length} Standard Codes</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Current Month Disbursed</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{formatBDT(totalExpense)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Expense Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Expense Head</th>
              <th className="p-3">Narration / Details</th>
              <th className="p-3">Payment Channel</th>
              <th className="p-3">Authorized By</th>
              <th className="p-3 text-right">Amount (BDT)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-blue-700">{exp.expenseNo}</td>
                <td className="p-3 text-slate-600">{formatDate(exp.date)}</td>
                <td className="p-3 font-semibold text-slate-900">{exp.categoryName}</td>
                <td className="p-3 text-slate-600 max-w-sm">{exp.description}</td>
                <td className="p-3">
                  <span className="font-medium text-slate-700">{exp.paymentMethod}</span>
                </td>
                <td className="p-3 text-slate-700">{exp.approvedBy}</td>
                <td className="p-3 text-right font-extrabold text-slate-900">{formatBDT(exp.amount)}</td>
                <td className="p-3 text-right">
                  <RowActions
                    onEdit={() => setEditing(exp)}
                    onDelete={() => deleteExpense(exp.id)}
                    deleteTitle={`Delete expense ${exp.expenseNo}?`}
                    deleteMessage="The payment is reversed in cash/bank and a reversing journal entry is posted. To change the amount, delete and re-record the expense."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Record Business Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Head / Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(parseFloat(e.target.value) || 0);
                    setFormError(null);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value as PaymentMethodType);
                      setFormError(null);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer</option>
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
                    <label className="block font-semibold text-slate-700 mb-1">Debit Bank</label>
                    <select
                      value={bankAccountId}
                      onChange={(e) => {
                        setBankAccountId(e.target.value);
                        setFormError(null);
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Narration / Voucher Description *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Courier charges for consignments"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save & Post to Books
                </button>
              </div>
            </form>
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
