import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Warehouse,
  PlusCircle,
  Building,
  Phone,
  Layers,
  MapPin
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { RowActions, EditModal } from '../common/CrudKit';
import type { Warehouse as WarehouseType } from '../../types/erp';

interface WarehousesViewProps {
  onOpenStockTransfer: () => void;
}

export const WarehousesView: React.FC<WarehousesViewProps> = ({ onOpenStockTransfer }) => {
  const { warehouses, imeis, addWarehouse, updateWarehouse, deleteWarehouse } = useERP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<WarehouseType | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('Branch Warehouse');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [managerName, setManagerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerName) return;
    addWarehouse({
      name,
      type,
      address,
      city,
      managerName,
      contactNumber,
      status: 'Active'
    });
    setShowAddModal(false);
    setName('');
    setManagerName('');
    setAddress('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Warehouses, Regional Depots & Retail Outlets
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-location inventory tracking, facility managers and real-time handset counts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStockTransfer}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
          >
            <span>Transfer Stock</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Warehouse</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map(wh => {
          const whImeis = imeis.filter(i => i.warehouseId === wh.id);
          const inStockCount = whImeis.filter(i => i.status === 'In Stock').length;
          const whValuation = whImeis
            .filter(i => i.status === 'In Stock')
            .reduce((acc, i) => acc + i.purchaseCost, 0);

          return (
            <div key={wh.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {wh.code}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{wh.name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.address}, {wh.city}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {wh.type}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div>Facility Custodian: <b className="text-slate-800">{wh.managerName}</b></div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{wh.contactNumber}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">In-Stock Devices</div>
                  <div className="text-lg font-black text-slate-900">{inStockCount} Handsets</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[11px]">Asset Valuation</div>
                  <div className="text-base font-extrabold text-emerald-700">{formatBDT(whValuation)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Status: <b className={wh.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}>{wh.status}</b></span>
                <RowActions
                  onEdit={() => setEditing(wh)}
                  onDelete={() => deleteWarehouse(wh.id)}
                  deleteTitle={`Delete ${wh.name}?`}
                  deleteMessage="Locations that hold stock or appear on documents cannot be deleted; mark them Inactive instead."
                />
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add Warehouse / Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sylhet Regional Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Branch Warehouse">Branch Warehouse</option>
                    <option value="Retail Outlet">Retail Outlet</option>
                    <option value="Salesman Van">Salesman Van</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Street / Plot / Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager / Custodian *</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="017XX-XXXXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          title={`Edit Facility - ${editing.name}`}
          initial={editing}
          fields={[
            { key: 'name', label: 'Facility Name', required: true },
            { key: 'type', label: 'Facility Type', type: 'select', options: ['Central Warehouse', 'Branch Warehouse', 'Retail Outlet', 'Salesman Van'] },
            { key: 'city', label: 'City / Region' },
            { key: 'address', label: 'Physical Address' },
            { key: 'managerName', label: 'Manager / Custodian', required: true },
            { key: 'contactNumber', label: 'Contact Phone' },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
          ]}
          onSave={v => updateWarehouse(editing.id, v as Partial<WarehouseType>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
