import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  ShoppingBag,
  Plus,
  Trash2,
  AlertTriangle,
  CreditCard,
  Building,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Barcode,
  Camera,
  QrCode,
  MessageCircle,
  History,
  Sparkles
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { PaymentMethodType, SaleItem, PaymentSplit, IMEIRecord } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { useFormKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';
import { UnsavedChangesDialog } from '../common/UnsavedChangesDialog';
import { WindowsModalFrame } from '../common/WindowsModalFrame';
import { playScanSuccessSound, playWarningBuzzer, playCashRegisterSound } from '../../utils/audioAlertUtils';
import { shareInvoiceViaWhatsApp } from '../../utils/whatsappUtils';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'Wholesale' | 'Retail POS';
  onSuccessInvoice?: (invoiceNo: string) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'Wholesale',
  onSuccessInvoice
}) => {
  const { showSuccess } = useToast();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastInvoiceNo, setLastInvoiceNo] = useState<string | null>(null);
  const {
    customers,
    products,
    warehouses,
    salesmen,
    bankAccounts,
    imeis,
    createSale,
    settings
  } = useERP();

  const [invoiceType, setInvoiceType] = useState<'Wholesale' | 'Retail POS'>(defaultType);
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [salesmanId, setSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    selectedImeis: string[];
  }>>([
    {
      productId: products[0]?.id || '',
      variantId: products[0]?.variants[0]?.id || '',
      quantity: 1,
      unitPrice: products[0]?.variants[0]?.wholesalePrice || 0,
      discount: 0,
      selectedImeis: []
    }
  ]);

  // Payment splits
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [duplicateAlertImei, setDuplicateAlertImei] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState<any | null>(null);

  // Check draft on modal open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem('telecorp_sale_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setDraftAvailable(parsed);
          }
        }
      } catch {}
    } else {
      setDraftAvailable(null);
      setDuplicateAlertImei(null);
    }
  }, [isOpen]);

  // Form dirty state check
  const isFormDirty = items.some(it => it.selectedImeis.length > 0 || it.quantity > 1) || paidAmount > 0 || notes.trim().length > 0;

  // Debounced Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      if (isFormDirty) {
        try {
          const draft = {
            invoiceType,
            customerId,
            warehouseId,
            salesmanId,
            invoiceDate,
            notes,
            items,
            paymentMethod,
            bankAccountId,
            paidAmount,
            savedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
          };
          localStorage.setItem('telecorp_sale_draft', JSON.stringify(draft));
        } catch {}
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [isOpen, isFormDirty, invoiceType, customerId, warehouseId, salesmanId, invoiceDate, notes, items, paymentMethod, bankAccountId, paidAmount]);

  const handleRestoreDraft = () => {
    if (!draftAvailable) return;
    if (draftAvailable.invoiceType) setInvoiceType(draftAvailable.invoiceType);
    if (draftAvailable.customerId) setCustomerId(draftAvailable.customerId);
    if (draftAvailable.warehouseId) setWarehouseId(draftAvailable.warehouseId);
    if (draftAvailable.salesmanId) setSalesmanId(draftAvailable.salesmanId);
    if (draftAvailable.invoiceDate) setInvoiceDate(draftAvailable.invoiceDate);
    if (draftAvailable.notes) setNotes(draftAvailable.notes);
    if (draftAvailable.items) setItems(draftAvailable.items);
    if (draftAvailable.paymentMethod) setPaymentMethod(draftAvailable.paymentMethod);
    if (draftAvailable.bankAccountId) setBankAccountId(draftAvailable.bankAccountId);
    if (draftAvailable.paidAmount) setPaidAmount(draftAvailable.paidAmount);
    setDraftAvailable(null);
    playScanSuccessSound();
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('telecorp_sale_draft');
    } catch {}
    setDraftAvailable(null);
  };

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
  const [targetItemIndexForScan, setTargetItemIndexForScan] = useState<number | null>(null);

  const handleOpenGlobalMultiScan = () => {
    setTargetItemIndexForScan(null);
    setShowMultiScanner(true);
  };

  const handleOpenLineMultiScan = (idx: number) => {
    setTargetItemIndexForScan(idx);
    setShowMultiScanner(true);
  };

  const handleMultiScanConfirm = (validRecords: IMEIRecord[]) => {
    if (validRecords.length === 0) return;

    if (targetItemIndexForScan !== null) {
      // Line-specific multi-scan
      const lineIdx = targetItemIndexForScan;
      const targetItem = items[lineIdx];
      // Only keep records that match this item line if applicable
      const matched = validRecords.filter(
        r => r.productId === targetItem.productId && r.variantId === targetItem.variantId
      );
      const chosenRecords = matched.length > 0 ? matched : validRecords;
      const imeisToAdd = chosenRecords.map(r => r.imei1);

      // Check if any IMEI is already selected in another line
      const otherLinesImeis = items.filter((_, i) => i !== lineIdx).flatMap(it => it.selectedImeis);
      const duplicateFound = imeisToAdd.find(im => otherLinesImeis.includes(im));
      if (duplicateFound) {
        playWarningBuzzer();
        setDuplicateAlertImei(duplicateFound);
      } else {
        playScanSuccessSound();
      }

      setItems(prev =>
        prev.map((it, i) => {
          if (i === lineIdx) {
            const combined = Array.from(new Set([...it.selectedImeis, ...imeisToAdd]));
            return {
              ...it,
              selectedImeis: combined,
              quantity: Math.max(it.quantity, combined.length)
            };
          }
          return it;
        })
      );
    } else {
      // Global multi-scan across all items: group by productId and variantId
      const groups = new Map<string, { productId: string; variantId: string; imeis: string[] }>();
      validRecords.forEach(rec => {
        const key = `${rec.productId}__${rec.variantId}`;
        if (!groups.has(key)) {
          groups.set(key, { productId: rec.productId, variantId: rec.variantId, imeis: [] });
        }
        groups.get(key)!.imeis.push(rec.imei1);
      });

      const newLines: typeof items = [];
      groups.forEach(group => {
        const prod = products.find(p => p.id === group.productId);
        const variant = prod?.variants.find(v => v.id === group.variantId);
        if (prod && variant) {
          newLines.push({
            productId: group.productId,
            variantId: group.variantId,
            quantity: group.imeis.length,
            unitPrice: invoiceType === 'Wholesale' ? variant.wholesalePrice : variant.retailPrice,
            discount: 0,
            selectedImeis: group.imeis
          });
        }
      });

      if (newLines.length > 0) {
        if (items.length === 1 && items[0].selectedImeis.length === 0) {
          setItems(newLines);
        } else {
          setItems(prev => [...prev, ...newLines]);
        }
      }
    }
  };

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === customerId);
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
  const selectedSalesman = salesmen.find(s => s.id === salesmanId);

  // Auto calculate due date
  const dueDays = selectedCustomer?.allowedDueDays || 15;
  const dueDateObj = new Date(invoiceDate);
  dueDateObj.setDate(dueDateObj.getDate() + dueDays);
  const calculatedDueDate = dueDateObj.toISOString().split('T')[0];

  // Totals
  const subTotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const discountTotal = items.reduce((acc, it) => acc + (it.discount * it.quantity), 0);
  const grandTotal = Math.max(0, subTotal - discountTotal);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Credit limit calculation
  const currentCustomerDue = selectedCustomer?.currentDue || 0;
  const customerLimit = selectedCustomer?.creditLimit || 0;
  const projectedDue = currentCustomerDue + dueAmount;
  const isCreditExceeded = customerLimit > 0 && projectedDue > customerLimit;
  const creditUsagePercent = customerLimit > 0 ? Math.round((projectedDue / customerLimit) * 100) : 0;

  // Add Item Line
  const handleAddItem = () => {
    if (products.length > 0) {
      const prod = products[0];
      const variant = prod.variants[0];
      setItems(prev => [
        ...prev,
        {
          productId: prod.id,
          variantId: variant.id,
          quantity: 1,
          unitPrice: invoiceType === 'Wholesale' ? variant.wholesalePrice : variant.retailPrice,
          discount: 0,
          selectedImeis: []
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
      prev.map((it, idx) => {
        if (idx === index) {
          return {
            ...it,
            productId: newProdId,
            variantId: variant.id,
            unitPrice: invoiceType === 'Wholesale' ? variant.wholesalePrice : variant.retailPrice,
            selectedImeis: []
          };
        }
        return it;
      })
    );
  };

  const handleVariantChange = (index: number, newVariantId: string) => {
    const it = items[index];
    const prod = products.find(p => p.id === it.productId);
    const variant = prod?.variants.find(v => v.id === newVariantId);
    if (!variant) return;

    setItems(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            variantId: newVariantId,
            unitPrice: invoiceType === 'Wholesale' ? variant.wholesalePrice : variant.retailPrice,
            selectedImeis: []
          };
        }
        return item;
      })
    );
  };

  // Available IMEIs for this item line in the chosen warehouse
  const getAvailableIMEIsForItem = (productId: string, variantId: string, currentSelected: string[]) => {
    return imeis.filter(i =>
      i.productId === productId &&
      i.variantId === variantId &&
      i.warehouseId === warehouseId &&
      (i.status === 'In Stock' || currentSelected.includes(i.imei1))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomer) {
      setErrorMsg('Please select a customer.');
      return;
    }

    // Validate that all items have required quantity of IMEIs selected
    const saleItemsPayload: SaleItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const prod = products.find(p => p.id === it.productId);
      const variant = prod?.variants.find(v => v.id === it.variantId);
      if (!prod || !variant) continue;

      if (it.selectedImeis.length !== it.quantity) {
        setErrorMsg(`Item #${i + 1} (${prod.model}): Please select exactly ${it.quantity} IMEI(s). Currently selected: ${it.selectedImeis.length}.`);
        return;
      }

      saleItemsPayload.push({
        id: `sale-item-${Date.now()}-${i}`,
        productId: it.productId,
        productName: prod.model,
        variantId: it.variantId,
        variantDesc: `${variant.ram}/${variant.storage} - ${variant.color}`,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        unitCost: variant.purchasePrice,
        discount: it.discount,
        vatAmount: 0,
        totalAmount: (it.unitPrice - it.discount) * it.quantity,
        imeiList: it.selectedImeis
      });
    }

    const paymentsPayload: PaymentSplit[] = paidAmount > 0 ? [
      {
        method: paymentMethod,
        amount: paidAmount,
        bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
        transactionRef: transactionRef || undefined
      }
    ] : [];

    const result = createSale({
      invoiceType,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.shopName,
      customerPhone: selectedCustomer.mobile,
      salesmanId: salesmanId || undefined,
      salesmanName: selectedSalesman?.name,
      warehouseId: selectedWarehouse?.id || '',
      warehouseName: selectedWarehouse?.name || '',
      invoiceDate,
      dueDate: calculatedDueDate,
      items: saleItemsPayload,
      subTotal,
      discountTotal,
      vatTotal: 0,
      grandTotal,
      paidAmount,
      dueAmount,
      payments: paymentsPayload,
      status: dueAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid',
      notes
    });

    if (result.success && result.invoiceNo) {
      try {
        localStorage.removeItem('telecorp_sale_draft');
      } catch {}
      playCashRegisterSound();
      recordFieldHistory('notes', notes);
      recordFieldHistory('referenceNo', transactionRef);
      const invNo = result.invoiceNo;
      setLastInvoiceNo(invNo);
      setSuccessMsg(`ইনভয়েস "${invNo}" সফলভাবে তৈরি ও সংরক্ষিত হয়েছে! উইন্ডো খোলা রয়েছে পরবর্তী বিক্রয়ের জন্য।`);
      showSuccess(
        'বিক্রয় ইনভয়েস সফলভাবে সংরক্ষিত হয়েছে!',
        `ইনভয়েস নং: ${invNo} সিস্টেমে জমা হয়েছে। উইন্ডো খোলা রয়েছে পরবর্তী বিক্রয়ের জন্য।`
      );

      // Reset items and payments for next sale - do NOT close modal
      setItems([
        {
          productId: products[0]?.id || '',
          variantId: products[0]?.variants[0]?.id || '',
          quantity: 1,
          unitPrice: products[0]?.variants[0]?.wholesalePrice || 0,
          discount: 0,
          selectedImeis: []
        }
      ]);
      setPaidAmount(0);
      setNotes('');
      setTransactionRef('');
    } else {
      setErrorMsg(result.error || 'Failed to generate sale invoice');
    }
  };

  return (
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={handleRequestClose}
        onSkip={handleRequestClose}
        modalId="modal-new-sale"
        title={invoiceType === 'Wholesale' ? 'পাইকারি বিক্রয় ইনভয়েস (Wholesale Invoice)' : 'কাউন্টার রিটেইল পিওএস (Retail POS Sale)'}
        subtitle="Direct stock decrement, real-time IMEI status update to 'Sold' & ledger synchronization"
        icon={<ShoppingBag className="w-4 h-4 text-emerald-400" />}
        maxWidth="max-w-5xl"
      >
        {/* Draft Restore Notification Banner */}
        {draftAvailable && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                পূর্বের অসম্পূর্ণ ড্রাফট চালান পাওয়া গেছে ({draftAvailable.items?.length || 0}টি আইটেম, সংরক্ষিত: {draftAvailable.savedAt || 'পূর্বে'})
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ড্রাফট রিস্টোর করুন</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        )}

        {/* Duplicate IMEI Alert Banner */}
        {duplicateAlertImei && (
          <div className="p-3 bg-rose-600 text-white font-bold text-xs flex items-center justify-between border-b border-rose-700 animate-in slide-in-from-top-2 duration-150 transform-gpu select-none">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>
                ⚠️ ডুপ্লিকেট আইএমইআই সতর্কতা! [{duplicateAlertImei}] ইতোমধ্যে বর্তমান চালানের তালিকায় যুক্ত আছে!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDuplicateAlertImei(null)}
              className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-800 text-[11px] cursor-pointer"
            >
              ✕ ঠিক আছে
            </button>
          </div>
        )}

        <div className="bg-slate-100 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex bg-slate-200/90 dark:bg-slate-700/80 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setInvoiceType('Wholesale')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${invoiceType === 'Wholesale' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs font-black' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Wholesale (পাইকারি)
            </button>
            <button
              type="button"
              onClick={() => setInvoiceType('Retail POS')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${invoiceType === 'Retail POS' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs font-black' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Retail POS (খুচরা)
            </button>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            সরাসরি বারকোড/আইএমইআই স্ক্যানার সমর্থিত
          </span>
        </div>

        <form ref={containerRef as any} onKeyDown={onKeyDown} onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold">{successMsg}</span>
              </div>
              <div className="flex items-center gap-2">
                {lastInvoiceNo && onSuccessInvoice && (
                  <button
                    type="button"
                    onClick={() => onSuccessInvoice(lastInvoiceNo)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🖨️ ইনভয়েস প্রিন্ট</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 underline cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top Row: Customer, Warehouse, Salesman, Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {invoiceType === 'Wholesale' ? 'Dealer / Customer Shop *' : 'Customer Account *'}
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.shopName} ({c.ownerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Warehouse / Outlet *
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Sales Officer
              </label>
              <select
                value={salesmanId}
                onChange={(e) => setSalesmanId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
              >
                <option value="">Direct House Sale (No Commission)</option>
                {salesmen.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.assignedArea.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
                required
              />
            </div>
          </div>

          {/* Customer Credit Status Widget */}
          {selectedCustomer && selectedCustomer.customerType !== 'Walk-in' && (
            <div className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
              isCreditExceeded
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <CreditCard className={`w-4 h-4 ${isCreditExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`} />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedCustomer.shopName}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">({selectedCustomer.area}, {selectedCustomer.district})</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Credit Limit: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatBDT(customerLimit)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Current Due: </span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{formatBDT(currentCustomerDue)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">After This Sale: </span>
                  <span className={`font-bold ${isCreditExceeded ? 'text-rose-700 dark:text-rose-400 underline font-extrabold' : 'text-slate-900 dark:text-white'}`}>
                    {formatBDT(projectedDue)} ({creditUsagePercent}%)
                  </span>
                </div>
                {isCreditExceeded && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    Limit Exceeded
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Invoice Items & IMEI Assignment</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenGlobalMultiScan}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
                  title="হাতে থাকা সবগুলো হ্যান্ডসেট Gun/Camera স্ক্যানারের মাধ্যমে একসাথে ইনভয়েসে যুক্ত করুন"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>⚡ Bulk Multi-Scan</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                const availableImeis = getAvailableIMEIsForItem(item.productId, item.variantId, item.selectedImeis);

                return (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-850 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* Product Model */}
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Product Model
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                          ))}
                        </select>
                      </div>

                      {/* Variant */}
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Variant / Color
                        </label>
                        <select
                          value={item.variantId}
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                        >
                          {prod?.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.ram}/{v.storage} - {v.color} (Stock: {v.currentStock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-1">
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Unit Price (BDT)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                          }}
                          className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      {/* Total */}
                      <div className="md:col-span-1 text-right">
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Line Total
                        </label>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 py-1.5">
                          {formatBDT((item.unitPrice - item.discount) * item.quantity)}
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* IMEI Picker Box */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Select {item.quantity} IMEI(s) from {selectedWarehouse?.name}:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenLineMultiScan(idx)}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 cursor-pointer"
                            title="Scan IMEIs for this item"
                          >
                            <Barcode className="w-3 h-3" />
                            <span>Scan IMEIs</span>
                          </button>
                          <span className={`font-bold ${item.selectedImeis.length === item.quantity ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {item.selectedImeis.length} / {item.quantity} Assigned
                          </span>
                        </div>
                      </div>

                      {availableImeis.length === 0 ? (
                        <div className="text-rose-600 dark:text-rose-400 text-xs py-1">
                          No 'In Stock' IMEIs available in {selectedWarehouse?.name} for this variant.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {availableImeis.map(im => {
                            const isSelected = item.selectedImeis.includes(im.imei1);
                            return (
                              <button
                                key={im.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setItems(prev => prev.map((it, i) => i === idx ? {
                                      ...it,
                                      selectedImeis: it.selectedImeis.filter(n => n !== im.imei1)
                                    } : it));
                                    setDuplicateAlertImei(null);
                                  } else {
                                    // Check if duplicate across other lines
                                    const isDuplicate = items.some((it, i) => i !== idx && it.selectedImeis.includes(im.imei1));
                                    if (isDuplicate) {
                                      playWarningBuzzer();
                                      setDuplicateAlertImei(im.imei1);
                                      return;
                                    }
                                    setDuplicateAlertImei(null);
                                    playScanSuccessSound();
                                    if (item.selectedImeis.length < item.quantity) {
                                      setItems(prev => prev.map((it, i) => i === idx ? {
                                        ...it,
                                        selectedImeis: [...it.selectedImeis, im.imei1]
                                      } : it));
                                    }
                                  }
                                }}
                                className={`text-[10px] font-mono px-2 py-1 rounded-md border font-medium transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                              >
                                {im.imei1}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Settlement Row */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment & Settlement
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="Bank Transfer">Bank Transfer (EFT/NPSB)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad Merchant</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deposit Bank Account
                  </label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Immediate Paid Amount (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference / Cheque #
                </label>
                <HistoryInput
                  historyKey="referenceNo"
                  type="text"
                  placeholder="e.g. TR-889900 / Cheque"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Sub Total: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatBDT(subTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Discount: </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatBDT(discountTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Net Grand Total: </span>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-400">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Paid Today</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatBDT(paidAmount)}</div>
                </div>
                <div className="text-right pl-4 border-l border-slate-300 dark:border-slate-700">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Outstanding Due</div>
                  <div className="text-sm font-extrabold text-amber-700 dark:text-amber-400">{formatBDT(dueAmount)}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes / Terms
            </label>
            <HistoryInput
              historyKey="notes"
              type="text"
              placeholder="e.g. 50% paid on delivery, balance due within 30 days."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              * Sales immediately trigger Double-Entry Accounting (Dr. AR/Cash, Cr. Revenue; Dr. COGS, Cr. Inventory).
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel <kbd className="ml-1 text-[10px] font-mono opacity-60">Esc</kbd>
              </button>
              <button
                type="submit"
                data-action="save"
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm & Issue Invoice</span>
                <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">Ctrl+Enter</kbd>
              </button>
            </div>
          </div>
        </form>
      </WindowsModalFrame>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="pos-sale"
        targetWarehouseId={warehouseId}
        onConfirm={handleMultiScanConfirm}
        confirmButtonText="হ্যান্ডসেটগুলো ইনভয়েসে যুক্ত করুন"
      />

      <UnsavedChangesDialog
        isOpen={showUnsavedPrompt}
        onCancel={() => setShowUnsavedPrompt(false)}
        onConfirmDiscard={() => {
          setShowUnsavedPrompt(false);
          onClose();
        }}
        title="সেল ইনভয়েস বাতিল করবেন? (Discard Sale Invoice?)"
        message="আপনি ইতিমধ্যে আইটেম বা আইএমইআই সিলেক্ট করেছেন। এখন বন্ধ করলে সম্পূর্ণ ইনভয়েস ড্রাফট মুছে যাবে।"
      />
    </>
  );
};
