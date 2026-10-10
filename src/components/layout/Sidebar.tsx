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
  RefreshCw
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
        { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
        { id: 'imei-trace', label: isBn ? 'আইএমইআই ট্রেস' : 'IMEI Trace', icon: Smartphone, badge: imeis.length ? `${imeis.length}` : undefined },
        { id: 'alert-center', label: isBn ? 'অ্যালার্ট ও নোটিফিকেশন' : 'Alert Center', icon: ShieldAlert, badge: unreadAlerts ? `${unreadAlerts}` : undefined, badgeColor: 'bg-rose-500 text-white' }
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
      title: isBn ? 'ইনভেন্টরি ও স্টক' : 'Inventory & Stock',
      items: [
        { id: 'inventory', label: isBn ? 'পণ্য ও লাইভ স্টক' : 'Inventory & IMEIs', icon: Boxes },
        { id: 'purchases', label: isBn ? 'পারচেজ ও চালান' : 'Purchases & Inward', icon: Truck },
        { id: 'stock-transfers', label: isBn ? 'স্টক ট্রান্সফার' : 'Stock Transfers', icon: ArrowLeftRight },
        { id: 'warehouses', label: isBn ? 'ওয়্যারহাউজ ও গোডাউন' : 'Warehouses', icon: Building2 },
        { id: 'barcode-labels', label: isBn ? 'বারকোড ও লেবেল' : 'Barcode Labels', icon: QrCode }
      ]
    },
    {
      id: 'partners',
      title: isBn ? 'পার্টনার্স ও সিআরএম' : 'Partners & CRM',
      items: [
        { id: 'customers', label: isBn ? 'কাস্টমার ও ডিলার' : 'Customers', icon: Users2 },
        { id: 'suppliers', label: isBn ? 'সাপ্লায়ার তালিকা' : 'Suppliers', icon: Building2 },
        { id: 'returns', label: isBn ? 'রিটার্নস ও আরএমএ' : 'Customer Returns', icon: RotateCcw }
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
      className={`h-full bg-white dark:bg-[#0d1322] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col shrink-0 select-none transition-all duration-200 z-20 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Search Header (When Expanded) */}
      {isExpanded && (
        <div className="p-3 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="মেনু খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {filteredSections.map(section => {
          const isCollapsed = collapsedCategories[section.id];
          return (
            <div key={section.id} className="space-y-1">
              {isExpanded && (
                <div
                  onClick={() => toggleCategory(section.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span>{section.title}</span>
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              )}

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectView(item.id)}
                        title={!isExpanded ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        {isExpanded && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                                item.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse/Expand Toggle Footer */}
      {onToggleExpand && (
        <div className="p-2 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </aside>
  );
};
