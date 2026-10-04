import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Layers,
  Search,
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  Tag,
  Barcode
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { NewProductModal } from '../modals/NewProductModal';
import { RowActions, EditModal } from '../common/CrudKit';
import type { Product, ProductVariant } from '../../types/erp';

interface InventoryViewProps {
  onOpenStockTransfer: () => void;
  onOpenIMEILookup: (imei?: string) => void;
  onSelectView?: (view: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenStockTransfer,
  onOpenIMEILookup,
  onSelectView
}) => {
  const { products, imeis, warehouses, brands, settings, updateProduct, deleteProduct } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editing, setEditing] = useState<{ product: Product; variant: ProductVariant } | null>(null);

  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const totalValuation = inStockImeis.reduce((acc, i) => acc + i.purchaseCost, 0);

  // Flatten all product variants
  const allVariants = products.flatMap(p =>
    p.variants.map(v => {
      const liveStockCount = inStockImeis.filter(i => i.productId === p.id && i.variantId === v.id).length;
      const isLowStock = liveStockCount <= v.reorderLevel;

      return {
        product: p,
        variant: v,
        liveStockCount,
        isLowStock,
        totalVariantValue: liveStockCount * v.purchasePrice
      };
    })
  ).filter(row => {
    const matchesSearch =
      row.product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.product.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.variant.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.variant.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrand === 'All' || row.product.brandName.toLowerCase() === selectedBrand.toLowerCase();

    return matchesSearch && matchesBrand;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Inventory & Multi-Warehouse Stock Valuation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Valuation Method: <b className="text-blue-700">{settings.valuationMethod}</b> • Reorder level alerts & Serialized IMEI tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSelectView && (
            <button
              onClick={() => onSelectView('barcode-labels')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Barcode className="w-4 h-4 text-blue-600" />
              <span>Barcode Labels</span>
            </button>
          )}

          <button
            onClick={onOpenStockTransfer}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Stock</span>
          </button>

          <button
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product & Variants</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Net Stock Valuation ({settings.valuationMethod})</div>
          <div className="text-lg font-black text-slate-900 mt-1">{formatBDT(totalValuation)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Physical Handsets</div>
          <div className="text-lg font-black text-blue-700 mt-1">{inStockImeis.length} In-Stock Units</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Low Stock SKU Alerts</div>
          <div className="text-lg font-black text-rose-600 mt-1">
            {allVariants.filter(v => v.isLowStock).length} SKUs Approaching Reorder
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Active Hubs & Outlets</div>
          <div className="text-lg font-black text-emerald-700 mt-1">{warehouses.length} Facilities</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, model name, color, specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-semibold">Filter Brand:</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
          >
            <option value="All">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="p-3">Model / Description</th>
                <th className="p-3">SKU & Specs</th>
                <th className="p-3">Region & Approval</th>
                <th className="p-3 text-right">Cost (৳)</th>
                <th className="p-3 text-right">Wholesale (৳)</th>
                <th className="p-3 text-right">Retail / MRP (৳)</th>
                <th className="p-3 text-center">Reorder Lvl</th>
                <th className="p-3 text-center">Live In-Stock</th>
                <th className="p-3 text-right">Total Valuation</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allVariants.map(({ product, variant, liveStockCount, isLowStock, totalVariantValue }) => (
                <tr key={variant.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                        {product.brandName}
                      </span>
                      <span>{product.model}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-slate-800 font-semibold">{variant.sku}</div>
                    <div className="text-[10px] text-slate-500">{variant.ram}/{variant.storage} • {variant.color}</div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      {product.networkRegion}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-slate-700">
                    {formatBDT(variant.purchasePrice)}
                  </td>
                  <td className="p-3 text-right font-bold text-blue-700">
                    {formatBDT(variant.wholesalePrice)}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatBDT(variant.retailPrice)}
                  </td>
                  <td className="p-3 text-center text-slate-500 font-medium">
                    {variant.reorderLevel}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                      isLowStock
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {liveStockCount} Units
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-slate-900">
                    {formatBDT(totalVariantValue)}
                  </td>
                  <td className="p-3 text-right">
                    <RowActions
                      onEdit={() => setEditing({ product, variant })}
                      onDelete={() => deleteProduct(product.id)}
                      deleteTitle={`Delete ${product.model}?`}
                      deleteMessage={`This removes the model ${product.brandName} ${product.model} and all its variants. Models that already have IMEI records cannot be deleted; mark them Discontinued instead.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      <NewProductModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
      />

      {editing && (
        <EditModal
          title={`Edit ${editing.product.brandName} ${editing.product.model} - ${editing.variant.sku}`}
          initial={{
            model: editing.product.model,
            category: editing.product.category,
            networkRegion: editing.product.networkRegion,
            warrantyPeriodMonths: editing.product.warrantyPeriodMonths,
            status: editing.product.status,
            description: editing.product.description,
            sku: editing.variant.sku,
            ram: editing.variant.ram,
            storage: editing.variant.storage,
            color: editing.variant.color,
            purchasePrice: editing.variant.purchasePrice,
            dealerPrice: editing.variant.dealerPrice,
            wholesalePrice: editing.variant.wholesalePrice,
            retailPrice: editing.variant.retailPrice,
            minSellingPrice: editing.variant.minSellingPrice,
            maxDiscount: editing.variant.maxDiscount,
            reorderLevel: editing.variant.reorderLevel
          }}
          fields={[
            { key: 'model', label: 'Model Name', required: true },
            { key: 'category', label: 'Category', type: 'select', options: ['Smartphone', 'Feature Phone', 'Tablet', 'Accessories'] },
            { key: 'networkRegion', label: 'Network / Region' },
            { key: 'warrantyPeriodMonths', label: 'Warranty (months)', type: 'number' },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Discontinued'] },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'sku', label: 'Variant SKU', required: true },
            { key: 'ram', label: 'RAM' },
            { key: 'storage', label: 'Storage' },
            { key: 'color', label: 'Color' },
            { key: 'purchasePrice', label: 'Purchase Cost (৳)', type: 'number' },
            { key: 'dealerPrice', label: 'Dealer Price (৳)', type: 'number' },
            { key: 'wholesalePrice', label: 'Wholesale Price (৳)', type: 'number' },
            { key: 'retailPrice', label: 'Retail / MRP (৳)', type: 'number' },
            { key: 'minSellingPrice', label: 'Minimum Selling Price (৳)', type: 'number' },
            { key: 'maxDiscount', label: 'Max Discount (৳)', type: 'number' },
            { key: 'reorderLevel', label: 'Reorder Level', type: 'number' }
          ]}
          onSave={v => {
            const { model, category, networkRegion, warrantyPeriodMonths, status, description, ...variantFields } = v;
            const variants = editing.product.variants.map(x =>
              x.id === editing.variant.id ? { ...x, ...(variantFields as Partial<ProductVariant>) } : x
            );
            return updateProduct(editing.product.id, {
              model,
              category,
              networkRegion,
              warrantyPeriodMonths,
              status,
              description,
              variants
            } as Partial<Product>);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
