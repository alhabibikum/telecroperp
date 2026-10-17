import assert from 'node:assert/strict';
import test from 'node:test';
import type { Dispatch, SetStateAction } from 'react';
import type { Brand, Product, IMEIRecord } from '../../types/erp';
import { executeImportProducts, type ProductImportContext } from './masterDataActions';

const brand: Brand = {
  id: 'brand-1',
  name: 'Firoza Mobile',
  code: 'FIR',
  logo: '',
  status: 'Active',
  description: ''
};

const makeContext = (initialProducts: Product[] = []) => {
  let products = initialProducts;
  let imeis: IMEIRecord[] = [];
  const changes: Array<{ operation: string; id: string; data: unknown }> = [];
  const context: ProductImportContext = {
    products,
    setProducts: ((update: SetStateAction<Product[]>) => {
      products = typeof update === 'function' ? update(products) : update;
      context.products = products;
    }) as Dispatch<SetStateAction<Product[]>>,
    brands: [brand],
    imeis,
    setImeis: ((update: SetStateAction<IMEIRecord[]>) => {
      imeis = typeof update === 'function' ? update(imeis) : update;
      context.imeis = imeis;
    }) as Dispatch<SetStateAction<IMEIRecord[]>>,
    enqueueChange: (_table, operation, id, data) => changes.push({ operation, id, data }),
    addAudit: () => undefined
  };
  return {
    context,
    changes,
    get products() { return products; }
  };
};

const importRow = (sku: string, model = 'F-Phone') => ({
  brandName: brand.name,
  model,
  sku,
  category: 'Smartphone',
  networkRegion: 'Official BD',
  warrantyPeriodMonths: 12,
  status: 'Active',
  purchasePrice: 1000,
  dealerPrice: 1100,
  wholesalePrice: 1200,
  retailPrice: 1500,
  minSellingPrice: 1250,
  maxDiscount: 100,
  reorderLevel: 5
});

test('imports multiple variants into one product and initializes stock at zero', () => {
  const store = makeContext();
  const result = executeImportProducts([
    { ...importRow('SKU-1'), ram: '4GB', storage: '64GB', color: 'Black' },
    { ...importRow('SKU-2'), ram: '8GB', storage: '128GB', color: 'Blue' }
  ], store.context);

  assert.deepEqual(result, { success: true, count: 2 });
  assert.equal(store.products.length, 1);
  assert.equal(store.products[0].variants.length, 2);
  assert.deepEqual(store.products[0].variants.map(variant => variant.currentStock), [0, 0]);
  assert.deepEqual(store.changes.map(change => change.operation), ['INSERT']);
});

test('updates matching product variants while preserving live stock and unlisted variants', () => {
  const existing: Product = {
    id: 'prod-1',
    brandId: brand.id,
    brandName: brand.name,
    model: 'F-Phone',
    category: 'Smartphone',
    networkRegion: 'Official BD',
    warrantyPeriodMonths: 12,
    description: '',
    status: 'Active',
    variants: [
      {
        id: 'var-1',
        sku: 'SKU-1',
        ram: '4GB',
        storage: '64GB',
        color: 'Black',
        purchasePrice: 900,
        dealerPrice: 1000,
        wholesalePrice: 1100,
        retailPrice: 1300,
        minSellingPrice: 1200,
        maxDiscount: 50,
        reorderLevel: 4,
        currentStock: 7
      },
      {
        id: 'var-2',
        sku: 'SKU-2',
        ram: '8GB',
        storage: '128GB',
        color: 'Blue',
        purchasePrice: 900,
        dealerPrice: 1000,
        wholesalePrice: 1100,
        retailPrice: 1300,
        minSellingPrice: 1200,
        maxDiscount: 50,
        reorderLevel: 4,
        currentStock: 3
      }
    ]
  };
  const store = makeContext([existing]);
  const result = executeImportProducts([{
    ...importRow('SKU-1'),
    productId: existing.id,
    variantId: 'var-1',
    currentStock: 999,
    retailPrice: 1600
  }], store.context);

  assert.deepEqual(result, { success: true, count: 1 });
  assert.equal(store.products.length, 1);
  assert.equal(store.products[0].variants.length, 2);
  assert.equal(store.products[0].variants[0].id, 'var-1');
  assert.equal(store.products[0].variants[0].currentStock, 7);
  assert.equal(store.products[0].variants[0].retailPrice, 1600);
  assert.equal(store.products[0].variants[1].currentStock, 3);
  assert.deepEqual(store.changes.map(change => change.operation), ['UPDATE']);
});

test('rejects the complete import when a row is invalid', () => {
  const store = makeContext();
  const initial = store.products;
  const result = executeImportProducts([
    importRow('SKU-1'),
    { ...importRow('SKU-2'), purchasePrice: -1 }
  ], store.context);

  assert.equal(result.success, false);
  assert.match(result.error || '', /Row 3/);
  assert.equal(store.products, initial);
  assert.equal(store.changes.length, 0);
});
