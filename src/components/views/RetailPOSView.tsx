import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Store,
  Barcode,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Smartphone,
  Printer,
  Usb,
  Bluetooth,
  Zap,
  Power,
  Camera,
  QrCode
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { PaymentMethodType, IMEIRecord } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import {
  connectSerialPrinter,
  connectBluetoothPrinter,
  disconnectPrinter,
  sendRawBytesToPrinter,
  generateESCPOSReceipt,
  checkHardwareSupport
} from '../../services/thermalPrinterService';
import { useToast } from '../common/ToastNotificationSystem';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';

interface RetailPOSViewProps {
  onPrintInvoice: (invoiceNo: string) => void;
}

export const RetailPOSView: React.FC<RetailPOSViewProps> = ({ onPrintInvoice }) => {
  const { products, imeis, warehouses, customers, createSale } = useERP();
  const { showSuccess } = useToast();

  const retailOutlet = warehouses.find(w => w.type === 'Retail Outlet') || warehouses[0];

  const [scannedIMEI, setScannedIMEI] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('01700-000000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');

  // Direct Hardware Thermal Printer State
  const [connectedPrinter, setConnectedPrinter] = useState<{
    connected: boolean;
    name: string;
    type: 'serial' | 'bluetooth' | null;
  }>({
    connected: false,
    name: '',
    type: null
  });
  const [isConnectingPrinter, setIsConnectingPrinter] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<Array<{
    imeiRecord: typeof imeis[0];
    retailPrice: number;
    discount: number;
  }>>([]);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMultiScanner, setShowMultiScanner] = useState(false);

  // Available in-stock phones at retail outlet
  const outletStock = imeis.filter(i => i.status === 'In Stock');

  const handleMultiScanConfirm = (validRecords: IMEIRecord[]) => {
    if (validRecords.length === 0) return;

    let addedCount = 0;
    let alreadyInCartCount = 0;

    setCartItems(prev => {
      const existingImeis = new Set(prev.map(c => c.imeiRecord.imei1));
      const newItems = [...prev];

      validRecords.forEach(rec => {
        if (existingImeis.has(rec.imei1)) {
          alreadyInCartCount++;
          return;
        }
        existingImeis.add(rec.imei1);
        const prod = products.find(p => p.id === rec.productId);
        const variant = prod?.variants.find(v => v.id === rec.variantId);
        const retailPrice = variant?.retailPrice || 50000;
        newItems.push({ imeiRecord: rec, retailPrice, discount: 0 });
        addedCount++;
      });

      return newItems;
    });

    if (alreadyInCartCount > 0) {
      setMessage({
        type: 'success',
        text: `${addedCount}টি হ্যান্ডসেট কার্টে যুক্ত হয়েছে (${alreadyInCartCount}টি পূর্বে যুক্ত ছিল)।`
      });
    } else {
      setMessage({
        type: 'success',
        text: `${addedCount}টি হ্যান্ডসেট সফলভাবে POS কার্টে যুক্ত হয়েছে!`
      });
    }
  };

  const handleScanIMEI = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scannedIMEI.trim()) return;

    const found = imeis.find(i => i.imei1 === scannedIMEI.trim());
    if (!found) {
      setMessage({ type: 'error', text: `IMEI ${scannedIMEI} not found in database!` });
      return;
    }
    if (found.status !== 'In Stock') {
      setMessage({ type: 'error', text: `IMEI ${scannedIMEI} is '${found.status}', not In Stock.` });
      return;
    }
    if (cartItems.some(c => c.imeiRecord.imei1 === found.imei1)) {
      setMessage({ type: 'error', text: `IMEI ${scannedIMEI} already in cart!` });
      return;
    }

    const prod = products.find(p => p.id === found.productId);
    const variant = prod?.variants.find(v => v.id === found.variantId);
    const retailPrice = variant?.retailPrice || 50000;

    setCartItems(prev => [...prev, { imeiRecord: found, retailPrice, discount: 0 }]);
    setScannedIMEI('');
    setMessage({ type: 'success', text: `Added ${found.productName} (${found.imei1}) to cart!` });
  };

  const totalBill = cartItems.reduce((acc, c) => acc + (c.retailPrice - c.discount), 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty!' });
      return;
    }

    const saleItems = cartItems.map((c, idx) => ({
      id: `pos-item-${Date.now()}-${idx}`,
      productId: c.imeiRecord.productId,
      productName: c.imeiRecord.productName,
      variantId: c.imeiRecord.variantId,
      variantDesc: c.imeiRecord.variantDesc,
      quantity: 1,
      unitPrice: c.retailPrice,
      unitCost: c.imeiRecord.purchaseCost,
      discount: c.discount,
      vatAmount: 0,
      totalAmount: c.retailPrice - c.discount,
      imeiList: [c.imeiRecord.imei1]
    }));

    const walkInCust = customers.find(c => c.customerType === 'Walk-in' || c.shopName.toLowerCase().includes('walk-in') || c.id === 'cust-walkin');
    const assignedCustomerId = walkInCust ? walkInCust.id : 'cust-walkin';

    const result = createSale({
      invoiceType: 'Retail POS',
      customerId: assignedCustomerId,
      customerName: customerName.trim() || 'Walk-in Retail Customer',
      customerPhone: customerPhone.trim() || '01700-000000',
      warehouseId: retailOutlet.id,
      warehouseName: retailOutlet.name,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: saleItems,
      subTotal: totalBill,
      discountTotal: 0,
      vatTotal: 0,
      grandTotal: totalBill,
      paidAmount: totalBill,
      dueAmount: 0,
      payments: [
        {
          method: paymentMethod,
          amount: totalBill
        }
      ],
      status: 'Paid',
      notes: `Retail Cashier Sale (${paymentMethod})`
    });

    if (result.success && result.invoiceNo) {
      const invNo = result.invoiceNo;
      if (customerName.trim() && customerName !== 'Walk-in Customer') {
        recordFieldHistory('ownerName', customerName.trim());
      }
      if (customerPhone.trim() && customerPhone !== '01700-000000') {
        recordFieldHistory('mobile', customerPhone.trim());
      }

      showSuccess(`রিটেইল বিক্রয় সম্পন্ন! ইনভয়েস #${invNo} ইস্যু করা হয়েছে।`, {
        title: 'POS বিলিং সফল'
      });
      setCartItems([]);
      setCustomerName('Walk-in Customer');
      setCustomerPhone('01700-000000');

      // If hardware thermal printer is connected, dispatch raw ESC/POS receipt
      if (connectedPrinter.connected) {
        try {
          const receiptBytes = generateESCPOSReceipt({
            invoiceNo: invNo,
            date: new Date().toISOString().split('T')[0],
            customerName,
            customerPhone,
            warehouseName: retailOutlet.name,
            items: saleItems.map(it => ({
              name: it.productName,
              imei: it.imeiList?.[0],
              qty: it.quantity,
              price: it.unitPrice,
              total: it.totalAmount
            })),
            subTotal: totalBill,
            discount: 0,
            grandTotal: totalBill,
            paidAmount: totalBill,
            dueAmount: 0,
            paymentMethod
          });
          sendRawBytesToPrinter(receiptBytes);
          setMessage({
            type: 'success',
            text: `বিক্রয় সফল! থার্মাল প্রিন্টারে সরাসরি ক্যাশ মেমো (#${invNo}) প্রিন্ট হয়েছে।`
          });
        } catch {
          onPrintInvoice(invNo);
        }
      } else {
        setMessage({ type: 'success', text: `Sale successful! Memo #${invNo} issued.` });
        onPrintInvoice(invNo);
      }
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to complete checkout' });
    }
  };

  const handleConnectUSB = async () => {
    setIsConnectingPrinter(true);
    const res = await connectSerialPrinter();
    if (res.success) {
      setConnectedPrinter({ connected: true, name: res.name, type: 'serial' });
      setMessage({ type: 'success', text: `USB থার্মাল প্রিন্টার সংযুক্ত হয়েছে (${res.name})` });
    } else if (res.error) {
      setMessage({ type: 'error', text: res.error });
    }
    setIsConnectingPrinter(false);
  };

  const handleConnectBluetooth = async () => {
    setIsConnectingPrinter(true);
    const res = await connectBluetoothPrinter();
    if (res.success) {
      setConnectedPrinter({ connected: true, name: res.name, type: 'bluetooth' });
      setMessage({ type: 'success', text: `Bluetooth থার্মাল প্রিন্টার সংযুক্ত হয়েছে (${res.name})` });
    } else if (res.error) {
      setMessage({ type: 'error', text: res.error });
    }
    setIsConnectingPrinter(false);
  };

  const handleDisconnectPrinter = async () => {
    await disconnectPrinter();
    setConnectedPrinter({ connected: false, name: '', type: null });
    setMessage({ type: 'success', text: 'থার্মাল প্রিন্টার ডিসকানেক্ট করা হয়েছে।' });
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Retail POS Counter & Quick Scanner Checkout
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Outlet Terminal: <b className="text-slate-800 dark:text-slate-200">{retailOutlet.name}</b> • Direct Barcode/IMEI Scan & Hardware Printing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Hardware Thermal Printer Quick Connect */}
          {!connectedPrinter.connected ? (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-2">Thermal Printer:</span>
              <button
                type="button"
                onClick={handleConnectUSB}
                disabled={isConnectingPrinter}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 font-bold transition shadow-2xs cursor-pointer"
                title="Connect USB Thermal Receipt Printer via Web-Serial"
              >
                <Usb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>USB</span>
              </button>
              <button
                type="button"
                onClick={handleConnectBluetooth}
                disabled={isConnectingPrinter}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 font-bold transition shadow-2xs cursor-pointer"
                title="Connect Bluetooth POS Printer via Web-Bluetooth"
              >
                <Bluetooth className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>BLE</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="font-bold text-[11px]">
                {connectedPrinter.type?.toUpperCase()} Ready ({connectedPrinter.name})
              </span>
              <button
                type="button"
                onClick={handleDisconnectPrinter}
                className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-800 underline font-semibold ml-1 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}

          <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Register Ready</span>
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scanner input & Quick Item Browser */}
        <div className="lg:col-span-7 space-y-4">
          {/* Scanner Input */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Barcode / IMEI Scanner Input (Scan Handset Box)</span>
            </label>
            <form onSubmit={handleScanIMEI} className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Scan or type 15-digit IMEI (e.g. 359841103982001)..."
                value={scannedIMEI}
                onChange={(e) => setScannedIMEI(e.target.value)}
                className="flex-1 min-w-[200px] p-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
              >
                Scan Add
              </button>
              <button
                type="button"
                onClick={() => setShowMultiScanner(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                title="Camera, Barcode Gun, বা বাল্ক পেস্টের মাধ্যমে একসাথে একাধিক ডিভাইস কার্টে যুক্ত করুন"
              >
                <Camera className="w-4 h-4" />
                <span>Multi-Scan</span>
              </button>
            </form>
          </div>

          {/* Quick Tap Available Stock */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Quick Tap In-Stock Handsets ({outletStock.length})</span>
              <span className="text-slate-400 dark:text-slate-500">Click to add to billing memo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {outletStock.slice(0, 10).map(device => {
                const prod = products.find(p => p.id === device.productId);
                const variant = prod?.variants.find(v => v.id === device.variantId);
                const isAlreadyInCart = cartItems.some(c => c.imeiRecord.imei1 === device.imei1);

                return (
                  <div
                    key={device.id}
                    onClick={() => {
                      if (!isAlreadyInCart) {
                        setCartItems(prev => [
                          ...prev,
                          {
                            imeiRecord: device,
                            retailPrice: variant?.retailPrice || 50000,
                            discount: 0
                          }
                        ]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isAlreadyInCart
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/70 opacity-60'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{device.productName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{device.variantDesc}</div>
                      <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mt-1">{device.imei1}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">{formatBDT(variant?.retailPrice)}</div>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">1-Yr BD Warranty</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Checkout Billing Cart & Receipt Summary */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Billing Counter Cart</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} Handset{cartItems.length === 1 ? '' : 's'}
              </span>
            </h3>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                Cart is empty. Scan an IMEI barcode or tap a phone on the left.
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.imeiRecord.productName}</div>
                    <div className="text-[10px] font-mono text-blue-700 dark:text-blue-400">{item.imeiRecord.imei1}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatBDT(item.retailPrice)}</span>
                    <button
                      onClick={() => setCartItems(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Name</label>
              <HistoryInput
                historyKey="ownerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone (SMS Memo)</label>
              <HistoryInput
                historyKey="mobile"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCheckout();
                  }
                }}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="text-xs space-y-1.5 pt-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Payment Tender</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'POS Card', 'bKash'] as PaymentMethodType[]).map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-3 rounded-xl font-bold border text-xs transition cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Payable Amount:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">{formatBDT(totalBill)}</span>
            </div>

            <button
              onClick={handleCheckout}
              data-action="save"
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Complete Sale & Print Cash Memo</span>
              <kbd className="px-1.5 py-0.5 bg-emerald-800/60 rounded text-[10px] font-mono ml-1">Ctrl+Enter</kbd>
            </button>
          </div>
        </div>
      </div>

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode="pos-sale"
        targetWarehouseId={retailOutlet?.id}
        onConfirm={handleMultiScanConfirm}
        confirmButtonText="সবগুলো হ্যান্ডসেট কার্টে যুক্ত করুন"
      />
    </div>
  );
};
