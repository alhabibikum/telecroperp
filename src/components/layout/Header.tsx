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
  X,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Trash2,
  Keyboard,
  Sun,
  Moon
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
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenDueCollection,
  onOpenIMEILookup,
  onOpenShortcutsHelp,
  onSelectView
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

  return (
    <header className="h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none transition-colors duration-200">
      {/* Left: Brand info */}
      <div
        className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 select-none"
        onClick={() => onSelectView('dashboard')}
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(20,184,166,0.3)] font-black text-lg sm:text-xl shrink-0 transition-transform hover:scale-105 active:scale-95">
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h9a7 7 0 0 1 7 7 7 7 0 0 1-7 7H9v2H4V4zm5 10h4a3 3 0 0 0 3-3 3 3 0 0 0-3-3H9v6z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center">
            <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base md:text-lg uppercase whitespace-nowrap">
              DEALERFLOW <span className="text-teal-600 font-black">ERP</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block truncate">
            Multi-Brand Smartphone & Dealer Distribution
          </p>
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

          {onOpenShortcutsHelp && (
            <button
              onClick={onOpenShortcutsHelp}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
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
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition"
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
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
              : pendingSyncCount > 0
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 animate-pulse'
                : isOnline
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
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
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
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
              <Wifi className="w-3.5 h-3.5 text-emerald-600 sm:hidden" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>অফলাইন</span>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 sm:hidden" />
            </>
          )}
        </button>

        {/* Language Switch */}
        <button
          onClick={() => updateSettings({ language: settings.language === 'en' ? 'bn' : 'en' })}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer shadow-2xs"
          title="Switch Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{settings.language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>


        {/* Dark/Light Mode Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer shadow-2xs"
          title={theme === 'dark' ? "লাইট মোডে ফিরুন (Switch to Light Mode)" : "ডার্ক মোড সক্রিয় করুন (Switch to Dark Mode)"}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
          <span className="hidden sm:inline">{theme === 'dark' ? 'লাইট' : 'ডার্ক'}</span>
        </button>

        {/* Font Size Scaler */}
        <div className="hidden md:flex items-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-[11px] font-black text-slate-600 dark:text-slate-300 shadow-2xs">
          <button
            type="button"
            onClick={() => setFontSize('small')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'small' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="ছোট ফন্ট (15px)"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize('normal')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="স্ট্যান্ডার্ড স্পষ্ট ফন্ট (17px)"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="বড় ফন্ট (19px)"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontSize('xlarge')}
            className={`px-1.5 py-0.5 rounded-lg transition cursor-pointer ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            title="অতিরিক্ত বড় ফন্ট (21.5px)"
          >
            A++
          </button>
        </div>

      </div>

      {/* Network & Cloud Sync Diagnostic Modal (Windows Sub-Window) */}
      <WindowsModalFrame
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onSkip={() => setShowNetworkModal(false)}
        modalId="modal-network-status"
        title="নেটওয়ার্ক ও ডেটা সিঙ্ক স্ট্যাটাস"
        subtitle="TeleCorp ERP অফলাইন ও অনলাইন হাইব্রিড ডায়াগনস্টিক"
        icon={isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
        maxWidth="max-w-xl"
      >

            {/* Modal Body - Scrollable & Responsive */}
            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs flex-1 overflow-y-auto overscroll-contain">
              {/* Status Indicator Card */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isOnline
                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <div className="min-w-0">
                    <div className="font-black text-xs sm:text-sm truncate">
                      {isOnline ? 'ডিভাইস বর্তমানে অনলাইন (Online)' : 'ডিভাইস বর্তমানে অফলাইন (Offline)'}
                    </div>
                    <div className="text-[10px] sm:text-[11px] opacity-80 mt-0.5 leading-snug">
                      {isOnline
                        ? 'ইন্টারনেট সক্রিয়। ক্লাউড ডেটাবেস এবং সার্ভিস সচল।'
                        : 'ইন্টারনেট সংযোগ বিচ্ছিন্ন। সফটওয়্যারটি লোকাল ক্যাশে সম্পূর্ণ সচল রয়েছে।'}
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  isOnline ? 'bg-emerald-200/70 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {isOnline ? 'Connected' : 'Local Only'}
                </span>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-0.5">
                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>লোকাল পারসিস্টেন্স</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
                    ব্রাউজার স্টোরেজে সমস্ত ইনভয়েস, স্টক, আইএমইআই ও কালেকশন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>PWA অফলাইন সাপোর্ট</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
                    সার্ভিস ওয়ার্কার ক্যাশের কারণে ইন্টারনেট ছাড়াও অ্যাপ চালু হয় এবং দ্রুত রেসপন্স করে।
                  </p>
                </div>
              </div>

              {/* Offline Sync Queue Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                      অফলাইন সিঙ্ক কিউ (Sync Queue)
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    pendingSyncCount > 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pendingSyncCount > 0 ? `${pendingSyncCount}টি পেন্ডিং` : 'সব সিঙ্কড'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {pendingSyncCount > 0
                    ? 'অফলাইনে করা পরিবর্তনগুলো ব্রাউজার কিউতে জমা রয়েছে। ইন্টারনেট ফিরলে এগুলো স্বয়ংক্রিয়ভাবে ক্লাউডে আপলোড হবে।'
                    : 'বর্তমানে কোনো পেন্ডিং অফলাইন পরিবর্তন নেই। সকল নতুন তথ্য, এডিট ও ডিলিট ক্লাউডে আপডেট করা আছে।'}
                </p>

                {/* Queue Items List Preview */}
                {pendingSyncCount > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                    {syncQueue.slice(0, 6).map((q) => (
                      <div key={q.id} className="flex items-center justify-between py-1 px-1.5 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-1.5 truncate max-w-[260px] sm:max-w-[280px]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            q.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                            q.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {q.action}
                          </span>
                          <span className="text-slate-800 font-medium truncate">{q.description}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          {q.timestamp.split('T')[1]?.substring(0, 5) || 'Now'}
                        </span>
                      </div>
                    ))}
                    {pendingSyncCount > 6 && (
                      <div className="text-[10px] text-slate-400 text-center pt-1 font-semibold">
                        + আরও {pendingSyncCount - 6}টি পরিবর্তন কিউতে আছে...
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Sync Trigger Button & Clear Queue */}
                <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleTriggerSync}
                      disabled={isSyncing || (!isOnline && pendingSyncCount > 0)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs shadow-xs transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'ক্লাউডে সিঙ্ক হচ্ছে...' : 'এখনই ক্লাউডে সিঙ্ক করুন'}</span>
                    </button>

                    {pendingSyncCount > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('আপনি কি নিশ্চিত যে অফলাইন সিঙ্ক কিউ-এর সমস্ত পেন্ডিং রেকর্ড মুছে ফেলতে চান?')) {
                            clearOfflineSyncQueue();
                            setManualSyncMsg('অফলাইন সিঙ্ক কিউ সফলভাবে খালি করা হয়েছে।');
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer"
                        title="পেন্ডিং কিউ মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>কিউ মুছুন</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    অটো-সিঙ্ক: সক্রিয়
                  </span>
                </div>

                {manualSyncMsg && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-medium animate-in fade-in">
                    {manualSyncMsg}
                  </div>
                )}
              </div>

              {/* Supabase Ping Test */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 text-xs">
                    ক্লাউড সংযোগ পরীক্ষা (Supabase Ping):
                  </span>
                  <button
                    onClick={handleTestPing}
                    disabled={testingPing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                    <span>{testingPing ? 'চেক হচ্ছে...' : 'পিং টেস্ট করুন'}</span>
                  </button>
                </div>

                {pingResult && (
                  <div className={`p-3 rounded-xl border text-[11px] font-medium mt-2 flex items-start gap-2 ${
                    pingResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {pingResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div>{pingResult.message}</div>
                      {pingResult.latencyMs && (
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold">
                          রেসপন্স টাইম: {pingResult.latencyMs} ms
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setShowNetworkModal(false);
                  onSelectView('settings');
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                ক্লাউড ডাটাবেজ সেটিংস দেখুন &rarr;
              </button>
              <button
                onClick={() => setShowNetworkModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                ঠিক আছে
              </button>
            </div>
      </WindowsModalFrame>
    </header>
  );
};
