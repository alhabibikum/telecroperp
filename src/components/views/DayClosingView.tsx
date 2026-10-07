import React, { useState } from 'react';
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
  Building
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

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

  const defaultOpening = dayClosings[0]?.actualPhysicalCash ?? (chartOfAccounts.find(a => a.code === '1000')?.balance ?? 0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [cashierName, setCashierName] = useState('Farhana Akhter (Cashier)');
  const [openingCash, setOpeningCash] = useState<number>(defaultOpening);
  const [actualPhysicalCash, setActualPhysicalCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Compute daily totals strictly for the chosen date
  const isMatchingDate = (txDate: string) => !txDate || txDate.startsWith(date);

  const cashSalesFromTx = cashTransactions
    .filter(c => c.type === 'Cash In' && c.category === 'Customer Sale' && isMatchingDate(c.date))
    .reduce((acc, c) => acc + c.amount, 0);

  const cashSalesFromInvoices = salesInvoices
    .filter(inv => isMatchingDate(inv.invoiceDate))
    .reduce((acc, inv) => {
      const cashPayments = (inv.payments || []).filter(p => p.method === 'Cash');
      return acc + cashPayments.reduce((sum, p) => sum + p.amount, 0);
    }, 0);

  const cashSalesTotal = Math.max(cashSalesFromTx, cashSalesFromInvoices);

  const dueCollectionsTotal = cashTransactions
    .filter(c => c.type === 'Cash In' && c.category === 'Due Collection' && isMatchingDate(c.date))
    .reduce((acc, c) => acc + c.amount, 0);

  const cashExpensesTotal = cashTransactions
    .filter(c => c.type === 'Cash Out' && c.category === 'Expense' && isMatchingDate(c.date))
    .reduce((acc, c) => acc + c.amount, 0);

  const bankDepositsTotal = cashTransactions
    .filter(c => c.type === 'Cash Out' && c.category === 'Cash To Bank' && isMatchingDate(c.date))
    .reduce((acc, c) => acc + c.amount, 0);

  const expectedClosingCash = openingCash + cashSalesTotal + dueCollectionsTotal - cashExpensesTotal - bankDepositsTotal;
  const discrepancy = actualPhysicalCash - expectedClosingCash;
  const closingStatus = discrepancy === 0 ? 'Balanced' : discrepancy < 0 ? 'Shortage' : 'Surplus';

  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);

  const handlePerformClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

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
      notes: closingNotes || 'Till cash verified and placed in drop safe.'
    });

    if (res.success) {
      setMessage(`End of Day closing #${res.closingNo} completed successfully!`);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
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
            Verify register till cash, record discrepancies/shortages and generate signed audit closing slips
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Main Closing Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          Daily Cash Register Till Reconciliation
        </h3>

        <form onSubmit={handlePerformClosing} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 text-[11px]">Opening Cash in Till</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{formatBDT(openingCash)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">+ Cash Retail Sales</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">+{formatBDT(cashSalesTotal)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">+ Customer Due Collections</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">+{formatBDT(dueCollectionsTotal)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">- Cash Payouts & Expenses</span>
                <div className="font-bold text-rose-700 text-sm mt-0.5">-{formatBDT(cashExpensesTotal)}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  System Calculated Expected Physical Cash:
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {formatBDT(expectedClosingCash)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Counted Physical Cash in Till (৳) *
                  </label>
                  <input
                    type="number"
                    value={actualPhysicalCash}
                    onChange={(e) => setActualPhysicalCash(parseFloat(e.target.value) || 0)}
                    placeholder="Enter counted amount..."
                    className="p-2 border border-slate-300 rounded-lg font-mono font-black text-sm text-blue-900 w-48"
                    required
                  />
                </div>

                <div className="text-right pl-3 border-l border-slate-300">
                  <div className="text-[11px] text-slate-500 font-semibold">Variance / Discrepancy</div>
                  <div className={`font-black text-sm mt-0.5 ${
                    discrepancy === 0 ? 'text-emerald-700' : discrepancy < 0 ? 'text-rose-700' : 'text-blue-700'
                  }`}>
                    {discrepancy === 0 ? '✓ Balanced (৳ 0)' : `${discrepancy < 0 ? 'Shortage' : 'Surplus'}: ${formatBDT(discrepancy)}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Closing & Handover Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. 100 notes of 1000 denomination verified, envelope sealed in safe."
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition"
            >
              Sign Off & Lock Day Closing
            </button>
          </div>
        </form>
      </div>

      {/* Historical Day Closings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700">
          Historical Daily Closing Slips
        </div>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dayClosings.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-blue-700">{c.closingNo}</td>
                <td className="p-3 text-slate-600">{formatDate(c.date)}</td>
                <td className="p-3 font-semibold text-slate-800">{c.warehouseName.split('(')[0]}</td>
                <td className="p-3 text-slate-700">{c.cashierName}</td>
                <td className="p-3 text-right text-slate-600">{formatBDT(c.openingCash)}</td>
                <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(c.cashSalesTotal + c.dueCollectionsTotal)}</td>
                <td className="p-3 text-right font-bold text-slate-800">{formatBDT(c.expectedClosingCash)}</td>
                <td className="p-3 text-right font-black text-slate-900">{formatBDT(c.actualPhysicalCash)}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'Balanced' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-slate-600 text-[11px]">{c.verifiedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
