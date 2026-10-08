import React from 'react';
import {
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { WindowsModalFrame } from './WindowsModalFrame';
import { UpdateInfo } from '../../hooks/useAppUpdater';

interface AppUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  isDownloading: boolean;
  isInstalling: boolean;
  progressPercent: number;
  downloadedBytes: number;
  totalBytes: number;
  statusMessage: string;
  errorMessage: string | null;
  onInstall: () => void;
}

export const AppUpdaterModal: React.FC<AppUpdaterModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  isDownloading,
  isInstalling,
  progressPercent,
  downloadedBytes,
  totalBytes,
  statusMessage,
  errorMessage,
  onInstall
}) => {
  if (!isOpen || !updateInfo) return null;

  const isBusy = isDownloading || isInstalling;

  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <WindowsModalFrame
      title="TeleCorp ERP - সফটওয়্যার অটো-আপডেট"
      isOpen={isOpen}
      onClose={isBusy ? () => {} : onClose}
      maxWidth="max-w-xl"
      showSkipButton={false}
    >
      <div className="p-6 bg-slate-900 text-slate-100 select-none">
        {/* Header Banner */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            {isBusy ? (
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                GitHub Release
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফাইড বিল্ড
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              নতুন সংস্করণ উপলব্ধ রয়েছে!
            </h2>
            <p className="text-sm text-slate-400">
              সফটওয়্যারটির সর্বশেষ আপডেট স্বয়ংক্রিয়ভাবে ইনস্টল করতে নিচে ক্লিক করুন।
            </p>
          </div>
        </div>

        {/* Version Compare Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">বর্তমান সংস্করণ</span>
            <div className="text-base font-bold text-slate-200">
              v{updateInfo.currentVersion || '1.0.0'}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-300 font-medium">নতুন সংস্করণ</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500 text-slate-950 rounded">
                NEW
              </span>
            </div>
            <div className="text-base font-bold text-cyan-200 flex items-center gap-2 mt-1">
              v{updateInfo.version}
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            আপডেট বিবরণী (Release Notes)
          </div>
          <div className="max-h-36 overflow-y-auto p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
            {updateInfo.body || '• পারফরম্যান্স উন্নতি ও সিস্টেম স্ট্যাবিলিটি আপডেট।\n• বিভিন্ন বাগ ফিক্স ও নতুন সুবিধা যোগ করা হয়েছে।'}
          </div>
        </div>

        {/* Progress or Status */}
        {isBusy && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/90 border border-cyan-500/30">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-cyan-300 font-medium flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                {statusMessage || 'ডাউনলোড হচ্ছে...'}
              </span>
              <span className="text-slate-300 font-mono font-bold">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-sm shadow-cyan-500/50"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {totalBytes > 0
                  ? `${formatMB(downloadedBytes)} / ${formatMB(totalBytes)}`
                  : downloadedBytes > 0
                  ? formatMB(downloadedBytes)
                  : 'প্রস্তুত হচ্ছে...'}
              </span>
              <span className="text-amber-400">
                {isInstalling ? 'স্বয়ংক্রিয় ইনস্টল ও রিস্টার্ট হচ্ছে...' : 'অ্যাপ্লিকেশন বন্ধ করবেন না'}
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-700/60 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Instructions banner */}
        {!isBusy && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-950/30 border border-emerald-600/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>অন্য কোন ক্লিক ছাড়াই:</strong> আপডেট বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে ডাউনলোড ও ইনস্টল হয়ে অ্যাপটি নতুন সংস্করণে রিস্টার্ট হবে।
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          {!isBusy && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              পরে করব (Later)
            </button>
          )}

          <button
            type="button"
            onClick={onInstall}
            disabled={isBusy}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
              isBusy
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-500/25 active:scale-95'
            }`}
          >
            {isBusy ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isInstalling ? 'ইনস্টল হচ্ছে...' : 'ডাউনলোড হচ্ছে...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                এখনই অটো-আপডেট করুন (1-Click Update)
              </>
            )}
          </button>
        </div>
      </div>
    </WindowsModalFrame>
  );
};
