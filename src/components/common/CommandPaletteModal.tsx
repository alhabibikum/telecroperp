import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Command,
  CornerDownLeft,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  Building2,
  DollarSign,
  FileText,
  Settings,
  Users,
  Shield,
  Sparkles,
  Barcode,
  RotateCcw,
  Receipt,
  Wallet,
  TrendingUp,
  CreditCard,
  Printer,
  Calendar,
  Layers,
  Phone,
  CheckCircle2,
  Sliders,
  ChevronRight,
  SlidersHorizontal,
  History,
  Tag,
  UserCheck,
  Zap,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/formatters';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
  onOpenNewSale: (type?: 'Wholesale' | 'Retail POS') => void;
  onOpenNewPurchase: () => void;
  onOpenDueCollection: () => void;
  onOpenIMEILookup: (imei?: string) => void;
  onOpenMultiScanner: () => void;
  onOpenShortcutsHelp: () => void;
  onPrintInvoice?: (invoiceNo: string) => void;
  onOpenNewProduct?: () => void;
  onOpenStockTransfer?: () => void;
  onOpenCustomerReturn?: () => void;
}

export interface MenuGroupItem {
  id: string;
  labelEn: string;
  labelBn: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  badge?: string;
  shortcut?: string;
  keywords: string[];
  action: () => void;
}

export interface MenuGroup {
  id: string;
  titleEn: string;
  titleBn: string;
  emoji: string;
  accent: string;
  items: MenuGroupItem[];
}

