import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Award,
  TrendingUp,
  Target,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  X
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const BrandIncentivesView: React.FC = () => {
  const {
    brandIncentives,
    brands,
    salesInvoices,
    products,
    addBrandIncentiveScheme,
    updateBrandIncentiveStatus
  } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '');
  const [schemeTitle, setSchemeTitle] = useState('');
  const [period, setPeriod] = useState('Q4 2026 (Oct 01 - Dec 31)');
  const [targetUnits, setTargetUnits] = useState<number>(100);
  const [slab1Units, setSlab1Units] = useState<number>(30);
  const [slab1Rate, setSlab1Rate] = useState<number>(300);
  const [slab2Units, setSlab2Units] = useState<number>(60);
  const [slab2Rate, setSlab2Rate] = useState<number>(600);
  const [slab3Units, setSlab3Units] = useState<number>(100);
  const [slab3Rate, setSlab3Rate] = useState<number>(1000);

  const getSchemeProgress = (scheme: (typeof brandIncentives)[0]) => {
    const brandSalesUnits = salesInvoices.reduce((acc, inv) => {
      if (scheme.startDate && scheme.endDate) {
        if (inv.invoiceDate < scheme.startDate || inv.invoiceDate > scheme.endDate) {
          return acc;
        }
      }
      const bItems = inv.items.filter(it => {
        const prod = products.find(p => p.id === it.productId);
        return (
          (prod && prod.brandName.toLowerCase() === scheme.brandName.toLowerCase()) ||
          it.productName.toLowerCase().includes(scheme.brandName.toLowerCase())
        );
      });
      return acc + bItems.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    const units = Math.max(scheme.achievedUnits, brandSalesUnits);
    let earnedRate = 0;
    if (scheme.slabs && scheme.slabs.length > 0) {
      const sortedSlabs = [...scheme.slabs].sort((a, b) => b.minUnits - a.minUnits);
      const qualifyingSlab = sortedSlabs.find(s => units >= s.minUnits);
      if (qualifyingSlab) {
        earnedRate = qualifyingSlab.incentivePerUnit;
      }
    }
    const totalEarned = units * earnedRate;
    return {
      achievedUnits: units,
      totalIncentiveEarned: totalEarned > 0 ? totalEarned : scheme.totalIncentiveEarned
    };
  };

  const schemeProgressList = brandIncentives.map(s => ({
    scheme: s,
    ...getSchemeProgress(s)
  }));

  const totalEarnedAcrossSchemes = schemeProgressList.reduce((sum, s) => sum + s.totalIncentiveEarned, 0);
  const totalTargetUnits = brandIncentives.reduce((sum, s) => sum + s.targetUnits, 0);
  const totalAchievedUnits = schemeProgressList.reduce((sum, s) => sum + s.achievedUnits, 0);

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = brands.find(b => b.id === selectedBrandId);
    if (!brand || !schemeTitle) return;

    addBrandIncentiveScheme({
      brandId: brand.id,
      brandName: brand.name,
      schemeTitle,
      period,
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      targetUnits,
      achievedUnits: 0,
      slabs: [
        { minUnits: slab1Units, incentivePerUnit: slab1Rate },
        { minUnits: slab2Units, incentivePerUnit: slab2Rate },
        { minUnits: slab3Units, incentivePerUnit: slab3Rate }
      ],
      totalIncentiveEarned: 0,
      claimStatus: 'In Progress'
    });

    setShowAddModal(false);
    setSchemeTitle('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Brand Volume Target & Incentive Slabs (Kickback Tracker)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            স্মার্টফোন ব্র্যান্ডগুলোর কোয়ার্টারলি ও ফেস্টিভ্যাল ভলিউম টার্গেট, স্ল্যাব রিবেট ও সাপ্লায়ার ক্রেডিট ক্লেইম
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          + New Brand Incentive Program
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Target Volume
          </div>
          <div className="text-xl font-black text-slate-800 mt-1">
            {totalTargetUnits} Units
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across active brand programs</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Achieved Volume
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">
            {totalAchievedUnits} Units
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {totalTargetUnits > 0 ? Math.round((totalAchievedUnits / totalTargetUnits) * 100) : 0}% Target Fulfilled
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            Total Earned Rebates
          </div>
          <div className="text-xl font-black text-amber-800 mt-1">
            {formatBDT(totalEarnedAcrossSchemes)}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Accrued dealer kickbacks</div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            Active Programs
          </div>
          <div className="text-xl font-black text-blue-800 mt-1">
            {brandIncentives.length} Schemes
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Samsung, Xiaomi, Vivo</div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemeProgressList.map(({ scheme, achievedUnits, totalIncentiveEarned }) => {
          const progressPercent = Math.min(100, Math.round((achievedUnits / scheme.targetUnits) * 100));

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] rounded-md">
                      {scheme.brandName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      scheme.claimStatus === 'Approved & Credited' || scheme.claimStatus === 'Settled'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : scheme.claimStatus === 'Claim Submitted'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {scheme.claimStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                    {scheme.schemeTitle}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{scheme.period}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Earned Bonus</div>
                  <div className="text-base font-black text-amber-700">
                    {formatBDT(totalIncentiveEarned)}
                  </div>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Volume Progress</span>
                  <span className="text-slate-900">
                    {achievedUnits} / {scheme.targetUnits} Units ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progressPercent >= 100
                        ? 'bg-emerald-500'
                        : progressPercent >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Slabs Multi-tier Breakdown */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Target Slabs & Incentive Rates:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {scheme.slabs.map((slab, sIdx) => {
                    const isQualified = scheme.achievedUnits >= slab.minUnits;
                    return (
                      <div
                        key={sIdx}
                        className={`p-2 rounded-lg border transition ${
                          isQualified
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400">Tier {sIdx + 1} ({slab.minUnits}+ Units)</div>
                        <div className="font-extrabold mt-0.5 text-xs">৳{slab.incentivePerUnit}/unit</div>
                        {isQualified && (
                          <div className="text-[9px] text-emerald-600 font-semibold mt-0.5 flex items-center justify-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Qualified
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {scheme.claimStatus === 'In Progress' && (
                  <button
                    onClick={() => updateBrandIncentiveStatus(scheme.id, 'Claim Submitted')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Submit Claim to {scheme.brandName}
                  </button>
                )}

                {scheme.claimStatus === 'Claim Submitted' && (
                  <button
                    onClick={() => updateBrandIncentiveStatus(scheme.id, 'Approved & Credited', 'CN-2026-0044')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  >
                    Mark Credited to Supplier Ledger
                  </button>
                )}

                {(scheme.claimStatus === 'Approved & Credited' || scheme.claimStatus === 'Settled') && (
                  <div className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Rebate Credited via CN #{scheme.supplierCreditNoteNo || 'CN-2026-0044'}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 font-medium">
                  {scheme.targetUnits - scheme.achievedUnits > 0
                    ? `${scheme.targetUnits - scheme.achievedUnits} units remaining for next slab`
                    : 'Target Goal Achieved!'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Incentive Program Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">New Brand Incentive Scheme</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Principal *</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program / Campaign Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Mega Puja Carnival Target"
                  value={schemeTitle}
                  onChange={(e) => setSchemeTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validity Period</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Target (Units)</label>
                  <input
                    type="number"
                    value={targetUnits}
                    onChange={(e) => setTargetUnits(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Configured Volume Slabs
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Tier 1 Units</label>
                    <input
                      type="number"
                      value={slab1Units}
                      onChange={(e) => setSlab1Units(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold"
                    />
                    <label className="text-[10px] text-slate-500 mt-1 block">Bonus ৳/unit</label>
                    <input
                      type="number"
                      value={slab1Rate}
                      onChange={(e) => setSlab1Rate(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Tier 2 Units</label>
                    <input
                      type="number"
                      value={slab2Units}
                      onChange={(e) => setSlab2Units(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold"
                    />
                    <label className="text-[10px] text-slate-500 mt-1 block">Bonus ৳/unit</label>
                    <input
                      type="number"
                      value={slab2Rate}
                      onChange={(e) => setSlab2Rate(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Tier 3 Units</label>
                    <input
                      type="number"
                      value={slab3Units}
                      onChange={(e) => setSlab3Units(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold"
                    />
                    <label className="text-[10px] text-slate-500 mt-1 block">Bonus ৳/unit</label>
                    <input
                      type="number"
                      value={slab3Rate}
                      onChange={(e) => setSlab3Rate(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Incentive Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
