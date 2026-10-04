import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Building2,
  PlusCircle,
  Search,
  Phone,
  CreditCard,
  Building,
  CheckCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { PaymentMethodType } from '../../types/erp';
import { StatementModal } from '../modals/StatementModal';
import { RowActions, EditModal } from '../common/CrudKit';
import type { Supplier } from '../../types/erp';

export const SuppliersView: React.FC = () => {
  const { suppliers, bankAccounts, paySupplier, addSupplier, updateSupplier, deleteSupplier } = useERP();
  const [editing, setEditing] = useState<Supplier | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statementSupplierId, setStatementSupplierId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(100000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [refNo, setRefNo] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Add Supplier form
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newDistrict, setNewDistrict] = useState('Dhaka');
  const [newCreditLimit, setNewCreditLimit] = useState<number>(5000000);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSupplierForPay = suppliers.find(s => s.id === showPayModal);

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay) return;

    const res = paySupplier({
      supplierId: selectedSupplierForPay.id,
      amount: payAmount,
      paymentMethod,
      bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
      referenceNo: refNo || `RTGS-${Date.now()}`
    });

    if (res.success) {
      setMessage(`Successfully disbursed ৳ ${payAmount.toLocaleString()} to ${selectedSupplierForPay.name}!`);
      setShowPayModal(null);
    }
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) return;

    addSupplier({
      name: newName,
      companyName: newCompany || newName,
      contactPerson: newContact || newName,
      mobile: newMobile,
      email: '',
      address: 'Commercial Area',
      district: newDistrict,
      taxVatNumber: 'BIN-0091223-0101',
      tradeLicense: 'TRAD-2026-9921',
      openingBalance: 0,
      creditLimit: newCreditLimit,
      paymentTermsDays: 15,
      currentDue: 0,
      bankInfo: '',
      status: 'Active'
    });

    setShowAddModal(false);
    setNewName('');
    setNewMobile('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Supplier & National Brand Distributor Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized supply partners, payables ledger, payment terms & BTRC tax licensing
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          + Add New Supplier
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
          {message}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier company, code, contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(sup => (
          <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {sup.supplierCode}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">{sup.name}</h3>
                <div className="text-xs text-slate-500">{sup.companyName}</div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sup.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {sup.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
              <div>Contact Person: <b className="text-slate-800">{sup.contactPerson}</b> ({sup.mobile})</div>
              <div>VAT / BIN: <span className="font-mono font-medium">{sup.taxVatNumber}</span></div>
              <div className="truncate text-slate-500">Address: {sup.address}, {sup.district}</div>
              <div className="text-[11px] text-blue-700">Payment Terms: <b>{sup.paymentTermsDays} Days Credit</b></div>
            </div>

            {/* Payable status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <div className="text-slate-500 text-[11px]">Current Outstanding Payable</div>
                <div className="text-base font-black text-rose-700">{formatBDT(sup.currentDue)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatementSupplierId(sup.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Statement</span>
                </button>
                <button
                  onClick={() => {
                    setShowPayModal(sup.id);
                    setPayAmount(Math.min(sup.currentDue, 500000));
                  }}
                  disabled={sup.currentDue <= 0}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs disabled:opacity-40 transition"
                >
                  Disburse Payment
                </button>
                <RowActions
                  onEdit={() => setEditing(sup)}
                  onDelete={() => deleteSupplier(sup.id)}
                  deleteTitle={`Delete ${sup.name}?`}
                  deleteMessage="Suppliers with purchase invoices or a payable balance cannot be deleted; mark them Inactive instead."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disburse Payment Modal */}
      {showPayModal && selectedSupplierForPay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Disburse Supplier Payment</h3>
                <p className="text-xs text-slate-500">{selectedSupplierForPay.name}</p>
              </div>
              <button onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handlePaySupplierSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex justify-between">
                <span>Total Payable Due:</span>
                <span className="font-bold">{formatBDT(selectedSupplierForPay.currentDue)}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursement Amount (৳) *</label>
                <input
                  type="number"
                  min="100"
                  max={selectedSupplierForPay.currentDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Bank Transfer">Bank Transfer (RTGS / BEFTN)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Debit From Bank Account</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName} (Bal: {formatBDT(b.currentBalance)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Reference / Cheque #</label>
                <input
                  type="text"
                  placeholder="e.g. RTGS-882200"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm ৳ {payAmount.toLocaleString()} Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Brand Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Electronics Bangladesh Ltd"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fair Electronics Limited"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="text"
                    placeholder="017XX-XXXXXX"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          title={`Edit Supplier - ${editing.name}`}
          initial={editing}
          fields={[
            { key: 'name', label: 'Supplier Name', required: true },
            { key: 'companyName', label: 'Company Name' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'mobile', label: 'Mobile', required: true },
            { key: 'alternativeMobile', label: 'Alternative Mobile' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'address', label: 'Address', half: false },
            { key: 'district', label: 'District' },
            { key: 'taxVatNumber', label: 'VAT / BIN' },
            { key: 'tradeLicense', label: 'Trade License' },
            { key: 'creditLimit', label: 'Credit Limit (৳)', type: 'number' },
            { key: 'paymentTermsDays', label: 'Payment Terms (days)', type: 'number' },
            { key: 'bankInfo', label: 'Bank Info' },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
            { key: 'notes', label: 'Notes', type: 'textarea' }
          ]}
          onSave={v => updateSupplier(editing.id, v as Partial<Supplier>)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Statement Modal */}
      <StatementModal
        isOpen={Boolean(statementSupplierId)}
        onClose={() => setStatementSupplierId(null)}
        entityType="supplier"
        entityId={statementSupplierId || ''}
      />
    </div>
  );
};
