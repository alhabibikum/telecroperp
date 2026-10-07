import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  MapPin,
  CheckCircle2,
  Clock,
  PlusCircle,
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Wifi,
  WifiOff,
  ShoppingBag,
  Send,
  AlertCircle
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const SalesmanMobileAppView: React.FC = () => {
  const {
    salesmen,
    customers,
    products,
    createSalesmanVisit,
    createSale,
    collectCustomerPayment,
    salesInvoices,
    warehouses,
    isOnline
  } = useERP();

  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [simulateOffline, setSimulateOffline] = useState(false);
  const isOffline = !isOnline || simulateOffline;
  const [activeTab, setActiveTab] = useState<'route' | 'order' | 'collection'>('route');

  // Order state on mobile
  const [orderCustomerId, setOrderCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || '');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Collection state on mobile
  const [colCustomerId, setColCustomerId] = useState<string>(customers[0]?.id || '');
  const [colAmount, setColAmount] = useState<number>(20000);
  const [colMethod, setColMethod] = useState<'Cash' | 'bKash' | 'Cheque'>('Cash');
  const [colSuccessMsg, setColSuccessMsg] = useState<string | null>(null);

  const activeSalesman = salesmen.find(s => s.id === selectedSalesmanId) || salesmen[0];
  const assignedCustomers = activeSalesman ? customers.filter(c => c.salesmanId === activeSalesman.id || !c.salesmanId) : [];

  if (!activeSalesman) {
    return (
      <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">কোন সেলসম্যান প্রোফাইল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              সিস্টেম রিসেট করা হয়েছে অথবা কোনো ফিল্ড সেলসম্যান এন্ট্রি নেই। মোবাইল অ্যাপ সিমুলেটর দেখার জন্য অনুগ্রহ করে সেলস টিম সেকশনে সেলসম্যান যোগ করুন।
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = products.find(p => p.id === selectedProductId);
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariantId);

  // Submit quick mobile order (works seamlessly both online and offline)
  const handleMobileOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentVariant) return;

    const cust = customers.find(c => c.id === orderCustomerId);
    if (!cust) return;

    const price = currentVariant.wholesalePrice;
    const total = price * orderQty;

    const res = createSale({
      invoiceType: 'Wholesale',
      customerId: cust.id,
      customerName: cust.shopName,
      customerPhone: cust.mobile,
      salesmanId: activeSalesman.id,
      salesmanName: activeSalesman.name,
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `mob-item-${Date.now()}`,
          productId: currentProduct.id,
          productName: currentProduct.model,
          variantId: currentVariant.id,
          variantDesc: `${currentVariant.ram}/${currentVariant.storage} - ${currentVariant.color}`,
          quantity: orderQty,
          unitPrice: price,
          unitCost: currentVariant.purchasePrice,
          discount: 0,
          vatAmount: 0,
          totalAmount: total,
          imeiList: [] // warehouse will allocate IMEIs on dispatch
        }
      ],
      subTotal: total,
      discountTotal: 0,
      vatTotal: 0,
      grandTotal: total,
      paidAmount: 0,
      dueAmount: total,
      payments: [],
      status: 'Unpaid',
      notes: isOffline
        ? `[অফলাইন ড্রাফট অর্ডার] ফিল্ডে ইন্টারনেট ছাড়া লোকালি সেভ করা হয়েছে (সেলসম্যান: ${activeSalesman.name})`
        : `Booked via Field Salesman Mobile App by ${activeSalesman.name}`
    });

    if (res.success) {
      if (isOffline) {
        setOrderSuccessMsg(`[অফলাইন অর্ডার সেভড] ${orderQty}x ${currentProduct.model} ব্রাউজারে সুরক্ষিত রয়েছে! ইনভয়েস #${res.invoiceNo}`);
      } else {
        setOrderSuccessMsg(`অর্ডার সফলভাবে কেন্দ্রীয় সিস্টেমে এন্ট্রি হয়েছে! ইনভয়েস #${res.invoiceNo}`);
      }
      setTimeout(() => setOrderSuccessMsg(null), 4500);
    }
  };

  // Submit field collection (works seamlessly both online and offline)
  const handleMobileCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === colCustomerId);
    if (!cust) return;

    const res = collectCustomerPayment({
      customerId: cust.id,
      amount: colAmount,
      paymentMethod: colMethod as any,
      collectorSalesmanId: activeSalesman.id,
      allocations: [],
      notes: isOffline
        ? `[অফলাইন ফিল্ড কালেকশন] ইন্টারনেট ছাড়া লোকালি সেভ করা রসিদ (${activeSalesman.name})`
        : `Field collection by ${activeSalesman.name}`
    });

    if (res.success) {
      if (isOffline) {
        setColSuccessMsg(`[অফলাইন রসিদ সেভড] ৳ ${colAmount.toLocaleString()} এর কালেকশন লোকালি সুরক্ষিত! মানি রসিদ #${res.collectionNo}`);
      } else {
        setColSuccessMsg(`পেমেন্ট ৳ ${colAmount.toLocaleString()} সফলভাবে সংগৃহীত! মানি রসিদ #${res.collectionNo}`);
      }
      setTimeout(() => setColSuccessMsg(null), 4500);
    }
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner with Officer Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Salesman Mobile Application View (Field Device Simulator)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulates the smartphone app interface used by field sales officers for territory visits, order booking & money receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Simulate Officer:</span>
            <select
              value={selectedSalesmanId}
              onChange={(e) => setSelectedSalesmanId(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
            >
              {salesmen.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.assignedArea.split(',')[0]})</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${isOffline
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            title="অনলাইন/অফলাইন মোড টগল করুন"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline Mode (Local Storage)' : 'Online Sync'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Mobile Device Frame */}
      <div className="max-w-md mx-auto bg-slate-900 p-3 rounded-[36px] shadow-2xl border-4 border-slate-800">
        <div className="bg-white rounded-[28px] overflow-hidden flex flex-col min-h-[640px] text-slate-800 text-xs">
          {/* Mobile Top App Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  Field Executive Terminal
                </div>
                <h3 className="font-extrabold text-sm">{activeSalesman.name}</h3>
                <div className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{activeSalesman.assignedArea}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${isOffline ? 'bg-amber-400 text-slate-900' : 'bg-emerald-400 text-slate-900'
                  }`}>
                  {isOffline ? 'Offline' : 'Online'}
                </span>
                <div className="text-[10px] text-blue-200 mt-1">
                  Commission: <b>৳ {formatBDT(activeSalesman.currentMonthSales * 0.01)}</b>
                </div>
              </div>
            </div>

            {/* Target Achievement Micro-gauge */}
            <div className="mt-3 pt-2 border-t border-white/20">
              <div className="flex justify-between text-[10px] text-blue-100 mb-1">
                <span>Month Target: {formatBDT(activeSalesman.monthlyTarget)}</span>
                <span className="font-bold">
                  {Math.round((activeSalesman.currentMonthSales / activeSalesman.monthlyTarget) * 100)}% Achieved
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((activeSalesman.currentMonthSales / activeSalesman.monthlyTarget) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mobile App Navigation Tabs */}
          <div className="flex bg-slate-100 border-b border-slate-200 text-center font-bold text-xs">
            <button
              onClick={() => setActiveTab('route')}
              className={`flex-1 py-2.5 transition border-b-2 ${activeTab === 'route' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500'
                }`}
            >
              Territory Route
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`flex-1 py-2.5 transition border-b-2 ${activeTab === 'order' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500'
                }`}
            >
              + Book Order
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex-1 py-2.5 transition border-b-2 ${activeTab === 'collection' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500'
                }`}
            >
              Collect Due
            </button>
          </div>

          {/* Mobile Content Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* 1. ROUTE LIST */}
            {activeTab === 'route' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Assigned Shops ({assignedCustomers.length})</span>
                  <span>Pending Due</span>
                </div>

                <div className="space-y-2">
                  {assignedCustomers.map(cust => (
                    <div
                      key={cust.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 transition space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{cust.shopName}</div>
                          <div className="text-[11px] text-slate-500">{cust.ownerName} • {cust.mobile}</div>
                        </div>
                        <div className="text-right">
                          <span className={`font-extrabold text-xs ${cust.currentDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {formatBDT(cust.currentDue)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px]">
                        <span className="text-slate-400">{cust.area}, {cust.district}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setOrderCustomerId(cust.id);
                              setActiveTab('order');
                            }}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Book Order
                          </button>
                          {cust.currentDue > 0 && (
                            <button
                              onClick={() => {
                                setColCustomerId(cust.id);
                                setColAmount(Math.min(cust.currentDue, 50000));
                                setActiveTab('collection');
                              }}
                              className="text-amber-700 font-bold hover:underline"
                            >
                              Collect Due
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. LIVE ORDER BOOKING */}
            {activeTab === 'order' && (
              <form onSubmit={handleMobileOrderSubmit} className="space-y-3">
                {orderSuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    {orderSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Customer Shop</label>
                  <select
                    value={orderCustomerId}
                    onChange={(e) => setOrderCustomerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {assignedCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.shopName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Handset Model</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find(pr => pr.id === e.target.value);
                      if (p?.variants[0]) setSelectedVariantId(p.variants[0].id);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Variant / Storage / Color</label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {currentProduct?.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.ram}/{v.storage} - {v.color} (Rate: {formatBDT(v.wholesalePrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={orderQty}
                    onChange={(e) => setOrderQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between text-xs font-bold text-blue-900">
                  <span>Order Total:</span>
                  <span>{formatBDT((currentVariant?.wholesalePrice || 0) * orderQty)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Confirm & Transmit Order
                </button>
              </form>
            )}

            {/* 3. FIELD DUE COLLECTION */}
            {activeTab === 'collection' && (
              <form onSubmit={handleMobileCollectionSubmit} className="space-y-3">
                {colSuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    {colSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Dealer Account</label>
                  <select
                    value={colCustomerId}
                    onChange={(e) => setColCustomerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {assignedCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.shopName} (Due: {formatBDT(c.currentDue)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Collected Amount (৳)</label>
                  <input
                    type="number"
                    min="100"
                    value={colAmount}
                    onChange={(e) => setColAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Collection Tender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'bKash', 'Cheque'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setColMethod(m as any)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${colMethod === m ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Generate Money Receipt (৳ {colAmount.toLocaleString()})
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
