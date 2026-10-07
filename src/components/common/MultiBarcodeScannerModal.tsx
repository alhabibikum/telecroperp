import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Camera,
  Barcode,
  Keyboard,
  ClipboardPaste,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Copy,
  Plus,
  RefreshCw,
  Flashlight,
  Smartphone,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Search,
  Zap,
  Info
} from 'lucide-react';
import {
  extractTokensFromRaw,
  analyzeScannedBatch,
  ScannedTokenAnalysis,
  AnalysisConfig,
  playScanSuccessBeep,
  playScanWarningBeep,
  isScannerSoundEnabled,
  setScannerSoundEnabled
} from '../../utils/barcodeScannerUtils';
import { IMEIRecord, IMEIStatus } from '../../types/erp';

export interface MultiBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  mode?:
    | 'generic'
    | 'lookup'
    | 'pos-sale'
    | 'purchase'
    | 'transfer'
    | 'return-customer'
    | 'return-supplier'
    | 'adjustment'
    | 'filter';
  targetWarehouseId?: string;
  warehouseId?: string;
  supplierId?: string;
  customerId?: string;
  initialTokens?: string[];
  onConfirm?: (validRecords: IMEIRecord[], allCleanTokens: string[], analysisList: ScannedTokenAnalysis[]) => void;
  confirmButtonText?: string;
}

