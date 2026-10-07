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

const ERPAppContent: React.FC = () => {
  const { isAuthenticated, currentUserRole, currentUser, hasPermission, salesInvoices, triggerManualSync } = useERP();
  const { showSuccess, showInfo, showError } = useToast();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Desktop Full Screen Workspace & Sidebar Behavior (Initially collapsed for maximum workspace)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);

  // View Navigation History
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigateView = (view: string) => {
    setCurrentView(view);
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
      setCurrentView(target);
      showInfo('পূর্ববর্তী ভিউ', target);
    }
  };

  const handleNavForward = () => {
    if (historyIndex < viewHistory.length - 1) {
      const target = viewHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      setCurrentView(target);
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

  if (!isAuthenticated) {
    return (
      <>
        <OfflineStatusBanner />
        <LoginView />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans text-slate-800 overflow-hidden">
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
      />

      <div className="flex-1 flex overflow-hidden relative">
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

        {/* Main Content Viewport - Only this scrolls */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden scroll-smooth">
          {!hasPermission(currentUserRole, currentView) ? (
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
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  onOpenNewSale={() => handleOpenNewSale('Wholesale')}
                  onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
                  onOpenDueCollection={() => handleOpenDueCollection()}
                  onOpenIMEILookup={handleOpenIMEILookup}
                  onSelectView={setCurrentView}
                  onPrintInvoice={handlePrintInvoice}
                />
              )}

              {currentView === 'imei-trace' && (
                <IMEITraceView onOpenLifecycleModal={handleOpenIMEILookup} />
              )}

              {currentView === 'wholesale-sales' && (
                <WholesaleSalesView
                  onOpenNewSale={() => handleOpenNewSale('Wholesale')}
                  onPrintInvoice={handlePrintInvoice}
                  onOpenReturn={() => setShowCustomerReturnModal(true)}
                />
              )}

              {currentView === 'retail-pos' && (
                <RetailPOSView onPrintInvoice={handlePrintInvoice} />
              )}

              {currentView === 'phone-exchange' && (
                <PhoneExchangeView />
              )}

              {currentView === 'emi-installment' && (
                <EMIInstallmentView />
              )}

              {currentView === 'delivery-dispatch' && (
                <DeliveryDispatchView />
              )}

              {currentView === 'sms-marketing' && (
                <SmsMarketingView />
              )}

              {currentView === 'due-ageing' && (
                <DueAgeingView onOpenDueCollection={handleOpenDueCollection} />
              )}

              {currentView === 'due-collection' && (
                <DueCollectionView onOpenDueCollection={handleOpenDueCollection} />
              )}

              {currentView === 'purchases' && (
                <PurchaseView onOpenNewPurchase={() => setShowNewPurchaseModal(true)} />
              )}

              {currentView === 'inventory' && (
                <InventoryView
                  onOpenStockTransfer={() => setShowStockTransferModal(true)}
                  onOpenIMEILookup={handleOpenIMEILookup}
                  onSelectView={setCurrentView}
                />
              )}

              {currentView === 'barcode-labels' && (
                <BarcodeLabelView />
              )}

              {currentView === 'brands' && <BrandsView />}

              {currentView === 'warehouses' && (
                <WarehousesView onOpenStockTransfer={() => setShowStockTransferModal(true)} />
              )}

              {currentView === 'stock-transfers' && (
                <StockTransfersView
                  onOpenStockTransfer={() => setShowStockTransferModal(true)}
                  onOpenIMEILookup={handleOpenIMEILookup}
                />
              )}

              {currentView === 'brand-incentives' && (
                <BrandIncentivesView />
              )}

              {currentView === 'price-drop' && (
                <PriceDropClaimView />
              )}

              {currentView === 'customers' && (
                <CustomersView onOpenDueCollection={handleOpenDueCollection} />
              )}

              {currentView === 'suppliers' && <SuppliersView />}

              {currentView === 'returns' && (
                <ReturnsView
                  onOpenCustomerReturn={() => setShowCustomerReturnModal(true)}
                  onOpenIMEILookup={handleOpenIMEILookup}
                />
              )}

              {currentView === 'warranty-service' && (
                <WarrantyServiceView />
              )}

              {currentView === 'salesmen' && <SalesmenView />}

              {currentView === 'salesman-app' && (
                <SalesmanMobileAppView />
              )}

              {currentView === 'field-visits' && (
                <FieldVisitsView />
              )}

              {currentView === 'cash-bank' && <CashBankView />}

              {currentView === 'bank-reconciliation' && (
                <BankReconciliationView />
              )}

              {currentView === 'day-closing' && (
                <DayClosingView />
              )}

              {currentView === 'expenses' && <ExpensesView />}

              {currentView === 'accounting' && <AccountingView />}

              {(currentView === 'reports' || currentView === 'dynamic-business-report') && (
                <DynamicBusinessReportView />
              )}

              {currentView === 'classic-reports' && <ReportsView />}

              {currentView === 'custom-reports' && (
                <CustomReportBuilderView />
              )}

              {currentView === 'data-import' && (
                <DataImportView />
              )}

              {currentView === 'api-integrations' && (
                <ApiIntegrationsView />
              )}

              {currentView === 'alert-center' && (
                <AlertCenterView onSelectView={setCurrentView} />
              )}

              {currentView === 'audit-logs' && <AuditLogsView />}

              {currentView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

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
      <ERPAppContent />
    </ERPProvider>
  );
}
