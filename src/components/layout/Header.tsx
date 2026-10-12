import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  Plus,
  Truck,
  Wallet,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Menu,
  Keyboard,
  LogOut,
  Building2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { Notifications } from './Notifications';

interface HeaderProps {
  isSidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenDueCollection: () => void;
  onOpenIMEILookup: (imei?: string) => void;
  onOpenMultiScanner?: (initialTokens?: string[], mode?: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
  onSelectView: (view: string) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onCheckForUpdates?: () => void;
  isCheckingUpdates?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarExpanded,
  onToggleSidebar,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenDueCollection,
  onOpenIMEILookup,
  onOpenMultiScanner,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
  onSelectView,
  onCheckForUpdates,
  isCheckingUpdates = false
}) => {
  const {
    currentUserRole,
    currentUser,
    settings,
    updateSettings,
    isOnline,
    isSyncing,
    triggerManualSync,
    logout
  } = useERP();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 bg-white dark:bg-[#111c30] border-b border-slate-300 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 select-none z-30 transition-colors shadow-2xs">
      {/* Left: Sidebar Toggle, Brand & Active Branch */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1d4ed8] dark:bg-blue-600 flex items-center justify-center text-white font-black text-xs tracking-wider uppercase border border-blue-700 shadow-2xs">
            {settings?.companyName ? settings.companyName.trim().substring(0, 2) : 'TC'}
          </div>
          <div>
            <div className="font-bold text-[14.5px] text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate max-w-[170px] sm:max-w-[260px]" title={settings?.companyName || 'TeleCorp ERP'}>
              {settings?.companyName || 'TeleCorp ERP'}
            </div>
            <div className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5 truncate max-w-[170px] sm:max-w-[260px]">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{settings?.companyAddress ? settings.companyAddress.split(',')[0] : 'প্রধান কার্যালয়'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Global Search (Square Desktop Bar) */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between transition cursor-pointer"
          title="Search anything or run commands (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="font-medium">আইএমইআই, ইনভয়েস, কাস্টমার খুঁজুন...</span>
          </div>
          <kbd className="font-mono text-[10.5px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-slate-600 font-bold">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action Buttons & Profile Controls */}
      <div className="flex items-center gap-2">
        {/* Quick New Sale Button */}
        <button
          type="button"
          onClick={onOpenNewSale}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs border border-blue-700 shadow-2xs transition cursor-pointer"
          title="নতুন বিক্রয় ইনভয়েস (F8 / Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>বিক্রয় চালান</span>
        </button>

        {/* Quick Purchase Button */}
        <button
          type="button"
          onClick={onOpenNewPurchase}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          title="নতুন পারচেজ ইনওয়ার্ড (F9)"
        >
          <Truck className="w-3.5 h-3.5 text-slate-500" />
          <span>ক্রয় চালান</span>
        </button>

        {/* Quick Due Collection */}
        <button
          type="button"
          onClick={onOpenDueCollection}
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          title="বকেয়া কালেকশন রসিদ (F6)"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-500" />
          <span>বকেয়া জমা</span>
        </button>

        <div className="h-6 w-px bg-slate-300 dark:border-slate-700 mx-1 hidden sm:block" />

        {/* Database Status Indicator */}
        <div
          onClick={() => triggerManualSync()}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200"
          title={isOnline ? 'ক্লাউড সিঙ্ক চালু আছে (ক্লিক করে রিফ্রেশ করুন)' : 'অফলাইন মোড'}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : isOnline ? (
            <span className="w-2.5 h-2.5 bg-emerald-600 animate-pulse" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span className="text-[12px] font-bold">{isOnline ? 'ক্লাউড সিঙ্ক' : 'অফলাইন'}</span>
        </div>

        {/* Keyboard Shortcuts Help */}
        {onOpenShortcutsHelp && (
          <button
            type="button"
            onClick={onOpenShortcutsHelp}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Keyboard Shortcuts (F1)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer relative"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
              <Notifications
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onSelectView={onSelectView}
                onOpenNewPurchase={onOpenNewPurchase}
              />
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-700 ml-1">
          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-xs flex items-center justify-center border border-blue-300 dark:border-blue-700">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[12.5px] font-bold text-slate-900 dark:text-slate-100 leading-none">
              {currentUser?.name || 'Administrator'}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold capitalize mt-0.5 leading-none">
              {currentUserRole}
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 transition cursor-pointer"
            title="লগআউট (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
