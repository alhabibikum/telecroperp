import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  TrendingDown,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Smartphone,
  Building2,
  DollarSign,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { PriceDropClaim } from '../../types/erp';

export const PriceDropClaimView: React.FC = () => {
  const {
    priceDropClaims,
    products,
    brands,
    suppliers,
    imeis,
    createPriceDropClaim,
    updatePriceDropStatus
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaimForPrint, setSelectedClaimForPrint] = useState<any | null>(null);

  // New Claim Form
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || '');
  const [oldPrice, setOldPrice] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [announcementRef, setAnnouncementRef] = useState('CIRCULAR-Q4-PRICECUT');

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariantId) || currentProduct?.variants[0];

  // Count in-stock units for this variant
  const inStockUnits = imeis.filter(i =>
    i.productId === currentProduct?.id &&
    (!selectedVariantId || i.variantId === selectedVariantId) &&
    i.status === 'In Stock'
  ).length;

  const dropPerUnit = Math.max(0, (oldPrice || currentVariant?.purchasePrice || 0) - (newPrice || 0));
  const estimatedTotalClaim = dropPerUnit * inStockUnits;

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
      setOldPrice(prod.variants[0].purchasePrice);
      setNewPrice(Math.round(prod.variants[0].purchasePrice * 0.92));
    }
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentVariant) return;

    const brandSupplier = suppliers.find(s => s.name.toLowerCase().includes(currentProduct.brandName.toLowerCase())) || suppliers[0];

    createPriceDropClaim({
      claimDate: new Date().toISOString().split('T')[0],
      brandName: currentProduct.brandName,
      supplierId: brandSupplier?.id || 'sup-1',
      supplierName: brandSupplier?.name || 'Authorized Brand Distributor',
      productId: currentProduct.id,
      productModel: currentProduct.model,
      variantDesc: `${currentVariant.ram}/${currentVariant.storage} - ${currentVariant.color}`,
      oldPurchaseCost: oldPrice || currentVariant.purchasePrice,
      newPurchaseCost: newPrice,
      dropPerUnit,
      eligibleStockCount: inStockUnits,
      totalClaimAmount: estimatedTotalClaim,
      claimStatus: 'Submitted to Brand',
      announcementRef
    });

    setShowAddModal(false);
  };

  const totalClaimed = priceDropClaims.reduce((s, c) => s + c.totalClaimAmount, 0);
  const totalApproved = priceDropClaims.filter(c => c.claimStatus === 'Approved & Credited').reduce((s, c) => s + c.totalClaimAmount, 0);

  const filteredClaims = priceDropClaims.filter(c =>
    c.claimNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Brand Price Drop Protection & Compensation (Rebate Claims)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ব্র্যান্ডের অফিশিয়াল মূল্য হ্রাসে গুদামে থাকা অবিক্রীত ফোনের ক্ষতিপূরণ ও সাপ্লায়ার ক্রেডিট ক্লেইম
          </p>
        </div>

        <button
          onClick={() => {
            if (currentVariant) {
              setOldPrice(currentVariant.purchasePrice);
              setNewPrice(Math.round(currentVariant.purchasePrice * 0.92));
            }
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          + File New Price Protection Claim
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Price Drop Claims</div>
          <div className="text-xl font-black text-slate-900 mt-1">{priceDropClaims.length} Claims</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across brand circulars</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Total Claim Submitted
          </div>
          <div className="text-xl font-black text-rose-900 mt-1">{formatBDT(totalClaimed)}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Value of price drop compensation</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Credited
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">{formatBDT(totalApproved)}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Directly credited to ledger</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" /> Pending Adjustment
          </div>
          <div className="text-xl font-black text-blue-900 mt-1">{formatBDT(totalClaimed - totalApproved)}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Awaiting distributor CN</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claim #, phone model, brand, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Claim # & Date</th>
                <th className="py-3 px-4">Brand & Supplier</th>
                <th className="py-3 px-4">Handset Model & Variant</th>
                <th className="py-3 px-4 text-right">Price Drop (Old ➔ New)</th>
                <th className="py-3 px-4 text-center">Unsold Stock</th>
                <th className="py-3 px-4 text-right">Total Claim Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No price protection claims recorded.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-rose-600 font-mono">{claim.claimNo}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(claim.claimDate)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{claim.brandName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{claim.supplierName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{claim.productModel}</div>
                      <div className="text-[10px] text-slate-500">{claim.variantDesc}</div>
                      {claim.announcementRef && (
                        <div className="text-[9px] text-slate-400 font-mono">Ref: {claim.announcementRef}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="text-slate-500 line-through text-[11px]">{formatBDT(claim.oldPurchaseCost)}</div>
                      <div className="font-bold text-slate-900">{formatBDT(claim.newPurchaseCost)}</div>
                      <div className="text-[10px] text-rose-600 font-bold">Drop: ৳{claim.dropPerUnit.toLocaleString()}/unit</div>
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                      {claim.eligibleStockCount} Units
                    </td>

                    <td className="py-3 px-4 text-right font-black text-rose-700 text-sm">
                      {formatBDT(claim.totalClaimAmount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        claim.claimStatus === 'Approved & Credited'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : claim.claimStatus === 'Submitted to Brand'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {claim.claimStatus}
                      </span>
                      {claim.creditNoteNo && (
                        <div className="text-[9px] text-emerald-700 font-mono mt-0.5">CN: {claim.creditNoteNo}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      {claim.claimStatus === 'Submitted to Brand' && (
                        <button
                          onClick={() => updatePriceDropStatus(claim.id, 'Approved & Credited', `CN-CREDIT-${Date.now().toString().slice(-4)}`)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                        >
                          Mark Credited
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedClaimForPrint(claim)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">New Price Protection Rebate Claim</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Model *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} - {p.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Model Variant</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    const v = currentProduct?.variants.find(item => item.id === e.target.value);
                    if (v) {
                      setOldPrice(v.purchasePrice);
                      setNewPrice(Math.round(v.purchasePrice * 0.92));
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {currentProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.ram}/{v.storage} - {v.color} (Cost: {formatBDT(v.purchasePrice)})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900">Current In-Stock Handsets:</div>
                  <div className="text-[11px] text-blue-700">Eligible units in central & branch hubs</div>
                </div>
                <div className="text-xl font-black text-blue-900">{inStockUnits} Units</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Old Purchase Cost (৳)</label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Revised Purchase Cost (৳)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-rose-50 border border-rose-300 rounded-xl font-bold text-rose-900"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Price Drop per Unit:</span>
                  <strong className="text-rose-700">৳ {dropPerUnit.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Eligible Handset Count:</span>
                  <strong>{inStockUnits} Units</strong>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-rose-200 pt-1 mt-1">
                  <span className="text-slate-900">Total Claimable Rebate:</span>
                  <strong className="text-rose-700 text-base">{formatBDT(estimatedTotalClaim)}</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Circular / Announcement Ref</label>
                <input
                  type="text"
                  placeholder="e.g. SAM-BD-CIRCULAR-0928"
                  value={announcementRef}
                  onChange={(e) => setAnnouncementRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs">
                  Submit Claim to Principal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Claim Slip */}
      {selectedClaimForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Price Protection Settlement Voucher</h3>
              <button onClick={() => setSelectedClaimForPrint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border border-slate-300 rounded-xl space-y-3 font-sans text-xs bg-slate-50">
              <div className="text-center pb-2 border-b">
                <div className="font-black text-sm">TELECORP MOBILE DISTRIBUTION & TRADE LTD</div>
                <div className="text-[10px] text-slate-500">Official Brand Price Protection Claim Voucher</div>
                <div className="font-mono text-rose-700 font-bold mt-0.5">{selectedClaimForPrint.claimNo}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-400">Date:</span> <strong>{selectedClaimForPrint.claimDate}</strong></div>
                <div><span className="text-slate-400">Brand:</span> <strong>{selectedClaimForPrint.brandName}</strong></div>
                <div><span className="text-slate-400">Supplier:</span> <strong>{selectedClaimForPrint.supplierName}</strong></div>
                <div><span className="text-slate-400">Model:</span> <strong>{selectedClaimForPrint.productModel}</strong></div>
              </div>

              <div className="bg-white p-3 rounded-lg border space-y-1 text-[11px]">
                <div><span className="text-slate-500">Old Purchase Cost:</span> {formatBDT(selectedClaimForPrint.oldPurchaseCost)}</div>
                <div><span className="text-slate-500">New Purchase Cost:</span> {formatBDT(selectedClaimForPrint.newPurchaseCost)}</div>
                <div><span className="text-slate-500">Price Reduction:</span> <strong>৳{selectedClaimForPrint.dropPerUnit.toLocaleString()} per unit</strong></div>
                <div><span className="text-slate-500">Unsold Eligible Handsets:</span> <strong>{selectedClaimForPrint.eligibleStockCount} Units</strong></div>
                <div className="text-rose-700 font-bold border-t pt-1 mt-1 text-xs">
                  <span>Rebate Credit Value:</span> <span>{formatBDT(selectedClaimForPrint.totalClaimAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-6 text-[10px] font-semibold text-slate-600">
                <div className="border-t border-slate-400 pt-1">Commercial Manager</div>
                <div className="border-t border-slate-400 pt-1">Brand Principal Seal</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedClaimForPrint(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
