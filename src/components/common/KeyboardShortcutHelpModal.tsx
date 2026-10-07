import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Command,
  ArrowRight,
  Printer,
  CheckCircle2,
  Zap,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  CreditCard,
  ShoppingBag,
  Truck,
  Layers,
  Clock,
  DollarSign,
  Download,
  FileText
} from 'lucide-react';
import { ERP_SHORTCUTS, ShortcutItem } from '../../utils/keyboardNavigationUtils';

interface KeyboardShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRAINING_MODULES = [
  { id: 't-1', titleBn: '১. লগইন ও অপারেশনাল ড্যাশবোর্ড পরিচিতি', titleEn: 'Login & Cockpit Navigation', role: 'সকল রোল', summary: 'সিস্টেম স্ট্যাটাস, রিয়েলটাইম সেলস, স্টক ভ্যালু ও ওভারডিউ ডিলার এলার্ট পর্যবেক্ষণ।' },
  { id: 't-2', titleBn: '২. কোম্পানি প্রোফাইল, ভ্যাট ও সিস্টেম কনফিগারেশন', titleEn: 'Company Profile, VAT & Rules', role: 'Super Admin, GM', summary: 'কোম্পানি নাম, বিআইএন নম্বর, ৫% ভ্যাট ও হার্ড ক্রেডিট লক কনফিগারেশন।' },
  { id: 't-3', titleBn: '৩. ব্র্যান্ড, ওয়্যারহাউজ ও প্রোডাক্ট ক্যাটালগ সেটআপ', titleEn: 'Brands, Warehouses & Catalog', role: 'Warehouse Mgr, GM', summary: 'স্যামসাং, শাওমি ব্র্যান্ড, সেন্ট্রাল ওয়্যারহাউজ ও কালার/স্টোরেজ ভেরিয়েন্ট তৈরি।' },
  { id: 't-4', titleBn: '৪. সাপ্লায়ার পারচেজ বিল ও মাল্টি-আইএমইআই ইনওয়ার্ড', titleEn: 'Supplier Purchase & IMEI Entry', role: 'Warehouse Mgr', summary: 'সাপ্লায়ার চালান এন্ট্রি, ১৫-ডিজিট আইএমইআই স্ক্যানিং ও ডুপ্লিকেট রোধ নীতি।' },
  { id: 't-5', titleBn: '৫. বারকোড লেবেল ও থার্মাল বক্স স্টিকার প্রিন্টিং', titleEn: 'Thermal Barcode Box Labels', role: 'Warehouse Mgr', summary: 'ESC/POS সরাসরি থার্মাল প্রিন্ট ও মডেল, আইএমইআই১, আইএমইআই২ বারকোড প্রিন্ট।' },
  { id: 't-6', titleBn: '৬. পাইকারি সেলস ও রিটেইল পিওএস কাউন্টার ইনভয়েসিং', titleEn: 'Wholesale & POS Counter Invoicing', role: 'Salesman, Cashier', summary: 'ডিলার নির্বাচন, আইএমইআই স্ক্যান, ডিসকাউন্ট অনুমোদন ও ইনভয়েস প্রিন্ট।' },
  { id: 't-7', titleBn: '৭. ডিলার ক্রেডিট লিমিট ও বকেয়া কালেকশন মানি রসিদ', titleEn: 'Dealer Limits & Money Receipts', role: 'Cashier, Accounts', summary: 'বকেয়া কালেকশন, ব্যাংক ট্র্যান্সফার ও ক্যাশ ডিসকাউন্ট ওয়েভার মানি রসিদ।' },
  { id: 't-8', titleBn: '৮. কিস্তি ও ইএমআই হায়ার-পারচেজ চুক্তি ও শিডিউল', titleEn: 'EMI & Hire-Purchase Financing', role: 'Sales Mgr, Cashier', summary: 'ডাউন পেমেন্ট, মাসিক কিস্তি শিডিউল, জামিনদার যাচাই ও কিস্তি আদায়।' },
  { id: 't-9', titleBn: '৯. কাস্টমার ও সাপ্লায়ার রিটার্নস (RMA) প্রসিডিউর', titleEn: 'Returns Management (RMA)', role: 'Warehouse Mgr, GM', summary: 'ডিফল্ট আইএমইআই কাস্টমার রিটার্ন, স্টক রিস্টকিং ও ভেন্ডর রিটার্ন।' },
  { id: 't-10', titleBn: '১০. ইন্টার-ওয়্যারহাউজ ও ব্রাঞ্চ স্টক ট্রান্সফার', titleEn: 'Inter-Branch Stock Transfers', role: 'Warehouse Mgr', summary: 'ডিসপ্যাচ, ইন-ট্রানজিট ট্র্যাকিং এবং গন্তব্য আউটলেটে স্ক্যান ভেরিফিকেশন।' },
  { id: 't-11', titleBn: '১১. অফিস ও অপারেশন খরচ ভাউচার এন্ট্রি', titleEn: 'Operational Expense Vouchers', role: 'Cashier, Accountant', summary: 'ভাড়া, ট্রান্সপোর্ট, টিএ/ডিএ ও ইউটিলিটি ভাউচার তৈরি ও ক্যাশ বুক থেকে কর্তন।' },
  { id: 't-12', titleBn: '১২. দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং', titleEn: 'Daily Vault Count & Day Closing', role: 'Cashier, Accounts', summary: 'কাউন্টার ক্যাশ গণনা, নোট অনুযায়ী মিলকরণ এবং দৈনিক ভল্ট লক সম্পন্ন।' },
  { id: 't-13', titleBn: '১৩. ডাইনামিক বিজনেস রিপোর্ট ও অডিট ট্রেইল পর্যালোচনা', titleEn: 'Business Reports & Audit Trail', role: 'Owner, GM, Accounts', summary: 'লাভ-ক্ষতি (P&L), ব্যালেন্স শিট, স্টক লেজার ও ইউজার অডিট হিস্ট্রি পর্যবেক্ষণ।' }
];

