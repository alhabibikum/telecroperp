import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Barcode,
  Printer,
  Filter,
  CheckSquare,
  Square,
  Smartphone,
  Tag,
  ShieldCheck,
  Layers,
  Settings,
  SlidersHorizontal
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const BarcodeLabelView: React.FC = () => {
  const { products, imeis, brands } = useERP();

  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || '');
  const [labelSize, setLabelSize] = useState<'50x30' | '40x25' | 'A4'>('50x30');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);

  const filteredProducts = selectedBrand === 'All'
    ? products
    : products.filter(p => p.brandName === selectedBrand);

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentVariant = currentProduct?.variants.find(v => v.id === selectedVariantId) || currentProduct?.variants[0];

  // In-stock IMEIs for current product/variant
  const availableImeis = imeis.filter(i =>
    i.productId === currentProduct?.id &&
    (!selectedVariantId || i.variantId === selectedVariantId) &&
    i.status === 'In Stock'
  );

  const handleSelectAll = () => {
    if (selectedImeis.length === availableImeis.length) {
      setSelectedImeis([]);
    } else {
      setSelectedImeis(availableImeis.map(i => i.imei1));
    }
  };

  const toggleImeiSelect = (imeiNum: string) => {
    setSelectedImeis(prev =>
      prev.includes(imeiNum)
        ? prev.filter(i => i !== imeiNum)
        : [...prev, imeiNum]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner - hidden during print */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Barcode & QR Box Label Printing Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            মোবাইল ফোনের বক্স স্টিকার, আইএমইআই বারকোড ও থার্মাল লেবেল সরাসরি প্রিন্ট করুন (BTRC TAC & MRP ফরম্যাট)
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={selectedImeis.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition ${
            selectedImeis.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Printer className="w-4 h-4" />
          Print {selectedImeis.length} Labels
        </button>
      </div>

      {/* Control Panel - hidden during print */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Filter</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                const firstP = e.target.value === 'All' ? products[0] : products.find(p => p.brandName === e.target.value);
                if (firstP) {
                  setSelectedProductId(firstP.id);
                  setSelectedVariantId(firstP.variants[0]?.id || '');
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Model *</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if (prod && prod.variants.length > 0) {
                  setSelectedVariantId(prod.variants[0].id);
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brandName} - {p.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Variant (RAM/ROM/Color)</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {currentProduct?.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.ram}/{v.storage} - {v.color} ({formatBDT(v.retailPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Label Layout & Size</label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="50x30">Thermal 50mm x 30mm (Standard Phone Box)</option>
              <option value="40x25">Thermal 40mm x 25mm (Compact Retail)</option>
              <option value="A4">A4 Sheet (24 Labels per page)</option>
            </select>
          </div>
        </div>

        {/* In-Stock IMEI Selection Area */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Available In-Stock IMEIs ({availableImeis.length} available)</span>
            </div>

            {availableImeis.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                {selectedImeis.length === availableImeis.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Select All ({availableImeis.length})
                  </>
                )}
              </button>
            )}
          </div>

          {availableImeis.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
              No in-stock units found for this model/variant. Try selecting another model or variant.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {availableImeis.map(i => {
                const isSelected = selectedImeis.includes(i.imei1);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleImeiSelect(i.imei1)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-mono text-[11px] leading-tight">{i.imei1}</div>
                      <div className="text-[10px] text-slate-400 truncate">{i.variantDesc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Label Print Preview Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="print:hidden flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Print Preview ({selectedImeis.length} stickers selected)</span>
          </div>

          <div className="text-xs text-slate-400">
            Formatted for Direct Thermal / Barcode Printers
          </div>
        </div>

        {selectedImeis.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Please select at least one IMEI above to generate barcode labels.
          </div>
        ) : (
          <div className={`grid gap-4 ${
            labelSize === 'A4'
              ? 'grid-cols-2 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          }`}>
            {selectedImeis.map((imeiNum, idx) => {
              const imeiRecord = imeis.find(i => i.imei1 === imeiNum);
              return (
                <div
                  key={idx}
                  className="bg-white p-3 border border-slate-300 rounded-lg shadow-2xs font-mono text-[10px] space-y-1.5 break-inside-avoid print:border-black print:shadow-none"
                  style={{ minWidth: '220px' }}
                >
                  {/* Brand & Model Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-1">
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        {currentProduct?.brandName} {currentProduct?.model}
                      </div>
                      <div className="text-[9px] text-slate-600">
                        {currentVariant?.ram}/{currentVariant?.storage} • {currentVariant?.color}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm">
                      BTRC TAC
                    </span>
                  </div>

                  {/* IMEI 1 Barcode Simulation */}
                  <div className="text-center pt-0.5">
                    <div className="text-[8px] font-bold text-slate-500 text-left">IMEI 1:</div>
                    {/* Barcode Lines Graphic */}
                    <div className="flex justify-center items-center gap-[1.5px] py-1 h-7 bg-white">
                      {imeiNum.split('').map((char, cIdx) => {
                        const num = parseInt(char) || 1;
                        return (
                          <div
                            key={cIdx}
                            className="bg-black"
                            style={{
                              width: num % 2 === 0 ? '2px' : '1px',
                              height: num % 3 === 0 ? '100%' : '85%'
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="font-bold text-[10px] tracking-wider text-slate-800">
                      {imeiNum}
                    </div>
                  </div>

                  {/* IMEI 2 / Serial */}
                  {imeiRecord?.imei2 && (
                    <div className="text-[9px] text-slate-600 flex justify-between border-t border-slate-100 pt-0.5">
                      <span>IMEI 2:</span>
                      <span className="font-semibold">{imeiRecord.imei2}</span>
                    </div>
                  )}

                  {/* Price & Warranty Footer */}
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1 text-[9px] font-sans">
                    <div>
                      <span className="text-slate-400">MRP: </span>
                      <strong className="text-slate-900">{formatBDT(currentVariant?.retailPrice)}</strong>
                    </div>
                    <div className="text-slate-500 text-[8px]">
                      {currentProduct?.warrantyPeriodMonths || 12} Mo Warranty
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
