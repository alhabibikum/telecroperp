import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Truck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Building,
  Camera,
  Barcode
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';

interface SupplierReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReturn?: (returnNo: string) => void;
}

export const SupplierReturnModal: React.FC<SupplierReturnModalProps> = ({
  isOpen,
  onClose,
  onSuccessReturn
}) => {
  const { suppliers, imeis, processSupplierReturn } = useERP();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedImei, setSelectedImei] = useState('');
  const [returnReason, setReturnReason] = useState('Factory defect / Dead on Arrival (DOA) credit return');
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMultiScanner, setShowMultiScanner] = useState(false);

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  // In-stock IMEIs from this supplier
  const supplierImeisInStock = imeis.filter(i =>
    i.supplierId === supplierId &&
    (i.status === 'In Stock' || i.status === 'Damaged' || i.status === 'Returned')
  );

  const handleImeiSelect = (imeiNum: string) => {
    setSelectedImei(imeiNum);
    const found = imeis.find(i => i.imei1 === imeiNum);
    if (found) {
      setReturnAmount(found.purchaseCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedImei) {
      setErrorMsg('Please select an IMEI to return.');
      return;
    }

    const res = processSupplierReturn({
      supplierId,
      imei: selectedImei,
      returnReason,
      amount: returnAmount
    });

    if (res.success && res.returnNo) {
      if (onSuccessReturn) onSuccessReturn(res.returnNo);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to process return to supplier');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Return Stock Handset to Supplier</h3>
              <p className="text-xs text-slate-500">Deducts from supplier payable & updates inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Supplier Distributor *</label>
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setSelectedImei('');
                setReturnAmount(0);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Payable: {formatBDT(s.currentDue)})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Select Device IMEI to Return *</label>
              <button
                type="button"
                onClick={() => setShowMultiScanner(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer"
                title="Camera বা Barcode Gun দিয়ে স্ক্যান করুন"
              >
                <Camera className="w-3 h-3" />
                <span>Multi-Scan</span>
              </button>
            </div>
            {supplierImeisInStock.length === 0 ? (
              <div className="text-rose-600 py-2">No units from this supplier currently eligible for return.</div>
            ) : (
              <select
                value={selectedImei}
                onChange={(e) => handleImeiSelect(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                required
              >
                <option value="">-- Choose IMEI from Stock --</option>
                {supplierImeisInStock.map(im => (
                  <option key={im.id} value={im.imei1}>
                    {im.imei1} - {im.productName} ({im.variantDesc}) [Cost: {formatBDT(im.purchaseCost)}]
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Debit Note / Return Credit Value (৳) *</label>
            <input
              type="number"
              value={returnAmount}
              onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-rose-700"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Return Reason *</label>
            <textarea
              rows={2}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedImei}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              Confirm Supplier Return
            </button>
          </div>
        </form>
      </div>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="return-supplier"
        supplierId={supplierId}
        onConfirm={(validRecords) => {
          if (validRecords.length > 0) {
            handleImeiSelect(validRecords[0].imei1);
          }
        }}
        confirmButtonText="রিটার্ন আইটেম নির্ধারণ করুন"
      />
    </div>
  );
};
