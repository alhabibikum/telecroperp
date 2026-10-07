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
      if (onSuccessPurchase) onSuccessPurchase(result.invoiceNo);
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to save purchase invoice');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white/90 backdrop-blur-3xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] w-full max-w-5xl my-auto overflow-hidden border border-white/60 animate-in zoom-in-95 duration-200">
        {/* Top Glossy Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-indigo-500/50 to-teal-500/40 pointer-events-none z-10" />

        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 bg-white/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Supplier Purchase & Bulk IMEI Inward
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Register authorized consignment stock, automatically generate warehouse inventory & accounts payable
              </p>
            </div>
          </div>
          <button onClick={handleRequestClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer" title="Close (Esc)">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={containerRef as any} onKeyDown={onKeyDown} onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-white/40 backdrop-blur-md">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Supplier, Warehouse, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Brand Distributor *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receiving Warehouse *
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase / Inward Date *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-600" />
                <span>Consignment Items & Bulk IMEI Registration</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                const parsedIMEIs = parseBulkIMEIs(item.bulkIMEIText);
                const isCountMatched = parsedIMEIs.valid.length === item.quantity;

                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Product Model
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Variant / Specs
                        </label>
                        <select
                          value={item.variantId}
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                        >
                          {prod?.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.ram}/{v.storage} - {v.color}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Inward Quantity
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
                          className="w-full text-xs p-1.5 border border-slate-300 rounded-lg font-bold"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Unit Cost (৳)
                        </label>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitCost: val } : it));
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded-lg font-bold text-slate-800"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bulk IMEI Input Box */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>Paste {item.quantity} IMEI 1 Numbers (Comma or Newline separated)</span>
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScanItemIdx(idx);
                              setShowMultiScanner(true);
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition cursor-pointer"
                            title="Camera, Barcode Gun, বা বাল্ক পেস্টের মাধ্যমে একসাথে একাধিক IMEI স্ক্যান করুন"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Multi-Scan (Gun/Camera)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAutoFillSampleIMEIs(idx)}
                            className="text-[11px] text-blue-600 hover:underline font-semibold"
                          >
                            + Auto-Gen (Test)
                          </button>
                          <span className={`text-[11px] font-bold ${
                            isCountMatched ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded' : 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded'
                          }`}>
                            {parsedIMEIs.valid.length} / {item.quantity} Valid IMEIs
                          </span>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        placeholder={`358921104592011\n358921104592022\n...or scan with barcode reader`}
                        value={item.bulkIMEIText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => prev.map((it, i) => i === idx ? { ...it, bulkIMEIText: val } : it));
                        }}
                        className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-lg"
                      />

                      {parsedIMEIs.invalid.length > 0 && (
                        <div className="text-[11px] text-rose-600 mt-1 font-mono">
                          Invalid IMEI formats (must be 14-16 digits): {parsedIMEIs.invalid.join(', ')}
                        </div>
                      )}
                      {parsedIMEIs.duplicates.length > 0 && (
                        <div className="text-[11px] text-rose-600 mt-1 font-mono">
                          Duplicate IMEIs within input: {parsedIMEIs.duplicates.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Payout */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment Settlement to Supplier
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Bank Transfer">Bank Transfer (RTGS / BEFTN)</option>
                  <option value="Cash">Cash Payout</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Debit Bank Account
                  </label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance / Immediate Paid (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Chalan / PO Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAIR-CH-2026-90"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Total Purchase Value: </span>
                <span className="text-sm font-extrabold text-slate-900">{formatBDT(grandTotal)}</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-500">Paid Amount: </span>
                  <span className="font-bold text-emerald-700">{formatBDT(paidAmount)}</span>
                </div>
                <div className="pl-4 border-l border-slate-300">
                  <span className="text-slate-500">Supplier Payable Due: </span>
                  <span className="text-sm font-black text-rose-700">{formatBDT(dueAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. BTRC certified official lot, warranty slip registered."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <div className="text-xs text-slate-500 font-medium">
              * Inwarding stock automatically posts Dr. Merchandise Inventory, Cr. Supplier Payable.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/80 rounded-xl transition cursor-pointer"
              >
                Cancel <kbd className="ml-1 text-[10px] font-mono opacity-60">Esc</kbd>
              </button>
              <button
                type="submit"
                data-action="save"
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Receive Goods & Save Purchase</span>
                <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">Ctrl+Enter</kbd>
              </button>
            </div>
          </div>
        </form>
      </div>

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
    </div>
  );
};
