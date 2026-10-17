import { getLocalDateString } from '../../utils/dateUtils';
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
  X,
  LayoutGrid,
  List,
  FileText,
  Boxes,
  Check,
  ArrowRight
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { CourierPartner, DeliveryStatus } from '../../types/erp';
import { useToast } from '../common/ToastNotificationSystem';

export const DeliveryDispatchView: React.FC = () => {
  const {
    deliveryChallans,
    salesInvoices,
    customers,
    bankAccounts,
    createDeliveryChallan,
    updateDeliveryStatus,
    settleChallanCod,
    settings
  } = useERP();
  const { showSuccess, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'packaging_bay' | 'challan_register'>('packaging_bay');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<any | null>(null);

  // -------------------------------------------------------------------------
  // SCREENSHOT 2: WAREHOUSE DISPATCH & PACKAGING BAY STATE
  // -------------------------------------------------------------------------
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<string>('ORDER H1501');
  const [packingSlipName, setPackingSlipName] = useState('Packing Slip - Standard A4');
  const [previewTemplate, setPreviewTemplate] = useState('Standard Invoice Challan');

  // Shipment tracking orders (matching Screenshot 2 list)
  const initialShipments = [
    { orderNo: 'ORDER H1501', courier: 'DHL', customer: 'Firoza Enterprise', dest: 'Chittagong GEC', date: 'OCT 26, 2026', step: 4 },
    { orderNo: 'ORDER H1331', courier: 'DHL', customer: 'Jamuna Telecom', dest: 'Sylhet Zindabazar', date: 'OCT 26, 2026', step: 3 },
    { orderNo: 'ORDER H1333', courier: 'FedEx', customer: 'Khan Telecom', dest: 'Dhaka Multiplan', date: 'OCT 26, 2026', step: 5 },
    { orderNo: 'ORDER H1304', courier: 'FedEx', customer: 'Rahman Mobile Center', dest: 'Bogra Station', date: 'OCT 26, 2026', step: 2 },
    { orderNo: 'ORDER H1308', courier: 'DHL', customer: 'Metro Phone Shop', dest: 'Khulna Dakbangla', date: 'OCT 26, 2026', step: 3 },
    { orderNo: 'ORDER H1385', courier: 'DHL', customer: 'Apex Telecom Store', dest: 'Rajshahi Shaheb Bazar', date: 'OCT 26, 2026', step: 4 },
    { orderNo: 'ORDER H1505', courier: 'FedEx', customer: 'Star Gadget Hub', dest: 'Comilla Kandirpar', date: 'OCT 26, 2026', step: 1 },
    { orderNo: 'ORDER H1507', courier: 'DHL', customer: 'Elite Cellular BD', dest: 'Barisal Sadar', date: 'OCT 26, 2026', step: 4 },
    { orderNo: 'ORDER H1328', courier: 'FedEx', customer: 'Global Device Point', dest: 'Narayanganj Chasara', date: 'OCT 26, 2026', step: 2 },
    { orderNo: 'ORDER H1509', courier: 'FedEx', customer: 'Touch & Tech Hub', dest: 'Mymensingh Station', date: 'OCT 26, 2026', step: 5 },
    { orderNo: 'ORDER H1538', courier: 'DHL', customer: 'City Mobile Mart', dest: 'Dhaka Bashundhara', date: 'OCT 26, 2026', step: 3 }
  ];

  const [shipments, setShipments] = useState(initialShipments);
  const currentOrder = shipments.find(s => s.orderNo === selectedTrackingOrder) || shipments[0];

  // Dispatch Status Workflow (Matching Screenshot 2 Timeline)
  const [orderStep, setOrderStep] = useState<number>(currentOrder?.step || 4);

  const handleSelectOrder = (s: typeof initialShipments[0]) => {
    setSelectedTrackingOrder(s.orderNo);
    setOrderStep(s.step);
  };

  const handleIntegrateCourier = () => {
    showSuccess('কুরিয়ার গেটওয়ে এপিআই সংযোগ (DHL / FedEx / Steadfast / Sundarban) সক্রিয় আছে!');
  };

  const handlePrintLabels = () => {
    showSuccess(`অর্ডার (${selectedTrackingOrder}) এর জন্য থার্মাল শিপিং লেবেল প্রিন্টার কিউ-তে প্রেরণ করা হয়েছে!`);
  };

  const handleAdvanceStep = () => {
    setOrderStep(prev => (prev >= 5 ? 1 : prev + 1));
    showInfo(`ডিসপ্যাচ স্ট্যাটাস আপডেট করা হয়েছে!`);
  };

  // -------------------------------------------------------------------------
  // CHALLAN FORM STATE
  // -------------------------------------------------------------------------
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
      date: getLocalDateString(),
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

    showSuccess('নতুন ডেলিভারি চালান সফলভাবে তৈরি করা হয়েছে!');
    setConsignmentNo('');
    setIsCOD(false);
    setCodAmount(0);
    setTotalCartons(1);
    setDriverName('');
    setDriverPhone('');
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

  return (
    <div className="space-y-4 w-full">
      {/* Top Banner (Matching Screenshot 2) */}
      <div className="bg-white dark:bg-[#1e293b] p-4 border border-slate-300 dark:border-slate-700 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-sm border border-blue-700">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-widest uppercase text-slate-500">
                ERP LOGISTICS CENTER
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                WAREHOUSE DISPATCH & PACKAGING BAY
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            OCT 26, 2026
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('packaging_bay')}
              className={`px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
                activeTab === 'packaging_bay'
                  ? 'bg-[#1d4ed8] text-white border-blue-700 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              Packaging Bay (Screenshot 2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('challan_register')}
              className={`px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
                activeTab === 'challan_register'
                  ? 'bg-[#1d4ed8] text-white border-blue-700 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              Challan Register ({deliveryChallans.length})
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SCREENSHOT 2: 3-COLUMN WORKSTATION
          ========================================================================= */}
      {activeTab === 'packaging_bay' && (
        <div className="space-y-3">
          {/* Action Header Bar (Search + Action Buttons) */}
          <div className="bg-white dark:bg-[#1e293b] p-3 border border-slate-300 dark:border-slate-700 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs uppercase font-mono tracking-wider"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleIntegrateCourier}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-black tracking-wider uppercase border border-blue-700 shadow-2xs cursor-pointer transition"
              >
                INTEGRATE COURIER
              </button>

              <button
                type="button"
                onClick={handlePrintLabels}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-black tracking-wider uppercase border border-blue-700 shadow-2xs cursor-pointer transition"
              >
                PRINT LABELS
              </button>
            </div>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* COLUMN 1: SHIPMENT TRACKING (Left - 3 Cols) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-4 shadow-2xs flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                SHIPMENT TRACKING
              </h2>

              <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-3 text-[11px]">ORDER NUMBER</th>
                      <th className="py-2 px-3 text-[11px] text-center">COURIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs font-mono">
                    {shipments.map((s) => {
                      const isSelected = selectedTrackingOrder === s.orderNo;
                      return (
                        <tr
                          key={s.orderNo}
                          onClick={() => handleSelectOrder(s)}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <span className={isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}>
                              {s.orderNo}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {s.courier === 'DHL' ? (
                              <span className="inline-block px-2.5 py-0.5 bg-[#ffcc00] text-[#d40511] font-black text-[11px] border border-[#d40511]">
                                DHL
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 bg-[#4d148c] text-white font-black text-[11px] border border-[#ff6600]">
                                FedEx
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMN 2: CARTON PACKING SLIP GENERATOR (Center - 5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                  CARTON PACKING SLIP GENERATOR
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name:</label>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={packingSlipName}
                        onChange={(e) => setPackingSlipName(e.target.value)}
                        className="w-full text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preview:</label>
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <select
                        value={previewTemplate}
                        onChange={(e) => setPreviewTemplate(e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="Standard Invoice Challan">Packing Slip - Standard A4</option>
                        <option value="Thermal Label 4x6">Thermal Carton Label (4x6)</option>
                        <option value="B2B Dispatch Voucher">B2B Dealer Multi-Carton</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => showInfo('প্রিভিউ রিফ্রেশ করা হয়েছে!')}
                        className="px-3 py-1.5 bg-[#2563eb] text-white text-[11px] font-black uppercase border border-blue-700 cursor-pointer"
                      >
                        PREVIEW
                      </button>
                    </div>
                  </div>
                </div>

                {/* Embedded Document Preview Sheet (Matching Screenshot 2 Center Document) */}
                <div className="bg-white text-slate-900 border border-slate-300 p-5 shadow-md font-sans text-xs min-h-[340px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-300 pb-3 mb-3">
                      <div>
                        <div className="font-black text-sm text-slate-900 uppercase">FIROZA ENTERPRISE Logistics</div>
                        <div className="text-[10px] text-slate-500">Dhaka Central Hub • Tel: 01700-000000</div>
                        <div className="text-[10px] text-slate-700 mt-1 font-semibold">
                          Client: {currentOrder.customer}
                        </div>
                        <div className="text-[10px] text-slate-500">{currentOrder.dest}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-base uppercase tracking-tight text-blue-900">
                          Packing Slip
                        </div>
                        <div className="font-mono text-[11px] font-bold text-slate-800">{currentOrder.orderNo}</div>
                        <div className="text-[10px] text-slate-500">{currentOrder.date}</div>
                        <div className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300">
                          Carrier: {currentOrder.courier}
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-left border border-slate-300 text-[11px] mb-3">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr>
                          <th className="py-1 px-2 border border-slate-300">Item / Model</th>
                          <th className="py-1 px-2 border border-slate-300 text-center">Qty</th>
                          <th className="py-1 px-2 border border-slate-300 text-center">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-1 px-2 border border-slate-300 font-medium">Samsung Galaxy A15 (8/128GB)</td>
                          <td className="py-1 px-2 border border-slate-300 text-center font-bold">10</td>
                          <td className="py-1 px-2 border border-slate-300 text-center">Pcs</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 border border-slate-300 font-medium">Redmi Note 13 Pro (8/256GB)</td>
                          <td className="py-1 px-2 border border-slate-300 text-center font-bold">5</td>
                          <td className="py-1 px-2 border border-slate-300 text-center">Pcs</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 border border-slate-300 font-medium">Standard Carton Packaging Sealed</td>
                          <td className="py-1 px-2 border border-slate-300 text-center font-bold">1</td>
                          <td className="py-1 px-2 border border-slate-300 text-center">Box</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                    <div>
                      <span>Checked by QC Officer • Seal Intact</span>
                      <div className="font-mono text-[9px] text-slate-400 mt-0.5">SCAN-BARCODE-VERIFIED</div>
                    </div>
                    <div className="text-right font-bold text-slate-800">
                      Total Items: 15 Pcs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: DISPATCH STATUS WORKFLOW TIMELINE (Right - 4 Cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                  DISPATCH STATUS WORKFLOW TIMELINE
                </h2>

                <div className="space-y-4">
                  {/* Step 1: Order Received */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>Order Received</span>
                      <span className="text-blue-600 font-mono">{orderStep >= 1 ? '100%' : '0%'}</span>
                    </div>
                    <div className="workflow-progress-track">
                      <div
                        className="workflow-progress-fill"
                        style={{ width: orderStep >= 1 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Step 2: Picked */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>Picked</span>
                      <span className="text-blue-600 font-mono">{orderStep >= 2 ? '100%' : '0%'}</span>
                    </div>
                    <div className="workflow-progress-track">
                      <div
                        className="workflow-progress-fill"
                        style={{ width: orderStep >= 2 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Step 3: Packed */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>Packed</span>
                      <span className="text-blue-600 font-mono">{orderStep >= 3 ? '100%' : '0%'}</span>
                    </div>
                    <div className="workflow-progress-track">
                      <div
                        className="workflow-progress-fill"
                        style={{ width: orderStep >= 3 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Step 4: Labelled */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>Labelled</span>
                      <span className="text-blue-600 font-mono">{orderStep >= 4 ? '100%' : '0%'}</span>
                    </div>
                    <div className="workflow-progress-track">
                      <div
                        className="workflow-progress-fill"
                        style={{ width: orderStep >= 4 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Step 5: Shipped */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>Shipped</span>
                      <span className="text-blue-600 font-mono">{orderStep >= 5 ? '100%' : '0%'}</span>
                    </div>
                    <div className="workflow-progress-track">
                      <div
                        className="workflow-progress-fill"
                        style={{ width: orderStep >= 5 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  type="button"
                  onClick={handleAdvanceStep}
                  className="btn-primary text-xs w-full"
                >
                  <ArrowRight className="w-4 h-4" />
                  Advance Status Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL CHALLAN REGISTER TABLE
          ========================================================================= */}
      {activeTab === 'challan_register' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#1e293b] p-3 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="চালান নম্বর, ইনভয়েস, কাস্টমার বা ট্র্যাকিং আইডি..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                নতুন চালান তৈরি
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
            <table className="w-full">
              <thead>
                <tr>
                  <th>চালান ও তারিখ</th>
                  <th>ইনভয়েস নং</th>
                  <th>কাস্টমার ও গন্তব্য</th>
                  <th>কুরিয়ার পার্টনার</th>
                  <th>কার্টন ও ডিভাইস</th>
                  <th>COD এমাউন্ট</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredChallans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      কোন চালান রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredChallans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{ch.challanNo}</div>
                        <div className="text-xs text-slate-500 font-mono">{formatDate(ch.date)}</div>
                      </td>
                      <td className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {ch.invoiceNo}
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{ch.customerName}</div>
                        <div className="text-xs text-slate-500">{ch.deliveryAddress}</div>
                      </td>
                      <td>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ch.courierPartner}</span>
                        {ch.consignmentNo && (
                          <div className="text-xs font-mono text-slate-500">CN: {ch.consignmentNo}</div>
                        )}
                      </td>
                      <td className="font-mono text-center">
                        <span className="font-bold">{ch.totalCartons} Carton</span>
                        <div className="text-xs text-slate-500">{ch.imeiList?.length || 0} Devices</div>
                      </td>
                      <td className="font-mono font-bold">
                        {ch.isCOD ? formatBDT(ch.codAmount) : 'Paid / Non-COD'}
                      </td>
                      <td>
                        <span className="badge-square bg-blue-100 text-blue-900 border-blue-300">
                          {ch.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Challan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নতুন ডেলিভারি চালান ও কুরিয়ার পার্সেল
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ইনভয়েস নির্বাচন করুন:
                </label>
                <select
                  value={selectedInvoiceNo}
                  onChange={(e) => setSelectedInvoiceNo(e.target.value)}
                  className="w-full text-xs font-mono"
                >
                  {salesInvoices.map(inv => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} - {inv.customerName} (Due: ৳{inv.dueAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কুরিয়ার পার্টনার:
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value as CourierPartner)}
                  className="w-full text-xs"
                >
                  <option value="Sundarban Courier">Sundarban Courier</option>
                  <option value="SA Paribahan">SA Paribahan</option>
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="Own Delivery Van">নিজস্ব ডেলিভারি ভ্যান</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কনসাইনমেন্ট / ট্র্যাকিং নম্বর:
                </label>
                <input
                  type="text"
                  placeholder="Ex: SC-89028..."
                  value={consignmentNo}
                  onChange={(e) => setConsignmentNo(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  চালান ইস্যু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
