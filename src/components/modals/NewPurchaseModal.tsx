import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Truck,
  Plus,
  Trash2,
  AlertTriangle,
  Barcode,
  CheckCircle2,
  FileText,
  Camera
} from 'lucide-react';
import { formatBDT, parseBulkIMEIs } from '../../utils/formatters';
import { extractTokensFromRaw } from '../../utils/barcodeScannerUtils';
import { PaymentMethodType, PurchaseItem } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { useFormKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';
import { UnsavedChangesDialog } from '../common/UnsavedChangesDialog';
import { WindowsModalFrame } from '../common/WindowsModalFrame';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

interface NewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPurchase?: (invoiceNo: string) => void;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccessPurchase
}) => {
  const { showSuccess } = useToast();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastPurchaseNo, setLastPurchaseNo] = useState<string | null>(null);
  const {
    suppliers,
    warehouses,
    products,
    bankAccounts,
    createPurchase,
    imeis
  } = useERP();

  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitCost: number;
    bulkIMEIText: string;
  }>>([
    {
      productId: products[0]?.id || '',
      variantId: products[0]?.variants[0]?.id || '',
      quantity: 5,
      unitCost: products[0]?.variants[0]?.purchasePrice || 0,
      bulkIMEIText: ''
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  // Form dirty state check
  const isFormDirty = items.some(it => it.bulkIMEIText.trim().length > 0 || it.quantity > 5) || paidAmount > 0 || referenceNo.trim().length > 0;

  const handleRequestClose = () => {
    if (isFormDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const { containerRef, onKeyDown } = useFormKeyboardNavigation({
    isOpen,
    autoFocusFirst: true,
    onCancel: handleRequestClose
  });

  // Multi-Barcode Scanner State
  const [showMultiScanner, setShowMultiScanner] = useState(false);
  const [activeScanItemIdx, setActiveScanItemIdx] = useState<number>(0);

  const handleMultiScanConfirm = (_records: any[], allCleanTokens: string[]) => {
    if (allCleanTokens.length === 0) return;
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx === activeScanItemIdx) {
          return {
            ...item,
            bulkIMEIText: allCleanTokens.join('\n'),
            quantity: Math.max(item.quantity, allCleanTokens.length)
          };
        }
        return item;
      })
    );
  };

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);

  const subTotal = items.reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);
  const grandTotal = subTotal;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleAddItem = () => {
    if (products.length > 0) {
      const prod = products[0];
      const variant = prod.variants[0];
      setItems(prev => [
        ...prev,
        {
          productId: prod.id,
          variantId: variant.id,
          quantity: 2,
          unitCost: variant.purchasePrice,
          bulkIMEIText: ''
        }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleProductChange = (index: number, newProdId: string) => {
    const prod = products.find(p => p.id === newProdId);
    if (!prod) return;
    const variant = prod.variants[0];
    setItems(prev =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              productId: newProdId,
              variantId: variant.id,
              unitCost: variant.purchasePrice
            }
          : it
      )
    );
  };

  const handleVariantChange = (index: number, newVariantId: string) => {
    const it = items[index];
    const prod = products.find(p => p.id === it.productId);
    const variant = prod?.variants.find(v => v.id === newVariantId);
    if (!variant) return;

    setItems(prev =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              variantId: newVariantId,
              unitCost: variant.purchasePrice
            }
          : item
      )
    );
  };

  // Helper to generate sample IMEIs for the user if they want quick testing
  const handleAutoFillSampleIMEIs = (index: number) => {
    const it = items[index];
    const generated: string[] = [];
    const prefix = '358' + Math.floor(100000 + Math.random() * 900000);
    for (let i = 0; i < it.quantity; i++) {
      const suffix = (1000 + i + Math.floor(Math.random() * 8000)).toString();
      generated.push(`${prefix}${suffix}`);
    }
    setItems(prev =>
      prev.map((item, idx) =>
        idx === index ? { ...item, bulkIMEIText: generated.join('\n') } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSupplier) {
      setErrorMsg('Please select a supplier.');
      return;
    }

    const purchaseItemsPayload: PurchaseItem[] = [];
    const imeisToRegister: Array<{
      imei1: string;
      imei2?: string;
      serialNumber?: string;
      variantId: string;
      productId: string;
    }> = [];

    const existingSystemImeis = new Set(imeis.map(i => i.imei1));
    const batchSeenImeis = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const prod = products.find(p => p.id === it.productId);
      const variant = prod?.variants.find(v => v.id === it.variantId);
      if (!prod || !variant) continue;

      const parsed = parseBulkIMEIs(it.bulkIMEIText);

      if (parsed.valid.length !== it.quantity) {
        setErrorMsg(
          `Item #${i + 1} (${prod.model}): Please provide exactly ${it.quantity} valid 15-digit IMEIs. You provided ${parsed.valid.length}.`
        );
        return;
      }

      if (parsed.duplicates.length > 0) {
        setErrorMsg(`Item #${i + 1}: Duplicate IMEIs found within text: ${parsed.duplicates.join(', ')}`);
        return;
      }

      for (const imeiNum of parsed.valid) {
        if (existingSystemImeis.has(imeiNum)) {
          setErrorMsg(`IMEI ${imeiNum} already exists in the system! Duplicate IMEIs are strictly prevented.`);
          return;
        }
        if (batchSeenImeis.has(imeiNum)) {
          setErrorMsg(`IMEI ${imeiNum} duplicated across multiple item lines!`);
          return;
        }
        batchSeenImeis.add(imeiNum);

        imeisToRegister.push({
          imei1: imeiNum,
          serialNumber: `SN${imeiNum.substring(7)}`,
          productId: it.productId,
          variantId: it.variantId
        });
      }

      purchaseItemsPayload.push({
        id: `pur-item-${Date.now()}-${i}`,
        productId: it.productId,
        productName: prod.model,
        variantId: it.variantId,
        variantDesc: `${variant.ram}/${variant.storage} - ${variant.color}`,
        quantity: it.quantity,
        unitCost: it.unitCost,
        discount: 0,
        vatRate: 0,
        totalCost: it.unitCost * it.quantity,
        imeis: parsed.valid
      });
    }

    const result = createPurchase(
      {
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        purchaseDate,
        dueDate,
        warehouseId: selectedWarehouse?.id || '',
        warehouseName: selectedWarehouse?.name || '',
        items: purchaseItemsPayload,
        subTotal,
        discountTotal: 0,
        vatTotal: 0,
        otherCost: 0,
        grandTotal,
        paidAmount,
        dueAmount,
        paymentMethod,
        bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
        referenceNo: referenceNo || undefined,
        status: dueAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Received',
        notes
      },
      imeisToRegister
    );

    if (result.success && result.invoiceNo) {
      const purNo = result.invoiceNo;
      setLastPurchaseNo(purNo);
      recordFieldHistory('referenceNo', referenceNo);
      recordFieldHistory('notes', notes);

      setSuccessMsg(`পারচেজ চালান "${purNo}" সফলভাবে সংরক্ষিত হয়েছে! উইন্ডো খোলা রয়েছে পরবর্তী এন্ট্রির জন্য।`);
      showSuccess(
        'পারচেজ চালান সফলভাবে সংরক্ষিত হয়েছে!',
        `চালান নং: ${purNo} সিস্টেমে যুক্ত হয়েছে। উইন্ডো খোলা রয়েছে পরবর্তী এন্ট্রির জন্য।`
      );

      // Reset form fields for next entry - DO NOT CLOSE WINDOW
      setReferenceNo('');
      setPaidAmount(0);
      setNotes('');
      setItems([
        {
          productId: products[0]?.id || '',
          variantId: products[0]?.variants[0]?.id || '',
          quantity: 1,
          unitCost: products[0]?.variants[0]?.purchasePrice || 0,
          bulkIMEIText: ''
        }
      ]);
    } else {
      setErrorMsg(result.error || 'Failed to save purchase invoice');
    }
  };

  return (
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={handleRequestClose}
        onSkip={handleRequestClose}
        modalId="modal-new-purchase"
        title="নতুন পারচেজ ও স্টক ইনওয়ার্ড (Supplier Purchase & Inward)"
        subtitle="Register authorized consignment stock, automatically generate warehouse inventory & accounts payable"
        icon={<Truck className="w-4 h-4 text-blue-400" />}
        maxWidth="max-w-5xl"
      >
        <form ref={containerRef as any} onKeyDown={onKeyDown} onSubmit={handleSubmit} className="p-3 space-y-3 max-h-[82vh] overflow-y-auto bg-[#f0f0f0] dark:bg-[#1e1e1e] text-[#000000] dark:text-[#ffffff]">
          {successMsg && (
            <div className="p-2 border border-[#107c41] bg-[#e6f4ea] text-[#107c41] text-xs flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleRequestClose}
                className="text-xs text-[#0055ea] underline cursor-pointer"
              >
                উইন্ডো বন্ধ করুন
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-2 border border-[#a80000] bg-[#fde7e9] text-[#a80000] text-xs flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* GroupBox 1: Supplier, Warehouse, Dates */}
          <fieldset className="win-groupbox">
            <legend className="win-legend">১. ভেন্ডর ও চালান তথ্য (Vendor & Consignment Info)</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Supplier / Brand Distributor *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full text-xs"
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Due: {formatBDT(s.currentDue)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Receiving Warehouse *
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full text-xs"
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Purchase / Inward Date *
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* GroupBox 2: Line Items & IMEIs */}
          <fieldset className="win-groupbox">
            <legend className="win-legend flex items-center justify-between w-full">
              <span>২. পণ্য তালিকা ও আইএমইআই এন্ট্রি (Products & Stock Inward)</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="win-button text-xs ml-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item Line [F3]</span>
              </button>
            </legend>

            <div className="space-y-3 pt-1">
              {items.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                const parsedIMEIs = parseBulkIMEIs(item.bulkIMEIText);
                const isCountMatched = parsedIMEIs.valid.length === item.quantity;

                return (
                  <div key={idx} className="p-2 border border-[#7f9db9] dark:border-[#3f3f46] bg-white dark:bg-[#252526] space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold mb-0.5">
                          Product Model
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-bold mb-0.5">
                          Variant / Specs
                        </label>
                        <select
                          value={item.variantId}
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full text-xs"
                        >
                          {prod?.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.ram}/{v.storage} - {v.color}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold mb-0.5">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-full text-xs font-bold font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold mb-0.5">
                          Unit Cost (৳)
                        </label>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitCost: val } : it));
                          }}
                          className="w-full text-xs font-bold font-mono"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="win-button text-xs py-1 text-red-600 disabled:opacity-20"
                          title="Remove Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bulk IMEI Input Box */}
                    <div className="p-2 border border-[#d0d0d0] dark:border-[#333337] bg-[#f9f9f9] dark:bg-[#1e1e1e]">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold flex items-center gap-1.5">
                          <span>Paste {item.quantity} IMEI 1 Numbers (Comma or Newline separated):</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScanItemIdx(idx);
                              setShowMultiScanner(true);
                            }}
                            className="win-button text-[11px]"
                          >
                            <Camera className="w-3 h-3 text-[#0055ea]" />
                            <span>Scan Gun / Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAutoFillSampleIMEIs(idx)}
                            className="win-button text-[11px]"
                          >
                            + Auto-Gen (Test)
                          </button>
                          <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 border ${
                            isCountMatched 
                              ? 'border-[#107c41] bg-[#e6f4ea] text-[#107c41]' 
                              : 'border-[#d83b01] bg-[#fff4ce] text-[#d83b01]'
                          }`}>
                            {parsedIMEIs.valid.length} / {item.quantity} Valid IMEIs
                          </span>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder={`358921104592011\n358921104592022\n...or scan with barcode reader`}
                        value={item.bulkIMEIText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => prev.map((it, i) => i === idx ? { ...it, bulkIMEIText: val } : it));
                        }}
                        className="w-full text-xs font-mono"
                      />

                      {parsedIMEIs.invalid.length > 0 && (
                        <div className="text-[11px] text-red-600 mt-1 font-mono">
                          Invalid IMEI formats (must be 14-16 digits): {parsedIMEIs.invalid.join(', ')}
                        </div>
                      )}
                      {parsedIMEIs.duplicates.length > 0 && (
                        <div className="text-[11px] text-red-600 mt-1 font-mono">
                          Duplicate IMEIs: {parsedIMEIs.duplicates.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* GroupBox 3: Payment Settlement & Summary */}
          <fieldset className="win-groupbox">
            <legend className="win-legend">৩. পেমেন্ট ও সেটেলমেন্ট হিসাব (Payment Settlement)</legend>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  className="w-full text-xs"
                >
                  <option value="Bank Transfer">Bank Transfer (RTGS / BEFTN)</option>
                  <option value="Cash">Cash Payout</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Debit Bank Account
                  </label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full text-xs"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (Bal: {formatBDT(b.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">
                  Immediate Paid (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-bold text-green-700 dark:text-green-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Supplier Chalan / PO Ref #
                </label>
                <HistoryInput
                  historyKey="referenceNo"
                  type="text"
                  placeholder="e.g. FAIR-CH-2026-90"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#7f9db9] dark:border-[#3f3f46] text-xs font-mono">
              <div>
                <span>Total Purchase: </span>
                <span className="font-bold text-sm text-[#000000] dark:text-[#ffffff]">{formatBDT(grandTotal)}</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span>Paid: </span>
                  <span className="font-bold text-green-700 dark:text-green-400">{formatBDT(paidAmount)}</span>
                </div>
                <div className="pl-4 border-l border-[#808080]">
                  <span>Supplier Due: </span>
                  <span className="font-bold text-sm text-red-600 dark:text-red-400">{formatBDT(dueAmount)}</span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* GroupBox 4: Notes */}
          <fieldset className="win-groupbox">
            <legend className="win-legend">৪. নোট / রিমার্কস (Notes)</legend>
            <HistoryInput
              historyKey="notes"
              type="text"
              placeholder="e.g. BTRC certified official lot, warranty slip registered."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs"
            />
          </fieldset>

          {/* Classic WinForms Action Buttons Tray */}
          <div className="flex items-center justify-between pt-2 border-t border-[#7f9db9] dark:border-[#3f3f46] bg-[#e1e1e1] dark:bg-[#252526] -mx-3 -mb-3 p-3 select-none">
            <div className="text-[11px] font-mono text-slate-600 dark:text-[#858585]">
              * ডাবল এন্ট্রি: Dr. Merchandise Inventory, Cr. Supplier Payable
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="win-button"
              >
                Cancel [Esc]
              </button>
              <button
                type="submit"
                data-action="save"
                className="win-button win-button-primary"
              >
                Save Consignment [F2 / Enter]
              </button>
            </div>
          </div>
        </form>
      </WindowsModalFrame>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="purchase"
        initialTokens={extractTokensFromRaw(items[activeScanItemIdx]?.bulkIMEIText || '')}
        onConfirm={handleMultiScanConfirm}
        confirmButtonText="সবগুলো IMEI যুক্ত করুন"
      />

      <UnsavedChangesDialog
        isOpen={showUnsavedPrompt}
        onCancel={() => setShowUnsavedPrompt(false)}
        onConfirmDiscard={() => {
          setShowUnsavedPrompt(false);
          onClose();
        }}
        title="পারচেজ ইনভয়েস বাতিল করবেন? (Discard Purchase Entry?)"
        message="আপনি ইতিমধ্যে আইটেম বিবরণ বা আইএমইআই টাইপ করেছেন। এখন বাতিল করলে সব ইনওয়ার্ড এন্ট্রি ড্রাফট মুছে যাবে।"
      />
    </>
  );
};
