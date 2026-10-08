import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Calendar,
  Building,
  User,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Wallet,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Ban,
  RotateCcw,
  AlertTriangle,
  FileText,
  Percent,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { MoneyReceipt, PaymentMethodType } from '../../types/erp';
import { useToast } from '../common/ToastNotificationSystem';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';

interface DueCollectionViewProps {
  onOpenDueCollection?: (customerId?: string) => void;
}

export const DueCollectionView: React.FC<DueCollectionViewProps> = ({ onOpenDueCollection }) => {
  const {
    customers,
    salesmen,
    bankAccounts,
    moneyReceipts,
    createMoneyReceipt,
    updateMoneyReceipt,
    voidMoneyReceipt,
    deleteMoneyReceipt,
    resetDueCollectionsAndDues,
    settings
  } = useERP();
  const { showSuccess } = useToast();

  const isBn = settings.language === 'bn';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Voided'>('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<MoneyReceipt | null>(null);
  const [voidingReceipt, setVoidingReceipt] = useState<MoneyReceipt | null>(null);
  const [voidReason, setVoidReason] = useState('কাস্টমার চেক প্রত্যাখ্যাত / লেনদেন বাতিল');
  const [deletingReceipt, setDeletingReceipt] = useState<MoneyReceipt | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<MoneyReceipt | null>(null);
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State: Create Money Receipt
  const [formCustomerId, setFormCustomerId] = useState<string>(customers[0]?.id || '');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDiscountWaiver, setFormDiscountWaiver] = useState<number>(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [formBankAccountId, setFormBankAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [formTransactionRef, setFormTransactionRef] = useState<string>('');
  const [formCollectorSalesmanId, setFormCollectorSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [formReferenceInvoice, setFormReferenceInvoice] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State: Edit Money Receipt
  const [editNotes, setEditNotes] = useState<string>('');
  const [editTransactionRef, setEditTransactionRef] = useState<string>('');
  const [editCollectorSalesmanId, setEditCollectorSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [editReferenceInvoice, setEditReferenceInvoice] = useState<string>('');

  const selectedCustomerForCreate = customers.find(c => c.id === formCustomerId);

  // Quick preset amount when selecting a customer
  const handleSelectCustomer = (cId: string) => {
    setFormCustomerId(cId);
    const cust = customers.find(c => c.id === cId);
    if (cust && cust.currentDue > 0) {
      setFormAmount(cust.currentDue);
      if (cust.salesmanId) setFormCollectorSalesmanId(cust.salesmanId);
    } else {
      setFormAmount(0);
    }
    setFormDiscountWaiver(0);
  };

  // Open Create Modal
  const handleOpenCreate = (preselectedCustId?: string) => {
    const targetId = preselectedCustId || customers.find(c => c.currentDue > 0)?.id || customers[0]?.id || '';
    handleSelectCustomer(targetId);
    setFormPaymentMethod('Cash');
    setFormBankAccountId(bankAccounts[0]?.id || '');
    setFormTransactionRef('');
    setFormReferenceInvoice('');
    setFormNotes('');
    setFormError(null);
    setCreateSuccessMsg(null);
    setShowCreateModal(true);
  };

  // Submit Create Receipt
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerForCreate) {
      setFormError('দয়া করে গ্রাহক / ডিলার নির্বাচন করুন।');
      return;
    }
    if (formAmount <= 0) {
      setFormError('কালেকশনের পরিমাণ ০ এর বেশি হতে হবে।');
      return;
    }

    const res = createMoneyReceipt({
      customerId: selectedCustomerForCreate.id,
      amount: formAmount,
      discountWaiver: formDiscountWaiver > 0 ? formDiscountWaiver : undefined,
      paymentMethod: formPaymentMethod,
      bankAccountId: formPaymentMethod !== 'Cash' ? formBankAccountId : undefined,
      transactionRef: formTransactionRef.trim() || undefined,
      collectorSalesmanId: formCollectorSalesmanId || undefined,
      referenceInvoice: formReferenceInvoice.trim() || undefined,
      notes: formNotes.trim() || undefined
    });

    if (res.success && res.receiptNo) {
      if (formTransactionRef.trim()) recordFieldHistory('referenceNo', formTransactionRef.trim());
      if (formReferenceInvoice.trim()) recordFieldHistory('referenceNo', formReferenceInvoice.trim());
      if (formNotes.trim()) recordFieldHistory('notes', formNotes.trim());

      const msg = `মানি রসিদ #${res.receiptNo} সফলভাবে ইস্যু করা হয়েছে এবং কাস্টমার বকেয়া হ্রাস করা হয়েছে।`;
      showSuccess(msg, { title: 'মানি রসিদ ইস্যু সফল' });
      setCreateSuccessMsg(msg);
      setAlertBanner({
        type: 'success',
        message: msg
      });
      // Keep modal open and clear inputs for consecutive entries
      setFormAmount(0);
      setFormDiscountWaiver(0);
      setFormTransactionRef('');
      setFormReferenceInvoice('');
      setFormNotes('');
      setTimeout(() => setAlertBanner(null), 6000);
    } else {
      setFormError(res.error || 'মানি রসিদ তৈরি করতে ব্যর্থ হয়েছে।');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (receipt: MoneyReceipt) => {
    setEditingReceipt(receipt);
    setEditNotes(receipt.notes || '');
    setEditTransactionRef(receipt.transactionRef || '');
    setEditCollectorSalesmanId(receipt.collectorSalesmanId || '');
    setEditReferenceInvoice(receipt.referenceInvoice || '');
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceipt) return;

    const sMan = salesmen.find(s => s.id === editCollectorSalesmanId);
    const res = updateMoneyReceipt(editingReceipt.id, {
      notes: editNotes.trim(),
      transactionRef: editTransactionRef.trim(),
      collectorSalesmanId: editCollectorSalesmanId,
      collectorSalesmanName: sMan?.name,
      referenceInvoice: editReferenceInvoice.trim()
    });

    if (res.success) {
      setEditingReceipt(null);
      setAlertBanner({
        type: 'success',
        message: `মানি রসিদ #${editingReceipt.receiptNo} এর তথ্য সফলভাবে আপডেট করা হয়েছে।`
      });
      setTimeout(() => setAlertBanner(null), 5000);
    } else {
      alert(res.error || 'আপডেট ব্যর্থ হয়েছে');
    }
  };

  // Submit Void
  const handleConfirmVoid = () => {
    if (!voidingReceipt) return;
    const res = voidMoneyReceipt(voidingReceipt.id, voidReason);
    if (res.success) {
      setAlertBanner({
        type: 'success',
        message: `মানি রসিদ #${voidingReceipt.receiptNo} বাতিল (Voided) করা হয়েছে এবং কাস্টমার বকেয়ায় ৳${formatBDT(voidingReceipt.amount)} পুনর্বহাল করা হয়েছে।`
      });
      setVoidingReceipt(null);
      setTimeout(() => setAlertBanner(null), 6000);
    } else {
      alert(res.error || 'বাতিল করা সম্ভব হয়নি');
    }
  };

  // Submit Delete
  const handleConfirmDelete = () => {
    if (!deletingReceipt) return;
    const res = deleteMoneyReceipt(deletingReceipt.id);
    if (res.success) {
      setAlertBanner({
        type: 'success',
        message: `মানি রসিদ #${deletingReceipt.receiptNo} সিস্টেম থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।`
      });
      setDeletingReceipt(null);
      setTimeout(() => setAlertBanner(null), 5000);
    } else {
      alert(res.error || 'মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Handle Full Reset
  const handleZeroReset = () => {
    resetDueCollectionsAndDues();
    setShowResetConfirmModal(false);
    setAlertBanner({
      type: 'success',
      message: 'সকল বকেয়া কালেকশন ও মানি রসিদ শূন্য (০) রিসেট করা হয়েছে এবং গ্রাহক বকেয়া ব্যালেন্স শূন্যে সেট করা হয়েছে।'
    });
    setTimeout(() => setAlertBanner(null), 7000);
  };

  // Filtering & Sorting
  const filteredReceipts = moneyReceipts
    .filter(r => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.shopName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        (r.referenceInvoice && r.referenceInvoice.toLowerCase().includes(q)) ||
        (r.transactionRef && r.transactionRef.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q));

      const matchesMode = filterMode === 'All' || r.paymentMethod === filterMode;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesMode && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // KPI calculations
  const totalOutstandingDue = customers.reduce((sum, c) => sum + c.currentDue, 0);
  const confirmedReceipts = moneyReceipts.filter(r => r.status === 'Confirmed');
  const voidedReceiptsCount = moneyReceipts.filter(r => r.status === 'Voided').length;
  const totalCollectedConfirmed = confirmedReceipts.reduce((sum, r) => sum + r.amount, 0);
  const activeDebtorsCount = customers.filter(c => c.currentDue > 0).length;

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all shadow-sm ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 text-white flex items-center justify-center shadow-md">
              <Receipt className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isBn ? 'বকেয়া কালেকশন ও মানি রসিদ হাব' : 'Due Collection & Money Receipt Hub'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  CRUD & Live Zero-Reset
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBn
                  ? 'ডিলার বকেয়া জমা, স্বয়ংক্রিয় ইনভয়েস অ্যাডজাস্টমেন্ট, মানি রসিদ ইস্যু, রসিদ এডিট/ভয়েড ও প্রিন্টিং স্লিপ'
                  : 'Manage dealer collections, payment allocations, money receipt lifecycle, edits, voiding, and official slips'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Zero Reset Button */}
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="সকল মানি রসিদ ও ডিলার বকেয়া শূন্য (০) রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'শূন্য (০) রিসেট' : 'Zero Reset'}</span>
          </button>

          {/* Create Button */}
          <button
            onClick={() => handleOpenCreate()}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন কালেকশন জমা নিন' : 'Collect Dealer Due'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Due */}
        <div className="p-4.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'বর্তমান মোট বকেয়া (Market Due)' : 'Total Market Outstanding'}
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {formatBDT(totalOutstandingDue)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              {activeDebtorsCount} {isBn ? 'জন ডিলারের বকেয়া পাওনা রয়েছে' : 'active dealers with pending dues'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-4.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'মোট আদায়কৃত কালেকশন' : 'Total Confirmed Collections'}
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatBDT(totalCollectedConfirmed)}
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
              {confirmedReceipts.length} {isBn ? 'টি অনুমোদিত মানি রসিদ' : 'confirmed payment vouchers'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Latest Receipt */}
        <div className="p-4.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'সর্বশেষ মানি রসিদ নং' : 'Latest Receipt No'}
            </div>
            <div className="text-base font-black text-blue-600 mt-1 font-mono">
              {moneyReceipts[0]?.receiptNo || (isBn ? 'কোনো রসিদ নেই' : 'No Receipt Yet')}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              {moneyReceipts[0] ? formatDate(moneyReceipts[0].date) : 'রিসেট অবস্থায় রয়েছে'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Voided Count & Status */}
        <div className="p-4.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'বাতিলকৃত রসিদ (Voided)' : 'Voided / Rolled Back'}
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {voidedReceiptsCount} <span className="text-xs font-normal text-slate-400">টি</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              অডিট ট্রেইলে সংরক্ষিত থাকে
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'রসিদ নং (MR-..), শপের নাম, ফোন, ইনভয়েস বা নোট সার্চ করুন...' : 'Search MR No, shop, customer phone, notes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="text-xs bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="All">সকল মাধ্যম (All Methods)</option>
              <option value="Cash">নগদ ক্যাশ (Cash)</option>
              <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
              <option value="Cheque">চেক (Cheque)</option>
              <option value="bKash">বিকাশ (bKash)</option>
              <option value="Nagad">নগদ (Nagad)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="All">সকল স্ট্যাটাস (All Status)</option>
              <option value="Confirmed">অনুমোদিত (Confirmed)</option>
              <option value="Voided">বাতিলকৃত (Voided)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-sm">
              {isBn ? 'ইস্যুকৃত মানি রসিদ রেজিস্টার' : 'Money Receipts Register'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {filteredReceipts.length} {isBn ? 'টি রসিদ প্রদর্শিত' : 'records displayed'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">রসিদ নম্বর</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">ডিলার শপ ও ঠিকানা</th>
                <th className="py-3 px-4">পেমেন্ট মেথড ও অ্যাকাউন্ট</th>
                <th className="py-3 px-4 text-right">আদায় পরিমাণ</th>
                <th className="py-3 px-4">আদায়কারী অফিসার</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReceipts.map((rcpt) => {
                const isVoided = rcpt.status === 'Voided';
                return (
                  <tr
                    key={rcpt.id}
                    className={`hover:bg-slate-50/80 transition-colors ${isVoided ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono font-black text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <span className={isVoided ? 'line-through text-slate-400' : ''}>{rcpt.receiptNo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(rcpt.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-extrabold text-slate-900 ${isVoided ? 'line-through text-slate-400' : ''}`}>
                        {rcpt.shopName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {rcpt.customerPhone} • {rcpt.area}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                          {rcpt.paymentMethod}
                        </span>
                      </div>
                      {rcpt.bankName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                          {rcpt.bankName}
                        </div>
                      )}
                      {rcpt.transactionRef && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: {rcpt.transactionRef}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`font-black font-mono text-sm ${isVoided ? 'line-through text-slate-400' : 'text-emerald-600'}`}>
                        {formatBDT(rcpt.amount)}
                      </div>
                      {rcpt.discountWaiver ? (
                        <div className="text-[10px] text-amber-600 font-bold">
                          মওকুফ: {formatBDT(rcpt.discountWaiver)}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rcpt.collectorSalesmanName || 'সরাসরি হেড অফিস'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isVoided ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300">
                          <Ban className="w-3 h-3" />
                          বাতিল (Voided)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3" />
                          অনুমোদিত
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* Print Button */}
                        <button
                          onClick={() => setSelectedReceiptForPrint(rcpt)}
                          className="p-1.5 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition cursor-pointer"
                          title="মানি রসিদ স্লিপ ভিউ ও প্রিন্ট"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        {!isVoided && (
                          <button
                            onClick={() => handleOpenEdit(rcpt)}
                            className="p-1.5 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition cursor-pointer"
                            title="রসিদের তথ্য এডিট"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Void Button */}
                        {!isVoided && (
                          <button
                            onClick={() => {
                              setVoidingReceipt(rcpt);
                              setVoidReason('কাস্টমার চেক প্রত্যাখ্যাত / লেনদেন বাতিল');
                            }}
                            className="p-1.5 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition cursor-pointer"
                            title="রসিদ বাতিল (Void) করুন ও বকেয়া ফেরত দিন"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingReceipt(rcpt)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-700 rounded-lg transition cursor-pointer"
                          title="মানি রসিদ স্থায়ীভাবে মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">কোনো মানি রসিদ পাওয়া যায়নি।</p>
                      <button
                        onClick={() => handleOpenCreate()}
                        className="mt-2 text-xs font-black text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>নতুন কালেকশন জমা নিতে এখানে ক্লিক করুন</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Money Receipt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isBn ? 'নতুন ডিলার কালেকশন ও মানি রসিদ এন্ট্রি' : 'Record Dealer Collection & Issue Money Receipt'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    কালেকশন জমা নেওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে কাস্টমার বকেয়া হ্রাস পাবে
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {createSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{createSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateSuccessMsg(null);
                  }}
                  className="text-[11px] underline text-emerald-700 hover:text-emerald-900 font-medium shrink-0 cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  গ্রাহক / ডিলার নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shopName} ({c.ownerName}) — বকেয়া: ৳{c.currentDue.toLocaleString('en-IN')} [{c.area}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Outstanding Due Snapshot Pill */}
              {selectedCustomerForCreate && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-800 font-bold block">বর্তমান বকেয়া (Current Outstanding):</span>
                    <span className="text-base font-black text-rose-600 font-mono">
                      {formatBDT(selectedCustomerForCreate.currentDue)}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormAmount(selectedCustomerForCreate.currentDue)}
                      className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-300 text-amber-900 rounded-lg text-[10px] font-black cursor-pointer"
                    >
                      সম্পূর্ণ বকেয়া (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormAmount(Math.round(selectedCustomerForCreate.currentDue / 2))}
                      className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-300 text-amber-900 rounded-lg text-[10px] font-black cursor-pointer"
                    >
                      ৫০% (50%)
                    </button>
                  </div>
                </div>
              )}

              {/* Amount and Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    কালেকশন পরিমাণ (টাকা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formAmount || ''}
                    onChange={(e) => {
                      setFormAmount(Number(e.target.value) || 0);
                      setCreateSuccessMsg(null);
                    }}
                    placeholder="৳ 50,000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ছাড় / ডিসকাউন্ট মওকুফ (ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDiscountWaiver || ''}
                    onChange={(e) => {
                      setFormDiscountWaiver(Number(e.target.value) || 0);
                      setCreateSuccessMsg(null);
                    }}
                    placeholder="৳ 0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Payment Method & Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    পেমেন্ট মেথড <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => {
                      setFormPaymentMethod(e.target.value as PaymentMethodType);
                      setCreateSuccessMsg(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cash">নগদ ক্যাশ (Cash)</option>
                    <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                    <option value="Cheque">চেক (Cheque)</option>
                    <option value="bKash">বিকাশ (bKash)</option>
                    <option value="Nagad">নগদ (Nagad)</option>
                  </select>
                </div>

                {formPaymentMethod !== 'Cash' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      জমা নেওয়ার ব্যাংক / MFS অ্যাকাউন্ট <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formBankAccountId}
                      onChange={(e) => {
                        setFormBankAccountId(e.target.value);
                        setCreateSuccessMsg(null);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} — ব্যালেন্স: ৳{b.currentBalance.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">নগদ প্রাপ্তি ভল্ট</label>
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600">
                      প্রধান ক্যাশ কাউন্টার / ক্যাশ ইন হ্যান্ড
                    </div>
                  </div>
                )}
              </div>

              {/* Ref No & Collector Salesman */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ট্রানজেকশন আইডি / চেক নম্বর / রেফারেন্স
                  </label>
                  <HistoryInput
                    historyKey="referenceNo"
                    value={formTransactionRef}
                    onChange={(e) => {
                      setFormTransactionRef(e.target.value);
                      setCreateSuccessMsg(null);
                    }}
                    placeholder="FT-99128 / CQ-00129 / TrxID"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">আদায়কারী সেলসম্যান</label>
                  <select
                    value={formCollectorSalesmanId}
                    onChange={(e) => {
                      setFormCollectorSalesmanId(e.target.value);
                      setCreateSuccessMsg(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">সরাসরি হেড অফিস / কাউন্টার</option>
                    {salesmen.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.assignedArea})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference Invoice & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">রেফারেন্স ইনভয়েস নং</label>
                  <HistoryInput
                    historyKey="referenceNo"
                    value={formReferenceInvoice}
                    onChange={(e) => {
                      setFormReferenceInvoice(e.target.value);
                      setCreateSuccessMsg(null);
                    }}
                    placeholder="SAL-2026-000210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">নোট / মন্তব্য</label>
                  <HistoryInput
                    historyKey="notes"
                    value={formNotes}
                    onChange={(e) => {
                      setFormNotes(e.target.value);
                      setCreateSuccessMsg(null);
                    }}
                    placeholder="নগদ কিস্তি জমা..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Remaining Due Preview */}
              {selectedCustomerForCreate && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>জমার পর অবশিষ্ট বকেয়া (Remaining Due):</span>
                  <span className="font-mono text-sm font-black">
                    {formatBDT(Math.max(0, selectedCustomerForCreate.currentDue - formAmount - formDiscountWaiver))}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>মানি রসিদ ইস্যু করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Money Receipt Modal */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">মানি রসিদ সংশোধন (Edit MR)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">রসিদ নম্বর: {editingReceipt.receiptNo}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingReceipt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div>
                  <span className="text-slate-400">ডিলার: </span>
                  <span className="font-black text-slate-800">{editingReceipt.shopName}</span>
                </div>
                <div>
                  <span className="text-slate-400">পরিমাণ: </span>
                  <span className="font-mono font-black text-emerald-600">{formatBDT(editingReceipt.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400">মাধ্যম: </span>
                  <span className="font-bold text-blue-600">{editingReceipt.paymentMethod}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ট্রানজেকশন রেফারেন্স</label>
                <HistoryInput
                  historyKey="referenceNo"
                  value={editTransactionRef}
                  onChange={(e) => setEditTransactionRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আদায়কারী সেলসম্যান</label>
                <select
                  value={editCollectorSalesmanId}
                  onChange={(e) => setEditCollectorSalesmanId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">সরাসরি হেড অফিস</option>
                  {salesmen.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.assignedArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">রেফারেন্স ইনভয়েস</label>
                <HistoryInput
                  historyKey="referenceNo"
                  value={editReferenceInvoice}
                  onChange={(e) => setEditReferenceInvoice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">নোট / মন্তব্য</label>
                <HistoryInput
                  historyKey="notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  আপডেট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Void Confirmation Modal */}
      {voidingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">মানি রসিদ বাতিল করবেন?</h3>
              <p className="text-xs text-slate-500">
                রসিদ #{voidingReceipt.receiptNo} বাতিল করলে ৳{formatBDT(voidingReceipt.amount)} স্বয়ংক্রিয়ভাবে {voidingReceipt.shopName}-এর বকেয়া হিসেবে আবার যুক্ত হবে।
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">বাতিল করার কারণ:</label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="চেক বাউন্স / ভুল এন্ট্রি..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidingReceipt(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                হ্যাঁ, বাতিল ও বকেয়া রিভার্স করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation Modal */}
      {deletingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base">মানি রসিদ ডিলিট করবেন?</h3>
              <p className="text-xs text-slate-500">
                রসিদ #{deletingReceipt.receiptNo} ডিলিট করলে এটি তালিকা থেকে মুছে যাবে।
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReceipt(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                স্থায়ীভাবে মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Zero Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-rose-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-300 mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-slate-900 text-lg">
                {isBn ? 'কালেকশন ও বকেয়া শূন্য (০) রিসেট করবেন?' : 'Zero-Reset All Collections & Customer Dues?'}
              </h3>
              <div className="text-xs text-slate-600 font-medium space-y-1.5 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 text-left">
                <p className="font-bold text-rose-900">এই অ্যাকশনটি সম্পন্ন করলে:</p>
                <ul className="list-disc list-inside space-y-1 text-rose-700 text-[11px]">
                  <li>সকল মানি রসিদ (Money Receipts) সম্পূর্ণ মুছে ফেলা হবে (০ টি রসিদ)।</li>
                  <li>সকল ডিলারের বর্তমান বকেয়া (Current Due) ৳ ০ (শূন্য) করা হবে।</li>
                  <li>ক্যাশ বই থেকে বকেয়া কালেকশনের লেনদেনগুলো রিসেট হবে।</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                না, বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={handleZeroReset}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>হ্যাঁ, শূন্য (০) রিসেট নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Printable Money Receipt Slip */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative border border-slate-200 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedReceiptForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Voucher Paper */}
            <div className="border border-slate-300 p-6 rounded-2xl bg-amber-50/15 font-sans space-y-4">
              <div className="text-center border-b border-slate-300 pb-3">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {settings.companyName || 'TeleCorp Mobile Distribution Ltd.'}
                </h2>
                <p className="text-[10px] text-slate-500">
                  {settings.companyAddress || 'Motijheel C/A, Dhaka-1000'} | Phone: {settings.companyPhone || '+880 1711-002233'}
                </p>
                <div className="inline-block mt-2 px-3.5 py-0.5 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-full tracking-wider shadow-xs">
                  অফিসিয়াল মানি রসিদ (Official Money Receipt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">রসিদ নম্বর (MR No):</span>
                  <span className="font-mono font-black text-slate-800 text-sm">{selectedReceiptForPrint.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block font-bold">তারিখ (Date):</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedReceiptForPrint.date)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400 font-bold">গ্রাহক / ডিলারের নাম: </span>
                  <span className="font-black text-slate-900">{selectedReceiptForPrint.shopName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">স্বত্বাধিকারী / মোবাইল: </span>
                  <span className="font-medium text-slate-700">{selectedReceiptForPrint.customerName} ({selectedReceiptForPrint.customerPhone})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">এলাকা / জেলা: </span>
                  <span className="font-medium text-slate-700">{selectedReceiptForPrint.area}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">পেমেন্ট মাধ্যম: </span>
                  <span className="font-bold text-blue-600">
                    {selectedReceiptForPrint.paymentMethod}
                    {selectedReceiptForPrint.bankName ? ` (${selectedReceiptForPrint.bankName})` : ''}
                  </span>
                </div>
                {selectedReceiptForPrint.transactionRef && (
                  <div>
                    <span className="text-slate-400 font-bold">রেফারেন্স / TrxID: </span>
                    <span className="font-mono font-bold text-slate-800">{selectedReceiptForPrint.transactionRef}</span>
                  </div>
                )}
                {selectedReceiptForPrint.collectorSalesmanName && (
                  <div>
                    <span className="text-slate-400 font-bold">কালেক্টর অফিসার: </span>
                    <span className="font-medium text-slate-700">{selectedReceiptForPrint.collectorSalesmanName}</span>
                  </div>
                )}
                {selectedReceiptForPrint.notes && (
                  <div>
                    <span className="text-slate-400 font-bold">বিবরণ / নোট: </span>
                    <span className="font-medium text-slate-700">{selectedReceiptForPrint.notes}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-bold">স্ট্যাটাস: </span>
                  <span className={`font-bold ${selectedReceiptForPrint.status === 'Voided' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedReceiptForPrint.status === 'Voided' ? 'বাতিলকৃত (Voided)' : 'অনুমোদিত ও সংগৃহীত (Confirmed)'}
                  </span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-bold block">প্রাপ্ত টাকার পরিমাণ (Amount Received):</span>
                <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
                  {formatBDT(selectedReceiptForPrint.amount)}
                </span>
                {selectedReceiptForPrint.discountWaiver ? (
                  <span className="text-[11px] font-bold text-amber-700 mt-1 block">
                    (অতিরিক্ত মওকুফ ছাড়: {formatBDT(selectedReceiptForPrint.discountWaiver)})
                  </span>
                ) : null}
              </div>

              <div className="pt-8 grid grid-cols-2 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1 mx-4 font-bold">আদায়কারীর স্বাক্ষর</div>
                <div className="border-t border-slate-300 pt-1 mx-4 font-bold">অনুমোদিত স্বাক্ষর ও সিল</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
