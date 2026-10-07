import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle,
  Tag
} from 'lucide-react';
import { ProductVariant } from '../../types/erp';
import { useFormKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';
import { UnsavedChangesDialog } from '../common/UnsavedChangesDialog';
import { WindowsModalFrame } from '../common/WindowsModalFrame';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
  const { brands, addProduct } = useERP();

  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<any>('Smartphone');
  const [networkRegion, setNetworkRegion] = useState('Official BD (BTRC Approved)');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [description, setDescription] = useState('');

  // Variants
  const [variants, setVariants] = useState<Array<Omit<ProductVariant, 'id' | 'currentStock'>>>([
    {
      sku: 'SAM-NEW-8-128',
      ram: '8GB',
      storage: '128GB',
      color: 'Midnight Black',
      purchasePrice: 40000,
      dealerPrice: 44000,
      wholesalePrice: 45000,
      retailPrice: 49999,
      minSellingPrice: 43500,
      maxDiscount: 5,
      reorderLevel: 5
    }
  ]);

  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const isFormDirty = model.trim().length > 0 || description.trim().length > 0;

  const handleRequestClose = () => {
    if (isFormDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const { containerRef, onKeyDown } = useFormKeyboardNavigation({
    isOpen,
    autoFocusFirst: true,
    onCancel: handleRequestClose
  });

  if (!isOpen) return null;

  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        sku: `${model.substring(0, 3).toUpperCase()}-${prev.length + 1}`,
        ram: '8GB',
        storage: '256GB',
        color: 'Titanium Silver',
        purchasePrice: 45000,
        dealerPrice: 49000,
        wholesalePrice: 50000,
        retailPrice: 54999,
        minSellingPrice: 48500,
        maxDiscount: 5,
        reorderLevel: 5
      }
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const br = brands.find(b => b.id === brandId);
    if (!br || !model) return;

    addProduct({
      brandId: br.id,
      brandName: br.name,
      model,
      category,
      networkRegion,
      warrantyPeriodMonths: warrantyMonths,
      description,
      status: 'Active',
      variants: variants.map((v, i) => ({
        ...v,
        id: `var-${Date.now()}-${i}`,
        currentStock: 0
      }))
    });

    onClose();
  };

  return (
    <>
      <WindowsModalFrame
        isOpen={isOpen}
        onClose={handleRequestClose}
        onSkip={handleRequestClose}
        modalId="modal-new-product"
        title="নতুন প্রোডাক্ট ও ভ্যারিয়েন্ট এন্ট্রি (Add Product Master)"
        subtitle="Define pricing tiers, storage options & warranty"
        icon={<Smartphone className="w-4 h-4 text-blue-400" />}
        maxWidth="max-w-4xl"
      >
        <form ref={containerRef as any} onKeyDown={onKeyDown} onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto bg-white/40 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              >
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Handset Model Name *</label>
              <input
                type="text"
                placeholder="e.g. Galaxy A55 5G"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Network & BTRC Approval</label>
              <input
                type="text"
                value={networkRegion}
                onChange={(e) => setNetworkRegion(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Variants section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Product Variations & Multi-Tier Pricing
              </span>
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">SKU Code</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, sku: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">RAM & ROM</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={v.ram}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants(prev => prev.map((item, i) => i === idx ? { ...item, ram: val } : item));
                          }}
                          placeholder="8GB"
                          className="w-1/2 p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={v.storage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants(prev => prev.map((item, i) => i === idx ? { ...item, storage: val } : item));
                          }}
                          placeholder="128GB"
                          className="w-1/2 p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Color</label>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, color: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Reorder Level</label>
                      <input
                        type="number"
                        value={v.reorderLevel}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, reorderLevel: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Purchase Cost (৳)</label>
                      <input
                        type="number"
                        value={v.purchasePrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, purchasePrice: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Dealer Price (৳)</label>
                      <input
                        type="number"
                        value={v.dealerPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, dealerPrice: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Wholesale Price (৳)</label>
                      <input
                        type="number"
                        value={v.wholesalePrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setVariants(prev => prev.map((item, i) => i === idx ? { ...item, wholesalePrice: val } : item));
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-indigo-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Retail MRP (৳)</label>
                        <input
                          type="number"
                          value={v.retailPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setVariants(prev => prev.map((item, i) => i === idx ? { ...item, retailPrice: val } : item));
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-emerald-700"
                        />
                      </div>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-slate-400 hover:text-rose-600 mt-4 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/80 rounded-xl transition cursor-pointer"
            >
              Cancel <kbd className="ml-1 text-[10px] font-mono opacity-60">Esc</kbd>
            </button>
            <button
              type="submit"
              data-action="save"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Save Product Master</span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">Ctrl+Enter</kbd>
            </button>
          </div>
        </form>
      </WindowsModalFrame>

      <UnsavedChangesDialog
        isOpen={showUnsavedPrompt}
        onCancel={() => setShowUnsavedPrompt(false)}
        onConfirmDiscard={() => {
          setShowUnsavedPrompt(false);
          onClose();
        }}
        title="নতুন প্রোডাক্ট এন্ট্রি বাতিল করবেন? (Discard Product Entry?)"
        message="আপনি ইতিমধ্যে মডেল বা বিবরণ লিখেছেন। এখন বাতিল করলে কোনো নতুন প্রোডাক্ট সংরক্ষিত হবে না।"
      />
    </>
  );
};
