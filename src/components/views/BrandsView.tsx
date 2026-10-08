import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ShieldCheck,
  PlusCircle,
  Smartphone,
  Layers,
  Search,
  CheckCircle2
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { RowActions, EditModal } from '../common/CrudKit';
import type { Brand } from '../../types/erp';
import { HistoryInput } from '../common/HistoryInput';
import { recordFieldHistory } from '../../services/formHistoryService';
import { useToast } from '../common/ToastNotificationSystem';

export const BrandsView: React.FC = () => {
  const { brands, imeis, products, addBrand, updateBrand, deleteBrand } = useERP();
  const { showSuccess } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logo, setLogo] = useState('📱');
  const [description, setDescription] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    const brandName = name.trim();
    addBrand({
      name: brandName,
      code: code.toUpperCase(),
      logo: logo || '📱',
      status: 'Active',
      description
    });

    recordFieldHistory('brand', brandName);
    recordFieldHistory('description', description);

    setAddSuccessMsg(`✓ ব্র্যান্ড "${brandName}" সফলভাবে তৈরি হয়েছে! উইন্ডো খোলা রয়েছে পরবর্তী এন্ট্রির জন্য।`);
    showSuccess(
      'ব্র্যান্ড সফলভাবে যোগ করা হয়েছে!',
      `ব্র্যান্ড "${brandName}" যুক্ত হয়েছে। উইন্ডো খোলা রয়েছে পরবর্তী এন্ট্রির জন্য।`
    );

    // Reset inputs for next entry - DO NOT CLOSE WINDOW
    setName('');
    setCode('');
    setDescription('');
  };

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Multi-Brand Dealership Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized brand partnerships, official BTRC certified portfolios & distribution lines
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Mobile Brand</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map(brand => {
          const brandImeis = imeis.filter(i => i.brandName.toLowerCase() === brand.name.toLowerCase());
          const inStockCount = brandImeis.filter(i => i.status === 'In Stock').length;
          const soldCount = brandImeis.filter(i => i.status === 'Sold').length;
          const brandProds = products.filter(p => p.brandId === brand.id || p.brandName.toLowerCase() === brand.name.toLowerCase());

          return (
            <div key={brand.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{brand.logo}</div>
                <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {brand.code}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900">{brand.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{brand.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Models in Master:</span>
                  <span className="font-bold text-slate-800">{brandProds.length} Models</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">In-Stock Handsets:</span>
                  <span className="font-extrabold text-emerald-700">{inStockCount} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Units Sold:</span>
                  <span className="font-semibold text-blue-700">{soldCount} Units</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: <b className={brand.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}>{brand.status}</b></span>
                <RowActions
                  onEdit={() => setEditing(brand)}
                  onDelete={() => deleteBrand(brand.id)}
                  deleteTitle={`Delete brand ${brand.name}?`}
                  deleteMessage="Brands with product models cannot be deleted; mark them Inactive instead."
                />
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add New Smartphone Brand</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              {addSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">{addSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                  >
                    উইন্ডো বন্ধ করুন
                  </button>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <HistoryInput
                  historyKey="brand"
                  type="text"
                  placeholder="e.g. Motorola"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Code *</label>
                  <HistoryInput
                    historyKey="brandCode"
                    type="text"
                    placeholder="e.g. MOT"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    placeholder="e.g. 📱"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <HistoryInput
                  historyKey="description"
                  type="text"
                  placeholder="e.g. Authorized national distribution lineup"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          title={`Edit Brand - ${editing.name}`}
          initial={editing}
          fields={[
            { key: 'name', label: 'Brand Name', required: true },
            { key: 'code', label: 'Brand Code', required: true },
            { key: 'logo', label: 'Emoji / Icon' },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
            { key: 'description', label: 'Description / Notes', type: 'textarea' }
          ]}
          onSave={v => updateBrand(editing.id, { ...v, code: String(v.code).toUpperCase() } as Partial<Brand>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
