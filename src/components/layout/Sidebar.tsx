import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  ShoppingBag,
  Store,
  Warehouse,
  Truck,
  Users,
  CreditCard,
  Building2,
  Undo2,
  UserCheck,
  Wallet,
  Receipt,
  BookOpen,
  FileSpreadsheet,
  AlertOctagon,
  History,
  Settings,
  ShieldCheck,
  ArrowRightLeft,
  DollarSign,
  RotateCcw,
  Barcode,
  Award,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Clock,
  SlidersHorizontal,
  Upload,
  TrendingDown,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Link,
  LogOut,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2
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
  isExpanded = false,
  onToggleExpand
}) => {
  const {
    settings,
    alerts,
    imeis,
    customers,
    warrantyClaims,
    emiPlans,
    currentUser,
    currentUserRole,
    hasPermission,
    logout,
    users,
    demoUsers,
    loginAsDemoUser
  } = useERP();

  const isBn = settings.language === 'bn';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const overdueCustomersCount = customers.filter(c => c.currentDue > 0).length;
  const activeWarrantyCount = warrantyClaims.filter(w => w.status !== 'Delivered to Customer' && w.status !== 'Rejected').length;

  const navSections = [
    {
      id: 'overview',
      title: isBn ? 'মূল ড্যাশবোর্ড' : 'Overview & Cockpit',
      items: [
        {
          id: 'dashboard',
          label: isBn ? 'অপারেশনাল ড্যাশবোর্ড' : 'Operations Cockpit',
          icon: LayoutDashboard,
          accent: 'from-blue-500 via-indigo-600 to-violet-600',
          badge: null
        },
        {
          id: 'imei-trace',
          label: isBn ? 'আইএমইআই ৩৬০° লাইফসাইকেল' : 'IMEI 360° Tracker',
          icon: Smartphone,
          accent: 'from-sky-500 via-cyan-600 to-blue-600',
          badge: `${imeis.length}`
        },
        {
          id: 'alert-center',
          label: isBn ? 'অ্যালার্ট ও রিয়েলটাইম মনিটর' : 'Alerts & Real-time Monitor',
          icon: AlertOctagon,
          accent: 'from-rose-500 via-pink-600 to-red-600',
          badge: unreadAlerts > 0 ? `${unreadAlerts}` : null,
          badgeColor: 'bg-rose-500 text-white'
        }
      ]
    },
    {
      id: 'sales',
      title: isBn ? 'বিক্রয় ও ডিস্ট্রিবিউশন' : 'Sales & Distribution',
      items: [
        {
          id: 'wholesale-sales',
          label: isBn ? 'পাইকারি সেলস ও ইনভয়েস' : 'Wholesale Sales Invoicing',
          icon: ShoppingBag,
          accent: 'from-emerald-500 via-teal-600 to-green-600'
        },
        {
          id: 'retail-pos',
          label: isBn ? 'রিটেইল পিওএস কাউন্টার' : 'Retail POS Express Counter',
          icon: Store,
          accent: 'from-teal-500 via-emerald-600 to-cyan-600'
        },
        {
          id: 'delivery-dispatch',
          label: isBn ? 'ডেলিভারি চালান ও কুরিয়ার' : 'Delivery Challan & Logistics',
          icon: Truck,
          accent: 'from-cyan-500 via-blue-600 to-indigo-600'
        },
        {
          id: 'phone-exchange',
          label: isBn ? 'ফোন এক্সচেঞ্জ ও ট্রেড-ইন' : 'Phone Exchange & Trade-In',
          icon: RotateCcw,
          accent: 'from-amber-500 via-orange-600 to-red-500'
        },
        {
          id: 'emi-installment',
          label: isBn ? 'কিস্তি ও ইএমআই হায়ার-পারচেজ' : 'EMI & Hire-Purchase Hub',
          icon: CreditCard,
          accent: 'from-violet-500 via-purple-600 to-indigo-600',
          badge: emiPlans.filter(p => p.status === 'Active').length > 0 ? `${emiPlans.filter(p => p.status === 'Active').length}` : null,
          badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300'
        },
        {
          id: 'due-ageing',
          label: isBn ? 'বকেয়া ও এইজিং অ্যানালাইসিস' : 'Due Ageing & Credit Control',
          icon: CreditCard,
          accent: 'from-amber-500 via-yellow-600 to-amber-600',
          badge: overdueCustomersCount > 0 ? `${overdueCustomersCount}` : null,
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300'
        },
        {
          id: 'due-collection',
          label: isBn ? 'বকেয়া কালেকশন ও রসিদ' : 'Due Collection & Receipts',
          icon: Receipt,
          accent: 'from-emerald-600 via-teal-700 to-green-700'
        },
        {
          id: 'sms-marketing',
          label: isBn ? 'বাল্ক এসএমএস ও অটোমেশন' : 'SMS Marketing & Automation',
          icon: MessageSquare,
          accent: 'from-indigo-500 via-purple-600 to-violet-600'
        }
      ]
    },
    {
      id: 'inventory',
      title: isBn ? 'ইনভেন্টরি ও গুদাম' : 'Inventory & Warehousing',
      items: [
        {
          id: 'inventory',
          label: isBn ? 'স্টক ব্যালেন্স ও ভ্যালুয়েশন' : 'Stock & Serial Valuation',
          icon: Layers,
          accent: 'from-blue-600 via-indigo-600 to-cyan-600'
        },
        {
          id: 'barcode-labels',
          label: isBn ? 'বারকোড ও বক্স স্টিকার' : 'Barcode & Box Stickers',
          icon: Barcode,
          accent: 'from-slate-700 via-slate-800 to-zinc-900'
        },
        {
          id: 'brands',
          label: isBn ? 'ব্র্যান্ড ও অথরাইজেশন' : 'Brand Master & OEM',
          icon: ShieldCheck,
          accent: 'from-teal-500 via-emerald-600 to-teal-700'
        },
        {
          id: 'warehouses',
          label: isBn ? 'মাল্টি-ওয়্যারহাউজ ও শোরুম' : 'Multi-Hub & Outlets',
          icon: Warehouse,
          accent: 'from-purple-500 via-indigo-600 to-blue-600'
        },
        {
          id: 'stock-transfers',
          label: isBn ? 'ইন্টার-ওয়্যারহাউজ ট্রান্সফার' : 'Inter-Branch Transfers',
          icon: ArrowRightLeft,
          accent: 'from-sky-500 via-blue-600 to-teal-600'
        }
      ]
    },
    {
      id: 'procurement',
      title: isBn ? 'পারচেজ ও সাপ্লায়ার' : 'Purchasing & Suppliers',
      items: [
        {
          id: 'purchases',
          label: isBn ? 'সাপ্লায়ার পারচেজ বিল' : 'Purchase Orders & Bills',
          icon: Truck,
          accent: 'from-blue-600 via-indigo-700 to-violet-700'
        },
        {
          id: 'suppliers',
          label: isBn ? 'সাপ্লায়ার লেজার ও পেয়াবল' : 'Suppliers & Payables Ledger',
          icon: Building2,
          accent: 'from-slate-700 via-slate-800 to-zinc-800'
        },
        {
          id: 'brand-incentives',
          label: isBn ? 'ব্র্যান্ড টার্গেট ও ইনসেন্টিভ' : 'Brand Volume Incentive Scheme',
          icon: Award,
          accent: 'from-amber-500 via-yellow-600 to-orange-500'
        },
        {
          id: 'price-drop',
          label: isBn ? 'প্রাইস ড্রপ প্রটেকশন ক্লেইম' : 'Price Protection Rebate Claims',
          icon: TrendingDown,
          accent: 'from-rose-500 via-red-600 to-pink-600'
        }
      ]
    },
    {
      id: 'service',
      title: isBn ? 'রিটার্নস ও সার্ভিস' : 'Returns & Service RMA',
      items: [
        {
          id: 'returns',
          label: isBn ? 'কাস্টমার ও ভেন্ডর রিটার্ন' : 'Returns Management',
          icon: Undo2,
          accent: 'from-amber-600 via-rose-600 to-red-600'
        },
        {
          id: 'warranty-service',
          label: isBn ? 'ওয়ারেন্টি ও সার্ভিস কেয়ার' : 'Warranty & Service Care RMA',
          icon: ShieldAlert,
          accent: 'from-indigo-600 via-blue-700 to-violet-700',
          badge: activeWarrantyCount > 0 ? `${activeWarrantyCount}` : null,
          badgeColor: 'bg-indigo-600 text-white'
        }
      ]
    },
    {
      id: 'parties',
      title: isBn ? 'ডিলার পার্টি ও সেলস টিম' : 'Dealers & CRM Team',
      items: [
        {
          id: 'customers',
          label: isBn ? 'ডিলার ও রিটেইলার লেজার' : 'Dealer Management & Limits',
          icon: Users,
          accent: 'from-emerald-500 via-teal-600 to-cyan-600'
        },
        {
          id: 'salesmen',
          label: isBn ? 'সেলসম্যান ও সেলস কমিশন' : 'Sales Officers & Commission',
          icon: UserCheck,
          accent: 'from-blue-500 via-indigo-600 to-sky-600'
        },
        {
          id: 'salesman-app',
          label: isBn ? 'সেলসম্যান ফিল্ড অ্যাপ (Live)' : 'Field Officer Mobile App',
          icon: Smartphone,
          accent: 'from-purple-500 via-pink-600 to-rose-500'
        },
        {
          id: 'field-visits',
          label: isBn ? 'ফিল্ড ভিজিট ও সিআরএম ট্র্যাকার' : 'Field Visits & CRM Logs',
          icon: MapPin,
          accent: 'from-rose-500 via-orange-500 to-amber-600'
        }
      ]
    },
    {
      id: 'finance',
      title: isBn ? 'ফাইন্যান্স ও অ্যাকাউন্টিং' : 'Finance & Multi-Bank',
      items: [
        {
          id: 'cash-bank',
          label: isBn ? 'ক্যাশ বুক ও ব্যাংক ব্যালেন্স' : 'Cash Book & Multi-Bank',
          icon: Wallet,
          accent: 'from-emerald-600 via-green-600 to-teal-700'
        },
        {
          id: 'bank-reconciliation',
          label: isBn ? 'ব্যাংক রিকনসিলিয়েশন' : 'Automated Bank Reconcile',
          icon: RefreshCw,
          accent: 'from-sky-500 via-blue-600 to-indigo-600'
        },
        {
          id: 'day-closing',
          label: isBn ? 'দৈনিক ডে ক্লোজিং ও ভল্ট' : 'Daily Cash Vault Closing',
          icon: Clock,
          accent: 'from-amber-500 via-orange-600 to-yellow-600'
        },
        {
          id: 'expenses',
          label: isBn ? 'অফিস ও অপারেশন খরচ' : 'Expense Vouchers & Petty Cash',
          icon: DollarSign,
          accent: 'from-rose-500 via-red-600 to-pink-600'
        },
        {
          id: 'accounting',
          label: isBn ? 'জেনারেল লেজার ও ট্রায়াল ব্যালেন্স' : 'General Ledger & COA',
          icon: BookOpen,
          accent: 'from-blue-700 via-indigo-800 to-violet-800'
        }
      ]
    },
    {
      id: 'system',
      title: isBn ? 'রিপোর্ট ও কনফিগারেশন' : 'Analytics & Configuration',
      items: [
        {
          id: 'reports',
          label: isBn ? 'ডাইনামিক বিজনেস রিপোর্ট ও ম্যানেজমেন্ট' : 'Dynamic Business Report & Management',
          icon: FileSpreadsheet,
          accent: 'from-indigo-600 via-purple-600 to-violet-700'
        },
        {
          id: 'custom-reports',
          label: isBn ? 'কাস্টম রিপোর্ট বিল্ডার' : 'Custom Report Builder',
          icon: SlidersHorizontal,
          accent: 'from-teal-600 via-emerald-700 to-green-700'
        },
        {
          id: 'data-import',
          label: isBn ? 'বাল্ক এক্সেল ডাটা ইমপোর্ট' : 'Excel Bulk Data Import',
          icon: Upload,
          accent: 'from-blue-600 via-cyan-600 to-indigo-600'
        },
        {
          id: 'api-integrations',
          label: isBn ? 'এপিআই ও পেমেন্ট গেটওয়ে' : 'API & SMS Integrations',
          icon: Link,
          accent: 'from-cyan-600 via-blue-600 to-purple-600'
        },
        {
          id: 'audit-logs',
          label: isBn ? 'অডিট ট্রেইল ও সিকিউরিটি' : 'Audit Logs & User Trace',
          icon: History,
          accent: 'from-slate-700 via-slate-800 to-zinc-900'
        },
        {
          id: 'settings',
          label: isBn ? 'সিস্টেম ব্যাকআপ ও রিসেট হাব' : 'Settings & Backup Hub',
          icon: Settings,
          accent: 'from-slate-600 via-slate-700 to-slate-900'
        }
      ]
    }
  ];

  const filteredSections = navSections.map(sec => ({
    ...sec,
    items: sec.items.filter(it => {
      const allowed = hasPermission(currentUserRole, it.id);
      if (!allowed) return false;
      if (!filterSearch) return true;
      return (
        it.label.toLowerCase().includes(filterSearch.toLowerCase()) ||
        it.id.toLowerCase().includes(filterSearch.toLowerCase())
      );
    })
  })).filter(sec => sec.items.length > 0);

  return (
    <aside
      className={`relative z-20 shrink-0 h-full flex flex-col transition-all duration-300 ease-in-out select-none ${
        isExpanded
          ? 'w-76 md:w-84 opacity-100 border-r border-slate-200/80 shadow-[4px_0_35px_rgba(15,23,42,0.06)]'
          : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
      } bg-white/90 backdrop-blur-3xl`}
    >
      {/* Top Glossy Highlight Sheen */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/40 to-teal-500/30 pointer-events-none" />

      {/* Top Header: Search & Collapse Button */}
      <div className="p-3.5 border-b border-slate-200/70 flex items-center justify-between gap-2 bg-white/50 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'মেন্যু সার্চ করুন...' : 'Search menu...'}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-bold text-slate-800 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/70 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/40 focus:bg-white transition-all shadow-inner"
          />
          {filterSearch && (
            <button
              onClick={() => setFilterSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center text-[10px] font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-2xl text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer shadow-2xs border border-slate-200/60 shrink-0"
            title="সাইডবার লুকান (Collapse Sidebar - <)"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Quick Launch Action Bar (Widget Dock) when not collapsed */}
      {!isCollapsed && !filterSearch && (
        <div className="px-3 pt-3 pb-1">
          <div className="p-2 rounded-2xl bg-gradient-to-r from-slate-100/80 via-blue-50/50 to-indigo-50/50 border border-slate-200/60 flex items-center justify-around shadow-2xs">
            <button
              onClick={() => onSelectView('imei-trace')}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Quick IMEI Scan"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700">আইএমইআই</span>
            </button>

            <div className="w-px h-6 bg-slate-200" />

            <button
              onClick={() => onSelectView('wholesale-sales')}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Quick Wholesale Sale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-emerald-700">নতুন সেলস</span>
            </button>

            <div className="w-px h-6 bg-slate-200" />

            <button
              onClick={() => onSelectView('due-collection')}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Quick Due Receipt"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-700">বকেয়া জমা</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {filteredSections.map((sec) => {
          const isSectionCollapsed = collapsedSections[sec.title] && !filterSearch;

          return (
            <div key={sec.id} className="space-y-1.5">
              {/* Category Header with Accordion Toggle */}
              {!isCollapsed && (
                <div
                  onClick={() => toggleSection(sec.title)}
                  className="px-2.5 py-1 flex items-center justify-between cursor-pointer group select-none"
                >
                  <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-slate-600 tracking-wider transition-colors">
                    {sec.title}
                  </span>
                  <span className="p-0.5 rounded-md text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                    {isSectionCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </span>
                </div>
              )}

              {/* Grouped Inset Card (iOS Style Grouped Table) */}
              {!isSectionCollapsed && (
                <div className="space-y-1 bg-slate-50/50 rounded-3xl p-1 border border-slate-200/50 shadow-2xs">
                  {sec.items.map(item => {
                    const IconComponent = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-black shadow-[0_6px_20px_rgba(79,70,229,0.35)] scale-[1.01]'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-white/90 font-bold hover:translate-x-1 hover:shadow-xs'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* iOS App Squircle Icon */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 shadow-sm ${
                            isActive
                              ? 'bg-white/25 text-white shadow-inner scale-105 backdrop-blur-md border border-white/30'
                              : `bg-gradient-to-br ${item.accent} text-white group-hover:scale-105 group-hover:shadow-md border border-white/20`
                          }`}
                        >
                          <IconComponent className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        {/* Bold & Big Label */}
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className={`text-[15px] font-black truncate tracking-tight ${
                              isActive ? 'text-white' : 'text-slate-800 group-hover:text-blue-900'
                            }`}>
                              {item.label}
                            </span>

                            {item.badge && (
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ml-2 shadow-2xs shrink-0 ${
                                  isActive
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : (item.badgeColor || 'bg-blue-100 text-blue-800')
                                }`}
                              >
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

      {/* Bottom iOS Profile & Direct Logout Dock */}
      {!isCollapsed && currentUser && (
        <div className="p-3 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/70 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-white/40">
                  {currentUser.avatar || '👨‍💼'}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-xs text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-extrabold truncate">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="সিস্টেম সচল (Active Live)" />
              </div>
            </div>

            {/* Quick Role Switcher (Admin/Owner) or Role Badge (Staff) + Direct Logout Row */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              {['Super Admin', 'Owner', 'General Manager'].includes(currentUserRole) ? (
                <select
                  value={currentUser.id}
                  onChange={(e) => loginAsDemoUser(e.target.value)}
                  className="flex-1 py-1.5 px-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:border-blue-400 transition"
                  title="রোল পরিবর্তন করুন (Switch Role)"
                >
                  {(users.length > 0 ? users : demoUsers).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.avatar} {u.name.split(' ')[0]} ({u.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex-1 py-1 px-2.5 bg-slate-100/90 rounded-xl text-[10px] font-extrabold text-slate-600 truncate border border-slate-200">
                  📍 {currentUser.branchName ? currentUser.branchName.split('(')[0] : currentUser.role}
                </div>
              )}

              {/* Direct Instant Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="সিস্টেম থেকে লগআউট করুন (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed State Quick User Avatar with Logout on Click */}
      {isCollapsed && currentUser && (
        <div className="p-3 border-t border-slate-200/80 flex flex-col items-center gap-2 bg-white/70">
          <div
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-white/40 cursor-pointer"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.avatar || '👨‍💼'}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition cursor-pointer"
            title="লগআউট (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
