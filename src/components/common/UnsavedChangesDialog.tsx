import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirmDiscard: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onConfirmDiscard,
  onCancel,
  title = 'অসংরক্ষিত পরিবর্তন! (Unsaved Changes)',
  message = 'আপনি কিছু তথ্য পরিবর্তন করেছেন যা এখনো সেভ করা হয়নি। এখন বাতিল করলে আপনার পরিবর্তনগুলো হারিয়ে যাবে। আপনি কি নিশ্চিত?'
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirmDiscard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirmDiscard]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">সতর্কবার্তা • Action Required</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {message}
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ফর্মে থাকুন <kbd className="ml-1 text-[10px] font-mono opacity-60">Esc</kbd>
            </button>
            <button
              type="button"
              onClick={onConfirmDiscard}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              বাতিল নিশ্চিত করুন <kbd className="ml-1 text-[10px] font-mono opacity-80">Enter</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
