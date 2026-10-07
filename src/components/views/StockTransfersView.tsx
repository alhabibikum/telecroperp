import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ArrowRightLeft,
  PlusCircle,
  Building,
  Calendar,
  CheckCircle,
  Smartphone,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Check,
  Clock,
  ArrowRight,
  QrCode,
  Scan
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import type { StockTransfer } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';

interface StockTransfersViewProps {
  onOpenStockTransfer?: () => void;
  onOpenIMEILookup: (imei: string) => void;
}

export const StockTransfersView: React.FC<StockTransfersViewProps> = ({
  onOpenStockTransfer,
  onOpenIMEILookup
}) => {
  const {
    stockTransfers,
    warehouses,
    products,
    imeis,
    createStockTransfer,
    updateStockTransferStatus,
    deleteStockTransfer,
    currentUserRole
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal State for New Transfer
  const [showAddModal, setShowAddModal] = useState(false);
  const [srcWarehouseId, setSrcWarehouseId] = useState(warehouses[0]?.id || '');
  const [destWarehouseId, setDestWarehouseId] = useState(warehouses[1]?.id || warehouses[0]?.id || '');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);
  const [transferNotes, setTransferNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerContext, setScannerContext] = useState<'filter' | 'select-transfer'>('filter');

  // Available in-stock devices at chosen source warehouse
  const availableSourceImeis = useMemo(() => {
    return imeis.filter(i => i.status === 'In Stock' && i.warehouseId === srcWarehouseId);
  }, [imeis, srcWarehouseId]);

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(trf => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        trf.transferNo.toLowerCase().includes(q) ||
        trf.sourceWarehouseName.toLowerCase().includes(q) ||
        trf.destinationWarehouseName.toLowerCase().includes(q) ||
        trf.items.some(it => it.imeis.some(im => im.includes(q)) || it.productName.toLowerCase().includes(q));

      const matchesWh = selectedWarehouseFilter === 'all' ||
        trf.sourceWarehouseId === selectedWarehouseFilter ||
        trf.destinationWarehouseId === selectedWarehouseFilter;

      const matchesStatus = selectedStatusFilter === 'all' || trf.status === selectedStatusFilter;

      return matchesSearch && matchesWh && matchesStatus;
    });
  }, [stockTransfers, searchTerm, selectedWarehouseFilter, selectedStatusFilter]);

  // KPIs
  const totalTransfers = stockTransfers.length;
  const totalUnitsTransferred = stockTransfers.reduce((s, t) => s + t.totalQuantity, 0);
  const inTransitCount = stockTransfers.filter(t => t.status === 'Dispatched' || t.status === 'Approved' || t.status === 'Requested').length;
  const completedCount = stockTransfers.filter(t => t.status === 'Received').length;

  const handleOpenAddModal = () => {
    if (onOpenStockTransfer) {
      onOpenStockTransfer();
      return;
    }
    setFormError(null);
    setSelectedImeis([]);
    setTransferNotes('');
    if (warehouses.length >= 2) {
      setSrcWarehouseId(warehouses[0].id);
      setDestWarehouseId(warehouses[1].id);
    }
    setShowAddModal(true);
  };

  const handleToggleImei = (imeiStr: string) => {
    setSelectedImeis(prev =>
      prev.includes(imeiStr) ? prev.filter(i => i !== imeiStr) : [...prev, imeiStr]
    );
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (srcWarehouseId === destWarehouseId) {
      setFormError('উৎস এবং গন্তব্য ওয়্যারহাউস একই হতে পারে না! ভিন্ন দুটি ওয়্যারহাউস নির্বাচন করুন।');
      return;
    }

    if (selectedImeis.length === 0) {
      setFormError('অনুগ্রহ করে ট্রান্সফার করার জন্য কমপক্ষে একটি ইন-স্টক ডিভাইস (IMEI) নির্বাচন করুন।');
      return;
    }

    // Group selected IMEIs by product
    const itemsMap: Record<string, { productId: string; variantId: string; imeis: string[] }> = {};
    selectedImeis.forEach(im => {
      const imeiRec = imeis.find(i => i.imei1 === im);
      if (imeiRec) {
        const key = `${imeiRec.productId}_${imeiRec.variantId}`;
        if (!itemsMap[key]) {
          itemsMap[key] = {
            productId: imeiRec.productId,
            variantId: imeiRec.variantId,
            imeis: []
          };
        }
        itemsMap[key].imeis.push(im);
      }
    });

    const res = createStockTransfer({
      sourceWarehouseId: srcWarehouseId,
      destinationWarehouseId: destWarehouseId,
      items: Object.values(itemsMap),
      notes: transferNotes.trim()
    });

    if (res.success) {
      setShowAddModal(false);
      setSelectedImeis([]);
      setTransferNotes('');
      setStatusMsg(`স্টক ট্রান্সফার #${res.transferNo} সফলভাবে সম্পন্ন হয়েছে (${selectedImeis.length}টি ডিভাইস)।`);
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setFormError(res.error || 'স্টক ট্রান্সফার সম্পন্ন করা সম্ভব হয়নি।');
    }
  };

  const handleStatusChange = (id: string, newStatus: StockTransfer['status']) => {
    const res = updateStockTransferStatus(id, newStatus);
    if (res.success) {
      setStatusMsg(`ট্রান্সফার স্ট্যাটাস "${newStatus}" এ সফলভাবে আপডেট করা হয়েছে।`);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleDeleteTransfer = (id: string, transferNo: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে স্টক ট্রান্সফার #${transferNo} মুছে ফেলতে চান?`)) {
      const res = deleteStockTransfer(id);
      if (res.success) {
        setStatusMsg(`স্টক ট্রান্সফার #${transferNo} সফলভাবে মুছে ফেলা হয়েছে।`);
        setTimeout(() => setStatusMsg(null), 4000);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Inter-Warehouse Stock Transfers
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সেন্ট্রাল হাব, রিজিওনাল ডিপো এবং রিটেল আউটলেটের মধ্যে সিরিয়ালাইজড হ্যান্ডসেট ট্রান্সফার ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Initiate Stock Transfer</span>
        </button>
      </div>

      {/* Action Notification */}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Transfers</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalTransfers} Records</div>
          <div className="text-[10px] text-slate-400 mt-1">সর্বমোট চালানের সংখ্যা</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Transferred Units</div>
          <div className="text-xl font-black text-blue-700 mt-1">{totalUnitsTransferred} Devices</div>
          <div className="text-[10px] text-slate-400 mt-1">স্থানান্তরিত হ্যান্ডসেটের সংখ্যা</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">In-Transit / Dispatched</div>
          <div className="text-xl font-black text-amber-600 mt-1">{inTransitCount} Lots</div>
          <div className="text-[10px] text-slate-400 mt-1">পথিমধ্যে থাকা চালান</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Completed & Received</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{completedCount} Received</div>
          <div className="text-[10px] text-slate-400 mt-1">গন্তব্যে গৃহীত ও স্টকে যুক্ত</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="transfers-search-input"
            data-search-input="true"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by transfer #, IMEI, warehouse, product (Ctrl+F)..."
            className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded border border-slate-300/80 pointer-events-none">
            ^F
          </kbd>
        </div>

        <button
          type="button"
          onClick={() => {
            setScannerContext('filter');
            setShowScannerModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          title="স্ক্যানার দিয়ে হ্যান্ডসেটের ট্রান্সফার চালান খুঁজুন"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan / Filter</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedWarehouseFilter}
            onChange={e => setSelectedWarehouseFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">সকল ওয়্যারহাউস</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="Requested">Requested</option>
            <option value="Approved">Approved</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            কোনো স্টক ট্রান্সফার রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          filteredTransfers.map(trf => (
            <div key={trf.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 transition hover:border-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 text-sm">{trf.transferNo}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trf.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                    trf.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {trf.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    তারিখ: <b>{formatDate(trf.transferDate)}</b> • প্রেরক: <b>{trf.dispatchedBy || 'System'}</b>
                  </span>

                  {/* Actions */}
                  {trf.status !== 'Received' && trf.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(trf.id, 'Received')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="চালান গৃহীত হিসেবে মার্ক করুন"
                    >
                      <Check className="w-3 h-3" />
                      <span>রিসিভ করুন</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTransfer(trf.id, trf.transferNo)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="চালান মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">উৎস ওয়্যারহাউস (Source)</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{trf.sourceWarehouseName}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">গন্তব্য ওয়্যারহাউস (Destination)</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{trf.destinationWarehouseName}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="font-bold text-slate-700">স্থানান্তরিত ডিভাইস ({trf.totalQuantity} Units):</span>
                <div className="space-y-2">
                  {trf.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{it.productName}</span>
                        <span className="text-slate-500 ml-2">({it.variantDesc})</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {it.imeis.map(im => (
                          <button
                            key={im}
                            onClick={() => onOpenIMEILookup(im)}
                            className="font-mono text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition cursor-pointer"
                            title="IMEI ট্র্যাকিং দেখুন"
                          >
                            {im}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {trf.notes && (
                <p className="text-[11px] text-slate-500 italic">নোট: {trf.notes}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Stock Transfer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ইন্টার-ওয়্যারহাউস স্টক ট্রান্সফার</h3>
                  <p className="text-[11px] text-slate-500">একটি ডিপো বা শাখা থেকে অন্য শাখায় স্টক স্থানান্তর</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    উৎস ওয়্যারহাউস (Source Warehouse) *
                  </label>
                  <select
                    value={srcWarehouseId}
                    onChange={e => {
                      setSrcWarehouseId(e.target.value);
                      setSelectedImeis([]);
                      setFormError(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.city || w.address})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    গন্তব্য ওয়্যারহাউস (Destination Warehouse) *
                  </label>
                  <select
                    value={destWarehouseId}
                    onChange={e => {
                      setDestWarehouseId(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.city || w.address})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IMEI Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    স্থানান্তরের জন্য ডিভাইস নির্বাচন করুন ({availableSourceImeis.length}টি ইন-স্টক পাওয়া গেছে) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScannerContext('select-transfer');
                        setShowScannerModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>⚡ Multi-Scan</span>
                    </button>
                    <span className="font-bold text-blue-700">
                      নির্বাচিত: {selectedImeis.length}টি
                    </span>
                  </div>
                </div>

                {availableSourceImeis.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                    নির্বাচিত উৎস ওয়্যারহাউসে কোনো ইন-স্টক ডিভাইস নেই। অনুগ্রহ করে অন্য ওয়্যারহাউস নির্বাচন করুন।
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                    {availableSourceImeis.map(im => {
                      const isChecked = selectedImeis.includes(im.imei1);
                      return (
                        <label
                          key={im.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                            isChecked ? 'bg-blue-50 border border-blue-200' : 'bg-white hover:bg-slate-100 border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleImei(im.imei1)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800">{im.productName}</span>
                              <span className="text-slate-400 text-[10px] ml-1.5">({im.variantDesc})</span>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-blue-600">{im.imei1}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ট্রান্সফার নোট / চালানের কারণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="যেমন: ব্রাঞ্চের স্টক ঘাটতি পূরণ, জরুরি অর্ডার ইত্যাদি..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={availableSourceImeis.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ট্রান্সফার নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Barcode / Multi-IMEI Scanner Modal */}
      {showScannerModal && (
        <MultiBarcodeScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title={
            scannerContext === 'filter'
              ? 'স্টক ট্রান্সফার সার্চ ও ভেরিফিকেশন স্ক্যানার'
              : 'স্টক ট্রান্সফার ডিভাইস সিলেকশন স্ক্যানার'
          }
          subtitle={
            scannerContext === 'filter'
              ? 'হ্যান্ডসেটের বারকোড/IMEI স্ক্যান করে সংশ্লিষ্ট চালানের উপস্থিতি যাচাই করুন'
              : 'স্থানান্তরযোগ্য হ্যান্ডসেটগুলোর বারকোড বা IMEI গান, ক্যামেরা অথবা কিবোর্ড দিয়ে দ্রুত স্ক্যান করুন'
          }
          mode={scannerContext === 'filter' ? 'lookup' : 'transfer'}
          warehouseId={scannerContext === 'select-transfer' ? srcWarehouseId : undefined}
          onConfirm={(records, tokens) => {
            if (scannerContext === 'filter') {
              if (tokens && tokens.length > 0) {
                setSearchTerm(tokens[0]);
              }
            } else {
              const imeisToAdd = records.length > 0 ? records.map(r => r.imei1) : (tokens || []);
              setSelectedImeis(prev => Array.from(new Set([...prev, ...imeisToAdd])));
            }
            setShowScannerModal(false);
          }}
        />
      )}
    </div>
  );
};
