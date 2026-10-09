import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  DollarSign,
  PackageX,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Check,
  Trash2,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
  onOpenNewPurchase?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onOpenNewPurchase
}) => {
  const {
    alerts,
    markAlertRead,
    clearAllAlerts,
    removeAlert,
    products,
    imeis,
    customers,
    customerReturns,
    updateCustomerReturnStatus,
    deleteCustomerReturn,
    warrantyClaims,
    stockTransfers,
    currentUserRole
  } = useERP();

  const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'stock' | 'approvals'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // 1. REAL Live Inventory Low-Stock Warnings (Directly from products & imeis database)
  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const lowStockWarnings = products.flatMap(p =>
    p.variants.map(v => {
      const liveStockCount = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
      const isLowStock = liveStockCount <= v.reorderLevel;
      const isOutOfStock = liveStockCount === 0;
      return {
        id: `low-${p.id}-${v.id}`,
        productId: p.id,
        variantId: v.id,
        productName: p.model,
        brandName: p.brandName,
        variantDesc: `${v.ram}/${v.storage} - ${v.color}`,
        liveStockCount,
        reorderLevel: v.reorderLevel,
        isLowStock,
        isOutOfStock,
        dealerPrice: v.dealerPrice
      };
    })
  ).filter(item => item.isLowStock);

  // 2. REAL Pending Authorizations & Exception Requests (Directly from real ERP state)
  const pendingCustomerReturns = customerReturns.filter(r => r.status === 'Pending');
  const creditLimitBreaches = customers.filter(c => c.creditLimit > 0 && c.currentDue >= c.creditLimit);
  const pendingTransfers = stockTransfers.filter(t => t.status === 'Requested');
  const pendingWarranty = warrantyClaims.filter(w => w.status === 'Received');

  const totalApprovalsCount = pendingCustomerReturns.length + creditLimitBreaches.length + pendingTransfers.length + pendingWarranty.length;

  // 3. REAL System Alerts
  const unreadAlerts = alerts.filter(a => !a.read);
  const totalActionCount = unreadAlerts.length + lowStockWarnings.length + totalApprovalsCount;

  // Real Customer Return Actions
  const handleApproveReturn = (retId: string, returnNo: string) => {
    const res = updateCustomerReturnStatus(retId, 'Approved', `অনুমোদনকারী: ${currentUserRole}`);
    if (res.success) {
      showFeedback(`রিটার্ন ${returnNo} সফলভাবে অনুমোদিত হয়েছে।`);
    }
  };

  const handleRejectReturn = (retId: string, returnNo: string) => {
    const res = deleteCustomerReturn(retId);
    if (res.success) {
      showFeedback(`রিটার্ন ${returnNo} বাতিল করা হয়েছে।`);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:max-w-none sm:w-[460px] bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 dark:bg-blue-500 rounded-lg shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">Notification Center</h3>
            <p className="text-[10px] text-slate-300 dark:text-slate-400">রিয়েল-টাইম অপারেশনাল অ্যালার্ট, স্টক সতর্কতা ও অনুমোদন</p>
          </div>
        </div>

        {totalActionCount > 0 ? (
          <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold animate-pulse shrink-0">
            {totalActionCount} New
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-emerald-700/80 text-emerald-100 rounded-full text-[10px] font-bold shrink-0">
            সব আপডেট
          </span>
        )}
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold px-4 py-2 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 pt-2 gap-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-t-lg transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All ({totalActionCount})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Alerts</span>
          {unreadAlerts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {unreadAlerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Low Stock</span>
          {lowStockWarnings.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
              {lowStockWarnings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Approvals</span>
          {totalApprovalsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center font-bold">
              {totalApprovalsCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Body */}
      <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-2">
        {/* Empty state for 'All' tab */}
        {activeTab === 'all' && totalActionCount === 0 && (
          <div className="text-center py-8 space-y-2 text-slate-500 dark:text-slate-400">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="font-bold text-xs text-slate-700 dark:text-slate-200">কোনো নতুন নোটিফিকেশন নেই</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              স্টক পর্যাপ্ত রয়েছে এবং কোনো পেন্ডিং অনুমোদন বা জরুরি সিস্টেম সতর্কতা নেই।
            </p>
          </div>
        )}

        {/* 1. Low Stock Section (100% Real inventory calculations) */}
        {(activeTab === 'all' || activeTab === 'stock') && lowStockWarnings.length > 0 && (
          <div className="space-y-1.5 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between px-1">
              <span className="flex items-center gap-1">
                <PackageX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                আসল স্টক ঘাটতি সতর্কতা ({lowStockWarnings.length})
              </span>
              <button
                onClick={() => {
                  onSelectView('inventory');
                  onClose();
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline lowercase text-[10px] cursor-pointer"
              >
                ইনভেন্টরি ভিউ &rarr;
              </button>
            </div>

            {lowStockWarnings.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    item.isOutOfStock ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                  }`}>
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {item.brandName} {item.productName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.variantDesc}</div>
                    <div className="text-[10px] font-semibold mt-0.5 flex items-center gap-1.5">
                      {item.isOutOfStock ? (
                        <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold rounded">
                          স্টক শেষ (০ টি)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded">
                          বর্তমান স্টক: {item.liveStockCount} টি
                        </span>
                      )}
                      <span className="text-slate-400 dark:text-slate-500 font-normal">
                        (রি-অর্ডার লেভেল: {item.reorderLevel})
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenNewPurchase) onOpenNewPurchase();
                    else onSelectView('purchases');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-[10px] font-bold shrink-0 shadow-2xs transition cursor-pointer"
                  title="নতুন পারচেজ ইনভয়েস খুলুন"
                >
                  + Reorder
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stock' && lowStockWarnings.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-200">পর্যাপ্ত স্টক রয়েছে</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">কোনো প্রোডাক্টের স্টক রি-অর্ডার সীমার নিচে নেই।</p>
          </div>
        )}

        {/* 2. REAL Pending Approvals & Authorizations Section */}
        {(activeTab === 'all' || activeTab === 'approvals') && (
          <div className="space-y-2 pb-2">
            {(totalApprovalsCount > 0 || activeTab === 'approvals') && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center justify-between px-1 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  ম্যানেজার অনুমোদন ও ক্রেডিট সতর্কতা ({totalApprovalsCount})
                </span>
              </div>
            )}

            {/* A. Pending Customer Returns */}
            {pendingCustomerReturns.map(ret => (
              <div
                key={ret.id}
                className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                      Customer Return Authorization
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {ret.returnNo} — {ret.productName}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      কারণ: {ret.returnReason}
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      কাস্টমার: <b>{ret.customerName}</b> • চালান: {ret.originalInvoiceNo}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-900/60">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
                    ক্রেডিট রিফান্ড: {formatBDT(ret.refundOrCreditAmount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRejectReturn(ret.id, ret.returnNo)}
                      className="px-2 py-0.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[10px] font-semibold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => handleApproveReturn(ret.id, ret.returnNo)}
                      className="px-2.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer"
                    >
                      অনুমোদন করুন
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* B. Customer Credit Limit Breaches */}
            {creditLimitBreaches.map(cust => (
              <div
                key={cust.id}
                className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200">
                      Credit Limit Exceeded
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">{cust.shopName}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      বর্তমান বাকি <b>{formatBDT(cust.currentDue)}</b> যা নির্ধারিত ক্রেডিট লিমিট <b>{formatBDT(cust.creditLimit)}</b> অতিক্রম করেছে।
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      মালিক: {cust.ownerName} ({cust.mobile}) • এরিয়া: {cust.area}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-extrabold">
                    অতিরিক্ত বাকি: {formatBDT(cust.currentDue - cust.creditLimit)}
                  </span>
                  <button
                    onClick={() => {
                      onSelectView('due-collection');
                      onClose();
                    }}
                    className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer"
                  >
                    কালেকশন করুন &rarr;
                  </button>
                </div>
              </div>
            ))}

            {/* C. Pending Stock Transfers */}
            {pendingTransfers.map(trf => (
              <div
                key={trf.id}
                className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                      Pending Stock Transfer
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {trf.transferNo} ({trf.totalQuantity} হ্যান্ডসেট)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {trf.sourceWarehouseName} &rarr; {trf.destinationWarehouseName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectView('stock-transfer');
                      onClose();
                    }}
                    className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer"
                  >
                    ট্রান্সফার দেখুন &rarr;
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'approvals' && totalApprovalsCount === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-purple-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-200">কোনো পেন্ডিং অনুমোদন নেই</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">সকল রিটার্ন, ট্রান্সফার ও ক্রেডিট রিকোয়েস্ট অনুমোদিত।</p>
              </div>
            )}
          </div>
        )}

        {/* 3. REAL System Alerts Section */}
        {(activeTab === 'all' || activeTab === 'alerts') && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
              <span className="flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                সিস্টেম অপারেশনাল অ্যালার্ট ({alerts.length})
              </span>
              {unreadAlerts.length > 0 && (
                <button
                  onClick={clearAllAlerts}
                  className="text-blue-600 dark:text-blue-400 hover:underline lowercase text-[10px] cursor-pointer"
                >
                  সব পঠিত করুন
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                কোনো সক্রিয় সিস্টেম সতর্কতা নেই। সমস্ত নোড সঠিকভাবে কাজ করছে।
              </div>
            ) : (
              alerts.map(al => (
                <div
                  key={al.id}
                  className={`p-2.5 rounded-xl border text-xs transition ${
                    al.read
                      ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-70'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {al.type === 'critical' ? (
                      <div className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 mt-0.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                      </div>
                    ) : al.type === 'warning' ? (
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : al.type === 'reminder' ? (
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{al.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {al.timestamp.split(' ')[1] || al.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {al.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        {al.linkModule ? (
                          <button
                            onClick={() => {
                              markAlertRead(al.id);
                              onSelectView(al.linkModule!);
                              onClose();
                            }}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>মডিউলে যান</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <span />}

                        <div className="flex items-center gap-1">
                          {!al.read && (
                            <button
                              onClick={() => markAlertRead(al.id)}
                              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              পঠিত
                            </button>
                          )}
                          <button
                            onClick={() => removeAlert(al.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">অপারেটর রোল: {currentUserRole}</span>
        <button
          onClick={() => {
            onSelectView('alert-center');
            onClose();
          }}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>পূর্ণ অ্যালার্ট সেন্টার খুলুন</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
