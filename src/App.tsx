import React, { useState } from 'react';
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
import { ApiIntegrationsView } from './components/views/ApiIntegrationsView';
import { LoginView } from './components/auth/LoginView';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';

// Modals
import { IMEISearchModal } from './components/modals/IMEISearchModal';
import { NewSaleModal } from './components/modals/NewSaleModal';
import { NewPurchaseModal } from './components/modals/NewPurchaseModal';
import { DueCollectionModal } from './components/modals/DueCollectionModal';
import { CustomerReturnModal } from './components/modals/CustomerReturnModal';
import { StockTransferModal } from './components/modals/StockTransferModal';
import { InvoicePrintModal } from './components/modals/InvoicePrintModal';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const ERPAppContent: React.FC = () => {
  const { isAuthenticated, currentUserRole, currentUser, hasPermission } = useERP();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Modal States
  const [showIMEIModal, setShowIMEIModal] = useState(false);
  const [targetIMEI, setTargetIMEI] = useState<string>('');

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [saleModalType, setSaleModalType] = useState<'Wholesale' | 'Retail POS'>('Wholesale');

  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);

  const [showDueCollectionModal, setShowDueCollectionModal] = useState(false);
  const [collectionCustomerId, setCollectionCustomerId] = useState<string | undefined>(undefined);

  const [showCustomerReturnModal, setShowCustomerReturnModal] = useState(false);
  const [showStockTransferModal, setShowStockTransferModal] = useState(false);

  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [printInvoiceNo, setPrintInvoiceNo] = useState<string>('');

  const handleOpenIMEILookup = (imei?: string) => {
    setTargetIMEI(imei || '');
    setShowIMEIModal(true);
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
        onOpenNewSale={() => handleOpenNewSale('Wholesale')}
        onOpenNewPurchase={() => setShowNewPurchaseModal(true)}
        onOpenDueCollection={() => handleOpenDueCollection()}
        onOpenIMEILookup={handleOpenIMEILookup}
        onSelectView={setCurrentView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Fixed in place */}
        <Sidebar currentView={currentView} onSelectView={setCurrentView} />

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
