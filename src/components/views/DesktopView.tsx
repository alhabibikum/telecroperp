import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sparkles,
  Smartphone,
  AlertOctagon,
  Layers,
  Barcode,
  ShieldCheck,
  Warehouse,
  ArrowRightLeft,
  Award,
  Store,
  Receipt,
  CreditCard,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  RefreshCw,
  Grid,
  Monitor,
  CheckCircle2,
  Clock,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
  Flame,
  Pin
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/formatters';

interface DesktopViewProps {
  onOpenApp: (viewId: string) => void;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
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
    id: 'windows-fluent-dark',
    name: 'উইন্ডোজ ১১ ডার্ক ফ্লুয়েন্ট (অফিসিয়াল)',
    category: 'মডার্ন ওএস',
    description: 'স্নিগ্ধ ডার্ক ফ্লুইড ব্লুম আর্টওয়ার্ক • কর্পোরেট প্রফেশনাল ও আই-প্রোটেক্টিভ',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'corporate-slate-minimal',
    name: 'মডার্ন কর্পোরেট স্লেট মিনিমাল',
    category: 'মিনিমালিজম',
    description: 'ম্যাট অবসিডিয়ান ডার্ক ওয়ার্কস্পেস • গভীর মনোযোগ ও বিভ্রান্তিমুক্ত ডিজাইন',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'accounting-desk',
    name: 'করপোরেট ফিনান্স ও অডিট ডেস্ক',
    category: 'অ্যাকাউন্টিং ও অডিট',
    description: 'প্রফেশনাল ফিনান্সিয়াল লেজার, অ্যানালিটিক্স চার্ট ও এক্সিকিউটিভ ওয়ার্কস্পেস',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'financial-district',
    name: 'ফিনান্সিয়াল ডিস্ট্রিক্ট হাইরাইজ',
    category: 'গ্লোবাল ব্যাংকিং',
    description: 'আন্তর্জাতিক বাণিজ্যিক সদর দপ্তর ও আধুনিক অর্থনৈতিক টাওয়ার',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=480&auto=format&fit=crop'
  },
  {
    id: 'nordic-indigo-fluid',
    name: 'নর্ডিক ইন্ডিগো ডিপ গ্রেডিয়েন্ট',
    category: 'লাক্সারি লাউঞ্জ',
    description: 'গভীর নেভি ব্লু ও সায়ান অরোরা প্রফেশনাল ব্যাকগ্রাউন্ড',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=480&auto=format&fit=crop'
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
const STORAGE_KEY_PINNED_APPS = 'TELECORP_DESKTOP_PINNED_APPS';
const STORAGE_KEY_ICON_SIZE = 'TELECORP_DESKTOP_ICON_SIZE';
const STORAGE_KEY_SHOW_WIDGET = 'TELECORP_DESKTOP_SHOW_WIDGET';
const STORAGE_KEY_SHOW_BADGES = 'TELECORP_DESKTOP_SHOW_BADGES';
const STORAGE_KEY_ANIMATIONS = 'TELECORP_DESKTOP_ANIMATIONS';

// Default pinned apps in clean priority order
const DEFAULT_PINNED_APP_IDS = [
  'dashboard',
  'wholesale-sales',
  'retail-pos',
  'inventory',
  'purchases',
  'due-collection',
  'customers',
  'cash-bank',
  'dynamic-business-report',
  'settings'
];

interface ModuleCatalogItem {
  id: string;
  title: string;
  sub: string;
  category: 'sales' | 'inventory' | 'finance' | 'operations' | 'reports' | 'system';
  categoryLabel: string;
  icon: any;
  color: string;
  defaultBadge: string;
}

export const DesktopView: React.FC<DesktopViewProps> = ({
  onOpenApp,
  zoomLevel = 1.0,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  const { salesInvoices, imeis, customers, isOnline } = useERP();

  // Desktop Wallpaper State
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
      return saved ? Number(saved) : 60;
    } catch {
      return 60;
    }
  });

  // Pinned Apps state
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PINNED_APPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PINNED_APP_IDS;
  });

  // Icon size: 'small' | 'normal' | 'large'
  const [iconSize, setIconSize] = useState<'small' | 'normal' | 'large'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ICON_SIZE);
      if (saved === 'small' || saved === 'normal' || saved === 'large') return saved;
    } catch {}
    return 'normal';
  });

  // Advanced toggles
  const [showTopWidget, setShowTopWidget] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOW_WIDGET);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [showBadges, setShowBadges] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOW_BADGES);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANIMATIONS);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAppManagerOpen, setIsAppManagerOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'wallpaper' | 'apps' | 'appearance' | 'advanced'>('wallpaper');
  const [wallpaperSubTab, setWallpaperSubTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appCategoryFilter, setAppCategoryFilter] = useState<string>('all');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetAppId?: string;
  } | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString('bn-BD', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyWallpaper = (url: string) => {
    setWallpaper(url);
    try {
      localStorage.setItem(STORAGE_KEY_WALLPAPER, url);
    } catch (e) {
      console.error(e);
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

  const handleIconSizeChange = (size: 'small' | 'normal' | 'large') => {
    setIconSize(size);
    try {
      localStorage.setItem(STORAGE_KEY_ICON_SIZE, size);
    } catch (e) {
      console.error(e);
    }
    showToast(`আইকন সাইজ: ${size === 'small' ? 'ছোট' : size === 'normal' ? 'সাধারণ' : 'বড়'} সেট করা হয়েছে`);
  };

  const toggleAppPinned = (id: string) => {
    setPinnedAppIds(prev => {
      const isPinned = prev.includes(id);
      let updated: string[];
      if (isPinned) {
        if (prev.length <= 1) {
          showToast('কমপক্ষে ১টি অ্যাপ্লিকেশন ডেস্কটপে পিন করা থাকতে হবে');
          return prev;
        }
        updated = prev.filter(appId => appId !== id);
        showToast('ডেস্কটপ থেকে সরানো হয়েছে');
      } else {
        updated = [...prev, id];
        showToast('ডেস্কটপে পিন করা হয়েছে');
      }
      try {
        localStorage.setItem(STORAGE_KEY_PINNED_APPS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleResetAppsToDefault = () => {
    setPinnedAppIds(DEFAULT_PINNED_APP_IDS);
    try {
      localStorage.setItem(STORAGE_KEY_PINNED_APPS, JSON.stringify(DEFAULT_PINNED_APP_IDS));
    } catch (e) {
      console.error(e);
    }
    showToast('ডিফল্ট ডেস্কটপ অ্যাপ তালিকা রিস্টোর করা হয়েছে');
  };

  const handleResetDesktopAll = () => {
    applyWallpaper(DEFAULT_WALLPAPER_URL);
    handleOpacityChange(60);
    handleResetAppsToDefault();
    setIconSize('normal');
    setShowTopWidget(true);
    setShowBadges(true);
    setAnimationsEnabled(true);
    try {
      localStorage.setItem(STORAGE_KEY_SHOW_WIDGET, 'true');
      localStorage.setItem(STORAGE_KEY_SHOW_BADGES, 'true');
      localStorage.setItem(STORAGE_KEY_ANIMATIONS, 'true');
    } catch (e) {
      console.error(e);
    }
    if (onResetZoom) onResetZoom();
    showToast('সম্পূর্ণ ডেস্কটপ ওএস ফ্যাক্টরি ডিফল্টে রিসেট করা হয়েছে');
  };

  // Close context menu on any global click or Esc
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setIsSettingsModalOpen(false);
        setIsAppManagerOpen(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, targetAppId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 240;
    const menuHeight = 280;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

    setContextMenu({
      visible: true,
      x: Math.max(10, x),
      y: Math.max(10, y),
      targetAppId
    });
  };

  const totalSalesCount = salesInvoices.length;
  const inStockUnits = imeis.filter(i => i.status === 'In Stock').length;
  const totalDue = customers.reduce((sum, c) => sum + (c.currentDue || 0), 0);

  // Complete Master ERP Module Catalog
  const MASTER_CATALOG: ModuleCatalogItem[] = useMemo(() => [
    {
      id: 'dashboard',
      title: 'ড্যাশবোর্ড',
      sub: 'Cockpit & KPI',
      category: 'reports',
      categoryLabel: 'রিপোর্ট ও বিশ্লেষণ',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-indigo-600',
      defaultBadge: `${totalSalesCount} বিক্রয়`
    },
    {
      id: 'wholesale-sales',
      title: 'পাইকারি বিক্রয়',
      sub: 'Wholesale B2B',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: BadgeDollarSign,
      color: 'from-emerald-600 to-teal-700',
      defaultBadge: 'B2B ইনভয়েস'
    },
    {
      id: 'retail-pos',
      title: 'রিটেইল পিওএস',
      sub: 'Retail POS',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: ShoppingCart,
      color: 'from-purple-600 to-pink-600',
      defaultBadge: 'কাউন্টার ক্যাশ'
    },
    {
      id: 'inventory',
      title: 'পণ্য ও ইনভেন্টরি',
      sub: 'Stock & Serials',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Boxes,
      color: 'from-amber-500 to-orange-600',
      defaultBadge: `${inStockUnits} মজুত`
    },
    {
      id: 'imei-trace',
      title: 'আইএমইআই ট্রেস',
      sub: 'IMEI 360° Life',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Smartphone,
      color: 'from-sky-500 to-blue-600',
      defaultBadge: `${imeis.length} ডিভাইস`
    },
    {
      id: 'purchases',
      title: 'পারচেজ ও চালান',
      sub: 'Procurement',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Truck,
      color: 'from-cyan-600 to-blue-700',
      defaultBadge: 'স্টক ইনওয়ার্ড'
    },
    {
      id: 'due-collection',
      title: 'বকেয়া কালেকশন',
      sub: 'Due Collection',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: Wallet,
      color: 'from-rose-600 to-red-700',
      defaultBadge: `${formatBDT(totalDue)} বকেয়া`
    },
    {
      id: 'due-ageing',
      title: 'বকেয়া এইজিং',
      sub: 'Due Ageing',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: CreditCard,
      color: 'from-yellow-600 to-amber-700',
      defaultBadge: 'বকেয়া বিশ্লেষণ'
    },
    {
      id: 'phone-exchange',
      title: 'ফোন এক্সচেঞ্জ',
      sub: 'Trade-In Exchange',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: RotateCcw,
      color: 'from-orange-500 to-red-600',
      defaultBadge: 'এক্সচেঞ্জ হাব'
    },
    {
      id: 'emi-installment',
      title: 'কিস্তি ও ইএমআই',
      sub: 'EMI Schedule',
      category: 'sales',
      categoryLabel: 'বিক্রয় ও ডিলার',
      icon: CreditCard,
      color: 'from-indigo-600 to-violet-700',
      defaultBadge: 'মাসিক কিস্তি'
    },
    {
      id: 'delivery-dispatch',
      title: 'ডেলিভারি ও কুরিয়ার',
      sub: 'Dispatch Logistics',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: Truck,
      color: 'from-blue-500 to-cyan-600',
      defaultBadge: 'পার্সেল ট্র্যাকিং'
    },
    {
      id: 'sms-marketing',
      title: 'এসএমএস মার্কেটিং',
      sub: 'Bulk SMS',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      defaultBadge: 'অটোমেশন গেটওয়ে'
    },
    {
      id: 'customers',
      title: 'কাস্টমার ও ডিলার',
      sub: 'Client Master',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: Users2,
      color: 'from-violet-600 to-indigo-700',
      defaultBadge: `${customers.length} ডিলার`
    },
    {
      id: 'suppliers',
      title: 'সাপ্লায়ার তালিকা',
      sub: 'Suppliers & Vendors',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: Building2,
      color: 'from-slate-700 to-slate-900',
      defaultBadge: 'ভেন্ডর খতিয়ান'
    },
    {
      id: 'returns',
      title: 'রিটার্ন ব্যবস্থাপনা',
      sub: 'Returns Engine',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: RotateCcw,
      color: 'from-rose-500 to-pink-600',
      defaultBadge: 'কাস্টমার ও সাপ্লায়ার'
    },
    {
      id: 'warranty-service',
      title: 'ওয়ারেন্টি ও আরএমএ',
      sub: 'Warranty RMA',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: ShieldCheck,
      color: 'from-teal-600 to-emerald-700',
      defaultBadge: 'সার্ভিসিং জব'
    },
    {
      id: 'salesmen',
      title: 'মার্কেট অফিসার',
      sub: 'Field Reps',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: Users2,
      color: 'from-blue-600 to-sky-700',
      defaultBadge: 'সেলস টিম'
    },
    {
      id: 'salesman-app',
      title: 'সেলসম্যান পোর্টাল',
      sub: 'Mobile Order App',
      category: 'operations',
      categoryLabel: 'অপারেশন ও ফিল্ড',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600',
      defaultBadge: 'ফিল্ড বুকিং'
    },
    {
      id: 'stock-transfers',
      title: 'স্টক ট্রান্সফার',
      sub: 'Inter-Branch',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: ArrowRightLeft,
      color: 'from-sky-500 to-teal-600',
      defaultBadge: 'শাখা চালান'
    },
    {
      id: 'barcode-labels',
      title: 'বারকোড লেবেল',
      sub: 'Thermal Stickers',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Barcode,
      color: 'from-zinc-700 to-slate-900',
      defaultBadge: 'কিউআর ও স্টিকার'
    },
    {
      id: 'brands',
      title: 'ব্র্যান্ড ও ক্যাটাগরি',
      sub: 'Brands & Models',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: ShieldCheck,
      color: 'from-teal-500 to-emerald-600',
      defaultBadge: 'ব্র্যান্ড মাস্টার'
    },
    {
      id: 'warehouses',
      title: 'ওয়্যারহাউজ ও গোডাউন',
      sub: 'Warehouses Hub',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Warehouse,
      color: 'from-slate-700 to-slate-900',
      defaultBadge: 'শাখা হাব'
    },
    {
      id: 'brand-incentives',
      title: 'ব্র্যান্ড ইনসেন্টিভ',
      sub: 'Volume Rebates',
      category: 'inventory',
      categoryLabel: 'ইনভেন্টরি ও পণ্য',
      icon: Award,
      color: 'from-amber-600 to-yellow-600',
      defaultBadge: 'কোম্পানি টার্গেট'
    },
    {
      id: 'cash-bank',
      title: 'ক্যাশ ও ব্যাংক লেজার',
      sub: 'Cash & Bank',
      category: 'finance',
      categoryLabel: 'হিসাব ও অর্থ',
      icon: Wallet,
      color: 'from-emerald-700 to-teal-800',
      defaultBadge: 'লেনদেন ট্র্যাকার'
    },
    {
      id: 'bank-reconciliation',
      title: 'ব্যাংক রিকনসিলিয়েশন',
      sub: 'Reconciliation',
      category: 'finance',
      categoryLabel: 'হিসাব ও অর্থ',
      icon: FileSpreadsheet,
      color: 'from-blue-600 to-indigo-800',
      defaultBadge: 'চেক ও স্টেটমেন্ট'
    },
    {
      id: 'day-closing',
      title: 'দিন সমাপ্তি',
      sub: 'Day Closing',
      category: 'finance',
      categoryLabel: 'হিসাব ও অর্থ',
      icon: Wallet,
      color: 'from-purple-700 to-slate-900',
      defaultBadge: 'ড্রয়ার ক্যাশ'
    },
    {
      id: 'expenses',
      title: 'দৈনিক খরচ ও ব্যয়',
      sub: 'Office Expenses',
      category: 'finance',
      categoryLabel: 'হিসাব ও অর্থ',
      icon: Wallet,
      color: 'from-rose-600 to-amber-700',
      defaultBadge: 'বিল ও খরচ'
    },
    {
      id: 'accounting',
      title: 'অ্যাকাউন্টিং ও খতিয়ান',
      sub: 'General Ledger',
      category: 'finance',
      categoryLabel: 'হিসাব ও অর্থ',
      icon: FileSpreadsheet,
      color: 'from-indigo-700 to-blue-900',
      defaultBadge: 'ট্রায়াল ব্যালেন্স'
    },
    {
      id: 'dynamic-business-report',
      title: 'বিজনেস রিপোর্ট',
      sub: 'BI Analytics',
      category: 'reports',
      categoryLabel: 'রিপোর্ট ও বিশ্লেষণ',
      icon: FileSpreadsheet,
      color: 'from-blue-700 to-slate-800',
      defaultBadge: 'রিয়েলটাইম বিআই'
    },
    {
      id: 'custom-reports',
      title: 'কাস্টম রিপোর্ট বিল্ডার',
      sub: 'Custom Reports',
      category: 'reports',
      categoryLabel: 'রিপোর্ট ও বিশ্লেষণ',
      icon: FileSpreadsheet,
      color: 'from-slate-700 to-cyan-900',
      defaultBadge: 'ইউজার-ডিফাইন্ড'
    },
    {
      id: 'data-import',
      title: 'ডাটা ইম্পোর্ট',
      sub: 'Excel / CSV Import',
      category: 'system',
      categoryLabel: 'সিস্টেম ও কনফিগারেশন',
      icon: Upload,
      color: 'from-emerald-700 to-slate-900',
      defaultBadge: 'বাল্ক আপলোড'
    },
    {
      id: 'alert-center',
      title: 'সতর্কবার্তা সেন্টার',
      sub: 'Alert Center',
      category: 'system',
      categoryLabel: 'সিস্টেম ও কনফিগারেশন',
      icon: AlertOctagon,
      color: 'from-rose-600 to-red-800',
      defaultBadge: 'সিস্টেম মনিটর'
    },
    {
      id: 'audit-logs',
      title: 'অডিট ও সিকিউরিটি',
      sub: 'Audit Trail',
      category: 'system',
      categoryLabel: 'সিস্টেম ও কনফিগারেশন',
      icon: ShieldCheck,
      color: 'from-amber-700 to-zinc-900',
      defaultBadge: 'অ্যাক্টিভিটি লগ'
    },
    {
      id: 'api-integrations',
      title: 'এপিআই সংযোগ',
      sub: 'API & Webhooks',
      category: 'system',
      categoryLabel: 'সিস্টেম ও কনফিগারেশন',
      icon: Link2,
      color: 'from-blue-600 to-indigo-900',
      defaultBadge: 'ক্লাউড সিঙ্ক'
    },
    {
      id: 'settings',
      title: 'সিস্টেম সেটিংস',
      sub: 'ERP Settings',
      category: 'system',
      categoryLabel: 'সিস্টেম ও কনফিগারেশন',
      icon: Settings2,
      color: 'from-slate-600 to-slate-800',
      defaultBadge: 'ইউজার ও পলিসি'
    }
  ], [totalSalesCount, inStockUnits, imeis.length, totalDue, customers.length]);

  // Pinned desktop app objects
  const activeDesktopApps = useMemo(() => {
    return pinnedAppIds
      .map(id => MASTER_CATALOG.find(item => item.id === id))
      .filter(Boolean) as ModuleCatalogItem[];
  }, [pinnedAppIds, MASTER_CATALOG]);

  // Filtered module list for App Manager modal
  const filteredModulesForManager = useMemo(() => {
    return MASTER_CATALOG.filter(mod => {
      const matchesCategory =
        appCategoryFilter === 'all' || mod.category === appCategoryFilter;
      const q = appSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.sub.toLowerCase().includes(q) ||
        mod.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [MASTER_CATALOG, appCategoryFilter, appSearchQuery]);

  // Size styling classes for desktop icons
  const iconSizeClasses = {
    small: {
      wrapper: 'w-11 h-11 rounded-xl',
      icon: 'w-5 h-5',
      card: 'p-2.5 rounded-xl',
      title: 'text-[11px]',
      sub: 'text-[9px]',
      badge: 'text-[8px] px-1.5 py-0.5'
    },
    normal: {
      wrapper: 'w-13 h-13 rounded-2xl',
      icon: 'w-6 h-6',
      card: 'p-3.5 sm:p-4 rounded-2xl',
      title: 'text-xs',
      sub: 'text-[10px]',
      badge: 'text-[9px] px-2 py-0.5'
    },
    large: {
      wrapper: 'w-16 h-16 rounded-2xl',
      icon: 'w-8 h-8',
      card: 'p-4 sm:p-5 rounded-2xl',
      title: 'text-sm font-black',
      sub: 'text-[11px]',
      badge: 'text-[10px] px-2.5 py-0.5'
    }
  }[iconSize];

  // Critical rule compliance:
  // Normal state (zoomLevel <= 1.0) -> overflow-hidden (NO SCROLLING!).
  // Zoomed state (zoomLevel > 1.0) -> overflow-y-auto (scroll allowed responsibly, text adaptive).
  const isZoomed = zoomLevel > 1.0;

  return (
    <div
      onContextMenu={(e) => handleContextMenu(e)}
      className={`h-full w-full text-white relative select-none flex flex-col justify-between ${
        isZoomed ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
      } ${animationsEnabled ? 'transition-all duration-300' : ''}`}
      style={{
        // Ensure strictly non-scrollable container in normal 100% zoom
        maxHeight: isZoomed ? 'none' : '100%'
      }}
    >
      {/* Dynamic Desktop Wallpaper Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={wallpaper}
          alt="Desktop Wallpaper"
          className="w-full h-full object-cover transition-opacity duration-700 transform-gpu"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_WALLPAPER_URL;
          }}
        />
        {/* Darkness overlay for high legibility */}
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity / 100 }}
        />
        {/* Subtle vignette for crisp desktop icons */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/60" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-cyan-500/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP DESKTOP HEADER & STATUS WIDGET STRIP */}
      {/* ========================================================================= */}
      {showTopWidget && (
        <header className="relative z-10 px-4 sm:px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 backdrop-blur-[4px] shrink-0">
          {/* Left Brand & Live Clock */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/20 border border-white/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white drop-shadow">
                  TeleCorp ERP Desktop OS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Enterprise
                </span>
                {isZoomed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    জুম: {Math.round(zoomLevel * 100)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium drop-shadow flex items-center gap-2">
                <span>{currentTime}</span>
                <span>•</span>
                <span>{currentDate}</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
            {/* Add Apps to Desktop */}
            <button
              type="button"
              onClick={() => setIsAppManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 shadow-sm transition font-bold cursor-pointer active:scale-95"
              title="মডিউলগুলো থেকে নতুন অ্যাপ্লিকেশন ডেস্কটপে পিন করুন"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-300" />
              <span>অ্যাপ যুক্ত করুন</span>
            </button>

            {/* Change Wallpaper Button */}
            <button
              type="button"
              onClick={() => {
                setSettingsTab('wallpaper');
                setIsSettingsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-400/50 shadow-sm transition font-bold cursor-pointer active:scale-95"
              title="ডেস্কটপ ওয়ালপেপার পরিবর্তন"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ওয়ালপেপার</span>
            </button>

            {/* Desktop Settings Button */}
            <button
              type="button"
              onClick={() => {
                setSettingsTab('appearance');
                setIsSettingsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-400/50 shadow-sm transition font-bold cursor-pointer active:scale-95"
              title="ডেস্কটপ ডিসপ্লে ও এডভান্সড সেটিংস"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">সেটিংস</span>
            </button>

            {/* Quick KPI Counters */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/70 border border-white/10 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium">মজুত:</span>
              <strong className="text-emerald-400 font-mono text-[11px]">{inStockUnits}</strong>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-slate-400 font-medium">বিক্রয়:</span>
              <strong className="text-cyan-400 font-mono text-[11px]">{totalSalesCount}</strong>
              <span className="text-slate-600">|</span>
              <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP APP SHORTCUTS GRID */}
      {/* ========================================================================= */}
      <main
        className={`relative z-10 flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-start ${
          isZoomed ? 'overflow-y-auto' : 'overflow-hidden'
        }`}
      >
        {/* Header line */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 drop-shadow">
              ডেস্কটপ অ্যাপ্লিকেশন ({activeDesktopApps.length}টি পিন করা)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden sm:inline">
              রাইট-ক্লিক করে অ্যাপ যোগ/সরানো বা ওয়ালপেপার পরিবর্তন করা যাবে
            </span>
          </div>
        </div>

        {/* Adaptive, responsive desktop grid */}
        <div
          className={`grid gap-3 sm:gap-4 md:gap-5 ${
            iconSize === 'small'
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
              : iconSize === 'large'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          } ${isZoomed ? 'pb-10' : ''}`}
        >
          {activeDesktopApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => onOpenApp(app.id)}
                onContextMenu={(e) => handleContextMenu(e, app.id)}
                className={`group ${iconSizeClasses.card} bg-slate-950/65 hover:bg-slate-900/90 border border-white/10 hover:border-cyan-400/60 backdrop-blur-md transition-all duration-150 transform-gpu flex flex-col items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 active:scale-95 select-none relative`}
              >
                {/* App Icon Container */}
                <div
                  className={`${iconSizeClasses.wrapper} bg-gradient-to-tr ${app.color} text-white flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-transform mb-2 sm:mb-2.5 border border-white/20`}
                >
                  <Icon className={`${iconSizeClasses.icon} stroke-[2.2]`} />
                </div>

                {/* Title */}
                <strong
                  className={`${iconSizeClasses.title} font-black text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 break-words w-full`}
                >
                  {app.title}
                </strong>

                {/* Subtitle */}
                <span
                  className={`${iconSizeClasses.sub} text-slate-400 font-medium mt-0.5 line-clamp-1 w-full`}
                >
                  {app.sub}
                </span>

                {/* Dynamic Status Badge (Optional toggleable) */}
                {showBadges && (
                  <span
                    className={`mt-2 ${iconSizeClasses.badge} font-bold rounded-full bg-slate-800/90 text-slate-300 group-hover:bg-cyan-600/30 group-hover:text-cyan-200 border border-slate-700/80 truncate max-w-full`}
                  >
                    {app.defaultBadge}
                  </span>
                )}
              </div>
            );
          })}

          {/* "+ Add New App" Desktop Tile */}
          <div
            onClick={() => setIsAppManagerOpen(true)}
            className={`group ${iconSizeClasses.card} bg-slate-950/40 hover:bg-slate-900/80 border-2 border-dashed border-white/15 hover:border-cyan-400/70 backdrop-blur-xs transition-all duration-150 transform-gpu flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl active:scale-95 select-none`}
            title="মডিউল তালিকা থেকে নতুন অ্যাপ যোগ করুন"
          >
            <div
              className={`${iconSizeClasses.wrapper} rounded-2xl bg-slate-800/80 group-hover:bg-cyan-600/30 text-slate-400 group-hover:text-cyan-300 flex items-center justify-center transition-colors mb-2 border border-white/10`}
            >
              <Plus className={`${iconSizeClasses.icon}`} />
            </div>
            <strong className={`${iconSizeClasses.title} font-bold text-slate-300 group-hover:text-cyan-300`}>
              + অ্যাপ যোগ করুন
            </strong>
            <span className={`${iconSizeClasses.sub} text-slate-500 mt-0.5`}>
              মডিউল ক্যাটালগ
            </span>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* DESKTOP FOOTER HINT STRIP */}
      {/* ========================================================================= */}
      <footer className="relative z-10 px-4 sm:px-6 py-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 backdrop-blur-[3px] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="drop-shadow text-[11px] sm:text-xs">
            টেলিকর্প ইআরপি ডেস্কটপ রেডি • যেকোনো খোলা উইন্ডো নিচে টাস্কবারে মিনিমাইজ থাকে
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {/* Zoom Indicator and Reset */}
          {isZoomed && onResetZoom && (
            <button
              type="button"
              onClick={onResetZoom}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              title="স্বাভাবিক ১০০% জুমে ফিরুন"
            >
              <RotateCcw className="w-3 h-3" />
              <span>১০০% জুমে ফিরুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSettingsTab('wallpaper');
              setIsSettingsModalOpen(true);
            }}
            className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>ওয়ালপেপার সেটিংস</span>
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* RIGHT CLICK WINDOWS CONTEXT MENU */}
      {/* ========================================================================= */}
      {contextMenu?.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* App-specific actions if clicked on an app */}
          {contextMenu.targetAppId && (
            <>
              <button
                type="button"
                onClick={() => {
                  onOpenApp(contextMenu.targetAppId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>অ্যাপ্লিকেশন চালু করুন</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleAppPinned(contextMenu.targetAppId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ডেস্কটপ থেকে পিন সরান</span>
              </button>
              <div className="my-1 border-t border-slate-800" />
            </>
          )}

          {/* General Desktop Actions */}
          <button
            type="button"
            onClick={() => {
              setIsAppManagerOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>ডেস্কটপে অ্যাপ যুক্ত করুন</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingsTab('wallpaper');
              setIsSettingsModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>ওয়ালপেপার ও ব্যাকগ্রাউন্ড</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          {/* Icon Size Sub-options */}
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            আইকন সাইজ (Icon Size)
          </div>
          <div className="grid grid-cols-3 gap-1 px-2 pb-1.5">
            {(['small', 'normal', 'large'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  handleIconSizeChange(s);
                  setContextMenu(null);
                }}
                className={`py-1 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                  iconSize === s
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s === 'small' ? 'ছোট' : s === 'normal' ? 'স্বাভাবিক' : 'বড়'}
              </button>
            ))}
          </div>

          <div className="my-1 border-t border-slate-800" />

          {/* Zoom reset */}
          {onResetZoom && (
            <button
              type="button"
              onClick={() => {
                onResetZoom();
                setContextMenu(null);
                showToast('ডিসপ্লে জুম ১০০% স্বাভাবিক অবস্থায় রিসেট করা হয়েছে');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-semibold hover:bg-slate-800 transition cursor-pointer text-slate-300"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>জুম রিসেট (১০০%)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {Math.round(zoomLevel * 100)}%
              </span>
            </button>
          )}

          {/* Advanced Settings */}
          <button
            type="button"
            onClick={() => {
              setSettingsTab('advanced');
              setIsSettingsModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>এডভান্সড সেটিংস</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setContextMenu(null);
              showToast('ডেস্কটপ রিফ্রেশ সম্পন্ন');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold hover:bg-slate-800 transition cursor-pointer text-slate-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ (Refresh)</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / MANAGE DESKTOP APPS FROM ALL MODULES */}
      {/* ========================================================================= */}
      {isAppManagerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAppManagerOpen(false);
          }}
        >
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>ডেস্কটপ অ্যাপ্লিকেশন কাস্টমাইজার</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      {pinnedAppIds.length}টি পিন করা
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ইআরপির যেকোনো মডিউল ডেস্কটপ ওএসে পিন বা আনপিন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAppManagerOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'সকল মডিউল' },
                  { id: 'sales', label: 'বিক্রয় ও ডিলার' },
                  { id: 'inventory', label: 'ইনভেন্টরি ও পণ্য' },
                  { id: 'finance', label: 'হিসাব ও অর্থ' },
                  { id: 'operations', label: 'অপারেশন ও ফিল্ড' },
                  { id: 'reports', label: 'রিপোর্ট' },
                  { id: 'system', label: 'সিস্টেম' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAppCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                      appCategoryFilter === cat.id
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মডিউল খুঁজুন..."
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Module Cards Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredModulesForManager.map((mod) => {
                const Icon = mod.icon;
                const isPinned = pinnedAppIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleAppPinned(mod.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isPinned
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {mod.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {mod.sub}
                        </div>
                        <span className="text-[9px] text-cyan-400 mt-0.5 inline-block">
                          {mod.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Pin Button */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isPinned
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isPinned ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResetAppsToDefault}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                ডিফল্ট ১০টি অ্যাপে ফিরুন
              </button>

              <button
                type="button"
                onClick={() => setIsAppManagerOpen(false)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/25 cursor-pointer active:scale-95"
              >
                সম্পন্ন (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DESKTOP & WALLPAPER ADVANCED SETTINGS */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsModalOpen(false);
          }}
        >
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>ডেস্কটপ ও ডিসপ্লে সেটিংস</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ওয়ালপেপার, আইকন স্কেলিং, লেআউট ও এডভান্সড পারফরম্যান্স কনফিগারেশন
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

            {/* Navigation Tabs */}
            <div className="flex items-center px-5 pt-3 border-b border-slate-800 bg-slate-950/50 gap-2 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setSettingsTab('wallpaper')}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  settingsTab === 'wallpaper'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>ওয়ালপেপার ও ব্যাকগ্রাউন্ড</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('appearance')}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  settingsTab === 'appearance'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>আইকন ও ডিসপ্লে স্কেল</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('advanced')}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  settingsTab === 'advanced'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>এডভান্সড সেটিংস</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* TAB 1: WALLPAPERS */}
              {settingsTab === 'wallpaper' && (
                <div className="space-y-5">
                  {/* Darkness overlay slider */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span>ব্যাকগ্রাউন্ড শেড ও স্বচ্ছতা (Overlay Darkness)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        আইকন ও লেখা স্পষ্টভাবে পড়ার জন্য ডার্ক শেড এডজাস্ট করুন ({overlayOpacity}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span className="text-[10px] text-slate-400">উজ্জ্বল</span>
                      <input
                        type="range"
                        min="25"
                        max="90"
                        step="5"
                        value={overlayOpacity}
                        onChange={(e) => handleOpacityChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-[10px] text-slate-400">ডার্ক</span>
                    </div>
                  </div>

                  {/* Wallpaper sub-tabs */}
                  <div className="flex gap-2 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setWallpaperSubTab('presets')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        wallpaperSubTab === 'presets'
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      প্রিসেট ছবি ({WALLPAPER_PRESETS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setWallpaperSubTab('upload')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        wallpaperSubTab === 'upload'
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      কম্পিউটার থেকে আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setWallpaperSubTab('url')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        wallpaperSubTab === 'url'
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ওয়েব লিংক (URL)
                    </button>
                  </div>

                  {wallpaperSubTab === 'presets' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {WALLPAPER_PRESETS.map((preset) => {
                        const isSelected = wallpaper === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => applyWallpaper(preset.url)}
                            className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 transform-gpu hover:scale-[1.02] ${
                              isSelected
                                ? 'border-cyan-500 shadow-xl shadow-cyan-500/20'
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className="aspect-video w-full overflow-hidden bg-slate-950">
                              <img
                                src={preset.thumbnail}
                                alt={preset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3 bg-slate-950/90 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                                  {preset.category}
                                </span>
                                <h4 className="text-xs font-black text-white truncate mt-0.5">
                                  {preset.name}
                                </h4>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg font-black">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {wallpaperSubTab === 'upload' && (
                    <div className="p-8 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-950/40 text-center flex flex-col items-center justify-center">
                      <Upload className="w-10 h-10 text-cyan-400 mb-3" />
                      <h4 className="font-bold text-white text-sm">কম্পিউটার থেকে ছবি আপলোড করুন</h4>
                      <p className="text-slate-400 text-xs mt-1 mb-4">
                        JPG, PNG বা WebP ফরম্যাটের ছবি নির্বাচন করুন
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            applyWallpaper(ev.target?.result as string);
                            setIsUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {wallpaperSubTab === 'url' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (customUrlInput.trim()) {
                          applyWallpaper(customUrlInput.trim());
                          setCustomUrlInput('');
                        }
                      }}
                      className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <label className="block text-xs font-bold text-slate-300">
                        সরাসরি ছবির ওয়েব URL লিংক পেস্ট করুন
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl text-white cursor-pointer"
                        >
                          সেট করুন
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: APPEARANCE & ICON SCALING */}
              {settingsTab === 'appearance' && (
                <div className="space-y-5">
                  {/* Icon Size */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Grid className="w-4 h-4 text-cyan-400" />
                      <span>ডেস্কটপ আইকন সাইজ (Icon Sizing)</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(['small', 'normal', 'large'] as const).map((size) => (
                        <div
                          key={size}
                          onClick={() => handleIconSizeChange(size)}
                          className={`p-3.5 rounded-xl border text-center cursor-pointer transition ${
                            iconSize === size
                              ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-sm mb-0.5">
                            {size === 'small' ? 'ছোট (Small)' : size === 'normal' ? 'সাধারণ (Normal)' : 'বড় (Large)'}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {size === 'small' ? 'কম্প্যাক্ট ৪৪px' : size === 'normal' ? 'স্ট্যান্ডার্ড ৫৬px' : 'উজ্জ্বল ৬৮px'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zoom Rules & Preview */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-cyan-400" />
                          <span>ডিসপ্লে জুম ও স্কেল কন্ট্রোল</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          বর্তমান জুম: <strong>{Math.round(zoomLevel * 100)}%</strong> • স্বাভাবিক অবস্থা (১০০%) থেকে ছোট করা যাবে না
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {onZoomOut && (
                          <button
                            type="button"
                            onClick={onZoomOut}
                            disabled={zoomLevel <= 1.0}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                            title="জুম কমান (মিনিমাম ১০০%)"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                        )}
                        {onResetZoom && (
                          <button
                            type="button"
                            onClick={onResetZoom}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                            title="১০০% স্বাভাবিক জুম"
                          >
                            ১০০%
                          </button>
                        )}
                        {onZoomIn && (
                          <button
                            type="button"
                            onClick={onZoomIn}
                            disabled={zoomLevel >= 2.5}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                            title="জুম বাড়ান"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>জুম সুরক্ষা কার্যকর:</span>
                      </div>
                      <p>
                        স্বাভাবিক অবস্থা (১০০%) এর চেয়ে ছোট জুম করা যাবে না এবং স্বাভাবিক অবস্থায় ডেক্সটপ ওএস ক্রলও করবে না। জুম বৃদ্ধি করা হলে সকল কার্ড ও টেক্সট স্বয়ংক্রিয়ভাবে রেসপন্সিভভাবে স্ক্রলযোগ্য থাকবে।
                      </p>
                    </div>
                  </div>

                  {/* Badges and Top Header toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => {
                        const next = !showBadges;
                        setShowBadges(next);
                        localStorage.setItem(STORAGE_KEY_SHOW_BADGES, String(next));
                      }}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                    >
                      <div>
                        <div className="font-bold text-white">লাইভ স্ট্যাটাস ব্যাজ</div>
                        <div className="text-[10px] text-slate-400">আইকনের নিচে মজুত/ইনভয়েস কাউন্টার</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${showBadges ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                        {showBadges ? 'চালু' : 'বন্ধ'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        const next = !showTopWidget;
                        setShowTopWidget(next);
                        localStorage.setItem(STORAGE_KEY_SHOW_WIDGET, String(next));
                      }}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                    >
                      <div>
                        <div className="font-bold text-white">টপ ইনফো ও ক্লক বার</div>
                        <div className="text-[10px] text-slate-400">ডেস্কটপের উপরের তারিখ, সময় ও টুলবার</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${showTopWidget ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                        {showTopWidget ? 'চালু' : 'বন্ধ'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADVANCED SETTINGS */}
              {settingsTab === 'advanced' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                      <span>উইন্ডোজ মোড ও অ্যানিমেশন আচরণ</span>
                    </h4>

                    <div
                      onClick={() => {
                        const next = !animationsEnabled;
                        setAnimationsEnabled(next);
                        localStorage.setItem(STORAGE_KEY_ANIMATIONS, String(next));
                      }}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-white">মসৃণ অ্যানিমেশন ও ট্রানজিশন</div>
                        <div className="text-[10px] text-slate-400">উইন্ডো ওপেন, মিনিমাইজ ও হোভার ইফেক্ট</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${animationsEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                        {animationsEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                      <strong>শর্টকাট গাইড:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl + +</kbd> : জুম বৃদ্ধি</li>
                        <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl + -</kbd> : জুম হ্রাস (মিনিমাম ১০০% স্বাভাবিক লক)</li>
                        <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl + 0</kbd> : ১০০% জুমে তাৎক্ষণিক রিসেট</li>
                        <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Right Click</kbd> : ডেস্কটপ অপশন ও ওয়ালপেপার কুইক মেনু</li>
                      </ul>
                    </div>
                  </div>

                  {/* Reset all button */}
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-rose-300">ফ্যাক্টরি ডেস্কটপ রিসেট</div>
                      <div className="text-[10px] text-rose-400">ডেস্কটপ লেআউট, ওয়ালপেপার ও স্কেল ডিফল্টে ফেরত নিন</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDesktopAll}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
                    >
                      রিসেট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end text-xs">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/25 cursor-pointer active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
