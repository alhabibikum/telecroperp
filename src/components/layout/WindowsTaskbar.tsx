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
      {/* Start Menu / App Launcher Popup */}
      {showStartMenu && (
        <div
          onClick={() => setShowStartMenu(false)}
          className="fixed inset-0 z-[60] bg-black/50 select-none"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="fixed bottom-8 left-2 z-[70] w-full max-w-md bg-[#252526] text-[#d4d4d4] border border-[#007acc] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] font-mono"
          >
            {/* Search Box */}
            <div className="p-2.5 bg-[#1e1e1e] border-b border-[#3f3f46]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#858585] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Solution Modules & Windows..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 bg-[#252526] border border-[#3f3f46] text-xs text-white placeholder-[#717171] focus:border-[#007acc] focus:outline-hidden"
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
                    className="p-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white rounded-xs cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-[#9cdcfe]" />
                      <span className="font-semibold">{app.title}</span>
                      <span className="text-[10px] text-[#858585] group-hover:text-white">({app.sub})</span>
                    </div>
                    <span className="text-[10px] text-[#717171] font-mono">{app.category}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer */}
            <div className="p-2 bg-[#1e1e1e] border-t border-[#3f3f46] flex items-center justify-between text-[11px] text-[#858585]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4ec9b0]" />
                <span>{currentUser?.name || 'Administrator'}</span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="hover:text-[#f14c4c] flex items-center gap-1 transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Studio Status Bar / Windows Taskbar Strip */}
      <footer className="fixed bottom-0 left-0 right-0 h-6.5 bg-[#007acc] text-white z-40 px-2 flex items-center justify-between border-t border-[#005a9e] select-none text-[11.5px] font-mono shadow-md">
        {/* Left Section: Status & Ready Glyph */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto py-0.5">
          {/* Start / Solution Launcher */}
          <button
            type="button"
            onClick={() => setShowStartMenu(prev => !prev)}
            className="h-5 px-2 bg-[#005a9e] hover:bg-[#1c97ea] text-white font-bold flex items-center gap-1 text-[11px] rounded-xs transition cursor-pointer shrink-0"
            title="TeleCorp Solution Launcher"
          >
            <span>VS</span>
            <span>Modules</span>
          </button>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 text-[11px] shrink-0 font-sans">
            <span className="w-2 h-2 rounded-full bg-[#4ec9b0] animate-pulse" />
            <span className="font-semibold">Ready</span>
          </div>

          <div className="h-3 w-px bg-white/20 shrink-0" />

          {/* Open Windows / Tasks */}
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto py-0.5">
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
                  className={`h-5 px-2 flex items-center gap-1.5 rounded-xs cursor-pointer transition shrink-0 max-w-[180px] text-[11px] ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white border-b-2 border-white font-bold'
                      : isMin
                      ? 'bg-[#005a9e]/70 text-[#ce9178] hover:bg-[#005a9e]'
                      : 'bg-[#005a9e] text-white hover:bg-[#1c97ea]'
                  }`}
                  title={win.title}
                >
                  <span className="truncate">{win.title.split(' ')[0]}</span>
                  {isMin && <span className="text-[9px] text-[#ce9178]">[min]</span>}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="hover:text-[#f14c4c] ml-1"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: System Metrics & Clock */}
        <div className="flex items-center gap-2 shrink-0 text-[10.5px]">
          {/* Supabase Connection */}
          <div className="hidden lg:flex items-center gap-1 opacity-90">
            {isOnline ? <Wifi className="w-3 h-3 text-[#4ec9b0]" /> : <WifiOff className="w-3 h-3 text-[#f14c4c]" />}
            <span>{isOnline ? 'Online (Supabase)' : 'Offline'}</span>
          </div>

          <div className="h-3 w-px bg-white/20 hidden sm:block" />

          {/* Warnings & Alerts */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[#f14c4c] font-bold">⊗ 0</span>
            <span className="text-[#ce9178] font-bold">▲ {unreadAlerts}</span>
          </div>

          <div className="h-3 w-px bg-white/20 hidden md:block" />

          {/* Encoding & Zoom */}
          <span className="hidden md:inline opacity-80">UTF-8</span>
          <span className="hidden md:inline opacity-80">100%</span>

          <div className="h-3 w-px bg-white/20" />

          {/* Clock */}
          <span className="font-bold">{formattedTime}</span>

          {/* Show Desktop Peek Bar */}
          <button
            type="button"
            onClick={minimizeAll}
            className="w-2.5 h-4 bg-white/30 hover:bg-white/60 rounded-xs transition cursor-pointer ml-1"
            title="Minimize All to Desktop"
          />
        </div>
      </footer>
    </>
  );
};
