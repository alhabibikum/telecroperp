import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Users,
  PlusCircle,
  Search,
  Building,
  Phone,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { StatementModal } from '../modals/StatementModal';
import { RowActions, EditModal } from '../common/CrudKit';
import type { Customer } from '../../types/erp';

interface CustomersViewProps {
  onOpenDueCollection: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onOpenDueCollection }) => {
  const { customers, salesmen, addCustomer, updateCustomer, deleteCustomer } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statementCustomerId, setStatementCustomerId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);

  // New Customer Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Mirpur');
  const [district, setDistrict] = useState('Dhaka');
  const [creditLimit, setCreditLimit] = useState<number>(500000);
  const [allowedDueDays, setAllowedDueDays] = useState<number>(15);
  const [salesmanId, setSalesmanId] = useState('');

  const filtered = customers.filter(c =>
    c.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    c.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !mobile) return;

    const sm = salesmen.find(s => s.id === salesmanId);

    addCustomer({
      shopName,
      ownerName,
      mobile,
      address,
      area,
      district,
      creditLimit,
      allowedDueDays,
      salesmanId: sm?.id,
      salesmanName: sm?.name,
      customerType: 'Wholesale Dealer',
      openingBalance: 0,
      currentDue: 0,
      status: 'Active'
    });

    setShowAddModal(false);
    setShopName('');
    setOwnerName('');
    setMobile('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Customer & Wholesale Dealer Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit limits, payment terms, assigned route salesmen and live outstanding balances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Dealer Profile</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dealer shop, proprietor name, mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cust => {
          const isOverLimit = cust.creditLimit > 0 && cust.currentDue > cust.creditLimit;
          const usagePercent = cust.creditLimit > 0 ? Math.round((cust.currentDue / cust.creditLimit) * 100) : 0;

          return (
            <div key={cust.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {cust.customerCode}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">{cust.shopName}</h3>
                  <div className="text-xs text-slate-500">{cust.ownerName}</div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {cust.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.mobile}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{cust.area}, {cust.district}</span>
                </div>
                <div className="text-[11px] text-blue-700">
                  Salesman: <b>{cust.salesmanName || 'General Route'}</b>
                </div>
              </div>

              {/* Credit Status */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Limit:</span>
                  <span className="font-bold text-slate-800">{formatBDT(cust.creditLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Outstanding Due:</span>
                  <span className={`font-extrabold ${cust.currentDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {formatBDT(cust.currentDue)}
                  </span>
                </div>

                {cust.creditLimit > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Utilized</span>
                      <span>{usagePercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full ${isOverLimit ? 'bg-rose-600' : usagePercent >= 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatementCustomerId(cust.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Statement</span>
                </button>

                {cust.currentDue > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenDueCollection(cust.id)}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Collect (৳ {cust.currentDue.toLocaleString()})
                  </button>
                )}
                <div className="ml-auto">
                  <RowActions
                    onEdit={() => setEditing(cust)}
                    onDelete={() => deleteCustomer(cust.id)}
                    deleteTitle={`Delete ${cust.shopName}?`}
                    deleteMessage="Customers with invoices or outstanding dues cannot be deleted; mark them Suspended/Blocked instead."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Register New Dealer / Mobile Shop</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop / Outlet Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Al-Amin Telecom"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proprietor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Md. Al-Amin"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="017XX-XXXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area / Market</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allowed Due Days</label>
                  <input
                    type="number"
                    value={allowedDueDays}
                    onChange={(e) => setAllowedDueDays(parseInt(e.target.value) || 15)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Officer</label>
                <select
                  value={salesmanId}
                  onChange={(e) => setSalesmanId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">None / House Account</option>
                  {salesmen.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.assignedArea})</option>
                  ))}
                </select>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          title={`Edit Customer - ${editing.shopName}`}
          initial={{ ...editing, salesmanId: editing.salesmanId || '' }}
          fields={[
            { key: 'shopName', label: 'Shop / Outlet Name', required: true },
            { key: 'ownerName', label: 'Proprietor Name' },
            { key: 'mobile', label: 'Mobile Number', required: true },
            { key: 'alternativeMobile', label: 'Alternative Mobile' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'customerType', label: 'Customer Type', type: 'select', options: ['Wholesale Dealer', 'Sub-Dealer', 'Retail Shop', 'Corporate', 'Walk-in'] },
            { key: 'address', label: 'Address', half: false },
            { key: 'area', label: 'Area / Market' },
            { key: 'district', label: 'District' },
            { key: 'tradeLicense', label: 'Trade License' },
            { key: 'nid', label: 'NID' },
            { key: 'creditLimit', label: 'Credit Limit (৳)', type: 'number' },
            { key: 'allowedDueDays', label: 'Allowed Due Days', type: 'number' },
            {
              key: 'salesmanId',
              label: 'Assigned Sales Officer',
              type: 'select',
              options: [{ value: '', label: 'None / House Account' }, ...salesmen.map(s => ({ value: s.id, label: `${s.name} (${s.assignedArea})` }))]
            },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Suspended', 'Blocked'] },
            { key: 'notes', label: 'Notes', type: 'textarea' }
          ]}
          onSave={v => {
            const sm = salesmen.find(s => s.id === v.salesmanId);
            return updateCustomer(editing.id, { ...v, salesmanId: sm?.id, salesmanName: sm?.name } as Partial<Customer>);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {/* Statement Modal */}
      <StatementModal
        isOpen={Boolean(statementCustomerId)}
        onClose={() => setStatementCustomerId(null)}
        entityType="customer"
        entityId={statementCustomerId || ''}
      />
    </div>
  );
};
