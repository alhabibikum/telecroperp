import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Check,
  X,
  Link2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/formatters';

interface DesktopViewProps {
  onOpenApp: (viewId: string) => void;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'accounting-desk',
    name: 'করপোরেট ফিনান্স ও হিসাবরক্ষণ ডেস্ক',
    category: 'অ্যাকাউন্টিং ও অডিট',
    description: 'প্রফেশনাল ফিনান্সিয়াল লেজার, অ্যানালিটিক্স চার্ট ও এক্সিকিউটিভ ওয়ার্কস্পেস',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'executive-office',
    name: 'মডার্ন এক্সিকিউটিভ কর্পোরেট অফিস',
    category: 'কর্পোরেট স্যুট',
    description: 'আধুনিক আর্কিটেকচারাল কর্পোরেট অফিস রুম ও কনফারেন্স ড্রাইভ',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'financial-district',
    name: 'ফিনান্সিয়াল ডিস্ট্রিক্ট ও হাইরাইজ',
    category: 'গ্লোবাল ব্যাংকিং',
    description: 'আন্তর্জাতিক বাণিজ্যিক সদর দপ্তর ও অর্থনৈতিক টাওয়ার',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'business-analytics',
    name: 'বিজনেস ডেটা ও রেভিনিউ চার্টস',
    category: 'অ্যানালিটিক্স ও রিপোর্টস',
    description: 'ডিজিটাল ব্যবসায়িক গ্রাফ, সেলস অ্যানালিসিস ও প্রবৃদ্ধি ড্যাশবোর্ড',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'dark-boardroom',
    name: 'মিনিমাল ডার্ক এক্সিকিউটিভ কেবিন',
    category: 'লাক্সারি লাউঞ্জ',
    description: 'স্নিগ্ধ ডার্ক মোড এক্সিকিউটিভ বোর্ডরুম ও প্রিমিয়াম অ্যাথলেটিক',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'modern-workspace',
    name: 'স্মার্ট ফিনান্স কর্পোরেট ফ্লোর',
    category: 'অফিস ফ্লোর',
    description: 'উজ্জ্বল ওপেন-স্পেস আধুনিক ব্যবসায়িক ওয়ার্কস্টেশন',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=480&auto=format&fit=crop'
  }
];

const DEFAULT_WALLPAPER_URL = WALLPAPER_PRESETS[0].url;
const STORAGE_KEY_WALLPAPER = 'TELECORP_DESKTOP_WALLPAPER';
const STORAGE_KEY_OPACITY = 'TELECORP_DESKTOP_WALLPAPER_OPACITY';

