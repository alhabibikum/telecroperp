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
  ChevronUp,
  Terminal,
  Shield,
  Code2
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

  const { currentUser, currentUserRole, isOnline, alerts, products, imeis, logout } = useERP();

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

  const unreadAlerts = alerts.filter(a => !a.read).length;

  if (!isDesktop) return null;

  return (
    <>
      {/* Apple Launchpad / SAP Fiori App Drawer */}
      {showStartMenu && (
        <div
          onClick={() => setShowStartMenu(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs select-none"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="fixed bottom-10 left-3 z-[70] w-full max-w-md bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh] font-sans"
          >
            {/* Search Box */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মডিউল বা ফিচার সার্চ করুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* App Grid */}
            <div className="p-2 overflow-y-auto max-h-[50vh] space-y-1 text-xs">
              {filteredApps.map(app => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.id}
                    onClick={() => handleLaunchApp(app.id)}
                    className="p-2 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-100/70 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">{app.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{app.sub}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{app.category}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser?.name || 'Administrator'}</span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="hover:text-rose-600 flex items-center gap-1 transition cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple macOS / SAP Fiori Bottom Status Strip */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl text-slate-700 dark:text-slate-300 z-40 px-3 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 select-none text-xs font-sans shadow-xs">
        {/* Left Section: Launchpad & Running Apps */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto py-0.5">
          {/* Launchpad Button */}
          <button
            type="button"
            onClick={() => setShowStartMenu(prev => !prev)}
            className="h-6 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5 text-xs rounded-lg transition cursor-pointer shrink-0"
            title="Launchpad Modules"
          >
            <span>❖</span>
            <span>মডিউলসমূহ</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Open Windows / Tasks */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto py-0.5">
            {windows.map(win => {
              const isActive = activeWindowId === win.id && !win.isMinimized;
              const isMin = win.isMinimized;

              return (
                <div
                  key={win.id}
                  onClick={() => {
                    if (isActive) toggleMinimizeWindow(win.id);
                    else focusWindow(win.id);
                  }}
                  className={`h-6 px-2.5 flex items-center gap-1.5 rounded-lg cursor-pointer transition shrink-0 max-w-[190px] text-xs ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/70 font-semibold shadow-xs'
                      : isMin
                      ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 hover:bg-slate-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={win.title}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="truncate">{win.title.split(' ')[0]}</span>
                  {isMin && <span className="text-[10px] text-slate-400">(min)</span>}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="hover:text-rose-500 ml-1 text-slate-400"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: System Metrics & Clock */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {/* Cloud Connection */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isOnline ? 'ক্লাউড কানেক্টেড' : 'অফলাইন'}</span>
          </div>

          {/* Clock */}
          <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11.5px]">{formattedTime}</span>

          {/* Minimize All */}
          <button
            type="button"
            onClick={minimizeAll}
            className="w-3 h-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition cursor-pointer"
            title="Minimize All to Desktop"
          />
        </div>
      </footer>
    </>
  );
};
