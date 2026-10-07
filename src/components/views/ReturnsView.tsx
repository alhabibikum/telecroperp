import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Undo2,
  PlusCircle,
  Search,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  Truck,
  Trash2,
  Check,
  X,
  Edit3,
  Scan,
  QrCode
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { SupplierReturnModal } from '../modals/SupplierReturnModal';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import type { CustomerReturn, SupplierReturn } from '../../types/erp';

interface ReturnsViewProps {
  onOpenCustomerReturn: () => void;
  onOpenIMEILookup: (imei: string) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  onOpenCustomerReturn,
  onOpenIMEILookup
}) => {
  const {
    customerReturns,
    supplierReturns,
    imeis,
    updateCustomerReturnStatus,
    deleteCustomerReturn,
    updateSupplierReturnStatus,
    deleteSupplierReturn
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [showSupplierReturnModal, setShowSupplierReturnModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

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

  const handleToggleCustomerStatus = (id: string, currentStatus: CustomerReturn['status'], returnNo: string) => {
    const nextStatus: CustomerReturn['status'] = currentStatus === 'Approved' ? 'Pending' : 'Approved';
    const res = updateCustomerReturnStatus(id, nextStatus);
    if (res.success) {
      setStatusMsg(`কাস্টমার রিটার্ন #${returnNo} স্ট্যাটাস "${nextStatus}" এ পরিবর্তিত হয়েছে।`);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleDeleteCustomer = (id: string, returnNo: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে কাস্টমার সেলস রিটার্ন #${returnNo} মুছে ফেলতে চান?`)) {
      const res = deleteCustomerReturn(id);
      if (res.success) {
        setStatusMsg(`কাস্টমার রিটার্ন #${returnNo} সফলভাবে মুছে ফেলা হয়েছে।`);
        setTimeout(() => setStatusMsg(null), 4000);
      }
    }
  };

  const handleToggleSupplierStatus = (id: string, currentStatus: SupplierReturn['status'], returnNo: string) => {
    const nextStatus: SupplierReturn['status'] = currentStatus === 'Completed' ? 'Pending Adjustment' : 'Completed';
    const res = updateSupplierReturnStatus(id, nextStatus);
    if (res.success) {
      setStatusMsg(`সাপ্লায়ার রিটার্ন #${returnNo} স্ট্যাটাস "${nextStatus}" এ পরিবর্তিত হয়েছে।`);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleDeleteSupplier = (id: string, returnNo: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে সাপ্লায়ার আরএমএ রিটার্ন #${returnNo} মুছে ফেলতে চান?`)) {
      const res = deleteSupplierReturn(id);
      if (res.success) {
        setStatusMsg(`সাপ্লায়ার রিটার্ন #${returnNo} সফলভাবে মুছে ফেলা হয়েছে।`);
        setTimeout(() => setStatusMsg(null), 4000);
      }
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
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
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>+ Supplier RMA Return</span>
          </button>

          <button
            onClick={onOpenCustomerReturn}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Customer Sales Return</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Customer Returns</div>
          <div className="text-lg font-black text-slate-900 mt-1">{customerReturns.length} Inward Units</div>
          <div className="text-[10px] text-slate-400 mt-1">মোট গৃহীত রিটার্ন</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Customer Credit Issued</div>
          <div className="text-lg font-black text-purple-700 mt-1">{formatBDT(totalCustomerRefunded)}</div>
          <div className="text-[10px] text-slate-400 mt-1">কাস্টমার সমন্বয়কৃত ক্রেডিট</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Supplier RMA Returns</div>
          <div className="text-lg font-black text-slate-900 mt-1">{supplierReturns.length} Outward Units</div>
          <div className="text-[10px] text-slate-400 mt-1">ব্র্যান্ডে ফেরত পাঠানো হ্যান্ডসেট</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Supplier Credit Reclaimed</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{formatBDT(totalSupplierRefunded)}</div>
          <div className="text-[10px] text-slate-400 mt-1">দাবি আদায়কৃত ক্রেডিট নোট</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('customer')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'customer'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Sales Returns ({customerReturns.length})
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'supplier'
              ? 'border-b-2 border-slate-800 text-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Supplier Returns / DOA Swaps ({supplierReturns.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-lg w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="returns-search-input"
              data-search-input="true"
              type="text"
              placeholder="Search return voucher #, IMEI, party, or product (Ctrl+F)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:bg-white"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded border border-slate-300/80 pointer-events-none">
              ^F
            </kbd>
          </div>
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
            title="রিটার্নকৃত ডিভাইসের বারকোড বা IMEI স্ক্যান করে খুঁজুন"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan / Filter IMEI</span>
          </button>
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
                      কোনো কাস্টমার রিটার্ন রেকর্ড পাওয়া যায়নি।
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
                        <button
                          onClick={() => handleToggleCustomerStatus(ret.id, ret.status, ret.returnNo)}
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer hover:opacity-80 ${
                            ret.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                        >
                          {ret.status}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenIMEILookup(ret.imei)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            title="IMEI ট্র্যাকিং দেখুন"
                          >
                            Trace IMEI
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(ret.id, ret.returnNo)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="রিটার্ন রেকর্ড মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                      কোনো সাপ্লায়ার আরএমএ রেকর্ড পাওয়া যায়নি।
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
                        <button
                          onClick={() => handleToggleSupplierStatus(ret.id, ret.status, ret.returnNo)}
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer hover:opacity-80 ${
                            ret.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                        >
                          {ret.status}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenIMEILookup(ret.imei)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            title="IMEI ট্র্যাকিং দেখুন"
                          >
                            Trace IMEI
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(ret.id, ret.returnNo)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="রিটার্ন রেকর্ড মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* Multi-Barcode / Multi-IMEI Scanner Modal */}
      {showScannerModal && (
        <MultiBarcodeScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="রিটার্ন ভাউচার ও IMEI সার্চ স্ক্যানার"
          subtitle="রিটার্নকৃত হ্যান্ডসেটের বারকোড বা IMEI বারকোড গান বা ক্যামেরা দিয়ে স্ক্যান করে সংশ্লিষ্ট ভাউচার খুঁজুন"
          mode="lookup"
          onConfirm={(_records, tokens) => {
            if (tokens && tokens.length > 0) {
              setSearchTerm(tokens[0]);
            }
            setShowScannerModal(false);
          }}
        />
      )}
    </div>
  );
};