export interface SearchResultItem {
  id: string;
  category: 'Module' | 'Product' | 'IMEI' | 'Invoice' | 'Customer' | 'Supplier' | 'Branch' | 'Employee' | 'Report';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  shortcut?: string;
  handler: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenDueCollection,
  onOpenIMEILookup,
  onOpenMultiScanner,
  onOpenShortcutsHelp,
  onPrintInvoice,
  onOpenNewProduct,
  onOpenStockTransfer,
  onOpenCustomerReturn
}) => {
  const {
    imeis,
    customers,
    suppliers,
    salesInvoices,
    purchaseInvoices,
    products,
    warehouses,
    salesmen,
    expenses
  } = useERP();

  const [query, setQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedGroupFilter('all');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen]);

  // Master Group-Wise Navigation Structure as specified
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      id: 'sales',
      titleEn: 'Sales',
      titleBn: 'বিক্রয় ও কাস্টমার',
      emoji: '🛒',
      accent: 'from-blue-600 to-indigo-600',
      items: [
        {
          id: 'pos',
          labelEn: 'POS',
          labelBn: 'রিটেইল পিওএস কাউন্টার',
          icon: ShoppingBag,
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
          keywords: ['pos', 'retail', 'counter', 'pos terminal', 'দোকান', 'কাউন্টার'],
          action: () => {
            onClose();
            onSelectView('retail-pos');
          }
        },
        {
          id: 'new-sale',
          labelEn: 'New Sale',
          labelBn: 'নতুন হোলসেল চালান',
          icon: ShoppingCart,
          accentColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
          badge: 'New',
          shortcut: 'Ctrl+N',
          keywords: ['new sale', 'wholesale', 'invoice', 'চালান', 'বিক্রি', 'নতুন সেল'],
          action: () => {
            onClose();
            onOpenNewSale('Wholesale');
          }
        },
        {
          id: 'sales-history',
          labelEn: 'Sales History',
          labelBn: 'হোলসেল বিক্রয় খতিয়ান',
          icon: History,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          keywords: ['sales history', 'invoices', 'wholesale history', 'বিল তালিকা'],
          action: () => {
            onClose();
            onSelectView('wholesale-sales');
          }
        },
        {
          id: 'sales-return',
          labelEn: 'Sales Return',
          labelBn: 'কাস্টমার সেলস রিটার্ন',
          icon: RotateCcw,
          accentColor: 'text-rose-600',
          bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
          keywords: ['sales return', 'customer return', 'ফেরত', 'রিটার্ন'],
          action: () => {
            onClose();
            if (onOpenCustomerReturn) onOpenCustomerReturn();
            else onSelectView('returns');
          }
        },
        {
          id: 'customers',
          labelEn: 'Customers',
          labelBn: 'ডিলার ও রিটেইলার শপ',
          icon: Users,
          accentColor: 'text-cyan-600',
          bgColor: 'bg-cyan-50 hover:bg-cyan-100/80 border-cyan-200',
          keywords: ['customers', 'dealers', 'shops', 'retailers', 'গ্রাহক', 'পার্টি'],
          action: () => {
            onClose();
            onSelectView('customers');
          }
        },
        {
          id: 'due-collection',
          labelEn: 'Due Collection',
          labelBn: 'বকেয়া টাকা আদায় ও জমা',
          icon: DollarSign,
          accentColor: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
          keywords: ['due collection', 'due', 'payment', 'বকেয়া আদায়', 'কালেকশন'],
          action: () => {
            onClose();
            onOpenDueCollection();
          }
        }
      ]
    },
    {
      id: 'inventory',
      titleEn: 'Inventory',
      titleBn: 'ইনভেন্টরি ও হ্যান্ডসেট',
      emoji: '📦',
      accent: 'from-cyan-600 to-blue-600',
      items: [
        {
          id: 'products',
          labelEn: 'Products',
          labelBn: 'প্রোডাক্ট ও মডেল ক্যাটালগ',
          icon: Package,
          accentColor: 'text-cyan-600',
          bgColor: 'bg-cyan-50 hover:bg-cyan-100/80 border-cyan-200',
          keywords: ['products', 'models', 'devices', 'স্মার্টফোন', 'পণ্য'],
          action: () => {
            onClose();
            onSelectView('inventory');
          }
        },
        {
          id: 'stock',
          labelEn: 'Stock',
          labelBn: 'লাইভ স্টক রেজিস্টার',
          icon: Layers,
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
          keywords: ['stock', 'inventory', 'balance', 'স্টক ব্যালেন্স'],
          action: () => {
            onClose();
            onSelectView('inventory');
          }
        },
        {
          id: 'serial-imei',
          labelEn: 'Serial / IMEI',
          labelBn: '৩৬০° আইএমইআই ট্র্যাকিং',
          icon: Barcode,
          accentColor: 'text-teal-600',
          bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
          badge: '360°',
          shortcut: 'Ctrl+B',
          keywords: ['serial', 'imei', 'imei trace', 'আইএমইআই', 'সিরিয়াল'],
          action: () => {
            onClose();
            onSelectView('imei-trace');
          }
        },
        {
          id: 'barcode',
          labelEn: 'Barcode',
          labelBn: 'বারকোড ও লেবেল প্রিন্টার',
          icon: Tag,
          accentColor: 'text-purple-600',
          bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
          keywords: ['barcode', 'labels', 'stickers', 'প্রিন্ট', 'লেবেল'],
          action: () => {
            onClose();
            onSelectView('barcode-labels');
          }
        },
        {
          id: 'stock-adjustment',
          labelEn: 'Stock Adjustment',
          labelBn: 'স্টক সমন্বয় ও হিসাবমিলন',
          icon: Sliders,
          accentColor: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
          keywords: ['stock adjustment', 'adjustment', 'audit', 'সমন্বয়'],
          action: () => {
            onClose();
            onSelectView('inventory');
          }
        },
        {
          id: 'stock-transfer',
          labelEn: 'Stock Transfer',
          labelBn: 'শাখা/ওয়্যারহাউজ স্টক চালান',
          icon: Truck,
          accentColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
          keywords: ['stock transfer', 'transfer', 'transit', 'চালান ট্রান্সফার'],
          action: () => {
            onClose();
            if (onOpenStockTransfer) onOpenStockTransfer();
            else onSelectView('stock-transfers');
          }
        }
      ]
    },
    {
      id: 'purchase',
      titleEn: 'Purchase',
      titleBn: 'ক্রয় ও সাপ্লায়ার',
      emoji: '🚚',
      accent: 'from-purple-600 to-indigo-600',
      items: [
        {
          id: 'new-purchase',
          labelEn: 'New Purchase',
          labelBn: 'নতুন পারচেজ ইনওয়ার্ড এন্ট্রি',
          icon: Package,
          accentColor: 'text-purple-600',
          bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
          badge: 'Inward',
          keywords: ['new purchase', 'inward', 'goods receive', 'ক্রয় চালান', 'নতুন পারচেজ'],
          action: () => {
            onClose();
            onOpenNewPurchase();
          }
        },
        {
          id: 'purchase-history',
          labelEn: 'Purchase History',
          labelBn: 'পারচেজ চালান ইতিহাস',
          icon: History,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          keywords: ['purchase history', 'po', 'purchases', 'বিল তালিকা'],
          action: () => {
            onClose();
            onSelectView('purchases');
          }
        },
        {
          id: 'purchase-return',
          labelEn: 'Purchase Return',
          labelBn: 'সাপ্লায়ার পণ্য ফেরত (RMA)',
          icon: RotateCcw,
          accentColor: 'text-rose-600',
          bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
          keywords: ['purchase return', 'supplier return', 'মহাজন ফেরত'],
          action: () => {
            onClose();
            onSelectView('returns');
          }
        },
        {
          id: 'suppliers',
          labelEn: 'Suppliers',
          labelBn: 'ভেন্ডর ও মহাজন ডিরেক্টরি',
          icon: Building2,
          accentColor: 'text-slate-700',
          bgColor: 'bg-slate-100 hover:bg-slate-200/80 border-slate-300',
          keywords: ['suppliers', 'vendors', 'mahajon', 'সাপ্লায়ার', 'মহাজন'],
          action: () => {
            onClose();
            onSelectView('suppliers');
          }
        },
        {
          id: 'payables',
          labelEn: 'Payables',
          labelBn: 'মহাজন দেনা ও বাকি পরিশোধ',
          icon: Receipt,
          accentColor: 'text-rose-600',
          bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
          keywords: ['payables', 'supplier due', 'dona', 'দেনা', 'পরিশোধ'],
          action: () => {
            onClose();
            onSelectView('suppliers');
          }
        }
      ]
    },
    {
      id: 'branch',
      titleEn: 'Branch',
      titleBn: 'শাখা ও ওয়্যারহাউজ',
      emoji: '🏢',
      accent: 'from-amber-600 to-orange-600',
      items: [
        {
          id: 'branch-list',
          labelEn: 'Branch List',
          labelBn: 'সকল ব্রাঞ্চ ও শাখা তালিকা',
          icon: Building2,
          accentColor: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
          keywords: ['branch list', 'branches', 'warehouses', 'ব্রাঞ্চ', 'শাখা'],
          action: () => {
            onClose();
            onSelectView('warehouses');
          }
        },
        {
          id: 'branch-stock',
          labelEn: 'Branch Stock',
          labelBn: 'ব্রাঞ্চ অনুযায়ী স্টক ব্যালেন্স',
          icon: Layers,
          accentColor: 'text-orange-600',
          bgColor: 'bg-orange-50 hover:bg-orange-100/80 border-orange-200',
          keywords: ['branch stock', 'godown stock', 'শাখা স্টক'],
          action: () => {
            onClose();
            onSelectView('warehouses');
          }
        },
        {
          id: 'branch-stock-transfer',
          labelEn: 'Stock Transfer',
          labelBn: 'আন্তঃশাখা স্টক স্থানান্তর',
          icon: Truck,
          accentColor: 'text-teal-600',
          bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
          keywords: ['stock transfer', 'inter-branch', 'শাখা ট্রান্সফার'],
          action: () => {
            onClose();
            onSelectView('stock-transfers');
          }
        },
        {
          id: 'branch-performance',
          labelEn: 'Branch Performance',
          labelBn: 'শাখা বিক্রয় ও পারফরম্যান্স',
          icon: TrendingUp,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          keywords: ['branch performance', 'analytics', 'শাখা রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        }
      ]
    },
    {
      id: 'accounts',
      titleEn: 'Accounts',
      titleBn: 'অ্যাকাউন্টিং ও ক্যাশ',
      emoji: '💰',
      accent: 'from-emerald-600 to-teal-600',
      items: [
        {
          id: 'cash',
          labelEn: 'Cash',
          labelBn: 'নগদ ক্যাশ ও ব্যাংক ব্যালেন্স',
          icon: Wallet,
          accentColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
          keywords: ['cash', 'bank', 'balance', 'নগদ ক্যাশ', 'ব্যাংক'],
          action: () => {
            onClose();
            onSelectView('cash-bank');
          }
        },
        {
          id: 'expense',
          labelEn: 'Expense',
          labelBn: 'দৈনন্দিন খরচ ও ভাউচার',
          icon: Receipt,
          accentColor: 'text-rose-600',
          bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
          keywords: ['expense', 'cost', 'bills', 'খরচ', 'ভাউচার'],
          action: () => {
            onClose();
            onSelectView('expenses');
          }
        },
        {
          id: 'income',
          labelEn: 'Income',
          labelBn: 'আয় ও রাজস্ব খতিয়ান',
          icon: TrendingUp,
          accentColor: 'text-teal-600',
          bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
          keywords: ['income', 'revenue', 'profit', 'আয়', 'রেভিনিউ'],
          action: () => {
            onClose();
            onSelectView('accounting');
          }
        },
        {
          id: 'receivable',
          labelEn: 'Receivable',
          labelBn: 'কাস্টমার বকেয়া এজিং এনালাইসিস',
          icon: DollarSign,
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
          keywords: ['receivable', 'due ageing', 'outstanding', 'বকেয়া পাওনা'],
          action: () => {
            onClose();
            onSelectView('due-ageing');
          }
        },
        {
          id: 'payable',
          labelEn: 'Payable',
          labelBn: 'মহাজন ও সাপ্লায়ার দেনা',
          icon: CreditCard,
          accentColor: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
          keywords: ['payable', 'due', 'dona', 'দেনা বাকি'],
          action: () => {
            onClose();
            onSelectView('suppliers');
          }
        },
        {
          id: 'daily-closing',
          labelEn: 'Daily Closing',
          labelBn: 'দিনের সমাপ্তি ও ক্যাশ ক্লোজিং',
          icon: Calendar,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          badge: 'Closing',
          keywords: ['daily closing', 'day close', 'cash tally', 'দিনের সমাপ্তি'],
          action: () => {
            onClose();
            onSelectView('day-closing');
          }
        }
      ]
    },
    {
      id: 'reports',
      titleEn: 'Reports',
      titleBn: 'বিজনেস অ্যানালিটিক্স ও রিপোর্ট',
      emoji: '📊',
      accent: 'from-indigo-600 to-violet-600',
      items: [
        {
          id: 'sales-reports',
          labelEn: 'Sales Reports',
          labelBn: 'বিক্রয় ও লাভ-ক্ষতি বিবরণী',
          icon: FileText,
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
          keywords: ['sales report', 'বিক্রয় রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'purchase-reports',
          labelEn: 'Purchase Reports',
          labelBn: 'ক্রয় ও সাপ্লায়ার বিবরণী',
          icon: FileSpreadsheet,
          accentColor: 'text-purple-600',
          bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
          keywords: ['purchase report', 'ক্রয় রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'stock-reports',
          labelEn: 'Stock Reports',
          labelBn: 'স্টক মূল্যায়ন ও ভ্যালুয়েশন',
          icon: Layers,
          accentColor: 'text-teal-600',
          bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
          keywords: ['stock report', 'inventory valuation', 'স্টক রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'profit-loss',
          labelEn: 'Profit/Loss',
          labelBn: 'রিয়েল-টাইম নিট লাভ / ক্ষতি',
          icon: TrendingUp,
          accentColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
          keywords: ['profit loss', 'pnl', 'net profit', 'লাভ ক্ষতি'],
          action: () => {
            onClose();
            onSelectView('accounting');
          }
        },
        {
          id: 'customer-reports',
          labelEn: 'Customer Reports',
          labelBn: 'গ্রাহক লেজার ও সেলস রেকর্ড',
          icon: Users,
          accentColor: 'text-cyan-600',
          bgColor: 'bg-cyan-50 hover:bg-cyan-100/80 border-cyan-200',
          keywords: ['customer report', 'dealer ledger', 'গ্রাহক রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'supplier-reports',
          labelEn: 'Supplier Reports',
          labelBn: 'সাপ্লায়ার লেনদেন ও হিসাব',
          icon: Building2,
          accentColor: 'text-slate-600',
          bgColor: 'bg-slate-100 hover:bg-slate-200/80 border-slate-300',
          keywords: ['supplier report', 'vendor ledger', 'সাপ্লায়ার রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'branch-reports',
          labelEn: 'Branch Reports',
          labelBn: 'শাখাভিত্তিক স্টক ও সেলস',
          icon: Building2,
          accentColor: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
          keywords: ['branch report', 'শাখা রিপোর্ট'],
          action: () => {
            onClose();
            onSelectView('reports');
          }
        },
        {
          id: 'financial-reports',
          labelEn: 'Financial Reports',
          labelBn: 'ব্যালেন্স শিট ও ট্রায়াল ব্যালেন্স',
          icon: FileText,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          keywords: ['financial report', 'trial balance', 'balance sheet', 'আর্থিক বিবরণী'],
          action: () => {
            onClose();
            onSelectView('accounting');
          }
        }
      ]
    },
    {
      id: 'management',
      titleEn: 'Management',
      titleBn: 'ম্যানেজমেন্ট ও সিকিউরিটি',
      emoji: '⚙️',
      accent: 'from-slate-700 to-slate-900',
      items: [
        {
          id: 'users',
          labelEn: 'Users',
          labelBn: 'অপারেটর ও ইউজার তালিকা',
          icon: UserCheck,
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
          keywords: ['users', 'operators', 'employees', 'ইউজার', 'অপারেটর'],
          action: () => {
            onClose();
            onSelectView('settings');
          }
        },
        {
          id: 'roles-permissions',
          labelEn: 'Roles & Permissions',
          labelBn: 'রোল ও পারমিশন কন্ট্রোল',
          icon: ShieldCheck,
          accentColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
          keywords: ['roles', 'permissions', 'access control', 'অনুমতি', 'রোল'],
          action: () => {
            onClose();
            onSelectView('settings');
          }
        },
        {
          id: 'settings',
          labelEn: 'Settings',
          labelBn: 'কোম্পানি ও সফটওয়্যার সেটিংস',
          icon: Settings,
          accentColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
          keywords: ['settings', 'configuration', 'company profile', 'সেটিংস'],
          action: () => {
            onClose();
            onSelectView('settings');
          }
        },
        {
          id: 'audit-log',
          labelEn: 'Audit Log',
          labelBn: 'সিস্টেম অডিট ট্রেইল ও লগ',
          icon: Shield,
          accentColor: 'text-rose-600',
          bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
          keywords: ['audit log', 'security log', 'activity history', 'অডিট লগ'],
          action: () => {
            onClose();
            onSelectView('audit-logs');
          }
        },
        {
          id: 'system-configuration',
          labelEn: 'System Configuration',
          labelBn: 'ক্লাউড ব্যাকআপ ও ব্যাকএন্ড কনফিগ',
          icon: SlidersHorizontal,
          accentColor: 'text-slate-700',
          bgColor: 'bg-slate-100 hover:bg-slate-200/80 border-slate-300',
          keywords: ['system configuration', 'cloud sync', 'database', 'কনফিগারেশন'],
          action: () => {
            onClose();
            onSelectView('settings');
          }
        }
      ]
    }
  ], [onClose, onSelectView, onOpenNewSale, onOpenCustomerReturn, onOpenDueCollection, onOpenStockTransfer, onOpenNewPurchase]);

  // Flattened list of all menu items for fast searching and keyboard traversal
  const allMenuItems = useMemo(() => {
    return menuGroups.flatMap(g => g.items.map(item => ({ ...item, group: g })));
  }, [menuGroups]);

  // Live Smart Search across all entities
  const searchResults: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // Priority classification based on user input patterns
    const isMobileQuery = /^01[3-9]\d{0,9}$/.test(q);
    const isNumericQuery = /^\d{4,}$/.test(q);
    const isInvoicePrefix = q.startsWith('inv') || q.startsWith('ws-') || q.startsWith('po-');
    const isImeiPrefix = q.startsWith('imei') || (isNumericQuery && q.length >= 10);

    // 1. Matching Modules / Menu items
    const matchedModules = allMenuItems.filter(item =>
      item.labelEn.toLowerCase().includes(q) ||
      item.labelBn.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    ).slice(0, 6);

    matchedModules.forEach(m => {
      const Icon = m.icon;
      results.push({
        id: `mod-${m.id}`,
        category: 'Module',
        title: `${m.labelEn} — ${m.labelBn}`,
        subtitle: `${m.group.emoji} ${m.group.titleEn} Module`,
        badge: m.badge || 'Menu',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        shortcut: m.shortcut || 'Enter',
        icon: <Icon className={`w-4 h-4 ${m.accentColor}`} />,
        handler: m.action
      });
    });

    // 2. Matching Customers (Prioritized on 017... or customer name)
    const matchedCustomers = customers.filter(c =>
      c.mobile.includes(q) ||
      c.shopName.toLowerCase().includes(q) ||
      c.ownerName.toLowerCase().includes(q) ||
      (c.customerCode && c.customerCode.toLowerCase().includes(q))
    ).slice(0, 5);

    matchedCustomers.forEach(c => {
      results.push({
        id: `cust-${c.id}`,
        category: 'Customer',
        title: `${c.shopName} (${c.ownerName})`,
        subtitle: `মোবাইল: ${c.mobile} • বকেয়া: ${formatBDT(c.currentDue)} • এলাকা: ${c.district || 'N/A'}`,
        badge: c.currentDue > 0 ? `Due ${formatBDT(c.currentDue)}` : 'Clear',
        badgeColor: c.currentDue > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        shortcut: 'Enter',
        icon: <Users className="w-4 h-4 text-cyan-600" />,
        handler: () => {
          onClose();
          onSelectView('customers');
        }
      });
    });

    // 3. Matching IMEIs / Handset Serials (Prioritized on IMEI... or numeric query)
    const matchedImeis = imeis.filter(im =>
      im.imei1.includes(q) ||
      (im.imei2 && im.imei2.includes(q)) ||
      (im.serialNumber && im.serialNumber.toLowerCase().includes(q))
    ).slice(0, 5);

    matchedImeis.forEach(im => {
      results.push({
        id: `imei-${im.imei1}`,
        category: 'IMEI',
        title: `IMEI: ${im.imei1} • ${im.productName}`,
        subtitle: `${im.variantDesc} • স্ট্যাটাস: ${im.status} • গোডাউন: ${im.warehouseName || im.warehouseId}`,
        badge: im.status,
        badgeColor: im.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          im.status === 'Sold' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-amber-50 text-amber-700 border-amber-200',
        shortcut: '360° Trace',
        icon: <Barcode className="w-4 h-4 text-teal-600" />,
        handler: () => {
          onClose();
          onOpenIMEILookup(im.imei1);
        }
      });
    });

    // 4. Matching Invoices (Sales Invoices)
    const matchedSalesInv = salesInvoices.filter(inv =>
      inv.invoiceNo.toLowerCase().includes(q) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(q))
    ).slice(0, 4);

    matchedSalesInv.forEach(inv => {
      results.push({
        id: `inv-${inv.invoiceNo}`,
        category: 'Invoice',
        title: `Sales Invoice #${inv.invoiceNo} — ${inv.customerName}`,
        subtitle: `মোট: ${formatBDT(inv.grandTotal)} • বকেয়া: ${formatBDT(inv.dueAmount)} • তারিখ: ${inv.invoiceDate || 'N/A'}`,
        badge: inv.status,
        badgeColor: inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          (inv.status === 'Unpaid' || inv.status === 'Partial') ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-amber-50 text-amber-700 border-amber-200',
        shortcut: 'Print / View',
        icon: <FileText className="w-4 h-4 text-emerald-600" />,
        handler: () => {
          onClose();
          if (onPrintInvoice) onPrintInvoice(inv.invoiceNo);
          else onSelectView('wholesale-sales');
        }
      });
    });

    // 5. Matching Products (by brand, model, sku)
    const matchedProducts = products.filter(p =>
      p.model.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.variants.some(v => v.sku.toLowerCase().includes(q) || v.ram.toLowerCase().includes(q) || v.storage.toLowerCase().includes(q))
    ).slice(0, 4);

    matchedProducts.forEach(p => {
      const totalStock = p.variants.reduce((acc, v) => acc + (v.currentStock || 0), 0);
      results.push({
        id: `prod-${p.id}`,
        category: 'Product',
        title: `${p.brandName} ${p.model}`,
        subtitle: `${p.category} • স্টক: ${totalStock} টি • ভ্যারিয়েন্ট: ${p.variants.map(v => `${v.ram}/${v.storage}`).join(', ')}`,
        badge: `${totalStock} In Stock`,
        badgeColor: totalStock > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200',
        shortcut: 'Stock View',
        icon: <Package className="w-4 h-4 text-indigo-600" />,
        handler: () => {
          onClose();
          onSelectView('inventory');
        }
      });
    });

    // 6. Matching Suppliers
    const matchedSuppliers = suppliers.filter(s =>
      s.companyName.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.mobile.includes(q)
    ).slice(0, 3);

    matchedSuppliers.forEach(s => {
      results.push({
        id: `supp-${s.id}`,
        category: 'Supplier',
        title: `${s.companyName} (${s.name})`,
        subtitle: `মোবাইল: ${s.mobile} • বর্তমান দেনা: ${formatBDT(s.currentDue || 0)}`,
        badge: s.currentDue > 0 ? `Payable ${formatBDT(s.currentDue)}` : 'Clear',
        badgeColor: s.currentDue > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
        shortcut: 'Enter',
        icon: <Building2 className="w-4 h-4 text-purple-600" />,
        handler: () => {
          onClose();
          onSelectView('suppliers');
        }
      });
    });

    // 7. Matching Purchases
    const matchedPurchases = (purchaseInvoices || []).filter(pur =>
      pur.invoiceNo.toLowerCase().includes(q) ||
      (pur.supplierName && pur.supplierName.toLowerCase().includes(q))
    ).slice(0, 3);

    matchedPurchases.forEach(pur => {
      results.push({
        id: `pur-${pur.invoiceNo}`,
        category: 'Invoice',
        title: `Purchase #${pur.invoiceNo} — ${pur.supplierName}`,
        subtitle: `মোট বিল: ${formatBDT(pur.grandTotal)} • দেনা: ${formatBDT(pur.dueAmount)} • গোডাউন: ${pur.warehouseName || 'N/A'}`,
        badge: pur.status,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        shortcut: 'Open PO',
        icon: <Truck className="w-4 h-4 text-purple-600" />,
        handler: () => {
          onClose();
          onSelectView('purchases');
        }
      });
    });

    // 8. Matching Branches / Warehouses
    const matchedWarehouses = (warehouses || []).filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.code.toLowerCase().includes(q) ||
      (w.city && w.city.toLowerCase().includes(q)) ||
      (w.managerName && w.managerName.toLowerCase().includes(q))
    ).slice(0, 3);

    matchedWarehouses.forEach(w => {
      results.push({
        id: `wh-${w.id}`,
        category: 'Branch',
        title: `${w.name} (${w.code})`,
        subtitle: `${w.type} • লোকেশন: ${w.city || w.address} • ম্যানেজার: ${w.managerName}`,
        badge: w.type,
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        shortcut: 'Open Branch',
        icon: <Building2 className="w-4 h-4 text-amber-600" />,
        handler: () => {
          onClose();
          onSelectView('warehouses');
        }
      });
    });

    // 9. Matching Employees / Salesmen
    const matchedSalesmen = (salesmen || []).filter(sm =>
      sm.name.toLowerCase().includes(q) ||
      sm.mobile.includes(q) ||
      (sm.assignedArea && sm.assignedArea.toLowerCase().includes(q)) ||
      (sm.employeeCode && sm.employeeCode.toLowerCase().includes(q))
    ).slice(0, 3);

    matchedSalesmen.forEach(sm => {
      results.push({
        id: `sm-${sm.id}`,
        category: 'Employee',
        title: `${sm.name} (Sales Executive)`,
        subtitle: `মোবাইল: ${sm.mobile} • এরিয়া: ${sm.assignedArea} • কোড: ${sm.employeeCode}`,
        badge: 'Salesman',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        shortcut: 'View',
        icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
        handler: () => {
          onClose();
          onSelectView('salesmen');
        }
      });
    });

    // Dynamic sorting: If typing 017... put Customer at top; if IMEI... put IMEI at top; if INV... put Invoice at top.
    return results.sort((a, b) => {
      if (isMobileQuery) {
        if (a.category === 'Customer') return -1;
        if (b.category === 'Customer') return 1;
      }
      if (isImeiPrefix) {
        if (a.category === 'IMEI') return -1;
        if (b.category === 'IMEI') return 1;
      }
      if (isInvoicePrefix) {
        if (a.category === 'Invoice') return -1;
        if (b.category === 'Invoice') return 1;
      }
      return 0;
    });
  }, [query, allMenuItems, customers, imeis, salesInvoices, products, suppliers, purchaseInvoices, warehouses, salesmen, onClose, onSelectView, onOpenIMEILookup, onPrintInvoice]);

  // Grouped items to display when query is empty
  const displayedGroups = useMemo(() => {
    if (selectedGroupFilter === 'all') return menuGroups;
    return menuGroups.filter(g => g.id === selectedGroupFilter);
  }, [menuGroups, selectedGroupFilter]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (query.trim()) {
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else {
        const flatItems = displayedGroups.flatMap(g => g.items);
        setSelectedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (query.trim()) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else {
        const flatItems = displayedGroups.flatMap(g => g.items);
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].handler();
        }
      } else {
        const flatItems = displayedGroups.flatMap(g => g.items);
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].action();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto-scroll active item into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(`[data-active="true"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-start justify-center pt-8 md:pt-12 p-3 md:p-6 animate-in fade-in duration-150"
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Accent Banner */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 w-full" />

        {/* Global Search Box Section */}
        <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Product, Barcode, IMEI, Invoice, Customer, Supplier, Branch, Stock, Report বা Menu সার্চ করুন... (Ctrl+K)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-10 text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Skip Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-slate-950 border border-amber-300 dark:border-amber-700 cursor-pointer font-black text-xs transition flex items-center gap-1 shrink-0"
              title="উইন্ডোটি স্কিপ করুন"
            >
              <span>স্কিপ (Skip)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-rose-600 border border-slate-200 dark:border-slate-700 cursor-pointer transition flex items-center gap-1 shrink-0"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-4 h-4" />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-200/80 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300">Esc</kbd>
            </button>
          </div>

          {/* Quick Filter Group Pills (Shown when query is empty) */}
          {!query && (
            <div className="flex items-center gap-1.5 mt-3.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer border shrink-0 ${
                  selectedGroupFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                }`}
              >
                ✨ সকল মডিউল (All)
              </button>
              {menuGroups.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroupFilter(g.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer border shrink-0 flex items-center gap-1.5 ${
                    selectedGroupFilter === g.id
                      ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.titleEn}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Body Content: Results List OR Group-Wise Buttons */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* A. If user is searching (query is non-empty) */}
          {query.trim() ? (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  সার্চ ফলাফল ({searchResults.length} টি রেকর্ড পাওয়া গেছে)
                </span>
                <span className="text-[11px] text-slate-400">
                  সিলেক্ট করতে <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-[10px]">Enter</kbd> চাপুন
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-8 h-8 stroke-1" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-700">কোনো ফলাফল পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      "{query}"-এর সাথে সামঞ্জস্যপূর্ণ কোনো প্রোডাক্ট, আইএমইআই, চালান বা কাস্টমার পাওয়া যায়নি।
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {searchResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-active={isSelected}
                        onClick={item.handler}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all duration-150 flex items-center justify-between border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 translate-x-1'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/70 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
                                  isSelected
                                    ? 'bg-white/20 text-white border-white/30'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {item.category}
                              </span>
                              <h5 className="text-sm font-bold truncate">
                                {item.title}
                              </h5>
                            </div>
                            <p
                              className={`text-xs mt-0.5 truncate ${
                                isSelected ? 'text-blue-100 font-medium' : 'text-slate-500'
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 pl-3">
                          {item.badge && (
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                                isSelected
                                  ? 'bg-white text-blue-700 border-white font-black'
                                  : (item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200')
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.shortcut && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                isSelected
                                  ? 'bg-white/20 border-white/30 text-white'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              {item.shortcut}
                            </span>
                          )}

                          {isSelected && (
                            <CornerDownLeft className="w-4 h-4 text-white/90 animate-pulse" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* B. When query is empty: Group-Wise Navigation Buttons */
            <div className="space-y-6">
              {/* Fast Operations Hero Strip */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-teal-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-teal-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-800/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    তাত্ক্ষণিক অপারেশন (Instant Triggers):
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewSale('Wholesale');
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>নতুন সেল (Ctrl+N)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMultiScanner();
                    }}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>মাল্টি-স্ক্যানার (Ctrl+B)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDueCollection();
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>বকেয়া আদায়</span>
                  </button>
                </div>
              </div>

              {/* Group-Wise Modules */}
              {displayedGroups.map(group => (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{group.emoji}</span>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        {group.titleEn} • <span className="text-slate-500 dark:text-slate-400 font-bold">{group.titleBn}</span>
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {group.items.length} Modules
                    </span>
                  </div>

                  {/* Group Buttons Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col items-start justify-between gap-2.5 text-left cursor-pointer group hover:scale-[1.02] hover:shadow-md ${item.bgColor} dark:bg-slate-800/80 dark:border-slate-700/80`}
                          title={`${item.labelEn} (${item.labelBn})`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-600 group-hover:scale-110 transition-transform">
                              <Icon className={`w-4 h-4 ${item.accentColor}`} />
                            </div>
                            {item.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                                {item.badge}
                              </span>
                            )}
                            {item.shortcut && !item.badge && (
                              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-400 font-bold bg-white/80 dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                {item.shortcut}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 w-full">
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 truncate">
                              {item.labelEn}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 truncate font-medium">
                              {item.labelBn}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer Status & Keyboard Navigation Guide */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono shadow-2xs">↓</kbd>
              <span>ন্যাভিগেট</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono shadow-2xs">Enter</kbd>
              <span>সিলেক্ট / ওপেন</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono shadow-2xs">Esc</kbd>
              <span>বন্ধ করুন</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcutsHelp();
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>সকল শর্টকাট সহায়িকা (Ctrl+/)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
