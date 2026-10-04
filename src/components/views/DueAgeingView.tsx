import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  CreditCard,
  AlertTriangle,
  Receipt,
  Search,
  Building,
  Phone,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatBDT, calculateDueAgeing, formatDate } from '../../utils/formatters';

interface DueAgeingViewProps {
  onOpenDueCollection: (customerId?: string) => void;
}

export const DueAgeingView: React.FC<DueAgeingViewProps> = ({ onOpenDueCollection }) => {
  const { customers, salesInvoices } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate ageing breakdown for every customer
  const customerAgeingData = customers
    .filter(c => c.customerType !== 'Walk-in')
    .map(cust => {
      const unpaidInvoices = salesInvoices.filter(i => i.customerId === cust.id && i.dueAmount > 0);

      let current = 0;
      let days1to7 = 0;
      let days8to15 = 0;
      let days16to30 = 0;
      let days31to60 = 0;
      let days61to90 = 0;
      let days90Plus = 0;

      unpaidInvoices.forEach(inv => {
        const { bucket } = calculateDueAgeing(inv.dueDate);
        if (bucket === 'Current') current += inv.dueAmount;
        else if (bucket === '1-7 Days') days1to7 += inv.dueAmount;
        else if (bucket === '8-15 Days') days8to15 += inv.dueAmount;
        else if (bucket === '16-30 Days') days16to30 += inv.dueAmount;
        else if (bucket === '31-60 Days') days31to60 += inv.dueAmount;
        else if (bucket === '61-90 Days') days61to90 += inv.dueAmount;
        else days90Plus += inv.dueAmount;
      });

      // If opening balance exists and hasn't been tied to a recent invoice, attribute it to 31-60 or 90+
      const accountedDue = current + days1to7 + days8to15 + days16to30 + days31to60 + days61to90 + days90Plus;
      const extraBalance = Math.max(0, cust.currentDue - accountedDue);
      if (extraBalance > 0) {
        days31to60 += extraBalance;
      }

      const totalDue = cust.currentDue;
      const creditUtilization = cust.creditLimit > 0 ? Math.round((totalDue / cust.creditLimit) * 100) : 0;

      return {
        customer: cust,
        totalDue,
        creditLimit: cust.creditLimit,
        creditUtilization,
        current,
        days1to7,
        days8to15,
        days16to30,
        days31to60,
        days61to90,
        days90Plus
      };
    })
    .filter(row =>
      row.customer.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.customer.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.customer.area.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.totalDue - a.totalDue);

  const totalOutstanding = customerAgeingData.reduce((acc, c) => acc + c.totalDue, 0);
  const totalOverdue30Plus = customerAgeingData.reduce((acc, c) => acc + c.days31to60 + c.days61to90 + c.days90Plus, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Customer Due Ageing Analysis & Credit Limits
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aging buckets (Current, 1-7, 8-15, 16-30, 31-60, 61-90, 90+ days) and collection enforcement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenDueCollection()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Receive Payment / Due Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Dealer Outstanding Due</div>
          <div className="text-xl font-black text-slate-900 mt-1">{formatBDT(totalOutstanding)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">30+ Days Overdue (High Risk)</div>
          <div className="text-xl font-black text-rose-700 mt-1">{formatBDT(totalOverdue30Plus)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Active Credit-Bearing Dealers</div>
          <div className="text-xl font-black text-blue-700 mt-1">{customers.filter(c => c.creditLimit > 0).length} Dealers</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dealer shop, proprietor, or market area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Ageing Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Dealer Shop & Proprietor</th>
                <th className="p-3">Salesman Route</th>
                <th className="p-3 text-right">Credit Limit</th>
                <th className="p-3 text-right">Total Due</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right">1–15 Days</th>
                <th className="p-3 text-right">16–30 Days</th>
                <th className="p-3 text-right text-amber-700">31–60 Days</th>
                <th className="p-3 text-right text-rose-700">60+ Days</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerAgeingData.map(({ customer, totalDue, creditLimit, creditUtilization, current, days1to7, days8to15, days16to30, days31to60, days61to90, days90Plus }) => {
                const days1to15 = days1to7 + days8to15;
                const days60Plus = days61to90 + days90Plus;
                const isOverLimit = creditLimit > 0 && totalDue > creditLimit;

                return (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{customer.shopName}</div>
                      <div className="text-[11px] text-slate-500">{customer.ownerName} • {customer.mobile}</div>
                      <div className="text-[10px] text-slate-400">{customer.area}, {customer.district}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {customer.salesmanName || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-600">
                      {formatBDT(creditLimit)}
                      <div className="text-[10px] text-slate-400">{creditUtilization}% utilized</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className={`font-extrabold ${totalDue > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                        {formatBDT(totalDue)}
                      </div>
                      {isOverLimit && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          Exceeded Limit
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium text-emerald-700">
                      {current > 0 ? formatBDT(current) : '-'}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      {days1to15 > 0 ? formatBDT(days1to15) : '-'}
                    </td>
                    <td className="p-3 text-right font-medium text-amber-700">
                      {days16to30 > 0 ? formatBDT(days16to30) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-amber-800">
                      {days31to60 > 0 ? formatBDT(days31to60) : '-'}
                    </td>
                    <td className="p-3 text-right font-extrabold text-rose-700">
                      {days60Plus > 0 ? formatBDT(days60Plus) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenDueCollection(customer.id)}
                        disabled={totalDue <= 0}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-40 transition"
                      >
                        Collect Due
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
