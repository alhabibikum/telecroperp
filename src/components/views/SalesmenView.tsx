import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  UserCheck,
  Target,
  Award,
  TrendingUp,
  MapPin,
  Phone,
  DollarSign,
  PlusCircle,
  Search
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { Salesman } from '../../types/erp';

const salesmanFields: FieldDef[] = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'mobile', label: 'Mobile', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'joiningDate', label: 'Joining Date', type: 'date' },
  { key: 'address', label: 'Address', half: false },
  { key: 'assignedArea', label: 'Assigned Area / Route', required: true },
  { key: 'basicSalary', label: 'Basic Salary (৳)', type: 'number' },
  {
    key: 'commissionType',
    label: 'Commission Model',
    type: 'select',
    options: ['Percentage of Sales', 'Percentage of Gross Profit', 'Fixed Per Unit', 'Target Based']
  },
  { key: 'commissionRate', label: 'Commission Rate', type: 'number', hint: '% for percentage models, ৳ per unit for Fixed Per Unit' },
  { key: 'monthlyTarget', label: 'Monthly Sales Target (৳)', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On Leave', 'Inactive'] }
];

const blankSalesman = {
  name: '',
  mobile: '',
  email: '',
  joiningDate: new Date().toISOString().split('T')[0],
  address: '',
  assignedArea: '',
  basicSalary: 0,
  commissionType: 'Percentage of Sales',
  commissionRate: 1,
  monthlyTarget: 0,
  status: 'Active'
};

export const SalesmenView: React.FC = () => {
  const { salesmen, salesInvoices, addSalesman, updateSalesman, deleteSalesman } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<Salesman | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = salesmen.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assignedArea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Sales Officers & Field Operations Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Field territory routes, monthly targets, collections, and commission calculation rules
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Salesman</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, employee code or area..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Salesman Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(sm => {
          const achievementPercent = sm.monthlyTarget > 0 ? Math.round((sm.currentMonthSales / sm.monthlyTarget) * 100) : 0;
          const totalInvoices = salesInvoices.filter(i => i.salesmanId === sm.id).length;
          const totalCommissionEarned = salesInvoices
            .filter(i => i.salesmanId === sm.id)
            .reduce((acc, i) => acc + (i.commissionEarned || 0), 0);

          return (
            <div key={sm.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {sm.employeeCode}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{sm.name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sm.assignedArea}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {sm.status}
                </span>
              </div>

              {/* Monthly Target vs Sales Progress */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Target Achievement</span>
                  </span>
                  <span className={`font-extrabold ${achievementPercent >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {achievementPercent}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      achievementPercent >= 100 ? 'bg-emerald-600' : achievementPercent >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, achievementPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                  <div>Sales: <b>{formatBDT(sm.currentMonthSales)}</b></div>
                  <div>Target: <b>{formatBDT(sm.monthlyTarget)}</b></div>
                </div>
              </div>

              {/* Commission Rule & Metrics */}
              <div className="text-xs space-y-2 text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Commission Model:</span>
                  <span className="font-semibold text-slate-800">{sm.commissionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission Rate:</span>
                  <span className="font-bold text-blue-700">
                    {sm.commissionType === 'Fixed Per Unit' ? `৳ ${sm.commissionRate} / Unit` : `${sm.commissionRate}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accumulated Commission:</span>
                  <span className="font-extrabold text-emerald-700">{formatBDT(totalCommissionEarned)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Collections:</span>
                  <span className="font-bold text-slate-800">{formatBDT(sm.currentMonthCollection)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Invoices Handled:</span>
                  <span className="font-semibold text-slate-800">{totalInvoices} Invoices</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <RowActions
                  onEdit={() => setEditing(sm)}
                  onDelete={() => deleteSalesman(sm.id)}
                  deleteTitle={`Delete ${sm.name}?`}
                  deleteMessage="Salesmen with attributed invoices cannot be deleted; mark them Inactive instead. Assigned customers become house accounts."
                />
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <EditModal
          title="Add Sales Officer"
          initial={blankSalesman}
          fields={salesmanFields}
          saveLabel="Save Salesman"
          onSave={v => {
            addSalesman({
              ...(v as Omit<Salesman, 'id' | 'employeeCode'>),
              currentMonthSales: 0,
              currentMonthCollection: 0,
              assignedCustomerCount: 0
            });
            return { success: true };
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <EditModal
          title={`Edit Salesman - ${editing.name}`}
          initial={editing}
          fields={salesmanFields}
          onSave={v => updateSalesman(editing.id, v as Partial<Salesman>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
