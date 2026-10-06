import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Barcode,
  Printer,
  Filter,
  CheckSquare,
  Square,
  Smartphone,
  Tag,
  ShieldCheck,
  Layers,
  Settings,
  SlidersHorizontal,
  Usb,
  Bluetooth,
  Zap,
  CheckCircle2,
  AlertCircle,
  Radio,
  RefreshCw,
  Power,
  Cpu
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import {
  checkHardwareSupport,
  connectSerialPrinter,
  connectBluetoothPrinter,
  disconnectPrinter,
  sendRawBytesToPrinter,
  generateTSPLLabelCommands,
  generateESCPOSLabelCommands,
  generateTestSticker,
  PrinterProtocol,
  LabelPrintItem
} from '../../services/thermalPrinterService';

export const BarcodeLabelView: React.FC = () => {
  const { products, imeis, brands, settings } = useERP();
  const isBn = settings.language === 'bn';

  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || '');
  const [labelSize, setLabelSize] = useState<'50x30' | '40x25' | 'A4'>('50x30');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);

  // Hardware Printer Integration State
  const [hardwareSupport, setHardwareSupport] = useState<{ serial: boolean; bluetooth: boolean; recommendedBrowser: string | null }>({
    serial: true,
    bluetooth: true,
    recommendedBrowser: null
  });
  const [connectedDevice, setConnectedDevice] = useState<{
    connected: boolean;
    type: 'serial' | 'bluetooth' | null;
    name: string;
  }>({
    connected: false,
    type: null,
    name: ''
  });
  const [printerProtocol, setPrinterProtocol] = useState<PrinterProtocol>('TSPL');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Check hardware API support on mount
  useEffect(() => {
    const support = checkHardwareSupport();
    setHardwareSupport(support);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const filteredProducts = selectedBrand === 'All'
    ? products
    : products.filter(p => p.brandName === selectedBrand);

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariantId) || currentProduct?.variants[0];

  // In-stock IMEIs for current product/variant
  const availableImeis = imeis.filter(i =>
    i.productId === currentProduct?.id &&
    (!selectedVariantId || i.variantId === selectedVariantId) &&
    i.status === 'In Stock'
  );

  const handleSelectAll = () => {
    if (selectedImeis.length === availableImeis.length) {
      setSelectedImeis([]);
    } else {
      setSelectedImeis(availableImeis.map(i => i.imei1));
    }
  };

  const toggleImeiSelect = (imeiNum: string) => {
    setSelectedImeis(prev =>
      prev.includes(imeiNum)
        ? prev.filter(i => i !== imeiNum)
        : [...prev, imeiNum]
    );
  };

  // Connect USB via Web Serial
  const handleConnectUSB = async () => {
    setIsConnecting(true);
    try {
      const res = await connectSerialPrinter(9600);
      if (res.success) {
        setConnectedDevice({
          connected: true,
          type: 'serial',
          name: res.name
        });
        showToast('success', isBn ? `ইউএসবি থার্মাল প্রিন্টার সংযুক্ত হয়েছে (${res.name})` : `USB Thermal Printer connected (${res.name})`);
      } else if (res.error) {
        showToast('error', res.error);
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error connecting to USB printer');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect Bluetooth via Web Bluetooth
  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    try {
      const res = await connectBluetoothPrinter();
      if (res.success) {
        setConnectedDevice({
          connected: true,
          type: 'bluetooth',
          name: res.name
        });
        showToast('success', isBn ? `ব্লুটুথ থার্মাল প্রিন্টার সংযুক্ত হয়েছে (${res.name})` : `Bluetooth Thermal Printer connected (${res.name})`);
      } else if (res.error) {
        showToast('error', res.error);
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error connecting to Bluetooth printer');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect printer
  const handleDisconnect = async () => {
    await disconnectPrinter();
    setConnectedDevice({
      connected: false,
      type: null,
      name: ''
    });
    showToast('info', isBn ? 'প্রিন্টার সংযোগ বিচ্ছিন্ন করা হয়েছে।' : 'Hardware printer disconnected.');
  };

  // Direct Hardware Print Dispatch
  const handleDirectHardwarePrint = async () => {
    if (selectedImeis.length === 0) {
      showToast('error', isBn ? 'প্রথমে কমপক্ষে একটি আইএমইআই নির্বাচন করুন।' : 'Please select at least one IMEI first.');
      return;
    }

    if (!connectedDevice.connected) {
      showToast('error', isBn ? 'কোনো হার্ডওয়্যার প্রিন্টার সংযুক্ত নেই! অনুগ্রহ করে USB অথবা Bluetooth দিয়ে প্রিন্টার কানেক্ট করুন।' : 'No hardware printer connected! Please connect via USB or Bluetooth.');
      return;
    }

    setIsPrinting(true);
    try {
      // Build items payload
      const printItems: LabelPrintItem[] = selectedImeis.map(imeiNum => {
        const imeiRec = imeis.find(i => i.imei1 === imeiNum);
        return {
          brandName: currentProduct?.brandName || 'Brand',
          model: currentProduct?.model || 'Phone Model',
          variantDesc: `${currentVariant?.ram || '8GB'}/${currentVariant?.storage || '128GB'} - ${currentVariant?.color || 'Black'}`,
          imei1: imeiNum,
          imei2: imeiRec?.imei2,
          retailPrice: currentVariant?.retailPrice || 0,
          warrantyPeriodMonths: currentProduct?.warrantyPeriodMonths || 12,
          tacCode: (currentProduct as any)?.tacCode || 'TAC'
        };
      });

      // Encode command stream based on selected protocol
      let rawBytes: Uint8Array;
      if (printerProtocol === 'TSPL') {
        const [w, h] = labelSize === '40x25' ? [40, 25] : [50, 30];
        rawBytes = generateTSPLLabelCommands(printItems, w, h);
      } else {
        rawBytes = generateESCPOSLabelCommands(printItems);
      }

      const res = await sendRawBytesToPrinter(rawBytes);
      if (res.success) {
        showToast('success', isBn 
          ? `সফলভাবে ${selectedImeis.length}টি লেবেল সরাসরি থার্মাল প্রিন্টারে পাঠানো হয়েছে!` 
          : `Successfully transmitted ${selectedImeis.length} labels directly to thermal printer!`
        );
      } else {
        showToast('error', res.error || 'Failed to dispatch raw bytes to thermal printer');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Print error');
    } finally {
      setIsPrinting(false);
    }
  };

  // Direct Test Sticker Print
  const handleTestPrint = async () => {
    if (!connectedDevice.connected) {
      showToast('error', isBn ? 'টেস্ট প্রিন্ট করতে প্রথমে প্রিন্টার কানেক্ট করুন।' : 'Connect printer first to send test print.');
      return;
    }

    setIsPrinting(true);
    try {
      const testBytes = generateTestSticker(printerProtocol);
      const res = await sendRawBytesToPrinter(testBytes);
      if (res.success) {
        showToast('success', isBn ? 'টেস্ট ক্যালিব্রেশন স্টিকার সফলভাবে প্রিন্টারে পাঠানো হয়েছে!' : 'Test calibration label sent to printer successfully!');
      } else {
        showToast('error', res.error || 'Failed to send test label');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Test print error');
    } finally {
      setIsPrinting(false);
    }
  };

  // Fallback Browser Print Dialog
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-md border ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          toastMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-300' :
          'bg-blue-50 text-blue-900 border-blue-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toastMessage.type === 'info' && <Radio className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner - hidden during print */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Barcode & QR Box Label Printing Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            মোবাইল ফোনের বক্স স্টিকার ও আইএমইআই বারকোড লেবেল সরাসরি থার্মাল প্রিন্টারে (Web-Serial USB & Web-Bluetooth) অথবা ব্রাউজার প্রিন্টে প্রস্তুত করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Hardware Thermal Print Button */}
          <button
            onClick={handleDirectHardwarePrint}
            disabled={selectedImeis.length === 0 || isPrinting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition ${
              connectedDevice.connected && selectedImeis.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white opacity-90'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>
              {isPrinting ? 'Transmitting...' : `Direct Thermal Print (${selectedImeis.length})`}
            </span>
          </button>

          {/* Standard Browser Print Fallback */}
          <button
            onClick={handleBrowserPrint}
            disabled={selectedImeis.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition border ${
              selectedImeis.length > 0
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Browser Print ({selectedImeis.length})</span>
          </button>
        </div>
      </div>

      {/* HARDWARE DIRECT THERMAL PRINTER CONTROL COCKPIT */}
      <div className="print:hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-2xl text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${connectedDevice.connected ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-slate-700 text-slate-300'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Direct Hardware Thermal Printing Engine</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  connectedDevice.connected ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {connectedDevice.connected ? `Connected (${connectedDevice.type?.toUpperCase()})` : 'Disconnected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {connectedDevice.connected
                  ? `Active Device: ${connectedDevice.name} | Protocol: ${printerProtocol}`
                  : 'Web-Serial (USB) অথবা Web-Bluetooth (BLE) দিয়ে সরাসরি থার্মাল লেবেল প্রিন্টারে বাইনারি কমান্ড পাঠান (No browser dialog required)'}
              </p>
            </div>
          </div>

          {/* Hardware Connection Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {!connectedDevice.connected ? (
              <>
                <button
                  onClick={handleConnectUSB}
                  disabled={isConnecting || !hardwareSupport.serial}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shadow-xs ${
                    hardwareSupport.serial
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                  title={hardwareSupport.serial ? 'Connect via USB Serial' : 'Web Serial not supported in this browser'}
                >
                  <Usb className="w-4 h-4" />
                  <span>Connect USB (Serial)</span>
                </button>

                <button
                  onClick={handleConnectBluetooth}
                  disabled={isConnecting || !hardwareSupport.bluetooth}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shadow-xs ${
                    hardwareSupport.bluetooth
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                  title={hardwareSupport.bluetooth ? 'Connect via Bluetooth BLE' : 'Web Bluetooth not supported'}
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Connect Bluetooth (BLE)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTestPrint}
                  disabled={isPrinting}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-xs"
                >
                  <Zap className="w-4 h-4" />
                  <span>Test Sticker</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl font-bold transition shadow-xs"
                >
                  <Power className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Protocol & Hardware Settings Selector */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-300">Printer Command Protocol:</span>
            <div className="flex items-center gap-2">
              <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition ${
                printerProtocol === 'TSPL' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <input
                  type="radio"
                  name="protocol"
                  checked={printerProtocol === 'TSPL'}
                  onChange={() => setPrinterProtocol('TSPL')}
                  className="hidden"
                />
                <span>TSPL (Xprinter/TSC/Zebra Labels)</span>
              </label>

              <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition ${
                printerProtocol === 'ESC_POS' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <input
                  type="radio"
                  name="protocol"
                  checked={printerProtocol === 'ESC_POS'}
                  onChange={() => setPrinterProtocol('ESC_POS')}
                  className="hidden"
                />
                <span>ESC/POS (POS-58 / POS-80)</span>
              </label>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            {hardwareSupport.recommendedBrowser && (
              <span className="text-amber-400">⚠️ {hardwareSupport.recommendedBrowser} ব্রাউজার ব্যবহার করুন</span>
            )}
            {!hardwareSupport.recommendedBrowser && (
              <span>✓ Web-Serial & Web-Bluetooth APIs Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel - hidden during print */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Filter</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                const firstP = e.target.value === 'All' ? products[0] : products.find(p => p.brandName === e.target.value);
                if (firstP) {
                  setSelectedProductId(firstP.id);
                  setSelectedVariantId(firstP.variants[0]?.id || '');
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Model *</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if (prod && prod.variants.length > 0) {
                  setSelectedVariantId(prod.variants[0].id);
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brandName} - {p.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Variant (RAM/ROM/Color)</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {currentProduct?.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.ram}/{v.storage} - {v.color} ({formatBDT(v.retailPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Label Layout & Size</label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="50x30">Thermal 50mm x 30mm (Standard Phone Box)</option>
              <option value="40x25">Thermal 40mm x 25mm (Compact Retail)</option>
              <option value="A4">A4 Sheet (24 Labels per page)</option>
            </select>
          </div>
        </div>

        {/* In-Stock IMEI Selection Area */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Available In-Stock IMEIs ({availableImeis.length} available)</span>
            </div>

            {availableImeis.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                {selectedImeis.length === availableImeis.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Select All ({availableImeis.length})
                  </>
                )}
              </button>
            )}
          </div>

          {availableImeis.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
              No in-stock units found for this model/variant. Try selecting another model or variant.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {availableImeis.map(i => {
                const isSelected = selectedImeis.includes(i.imei1);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleImeiSelect(i.imei1)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-mono text-[11px] leading-tight">{i.imei1}</div>
                      <div className="text-[10px] text-slate-400 truncate">{i.variantDesc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Label Print Preview Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="print:hidden flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Print Preview ({selectedImeis.length} stickers selected)</span>
          </div>

          <div className="text-xs text-slate-400">
            Formatted for Direct Thermal / Barcode Printers ({labelSize === 'A4' ? 'A4 Sheet' : `${labelSize} mm`})
          </div>
        </div>

        {selectedImeis.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Please select at least one IMEI above to generate barcode labels.
          </div>
        ) : (
          <div className={`grid gap-4 ${
            labelSize === 'A4'
              ? 'grid-cols-2 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          }`}>
            {selectedImeis.map((imeiNum, idx) => {
              const imeiRecord = imeis.find(i => i.imei1 === imeiNum);
              return (
                <div
                  key={idx}
                  className="bg-white p-3 border border-slate-300 rounded-lg shadow-2xs font-mono text-[10px] space-y-1.5 break-inside-avoid print:border-black print:shadow-none"
                  style={{ minWidth: '220px' }}
                >
                  {/* Brand & Model Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-1">
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        {currentProduct?.brandName} {currentProduct?.model}
                      </div>
                      <div className="text-[9px] text-slate-600">
                        {currentVariant?.ram}/{currentVariant?.storage} • {currentVariant?.color}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm">
                      BTRC TAC
                    </span>
                  </div>

                  {/* IMEI 1 Barcode Simulation */}
                  <div className="text-center pt-0.5">
                    <div className="text-[8px] font-bold text-slate-500 text-left">IMEI 1:</div>
                    {/* Barcode Lines Graphic */}
                    <div className="flex justify-center items-center gap-[1.5px] py-1 h-7 bg-white">
                      {imeiNum.split('').map((char, cIdx) => {
                        const num = parseInt(char) || 1;
                        return (
                          <div
                            key={cIdx}
                            className="bg-black"
                            style={{
                              width: num % 2 === 0 ? '2px' : '1px',
                              height: num % 3 === 0 ? '100%' : '85%'
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="font-bold text-[10px] tracking-wider text-slate-800">
                      {imeiNum}
                    </div>
                  </div>

                  {/* IMEI 2 / Serial */}
                  {imeiRecord?.imei2 && (
                    <div className="text-[9px] text-slate-600 flex justify-between border-t border-slate-100 pt-0.5">
                      <span>IMEI 2:</span>
                      <span className="font-semibold">{imeiRecord.imei2}</span>
                    </div>
                  )}

                  {/* Price & Warranty Footer */}
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1 text-[9px] font-sans">
                    <div>
                      <span className="text-slate-400">MRP: </span>
                      <strong className="text-slate-900">{formatBDT(currentVariant?.retailPrice)}</strong>
                    </div>
                    <div className="text-slate-500 text-[8px]">
                      {currentProduct?.warrantyPeriodMonths || 12} Mo Warranty
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
