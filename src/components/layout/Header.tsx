import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  PlusCircle,
  Smartphone,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Trash2,
  Keyboard,
  Sun,
  Moon,
  Menu,
  Pin,
  PinOff,
  ChevronDown,
  Download
} from 'lucide-react';
import { Notifications } from './Notifications';
import { testSupabaseConnection } from '../../lib/supabase';
import { WindowsModalFrame } from '../common/WindowsModalFrame';

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
  isPinned = false,
  onTogglePin,
  onCheckForUpdates,
  isCheckingUpdates = false
}) => {
  const {
    currentUserRole,
    hasPermission,
    alerts,
    imeis,
    products,
    customers,
    customerReturns,
    settings,
    updateSettings,
    isOnline,
    pendingSyncCount,
    syncQueue,
    isSyncing,
    triggerManualSync,
    clearOfflineSyncQueue
  } = useERP();
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme();

  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await testSupabaseConnection();
      setPingResult(res);
    } catch (e: any) {
      setPingResult({ success: false, message: e.message || 'পিংস সংযোগ ব্যর্থ হয়েছে।' });
    } finally {
      setTestingPing(false);
    }
  };

  const handleTriggerSync = async () => {
    setManualSyncMsg(null);
    const res = await triggerManualSync();
    setManualSyncMsg(res.message);
    setTimeout(() => setManualSyncMsg(null), 6000);
  };

  // Real operational notification counts - NO DUMMY VALUES
  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const unreadAlertsCount = alerts.filter(a => !a.read).length;
  const lowStockCount = products.flatMap(p =>
    p.variants.filter(v => {
      const stock = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
      return stock <= v.reorderLevel;
    })
  ).length;
  const pendingApprovalsCount = (
    customerReturns.filter(r => r.status === 'Pending').length +
    customers.filter(c => c.creditLimit > 0 && c.currentDue >= c.creditLimit).length
  );
  const totalRealNotifications = unreadAlertsCount + lowStockCount + pendingApprovalsCount;

  const [isHovered, setIsHovered] = useState(false);
  const isVisible = isPinned || isHovered;

  return (
    <>
      {/* Top Hover Hotzone & Pull Tab when Header is in Auto-Hide mode */}
      {!isPinned && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          className="fixed top-0 left-0 right-0 h-3 z-40 group cursor-pointer"
          title="মাউস আনলে হেডার খুলবে • ডাবল ক্লিকে পিন হবে"
        >
          {/* Subtle center indicator */}
          <div
            onClick={() => setIsHovered(true)}
            className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-300 z-40 ${
              isHovered ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="bg-slate-900/90 dark:bg-slate-800/90 hover:bg-blue-600 text-white px-3 py-0.5 rounded-b-xl text-[10px] font-bold shadow-md flex items-center gap-1.5 border-x border-b border-white/20 select-none">
              <ChevronDown className="w-3 h-3 text-blue-400 group-hover:text-white animate-bounce" />
              <span>হেডার (মাউস আনুন)</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsHovered(false);
        }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('button, input, select, a')) return;
          if (onTogglePin) onTogglePin();
        }}
        className={`h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between select-none transition-all duration-300 ease-out ${
          isPinned
            ? 'sticky top-0 z-30 shadow-xs'
            : `fixed top-0 left-0 right-0 z-50 shadow-2xl ${
                isVisible
                  ? 'translate-y-0 opacity-100 pointer-events-auto'
                  : '-translate-y-full opacity-0 pointer-events-none'
              }`
        }`}
        title={isPinned ? 'হেডার পিন করা আছে (ডাবল ক্লিক বা বাটনে চাপলে অটো-হাইড হবে)' : 'হেডার অটো-হাইড মোড (ডাবল ক্লিক বা বাটনে চাপলে স্থায়ী পিন হবে)'}
      >
        {/* Left: Brand info & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 select-none">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isSidebarExpanded ? "সাইডবার লুকান (Collapse Sidebar: Ctrl+[)" : "সাইডবার খুলুন (Expand Sidebar: Ctrl+[)"}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => onSelectView('dashboard')}
          >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(20,184,166,0.3)] font-black text-lg sm:text-xl shrink-0 transition-transform hover:scale-105 active:scale-95">
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h9a7 7 0 0 1 7 7 7 7 0 0 1-7 7H9v2H4V4zm5 10h4a3 3 0 0 0 3-3 3 3 0 0 0-3-3H9v6z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base md:text-lg uppercase whitespace-nowrap">
              DEALERFLOW <span className="text-teal-600 dark:text-teal-400 font-black">ERP</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium hidden md:block truncate">
            Multi-Brand Smartphone & Dealer Distribution
          </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons, Notifications, Role Switcher, Lang */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
        {/* Quick Action Shortcuts */}
        <div className="hidden md:flex items-center gap-1.5">
          {(hasPermission(currentUserRole, 'wholesale-sales') || hasPermission(currentUserRole, 'retail-pos')) && (
            <button
              onClick={onOpenNewSale}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Create Wholesale or Dealer Sale Invoice"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Sale</span>
            </button>
          )}

          {hasPermission(currentUserRole, 'purchases') && (
            <button
              onClick={onOpenNewPurchase}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Supplier Purchase & Bulk IMEI Inward"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>+ Purchase</span>
            </button>
          )}

          {hasPermission(currentUserRole, 'due-collection') && (
            <button
              onClick={onOpenDueCollection}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Collect Customer Due & Allocate"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Due</span>
            </button>
          )}

          {hasPermission(currentUserRole, 'imei-trace') && (
            <button
              onClick={() => onOpenIMEILookup()}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Track IMEI Lifecycle"
            >
              <Search className="w-3.5 h-3.5" />
              <span>IMEI Trace</span>
            </button>
          )}

          {onOpenMultiScanner && (
            <button
              onClick={() => onOpenMultiScanner()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Multi Barcode & IMEI Scanner (Ctrl+B)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Multi-Scan</span>
            </button>
          )}

          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Global Command Palette (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {onOpenShortcutsHelp && (
            <button
              onClick={onOpenShortcutsHelp}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Keyboard Shortcuts & Operations Help (Ctrl+/)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alerts & Operational Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer"
            title="Real-Time Notifications, Stock Warnings & Approvals"
          >
            <Bell className="w-4 h-4" />
            {totalRealNotifications > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {totalRealNotifications > 99 ? '99+' : totalRealNotifications}
              </span>
            )}
          </button>

          {/* Unified Notification Component */}
          <Notifications
            isOpen={showAlertDropdown}
            onClose={() => setShowAlertDropdown(false)}
            onSelectView={onSelectView}
            onOpenNewPurchase={onOpenNewPurchase}
          />
        </div>

        {/* Real-Time Online/Offline Network Status Pill */}
        <button
          onClick={() => {
            setShowNetworkModal(true);
            setPingResult(null);
          }}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer shadow-2xs font-extrabold ${isSyncing
              ? 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              : pendingSyncCount > 0
                ? 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-700 animate-pulse'
                : isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            }`}
          title={
            isSyncing
              ? 'ক্লাউডে সিঙ্ক হচ্ছে...'
              : pendingSyncCount > 0
                ? `${pendingSyncCount}টি পরিবর্তন অফলাইনে রয়েছে - ক্লাউডে সিঙ্ক করতে ক্লিক করুন`
                : isOnline
                  ? 'অনলাইন মোড (ক্লাউড ও লোকাল ডেটাবেস সক্রিয়)'
                  : 'অফলাইন মোড (লোকাল স্টোরেজ সক্রিয়)'
          }
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span>সিঙ্ক হচ্ছে...</span>
            </>
          ) : pendingSyncCount > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{pendingSyncCount}টি সিঙ্ক বাকি</span>
            </>
          ) : isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">অনলাইন</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 sm:hidden" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>অফলাইন</span>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 sm:hidden" />
            </>
          )}
        </button>

        {/* Language Switch */}
        <button
          onClick={() => updateSettings({ language: settings.language === 'en' ? 'bn' : 'en' })}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer shadow-2xs"
          title="Switch Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{settings.language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>


        {/* Header Pin / Auto-Hide Mode Toggle */}
        {onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer shadow-2xs font-bold ${
              isPinned
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isPinned ? "হেডার স্থায়ী/পিন করা আছে (বাটনে চাপলে অটো-হাইড হবে)" : "হেডার অটো-হাইড মোড (বাটনে চাপলে স্থায়ী পিন হবে)"}
          >
            {isPinned ? (
              <>
                <Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 rotate-45" />
                <span className="hidden xl:inline text-[11px]">পিন করা</span>
              </>
            ) : (
              <>
                <PinOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline text-[11px]">অটো-হাইড</span>
              </>
            )}
          </button>
        )}

        {/* Dark/Light Mode Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs font-extrabold ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50 shadow-amber-500/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-slate-900/5'
          }`}
          title={theme === 'dark' ? "লাইট মোডে ফিরুন (Switch to Light Mode)" : "ডার্ক মোড সক্রিয় করুন (Switch to Dark Mode)"}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
          <span className="hidden sm:inline font-black">{theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
        </button>

        {/* Check for Software Updates */}
        {onCheckForUpdates && (
          <button
            type="button"
            onClick={onCheckForUpdates}
            disabled={isCheckingUpdates}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-bold transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="গিটহাব থেকে নতুন ভার্সন ও আপডেট চেক করুন (Check for Updates)"
          >
            <Download className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-bounce text-cyan-500' : 'text-cyan-600 dark:text-cyan-400'}`} />
            <span className="hidden xl:inline">{isCheckingUpdates ? 'চেক হচ্ছে...' : 'আপডেট'}</span>
          </button>
        )}

        {/* Font Size Scaler */}
        <div className="hidden md:flex items-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-[11px] font-black text-slate-600 dark:text-slate-300 shadow-2xs">
          <button
            type="button"
            onClick={() => setFontSize('small')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'small' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="ছোট ফন্ট (14px)"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize('normal')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="স্ট্যান্ডার্ড স্পষ্ট ফন্ট (15.5px)"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="বড় ফন্ট (17.5px)"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontSize('xlarge')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="অতিরিক্ত বড় ফন্ট (19px)"
          >
            A++
          </button>
        </div>
      </div>
    </header>

      {/* Network & Cloud Sync Diagnostic Modal (Windows Sub-Window) */}
      <WindowsModalFrame
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onSkip={() => setShowNetworkModal(false)}
        modalId="modal-network-status"
        title="নেটওয়ার্ক ও ক্লাউড ডেটা সিঙ্ক ডায়াগনস্টিক"
        subtitle="TeleCorp ERP অফলাইন-অনলাইন হাইব্রিড ইঞ্জিন"
        icon={isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
        maxWidth="max-w-3xl"
      >
        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 text-xs flex-1 min-h-0 overflow-y-auto overscroll-contain select-text">
          {/* Main Status Hero Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isOnline
              ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-emerald-200/90 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100 shadow-xs'
              : 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-amber-200/90 dark:border-amber-800/80 text-amber-950 dark:text-amber-100 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="relative flex h-4 w-4 shrink-0 mt-0.5 sm:mt-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-4 w-4 ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </span>
                <div className="min-w-0">
                  <div className="font-black text-sm sm:text-base tracking-tight truncate flex items-center gap-2">
                    <span>{isOnline ? 'ডিভাইস বর্তমানে অনলাইন (Online Active)' : 'ডিভাইস বর্তমানে অফলাইন (Offline Mode)'}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs opacity-85 mt-0.5 leading-snug">
                    {isOnline
                      ? 'ইন্টারনেট এবং ক্লাউড ডেটাবেস সক্রিয় রয়েছে। সমস্ত ডেটা রিয়েল-টাইমে ক্লাউডে সিঙ্ক হচ্ছে।'
                      : 'ইন্টারনেট বিচ্ছিন্ন থাকলেও কোনো সমস্যা নেই! লোকাল ক্যাশে সফটওয়্যার সম্পূর্ণ সচল রয়েছে।'}
                  </p>
                </div>
              </div>

              <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                isOnline
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
              }`}>
                {isOnline ? '● ক্লাউড কানেক্টেড' : '○ লোকাল মোড'}
              </span>
            </div>
          </div>

          {/* 2-Column Responsive Grid for Diagnostics and Queue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Left Card: Supabase Cloud Ping Diagnostic */}
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                      ক্লাউড কানেকশন টেস্ট
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-mono">
                    Supabase DB
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  সরাসরি সেন্ট্রাল ক্লাউড সার্ভারের সাথে লেটেন্সি ও সংযোগ পরীক্ষা করতে পিং টেস্ট রান করুন।
                </p>

                {pingResult && (
                  <div className={`p-3 rounded-xl border text-[11px] font-medium mt-3 flex items-start gap-2.5 transition-all animate-in fade-in ${
                    pingResult.success
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                  }`}>
                    {pingResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold leading-snug">{pingResult.message}</div>
                      {pingResult.latencyMs && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-1 font-black flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          <span>রেসপন্স টাইম: {pingResult.latencyMs} ms (চমৎকার)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testingPing}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                  <span>{testingPing ? 'কানেকশন টেস্ট হচ্ছে...' : 'এখনই পিং টেস্ট করুন'}</span>
                </button>
              </div>
            </div>

            {/* Right Card: Offline Sync Engine & Queue */}
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                      অফলাইন সিঙ্ক কিউ (Sync Queue)
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    pendingSyncCount > 0
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {pendingSyncCount > 0 ? `${pendingSyncCount}টি বাকি` : 'সব সিঙ্কড'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {pendingSyncCount > 0
                    ? 'অফলাইনে করা ডাটা এন্ট্রিগুলো ব্রাউজারে সুরক্ষিত আছে। ইন্টারনেট সচল হলে ক্লাউডে অটো-আপলোড হবে।'
                    : 'কোনো পেন্ডিং রেকর্ড নেই। লোকাল ডেটা ও ক্লাউড ডেটাবেস ১০০% সমন্বিত আছে।'}
                </p>

                {/* Queue Items List Preview */}
                {pendingSyncCount > 0 && (
                  <div className="mt-2.5 max-h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-[11px]">
                    {syncQueue.slice(0, 5).map((q) => (
                      <div key={q.id} className="flex items-center justify-between py-1 px-1.5 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
                        <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[240px]">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            q.action === 'INSERT' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' :
                            q.action === 'DELETE' ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300' :
                            'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                          }`}>
                            {q.action}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{q.description}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          {q.timestamp.split('T')[1]?.substring(0, 5) || 'Now'}
                        </span>
                      </div>
                    ))}
                    {pendingSyncCount > 5 && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-1 font-bold">
                        + আরও {pendingSyncCount - 5}টি রেকর্ড রয়েছে...
                      </div>
                    )}
                  </div>
                )}

                {manualSyncMsg && (
                  <div className="mt-2.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-[11px] font-bold animate-in fade-in">
                    {manualSyncMsg}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing || (!isOnline && pendingSyncCount > 0)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই ক্লাউডে সিঙ্ক করুন'}</span>
                </button>

                {pendingSyncCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি নিশ্চিত যে অফলাইন সিঙ্ক কিউ-এর সমস্ত পেন্ডিং রেকর্ড মুছে ফেলতে চান?')) {
                        clearOfflineSyncQueue();
                        setManualSyncMsg('অফলাইন সিঙ্ক কিউ সফলভাবে খালি করা হয়েছে।');
                      }
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-xs transition cursor-pointer"
                    title="পেন্ডিং কিউ মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">মুছুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Architecture Features Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">অফলাইন পারসিস্টেন্স</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  ইনভয়েস, ক্রয় ও বিক্রয় ব্রাউজারের লোকাল স্টোরেজে স্বয়ংক্রিয়ভাবে সেভ হয়।
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">PWA ক্যাশ অপ্টিমাইজড</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  সার্ভিস ওয়ার্কার ক্যাশের কারণে ইন্টারনেট স্পিড স্লো হলেও সিস্টেম ল্যাগ করে না।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Always Visible & Responsive */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowNetworkModal(false);
              onSelectView('settings');
            }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>ক্লাউড ডাটাবেজ সেটিংস</span>
            <span>&rarr;</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNetworkModal(false)}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-xl hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer shadow-xs active:scale-95"
          >
            ঠিক আছে
          </button>
        </div>
      </WindowsModalFrame>
    </>
  );
};
