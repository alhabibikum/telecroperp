import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  BadgeDollarSign,
  ShoppingCart,
  Boxes,
  Truck,
  Wallet,
  Users2,
  Building2,
  FileSpreadsheet,
  Settings2,
  X,
  Minus,
  CheckCircle2,
  Wifi,
  WifiOff,
  LogOut,
  Layers,
  ChevronUp
} from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { useERP } from '../../context/ERPContext';

interface WindowsTaskbarProps {
  onSelectView: (viewId: string) => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenDueCollection: () => void;
}

export const WindowsTaskbar: React.FC<WindowsTaskbarProps> = ({
  onSelectView,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenDueCollection
}) => {
  const {
    isDesktop,
    windows,
    activeWindowId,
    focusWindow,
    toggleMinimizeWindow,
    closeWindow,
    minimizeAll,
    restoreAll
  } = useWindowManager();

  const { currentUser, currentUserRole, isOnline, logout } = useERP();

  // Start Menu State
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allApps = [
    { id: 'dashboard', title: 'ড্যাশবোর্ড', sub: 'Dashboard', icon: LayoutDashboard, category: 'সাধারণ' },
    { id: 'wholesale-sales', title: 'পাইকারি বিক্রয়', sub: 'Wholesale Sales', icon: BadgeDollarSign, category: 'বিক্রয়' },
    { id: 'retail-pos', title: 'রিটেইল পিওএস', sub: 'Retail POS', icon: ShoppingCart, category: 'বিক্রয়' },
    { id: 'inventory', title: 'পণ্য ও ইনভেন্টরি', sub: 'Stock & IMEIs', icon: Boxes, category: 'স্টক' },
    { id: 'purchases', title: 'পারচেজ ও চালান', sub: 'Purchases', icon: Truck, category: 'স্টক' },
    { id: 'due-collection', title: 'বকেয়া কালেকশন', sub: 'Due Collection', icon: Wallet, category: 'বিক্রয়' },
    { id: 'due-ageing', title: 'বকেয়া এইজিং রিপোর্ট', sub: 'Due Ageing', icon: Wallet, category: 'বিক্রয়' },
    { id: 'customers', title: 'কাস্টমার ও ডিলার', sub: 'Customers', icon: Users2, category: 'পার্টনার' },
    { id: 'suppliers', title: 'সাপ্লায়ার তালিকা', sub: 'Suppliers', icon: Users2, category: 'পার্টনার' },
    { id: 'warehouses', title: 'ওয়্যারহাউজ ও গোডাউন', sub: 'Warehouses', icon: Building2, category: 'স্টক' },
    { id: 'stock-transfers', title: 'স্টক ট্রান্সফার', sub: 'Transfers', icon: Boxes, category: 'স্টক' },
    { id: 'cash-bank', title: 'ক্যাশ ও ব্যাংক', sub: 'Cash & Bank', icon: Wallet, category: 'অ্যাকাউন্টিং' },
    { id: 'expenses', title: 'দৈনিক খরচ ও ব্যয়', sub: 'Expenses', icon: Wallet, category: 'অ্যাকাউন্টিং' },
    { id: 'day-closing', title: 'দিন সমাপ্তি (Day Closing)', sub: 'Day Closing', icon: CheckCircle2, category: 'অ্যাকাউন্টিং' },
    { id: 'accounting', title: 'লেজার ও হিসাবরক্ষণ', sub: 'Accounting', icon: FileSpreadsheet, category: 'অ্যাকাউন্টিং' },
    { id: 'dynamic-business-report', title: 'ডায়নামিক রিপোর্ট', sub: 'Business Reports', icon: FileSpreadsheet, category: 'রিপোর্ট' },
    { id: 'classic-reports', title: 'ক্লাসিক রিপোর্ট', sub: 'Reports', icon: FileSpreadsheet, category: 'রিপোর্ট' },
    { id: 'settings', title: 'সিস্টেম সেটিংস', sub: 'Settings', icon: Settings2, category: 'সিস্টেম' }
  ];

  const filteredApps = searchQuery.trim()
    ? allApps.filter(
        a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allApps;

  const handleLaunchApp = (id: string) => {
    onSelectView(id);
    setShowStartMenu(false);
    setSearchQuery('');
  };

  const formattedTime = currentTime.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('bn-BD', {
    month: 'short',
    day: 'numeric'
  });

  if (!isDesktop) return null;

  return (
    <>
      {/* Start Menu Popup */}
      {showStartMenu && (
        <div
          onClick={() => setShowStartMenu(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs select-none"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="fixed bottom-14 left-2 sm:left-4 z-[70] w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[82vh] animate-in slide-in-from-bottom-5 duration-150 transform-gpu will-change-transform"
          >
            {/* Start Menu Top Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="অ্যাপ, মডিউল বা ফিচার খুঁজুন... (Search)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowStartMenu(false);
                  onOpenNewSale();
                }}
                className="flex-1 py-1.5 px-2 bg-emerald-50 dark:bg-emerald-600/30 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white rounded-xl font-bold transition text-center cursor-pointer border border-emerald-200 dark:border-emerald-500/30"
              >
                + নতুন বিক্রয়
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStartMenu(false);
                  onOpenNewPurchase();
                }}
                className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-600/30 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white rounded-xl font-bold transition text-center cursor-pointer border border-blue-200 dark:border-blue-500/30"
              >
                + নতুন পারচেজ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStartMenu(false);
                  onOpenDueCollection();
                }}
                className="flex-1 py-1.5 px-2 bg-rose-50 dark:bg-rose-600/30 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-xl font-bold transition text-center cursor-pointer border border-rose-200 dark:border-rose-500/30"
              >
                + কালেকশন
              </button>
            </div>

            {/* Apps Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredApps.map(app => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleLaunchApp(app.id)}
                    className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-600/30 hover:border-blue-200 dark:hover:border-blue-500/50 border border-transparent transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white truncate">
                        {app.title}
                      </strong>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-200 truncate">
                        {app.sub}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* User Profile Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <strong className="block text-xs font-black text-slate-800 dark:text-slate-100">
                    {currentUser?.name || 'অপারেটর'}
                  </strong>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                    {currentUserRole} • {currentUser?.department || 'হেড অফিস'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    minimizeAll();
                    setShowStartMenu(false);
                  }}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  title="সব মিনিমাইজ করুন (Show Desktop)"
                >
                  ডেস্কটপ
                </button>
                {logout && (
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-600 dark:text-rose-300 hover:text-white transition cursor-pointer"
                    title="লগ আউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Windows Taskbar Dock */}
      <footer className="hidden lg:flex fixed bottom-0 left-0 right-0 h-14 sm:h-[56px] bg-white/90 dark:bg-slate-950/95 backdrop-blur-3xl border-t border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white z-50 items-center justify-between px-2.5 sm:px-4 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transform-gpu">
        {/* Left Section: Start Button & Open Windows */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 overflow-x-auto no-scrollbar py-1">
          {/* Start Menu Button (Windows 11 Style) */}
          <button
            type="button"
            onClick={() => setShowStartMenu(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer shrink-0 shadow-xs ${
              showStartMenu
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
            title="উইন্ডোজ স্টার্ট মেনু (Windows Start Menu)"
          >
            {/* Windows 4-Square Logo */}
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <span className="bg-sky-400 rounded-[1px]" />
              <span className="bg-blue-500 rounded-[1px]" />
              <span className="bg-cyan-400 rounded-[1px]" />
              <span className="bg-indigo-400 rounded-[1px]" />
            </div>
            <span className="tracking-tight font-extrabold">স্টার্ট</span>
          </button>

          {/* Separator */}
          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Open Windows Tabs */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-1">
            {windows.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 px-2 font-medium italic truncate">
                কোনো উইন্ডো খোলা নেই • স্টার্ট বা ডেস্কটপ থেকে খুলুন
              </span>
            ) : (
              windows.map(win => {
                const isActive = activeWindowId === win.id && !win.isMinimized;
                const isMin = win.isMinimized;

                return (
                  <div
                    key={win.id}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 max-w-[220px] sm:max-w-[270px] border select-none ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : isMin
                        ? 'bg-amber-50 dark:bg-slate-900/95 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-slate-800 shadow-inner'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => {
                      if (isActive) {
                        toggleMinimizeWindow(win.id);
                      } else {
                        focusWindow(win.id);
                      }
                    }}
                    title={`${win.title} ${isMin ? '(মিনিমাইজড - ক্লিক করে রিস্টোর করুন)' : ''}`}
                  >
                    {/* Active Accent Underline */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-300 dark:bg-sky-400 rounded-full" />
                    )}

                    {/* Window Icon */}
                    <div className="w-4.5 h-4.5 shrink-0 flex items-center justify-center text-slate-500 dark:text-slate-300 text-sm">
                      {win.icon || (win.type === 'dialog' ? <span>🗔</span> : <span>🖥️</span>)}
                    </div>

                    {/* Window Title */}
                    <span className={`truncate min-w-0 ${
                      isMin
                        ? 'text-xs sm:text-[13px] font-bold text-amber-700 dark:text-amber-300'
                        : isActive
                        ? 'text-xs sm:text-[13px] font-black text-white'
                        : 'text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-100'
                    }`}>
                      {win.title}
                    </span>

                    {/* Minimized badge label */}
                    {isMin && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold shrink-0">
                        মিনিমাইজড
                      </span>
                    )}

                    {/* Close Tab Button */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        closeWindow(win.id);
                      }}
                      className="w-4.5 h-4.5 rounded-md hover:bg-rose-600 hover:text-white flex items-center justify-center text-slate-400 dark:text-slate-400 shrink-0 transition cursor-pointer"
                      title="উইন্ডো বন্ধ করুন"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: System Tray & Clock */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pl-2">
          {/* Online/Offline Diagnostic Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            }`}
            title={isOnline ? 'সিস্টেম ক্লাউডে সংযুক্ত (Online)' : 'সিস্টেম অফলাইন লোকাল ক্যাশে চলছে'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span className="hidden md:inline">{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
          </div>

          {/* Digital Clock */}
          <div className="flex flex-col items-end text-right leading-tight px-1.5">
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
              {formattedTime}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              {formattedDate}
            </span>
          </div>

          {/* Show Desktop Peek Button (Windows style right-edge vertical bar) */}
          <button
            type="button"
            onClick={minimizeAll}
            className="w-3.5 sm:w-4 h-8 rounded-[2px] bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 dark:hover:bg-blue-500 border-l border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="ডেস্কটপ দেখুন (Show Desktop / Minimize All)"
          />
        </div>
      </footer>
    </>
  );
};
