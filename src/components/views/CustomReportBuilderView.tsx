import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Search,
  Smartphone,
  Users,
  Receipt
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const CustomReportBuilderView: React.FC = () => {
  const { salesInvoices, imeis, customers, products, brands, warehouses, settings } = useERP();

  const [dataset, setDataset] = useState<'sales' | 'inventory' | 'customers'>('sales');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Column visibility definitions per dataset
  const [salesCols, setSalesCols] = useState<Record<string, boolean>>({
    invoiceNo: true,
    date: true,
    customer: true,
    product: true,
    quantity: true,
    total: true,
    paid: true,
    due: true
  });

  const [invCols, setInvCols] = useState<Record<string, boolean>>({
    model: true,
    brand: true,
    variant: true,
    imei1: true,
    imei2: true,
    warehouse: true,
    status: true,
    cost: true
  });

  const [custCols, setCustCols] = useState<Record<string, boolean>>({
    shopName: true,
    ownerName: true,
    mobile: true,
    area: true,
    district: true,
    creditLimit: true,
    due: true,
    status: true
  });

  const toggleColumn = (key: string) => {
    if (dataset === 'sales') {
      setSalesCols(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (dataset === 'inventory') {
      setInvCols(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setCustCols(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // Filtered Data Calculations
  const filteredSales = useMemo(() => {
    return salesInvoices.filter(inv => {
      const matchBrand = selectedBrand === 'All' || inv.items.some(it => {
        const prod = products.find(p => p.id === it.productId);
        return prod?.brandName === selectedBrand;
      });
      const matchWarehouse = selectedWarehouse === 'All' || inv.warehouseId === selectedWarehouse;
      const matchSearch = searchTerm === '' ||
        inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBrand && matchWarehouse && matchSearch;
    });
  }, [salesInvoices, selectedBrand, selectedWarehouse, searchTerm]);

  const filteredInventory = useMemo(() => {
    return imeis.filter(i => {
      const matchBrand = selectedBrand === 'All' || i.brandName === selectedBrand;
      const matchWarehouse = selectedWarehouse === 'All' || i.warehouseId === selectedWarehouse;
      const matchSearch = searchTerm === '' ||
        i.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.imei1.includes(searchTerm) ||
        (i.imei2 && i.imei2.includes(searchTerm));
      return matchBrand && matchWarehouse && matchSearch;
    });
  }, [imeis, selectedBrand, selectedWarehouse, searchTerm]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      return searchTerm === '' ||
        c.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm) ||
        c.district.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [customers, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    if (dataset === 'sales') {
      const headers = ['Invoice No', 'Date', 'Customer', 'Products', 'Quantity', 'Grand Total', 'Paid', 'Due'];
      csv += headers.join(',') + '\n';
      filteredSales.forEach(i => {
        const prodNames = i.items.map(it => it.productName).join('; ');
        const totalQty = i.items.reduce((s, it) => s + it.quantity, 0);
        csv += `"${i.invoiceNo}","${i.invoiceDate}","${i.customerName}","${prodNames}",${totalQty},${i.grandTotal},${i.paidAmount},${i.dueAmount}\n`;
      });
    } else if (dataset === 'inventory') {
      const headers = ['Model', 'Brand', 'Variant', 'IMEI 1', 'IMEI 2', 'Warehouse', 'Status', 'Purchase Cost'];
      csv += headers.join(',') + '\n';
      filteredInventory.forEach(i => {
        csv += `"${i.productName}","${i.brandName}","${i.variantDesc}","${i.imei1}","${i.imei2 || ''}","${i.warehouseName}","${i.status}",${i.purchaseCost}\n`;
      });
    } else if (dataset === 'customers') {
      const headers = ['Shop Name', 'Owner Name', 'Mobile', 'Area', 'District', 'Credit Limit', 'Current Due', 'Status'];
      csv += headers.join(',') + '\n';
      filteredCustomers.forEach(c => {
        csv += `"${c.shopName}","${c.ownerName}","${c.mobile}","${c.area}","${c.district}",${c.creditLimit},${c.currentDue},"${c.status}"\n`;
      });
    }
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Report_${dataset}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const activeCols = dataset === 'sales' ? salesCols : dataset === 'inventory' ? invCols : custCols;

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Custom Ad-Hoc Report Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure custom data views, choose visible fields, filter by dimensions and export to CSV or PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setDataset('sales')}
          className={`p-4 rounded-xl border text-left flex items-center gap-3 transition ${
            dataset === 'sales'
              ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-lg ${dataset === 'sales' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Sales & Invoicing</div>
            <div className="text-[11px] text-slate-500">{salesInvoices.length} Registered Invoices</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDataset('inventory')}
          className={`p-4 rounded-xl border text-left flex items-center gap-3 transition ${
            dataset === 'inventory'
              ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-lg ${dataset === 'inventory' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Inventory & IMEIs</div>
            <div className="text-[11px] text-slate-500">{imeis.length} Serialized Units</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDataset('customers')}
          className={`p-4 rounded-xl border text-left flex items-center gap-3 transition ${
            dataset === 'customers'
              ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-lg ${dataset === 'customers' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Customers & Receivables</div>
            <div className="text-[11px] text-slate-500">{customers.length} Accounts</div>
          </div>
        </button>
      </div>

      {/* Filter and Column Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across columns..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {dataset !== 'customers' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filter by Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="All">All Brands</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filter by Warehouse</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="All">All Warehouses / Outlets</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Visible Columns Toggles */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-700 mb-2">Configure Visible Columns:</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(activeCols).map(col => (
              <button
                key={col}
                type="button"
                onClick={() => toggleColumn(col)}
                className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition ${
                  activeCols[col] ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {activeCols[col] ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                <span className="capitalize">{col}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Report Table */}
      <div id="custom-report-doc" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Printable Official Header (Shown during Print & Export) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {settings?.companyName || 'TeleCorp Mobile Distribution & Trade Ltd.'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {settings?.companyAddress || 'Level 8, Motijheel C/A, Dhaka-1000'} • Phone: {settings?.companyPhone || '+880 1711-002233'}
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {settings?.vatTaxNumber} • Custom System Audit Report ({dataset.toUpperCase()})
          </p>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-700">
          <span>Dynamic Report Output ({dataset === 'sales' ? filteredSales.length : dataset === 'inventory' ? filteredInventory.length : filteredCustomers.length} Records)</span>
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          {dataset === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  {salesCols.invoiceNo && <th className="p-3">Invoice #</th>}
                  {salesCols.date && <th className="p-3">Date</th>}
                  {salesCols.customer && <th className="p-3">Customer Shop</th>}
                  {salesCols.product && <th className="p-3">Products</th>}
                  {salesCols.quantity && <th className="p-3 text-center">Qty</th>}
                  {salesCols.total && <th className="p-3 text-right">Grand Total</th>}
                  {salesCols.paid && <th className="p-3 text-right">Paid</th>}
                  {salesCols.due && <th className="p-3 text-right">Due</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    {salesCols.invoiceNo && <td className="p-3 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>}
                    {salesCols.date && <td className="p-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>}
                    {salesCols.customer && <td className="p-3 font-semibold text-slate-900">{inv.customerName}</td>}
                    {salesCols.product && <td className="p-3 text-slate-600 max-w-xs truncate">{inv.items.map(it => it.productName).join(', ')}</td>}
                    {salesCols.quantity && <td className="p-3 text-center font-bold">{inv.items.reduce((s, it) => s + it.quantity, 0)}</td>}
                    {salesCols.total && <td className="p-3 text-right font-black text-slate-900">{formatBDT(inv.grandTotal)}</td>}
                    {salesCols.paid && <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(inv.paidAmount)}</td>}
                    {salesCols.due && <td className="p-3 text-right font-bold text-amber-700">{formatBDT(inv.dueAmount)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {dataset === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  {invCols.model && <th className="p-3">Model</th>}
                  {invCols.brand && <th className="p-3">Brand</th>}
                  {invCols.variant && <th className="p-3">Variant</th>}
                  {invCols.imei1 && <th className="p-3 font-mono">IMEI 1</th>}
                  {invCols.imei2 && <th className="p-3 font-mono">IMEI 2</th>}
                  {invCols.warehouse && <th className="p-3">Warehouse</th>}
                  {invCols.status && <th className="p-3">Status</th>}
                  {invCols.cost && <th className="p-3 text-right">Cost Price</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    {invCols.model && <td className="p-3 font-bold text-slate-900">{item.productName}</td>}
                    {invCols.brand && <td className="p-3 text-slate-600">{item.brandName}</td>}
                    {invCols.variant && <td className="p-3 text-slate-600">{item.variantDesc}</td>}
                    {invCols.imei1 && <td className="p-3 font-mono text-blue-700 font-semibold">{item.imei1}</td>}
                    {invCols.imei2 && <td className="p-3 font-mono text-slate-500">{item.imei2 || '-'}</td>}
                    {invCols.warehouse && <td className="p-3 text-slate-700">{item.warehouseName}</td>}
                    {invCols.status && (
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    )}
                    {invCols.cost && <td className="p-3 text-right font-black text-slate-900">{formatBDT(item.purchaseCost)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {dataset === 'customers' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  {custCols.shopName && <th className="p-3">Shop Name</th>}
                  {custCols.ownerName && <th className="p-3">Owner</th>}
                  {custCols.mobile && <th className="p-3">Mobile</th>}
                  {custCols.area && <th className="p-3">Area</th>}
                  {custCols.district && <th className="p-3">District</th>}
                  {custCols.creditLimit && <th className="p-3 text-right">Credit Limit</th>}
                  {custCols.due && <th className="p-3 text-right">Current Due</th>}
                  {custCols.status && <th className="p-3 text-center">Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/70">
                    {custCols.shopName && <td className="p-3 font-bold text-slate-900">{cust.shopName}</td>}
                    {custCols.ownerName && <td className="p-3 text-slate-700">{cust.ownerName}</td>}
                    {custCols.mobile && <td className="p-3 font-mono text-slate-600">{cust.mobile}</td>}
                    {custCols.area && <td className="p-3 text-slate-600">{cust.area}</td>}
                    {custCols.district && <td className="p-3 text-slate-600">{cust.district}</td>}
                    {custCols.creditLimit && <td className="p-3 text-right font-semibold text-slate-800">{formatBDT(cust.creditLimit)}</td>}
                    {custCols.due && (
                      <td className={`p-3 text-right font-black ${cust.currentDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {formatBDT(cust.currentDue)}
                      </td>
                    )}
                    {custCols.status && (
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
