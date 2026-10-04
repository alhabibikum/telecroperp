import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  DollarSign,
  PackageX,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Layers,
  Check
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
    products,
    imeis,
    customers,
    currentUserRole
  } = useERP();

  const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'stock' | 'approvals'>('all');
  const [approvedItems, setApprovedItems] = useState<string[]>([]);
  const [rejectedItems, setRejectedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const inStockImeis = imeis.filter(i => i.status === 'In Stock');

  // 1. Stock low-level warnings
  const lowStockWarnings = products.flatMap(p =>
    p.variants.map(v => {
      const liveStockCount = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
      const isLowStock = liveStockCount <= v.reorderLevel;
      return {
        id: `low-${p.id}-${v.id}`,
        productName: p.model,
        brandName: p.brandName,
        variantDesc: `${v.ram}/${v.storage} - ${v.color}`,
        liveStockCount,
        reorderLevel: v.reorderLevel,
        isLowStock,
        dealerPrice: v.dealerPrice
      };
    })
  ).filter(item => item.isLowStock);

  // 2. Pending approval requests in the dealership
  const pendingApprovals = [
    {
      id: 'appr-1',
      type: 'Special Discount Override',
      title: '7.5% Discount Requested on Bulk Samsung Order',
      party: 'Popular Telecom (Uttara)',
      requestedBy: 'Karim Ullah (Senior Sales Officer)',
      amount: 45000,
      details: 'Customer requested ৳45,000 cash discount for purchasing 15 units of Galaxy S24 Ultra (Standard dealer discount policy: max 5%).',
      module: 'wholesale-sales'
    },
    {
      id: 'appr-2',
      type: 'Credit Limit Exception',
      title: 'Dealer Due Over-Limit Dispatch Authorization',
      party: 'Trust Mobile World (Agrabad)',
      requestedBy: 'Rafiqul Islam (Sales Rep)',
      amount: 150000,
      details: 'Current due is ৳12,50,000 against assigned limit of ৳10,00,000. Customer requested urgent dispatch for festival weekend.',
      module: 'due-ageing'
    },
    {
      id: 'appr-3',
      type: 'DOA Warranty Replacement',
      title: 'Instant Handset Swap Claim',
      party: 'Chawkbazar Mobile Store (Sylhet)',
      requestedBy: 'Warehouse Inspector (Farhana)',
      amount: 49999,
      details: 'Customer reported Dead on Arrival (DOA) within 24 hours of purchase on Xiaomi Redmi Note 13 Pro. Replacement handset requested.',
      module: 'warranty-service'
    }
  ];

  const handleApprove = (id: string) => {
    setApprovedItems(prev => [...prev, id]);
  };

  const handleReject = (id: string) => {
    setRejectedItems(prev => [...prev, id]);
  };

  const unreadAlerts = alerts.filter(a => !a.read);
  const totalActionCount = unreadAlerts.length + lowStockWarnings.length + (pendingApprovals.length - approvedItems.length - rejectedItems.length);

  return (
    <div className="absolute right-0 mt-2 w-88 sm:w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Notification Center</h3>
            <p className="text-[10px] text-slate-300">Real-time alerts, stock warnings & approvals</p>
          </div>
        </div>

        {totalActionCount > 0 && (
          <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold animate-pulse">
            {totalActionCount} New
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-t-lg transition ${
            activeTab === 'all'
              ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 ${
            activeTab === 'alerts'
              ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Alerts</span>
          {unreadAlerts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
              {unreadAlerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 ${
            activeTab === 'stock'
              ? 'bg-white text-amber-600 border-t-2 border-amber-600 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Low Stock</span>
          {lowStockWarnings.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center">
              {lowStockWarnings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1 ${
            activeTab === 'approvals'
              ? 'bg-white text-purple-600 border-t-2 border-purple-600 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Approvals</span>
          {pendingApprovals.length - approvedItems.length - rejectedItems.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center">
              {pendingApprovals.length - approvedItems.length - rejectedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Body */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        {/* 1. Low Stock Section */}
        {(activeTab === 'all' || activeTab === 'stock') && lowStockWarnings.length > 0 && (
          <div className="space-y-1.5 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between px-1">
              <span className="flex items-center gap-1">
                <PackageX className="w-3.5 h-3.5 text-amber-600" />
                Critical Stock Low-Level Warnings ({lowStockWarnings.length})
              </span>
              <button
                onClick={() => {
                  onSelectView('inventory');
                  onClose();
                }}
                className="text-blue-600 hover:underline lowercase text-[10px]"
              >
                view inventory
              </button>
            </div>

            {lowStockWarnings.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">
                      {item.brandName} {item.productName}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.variantDesc}</div>
                    <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                      Live Stock: <b>{item.liveStockCount}</b> (Reorder threshold: {item.reorderLevel})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenNewPurchase) onOpenNewPurchase();
                    else onSelectView('purchases');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 shadow-2xs transition"
                >
                  + Reorder
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 2. Pending Approvals Section */}
        {(activeTab === 'all' || activeTab === 'approvals') && (
          <div className="space-y-1.5 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-between px-1 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Pending Manager Authorization Requests
              </span>
            </div>

            {pendingApprovals.map(appr => {
              const isApproved = approvedItems.includes(appr.id);
              const isRejected = rejectedItems.includes(appr.id);

              return (
                <div
                  key={appr.id}
                  className={`p-2.5 rounded-xl border transition ${
                    isApproved
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : isRejected
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-purple-50/50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                        {appr.type}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{appr.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">{appr.details}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Party: <b>{appr.party}</b> • Req by: {appr.requestedBy}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-purple-100">
                    <span className="font-extrabold text-slate-800 text-[11px]">
                      {formatBDT(appr.amount)}
                    </span>

                    {isApproved ? (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {currentUserRole}
                      </span>
                    ) : isRejected ? (
                      <span className="text-rose-700 font-bold text-[10px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Authorization Rejected
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReject(appr.id)}
                          className="px-2 py-0.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-md text-[10px] font-semibold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(appr.id)}
                          className="px-2.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] font-bold shadow-2xs"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. System Alerts Section */}
        {(activeTab === 'all' || activeTab === 'alerts') && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
              <span className="flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-blue-600" />
                Real-Time Operational Alerts ({alerts.length})
              </span>
              {unreadAlerts.length > 0 && (
                <button
                  onClick={clearAllAlerts}
                  className="text-blue-600 hover:underline lowercase text-[10px]"
                >
                  mark all read
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No active system alerts. All nodes running smoothly.
              </div>
            ) : (
              alerts.map(al => (
                <div
                  key={al.id}
                  onClick={() => {
                    markAlertRead(al.id);
                    if (al.linkModule) {
                      onSelectView(al.linkModule);
                      onClose();
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    al.read
                      ? 'bg-slate-50/50 border-slate-100 opacity-70'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {al.type === 'critical' ? (
                      <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                      </div>
                    ) : al.type === 'warning' ? (
                      <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : al.type === 'reminder' ? (
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{al.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {al.timestamp.split(' ')[1] || al.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {al.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Logged in as {currentUserRole}</span>
        <button
          onClick={() => {
            onSelectView('alert-center');
            onClose();
          }}
          className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
        >
          <span>Open Full Alert Cockpit</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
