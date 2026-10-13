import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import type { ProductVariant } from '../../types/erp';

export type QuickCreateKind =
  | 'category'
  | 'brand'
  | 'product'
  | 'variant'
  | 'supplier'
  | 'customer'
  | 'warehouse'
  | 'salesman'
  | 'bankAccount';

interface QuickCreateRequest {
  kind: QuickCreateKind;
  relatedId?: string;
  focusTarget: HTMLElement;
  onCreated: (id: string, variant?: ProductVariant) => void;
}

interface QuickCreateModalProps {
  kind: QuickCreateKind;
  relatedId?: string;
  onClose: () => void;
  onCreated: (id: string, variant?: ProductVariant) => void;
  modalDepth?: number;
}

const fieldClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

const labelClassName = 'block text-xs font-semibold text-slate-600 dark:text-slate-300';

const categorySuggestions = ['Smartphone', 'Feature Phone', 'Tablet', 'Accessories'];

export const QuickCreateMasterDataModal: React.FC<QuickCreateModalProps> = ({
  kind,
  relatedId,
  onClose,
  onCreated,
  modalDepth = 0
}) => {
  const {
    brands,
    products,
    addBrand,
    addProduct,
    addSupplier,
    addCustomer,
    addWarehouse,
    addSalesman,
    addBankAccount,
    updateProduct
  } = useERP();
  const { onQuickCreateKeyDown, quickCreateModal } = useQuickCreateMasterData();
  const [values, setValues] = useState<Record<string, string>>({
    name: '',
    code: '',
    model: '',
    category: 'Smartphone',
    brandId: brands[0]?.id || '',
    mobile: '',
    ownerName: '',
    city: 'Dhaka',
    type: 'Central Warehouse',
    accountName: '',
    accountNumber: '',
    accountType: 'Current',
    sku: '',
    ram: '8GB',
    storage: '128GB',
    color: 'Black',
    purchasePrice: '0',
    dealerPrice: '0',
    wholesalePrice: '0',
    retailPrice: '0'
  });
  const [error, setError] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);

  const setValue = (key: string, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
    setError('');
  };

  const title = {
    category: 'নতুন প্রোডাক্ট ক্যাটাগরি যোগ করুন',
    brand: 'নতুন ব্র্যান্ড যোগ করুন',
    product: 'নতুন প্রোডাক্ট যোগ করুন',
    variant: 'নতুন ভ্যারিয়েন্ট যোগ করুন',
    supplier: 'নতুন সাপ্লায়ার যোগ করুন',
    customer: 'নতুন কাস্টমার যোগ করুন',
    warehouse: 'নতুন ওয়্যারহাউস যোগ করুন',
    salesman: 'নতুন সেলসম্যান যোগ করুন',
    bankAccount: 'নতুন ব্যাংক অ্যাকাউন্ট যোগ করুন'
  }[kind];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      let id: string;
      if (kind === 'category') {
        const name = values.name.trim();
        if (!name) {
          setError('ক্যাটাগরির নাম দিন।');
          return;
        }
        onCreated(name);
        return;
      } else if (kind === 'brand') {
        const name = values.name.trim();
        const code = values.code.trim().toUpperCase();
        if (!name || !code) {
          setError('ব্র্যান্ডের নাম ও কোড দিন।');
          return;
        }
        if (brands.some(brand => brand.name.toLowerCase() === name.toLowerCase() || brand.code.toLowerCase() === code.toLowerCase())) {
          setError('এই নাম বা কোডের ব্র্যান্ড আগে থেকেই আছে।');
          return;
        }
        id = addBrand({ name, code, logo: '📱', status: 'Active', description: '' });
      } else if (kind === 'product') {
        const model = values.model.trim();
        const brand = brands.find(item => item.id === values.brandId);
        if (!model || !brand) {
          setError('প্রোডাক্টের নাম ও ব্র্যান্ড নির্বাচন করুন।');
          return;
        }
        if ([values.purchasePrice, values.wholesalePrice, values.retailPrice].some(price => !Number.isFinite(Number(price)) || Number(price) <= 0)) {
          setError('ক্রয়, পাইকারি ও খুচরা মূল্য শূন্যের বেশি হতে হবে।');
          return;
        }
        if (products.some(product => product.brandId === brand.id && product.model.trim().toLowerCase() === model.toLowerCase())) {
          setError('এই ব্র্যান্ডে একই নামে প্রোডাক্ট আগে থেকেই আছে।');
          return;
        }
        const variantId = `var-${Date.now()}`;
        const variant: ProductVariant = {
          id: variantId,
          sku: values.sku.trim() || `${brand.code}-${model.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`,
          ram: values.ram.trim(),
          storage: values.storage.trim(),
          color: values.color.trim(),
          purchasePrice: Number(values.purchasePrice) || 0,
          dealerPrice: Number(values.dealerPrice) || 0,
          wholesalePrice: Number(values.wholesalePrice) || 0,
          retailPrice: Number(values.retailPrice) || 0,
          minSellingPrice: Number(values.wholesalePrice) || 0,
          maxDiscount: 0,
          reorderLevel: 0,
          currentStock: 0
        };
        id = addProduct({
          brandId: brand.id,
          brandName: brand.name,
          model,
          category: values.category.trim() || 'Accessories',
          networkRegion: 'Official BD (BTRC Approved)',
          warrantyPeriodMonths: 12,
          description: '',
          status: 'Active',
          variants: [variant]
        });
        onCreated(id, variant);
        return;
      } else if (kind === 'variant') {
        const product = products.find(item => item.id === relatedId);
        if (!product) {
          setError('প্রোডাক্টটি পাওয়া যায়নি।');
          return;
        }
        if (!values.ram.trim() || !values.storage.trim() || !values.color.trim()) {
          setError('RAM, স্টোরেজ ও কালার পূরণ করুন।');
          return;
        }
        if ([values.purchasePrice, values.wholesalePrice, values.retailPrice].some(price => !Number.isFinite(Number(price)) || Number(price) <= 0)) {
          setError('ক্রয়, পাইকারি ও খুচরা মূল্য শূন্যের বেশি হতে হবে।');
          return;
        }
        const variantId = `var-${Date.now()}`;
        const variant: ProductVariant = {
          id: variantId,
          sku: values.sku.trim() || `${product.model.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}-${product.variants.length + 1}`,
          ram: values.ram.trim(),
          storage: values.storage.trim(),
          color: values.color.trim(),
          purchasePrice: Number(values.purchasePrice) || 0,
          dealerPrice: Number(values.dealerPrice) || 0,
          wholesalePrice: Number(values.wholesalePrice) || 0,
          retailPrice: Number(values.retailPrice) || 0,
          minSellingPrice: Number(values.wholesalePrice) || 0,
          maxDiscount: 0,
          reorderLevel: 0,
          currentStock: 0
        };
        const result = updateProduct(product.id, { variants: [...product.variants, variant] });
        if (!result.success) {
          setError(result.error || 'ভ্যারিয়েন্ট সংরক্ষণ করা যায়নি।');
          return;
        }
        onCreated(variantId, variant);
        return;
      } else if (kind === 'supplier') {
        const name = values.name.trim();
        if (!name) {
          setError('সাপ্লায়ারের নাম দিন।');
          return;
        }
        id = addSupplier({
          name,
          companyName: name,
          contactPerson: values.ownerName.trim(),
          mobile: values.mobile.trim(),
          email: '',
          address: '',
          district: '',
          taxVatNumber: '',
          tradeLicense: '',
          openingBalance: 0,
          creditLimit: 0,
          paymentTermsDays: 30,
          currentDue: 0,
          bankInfo: '',
          status: 'Active'
        });
      } else if (kind === 'customer') {
        const shopName = values.name.trim();
        if (!shopName) {
          setError('কাস্টমার/দোকানের নাম দিন।');
          return;
        }
        id = addCustomer({
          shopName,
          ownerName: values.ownerName.trim() || shopName,
          mobile: values.mobile.trim(),
          address: '',
          area: '',
          district: '',
          creditLimit: 0,
          allowedDueDays: 0,
          customerType: 'Walk-in',
          openingBalance: 0,
          currentDue: 0,
          status: 'Active'
        });
      } else if (kind === 'warehouse') {
        const name = values.name.trim();
        if (!name) {
          setError('ওয়্যারহাউস/আউটলেটের নাম দিন।');
          return;
        }
        id = addWarehouse({
          name,
          type: values.type as 'Central Warehouse' | 'Branch Warehouse' | 'Retail Outlet' | 'Salesman Van',
          address: '',
          city: values.city.trim() || 'Dhaka',
          managerName: '',
          contactNumber: '',
          status: 'Active'
        });
      } else if (kind === 'salesman') {
        const name = values.name.trim();
        if (!name) {
          setError('সেলসম্যানের নাম দিন।');
          return;
        }
        id = addSalesman({
          name,
          mobile: values.mobile.trim(),
          email: '',
          address: '',
          joiningDate: new Date().toISOString().slice(0, 10),
          basicSalary: 0,
          commissionType: 'Percentage of Sales',
          commissionRate: 0,
          monthlyTarget: 0,
          currentMonthSales: 0,
          currentMonthCollection: 0,
          assignedArea: '',
          assignedCustomerCount: 0,
          status: 'Active'
        });
      } else {
        const bankName = values.name.trim();
        const accountName = values.accountName.trim();
        const accountNumber = values.accountNumber.trim();
        if (!bankName || !accountName || !accountNumber) {
          setError('ব্যাংকের নাম, অ্যাকাউন্টের নাম ও নম্বর পূরণ করুন।');
          return;
        }
        const result = addBankAccount({
          bankName,
          branch: '',
          accountName,
          accountNumber,
          accountType: values.accountType as 'Current' | 'Savings' | 'MFS Merchant (bKash/Nagad)',
          openingBalance: 0,
          status: 'Active'
        });
        if (!result.success || !result.id) {
          setError(result.error || 'ব্যাংক অ্যাকাউন্ট সংরক্ষণ করা যায়নি।');
          return;
        }
        id = result.id;
      }

      onCreated(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'তথ্য সংরক্ষণ করা যায়নি।');
    }
  };

  const input = (key: string, label: string, required = false, type = 'text', autoFocus = false) => (
    <label className={labelClassName}>
      {label}{required ? ' *' : ''}
      <input
        className={`${fieldClassName} mt-1`}
        type={type}
        value={values[key] || ''}
        onChange={event => setValue(key, event.target.value)}
        required={required}
        min={type === 'number' ? '0' : undefined}
        autoFocus={autoFocus}
      />
    </label>
  );

  const select = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    onKeyDown?: React.KeyboardEventHandler<HTMLSelectElement>
  ) => (
    <label className={labelClassName}>
      {label}
      <select className={`${fieldClassName} mt-1`} value={values[key]} onChange={event => setValue(key, event.target.value)} onKeyDown={onKeyDown}>
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-950/70 p-4"
      style={{ zIndex: 100 + modalDepth }}
      role="presentation"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-create-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id="quick-create-title" className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Plus className="h-4 w-4 text-blue-600" />{title}
          </h2>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            সংরক্ষণ হলে এই তথ্য মূল এন্ট্রি ফর্মে নির্বাচন হবে।
          </p>

          {kind === 'category' && input('name', 'ক্যাটাগরির নাম', true, 'text', true)}

          {kind === 'brand' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'ব্র্যান্ডের নাম', true, 'text', true)}
              {input('code', 'ব্র্যান্ড কোড', true)}
            </div>
          )}

          {kind === 'product' && (
            <div className="space-y-3">
              {input('model', 'প্রোডাক্ট/মডেলের নাম', true, 'text', true)}
              <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                {brands.length > 0
                  ? (
                    <div>
                      {select(
                        'brandId',
                        'ব্র্যান্ড',
                        brands.map(brand => ({ value: brand.id, label: brand.name })),
                        onQuickCreateKeyDown('brand', value => setValue('brandId', value))
                      )}
                    </div>
                  )
                  : <p className="text-xs text-amber-700">প্রোডাক্ট যোগ করার আগে একটি ব্র্যান্ড তৈরি করুন।</p>}
                <button type="button" onClick={() => setShowBrandModal(true)} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300">
                  + ব্র্যান্ড
                </button>
              </div>
              <label className={labelClassName}>
                ক্যাটাগরি *
                <input
                  className={`${fieldClassName} mt-1`}
                  list="quick-product-category-options"
                  value={values.category}
                  onChange={event => setValue('category', event.target.value)}
                  onKeyDown={onQuickCreateKeyDown('category', value => setValue('category', value))}
                  required
                />
                <datalist id="quick-product-category-options">
                  {categorySuggestions.map(category => <option key={category} value={category} />)}
                </datalist>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {input('ram', 'RAM')}
                {input('storage', 'স্টোরেজ')}
                {input('color', 'কালার')}
                {input('purchasePrice', 'ক্রয় মূল্য', true, 'number')}
                {input('wholesalePrice', 'পাইকারি মূল্য', true, 'number')}
                {input('retailPrice', 'খুচরা মূল্য', true, 'number')}
              </div>
              <p className="text-[11px] text-slate-500">শুরুতে একটি ভ্যারিয়েন্ট যুক্ত হবে; পরে প্রোডাক্ট সম্পাদনা করে আরও ভ্যারিয়েন্ট ও মূল্য যোগ করতে পারবেন।</p>
            </div>
          )}

          {kind === 'variant' && (
            <div className="grid grid-cols-2 gap-3">
              {input('sku', 'SKU', false, 'text', true)}
              {input('ram', 'RAM', true)}
              {input('storage', 'স্টোরেজ', true)}
              {input('color', 'কালার', true)}
              {input('purchasePrice', 'ক্রয় মূল্য', true, 'number')}
              {input('wholesalePrice', 'পাইকারি মূল্য', true, 'number')}
              {input('retailPrice', 'খুচরা মূল্য', true, 'number')}
            </div>
          )}

          {kind === 'supplier' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'সাপ্লায়ারের নাম', true, 'text', true)}
              {input('ownerName', 'যোগাযোগের ব্যক্তি')}
              {input('mobile', 'মোবাইল', false, 'tel')}
            </div>
          )}

          {kind === 'customer' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'দোকান/কাস্টমারের নাম', true, 'text', true)}
              {input('ownerName', 'মালিকের নাম')}
              {input('mobile', 'মোবাইল', false, 'tel')}
            </div>
          )}

          {kind === 'warehouse' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'ওয়্যারহাউস/আউটলেটের নাম', true, 'text', true)}
              {input('city', 'শহর', true)}
              {select('type', 'ধরন', [
                { value: 'Central Warehouse', label: 'Central Warehouse' },
                { value: 'Branch Warehouse', label: 'Branch Warehouse' },
                { value: 'Retail Outlet', label: 'Retail Outlet' },
                { value: 'Salesman Van', label: 'Salesman Van' }
              ])}
            </div>
          )}

          {kind === 'salesman' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'সেলসম্যানের নাম', true, 'text', true)}
              {input('mobile', 'মোবাইল', false, 'tel')}
            </div>
          )}

          {kind === 'bankAccount' && (
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'ব্যাংকের নাম', true, 'text', true)}
              {select('accountType', 'অ্যাকাউন্টের ধরন', [
                { value: 'Current', label: 'Current' },
                { value: 'Savings', label: 'Savings' },
                { value: 'MFS Merchant (bKash/Nagad)', label: 'MFS Merchant (bKash/Nagad)' }
              ])}
              {input('accountName', 'অ্যাকাউন্টের নাম', true)}
              {input('accountNumber', 'অ্যাকাউন্ট নম্বর', true)}
            </div>
          )}

          {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">বাতিল</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">সংরক্ষণ ও নির্বাচন</button>
          </div>
        </form>
      </section>
      {showBrandModal && (
        <QuickCreateMasterDataModal
          kind="brand"
          modalDepth={modalDepth + 1}
          onClose={() => setShowBrandModal(false)}
          onCreated={id => {
            setValue('brandId', id);
            setShowBrandModal(false);
          }}
        />
      )}
      {quickCreateModal}
    </div>
  );
};

export const useQuickCreateMasterData = () => {
  const [request, setRequest] = useState<QuickCreateRequest | null>(null);

  const onQuickCreateKeyDown = (
    kind: QuickCreateKind,
    onCreated: (id: string, variant?: ProductVariant) => void,
    relatedId?: string
  ): React.KeyboardEventHandler<HTMLSelectElement | HTMLInputElement> => event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      event.stopPropagation();
      setRequest({ kind, relatedId, focusTarget: event.currentTarget, onCreated });
    }
  };

  const closeQuickCreate = () => {
    const focusTarget = request?.focusTarget;
    setRequest(null);
    window.requestAnimationFrame(() => focusTarget?.focus());
  };

  const quickCreateModal = request ? (
    <QuickCreateMasterDataModal
      kind={request.kind}
      relatedId={request.relatedId}
      onClose={closeQuickCreate}
      onCreated={(id, variant) => {
        request.onCreated(id, variant);
        closeQuickCreate();
      }}
    />
  ) : null;

  return { onQuickCreateKeyDown, quickCreateModal };
};
