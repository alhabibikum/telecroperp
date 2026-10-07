import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Wrench,
  Printer,
  Smartphone,
  Building,
  User,
  AlertTriangle,
  X,
  Scan,
  QrCode
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { WarrantyStatus } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';

export const WarrantyServiceView: React.FC = () => {
  const {
    warrantyClaims,
    customers,
    products,
    imeis,
    addWarrantyClaim,
    updateWarrantyStatus
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaimForPrint, setSelectedClaimForPrint] = useState<any | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerContext, setScannerContext] = useState<'filter' | 'modal'>('filter');

  // New Claim Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [inputIMEI, setInputIMEI] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('Minor scuffs, no liquid or display crack');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('Box, Charger, SIM Ejector Pin');
  const [serviceCenterName, setServiceCenterName] = useState('Samsung Care Central Service Center, Motijheel');
  const [serviceCenterJobNo, setServiceCenterJobNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-filled product/invoice info when IMEI is typed
  const matchedIMEI = imeis.find(i => i.imei1 === inputIMEI.trim() || i.imei2 === inputIMEI.trim());

  const handleIMEIChange = (val: string) => {
    setInputIMEI(val);
    const found = imeis.find(i => i.imei1 === val.trim() || i.imei2 === val.trim());
    if (found) {
      if (found.brandName === 'Samsung') {
        setServiceCenterName('Samsung Authorized Customer Care, Jamuna Future Park');
      } else if (found.brandName === 'Apple') {
        setServiceCenterName('Apple Authorized Service Provider (iStore), Gulshan');
      } else if (found.brandName === 'Xiaomi') {
        setServiceCenterName('Xiaomi Service Center, Multiplan Centre, Elephant Road');
      } else if (found.brandName === 'Vivo') {
        setServiceCenterName('Vivo Official Care, Bashundhara City');
      } else {
        setServiceCenterName('Official National Brand Service Center, Dhaka');
      }
    }
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cust = customers.find(c => c.id === customerId);
    if (!cust) {
      setFormError('Please select a customer or dealer');
      return;
    }

    if (!inputIMEI.trim()) {
      setFormError('Please enter a valid IMEI number');
      return;
    }

    const brandName = matchedIMEI?.brandName || 'Multi-Brand';
    const productModel = matchedIMEI ? `${matchedIMEI.productName} (${matchedIMEI.variantDesc})` : 'Smartphone (Direct Inward)';

    const res = addWarrantyClaim({
      date: new Date().toISOString().split('T')[0],
      customerId: cust.id,
      customerName: `${cust.ownerName} (${cust.shopName})`,
      customerPhone: cust.mobile,
      brandName,
      productModel,
      imei: inputIMEI.trim(),
      purchaseInvoiceNo: matchedIMEI?.purchaseInvoiceNo,
      purchaseDate: matchedIMEI?.purchaseDate,
      problemDescription,
      physicalCondition,
      accessoriesIncluded,
      serviceCenterName,
      serviceCenterJobNo: serviceCenterJobNo || undefined,
      status: 'Received',
      repairCostCustomer: 0,
      remarks
    });

    if (res.success) {
      setShowAddModal(false);
      setInputIMEI('');
      setProblemDescription('');
      setRemarks('');
    }
  };

  const filteredClaims = warrantyClaims.filter(c => {
    const matchesSearch =
      c.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.imei.includes(searchTerm) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceCenterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dispatched to Service Center':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Repair':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Repaired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Replaced':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Delivered to Customer':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Warranty RMA & Brand Service Center Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ওয়ারেন্টি ক্লেইম, আরএমএ জবশিট, ব্র্যান্ড সার্ভিস সেন্টারে প্রেরণ, রিপেয়ার ও সোয়াপ রিপ্লেসমেন্ট ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          + New Warranty RMA Claim
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Inward Claims
          </div>
          <div className="text-xl font-black text-slate-800 mt-1">
            {warrantyClaims.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">All recorded RMA jobs</div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            At Service Center
          </div>
          <div className="text-xl font-black text-amber-800 mt-1">
            {warrantyClaims.filter(c => c.status === 'Dispatched to Service Center' || c.status === 'In Repair').length}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">In inspection or repair</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready / Repaired
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">
            {warrantyClaims.filter(c => c.status === 'Repaired' || c.status === 'Replaced').length}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Awaiting customer collection</div>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            Unit Replacements
          </div>
          <div className="text-xl font-black text-indigo-800 mt-1">
            {warrantyClaims.filter(c => c.status === 'Replaced').length}
          </div>
          <div className="text-[10px] text-indigo-600 mt-0.5">DOA swaps / new IMEIs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by RMA No, IMEI, Customer, Product, or Service Center..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setScannerContext('filter');
            setShowScannerModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          title="বারকোড বা IMEI স্ক্যান করে ওয়ারেন্টি ক্লেইম খুঁজুন"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan / Filter</span>
        </button>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Dispatched to Service Center">Dispatched to Service Center</option>
            <option value="In Repair">In Repair</option>
            <option value="Repaired">Repaired</option>
            <option value="Replaced">Replaced (Swap)</option>
            <option value="Delivered to Customer">Delivered to Customer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Warranty Claims List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">RMA No & Date</th>
                <th className="py-3 px-4">Customer / Dealer</th>
                <th className="py-3 px-4">Device & IMEI</th>
                <th className="py-3 px-4">Problem Description</th>
                <th className="py-3 px-4">Brand Service Center</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No warranty claims matching your filters.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-indigo-600 font-mono">
                        {claim.rmaNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(claim.date)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {claim.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {claim.customerPhone}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {claim.productModel}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        {claim.imei}
                      </div>
                      {claim.replacementIMEI && (
                        <div className="text-[10px] text-teal-700 font-mono bg-teal-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                          New IMEI: {claim.replacementIMEI}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="text-slate-800 truncate" title={claim.problemDescription}>
                        {claim.problemDescription}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        Acc: {claim.accessoriesIncluded}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="text-slate-800 font-medium truncate" title={claim.serviceCenterName}>
                        {claim.serviceCenterName}
                      </div>
                      {claim.serviceCenterJobNo && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Job: {claim.serviceCenterJobNo}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={claim.status}
                        onChange={(e) => updateWarrantyStatus(claim.id, e.target.value as WarrantyStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${getStatusBadge(claim.status)}`}
                      >
                        <option value="Received">Received</option>
                        <option value="Dispatched to Service Center">Dispatched to Care</option>
                        <option value="In Repair">In Repair</option>
                        <option value="Repaired">Repaired & Ready</option>
                        <option value="Replaced">Replaced (New IMEI)</option>
                        <option value="Delivered to Customer">Delivered to Customer</option>
                        <option value="Rejected">Warranty Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedClaimForPrint(claim)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        title="Print RMA Job Sheet"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Job Sheet</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Warranty Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Register New Warranty RMA Claim
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer / Retailer *
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.shopName} — {c.ownerName} ({c.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Device IMEI Number *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerContext('modal');
                        setShowScannerModal(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>⚡ Scan IMEI (Gun/Camera)</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Scan or enter 15-digit IMEI..."
                    value={inputIMEI}
                    onChange={(e) => handleIMEIChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                  {matchedIMEI ? (
                    <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Found: {matchedIMEI.productName} ({matchedIMEI.brandName}) — Status: {matchedIMEI.status}
                    </div>
                  ) : inputIMEI.length >= 14 ? (
                    <div className="mt-1 text-[11px] text-amber-600 font-semibold">
                      IMEI not found in active sales database (Direct Inward entry)
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reported Fault / Problem Description *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Display flickering, charging port loose, touchscreen unresponsive after drop..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Physical Appearance / Condition
                  </label>
                  <input
                    type="text"
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Accessories Received
                  </label>
                  <input
                    type="text"
                    value={accessoriesIncluded}
                    onChange={(e) => setAccessoriesIncluded(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Authorized Brand Service Center *
                  </label>
                  <input
                    type="text"
                    value={serviceCenterName}
                    onChange={(e) => setServiceCenterName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service Center Job / Tracking No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAM-CARE-9982"
                    value={serviceCenterJobNo}
                    onChange={(e) => setServiceCenterJobNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Internal Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Check for water indicator sticker, expedite for VIP dealer"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Generate RMA Job Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Job Sheet Modal */}
      {selectedClaimForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Warranty Job Sheet Ticket</h3>
              <button
                onClick={() => setSelectedClaimForPrint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="rma-job-sheet" className="p-4 border border-dashed border-slate-300 rounded-xl space-y-3 font-sans text-xs bg-slate-50">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="text-sm font-black text-slate-900">TELECORP MOBILE DISTRIBUTION LTD</div>
                <div className="text-[10px] text-slate-500">Official Device Warranty & Service Intake Job Sheet</div>
                <div className="text-xs font-mono font-bold text-indigo-600 mt-1">{selectedClaimForPrint.rmaNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-400">Date:</span> <strong>{selectedClaimForPrint.date}</strong></div>
                <div><span className="text-slate-400">Customer:</span> <strong>{selectedClaimForPrint.customerName}</strong></div>
                <div><span className="text-slate-400">Phone:</span> <strong>{selectedClaimForPrint.customerPhone}</strong></div>
                <div><span className="text-slate-400">Brand:</span> <strong>{selectedClaimForPrint.brandName}</strong></div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                <div><span className="text-slate-500">Model:</span> <strong>{selectedClaimForPrint.productModel}</strong></div>
                <div><span className="text-slate-500">IMEI:</span> <strong className="font-mono text-indigo-600">{selectedClaimForPrint.imei}</strong></div>
                <div><span className="text-slate-500">Fault:</span> <span>{selectedClaimForPrint.problemDescription}</span></div>
                <div><span className="text-slate-500">Condition:</span> <span>{selectedClaimForPrint.physicalCondition}</span></div>
                <div><span className="text-slate-500">Accessories:</span> <span>{selectedClaimForPrint.accessoriesIncluded}</span></div>
                <div><span className="text-slate-500">Assigned Care:</span> <strong>{selectedClaimForPrint.serviceCenterName}</strong></div>
              </div>

              <div className="text-[9px] text-slate-500 border-t pt-2 space-y-0.5">
                <p>• Delivery subject to parts availability at brand manufacturer service center.</p>
                <p>• Please present this original job sheet ticket at the time of device handover.</p>
              </div>

              <div className="flex justify-between pt-6 text-[10px] font-semibold text-slate-600">
                <div className="border-t border-slate-400 pt-1">Customer Signature</div>
                <div className="border-t border-slate-400 pt-1">Authorized Officer</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedClaimForPrint(null)}
                className="px-4 py-2 border rounded-xl font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Job Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Barcode / Multi-IMEI Scanner Modal */}
      {showScannerModal && (
        <MultiBarcodeScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title={
            scannerContext === 'filter'
              ? 'ওয়ারেন্টি ক্লেইম সার্চ স্ক্যানার'
              : 'ওয়ারেন্টি ডিভাইস IMEI স্ক্যানার'
          }
          subtitle={
            scannerContext === 'filter'
              ? 'হ্যান্ডসেটের বারকোড বা IMEI স্ক্যান করে পূর্বের সার্ভিসিং রেকর্ড ট্র্যাক করুন'
              : 'সার্ভিস সেন্টারে পাঠানোর জন্য হ্যান্ডসেটের বারকোড বা IMEI স্ক্যান করুন'
          }
          mode="lookup"
          onConfirm={(records, tokens) => {
            if (scannerContext === 'filter') {
              if (tokens && tokens.length > 0) {
                setSearchTerm(tokens[0]);
              }
            } else {
              if (tokens && tokens.length > 0) {
                const code = tokens[0];
                handleIMEIChange(code);
                const found = records.find(i => i.imei1 === code || i.imei2 === code) || imeis.find(i => i.imei1 === code || i.imei2 === code);
                if (found?.customerId) {
                  setCustomerId(found.customerId);
                }
              }
            }
            setShowScannerModal(false);
          }}
        />
      )}
    </div>
  );
};
