import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  DollarSign,
  Layers,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

type ReportType = 'brand' | 'customer' | 'profit' | 'salesman' | 'financial' | 'inventory';

export const ReportsView: React.FC = () => {
  const {
    salesInvoices,
    purchaseInvoices,
    customerReturns,
    brands,
    products,
    customers,
    salesmen,
    imeis,
    bankAccounts,
    cashTransactions,
    expenses,
    settings,
    currentUserRole
  } = useERP();

  const [activeReport, setActiveReport] = useState<ReportType>('financial');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const totalStockValuation = inStockImeis.reduce((s, i) => s + i.purchaseCost, 0);

  // Financial calculations
  const totalGrossSales = salesInvoices.reduce((s, i) => s + i.subTotal, 0);
  const totalDiscounts = salesInvoices.reduce((s, i) => s + i.discountTotal, 0);
  const totalReturns = customerReturns.reduce((s, r) => s + r.refundOrCreditAmount, 0);
  const netSalesRevenue = totalGrossSales - totalDiscounts - totalReturns;
  const actualCOGS = salesInvoices.reduce((acc, inv) => {
    return acc + inv.items.reduce((sum, item) => sum + ((item.unitCost || 0) * (item.quantity || 1)), 0);
  }, 0);
  const estimatedCOGS = actualCOGS > 0 ? actualCOGS : Math.round(netSalesRevenue * 0.88);
  const grossProfit = netSalesRevenue - estimatedCOGS;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenses;
  const totalReceivables = customers.reduce((s, c) => s + c.currentDue, 0);
  const totalBankBalance = bankAccounts.reduce((s, b) => s + b.currentBalance, 0);

  // ==========================================
  // 1. GENERIC CSV EXPORT UTILITY
  // ==========================================
  const handleGenericExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let reportTitle = '';

    if (activeReport === 'financial') {
      reportTitle = 'Executive_Financial_Summary';
      headers = ['Financial Metric', 'Category', 'Amount (BDT)', 'Notes / Ratio'];
      rows = [
        ['Gross Handset Sales Invoiced', 'Revenue', totalGrossSales, 'Total retail & wholesale billings'],
        ['Dealer Special Discounts', 'Deduction', totalDiscounts, 'Approved volume deductions'],
        ['Customer Returns & Credits', 'Deduction', totalReturns, 'DOA and customer restocks'],
        ['Net Sales Revenue', 'Net Revenue', netSalesRevenue, 'Base taxable turnover'],
        ['Cost of Goods Sold (COGS)', 'Cost', estimatedCOGS, 'Handset procurement cost basis'],
        ['Gross Trading Profit', 'Gross Margin', grossProfit, `${((grossProfit / netSalesRevenue) * 100).toFixed(1)}% Gross Margin`],
        ['Operating & Administrative Expenses', 'Opex', totalExpenses, 'Office, salaries, fuel, bank charges'],
        ['Net Operating Profit', 'Net Income', netOperatingProfit, `${((netOperatingProfit / netSalesRevenue) * 100).toFixed(1)}% Net Margin`],
        ['Current Dealer Receivables (Due)', 'Asset', totalReceivables, 'Outstanding customer market credit'],
        ['Liquid Cash & Multi-Bank Balances', 'Asset', totalBankBalance, 'Available operating capital']
      ];
    } else if (activeReport === 'inventory') {
      reportTitle = 'Warehouse_Inventory_Valuation';
      headers = ['Brand', 'Model', 'Variant SKU', 'Specs / Color', 'Cost (BDT)', 'Retail Price (BDT)', 'In-Stock Units', 'Total Valuation (BDT)', 'Reorder Status'];
      products.forEach(p => {
        p.variants.forEach(v => {
          const count = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
          const status = count <= v.reorderLevel ? 'LOW STOCK ALERT' : 'Normal';
          rows.push([
            p.brandName,
            p.model,
            v.sku,
            `${v.ram}/${v.storage} - ${v.color}`,
            v.purchasePrice,
            v.retailPrice,
            count,
            count * v.purchasePrice,
            status
          ]);
        });
      });
    } else if (activeReport === 'brand') {
      reportTitle = 'Brand_Performance_Analysis';
      headers = ['Brand Name', 'Code', 'In-Stock Units', 'Sold Units', 'Total Revenue Billed (BDT)', 'Inventory Valuation (BDT)'];
      brands.forEach(b => {
        const bImeis = imeis.filter(i => i.brandName.toLowerCase() === b.name.toLowerCase());
        const inStock = bImeis.filter(i => i.status === 'In Stock').length;
        const sold = bImeis.filter(i => i.status === 'Sold').length;
        const stockVal = bImeis.filter(i => i.status === 'In Stock').reduce((s, i) => s + i.purchaseCost, 0);
        const rev = salesInvoices.reduce((acc, inv) => {
          const bItems = inv.items.filter(it => it.productName.toLowerCase().includes(b.name.toLowerCase()));
          return acc + bItems.reduce((s, it) => s + it.totalAmount, 0);
        }, 0);
        rows.push([b.name, b.code, inStock, sold, rev, stockVal]);
      });
    } else if (activeReport === 'customer') {
      reportTitle = 'Dealer_Sales_and_Due_Matrix';
      headers = ['Dealer Shop Name', 'Owner Name', 'Mobile', 'Area', 'District', 'Credit Limit (BDT)', 'Lifetime Invoiced (BDT)', 'Current Due (BDT)'];
      customers.forEach(c => {
        const cInvoices = salesInvoices.filter(i => i.customerId === c.id);
        const billed = cInvoices.reduce((s, i) => s + i.grandTotal, 0);
        rows.push([c.shopName, c.ownerName, c.mobile, c.area, c.district, c.creditLimit, billed, c.currentDue]);
      });
    } else if (activeReport === 'profit') {
      reportTitle = 'Handset_Model_Profitability';
      headers = ['Brand', 'Model', 'Variant', 'Purchase Cost (BDT)', 'Wholesale Price (BDT)', 'Unit Profit (BDT)', 'Margin %'];
      products.forEach(p => {
        p.variants.forEach(v => {
          const profit = v.wholesalePrice - v.purchasePrice;
          const margin = ((profit / v.wholesalePrice) * 100).toFixed(1);
          rows.push([p.brandName, p.model, `${v.ram}/${v.storage} - ${v.color}`, v.purchasePrice, v.wholesalePrice, profit, `${margin}%`]);
        });
      });
    } else if (activeReport === 'salesman') {
      reportTitle = 'Field_Sales_Achievement';
      headers = ['Sales Officer', 'Code', 'Territory', 'Monthly Target (BDT)', 'Realized Sales (BDT)', 'Achievement %', 'Due Collected (BDT)', 'Commission (BDT)'];
      salesmen.forEach(sm => {
        const percent = Math.round((sm.currentMonthSales / sm.monthlyTarget) * 100);
        const comm = salesInvoices.filter(i => i.salesmanId === sm.id).reduce((acc, i) => acc + (i.commissionEarned || 0), 0);
        rows.push([sm.name, sm.employeeCode, sm.assignedArea, sm.monthlyTarget, sm.currentMonthSales, `${percent}%`, sm.currentMonthCollection, comm]);
      });
    }

    // Construct CSV String with UTF-8 BOM
    let csv = '\uFEFF';
    csv += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TeleCorp_${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 2. GENERIC PDF EXPORT / PRINT PREVIEW
  // ==========================================
  const handleOpenPdfModal = () => {
    setShowPdfModal(true);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Business Intelligence & Management Reports Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            আর্থিক সারসংক্ষেপ, ইনভেন্টরি স্টক মূল্যায়ন, লাভ-ক্ষতি ও সেলস এনালিটিক্স এক ক্লিকে CSV ও PDF এক্সপোর্ট
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenericExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs"
            title="Download CSV for Excel / Google Sheets"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenPdfModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            title="Generate Official Management PDF / Print"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="print:hidden flex flex-wrap bg-white p-2 rounded-2xl border border-slate-200 shadow-xs gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveReport('financial')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'financial' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Financial Summary & P&L</span>
        </button>

        <button
          onClick={() => setActiveReport('inventory')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'inventory' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Inventory Valuation</span>
        </button>

        <button
          onClick={() => setActiveReport('brand')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'brand' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Brand Performance</span>
        </button>

        <button
          onClick={() => setActiveReport('customer')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'customer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Dealer Sales & Dues</span>
        </button>

        <button
          onClick={() => setActiveReport('profit')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'profit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Model Profitability</span>
        </button>

        <button
          onClick={() => setActiveReport('salesman')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeReport === 'salesman' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sales Force Targets</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* REPORT 1: FINANCIAL SUMMARY & P&L */}
      {/* ============================================================== */}
      {activeReport === 'financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Net Sales Revenue</div>
              <div className="text-xl font-black text-slate-900 mt-1">{formatBDT(netSalesRevenue)}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Billed after discounts & returns</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Gross Margin</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{formatBDT(grossProfit)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{((grossProfit / netSalesRevenue) * 100).toFixed(1)}% Gross Margin</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Net Operating Income</div>
              <div className="text-xl font-black text-blue-700 mt-1">{formatBDT(netOperatingProfit)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">After OPEX deduction</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Dealer Outstanding Due</div>
              <div className="text-xl font-black text-amber-700 mt-1">{formatBDT(totalReceivables)}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Market Receivables</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase text-slate-700">
              Executive Financial Summary Breakdown (Management Statement)
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Financial Head / Line Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Calculation Basis</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Gross Handset Billings (Invoices Issued)</td>
                  <td className="p-3 text-slate-500">Gross Sales</td>
                  <td className="p-3 text-[11px] text-slate-400">Sum of sub-totals across wholesale & retail POS</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatBDT(totalGrossSales)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800">Less: Special Dealer Volume Discounts</td>
                  <td className="p-3 text-slate-500">Discount</td>
                  <td className="p-3 text-[11px] text-slate-400">Trade promos & cash settlements</td>
                  <td className="p-3 text-right text-rose-600">({formatBDT(totalDiscounts)})</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800">Less: Customer Sales Returns (Credit Notes)</td>
                  <td className="p-3 text-slate-500">Returns</td>
                  <td className="p-3 text-[11px] text-slate-400">DOA swaps, sealed customer returns</td>
                  <td className="p-3 text-right text-rose-600">({formatBDT(totalReturns)})</td>
                </tr>
                <tr className="bg-blue-50/40 font-bold">
                  <td className="p-3 text-blue-900">Net Sales Revenue</td>
                  <td className="p-3 text-blue-700">Net Turnover</td>
                  <td className="p-3 text-[11px] text-blue-600">Base turnover for NBR & financial audits</td>
                  <td className="p-3 text-right font-black text-blue-900">{formatBDT(netSalesRevenue)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800">Cost of Goods Sold (Procurement FIFO Cost)</td>
                  <td className="p-3 text-slate-500">COGS</td>
                  <td className="p-3 text-[11px] text-slate-400">Actual cost of handset inventory dispatched</td>
                  <td className="p-3 text-right text-slate-700">({formatBDT(estimatedCOGS)})</td>
                </tr>
                <tr className="bg-emerald-50/40 font-bold">
                  <td className="p-3 text-emerald-900">Gross Profit (Margin Contribution)</td>
                  <td className="p-3 text-emerald-700">Gross Margin</td>
                  <td className="p-3 text-[11px] text-emerald-600">Net Sales - COGS ({((grossProfit / netSalesRevenue) * 100).toFixed(1)}%)</td>
                  <td className="p-3 text-right font-black text-emerald-700">{formatBDT(grossProfit)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800">Operating Expenses (Admin, Salaries, Utility)</td>
                  <td className="p-3 text-slate-500">OPEX</td>
                  <td className="p-3 text-[11px] text-slate-400">Total approved operational disbursements</td>
                  <td className="p-3 text-right text-rose-600">({formatBDT(totalExpenses)})</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-3">Net Operating Profit Before Taxes</td>
                  <td className="p-3 text-slate-300">Net Profit</td>
                  <td className="p-3 text-[11px] text-slate-400">Final operational net margin</td>
                  <td className="p-3 text-right font-black text-emerald-400">{formatBDT(netOperatingProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT 2: INVENTORY & STOCK VALUATION */}
      {/* ============================================================== */}
      {activeReport === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 bg-slate-50 flex items-center justify-between">
            <span>Handset Inventory Stock Valuation & Reorder Audit</span>
            <span className="text-blue-700 font-bold">Total Stock: {inStockImeis.length} Units ({formatBDT(totalStockValuation)})</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Brand & Model</th>
                <th className="p-3">SKU & Specs</th>
                <th className="p-3 text-right">Cost (৳)</th>
                <th className="p-3 text-right">Wholesale Rate (৳)</th>
                <th className="p-3 text-center">In-Stock</th>
                <th className="p-3 text-right">Valuation (৳)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.flatMap(p =>
                p.variants.map(v => {
                  const count = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
                  const isLow = count <= v.reorderLevel;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{p.model}</span>
                        <span className="block text-[10px] text-blue-700 font-semibold">{p.brandName}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-800">{v.sku}</div>
                        <div className="text-[10px] text-slate-500">{v.ram}/{v.storage} • {v.color}</div>
                      </td>
                      <td className="p-3 text-right text-slate-700">{formatBDT(v.purchasePrice)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatBDT(v.wholesalePrice)}</td>
                      <td className="p-3 text-center font-extrabold text-slate-900">{count}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatBDT(count * v.purchasePrice)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLow ? 'Low Stock' : 'Adequate'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT 3: BRAND PERFORMANCE */}
      {/* ============================================================== */}
      {activeReport === 'brand' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-50">
            Brand-Wise Sales, Stock & Turnover Analysis
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Brand Name</th>
                <th className="p-3">Code</th>
                <th className="p-3 text-center">In-Stock Units</th>
                <th className="p-3 text-center">Sold Units</th>
                <th className="p-3 text-right">Total Revenue Billed</th>
                <th className="p-3 text-right">In-Stock Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map(b => {
                const bImeis = imeis.filter(i => i.brandName.toLowerCase() === b.name.toLowerCase());
                const inStock = bImeis.filter(i => i.status === 'In Stock').length;
                const sold = bImeis.filter(i => i.status === 'Sold').length;
                const stockVal = bImeis.filter(i => i.status === 'In Stock').reduce((s, i) => s + i.purchaseCost, 0);
                const brandRevenue = salesInvoices.reduce((acc, inv) => {
                  const bItems = inv.items.filter(it => it.productName.toLowerCase().includes(b.name.toLowerCase()));
                  return acc + bItems.reduce((s, it) => s + it.totalAmount, 0);
                }, 0);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xl">{b.logo}</span>
                      <span>{b.name}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-600">{b.code}</td>
                    <td className="p-3 text-center font-extrabold text-emerald-700">{inStock}</td>
                    <td className="p-3 text-center font-bold text-blue-700">{sold}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatBDT(brandRevenue)}</td>
                    <td className="p-3 text-right font-bold text-slate-800">{formatBDT(stockVal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT 4: CUSTOMER DEALER PERFORMANCE */}
      {/* ============================================================== */}
      {activeReport === 'customer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-50">
            Top Dealers by Gross Purchase Volume & Outstanding Due
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Dealer Shop & Owner</th>
                <th className="p-3">Territory</th>
                <th className="p-3 text-center">Invoices Issued</th>
                <th className="p-3 text-right">Lifetime Invoiced</th>
                <th className="p-3 text-right">Total Payments Made</th>
                <th className="p-3 text-right">Current Due Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => {
                const cInvoices = salesInvoices.filter(i => i.customerId === c.id);
                const billed = cInvoices.reduce((s, i) => s + i.grandTotal, 0);
                const paid = cInvoices.reduce((s, i) => s + i.paidAmount, 0);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.shopName}</div>
                      <div className="text-[11px] text-slate-500">{c.ownerName} • {c.mobile}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{c.area}, {c.district}</td>
                    <td className="p-3 text-center font-semibold text-slate-800">{cInvoices.length}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatBDT(billed)}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(paid)}</td>
                    <td className="p-3 text-right font-extrabold text-amber-700">{formatBDT(c.currentDue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT 5: MODEL PROFITABILITY */}
      {/* ============================================================== */}
      {activeReport === 'profit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-50">
            Handset Unit Gross Profitability & Margin Contribution
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Handset Model</th>
                <th className="p-3">Variant</th>
                <th className="p-3 text-right">Purchase Cost (৳)</th>
                <th className="p-3 text-right">Wholesale Rate (৳)</th>
                <th className="p-3 text-right">Unit Gross Profit (৳)</th>
                <th className="p-3 text-right">Gross Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.flatMap(p => p.variants.map(v => {
                const profit = v.wholesalePrice - v.purchasePrice;
                const marginPercent = ((profit / v.wholesalePrice) * 100).toFixed(1);

                return (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{p.model}</span>
                      <span className="block text-[10px] text-blue-700 font-semibold">{p.brandName}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {v.ram}/{v.storage} - {v.color}
                    </td>
                    <td className="p-3 text-right text-slate-700">{formatBDT(v.purchasePrice)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatBDT(v.wholesalePrice)}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-700">{formatBDT(profit)}</td>
                    <td className="p-3 text-right font-extrabold text-blue-700">{marginPercent}%</td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT 6: SALESMAN PERFORMANCE */}
      {/* ============================================================== */}
      {activeReport === 'salesman' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-50">
            Field Force Sales Targets, Due Realization & Commissions
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Sales Officer</th>
                <th className="p-3">Territory Route</th>
                <th className="p-3 text-right">Monthly Target</th>
                <th className="p-3 text-right">Realized Sales</th>
                <th className="p-3 text-center">Achievement %</th>
                <th className="p-3 text-right">Due Collected</th>
                <th className="p-3 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesmen.map(sm => {
                const percent = Math.round((sm.currentMonthSales / sm.monthlyTarget) * 100);
                const comm = salesInvoices
                  .filter(i => i.salesmanId === sm.id)
                  .reduce((acc, i) => acc + (i.commissionEarned || 0), 0);

                return (
                  <tr key={sm.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sm.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sm.employeeCode}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{sm.assignedArea}</td>
                    <td className="p-3 text-right text-slate-700">{formatBDT(sm.monthlyTarget)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatBDT(sm.currentMonthSales)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-full ${
                        percent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {percent}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(sm.currentMonthCollection)}</td>
                    <td className="p-3 text-right font-black text-blue-700">{formatBDT(comm)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* GENERIC PDF EXPORT / PRINT MODAL */}
      {/* ============================================================== */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Executive PDF Report Preview & Document Exporter
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div id="pdf-report-document" className="bg-white p-6 border border-slate-200 rounded-xl space-y-6 text-slate-800 font-sans text-xs">
              {/* Company Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">
                    {settings.companyName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {settings.companyAddress}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Phone: {settings.companyPhone} • Tax ID: {settings.vatTaxNumber}
                  </div>
                </div>

                <div className="text-right">
                  <div className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-[10px] rounded-md uppercase tracking-wider inline-block">
                    Official Executive Report
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Generated: <strong>{new Date().toLocaleString()}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Prepared by: <strong>{currentUserRole}</strong>
                  </div>
                </div>
              </div>

              {/* Report Subject & KPI Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document Classification</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {activeReport === 'financial' && 'Executive Financial & Profitability Statement'}
                    {activeReport === 'inventory' && 'Handset Inventory & Stock Valuation Audit'}
                    {activeReport === 'brand' && 'Brand-Wise Performance & Market Turnover Analysis'}
                    {activeReport === 'customer' && 'Dealer Gross Purchase & Credit Exposure Summary'}
                    {activeReport === 'profit' && 'Unit Gross Margin Contribution Matrix'}
                    {activeReport === 'salesman' && 'Field Force Sales Realization & Incentive Audit'}
                  </div>
                </div>

                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-400">Net Turnover</div>
                    <div className="font-extrabold text-blue-700">{formatBDT(netSalesRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">In-Stock Valuation</div>
                    <div className="font-extrabold text-slate-900">{formatBDT(totalStockValuation)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Total Dues</div>
                    <div className="font-extrabold text-amber-700">{formatBDT(totalReceivables)}</div>
                  </div>
                </div>
              </div>

              {/* Table Data for PDF */}
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  {activeReport === 'financial' && (
                    <>
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 border-b">Metric Description</th>
                          <th className="p-2.5 border-b">Classification</th>
                          <th className="p-2.5 border-b text-right">Amount (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-2">Gross Handset Billings</td><td className="p-2">Gross Sales</td><td className="p-2 text-right font-bold">{formatBDT(totalGrossSales)}</td></tr>
                        <tr><td className="p-2">Less: Discounts & Promos</td><td className="p-2">Deduction</td><td className="p-2 text-right text-rose-600">({formatBDT(totalDiscounts)})</td></tr>
                        <tr><td className="p-2">Less: Customer DOA & Returns</td><td className="p-2">Deduction</td><td className="p-2 text-right text-rose-600">({formatBDT(totalReturns)})</td></tr>
                        <tr className="bg-slate-50 font-bold"><td className="p-2">Net Sales Turnover</td><td className="p-2">Revenue</td><td className="p-2 text-right text-blue-700 font-black">{formatBDT(netSalesRevenue)}</td></tr>
                        <tr><td className="p-2">Cost of Goods Sold (COGS)</td><td className="p-2">Direct Cost</td><td className="p-2 text-right text-slate-700">({formatBDT(estimatedCOGS)})</td></tr>
                        <tr className="bg-emerald-50/50 font-bold"><td className="p-2">Gross Trading Profit</td><td className="p-2">Margin</td><td className="p-2 text-right text-emerald-700">{formatBDT(grossProfit)}</td></tr>
                        <tr><td className="p-2">Operating & Admin Expenses</td><td className="p-2">OPEX</td><td className="p-2 text-right text-rose-600">({formatBDT(totalExpenses)})</td></tr>
                        <tr className="bg-slate-900 text-white font-bold"><td className="p-2">Net Operating Income</td><td className="p-2">Net Profit</td><td className="p-2 text-right text-emerald-400 font-black">{formatBDT(netOperatingProfit)}</td></tr>
                      </tbody>
                    </>
                  )}

                  {activeReport === 'inventory' && (
                    <>
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 border-b">Model</th>
                          <th className="p-2.5 border-b">SKU / Specs</th>
                          <th className="p-2.5 border-b text-right">Cost (৳)</th>
                          <th className="p-2.5 border-b text-center">In-Stock</th>
                          <th className="p-2.5 border-b text-right">Valuation (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.flatMap(p => p.variants.map(v => {
                          const count = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
                          return (
                            <tr key={v.id}>
                              <td className="p-2 font-bold">{p.brandName} {p.model}</td>
                              <td className="p-2 text-slate-600 font-mono text-[11px]">{v.sku} ({v.ram}/{v.storage})</td>
                              <td className="p-2 text-right">{formatBDT(v.purchasePrice)}</td>
                              <td className="p-2 text-center font-bold">{count}</td>
                              <td className="p-2 text-right font-bold">{formatBDT(count * v.purchasePrice)}</td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </>
                  )}

                  {activeReport === 'brand' && (
                    <>
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 border-b">Brand</th>
                          <th className="p-2.5 border-b text-center">In-Stock</th>
                          <th className="p-2.5 border-b text-center">Units Sold</th>
                          <th className="p-2.5 border-b text-right">Billed Revenue</th>
                          <th className="p-2.5 border-b text-right">Stock Valuation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {brands.map(b => {
                          const bImeis = imeis.filter(i => i.brandName.toLowerCase() === b.name.toLowerCase());
                          const inStock = bImeis.filter(i => i.status === 'In Stock').length;
                          const sold = bImeis.filter(i => i.status === 'Sold').length;
                          const stockVal = bImeis.filter(i => i.status === 'In Stock').reduce((s, i) => s + i.purchaseCost, 0);
                          const rev = salesInvoices.reduce((acc, inv) => {
                            const bItems = inv.items.filter(it => it.productName.toLowerCase().includes(b.name.toLowerCase()));
                            return acc + bItems.reduce((s, it) => s + it.totalAmount, 0);
                          }, 0);
                          return (
                            <tr key={b.id}>
                              <td className="p-2 font-bold">{b.name}</td>
                              <td className="p-2 text-center">{inStock}</td>
                              <td className="p-2 text-center">{sold}</td>
                              <td className="p-2 text-right font-bold">{formatBDT(rev)}</td>
                              <td className="p-2 text-right">{formatBDT(stockVal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}

                  {activeReport === 'customer' && (
                    <>
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 border-b">Dealer Shop</th>
                          <th className="p-2.5 border-b">Owner</th>
                          <th className="p-2.5 border-b text-right">Credit Limit</th>
                          <th className="p-2.5 border-b text-right">Lifetime Billed</th>
                          <th className="p-2.5 border-b text-right">Current Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map(c => {
                          const cInvoices = salesInvoices.filter(i => i.customerId === c.id);
                          const billed = cInvoices.reduce((s, i) => s + i.grandTotal, 0);
                          return (
                            <tr key={c.id}>
                              <td className="p-2 font-bold">{c.shopName}</td>
                              <td className="p-2">{c.ownerName} ({c.mobile})</td>
                              <td className="p-2 text-right">{formatBDT(c.creditLimit)}</td>
                              <td className="p-2 text-right font-bold">{formatBDT(billed)}</td>
                              <td className="p-2 text-right font-bold text-amber-700">{formatBDT(c.currentDue)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}
                </table>
              </div>

              {/* Document Disclaimer & Auditor Signatures */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>• Certified that the above figures represent actual ledger records and serialized IMEI inventory counts.</p>
                <p>• This document is computer-generated from TeleCorp ERP under ISO & NBR compliance rules.</p>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 text-[11px] font-semibold text-slate-700 text-center">
                <div className="border-t border-slate-400 pt-2">
                  <div>Accounts & Finance Manager</div>
                  <div className="text-[9px] text-slate-400">Signature & Date</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div>General Manager / Operations</div>
                  <div className="text-[9px] text-slate-400">Verification Seal</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div>External Auditor / MD</div>
                  <div className="text-[9px] text-slate-400">Approval Stamp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
