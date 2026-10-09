import React, { useState, useEffect } from 'react';

export interface FunctionKeyItem {
  key: string;
  label: string;
  subLabel?: string;
  action: () => void;
  color?: string;
  tooltip?: string;
}

interface FunctionKeyBarProps {
  onF1Help: () => void;
  onF2DateClosing: () => void;
  onF3Branch: () => void;
  onF4Transfer: () => void;
  onF5Payment: () => void;
  onF6Receipt: () => void;
  onF7JournalLedger: () => void;
  onF8Sales: () => void;
  onF9Purchase: () => void;
  onF10Inventory: () => void;
  onF11Fullscreen: () => void;
  onF12Settings: () => void;
  onEscapeClose?: () => void;
}

export const FunctionKeyBar: React.FC<FunctionKeyBarProps> = ({
  onF1Help,
  onF2DateClosing,
  onF3Branch,
  onF4Transfer,
  onF5Payment,
  onF6Receipt,
  onF7JournalLedger,
  onF8Sales,
  onF9Purchase,
  onF10Inventory,
  onF11Fullscreen,
  onF12Settings,
  onEscapeClose
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const keys: FunctionKeyItem[] = [
    { key: 'F1', label: 'সাহায্য', subLabel: 'Help', action: onF1Help, tooltip: 'কীবোর্ড শর্টকাট ও হেল্প (Help & Shortcuts)' },
    { key: 'F2', label: 'দিন সমাপ্তি', subLabel: 'Closing', action: onF2DateClosing, tooltip: 'তারিখ ও দিন সমাপ্তি (Day Closing)' },
    { key: 'F3', label: 'শাখা/কোম্পানি', subLabel: 'Branch', action: onF3Branch, tooltip: 'শাখা ও আউটলেট নির্বাচন (Branch Selection)' },
    { key: 'F4', label: 'ট্রান্সফার', subLabel: 'Transfer', action: onF4Transfer, tooltip: 'স্টক ট্রান্সফার চালান (Stock Transfer)' },
    { key: 'F5', label: 'পেমেন্ট/খরচ', subLabel: 'Payment', action: onF5Payment, tooltip: 'বকেয়া ও খরচ পরিশোধ (Payment/Expenses)' },
    { key: 'F6', label: 'রিসিট', subLabel: 'Receipt', action: onF6Receipt, tooltip: 'কাস্টমার কালেকশন রিসিট (Due Collection)' },
    { key: 'F7', label: 'লেজার/জার্নাল', subLabel: 'Ledger', action: onF7JournalLedger, tooltip: 'হিসাবরক্ষণ ও সাধারণ লেজার (Accounting Ledger)' },
    { key: 'F8', label: 'বিক্রয়', subLabel: 'Sales', action: onF8Sales, tooltip: 'পাইকারি বিক্রয় ইনভয়েস (Wholesale Sales)', color: 'text-emerald-700 dark:text-emerald-400' },
    { key: 'F9', label: 'ক্রয়', subLabel: 'Purchase', action: onF9Purchase, tooltip: 'নতুন পারচেজ ভাউচার (New Purchase)', color: 'text-blue-700 dark:text-blue-400' },
    { key: 'F10', label: 'ইনভেন্টরি', subLabel: 'Stock', action: onF10Inventory, tooltip: 'স্টক ও পণ্য তালিকা (Inventory/Stock)' },
    { key: 'F11', label: 'ফুলস্ক্রিন', subLabel: 'Fullscrn', action: onF11Fullscreen, tooltip: 'ফুলস্ক্রিন টগল (Toggle Fullscreen)' },
    { key: 'F12', label: 'সেটিংস', subLabel: 'Config', action: onF12Settings, tooltip: 'সিস্টেম কনফিগারেশন (Settings)' }
  ];

  // Visual flash on physical key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const match = keys.find(k => k.key.toUpperCase() === e.key.toUpperCase());
      if (match) {
        setPressedKey(match.key);
        setTimeout(() => setPressedKey(null), 250);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys]);

  return (
    <aside
      aria-label="ফাংশন কীবোর্ড বার"
      className="fixed bottom-[32px] left-0 right-0 h-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex items-center px-2 overflow-x-auto select-none z-35"
    >
      <div className="flex items-center gap-1.5 min-w-max w-full">
        {keys.map((item) => {
          const isPressed = pressedKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.action}
              title={`${item.key}: ${item.tooltip}`}
              className={`h-6 px-2 flex items-center gap-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                isPressed
                  ? 'bg-sky-500 text-white shadow-inner scale-95'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xs active:scale-95'
              }`}
            >
              <span className={`font-bold text-[10px] font-mono px-1 py-0.5 rounded-md leading-none ${
                isPressed ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
              }`}>
                {item.key}
              </span>
              <span className="font-medium truncate leading-none">
                {item.label}
              </span>
              {item.subLabel && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none hidden 2xl:inline">
                  {item.subLabel}
                </span>
              )}
            </button>
          );
        })}

        {onEscapeClose && (
          <button
            type="button"
            onClick={onEscapeClose}
            title="Esc: উইন্ডো বন্ধ করুন (Close Active Window)"
            className="h-6 ml-auto px-2 flex items-center gap-1 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
          >
            <span className="font-bold text-[10px] font-mono px-1 py-0.5 bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-100 rounded leading-none">
              Esc
            </span>
            <span className="font-medium text-[11px]">বন্ধ</span>
          </button>
        )}
      </div>
    </aside>
  );
};
