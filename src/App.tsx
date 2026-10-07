import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { IMEITraceView } from './components/views/IMEITraceView';
import { WholesaleSalesView } from './components/views/WholesaleSalesView';
import { RetailPOSView } from './components/views/RetailPOSView';
import { PhoneExchangeView } from './components/views/PhoneExchangeView';
import { DueAgeingView } from './components/views/DueAgeingView';
import { PurchaseView } from './components/views/PurchaseView';
import { InventoryView } from './components/views/InventoryView';
import { BarcodeLabelView } from './components/views/BarcodeLabelView';
import { BrandsView } from './components/views/BrandsView';
import { WarehousesView } from './components/views/WarehousesView';
import { StockTransfersView } from './components/views/StockTransfersView';
import { BrandIncentivesView } from './components/views/BrandIncentivesView';
import { CustomersView } from './components/views/CustomersView';
import { SuppliersView } from './components/views/SuppliersView';
import { ReturnsView } from './components/views/ReturnsView';
import { WarrantyServiceView } from './components/views/WarrantyServiceView';
import { SalesmenView } from './components/views/SalesmenView';
import { SalesmanMobileAppView } from './components/views/SalesmanMobileAppView';
import { FieldVisitsView } from './components/views/FieldVisitsView';
import { CashBankView } from './components/views/CashBankView';
import { BankReconciliationView } from './components/views/BankReconciliationView';
import { DayClosingView } from './components/views/DayClosingView';
import { ExpensesView } from './components/views/ExpensesView';
import { AccountingView } from './components/views/AccountingView';
import { AlertCenterView } from './components/views/AlertCenterView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { SettingsView } from './components/views/SettingsView';
import { ReportsView } from './components/views/ReportsView';
import { DynamicBusinessReportView } from './components/views/DynamicBusinessReportView';
import { CustomReportBuilderView } from './components/views/CustomReportBuilderView';
import { DataImportView } from './components/views/DataImportView';
import { DeliveryDispatchView } from './components/views/DeliveryDispatchView';
import { PriceDropClaimView } from './components/views/PriceDropClaimView';
import { SmsMarketingView } from './components/views/SmsMarketingView';
import { DueCollectionView } from './components/views/DueCollectionView';
import { EMIInstallmentView } from './components/views/EMIInstallmentView';
import { ApiIntegrationsView } from './components/views/ApiIntegrationsView';
import { LoginView } from './components/auth/LoginView';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';

import { IMEISearchModal } from './components/modals/IMEISearchModal';
import { NewSaleModal } from './components/modals/NewSaleModal';
import { NewPurchaseModal } from './components/modals/NewPurchaseModal';
import { NewProductModal } from './components/modals/NewProductModal';
import { DueCollectionModal } from './components/modals/DueCollectionModal';
import { CustomerReturnModal } from './components/modals/CustomerReturnModal';
import { StockTransferModal } from './components/modals/StockTransferModal';
import { InvoicePrintModal } from './components/modals/InvoicePrintModal';
import { MultiBarcodeScannerModal } from './components/common/MultiBarcodeScannerModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { KeyboardShortcutHelpModal } from './components/common/KeyboardShortcutHelpModal';
import { useToast } from './components/common/ToastNotificationSystem';
import { ShieldAlert, ArrowRight, ChevronRight } from 'lucide-react';
import { WindowManagerProvider, useWindowManager } from './context/WindowManagerContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { WindowsWindowFrame } from './components/common/WindowsWindowFrame';
import { WindowsTaskbar } from './components/layout/WindowsTaskbar';
import { DesktopView } from './components/views/DesktopView';

