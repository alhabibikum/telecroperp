import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Minus,
  Settings,
  Shield,
  Layers,
  Database,
  Terminal,
  Cpu,
  Boxes,
  Smartphone,
  CreditCard,
  Building2,
  Users,
  Wallet,
  Clock,
  HelpCircle,
  Pin
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isExpanded = true,
  onToggleExpand
}) => {
  const {
    settings,
    alerts,
    imeis,
    customers,
    warrantyClaims,
    emiPlans,
    currentUserRole,
    hasPermission
  } = useERP();

  const isBn = settings.language === 'bn';
  const [filterSearch, setFilterSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const collapseAllSections = () => {
    const allCollapsed: Record<string, boolean> = {
      overview: true,
      sales: true,
      inventory: true,
      partners: true,
      field: true,
      finance: true,
      reports: true,
      system: true
    };
    setCollapsedSections(allCollapsed);
  };

  const expandAllSections = () => {
    setCollapsedSections({});
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const overdueCustomersCount = customers.filter(c => c.currentDue > 0).length;
  const activeWarrantyCount = warrantyClaims.filter(w => w.status !== 'Delivered to Customer' && w.status !== 'Rejected').length;

  const solutionFolders = [
    {
      id: 'overview',
      folderName: isBn ? '00_ড্যাশবোর্ড_ও_ককপিট' : '00_Dashboard_Overview',
      items: [
        { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড (Dashboard.view)' : 'Dashboard.view', ext: '.view', icon: Layers },
        { id: 'imei-trace', label: isBn ? 'আইএমইআই ট্রেস (IMEITrace.view)' : 'IMEITrace.view', ext: '.view', icon: Smartphone, count: imeis.length },
        { id: 'alert-center', label: isBn ? 'অ্যালার্ট সেন্টার (AlertCenter.view)' : 'AlertCenter.view', ext: '.view', icon: Shield, alertCount: unreadAlerts }
      ]
    },
    {
      id: 'sales',
      folderName: isBn ? '01_বিক্রয়_ও_ডিস্ট্রিবিউশন' : '01_Sales_Distribution',
      items: [
        { id: 'wholesale-sales', label: isBn ? 'পাইকারি বিক্রয় (WholesaleSales.view)' : 'WholesaleSales.view', ext: '.view', icon: FileCode },
        { id: 'retail-pos', label: isBn ? 'কাউন্টার পিওএস (RetailPOS.view)' : 'RetailPOS.view', ext: '.view', icon: FileCode },
        { id: 'phone-exchange', label: isBn ? 'ফোন এক্সচেঞ্জ (PhoneExchange.view)' : 'PhoneExchange.view', ext: '.view', icon: FileCode },
        { id: 'emi-installment', label: isBn ? 'কিস্তি ও ইএমআই (EMIInstallment.view)' : 'EMIInstallment.view', ext: '.view', icon: CreditCard, count: emiPlans.filter(p => p.status === 'Active').length },
        { id: 'due-ageing', label: isBn ? 'বকেয়া এইজিং (DueAgeing.view)' : 'DueAgeing.view', ext: '.view', icon: FileText, count: overdueCustomersCount },
        { id: 'due-collection', label: isBn ? 'বকেয়া কালেকশন (DueCollection.view)' : 'DueCollection.view', ext: '.view', icon: Wallet },
        { id: 'delivery-dispatch', label: isBn ? 'ডেলিভারি চালান (DeliveryDispatch.view)' : 'DeliveryDispatch.view', ext: '.view', icon: FileText },
        { id: 'sms-marketing', label: isBn ? 'এসএমএস গেটওয়ে (SmsMarketing.view)' : 'SmsMarketing.view', ext: '.view', icon: Terminal }
      ]
    },
    {
      id: 'inventory',
      folderName: isBn ? '02_ইনভেন্টরি_ও_স্টক' : '02_Inventory_Stock',
      items: [
        { id: 'inventory', label: isBn ? 'পণ্য ও ইনভেন্টরি (Inventory.view)' : 'Inventory.view', ext: '.view', icon: Boxes },
        { id: 'purchases', label: isBn ? 'পারচেজ ইনওয়ার্ড (Purchases.view)' : 'Purchases.view', ext: '.view', icon: FileCode },
        { id: 'barcode-labels', label: isBn ? 'বারকোড লেবেল প্রিন্টার (BarcodeLabels.view)' : 'BarcodeLabels.view', ext: '.view', icon: FileText },
        { id: 'warehouses', label: isBn ? 'ওয়্যারহাউজ মাস্টার (Warehouses.view)' : 'Warehouses.view', ext: '.view', icon: Building2 },
        { id: 'stock-transfers', label: isBn ? 'স্টক ট্রান্সফার (StockTransfers.view)' : 'StockTransfers.view', ext: '.view', icon: FileCode },
        { id: 'brands', label: isBn ? 'ব্র্যান্ড মাস্টার (Brands.view)' : 'Brands.view', ext: '.view', icon: FileText },
        { id: 'brand-incentives', label: isBn ? 'ব্র্যান্ড ইনসেন্টিভ (BrandIncentives.view)' : 'BrandIncentives.view', ext: '.view', icon: FileText },
        { id: 'price-drop', label: isBn ? 'প্রাইস ড্রপ ক্লেইম (PriceDrop.view)' : 'PriceDrop.view', ext: '.view', icon: FileText }
      ]
    },
    {
      id: 'partners',
      folderName: isBn ? '03_ডিলার_ও_ভেন্ডর_মাস্টার' : '03_Dealers_Suppliers_CRM',
      items: [
        { id: 'customers', label: isBn ? 'কাস্টমার ডিরেক্টরি (Customers.view)' : 'Customers.view', ext: '.view', icon: Users },
        { id: 'suppliers', label: isBn ? 'সাপ্লায়ার ডিরেক্টরি (Suppliers.view)' : 'Suppliers.view', ext: '.view', icon: Building2 },
        { id: 'returns', label: isBn ? 'রিটার্ন ইঞ্জিন (Returns.view)' : 'Returns.view', ext: '.view', icon: FileCode },
        { id: 'warranty-service', label: isBn ? 'ওয়ারেন্টি আরএমএ (WarrantyService.view)' : 'WarrantyService.view', ext: '.view', icon: Cpu, count: activeWarrantyCount }
      ]
    },
    {
      id: 'field',
      folderName: isBn ? '04_ফিল্ড_অপারেশনস' : '04_Field_Operations',
      items: [
        { id: 'salesmen', label: isBn ? 'সেলসম্যান তালিকা (Salesmen.view)' : 'Salesmen.view', ext: '.view', icon: Users },
        { id: 'salesman-app', label: isBn ? 'মোবাইল সেলসম্যান পোর্টাল (SalesmanApp.view)' : 'SalesmanApp.view', ext: '.view', icon: Smartphone },
        { id: 'field-visits', label: isBn ? 'ফিল্ড ভিজিট লগ (FieldVisits.view)' : 'FieldVisits.view', ext: '.view', icon: FileText }
      ]
    },
    {
      id: 'finance',
      folderName: isBn ? '05_ফাইন্যান্স_ও_অ্যাকাউন্টিং' : '05_Finance_Accounting',
      items: [
        { id: 'cash-bank', label: isBn ? 'ক্যাশ ও ব্যাংক খতিয়ান (CashBank.view)' : 'CashBank.view', ext: '.view', icon: Wallet },
        { id: 'bank-reconciliation', label: isBn ? 'ব্যাংক রিকনসিলিয়েশন (BankReconciliation.view)' : 'BankReconciliation.view', ext: '.view', icon: FileCode },
        { id: 'day-closing', label: isBn ? 'দিন সমাপ্তি ও ক্যাশ ড্রয়ার (DayClosing.view)' : 'DayClosing.view', ext: '.view', icon: Clock },
        { id: 'expenses', label: isBn ? 'দৈনিক খরচ ও ভাউচার (Expenses.view)' : 'Expenses.view', ext: '.view', icon: FileText },
        { id: 'accounting', label: isBn ? 'জেনারেল লেজার (Accounting.view)' : 'Accounting.view', ext: '.view', icon: Database }
      ]
    },
    {
      id: 'reports',
      folderName: isBn ? '06_রিপোর্ট_ও_বিশ্লেষণ' : '06_BI_Reports_Analytics',
      items: [
        { id: 'reports', label: isBn ? 'ডায়নামিক রিপোর্ট (BusinessReports.view)' : 'BusinessReports.view', ext: '.view', icon: FileSpreadsheet },
        { id: 'custom-reports', label: isBn ? 'কাস্টম রিপোর্ট বিল্ডার (CustomReports.view)' : 'CustomReports.view', ext: '.view', icon: FileCode }
      ]
    },
    {
      id: 'system',
      folderName: isBn ? '07_সিস্টেম_ও_সিকিউরিটি' : '07_System_Security',
      items: [
        { id: 'data-import', label: isBn ? 'ডাটা ইম্পোর্ট এক্সেল (DataImport.view)' : 'DataImport.view', ext: '.view', icon: Database },
        { id: 'api-integrations', label: isBn ? 'এপিআই ও ক্লাউড সংযোগ (ApiIntegrations.view)' : 'ApiIntegrations.view', ext: '.view', icon: Terminal },
        { id: 'audit-logs', label: isBn ? 'অডিট লগ ও ট্রেইল (AuditLogs.view)' : 'AuditLogs.view', ext: '.view', icon: Shield },
        { id: 'settings', label: isBn ? 'সিস্টেম কনফিগারেশন (Settings.view)' : 'Settings.view', ext: '.view', icon: Settings }
      ]
    }
  ];

  const filteredFolders = solutionFolders.map(folder => ({
    ...folder,
    items: folder.items.filter(it => {
      const allowed = hasPermission(currentUserRole, it.id);
      if (!allowed) return false;
      if (!filterSearch) return true;
      return (
        it.label.toLowerCase().includes(filterSearch.toLowerCase()) ||
        it.id.toLowerCase().includes(filterSearch.toLowerCase())
      );
    })
  })).filter(folder => folder.items.length > 0);

  return (
    <aside
      className={`relative z-20 shrink-0 h-full flex flex-col bg-[#252526] text-[#cccccc] dark:bg-[#252526] dark:text-[#cccccc] border-r border-[#3f3f46] select-none transition-all duration-150 ${
        isExpanded ? 'w-72 md:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
      }`}
    >
      {/* Tool Window Titlebar: Solution Explorer */}
      <div className="h-7 bg-[#2d2d30] px-2 flex items-center justify-between border-b border-[#3f3f46] text-[11.5px] font-semibold text-white">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="w-3.5 h-3.5 text-[#007acc] shrink-0" />
          <span className="truncate">Solution Explorer</span>
        </div>

        {/* Toolbar Buttons: Collapse, Expand, Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={collapseAllSections}
            className="w-5 h-5 flex items-center justify-center hover:bg-[#38383c] rounded-xs text-[#858585] hover:text-white transition cursor-pointer"
            title="Collapse All Folders"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={expandAllSections}
            className="w-5 h-5 flex items-center justify-center hover:bg-[#38383c] rounded-xs text-[#858585] hover:text-white transition cursor-pointer"
            title="Expand All Folders"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-5 h-5 flex items-center justify-center hover:bg-[#38383c] rounded-xs text-[#858585] hover:text-white transition cursor-pointer"
              title="Hide Solution Explorer (Ctrl+[)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Solution Filter / Search Input */}
      <div className="p-1.5 bg-[#252526] border-b border-[#333337]">
        <div className="relative">
          <Search className="w-3 h-3 text-[#858585] absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Solution Explorer (Ctrl+;)..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-6 pr-5 py-1 text-[11.5px] font-mono text-[#d4d4d4] placeholder-[#717171] bg-[#1e1e1e] border border-[#3f3f46] rounded-xs focus:border-[#007acc] focus:outline-hidden"
          />
          {filterSearch && (
            <button
              type="button"
              onClick={() => setFilterSearch('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[#858585] hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Solution Tree View */}
      <div className="flex-1 overflow-y-auto p-1 text-[11.5px] font-mono space-y-0.5 select-none">
        {/* Solution Root Node */}
        <div className="px-1 py-1 flex items-center gap-1.5 text-white font-bold bg-[#1e1e1e] border border-[#333337] rounded-xs mb-1">
          <div className="w-3.5 h-3.5 bg-[#007acc] rounded-xs flex items-center justify-center text-white text-[9px] font-sans font-bold">
            S
          </div>
          <span className="truncate">Solution 'TeleCorp.ERP' (38 Projects)</span>
        </div>

        {/* Folders & Documents Tree */}
        {filteredFolders.map(folder => {
          const isCollapsed = collapsedSections[folder.id];
          return (
            <div key={folder.id} className="space-y-0.5">
              {/* Folder Node Header */}
              <div
                onClick={() => toggleSection(folder.id)}
                className="px-1.5 py-1 flex items-center justify-between hover:bg-[#2a2d2e] rounded-xs cursor-pointer text-[#cccccc] hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-[#858585] group-hover:text-white" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#858585] group-hover:text-white" />
                  )}
                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-[#dcb67a]" />
                  )}
                  <span className="truncate font-semibold text-[11.5px]">{folder.folderName}</span>
                </div>
                <span className="text-[10px] text-[#717171] font-mono">({folder.items.length})</span>
              </div>

              {/* Child Files */}
              {!isCollapsed && (
                <div className="pl-5 space-y-0.5 border-l border-[#333337] ml-2.5">
                  {folder.items.map(item => {
                    const isActive = currentView === item.id;
                    const ItemIcon = item.icon || FileCode;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectView(item.id)}
                        className={`px-2 py-1 flex items-center justify-between rounded-xs cursor-pointer transition ${
                          isActive
                            ? 'bg-[#094771] text-white font-bold border border-[#007acc]'
                            : 'hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#007acc]' : 'text-[#4ec9b0]'}`} />
                          <span className="truncate text-[11px]">{item.label}</span>
                        </div>

                        {/* Badges / Metrics */}
                        {item.alertCount ? (
                          <span className="px-1.5 py-0.2 rounded-xs bg-[#a80000] text-white text-[9.5px] font-bold font-mono">
                            {item.alertCount}
                          </span>
                        ) : item.count !== undefined && item.count > 0 ? (
                          <span className="px-1 py-0.2 rounded-xs bg-[#333337] text-[#9cdcfe] text-[9px] font-mono">
                            {item.count}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Properties Dock at bottom of Solution Explorer */}
      <div className="h-28 bg-[#1e1e1e] border-t border-[#3f3f46] p-2 text-[10.5px] font-mono flex flex-col justify-between select-text">
        <div className="flex items-center justify-between pb-1 border-b border-[#333337] text-[#858585] text-[10px] font-bold uppercase">
          <span>Module Properties</span>
          <span className="text-[#007acc]">{currentView || 'Ready'}</span>
        </div>
        <div className="space-y-0.5 text-[#858585] truncate">
          <div>Build Action: <span className="text-[#4ec9b0]">EnterpriseView</span></div>
          <div>Copy to Output: <span className="text-[#ce9178]">Always</span></div>
          <div>Runtime Status: <span className="text-[#4ec9b0]">Compiled (Live)</span></div>
        </div>
        <div className="text-[9.5px] text-[#717171] truncate">
          File: src/components/views/{currentView}.tsx
        </div>
      </div>
    </aside>
  );
};
