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
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  CreditCard,
  Layers,
  ChevronRight,
  Filter,
  Calculator,
  Percent,
  Smartphone,
  Receipt,
  ArrowUpRight,
  Calendar,
  X,
  Wallet,
  ShieldCheck,
  Zap,
  Building2
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import type { Salesman, CommissionDisbursement } from '../../types/erp';

export const SalesmenView: React.FC = () => {
  const {
    salesmen,
    salesInvoices,
    customers,
    bankAccounts,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    commissionDisbursements = [],
    disburseSalesmanCommission,
    settings
  } = useERP();

  const isBn = settings.language === 'bn';

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'cockpit' | 'commission-ledger' | 'policy-simulator'>('cockpit');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave' | 'Inactive'>('All');
  const [modelFilter, setModelFilter] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);
  const [statementSalesman, setStatementSalesman] = useState<Salesman | null>(null);
  const [payoutSalesman, setPayoutSalesman] = useState<Salesman | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    assignedArea: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 30000,
    monthlyTarget: 4000000,
    monthlyUnitTarget: 150,
    monthlyCollectionTarget: 3000000,
    commissionType: 'Percentage of Sales' as Salesman['commissionType'],
    commissionRate: 1.0,
    collectionCommissionRate: 0.5,
    status: 'Active' as Salesman['status']
  });

  // Payout Form State
  const [payoutForm, setPayoutForm] = useState({
    month: '2026-10',
    bonusAmount: 0,
    deductionAmount: 0,
    paymentMethod: 'Cash' as 'Cash' | 'Bank Transfer' | 'bKash',
    bankAccountId: bankAccounts[0]?.id || '',
    referenceNo: '',
    notes: ''
  });

  // Simulator State
  const [simSalesmanId, setSimSalesmanId] = useState(salesmen[0]?.id || '');
  const [simSalesAmount, setSimSalesAmount] = useState(3500000);
  const [simUnitsSold, setSimUnitsSold] = useState(120);
  const [simGrossMarginPct, setSimGrossMarginPct] = useState(6.5);
  const [simCollectionAmount, setSimCollectionAmount] = useState(2800000);

  const openAddModal = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      assignedArea: '',
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: 30000,
      monthlyTarget: 4000000,
      monthlyUnitTarget: 150,
      monthlyCollectionTarget: 3000000,
      commissionType: 'Percentage of Sales',
      commissionRate: 1.0,
      collectionCommissionRate: 0.5,
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const openEditModal = (sm: Salesman) => {
    setEditingSalesman(sm);
    setFormData({
      name: sm.name,
      mobile: sm.mobile,
      email: sm.email || '',
      address: sm.address || '',
      assignedArea: sm.assignedArea,
      joiningDate: sm.joiningDate || new Date().toISOString().split('T')[0],
      basicSalary: sm.basicSalary || 0,
      monthlyTarget: sm.monthlyTarget || 0,
      monthlyUnitTarget: sm.monthlyUnitTarget || 100,
      monthlyCollectionTarget: sm.monthlyCollectionTarget || sm.monthlyTarget * 0.8,
      commissionType: sm.commissionType || 'Percentage of Sales',
      commissionRate: sm.commissionRate || 1.0,
      collectionCommissionRate: sm.collectionCommissionRate || 0.5,
      status: sm.status || 'Active'
    });
  };

  const handleSaveSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.assignedArea.trim()) {
      alert(isBn ? 'নাম, মোবাইল এবং দায়িত্বপ্রাপ্ত এরিয়া আবশ্যক!' : 'Name, Mobile, and Area are required!');
      return;
    }

    if (editingSalesman) {
      updateSalesman(editingSalesman.id, {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        assignedArea: formData.assignedArea,
        joiningDate: formData.joiningDate,
        basicSalary: Number(formData.basicSalary),
        monthlyTarget: Number(formData.monthlyTarget),
        monthlyUnitTarget: Number(formData.monthlyUnitTarget),
        monthlyCollectionTarget: Number(formData.monthlyCollectionTarget),
        commissionType: formData.commissionType,
        commissionRate: Number(formData.commissionRate),
        collectionCommissionRate: Number(formData.collectionCommissionRate),
        status: formData.status
      });
      setEditingSalesman(null);
      setNotification(isBn ? 'সেলস অফিসার ও টার্গেট পলিসি সফলভাবে আপডেট করা হয়েছে!' : 'Sales officer and target policy updated successfully!');
    } else {
      addSalesman({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        assignedArea: formData.assignedArea,
        joiningDate: formData.joiningDate,
        basicSalary: Number(formData.basicSalary),
        monthlyTarget: Number(formData.monthlyTarget),
        monthlyUnitTarget: Number(formData.monthlyUnitTarget),
        monthlyCollectionTarget: Number(formData.monthlyCollectionTarget),
        commissionType: formData.commissionType,
        commissionRate: Number(formData.commissionRate),
        collectionCommissionRate: Number(formData.collectionCommissionRate),
        currentMonthSales: 0,
        currentMonthCollection: 0,
        currentMonthUnits: 0,
        assignedCustomerCount: 0,
        status: formData.status,
        paidCommissionTotal: 0
      });
      setShowAddModal(false);
      setNotification(isBn ? 'নতুন সেলস অফিসার ও টার্গেট কনফিগারেশন যোগ করা হয়েছে!' : 'New sales officer added successfully!');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to calculate total earned commission for a salesman
  const calculateSalesmanCommission = (sm: Salesman) => {
    // 1. Sales Invoices Commission
    const smInvoices = salesInvoices.filter(i => i.salesmanId === sm.id && i.status !== 'Cancelled');
    const salesCommission = smInvoices.reduce((acc, i) => acc + (i.commissionEarned || 0), 0);

    // 2. Collection Incentive
    const collectionIncentiveRate = sm.collectionCommissionRate ?? 0.5;
    const collectionCommission = ((sm.currentMonthCollection || 0) * collectionIncentiveRate) / 100;

    // 3. Target Bonus (e.g. 5,000 BDT flat bonus if target achieved >= 100%)
    const achievementPercent = sm.monthlyTarget > 0 ? (sm.currentMonthSales / sm.monthlyTarget) * 100 : 0;
    const targetBonus = achievementPercent >= 100 ? (achievementPercent >= 120 ? 10000 : 5000) : 0;

    const grossCommission = salesCommission + collectionCommission + targetBonus;
    const paidCommission = sm.paidCommissionTotal || 0;
    const dueCommission = Math.max(0, grossCommission - paidCommission);

    return {
      invoiceCount: smInvoices.length,
      salesCommission,
      collectionCommission,
      targetBonus,
      grossCommission,
      paidCommission,
      dueCommission
    };
  };

  // Process Commission Payout
  const handleExecutePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutSalesman) return;

    const calc = calculateSalesmanCommission(payoutSalesman);
    const bonus = Number(payoutForm.bonusAmount) || 0;
    const deduction = Number(payoutForm.deductionAmount) || 0;
    const netPayable = Math.max(0, calc.dueCommission + bonus - deduction);

    if (netPayable <= 0) {
      alert(isBn ? 'পরিশোধযোগ্য কমিশনের পরিমাণ শূন্য!' : 'Net payable commission is 0!');
      return;
    }

    const res = disburseSalesmanCommission({
      salesmanId: payoutSalesman.id,
      salesmanName: payoutSalesman.name,
      month: payoutForm.month,
      date: new Date().toISOString().split('T')[0],
      salesAmount: payoutSalesman.currentMonthSales,
      collectionAmount: payoutSalesman.currentMonthCollection,
      salesCommission: calc.salesCommission,
      collectionCommission: calc.collectionCommission,
      bonusAmount: bonus + calc.targetBonus,
      deductionAmount: deduction,
      netPayable,
      paymentMethod: payoutForm.paymentMethod,
      bankAccountId: payoutForm.paymentMethod === 'Bank Transfer' ? payoutForm.bankAccountId : undefined,
      referenceNo: payoutForm.referenceNo || undefined,
      notes: payoutForm.notes || `Monthly commission payout for ${payoutForm.month}`
    });

    if (res.success) {
      setPayoutSalesman(null);
      setNotification(isBn
        ? `কমিশন সফলভাবে পরিশোধ করা হয়েছে! ভাউচার #${res.disbursementNo}`
        : `Commission disbursed successfully! Voucher #${res.disbursementNo}`);
      setTimeout(() => setNotification(null), 4500);
    }
  };

  // Filter Salesmen
  const filteredSalesmen = salesmen.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignedArea.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesModel = modelFilter === 'All' || s.commissionType === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

  // KPI Totals across all salesmen
  const totalTargetSales = salesmen.reduce((acc, s) => acc + (s.monthlyTarget || 0), 0);
  const totalActualSales = salesmen.reduce((acc, s) => acc + (s.currentMonthSales || 0), 0);
  const totalTargetUnits = salesmen.reduce((acc, s) => acc + (s.monthlyUnitTarget || 100), 0);
  const totalActualUnits = salesmen.reduce((acc, s) => acc + (s.currentMonthUnits || 0), 0);
  const totalTargetCollections = salesmen.reduce((acc, s) => acc + (s.monthlyCollectionTarget || s.monthlyTarget * 0.8), 0);
  const totalActualCollections = salesmen.reduce((acc, s) => acc + (s.currentMonthCollection || 0), 0);

  const totalCommissionAccrued = salesmen.reduce((acc, s) => acc + calculateSalesmanCommission(s).grossCommission, 0);
  const totalCommissionPaid = salesmen.reduce((acc, s) => acc + (s.paidCommissionTotal || 0), 0);
  const totalCommissionPending = Math.max(0, totalCommissionAccrued - totalCommissionPaid);

  const overallSalesPercent = totalTargetSales > 0 ? Math.round((totalActualSales / totalTargetSales) * 100) : 0;
  const overallUnitsPercent = totalTargetUnits > 0 ? Math.round((totalActualUnits / totalTargetUnits) * 100) : 0;
  const overallCollectionPercent = totalTargetCollections > 0 ? Math.round((totalActualCollections / totalTargetCollections) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isBn ? 'সেলসম্যান সেলস টার্গেট ও কমিশন ম্যানেজমেন্ট' : 'Field Sales Officers, Target & Commission Hub'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? 'মাসিক সেলস টার্নওভার টার্গেট, হ্যান্ডসেট ইউনিট কোটা, বকেয়া কালেকশন ইনসেন্টিভ ও পে-আউট লেজার'
                  : 'Manage monthly sales targets, handset unit quotas, due collection incentives & commission disbursements'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন সেলস অফিসার যোগ করুন' : '+ Add Sales Officer'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Target & Commission KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sales Turnover Target */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>{isBn ? 'মাসিক সেলস টার্নওভার' : 'Sales Turnover Target'}</span>
            </span>
            <span className={`font-black text-xs px-2 py-0.5 rounded-full ${overallSalesPercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
              {overallSalesPercent}%
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{formatBDT(totalActualSales)}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'টার্গেট:' : 'Target:'} <b className="text-slate-700">{formatBDT(totalTargetSales)}</b>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallSalesPercent >= 100 ? 'bg-emerald-500' : overallSalesPercent >= 75 ? 'bg-blue-600' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, overallSalesPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Unit Volume Target */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>{isBn ? 'হ্যান্ডসেট বিক্রয় সংখ্যা' : 'Handset Unit Volume'}</span>
            </span>
            <span className={`font-black text-xs px-2 py-0.5 rounded-full ${overallUnitsPercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
              {overallUnitsPercent}%
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{totalActualUnits} <span className="text-xs font-semibold text-slate-500">Pcs</span></div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'টার্গেট:' : 'Target:'} <b className="text-slate-700">{totalTargetUnits} Pcs</b>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallUnitsPercent >= 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
              style={{ width: `${Math.min(100, overallUnitsPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Due Collection Target */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'ফিল্ড বকেয়া কালেকশন' : 'Field Due Collection'}</span>
            </span>
            <span className={`font-black text-xs px-2 py-0.5 rounded-full ${overallCollectionPercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {overallCollectionPercent}%
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-700">{formatBDT(totalActualCollections)}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'কালেকশন কোটা:' : 'Quota:'} <b className="text-slate-700">{formatBDT(totalTargetCollections)}</b>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallCollectionPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Accrued vs Paid Commission */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isBn ? 'মোট অর্জিত কমিশন' : 'Total Accrued Commission'}</span>
            </span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              {isBn ? 'পে-আউট রেডি' : 'Payout Ready'}
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-blue-700">{formatBDT(totalCommissionAccrued)}</div>
            <div className="flex justify-between text-[11px] font-medium pt-0.5">
              <span className="text-emerald-700">পরিশোধিত: <b>{formatBDT(totalCommissionPaid)}</b></span>
              <span className="text-rose-600">বকেয়া: <b>{formatBDT(totalCommissionPending)}</b></span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500"
              style={{ width: totalCommissionAccrued > 0 ? `${(totalCommissionPaid / totalCommissionAccrued) * 100}%` : '0%' }}
            />
            <div
              className="h-full bg-rose-400"
              style={{ width: totalCommissionAccrued > 0 ? `${(totalCommissionPending / totalCommissionAccrued) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'cockpit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{isBn ? 'সেলস অফিসার ও টার্গেট ককপিট' : 'Officers & Target Cockpit'}</span>
        </button>

        <button
          onClick={() => setActiveTab('commission-ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'commission-ledger'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{isBn ? 'কমিশন হিসাব ও পে-আউট লেজার' : 'Commission Calculation & Payout Ledger'}</span>
        </button>

        <button
          onClick={() => setActiveTab('policy-simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'policy-simulator'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{isBn ? 'কমিশন পলিসি ও লাইভ সিমুলেটর' : 'Commission Policy & Simulator'}</span>
        </button>
      </div>

      {/* TAB 1: COCKPIT VIEW */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Search & Filters FilterBar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBn ? 'নাম, আইডি কোড অথবা এরিয়া খুঁজুন...' : 'Search officer name, code, or territory...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 pl-2">স্ট্যাটাস:</span>
                {(['All', 'Active', 'On Leave', 'Inactive'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      statusFilter === st ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select
                value={modelFilter}
                onChange={e => setModelFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="All">{isBn ? 'সকল কমিশন মডেল' : 'All Commission Models'}</option>
                <option value="Percentage of Sales">Percentage of Sales</option>
                <option value="Percentage of Gross Profit">Percentage of Gross Profit</option>
                <option value="Fixed Per Unit">Fixed Per Unit</option>
                <option value="Target Based">Target Based</option>
              </select>
            </div>
          </div>

          {/* Officers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalesmen.map(sm => {
              const calc = calculateSalesmanCommission(sm);
              const salesPct = sm.monthlyTarget > 0 ? Math.round((sm.currentMonthSales / sm.monthlyTarget) * 100) : 0;
              const unitTarget = sm.monthlyUnitTarget || 100;
              const unitsPct = Math.round(((sm.currentMonthUnits || 0) / unitTarget) * 100);
              const colTarget = sm.monthlyCollectionTarget || sm.monthlyTarget * 0.8;
              const colPct = Math.round(((sm.currentMonthCollection || 0) / colTarget) * 100);

              return (
                <div
                  key={sm.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Code, Name, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-blue-700 font-black bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            {sm.employeeCode}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            sm.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sm.status === 'On Leave'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sm.status}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-slate-900 mt-1">{sm.name}</h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{sm.assignedArea}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sm.mobile}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Basic Salary</div>
                        <div className="text-xs font-black text-slate-800">{formatBDT(sm.basicSalary)}</div>
                      </div>
                    </div>

                    {/* Target Achievement Dashboard */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs">
                      {/* Metric 1: Sales Turnover Target */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                            <span>সেলস ভলিউম:</span>
                          </span>
                          <span className={`font-black ${salesPct >= 100 ? 'text-emerald-700' : salesPct >= 75 ? 'text-blue-700' : 'text-amber-700'}`}>
                            {salesPct}% ({formatBDT(sm.currentMonthSales)} / {formatBDT(sm.monthlyTarget)})
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${salesPct >= 100 ? 'bg-emerald-600' : salesPct >= 75 ? 'bg-blue-600' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, salesPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Handset Units Target */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                            <span>হ্যান্ডসেট ইউনিট:</span>
                          </span>
                          <span className="font-black text-purple-800">
                            {unitsPct}% ({sm.currentMonthUnits || 0} / {unitTarget} Pcs)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, unitsPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Collection Target */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>বকেয়া কালেকশন:</span>
                          </span>
                          <span className="font-black text-emerald-800">
                            {colPct}% ({formatBDT(sm.currentMonthCollection)} / {formatBDT(colTarget)})
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, colPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Commission Model & Current Accrued Breakdown */}
                    <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">কমিশন পলিসি:</span>
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                          {sm.commissionType === 'Fixed Per Unit'
                            ? `৳ ${sm.commissionRate} / Unit`
                            : `${sm.commissionRate}% (${sm.commissionType.replace('Percentage of ', '')})`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">কালেকশন ইনসেন্টিভ:</span>
                        <span className="font-bold text-emerald-700">
                          {sm.collectionCommissionRate ?? 0.5}% of Cash Collected
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">অর্জিত মোট কমিশন</div>
                          <div className="text-base font-black text-blue-700">{formatBDT(calc.grossCommission)}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">বকেয়া পে-আউট</div>
                          <div className={`text-sm font-black ${calc.dueCommission > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatBDT(calc.dueCommission)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setStatementSalesman(sm)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="ইনভয়েস ও কালেকশন বিবরণী দেখুন"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isBn ? 'বিবরণী' : 'Statement'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPayoutSalesman(sm);
                          setPayoutForm(prev => ({
                            ...prev,
                            month: '2026-10',
                            bonusAmount: 0,
                            deductionAmount: 0,
                            notes: `October 2026 commission payout for ${sm.name}`
                          }));
                        }}
                        disabled={calc.dueCommission <= 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          calc.dueCommission > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{isBn ? 'পে-আউট' : 'Pay'}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(sm)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                        title="টার্গেট ও পলিসি এডিট করুন"
                      >
                        {isBn ? 'টার্গেট' : 'Edit'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${sm.name}?`)) {
                            deleteSalesman(sm.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSION CALCULATION & PAYOUT LEDGER */}
      {activeTab === 'commission-ledger' && (
        <div className="space-y-6">
          {/* Summary Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {isBn ? 'সেলস অফিসার কমিশন হিসাব ও পে-আউট রেজিস্টার (অক্টোবর ২০২৬)' : 'Commission Accrual & Payout Register (October 2026)'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isBn
                    ? 'সেলস ইনভয়েস কমিশন, কালেকশন ইনসেন্টিভ, টার্গেট বোনাস ও নেট পরিশোধযোগ্য বকেয়া'
                    : 'Invoice commissions, collection incentives, target bonus and net payable balance'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  {salesmen.length} {isBn ? 'জন সেলস অফিসার' : 'Officers Registered'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3.5 pl-5">সেলস অফিসার</th>
                    <th className="p-3.5">কমিশন পলিসি</th>
                    <th className="p-3.5 text-right">সেলস টার্নওভার</th>
                    <th className="p-3.5 text-right">সেলস কমিশন</th>
                    <th className="p-3.5 text-right">কালেকশন ইনসেন্টিভ</th>
                    <th className="p-3.5 text-right">টার্গেট বোনাস</th>
                    <th className="p-3.5 text-right font-black text-slate-900">মোট অর্জিত</th>
                    <th className="p-3.5 text-right text-emerald-700">পরিশোধিত</th>
                    <th className="p-3.5 text-right font-black text-rose-600">বকেয়া পে-আউট</th>
                    <th className="p-3.5 pr-5 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {salesmen.map(sm => {
                    const calc = calculateSalesmanCommission(sm);

                    return (
                      <tr key={sm.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5 pl-5">
                          <div className="font-extrabold text-slate-900">{sm.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{sm.employeeCode} • {sm.assignedArea.split(',')[0]}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {sm.commissionType === 'Fixed Per Unit'
                              ? `৳ ${sm.commissionRate}/Unit`
                              : `${sm.commissionRate}%`}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          {formatBDT(sm.currentMonthSales)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-blue-700 font-bold">
                          {formatBDT(calc.salesCommission)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-emerald-700 font-bold">
                          {formatBDT(calc.collectionCommission)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-amber-700 font-bold">
                          {calc.targetBonus > 0 ? formatBDT(calc.targetBonus) : '-'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900">
                          {formatBDT(calc.grossCommission)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-emerald-700 font-bold">
                          {formatBDT(calc.paidCommission)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-rose-600">
                          {formatBDT(calc.dueCommission)}
                        </td>
                        <td className="p-3.5 pr-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setPayoutSalesman(sm);
                                setPayoutForm(prev => ({
                                  ...prev,
                                  month: '2026-10',
                                  bonusAmount: 0,
                                  deductionAmount: 0,
                                  notes: `Commission payout for ${sm.name}`
                                }));
                              }}
                              disabled={calc.dueCommission <= 0}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                calc.dueCommission > 0
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              পে-আউট
                            </button>

                            <button
                              onClick={() => setStatementSalesman(sm)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                              title="বিবরণী স্লিপ দেখুন"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Disbursement Vouchers */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-slate-900 text-sm">
                  {isBn ? 'পরিশোধিত কমিশন ভাউচার হিস্ট্রি (Disbursement Vouchers)' : 'Commission Disbursement Payment Vouchers'}
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {commissionDisbursements.length} {isBn ? 'টি ভাউচার সংরক্ষিত' : 'Vouchers on record'}
              </span>
            </div>

            {commissionDisbursements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                কোনো কমিশন পে-আউট ভাউচার পাওয়া যায়নি।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {commissionDisbursements.map(disb => (
                  <div key={disb.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {disb.disbursementNo}
                        </span>
                        <span className="font-black text-slate-900">{disb.salesmanName}</span>
                        <span className="text-[11px] text-slate-500">({disb.month})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        তারিখ: {disb.date} • পেমেন্ট মেথড: <b className="text-slate-700">{disb.paymentMethod}</b> {disb.referenceNo && `• Ref: ${disb.referenceNo}`}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-emerald-700 font-mono">{formatBDT(disb.netPayable)}</div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {disb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: POLICY & INCENTIVE SIMULATOR */}
      {activeTab === 'policy-simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Commission Rules Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Percent className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {isBn ? 'টেলিকর্প ইআরপি কমিশন পলিসি ফ্রেমওয়ার্ক' : 'TeleCorp Commission Policy Framework'}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Policy 1 */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1">
                  <div className="font-black text-blue-900 flex items-center justify-between">
                    <span>১. Percentage of Sales (টার্নওভার ভিত্তিক)</span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">সাধারণত ১.০% - ২.০%</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    ইনভয়েসের মোট মূল্যের (Grand Total) ওপর সরাসরি নির্দিষ্ট শতকরা হারে কমিশন হিসাব করা হয়। পাইকারি ডিস্ট্রিবিউশনে দ্রুত ভলিউম বাড়ানোর জন্য উপযোগী।
                  </p>
                </div>

                {/* Policy 2 */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <div className="font-black text-emerald-900 flex items-center justify-between">
                    <span>২. Percentage of Gross Profit (মোট মুনাফা ভিত্তিক)</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">সাধারণত ৫.০% - ৮.০%</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    বিক্রয় মূল্য ও পণ্যের কেনা মূল্যের পার্থক্যের (Gross Profit Margin) ওপর কমিশন দেওয়া হয়। এতে সেলসম্যান ডিসকাউন্ট কমিয়ে বেশি লাভে বিক্রয় করতে উৎসাহিত হয়।
                  </p>
                </div>

                {/* Policy 3 */}
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-1">
                  <div className="font-black text-purple-900 flex items-center justify-between">
                    <span>৩. Fixed Per Unit (হ্যান্ডসেট প্রতি নির্দিষ্ট ফি)</span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">৳ ২০০ - ৳ ৫০০ / Unit</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    প্রতিটি সফলভাবে বিক্রিত মোবাইল হ্যান্ডসেটের জন্য নির্ধারিত ফ্ল্যাট রেটে কমিশন দেওয়া হয়। ব্র্যান্ড প্রোমোটার ও হাই-এন্ড ফোনের ক্ষেত্রে কার্যকর।
                  </p>
                </div>

                {/* Policy 4 */}
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <div className="font-black text-amber-900 flex items-center justify-between">
                    <span>৪. Target Based Tiered Slab (টার্গেট এক্সিলারেটর)</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">স্ল্যাব অনুযায়ী বুস্টার</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    টার্গেট অর্জনের হারের ওপর কমিশন রেট স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়:
                    <br />• &lt; ৭৫% অর্জন: ৫০% রেট (পেনাল্টি মোড)
                    <br />• ৭৫% - ৯৯% অর্জন: স্ট্যান্ডার্ড বেস রেট
                    <br />• ১০০% - ১১৯% অর্জন: ১২০% এক্সিলারেটেড রেট + ৫,০০০ ৳ বোনাস
                    <br />• ≥ ১২০% ওভারঅ্যাচিভমেন্ট: ১৫০% সুপার রেট + ১০,০০০ ৳ বোনাস!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Commission Simulator */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {isBn ? 'লাইভ কমিশন ও ইনসেন্টিভ সিমুলেটর' : 'Interactive Commission Calculator Simulator'}
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সেলস অফিসার নির্বাচন করুন</label>
                  <select
                    value={simSalesmanId}
                    onChange={e => setSimSalesmanId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {salesmen.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.commissionType} @ {s.commissionRate}{s.commissionType === 'Fixed Per Unit' ? '৳' : '%'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">আনুমানিক সেলস পরিমাণ (৳)</label>
                    <input
                      type="number"
                      value={simSalesAmount}
                      onChange={e => setSimSalesAmount(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">হ্যান্ডসেট সংখ্যা (Units)</label>
                    <input
                      type="number"
                      value={simUnitsSold}
                      onChange={e => setSimUnitsSold(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোট মুনাফা মার্জিন (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={simGrossMarginPct}
                      onChange={e => setSimGrossMarginPct(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মার্কেট কালেকশন (৳)</label>
                    <input
                      type="number"
                      value={simCollectionAmount}
                      onChange={e => setSimCollectionAmount(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* Simulation Output Cards */}
                {(() => {
                  const sel = salesmen.find(s => s.id === simSalesmanId) || salesmen[0];
                  if (!sel) return null;

                  const salesTurnoverComm = (simSalesAmount * sel.commissionRate) / 100;
                  const grossProfitComm = ((simSalesAmount * (simGrossMarginPct / 100)) * sel.commissionRate) / 100;
                  const perUnitComm = simUnitsSold * sel.commissionRate;

                  const targetAchievePct = sel.monthlyTarget > 0 ? (simSalesAmount / sel.monthlyTarget) * 100 : 0;
                  const multiplier = targetAchievePct < 75 ? 0.6 : targetAchievePct < 100 ? 0.9 : targetAchievePct < 120 ? 1.2 : 1.5;
                  const targetBasedComm = (simSalesAmount * (sel.commissionRate * multiplier)) / 100;
                  const targetBonus = targetAchievePct >= 100 ? (targetAchievePct >= 120 ? 10000 : 5000) : 0;

                  const collectionIncentive = (simCollectionAmount * (sel.collectionCommissionRate ?? 0.5)) / 100;

                  let activeModelComm = 0;
                  if (sel.commissionType === 'Percentage of Sales') activeModelComm = salesTurnoverComm;
                  else if (sel.commissionType === 'Percentage of Gross Profit') activeModelComm = grossProfitComm;
                  else if (sel.commissionType === 'Fixed Per Unit') activeModelComm = perUnitComm;
                  else activeModelComm = targetBasedComm;

                  const totalEstimatedPayout = activeModelComm + collectionIncentive + targetBonus;

                  return (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                        <span className="font-bold text-indigo-950">নির্বাচিত অফিসারের কমিশন প্রজেকশন:</span>
                        <span className="font-mono text-xs font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                          {sel.commissionType}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                          <div className="text-slate-500">বেস সেলস কমিশন:</div>
                          <div className="text-sm font-black text-blue-700 font-mono">{formatBDT(activeModelComm)}</div>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                          <div className="text-slate-500">কালেকশন ইনসেন্টিভ:</div>
                          <div className="text-sm font-black text-emerald-700 font-mono">{formatBDT(collectionIncentive)}</div>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                          <div className="text-slate-500">টার্গেট বোনাস:</div>
                          <div className="text-sm font-black text-amber-700 font-mono">{formatBDT(targetBonus)}</div>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                          <div className="text-slate-500">টার্গেট অর্জন প্রজেকশন:</div>
                          <div className={`text-sm font-black ${targetAchievePct >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {Math.round(targetAchievePct)}%
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-indigo-200 flex justify-between items-center">
                        <span className="font-black text-indigo-950 text-xs">মোট আনুমানিক পে-আউট (Salary বাদে):</span>
                        <span className="font-black text-base text-blue-800 font-mono">{formatBDT(totalEstimatedPayout)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SALESMAN */}
      {(showAddModal || editingSalesman) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingSalesman ? `সেলস অফিসার ও টার্গেট পলিসি এডিট — ${editingSalesman.name}` : 'নতুন সেলস অফিসার ও টার্গেট নির্ধারণ'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isBn ? 'ব্যক্তিগত তথ্য, অঞ্চল, মাসিক টার্গেট ও কমিশন ফর্মুলা সেট করুন' : 'Configure officer profile, sales quota, and commission calculation model'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSalesman(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalesman} className="space-y-4 text-xs">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অফিসারের পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নাম্বার *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="01711xxxxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত টেরিটরি / রুট *</label>
                  <input
                    type="text"
                    required
                    value={formData.assignedArea}
                    onChange={e => setFormData({ ...formData, assignedArea: e.target.value })}
                    placeholder="e.g. Mirpur, Uttara Route"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মূল বেতন (Basic Salary ৳)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Target Breakdown */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="font-black text-blue-900 text-xs">মাসিক সেলস ও কালেকশন কোটা (Monthly Targets)</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">টার্নওভার টার্গেট (৳)</label>
                    <input
                      type="number"
                      value={formData.monthlyTarget}
                      onChange={e => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })}
                      placeholder="e.g. 5000000"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">হ্যান্ডসেট ইউনিট টার্গেট (Pcs)</label>
                    <input
                      type="number"
                      value={formData.monthlyUnitTarget}
                      onChange={e => setFormData({ ...formData, monthlyUnitTarget: Number(e.target.value) })}
                      placeholder="e.g. 150"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">কালেকশন কোটা (৳)</label>
                    <input
                      type="number"
                      value={formData.monthlyCollectionTarget}
                      onChange={e => setFormData({ ...formData, monthlyCollectionTarget: Number(e.target.value) })}
                      placeholder="e.g. 4000000"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Commission Rule Configuration */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="font-black text-emerald-900 text-xs">কমিশন পলিসি ও ইনসেন্টিভ রেট</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">কমিশন মডেল</label>
                    <select
                      value={formData.commissionType}
                      onChange={e => setFormData({ ...formData, commissionType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Percentage of Sales">Percentage of Sales (Turnover)</option>
                      <option value="Percentage of Gross Profit">Percentage of Gross Profit</option>
                      <option value="Fixed Per Unit">Fixed Per Unit (Handset)</option>
                      <option value="Target Based">Target Based (Tiered Slab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formData.commissionType === 'Fixed Per Unit' ? 'কমিশন রেট (৳ / Unit)' : 'সেলস কমিশন রেট (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.commissionRate}
                      onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">কালেকশন ইনসেন্টিভ রেট (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.collectionCommissionRate}
                      onChange={e => setFormData({ ...formData, collectionCommissionRate: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSalesman(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-xs cursor-pointer"
                >
                  {editingSalesman ? 'আপডেট সংরক্ষণ করুন' : 'অফিসার যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMMISSION STATEMENT & ITEM DRILLDOWN */}
      {statementSalesman && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">মাসিক কমিশন বিবরণী স্লিপ</div>
                <h3 className="text-base font-black text-slate-900">
                  {statementSalesman.name} ({statementSalesman.employeeCode})
                </h3>
                <p className="text-xs text-slate-500 font-medium">{statementSalesman.assignedArea}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="প্রিন্ট করুন"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStatementSalesman(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            {(() => {
              const calc = calculateSalesmanCommission(statementSalesman);
              const smInvoices = salesInvoices.filter(i => i.salesmanId === statementSalesman.id && i.status !== 'Cancelled');

              return (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">মূল বেতন</div>
                      <div className="text-sm font-black text-slate-900">{formatBDT(statementSalesman.basicSalary)}</div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                      <div className="text-[10px] text-blue-800 font-bold uppercase">সেলস কমিশন</div>
                      <div className="text-sm font-black text-blue-700">{formatBDT(calc.salesCommission)}</div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                      <div className="text-[10px] text-emerald-800 font-bold uppercase">কালেকশন ইনসেন্টিভ</div>
                      <div className="text-sm font-black text-emerald-700">{formatBDT(calc.collectionCommission)}</div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                      <div className="text-[10px] text-amber-800 font-bold uppercase">টার্গেট বোনাস</div>
                      <div className="text-sm font-black text-amber-700">{formatBDT(calc.targetBonus)}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">মোট পাওনা কমিশন</div>
                      <div className="text-lg font-black">{formatBDT(calc.grossCommission)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">বকেয়া পে-আউট</div>
                      <div className="text-lg font-black text-emerald-300">{formatBDT(calc.dueCommission)}</div>
                    </div>
                  </div>

                  {/* Attributed Invoices Drilldown Table */}
                  <div className="space-y-2">
                    <div className="font-black text-slate-800 flex items-center justify-between">
                      <span>এই মাসে প্রসেসকৃত ইনভয়েসসমূহ ({smInvoices.length} টি)</span>
                      <span className="text-slate-500 font-medium">পলিসি: {statementSalesman.commissionType}</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                            <th className="p-2.5">ইনভয়েস #</th>
                            <th className="p-2.5">তারিখ</th>
                            <th className="p-2.5">গ্রাহকের দোকান</th>
                            <th className="p-2.5 text-right">পরিমাণ (৳)</th>
                            <th className="p-2.5 text-right font-black text-blue-700">কমিশন (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {smInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                              <td className="p-2.5 text-slate-500">{inv.invoiceDate}</td>
                              <td className="p-2.5 font-bold text-slate-800">{inv.customerName}</td>
                              <td className="p-2.5 text-right font-mono">{formatBDT(inv.grandTotal)}</td>
                              <td className="p-2.5 text-right font-mono font-bold text-blue-700">{formatBDT(inv.commissionEarned)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 3: COMMISSION PAYOUT / DISBURSEMENT */}
      {payoutSalesman && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  কমিশন পে-আউট অনুমোদন — {payoutSalesman.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  ক্যাশ ইন হ্যান্ড অথবা ব্যাংক একাউন্ট থেকে কমিশন পরিশোধ ভাউচার তৈরি করুন
                </p>
              </div>
              <button
                onClick={() => setPayoutSalesman(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const calc = calculateSalesmanCommission(payoutSalesman);
              const bonus = Number(payoutForm.bonusAmount) || 0;
              const deduction = Number(payoutForm.deductionAmount) || 0;
              const netToPay = Math.max(0, calc.dueCommission + bonus - deduction);

              return (
                <form onSubmit={handleExecutePayout} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">সেলস ও কালেকশন বকেয়া কমিশন:</span>
                      <span className="font-bold text-blue-800">{formatBDT(calc.dueCommission)}</span>
                    </div>
                    {calc.targetBonus > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>অটো টার্গেট ওভারঅ্যাচিভ বোনাস:</span>
                        <span className="font-bold">+{formatBDT(calc.targetBonus)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-blue-200 font-black text-slate-900 text-sm">
                      <span>নেট প্রদেয় কমিশন:</span>
                      <span className="text-emerald-700">{formatBDT(netToPay)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মাস (Month)</label>
                      <input
                        type="month"
                        value={payoutForm.month}
                        onChange={e => setPayoutForm({ ...payoutForm, month: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                      <select
                        value={payoutForm.paymentMethod}
                        onChange={e => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Cash">Cash in Hand (ভল্ট ক্যাশ)</option>
                        <option value="Bank Transfer">Bank Transfer (কোম্পানি ব্যাংক)</option>
                        <option value="bKash">bKash Merchant / Agent</option>
                      </select>
                    </div>
                  </div>

                  {payoutForm.paymentMethod === 'Bank Transfer' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ব্যাংক অ্যাকাউন্ট নির্বাচন করুন</label>
                      <select
                        value={payoutForm.bankAccountId}
                        onChange={e => setPayoutForm({ ...payoutForm, bankAccountId: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        {bankAccounts.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} - {b.accountNumber} ({formatBDT(b.currentBalance)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">অতিরিক্ত বোনাস (৳)</label>
                      <input
                        type="number"
                        value={payoutForm.bonusAmount}
                        onChange={e => setPayoutForm({ ...payoutForm, bonusAmount: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">কর্তন / ফাইন (৳)</label>
                      <input
                        type="number"
                        value={payoutForm.deductionAmount}
                        onChange={e => setPayoutForm({ ...payoutForm, deductionAmount: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রেফারেন্স / ট্রানজেকশন আইডি</label>
                    <input
                      type="text"
                      placeholder="e.g. Bank FT Ref / bKash TrxID"
                      value={payoutForm.referenceNo}
                      onChange={e => setPayoutForm({ ...payoutForm, referenceNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPayoutSalesman(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>কমিশন পরিশোধ অনুমোদন করুন</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
