import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  Search,
  Sparkles,
  Command,
  ArrowRight,
  Printer,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { ERP_SHORTCUTS, ShortcutItem } from '../../utils/keyboardNavigationUtils';

interface KeyboardShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutHelpModal: React.FC<KeyboardShortcutHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Global', 'Forms & Modals', 'Navigation', 'POS & Sales'];

  const filteredShortcuts = ERP_SHORTCUTS.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const q = search.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesQuery =
      s.keyCombo.toLowerCase().includes(q) ||
      s.labelEn.toLowerCase().includes(q) ||
      s.labelBn.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                কীবোর্ড শর্টকাট ও দ্রুত অপারেশন সহায়িকা
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  Dealer Pro
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Keyboard Shortcuts & Fast Operational Command Center
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="শর্টকাট বা কমান্ড সার্চ করুন (যেমন: Enter, Save, Print)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'সকল' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Key Principle Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-linear-to-r from-blue-50 via-indigo-50 to-teal-50 border border-blue-200/80 flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-800">
                স্মার্ট ফর্ম ট্রাভার্সাল (Auto-Focus & Enter Navigation):
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                যে কোনো ফর্মে <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 text-[10px]">Enter</kbd> চাপলে স্বয়ংক্রিয়ভাবে পরবর্তী ফিল্ডে ফোকাস চলে যাবে এবং বিদ্যমান টেক্সট সিলেক্ট হবে। শেষ ফিল্ডে অথবা যে কোনো ফিল্ড থেকে <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 text-[10px]">Ctrl + Enter</kbd> চাপলে সরাসরি সেভ/কনফার্ম হবে।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.labelBn}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {item.labelEn}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 font-mono">
                  {item.keys.map((k, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="px-2 py-1 bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-300 text-slate-700 group-hover:text-blue-700 font-bold text-[11px] rounded-lg border border-slate-300 shadow-2xs">
                        {k}
                      </kbd>
                      {kIdx < item.keys.length - 1 && (
                        <span className="text-slate-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              কোনো শর্টকাট খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium">Windows Standard Compliant Keyboard System</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            ঠিক আছে (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
