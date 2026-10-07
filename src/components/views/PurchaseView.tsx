import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  PlusCircle,
  Search,
  Building2,
  Calendar,
  Layers,
  Smartphone,
  CheckCircle,
  Clock,
  Barcode,
  Camera
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RowActions, EditModal } from '../common/CrudKit';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import type { PurchaseInvoice } from '../../types/erp';

interface PurchaseViewProps {
  onOpenNewPurchase: () => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({ onOpenNewPurchase }) => {
  const { purchaseInvoices, suppliers, imeis, updatePurchaseInvoiceMeta, cancelPurchase } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMultiScanner, setShowMultiScanner] = useState(false);
  const [editing, setEditing] = useState<PurchaseInvoice | null>(null);

  const filtered = purchaseInvoices.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const matchesMeta =
      p.invoiceNo.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      p.warehouseName.toLowerCase().includes(q);
    const matchesIMEI = imeis.some(
      i =>
        i.purchaseInvoiceNo === p.invoiceNo &&
        (i.imei1.includes(q) ||
          (i.imei2 && i.imei2.includes(q)) ||
          (i.serialNumber && i.serialNumber.toLowerCase().includes(q)))
    );
    return matchesMeta || matchesIMEI;
  });

  const totalProcured = filtered.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalPaid = filtered.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalPayableDue = filtered.reduce((acc, p) => acc + p.dueAmount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Supplier Purchases & Consignment Inward
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Procure authorized handsets directly from brand distributors with bulk IMEI inward validation
          </p>
        </div>

        <button
          onClick={onOpenNewPurchase}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Receive Consignment</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Purchase Value</div>
          <div className="text-lg font-black text-slate-900 mt-1">{formatBDT(totalProcured)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Settled / Advance Paid</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{formatBDT(totalPaid)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Outstanding Supplier Payables</div>
          <div className="text-lg font-black text-rose-700 mt-1">{formatBDT(totalPayableDue)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="purchase-search-input"
            data-search-input="true"
            type="text"
            placeholder="Search Purchase Invoice #, Supplier, Warehouse, or 15-digit IMEI (Ctrl+F)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded border border-slate-300/80 pointer-events-none">
            ^F
          </kbd>
        </div>

        <button
          type="button"
          onClick={() => setShowMultiScanner(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <Barcode className="w-4 h-4" />
          <span>Scan / Filter Inward IMEIs</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Purchase Invoice #</th>
                <th className="p-3">Inward Date</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Receiving Warehouse</th>
                <th className="p-3">Items & IMEIs</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Due Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(pur => {
                const totalUnits = pur.items.reduce((s, it) => s + it.quantity, 0);

                return (
                  <tr key={pur.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-emerald-800">
                      {pur.invoiceNo}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{formatDate(pur.purchaseDate)}</div>
                      <div className="text-[10px] text-slate-400">Due: {formatDate(pur.dueDate)}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{pur.supplierName}</div>
                      <div className="text-[10px] text-slate-400">Term: 21 Days Credit</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {pur.warehouseName.split('(')[0]}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold">{totalUnits} Handsets</div>
                      <div className="text-[10px] text-slate-400">
                        {pur.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                      </div>
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      {formatBDT(pur.grandTotal)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {formatBDT(pur.paidAmount)}
                    </td>
                    <td className="p-3 text-right font-extrabold text-rose-700">
                      {formatBDT(pur.dueAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pur.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        pur.status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
                        pur.status === 'Cancelled' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {pur.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {pur.status !== 'Cancelled' && (
                        <RowActions
                          mode="void"
                          onEdit={() => setEditing(pur)}
                          onDelete={reason => cancelPurchase(pur.id, reason)}
                          deleteTitle={`Cancel Consignment ${pur.invoiceNo}?`}
                          deleteMessage="This voids the purchase, unregisters received IMEIs, reverses supplier due and cash/bank payments, and posts reversing journal entries."
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditModal
          title={`Edit Purchase Details - ${editing.invoiceNo}`}
          initial={{
            dueDate: editing.dueDate,
            referenceNo: editing.referenceNo || '',
            notes: editing.notes || ''
          }}
          fields={[
            { key: 'dueDate', label: 'Payment Due Date', type: 'date', required: true },
            { key: 'referenceNo', label: 'Supplier Invoice / DC Ref #' },
            { key: 'notes', label: 'Consignment Notes', type: 'textarea' }
          ]}
          onSave={v => updatePurchaseInvoiceMeta(editing.id, v as Partial<PurchaseInvoice>)}
          onClose={() => setEditing(null)}
        />
      )}

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="lookup"
        onConfirm={(_records, allCleanTokens) => {
          if (allCleanTokens.length > 0) {
            setSearchTerm(allCleanTokens[0]);
          }
        }}
        confirmButtonText="কনসাইনমেন্ট ফিল্টার করুন"
      />
    </div>
  );
};
