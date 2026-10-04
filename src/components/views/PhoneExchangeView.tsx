import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  RotateCcw,
  Smartphone,
  PlusCircle,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { ReturnCondition, PaymentMethodType } from '../../types/erp';

export const PhoneExchangeView: React.FC = () => {
  const {
    phoneExchanges,
    customers,
    products,
    imeis,
    processPhoneExchange
  } = useERP();

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');

  // Old phone appraisal
  const [oldBrand, setOldBrand] = useState('Samsung');
  const [oldModel, setOldModel] = useState('Galaxy S22 Ultra 5G');
  const [oldIMEI, setOldIMEI] = useState('');
  const [oldCondition, setOldCondition] = useState<ReturnCondition>('Used');
  const [assessedValue, setAssessedValue] = useState<number>(35000);

  // New phone
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState(products[0]?.variants[0]?.id || '');
  const [selectedNewIMEI, setSelectedNewIMEI] = useState('');
  const [amountPaidNow, setAmountPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const currentProd = products.find(p => p.id === selectedProductId);
  const currentVariant = currentProd?.variants.find(v => v.id === selectedVariantId);
  const newPhonePrice = currentVariant?.retailPrice || 100000;
  const netPayable = Math.max(0, newPhonePrice - assessedValue);
  const dueAmount = Math.max(0, netPayable - amountPaidNow);

  // Available new IMEIs for this variant in stock
  const availableNewImeis = imeis.filter(i =>
    i.productId === selectedProductId &&
    i.variantId === selectedVariantId &&
    i.status === 'In Stock'
  );

  const handleCreateExchange = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust || !currentProd || !currentVariant) return;

    if (!oldIMEI || oldIMEI.length < 14) {
      alert('Please enter a valid 15-digit IMEI for the trade-in phone.');
      return;
    }

    if (!selectedNewIMEI) {
      alert('Please select an in-stock IMEI for the new phone.');
      return;
    }

    const res = processPhoneExchange({
      date: new Date().toISOString().split('T')[0],
      customerId: cust.id,
      customerName: cust.shopName,
      customerPhone: cust.mobile,
      oldBrand,
      oldModel,
      oldIMEI,
      oldCondition,
      assessedValue,
      newProductId: currentProd.id,
      newProductName: currentProd.model,
      newVariantDesc: `${currentVariant.ram}/${currentVariant.storage} - ${currentVariant.color}`,
      newIMEI: selectedNewIMEI,
      newPhonePrice,
      netPayableAmount: netPayable,
      amountPaidNow,
      dueAmount,
      paymentMethod,
      notes
    });

    if (res.success) {
      setMessage(`Exchange #${res.exchangeNo} successfully processed! Pre-owned stock updated.`);
      setShowExchangeModal(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Old Handset Trade-in & Device Exchange Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Appraise pre-owned smartphones, deduct trade-in valuation against new flagship purchases & manage pre-owned inventory
          </p>
        </div>

        <button
          onClick={() => setShowExchangeModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Process Handset Exchange</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Exchange Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700">
          Handset Trade-in & Exchange Log
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Exchange Memo #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer / Dealer</th>
              <th className="p-3">Appraised Trade-in Phone</th>
              <th className="p-3 text-right">Assessed Value</th>
              <th className="p-3">New Handset Acquired</th>
              <th className="p-3 text-right">New Price</th>
              <th className="p-3 text-right">Net Differential</th>
              <th className="p-3 text-right">Cash Paid</th>
              <th className="p-3 text-right">Balance Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phoneExchanges.map(ex => (
              <tr key={ex.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-indigo-700">{ex.exchangeNo}</td>
                <td className="p-3 text-slate-600">{formatDate(ex.date)}</td>
                <td className="p-3 font-bold text-slate-900">{ex.customerName}</td>
                <td className="p-3">
                  <div className="font-semibold text-slate-800">{ex.oldBrand} {ex.oldModel}</div>
                  <div className="font-mono text-[10px] text-slate-400">IMEI: {ex.oldIMEI}</div>
                </td>
                <td className="p-3 text-right font-bold text-rose-700">{formatBDT(ex.assessedValue)}</td>
                <td className="p-3">
                  <div className="font-bold text-emerald-800">{ex.newProductName}</div>
                  <div className="font-mono text-[10px] text-blue-600">IMEI: {ex.newIMEI}</div>
                </td>
                <td className="p-3 text-right font-bold text-slate-800">{formatBDT(ex.newPhonePrice)}</td>
                <td className="p-3 text-right font-extrabold text-slate-900">{formatBDT(ex.netPayableAmount)}</td>
                <td className="p-3 text-right font-bold text-emerald-700">{formatBDT(ex.amountPaidNow)}</td>
                <td className="p-3 text-right font-extrabold text-amber-700">{formatBDT(ex.dueAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">New Handset Trade-in & Exchange</h3>
              <button onClick={() => setShowExchangeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateExchange} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Party *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.shopName} ({c.ownerName})</option>)}
                </select>
              </div>

              {/* Part 1: Old Phone Intake */}
              <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/30 space-y-3">
                <span className="font-bold text-rose-900 uppercase text-[10px] tracking-wider block">
                  1. Pre-Owned Handset Appraisal (Intake into Pre-Owned Stock)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Old Device Brand</label>
                    <input
                      type="text"
                      value={oldBrand}
                      onChange={(e) => setOldBrand(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Old Model & Storage</label>
                    <input
                      type="text"
                      value={oldModel}
                      onChange={(e) => setOldModel(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Old 15-Digit IMEI *</label>
                    <input
                      type="text"
                      placeholder="e.g. 354891109928101"
                      value={oldIMEI}
                      onChange={(e) => setOldIMEI(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Device Physical Condition</label>
                    <select
                      value={oldCondition}
                      onChange={(e) => setOldCondition(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Open Box">Open Box / Mint (Grade A+)</option>
                      <option value="Used">Used / Normal Scratches (Grade B)</option>
                      <option value="Damaged">Damaged / Cracked Screen (Grade C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Appraised Trade-in Value (৳) *</label>
                    <input
                      type="number"
                      value={assessedValue}
                      onChange={(e) => setAssessedValue(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-rose-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: New Phone Selection */}
              <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/30 space-y-3">
                <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block">
                  2. New Handset Outward (From Central Stock)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Handset Model</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const p = products.find(pr => pr.id === e.target.value);
                        if (p?.variants[0]) setSelectedVariantId(p.variants[0].id);
                        setSelectedNewIMEI('');
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Variant / Specs</label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => {
                        setSelectedVariantId(e.target.value);
                        setSelectedNewIMEI('');
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      {currentProd?.variants.map(v => (
                        <option key={v.id} value={v.id}>{v.ram}/{v.storage} - {v.color} ({formatBDT(v.retailPrice)})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select In-Stock IMEI for New Phone *</label>
                  {availableNewImeis.length === 0 ? (
                    <div className="text-rose-600 py-1">No units currently in stock for this variant.</div>
                  ) : (
                    <select
                      value={selectedNewIMEI}
                      onChange={(e) => setSelectedNewIMEI(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    >
                      <option value="">-- Choose IMEI from Stock --</option>
                      {availableNewImeis.map(im => (
                        <option key={im.id} value={im.imei1}>{im.imei1} ({im.warehouseName})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Settlement Calculation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>New Phone Price: <b>{formatBDT(newPhonePrice)}</b></div>
                  <div>Trade-in Deduction: <b className="text-rose-700">-{formatBDT(assessedValue)}</b></div>
                  <div>Net Differential: <b className="text-base text-blue-900 font-black">{formatBDT(netPayable)}</b></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Amount Paid Now (৳)</label>
                    <input
                      type="number"
                      min="0"
                      max={netPayable}
                      value={amountPaidNow}
                      onChange={(e) => setAmountPaidNow(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Differential Due Balance (৳)</label>
                    <div className="p-2 font-bold text-amber-700 text-sm">
                      {formatBDT(dueAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowExchangeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewIMEI}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs disabled:opacity-50"
                >
                  Confirm Exchange
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