export const DesktopView: React.FC<DesktopViewProps> = ({ onOpenApp }) => {
  const { salesInvoices, imeis, customers, isOnline } = useERP();

  // Desktop Wallpaper State with LocalStorage Persistence
  const [wallpaper, setWallpaper] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WALLPAPER) || DEFAULT_WALLPAPER_URL;
    } catch {
      return DEFAULT_WALLPAPER_URL;
    }
  });

  const [overlayOpacity, setOverlayOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPACITY);
      return saved ? Number(saved) : 65;
    } catch {
      return 65;
    }
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyWallpaper = (url: string) => {
    setWallpaper(url);
    try {
      localStorage.setItem(STORAGE_KEY_WALLPAPER, url);
    } catch (e) {
      console.error('Failed to save wallpaper to localStorage', e);
    }
    showToast('ডেস্কটপ ব্যাকগ্রাউন্ড সফলভাবে পরিবর্তিত হয়েছে!');
  };

  const handleOpacityChange = (val: number) => {
    setOverlayOpacity(val);
    try {
      localStorage.setItem(STORAGE_KEY_OPACITY, String(val));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetToDefault = () => {
    applyWallpaper(DEFAULT_WALLPAPER_URL);
    handleOpacityChange(65);
    showToast('ডিফল্ট হিসাবরক্ষণ ব্যাকগ্রাউন্ডে ফিরে আসা হয়েছে');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবির ফাইল (JPG, PNG, WebP) নির্বাচন করুন');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale to max 1920px width/height to avoid localStorage quota overflow
        const canvas = document.createElement('canvas');
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          applyWallpaper(compressedDataUrl);
        } else {
          applyWallpaper(event.target?.result as string);
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('ছবিটি লোড করা সম্ভব হয়নি');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('ফাইল পড়তে সমস্যা হয়েছে');
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    applyWallpaper(customUrlInput.trim());
    setCustomUrlInput('');
  };

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
    <div
      onContextMenu={(e) => {
        // Allow user to open wallpaper settings via right click on desktop
        e.preventDefault();
        setIsSettingsModalOpen(true);
      }}
      className="h-full w-full text-white relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none"
    >
      {/* Dynamic Desktop Wallpaper Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={wallpaper}
          alt="Desktop Wallpaper"
          className="w-full h-full object-cover transition-opacity duration-700 transform-gpu"
          onError={(e) => {
            // Fallback to default if offline or invalid URL
            (e.target as HTMLImageElement).src = DEFAULT_WALLPAPER_URL;
          }}
        />
        {/* Darkness overlay for high legibility */}
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity / 100 }}
        />
        {/* Subtle radial ambient glows & vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.12),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.08),transparent_65%)]" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Desktop Widget & Branding */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 backdrop-blur-[2px]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/30 border border-white/20">
            ⚡
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-md">
              <span>TeleCorp ERP Desktop OS</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                Enterprise Edition
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium drop-shadow">
              হিসাবরক্ষণ ও কর্পোরেট ব্যবসায়িক অপারেটিং সিস্টেম • মাল্টি-টাস্কিং উইন্ডোজ
            </p>
          </div>
        </div>

        {/* Right Action Tools: Wallpaper Customizer & Quick KPI Strip */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Wallpaper Change Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/80 hover:border-blue-400/60 shadow-lg backdrop-blur-xl transition font-bold cursor-pointer hover:scale-105 active:scale-95"
            title="ডেস্কটপ ব্যাকগ্রাউন্ড ছবি বা ওয়ালপেপার পরিবর্তন করুন"
          >
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs">ওয়ালপেপার পরিবর্তন</span>
          </button>

          {/* KPI Strip */}
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg">
            <div className="px-3 py-1 rounded-xl bg-white/5 text-center">
              <span className="block text-[9px] text-slate-400 font-medium">মজুত ইউনিট</span>
              <strong className="text-emerald-400 font-bold text-xs">{inStockUnits}</strong>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/5 text-center">
              <span className="block text-[9px] text-slate-400 font-medium">মোট বিক্রয়</span>
              <strong className="text-blue-400 font-bold text-xs">{totalSalesCount}</strong>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/5 text-center">
              <span className="block text-[9px] text-slate-400 font-medium">সংযোগ</span>
              <strong className={isOnline ? 'text-emerald-400 font-bold text-xs' : 'text-amber-400 font-bold text-xs'}>
                {isOnline ? 'অনলাইন' : 'লোকাল'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop App Shortcuts Grid */}
      <div className="relative z-10 flex-1 py-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 drop-shadow">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>অ্যাপ্লিকেশন মেনু (ক্লিক করে উইন্ডো চালু করুন)</span>
          </h2>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            রাইট-ক্লিক করে যেকোনো সময় ব্যাকগ্রাউন্ড পরিবর্তন করতে পারেন
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
          {desktopApps.map(app => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onOpenApp(app.id)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900/85 border border-white/10 hover:border-blue-400/50 backdrop-blur-md transition-all duration-150 transform-gpu flex flex-col items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1 active:scale-95 text-left"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform mb-3 border border-white/20`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <strong className="text-xs font-black text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {app.title}
                </strong>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                  {app.sub}
                </span>
                <span className="mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 group-hover:bg-blue-600/40 group-hover:text-blue-200 border border-slate-700/60">
                  {app.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Bottom Guidance */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 backdrop-blur-[2px]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="drop-shadow">উইন্ডোজ ডেস্কটপ রেডি • নিচের টাস্কবার থেকে যে কোনো মিনিমাইজড উইন্ডো রিস্টোর করুন</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>ওয়ালপেপার সেটিংস</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenApp('dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 text-xs font-black transition cursor-pointer active:scale-95"
          >
            <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WALLPAPER CUSTOMIZATION MODAL */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsModalOpen(false);
          }}
        >
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>ডেস্কটপ ব্যাকগ্রাউন্ড ও ওয়ালপেপার পরিবর্তন</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    একাউন্টিং ও অফিস থিমের ছবি নির্বাচন করুন অথবা আপনার কম্পিউটার থেকে নতুন ছবি সেট করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center justify-between px-5 pt-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'presets'
                      ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>অফিস ও একাউন্টিং ছবি ({WALLPAPER_PRESETS.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>কম্পিউটার থেকে আপলোড</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>ওয়েব লিংক (URL)</span>
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-2 px-2.5 py-1 rounded-lg hover:bg-amber-400/10 transition cursor-pointer"
                title="ডিফল্ট হিসাবরক্ষণ ব্যাকগ্রাউন্ডে ফিরুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট থিম</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Opacity Adjustment Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <Sliders className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ব্যাকগ্রাউন্ড শেড ও স্বচ্ছতা (Overlay Darkness)</h4>
                    <p className="text-[11px] text-slate-400">
                      টেক্সট ও আইকন স্পষ্টভাবে পড়ার জন্য ডার্ক শেড এডজাস্ট করুন ({overlayOpacity}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="text-[10px] text-slate-400">উজ্জ্বল</span>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    value={overlayOpacity}
                    onChange={(e) => handleOpacityChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">ডার্ক</span>
                </div>
              </div>

              {/* TAB 1: PRESETS */}
              {activeTab === 'presets' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {WALLPAPER_PRESETS.map((preset) => {
                      const isSelected = wallpaper === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => applyWallpaper(preset.url)}
                          className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 transform-gpu hover:scale-[1.02] ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-xl shadow-blue-500/20'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="h-28 w-full relative overflow-hidden bg-slate-950">
                            <img
                              src={preset.thumbnail}
                              alt={preset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center gap-1 shadow-lg">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>সক্রিয়</span>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2">
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-blue-300 border border-blue-500/30">
                                {preset.category}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3 bg-slate-950/90">
                            <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                              {preset.name}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD FROM COMPUTER */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl bg-slate-950/50 hover:bg-slate-900/60 transition cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20 group-hover:scale-110 transition-all flex items-center justify-center mb-4 border border-blue-500/30">
                      <Upload className="w-8 h-8" />
                    </div>
                    <strong className="text-sm font-bold text-white mb-1">
                      {isUploading ? 'ছবি প্রসেস করা হচ্ছে...' : 'আপনার কম্পিউটার থেকে ছবি নির্বাচন করুন'}
                    </strong>
                    <p className="text-xs text-slate-400 max-w-sm mb-4">
                      ক্লিক করে আপনার নিজস্ব অফিস, ব্যানার বা অ্যাকাউন্টিং ব্যাকগ্রাউন্ড ছবি সিলেক্ট করুন (JPG, PNG, WebP)
                    </p>
                    <span className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition">
                      ফাইল ব্রাউজ করুন
                    </span>
                  </div>

                  {wallpaper.startsWith('data:image') && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={wallpaper}
                          alt="Custom Upload Preview"
                          className="w-12 h-10 object-cover rounded-lg border border-slate-700"
                        />
                        <div>
                          <strong className="text-xs text-white block">আপনার আপলোড করা কাস্টম ছবি সক্রিয়</strong>
                          <span className="text-[10px] text-emerald-400">লোকাল স্টোরেজে সংরক্ষিত রয়েছে</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-3 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition cursor-pointer"
                      >
                        মুছে ফেলুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOM URL */}
              {activeTab === 'url' && (
                <form onSubmit={handleCustomUrlSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      অনলাইন ছবির ডিরেক্ট লিংক (Image Web URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/office-wallpaper.jpg"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
                      >
                        প্রয়োগ করুন
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    টিপস: Unsplash, Pexels বা আপনার কোম্পানির ওয়েবসাইটে হোস্ট করা যেকোনো হাই-কোয়ালিটি ছবির লিংক দিতে পারেন।
                  </p>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                পরিবর্তন সাথে সাথে সেভ হয়ে পরবর্তী সেশনের জন্য সংরক্ষিত থাকে
              </span>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