const VIEW_CONFIG: Record<string, { title: string; subtitle: string; icon: string }> = {
  'dashboard': { title: 'ড্যাশবোর্ড (Dashboard)', subtitle: 'ব্যবসার সার্বিক ওভারভিউ ও বিশ্লেষণ', icon: '📊' },
  'imei-trace': { title: 'আইএমইআই ট্রেস (IMEI Trace)', subtitle: 'ডিভাইস লাইফসাইকেল ট্র্যাকিং', icon: '🔍' },
  'wholesale-sales': { title: 'পাইকারি বিক্রয় (Wholesale Sales)', subtitle: 'B2B ডিলার ইনভয়েস ও মেমো', icon: '💼' },
  'retail-pos': { title: 'রিটেইল পিওএস (Retail POS)', subtitle: 'কাউন্টার ক্যাশ বিক্রয়', icon: '🛒' },
  'phone-exchange': { title: 'ফোন এক্সচেঞ্জ (Phone Exchange)', subtitle: 'হ্যান্ডসেট ট্রেড-ইন ও এক্সচেঞ্জ', icon: '🔄' },
  'emi-installment': { title: 'কিস্তি ও ইএমআই (EMI Installment)', subtitle: 'মাসিক কিস্তি শিডিউল ও আদায়', icon: '📅' },
  'delivery-dispatch': { title: 'ডেলিভারি ও কুরিয়ার (Delivery)', subtitle: 'কুরিয়ার চালান ও পার্সেল ট্র্যাকিং', icon: '🚚' },
  'sms-marketing': { title: 'এসএমএস মার্কেটিং (SMS Marketing)', subtitle: 'বাল্ক মেসেজ ও অ্যালার্ট গেটওয়ে', icon: '💬' },
  'due-ageing': { title: 'বকেয়া এইজিং রিপোর্ট (Due Ageing)', subtitle: 'বকেয়া বয়স বিশ্লেষণ ও রিকভারি', icon: '⏳' },
  'due-collection': { title: 'বকেয়া কালেকশন (Due Collection)', subtitle: 'ডিলার পেমেন্ট জমা ও রসিদ', icon: '💰' },
  'purchases': { title: 'পারচেজ ও চালান (Purchases)', subtitle: 'সাপ্লায়ার ক্রয় ও স্টক ইনওয়ার্ড', icon: '📥' },
  'inventory': { title: 'পণ্য ও ইনভেন্টরি (Inventory)', subtitle: 'আইএমইআই ও লাইভ স্টক লেজার', icon: '📦' },
  'barcode-labels': { title: 'বারকোড লেবেল প্রিন্টার (Barcode Labels)', subtitle: 'থার্মাল প্রিন্টিং ও কিউআর কোড', icon: '🏷️' },
  'brands': { title: 'ব্র্যান্ড ও ক্যাটাগরি (Brands)', subtitle: 'ব্র্যান্ড মাস্টার ডিরেক্টরি', icon: '🏷️' },
  'warehouses': { title: 'ওয়্যারহাউজ ও গোডাউন (Warehouses)', subtitle: 'মাল্টি-ব্রাঞ্চ শাখা নেটওয়ার্ক', icon: '🏢' },
  'stock-transfers': { title: 'স্টক ট্রান্সফার (Stock Transfers)', subtitle: 'ইন্টার-ওয়্যারহাউজ ট্রান্সফার চালান', icon: '🔁' },
  'brand-incentives': { title: 'ব্র্যান্ড ইনসেন্টিভ (Brand Incentives)', subtitle: 'কোম্পানি টার্গেট বোনাস ও রিবেট', icon: '🎁' },
  'price-drop': { title: 'প্রাইস ড্রপ ক্লেইম (Price Drop Claim)', subtitle: 'মূল্য হ্রাস ক্ষতিপূরণ ক্লেইম', icon: '📉' },
  'customers': { title: 'কাস্টমার ও ডিলার (Customers)', subtitle: 'ডিলার নেটওয়ার্ক প্রোফাইল', icon: '👥' },
  'suppliers': { title: 'সাপ্লায়ার তালিকা (Suppliers)', subtitle: 'ভেন্ডর ও ডিস্ট্রিবিউটর ডিরেক্টরি', icon: '🏭' },
  'returns': { title: 'রিটার্ন ব্যবস্থাপনা (Returns)', subtitle: 'কাস্টমার ও সাপ্লায়ার রিটার্ন ইঞ্জিন', icon: '↩️' },
  'warranty-service': { title: 'ওয়ারেন্টি সার্ভিস (Warranty & RMA)', subtitle: 'সার্ভিসিং জব ও রিপেয়ার ট্র্যাকিং', icon: '🛠️' },
  'salesmen': { title: 'সেলসম্যান ও ফিল্ড স্টাফ (Salesmen)', subtitle: 'মার্কেট অফিসার ও প্রতিনিধি তালিকা', icon: '👔' },
  'salesman-app': { title: 'মোবাইল সেলসম্যান পোর্টাল (Salesman App)', subtitle: 'ফিল্ড অর্ডার গ্রহণ ইন্টারফেস', icon: '📱' },
  'field-visits': { title: 'ফিল্ড ভিজিট ও রুট প্ল্যান (Field Visits)', subtitle: 'জিপিএস ট্র্যাকিং ও আউটলেট লগ', icon: '📍' },
  'cash-bank': { title: 'ক্যাশ ও ব্যাংক লেজার (Cash & Bank)', subtitle: 'দৈনিক নগদ ক্যাশ ও ব্যাংক হিসাব', icon: '🏦' },
  'bank-reconciliation': { title: 'ব্যাংক রিকনসিলিয়েশন (Reconciliation)', subtitle: 'ব্যাংক স্টেটমেন্ট ও চেক ক্লিয়ারেন্স', icon: '📑' },
  'day-closing': { title: 'দিন সমাপ্তি (Day Closing)', subtitle: 'দৈনিক আর্থিক ক্লোজিং ও ড্রয়ার ক্যাশ', icon: '🔒' },
  'expenses': { title: 'দৈনিক খরচ ও ব্যয় (Expenses)', subtitle: 'অফিস খরচ ও মিসেলেনিয়াস বিল', icon: '💸' },
  'accounting': { title: 'অ্যাকাউন্টিং ও খতিয়ান (Accounting)', subtitle: 'জেনারেল লেজার ও ট্রায়াল ব্যালেন্স', icon: '📖' },
  'reports': { title: 'বিজনেস ইন্টেলিজেন্স রিপোর্ট (BI Reports)', subtitle: 'সার্বিক বিশ্লেষণ ও গ্রাফিক্যাল রিপোর্ট', icon: '📈' },
  'dynamic-business-report': { title: 'ডায়নামিক রিপোর্ট (Business Reports)', subtitle: 'ব্যবসায়িক রিয়েল-টাইম এনালিটিক্স', icon: '📊' },
  'classic-reports': { title: 'ক্লাসিক রিপোর্ট (Classic Reports)', subtitle: 'স্ট্যান্ডার্ড প্রিন্ট রিপোর্টস', icon: '📋' },
  'custom-reports': { title: 'কাস্টম রিপোর্ট বিল্ডার (Custom Reports)', subtitle: 'ইউজার-ডিফাইন্ড রিপোর্ট ইঞ্জিনিয়ারিং', icon: '📝' },
  'data-import': { title: 'ডাটা ইম্পোর্ট ও মাইগ্রেশন (Data Import)', subtitle: 'এক্সেল / সিএসভি বাল্ক আপলোড', icon: '📥' },
  'api-integrations': { title: 'এপিআই ও ক্লাউড সংযোগ (API Integrations)', subtitle: 'ওয়েবহুক ও থার্ড-পার্টি সার্ভিস', icon: '🔌' },
  'alert-center': { title: 'সতর্কবার্তা সেন্টার (Alert Center)', subtitle: 'সিস্টেম হেলথ ও রিমাইন্ডার সেন্টার', icon: '🔔' },
  'audit-logs': { title: 'অডিট লগ ও সিকিউরিটি (Audit Logs)', subtitle: 'ব্যবহারকারীর কার্যকলাপ ও সিকিউরিটি ট্রেইল', icon: '🛡️' },
  'settings': { title: 'সিস্টেম কনফিগারেশন (Settings)', subtitle: 'ইআরপি সেটিংস ও পারমিশন', icon: '⚙️' }
};

