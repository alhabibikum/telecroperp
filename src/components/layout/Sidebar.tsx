import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  LayoutDashboard,
  Smartphone,
  ShieldAlert,
  BadgeDollarSign,
  ShoppingCart,
  Boxes,
  Truck,
  Building2,
  Users2,
  Wallet,
  Clock,
  FileSpreadsheet,
  Settings2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeftRight,
  Receipt,
  RotateCcw,
  Sparkles,
  QrCode,
  DollarSign,
  RefreshCw,
  Wrench,
  CheckCircle2,
  PackageCheck,
  X,
  LogOut
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
    currentUser,
    hasPermission,
    logout
  } = useERP();

  const isBn = settings.language === 'bn';
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const overdueCustomersCount = customers.filter(c => c.currentDue > 0).length;

  const menuSections = [
    {
      id: 'core',
      title: isBn ? 'ড্যাশবোর্ড ও ককপিট' : 'Overview & Cockpit',
      items: [
        { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড (Dashboard)' : 'Dashboard', icon: LayoutDashboard },
        { id: 'imei-trace', label: isBn ? 'আইএমইআই ট্রেস' : 'IMEI Trace', icon: Smartphone, badge: imeis.length ? `${imeis.length}` : undefined },
        { id: 'alert-center', label: isBn ? 'অ্যালার্ট ও নোটিফিকেশন' : 'Alert Center', icon: ShieldAlert, badge: unreadAlerts ? `${unreadAlerts}` : undefined, badgeColor: 'bg-rose-600 text-white' }
      ]
    },
    {
      id: 'rma_doa',
      title: isBn ? 'ডিওএ ও কোয়ালিটি কন্ট্রোল' : 'DOA & Quality Control',
      items: [
        { id: 'warranty-service', label: isBn ? 'DOA / Defective ম্যানেজমেন্ট' : 'DOA & Defective Management', icon: Wrench, badge: warrantyClaims.length ? `${warrantyClaims.length}` : undefined },
        { id: 'returns', label: isBn ? 'ভেন্ডর ও কাস্টমার রিটার্ন' : 'Vendor & Customer Returns', icon: RotateCcw }
      ]
    },
    {
      id: 'logistics',
      title: isBn ? 'ডিসপ্যাচ ও ওয়্যারহাউজ' : 'Warehouse & Logistics',
      items: [
        { id: 'delivery-dispatch', label: isBn ? 'ওয়্যারহাউজ ডিসপ্যাচ ও ট্র্যাকিং' : 'Warehouse Dispatch Bay', icon: Truck },
        { id: 'stock-transfers', label: isBn ? 'স্টক ট্রান্সফার চালান' : 'Stock Transfers', icon: ArrowLeftRight },
        { id: 'warehouses', label: isBn ? 'ওয়্যারহাউজ ও গোডাউন' : 'Warehouses & Godowns', icon: Building2 },
        { id: 'barcode-labels', label: isBn ? 'বারকোড ও লেবেল প্রিন্ট' : 'Barcode & Labels', icon: QrCode }
      ]
    },
    {
      id: 'sales',
      title: isBn ? 'বিক্রয় ও বিতরণ' : 'Sales & Distribution',
      items: [
        { id: 'wholesale-sales', label: isBn ? 'পাইকারি বিক্রয় (B2B)' : 'Wholesale Sales', icon: BadgeDollarSign },
        { id: 'retail-pos', label: isBn ? 'কাউন্টার পিওএস' : 'Retail POS', icon: ShoppingCart },
        { id: 'due-collection', label: isBn ? 'বকেয়া কালেকশন' : 'Due Collection', icon: Wallet },
        { id: 'due-ageing', label: isBn ? 'বকেয়া এইজিং রিপোর্ট' : 'Due Ageing', icon: Clock, badge: overdueCustomersCount ? `${overdueCustomersCount}` : undefined },
        { id: 'emi-installment', label: isBn ? 'কিস্তি ও ইএমআই' : 'EMI Financing', icon: Receipt },
        { id: 'phone-exchange', label: isBn ? 'ফোন এক্সচেঞ্জ' : 'Phone Trade-in', icon: ArrowLeftRight }
      ]
    },
    {
      id: 'inventory',
      title: isBn ? 'ইনভেন্টরি ও সাপ্লাই' : 'Inventory & Supply',
      items: [
        { id: 'inventory', label: isBn ? 'পণ্য ও লাইভ স্টক' : 'Inventory & IMEIs', icon: Boxes },
        { id: 'purchases', label: isBn ? 'পারচেজ ও চালান' : 'Purchases & Inward', icon: Truck }
      ]
    },
    {
      id: 'partners',
      title: isBn ? 'পার্টনার্স ও সিআরএম' : 'Partners & CRM',
      items: [
        { id: 'customers', label: isBn ? 'কাস্টমার ও ডিলার' : 'Customers', icon: Users2 },
        { id: 'suppliers', label: isBn ? 'সাপ্লায়ার তালিকা' : 'Suppliers', icon: Building2 }
      ]
    },
    {
      id: 'finance',
      title: isBn ? 'হিসাবরক্ষণ ও ফাইন্যান্স' : 'Finance & Accounting',
      items: [
        { id: 'day-closing', label: isBn ? 'দিন সমাপ্তি (Day Closing)' : 'Day Closing', icon: Clock },
        { id: 'cash-bank', label: isBn ? 'ক্যাশ ও ব্যাংক লেজার' : 'Cash & Bank', icon: Wallet },
        { id: 'bank-reconciliation', label: isBn ? 'ব্যাংক রিকনসিলিয়েশন' : 'Bank Reconciliation', icon: RefreshCw },
        { id: 'expenses', label: isBn ? 'দৈনিক খরচ ও ব্যয়' : 'Daily Expenses', icon: DollarSign },
        { id: 'accounting', label: isBn ? 'জেনারেল লেজার (GL)' : 'Accounting Ledger', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'reports',
      title: isBn ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      items: [
        { id: 'dynamic-business-report', label: isBn ? 'বিজনেস রিপোর্ট' : 'Business Reports', icon: FileSpreadsheet },
        { id: 'classic-reports', label: isBn ? 'ফাইন্যান্সিয়াল অডিট' : 'Financial Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'settings',
      title: isBn ? 'সিস্টেম ও কনফিগারেশন' : 'System Configuration',
      items: [
        { id: 'settings', label: isBn ? 'সিস্টেম সেটিংস' : 'System Settings', icon: Settings2 }
      ]
    }
  ];

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!hasPermission(currentUserRole, item.id)) return false;
      if (!search.trim()) return true;
      return item.label.toLowerCase().includes(search.toLowerCase());
    })
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className={`h-full bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 border-r border-slate-200/90 dark:border-slate-800 flex flex-col shrink-0 select-none transition-all duration-200 z-20 shadow-xs ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top Sidebar Header */}
      {isExpanded ? (
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-500/20">
                {settings?.companyName ? settings.companyName.trim().substring(0, 2).toUpperCase() : 'TC'}
              </div>
              <div className="truncate">
                <div className="text-[14px] font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
                  {settings?.companyName || 'TeleCorp ERP'}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Enterprise Portal
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="মেনু খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                title="মুছে ফেলুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center bg-slate-50/70 dark:bg-slate-900/60">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-500/20" title={settings?.companyName || 'TeleCorp ERP'}>
            {settings?.companyName ? settings.companyName.trim().substring(0, 2).toUpperCase() : 'TC'}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {filteredSections.map(section => {
          const isCollapsed = collapsedCategories[section.id];
          return (
            <div key={section.id} className="space-y-1">
              {isExpanded && (
                <div
                  onClick={() => toggleCategory(section.id)}
                  className="px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-between cursor-pointer transition select-none"
                >
                  <span>{section.title}</span>
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              )}

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;

                    if (!isExpanded) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectView(item.id)}
                          title={item.label}
                          className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition cursor-pointer relative ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                          )}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition cursor-pointer text-left border relative ${
                          isActive
                            ? 'bg-blue-50/90 dark:bg-blue-600/15 text-blue-700 dark:text-blue-400 border-l-4 border-l-blue-600 dark:border-l-blue-500 border-t-transparent border-r-transparent border-b-transparent shadow-2xs font-bold'
                            : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4.5 h-4.5 shrink-0 transition ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-400 dark:text-slate-400'
                          }`}
                        />
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[11.5px] font-mono px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                                item.badgeColor
                                  ? item.badgeColor
                                  : isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Account and navigation controls stay at the bottom of the sidebar. */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
        <div className={`p-2.5 flex items-center gap-2 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-8 h-8 shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-xs flex items-center justify-center border border-blue-300 dark:border-blue-700">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {currentUserRole}
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="shrink-0 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 dark:hover:border-rose-900 rounded-lg transition cursor-pointer"
            title="লগআউট (Logout)"
            aria-label="লগআউট (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {onToggleExpand && (
          <div className={`px-2.5 pb-2.5 flex items-center gap-2 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
            {isExpanded && (
              <div className="flex min-w-0 items-center gap-2 pl-1 truncate">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  {currentUserRole} • Online
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleExpand}
              className={`p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer ${
                !isExpanded ? 'w-full flex items-center justify-center' : ''
              }`}
              title={isExpanded ? 'সাইডবার গুটিয়ে নিন (Collapse)' : 'সাইডবার প্রসারিত করুন (Expand)'}
            >
              {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
