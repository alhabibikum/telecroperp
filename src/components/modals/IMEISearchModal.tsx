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
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { WindowsModalFrame } from '../common/WindowsModalFrame';

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
  const [showScannerModal, setShowScannerModal] = useState(false);

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
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={onClose}
        onSkip={onClose}
        modalId="modal-imei-search"
        title="IMEI 360° লাইফসাইকেল ও ট্র্যাকিং (IMEI Lifecycle)"
        subtitle="Every single unit tracked from Supplier to Customer"
        icon={<Smartphone className="w-4 h-4 text-sky-400" />}
        maxWidth="max-w-4xl"
      >

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          {/* Left: Search & Filter List */}
          <div className="w-full md:w-80 border-r border-slate-200/70 dark:border-slate-800 flex flex-col bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter 15-digit IMEI or Serial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                  title="ক্যামেরা বা গান দিয়ে স্ক্যান করুন"
                >
                  <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                <span>Matching IMEIs: <b className="text-slate-800 dark:text-slate-200">{filtered.length}</b></span>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">Total in DB: {imeis.length}</span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No IMEI records found matching "{searchTerm}".
                </div>
              ) : (
                filtered.map(record => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedIMEI(record.imei1)}
                    className={`p-3 text-xs cursor-pointer transition ${
                      currentRecord?.imei1 === record.imei1
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-l-4 border-blue-600 dark:border-blue-500'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span>{record.imei1}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
                        record.status === 'In Stock' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                        record.status === 'Sold' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' :
                        record.status === 'Returned' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' :
                        'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium mt-1 truncate">
                      {record.productName}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between mt-1">
                      <span>{record.variantDesc}</span>
                      <span className="text-[10px]">{record.warehouseName.split(' ')[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Detailed 360-degree lifecycle sheet */}
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            {currentRecord ? (
              <div className="space-y-6">
                {/* Header card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/80 dark:to-blue-950/30 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white">
                        {currentRecord.brandName}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {currentRecord.productName}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Variant: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRecord.variantDesc}</span>
                      {currentRecord.serialNumber && (
                        <span className="ml-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          S/N: {currentRecord.serialNumber}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center gap-3">
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
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Condition: {currentRecord.condition}
                    </div>
                  </div>
                </div>

                {/* 3-Pillar Journey Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: Procurement / Inward */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>1. Procurement</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Supplier: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{currentRecord.supplierName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Invoice: </span>
                        <span className="font-mono text-blue-700 dark:text-blue-400 font-semibold">{currentRecord.purchaseInvoiceNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Purchase Date: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(currentRecord.purchaseDate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Cost Price: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatBDT(currentRecord.purchaseCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Current Location / Warehouse */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>2. Stock Location</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Current Facility: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{currentRecord.warehouseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Physical State: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{currentRecord.status === 'In Stock' ? 'Ready for Dispatch' : currentRecord.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Official Warranty: </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {currentRecord.warrantyExpiry ? `Until ${formatDate(currentRecord.warrantyExpiry)}` : '12 Months BD Brand Warranty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Outward / Sales Destination */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>3. Customer / Outward</span>
                    </div>
                    <div className="text-xs space-y-1">
                      {currentRecord.salesInvoiceNo ? (
                        <>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Customer: </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{currentRecord.customerName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Sales Invoice: </span>
                            <span className="font-mono text-blue-700 dark:text-blue-400 font-semibold">{currentRecord.salesInvoiceNo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Sale Date: </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(currentRecord.salesDate)}</span>
                          </div>
                          {currentRecord.salesPrice && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Selling Price: </span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBDT(currentRecord.salesPrice)}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-4 text-slate-400 dark:text-slate-500 italic">
                          Unit has not been sold yet. Still resting in inventory.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chronological Event History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Chronological Audit Trail & Stock Movements</span>
                  </h4>
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-4 space-y-4">
                    {currentRecord.history.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 absolute -left-[23px] top-1 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{event.action}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">{event.date}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                              By {event.user}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{event.description}</p>
                          {event.referenceNo && (
                            <span className="inline-block mt-1 font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
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
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                Please enter or select an IMEI number to view its full history.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Barcode & 2D DataMatrix scanning fully compatible with USB / Bluetooth hand scanners</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </WindowsModalFrame>

      {/* Multi-Barcode / Multi-IMEI Scanner Modal */}
      {showScannerModal && (
        <MultiBarcodeScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="IMEI লাইফসাইকেল স্ক্যানার"
          subtitle="হ্যান্ডসেটের বারকোড বা IMEI গান বা ক্যামেরা দিয়ে স্ক্যান করে সম্পূর্ণ হিস্ট্রি দেখুন"
          mode="lookup"
          onConfirm={(_records, tokens) => {
            if (tokens && tokens.length > 0) {
              setSearchTerm(tokens[0]);
              setSelectedIMEI(tokens[0]);
            }
            setShowScannerModal(false);
          }}
        />
      )}
    </>
  );
};
