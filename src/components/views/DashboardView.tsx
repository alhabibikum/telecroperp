import React, { useState } from 'react';
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
  Award
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
  Cell
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
    bankAccounts,
    cashTransactions,
    chartOfAccounts,
    expenses,
    alerts,
    settings
  } = useERP();

  const isBn = settings.language === 'bn';

  // Visualization state filters
  const [salesTrendTimeframe, setSalesTrendTimeframe] = useState<'7days' | 'monthly'>('7days');
  const [brandMetric, setBrandMetric] = useState<'units' | 'revenue'>('units');
  const [profitMetric, setProfitMetric] = useState<'all' | 'profitOnly'>('all');

  // Compute key executive metrics
  const totalSalesRevenue = salesInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalReceivableDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalPayableDue = suppliers.reduce((acc, s) => acc + s.currentDue, 0);

  // Stock valuation: sum of purchaseCost of all 'In Stock' IMEIs
  const inStockUnits = imeis.filter(i => i.status === 'In Stock');
  const totalStockValuation = inStockUnits.reduce((acc, i) => acc + i.purchaseCost, 0);

  // Bank & Cash liquid total (Single Source of Truth)
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + (b.currentBalance || 0), 0);
  const openingVaultCash = chartOfAccounts.find(a => a.code === '1000')?.balance || 0;
  const cashInTotal = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const cashOutTotal = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const estimatedCashInHand = Math.max(0, openingVaultCash + cashInTotal - cashOutTotal);

  // Profit estimation: Total Revenue minus total cost of goods sold
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
  // CHART DATA 1: REAL-TIME SALES & COLLECTION TRENDS (DYNAMIC)
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
    const dayUnits = dayInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + it.quantity, 0), 0);

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
    cur.units += inv.items.reduce((s, it) => s + it.quantity, 0);
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

  const activeSalesTrendData = salesTrendTimeframe === '7days' ? salesTrend7Days : salesTrendMonthly;

  // ==============================================================
  // CHART DATA 2: TOP-SELLING PRODUCT BRANDS (DYNAMIC LIVE AGGREGATION)
  // ==============================================================
  const brandColors: Record<string, string> = {
    Samsung: '#2563eb', // blue
    Xiaomi: '#ea580c',  // orange
    Apple: '#475569',   // slate
    Vivo: '#4f46e5',    // indigo
    Realme: '#eab308',  // yellow
    Oppo: '#16a34a',    // green
    Tecno: '#06b6d4',   // cyan
    OnePlus: '#dc2626'  // red
  };

  const topBrandData = brands.map(b => {
    const bImeis = imeis.filter(i => i.brandName.toLowerCase() === b.name.toLowerCase());
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

  // ==============================================================
  // CHART DATA 3: DAILY PROFIT / LOSS & EXPENSES BREAKDOWN (DYNAMIC)
  // ==============================================================
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

  // Dynamic summary metrics for Weekly Profit & Loss telemetry (Never hardcoded)
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

  // Custom Recharts Tooltip Formatter
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 font-sans z-50">
          <div className="font-bold text-slate-300 border-b border-slate-700 pb-1">{label}</div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
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
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Alert if Critical */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {criticalAlerts[0].title}
              </div>
              <p className="text-xs text-rose-100 mt-0.5 line-clamp-1">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectView('alert-center')}
            className="px-3 py-1.5 bg-white text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-50 transition shrink-0"
          >
            Review Alerts ({criticalAlerts.length})
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'বর্তমান স্টক ভ্যালুয়েশন' : 'Current Stock Valuation'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatBDT(totalStockValuation)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>In-Stock Handsets: <b>{inStockUnits.length} Units</b></span>
            <button
              onClick={() => onSelectView('inventory')}
              className="text-blue-600 hover:underline font-semibold text-[11px]"
            >
              View Stock →
            </button>
          </div>
        </div>

        {/* Customer Accounts Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'কাস্টমার বকেয়া (রিসিভেবল)' : 'Total Customer Due (AR)'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 tracking-tight">
            {formatBDT(totalReceivableDue)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Dealers with Due: <b>{customers.filter(c => c.currentDue > 0).length} Shops</b></span>
            <button
              onClick={() => onSelectView('due-ageing')}
              className="text-amber-600 hover:underline font-semibold text-[11px]"
            >
              Ageing Report →
            </button>
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'মোট নেট প্রফিট (Estimated)' : 'Net Operating Profit'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 tracking-tight">
            {formatBDT(estimatedNetProfit)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Gross: {formatBDT(estimatedGrossProfit)}</span>
            <button
              onClick={() => onSelectView('accounting')}
              className="text-emerald-600 hover:underline font-semibold text-[11px]"
            >
              P&L Statement →
            </button>
          </div>
        </div>

        {/* Liquid Cash & Bank */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBn ? 'মোট লিকুইড ক্যাশ ও ব্যাংক' : 'Total Cash & Bank'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-700 tracking-tight">
            {formatBDT(totalBankBalance + estimatedCashInHand)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Bank: {formatBDT(totalBankBalance)}</span>
            <button
              onClick={() => onSelectView('cash-bank')}
              className="text-purple-600 hover:underline font-semibold text-[11px]"
            >
              Cash Book →
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE DATA VISUALIZATION WIDGETS (RECHARTS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WIDGET 1: REAL-TIME SALES & COLLECTION TRENDS */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Real-Time Sales & Collection Trends
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daily billed sales revenue vs collected liquidity cash inflows
              </p>
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSalesTrendTimeframe('7days')}
                className={`px-3 py-1 rounded-lg transition ${
                  salesTrendTimeframe === '7days'
                    ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setSalesTrendTimeframe('monthly')}
                className={`px-3 py-1 rounded-lg transition ${
                  salesTrendTimeframe === 'monthly'
                    ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Trend
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSalesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Gross Billed Sales"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="collections"
                  name="Payment Collections"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Period Sales</span>
              <div className="font-extrabold text-blue-700 mt-0.5">
                {formatBDT(activeSalesTrendData.reduce((s, i) => s + i.sales, 0))}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Collections</span>
              <div className="font-extrabold text-emerald-700 mt-0.5">
                {formatBDT(activeSalesTrendData.reduce((s, i) => s + i.collections, 0))}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Handsets Invoiced</span>
              <div className="font-extrabold text-slate-900 mt-0.5">
                {activeSalesTrendData.reduce((s, i) => s + i.units, 0)} Units
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 2: TOP-SELLING PRODUCT BRANDS */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Top-Selling Brands
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Brand market share by unit volume & revenue
              </p>
            </div>

            {/* Metric Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setBrandMetric('units')}
                className={`px-2 py-0.5 rounded-md transition ${
                  brandMetric === 'units' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Units
              </button>
              <button
                onClick={() => setBrandMetric('revenue')}
                className={`px-2 py-0.5 rounded-md transition ${
                  brandMetric === 'revenue' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBrandData.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => brandMetric === 'revenue' ? `৳${(val / 1000000).toFixed(1)}M` : `${val}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontWeight: 700 }}
                  width={65}
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar
                  dataKey={brandMetric === 'units' ? 'unitsSold' : 'revenue'}
                  name={brandMetric === 'units' ? 'Units Sold' : 'Total Revenue'}
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                >
                  {topBrandData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Leader: <strong className="text-blue-700 font-bold">{topBrandData[0]?.name}</strong> ({topBrandData[0]?.unitsSold} Units)
            </span>
            <button
              onClick={() => onSelectView('brands')}
              className="text-blue-600 hover:underline font-semibold text-[11px]"
            >
              Brand Master →
            </button>
          </div>
        </div>
      </div>

      {/* WIDGET 3: DAILY PROFIT / LOSS & COST MARGIN SUMMARY */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Daily Profit & Loss Telemetry (Margin Contribution)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily revenue vs procurement COGS, operating overheads, and net trading margins
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setProfitMetric('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  profitMetric === 'all' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Comprehensive View
              </button>
              <button
                onClick={() => setProfitMetric('profitOnly')}
                className={`px-3 py-1 rounded-lg transition ${
                  profitMetric === 'profitOnly' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Net Profit Only
              </button>
            </div>
          </div>
        </div>

        {/* Composed Chart Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyProfitLossData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
              />
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <span className="text-emerald-800 font-medium">Avg Net Margin</span>
            <strong className="text-emerald-700 text-sm font-black">{totalWeeklyRevenue > 0 ? `${avgNetMarginVal}%` : '0.0%'}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <span className="text-blue-800 font-medium">Weekly Net Profit</span>
            <strong className="text-blue-700 text-sm font-black">{totalWeeklyNetProfit !== 0 ? formatBDT(totalWeeklyNetProfit) : '৳ 0'}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Peak Profit Day</span>
            <strong className="text-slate-900 text-sm font-black">{peakProfitDayStr}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
            <span className="text-purple-800 font-medium">Estimated Annual ROI</span>
            <strong className="text-purple-700 text-sm font-black">{estimatedAnnualRoiVal}</strong>
          </div>
        </div>
      </div>

      {/* Brand Performance Snapshot Icons Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'মাল্টি-ব্র্যান্ড স্টক ও পারফরম্যান্স' : 'Multi-Brand Lineup & Stock Distribution'}
            </h3>
            <p className="text-xs text-slate-500">
              Live device stock counts and authorized dealership channels
            </p>
          </div>
          <button
            onClick={() => onSelectView('brands')}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Manage Brands →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {brands.map(brand => {
            const brandImeis = imeis.filter(i => i.brandName.toLowerCase() === brand.name.toLowerCase());
            const brandInStock = brandImeis.filter(i => i.status === 'In Stock').length;
            const brandSold = brandImeis.filter(i => i.status === 'Sold').length;

            return (
              <div
                key={brand.id}
                onClick={() => onSelectView('inventory')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-300 cursor-pointer transition text-center group"
              >
                <div className="text-2xl mb-1">{brand.logo}</div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700">{brand.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  <span className="font-bold text-emerald-700">{brandInStock}</span> in stock
                </div>
                <div className="text-[10px] text-slate-400">
                  {brandSold} sold
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Wholesale Sales & High Due Aging Dealers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Invoices */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'সাম্প্রতিক সেলস ইনভয়েস' : 'Recent Sales & Dealer Invoices'}
              </h3>
              <p className="text-xs text-slate-500">
                Latest wholesale and POS retail transactions
              </p>
            </div>
            <button
              onClick={() => onSelectView('wholesale-sales')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              All Invoices →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {salesInvoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{inv.invoiceNo}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">{inv.customerName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(inv.invoiceDate)} • {inv.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{formatBDT(inv.grandTotal)}</div>
                    {inv.dueAmount > 0 ? (
                      <div className="text-[11px] text-amber-700 font-semibold">Due: {formatBDT(inv.dueAmount)}</div>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-semibold">Fully Paid</div>
                    )}
                  </div>

                  <button
                    onClick={() => onPrintInvoice(inv.invoiceNo)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition"
                    title="Print Tax Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dealers with Overdue / High Credit Usage */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'সর্বোচ্চ বকেয়া ডিলার ও ক্রেডিট লিমিট' : 'High Outstanding Dealers'}
              </h3>
              <p className="text-xs text-slate-500">
                Parties requiring recovery & credit monitoring
              </p>
            </div>
            <button
              onClick={() => onSelectView('due-ageing')}
              className="text-xs text-amber-600 hover:underline font-semibold"
            >
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
                  <div key={cust.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{cust.shopName}</div>
                        <div className="text-[11px] text-slate-500">{cust.area}, {cust.district} • {cust.salesmanName || 'General'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-rose-600">{formatBDT(cust.currentDue)}</div>
                        <div className="text-[10px] text-slate-400">Limit: {formatBDT(cust.creditLimit)}</div>
                      </div>
                    </div>

                    {/* Credit progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Credit Limit Utilized</span>
                        <span className={`font-bold ${isNearLimit ? 'text-rose-600' : 'text-slate-700'}`}>{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
