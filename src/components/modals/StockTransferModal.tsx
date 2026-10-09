import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  ArrowRightLeft,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Barcode
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { IMEIRecord } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { WindowsModalFrame } from '../common/WindowsModalFrame';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessTransfer?: (transferNo: string) => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccessTransfer
}) => {
  const { warehouses, products, imeis, transferStock } = useERP();
  const { showSuccess } = useToast();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>(warehouses[1]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || '');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMultiScanner, setShowMultiScanner] = useState(false);

  const handleMultiScanConfirm = (validRecords: IMEIRecord[]) => {
    if (validRecords.length === 0) return;
    const first = validRecords[0];
    if (first.productId !== selectedProductId || first.variantId !== selectedVariantId) {
      setSelectedProductId(first.productId);
      setSelectedVariantId(first.variantId);
    }
    const matchingImeis = validRecords.map(r => r.imei1);
    setSelectedImeis(prev => Array.from(new Set([...prev, ...matchingImeis])));
  };

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId);
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariantId);

  // Available IMEIs in the source warehouse
  const availableInSource = imeis.filter(i =>
    i.productId === selectedProductId &&
    i.variantId === selectedVariantId &&
    i.warehouseId === sourceWarehouseId &&
    i.status === 'In Stock'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (sourceWarehouseId === destinationWarehouseId) {
      setErrorMsg('Source warehouse and Destination warehouse cannot be the same!');
      return;
    }

    if (selectedImeis.length === 0) {
      setErrorMsg('Please select at least one IMEI to transfer.');
      return;
    }

    const result = transferStock({
      sourceWarehouseId,
      destinationWarehouseId,
      items: [
        {
          productId: selectedProductId,
          variantId: selectedVariantId,
          imeis: selectedImeis
        }
      ],
      notes
    });

    if (result.success && result.transferNo) {
      const trNo = result.transferNo;
      recordFieldHistory('notes', notes);

      setSuccessMsg(`স্টক ট্রান্সফার চালান "${trNo}" সফলভাবে প্রস্তুত হয়েছে! উইন্ডো খোলা রয়েছে পরবর্তী ট্রান্সফারের জন্য।`);
      showSuccess(
        'স্টক ট্রান্সফার সফলভাবে অনুমোদিত হয়েছে!',
        `চালান নং: ${trNo} সিস্টেমে রেকর্ড করা হয়েছে।`
      );

      // Reset form fields for next transfer - DO NOT CLOSE WINDOW
      setSelectedImeis([]);
      setNotes('');
    } else {
      setErrorMsg(result.error || 'Failed to dispatch stock transfer');
    }
  };

  return (
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={onClose}
        onSkip={onClose}
        modalId="modal-stock-transfer"
        title="Inter-Warehouse Stock Transfer"
        subtitle="Move serialized devices between Central Warehouse, Regional Hubs & Retail Outlets"
        icon={<ArrowRightLeft className="w-4 h-4 text-blue-400" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold">{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 underline cursor-pointer"
              >
                উইন্ডো বন্ধ করুন
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Warehouses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source Dispatch Facility *
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => {
                  setSourceWarehouseId(e.target.value);
                  setSelectedImeis([]);
                }}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination Receiving Facility *
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product & Variant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Model *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(pr => pr.id === e.target.value);
                  if (p?.variants[0]) setSelectedVariantId(p.variants[0].id);
                  setSelectedImeis([]);
                }}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Variant / Specs *
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value);
                  setSelectedImeis([]);
                }}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {currentProduct?.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.ram}/{v.storage} - {v.color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* IMEI Selector */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Select Available IMEIs to Transfer ({availableInSource.length} In Stock in Source)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMultiScanner(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-700 shadow-xs transition cursor-pointer"
                  title="Gun বা Camera স্ক্যানার দিয়ে ডিভাইসগুলো স্ক্যান করুন"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Multi-Scan</span>
                </button>
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {selectedImeis.length} Units Selected
                </span>
              </div>
            </div>

            {availableInSource.length === 0 ? (
              <div className="py-4 text-center text-xs text-rose-600 dark:text-rose-400">
                No units of this variant currently in stock at the chosen source warehouse.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
                {availableInSource.map(im => {
                  const isSelected = selectedImeis.includes(im.imei1);
                  return (
                    <button
                      key={im.id}
                      type="button"
                      onClick={() => {
                        setSelectedImeis(prev =>
                          isSelected ? prev.filter(n => n !== im.imei1) : [...prev, im.imei1]
                        );
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-md border font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {im.imei1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transfer Notes / Driver Chalan #
            </label>
            <HistoryInput
              historyKey="notes"
              type="text"
              placeholder="e.g. Courier security pouch #99281, van driver Md. Rafiq"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              * Immediately moves physical custody of IMEIs to destination warehouse.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedImeis.length === 0}
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-95 text-white rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                Confirm Transfer ({selectedImeis.length} Units)
              </button>
            </div>
          </div>
        </form>
      </WindowsModalFrame>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="transfer"
        targetWarehouseId={sourceWarehouseId}
        onConfirm={handleMultiScanConfirm}
        confirmButtonText="ট্রান্সফার তালিকায় যুক্ত করুন"
      />
    </>
  );
};
