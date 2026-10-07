import React from 'react';
import {
  LayoutDashboard,
  BadgeDollarSign,
  ShoppingCart,
  Boxes,
  Truck,
  Users2,
  Building2,
  Wallet,
  FileSpreadsheet,
  Settings2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/formatters';

interface DesktopViewProps {
  onOpenApp: (viewId: string) => void;
}

export const DesktopView: React.FC<DesktopViewProps> = ({ onOpenApp }) => {
  const { salesInvoices, imeis, customers, isOnline } = useERP();

  const totalSalesCount = salesInvoices.length;
  const inStockUnits = imeis.filter(i => i.status === 'In Stock').length;
  const totalDue = customers.reduce((sum, c) => sum + (c.currentDue || 0), 0);

  const desktopApps = [
    {
      id: 'dashboard',
      title: 'ড্যাশবোর্ড',
      sub: 'Dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-indigo-600',
      badge: `${totalSalesCount} বিক্রয়`
    },
    {
      id: 'wholesale-sales',
      title: 'পাইকারি বিক্রয়',
      sub: 'Wholesale Sales',
      icon: BadgeDollarSign,
      color: 'from-emerald-600 to-teal-700',
      badge: 'B2B ইনভয়েস'
    },
    {
      id: 'retail-pos',
      title: 'রিটেইল পিওএস',
      sub: 'Retail POS',
      icon: ShoppingCart,
      color: 'from-purple-600 to-pink-600',
      badge: 'কাউন্টার ক্যাশ'
    },
    {
      id: 'inventory',
      title: 'পণ্য ও ইনভেন্টরি',
      sub: 'Stock & Inventory',
      icon: Boxes,
      color: 'from-amber-500 to-orange-600',
      badge: `${inStockUnits} ইউনিট মজুত`
    },
    {
      id: 'purchases',
      title: 'পারচেজ ও চালান',
      sub: 'Purchases',
      icon: Truck,
      color: 'from-cyan-600 to-blue-700',
      badge: 'আমদানি / সাপ্লাই'
    },
    {
      id: 'due-collection',
      title: 'বকেয়া কালেকশন',
      sub: 'Due Collection',
      icon: Wallet,
      color: 'from-rose-600 to-red-700',
      badge: `${formatBDT(totalDue)} বকেয়া`
    },
    {
      id: 'customers',
      title: 'কাস্টমার ও ডিলার',
      sub: 'Dealers & Clients',
      icon: Users2,
      color: 'from-violet-600 to-indigo-700',
      badge: `${customers.length} ডিলার`
    },
    {
      id: 'warehouses',
      title: 'ওয়্যারহাউজ ও গোডাউন',
      sub: 'Warehouses',
      icon: Building2,
      color: 'from-slate-700 to-slate-900',
      badge: 'মাল্টি-ব্রাঞ্চ'
    },
    {
      id: 'cash-bank',
      title: 'ক্যাশ ও ব্যাংক অ্যাকাউন্ট',
      sub: 'Cash & Bank',
      icon: Wallet,
      color: 'from-emerald-700 to-teal-800',
      badge: 'লেনদেন ট্র্যাকার'
    },
    {
      id: 'dynamic-business-report',
      title: 'বিজনেস রিপোর্ট',
      sub: 'Analytics & Reports',
      icon: FileSpreadsheet,
      color: 'from-blue-700 to-slate-800',
      badge: 'ব্যবসায়িক বিশ্লেষণ'
    },
    {
      id: 'settings',
      title: 'সিস্টেম সেটিংস',
      sub: 'ERP Settings',
      icon: Settings2,
      color: 'from-slate-600 to-slate-800',
      badge: 'কনফিগারেশন'
    }
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Background Decorative Wallpaper Sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

      {/* Top Desktop Widget & Branding */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>TeleCorp ERP Desktop OS</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Windows Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              উইন্ডোজ মাল্টি-টাস্কিং আর্কিটেকচার • সমস্ত উইন্ডো সুরক্ষিত এবং মিনিমাইজড সমর্থিত
            </p>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-3 text-xs bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-center">
            <span className="block text-[10px] text-slate-400 font-medium">মজুত ইউনিট</span>
            <strong className="text-emerald-400 font-bold">{inStockUnits}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-center">
            <span className="block text-[10px] text-slate-400 font-medium">মোট বিক্রয়</span>
            <strong className="text-blue-400 font-bold">{totalSalesCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-center">
            <span className="block text-[10px] text-slate-400 font-medium">সংযোগ</span>
            <strong className={isOnline ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isOnline ? 'অনলাইন' : 'লোকাল'}
            </strong>
          </div>
        </div>
      </div>

      {/* Desktop App Shortcuts Grid */}
      <div className="relative z-10 flex-1 py-6 overflow-y-auto">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span>ডেস্কটপ অ্যাপ্লিকেশন শর্টকাট (ক্লিক করে উইন্ডো খুলুন)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {desktopApps.map(app => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onOpenApp(app.id)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 backdrop-blur-xl transition-all duration-150 transform-gpu flex flex-col items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 active:scale-95 text-left"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <strong className="text-xs font-black text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {app.title}
                </strong>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                  {app.sub}
                </span>
                <span className="mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 group-hover:bg-blue-600/30 group-hover:text-blue-200 border border-slate-700/60">
                  {app.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Bottom Guidance */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>উইন্ডোজ ডেস্কটপ রেডি • নিচের টাস্কবার থেকে যে কোনো মিনিমাইজড উইন্ডো রিস্টোর করুন</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenApp('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-black transition cursor-pointer"
        >
          <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
