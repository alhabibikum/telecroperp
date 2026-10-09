import React, { useState, useRef, useEffect } from 'react';
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
  Download,
  Play,
  Layers,
  FolderTree,
  Terminal,
  Code2,
  Maximize2,
  SplitSquareVertical,
  HelpCircle,
  Sliders,
  Settings as SettingsIcon,
  ShoppingBag,
  Package,
  FileText,
  DollarSign,
  Shield,
  Box,
  Truck
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
  isPinned = true,
  onTogglePin,
  onCheckForUpdates,
  isCheckingUpdates = false
}) => {
  const {
    currentUserRole,
    currentUser,
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
    clearOfflineSyncQueue,
    logout
  } = useERP();
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme();

  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await testSupabaseConnection();
      setPingResult(res);
    } catch (e: any) {
      setPingResult({ success: false, message: e.message || 'পিং সংযোগ ব্যর্থ হয়েছে।' });
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

  // Operational notification counts
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

  const handleMenuItemClick = (callback?: () => void) => {
    setActiveMenuDropdown(null);
    if (callback) callback();
  };

  return (
    <>
      {/* Top Hover Hotzone when Header is in Auto-Hide mode */}
      {!isPinned && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          className="fixed top-0 left-0 right-0 h-3 z-40 group cursor-pointer"
          title="মাউস আনলে হেডার প্রদর্শিত হবে"
        >
          <div
            onClick={() => setIsHovered(true)}
            className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-300 z-40 ${
              isHovered ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="bg-[#2d2d30] text-white px-3 py-0.5 text-[10px] font-bold shadow-md flex items-center gap-1.5 border border-[#3f3f46] select-none">
              <ChevronDown className="w-3 h-3 text-[#007acc] group-hover:text-white" />
              <span>Visual Studio Command Bar (Hover)</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Visual Studio Header & Command Suite */}
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsHovered(false);
        }}
        className={`bg-[#2d2d30] text-[#cccccc] dark:bg-[#2d2d30] dark:text-[#cccccc] border-b border-[#3f3f46] select-none transition-all duration-200 ${
          isPinned
            ? 'sticky top-0 z-30 shadow-sm'
            : `fixed top-0 left-0 right-0 z-50 shadow-2xl ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
              }`
        }`}
      >
        {/* Tier 1: Visual Studio Titlebar & Quick Launch */}
        <div className="h-8 bg-[#1f1f24] text-[#cccccc] px-2 flex items-center justify-between border-b border-[#333337] text-[11.5px]">
          {/* App Brand & Solution Name */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#007acc] rounded-xs flex items-center justify-center text-white font-bold text-[9px] shadow-xs">
              VS
            </div>
            <span className="font-semibold text-white tracking-wide">
              TeleCorp Enterprise ERP 2026
            </span>
            <span className="text-[#858585] hidden md:inline">
              - [Solution 'MobileDistribution.sln' : 38 Modules]
            </span>
            <span className="text-[#858585] hidden xl:inline">
              ({currentUser?.name || 'Administrator'} • {currentUserRole})
            </span>
          </div>

          {/* Quick Search / Command Palette Search Box */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full h-6 px-2.5 bg-[#2d2d30] hover:bg-[#38383c] border border-[#3f3f46] text-[#9cdcfe] hover:text-white flex items-center justify-between text-xs transition cursor-pointer"
              title="Search Solution, Commands, Menus & Windows (Ctrl+Q / Ctrl+K)"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3 text-[#858585]" />
                <span className="text-[11px] text-[#858585]">Search Solution & Commands (Ctrl+Q, Ctrl+K)...</span>
              </div>
              <span className="text-[10px] text-[#858585] font-mono">Ctrl+K</span>
            </button>
          </div>

          {/* Right Controls: Connectivity, Dark/Light, Updates, Pin */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Supabase Status Pill */}
            <button
              type="button"
              onClick={() => setShowNetworkModal(true)}
              className={`h-5.5 px-2 flex items-center gap-1.5 text-[10.5px] font-semibold border rounded-xs transition cursor-pointer ${
                isSyncing
                  ? 'bg-[#007acc]/20 text-[#9cdcfe] border-[#007acc]'
                  : isOnline
                  ? 'bg-[#107c41]/20 text-[#4ec9b0] border-[#107c41]'
                  : 'bg-[#d83b01]/20 text-[#ce9178] border-[#d83b01]'
              }`}
              title="Database Status & Diagnostics"
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#9cdcfe]" />
              ) : isOnline ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-pulse" />
              ) : (
                <WifiOff className="w-3 h-3 text-[#ce9178]" />
              )}
              <span className="font-mono">{isOnline ? 'LIVE DB' : 'OFFLINE'}</span>
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => updateSettings({ language: settings.language === 'en' ? 'bn' : 'en' })}
              className="h-5.5 px-1.5 bg-[#252526] hover:bg-[#38383c] border border-[#3f3f46] text-[10.5px] font-semibold text-[#cccccc] hover:text-white rounded-xs transition cursor-pointer"
              title="Toggle Language"
            >
              {settings.language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Dark/Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-5.5 px-2 bg-[#252526] hover:bg-[#38383c] border border-[#3f3f46] text-[10.5px] font-semibold text-[#cccccc] hover:text-white rounded-xs flex items-center gap-1 transition cursor-pointer"
              title="Toggle Visual Studio Theme"
            >
              {theme === 'dark' ? <Sun className="w-3 h-3 text-[#f59e0b]" /> : <Moon className="w-3 h-3 text-[#007acc]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Header Pin Toggle */}
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className={`h-5.5 w-6 flex items-center justify-center border rounded-xs transition cursor-pointer ${
                  isPinned ? 'bg-[#007acc]/20 text-[#007acc] border-[#007acc]' : 'bg-[#252526] text-[#858585] border-[#3f3f46] hover:text-white'
                }`}
                title={isPinned ? 'Unpin Menu Bar' : 'Pin Menu Bar'}
              >
                {isPinned ? <Pin className="w-3 h-3 rotate-45" /> : <PinOff className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Visual Studio Classic Menu Bar */}
        <div ref={menuRef} className="h-7 bg-[#2d2d30] px-2 flex items-center gap-1 border-b border-[#333337] text-[12px] relative z-40">
          {/* Solution Explorer Toggle */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1 hover:bg-[#38383c] text-[#cccccc] hover:text-white rounded-xs transition cursor-pointer mr-1"
              title="Toggle Solution Explorer (Ctrl+[)"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Menu Items */}
          {[
            {
              id: 'file',
              title: 'File',
              items: [
                { label: 'New Wholesale Sale...', hotkey: 'Ctrl+N', action: onOpenNewSale, icon: PlusCircle },
                { label: 'New Purchase Inward...', hotkey: 'Ctrl+P', action: onOpenNewPurchase, icon: Smartphone },
                { label: 'Collect Customer Due...', hotkey: 'Ctrl+D', action: onOpenDueCollection, icon: CreditCard },
                { separator: true },
                { label: 'Save Changes & Sync', hotkey: 'Ctrl+S', action: () => triggerManualSync() },
                { separator: true },
                { label: 'Log Out / Switch User', action: () => logout() }
              ]
            },
            {
              id: 'edit',
              title: 'Edit',
              items: [
                { label: 'Command Palette...', hotkey: 'Ctrl+K', action: onOpenCommandPalette, icon: Search },
                { label: 'Multi-Barcode Scanner...', hotkey: 'Ctrl+B', action: onOpenMultiScanner, icon: Smartphone },
                { label: 'Find / Trace IMEI...', hotkey: 'Ctrl+F', action: () => onOpenIMEILookup(), icon: Search },
                { separator: true },
                { label: 'Clear Local Sync Cache', action: () => clearOfflineSyncQueue() }
              ]
            },
            {
              id: 'view',
              title: 'View',
              items: [
                { label: 'Solution Explorer / Modules', hotkey: 'Ctrl+[', action: onToggleSidebar, icon: FolderTree },
                { label: 'Main Dashboard', action: () => onSelectView('dashboard') },
                { separator: true },
                { label: 'Font Size: Small (14px)', action: () => setFontSize('small') },
                { label: 'Font Size: Normal (15.5px)', action: () => setFontSize('normal') },
                { label: 'Font Size: Large (17.5px)', action: () => setFontSize('large') },
                { separator: true },
                { label: 'Toggle Light/Dark Theme', action: toggleTheme }
              ]
            },
            {
              id: 'sales',
              title: 'Sales',
              items: [
                { label: 'Dashboard Overview', action: () => onSelectView('dashboard') },
                { label: 'Wholesale Sales (B2B)', action: () => onSelectView('wholesale-sales') },
                { label: 'Retail POS Counter', action: () => onSelectView('retail-pos') },
                { label: 'Phone Exchange & Trade-in', action: () => onSelectView('phone-exchange') },
                { label: 'EMI / Installment Plans', action: () => onSelectView('emi-installment') },
                { label: 'Due Ageing Analysis', action: () => onSelectView('due-ageing') },
                { label: 'Due Collection Ledger', action: () => onSelectView('due-collection') },
                { label: 'Delivery & Courier Dispatch', action: () => onSelectView('delivery-dispatch') }
              ]
            },
            {
              id: 'inventory',
              title: 'Inventory',
              items: [
                { label: 'Live Stock & Products', action: () => onSelectView('inventory') },
                { label: 'Supplier Purchases', action: () => onSelectView('purchases') },
                { label: 'IMEI Lifecycle Trace', action: () => onSelectView('imei-trace') },
                { label: 'Barcode Thermal Labels', action: () => onSelectView('barcode-labels') },
                { label: 'Warehouses & Godowns', action: () => onSelectView('warehouses') },
                { label: 'Stock Transfers', action: () => onSelectView('stock-transfers') },
                { label: 'Brands & Master Directory', action: () => onSelectView('brands') },
                { label: 'Brand Incentives & Rebates', action: () => onSelectView('brand-incentives') },
                { label: 'Price Drop Claims', action: () => onSelectView('price-drop') }
              ]
            },
            {
              id: 'accounting',
              title: 'Accounting',
              items: [
                { label: 'Cash & Bank Books', action: () => onSelectView('cash-bank') },
                { label: 'Daily Office Expenses', action: () => onSelectView('expenses') },
                { label: 'Day Closing & Cash Drawer', action: () => onSelectView('day-closing') },
                { label: 'General Ledger & Accounts', action: () => onSelectView('accounting') },
                { label: 'Bank Statement Reconciliation', action: () => onSelectView('bank-reconciliation') }
              ]
            },
            {
              id: 'tools',
              title: 'Tools',
              items: [
                { label: 'Multi-Barcode Scanner...', hotkey: 'Ctrl+B', action: onOpenMultiScanner },
                { label: 'Data Import (Excel/CSV)', action: () => onSelectView('data-import') },
                { label: 'SMS Marketing Gateway', action: () => onSelectView('sms-marketing') },
                { label: 'API & Webhook Integrations', action: () => onSelectView('api-integrations') },
                { label: 'Audit Security Logs', action: () => onSelectView('audit-logs') },
                { label: 'System Configuration', action: () => onSelectView('settings') }
              ]
            },
            {
              id: 'help',
              title: 'Help',
              items: [
                { label: 'Keyboard Shortcuts Help...', hotkey: 'F1', action: onOpenShortcutsHelp, icon: Keyboard },
                { label: 'Check for Software Updates...', action: onCheckForUpdates, icon: Download },
                { label: 'Database Ping Diagnostics...', action: () => setShowNetworkModal(true), icon: Database }
              ]
            }
          ].map(menu => (
            <div key={menu.id} className="relative">
              <button
                type="button"
                onClick={() => setActiveMenuDropdown(activeMenuDropdown === menu.id ? null : menu.id)}
                className={`px-2 py-0.5 rounded-xs transition cursor-pointer ${
                  activeMenuDropdown === menu.id
                    ? 'bg-[#007acc] text-white font-semibold'
                    : 'hover:bg-[#38383c] text-[#cccccc] hover:text-white'
                }`}
              >
                {menu.title}
              </button>

              {/* Dropdown Menu */}
              {activeMenuDropdown === menu.id && (
                <div className="absolute top-full left-0 mt-0.5 w-64 bg-[#252526] border border-[#3f3f46] shadow-2xl py-1 z-50 text-[11.5px] text-[#cccccc]">
                  {menu.items.map((item: any, idx: number) => {
                    if (item.separator) {
                      return <div key={idx} className="my-1 border-t border-[#333337]" />;
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleMenuItemClick(item.action)}
                        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white transition cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <item.icon className="w-3.5 h-3.5 opacity-80" />}
                          <span>{item.label}</span>
                        </span>
                        {item.hotkey && (
                          <span className="text-[10px] text-[#858585] font-mono group-hover:text-white">
                            {item.hotkey}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tier 3: Visual Studio Standard Command Toolbar */}
        <div className="h-9 bg-[#252526] px-2 flex items-center justify-between border-b border-[#333337] text-[11.5px] overflow-x-auto">
          {/* Left: Debug Run Button + Fast Command Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Visual Studio Green "Start" Run Button */}
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="h-6.5 px-2.5 bg-[#107c41] hover:bg-[#0e6d38] text-white font-bold flex items-center gap-1.5 rounded-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Sync & Verify Live Solution with Supabase Server (F5)"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>TeleCorp.Live</span>
            </button>

            <div className="h-4 w-px bg-[#3f3f46] mx-1" />

            {/* Quick Action Buttons */}
            {(hasPermission(currentUserRole, 'wholesale-sales') || hasPermission(currentUserRole, 'retail-pos')) && (
              <button
                type="button"
                onClick={onOpenNewSale}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] hover:border-[#007acc] text-[#cccccc] hover:text-white border border-[#3f3f46] rounded-xs flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Create Wholesale Sale Invoice (Ctrl+N)"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#007acc]" />
                <span>+ Sale</span>
              </button>
            )}

            {hasPermission(currentUserRole, 'purchases') && (
              <button
                type="button"
                onClick={onOpenNewPurchase}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] hover:border-[#007acc] text-[#cccccc] hover:text-white border border-[#3f3f46] rounded-xs flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Supplier Purchase & Stock Inward (Ctrl+P)"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#4ec9b0]" />
                <span>+ Purchase</span>
              </button>
            )}

            {hasPermission(currentUserRole, 'due-collection') && (
              <button
                type="button"
                onClick={onOpenDueCollection}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] hover:border-[#007acc] text-[#cccccc] hover:text-white border border-[#3f3f46] rounded-xs flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Collect Customer Due (Ctrl+D)"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#d83b01]" />
                <span>Collect Due</span>
              </button>
            )}

            {hasPermission(currentUserRole, 'imei-trace') && (
              <button
                type="button"
                onClick={() => onOpenIMEILookup()}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] hover:border-[#007acc] text-[#cccccc] hover:text-white border border-[#3f3f46] rounded-xs flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Track IMEI Lifecycle"
              >
                <Search className="w-3.5 h-3.5 text-[#9cdcfe]" />
                <span>IMEI Trace</span>
              </button>
            )}

            {onOpenMultiScanner && (
              <button
                type="button"
                onClick={() => onOpenMultiScanner()}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] hover:border-[#007acc] text-[#cccccc] hover:text-white border border-[#3f3f46] rounded-xs flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Multi Barcode Scanner (Ctrl+B)"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#c586c0]" />
                <span className="hidden xl:inline">Scanner</span>
              </button>
            )}

            <div className="h-4 w-px bg-[#3f3f46] mx-1" />

            {/* Rebuild / Refresh Button */}
            <button
              type="button"
              onClick={handleTriggerSync}
              className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] border border-[#3f3f46] text-[#cccccc] hover:text-white rounded-xs flex items-center gap-1 font-semibold transition cursor-pointer"
              title="Refresh and sync data (F5)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#007acc] ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">Sync (F5)</span>
            </button>
          </div>

          {/* Right: Notification Alerts Badge & Diagnostic Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync Feedback Message */}
            {manualSyncMsg && (
              <span className="text-[11px] text-[#4ec9b0] font-mono animate-in fade-in">
                {manualSyncMsg}
              </span>
            )}

            {/* Alerts Center Notification Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                className={`h-6.5 px-2.5 flex items-center gap-1.5 rounded-xs border text-xs font-semibold transition cursor-pointer ${
                  totalRealNotifications > 0
                    ? 'bg-[#d83b01]/20 border-[#d83b01] text-[#f48771]'
                    : 'bg-[#2d2d30] border-[#3f3f46] text-[#858585] hover:text-white'
                }`}
                title="Notifications & System Alerts"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{totalRealNotifications} Alerts</span>
              </button>

              <Notifications
                isOpen={showAlertDropdown}
                onClose={() => setShowAlertDropdown(false)}
                onSelectView={onSelectView}
                onOpenNewPurchase={onOpenNewPurchase}
              />
            </div>

            {/* Check for Updates Button */}
            {onCheckForUpdates && (
              <button
                type="button"
                onClick={onCheckForUpdates}
                disabled={isCheckingUpdates}
                className="h-6.5 px-2 bg-[#2d2d30] hover:bg-[#38383c] border border-[#3f3f46] text-[11px] text-[#9cdcfe] hover:text-white rounded-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                title="Check for Software Updates"
              >
                <Download className={`w-3 h-3 ${isCheckingUpdates ? 'animate-bounce text-[#007acc]' : ''}`} />
                <span className="hidden xl:inline">{isCheckingUpdates ? 'Checking...' : 'Updates'}</span>
              </button>
            )}

            {/* Shortcuts Help */}
            {onOpenShortcutsHelp && (
              <button
                type="button"
                onClick={onOpenShortcutsHelp}
                className="h-6.5 w-6.5 flex items-center justify-center bg-[#2d2d30] hover:bg-[#38383c] border border-[#3f3f46] text-[#cccccc] hover:text-white rounded-xs transition cursor-pointer"
                title="Keyboard Shortcuts (F1)"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Network & Cloud Sync Diagnostic Modal */}
      <WindowsModalFrame
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onSkip={() => setShowNetworkModal(false)}
        modalId="modal-network-status"
        title="Network & Cloud Synchronization Diagnostics"
        subtitle="TeleCorp Enterprise Hybrid Engine"
        icon={isOnline ? <Wifi className="w-4 h-4 text-[#4ec9b0]" /> : <WifiOff className="w-4 h-4 text-[#ce9178]" />}
        maxWidth="max-w-2xl"
      >
        <div className="p-4 space-y-3 text-xs bg-[#1e1e1e] text-[#d4d4d4] select-text">
          {/* Diagnostic Status Box */}
          <div className="p-3 bg-[#252526] border border-[#3f3f46] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-[#4ec9b0]' : 'bg-[#ce9178]'}`} />
              <div>
                <div className="font-bold text-white">
                  {isOnline ? 'Cloud Server Connected (Online Active)' : 'Local Offline Mode Active'}
                </div>
                <div className="text-[11px] text-[#858585]">
                  {isOnline ? 'Real-time two-way synchronization active with Supabase DB' : 'Operating safely on local IndexedDB cache'}
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${isOnline ? 'border-[#107c41] text-[#4ec9b0]' : 'border-[#d83b01] text-[#ce9178]'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Cloud Ping Diagnostic */}
          <div className="p-3 bg-[#252526] border border-[#3f3f46] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#333337]">
              <span className="font-bold text-[#9cdcfe]">Supabase Cloud Ping Diagnostic</span>
              <span className="text-[10px] font-mono text-[#858585]">Port 443 HTTPS</span>
            </div>
            <p className="text-[11px] text-[#858585]">
              Verify direct socket connection & round-trip latency to PostgreSQL backend.
            </p>
            {pingResult && (
              <div className={`p-2 border text-[11px] font-mono ${pingResult.success ? 'bg-[#107c41]/20 border-[#107c41] text-[#4ec9b0]' : 'bg-[#a80000]/20 border-[#a80000] text-[#f14c4c]'}`}>
                {pingResult.message} {pingResult.latencyMs && `(${pingResult.latencyMs}ms)`}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testingPing}
                className="vs-btn vs-btn-primary"
              >
                {testingPing ? 'Testing Socket...' : 'Run Socket Ping Test'}
              </button>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="vs-btn"
              >
                {isSyncing ? 'Syncing...' : 'Force Sync (F5)'}
              </button>
            </div>
          </div>
        </div>
      </WindowsModalFrame>
    </>
  );
};
