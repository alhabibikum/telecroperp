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
      className="fixed bottom-[26px] left-0 right-0 h-[28px] bg-[#ece9d8] dark:bg-[#252526] border-t border-[#999999] dark:border-[#333333] border-b border-[#ffffff] dark:border-[#1e1e1e] flex items-center px-1 overflow-x-auto select-none z-35"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif'
      }}
    >
      <div className="flex items-center gap-1 min-w-max w-full">
        {keys.map((item) => {
          const isPressed = pressedKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.action}
              title={`${item.key}: ${item.tooltip}`}
              className={`h-5 px-1.5 flex items-center gap-1 text-[11px] font-sans rounded-none transition-all cursor-pointer ${
                isPressed
                  ? 'bg-[#d0ccc0] dark:bg-[#37373d] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)] translate-y-[1px]'
                  : 'bg-[#f4f2e8] dark:bg-[#2d2d30] hover:bg-[#ffffff] dark:hover:bg-[#3e3e42] shadow-[1px_1px_0_#ffffff_inset,-1px_-1px_0_#999999_inset]'
              } border border-[#7f9db9] dark:border-[#454545] text-[#000000] dark:text-[#cccccc] active:scale-95`}
            >
              <span className="font-bold text-[10px] font-mono px-1 py-[0.5px] bg-[#005a9e] text-white dark:bg-[#007acc] rounded-[2px] leading-none">
                {item.key}
              </span>
              <span className={`font-semibold truncate leading-none ${item.color || ''}`}>
                {item.label}
              </span>
              {item.subLabel && (
                <span className="text-[9.5px] opacity-60 leading-none hidden xl:inline">
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
            className="h-5 ml-auto px-1.5 flex items-center gap-1 text-[11px] font-sans bg-[#f4f2e8] dark:bg-[#2d2d30] hover:bg-[#ffebee] hover:text-[#c62828] border border-[#7f9db9] dark:border-[#454545] shadow-[1px_1px_0_#ffffff_inset,-1px_-1px_0_#999999_inset] rounded-none cursor-pointer"
          >
            <span className="font-bold text-[10px] font-mono px-1 py-[0.5px] bg-[#c62828] text-white rounded-[2px] leading-none">
              Esc
            </span>
            <span className="font-semibold text-[10.5px]">বন্ধ</span>
          </button>
        )}
      </div>
    </aside>
  );
};