export const MultiBarcodeScannerModal: React.FC<MultiBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  mode = 'generic',
  targetWarehouseId,
  warehouseId,
  supplierId,
  customerId,
  initialTokens = [],
  onConfirm,
  confirmButtonText
}) => {
  const effectiveWarehouseId = targetWarehouseId || warehouseId;
  const effectiveDescription = subtitle || description;
  const { imeis, warehouses, products, suppliers, customers } = useERP();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'camera' | 'hardware' | 'keyboard' | 'paste'>('hardware');

  // Input states
  const [rawPastedText, setRawPastedText] = useState('');
  const [keyboardSingleInput, setKeyboardSingleInput] = useState('');
  const [hardwareBufferInput, setHardwareBufferInput] = useState('');

  // Scanned Tokens List
  const [tokenList, setTokenList] = useState<string[]>(initialTokens);

  // Sound toggle
  const [soundOn, setSoundOn] = useState<boolean>(isScannerSoundEnabled());

  // Filter for results list
  const [resultFilter, setResultFilter] = useState<'all' | 'valid' | 'issues'>('all');
  const [searchFilterText, setSearchFilterText] = useState('');

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [continuousScan, setContinuousScan] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const isScanningRef = useRef(false);
  const lastScanTimeRef = useRef(0);

  // Auto-focus ref for hardware & keyboard input
  const hardwareInputRef = useRef<HTMLInputElement | null>(null);
  const keyboardInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setScannerSoundEnabled(next);
  };

  // Build analysis configuration
  const analysisConfig: AnalysisConfig = {
    mode,
    targetWarehouseId: effectiveWarehouseId,
    supplierId,
    customerId,
    disallowExistingInDB: mode === 'purchase',
    requireInDB: mode !== 'purchase' && mode !== 'generic'
  };

  // Run analysis on current token list
  const analysisResults = analyzeScannedBatch(tokenList, imeis, analysisConfig);

  // Selection states
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set());

  // Keep selection synchronized with valid items initially
  useEffect(() => {
    const validIds = new Set(
      analysisResults.filter(a => a.status === 'valid').map(a => a.id)
    );
    setSelectedTokenIds(validIds);
  }, [tokenList.length]);

  // Load initial tokens when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTokens.length > 0) {
        setTokenList([...initialTokens]);
      }
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // --- Add Token Helper ---
  const handleAddTokens = useCallback((newTokens: string[], playSound = true) => {
    if (!newTokens || newTokens.length === 0) return;

    setTokenList(prev => {
      const combined = [...prev, ...newTokens];
      return combined;
    });

    if (playSound) {
      // Check if any of these are duplicate in the incoming batch or database
      const hasDuplicate = newTokens.some(t => tokenList.includes(t));
      if (hasDuplicate) {
        playScanWarningBeep();
      } else {
        playScanSuccessBeep();
      }
    }
  }, [tokenList]);

  // --- Hardware Scanner Keypress Interceptor ---
  useEffect(() => {
    if (!isOpen || activeTab !== 'hardware') return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in textarea or search input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'textarea' || targetTag === 'select') return;

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.trim().length >= 4) {
          e.preventDefault();
          const clean = buffer.trim();
          handleAddTokens([clean]);
          setHardwareBufferInput(clean);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        // Fast burst of keystrokes (< 50ms) typical of barcode scanners
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, handleAddTokens]);

  // --- Keyboard Single Input Submission ---
  const handleKeyboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardSingleInput.trim()) return;
    const tokens = extractTokensFromRaw(keyboardSingleInput);
    handleAddTokens(tokens);
    setKeyboardSingleInput('');
    keyboardInputRef.current?.focus();
  };

  // --- Bulk Paste Submission ---
  const handleBulkPasteSubmit = () => {
    if (!rawPastedText.trim()) return;
    const tokens = extractTokensFromRaw(rawPastedText);
    handleAddTokens(tokens);
    setRawPastedText('');
  };

  // --- CAMERA SCANNER LOGIC ---
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);

    try {
      // Enumerate camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevs);

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
      if (capabilities.torch) {
        setHasTorch(true);
      }

      startScanningLoop();
    } catch (err: any) {
      setCameraError(err.message || 'ক্যামেরা চালু করা সম্ভব হয়নি। ব্রাউজার পারমিশন নিশ্চিত করুন।');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    isScanningRef.current = false;
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch {
      // Torch not supported
    }
  };

  const startScanningLoop = () => {
    isScanningRef.current = true;

    // Check if BarcodeDetector API is supported
    const BarcodeDetectorClass = (window as any).BarcodeDetector;

    if (BarcodeDetectorClass) {
      const detector = new BarcodeDetectorClass({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
      });

      const scanFrame = async () => {
        if (!isScanningRef.current || !videoRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const detected = barcodes[0].rawValue;
              const now = Date.now();

              // Throttle repeat scans of the exact same code
              if (detected && (detected !== lastScannedCode || now - lastScanTimeRef.current > 1500)) {
                lastScanTimeRef.current = now;
                setLastScannedCode(detected);
                handleAddTokens([detected]);

                if (!continuousScan) {
                  stopCamera();
                  return;
                }
              }
            }
          } catch {
            // Frame detection error, continue loop
          }
        }
        requestAnimationFrame(scanFrame);
      };

      requestAnimationFrame(scanFrame);
    }
  };

  // Clean up camera on tab change if not camera tab
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Sample data generators for rapid testing
  const handleFillSampleValid = () => {
    // Pick 5 random in-stock IMEIs from DB
    const available = imeis.filter(i => (mode === 'purchase' ? false : i.status === 'In Stock'));
    let samples: string[] = [];

    if (mode === 'purchase') {
      const prefix = '86' + Math.floor(100000 + Math.random() * 900000);
      samples = [
        `${prefix}01`,
        `${prefix}02`,
        `${prefix}03`,
        `${prefix}04`,
        `${prefix}05`
      ];
    } else if (available.length >= 3) {
      samples = available.slice(0, 5).map(i => i.imei1);
    } else {
      samples = imeis.slice(0, 5).map(i => i.imei1);
    }

    handleAddTokens(samples);
  };

  const handleFillSampleMixed = () => {
    // Generate realistic mixed batch: 3 valid, 1 duplicate in batch, 1 invalid format, 1 not in DB
    const inStock = imeis.find(i => i.status === 'In Stock')?.imei1 || '358941091234567';
    const sold = imeis.find(i => i.status === 'Sold')?.imei1 || '867123049876543';
    const mixed = [
      inStock,
      inStock, // duplicate
      sold,
      '359876543210987',
      'INVALID-TOKEN-99', // bad format
      '999999999999999' // not in DB
    ];
    handleAddTokens(mixed);
  };

  // --- Item Removal & Batch Operations ---
  const handleRemoveToken = (index: number) => {
    setTokenList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAll = () => {
    setTokenList([]);
    setSelectedTokenIds(new Set());
    setLastScannedCode(null);
  };

  const handleRemoveInvalidAndDuplicates = () => {
    const validOnlyTokens = analysisResults
      .filter(a => a.status === 'valid')
      .map(a => a.cleanToken);
    setTokenList(validOnlyTokens);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTokenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredResults.map(a => a.id));
    setSelectedTokenIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedTokenIds(new Set());
  };

  const handleCopyTokens = () => {
    const textToCopy = analysisResults
      .filter(a => selectedTokenIds.has(a.id))
      .map(a => a.cleanToken)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    alert(`${selectedTokenIds.size}টি IMEI ক্লিপবোর্ডে কপি করা হয়েছে!`);
  };

  // --- Confirm Handler ---
  const handleConfirm = () => {
    const selectedAnalysis = analysisResults.filter(a => selectedTokenIds.has(a.id));
    const validRecords = selectedAnalysis
      .map(a => a.dbRecord)
      .filter((r): r is IMEIRecord => r !== undefined);
    const allCleanTokens = selectedAnalysis.map(a => a.cleanToken);

    if (onConfirm) {
      onConfirm(validRecords, allCleanTokens, selectedAnalysis);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Filtered results
  const filteredResults = analysisResults.filter(row => {
    if (resultFilter === 'valid' && row.status !== 'valid') return false;
    if (resultFilter === 'issues' && row.status === 'valid') return false;
    if (searchFilterText) {
      const q = searchFilterText.toLowerCase();
      const matchesToken = row.cleanToken.toLowerCase().includes(q);
      const matchesModel = row.dbRecord?.productName.toLowerCase().includes(q) || false;
      const matchesStatus = row.statusMessage.toLowerCase().includes(q);
      return matchesToken || matchesModel || matchesStatus;
    }
    return true;
  });

  // KPI Metrics
  const totalCount = analysisResults.length;
  const validCount = analysisResults.filter(a => a.status === 'valid').length;
  const duplicateBatchCount = analysisResults.filter(a => a.status === 'duplicate_batch').length;
  const issueCount = totalCount - validCount;

  // Title & description defaults
  const displayTitle =
    title ||
    (mode === 'pos-sale'
      ? 'Multi-Barcode & IMEI POS Cart Scanner'
      : mode === 'purchase'
      ? 'Multi-Barcode & IMEI Purchase Entry Scanner'
      : mode === 'transfer'
      ? 'Multi-Barcode & IMEI Stock Transfer Manifest'
      : mode === 'return-customer'
      ? 'Customer Sales Return Multi-IMEI Scanner'
      : mode === 'return-supplier'
      ? 'Supplier Return Multi-IMEI Scanner'
      : mode === 'adjustment'
      ? 'Stock Adjustment & Status Multi-Scanner'
      : mode === 'lookup'
      ? 'Unified IMEI & Barcode 360° Search Engine'
      : 'Universal Multi-Barcode / IMEI Scanner');

  const displayDescription =
    effectiveDescription ||
    (mode === 'pos-sale'
      ? 'Scan multiple retail/wholesale handsets directly into sale items with instant stock verification'
      : mode === 'purchase'
      ? 'Register bulk handset serials via camera, hardware gun, or spreadsheet paste with strict duplicate prevention'
      : mode === 'transfer'
      ? 'Batch-scan handsets to dispatch from source warehouse to destination location'
      : 'Rapidly scan or paste multiple barcodes/IMEIs with real-time duplicate and validation detection');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-white/70 animate-in zoom-in-95 duration-200">
        {/* Top Gloss Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-600 pointer-events-none z-20" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Barcode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {displayTitle}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {mode.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {displayDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'স্ক্যানার সাউন্ড চালু (মিউট করতে ক্লিক করুন)' : 'স্ক্যানার সাউন্ড বন্ধ (সাউন্ড চালু করতে ক্লিক করুন)'}
              className={`p-2 rounded-xl border transition ${
                soundOn
                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Input Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Hardware Barcode Gun</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scanner</span>
            {cameraActive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </button>

          <button
            onClick={() => setActiveTab('keyboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'keyboard'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Keyboard Rapid Input</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Bulk Manual Paste</span>
          </button>
        </div>

        {/* Upper Input Engine Box */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          {/* TAB 1: Hardware Barcode Gun */}
          {activeTab === 'hardware' && (
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                <Barcode className="w-7 h-7" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="font-black text-slate-800 text-sm">
                    হ্যান্ডহেল্ড বারকোড গান / USB স্ক্যানার সক্রিয় (Listening)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ডিভাইসের বক্সে থাকা বারকোড বা IMEI-এর দিকে স্ক্যানার তাক করে ট্রিগার প্রেস করুন। কোডগুলো স্বয়ংক্রিয়ভাবে নিচে তালিকাভুক্ত হবে।
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  ref={hardwareInputRef}
                  type="text"
                  placeholder="Direct Gun Scanner Receiver..."
                  value={hardwareBufferInput}
                  onChange={(e) => setHardwareBufferInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && hardwareBufferInput.trim()) {
                      e.preventDefault();
                      handleAddTokens([hardwareBufferInput.trim()]);
                      setHardwareBufferInput('');
                    }
                  }}
                  className="w-full md:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (hardwareBufferInput.trim()) {
                      handleAddTokens([hardwareBufferInput.trim()]);
                      setHardwareBufferInput('');
                    }
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden p-4 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Optical Scanner
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {/* Camera select */}
                  {cameraDevices.length > 1 && (
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        stopCamera();
                        setTimeout(startCamera, 100);
                      }}
                      className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
                    >
                      {cameraDevices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                          {d.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Torch toggle */}
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                        torchOn ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                      <span>{torchOn ? 'Torch On' : 'Torch Off'}</span>
                    </button>
                  )}

                  {/* Continuous Scan Checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={continuousScan}
                      onChange={(e) => setContinuousScan(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span>Multi-Scan (অবিরাম)</span>
                  </label>
                </div>
              </div>

              {/* Viewfinder Area */}
              <div className="relative w-full max-w-lg mx-auto h-52 sm:h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                {cameraError ? (
                  <div className="p-4 text-center text-xs text-rose-300 max-w-xs space-y-2">
                    <AlertTriangle className="w-8 h-8 mx-auto text-rose-400" />
                    <p>{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                    >
                      পুনরায় চেষ্টা করুন
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Targeting Reticle & Laser */}
                    <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-sky-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
                    </div>

                    {lastScannedCode && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-center text-xs font-mono text-emerald-400 border border-emerald-500/40">
                        Scanned: {lastScannedCode}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Test simulator button for convenience */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Hold barcode steady inside targeting box</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = imeis[Math.floor(Math.random() * imeis.length)]?.imei1 || '358941091234567';
                    setLastScannedCode(sample);
                    handleAddTokens([sample]);
                  }}
                  className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  ⚡ Simulate Camera Scan
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Keyboard Rapid Input */}
          {activeTab === 'keyboard' && (
            <form onSubmit={handleKeyboardSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={keyboardInputRef}
                    type="text"
                    placeholder="Enter or paste single 15-digit IMEI or Barcode and press Enter..."
                    value={keyboardSingleInput}
                    onChange={(e) => setKeyboardSingleInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Code</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                টিপস: আপনি টাইপ বা স্ক্যান করার পর সরাসরি <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-semibold font-mono">Enter</kbd> চাপলেই ডিভাইসটি ব্যাচে যুক্ত হবে।
              </p>
            </form>
          )}

          {/* TAB 4: Bulk Manual Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Paste multiple Barcodes or IMEIs separated by newlines, commas, semicolons, or spaces (e.g. from Excel or Supplier Invoice)..."
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500">
                  Detected Tokens: <b>{extractTokensFromRaw(rawPastedText).length}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRawPastedText('')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Clear Text
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkPasteSubmit}
                    disabled={!rawPastedText.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Parse & Add All Tokens</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rapid Test Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>দ্রুত টেস্ট স্যাম্পল:</span>
              <button
                type="button"
                onClick={handleFillSampleValid}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-600 font-semibold rounded-lg border border-slate-200 transition cursor-pointer"
              >
                + Valid Sample Units
              </button>
              <button
                type="button"
                onClick={handleFillSampleMixed}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition cursor-pointer"
              >
                + Mixed Test (With Duplicates)
              </button>
            </div>

            {totalCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছুন ({totalCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Lower Scanned Verification & Selection Dashboard */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Status Metrics Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-1">
                ব্যাচ বিশ্লেষণ:
              </span>

              {/* Total */}
              <div className="px-2.5 py-1 rounded-xl bg-slate-200/80 text-slate-800 text-xs font-semibold">
                মোট: <b className="font-mono text-slate-900">{totalCount}</b>
              </div>

              {/* Valid */}
              <div className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>বৈধ: <b className="font-mono">{validCount}</b></span>
              </div>

              {/* Duplicates in Batch */}
              {duplicateBatchCount > 0 && (
                <div className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>ডুপ্লিকেট: <b className="font-mono">{duplicateBatchCount}</b></span>
                </div>
              )}

              {/* Other Issues */}
              {issueCount - duplicateBatchCount > 0 && (
                <div className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>ত্রুটি: <b className="font-mono">{issueCount - duplicateBatchCount}</b></span>
                </div>
              )}
            </div>

            {/* Filter Pills & Actions */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-200/70 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setResultFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    resultFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সব ({totalCount})
                </button>
                <button
                  onClick={() => setResultFilter('valid')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    resultFilter === 'valid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বৈধ ({validCount})
                </button>
                <button
                  onClick={() => setResultFilter('issues')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    resultFilter === 'issues' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সতর্কতা ({issueCount})
                </button>
              </div>

              {issueCount > 0 && (
                <button
                  onClick={handleRemoveInvalidAndDuplicates}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
                >
                  সমস্যাযুক্তগুলো সরান
                </button>
              )}
            </div>
          </div>

          {/* Quick Sub-toolbar: Search & Select */}
          {totalCount > 0 && (
            <div className="px-5 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  সব নির্বাচন ({filteredResults.length})
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-slate-500 hover:underline"
                >
                  নির্বাচন বাতিল
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleCopyTokens}
                  className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি ({selectedTokenIds.size})</span>
                </button>
              </div>

              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter scanned list..."
                  value={searchFilterText}
                  onChange={(e) => setSearchFilterText(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Table / List of Scanned Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {totalCount === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-inner">
                  <Barcode className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">
                    কোনো বারকোড বা IMEI স্ক্যান করা হয়নি
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    হ্যান্ডহেল্ড বারকোড গান ব্যবহার করে স্ক্যান করুন, ক্যামেরা চালু করুন, অথবা বাল্ক টেক্সট পেস্ট করুন।
                  </p>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ফিল্টারের সাথে মেলে এমন কোনো রেকর্ড নেই।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredResults.map((item, idx) => {
                  const isSelected = selectedTokenIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`px-5 py-3 flex items-center justify-between gap-3 transition text-xs ${
                        item.status === 'valid'
                          ? isSelected
                            ? 'bg-blue-50/40 hover:bg-blue-50/70'
                            : 'hover:bg-slate-50'
                          : 'bg-rose-50/30 hover:bg-rose-50/50'
                      }`}
                    >
                      {/* Left: Checkbox + Code info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />

                        <span className="text-slate-400 font-mono text-[11px] w-5 text-right shrink-0">
                          {idx + 1}.
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 tracking-wider text-xs">
                              {item.cleanToken}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {item.formatType}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.statusBadgeColor}`}
                            >
                              {item.statusMessage}
                            </span>
                          </div>

                          {/* Device / DB Details */}
                          {item.dbRecord ? (
                            <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span className="font-medium text-slate-800">
                                {item.dbRecord.productName}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">
                                {item.dbRecord.variantDesc}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-blue-700 font-medium">
                                {item.dbRecord.warehouseName}
                              </span>
                              {item.dbRecord.customerName && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-purple-700">
                                    Customer: {item.dbRecord.customerName}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : item.statusDetails ? (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.statusDetails}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveToken(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="এই আইটেমটি সরান"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            নির্বাচিত: <b className="font-mono text-blue-700">{selectedTokenIds.size}</b> / মোট:{' '}
            <b className="font-mono">{totalCount}</b>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বাতিল (Close)
            </button>

            {onConfirm && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedTokenIds.size === 0}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {confirmButtonText || `নিশ্চিত ও প্রয়োগ করুন (${selectedTokenIds.size})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
