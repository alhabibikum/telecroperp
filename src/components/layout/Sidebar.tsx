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
  PackageCheck
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
      className={`h-full bg-[#244b82] dark:bg-[#0b1120] text-white border-r border-[#1a3863] dark:border-slate-800 flex flex-col shrink-0 select-none transition-all duration-200 z-20 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top Sidebar Header */}
      {isExpanded && (
        <div className="p-3.5 border-b border-white/10 dark:border-slate-800 bg-[#1c3c6a] dark:bg-[#080d1a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black tracking-widest uppercase text-blue-200">
              TELECORP ENTERPRISE
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-200/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="মেনু খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#173259] dark:bg-slate-900 border border-blue-300/30 dark:border-slate-700 text-xs text-white placeholder-blue-200/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
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
                  className="px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-blue-200/70 dark:text-slate-400 flex items-center justify-between cursor-pointer hover:text-white transition"
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

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectView(item.id)}
                        title={!isExpanded ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-[13.5px] font-semibold transition cursor-pointer text-left border ${
                          isActive
                            ? 'bg-[#1a3863] text-white border-blue-400/60 shadow-xs dark:bg-blue-600 dark:border-blue-500'
                            : 'text-blue-100/90 dark:text-slate-300 border-transparent hover:bg-white/10 dark:hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-300 dark:text-white' : 'text-blue-200/80 dark:text-slate-400'}`} />
                        {isExpanded && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-none font-bold ${
                                item.badgeColor || 'bg-blue-900/80 text-blue-100 border border-blue-400/40 dark:bg-slate-800 dark:text-slate-200'
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
        <div className="p-2 border-t border-white/10 dark:border-slate-800 flex items-center justify-between bg-[#1c3c6a] dark:bg-[#080d1a]">
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center p-1.5 text-blue-200 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </aside>
  );
};