export const KeyboardShortcutHelpModal: React.FC<KeyboardShortcutHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'guide' | 'training'>('shortcuts');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Interactive training progress saved in localStorage
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('TELECORP_TRAINING_PROGRESS');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleLesson = (id: string) => {
    setCompletedLessons(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('TELECORP_TRAINING_PROGRESS', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TRAINING_MODULES.length) * 100);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150"
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                টেলিকর্প ইআরপি • অপারেশনাল সেন্টার ও সহায়িকা
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  v3.2 Enterprise
                </span>
                <span className="text-[9px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded uppercase">
                  সাব-উইন্ডো
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Complete User Operation SOP, Keyboard Engine & Staff Training Curriculum
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/telecorp_erp_operation_guide.pdf"
              download="TeleCorp_ERP_Operation_Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors shadow-xs"
              title="Download Full User Guide in PDF format"
            >
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>PDF গাইড</span>
              <Download className="w-3 h-3 text-red-500" />
            </a>
            <a
              href="/telecorp_erp_operation_guide.docx"
              download="TeleCorp_ERP_Operation_Guide.docx"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-xs"
              title="Download Full User Guide in Microsoft Word (.docx) format"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Word গাইড</span>
              <Download className="w-3 h-3 text-blue-500" />
            </a>

            {/* Skip Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-800 hover:text-slate-950 border border-amber-300 font-black text-xs transition cursor-pointer"
              title="উইন্ডোটি স্কিপ করুন"
            >
              <span>স্কিপ (Skip)</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-rose-600 transition-colors cursor-pointer"
              title="বন্ধ করুন (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>কীবোর্ড শর্টকাট (Shortcuts)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ম্যানেজার অপারেশন এসওপি (Manager SOP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'training'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>নতুন কর্মী ট্রেনিং মোড (Training Checklist)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
              {completedCount}/{TRAINING_MODULES.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENT 1: SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div className="flex-1 flex flex-col overflow-hidden">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                    যে কোনো ফর্মে <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 text-[10px]">Enter</kbd> চাপলে স্বয়ংক্রিয়ভাবে পরবর্তী ফিল্ডে ফোকাস চলে যাবে। শেষ ফিল্ডে অথবা যে কোনো ফিল্ড থেকে <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 text-[10px]">Ctrl + Enter</kbd> চাপলে সরাসরি সেভ/কনফার্ম হবে।
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
          </div>
        )}

        {/* TAB CONTENT 2: MANAGER SOP GUIDE */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700 text-xs leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  ১. পারচেজ ও আইএমইআই ইনওয়ার্ড (Purchase Bill)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> সাপ্লায়ার পারচেজ বিল (+ Purchase)<br />
                  <strong>নিয়ম:</strong> ১৫ ডিজিটের প্রতিটি হ্যান্ডসেট আইএমইআই স্ক্যান করতে হবে। সিস্টেম ডুপ্লিকেট আইএমইআই স্বয়ংক্রিয়ভাবে ব্লক করে। কোয়ান্টিটি এবং স্ক্যান করা আইএমইআই সংখ্যা হুবহু সমান হতে হবে।
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  ২. পাইকারি সেলস ও ইনভয়েস (Wholesale POS)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> পাইকারি সেলস ও ইনভয়েস (+ Wholesale Sale)<br />
                  <strong>নিয়ম:</strong> ডিলার নির্বাচন করলে তার ক্রেডিট লিমিট ও বাকি ব্যালেন্স দেখাবে। আইএমইআই স্ক্যান করে সেল হবে। লিমিট অতিক্রম করলে সিস্টেম হার্ড-ব্লক করবে।
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <CreditCard className="w-4 h-4" />
                  ৩. বকেয়া কালেকশন ও মানি রসিদ (Due Collection)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> বকেয়া কালেকশন ও রসিদ (+ নতুন মানি রসিদ)<br />
                  <strong>নিয়ম:</strong> ক্যাশ, ব্যাংক বা চেকে কালেকশন এন্ট্রি দিলে ডিলারের বাকি সঙ্গে সঙ্গে কমে যাবে এবং ক্যাশ বা ব্যাংকে টাকা জমা হবে। সরাসরি এন্ট্রি ডিলিট নিষিদ্ধ; প্রয়োজনে 'Void' করুন।
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <Truck className="w-4 h-4" />
                  ৪. ওয়্যারহাউজ ট্রান্সফার (Branch Transfers)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> ইন্টার-ওয়্যারহাউজ ট্রান্সফার (+ স্টক ট্রান্সফার)<br />
                  <strong>নিয়ম:</strong> সেন্ট্রাল ব্রাঞ্চ ডিসপ্যাচ করলে হ্যান্ডসেট ইন-ট্রানজিটে থাকে। গন্তব্য ব্রাঞ্চ আইএমইআই মিলিয়ে রিসিভ না করা পর্যন্ত সেল করা যায় না।
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <RotateCcw className="w-4 h-4" />
                  ৫. কাস্টমার ও সাপ্লায়ার রিটার্ন (RMA Returns)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> কাস্টমার ও ভেন্ডর রিটার্ন<br />
                  <strong>নিয়ম:</strong> ৭ দিনের মধ্যে বক্স অক্ষত বা DOA থাকলে সেলস রিটার্ন নিন। আইএমইআই স্টকে ফিরে আসবে, কাস্টমারের ক্রেডিট নোট তৈরি হবে এবং সেলসম্যান কমিশন রিভার্স হবে।
                </p>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  ৬. দৈনিক ডে ক্লোজিং ও ক্যাশ ভল্ট লক (Day Closing)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>মেন্যু:</strong> দৈনিক ডে ক্লোজিং ও ভল্ট<br />
                  <strong>নিয়ম:</strong> প্রতিদিন দোকান বন্ধের পূর্বে ক্যাশিয়ার ড্রয়ারের নোট গুনে এন্ট্রি দিবেন। প্রত্যাশিত ক্যাশ এবং বাস্তব ক্যাশের পার্থক্য (Discrepancy) শূন্য (৳০) হওয়া নিশ্চিত করে লক করুন।
                </p>
              </div>
            </div>

            {/* Error Rules Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                জরুরি সতর্কবার্তা ও নিরাপত্তা নিয়মাবলি:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 pl-1">
                <li>কখনও লগইন পাসওয়ার্ড শেয়ার করবেন না; সকল লেনদেন অডিট ট্রেইলে ব্যবহারকারীর নামসহ রেকর্ড হয়।</li>
                <li>আইএমইআই স্ক্যান না করে কোনো হ্যান্ডসেট সেল বা ডেলিভারি করা কঠোরভাবে নিষিদ্ধ।</li>
                <li>ভুল এন্ট্রি হলে সরাসরি ডিলিট করবেন না; স্ট্যান্ডার্ড রিটার্ন বা ভল্ট রিভার্সাল মেথড ব্যবহার করুন।</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: TRAINING CURRICULUM */}
        {activeTab === 'training' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Progress Bar Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  User Onboarding & Training Progress
                </span>
                <h4 className="text-base font-black mt-1">
                  কর্মী প্রশিক্ষণ ট্র্যাক: {progressPercent}% সম্পন্ন
                </h4>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {completedCount} টি বিষয় সফলভাবে শেখা হয়েছে (মোট {TRAINING_MODULES.length} টি)
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black">{progressPercent}%</span>
              </div>
            </div>

            {/* Training Modules List */}
            <div className="space-y-2">
              {TRAINING_MODULES.map(mod => {
                const isDone = Boolean(completedLessons[mod.id]);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleLesson(mod.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleLesson(mod.id)}
                      className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDone ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                          {mod.titleBn}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {mod.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {mod.titleEn}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                        {mod.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium">TeleCorp Pro Interactive Training & Help Engine</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

