import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Undo2,
  PlusCircle,
  Search,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  Truck
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { SupplierReturnModal } from '../modals/SupplierReturnModal';

interface ReturnsViewProps {
  onOpenCustomerReturn: () => void;
  onOpenIMEILookup: (imei: string) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  onOpenCustomerReturn,
  onOpenIMEILookup
}) => {
  const { customerReturns, supplierReturns, imeis } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [showSupplierReturnModal, setShowSupplierReturnModal] = useState(false);

  const filteredCustomer = customerReturns.filter(r =>
    r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.imei.includes(searchTerm.trim()) ||
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSupplier = supplierReturns.filter(r =>
    r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.imei.includes(searchTerm.trim()) ||
    r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomerRefunded = customerReturns.reduce((acc, r) => acc + r.refundOrCreditAmount, 0);
  const totalSupplierRefunded = supplierReturns.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Returns & Reverse Logistics Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            কাস্টমার সেলস রিটার্ন এবং ব্র্যান্ড সাপ্লায়ার আরএমএ ডেড অন অ্যারাইভাল (DOA) ট্র্যাকিং
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupplierReturnModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>+ Supplier RMA Return</span>
          </button>

          <button
            onClick={onOpenCustomerReturn}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Customer Sales Return</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Customer Returns</div>
          <div className="text-lg font-black text-slate-900 mt-1">{customerReturns.length} Inward Units</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Customer Credit Issued</div>
          <div className="text-lg font-black text-purple-700 mt-1">{formatBDT(totalCustomerRefunded)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Supplier RMA Returns</div>
          <div className="text-lg font-black text-slate-900 mt-1">{supplierReturns.length} Outward Units</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Supplier Credit Reclaimed</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{formatBDT(totalSupplierRefunded)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('customer')}
          className={`pb-2 transition ${
            activeTab === 'customer'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Returns ({customerReturns.length})
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`pb-2 transition ${
            activeTab === 'supplier'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Supplier Returns / DOA Swaps ({supplierReturns.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return voucher #, IMEI, party, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Tables based on active tab */}
      {activeTab === 'customer' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="p-3">Return #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer / Dealer</th>
                  <th className="p-3">Product & IMEI</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-right">Credit / Refund</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomer.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No customer return records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomer.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-purple-700">{ret.returnNo}</td>
                      <td className="p-3 whitespace-nowrap text-slate-500">{formatDate(ret.returnDate)}</td>
                      <td className="p-3 font-semibold text-slate-800">{ret.customerName}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{ret.productName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{ret.imei}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ret.condition === 'Sealed' ? 'bg-emerald-100 text-emerald-800' :
                          ret.condition === 'Open Box' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {ret.condition}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate" title={ret.returnReason}>
                        {ret.returnReason}
                      </td>
                      <td className="p-3 text-right font-extrabold text-slate-900">
                        {formatBDT(ret.refundOrCreditAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenIMEILookup(ret.imei)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          Trace IMEI
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="p-3">RMA Return #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier Principal</th>
                  <th className="p-3">Product & IMEI</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-right">Debit Reclaimed</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupplier.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No supplier return records found. Click "+ Supplier RMA Return" to record a return to manufacturer.
                    </td>
                  </tr>
                ) : (
                  filteredSupplier.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{ret.returnNo}</td>
                      <td className="p-3 whitespace-nowrap text-slate-500">{formatDate(ret.returnDate)}</td>
                      <td className="p-3 font-semibold text-slate-800">{ret.supplierName}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{ret.productName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{ret.imei}</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate" title={ret.returnReason}>
                        {ret.returnReason}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">
                        {formatBDT(ret.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenIMEILookup(ret.imei)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          Trace IMEI
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Return Modal */}
      <SupplierReturnModal
        isOpen={showSupplierReturnModal}
        onClose={() => setShowSupplierReturnModal(false)}
      />
    </div>
  );
};
