import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  User,
  ShieldCheck,
  FileText,
  Printer,
  Send,
  Phone,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
  X,
  BadgeAlert,
  ArrowRight,
  FileCheck2,
  Lock,
  ChevronDown,
  ChevronUp,
  Receipt,
  Building,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { EMIPlan, EMIInstallment, PaymentMethodType } from '../../types/erp';

export const EMIInstallmentView: React.FC = () => {
  const {
    emiPlans,
    customers,
    products,
    imeis,
    warehouses,
    settings,
    createEMIPlan,
    collectInstallmentPayment,
    sendEMIReminderSMS,
    deleteEMIPlan
  } = useERP();

  const isBn = settings.language === 'bn';

  // Tabs: 'contracts' | 'calculator' | 'collection' | 'recovery'
  const [activeTab, setActiveTab] = useState<'contracts' | 'calculator' | 'collection' | 'recovery'>('contracts');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed' | 'Defaulted'>('All');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Modals state
  const [selectedPlanForPrint, setSelectedPlanForPrint] = useState<EMIPlan | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{ plan: EMIPlan; installment: EMIInstallment } | null>(null);
  const [collectingData, setCollectingData] = useState<{ planId: string; installmentNo: number; amount: number; defaultLateFee: number } | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // --- NEW PLAN FORM / CALCULATOR STATE ---
  const [calcCustomerId, setCalcCustomerId] = useState(customers[0]?.id || '');
  const [calcProductId, setCalcProductId] = useState(products[0]?.id || '');
  const [calcVariantId, setCalcVariantId] = useState(products[0]?.variants[0]?.id || '');
  const [calcImei, setCalcImei] = useState('');
  const [calcWarehouseId, setCalcWarehouseId] = useState(warehouses[0]?.id || '');
  const [calcTotalPrice, setCalcTotalPrice] = useState<number>(0);
  const [calcDownPayment, setCalcDownPayment] = useState<number>(20000);
  const [calcTenureMonths, setCalcTenureMonths] = useState<number>(6);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(0); // 0% zero EMI
  const [calcStartDate, setCalcStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Guarantor & Document Vault state
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorMobile, setGuarantorMobile] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('Brother / Colleague');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [guarantorAddress, setGuarantorAddress] = useState('');
  const [guarantorOccupation, setGuarantorOccupation] = useState('');
  const [securityChequeNo, setSecurityChequeNo] = useState('');
  const [bankName, setBankName] = useState('Dutch-Bangla Bank Ltd');
  const [planNotes, setPlanNotes] = useState('');

  // --- COLLECTION FORM MODAL STATE ---
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectLateFee, setCollectLateFee] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethodType>('Cash');
  const [collectRef, setCollectRef] = useState('');

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackToast({ type, text });
    setTimeout(() => setFeedbackToast(null), 4500);
  };

  // Sync calc total price when product/variant changes
  const currentCalcProduct = products.find(p => p.id === calcProductId) || products[0];
  const currentCalcVariant = currentCalcProduct?.variants.find(v => v.id === calcVariantId) || currentCalcProduct?.variants[0];

  React.useEffect(() => {
    if (currentCalcVariant) {
      setCalcTotalPrice(currentCalcVariant.retailPrice);
      // Auto suggest 25% down payment
      const suggestedDP = Math.round(currentCalcVariant.retailPrice * 0.25);
      setCalcDownPayment(suggestedDP);
    }
  }, [calcProductId, calcVariantId]);

  // Available in-stock IMEIs for selected variant
  const availableImeis = useMemo(() => {
    return imeis.filter(i =>
      i.productId === calcProductId &&
      (!calcVariantId || i.variantId === calcVariantId) &&
      i.status === 'In Stock'
    );
  }, [imeis, calcProductId, calcVariantId]);

  React.useEffect(() => {
    if (availableImeis.length > 0 && !availableImeis.some(i => i.imei1 === calcImei)) {
      setCalcImei(availableImeis[0].imei1);
    }
  }, [availableImeis]);

  // Dynamic Calculator calculations
  const calcPrincipal = Math.max(0, calcTotalPrice - calcDownPayment);
  const calcTotalInterest = Math.round(calcPrincipal * (calcInterestRate / 100));
  const calcFinancedAmount = calcPrincipal + calcTotalInterest;
  const calcMonthlyInstallment = Math.round(calcFinancedAmount / (calcTenureMonths || 1));

  // Portfolio KPIs
  const totalFinancedPortfolio = emiPlans.filter(p => p.status === 'Active').reduce((s, p) => s + p.totalRemaining, 0);
  const totalCollectedAllTime = emiPlans.reduce((s, p) => s + p.totalPaid, 0);
  const activeContractsCount = emiPlans.filter(p => p.status === 'Active').length;
  const completedContractsCount = emiPlans.filter(p => p.status === 'Completed').length;
  const totalOverdueInstallments = emiPlans.reduce((sum, p) => sum + p.installments.filter(i => i.status === 'Overdue').length, 0);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return emiPlans.filter(p => {
      const matchSearch =
        p.planNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerMobile.includes(searchTerm) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.imei.includes(searchTerm);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [emiPlans, searchTerm, statusFilter]);

  // All Installments flattened for collection register
  const allInstallments = useMemo(() => {
    const list: Array<{ plan: EMIPlan; installment: EMIInstallment }> = [];
    emiPlans.forEach(p => {
      p.installments.forEach(inst => {
        list.push({ plan: p, installment: inst });
      });
    });
    return list.sort((a, b) => a.installment.dueDate.localeCompare(b.installment.dueDate));
  }, [emiPlans]);

  // Handle Create EMI Plan
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === calcCustomerId);
    if (!cust) {
      showToast('error', 'অনুগ্রহ করে একজন গ্রাহক নির্বাচন করুন।');
      return;
    }
    if (!calcImei) {
      showToast('error', 'স্টকে থাকা একটি বৈধ আইএমইআই (IMEI) নির্বাচন করুন।');
      return;
    }
    if (calcDownPayment >= calcTotalPrice) {
      showToast('error', 'ডাউন পেমেন্ট অবশ্যই মোট মূল্যের চেয়ে কম হতে হবে।');
      return;
    }
    if (!guarantorName.trim() || !guarantorMobile.trim()) {
      showToast('error', 'জামিনদারের নাম ও মোবাইল নম্বর আবশ্যক।');
      return;
    }

    const wh = warehouses.find(w => w.id === calcWarehouseId) || warehouses[0];

    const result = createEMIPlan({
      customerId: cust.id,
      customerName: cust.shopName || cust.ownerName,
      customerMobile: cust.mobile,
      customerAddress: `${cust.address}, ${cust.area}, ${cust.district}`,
      productId: currentCalcProduct.id,
      productName: currentCalcProduct.model,
      variantDesc: `${currentCalcVariant?.ram || ''}/${currentCalcVariant?.storage || ''} - ${currentCalcVariant?.color || ''}`,
      imei: calcImei,
      warehouseId: wh?.id || 'wh-1',
      warehouseName: wh?.name || 'Warehouse',
      totalPrice: calcTotalPrice,
      downPayment: calcDownPayment,
      interestRate: calcInterestRate,
      tenureMonths: calcTenureMonths,
      startDate: calcStartDate,
      guarantor: {
        name: guarantorName,
        mobile: guarantorMobile,
        relation: guarantorRelation,
        nidNo: guarantorNid || 'N/A',
        address: guarantorAddress || 'Same District',
        occupation: guarantorOccupation || 'Businessman'
      },
      documents: {
        securityChequeNo: securityChequeNo || undefined,
        bankName: bankName || undefined
      },
      notes: planNotes || undefined
    });

    if (result.success) {
      showToast('success', `ইএমআই চুক্তি সফলভাবে অনুমোদিত হয়েছে! প্ল্যান নং: ${result.planNo}`);
      setActiveTab('contracts');
      // Reset form
      setGuarantorName('');
      setGuarantorMobile('');
      setGuarantorNid('');
      setSecurityChequeNo('');
      setPlanNotes('');
    } else {
      showToast('error', result.error || 'ইএমআই চুক্তি তৈরি ব্যর্থ হয়েছে।');
    }
  };

  // Open Collect Modal
  const handleOpenCollectModal = (planId: string, installmentNo: number, amount: number, lateFee = 0) => {
    setCollectingData({ planId, installmentNo, amount, defaultLateFee: lateFee });
    setCollectAmount(amount);
    setCollectLateFee(lateFee);
    setCollectMethod('Cash');
    setCollectRef('');
  };

  // Execute Collect Payment
  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingData) return;

    const res = collectInstallmentPayment(
      collectingData.planId,
      collectingData.installmentNo,
      {
        paidAmount: collectAmount,
        lateFee: collectLateFee,
        paymentMethod: collectMethod,
        transactionRef: collectRef || undefined
      }
    );

    if (res.success) {
      showToast('success', `কিস্তি #${collectingData.installmentNo} সফলভাবে আদায় ও ক্যাশবুকে জমা করা হয়েছে!`);
      const targetPlan = emiPlans.find(p => p.id === collectingData.planId);
      const targetInst = targetPlan?.installments.find(i => i.installmentNo === collectingData.installmentNo);
      if (targetPlan && targetInst) {
        setSelectedReceipt({ plan: targetPlan, installment: targetInst });
      }
      setCollectingData(null);
    } else {
      showToast('error', res.error || 'পেমেন্ট সংগ্রহে সমস্যা হয়েছে।');
    }
  };

  // Handle Send Reminder SMS
  const handleSendReminder = (planId: string, instNo: number) => {
    const res = sendEMIReminderSMS(planId, instNo);
    if (res.success) {
      showToast('success', `কিস্তি তাগাদা এসএমএস সফলভাবে প্রেরিত হয়েছে!`);
    } else {
      showToast('error', res.error || 'এসএমএস পাঠাতে ব্যর্থ হয়েছে।');
    }
  };

  // Handle Delete Contract
  const handleDeleteContract = (planId: string, planNo: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে ইএমআই চুক্তি #${planNo} বাতিল ও আইএমইআই পুনরায় স্টকে ফেরত নিতে চান?`)) {
      const res = deleteEMIPlan(planId);
      if (res.success) {
        showToast('info', `প্ল্যান #${planNo} বাতিল করা হয়েছে।`);
      }
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Toast Alert */}
      {feedbackToast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-md border ${
          feedbackToast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          feedbackToast.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-300' :
          'bg-blue-50 text-blue-900 border-blue-300'
        }`}>
          {feedbackToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {feedbackToast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          {feedbackToast.type === 'info' && <Receipt className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{feedbackToast.text}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">
              EMI & Hire-Purchase Management Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            স্মার্টফোন ও গ্যাজেট কিস্তির ডাউন পেমেন্ট, মাসিক শিডিউলার, জামিনদার ডকুমেন্ট ভল্ট ও অটোমেটিক তাগাদা এসএমএস
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ নতুন কিস্তি প্ল্যান তৈরি</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">বাকি কিস্তি মূলধন</span>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatBDT(totalFinancedPortfolio)}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-indigo-700">{activeContractsCount}টি</span> সক্রিয় চুক্তি চলমান
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">মোট আদায়কৃত টাকা</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{formatBDT(totalCollectedAllTime)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            ডাউন পেমেন্ট + সকল কিস্তির মোট আদায়
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">মেয়াদোত্তীর্ণ ওভারডিউ কিস্তি</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-amber-700">{totalOverdueInstallments}টি কিস্তি</div>
          <div className="text-[11px] text-amber-800 font-semibold mt-1">
            তাগাদা এসএমএস ও রিকভারি আবশ্যক
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">সম্পন্ন সফল চুক্তি</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedContractsCount}টি</div>
          <div className="text-[11px] text-slate-500 mt-1">
            ১০০% কিস্তি পরিশোধ সম্পন্ন হয়েছে
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'contracts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>সকল কিস্তি চুক্তি ({emiPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'calculator'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন কিস্তি হিসাব ও সক্রিয়করণ (New EMI)</span>
        </button>

        <button
          onClick={() => setActiveTab('collection')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'collection'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>মাসিক কিস্তি কালেকশন রেজিস্টার</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'recovery'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BadgeAlert className="w-4 h-4 text-amber-500" />
          <span>তাগাদা ও রিকভারি ডেস্ক ({totalOverdueInstallments})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ALL EMI CONTRACTS (TABLE & DETAIL)
         ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="চুক্তি নং, গ্রাহক, মোবাইল বা IMEI..."
                className="bg-transparent w-full outline-hidden font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">স্ট্যাটাস:</span>
              {(['All', 'Active', 'Completed', 'Defaulted'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts List */}
          {filteredPlans.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">কোনো কিস্তি চুক্তি পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-400">নতুন একটি স্মার্টফোন কিস্তি প্ল্যান তৈরি করতে উপরের ট্যাবে ক্লিক করুন।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map(plan => {
                const isExpanded = expandedPlanId === plan.id;
                const paidPercent = Math.min(100, Math.round((plan.totalPaid / (plan.totalPrice + (plan.financedAmount - (plan.totalPrice - plan.downPayment)))) * 100));

                return (
                  <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition">
                    <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                      {/* Left: Client & Phone info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {plan.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{plan.customerName}</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {plan.planNo}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              plan.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              plan.status === 'Active' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {plan.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {plan.customerMobile}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-800">{plan.productName}</span>
                            <span className="text-slate-400">({plan.variantDesc})</span>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-slate-600">IMEI: {plan.imei}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Numbers, Progress & Actions */}
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">বাকি কিস্তি মূলধন</div>
                          <div className="text-base font-black text-indigo-900">{formatBDT(plan.totalRemaining)}</div>
                          <div className="text-[10px] text-slate-500">
                            মাসিক ৳{plan.monthlyInstallment.toLocaleString()} ({plan.tenureMonths} মাস)
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-28 hidden md:block">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>পরিশোধ</span>
                            <span>{paidPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${paidPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPlanForPrint(plan)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition"
                            title="আইনি চুক্তিপত্র প্রিন্ট করুন"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition"
                          >
                            <span>{isExpanded ? 'লুকান' : 'কিস্তির শিডিউল'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteContract(plan.id, plan.planNo)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            title="চুক্তি বাতিল ও ডিলিট"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED SCHEDULE & GUARANTOR DETAILS */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/70 space-y-4">
                        {/* Guarantor & Security Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200">
                          <div>
                            <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
                              <ShieldCheck className="w-4 h-4 text-indigo-600" />
                              <span>জামিনদারের তথ্য (Guarantor Verification)</span>
                            </span>
                            <div className="space-y-1 text-slate-600">
                              <div><b>নাম:</b> {plan.guarantor.name} ({plan.guarantor.relation})</div>
                              <div><b>মোবাইল:</b> {plan.guarantor.mobile}</div>
                              <div><b>জাতীয় পরিচয়পত্র (NID):</b> {plan.guarantor.nidNo}</div>
                              <div><b>পেশা ও ঠিকানা:</b> {plan.guarantor.occupation || 'N/A'}, {plan.guarantor.address}</div>
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
                              <Lock className="w-4 h-4 text-indigo-600" />
                              <span>নিরাপত্তা চেক ও আর্থিক শর্তাবলী</span>
                            </span>
                            <div className="space-y-1 text-slate-600">
                              <div><b>সিকিউরিটি চেক নম্বর:</b> {plan.documents.securityChequeNo || 'জমা নেওয়া হয়নি'}</div>
                              <div><b>ব্যাংকের নাম:</b> {plan.documents.bankName || 'N/A'}</div>
                              <div><b>ডাউন পেমেন্ট:</b> {formatBDT(plan.downPayment)} (নগদ গৃহীত)</div>
                              <div><b>সুদের হার:</b> {plan.interestRate === 0 ? '০% (জিরো ইন্টারেস্ট অফার)' : `${plan.interestRate}%`}</div>
                            </div>
                          </div>
                        </div>

                        {/* Installments Table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                          <div className="p-3 bg-slate-100/70 font-bold text-slate-700 flex justify-between items-center">
                            <span>মাসিক কিস্তি পরিশোধের সময়সূচি (Repayment Ledger)</span>
                            <span className="text-[11px] text-slate-500 font-normal">মোট {plan.installments.length}টি কিস্তি</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2.5">কিস্তি নং</th>
                                  <th className="p-2.5">পরিশোধের শেষ তারিখ</th>
                                  <th className="p-2.5">মূল কিস্তি</th>
                                  <th className="p-2.5">জরিমানা (Late Fee)</th>
                                  <th className="p-2.5">আদায়কৃত টাকা</th>
                                  <th className="p-2.5">আদায়ের তারিখ ও মেথড</th>
                                  <th className="p-2.5">স্ট্যাটাস</th>
                                  <th className="p-2.5 text-right">অ্যাকশন</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {plan.installments.map(inst => (
                                  <tr key={inst.installmentNo} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 font-bold">#{inst.installmentNo}</td>
                                    <td className="p-2.5 font-medium">{inst.dueDate}</td>
                                    <td className="p-2.5 font-bold text-slate-900">{formatBDT(inst.amount)}</td>
                                    <td className="p-2.5 text-rose-600 font-semibold">{inst.lateFee > 0 ? formatBDT(inst.lateFee) : '৳ 0'}</td>
                                    <td className="p-2.5 font-bold text-emerald-700">{inst.paidAmount > 0 ? formatBDT(inst.paidAmount) : '—'}</td>
                                    <td className="p-2.5 text-slate-500">
                                      {inst.paidDate ? `${inst.paidDate} (${inst.paymentMethod || 'Cash'})` : '—'}
                                    </td>
                                    <td className="p-2.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                        inst.status === 'Overdue' ? 'bg-rose-100 text-rose-800' :
                                        'bg-amber-100 text-amber-800'
                                      }`}>
                                        {inst.status}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right space-x-1">
                                      {inst.status !== 'Paid' ? (
                                        <>
                                          <button
                                            onClick={() => handleOpenCollectModal(plan.id, inst.installmentNo, inst.amount, inst.lateFee)}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition"
                                          >
                                            টাকা জমা নিন
                                          </button>
                                          <button
                                            onClick={() => handleSendReminder(plan.id, inst.installmentNo)}
                                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                            title="এসএমএস তাগাদা পাঠান"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedReceipt({ plan, installment: inst })}
                                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1 inline-flex"
                                        >
                                          <Receipt className="w-3 h-3" />
                                          <span>রসিদ</span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: INTERACTIVE EMI CALCULATOR & NEW ONBOARDING
         ========================================================================= */}
      {activeTab === 'calculator' && (
        <form onSubmit={handleCreatePlanSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Customer, Product & Finance Terms */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>স্মার্টফোন কিস্তি হিসাব ও বিক্রয় অনুমোদন (Loan Onboarding)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের নাম (Client) *</label>
                <select
                  value={calcCustomerId}
                  onChange={e => setCalcCustomerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.shopName || c.ownerName} ({c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Outlet / Warehouse */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিক্রয় শোরুম / ওয়্যারহাউজ *</label>
                <select
                  value={calcWarehouseId}
                  onChange={e => setCalcWarehouseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Product Model */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">স্মার্টফোন মডেল *</label>
                <select
                  value={calcProductId}
                  onChange={e => {
                    setCalcProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.variants.length > 0) {
                      setCalcVariantId(prod.variants[0].id);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                  ))}
                </select>
              </div>

              {/* Variant */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ভেরিয়েন্ট (RAM/ROM) *</label>
                <select
                  value={calcVariantId}
                  onChange={e => setCalcVariantId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {currentCalcProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.ram}/{v.storage} - {v.color} ({formatBDT(v.retailPrice)})
                    </option>
                  ))}
                </select>
              </div>

              {/* In-Stock IMEI Selection */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  স্টকে থাকা আইএমইআই (In-Stock IMEI) *
                  <span className="text-slate-400 font-normal ml-2">({availableImeis.length}টি ফোন স্টকে রয়েছে)</span>
                </label>
                {availableImeis.length === 0 ? (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">
                    এই মডেলের কোনো ইন-স্টক আইএমইআই পাওয়া যায়নি। অনুগ্রহ করে অন্য মডেল নির্বাচন করুন।
                  </div>
                ) : (
                  <select
                    value={calcImei}
                    onChange={e => setCalcImei(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-mono text-emerald-950 font-bold"
                  >
                    {availableImeis.map(i => (
                      <option key={i.id} value={i.imei1}>
                        IMEI: {i.imei1} {i.imei2 ? `| SIM2: ${i.imei2}` : ''} ({i.variantDesc})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Financial Terms & Calculator Sliders */}
            <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
              <h4 className="font-bold text-slate-800">আর্থিক শর্তাবলী ও ডাউন পেমেন্ট</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">মোট বিক্রয় মূল্য (MRP ৳)</label>
                  <input
                    type="number"
                    value={calcTotalPrice}
                    onChange={e => setCalcTotalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ডাউন পেমেন্ট (নগদ ৳)</label>
                  <input
                    type="number"
                    value={calcDownPayment}
                    onChange={e => setCalcDownPayment(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {calcTotalPrice > 0 ? `${Math.round((calcDownPayment / calcTotalPrice) * 100)}% ডাউন পেমেন্ট` : ''}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">সুদের হার (Interest %)</label>
                  <select
                    value={calcInterestRate}
                    onChange={e => setCalcInterestRate(parseFloat(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={0}>০% (Zero Interest Promo)</option>
                    <option value={5}>৫% ফ্ল্যাট সার্ভিস চার্জ</option>
                    <option value={8}>৮% স্ট্যান্ডার্ড চার্জ</option>
                    <option value={10}>১০% প্রিমিয়াম চার্জ</option>
                  </select>
                </div>
              </div>

              {/* Tenure Selection */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">কিস্তির মেয়াদ (Tenure Months)</label>
                <div className="flex flex-wrap gap-2">
                  {[3, 4, 6, 9, 12, 18, 24].map(months => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setCalcTenureMonths(months)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        calcTenureMonths === months
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {months} মাস ({Math.round(calcFinancedAmount / months).toLocaleString()} ৳/মাস)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guarantor & Security Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>জামিনদার ও নিরাপত্তা চেক ভল্ট (Guarantor Verification)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">জামিনদারের নাম *</label>
                  <input
                    type="text"
                    value={guarantorName}
                    onChange={e => setGuarantorName(e.target.value)}
                    placeholder="উদা: মোঃ আরিফুল হক"
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">জামিনদারের মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={guarantorMobile}
                    onChange={e => setGuarantorMobile(e.target.value)}
                    placeholder="01711-XXXXXX"
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">সম্পর্ক (Relation)</label>
                  <input
                    type="text"
                    value={guarantorRelation}
                    onChange={e => setGuarantorRelation(e.target.value)}
                    placeholder="Brother / Father / Colleague"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">এনআইডি নম্বর (Guarantor NID)</label>
                  <input
                    type="text"
                    value={guarantorNid}
                    onChange={e => setGuarantorNid(e.target.value)}
                    placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ব্ল্যাঙ্ক সিকিউরিটি চেক নম্বর</label>
                  <input
                    type="text"
                    value={securityChequeNo}
                    onChange={e => setSecurityChequeNo(e.target.value)}
                    placeholder="CQ-DBBL-9921004"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">চেকের ব্যাংকের নাম</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="City Bank, DBBL, Brac Bank"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={availableImeis.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>ইএমআই চুক্তি অনুমোদন ও চালু করুন (Activate EMI Plan)</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Real-Time Schedule Simulator Preview */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md space-y-5">
            <h3 className="font-bold text-sm text-indigo-300 pb-2 border-b border-slate-800 flex items-center gap-2">
              <CalculatorIcon />
              <span>রিয়েল-টাইম কিস্তি শিডিউল প্রাক্কলন (Live Breakdown)</span>
            </h3>

            {/* Calculated Summary Card */}
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>মোট ফোনের মূল্য:</span>
                <span className="font-bold text-white">{formatBDT(calcTotalPrice)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>নগদ ডাউন পেমেন্ট (-):</span>
                <span>{formatBDT(calcDownPayment)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>সার্ভিস চার্জ / সুদ (+):</span>
                <span>{formatBDT(calcTotalInterest)} ({calcInterestRate}%)</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-black text-sm text-white">
                <span>অর্থায়নকৃত মোট কিস্তি:</span>
                <span className="text-emerald-400">{formatBDT(calcFinancedAmount)}</span>
              </div>
            </div>

            {/* Big Monthly Installment Highlight */}
            <div className="bg-indigo-600/30 p-4 rounded-xl border border-indigo-500/40 text-center">
              <div className="text-[11px] uppercase font-bold text-indigo-300">প্রতি মাসের কিস্তির পরিমাণ</div>
              <div className="text-3xl font-black text-white mt-1">
                {formatBDT(calcMonthlyInstallment)}
              </div>
              <div className="text-[11px] text-indigo-200 mt-1">
                পরবর্তী {calcTenureMonths} মাস ধরে প্রদেয়
              </div>
            </div>

            {/* Simulated Installment List */}
            <div className="space-y-1.5 text-xs max-h-64 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-400 mb-1">মাসিক কিস্তির তারিখসমূহ:</div>
              {Array.from({ length: calcTenureMonths }).map((_, idx) => {
                const d = new Date(calcStartDate);
                d.setMonth(d.getMonth() + idx + 1);
                const dueStr = d.toISOString().split('T')[0];

                return (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                    <span className="font-semibold text-slate-300">কিস্তি #{idx + 1} ({dueStr})</span>
                    <span className="font-bold text-white">{formatBDT(calcMonthlyInstallment)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: MONTHLY COLLECTION REGISTER
         ========================================================================= */}
      {activeTab === 'collection' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                সকল কিস্তির কালেকশন মাস্টার লেজার (Collection Register)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">মাসিক কিস্তি গ্রহণ করুন ও ক্যাশবুকে স্বয়ংক্রিয় এন্ট্রি তৈরি করুন</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">চুক্তি নং</th>
                  <th className="p-3">গ্রাহক ও মোবাইল</th>
                  <th className="p-3">ফোন মডেল</th>
                  <th className="p-3">কিস্তি নং</th>
                  <th className="p-3">পরিশোধের শেষ তারিখ</th>
                  <th className="p-3">কিস্তির পরিমাণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">কালেকশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInstallments.map(({ plan, installment }) => (
                  <tr key={`${plan.id}-${installment.installmentNo}`} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-indigo-900">{plan.planNo}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{plan.customerName}</div>
                      <div className="text-[11px] text-slate-500">{plan.customerMobile}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{plan.productName}</td>
                    <td className="p-3 font-bold">#{installment.installmentNo} of {plan.tenureMonths}</td>
                    <td className="p-3 font-mono">{installment.dueDate}</td>
                    <td className="p-3 font-bold text-slate-900">{formatBDT(installment.amount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        installment.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        installment.status === 'Overdue' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {installment.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {installment.status !== 'Paid' ? (
                        <button
                          onClick={() => handleOpenCollectModal(plan.id, installment.installmentNo, installment.amount, installment.lateFee)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition"
                        >
                          কালেকশন করুন
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধিত
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: RECOVERY & OVERDUE SMS DESK
         ========================================================================= */}
      {activeTab === 'recovery' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-950 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">মেয়াদোত্তীর্ণ ও ঝুঁকিপূর্ণ কিস্তি তাগাদা ড্যাশবোর্ড</div>
              <div className="text-[11px] text-rose-800">
                নিচের কিস্তিগুলোর পরিশোধের তারিখ অতিক্রান্ত হয়েছে। অবিলম্বে গ্রাহক ও জামিনদারকে তাগাদা প্রদান বা আইনি নোটিশ প্রেরণ করুন।
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">চুক্তি নং</th>
                    <th className="p-3">গ্রাহক ও মোবাইল</th>
                    <th className="p-3">জামিনদার (নাম ও ফোন)</th>
                    <th className="p-3">কিস্তি নং</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">মূল কিস্তি</th>
                    <th className="p-3">লেট ফি</th>
                    <th className="p-3 text-right">রিকভারি অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allInstallments
                    .filter(i => i.installment.status === 'Overdue')
                    .map(({ plan, installment }) => (
                      <tr key={`${plan.id}-${installment.installmentNo}`} className="hover:bg-rose-50/50">
                        <td className="p-3 font-mono font-bold text-rose-900">{plan.planNo}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{plan.customerName}</div>
                          <div className="text-[11px] text-slate-500">{plan.customerMobile}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{plan.guarantor.name}</div>
                          <div className="text-[11px] text-indigo-700 font-medium">{plan.guarantor.mobile}</div>
                        </td>
                        <td className="p-3 font-bold">#{installment.installmentNo}</td>
                        <td className="p-3 font-mono text-rose-700 font-bold">{installment.dueDate}</td>
                        <td className="p-3 font-bold text-slate-900">{formatBDT(installment.amount)}</td>
                        <td className="p-3 font-bold text-rose-600">{formatBDT(installment.lateFee || 500)}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleSendReminder(plan.id, installment.installmentNo)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition inline-flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>তাগাদা SMS</span>
                          </button>

                          <button
                            onClick={() => handleOpenCollectModal(plan.id, installment.installmentNo, installment.amount, installment.lateFee || 500)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition"
                          >
                            আদায় করুন
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COLLECTION MODAL
         ========================================================================= */}
      {collectingData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>কিস্তি পেমেন্ট আদায় ও মানি রিসিট</span>
              </h3>
              <button onClick={() => setCollectingData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">আদায়কৃত কিস্তির পরিমাণ (৳) *</label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={e => setCollectAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">জরিমানা বা লেট ফি (Late Fee ৳)</label>
                <input
                  type="number"
                  value={collectLateFee}
                  onChange={e => setCollectLateFee(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পেমেন্ট মেথড (Payment Method) *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'bKash', 'Bank Transfer'] as PaymentMethodType[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setCollectMethod(pm)}
                      className={`p-2 rounded-xl font-bold text-center border transition ${
                        collectMethod === pm
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ট্রানজেকশন আইডি / রেফারেন্স</label>
                <input
                  type="text"
                  value={collectRef}
                  onChange={e => setCollectRef(e.target.value)}
                  placeholder="TRX-123456 বা চেক নং"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCollectingData(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
                >
                  জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT CONTRACT MODAL (OFFICIAL HIRE-PURCHASE LEGAL AGREEMENT)
         ========================================================================= */}
      {selectedPlanForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <h3 className="font-bold text-sm text-slate-900">স্মার্টফোন হায়ার-পারচেজ কিস্তি বিক্রয় চুক্তিপত্র</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>চুক্তিপত্র প্রিন্ট</span>
                </button>
                <button onClick={() => setSelectedPlanForPrint(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Agreement Content */}
            <div className="p-4 border border-slate-300 rounded-xl font-serif text-xs space-y-3 bg-white text-slate-900 print:border-none print:p-0">
              <div className="text-center pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black uppercase tracking-wider">TeleCorp Mobile Distribution & Trade Ltd.</h2>
                <p className="text-[10px] text-slate-500">স্মার্টফোন কিস্তি বিক্রয় ও জামিনদার দ্বিপাক্ষিক আইনি চুক্তিপত্র</p>
                <div className="font-mono text-xs font-bold mt-1">চুক্তি নং: #{selectedPlanForPrint.planNo}</div>
              </div>

              <div className="space-y-1.5">
                <p><b>১. প্রথম পক্ষ (বিক্রেতা):</b> টেলিকর্প মোবাইল ডিস্ট্রিবিউশন, ঢাকা, বাংলাদেশ।</p>
                <p><b>২. দ্বিতীয় পক্ষ (ক্রেতা):</b> {selectedPlanForPrint.customerName}, মোবাইল: {selectedPlanForPrint.customerMobile}, ঠিকানা: {selectedPlanForPrint.customerAddress}।</p>
                <p><b>৩. তৃতীয় পক্ষ (জামিনদার):</b> {selectedPlanForPrint.guarantor.name} ({selectedPlanForPrint.guarantor.relation}), মোবাইল: {selectedPlanForPrint.guarantor.mobile}, এনআইডি: {selectedPlanForPrint.guarantor.nidNo}।</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div><b>ডিভাইস বিবরণ:</b> {selectedPlanForPrint.productName} ({selectedPlanForPrint.variantDesc})</div>
                <div><b>IMEI 1:</b> {selectedPlanForPrint.imei}</div>
                <div><b>মোট মূল্য:</b> ৳{selectedPlanForPrint.totalPrice.toLocaleString()} | <b>ডাউন পেমেন্ট:</b> ৳{selectedPlanForPrint.downPayment.toLocaleString()}</div>
                <div><b>বাকি কিস্তি:</b> ৳{selectedPlanForPrint.financedAmount.toLocaleString()} ({selectedPlanForPrint.tenureMonths} মাস @ ৳{selectedPlanForPrint.monthlyInstallment.toLocaleString()}/মাস)</div>
                <div><b>নিরাপত্তা চেক নম্বর:</b> {selectedPlanForPrint.documents.securityChequeNo || 'N/A'} ({selectedPlanForPrint.documents.bankName || ''})</div>
              </div>

              <div className="text-[10px] text-slate-600 space-y-1">
                <p><b>শর্তাবলী:</b> সম্পূর্ণ কিস্তি পরিশোধ না হওয়া পর্যন্ত ডিভাইসের মূল মালিকানা টেলিকর্প-এর অধীনে থাকবে। পরপর ২টি কিস্তি বকেয়া হলে জামিনদারের ব্যাংক চেক ক্যাশ করার ও আইনি ব্যবস্থা গ্রহণের সম্পূর্ণ অধিকার কর্তৃপক্ষের থাকবে।</p>
              </div>

              <div className="pt-8 flex justify-between text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 pt-1 w-36">ক্রেতার স্বাক্ষর</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 w-36">জামিনদারের স্বাক্ষর</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 w-36">অনুমোদনকারী স্বাক্ষর</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT INSTALLMENT RECEIPT MODAL
         ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 print:hidden">
              <h3 className="font-bold text-xs text-slate-900">কিস্তি আদায় রসিদ</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                >
                  প্রিন্ট
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 border border-slate-300 rounded-xl font-mono text-[11px] space-y-2 bg-white text-slate-900 print:border-none">
              <div className="text-center border-b pb-1">
                <div className="font-bold text-sm">TELECORP MOBILE ERP</div>
                <div className="text-[10px]">EMI Installment Payment Slip</div>
                <div className="text-[9px] text-slate-500">রসিদ নং: {selectedReceipt.installment.receiptNo || 'RCP-001'}</div>
              </div>

              <div className="space-y-1">
                <div><b>গ্রাহক:</b> {selectedReceipt.plan.customerName}</div>
                <div><b>মোবাইল:</b> {selectedReceipt.plan.customerMobile}</div>
                <div><b>প্ল্যান নং:</b> {selectedReceipt.plan.planNo}</div>
                <div><b>মডেল:</b> {selectedReceipt.plan.productName}</div>
                <div><b>কিস্তি নং:</b> #{selectedReceipt.installment.installmentNo} of {selectedReceipt.plan.tenureMonths}</div>
                <div><b>পরিশোধের তারিখ:</b> {selectedReceipt.installment.paidDate}</div>
                <div><b>পেমেন্ট মেথড:</b> {selectedReceipt.installment.paymentMethod || 'Cash'}</div>
              </div>

              <div className="border-t pt-1 flex justify-between font-bold text-xs">
                <span>গৃহীত টাকা:</span>
                <span>৳{(selectedReceipt.installment.paidAmount + selectedReceipt.installment.lateFee).toLocaleString()}</span>
              </div>

              <div className="border-t pt-1 text-[9px] text-slate-500 text-center">
                ধন্যবাদ! কিস্তির অবশিষ্ট ব্যালেন্স: ৳{selectedReceipt.plan.totalRemaining.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CalculatorIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
    <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" />
    <line x1="16" y1="14" x2="16" y2="18" strokeWidth="2" />
    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
