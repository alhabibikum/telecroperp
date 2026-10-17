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
  QrCode,
  LayoutGrid,
  List,
  Check,
  Save,
  ArrowRight
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { WarrantyStatus } from '../../types/erp';
import { MultiBarcodeScannerModal } from '../common/MultiBarcodeScannerModal';
import { useToast } from '../common/ToastNotificationSystem';

export const WarrantyServiceView: React.FC = () => {
  const {
    warrantyClaims,
    customers,
    products,
    imeis,
    suppliers,
    addWarrantyClaim,
    updateWarrantyStatus,
    settings
  } = useERP();
  const { showSuccess, showInfo, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'workstation' | 'register'>('workstation');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaimForPrint, setSelectedClaimForPrint] = useState<any | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [replacementModalClaim, setReplacementModalClaim] = useState<any | null>(null);
  const [selectedReplacementIMEI, setSelectedReplacementIMEI] = useState<string>('');
  const [replacementSearch, setReplacementSearch] = useState<string>('');

  // ----------------------------------------------------
  // WORKSTATION (SCREENSHOT 1) STATE
  // ----------------------------------------------------
  // 1. Faulty Phone Intake Form
  const [intakeSerial, setIntakeSerial] = useState('');
  const [intakeModel, setIntakeModel] = useState('');
  const [intakeFaultDesc, setIntakeFaultDesc] = useState('');
  const [intakeDate, setIntakeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [intakeCondition, setIntakeCondition] = useState('DOA / Used Defective');

  // Auto-detect model when Serial/IMEI is typed
  const handleIntakeSerialChange = (val: string) => {
    setIntakeSerial(val);
    const found = imeis.find(i => i.imei1 === val.trim() || i.imei2 === val.trim());
    if (found) {
      setIntakeModel(`${found.brandName} ${found.productName} (${found.variantDesc})`);
    }
  };

  const handleCreateFaultyPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!intakeSerial.trim()) {
      showError('অনুগ্রহ করে সিরিয়াল বা আইএমইআই নম্বর প্রদান করুন');
      return;
    }

    const defaultCust = customers[0];
    const res = addWarrantyClaim({
      date: intakeDate,
      customerId: defaultCust?.id || 'CUST-001',
      customerName: defaultCust ? `${defaultCust.ownerName} (${defaultCust.shopName})` : 'Walk-in Client',
      customerPhone: defaultCust?.mobile || '01700000000',
      brandName: intakeModel.split(' ')[0] || 'Generic',
      productModel: intakeModel || 'DOA Handset',
      imei: intakeSerial.trim(),
      problemDescription: intakeFaultDesc || 'Device DOA / Defective Fault',
      physicalCondition: intakeCondition,
      accessoriesIncluded: 'Handset Only',
      serviceCenterName: 'Central RMA / DOA Bay',
      status: 'Received',
      repairCostCustomer: 0,
      remarks: `Intake from DOA & Defective Console [${intakeCondition}]`
    });

    if (res.success) {
      showSuccess(`ত্রুটিযুক্ত ফোন (${intakeSerial}) সফলভাবে ইনটেক সিস্টেমে গ্রহণ করা হয়েছে! RMA: ${res.rmaNumber || 'RMA'}`);
      setIntakeSerial('');
      setIntakeModel('');
      setIntakeFaultDesc('');
    }
  };

  // 2. Replacement IMEI Allotment Table
  const [allotmentItems, setAllotmentItems] = useState([
    { id: '1', originalImei: '864201948201941', replacementImei: '864201948201999', model: 'MOA', status: 'Allocated', date: '03/15/2026' },
    { id: '2', originalImei: '864201948201942', replacementImei: '864201948201998', model: 'MOA', status: 'Pending', date: '03/15/2026' },
    { id: '3', originalImei: '864201948201943', replacementImei: '864201948201997', model: 'MOA', status: 'Allocated', date: '03/15/2026' },
    { id: '4', originalImei: '864201948201944', replacementImei: '864201948201996', model: 'MOA', status: 'Allocated', date: '03/15/2026' },
    { id: '5', originalImei: '864201948201945', replacementImei: '864201948201995', model: 'MOA', status: 'Pending', date: '03/15/2026' }
  ]);

  const handleSaveAllotments = () => {
    showSuccess('রিপ্লেসমেন্ট আইএমইআই বরাদ্দ তালিকা সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // 3. Vendor Return Claim Process
  const [vendorRmaNo, setVendorRmaNo] = useState('RMA-VN-9082');
  const [vendorName, setVendorName] = useState(suppliers[0]?.name || 'Samsung Electronics BD');
  const [vendorClaimStatus, setVendorClaimStatus] = useState('Pending / Approved');
  const [shippingCarrier, setShippingCarrier] = useState('Sundarban Courier Service');
  const [trackingId, setTrackingId] = useState('SC-DH-84920');

  const handleClaimReturn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    showSuccess(`ভেন্ডর রিটার্ন ক্লেইম (${vendorRmaNo}) কুরিয়ারে প্রেরণের জন্য বুক করা হয়েছে!`);
  };

  // 4. Quality Control Status Tracker
  const [qcStep, setQcStep] = useState<number>(3); // 1: Received, 2: Testing, 3: Repair/Refurbish, 4: Final QC, 5: Ready
  const [qcPassed, setQcPassed] = useState<boolean>(true);

  const qcSteps = [
    { step: 1, label: 'Received' },
    { step: 2, label: 'Testing' },
    { step: 3, label: 'Repair / Refurbish' },
    { step: 4, label: 'Final QC Check: Passed / Failed' },
    { step: 5, label: 'Ready for Stock / Recycle' }
  ];

  const handleAdvanceQc = () => {
    if (qcStep >= 5) {
      setQcStep(1);
      showInfo('QC ট্র্যাকার প্রথম ধাপে রিসেট করা হয়েছে');
    } else {
      setQcStep(prev => prev + 1);
      showSuccess(`কোয়ালিটি কন্ট্রোল স্ট্যাটাস আপডেট: ধাপ ${qcStep + 1} সফল!`);
    }
  };

  // ----------------------------------------------------
  // FILTERED CLAIMS (REGISTER MODE)
  // ----------------------------------------------------
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
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Dispatched to Service Center':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'In Repair':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Repaired':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Replaced':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Delivered to Customer':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white dark:bg-[#1e293b] p-4 border border-slate-300 dark:border-slate-700 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-sm border border-blue-700">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                DOA & Defective Device Management
              </h1>
              <p className="text-[12.5px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                ত্রুটিপূর্ণ ফোন ইনটেক, রিপ্লেসমেন্ট আইএমইআই অলটমেন্ট, ভেন্ডর আরএমএ ও কিউসি ওয়ার্কফ্লো
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('workstation')}
            className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'workstation'
                ? 'bg-[#1d4ed8] text-white border-blue-700 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>DOA Workstation (Console)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#1d4ed8] text-white border-blue-700 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Full Warranty Register ({warrantyClaims.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          WORKSTATION MODE (SCREENSHOT 1: 2x2 SQUARE GRID)
          ======================================================== */}
      {activeTab === 'workstation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. FAULTY PHONE INTAKE FORM (Top-Left) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Faulty Phone Intake Form
              </h2>

              <form onSubmit={handleCreateFaultyPhone} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Serial Number
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Enter IMEI / Serial..."
                      value={intakeSerial}
                      onChange={(e) => handleIntakeSerialChange(e.target.value)}
                      className="w-full text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Model
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Device model name..."
                      value={intakeModel}
                      onChange={(e) => setIntakeModel(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 pt-1.5">
                    Fault Description
                  </label>
                  <div className="sm:col-span-2">
                    <textarea
                      rows={2}
                      placeholder="Describe hardware/software issue..."
                      value={intakeFaultDesc}
                      onChange={(e) => setIntakeFaultDesc(e.target.value)}
                      className="w-full text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Received Date
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="date"
                      value={intakeDate}
                      onChange={(e) => setIntakeDate(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Condition
                  </label>
                  <div className="sm:col-span-2">
                    <select
                      value={intakeCondition}
                      onChange={(e) => setIntakeCondition(e.target.value)}
                      className="w-full text-sm"
                    >
                      <option value="DOA / Used Defective">DOA / Used Defective</option>
                      <option value="DOA (Dead On Arrival)">DOA (Dead On Arrival)</option>
                      <option value="Minor Scuffs (Liquid Intact)">Minor Scuffs (Liquid Intact)</option>
                      <option value="Display / Board Defect">Display / Board Defect</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIntakeSerial('');
                  setIntakeModel('');
                  setIntakeFaultDesc('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateFaultyPhone()}
                className="btn-primary"
              >
                Create Phone
              </button>
            </div>
          </div>

          {/* 2. REPLACEMENT IMEI ALLOTMENT TABLE (Top-Right) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                Replacement IMEI Allotment Table
              </h2>

              <div className="overflow-x-auto border border-slate-300 dark:border-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-3">Original IMEI</th>
                      <th className="py-2 px-3">Replacement IMEI</th>
                      <th className="py-2 px-3">Device Model</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono text-xs">
                    {allotmentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-2 px-3 font-semibold">{item.originalImei}</td>
                        <td className="py-2 px-3 font-semibold text-blue-600 dark:text-blue-400">{item.replacementImei}</td>
                        <td className="py-2 px-3 font-sans font-medium">{item.model}</td>
                        <td className="py-2 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 font-bold text-[11px] border ${
                              item.status === 'Allocated'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {item.status} / Pending
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handleSaveAllotments}
                className="btn-primary"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* 3. VENDOR RETURN CLAIM PROCESS (Bottom-Left) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Vendor Return Claim Process
              </h2>

              <form onSubmit={handleClaimReturn} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    RMA Number
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={vendorRmaNo}
                      onChange={(e) => setVendorRmaNo(e.target.value)}
                      className="w-full text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Vendor Name
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Claim Status
                  </label>
                  <div className="sm:col-span-2">
                    <select
                      value={vendorClaimStatus}
                      onChange={(e) => setVendorClaimStatus(e.target.value)}
                      className="w-full text-sm font-medium"
                    >
                      <option value="Pending / Approved">Pending / Approved</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Dispatched to Factory">Dispatched to Factory</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Shipping Carrier
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                    Tracking ID
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="w-full text-sm font-mono"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setVendorRmaNo('RMA-' + Math.floor(1000 + Math.random() * 9000));
                  setTrackingId('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleClaimReturn()}
                className="btn-primary"
              >
                Claim Return
              </button>
            </div>
          </div>

          {/* 4. QUALITY CONTROL STATUS TRACKER (Bottom-Right) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Quality Control Status Tracker
              </h2>

              {/* Progress Bar (Matching Screenshot 1) */}
              <div className="mb-6">
                <div className="workflow-progress-track">
                  <div
                    className="workflow-progress-fill"
                    style={{ width: `${(qcStep / 5) * 100}%` }}
                  />
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500 font-bold mt-1">
                  Progress: {Math.round((qcStep / 5) * 100)}%
                </div>
              </div>

              {/* Checkmark List */}
              <div className="space-y-3 font-semibold text-[13.5px]">
                {qcSteps.map((item) => {
                  const isDone = item.step <= qcStep;
                  return (
                    <div key={item.step} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isDone
                            ? 'bg-[#1d4ed8] text-white border-blue-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={isDone ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handleAdvanceQc}
                className="btn-primary"
              >
                <ArrowRight className="w-4 h-4" />
                Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL WARRANTY REGISTER & INWARD CLAIMS TABLE
          ======================================================== */}
      {activeTab === 'register' && (
        <div className="space-y-3">
          {/* Search & Actions Bar */}
          <div className="bg-white dark:bg-[#1e293b] p-3 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="RMA নম্বর, IMEI, কাস্টমার বা ব্র্যান্ড লিখে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs"
              >
                <option value="All">সকল স্ট্যাটাস (All)</option>
                <option value="Received">Received</option>
                <option value="Dispatched to Service Center">At Service Center</option>
                <option value="In Repair">In Repair</option>
                <option value="Repaired">Repaired</option>
                <option value="Replaced">Replaced</option>
                <option value="Delivered to Customer">Delivered</option>
              </select>

              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="btn-secondary text-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>স্ক্যান</span>
              </button>
            </div>
          </div>

          {/* Full Table */}
          <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
            <table className="w-full">
              <thead>
                <tr>
                  <th>তারিখ ও আরএমএ</th>
                  <th>কাস্টমার ও ডিলার</th>
                  <th>হ্যান্ডসেট ও আইএমইআই</th>
                  <th>সমস্যা ও ত্রুটি</th>
                  <th>সার্ভিস সেন্টার</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      কোন ওয়ারেন্টি ক্লেইম পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{claim.rmaNumber}</div>
                        <div className="text-xs text-slate-500 font-mono">{formatDate(claim.date)}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{claim.customerName}</div>
                        <div className="text-xs text-slate-500 font-mono">{claim.customerPhone}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{claim.productModel}</div>
                        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">IMEI: {claim.imei}</div>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">{claim.problemDescription}</div>
                        <div className="text-[11px] text-slate-500">{claim.physicalCondition}</div>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{claim.serviceCenterName}</div>
                        {claim.serviceCenterJobNo && (
                          <div className="text-[11px] font-mono text-slate-500">Job: {claim.serviceCenterJobNo}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge-square ${getStatusBadge(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {claim.status !== 'Replaced' && claim.status !== 'Delivered to Customer' && (
                            <button
                              type="button"
                              onClick={() => {
                                setReplacementModalClaim(claim);
                                setSelectedReplacementIMEI('');
                              }}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] border border-teal-700 cursor-pointer"
                              title="সোয়াপ রিপ্লেসমেন্ট"
                            >
                              Replace
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedClaimForPrint(claim)}
                            className="p-1 text-slate-600 hover:text-slate-900 border border-slate-300 dark:border-slate-700 cursor-pointer"
                            title="জবশিট প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi Barcode Scanner Modal */}
      {showScannerModal && (
        <MultiBarcodeScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="ওয়ারেন্টি ও সার্ভিস বারকোড / IMEI স্ক্যানার"
          subtitle="হ্যান্ডসেটের বারকোড বা IMEI বারকোড গান বা ক্যামেরা দিয়ে স্ক্যান করুন"
          mode="lookup"
          onConfirm={(_records, tokens) => {
            const code = tokens && tokens.length > 0 ? tokens[0] : (_records[0]?.imei1 || '');
            if (code) {
              if (activeTab === 'workstation') {
                handleIntakeSerialChange(code);
              } else {
                setSearchTerm(code);
              }
            }
            setShowScannerModal(false);
          }}
        />
      )}

      {/* Replacement Modal */}
      {replacementModalClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                হ্যান্ডসেট রিপ্লেসমেন্ট (DOA Swap Handset)
              </h3>
              <button
                type="button"
                onClick={() => setReplacementModalClaim(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200">ত্রুটিযুক্ত মূল হ্যান্ডসেট:</div>
              <div className="text-amber-800 dark:text-amber-300 flex justify-between">
                <span>মডেল: {replacementModalClaim.productModel}</span>
                <span className="font-mono font-bold">IMEI: {replacementModalClaim.imei}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইন-স্টক হ্যান্ডসেট নির্বাচন বা নতুন IMEI লিখুন:
              </label>
              <input
                type="text"
                placeholder="নতুন রিপ্লেসমেন্ট IMEI..."
                value={selectedReplacementIMEI}
                onChange={(e) => setSelectedReplacementIMEI(e.target.value.trim())}
                className="w-full text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setReplacementModalClaim(null)}
                className="btn-secondary text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={!selectedReplacementIMEI.trim()}
                onClick={() => {
                  updateWarrantyStatus(replacementModalClaim.id, 'Replaced', {
                    replacementIMEI: selectedReplacementIMEI.trim()
                  });
                  showSuccess(`রিপ্লেসমেন্ট সম্পন্ন! নতুন হ্যান্ডসেট (${selectedReplacementIMEI.trim()}) যুক্ত করা হয়েছে।`);
                  setReplacementModalClaim(null);
                }}
                className="btn-primary text-xs"
              >
                রিপ্লেসমেন্ট কনফার্ম
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
