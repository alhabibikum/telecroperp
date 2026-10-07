import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Smartphone,
  Building,
  DollarSign,
  Package,
  MapPin,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { CourierPartner, DeliveryStatus } from '../../types/erp';

export const DeliveryDispatchView: React.FC = () => {
  const {
    deliveryChallans,
    salesInvoices,
    customers,
    bankAccounts,
    createDeliveryChallan,
    updateDeliveryStatus,
    settleChallanCod
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<any | null>(null);

  // New Challan Form State
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState(salesInvoices[0]?.invoiceNo || '');
  const [courierPartner, setCourierPartner] = useState<CourierPartner>('Sundarban Courier');
  const [consignmentNo, setConsignmentNo] = useState('');
  const [isCOD, setIsCOD] = useState(false);
  const [codAmount, setCodAmount] = useState<number>(0);
  const [totalCartons, setTotalCartons] = useState<number>(1);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedInvoice = salesInvoices.find(inv => inv.invoiceNo === selectedInvoiceNo);

  const handleInvoiceChange = (invNo: string) => {
    setSelectedInvoiceNo(invNo);
    const inv = salesInvoices.find(i => i.invoiceNo === invNo);
    if (inv) {
      if (inv.dueAmount > 0) {
        setIsCOD(true);
        setCodAmount(inv.dueAmount);
      } else {
        setIsCOD(false);
        setCodAmount(0);
      }
    }
  };

  const handleCreateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const cust = customers.find(c => c.id === selectedInvoice.customerId);
    const deliveryAddress = cust ? `${cust.address}, ${cust.area}` : 'Dealer Delivery Point';
    const district = cust ? cust.district : 'Dhaka';

    const imeiList: string[] = [];
    selectedInvoice.items.forEach(it => {
      (it.imeiList || []).forEach(im => imeiList.push(im));
    });

    createDeliveryChallan({
      date: new Date().toISOString().split('T')[0],
      invoiceNo: selectedInvoice.invoiceNo,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      customerPhone: selectedInvoice.customerPhone,
      deliveryAddress,
      district,
      courierPartner,
      consignmentNo: consignmentNo || undefined,
      isCOD,
      codAmount: isCOD ? codAmount : 0,
      codStatus: isCOD ? 'Pending' : 'Not Applicable',
      deliveryStatus: 'Dispatched',
      driverName: driverName || undefined,
      driverPhone: driverPhone || undefined,
      totalCartons,
      imeiList,
      remarks
    });

    setShowAddModal(false);
    setConsignmentNo('');
    setRemarks('');
  };

  const filteredChallans = deliveryChallans.filter(ch => {
    const matchesSearch =
      ch.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ch.consignmentNo && ch.consignmentNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || ch.deliveryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'Pending Dispatch':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Returned':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Delivery Challan & Courier Logistics Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ডেলিভারি চালান তৈরি, সুন্দরবন / এসএ পরিবহন কুরিয়ার ট্র্যাকিং এবং ক্যাশ অন ডেলিভারি (COD) সেটেলমেন্ট
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          + Generate Delivery Challan
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Consignments</div>
          <div className="text-xl font-black text-slate-900 mt-1">{deliveryChallans.length} Challans</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all districts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> In-Transit / Dispatched
          </div>
          <div className="text-xl font-black text-blue-900 mt-1">
            {deliveryChallans.filter(c => c.deliveryStatus === 'Dispatched' || c.deliveryStatus === 'In Transit').length} Parcels
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">En route to dealer shops</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Delivered
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">
            {deliveryChallans.filter(c => c.deliveryStatus === 'Delivered').length} Delivered
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Verified gate receipts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Pending Courier COD
          </div>
          <div className="text-xl font-black text-amber-900 mt-1">
            {formatBDT(deliveryChallans.filter(c => c.codStatus === 'Pending').reduce((s, c) => s + c.codAmount, 0))}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Awaiting courier bank remittance</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Challan No, Invoice No, Customer, or Courier CN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Delivery Statuses</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
            <option value="Dispatched">Dispatched</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Challan List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Challan No & Date</th>
                <th className="py-3 px-4">Invoice & Customer</th>
                <th className="py-3 px-4">Courier & Consignment</th>
                <th className="py-3 px-4 text-center">Cartons & Handsets</th>
                <th className="py-3 px-4 text-right">COD Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No delivery challans matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredChallans.map(ch => (
                  <tr key={ch.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-blue-600 font-mono">{ch.challanNo}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(ch.date)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ch.customerName}</div>
                      <div className="font-mono text-[11px] text-slate-500">Ref: {ch.invoiceNo}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{ch.deliveryAddress}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ch.courierPartner}</span>
                      </div>
                      {ch.consignmentNo && (
                        <div className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                          CN: {ch.consignmentNo}
                        </div>
                      )}
                      {ch.driverName && (
                        <div className="text-[10px] text-slate-400">Driver: {ch.driverName} ({ch.driverPhone})</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-slate-900">{ch.totalCartons} Box(es)</div>
                      <div className="text-[10px] text-slate-500">{ch.imeiList.length} IMEIs Enclosed</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {ch.isCOD ? (
                        <div>
                          <div className="font-extrabold text-amber-700">{formatBDT(ch.codAmount)}</div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            ch.codStatus === 'Collected & Settled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ch.codStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Non-COD (Prepaid)</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={ch.deliveryStatus}
                        onChange={(e) => updateDeliveryStatus(ch.id, e.target.value as DeliveryStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${getStatusBadge(ch.deliveryStatus)}`}
                      >
                        <option value="Pending Dispatch">Pending Dispatch</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      {ch.isCOD && ch.codStatus === 'Pending' && (
                        <button
                          onClick={() => settleChallanCod(ch.id, bankAccounts[0]?.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Settle COD Cash into Bank"
                        >
                          Settle COD
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedChallanForPrint(ch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Challan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Generate Delivery Challan</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Sales Invoice *</label>
                <select
                  value={selectedInvoiceNo}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                >
                  {salesInvoices.map(inv => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} — {inv.customerName} ({formatBDT(inv.grandTotal)}, Due: {formatBDT(inv.dueAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Courier / Logistics Partner *</label>
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value as CourierPartner)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Sundarban Courier">Sundarban Courier Service</option>
                    <option value="SA Paribahan">SA Paribahan Parcel</option>
                    <option value="Steadfast Courier">Steadfast Courier Ltd</option>
                    <option value="RedX">RedX Logistics</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="Company Van Delivery">Company Dedicated Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consignment / Booking No (CN #)</label>
                  <input
                    type="text"
                    placeholder="e.g. SC-DHK-99210"
                    value={consignmentNo}
                    onChange={(e) => setConsignmentNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Cartons / Packages</label>
                  <input
                    type="number"
                    min="1"
                    value={totalCartons}
                    onChange={(e) => setTotalCartons(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Is Cash on Delivery (COD)?</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={isCOD}
                        onChange={(e) => setIsCOD(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Yes, Collect COD</span>
                    </label>
                  </div>
                </div>
              </div>

              {isCOD && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">COD Collection Amount (৳) *</label>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl font-bold text-amber-900"
                    required
                  />
                </div>
              )}

              {courierPartner === 'Company Van Delivery' && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alamgir Hossain"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Driver Mobile</label>
                    <input
                      type="text"
                      placeholder="017XX-XXXXXX"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Handling Remarks / Gate Pass Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Fragile electronics, verify seal sticker upon arrival"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Issue Delivery Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Challan Modal */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Delivery Challan & Gate Pass</h3>
              <button onClick={() => setSelectedChallanForPrint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="delivery-challan-doc" className="p-5 border border-slate-300 rounded-xl space-y-4 font-sans text-xs bg-slate-50">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="text-base font-black text-slate-900">TELECORP MOBILE DISTRIBUTION & TRADE LTD</div>
                <div className="text-[10px] text-slate-500">Official Handset Delivery Challan & Dispatch Gate Pass</div>
                <div className="text-xs font-mono font-bold text-blue-700 mt-1">{selectedChallanForPrint.challanNo}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500">Date:</span> <strong>{selectedChallanForPrint.date}</strong></div>
                <div><span className="text-slate-500">Invoice Ref:</span> <strong>{selectedChallanForPrint.invoiceNo}</strong></div>
                <div><span className="text-slate-500">Customer:</span> <strong>{selectedChallanForPrint.customerName}</strong></div>
                <div><span className="text-slate-500">Phone:</span> <strong>{selectedChallanForPrint.customerPhone}</strong></div>
                <div className="col-span-2"><span className="text-slate-500">Destination:</span> <strong>{selectedChallanForPrint.deliveryAddress} ({selectedChallanForPrint.district})</strong></div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <div><span className="text-slate-500">Carrier / Courier:</span> <strong>{selectedChallanForPrint.courierPartner}</strong></div>
                {selectedChallanForPrint.consignmentNo && (
                  <div><span className="text-slate-500">Booking CN:</span> <strong className="font-mono">{selectedChallanForPrint.consignmentNo}</strong></div>
                )}
                <div><span className="text-slate-500">Total Packages:</span> <strong>{selectedChallanForPrint.totalCartons} Box(es)</strong></div>
                <div><span className="text-slate-500">Enclosed Handsets:</span> <strong>{selectedChallanForPrint.imeiList?.length || 0} Units</strong></div>
                {selectedChallanForPrint.isCOD && (
                  <div className="text-amber-800 font-bold"><span className="text-slate-500 font-normal">COD Cash to Collect:</span> {formatBDT(selectedChallanForPrint.codAmount)}</div>
                )}
              </div>

              <div className="text-[9px] text-slate-500 border-t pt-2">
                <p>• Goods received in sound and factory sealed condition with official BTRC TAC stickers.</p>
                <p>• Shortage or box tampering must be endorsed on this challan before acknowledging receipt.</p>
              </div>

              <div className="flex justify-between pt-8 text-[10px] font-semibold text-slate-700">
                <div className="border-t border-slate-400 pt-1 text-center w-32">Warehouse Dispatcher</div>
                <div className="border-t border-slate-400 pt-1 text-center w-32">Courier / Driver</div>
                <div className="border-t border-slate-400 pt-1 text-center w-32">Receiver Shop Seal</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedChallanForPrint(null)} className="px-4 py-2 border rounded-xl font-semibold text-xs">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <Printer className="w-4 h-4" />
                Print Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
