import { IMEIRecord, IMEIStatus } from '../types/erp';

// Sound feedback state
let soundEnabled = true;
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const setScannerSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isScannerSoundEnabled = (): boolean => soundEnabled;

/**
 * Positive high-frequency beep for successful barcode/IMEI scan
 */
export const playScanSuccessBeep = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio errors silently
  }
};

/**
 * Low-frequency double buzzer for duplicate or invalid scan warning
 */
export const playScanWarningBeep = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const playTone = (start: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.1);
    };

    playTone(now, 380);
    playTone(now + 0.12, 320);
  } catch {
    // Ignore audio errors silently
  }
};

/**
 * Splits raw multi-barcode/IMEI input string (from keyboard, paste, scanner) into tokens
 */
export const extractTokensFromRaw = (input: string): string[] => {
  if (!input) return [];
  // Split on newlines, commas, semicolons, tabs, carriage returns, pipes, and whitespace
  return input
    .split(/[\r\n,;\t|\s]+/)
    .map(t => t.trim().replace(/['"“”]/g, ''))
    .filter(t => t.length > 0);
};

export type ScannedTokenStatus =
  | 'valid'
  | 'duplicate_batch'
  | 'duplicate_db'
  | 'not_in_db'
  | 'status_mismatch'
  | 'warehouse_mismatch'
  | 'invalid_format';

export interface ScannedTokenAnalysis {
  id: string;
  rawToken: string;
  cleanToken: string;
  formatType: 'imei' | 'barcode' | 'serial' | 'invalid';
  isValidFormat: boolean;
  isDuplicateInBatch: boolean;
  batchOccurrenceIndex: number;
  dbRecord?: IMEIRecord;
  isFoundInDB: boolean;
  status: ScannedTokenStatus;
  statusBadgeColor: string;
  statusMessage: string;
  statusDetails?: string;
  selected: boolean;
}

export interface AnalysisConfig {
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
  supplierId?: string;
  customerId?: string;
  allowedStatuses?: IMEIStatus[];
  disallowExistingInDB?: boolean;
  requireInDB?: boolean;
}

/**
 * Validates whether string conforms to standard IMEI format (14 to 16 numeric digits)
 * or alphanumeric barcode/serial number
 */
export const checkTokenFormat = (
  token: string
): { isValid: boolean; formatType: 'imei' | 'barcode' | 'serial' | 'invalid' } => {
  const clean = token.trim();
  // Standard IMEI is 14-16 digits
  if (/^\d{14,16}$/.test(clean)) {
    return { isValid: true, formatType: 'imei' };
  }
  // Standard Barcode / Serial: alphanumeric with hyphens/dots, 5-30 chars
  if (/^[a-zA-Z0-9\-_/.]{5,32}$/.test(clean)) {
    // If it looks like serial (has letters)
    if (/[a-zA-Z]/.test(clean)) {
      return { isValid: true, formatType: 'serial' };
    }
    return { isValid: true, formatType: 'barcode' };
  }
  return { isValid: false, formatType: 'invalid' };
};

/**
 * Analyzes a batch of scanned/pasted tokens against the active IMEI database
 */
export const analyzeScannedBatch = (
  tokens: string[],
  imeisDB: IMEIRecord[],
  config: AnalysisConfig = {}
): ScannedTokenAnalysis[] => {
  const seenInBatch = new Map<string, number>();
  const results: ScannedTokenAnalysis[] = [];

  tokens.forEach((raw, idx) => {
    const clean = raw.trim();
    if (!clean) return;

    const count = (seenInBatch.get(clean) || 0) + 1;
    seenInBatch.set(clean, count);
    const isDuplicateInBatch = count > 1;

    const formatCheck = checkTokenFormat(clean);

    // Look up in database by IMEI 1, IMEI 2, or Serial Number
    const dbRecord = imeisDB.find(
      i =>
        i.imei1 === clean ||
        (i.imei2 && i.imei2 === clean) ||
        (i.serialNumber && i.serialNumber.toLowerCase() === clean.toLowerCase())
    );

    const isFoundInDB = !!dbRecord;

    let status: ScannedTokenStatus = 'valid';
    let statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let statusMessage = 'Valid / প্রস্তুত';
    let statusDetails = '';

    if (!formatCheck.isValid) {
      status = 'invalid_format';
      statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      statusMessage = 'Invalid Format / ভুল ফরম্যাট';
      statusDetails = 'IMEI সাধারণত ১৪-১৬ ডিজিট অথবা বৈধ সিরিয়াল কোড হওয়া প্রয়োজন।';
    } else if (isDuplicateInBatch) {
      status = 'duplicate_batch';
      statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      statusMessage = 'Duplicate in Batch / একই স্ক্যানে একাধিকবার';
      statusDetails = `এই কোডটি এই ব্যাচে #${count} বার পাওয়া গিয়েছে।`;
    } else if (config.mode === 'purchase' || config.disallowExistingInDB) {
      // In purchase mode, IMEI MUST NOT exist in DB already
      if (isFoundInDB) {
        status = 'duplicate_db';
        statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
        statusMessage = 'Already in System / ডাটাবেজে বিদ্যমান';
        statusDetails = `এই ডিভাইসটি ইতোমধ্যে '${dbRecord?.status}' স্ট্যাটাসে ওয়্যারহাউস '${dbRecord?.warehouseName}' এ রয়েছে। ডুপ্লিকেট এন্ট্রি নিষিদ্ধ।`;
      } else {
        status = 'valid';
        statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        statusMessage = 'New Unit Ready / নতুন ডিভাইস হিসেবে যুক্ত হবে';
      }
    } else if (config.requireInDB || config.mode === 'pos-sale' || config.mode === 'transfer' || config.mode === 'return-customer' || config.mode === 'return-supplier' || config.mode === 'adjustment') {
      // Modes that require the item to exist in DB
      if (!isFoundInDB) {
        status = 'not_in_db';
        statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
        statusMessage = 'Not Found in System / সিস্টেমে নেই';
        statusDetails = 'এই IMEI/বারকোডটি ডাটাবেজে পাওয়া যায়নি।';
      } else if (config.mode === 'pos-sale') {
        if (dbRecord.status !== 'In Stock') {
          status = 'status_mismatch';
          statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          statusMessage = `Status: ${dbRecord.status} (In Stock নয়)`;
          statusDetails = `ডিভাইসটি বিক্রয়যোগ্য নয় কারণ এর বর্তমান স্ট্যাটাস '${dbRecord.status}'।`;
        } else if (config.targetWarehouseId && dbRecord.warehouseId !== config.targetWarehouseId) {
          status = 'warehouse_mismatch';
          statusBadgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
          statusMessage = 'Other Warehouse / অন্য লোকেশনে';
          statusDetails = `ডিভাইসটি বর্তমানে '${dbRecord.warehouseName}' এ রয়েছে।`;
        }
      } else if (config.mode === 'transfer') {
        if (dbRecord.status !== 'In Stock') {
          status = 'status_mismatch';
          statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          statusMessage = `Status: ${dbRecord.status}`;
          statusDetails = `শুধুমাত্র 'In Stock' ডিভাইস ট্রান্সফার করা সম্ভব।`;
        } else if (config.targetWarehouseId && dbRecord.warehouseId !== config.targetWarehouseId) {
          status = 'warehouse_mismatch';
          statusBadgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
          statusMessage = 'Source Mismatch';
          statusDetails = `ডিভাইসটি নির্বাচিত সোর্স ওয়্যারহাউসে নেই (${dbRecord.warehouseName} এ রয়েছে)।`;
        }
      } else if (config.mode === 'return-customer') {
        if (dbRecord.status !== 'Sold') {
          status = 'status_mismatch';
          statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          statusMessage = `Status: ${dbRecord.status} (Sold নয়)`;
          statusDetails = `কাস্টমার রিটার্নের জন্য ডিভাইসটি পূর্বে 'Sold' হতে হবে।`;
        }
      } else if (config.mode === 'return-supplier') {
        if (config.supplierId && dbRecord.supplierId !== config.supplierId) {
          status = 'status_mismatch';
          statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          statusMessage = 'Supplier Mismatch';
          statusDetails = `ডিভাইসটির সরবরাহকারী ছিল '${dbRecord.supplierName}'।`;
        }
      }
    } else {
      // General lookup mode
      if (!isFoundInDB) {
        status = 'not_in_db';
        statusBadgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
        statusMessage = 'Not in DB / ডাটাবেজে নেই';
        statusDetails = 'কোনো রেকর্ড পাওয়া যায়নি।';
      } else {
        status = 'valid';
        statusBadgeColor =
          dbRecord.status === 'In Stock'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : dbRecord.status === 'Sold'
            ? 'bg-blue-100 text-blue-800 border-blue-300'
            : dbRecord.status === 'Returned'
            ? 'bg-purple-100 text-purple-800 border-purple-300'
            : 'bg-amber-100 text-amber-800 border-amber-300';
        statusMessage = `${dbRecord.status} • ${dbRecord.warehouseName.split(' ')[0]}`;
        statusDetails = `${dbRecord.productName} (${dbRecord.variantDesc})`;
      }
    }

    results.push({
      id: `token-${idx}-${clean}`,
      rawToken: raw,
      cleanToken: clean,
      formatType: formatCheck.formatType,
      isValidFormat: formatCheck.isValid,
      isDuplicateInBatch,
      batchOccurrenceIndex: count,
      dbRecord,
      isFoundInDB,
      status,
      statusBadgeColor,
      statusMessage,
      statusDetails,
      selected: status === 'valid'
    });
  });

  return results;
};
