import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Wallet,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  Coins,
  ChevronDown,
  ChevronUp,
  X,
  FileText
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import type { DayClosingRecord } from '../../types/erp';

export const DayClosingView: React.FC = () => {
  const {
    dayClosings,
    warehouses,
    performDayClosing,
    salesInvoices,
    cashTransactions,
    chartOfAccounts,
    currentUserRole
  } = useERP();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [cashierName, setCashierName] = useState('Farhana Akhter (Cashier)');
  const [closingNotes, setClosingNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<DayClosingRecord | null>(null);

  // Denominations breakdown state
  const [showDenominations, setShowDenominations] = useState(false);
  const [denominations, setDenominations] = useState({
    n1000: 0,
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0
  });

  // Calculate actual cash from denominations if user uses calculator
  const calculatedDenominationTotal = useMemo(() => {
    return (
      denominations.n1000 * 1000 +
      denominations.n500 * 500 +
      denominations.n200 * 200 +
      denominations.n100 * 100 +
      denominations.n50 * 50 +
      denominations.n20 * 20 +
      denominations.n10 * 10 +
      denominations.coins
    );
  }, [denominations]);

  const [actualPhysicalCash, setActualPhysicalCash] = useState<number>(0);

  // Sync actual cash when denominations change
  const handleDenominationChange = (key: keyof typeof denominations, val: number) => {
    const updated = { ...denominations, [key]: Math.max(0, val) };
    setDenominations(updated);
    const total =
      updated.n1000 * 1000 +
      updated.n500 * 500 +
      updated.n200 * 200 +
      updated.n100 * 100 +
      updated.n50 * 50 +
      updated.n20 * 20 +
      updated.n10 * 10 +
      updated.coins;
    setActualPhysicalCash(total);
  };

  // Sync opening float when warehouse changes
  const [openingCash, setOpeningCash] = useState<number>(() => {
    const lastForWh = dayClosings.find(c => c.warehouseId === warehouseId);
    return lastForWh?.actualPhysicalCash ?? (chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0);
  });

  useEffect(() => {
    const lastForWh = dayClosings.find(c => c.warehouseId === warehouseId);
    if (lastForWh) {
      setOpeningCash(lastForWh.actualPhysicalCash);
    } else {
      setOpeningCash(chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0);
    }
  }, [warehouseId, dayClosings]);

  // Compute daily totals strictly for the chosen date and warehouse
  const isMatchingDate = (txDate: string) => {
    if (!txDate) return false;
    return txDate.startsWith(date);
  };

  // Warehouse-filtered Invoices
  const warehouseInvoices = salesInvoices.filter(inv =>
    isMatchingDate(inv.invoiceDate) &&
    (!warehouseId || inv.warehouseId === warehouseId)
  );

  const cashSalesFromInvoices = warehouseInvoices.reduce((acc, inv) => {
    const cashPayments = (inv.payments || []).filter(p => p.method === 'Cash');
    return acc + cashPayments.reduce((sum, p) => sum + p.amount, 0);
  }, 0);

  // Standalone Cash Transactions (avoiding double counting invoices)
  const invoiceDocNumbers = new Set(warehouseInvoices.map(i => i.invoiceNo));
  const standaloneCashSales = cashTransactions
    .filter(c =>
      c.type === 'Cash In' &&
      c.category === 'Customer Sale' &&
      isMatchingDate(c.date) &&
      (!c.warehouseId || c.warehouseId === warehouseId) &&
      !invoiceDocNumbers.has(c.referenceNo) &&
      !invoiceDocNumbers.has(c.voucherNo || '')
    )
    .reduce((acc, c) => acc + c.amount, 0);

  const cashSalesTotal = cashSalesFromInvoices + standaloneCashSales;

  const dueCollectionsTotal = cashTransactions
    .filter(c =>
      c.type === 'Cash In' &&
      c.category === 'Due Collection' &&
      isMatchingDate(c.date) &&
      (!c.warehouseId || c.warehouseId === warehouseId)
    )
    .reduce((acc, c) => acc + c.amount, 0);

  const cashExpensesTotal = cashTransactions
    .filter(c =>
      c.type === 'Cash Out' &&
      c.category === 'Expense' &&
      isMatchingDate(c.date) &&
      (!c.warehouseId || c.warehouseId === warehouseId)
    )
    .reduce((acc, c) => acc + c.amount, 0);

  const bankDepositsTotal = cashTransactions
    .filter(c =>
      c.type === 'Cash Out' &&
      c.category === 'Cash To Bank' &&
      isMatchingDate(c.date) &&
      (!c.warehouseId || c.warehouseId === warehouseId)
    )
    .reduce((acc, c) => acc + c.amount, 0);

  const expectedClosingCash = openingCash + cashSalesTotal + dueCollectionsTotal - cashExpensesTotal - bankDepositsTotal;
  const discrepancy = actualPhysicalCash - expectedClosingCash;
  const closingStatus = discrepancy === 0 ? 'Balanced' : discrepancy < 0 ? 'Shortage' : 'Surplus';

  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);

  // Check if already closed on this date for this warehouse
  const existingClosing = dayClosings.find(c => c.date === date && c.warehouseId === warehouseId);

  const handlePerformClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    if (existingClosing) {
      if (!confirm(`সতর্কতা: ${date} তারিখে ${selectedWarehouse.name} এর জন্য ইতিপূর্বে দিন সমাপ্তি (Slip #${existingClosing.closingNo}) করা হয়েছে। আপনি কি নিশ্চিত যে পুনরায় ক্লোজিং সম্পন্ন করতে চান?`)) {
        return;
      }
    }

    const res = performDayClosing({
      date,
      cashierName,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      openingCash,
      cashSalesTotal,
      dueCollectionsTotal,
      cashExpensesTotal,
      bankDepositsTotal,
      expectedClosingCash,
      actualPhysicalCash,
      discrepancy,
      status: closingStatus,
      verifiedBy: `${currentUserRole} (Manager)`,
      notes: closingNotes || `নগদ টিল ক্যাশ ভেরিফাইড। স্ট্যাটাস: ${closingStatus} (${formatBDT(discrepancy)})`
    });

    if (res.success) {
      setMessage(`দিন সমাপ্তি ক্লোজিং #${res.closingNo} সফলভাবে সম্পন্ন ও লক করা হয়েছে!`);
      const newlyCreatedSlip = dayClosings.find(c => c.closingNo === res.closingNo);
      if (newlyCreatedSlip) {
        setSelectedSlipForPrint(newlyCreatedSlip);
      }
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              End-of-Day Business Closing & Cashier Shift Handover
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            কাউন্টার টিল ক্যাশ যাচাই, ব্রাঞ্চ ভিত্তিক ঘাটতি/উদ্বৃত্ত হিসাব ও সাইন করা অডিট ভাউচার প্রিন্ট
          </p>
        </div>

        {existingClosing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>এই তারিখে ইতোমধ্যে ক্লোজিং সম্পন্ন হয়েছে ({existingClosing.closingNo})</span>
          </div>
        )}
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Main Closing Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          Daily Cash Register Till Reconciliation (কাউন্টার ক্যাশ রিকনসিলিয়েশন)
        </h3>

        <form onSubmit={handlePerformClosing} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Closing Business Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility / Outlet Register</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Responsible Shift Cashier</label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opening Cash Till Float (৳)</label>
              <input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                required
              />
            </div>
          </div>

          {/* Mathematical Reconciliation Matrix */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[11px]">Opening Cash in Till</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{formatBDT(openingCash)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[11px]">+ Cash Sales Total</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">+{formatBDT(cashSalesTotal)}</div>
                <span className="text-[10px] text-slate-400">ইনভয়েস: {formatBDT(cashSalesFromInvoices)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[11px]">+ Due Collections</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">+{formatBDT(dueCollectionsTotal)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[11px]">- Cash Expenses</span>
                <div className="font-bold text-rose-700 text-sm mt-0.5">-{formatBDT(cashExpensesTotal)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[11px]">- Bank Deposits</span>
                <div className="font-bold text-blue-700 text-sm mt-0.5">-{formatBDT(bankDepositsTotal)}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  System Calculated Expected Physical Cash (প্রত্যাশিত নগদ):
                </span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatBDT(expectedClosingCash)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      গণনাকৃত মোট ক্যাশ (Counted Physical Cash ৳) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDenominations(prev => !prev)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer ml-2"
                    >
                      <Coins className="w-3 h-3" />
                      <span>{showDenominations ? 'নোট ক্যালকুলেটর লুকান' : 'নোট গণনা ক্যালকুলেটর'}</span>
                      {showDenominations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={actualPhysicalCash}
                    onChange={(e) => setActualPhysicalCash(parseFloat(e.target.value) || 0)}
                    placeholder="হাতে গণনাকৃত টাকা লিখুন..."
                    className="p-2 border border-slate-300 rounded-lg font-mono font-black text-sm text-blue-900 w-52 bg-white"
                    required
                  />
                </div>

                <div className="text-right pl-3 border-l border-slate-300">
                  <div className="text-[11px] text-slate-500 font-semibold">পার্থক্য (Variance)</div>
                  <div className={`font-black text-sm mt-0.5 ${
                    discrepancy === 0 ? 'text-emerald-700' : discrepancy < 0 ? 'text-rose-700' : 'text-blue-700'
                  }`}>
                    {discrepancy === 0 ? '✓ Balanced (৳ 0)' : `${discrepancy < 0 ? 'Shortage (ঘাটতি)' : 'Surplus (উদ্বৃত্ত)'}: ${formatBDT(discrepancy)}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Denomination Calculator */}
            {showDenominations && (
              <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>নোট ডেনমিনেশন কাউন্টার (Note Denomination Breakdown)</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700">
                    মোট: {formatBDT(calculatedDenominationTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    { label: '৳ ১০০০', key: 'n1000' as const, note: 1000 },
                    { label: '৳ ৫০০', key: 'n500' as const, note: 500 },
                    { label: '৳ ২০০', key: 'n200' as const, note: 200 },
                    { label: '৳ ১০০', key: 'n100' as const, note: 100 },
                    { label: '৳ ৫০', key: 'n50' as const, note: 50 },
                    { label: '৳ ২০', key: 'n20' as const, note: 20 },
                    { label: '৳ ১০', key: 'n10' as const, note: 10 },
                    { label: 'কয়েন/খুচরা', key: 'coins' as const, note: 1 }
                  ].map(item => (
                    <div key={item.key} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div className="font-bold text-slate-700 text-[11px] mb-1">{item.label}</div>
                      <input
                        type="number"
                        min="0"
                        value={denominations[item.key] || ''}
                        onChange={(e) => handleDenominationChange(item.key, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-center p-1 bg-white border border-slate-300 rounded font-bold text-xs"
                      />
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        ={formatBDT(denominations[item.key] * item.note)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Closing & Handover Remarks (মন্তব্য / নোট)</label>
            <textarea
              rows={2}
              placeholder="যেমন: ক্যাশ ড্রয়ার গুনে দেখা হয়েছে এবং ড্রপ সেফে সংরক্ষণ করা হয়েছে।"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign Off & Lock Day Closing (দিন সমাপ্তি সংরক্ষণ ও লক)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Historical Day Closings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center justify-between">
          <span>Historical Daily Closing Slips (পূর্ববর্তী ক্লোজিং স্লিপসমূহ)</span>
          <span className="text-slate-500 font-mono text-[11px]">মোট রেকর্ড: {dayClosings.length}টি</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Closing Slip #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Facility Location</th>
                <th className="p-3">Shift Cashier</th>
                <th className="p-3 text-right">Opening Cash</th>
                <th className="p-3 text-right">Total Inflow</th>
                <th className="p-3 text-right">Expected Cash</th>
                <th className="p-3 text-right">Actual Counted</th>
                <th className="p-3 text-center">Variance Status</th>
                <th className="p-3">Verified By</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dayClosings.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono font-bold text-blue-700">{c.closingNo}</td>
                  <td className="p-3 text-slate-600">{formatDate(c.date)}</td>
                  <td className="p-3 font-semibold text-slate-800">{c.warehouseName?.split('(')[0] || 'Main'}</td>
                  <td className="p-3 text-slate-700">{c.cashierName}</td>
                  <td className="p-3 text-right text-slate-600">{formatBDT(c.openingCash)}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(c.cashSalesTotal + c.dueCollectionsTotal)}</td>
                  <td className="p-3 text-right font-bold text-slate-800">{formatBDT(c.expectedClosingCash)}</td>
                  <td className="p-3 text-right font-black text-slate-900">{formatBDT(c.actualPhysicalCash)}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Balanced' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'Shortage' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px]">{c.verifiedBy}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedSlipForPrint(c)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 mx-auto transition cursor-pointer"
                      title="ক্লোজিং স্লিপ প্রিন্ট বা ভিউ করুন"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>স্লিপ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Closing Slip Modal */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Daily Closing Audit Slip #{selectedSlipForPrint.closingNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono" id="printable-slip">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black text-slate-900">TELECORP ERP BUSINESS CLOSING</h2>
                <p className="text-[11px] text-slate-500">Facility: {selectedSlipForPrint.warehouseName}</p>
                <p className="text-[11px] text-slate-500">Business Date: {formatDate(selectedSlipForPrint.date)}</p>
                <p className="text-[10px] text-slate-400">Printed: {new Date().toLocaleString()}</p>
              </div>

              <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-slate-700">
                <div className="flex justify-between">
                  <span>Shift Cashier:</span>
                  <span className="font-bold">{selectedSlipForPrint.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified By:</span>
                  <span className="font-bold">{selectedSlipForPrint.verifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opening Cash Till Float:</span>
                  <span className="font-bold">{formatBDT(selectedSlipForPrint.openingCash)}</span>
                </div>
              </div>

              <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-slate-700">
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Cash Sales:</span>
                  <span className="font-bold">+{formatBDT(selectedSlipForPrint.cashSalesTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Due Collections:</span>
                  <span className="font-bold">+{formatBDT(selectedSlipForPrint.dueCollectionsTotal)}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) Cash Expenses:</span>
                  <span className="font-bold">-{formatBDT(selectedSlipForPrint.cashExpensesTotal)}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>(-) Bank Cash Deposits:</span>
                  <span className="font-bold">-{formatBDT(selectedSlipForPrint.bankDepositsTotal)}</span>
                </div>
              </div>

              <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-sm font-bold text-slate-800">
                  <span>Expected Till Cash:</span>
                  <span>{formatBDT(selectedSlipForPrint.expectedClosingCash)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-blue-900">
                  <span>Counted Physical Cash:</span>
                  <span>{formatBDT(selectedSlipForPrint.actualPhysicalCash)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                  <span>Variance / Discrepancy:</span>
                  <span className={selectedSlipForPrint.discrepancy === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {selectedSlipForPrint.status}: {formatBDT(selectedSlipForPrint.discrepancy)}
                  </span>
                </div>
              </div>

              {selectedSlipForPrint.notes && (
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
                  <b>Remarks:</b> {selectedSlipForPrint.notes}
                </div>
              )}

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1">
                  Cashier Signature
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Manager Signature & Seal
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlipForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
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
