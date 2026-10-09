import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  Printer,
  CheckCircle,
  Clock,
  Undo2,
  FileText
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RowActions, EditModal } from '../common/CrudKit';
import type { SalesInvoice } from '../../types/erp';

interface WholesaleSalesViewProps {
  onOpenNewSale: () => void;
  onPrintInvoice: (invoiceNo: string) => void;
  onOpenReturn: () => void;
}

export const WholesaleSalesView: React.FC<WholesaleSalesViewProps> = ({
  onOpenNewSale,
  onPrintInvoice,
  onOpenReturn
}) => {
  const { salesInvoices, customers, cancelSale, updateSaleInvoiceMeta } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [editing, setEditing] = useState<SalesInvoice | null>(null);

  const filteredInvoices = salesInvoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.salesmanName && inv.salesmanName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesType = typeFilter === 'All' || inv.invoiceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBilled = filteredInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = filteredInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalDue = filteredInvoices.reduce((acc, i) => acc + i.dueAmount, 0);

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Wholesale & Dealer Sales Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Credit-controlled dealer invoices with serialized IMEI tracking and automated accounting synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReturn}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Process Return</span>
          </button>
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
          <div className="text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">Total Invoiced (Filtered)</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatBDT(totalBilled)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
          <div className="text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">Collected at Invoice</div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">{formatBDT(totalCollected)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
          <div className="text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">Unpaid Dealer Receivable</div>
          <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">{formatBDT(totalDue)}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="wholesale-search-input"
            data-search-input="true"
            type="text"
            placeholder="Search Invoice #, Dealer Shop, Salesman (Ctrl+F)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-1 py-0.5 rounded border border-slate-300/80 dark:border-slate-600 pointer-events-none">
            ^F
          </kbd>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="All">All Types</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Retail POS">Retail POS</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date & Due Date</th>
                <th className="p-3">Dealer / Customer</th>
                <th className="p-3">Salesman</th>
                <th className="p-3">Warehouse Hub</th>
                <th className="p-3 text-center">Units</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No sales invoices found matching your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const totalUnits = inv.items.reduce((s, it) => s + it.quantity, 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-blue-700 dark:text-blue-400">{inv.invoiceNo}</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-sans">{inv.invoiceType}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        <div>{formatDate(inv.invoiceDate)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Due: {formatDate(inv.dueDate)}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{inv.customerPhone}</div>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                        {inv.salesmanName || <span className="text-slate-400 dark:text-slate-500 italic">Direct House</span>}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {inv.warehouseName.split('(')[0]}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {totalUnits}
                      </td>
                      <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                        {formatBDT(inv.grandTotal)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {formatBDT(inv.paidAmount)}
                      </td>
                      <td className="p-3 text-right font-extrabold text-amber-700 dark:text-amber-400">
                        {formatBDT(inv.dueAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' :
                          inv.status === 'Partial' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50' :
                          'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPrintInvoice(inv.invoiceNo)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Print / PDF Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {inv.status !== 'Cancelled' && (
                            <RowActions
                              mode="void"
                              onEdit={() => setEditing(inv)}
                              onDelete={reason => cancelSale(inv.id, reason)}
                              deleteTitle={`Void / Cancel ${inv.invoiceNo}?`}
                              deleteMessage="This voids the sale, returns all IMEI units back to available stock, reverses customer due and cash/bank receipts, and posts reversing journal entries."
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditModal
          title={`Edit Invoice Details - ${editing.invoiceNo}`}
          initial={{
            dueDate: editing.dueDate,
            notes: editing.notes || ''
          }}
          fields={[
            { key: 'dueDate', label: 'Payment Due Date', type: 'date', required: true },
            { key: 'notes', label: 'Special Instructions / Notes', type: 'textarea' }
          ]}
          onSave={v => updateSaleInvoiceMeta(editing.id, v as Partial<SalesInvoice>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
