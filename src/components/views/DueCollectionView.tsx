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
  X
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

interface DueCollectionViewProps {
  onOpenDueCollection: (customerId?: string) => void;
}

export const DueCollectionView: React.FC<DueCollectionViewProps> = ({ onOpenDueCollection }) => {
  const { customers, salesInvoices, cashTransactions, settings } = useERP();
  const isBn = settings.language === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<any | null>(null);

  // Compute all collections from customer invoices and cash transactions
  const collectionsFromInvoices = salesInvoices.flatMap(inv =>
    (inv.payments || []).map((pay, idx) => {
      const cust = customers.find(c => c.id === inv.customerId);
      return {
        id: `rcpt-${inv.id}-${idx}`,
        receiptNo: `MR-${inv.invoiceNo.replace('INV-', '')}-${idx + 1}`,
        date: inv.invoiceDate,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerPhone: cust?.mobile || '01711-xxxxxx',
        shopName: cust?.shopName || inv.customerName,
        area: cust?.area || 'Dhaka',
        amount: pay.amount,
        method: pay.method,
        referenceInvoice: inv.invoiceNo,
        notes: `Payment for ${inv.invoiceNo}`,
        status: 'Confirmed'
      };
    })
  );

  // Customer collection cash transactions
  const collectionsFromCash = cashTransactions
    .filter(tx => tx.type === 'Cash In' && (tx.category === 'Due Collection' || tx.category === 'Customer Sale'))
    .map(tx => {
      return {
        id: tx.id,
        receiptNo: `MR-${tx.referenceNo || tx.id.replace('c-tx-', '')}`,
        date: tx.date,
        customerId: 'cust-general',
        customerName: tx.description || 'Dealer Collection',
        customerPhone: '01811-xxxxxx',
        shopName: tx.description || 'Dealer Partner',
        area: 'Bangladesh',
        amount: tx.amount,
        method: 'Cash' as const,
        referenceInvoice: tx.referenceNo || 'Direct Receipt',
        notes: tx.description,
        status: 'Confirmed'
      };
    });

  // Combine and deduplicate
  const allReceipts = [...collectionsFromInvoices, ...collectionsFromCash]
    .filter((rcpt, index, self) => index === self.findIndex(r => r.receiptNo === rcpt.receiptNo))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredReceipts = allReceipts.filter(r => {
    const matchesSearch =
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referenceInvoice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === 'All' || r.method.toLowerCase() === filterMode.toLowerCase();
    return matchesSearch && matchesMode;
  });

  const totalOutstandingDue = customers.reduce((sum, c) => sum + c.currentDue, 0);
  const totalCollectedAllTime = allReceipts.reduce((sum, r) => sum + r.amount, 0);
  const activeDebtorsCount = customers.filter(c => c.currentDue > 0).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isBn ? 'বকেয়া কালেকশন ও মানি রসিদ (Money Receipts)' : 'Due Collection & Money Receipt Hub'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? 'ডিলার বকেয়া আদায়, ক্যাশ/ব্যাংক/বিকাশ পেমেন্ট ভাউচার এবং অফিশিয়াল মানি রসিদ প্রিন্ট'
                  : 'Track dealer collections, payment allocations, cash/bank receipts, and print official payment slips'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenDueCollection()}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন কালেকশন জমা নিন' : 'Collect Dealer Due'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'মোট বকেয়া (Market Outstanding)' : 'Total Market Due'}
            </div>
            <div className="text-xl font-black text-rose-600 mt-1">
              {formatBDT(totalOutstandingDue)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              {activeDebtorsCount} ডিলার পার্টি বাকি রয়েছে
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'মোট আদায়কৃত কালেকশন' : 'Total Collected (All Time)'}
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {formatBDT(totalCollectedAllTime)}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
              {allReceipts.length} টি মানি রসিদ ইস্যু হয়েছে
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'সর্বশেষ রসিদ নম্বর' : 'Latest Receipt'}
            </div>
            <div className="text-base font-black text-blue-600 mt-1 font-mono">
              {allReceipts[0]?.receiptNo || 'MR-0001'}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              {allReceipts[0]?.date || 'Today'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'পেমেন্ট চ্যানেল' : 'Payment Channels'}
            </div>
            <div className="text-base font-black text-slate-800 mt-1">
              ক্যাশ, ব্যাংক ও এমএফএস
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
              bKash / Nagad / Check / Transfer
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'রসিদ নং, শপের নাম বা ইনভয়েস সার্চ করুন...' : 'Search by MR No, shop, customer...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">সকল পেমেন্ট মেথড (All)</option>
            <option value="Cash">ক্যাশ (Cash)</option>
            <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
            <option value="Cheque">চেক (Cheque)</option>
            <option value="bKash">বিকাশ (bKash)</option>
            <option value="Nagad">নগদ (Nagad)</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm">
            {isBn ? 'ইস্যুকৃত মানি রসিদ তালিকা' : 'Issued Money Receipts Register'}
          </h3>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {filteredReceipts.length} {isBn ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">রসিদ নম্বর (MR No)</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">ডিলার শপ ও গ্রাহক</th>
                <th className="py-3 px-4">পেমেন্ট মেথড</th>
                <th className="py-3 px-4 text-right">কালেকশন পরিমাণ</th>
                <th className="py-3 px-4">রেফারেন্স / নোট</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReceipts.map((rcpt) => (
                <tr key={rcpt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-emerald-700">
                    {rcpt.receiptNo}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatDate(rcpt.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{rcpt.shopName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{rcpt.customerPhone} • {rcpt.area}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {rcpt.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600 font-mono text-sm">
                    {formatBDT(rcpt.amount)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {rcpt.notes}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceiptForPrint(rcpt)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                      title="View & Print Money Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>রসিদ প্রিন্ট</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    কোনো মানি রসিদ পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Money Receipt Modal */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-slate-200">
            <button
              onClick={() => setSelectedReceiptForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Paper Area */}
            <div className="border border-slate-300 p-6 rounded-2xl bg-amber-50/20 font-sans space-y-4">
              <div className="text-center border-b border-slate-300 pb-3">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">TeleCorp Mobile Distribution Ltd.</h2>
                <p className="text-[10px] text-slate-500">Motijheel C/A, Dhaka-1000 | Phone: +880 1711-002233</p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-full">
                  অফিসিয়াল মানি রসিদ (Official Money Receipt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">রসিদ নম্বর (MR No):</span>
                  <span className="font-mono font-black text-slate-800">{selectedReceiptForPrint.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">তারিখ (Date):</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedReceiptForPrint.date)}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-400">গ্রাহক / ডিলারের নাম: </span>
                  <span className="font-black text-slate-900">{selectedReceiptForPrint.shopName}</span>
                </div>
                <div>
                  <span className="text-slate-400">মোবাইল: </span>
                  <span className="font-medium text-slate-700">{selectedReceiptForPrint.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400">পেমেন্ট মাধ্যম: </span>
                  <span className="font-bold text-blue-600">{selectedReceiptForPrint.method}</span>
                </div>
                <div>
                  <span className="text-slate-400">বিবরণ / রেফারেন্স: </span>
                  <span className="font-medium text-slate-700">{selectedReceiptForPrint.notes}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-bold block">প্রাপ্ত টাকার পরিমাণ (Amount Received):</span>
                <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
                  {formatBDT(selectedReceiptForPrint.amount)}
                </span>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1 mx-4">আদায়কারীর স্বাক্ষর</div>
                <div className="border-t border-slate-300 pt-1 mx-4">অনুমোদিত স্বাক্ষর ও সিল</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
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
