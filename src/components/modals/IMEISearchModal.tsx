import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  User,
  ShieldAlert,
  ArrowRight,
  Clock,
  QrCode
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

interface IMEISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIMEI?: string;
}

export const IMEISearchModal: React.FC<IMEISearchModalProps> = ({
  isOpen,
  onClose,
  initialIMEI = ''
}) => {
  const { imeis } = useERP();
  const [searchTerm, setSearchTerm] = useState(initialIMEI);
  const [selectedIMEI, setSelectedIMEI] = useState<string | null>(null);

  useEffect(() => {
    if (initialIMEI) {
      setSearchTerm(initialIMEI);
      setSelectedIMEI(initialIMEI);
    }
  }, [initialIMEI]);

  if (!isOpen) return null;

  const filtered = imeis.filter(i =>
    i.imei1.includes(searchTerm.trim()) ||
    (i.imei2 && i.imei2.includes(searchTerm.trim())) ||
    (i.serialNumber && i.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentRecord = selectedIMEI
    ? imeis.find(i => i.imei1 === selectedIMEI)
    : filtered.length > 0
    ? filtered[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white/90 backdrop-blur-3xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/60 animate-in zoom-in-95 duration-200">
        {/* Top Glossy Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500/40 via-blue-500/50 to-indigo-500/40 pointer-events-none z-10" />

        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between bg-white/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">IMEI 360° Lifecycle & Traceability</h2>
              <p className="text-xs text-slate-500 font-medium">Every single unit tracked from Supplier to Customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white/40 backdrop-blur-md">
          {/* Left: Search & Filter List */}
          <div className="w-full md:w-80 border-r border-slate-200/70 flex flex-col bg-white/30 backdrop-blur-sm">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter 15-digit IMEI or Serial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  autoFocus
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Matching IMEIs: <b>{filtered.length}</b></span>
                <span className="font-mono text-[10px] text-blue-600">Total in DB: {imeis.length}</span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No IMEI records found matching "{searchTerm}".
                </div>
              ) : (
                filtered.map(record => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedIMEI(record.imei1)}
                    className={`p-3 text-xs cursor-pointer transition ${
                      currentRecord?.imei1 === record.imei1
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                      <span>{record.imei1}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
                        record.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'Sold' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'Returned' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium mt-1 truncate">
                      {record.productName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>{record.variantDesc}</span>
                      <span className="text-[10px]">{record.warehouseName.split(' ')[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Detailed 360-degree lifecycle sheet */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {currentRecord ? (
              <div className="space-y-6">
                {/* Header card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                        {currentRecord.brandName}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {currentRecord.productName}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Variant: <span className="font-semibold text-slate-800">{currentRecord.variantDesc}</span>
                      {currentRecord.serialNumber && (
                        <span className="ml-3 font-mono text-[11px] text-slate-500">
                          S/N: {currentRecord.serialNumber}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-blue-700 mt-2 flex items-center gap-3">
                      <span>IMEI 1: {currentRecord.imei1}</span>
                      {currentRecord.imei2 && <span>IMEI 2: {currentRecord.imei2}</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      currentRecord.status === 'In Stock' ? 'bg-emerald-500 text-white shadow-xs' :
                      currentRecord.status === 'Sold' ? 'bg-blue-600 text-white shadow-xs' :
                      currentRecord.status === 'Returned' ? 'bg-purple-600 text-white shadow-xs' :
                      'bg-amber-500 text-white'
                    }`}>
                      Status: {currentRecord.status}
                    </span>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      Condition: {currentRecord.condition}
                    </div>
                  </div>
                </div>

                {/* 3-Pillar Journey Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: Procurement / Inward */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>1. Procurement</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-slate-500">Supplier: </span>
                        <span className="font-semibold text-slate-800 block truncate">{currentRecord.supplierName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Invoice: </span>
                        <span className="font-mono text-blue-700 font-semibold">{currentRecord.purchaseInvoiceNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Purchase Date: </span>
                        <span className="font-medium text-slate-800">{formatDate(currentRecord.purchaseDate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Cost Price: </span>
                        <span className="font-bold text-slate-800">{formatBDT(currentRecord.purchaseCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Current Location / Warehouse */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>2. Stock Location</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-slate-500">Current Facility: </span>
                        <span className="font-semibold text-slate-800 block">{currentRecord.warehouseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Physical State: </span>
                        <span className="font-medium text-slate-800">{currentRecord.status === 'In Stock' ? 'Ready for Dispatch' : currentRecord.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Official Warranty: </span>
                        <span className="font-semibold text-emerald-700">
                          {currentRecord.warrantyExpiry ? `Until ${formatDate(currentRecord.warrantyExpiry)}` : '12 Months BD Brand Warranty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Outward / Sales Destination */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>3. Customer / Outward</span>
                    </div>
                    <div className="text-xs space-y-1">
                      {currentRecord.salesInvoiceNo ? (
                        <>
                          <div>
                            <span className="text-slate-500">Customer: </span>
                            <span className="font-semibold text-slate-800 block truncate">{currentRecord.customerName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Sales Invoice: </span>
                            <span className="font-mono text-blue-700 font-semibold">{currentRecord.salesInvoiceNo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Sale Date: </span>
                            <span className="font-medium text-slate-800">{formatDate(currentRecord.salesDate)}</span>
                          </div>
                          {currentRecord.salesPrice && (
                            <div>
                              <span className="text-slate-500">Selling Price: </span>
                              <span className="font-bold text-emerald-700">{formatBDT(currentRecord.salesPrice)}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-4 text-slate-400 italic">
                          Unit has not been sold yet. Still resting in inventory.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chronological Event History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Chronological Audit Trail & Stock Movements</span>
                  </h4>
                  <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
                    {currentRecord.history.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[23px] top-1 ring-4 ring-white"></div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{event.action}</span>
                            <span className="text-[11px] text-slate-400">{event.date}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                              By {event.user}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{event.description}</p>
                          {event.referenceNo && (
                            <span className="inline-block mt-1 font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Ref: {event.referenceNo}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Please enter or select an IMEI number to view its full history.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Barcode & 2D DataMatrix scanning fully compatible with USB / Bluetooth hand scanners</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
