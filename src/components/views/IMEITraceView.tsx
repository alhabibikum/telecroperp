import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Truck,
  Building,
  RotateCcw,
  AlertTriangle,
  QrCode,
  Download
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { IMEIStatus } from '../../types/erp';

interface IMEITraceViewProps {
  onOpenLifecycleModal: (imei: string) => void;
}

export const IMEITraceView: React.FC<IMEITraceViewProps> = ({ onOpenLifecycleModal }) => {
  const { imeis, warehouses, brands } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');

  // Filter logic
  const filtered = imeis.filter(im => {
    const matchesSearch =
      im.imei1.includes(searchTerm.trim()) ||
      (im.imei2 && im.imei2.includes(searchTerm.trim())) ||
      (im.serialNumber && im.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      im.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (im.customerName && im.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || im.status === selectedStatus;
    const matchesBrand = selectedBrand === 'All' || im.brandName.toLowerCase() === selectedBrand.toLowerCase();
    const matchesWarehouse = selectedWarehouse === 'All' || im.warehouseId === selectedWarehouse;

    return matchesSearch && matchesStatus && matchesBrand && matchesWarehouse;
  });

  const statuses: IMEIStatus[] = [
    'In Stock',
    'Sold',
    'Reserved',
    'Returned',
    'Damaged',
    'Supplier Return',
    'Transferred'
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              IMEI / Serial Number Master Engine & Traceability
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Zero duplicate tolerance. Trace the full origin, current warehouse custody, customer invoice & warranty for every phone.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
            Total Devices: <b className="font-mono text-blue-700">{imeis.length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            In Stock: <b className="font-mono">{imeis.filter(i => i.status === 'In Stock').length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
            Sold: <b className="font-mono">{imeis.filter(i => i.status === 'Sold').length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
            Returned: <b className="font-mono">{imeis.filter(i => i.status === 'Returned').length}</b>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 15-digit IMEI, Serial, Model, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Statuses ({imeis.length})</option>
              {statuses.map(st => (
                <option key={st} value={st}>
                  {st} ({imeis.filter(i => i.status === st).length})
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Warehouses / Outlets</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* IMEI Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">IMEI 1 / Serial Number</th>
                <th className="p-3">Brand & Model</th>
                <th className="p-3">Variant / Color</th>
                <th className="p-3">Procurement (Supplier)</th>
                <th className="p-3">Stock Location</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Sold Customer</th>
                <th className="p-3 text-right">Cost Price</th>
                <th className="p-3 text-center">Lifecycle Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No IMEI records match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-blue-700">{record.imei1}</div>
                      {record.serialNumber && (
                        <div className="text-[10px] text-slate-400">S/N: {record.serialNumber}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{record.productName}</span>
                      <span className="text-[10px] block text-slate-500 font-semibold">{record.brandName}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {record.variantDesc}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="truncate max-w-[150px] font-medium">{record.supplierName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{record.purchaseInvoiceNo}</div>
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-medium">{record.warehouseName.split('(')[0]}</div>
                      <div className="text-[10px] text-slate-400">Inward: {formatDate(record.purchaseDate)}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        record.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'Sold' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'Returned' ? 'bg-purple-100 text-purple-800' :
                        record.status === 'Damaged' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">
                      {record.customerName ? (
                        <>
                          <div className="font-medium truncate max-w-[130px]">{record.customerName}</div>
                          <div className="font-mono text-[10px] text-blue-600">{record.salesInvoiceNo}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Unsold</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {formatBDT(record.purchaseCost)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenLifecycleModal(record.imei1)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-slate-700 text-[11px] font-semibold transition"
                      >
                        Trace 360° →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
