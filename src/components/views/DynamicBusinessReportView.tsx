import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Layers,
  Smartphone,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  RotateCcw,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  X,
  History,
  FileText,
  ShieldCheck,
  CreditCard,
  Percent,
  Search
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export type TimeframePreset = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportHistoryItem {
  id: string;
  reportName: string;
  reportType: 'Excel Multi-Sheet' | 'Executive PDF';
  dateRange: string;
  generatedBy: string;
  generatedAt: string;
  recordCount: number;
}

export const DynamicBusinessReportView: React.FC = () => {
  const {
    salesInvoices,
    purchaseInvoices,
    customerReturns,
    expenses,
    bankAccounts,
    cashTransactions,
    chartOfAccounts,
    imeis,
    products,
    brands,
    warehouses,
    customers,
    suppliers,
    salesmen,
    commissionDisbursements,
    settings,
    currentUserRole
  } = useERP();

  const isBn = settings.language === 'bn';

  // ==============================================================
  // 1. FILTER CONTROLS STATE
  // ==============================================================
  const todayStr = new Date().toISOString().split('T')[0];

  const [timeframe, setTimeframe] = useState<TimeframePreset>('monthly');
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // First of current month
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(todayStr);

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [comparePeriod, setComparePeriod] = useState<boolean>(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'kpi_dashboard' | 'sales' | 'inventory' | 'financials' | 'branches' | 'salesmen' | 'history'>('kpi_dashboard');

  // Owner Presentation Mode Modal
  const [showOwnerModal, setShowOwnerModal] = useState<boolean>(false);
  const [ownerPage, setOwnerPage] = useState<number>(1);

  // PDF Preview & Print Modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Export History state
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('telecorp_report_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'hist-1',
        reportName: 'Executive_Business_Report_September_2026',
        reportType: 'Excel Multi-Sheet',
        dateRange: '2026-09-01 to 2026-09-30',
        generatedBy: 'Director of Operations',
        generatedAt: '2026-10-01 10:15',
        recordCount: 142
      },
      {
        id: 'hist-2',
        reportName: 'Q3_Management_Financial_Review',
        reportType: 'Executive PDF',
        dateRange: '2026-07-01 to 2026-09-30',
        generatedBy: 'Chief Accountant Masum',
        generatedAt: '2026-10-02 16:40',
        recordCount: 420
      }
    ];
  });

  const saveHistory = (item: ReportHistoryItem) => {
    const updated = [item, ...reportHistory];
    setReportHistory(updated);
    try {
      localStorage.setItem('telecorp_report_history', JSON.stringify(updated.slice(0, 30)));
    } catch {}
  };

  // ==============================================================
  // 2. TIMEFRAME CALCULATIONS & RANGE RESOLVER
  // ==============================================================
  const handleTimeframeChange = (preset: TimeframePreset) => {
    setTimeframe(preset);
    const now = new Date();
    const endStr = now.toISOString().split('T')[0];
    setToDate(endStr);

    if (preset === 'daily') {
      setFromDate(endStr);
    } else if (preset === 'weekly') {
      const start = new Date(now);
      const day = start.getDay(); // 0 is Sunday
      start.setDate(start.getDate() - day);
      setFromDate(start.toISOString().split('T')[0]);
    } else if (preset === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(start.toISOString().split('T')[0]);
    } else if (preset === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      setFromDate(start.toISOString().split('T')[0]);
    } else if (preset === 'yearly') {
      const start = new Date(now.getFullYear(), 0, 1);
      setFromDate(start.toISOString().split('T')[0]);
    }
  };

  // Determine comparison period date range (Previous Period)
  const previousPeriodRange = useMemo(() => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays + 1);

    return {
      prevFrom: prevStart.toISOString().split('T')[0],
      prevTo: prevEnd.toISOString().split('T')[0]
    };
  }, [fromDate, toDate]);

  // ==============================================================
  // 3. FILTERED DATASETS (CURRENT & PREVIOUS PERIOD)
  // ==============================================================
  const isDateInRange = (d: string, start: string, end: string) => {
    if (!d) return false;
    const dateOnly = d.split('T')[0];
    return dateOnly >= start && dateOnly <= end;
  };

  // Filtered Sales Invoices
  const currentSales = useMemo(() => {
    return salesInvoices.filter(inv => {
      const dateMatch = isDateInRange(inv.invoiceDate, fromDate, toDate);
      const branchMatch = selectedBranch === 'all' || inv.warehouseId === selectedBranch;
      const salesmanMatch = selectedSalesman === 'all' || inv.salesmanId === selectedSalesman;
      const paymentMatch = selectedPaymentMethod === 'all' ||
        (selectedPaymentMethod === 'due' && inv.dueAmount > 0) ||
        (selectedPaymentMethod === 'cash' && (inv.payments || []).some(p => p.method === 'Cash')) ||
        (selectedPaymentMethod === 'bank' && (inv.payments || []).some(p => p.method === 'Bank Transfer' || p.method === 'Cheque' || p.method === 'bKash/Nagad'));
      const productMatch = selectedProduct === 'all' || (inv.items || []).some(it => it.productId === selectedProduct);
      const brandMatch = selectedBrand === 'all' || (inv.items || []).some(it => {
        const prod = products.find(p => p.id === it.productId);
        return prod?.brandName === selectedBrand;
      });

      return dateMatch && branchMatch && salesmanMatch && paymentMatch && productMatch && brandMatch;
    });
  }, [salesInvoices, fromDate, toDate, selectedBranch, selectedSalesman, selectedPaymentMethod, selectedProduct, selectedBrand, products]);

  // Previous Period Sales for Growth %
  const prevSales = useMemo(() => {
    return salesInvoices.filter(inv => {
      const dateMatch = isDateInRange(inv.invoiceDate, previousPeriodRange.prevFrom, previousPeriodRange.prevTo);
      const branchMatch = selectedBranch === 'all' || inv.warehouseId === selectedBranch;
      return dateMatch && branchMatch;
    });
  }, [salesInvoices, previousPeriodRange, selectedBranch]);

  // Filtered Purchases
  const currentPurchases = useMemo(() => {
    return purchaseInvoices.filter(p => {
      const dateMatch = isDateInRange(p.invoiceDate, fromDate, toDate);
      const branchMatch = selectedBranch === 'all' || p.warehouseId === selectedBranch;
      return dateMatch && branchMatch;
    });
  }, [purchaseInvoices, fromDate, toDate, selectedBranch]);

  const prevPurchases = useMemo(() => {
    return purchaseInvoices.filter(p => {
      const dateMatch = isDateInRange(p.invoiceDate, previousPeriodRange.prevFrom, previousPeriodRange.prevTo);
      const branchMatch = selectedBranch === 'all' || p.warehouseId === selectedBranch;
      return dateMatch && branchMatch;
    });
  }, [purchaseInvoices, previousPeriodRange, selectedBranch]);

  // Filtered Expenses
  const currentExpenses = useMemo(() => {
    return expenses.filter(e => isDateInRange(e.date, fromDate, toDate));
  }, [expenses, fromDate, toDate]);

  const prevExpenses = useMemo(() => {
    return expenses.filter(e => isDateInRange(e.date, previousPeriodRange.prevFrom, previousPeriodRange.prevTo));
  }, [expenses, previousPeriodRange]);

  // Filtered Customer Returns
  const currentReturns = useMemo(() => {
    return customerReturns.filter(r => isDateInRange(r.returnDate, fromDate, toDate));
  }, [customerReturns, fromDate, toDate]);

  // Filtered Cash In & Out
  const currentCashIn = useMemo(() => {
    return cashTransactions
      .filter(c => c.type === 'Cash In' && isDateInRange(c.date, fromDate, toDate))
      .reduce((sum, c) => sum + c.amount, 0);
  }, [cashTransactions, fromDate, toDate]);

  const currentCashOut = useMemo(() => {
    return cashTransactions
      .filter(c => c.type === 'Cash Out' && isDateInRange(c.date, fromDate, toDate))
      .reduce((sum, c) => sum + c.amount, 0);
  }, [cashTransactions, fromDate, toDate]);

  // ==============================================================
  // 4. CORE MATHEMATICAL & FINANCIAL METRICS (Single Source of Truth)
  // ==============================================================
  // Sales Metrics
  const totalSalesRevenue = currentSales.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalWholesaleRevenue = currentSales.filter(i => i.invoiceType === 'Wholesale').reduce((acc, i) => acc + i.grandTotal, 0);
  const totalRetailRevenue = currentSales.filter(i => i.invoiceType === 'Retail POS').reduce((acc, i) => acc + i.grandTotal, 0);
  const totalDiscounts = currentSales.reduce((acc, i) => acc + i.discountTotal, 0);
  const totalReturnCredits = currentReturns.reduce((acc, r) => acc + r.refundOrCreditAmount, 0);
  const netSalesRevenue = Math.max(0, totalSalesRevenue - totalReturnCredits);

  // Units Sold
  const totalUnitsSold = currentSales.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + (it.quantity || 1), 0), 0);

  // COGS Calculation
  const totalCOGS = currentSales.reduce((acc, inv) => {
    return acc + inv.items.reduce((s, it) => s + ((it.unitCost || 0) * (it.quantity || 1)), 0);
  }, 0);

  // Gross & Net Profit
  const grossProfit = Math.max(0, netSalesRevenue - totalCOGS);
  const grossMarginPercent = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100) : 0;

  // Operating Expenses & Commission
  const baseExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalesmanCommission = currentSales.reduce((acc, inv) => acc + (inv.commissionEarned || 0), 0);
  const totalOperatingExpenses = baseExpenses + totalSalesmanCommission;

  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = netSalesRevenue > 0 ? ((netOperatingProfit / netSalesRevenue) * 100) : 0;

  // Procurement (Purchase) Metrics
  const totalPurchasesAmount = currentPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalPurchasesUnits = currentPurchases.reduce((sum, p) => sum + p.items.reduce((s, it) => s + (it.quantity || 1), 0), 0);

  // Receivables & Payables (Market Dues)
  const totalReceivableDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.currentDue, 0);

  // Liquid Cash & Bank Position
  const openingVaultCash = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 685000;
  const lifetimeCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const lifetimeCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const currentCashInHand = Math.max(0, openingVaultCash + lifetimeCashIn - lifetimeCashOut);
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalLiquidFunds = currentCashInHand + totalBankBalance;

  // Stock Valuation & Counts
  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const totalStockValuation = inStockImeis.reduce((acc, i) => acc + i.purchaseCost, 0);

  // Low Stock / Out of Stock alerts count
  const lowStockCount = products.reduce((acc, p) => {
    const lowVariants = p.variants.filter(v => v.currentStock <= v.reorderLevel);
    return acc + lowVariants.length;
  }, 0);

  // Comparison Growth Ratios (Growth %)
  const prevSalesRevenue = prevSales.reduce((acc, i) => acc + i.grandTotal, 0);
  const salesGrowthPercent = prevSalesRevenue > 0
    ? (((totalSalesRevenue - prevSalesRevenue) / prevSalesRevenue) * 100)
    : 0;

  const prevPurchasesAmount = prevPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
  const purchaseGrowthPercent = prevPurchasesAmount > 0
    ? (((totalPurchasesAmount - prevPurchasesAmount) / prevPurchasesAmount) * 100)
    : 0;

  const prevExpensesAmount = prevExpenses.reduce((acc, e) => acc + e.amount, 0);
  const expenseGrowthPercent = prevExpensesAmount > 0
    ? (((totalOperatingExpenses - prevExpensesAmount) / prevExpensesAmount) * 100)
    : 0;

  // Average Ticket Size
  const avgOrderValue = currentSales.length > 0 ? (totalSalesRevenue / currentSales.length) : 0;

  // ==============================================================
  // 5. CHART DATA GENERATION
  // ==============================================================
  // Chart 1: Daily Trend across selected timeframe
  const trendData = useMemo(() => {
    const grouped: Record<string, { date: string; sales: number; profit: number; cogs: number; purchases: number }> = {};

    currentSales.forEach(inv => {
      const d = inv.invoiceDate;
      if (!grouped[d]) grouped[d] = { date: d, sales: 0, profit: 0, cogs: 0, purchases: 0 };
      grouped[d].sales += inv.grandTotal;
      const invCost = inv.items.reduce((s, it) => s + ((it.unitCost || 0) * (it.quantity || 1)), 0);
      grouped[d].cogs += invCost;
      grouped[d].profit += Math.max(0, inv.grandTotal - invCost);
    });

    currentPurchases.forEach(p => {
      const d = p.invoiceDate;
      if (!grouped[d]) grouped[d] = { date: d, sales: 0, profit: 0, cogs: 0, purchases: 0 };
      grouped[d].purchases += p.grandTotal;
    });

    const sortedKeys = Object.keys(grouped).sort();
    return sortedKeys.map(k => ({
      ...grouped[k],
      displayDate: formatDate(k)
    }));
  }, [currentSales, currentPurchases]);

  // Chart 2: Branch-wise Sales & Profit
  const branchData = useMemo(() => {
    return warehouses.map(wh => {
      const whSales = currentSales.filter(i => i.warehouseId === wh.id);
      const revenue = whSales.reduce((s, i) => s + i.grandTotal, 0);
      const cost = whSales.reduce((s, i) => s + i.items.reduce((c, it) => c + ((it.unitCost || 0) * (it.quantity || 1)), 0), 0);
      const profit = Math.max(0, revenue - cost);
      const units = inStockImeis.filter(i => i.warehouseId === wh.id).length;

      return {
        id: wh.id,
        name: wh.name.split('(')[0].trim(),
        fullName: wh.name,
        revenue,
        profit,
        stockUnits: units
      };
    });
  }, [warehouses, currentSales, inStockImeis]);

  // Chart 3: Brand Distribution
  const brandDistributionData = useMemo(() => {
    const map: Record<string, { name: string; value: number; units: number }> = {};
    currentSales.forEach(inv => {
      inv.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        const bName = prod?.brandName || 'Other';
        if (!map[bName]) map[bName] = { name: bName, value: 0, units: 0 };
        map[bName].value += (it.unitPrice || 0) * (it.quantity || 1);
        map[bName].units += it.quantity || 1;
      });
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [currentSales, products]);

  // Chart 4: Top 5 Best Selling Models
  const topProductsData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; units: number; profit: number }> = {};
    currentSales.forEach(inv => {
      inv.items.forEach(it => {
        const name = it.productName;
        if (!map[name]) map[name] = { name, revenue: 0, units: 0, profit: 0 };
        const lineRev = (it.unitPrice || 0) * (it.quantity || 1);
        const lineCost = (it.unitCost || 0) * (it.quantity || 1);
        map[name].revenue += lineRev;
        map[name].units += it.quantity || 1;
        map[name].profit += Math.max(0, lineRev - lineCost);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [currentSales]);

  // Salesmen Performance Data
  const salesmanPerformanceData = useMemo(() => {
    return salesmen.map(sm => {
      const smInvoices = currentSales.filter(i => i.salesmanId === sm.id);
      const soldRevenue = smInvoices.reduce((s, i) => s + i.grandTotal, 0);
      const units = smInvoices.reduce((s, i) => s + i.items.reduce((u, it) => u + (it.quantity || 1), 0), 0);
      const target = sm.targetAmount || 1;
      const achievementRate = Math.min(200, Math.round((soldRevenue / target) * 100));
      const commissionEarned = smInvoices.reduce((s, i) => s + (i.commissionEarned || 0), 0);

      return {
        id: sm.id,
        name: sm.name,
        phone: sm.phone,
        area: sm.area,
        soldRevenue,
        units,
        target,
        achievementRate,
        commissionEarned
      };
    });
  }, [salesmen, currentSales]);

  // Color palette for charts
  const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  // ==============================================================
  // 6. EXCEL MULTI-SHEET EXPORT GENERATOR (SpreadsheetML .xls)
  // ==============================================================
  const handleExportMultiSheetExcel = () => {
    const filename = `Executive_Business_Report_${fromDate}_to_${toDate}.xls`;

    // Helper for escaping XML
    const xmlEscape = (str: any) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:Bold="1" ss:Color="#1E3A8A" ss:Size="12"/>
   <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Bold">
   <Font ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="#,##0"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="CurrencyBold">
   <Font ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="Percent">
   <NumberFormat ss:Format="0.0%"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
 </Styles>`;

    // SHEET 1: EXECUTIVE SUMMARY
    xml += `
 <Worksheet ss:Name="Executive Summary">
  <Table>
   <Column ss:Width="220"/>
   <Column ss:Width="160"/>
   <Column ss:Width="200"/>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="2" ss:StyleID="SubHeader"><Data ss:Type="String">TELECORP ERP - EXECUTIVE BUSINESS SUMMARY (${fromDate} to ${toDate})</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Key Executive Metric</Data></Cell>
    <Cell><Data ss:Type="String">Value (BDT / Units)</Data></Cell>
    <Cell><Data ss:Type="String">Remarks / Comparison</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String">Gross Invoiced Sales</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalSalesRevenue}</Data></Cell><Cell><Data ss:Type="String">Wholesale: ৳${totalWholesaleRevenue.toLocaleString()} | Retail: ৳${totalRetailRevenue.toLocaleString()}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Procurements (Purchases)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalPurchasesAmount}</Data></Cell><Cell><Data ss:Type="String">${totalPurchasesUnits} Handset Units Ordered</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Gross Trading Profit</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${grossProfit}</Data></Cell><Cell><Data ss:Type="String">${grossMarginPercent.toFixed(1)}% Gross Margin</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Operating Expenses (inc. Commission)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalOperatingExpenses}</Data></Cell><Cell><Data ss:Type="String">Overheads + Salesman Incentives</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Net Operating Profit</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${netOperatingProfit}</Data></Cell><Cell><Data ss:Type="String">${netMarginPercent.toFixed(1)}% Net Margin</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Market Receivables (Customer Due)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalReceivableDue}</Data></Cell><Cell><Data ss:Type="String">Outstanding Dealer Credit</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Accounts Payable (Supplier Due)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalSupplierPayable}</Data></Cell><Cell><Data ss:Type="String">Pending Supplier Dues</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Liquid Operating Funds (Vault + Bank)</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${totalLiquidFunds}</Data></Cell><Cell><Data ss:Type="String">Vault Cash: ৳${currentCashInHand.toLocaleString()} | Banks: ৳${totalBankBalance.toLocaleString()}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Handset Stock Valuation</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalStockValuation}</Data></Cell><Cell><Data ss:Type="String">${inStockImeis.length} Active In-Stock Units</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Period Sales Growth %</Data></Cell><Cell><Data ss:Type="String">${salesGrowthPercent.toFixed(1)}%</Data></Cell><Cell><Data ss:Type="String">Compared to prior equivalent period</Data></Cell></Row>
  </Table>
 </Worksheet>`;

    // SHEET 2: SALES INVOICES
    xml += `
 <Worksheet ss:Name="Sales Invoices">
  <Table>
   <Column ss:Width="120"/><Column ss:Width="90"/><Column ss:Width="160"/><Column ss:Width="90"/><Column ss:Width="120"/><Column ss:Width="100"/><Column ss:Width="100"/><Column ss:Width="90"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Invoice No</Data></Cell>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Customer / Dealer</Data></Cell>
    <Cell><Data ss:Type="String">Type</Data></Cell>
    <Cell><Data ss:Type="String">Warehouse</Data></Cell>
    <Cell><Data ss:Type="String">Grand Total</Data></Cell>
    <Cell><Data ss:Type="String">Paid</Data></Cell>
    <Cell><Data ss:Type="String">Due</Data></Cell>
   </Row>`;
    currentSales.forEach(inv => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${xmlEscape(inv.invoiceNo)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(inv.invoiceDate)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(inv.customerName)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(inv.invoiceType)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(inv.warehouseName)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.grandTotal}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.paidAmount}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.dueAmount}</Data></Cell>
   </Row>`;
    });
    xml += `
  </Table>
 </Worksheet>`;

    // SHEET 3: PURCHASES
    xml += `
 <Worksheet ss:Name="Purchases">
  <Table>
   <Column ss:Width="120"/><Column ss:Width="90"/><Column ss:Width="180"/><Column ss:Width="130"/><Column ss:Width="110"/><Column ss:Width="100"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">PO / Bill No</Data></Cell>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Supplier Name</Data></Cell>
    <Cell><Data ss:Type="String">Destination Warehouse</Data></Cell>
    <Cell><Data ss:Type="String">Grand Total</Data></Cell>
    <Cell><Data ss:Type="String">Due Amount</Data></Cell>
   </Row>`;
    currentPurchases.forEach(p => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${xmlEscape(p.invoiceNo)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(p.invoiceDate)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(p.supplierName)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(p.warehouseName)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${p.grandTotal}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${p.dueAmount}</Data></Cell>
   </Row>`;
    });
    xml += `
  </Table>
 </Worksheet>`;

    // SHEET 4: PROFIT & LOSS STATEMENT
    xml += `
 <Worksheet ss:Name="Profit and Loss">
  <Table>
   <Column ss:Width="240"/><Column ss:Width="140"/><Column ss:Width="180"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Accounting Head</Data></Cell>
    <Cell><Data ss:Type="String">Amount (BDT)</Data></Cell>
    <Cell><Data ss:Type="String">Ratio / Nature</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String">Gross Handset Revenue</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalSalesRevenue}</Data></Cell><Cell><Data ss:Type="String">Total Billings</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Less: Sales Returns</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalReturnCredits}</Data></Cell><Cell><Data ss:Type="String">Credit Notes</Data></Cell></Row>
   <Row ss:StyleID="Bold"><Cell><Data ss:Type="String">Net Sales Revenue</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${netSalesRevenue}</Data></Cell><Cell><Data ss:Type="String">100.0% Basis</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Cost of Goods Sold (COGS)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalCOGS}</Data></Cell><Cell><Data ss:Type="String">Purchase FIFO Basis</Data></Cell></Row>
   <Row ss:StyleID="Bold"><Cell><Data ss:Type="String">Gross Trading Margin</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${grossProfit}</Data></Cell><Cell><Data ss:Type="String">${grossMarginPercent.toFixed(1)}% Margin</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Administrative & Operational Overheads</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${baseExpenses}</Data></Cell><Cell><Data ss:Type="String">Office, Fuel, Utilities</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Salesman Commission & Field Incentives</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalSalesmanCommission}</Data></Cell><Cell><Data ss:Type="String">Target Incentives</Data></Cell></Row>
   <Row ss:StyleID="Bold"><Cell><Data ss:Type="String">Net Operating Income</Data></Cell><Cell ss:StyleID="CurrencyBold"><Data ss:Type="Number">${netOperatingProfit}</Data></Cell><Cell><Data ss:Type="String">${netMarginPercent.toFixed(1)}% Net Margin</Data></Cell></Row>
  </Table>
 </Worksheet>`;

    // SHEET 5: INVENTORY VALUATION
    xml += `
 <Worksheet ss:Name="Inventory Valuation">
  <Table>
   <Column ss:Width="130"/><Column ss:Width="160"/><Column ss:Width="140"/><Column ss:Width="100"/><Column ss:Width="90"/><Column ss:Width="120"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Brand</Data></Cell>
    <Cell><Data ss:Type="String">Model</Data></Cell>
    <Cell><Data ss:Type="String">SKU / Specs</Data></Cell>
    <Cell><Data ss:Type="String">Unit Cost</Data></Cell>
    <Cell><Data ss:Type="String">Stock Qty</Data></Cell>
    <Cell><Data ss:Type="String">Total Value</Data></Cell>
   </Row>`;
    products.forEach(p => {
      p.variants.forEach(v => {
        const count = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
        const totalVal = count * v.purchasePrice;
        xml += `
   <Row>
    <Cell><Data ss:Type="String">${xmlEscape(p.brandName)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(p.model)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(v.sku)} (${v.ram}/${v.storage})</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${v.purchasePrice}</Data></Cell>
    <Cell><Data ss:Type="Number">${count}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalVal}</Data></Cell>
   </Row>`;
      });
    });
    xml += `
  </Table>
 </Worksheet>`;

    // SHEET 6: BRANCH PERFORMANCE
    xml += `
 <Worksheet ss:Name="Branch Performance">
  <Table>
   <Column ss:Width="180"/><Column ss:Width="130"/><Column ss:Width="130"/><Column ss:Width="100"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Branch / Hub Name</Data></Cell>
    <Cell><Data ss:Type="String">Total Sales (BDT)</Data></Cell>
    <Cell><Data ss:Type="String">Gross Profit (BDT)</Data></Cell>
    <Cell><Data ss:Type="String">In-Stock Units</Data></Cell>
   </Row>`;
    branchData.forEach(b => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${xmlEscape(b.fullName)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${b.revenue}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${b.profit}</Data></Cell>
    <Cell><Data ss:Type="Number">${b.stockUnits}</Data></Cell>
   </Row>`;
    });
    xml += `
  </Table>
 </Worksheet>`;

    // SHEET 7: SALESMEN PERFORMANCE
    xml += `
 <Worksheet ss:Name="Salesmen Report">
  <Table>
   <Column ss:Width="160"/><Column ss:Width="110"/><Column ss:Width="120"/><Column ss:Width="120"/><Column ss:Width="90"/><Column ss:Width="110"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Sales Officer</Data></Cell>
    <Cell><Data ss:Type="String">Assigned Route</Data></Cell>
    <Cell><Data ss:Type="String">Sales Target</Data></Cell>
    <Cell><Data ss:Type="String">Achieved Sales</Data></Cell>
    <Cell><Data ss:Type="String">Achievement %</Data></Cell>
    <Cell><Data ss:Type="String">Commission Earned</Data></Cell>
   </Row>`;
    salesmanPerformanceData.forEach(sm => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${xmlEscape(sm.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${xmlEscape(sm.area)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${sm.target}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${sm.soldRevenue}</Data></Cell>
    <Cell><Data ss:Type="String">${sm.achievementRate}%</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${sm.commissionEarned}</Data></Cell>
   </Row>`;
    });
    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Save to report history
    saveHistory({
      id: `hist-${Date.now()}`,
      reportName: filename.replace('.xls', ''),
      reportType: 'Excel Multi-Sheet',
      dateRange: `${fromDate} to ${toDate}`,
      generatedBy: currentUserRole,
      generatedAt: new Date().toLocaleString(),
      recordCount: currentSales.length + currentPurchases.length
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* ============================================================== */}
      {/* 1. TOP EXECUTIVE HEADER BANNER */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 md:p-6 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                Dynamic Business Report &amp; Management Module
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Live Analytics
                </span>
              </h1>
              <p className="text-xs text-indigo-200/80">
                দৈনিক, সাপ্তাহিক, মাসিক, ত্রৈমাসিক ও বাৎসরিক ব্যবসায়িক হিসাব-নিকাশ, এনালিটিক্স ও ওনার ম্যানেজমেন্ট সামারি
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Owner 5-Page Presentation Mode */}
          <button
            onClick={() => {
              setOwnerPage(1);
              setShowOwnerModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md transition transform active:scale-95"
            title="Open 5-Page Owner/Management Executive Presentation"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Owner Presentation (5-Pages)</span>
          </button>

          {/* Multi-Sheet Excel Export */}
          <button
            onClick={handleExportMultiSheetExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition transform active:scale-95"
            title="Download multi-sheet Microsoft Excel report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xls)</span>
          </button>

          {/* Executive PDF / Print */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition transform active:scale-95"
            title="Generate high-resolution printable PDF report"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DYNAMIC FILTER TOOLBAR (Timeframe, Branch, Category, etc.) */}
      {/* ============================================================== */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Row 1: Timeframe Presets & Custom Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>সময়ভিত্তিক রিপোর্ট (Timeframe):</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] as TimeframePreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => handleTimeframeChange(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  timeframe === preset
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset === 'daily' && (isBn ? 'আজ (Daily)' : 'Daily')}
                {preset === 'weekly' && (isBn ? 'সাপ্তাহিক (Weekly)' : 'Weekly')}
                {preset === 'monthly' && (isBn ? 'মাসিক (Monthly)' : 'Monthly')}
                {preset === 'quarterly' && (isBn ? 'ত্রৈমাসিক (Quarterly)' : 'Quarterly')}
                {preset === 'yearly' && (isBn ? 'বাৎসরিক (Yearly)' : 'Yearly')}
                {preset === 'custom' && (isBn ? 'কাস্টম রেঞ্জ' : 'Custom Range')}
              </button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={e => {
                  setTimeframe('custom');
                  setFromDate(e.target.value);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              />
            </div>
            <span className="text-slate-400 font-bold">to</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={e => {
                  setTimeframe('custom');
                  setToDate(e.target.value);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters (Branch, Brand, Product, Salesman, Payment) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {/* Branch / Warehouse */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Branch / Warehouse
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="all">All Branches &amp; Hubs</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Brand / Category */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Brand / Category
            </label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="all">All Smartphone Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Product Model */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Handset Model
            </label>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="all">All Handset Models</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.brandName} {p.model}</option>
              ))}
            </select>
          </div>

          {/* Employee / Salesman */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Sales Officer
            </label>
            <select
              value={selectedSalesman}
              onChange={e => setSelectedSalesman(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="all">All Sales Officers</option>
              {salesmen.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.area})</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Payment Method
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="all">All Settlement Types</option>
              <option value="cash">Cash Settlement</option>
              <option value="bank">Commercial Bank / MFS</option>
              <option value="due">Market Credit / Due</option>
            </select>
          </div>
        </div>

        {/* Row 3: Comparative Period Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparePeriod(!comparePeriod)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition text-xs ${
                comparePeriod
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${comparePeriod ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>পূর্বের সময়ের সাথে তুলনা (Compare with Prior Period)</span>
            </button>
            {comparePeriod && (
              <span className="text-slate-500 text-[11px]">
                পূর্ববর্তী তুলনামূলক সময়কাল: <strong className="text-slate-700">{formatDate(previousPeriodRange.prevFrom)} — {formatDate(previousPeriodRange.prevTo)}</strong>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            ফিল্টার করা ইনভয়েস: <strong className="text-slate-800">{currentSales.length} টি</strong> | মোট হ্যান্ডসেট বিক্রি: <strong className="text-slate-800">{totalUnitsSold} টি</strong>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CORE KPI METRICS CARDS GRID (16 Essential Metrics) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>মোট বিক্রয় (Sales)</span>
            <ShoppingCart className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-slate-900 mt-1">
            {formatBDT(totalSalesRevenue)}
          </div>
          {comparePeriod && (
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${salesGrowthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {salesGrowthPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{salesGrowthPercent >= 0 ? '+' : ''}{salesGrowthPercent.toFixed(1)}% vs Prior</span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">
            Wholesale: {formatBDT(totalWholesaleRevenue)}
          </div>
        </div>

        {/* 2. Total Purchases */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>মোট ক্রয় (Procurement)</span>
            <Truck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-slate-900 mt-1">
            {formatBDT(totalPurchasesAmount)}
          </div>
          {comparePeriod && (
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${purchaseGrowthPercent >= 0 ? 'text-blue-600' : 'text-slate-500'}`}>
              <span>{purchaseGrowthPercent >= 0 ? '+' : ''}{purchaseGrowthPercent.toFixed(1)}% vs Prior</span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalPurchasesUnits} Units Ordered
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>গ্রস লাভ (Gross Profit)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-emerald-700 mt-1">
            {formatBDT(grossProfit)}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
            <Percent className="w-3 h-3" />
            <span>{grossMarginPercent.toFixed(1)}% Gross Margin</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            COGS: {formatBDT(totalCOGS)}
          </div>
        </div>

        {/* 4. Net Operating Profit */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>নেট লাভ (Net Profit)</span>
            <Award className="w-4 h-4 text-teal-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-teal-800 mt-1">
            {formatBDT(netOperatingProfit)}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 mt-1">
            <Percent className="w-3 h-3" />
            <span>{netMarginPercent.toFixed(1)}% Net Margin</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            After Overheads
          </div>
        </div>

        {/* 5. Total Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-rose-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>মোট খরচ (Expenses)</span>
            <DollarSign className="w-4 h-4 text-rose-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-rose-700 mt-1">
            {formatBDT(totalOperatingExpenses)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">
            OPEX: {formatBDT(baseExpenses)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Commission: {formatBDT(totalSalesmanCommission)}
          </div>
        </div>

        {/* 6. Liquid Funds (Vault + Banks) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-cyan-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>ক্যাশ ও ব্যাংক (Liquid)</span>
            <Wallet className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-cyan-800 mt-1">
            {formatBDT(totalLiquidFunds)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">
            Vault: {formatBDT(currentCashInHand)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Banks: {formatBDT(totalBankBalance)}
          </div>
        </div>

        {/* 7. Customer Receivable (Due) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>মার্কেট বকেয়া (Receivable)</span>
            <Users className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-amber-700 mt-1">
            {formatBDT(totalReceivableDue)}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">
            Outstanding Dealer Due
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Active Accounts
          </div>
        </div>

        {/* 8. Supplier Payable Due */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>সাপ্লায়ার পাওনা (Payable)</span>
            <Building2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-red-700 mt-1">
            {formatBDT(totalSupplierPayable)}
          </div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">
            Pending Vendor Dues
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Brand Consignments
          </div>
        </div>

        {/* 9. Inventory Stock Valuation */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>স্টক ভ্যালু (Stock Value)</span>
            <Layers className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-purple-800 mt-1">
            {formatBDT(totalStockValuation)}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">
            {inStockImeis.length} In-Stock Handsets
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Central + Hubs
          </div>
        </div>

        {/* 10. Low Stock Alert */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-orange-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>লো স্টক অ্যালার্ট (Reorder)</span>
            <AlertTriangle className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-orange-700 mt-1">
            {lowStockCount} SKUs
          </div>
          <div className="text-[10px] text-orange-600 font-semibold mt-1">
            Needs Reordering
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Below Min Threshold
          </div>
        </div>

        {/* 11. Discounts & Customer Returns */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-pink-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>ডিসকাউন্ট ও রিটার্ন</span>
            <RotateCcw className="w-4 h-4 text-pink-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-slate-800 mt-1">
            {formatBDT(totalDiscounts + totalReturnCredits)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">
            Discounts: {formatBDT(totalDiscounts)}
          </div>
          <div className="text-[10px] text-rose-500 mt-0.5">
            Returns: {formatBDT(totalReturnCredits)}
          </div>
        </div>

        {/* 12. Average Order Value (AOV) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>গড় অর্ডার মূল্য (AOV)</span>
            <BarChart3 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg md:text-xl font-black text-slate-800 mt-1">
            {formatBDT(avgOrderValue)}
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">
            {currentSales.length} Invoices Issued
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Ticket Size
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. DYNAMIC INTERACTIVE CHARTS & VISUALIZATIONS (6 Rich Charts) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales, Purchases & Profit Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sales, Purchase &amp; Profit Dynamics
              </h3>
              <p className="text-xs text-slate-500">
                দৈনিক রাজস্ব, ক্রয় ব্যয় এবং অর্জিত লাভের তুলনামূলক চিত্র
              </p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              Multi-Metric
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [formatBDT(Number(value)), '']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Sales Revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Procurement" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" name="Gross Profit" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Branch-wise Sales & Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Branch &amp; Regional Hub Performance
              </h3>
              <p className="text-xs text-slate-500">
                প্রতিটি শাখা ও ডিস্ট্রিবিউশন হাবের সেলস ও মুনাফা বিশ্লেষণ
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              Hub Matrix
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [formatBDT(Number(value)), '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Sales" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Selling Smartphone Models */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top 5 Best-Selling Smartphone Models
              </h3>
              <p className="text-xs text-slate-500">
                সবচেয়ে বেশি বিক্রিত হ্যান্ডসেট মডেল ও অর্জিত রাজস্ব
              </p>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
              Volume Leaders
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [formatBDT(Number(value)), 'Sales Revenue']} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Brand Market Share Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Brand Turnover &amp; Category Share
              </h3>
              <p className="text-xs text-slate-500">
                স্যামসাং, অ্যাপল, শাওমি, ভিভোর রাজস্ব অবদান
              </p>
            </div>
            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              Brand Share
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {brandDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatBDT(Number(value)), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. TABBED DETAILED ANALYSIS TABLES */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center bg-slate-50 border-b border-slate-200 p-2 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('kpi_dashboard')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'kpi_dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>P&amp;L Financial Statement</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'sales'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Sales &amp; Product Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory Valuation &amp; Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'branches'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Branch Performance Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('salesmen')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'salesmen'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sales Officers &amp; Commission</span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cash Flow &amp; Reconciliation</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ml-auto ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Report Export History</span>
          </button>
        </div>

        {/* Tab 1: P&L Statement */}
        {activeTab === 'kpi_dashboard' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Profit &amp; Loss Statement ({formatDate(fromDate)} to {formatDate(toDate)})
              </h4>
              <span className="text-xs text-slate-500 font-medium">Single Source of Truth Certified</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Financial Head / Category</th>
                  <th className="p-3">Calculation Basis</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                  <th className="p-3 text-right">% of Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Gross Handset Billings (Invoiced)</td>
                  <td className="p-3 text-slate-400">Sum of wholesale + retail POS billings</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatBDT(totalSalesRevenue)}</td>
                  <td className="p-3 text-right">100.0%</td>
                </tr>
                <tr>
                  <td className="p-3 text-rose-600">Less: Special Volume Trade Discounts</td>
                  <td className="p-3 text-slate-400">Approved dealer discount deductions</td>
                  <td className="p-3 text-right text-rose-600">({formatBDT(totalDiscounts)})</td>
                  <td className="p-3 text-right text-rose-600">{totalSalesRevenue > 0 ? ((totalDiscounts / totalSalesRevenue) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td className="p-3 text-rose-600">Less: Customer Sales Returns (Credit Notes)</td>
                  <td className="p-3 text-slate-400">Restocked &amp; DOA swapped units</td>
                  <td className="p-3 text-right text-rose-600">({formatBDT(totalReturnCredits)})</td>
                  <td className="p-3 text-right text-rose-600">{totalSalesRevenue > 0 ? ((totalReturnCredits / totalSalesRevenue) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="bg-indigo-50/50 font-bold">
                  <td className="p-3 text-indigo-900 font-black">Net Sales Turnover</td>
                  <td className="p-3 text-indigo-700 text-[11px]">Taxable Turnover Basis</td>
                  <td className="p-3 text-right font-black text-indigo-900">{formatBDT(netSalesRevenue)}</td>
                  <td className="p-3 text-right text-indigo-900">100.0%</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800">Cost of Goods Sold (COGS)</td>
                  <td className="p-3 text-slate-400">Direct handset procurement FIFO cost</td>
                  <td className="p-3 text-right text-rose-600 font-semibold">({formatBDT(totalCOGS)})</td>
                  <td className="p-3 text-right text-slate-600">{netSalesRevenue > 0 ? ((totalCOGS / netSalesRevenue) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold">
                  <td className="p-3 text-emerald-900 font-black">Gross Trading Profit</td>
                  <td className="p-3 text-emerald-700 text-[11px]">Net Sales minus COGS</td>
                  <td className="p-3 text-right font-black text-emerald-900">{formatBDT(grossProfit)}</td>
                  <td className="p-3 text-right text-emerald-900 font-bold">{grossMarginPercent.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-700">General &amp; Operational Overheads</td>
                  <td className="p-3 text-slate-400">Office rent, utilities, fuel, bank charges</td>
                  <td className="p-3 text-right text-rose-600 font-semibold">({formatBDT(baseExpenses)})</td>
                  <td className="p-3 text-right text-slate-600">{netSalesRevenue > 0 ? ((baseExpenses / netSalesRevenue) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-700">Salesman Commission &amp; Field Incentives</td>
                  <td className="p-3 text-slate-400">Target incentive payouts accrued &amp; disbursed</td>
                  <td className="p-3 text-right text-rose-600 font-semibold">({formatBDT(totalSalesmanCommission)})</td>
                  <td className="p-3 text-right text-slate-600">{netSalesRevenue > 0 ? ((totalSalesmanCommission / netSalesRevenue) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-3.5 font-black text-white text-sm">Net Operating Profit (EBIT)</td>
                  <td className="p-3.5 text-slate-300 text-[11px]">Final company operating earnings</td>
                  <td className="p-3.5 text-right font-black text-emerald-400 text-sm">{formatBDT(netOperatingProfit)}</td>
                  <td className="p-3.5 text-right text-emerald-400 font-black">{netMarginPercent.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Sales Invoices Breakdown */}
        {activeTab === 'sales' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase">Filtered Invoices List ({currentSales.length})</span>
              <span className="text-slate-500">Sorted by Date Descending</span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Invoice No</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Hub</th>
                    <th className="p-2.5 text-center">Items</th>
                    <th className="p-2.5 text-right">Total (৳)</th>
                    <th className="p-2.5 text-right">Paid (৳)</th>
                    <th className="p-2.5 text-right">Due (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSales.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-indigo-700">{inv.invoiceNo}</td>
                      <td className="p-2.5 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                      <td className="p-2.5 font-medium text-slate-800">{inv.customerName}</td>
                      <td className="p-2.5 text-slate-500">{inv.warehouseName}</td>
                      <td className="p-2.5 text-center">{inv.items.reduce((s, it) => s + it.quantity, 0)} units</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatBDT(inv.grandTotal)}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-medium">{formatBDT(inv.paidAmount)}</td>
                      <td className="p-2.5 text-right font-medium text-amber-700">{formatBDT(inv.dueAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Inventory Valuation */}
        {activeTab === 'inventory' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase">Warehouse Handset Inventory Valuation</span>
              <span className="font-bold text-indigo-700">Total Stock Value: {formatBDT(totalStockValuation)} ({inStockImeis.length} units)</span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Brand</th>
                    <th className="p-2.5">Model</th>
                    <th className="p-2.5">SKU &amp; Specs</th>
                    <th className="p-2.5 text-right">Procurement Cost</th>
                    <th className="p-2.5 text-center">In-Stock Units</th>
                    <th className="p-2.5 text-right">Total Valuation</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.flatMap(p =>
                    p.variants.map(v => {
                      const count = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
                      const val = count * v.purchasePrice;
                      const isLow = count <= v.reorderLevel;

                      return (
                        <tr key={`${p.id}-${v.id}`} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 font-bold text-slate-900">{p.brandName}</td>
                          <td className="p-2.5 font-medium text-slate-800">{p.model}</td>
                          <td className="p-2.5 text-slate-500">{v.sku} ({v.ram}/{v.storage} - {v.color})</td>
                          <td className="p-2.5 text-right font-medium text-slate-700">{formatBDT(v.purchasePrice)}</td>
                          <td className="p-2.5 text-center font-bold text-indigo-700">{count} units</td>
                          <td className="p-2.5 text-right font-black text-slate-900">{formatBDT(val)}</td>
                          <td className="p-2.5 text-center">
                            {isLow ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                Healthy
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Branch Performance */}
        {activeTab === 'branches' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase">Outlet &amp; Distribution Hub Matrix</span>
              <span className="text-slate-500">Live Synchronized</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Branch / Hub Name</th>
                  <th className="p-3 text-right">Invoiced Sales</th>
                  <th className="p-3 text-right">Gross Profit</th>
                  <th className="p-3 text-center">Profit Margin</th>
                  <th className="p-3 text-center">Active In-Stock Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchData.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{b.fullName}</td>
                    <td className="p-3 text-right font-bold text-indigo-700">{formatBDT(b.revenue)}</td>
                    <td className="p-3 text-right font-black text-emerald-700">{formatBDT(b.profit)}</td>
                    <td className="p-3 text-center font-bold text-slate-700">
                      {b.revenue > 0 ? ((b.profit / b.revenue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-600">{b.stockUnits} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Salesmen Performance */}
        {activeTab === 'salesmen' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase">Sales Officers Target vs Achievement &amp; Incentive</span>
              <span className="text-slate-500">{salesmen.length} Field Officers</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Officer Name</th>
                  <th className="p-3">Assigned Route</th>
                  <th className="p-3 text-right">Sales Target</th>
                  <th className="p-3 text-right">Achieved Sales</th>
                  <th className="p-3 text-center">Achievement Rate</th>
                  <th className="p-3 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesmanPerformanceData.map(sm => (
                  <tr key={sm.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{sm.name}</td>
                    <td className="p-3 text-slate-500">{sm.area}</td>
                    <td className="p-3 text-right text-slate-600">{formatBDT(sm.target)}</td>
                    <td className="p-3 text-right font-bold text-indigo-700">{formatBDT(sm.soldRevenue)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        sm.achievementRate >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sm.achievementRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(sm.commissionEarned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: Financials & Cash Flow */}
        {activeTab === 'financials' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash Reconciliation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h5 className="font-bold text-xs uppercase text-slate-700">Cash Flow in Chosen Period</h5>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Cash In (Customer Sale / Collection):</span>
                  <span className="font-bold text-emerald-700">+{formatBDT(currentCashIn)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Cash Out (Expenses / Payments):</span>
                  <span className="font-bold text-rose-700">-{formatBDT(currentCashOut)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 font-bold">
                  <span className="text-slate-900">Net Period Cash Movement:</span>
                  <span className={currentCashIn >= currentCashOut ? 'text-emerald-700' : 'text-rose-700'}>
                    {formatBDT(currentCashIn - currentCashOut)}
                  </span>
                </div>
              </div>

              {/* Multi-Bank Balances */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h5 className="font-bold text-xs uppercase text-slate-700">Commercial Bank &amp; MFS Accounts</h5>
                {bankAccounts.map(b => (
                  <div key={b.id} className="flex justify-between text-xs py-1 border-b border-slate-200">
                    <span className="text-slate-600">{b.bankName} ({b.accountNumber}):</span>
                    <span className="font-bold text-slate-800">{formatBDT(b.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-1 font-black text-indigo-900">
                  <span>Total Bank Reserves:</span>
                  <span>{formatBDT(totalBankBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Report History */}
        {activeTab === 'history' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase">Export &amp; Generation Audit Trail</span>
              <span className="text-slate-500">{reportHistory.length} Past Reports Tracked</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Report Document Name</th>
                  <th className="p-3">Format Type</th>
                  <th className="p-3">Date Range Filter</th>
                  <th className="p-3">Generated By</th>
                  <th className="p-3">Generated Timestamp</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportHistory.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{h.reportName}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.reportType.includes('Excel') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {h.reportType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{h.dateRange}</td>
                    <td className="p-3 text-slate-600">{h.generatedBy}</td>
                    <td className="p-3 text-slate-500">{h.generatedAt}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={handleExportMultiSheetExcel}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                      >
                        Re-export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. OWNER/MANAGEMENT 5-PAGE PRESENTATION MODAL (Section 4) */}
      {/* ============================================================== */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    Executive Owner / Management Review Presentation
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-level 5-Page Boardroom Briefing ({formatDate(fromDate)} — {formatDate(toDate)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Slide {ownerPage} of 5
                </span>
                <button
                  onClick={() => setShowOwnerModal(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Slide Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* PAGE 1: EXECUTIVE SUMMARY */}
              {ownerPage === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Boardroom Briefing • Page 1
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Page 1: Executive KPI &amp; Growth Overview
                    </h2>
                    <p className="text-xs text-slate-500">
                      কোম্পানির সামগ্রিক আর্থিক স্বাস্থ্য, মোট বিক্রয়, মুনাফা ও মূলধনের সংক্ষিপ্ত চিত্র
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                      <div className="text-[11px] font-bold uppercase text-indigo-700">Total Invoiced Sales</div>
                      <div className="text-xl font-black text-indigo-950 mt-1">{formatBDT(totalSalesRevenue)}</div>
                      <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">{salesGrowthPercent >= 0 ? '+' : ''}{salesGrowthPercent.toFixed(1)}% vs Prior Period</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div className="text-[11px] font-bold uppercase text-emerald-700">Gross Margin</div>
                      <div className="text-xl font-black text-emerald-950 mt-1">{formatBDT(grossProfit)}</div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">{grossMarginPercent.toFixed(1)}% Trading Margin</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                      <div className="text-[11px] font-bold uppercase text-teal-700">Net Operating Profit</div>
                      <div className="text-xl font-black text-teal-950 mt-1">{formatBDT(netOperatingProfit)}</div>
                      <div className="text-[11px] font-semibold text-teal-700 mt-0.5">{netMarginPercent.toFixed(1)}% Net Margin</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200">
                      <div className="text-[11px] font-bold uppercase text-cyan-700">Liquid Funds Available</div>
                      <div className="text-xl font-black text-cyan-950 mt-1">{formatBDT(totalLiquidFunds)}</div>
                      <div className="text-[11px] font-semibold text-cyan-700 mt-0.5">Vault + Commercial Banks</div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                      Executive Observations for Managing Director
                    </h4>
                    <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4">
                      <li>
                        মোট ইনভয়েসড বিক্রয় <strong className="text-slate-900">{formatBDT(totalSalesRevenue)}</strong>, যার মধ্যে পাইকারি ডিলার সেলস <strong className="text-indigo-700">{formatBDT(totalWholesaleRevenue)}</strong> এবং রিটেইল সেলস <strong className="text-indigo-700">{formatBDT(totalRetailRevenue)}</strong>।
                      </li>
                      <li>
                        কোম্পানির গ্রস প্রফিট মার্জিন <strong className="text-emerald-700">{grossMarginPercent.toFixed(1)}%</strong> এবং পরিচালন ব্যয় নির্বাহের পর নেট মুনাফা <strong className="text-teal-700">{formatBDT(netOperatingProfit)}</strong>।
                      </li>
                      <li>
                        বর্তমানে গুদামে মোট <strong className="text-slate-900">{inStockImeis.length} টি হ্যান্ডসেট</strong> মজুদ আছে যার বর্তমান ক্রয়মূল্যভিত্তিক ভ্যালুয়েশন <strong className="text-purple-700">{formatBDT(totalStockValuation)}</strong>।
                      </li>
                      <li>
                        মার্কেটে ডিলারদের কাছে মোট বকেয়া <strong className="text-amber-700">{formatBDT(totalReceivableDue)}</strong> এবং ব্র্যান্ড সাপ্লায়ারদের নিকট পাওনা <strong className="text-red-700">{formatBDT(totalSupplierPayable)}</strong>।
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* PAGE 2: SALES & PROFIT ANALYSIS */}
              {ownerPage === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Boardroom Briefing • Page 2
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Page 2: Sales &amp; Profitability Trajectory
                    </h2>
                    <p className="text-xs text-slate-500">
                      দৈনিক সেলস ট্রেন্ড, শীর্ষ বিক্রিত মডেল ও শাখাভিত্তিক মুনাফা অবদান
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Top 5 Best-Selling Smartphone Models</h4>
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                          <tr>
                            <th className="pb-1.5">Model</th>
                            <th className="pb-1.5 text-center">Units Sold</th>
                            <th className="pb-1.5 text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {topProductsData.map(p => (
                            <tr key={p.name}>
                              <td className="py-2 font-bold text-slate-800">{p.name}</td>
                              <td className="py-2 text-center text-slate-600">{p.units} units</td>
                              <td className="py-2 text-right font-black text-indigo-700">{formatBDT(p.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Branch Sales &amp; Margin Contribution</h4>
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                          <tr>
                            <th className="pb-1.5">Branch</th>
                            <th className="pb-1.5 text-right">Sales</th>
                            <th className="pb-1.5 text-right">Margin %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {branchData.map(b => (
                            <tr key={b.id}>
                              <td className="py-2 font-bold text-slate-800">{b.name}</td>
                              <td className="py-2 text-right font-bold text-slate-900">{formatBDT(b.revenue)}</td>
                              <td className="py-2 text-right font-black text-emerald-700">
                                {b.revenue > 0 ? ((b.profit / b.revenue) * 100).toFixed(1) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3: INVENTORY & PROCUREMENT */}
              {ownerPage === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Boardroom Briefing • Page 3
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Page 3: Inventory Valuation &amp; Procurement Summary
                    </h2>
                    <p className="text-xs text-slate-500">
                      হ্যান্ডসেট স্টক ভ্যালুয়েশন, সাপ্লায়ার পারচেজ ও রি-অর্ডার সংকট পর্যালোচনা
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                      <div className="text-[10px] font-bold uppercase text-purple-700">Active Stock Valuation</div>
                      <div className="text-xl font-black text-purple-950 mt-1">{formatBDT(totalStockValuation)}</div>
                      <div className="text-xs text-purple-700 mt-0.5">{inStockImeis.length} Handsets In Stock</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                      <div className="text-[10px] font-bold uppercase text-blue-700">Procurement Ordered</div>
                      <div className="text-xl font-black text-blue-950 mt-1">{formatBDT(totalPurchasesAmount)}</div>
                      <div className="text-xs text-blue-700 mt-0.5">{totalPurchasesUnits} Consignment Handsets</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                      <div className="text-[10px] font-bold uppercase text-rose-700">Critical Low Stock SKUs</div>
                      <div className="text-xl font-black text-rose-950 mt-1">{lowStockCount} Variants</div>
                      <div className="text-xs text-rose-700 mt-0.5">Below Authorized Reorder Level</div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: FINANCIAL & LIQUID CASH */}
              {ownerPage === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                      Boardroom Briefing • Page 4
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Page 4: Financial Reserves &amp; Cash Reconciliation
                    </h2>
                    <p className="text-xs text-slate-500">
                      ক্যাশ ভল্ট, কমার্শিয়াল ব্যাংক হিসাব ও কালেকশন স্থিতি
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-xs uppercase text-slate-700">Vault &amp; Bank Liquidity</h4>
                      <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                        <span className="text-slate-600">Physical Vault Cash in Hand:</span>
                        <span className="font-bold text-slate-900">{formatBDT(currentCashInHand)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                        <span className="text-slate-600">Commercial Bank Accounts:</span>
                        <span className="font-bold text-slate-900">{formatBDT(totalBankBalance)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 font-black text-cyan-900">
                        <span>Total Liquid Reserves:</span>
                        <span>{formatBDT(totalLiquidFunds)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-xs uppercase text-slate-700">Market Exposure &amp; Dues</h4>
                      <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                        <span className="text-slate-600">Dealer Receivables (Market Due):</span>
                        <span className="font-bold text-amber-700">{formatBDT(totalReceivableDue)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                        <span className="text-slate-600">Supplier Vendor Payables:</span>
                        <span className="font-bold text-rose-700">{formatBDT(totalSupplierPayable)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 font-black text-slate-900">
                        <span>Net Market Balance:</span>
                        <span className={totalReceivableDue >= totalSupplierPayable ? 'text-emerald-700' : 'text-rose-700'}>
                          {formatBDT(totalReceivableDue - totalSupplierPayable)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: EMPLOYEE & SALESMAN PERFORMANCE */}
              {ownerPage === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Boardroom Briefing • Page 5
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Page 5: Field Sales Officers &amp; Branch Leaderboard
                    </h2>
                    <p className="text-xs text-slate-500">
                      সেলস অফিসারদের লক্ষ্যমাত্রা বনাম অর্জন ও কমিশন বিতরণ পর্যালোচনা
                    </p>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Rank / Officer</th>
                        <th className="p-3">Route / Territory</th>
                        <th className="p-3 text-right">Target</th>
                        <th className="p-3 text-right">Achieved Sales</th>
                        <th className="p-3 text-center">Achievement %</th>
                        <th className="p-3 text-right">Commission Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesmanPerformanceData
                        .sort((a, b) => b.soldRevenue - a.soldRevenue)
                        .map((sm, idx) => (
                          <tr key={sm.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>{sm.name}</span>
                            </td>
                            <td className="p-3 text-slate-500">{sm.area}</td>
                            <td className="p-3 text-right text-slate-600">{formatBDT(sm.target)}</td>
                            <td className="p-3 text-right font-black text-indigo-700">{formatBDT(sm.soldRevenue)}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                sm.achievementRate >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {sm.achievementRate}%
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(sm.commissionEarned)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Navigation Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={ownerPage <= 1}
                onClick={() => setOwnerPage(prev => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 transition shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => setOwnerPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      ownerPage === p ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {ownerPage < 5 ? (
                <button
                  onClick={() => setOwnerPage(prev => Math.min(5, prev + 1))}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Boardroom Dossier</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. PROFESSIONAL PDF EXPORT & PRINT PREVIEW MODAL (Section 6) */}
      {/* ============================================================== */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
            {/* Modal Top Bar (Hidden during print) */}
            <div className="print:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Official Management PDF Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveHistory({
                      id: `hist-${Date.now()}`,
                      reportName: `Executive_Management_PDF_${fromDate}_to_${toDate}`,
                      reportType: 'Executive PDF',
                      dateRange: `${fromDate} to ${toDate}`,
                      generatedBy: currentUserRole,
                      generatedAt: new Date().toLocaleString(),
                      recordCount: currentSales.length
                    });
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save to PDF</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-0 print:overflow-visible">
              {/* Official Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    TELECORP BANGLADESH LIMITED
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Authorized National Distributor &amp; Importer • Multi-Brand Smartphones
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Corporate Office: Motijheel C/A, Dhaka-1000 • Hotline: +880 9612-835326 • BIN: 002938472-0102
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    Official Executive Report
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Generated: {new Date().toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Prepared By: <strong className="text-slate-800">{currentUserRole}</strong>
                  </div>
                </div>
              </div>

              {/* Report Scope & Applied Filters Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Period</span>
                  <span className="font-bold text-slate-800">{formatDate(fromDate)} to {formatDate(toDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch Filter</span>
                  <span className="font-bold text-slate-800">{selectedBranch === 'all' ? 'All Operating Branches' : warehouses.find(w => w.id === selectedBranch)?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Brand Category</span>
                  <span className="font-bold text-slate-800">{selectedBrand === 'all' ? 'All Brands' : selectedBrand}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Mode</span>
                  <span className="font-bold text-slate-800">{selectedPaymentMethod.toUpperCase()}</span>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Gross Sales</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{formatBDT(totalSalesRevenue)}</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Gross Margin</span>
                  <div className="text-base font-black text-emerald-700 mt-0.5">{formatBDT(grossProfit)} ({grossMarginPercent.toFixed(1)}%)</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Net Operating Profit</span>
                  <div className="text-base font-black text-teal-800 mt-0.5">{formatBDT(netOperatingProfit)} ({netMarginPercent.toFixed(1)}%)</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Liquid Reserves</span>
                  <div className="text-base font-black text-cyan-800 mt-0.5">{formatBDT(totalLiquidFunds)}</div>
                </div>
              </div>

              {/* Detailed P&L Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                  1. Profit &amp; Loss Financial Breakdown
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">Gross Sales Turnover</td>
                      <td className="p-2 text-right">{formatBDT(totalSalesRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4 text-slate-600">Less: Trade Discounts &amp; Customer Returns</td>
                      <td className="p-2 text-right text-rose-600">({formatBDT(totalDiscounts + totalReturnCredits)})</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="p-2">Net Sales Revenue</td>
                      <td className="p-2 text-right">{formatBDT(netSalesRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4 text-slate-600">Less: Cost of Goods Sold (Procurement Cost)</td>
                      <td className="p-2 text-right text-rose-600">({formatBDT(totalCOGS)})</td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-black">
                      <td className="p-2 text-emerald-900">Gross Trading Profit</td>
                      <td className="p-2 text-right text-emerald-900">{formatBDT(grossProfit)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4 text-slate-600">Operating &amp; Administrative Overheads</td>
                      <td className="p-2 text-right text-rose-600">({formatBDT(baseExpenses)})</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4 text-slate-600">Salesman Commission &amp; Field Incentives</td>
                      <td className="p-2 text-right text-rose-600">({formatBDT(totalSalesmanCommission)})</td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-black">
                      <td className="p-2 text-white">Net Operating Profit (EBIT)</td>
                      <td className="p-2 text-right text-emerald-400">{formatBDT(netOperatingProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Branch & Inventory Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    2. Branch Breakdown
                  </h3>
                  <table className="w-full text-left text-[11px] border border-slate-200">
                    <thead className="bg-slate-50 font-bold">
                      <tr>
                        <th className="p-1.5">Branch</th>
                        <th className="p-1.5 text-right">Sales</th>
                        <th className="p-1.5 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {branchData.map(b => (
                        <tr key={b.id}>
                          <td className="p-1.5">{b.name}</td>
                          <td className="p-1.5 text-right font-medium">{formatBDT(b.revenue)}</td>
                          <td className="p-1.5 text-right font-bold text-emerald-700">{formatBDT(b.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    3. Market Receivables &amp; Vault Reserves
                  </h3>
                  <table className="w-full text-left text-[11px] border border-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 text-slate-600">Dealer Outstanding Receivables</td>
                        <td className="p-1.5 text-right font-bold text-amber-700">{formatBDT(totalReceivableDue)}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-slate-600">Supplier Vendor Payables</td>
                        <td className="p-1.5 text-right font-bold text-red-700">{formatBDT(totalSupplierPayable)}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-slate-600">Main Vault Cash Balance</td>
                        <td className="p-1.5 text-right font-medium text-slate-800">{formatBDT(currentCashInHand)}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-slate-600">Commercial Bank Accounts</td>
                        <td className="p-1.5 text-right font-medium text-slate-800">{formatBDT(totalBankBalance)}</td>
                      </tr>
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-1.5">Total Liquid Position</td>
                        <td className="p-1.5 text-right font-black text-cyan-800">{formatBDT(totalLiquidFunds)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sign-off Section */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    Prepared By
                  </div>
                  <div className="text-[10px] text-slate-500">Accounts &amp; Analytics Dept</div>
                </div>

                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    Checked By
                  </div>
                  <div className="text-[10px] text-slate-500">Internal Audit &amp; Control</div>
                </div>

                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    Approved By
                  </div>
                  <div className="text-[10px] text-slate-500">Managing Director / Chairman</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