const ERPAppContent: React.FC = () => {
  const { isAuthenticated, currentUserRole, currentUser, hasPermission, salesInvoices, triggerManualSync } = useERP();
  const { showSuccess, showInfo, showError } = useToast();
  const {
    isDesktop,
    registerWindow,
    unregisterWindow,
    focusWindow,
    activeWindowId,
    isWindowMinimized,
    isSplitView,
    splitWindowIds,
    closeSplitView
  } = useWindowManager();

  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const v = urlParams.get('view');
      if (v) return v;
    } catch {}
    return 'dashboard';
  });

  const [openViewIds, setOpenViewIds] = useState<string[]>(['dashboard']);

  // Header auto-hide & pin state (Default false on open as requested)
  const [isHeaderPinned, setIsHeaderPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('telecorp_header_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleHeaderPin = () => {
    setIsHeaderPinned(prev => {
      const next = !prev;
      try {
        localStorage.setItem('telecorp_header_pinned', String(next));
      } catch {}
      if (next) {
        showInfo('হেডার পিন করা হয়েছে', 'হেডারটি এখন সার্বক্ষণিকভাবে স্থায়ী থাকবে।');
      } else {
        showInfo('হেডার অটো-হাইড চালু', 'মাউস নিচে নিলে হেডার লুকিয়ে যাবে। মাউস উপরে আনলে পুনরায় দেখাবে।');
      }
      return next;
    });
  };

  const handleOpenViewWindow = (view: string) => {
    setCurrentView(view);
    setOpenViewIds(prev => (prev.includes(view) ? prev : [...prev, view]));
    const cfg = VIEW_CONFIG[view] || { title: view, subtitle: '', icon: '🖥️' };
    registerWindow({
      id: view,
      title: cfg.title,
      subtitle: cfg.subtitle,
      icon: <span>{cfg.icon}</span>,
      type: 'view',
      isMinimized: false,
      isMaximized: false,
      onClose: () => handleCloseViewWindow(view)
    });
    focusWindow(view);
  };

  const handleCloseViewWindow = (viewId: string) => {
    setOpenViewIds(prev => {
      const remaining = prev.filter(v => v !== viewId);
      if (remaining.length > 0) {
        const nextView = remaining[remaining.length - 1];
        setCurrentView(nextView);
        focusWindow(nextView);
      } else {
        setCurrentView('');
      }
      return remaining;
    });
    unregisterWindow(viewId);
  };

  // Sync initial dashboard window
  useEffect(() => {
    const cfg = VIEW_CONFIG['dashboard'];
    registerWindow({
      id: 'dashboard',
      title: cfg.title,
      subtitle: cfg.subtitle,
      icon: <span>{cfg.icon}</span>,
      type: 'view',
      isMinimized: false,
      isMaximized: false,
      onClose: () => handleCloseViewWindow('dashboard')
    });
    focusWindow('dashboard');
  }, []);

  // When activeWindowId changes in WindowManager, sync currentView
  useEffect(() => {
    if (activeWindowId && openViewIds.includes(activeWindowId)) {
      setCurrentView(prev => (prev !== activeWindowId ? activeWindowId : prev));
    }
  }, [activeWindowId]);

  // Desktop Full Screen Workspace & Sidebar Behavior (Initially collapsed for maximum workspace)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);

  // View Navigation History
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigateView = (view: string) => {
    handleOpenViewWindow(view);
    setViewHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, view];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleNavBack = () => {
    if (historyIndex > 0) {
      const target = viewHistory[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      handleOpenViewWindow(target);
      showInfo('পূর্ববর্তী ভিউ', target);
    }
  };

  const handleNavForward = () => {
    if (historyIndex < viewHistory.length - 1) {
      const target = viewHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      handleOpenViewWindow(target);
      showInfo('পরবর্তী ভিউ', target);
    }
  };

  // Modal States
  const [showIMEIModal, setShowIMEIModal] = useState(false);
  const [targetIMEI, setTargetIMEI] = useState<string>('');

  const [showMultiScanner, setShowMultiScanner] = useState(false);
  const [multiScannerTokens, setMultiScannerTokens] = useState<string[]>([]);
  const [multiScannerMode, setMultiScannerMode] = useState<any>('lookup');

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [saleModalType, setSaleModalType] = useState<'Wholesale' | 'Retail POS'>('Wholesale');

  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  const [showDueCollectionModal, setShowDueCollectionModal] = useState(false);
  const [collectionCustomerId, setCollectionCustomerId] = useState<string | undefined>(undefined);

  const [showCustomerReturnModal, setShowCustomerReturnModal] = useState(false);
  const [showStockTransferModal, setShowStockTransferModal] = useState(false);

  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [printInvoiceNo, setPrintInvoiceNo] = useState<string>('');

  // Global Command Palette & Shortcut Help
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  const handleOpenIMEILookup = (imei?: string) => {
    setTargetIMEI(imei || '');
    setShowIMEIModal(true);
  };

  const handleOpenMultiScanner = (initialTokens?: string[], mode: any = 'lookup') => {
    setMultiScannerTokens(initialTokens || []);
    setMultiScannerMode(mode);
    setShowMultiScanner(true);
  };

  const handleOpenNewSale = (type: 'Wholesale' | 'Retail POS' = 'Wholesale') => {
    setSaleModalType(type);
    setShowNewSaleModal(true);
  };

  const handleOpenDueCollection = (customerId?: string) => {
    setCollectionCustomerId(customerId);
    setShowDueCollectionModal(true);
  };

  const handlePrintInvoice = (invNo: string) => {
    setPrintInvoiceNo(invNo);
    setShowInvoicePrintModal(true);
  };

  // Context-Aware New Entry (Ctrl + N)
  const handleContextNewEntry = () => {
    if (currentView === 'wholesale-sales' || currentView === 'retail-pos' || currentView === 'dashboard') {
      handleOpenNewSale(currentView === 'retail-pos' ? 'Retail POS' : 'Wholesale');
    } else if (currentView === 'purchases') {
      setShowNewPurchaseModal(true);
    } else if (currentView === 'inventory') {
      setShowNewProductModal(true);
    } else if (currentView === 'due-collection' || currentView === 'due-ageing') {
      handleOpenDueCollection();
    } else if (currentView === 'stock-transfers' || currentView === 'warehouses') {
      setShowStockTransferModal(true);
    } else if (currentView === 'returns') {
      setShowCustomerReturnModal(true);
    } else if (currentView === 'imei-trace') {
      handleOpenMultiScanner();
    } else {
      setShowCommandPalette(true);
    }
  };

  // Current view search focus (Ctrl + F)
  const focusCurrentSearch = () => {
    const target = document.querySelector<HTMLInputElement>(
      'input[data-search-input="true"], #view-search-input, #global-header-search, input[placeholder*="সার্চ"], input[placeholder*="Search"], input[placeholder*="খুঁজুন"], input[type="search"]'
    );
    if (target) {
      target.focus();
      target.select?.();
    } else {
      setShowCommandPalette(true);
    }
  };

  // Save active form or modal (Ctrl + S)
  const handleSaveActive = () => {
    const activeSubmit = document.querySelector<HTMLButtonElement>(
      '[role="dialog"] button[type="submit"]:not([disabled]), [role="dialog"] button[data-action="save"]:not([disabled]), form button[type="submit"]:not([disabled])'
    );
    if (activeSubmit) {
      activeSubmit.click();
    } else {
      showInfo('কোনো খোলা ফর্ম নেই', 'সেভ করার জন্য কোনো সক্রিয় ফর্ম পাওয়া যায়নি।');
    }
  };

  // Safe Data Refresh & Cloud Sync (Ctrl + R)
  const handleDataRefresh = async () => {
    try {
      const res = await triggerManualSync();
      showSuccess('ডাটাবেজ রিফ্রেশ সম্পন্ন হয়েছে', res?.message || 'সকল তথ্য সফলভাবে ক্লাউডের সাথে সমন্বিত হয়েছে।');
    } catch (err: any) {
      showError('রিফ্রেশ ব্যর্থ হয়েছে', err?.message || 'অনুগ্রহ করে নেটওয়ার্ক সংযোগ চেক করুন।');
    }
  };

  // Global Keyboard Shortcuts Coordinator
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // 1. Ctrl + K: Command Palette & Menu
      if (isCtrl && key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }

      // 2. Ctrl + F: Search in active view
      if (isCtrl && key === 'f') {
        e.preventDefault();
        focusCurrentSearch();
        return;
      }

      // 3. Ctrl + N: Context-Aware New Entry
      if (isCtrl && key === 'n') {
        e.preventDefault();
        handleContextNewEntry();
        return;
      }

      // 4. Ctrl + S: Save active modal / form
      if (isCtrl && key === 's') {
        e.preventDefault();
        handleSaveActive();
        return;
      }

      // 5. Ctrl + P: Print active
      if (isCtrl && key === 'p') {
        e.preventDefault();
        if (showInvoicePrintModal) {
          window.print();
        } else if (currentView === 'reports' || currentView === 'classic-reports' || currentView === 'dynamic-business-report' || currentView === 'barcode-labels') {
          window.print();
        } else if (salesInvoices.length > 0) {
          handlePrintInvoice(salesInvoices[0].invoiceNo);
        } else {
          window.print();
        }
        return;
      }

      // 6. Ctrl + Enter: Submit active form
      if (isCtrl && e.key === 'Enter') {
        e.preventDefault();
        const activeSubmit = document.querySelector<HTMLButtonElement>(
          '[role="dialog"] button[type="submit"]:not([disabled]), [role="dialog"] button[data-action="save"]:not([disabled]), form button[type="submit"]:not([disabled])'
        );
        if (activeSubmit) {
          activeSubmit.click();
        }
        return;
      }

      // 7. Alt + Left / Alt + Right: History navigation
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavBack();
        return;
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavForward();
        return;
      }

      // 8. Ctrl + R: Safe Data Refresh
      if (isCtrl && key === 'r') {
        e.preventDefault();
        handleDataRefresh();
        return;
      }

      // 9. Ctrl + / or F1: Keyboard Shortcuts Help
      if ((isCtrl && e.key === '/') || e.key === 'F1') {
        e.preventDefault();
        setShowShortcutHelp(prev => !prev);
        return;
      }

      // 10. Ctrl + B: Multi-Barcode Scanner
      if (isCtrl && key === 'b') {
        e.preventDefault();
        handleOpenMultiScanner();
        return;
      }

      // 11. Ctrl + [: Toggle Desktop Sidebar
      if (isCtrl && e.key === '[') {
        e.preventDefault();
        setIsSidebarExpanded(prev => !prev);
        return;
      }

      // 12. Escape: Top Modal Dismiss
      if (e.key === 'Escape') {
        if (showShortcutHelp) {
          e.preventDefault();
          setShowShortcutHelp(false);
        } else if (showCommandPalette) {
          e.preventDefault();
          setShowCommandPalette(false);
        } else if (showMultiScanner) {
          e.preventDefault();
          setShowMultiScanner(false);
        } else if (showIMEIModal) {
          e.preventDefault();
          setShowIMEIModal(false);
        } else if (showInvoicePrintModal) {
          e.preventDefault();
          setShowInvoicePrintModal(false);
        } else if (showStockTransferModal) {
          e.preventDefault();
          setShowStockTransferModal(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    showCommandPalette,
    showShortcutHelp,
    showMultiScanner,
    showIMEIModal,
    showInvoicePrintModal,
    showStockTransferModal,
    currentView,
    historyIndex,
    viewHistory,
    salesInvoices
  ]);

  const renderViewContent = (viewId: string) => {
    switch (viewId) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewSale={() => handleOpenNewSale('Wholesale')}
            onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
            onOpenDueCollection={() => handleOpenDueCollection()}
            onOpenIMEILookup={handleOpenIMEILookup}
            onSelectView={setCurrentView}
            onPrintInvoice={handlePrintInvoice}
          />
        );
      case 'imei-trace':
        return <IMEITraceView onOpenLifecycleModal={handleOpenIMEILookup} />;
      case 'wholesale-sales':
        return (
          <WholesaleSalesView
            onOpenNewSale={() => handleOpenNewSale('Wholesale')}
            onPrintInvoice={handlePrintInvoice}
            onOpenReturn={() => setShowCustomerReturnModal(true)}
          />
        );
      case 'retail-pos':
        return <RetailPOSView onPrintInvoice={handlePrintInvoice} />;
      case 'phone-exchange':
        return <PhoneExchangeView />;
      case 'emi-installment':
        return <EMIInstallmentView />;
      case 'delivery-dispatch':
        return <DeliveryDispatchView />;
      case 'sms-marketing':
        return <SmsMarketingView />;
      case 'due-ageing':
        return <DueAgeingView onOpenDueCollection={handleOpenDueCollection} />;
      case 'due-collection':
        return <DueCollectionView onOpenDueCollection={handleOpenDueCollection} />;
      case 'purchases':
        return <PurchaseView onOpenNewPurchase={() => setShowNewPurchaseModal(true)} />;
      case 'inventory':
        return (
          <InventoryView
            onOpenStockTransfer={() => setShowStockTransferModal(true)}
            onOpenIMEILookup={handleOpenIMEILookup}
            onSelectView={setCurrentView}
          />
        );
      case 'barcode-labels':
        return <BarcodeLabelView />;
      case 'brands':
        return <BrandsView />;
      case 'warehouses':
        return <WarehousesView onOpenStockTransfer={() => setShowStockTransferModal(true)} />;
      case 'stock-transfers':
        return (
          <StockTransfersView
            onOpenStockTransfer={() => setShowStockTransferModal(true)}
            onOpenIMEILookup={handleOpenIMEILookup}
          />
        );
      case 'brand-incentives':
        return <BrandIncentivesView />;
      case 'price-drop':
        return <PriceDropClaimView />;
      case 'customers':
        return <CustomersView onOpenDueCollection={handleOpenDueCollection} />;
      case 'suppliers':
        return <SuppliersView />;
      case 'returns':
        return (
          <ReturnsView
            onOpenCustomerReturn={() => setShowCustomerReturnModal(true)}
            onOpenIMEILookup={handleOpenIMEILookup}
          />
        );
      case 'warranty-service':
        return <WarrantyServiceView />;
      case 'salesmen':
        return <SalesmenView />;
      case 'salesman-app':
        return <SalesmanMobileAppView />;
      case 'field-visits':
        return <FieldVisitsView />;
      case 'cash-bank':
        return <CashBankView />;
      case 'bank-reconciliation':
        return <BankReconciliationView />;
      case 'day-closing':
        return <DayClosingView />;
      case 'expenses':
        return <ExpensesView />;
      case 'accounting':
        return <AccountingView />;
      case 'reports':
      case 'dynamic-business-report':
        return <DynamicBusinessReportView />;
      case 'classic-reports':
        return <ReportsView />;
      case 'custom-reports':
        return <CustomReportBuilderView />;
      case 'data-import':
        return <DataImportView />;
      case 'api-integrations':
        return <ApiIntegrationsView />;
      case 'alert-center':
        return <AlertCenterView onSelectView={setCurrentView} />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="p-8 text-center text-slate-500">
            মডিউলটি প্রক্রিয়াধীন রয়েছে ({viewId})
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <OfflineStatusBanner />
        <LoginView />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden relative">
      <OfflineStatusBanner />
      {/* Top Universal Header */}
      <Header
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={() => setIsSidebarExpanded(prev => !prev)}
        onOpenNewSale={() => handleOpenNewSale('Wholesale')}
        onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
        onOpenDueCollection={() => handleOpenDueCollection()}
        onOpenIMEILookup={handleOpenIMEILookup}
        onOpenMultiScanner={handleOpenMultiScanner}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenShortcutsHelp={() => setShowShortcutHelp(true)}
        onSelectView={handleNavigateView}
        isPinned={isHeaderPinned}
        onTogglePin={handleToggleHeaderPin}
      />

      <div className={`flex-1 flex overflow-hidden relative ${isDesktop ? 'pb-11 sm:pb-12' : ''}`}>
        {/* Left Sidebar */}
        <Sidebar
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
          currentView={currentView}
          onSelectView={handleNavigateView}
        />

        {/* Floating Expand Sidebar Button (">") when sidebar is collapsed */}
        {!isSidebarExpanded && (
          <button
            type="button"
            onClick={() => setIsSidebarExpanded(true)}
            className="fixed left-0 top-20 z-40 bg-white/95 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-300 rounded-r-xl py-3 px-1.5 shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-1 cursor-pointer group backdrop-blur-xs select-none"
            title="সাইডবার খুলুন (Expand Sidebar: > / Ctrl + [)"
            aria-label="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors stroke-[3]" />
            <span className="text-[9px] font-black uppercase tracking-wider [writing-mode:vertical-lr] text-slate-500 group-hover:text-white transition-colors">
              মেন্যু
            </span>
          </button>
        )}

        {/* Main Content Viewport - Windows Desktop Workspace */}
        <main className="flex-1 h-full overflow-hidden relative">
          {!currentView || (isDesktop && !isSplitView && (isWindowMinimized(currentView) || !openViewIds.includes(currentView))) ? (
            <DesktopView onOpenApp={handleNavigateView} />
          ) : isDesktop && isSplitView && splitWindowIds ? (
            <div className="h-full w-full flex flex-row overflow-hidden divide-x-2 divide-slate-300 dark:divide-slate-800 bg-slate-900/10">
              <div className="w-1/2 h-full flex flex-col overflow-hidden">
                <WindowsWindowFrame
                  id={splitWindowIds[0]}
                  title={VIEW_CONFIG[splitWindowIds[0]]?.title || splitWindowIds[0]}
                  subtitle={VIEW_CONFIG[splitWindowIds[0]]?.subtitle}
                  icon={<span>{VIEW_CONFIG[splitWindowIds[0]]?.icon || '🖥️'}</span>}
                  onClose={() => closeSplitView()}
                >
                  <ErrorBoundary fallbackTitle={splitWindowIds[0]}>
                    {renderViewContent(splitWindowIds[0])}
                  </ErrorBoundary>
                </WindowsWindowFrame>
              </div>
              <div className="w-1/2 h-full flex flex-col overflow-hidden">
                <WindowsWindowFrame
                  id={splitWindowIds[1]}
                  title={VIEW_CONFIG[splitWindowIds[1]]?.title || splitWindowIds[1]}
                  subtitle={VIEW_CONFIG[splitWindowIds[1]]?.subtitle}
                  icon={<span>{VIEW_CONFIG[splitWindowIds[1]]?.icon || '🖥️'}</span>}
                  onClose={() => closeSplitView()}
                >
                  <ErrorBoundary fallbackTitle={splitWindowIds[1]}>
                    {renderViewContent(splitWindowIds[1])}
                  </ErrorBoundary>
                </WindowsWindowFrame>
              </div>
            </div>
          ) : !hasPermission(currentUserRole, currentView) ? (
            <WindowsWindowFrame
              id={currentView}
              title={VIEW_CONFIG[currentView]?.title || currentView}
              subtitle="Access Restricted"
              icon={<span>🛡️</span>}
              onClose={() => handleCloseViewWindow(currentView)}
            >
              <div className="h-full flex items-center justify-center p-6 bg-slate-100/70">
              <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/90 p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    অ্যাক্সেস সংরক্ষিত • Access Restricted
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    অনুমতি নেই (Permission Denied)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    আপনার বর্তমান রোল <strong className="text-slate-800">[{currentUserRole}]</strong> অনুযায়ী এই মডিউলটিতে প্রবেশের অনুমতি নেই।
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>অপারেটর:</span>
                    <strong className="text-slate-800">{currentUser?.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>শাখা / ডিপার্টমেন্ট:</span>
                    <strong className="text-slate-800">{currentUser?.department?.split('/')[0] || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>অনুরোধকৃত ভিউ:</span>
                    <span className="font-mono font-bold text-rose-600">{currentView}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (hasPermission(currentUserRole, 'dashboard')) setCurrentView('dashboard');
                    else if (hasPermission(currentUserRole, 'salesman-app')) setCurrentView('salesman-app');
                    else if (hasPermission(currentUserRole, 'retail-pos')) setCurrentView('retail-pos');
                    else if (hasPermission(currentUserRole, 'inventory')) setCurrentView('inventory');
                    else setCurrentView('imei-trace');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-black text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>অনুমোদিত ড্যাশবোর্ডে ফিরে যান</span>
                </button>
              </div>
            </div>
          </WindowsWindowFrame>
        ) : (
          <WindowsWindowFrame
            id={currentView}
            title={VIEW_CONFIG[currentView]?.title || currentView}
            subtitle={VIEW_CONFIG[currentView]?.subtitle}
            icon={<span>{VIEW_CONFIG[currentView]?.icon || '🖥️'}</span>}
            onClose={() => handleCloseViewWindow(currentView)}
          >
            <ErrorBoundary fallbackTitle={currentView}>
              {renderViewContent(currentView)}
            </ErrorBoundary>
          </WindowsWindowFrame>
        )}
        </main>
      </div>

      {/* Windows OS Taskbar - Desktop Only */}
      {isDesktop && (
        <WindowsTaskbar
          onSelectView={handleNavigateView}
          onOpenNewSale={() => handleOpenNewSale('Wholesale')}
          onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
          onOpenDueCollection={() => handleOpenDueCollection()}
        />
      )}

      {/* Global Interactive Modals */}
      <IMEISearchModal
        isOpen={showIMEIModal}
        onClose={() => setShowIMEIModal(false)}
        initialIMEI={targetIMEI}
      />

      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(false)}
        defaultType={saleModalType}
        onSuccessInvoice={(invNo) => {
          handlePrintInvoice(invNo);
        }}
      />

      <NewPurchaseModal
        isOpen={showNewPurchaseModal}
        onClose={() => setShowNewPurchaseModal(false)}
        onSuccessPurchase={(purNo) => {
          setCurrentView('purchases');
        }}
      />

      <DueCollectionModal
        isOpen={showDueCollectionModal}
        onClose={() => setShowDueCollectionModal(false)}
        initialCustomerId={collectionCustomerId}
        onSuccessCollection={() => {
          setCurrentView('due-ageing');
        }}
      />

      <CustomerReturnModal
        isOpen={showCustomerReturnModal}
        onClose={() => setShowCustomerReturnModal(false)}
        onSuccessReturn={() => {
          setCurrentView('returns');
        }}
      />

      <StockTransferModal
        isOpen={showStockTransferModal}
        onClose={() => setShowStockTransferModal(false)}
        onSuccessTransfer={() => {
          setCurrentView('stock-transfers');
        }}
      />

      <InvoicePrintModal
        isOpen={showInvoicePrintModal}
        onClose={() => setShowInvoicePrintModal(false)}
        invoiceNo={printInvoiceNo}
      />

      <MultiBarcodeScannerModal
        isOpen={showMultiScanner}
        onClose={() => setShowMultiScanner(false)}
        mode={multiScannerMode}
        initialTokens={multiScannerTokens}
        onConfirm={(validRecords, allCleanTokens) => {
          if (validRecords.length > 0) {
            handleOpenIMEILookup(validRecords[0].imei1);
          }
        }}
        confirmButtonText="360° বিস্তারিত দেখুন"
      />

      <NewProductModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
      />

      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectView={handleNavigateView}
        onOpenNewSale={handleOpenNewSale}
        onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
        onOpenDueCollection={handleOpenDueCollection}
        onOpenIMEILookup={handleOpenIMEILookup}
        onOpenMultiScanner={() => handleOpenMultiScanner()}
        onOpenShortcutsHelp={() => setShowShortcutHelp(true)}
        onPrintInvoice={handlePrintInvoice}
        onOpenNewProduct={() => setShowNewProductModal(true)}
        onOpenStockTransfer={() => setShowStockTransferModal(true)}
        onOpenCustomerReturn={() => setShowCustomerReturnModal(true)}
      />

      <KeyboardShortcutHelpModal
        isOpen={showShortcutHelp}
        onClose={() => setShowShortcutHelp(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ThemeProvider>
        <WindowManagerProvider>
          <ERPAppContent />
        </WindowManagerProvider>
      </ThemeProvider>
    </ERPProvider>
  );
}
