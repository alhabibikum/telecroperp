import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Undo2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  ShieldCheck,
  Camera,
  Barcode
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { ReturnCondition } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { WindowsModalFrame } from '../common/WindowsModalFrame';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

interface CustomerReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReturn?: (returnNo: string) => void;
}

export const CustomerReturnModal: React.FC<CustomerReturnModalProps> = ({
  isOpen,
  onClose,
  onSuccessReturn
}) => {
  const { showSuccess } = useToast();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
    imeis,
    warehouses,
    customers,
    processCustomerReturn
  } = useERP();

  const [inputIMEI, setInputIMEI] = useState('');
  const [condition, setCondition] = useState<ReturnCondition>('Open Box');
  const [returnReason, setReturnReason] = useState('Customer color exchange request / retail box unsealed');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [restockWarehouseId, setRestockWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMultiScanner, setShowMultiScanner] = useState(false);

  if (!isOpen) return null;

  // Search IMEI record
  const matchingIMEI = imeis.find(i => i.imei1 === inputIMEI.trim());

  const handleIMEIChange = (val: string) => {
    setInputIMEI(val);
    const found = imeis.find(i => i.imei1 === val.trim());
    if (found && found.salesPrice) {
      setRefundAmount(found.salesPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!matchingIMEI) {
      setErrorMsg('IMEI not found in system! Please enter a valid 15-digit IMEI.');
      return;
    }

    if (matchingIMEI.status !== 'Sold') {
      setErrorMsg(`IMEI ${matchingIMEI.imei1} is currently in '${matchingIMEI.status}' state. Only previously 'Sold' items can be returned.`);
      return;
    }

    if (!matchingIMEI.customerId || !matchingIMEI.salesInvoiceNo) {
      setErrorMsg('This IMEI does not have a linked customer or sales invoice record.');
      return;
    }

    const result = processCustomerReturn({
      originalInvoiceNo: matchingIMEI.salesInvoiceNo,
      customerId: matchingIMEI.customerId,
      imei: matchingIMEI.imei1,
      returnReason,
      condition,
      refundOrCreditAmount: refundAmount,
      restockWarehouseId
    });

    if (result.success && result.returnNo) {
      const retNo = result.returnNo;
      recordFieldHistory('returnReason', returnReason);
      if (matchingIMEI) {
        recordFieldHistory('imei', matchingIMEI.imei1);
      }

      setSuccessMsg(`রিটার্ন চালান "${retNo}" সফলভাবে প্রস্তুত হয়েছে! উইন্ডো খোলা রয়েছে পরবর্তী এন্ট্রির জন্য।`);
      showSuccess(
        'কাস্টমার রিটার্ন সফলভাবে জমা হয়েছে!',
        `রিটার্ন নং: ${retNo} সিস্টেমে অন্তর্ভুক্ত হয়েছে।`
      );

      // Reset form fields for next return - DO NOT CLOSE WINDOW
      setInputIMEI('');
      setRefundAmount(0);
    } else {
      setErrorMsg(result.error || 'Failed to process return');
    }
  };

  return (
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={onClose}
        onSkip={onClose}
        modalId="modal-customer-return"
        title="Customer Return & IMEI Validation Engine"
        subtitle="Verifies genuine sales invoice, restocks unit & issues credit note"
        icon={<Undo2 className="w-4 h-4 text-purple-400" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white/40 backdrop-blur-md">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
              >
                উইন্ডো বন্ধ করুন
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* IMEI input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Scan or Enter 15-Digit IMEI to Validate Return *
              </label>
              <button
                type="button"
                onClick={() => setShowMultiScanner(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 transition cursor-pointer"
                title="Camera বা Barcode Gun স্ক্যানার দিয়ে রিটার্ন যাচাই করুন"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Multi-Scan (Gun/Camera)</span>
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 358921104592045"
                value={inputIMEI}
                onChange={(e) => handleIMEIChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:bg-white"
                required
                autoFocus
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Quick test: try <b>358921104592045</b> (Sold Galaxy S24 Ultra)</span>
            </div>
          </div>

          {/* Validation Result Box */}
          {matchingIMEI && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              matchingIMEI.status === 'Sold' ? 'bg-purple-50/70 border-purple-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{matchingIMEI.productName} ({matchingIMEI.variantDesc})</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  matchingIMEI.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Status: {matchingIMEI.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200">
                <div>Original Customer: <b className="text-slate-800">{matchingIMEI.customerName || '-'}</b></div>
                <div>Sales Invoice: <b className="font-mono text-blue-700">{matchingIMEI.salesInvoiceNo || '-'}</b></div>
                <div>Sale Date: <b className="text-slate-800">{formatDate(matchingIMEI.salesDate)}</b></div>
                <div>Original Sold Price: <b className="text-emerald-700">{formatBDT(matchingIMEI.salesPrice)}</b></div>
              </div>
            </div>
          )}

          {/* Return Condition & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Physical Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ReturnCondition)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="Sealed">Sealed (Unopened Factory Condition)</option>
                <option value="Open Box">Open Box (Like New, Accessories Intact)</option>
                <option value="Used">Used / Light Scratches</option>
                <option value="Damaged">Damaged / Hardware Issue (Quarantine)</option>
                <option value="Defective">Defective / Dead On Arrival (DOA)</option>
                <option value="Missing Accessories">Missing Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Warehouse / Quarantine *
              </label>
              <select
                value={restockWarehouseId}
                onChange={(e) => setRestockWarehouseId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Credit / Refund Amount (৳) *
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
              required
            />
            <span className="text-[11px] text-slate-400">
              This amount will be credited to the customer's ledger, reducing their outstanding balance.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Return *
            </label>
            <HistoryInput
              historyKey="returnReason"
              type="text"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <div className="text-xs text-slate-500 font-medium">
              * Approved returns automatically update Inventory and Dr. Sales Returns, Cr. AR.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/80 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Approve Return & Issue Credit Note
              </button>
            </div>
          </div>
        </form>
      </WindowsModalFrame>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="return-customer"
        onConfirm={(validRecords) => {
          if (validRecords.length > 0) {
            handleIMEIChange(validRecords[0].imei1);
          }
        }}
        confirmButtonText="রিটার্ন আইটেম নির্ধারণ করুন"
      />
    </>
  );
};
