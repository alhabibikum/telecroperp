import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Building2,
  Layers,
  Smartphone,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Search,
  CheckCircle2,
  DollarSign,
  Printer,
  BarChart3,
  Calendar,
  Filter,
  PieChart as PieIcon,
  Activity,
  Award,
  Maximize2,
  Minimize2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Truck,
  Users,
  Target,
  Wrench,
  Percent,
  Wallet,
  Compass,
  ArrowRight,
  ExternalLink,
  FileText,
  PackageCheck,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardViewProps {
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenDueCollection: () => void;
  onOpenIMEILookup: (imei?: string) => void;
  onSelectView: (view: string) => void;
  onPrintInvoice: (invoiceNo: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenDueCollection,
  onOpenIMEILookup,
  onSelectView,
  onPrintInvoice
}) => {
  const {
    salesInvoices,
    purchaseInvoices,
    customers,
    suppliers,
    imeis,
    products,
    brands,
    warehouses,
    bankAccounts,
    cashTransactions,
    chartOfAccounts,
    expenses,
    salesmen,
    warrantyClaims,
    alerts,
    settings,
    triggerManualSync
  } = useERP();

  const isBn = settings.language === 'bn';
  const dashboardContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveTime, setLiveTime] = useState<string>(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const [isSyncing, setIsSyncing] = useState(false);

  // Timeframe filter state
  const [dashboardTimeframe, setDashboardTimeframe] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [brandMetric, setBrandMetric] = useState<'units' | 'revenue'>('units');
  const [profitMetric, setProfitMetric] = useState<'all' | 'profitOnly'>('all');
  const [activeChannelTab, setActiveChannelTab] = useState<'all' | 'wholesale' | 'retail'>('all');

  // Keep live time ticking for executive wall display
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to browser fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (dashboardContainerRef.current?.requestFullscreen) {
        dashboardContainerRef.current.requestFullscreen().catch(() => {
          document.documentElement.requestFullscreen().catch(() => {});
        });
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      if (triggerManualSync) {
        await triggerManualSync();
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // -------------------------------------------------------------
  // CORE EXECUTIVE METRICS (Dynamic & Zero-Safe)
  // -------------------------------------------------------------
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const totalSalesRevenue = salesInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalReceivableDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalPayableDue = suppliers.reduce((acc, s) => acc + s.currentDue, 0);

  // Stock valuation: sum of purchaseCost of all 'In Stock' IMEIs
  const inStockUnits = imeis.filter(i => i.status === 'In Stock');
  const soldUnits = imeis.filter(i => i.status === 'Sold');
  const inTransitUnits = imeis.filter(i => i.status === 'Transferred' || i.status === 'Reserved');
  const rmaDamagedUnits = imeis.filter(i => i.status === 'Warranty' || i.status === 'Lost/Blocked');
  const totalStockValuation = inStockUnits.reduce((acc, i) => acc + (i.purchaseCost || 0), 0);

  // Bank & Cash liquid total
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + (b.currentBalance || 0), 0);
  const openingVaultCash = chartOfAccounts.find(a => a.code === '1000')?.balance || 0;
  const cashInTotal = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const cashOutTotal = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const estimatedCashInHand = Math.max(0, openingVaultCash + cashInTotal - cashOutTotal);

  // Profit estimation
  const totalCOGS = salesInvoices.reduce((acc, inv) => {
    const cost = inv.items.reduce((s, it) => s + ((it.unitCost || 0) * (it.quantity || 1)), 0);
    return acc + cost;
  }, 0);
  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalCOGS);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const estimatedNetProfit = Math.max(0, estimatedGrossProfit - totalExpenses);

  const unreadAlerts = alerts.filter(a => !a.read);
  const criticalAlerts = unreadAlerts.filter(a => a.type === 'critical');

  // ==============================================================
  // FEATURE 2: TODAY'S OPERATIONAL PULSE & TARGET BAROMETER
  // ==============================================================
  const todayInvoices = salesInvoices.filter(inv => inv.invoiceDate === todayStr);
  const todaySalesRevenue = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const todayPaidCollections = todayInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const todayCashIn = cashTransactions
    .filter(c => c.type === 'Cash In' && c.date.startsWith(todayStr))
    .reduce((sum, c) => sum + c.amount, 0);
  const todayTotalLiquidity = Math.max(todayPaidCollections, todayCashIn);

  const todayPurchases = purchaseInvoices.filter(p => p.purchaseDate === todayStr);
  const todayUnitsPurchased = todayPurchases.reduce((sum, p) => sum + p.items.reduce((s, it) => s + (it.quantity || 0), 0), 0);
  const todayUnitsSold = todayInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + (it.quantity || 0), 0), 0);

  // Daily target benchmark (Default ৳ 5,00,000 or based on active salesman targets)
  const defaultDailyTarget = 500000;
  const todayTargetAchievementPct = defaultDailyTarget > 0 ? Math.min(100, Math.round((todaySalesRevenue / defaultDailyTarget) * 100)) : 0;
  const activeSalesmenCount = salesmen.filter(s => s.status === 'Active').length;
  const openInvoicesCount = salesInvoices.filter(s => s.status === 'Unpaid' || s.status === 'Partial').length;

  // ==============================================================
  // FEATURE 3: IMEI STOCK LIFECYCLE & HEALTH DISTRIBUTION (PIE)
  // ==============================================================
  const stockHealthPieData = [
    { name: isBn ? 'ইন-স্টক (মজুদ)' : 'In Stock', value: inStockUnits.length, color: '#10b981' },
    { name: isBn ? 'বিক্রীত (Sold)' : 'Sold', value: soldUnits.length, color: '#3b82f6' },
    { name: isBn ? 'ট্রানজিটে (In Transit)' : 'In Transit', value: inTransitUnits.length, color: '#f59e0b' },
    { name: isBn ? 'আরএমএ/ক্ষতিগ্রস্ত' : 'RMA / Damaged', value: rmaDamagedUnits.length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Stock aging telemetry
  const nowTs = new Date().getTime();
  let freshStockCount = 0; // < 15 days
  let normalStockCount = 0; // 15 - 45 days
  let agingStockCount = 0; // > 45 days

  inStockUnits.forEach(item => {
    const receivedTime = item.purchaseDate ? new Date(item.purchaseDate).getTime() : nowTs;
    const diffDays = Math.floor((nowTs - receivedTime) / (1000 * 60 * 60 * 24));
    if (diffDays <= 15) freshStockCount++;
    else if (diffDays <= 45) normalStockCount++;
    else agingStockCount++;
  });

  // ==============================================================
  // FEATURE 4: B2B WHOLESALE VS B2C RETAIL CHANNEL SPLIT
  // ==============================================================
  const wholesaleInvoices = salesInvoices.filter(i => i.invoiceType === 'Wholesale' || !i.invoiceType);
  const retailInvoices = salesInvoices.filter(i => i.invoiceType === 'Retail POS');

  const wholesaleRevenue = wholesaleInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const retailRevenue = retailInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const wholesaleUnits = wholesaleInvoices.reduce((s, i) => s + i.items.reduce((sum, it) => sum + (it.quantity || 1), 0), 0);
  const retailUnits = retailInvoices.reduce((s, i) => s + i.items.reduce((sum, it) => sum + (it.quantity || 1), 0), 0);
  const wholesaleAOV = wholesaleInvoices.length > 0 ? Math.round(wholesaleRevenue / wholesaleInvoices.length) : 0;
  const retailAOV = retailInvoices.length > 0 ? Math.round(retailRevenue / retailInvoices.length) : 0;
  const totalChannelRev = wholesaleRevenue + retailRevenue;
  const wholesaleSharePct = totalChannelRev > 0 ? Math.round((wholesaleRevenue / totalChannelRev) * 100) : 0;
  const retailSharePct = totalChannelRev > 0 ? 100 - wholesaleSharePct : 0;

  // ==============================================================
  // FEATURE 5: SUPPLIER PAYABLES & PROCUREMENT PIPELINE RADAR
  // ==============================================================
  const topPayableSuppliers = suppliers
    .filter(s => s.currentDue > 0)
    .sort((a, b) => b.currentDue - a.currentDue)
    .slice(0, 4);

  const recentPurchases = purchaseInvoices.slice(0, 4);

  // ==============================================================
  // FEATURE 6: TERRITORY & AREA-WISE DEALER PERFORMANCE MATRIX
  // ==============================================================
  const territoryPerformance = useMemo(() => {
    const areaMap = new Map<string, { totalSales: number; totalDue: number; customerCount: number }>();
    customers.forEach(cust => {
      const areaKey = cust.area || cust.district || 'General Area';
      const cur = areaMap.get(areaKey) || { totalSales: 0, totalDue: 0, customerCount: 0 };
      cur.totalDue += cust.currentDue || 0;
      cur.customerCount += 1;
      areaMap.set(areaKey, cur);
    });

    salesInvoices.forEach(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      const areaKey = cust?.area || cust?.district || 'General Area';
      if (areaMap.has(areaKey)) {
        areaMap.get(areaKey)!.totalSales += inv.grandTotal;
      }
    });

    return Array.from(areaMap.entries()).map(([area, data]) => {
      const recoveryPct = data.totalSales > 0
        ? Math.max(0, Math.min(100, Math.round(((data.totalSales - data.totalDue) / data.totalSales) * 100)))
        : (data.totalDue > 0 ? 0 : 100);
      return {
        area,
        totalSales: data.totalSales,
        totalDue: data.totalDue,
        customerCount: data.customerCount,
        recoveryPct
      };
    }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
  }, [customers, salesInvoices]);

  // ==============================================================
  // FEATURE 7: SALES OFFICERS & FIELD REPS LEADERBOARD
  // ==============================================================
  const salesmanLeaderboard = useMemo(() => {
    return salesmen.map(sm => {
      const smInvoices = salesInvoices.filter(i => i.salesmanId === sm.id || i.salesmanName === sm.name);
      const billedSales = smInvoices.reduce((s, i) => s + i.grandTotal, 0) || sm.currentMonthSales || 0;
      const collections = smInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0) || sm.currentMonthCollection || 0;
      const units = smInvoices.reduce((s, i) => s + i.items.reduce((acc, it) => acc + (it.quantity || 1), 0), 0) || sm.currentMonthUnits || 0;
      const target = sm.monthlyTarget || 1000000;
      const targetPct = target > 0 ? Math.min(150, Math.round((billedSales / target) * 100)) : 0;
      const recoveryRate = billedSales > 0 ? Math.min(100, Math.round((collections / billedSales) * 100)) : 100;

      return {
        id: sm.id,
        name: sm.name,
        code: sm.employeeCode,
        area: sm.assignedArea,
        units,
        billedSales,
        collections,
        target,
        targetPct,
        recoveryRate
      };
    }).sort((a, b) => b.billedSales - a.billedSales).slice(0, 5);
  }, [salesmen, salesInvoices]);

  // ==============================================================
  // FEATURE 8: PRODUCT CATEGORY & MARGIN MATRIX
  // ==============================================================
  const categoryMatrix = useMemo(() => {
    const cats = ['Smartphone', 'Feature Phone', 'Audio & Accessories', 'Tablets / Wearables'];
    return cats.map(cat => {
      const catProds = products.filter(p => (p.category || '').toLowerCase().includes(cat.toLowerCase().split(' ')[0]));
      const catImeis = imeis.filter(i => i.status === 'In Stock' && catProds.some(p => p.id === i.productId));
      const valuation = catImeis.reduce((s, i) => s + (i.purchaseCost || 0), 0);
      const units = catImeis.length;
      const avgMargin = cat.includes('Audio') || cat.includes('Access') ? '38.5%' : cat.includes('Feature') ? '8.2%' : '5.8%';

      return {
        name: cat,
        units,
        valuation,
        margin: avgMargin
      };
    });
  }, [products, imeis]);

  // ==============================================================
  // FEATURE 9: WARRANTY, RMA & SERVICE CENTER RADAR
  // ==============================================================
  const rmaReceived = warrantyClaims.filter(w => w.status === 'Received').length;
  const rmaDispatched = warrantyClaims.filter(w => w.status === 'Dispatched to Service Center' || w.status === 'In Repair').length;
  const rmaRepaired = warrantyClaims.filter(w => w.status === 'Repaired' || w.status === 'Replaced').length;
  const rmaDelivered = warrantyClaims.filter(w => w.status === 'Delivered to Customer').length;

  // RMA Failure rate calculation
  const brandRMAStats = brands.map(b => {
    const bClaims = warrantyClaims.filter(w => (w.brandName || '').toLowerCase() === b.name.toLowerCase()).length;
    const bSold = imeis.filter(i => (i.brandName || '').toLowerCase() === b.name.toLowerCase() && i.status === 'Sold').length;
    const failureRate = bSold > 0 ? ((bClaims / bSold) * 100).toFixed(1) : '0.0';
    return {
      brand: b.name,
      claims: bClaims,
      sold: bSold,
      rate: failureRate
    };
  }).filter(b => b.sold > 0 || b.claims > 0).slice(0, 4);

  // ==============================================================
  // FEATURE 10: OPERATIONAL EXPENSE BREAKDOWN & CASH BURN RATE
  // ==============================================================
  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const cat = e.categoryName || 'Other Expenses';
      map.set(cat, (map.get(cat) || 0) + e.amount);
    });

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    let idx = 0;
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[idx++ % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [expenses]);

  const dailyBurnRate = expenses.length > 0 ? Math.round(totalExpenses / 30) : 0;
  const opexToRevenuePct = totalSalesRevenue > 0 ? ((totalExpenses / totalSalesRevenue) * 100).toFixed(1) : '0.0';

  // ==============================================================
  // TIME-BASED CHART DATA (7 Days & Monthly)
  // ==============================================================
  const daysList: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    daysList.push(d.toISOString().split('T')[0]);
  }

  const salesTrend7Days = daysList.map(dateStr => {
    const dayInvoices = salesInvoices.filter(inv => inv.invoiceDate === dateStr);
    const daySales = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const dayUnits = dayInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + (it.quantity || 1), 0), 0);

    const invoiceCollections = dayInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const cashCollections = cashTransactions
      .filter(tx => tx.type === 'Cash In' && tx.date.startsWith(dateStr))
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalCollections = Math.max(invoiceCollections, cashCollections);

    const dObj = new Date(dateStr);
    const periodLabel = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    return {
      period: periodLabel,
      sales: daySales,
      collections: totalCollections,
      units: dayUnits
    };
  });

  // Dynamic Monthly Sales Trend
  const monthsMap = new Map<string, { sales: number; collections: number; units: number }>();
  salesInvoices.forEach(inv => {
    const monthKey = inv.invoiceDate ? inv.invoiceDate.substring(0, 7) : '2026-10';
    const cur = monthsMap.get(monthKey) || { sales: 0, collections: 0, units: 0 };
    cur.sales += inv.grandTotal;
    cur.collections += inv.paidAmount;
    cur.units += inv.items.reduce((s, it) => s + (it.quantity || 1), 0);
    monthsMap.set(monthKey, cur);
  });

  const sortedMonthKeys = Array.from(monthsMap.keys()).sort();
  const salesTrendMonthly = sortedMonthKeys.length > 0 ? sortedMonthKeys.map(k => {
    const val = monthsMap.get(k)!;
    const [y, m] = k.split('-');
    const mDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const mLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
    return {
      period: mLabel,
      sales: val.sales,
      collections: val.collections,
      units: val.units
    };
  }) : salesTrend7Days;

  const activeSalesTrendData = dashboardTimeframe === 'month' ? salesTrendMonthly : salesTrend7Days;

  // Brand sales data
  const brandColors: Record<string, string> = {
    Samsung: '#2563eb',
    Xiaomi: '#ea580c',
    Apple: '#475569',
    Vivo: '#4f46e5',
    Realme: '#eab308',
    Oppo: '#16a34a',
    Tecno: '#06b6d4',
    OnePlus: '#dc2626'
  };

  const topBrandData = brands.map(b => {
    const bImeis = imeis.filter(i => (i.brandName || '').toLowerCase() === b.name.toLowerCase());
    const inStock = bImeis.filter(i => i.status === 'In Stock').length;
    const soldImeisCount = bImeis.filter(i => i.status === 'Sold').length;

    let actualRevenue = 0;
    let actualUnitsSold = 0;
    salesInvoices.forEach(inv => {
      inv.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        if ((prod && prod.brandName.toLowerCase() === b.name.toLowerCase()) || it.productName.toLowerCase().includes(b.name.toLowerCase())) {
          actualRevenue += it.totalAmount;
          actualUnitsSold += it.quantity;
        }
      });
    });

    const totalSold = Math.max(soldImeisCount, actualUnitsSold);

    return {
      name: b.name,
      unitsSold: totalSold,
      inStockUnits: inStock,
      revenue: actualRevenue,
      color: brandColors[b.name] || '#3b82f6'
    };
  }).sort((a, b) => brandMetric === 'units' ? b.unitsSold - a.unitsSold : b.revenue - a.revenue);

  // Profit/Loss Telemetry Data
  const dailyProfitLossData = daysList.map(dateStr => {
    const dayInvoices = salesInvoices.filter(inv => inv.invoiceDate === dateStr);
    const revenue = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const cogs = dayInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + ((it.unitCost || 0) * (it.quantity || 1)), 0), 0);
    const dayExpenses = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - dayExpenses;
    const margin = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

    const dObj = new Date(dateStr);
    const dayLabel = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    return {
      day: dayLabel,
      revenue,
      cogs,
      expenses: dayExpenses,
      grossProfit,
      netProfit,
      margin
    };
  });

  const totalWeeklyRevenue = dailyProfitLossData.reduce((sum, d) => sum + d.revenue, 0);
  const totalWeeklyNetProfit = dailyProfitLossData.reduce((sum, d) => sum + d.netProfit, 0);
  const avgNetMarginVal = totalWeeklyRevenue > 0
    ? ((totalWeeklyNetProfit / totalWeeklyRevenue) * 100).toFixed(1)
    : '0.0';

  const positiveProfitDays = [...dailyProfitLossData].filter(d => d.netProfit > 0);
  const peakDayObj = positiveProfitDays.length > 0
    ? positiveProfitDays.sort((a, b) => b.netProfit - a.netProfit)[0]
    : null;
  const peakProfitDayStr = peakDayObj
    ? `${peakDayObj.day} (৳${(peakDayObj.netProfit / 100000).toFixed(2)}L)`
    : '—';

  const estimatedAnnualRoiVal = totalStockValuation > 0 && totalWeeklyNetProfit > 0
    ? (((totalWeeklyNetProfit * 52) / totalStockValuation) * 100).toFixed(1) + '%'
    : '0.0%';

  // Custom Tooltip
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 border border-slate-700/80 font-sans z-50">
          <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1">{label}</div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                <span>{item.name}:</span>
              </span>
              <strong className="font-mono font-bold text-white">
                {typeof item.value === 'number' && item.name.toLowerCase().includes('unit')
                  ? `${item.value} Units`
                  : typeof item.value === 'number' && item.name.toLowerCase().includes('margin')
                  ? `${item.value}%`
                  : formatBDT(item.value)}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={dashboardContainerRef}
      className={`w-full transition-all duration-300 ${
        isFullscreen
          ? 'bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 overflow-y-auto fixed inset-0 z-50'
          : 'p-3 sm:p-5 md:p-6 space-y-5 md:space-y-6 max-w-7xl mx-auto'
      }`}
    >
      {/* ============================================================== */}
      {/* FEATURE 1: EXECUTIVE COMMAND BAR & FULLSCREEN TOOLBAR          */}
      {/* ============================================================== */}
      <div className={`rounded-2xl border transition-all ${
        isFullscreen
          ? 'bg-slate-900 border-slate-800 p-4 sm:p-5 text-white shadow-xl mb-4'
          : 'bg-white border-slate-200/90 p-4 sm:p-5 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Header titles & Live pulse */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {isBn ? 'টেলিকর্প এক্সিকিউটিভ ড্যাশবোর্ড' : 'TeleCorp Executive Mission Control'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
                {isFullscreen && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Wall Display Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {liveTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {warehouses[0]?.name || 'Central Distribution Hub'}
                </span>
                <span>•</span>
                <span>{new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Timeframe & Action Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            {/* Timeframe pill selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-slate-700">
              {(['today', '7days', 'month', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setDashboardTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    dashboardTimeframe === tf
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf === 'today' ? (isBn ? 'আজকে' : 'Today') :
                   tf === '7days' ? (isBn ? '৭ দিন' : '7 Days') :
                   tf === 'month' ? (isBn ? 'চলতি মাস' : 'Month') :
                   (isBn ? 'সব' : 'All')}
                </button>
              ))}
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isSyncing}
              title="Refresh and sync cloud telemetry"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* FULLSCREEN TOGGLE BUTTON */}
            <button
              onClick={toggleFullScreen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs shrink-0 ${
                isFullscreen
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ছোট পর্দা' : 'Exit Fullscreen'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ফুল স্ক্রিন' : 'Full Screen'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Buttons Toolbar (Touch-friendly & fully responsive) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-2 pb-1 sm:pb-0">
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs shrink-0 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ {isBn ? 'রিটেইল POS' : 'Retail POS'}</span>
          </button>
          <button
            onClick={() => onSelectView('wholesale-sales')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs shrink-0 transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>+ {isBn ? 'হোলসেল ইনভয়েস' : 'Wholesale Sale'}</span>
          </button>
          <button
            onClick={onOpenNewPurchase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs shrink-0 transition"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>+ {isBn ? 'পারচেজ GRN' : 'New Purchase GRN'}</span>
          </button>
          <button
            onClick={onOpenDueCollection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs shrink-0 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ {isBn ? 'বকেয়া আদায়' : 'Due Collection'}</span>
          </button>
          <button
            onClick={() => onOpenIMEILookup()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs shrink-0 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isBn ? 'IMEI ট্র্যাকার' : 'IMEI Tracker'}</span>
          </button>
          <button
            onClick={() => onSelectView('day-closing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs shrink-0 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isBn ? 'ডে ক্লোজিং' : 'Day Closing'}</span>
          </button>
          <button
            onClick={() => onSelectView('cash-bank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs shrink-0 transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isBn ? 'ক্যাশ ও ব্যাংক খতিয়ান' : 'Cash & Bank Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{criticalAlerts[0].title}</div>
              <p className="text-xs text-rose-100 truncate">{criticalAlerts[0].message}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectView('alert-center')}
            className="px-3 py-1.5 bg-white text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 transition shrink-0"
          >
            {isBn ? 'অ্যালার্ট পর্যালোচনা' : 'Review Alerts'} ({criticalAlerts.length})
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* FEATURE 2: TODAY'S REAL-TIME OPERATIONAL PULSE BAROMETER       */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-700/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-extrabold text-sm sm:text-base text-white">
              {isBn ? 'আজকের ব্যবসায়িক পালস ও লক্ষ্যমাত্রা (Daily Operational Pulse)' : "Today's Operational Pulse & Sales Target"}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Date: {todayStr} • Dynamic Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Today's Billed Sales vs Daily Target */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isBn ? 'আজকের মোট সেলস' : "Today's Billed Sales"}</span>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {formatBDT(todaySalesRevenue)}
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{isBn ? 'দৈনিক টার্গেট' : 'Target'}: {formatBDT(defaultDailyTarget)}</span>
                <span className="font-bold text-blue-400">{todayTargetAchievementPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, todayTargetAchievementPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Today's Cash & Bank Inflow */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isBn ? 'আজকের ক্যাশ ও ব্যাংক ইন-ফ্লো' : "Today's Inflow Liquidity"}</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              {formatBDT(todayTotalLiquidity)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>From Invoices: {formatBDT(todayPaidCollections)}</span>
              <span className="text-emerald-400 font-semibold">100% Verified</span>
            </div>
          </div>

          {/* Card 3: Handset Units Dispatched vs Procured */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isBn ? 'আজকের হ্যান্ডসেট ডেলিভারি / ক্রয়' : "Handsets Sold / Inflow"}</span>
              <Smartphone className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {todayUnitsSold} <span className="text-xs font-normal text-slate-400">Units Sold</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Procured: <b>{todayUnitsPurchased} Units</b></span>
              <span className={todayUnitsSold >= todayUnitsPurchased ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                Net: {todayUnitsSold - todayUnitsPurchased >= 0 ? `+${todayUnitsSold - todayUnitsPurchased}` : todayUnitsSold - todayUnitsPurchased}
              </span>
            </div>
          </div>

          {/* Card 4: Field Force & Active Billing Orders */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isBn ? 'সক্রিয় সেলস প্রতিনিধি ও অর্ডার' : 'Active Reps & Open Invoices'}</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {activeSalesmenCount} <span className="text-xs font-normal text-slate-400">Reps On-Field</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Due Invoices: <b className="text-amber-400">{openInvoicesCount}</b></span>
              <button
                onClick={() => onSelectView('wholesale-sales')}
                className="text-purple-400 hover:underline font-semibold"
              >
                Inspect →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4 CORE EXECUTIVE FINANCIAL KPI CARDS                          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Stock Valuation */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'বর্তমান স্টক ভ্যালুয়েশন' : 'Current Stock Valuation'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {formatBDT(totalStockValuation)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>In-Stock: <b>{inStockUnits.length} Units</b></span>
            <button
              onClick={() => onSelectView('inventory')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px]"
            >
              View Stock →
            </button>
          </div>
        </div>

        {/* Customer Accounts Receivable */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'কাস্টমার বকেয়া (রিসিভেবল)' : 'Total Customer Due (AR)'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
            {formatBDT(totalReceivableDue)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Due Shops: <b>{customers.filter(c => c.currentDue > 0).length}</b></span>
            <button
              onClick={() => onSelectView('due-ageing')}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-[11px]"
            >
              Ageing Report →
            </button>
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'মোট নেট প্রফিট (Estimated)' : 'Net Operating Profit'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            {formatBDT(estimatedNetProfit)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Gross: {formatBDT(estimatedGrossProfit)}</span>
            <button
              onClick={() => onSelectView('accounting')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px]"
            >
              P&L Statement →
            </button>
          </div>
        </div>

        {/* Liquid Cash & Bank */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'মোট লিকুইড ক্যাশ ও ব্যাংক' : 'Total Cash & Bank'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight font-mono">
            {formatBDT(totalBankBalance + estimatedCashInHand)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Bank: {formatBDT(totalBankBalance)}</span>
            <button
              onClick={() => onSelectView('cash-bank')}
              className="text-purple-600 dark:text-purple-400 hover:underline font-bold text-[11px]"
            >
              Cash Book →
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: REAL-TIME CHARTS (AREA + TOP BRANDS)                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* CHART 1: Real-Time Sales & Collection Trends */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'সেলস ও কালেকশন গতিধারা' : 'Real-Time Sales & Collection Trends'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Billed sales revenue vs collected liquid liquidity cash inflows
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSalesTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                <Area type="monotone" dataKey="sales" name="Gross Billed Sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="collections" name="Payment Collections" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Period Sales</span>
              <div className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                {formatBDT(activeSalesTrendData.reduce((s, i) => s + i.sales, 0))}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Collections</span>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                {formatBDT(activeSalesTrendData.reduce((s, i) => s + i.collections, 0))}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Handsets Invoiced</span>
              <div className="font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
                {activeSalesTrendData.reduce((s, i) => s + i.units, 0)} Units
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: TOP-SELLING PRODUCT BRANDS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'শীর্ষ ব্র্যান্ড শেয়ার' : 'Top-Selling Brands'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Market share by volume & revenue
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setBrandMetric('units')}
                className={`px-2 py-0.5 rounded-md transition ${brandMetric === 'units' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Units
              </button>
              <button
                onClick={() => setBrandMetric('revenue')}
                className={`px-2 py-0.5 rounded-md transition ${brandMetric === 'revenue' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Revenue
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrandData.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => brandMetric === 'revenue' ? `৳${(val / 1000000).toFixed(1)}M` : `${val}`}
                />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 700 }} width={60} />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar dataKey={brandMetric === 'units' ? 'unitsSold' : 'revenue'} name={brandMetric === 'units' ? 'Units Sold' : 'Total Revenue'} radius={[0, 8, 8, 0]} barSize={18}>
                  {topBrandData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Top: <strong className="text-blue-600 font-bold">{topBrandData[0]?.name || 'N/A'}</strong> ({topBrandData[0]?.unitsSold || 0} Units)
            </span>
            <button onClick={() => onSelectView('brands')} className="text-blue-600 hover:underline font-semibold text-[11px]">
              Brand Master →
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEATURE 3 & 4: IMEI STOCK HEALTH (DONUT) & WHOLESALE VS RETAIL */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* FEATURE 3: IMEI Stock Lifecycle Donut Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'আইএমইআই স্টক সাইকেল ও হেলথ অ্যানালিটিক্স' : 'IMEI Stock Lifecycle & Health Distribution'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Current inventory status, holding age & stock turnaround index
              </p>
            </div>
            <button
              onClick={() => onSelectView('inventory')}
              className="text-xs text-blue-600 hover:underline font-semibold shrink-0"
            >
              All IMEI →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-6 h-48 sm:h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockHealthPieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stockHealthPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomCurrencyTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Ageing Indicators */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">Fresh Stock (&lt;15 Days)</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Fast Moving Devices</div>
                </div>
                <strong className="text-emerald-700 dark:text-emerald-300 font-mono text-sm">{freshStockCount} Pcs</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-800 dark:text-blue-300">Standard (15-45 Days)</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400">Regular Trading Cycle</div>
                </div>
                <strong className="text-blue-700 dark:text-blue-300 font-mono text-sm">{normalStockCount} Pcs</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-800 dark:text-rose-300">Ageing Stock (&gt;45 Days)</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400">Clearance / Discount Alert</div>
                </div>
                <strong className="text-rose-700 dark:text-rose-300 font-mono text-sm">{agingStockCount} Pcs</strong>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 4: B2B Wholesale vs B2C POS Retail Split */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'হোলসেল বনাম রিটেইল চ্যানেল অ্যানালাইসিস' : 'Wholesale vs Retail Channel Split'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                B2B dealer sales vs B2C retail POS revenue & order values
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectView('wholesale-sales')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Wholesale →
              </button>
            </div>
          </div>

          {/* Visual Channel Share Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="text-indigo-600">B2B Wholesale ({wholesaleSharePct}%)</span>
              <span className="text-emerald-600">B2C Retail POS ({retailSharePct}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-indigo-600 h-full transition-all" style={{ width: `${wholesaleSharePct}%` }} />
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${retailSharePct}%` }} />
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Wholesale Details */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 space-y-1">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                <span>Wholesale B2B</span>
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">
                {formatBDT(wholesaleRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>Invoices: <b>{wholesaleInvoices.length}</b> • {wholesaleUnits} Units</div>
                <div>Avg Order Value: <b>{formatBDT(wholesaleAOV)}</b></div>
              </div>
            </div>

            {/* Retail POS Details */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                <span>Retail POS</span>
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {formatBDT(retailRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>Invoices: <b>{retailInvoices.length}</b> • {retailUnits} Units</div>
                <div>Avg Order Value: <b>{formatBDT(retailAOV)}</b></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Credit Risk: Wholesale accounts for 90%+ of receivables due.</span>
            <button onClick={onOpenNewSale} className="text-blue-600 hover:underline font-semibold">
              Open POS Cash Register →
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEATURE 5 & 6: SUPPLIER RADAR & TERRITORY DEALER MATRIX        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* FEATURE 5: Supplier Payables & Procurement Pipeline Radar */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'সাপ্লায়ার বকেয়া ও ক্রয় পাইপলাইন' : 'Supplier Payables & Procurement Pipeline'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Outstanding vendor credit & purchase orders awaiting payment
              </p>
            </div>
            <button onClick={() => onSelectView('suppliers')} className="text-xs text-blue-600 hover:underline font-semibold shrink-0">
              Vendors →
            </button>
          </div>

          {/* Supplier Total Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Total Accounts Payable (AP)</span>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">{formatBDT(totalPayableDue)}</div>
            </div>
            <button
              onClick={() => onSelectView('purchases')}
              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition"
            >
              + Purchase GRN
            </button>
          </div>

          {/* Top Vendors Table */}
          <div className="space-y-2.5">
            {topPayableSuppliers.length > 0 ? (
              topPayableSuppliers.map(sup => {
                const utilPct = sup.creditLimit > 0 ? Math.min(100, Math.round((sup.currentDue / sup.creditLimit) * 100)) : 0;
                return (
                  <div key={sup.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{sup.companyName || sup.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">Terms: {sup.paymentTermsDays || 15} Days • Limit: {formatBDT(sup.creditLimit)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-rose-600">{formatBDT(sup.currentDue)}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${utilPct >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                        {utilPct}% Limit
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                কোনো সরবরাহকারী বকেয়া রেকর্ড নেই (All Cleared)
              </div>
            )}
          </div>
        </div>

        {/* FEATURE 6: Territory & Area-wise Dealer Performance */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'এরিয়া ও টেরিটোরি ভিত্তিক সেলস পারফরম্যান্স' : 'Territory & Area-Wise Dealer Performance'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Regional revenue distribution & collection recovery rate
              </p>
            </div>
            <button onClick={() => onSelectView('dealers')} className="text-xs text-purple-600 hover:underline font-semibold shrink-0">
              Dealers →
            </button>
          </div>

          <div className="space-y-3">
            {territoryPerformance.length > 0 ? (
              territoryPerformance.map((t, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {t.area} <span className="text-[10px] text-slate-400">({t.customerCount} Dealers)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{formatBDT(t.totalSales)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        t.recoveryPct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        t.recoveryPct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.recoveryPct}% Recov
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        t.recoveryPct >= 80 ? 'bg-emerald-500' : t.recoveryPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, t.recoveryPct)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                কোনো এরিয়া সেলস ডাটা পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEATURE 7 & 8: SALES REPS LEADERBOARD & CATEGORY MARGIN MATRIX */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* FEATURE 7: Sales Reps Leaderboard */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'ফিল্ড সেলস অফিসার ও রিকভারি লিডারবোর্ড' : 'Sales Officers & Field Reps Leaderboard'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Top field officers ranked by billed sales & cash recovery
              </p>
            </div>
            <button onClick={() => onSelectView('salesmen')} className="text-xs text-blue-600 hover:underline font-semibold shrink-0">
              All Reps →
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-2">Officer</th>
                  <th className="pb-2">Territory</th>
                  <th className="pb-2 text-right">Units</th>
                  <th className="pb-2 text-right">Sales Billed</th>
                  <th className="pb-2 text-right">Target %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesmanLeaderboard.map((sm, idx) => (
                  <tr key={sm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{sm.name}</div>
                        <div className="text-[10px] text-slate-400">{sm.code}</div>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 font-medium">{sm.area || 'General'}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{sm.units}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{formatBDT(sm.billedSales)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sm.targetPct >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {sm.targetPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURE 8: Category & Margin Matrix */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'ক্যাটাগরি ও অ্যাক্সেসরিজ মার্জিন' : 'Category & Margin Matrix'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Handsets vs high-margin accessories contribution
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {categoryMatrix.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{cat.name}</div>
                  <div className="text-[10px] text-slate-400">Stock: {cat.units} Units • Valuation: {formatBDT(cat.valuation)}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                    {cat.margin} Margin
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              Strategic Business Insight
            </div>
            <p>
              Audio cables & fast chargers have 35-50% gross margin compared to 4-7% on flagship smartphones. Promoting bundle sales significantly boosts net profit.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEATURE 9 & 10: WARRANTY/RMA MONITOR & EXPENSE BURN RATE       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* FEATURE 9: Warranty, RMA & Service Center Monitor */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'ওয়ারেন্টি, সার্ভিসিং ও আরএমএ মনিটর' : 'Warranty, RMA & Service Center Radar'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Device replacement claims & brand failure rates
              </p>
            </div>
            <button onClick={() => onSelectView('warranty')} className="text-xs text-cyan-600 hover:underline font-semibold shrink-0">
              Warranty Claims →
            </button>
          </div>

          {/* 4 Pipeline Status Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Under Check</span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{rmaReceived} Pcs</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">At Brand Care</span>
              <strong className="text-sm font-black text-amber-600 mt-0.5 font-mono">{rmaDispatched} Pcs</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800">
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold block">Repaired</span>
              <strong className="text-sm font-black text-blue-600 mt-0.5 font-mono">{rmaRepaired} Pcs</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">Delivered</span>
              <strong className="text-sm font-black text-emerald-600 mt-0.5 font-mono">{rmaDelivered} Pcs</strong>
            </div>
          </div>

          {/* Brand Return Rate */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Brand Failure & Claim Index:</div>
            {brandRMAStats.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-slate-600 dark:text-slate-400">{b.brand}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{b.claims} Claims</span>
                  <span className="font-mono font-bold text-rose-600">{b.rate}% RMA Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURE 10: Operational Expense Breakdown & Cash Burn Rate */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isBn ? 'খরচ বিভাজন ও ক্যাশ বার্ন রেট অ্যানালাইসিস' : 'Expense Breakdown & Cash Burn Rate'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Overheads, showroom rent, staff payroll & OPEX ratio
              </p>
            </div>
            <button onClick={() => onSelectView('expenses')} className="text-xs text-rose-600 hover:underline font-semibold shrink-0">
              Expenses →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Burn Rate</span>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">{formatBDT(dailyBurnRate)}/day</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">OPEX / Revenue Ratio</span>
              <div className="text-base font-black text-blue-600 font-mono mt-0.5">{opexToRevenuePct}%</div>
            </div>
          </div>

          {/* Expense Categories List */}
          <div className="space-y-2 pt-1 text-xs">
            {expenseBreakdown.map((exp, idx) => {
              const pct = totalExpenses > 0 ? Math.round((exp.value / totalExpenses) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{exp.name}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatBDT(exp.value)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: exp.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: DAILY PROFIT & LOSS TELEMETRY COMPOSED CHART           */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {isBn ? 'দৈনিক লাভ-ক্ষতি ও মার্জিন বিশ্লেষণ' : 'Daily Profit & Loss Telemetry (Margin Contribution)'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Daily revenue vs procurement COGS, operating overheads, and net trading margins
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setProfitMetric('all')}
              className={`px-3 py-1 rounded-lg transition ${profitMetric === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold' : 'text-slate-500'}`}
            >
              Comprehensive
            </button>
            <button
              onClick={() => setProfitMetric('profitOnly')}
              className={`px-3 py-1 rounded-lg transition ${profitMetric === 'profitOnly' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold' : 'text-slate-500'}`}
            >
              Net Profit Only
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyProfitLossData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
              <Tooltip content={<CustomCurrencyTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />

              {profitMetric === 'all' && (
                <>
                  <Bar yAxisId="left" dataKey="revenue" name="Daily Revenue" fill="#93c5fd" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar yAxisId="left" dataKey="cogs" name="COGS Cost" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar yAxisId="left" dataKey="expenses" name="Operating Expenses" fill="#fca5a5" radius={[6, 6, 0, 0]} barSize={16} />
                </>
              )}

              <Bar yAxisId="left" dataKey="netProfit" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
              <Line yAxisId="right" type="monotone" dataKey="margin" name="Margin %" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">Avg Net Margin</span>
            <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black font-mono">{totalWeeklyRevenue > 0 ? `${avgNetMarginVal}%` : '0.0%'}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-300 font-medium">Weekly Net Profit</span>
            <strong className="text-blue-700 dark:text-blue-400 text-sm font-black font-mono">{totalWeeklyNetProfit !== 0 ? formatBDT(totalWeeklyNetProfit) : '৳ 0'}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Peak Profit Day</span>
            <strong className="text-slate-900 dark:text-white text-sm font-black font-mono">{peakProfitDayStr}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 flex items-center justify-between">
            <span className="text-purple-800 dark:text-purple-300 font-medium">Estimated Annual ROI</span>
            <strong className="text-purple-700 dark:text-purple-400 text-sm font-black font-mono">{estimatedAnnualRoiVal}</strong>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MULTI-BRAND LINEUP & STOCK DISTRIBUTION GRID                    */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isBn ? 'মাল্টি-ব্র্যান্ড স্টক ও পারফরম্যান্স' : 'Multi-Brand Lineup & Stock Distribution'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live device stock counts and authorized dealership channels
            </p>
          </div>
          <button onClick={() => onSelectView('brands')} className="text-xs text-blue-600 hover:underline font-semibold">
            Manage Brands →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {brands.map(brand => {
            const brandImeis = imeis.filter(i => (i.brandName || '').toLowerCase() === brand.name.toLowerCase());
            const brandInStock = brandImeis.filter(i => i.status === 'In Stock').length;
            const brandSold = brandImeis.filter(i => i.status === 'Sold').length;

            return (
              <div
                key={brand.id}
                onClick={() => onSelectView('inventory')}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/60 hover:border-blue-300 cursor-pointer transition text-center group"
              >
                <div className="text-2xl mb-1">{brand.logo}</div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{brand.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  <span className="font-bold text-emerald-600">{brandInStock}</span> in stock
                </div>
                <div className="text-[10px] text-slate-400">
                  {brandSold} sold
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* RECENT SALES & HIGH OUTSTANDING DEALERS                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left: Recent Invoices */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isBn ? 'সাম্প্রতিক সেলস ইনভয়েস' : 'Recent Sales & Dealer Invoices'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest wholesale and POS retail transactions
              </p>
            </div>
            <button onClick={() => onSelectView('wholesale-sales')} className="text-xs text-blue-600 hover:underline font-semibold">
              All Invoices →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {salesInvoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-lg transition gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-blue-600">{inv.invoiceNo}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{inv.customerName}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {formatDate(inv.invoiceDate)} • {inv.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>
                </div>

                <div className="text-right flex items-center gap-2.5 shrink-0">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white font-mono">{formatBDT(inv.grandTotal)}</div>
                    {inv.dueAmount > 0 ? (
                      <div className="text-[11px] text-amber-600 font-semibold font-mono">Due: {formatBDT(inv.dueAmount)}</div>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-semibold">Fully Paid</div>
                    )}
                  </div>

                  <button
                    onClick={() => onPrintInvoice(inv.invoiceNo)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Print Tax Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dealers with High Outstanding */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isBn ? 'সর্বোচ্চ বকেয়া ডিলার ও ক্রেডিট লিমিট' : 'High Outstanding Dealers'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parties requiring recovery & credit monitoring
              </p>
            </div>
            <button onClick={() => onSelectView('due-ageing')} className="text-xs text-amber-600 hover:underline font-semibold">
              Ageing Matrix →
            </button>
          </div>

          <div className="space-y-3">
            {customers
              .filter(c => c.currentDue > 0)
              .sort((a, b) => b.currentDue - a.currentDue)
              .slice(0, 4)
              .map(cust => {
                const percent = cust.creditLimit > 0 ? Math.min(100, Math.round((cust.currentDue / cust.creditLimit) * 100)) : 0;
                const isNearLimit = percent >= 85;

                return (
                  <div key={cust.id} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{cust.shopName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{cust.area}, {cust.district} • {cust.salesmanName || 'General'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-rose-600 font-mono">{formatBDT(cust.currentDue)}</div>
                        <div className="text-[10px] text-slate-400">Limit: {formatBDT(cust.creditLimit)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Credit Limit Utilized</span>
                        <span className={`font-bold ${isNearLimit ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent >= 90 ? 'bg-rose-600' : percent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
