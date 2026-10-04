import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Phone,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RowActions, EditModal } from '../common/CrudKit';
import type { SalesmanVisit, CustomerFollowUp } from '../../types/erp';

export const FieldVisitsView: React.FC = () => {
  const {
    salesmanVisits,
    customerFollowUps,
    customers,
    salesmen,
    createSalesmanVisit,
    addCustomerFollowUp,
    updateFollowUpStatus,
    updateSalesmanVisit,
    deleteSalesmanVisit,
    updateFollowUp,
    deleteFollowUp
  } = useERP();

  const [activeTab, setActiveTab] = useState<'visits' | 'followups'>('visits');
  const [showLogVisitModal, setShowLogVisitModal] = useState(false);
  const [showScheduleFupModal, setShowScheduleFupModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SalesmanVisit | null>(null);
  const [editingFollowUp, setEditingFollowUp] = useState<CustomerFollowUp | null>(null);

  // New Visit Form
  const [salesmanId, setSalesmanId] = useState(salesmen[0]?.id || '');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [purpose, setPurpose] = useState<any>('Payment Follow-up');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [orderCollected, setOrderCollected] = useState<number>(0);
  const [paymentCollected, setPaymentCollected] = useState<number>(0);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // New Follow-up Form
  const [fupCustomerId, setFupCustomerId] = useState(customers[0]?.id || '');
  const [fupScheduledDate, setFupScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [fupPurpose, setFupPurpose] = useState<any>('Due Payment Follow-up');
  const [fupNotes, setFupNotes] = useState('');

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const sm = salesmen.find(s => s.id === salesmanId);
    const cust = customers.find(c => c.id === customerId);
    if (!sm || !cust) return;

    createSalesmanVisit({
      salesmanId: sm.id,
      salesmanName: sm.name,
      customerId: cust.id,
      customerName: cust.ownerName,
      shopName: cust.shopName,
      visitDate: new Date().toISOString().replace('T', ' ').substr(0, 16),
      purpose,
      outcomeNotes,
      orderCollectedAmount: orderCollected,
      paymentCollectedAmount: paymentCollected,
      nextFollowUpDate: nextFollowUpDate || undefined
    });

    setShowLogVisitModal(false);
    setOutcomeNotes('');
    setOrderCollected(0);
    setPaymentCollected(0);
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === fupCustomerId);
    if (!cust) return;

    addCustomerFollowUp({
      customerId: cust.id,
      customerName: cust.ownerName,
      shopName: cust.shopName,
      salesmanId: cust.salesmanId,
      salesmanName: cust.salesmanName,
      scheduledDate: fupScheduledDate,
      contactNumber: cust.mobile,
      purpose: fupPurpose,
      currentDueAmount: cust.currentDue,
      status: 'Pending',
      notes: fupNotes
    });

    setShowScheduleFupModal(false);
    setFupNotes('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Customer Route Visits & Overdue Recovery Scheduler
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log dealer physical visits, order collection records and manage scheduled telephone/in-person due recoveries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold mr-2">
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'visits' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Field Visits ({salesmanVisits.length})
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'followups' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
            >
              Scheduled Follow-ups ({customerFollowUps.length})
            </button>
          </div>

          {activeTab === 'visits' ? (
            <button
              onClick={() => setShowLogVisitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Log Field Visit</span>
            </button>
          ) : (
            <button
              onClick={() => setShowScheduleFupModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Schedule Follow-up</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Field Visits Log */}
      {activeTab === 'visits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700">
            Historical Customer Visit Journal
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Visit Date & Time</th>
                <th className="p-3">Sales Officer</th>
                <th className="p-3">Dealer Shop</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Outcome & Discussion</th>
                <th className="p-3 text-right">Orders Booked</th>
                <th className="p-3 text-right">Cash/Due Collected</th>
                <th className="p-3">Next Action Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesmanVisits.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-600">{v.visitDate}</td>
                  <td className="p-3 font-bold text-slate-900">{v.salesmanName}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{v.shopName}</div>
                    <div className="text-[10px] text-slate-500">{v.customerName}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {v.purpose}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs">{v.outcomeNotes}</td>
                  <td className="p-3 text-right font-bold text-blue-700">
                    {v.orderCollectedAmount ? formatBDT(v.orderCollectedAmount) : '-'}
                  </td>
                  <td className="p-3 text-right font-extrabold text-emerald-700">
                    {v.paymentCollectedAmount ? formatBDT(v.paymentCollectedAmount) : '-'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {v.nextFollowUpDate ? formatDate(v.nextFollowUpDate) : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <RowActions
                      onEdit={() => setEditingVisit(v)}
                      onDelete={() => deleteSalesmanVisit(v.id)}
                      deleteTitle="Delete Field Visit Record?"
                      deleteMessage="Are you sure you want to delete this recorded field visit?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Follow-up Scheduler */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerFollowUps.map(fup => (
              <div key={fup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{fup.shopName}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fup.customerName} ({fup.contactNumber})</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fup.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    fup.status === 'Contacted - Promised Payment' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {fup.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Outstanding Due:</span>
                    <span className="font-extrabold text-amber-700">{formatBDT(fup.currentDueAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Follow-up Target Date:</span>
                    <span className="font-bold text-slate-800">{formatDate(fup.scheduledDate)}</span>
                  </div>
                  {fup.promisedDate && (
                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>Promised Settlement:</span>
                      <span>{formatDate(fup.promisedDate)}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                  {fup.notes}
                </p>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => updateFollowUpStatus(fup.id, 'Contacted - Promised Payment', 'Confirmed by proprietor', '2026-10-10')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold"
                  >
                    Mark Promised
                  </button>
                  <button
                    onClick={() => updateFollowUpStatus(fup.id, 'Completed', 'Payment successfully settled')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-semibold"
                  >
                    Mark Resolved
                  </button>
                  <div className="ml-auto">
                    <RowActions
                      onEdit={() => setEditingFollowUp(fup)}
                      onDelete={() => deleteFollowUp(fup.id)}
                      deleteTitle={`Delete follow-up for ${fup.shopName}?`}
                      deleteMessage="Are you sure you want to remove this scheduled follow-up?"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Log Visit */}
      {showLogVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Log Field Sales Visit</h3>
              <button onClick={() => setShowLogVisitModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateVisit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Officer</label>
                  <select
                    value={salesmanId}
                    onChange={(e) => setSalesmanId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Shop</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.shopName}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Payment Follow-up">Payment Follow-up</option>
                    <option value="Order Collection">Order Collection</option>
                    <option value="Stock Checking">Stock Checking</option>
                    <option value="Relationship">Relationship Building</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Orders Booked (৳)</label>
                  <input
                    type="number"
                    value={orderCollected}
                    onChange={(e) => setOrderCollected(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cash Collected (৳)</label>
                  <input
                    type="number"
                    value={paymentCollected}
                    onChange={(e) => setPaymentCollected(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outcome & Discussion Notes *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discussed new Vivo V30 arrival and arranged settlement date for overdue balance."
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLogVisitModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Follow-up */}
      {showScheduleFupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Schedule Customer Follow-up</h3>
              <button onClick={() => setShowScheduleFupModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Shop *</label>
                <select
                  value={fupCustomerId}
                  onChange={(e) => setFupCustomerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.shopName} (Due: {formatBDT(c.currentDue)})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    value={fupScheduledDate}
                    onChange={(e) => setFupScheduledDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
                  <select
                    value={fupPurpose}
                    onChange={(e) => setFupPurpose(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Due Payment Follow-up">Due Payment Follow-up</option>
                    <option value="Overdue Recovery">Overdue Recovery</option>
                    <option value="Order Booking">Order Booking</option>
                    <option value="Credit Limit Review">Credit Limit Review</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Brief / Memo</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call owner regarding cheque clearance date."
                  value={fupNotes}
                  onChange={(e) => setFupNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowScheduleFupModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingVisit && (
        <EditModal
          title={`Edit Field Visit - ${editingVisit.shopName}`}
          initial={editingVisit}
          fields={[
            {
              key: 'purpose',
              label: 'Purpose of Visit',
              type: 'select',
              options: ['Payment Follow-up', 'Order Collection', 'Stock Checking', 'Relationship']
            },
            { key: 'outcomeNotes', label: 'Outcome & Discussion', type: 'textarea', required: true },
            { key: 'orderCollectedAmount', label: 'Order Value Booked (৳)', type: 'number' },
            { key: 'paymentCollectedAmount', label: 'Cash/Due Collected (৳)', type: 'number' },
            { key: 'nextFollowUpDate', label: 'Next Follow-up Date', type: 'date' }
          ]}
          onSave={v => updateSalesmanVisit(editingVisit.id, v as Partial<SalesmanVisit>)}
          onClose={() => setEditingVisit(null)}
        />
      )}

      {editingFollowUp && (
        <EditModal
          title={`Edit Follow-up - ${editingFollowUp.shopName}`}
          initial={editingFollowUp}
          fields={[
            { key: 'scheduledDate', label: 'Scheduled Target Date', type: 'date', required: true },
            {
              key: 'purpose',
              label: 'Follow-up Purpose',
              type: 'select',
              options: ['Due Payment Follow-up', 'Overdue Recovery', 'Order Booking', 'Credit Limit Review']
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Contacted - Promised Payment', 'Completed', 'Disputed / No Response']
            },
            { key: 'promisedDate', label: 'Promised Payment Date', type: 'date' },
            { key: 'notes', label: 'Notes & Brief', type: 'textarea' }
          ]}
          onSave={v => updateFollowUp(editingFollowUp.id, v as Partial<CustomerFollowUp>)}
          onClose={() => setEditingFollowUp(null)}
        />
      )}
    </div>
  );
};
