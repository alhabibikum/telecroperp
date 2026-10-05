import type React from 'react';
import type {
  Brand,
  Product,
  IMEIRecord,
  Warehouse,
  Supplier,
  Customer,
  Salesman,
  StockTransfer,
  SalesmanVisit,
  CustomerFollowUp,
  WarrantyClaim,
  BrandIncentiveScheme,
  SmsLog,
  SalesInvoice,
  PurchaseInvoice,
  AuthUser,
  CrudResult,
  UserRole
} from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';
import { EnqueueChangeFn, AddAuditFn } from './types';
import { fail, todayStr } from './helpers';

export interface MasterDataContextBundle {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  imeis: IMEIRecord[];
  setImeis: React.Dispatch<React.SetStateAction<IMEIRecord[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  salesmen: Salesman[];
  setSalesmen: React.Dispatch<React.SetStateAction<Salesman[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  stockTransfers: StockTransfer[];
  setStockTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
  salesmanVisits: SalesmanVisit[];
  setSalesmanVisits: React.Dispatch<React.SetStateAction<SalesmanVisit[]>>;
  customerFollowUps: CustomerFollowUp[];
  setCustomerFollowUps: React.Dispatch<React.SetStateAction<CustomerFollowUp[]>>;
  warrantyClaims: WarrantyClaim[];
  setWarrantyClaims: React.Dispatch<React.SetStateAction<WarrantyClaim[]>>;
  brandIncentives: BrandIncentiveScheme[];
  setBrandIncentives: React.Dispatch<React.SetStateAction<BrandIncentiveScheme[]>>;
  smsLogs: SmsLog[];
  setSmsLogs: React.Dispatch<React.SetStateAction<SmsLog[]>>;
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  setPurchaseInvoices: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  currentUser: AuthUser | null;
  currentUserRole: UserRole;
  enqueueChange: EnqueueChangeFn;
  addAudit: AddAuditFn;
}

// ---- BRANDS ----
export const executeAddBrand = (
  b: Omit<Brand, 'id'>,
  ctx: MasterDataContextBundle
) => {
  const { setBrands, enqueueChange, addAudit } = ctx;
  const id = `brand-${Date.now()}`;
  const newBrand = { ...b, id };
  setBrands(prev => [...prev, newBrand]);
  enqueueChange('brands', 'INSERT', id, newBrand, `নতুন ব্র্যান্ড যুক্ত (${b.name})`);
  addAudit('Added Brand', 'Brand Master', b.code, undefined, b.name);
};

export const executeUpdateBrand = (
  id: string,
  data: Partial<Omit<Brand, 'id'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { brands, setBrands, setProducts, setImeis, enqueueChange, addAudit } = ctx;
  const old = brands.find(b => b.id === id);
  if (!old) return fail('Brand not found.');
  if (data.code && brands.some(b => b.id !== id && b.code.toLowerCase() === data.code!.toLowerCase())) {
    return fail(`Brand code ${data.code} is already used by another brand.`);
  }
  setBrands(prev => prev.map(b => (b.id === id ? { ...b, ...data } : b)));
  if (data.name && data.name !== old.name) {
    setProducts(prev => prev.map(p => (p.brandId === id ? { ...p, brandName: data.name! } : p)));
    setImeis(prev => prev.map(i => (i.brandName === old.name ? { ...i, brandName: data.name! } : i)));
  }
  enqueueChange('brands', 'UPDATE', id, { ...old, ...data }, `ব্র্যান্ড আপডেট (${data.name || old.name})`);
  addAudit('Updated Brand', 'Brand Master', old.code, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteBrand = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { brands, setBrands, products, enqueueChange, addAudit } = ctx;
  const brand = brands.find(b => b.id === id);
  if (!brand) return fail('Brand not found.');
  const used = products.filter(p => p.brandId === id).length;
  if (used > 0) return fail(`Cannot delete: ${used} product model(s) belong to ${brand.name}. Delete or reassign them first, or mark the brand Inactive.`);
  setBrands(prev => prev.filter(b => b.id !== id));
  enqueueChange('brands', 'DELETE', id, null, `ব্র্যান্ড মুছে ফেলা (${brand.name})`);
  addAudit('Deleted Brand', 'Brand Master', brand.code, brand.name);
  return { success: true };
};

// ---- PRODUCTS ----
export const executeAddProduct = (
  p: Omit<Product, 'id'>,
  ctx: MasterDataContextBundle
) => {
  const { setProducts, enqueueChange, addAudit } = ctx;
  const id = `prod-${Date.now()}`;
  const newProd = { ...p, id };
  setProducts(prev => [...prev, newProd]);
  enqueueChange('products', 'INSERT', id, newProd, `নতুন প্রোডাক্ট মডেল যুক্ত (${p.model})`);
  addAudit('Added Product Model', 'Product Master', p.model, undefined, `${p.brandName} - ${p.model}`);
};

export const executeUpdateProduct = (
  id: string,
  data: Partial<Omit<Product, 'id'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { products, setProducts, imeis, setImeis, enqueueChange, addAudit } = ctx;
  const old = products.find(p => p.id === id);
  if (!old) return fail('Product not found.');
  let variants = old.variants;
  if (data.variants) {
    const removed = old.variants.filter(ov => !data.variants!.some(nv => nv.id === ov.id));
    for (const rv of removed) {
      if (imeis.some(i => i.variantId === rv.id)) {
        return fail(`Cannot remove variant ${rv.sku}: IMEI records exist for it.`);
      }
    }
    // Stock is system-controlled (purchases/sales) - never overwritten by an edit form.
    variants = data.variants.map(nv => {
      const ov = old.variants.find(v => v.id === nv.id);
      return { ...nv, currentStock: ov ? ov.currentStock : nv.currentStock };
    });
  }
  setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...data, variants } : p)));
  if (data.model && data.model !== old.model) {
    setImeis(prev => prev.map(i => (i.productId === id ? { ...i, productName: data.model! } : i)));
  }
  enqueueChange('products', 'UPDATE', id, { ...old, ...data, variants }, `প্রোডাক্ট মডেল আপডেট (${data.model || old.model})`);
  addAudit('Updated Product Model', 'Product Master', old.model, old.model, data.model || old.model);
  return { success: true };
};

export const executeDeleteProduct = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { products, setProducts, imeis, enqueueChange, addAudit } = ctx;
  const prod = products.find(p => p.id === id);
  if (!prod) return fail('Product not found.');
  const used = imeis.filter(i => i.productId === id).length;
  if (used > 0) return fail(`Cannot delete: ${used} IMEI record(s) exist for ${prod.model}. Mark it Discontinued instead.`);
  setProducts(prev => prev.filter(p => p.id !== id));
  enqueueChange('products', 'DELETE', id, null, `প্রোডাক্ট ডিলিট (${prod.model})`);
  addAudit('Deleted Product Model', 'Product Master', prod.model, `${prod.brandName} - ${prod.model}`);
  return { success: true };
};

// ---- SUPPLIERS ----
export const executeAddSupplier = (
  s: Omit<Supplier, 'id' | 'supplierCode'>,
  ctx: MasterDataContextBundle
) => {
  const { suppliers, setSuppliers, enqueueChange, addAudit } = ctx;
  const code = `SUP-${(suppliers.length + 1).toString().padStart(3, '0')}`;
  const newSup: Supplier = { ...s, id: `sup-${Date.now()}`, supplierCode: code };
  setSuppliers(prev => [...prev, newSup]);
  enqueueChange('suppliers', 'INSERT', newSup.id, newSup, `নতুন সাপ্লায়ার যুক্ত (${s.name})`);
  addAudit('Added Supplier', 'Supplier Master', code, undefined, s.name);
};

export const executeUpdateSupplier = (
  id: string,
  data: Partial<Omit<Supplier, 'id' | 'supplierCode'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { suppliers, setSuppliers, setImeis, setPurchaseInvoices, enqueueChange, addAudit } = ctx;
  const old = suppliers.find(s => s.id === id);
  if (!old) return fail('Supplier not found.');
  setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  if (data.name && data.name !== old.name) {
    setImeis(prev => prev.map(i => (i.supplierId === id ? { ...i, supplierName: data.name! } : i)));
    setPurchaseInvoices(prev => prev.map(p => (p.supplierId === id ? { ...p, supplierName: data.name! } : p)));
  }
  enqueueChange('suppliers', 'UPDATE', id, { ...old, ...data }, `সাপ্লায়ার তথ্য আপডেট (${data.name || old.name})`);
  addAudit('Updated Supplier', 'Supplier Master', old.supplierCode, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteSupplier = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { suppliers, setSuppliers, purchaseInvoices, enqueueChange, addAudit } = ctx;
  const sup = suppliers.find(s => s.id === id);
  if (!sup) return fail('Supplier not found.');
  if (purchaseInvoices.some(p => p.supplierId === id)) return fail('Cannot delete: purchase invoices exist for this supplier. Mark it Inactive instead.');
  if (sup.currentDue > 0) return fail(`Cannot delete: outstanding payable of ৳ ${sup.currentDue.toLocaleString()}.`);
  setSuppliers(prev => prev.filter(s => s.id !== id));
  enqueueChange('suppliers', 'DELETE', id, null, `সাপ্লায়ার ডিলিট (${sup.name})`);
  addAudit('Deleted Supplier', 'Supplier Master', sup.supplierCode, sup.name);
  return { success: true };
};

// ---- CUSTOMERS ----
export const executeAddCustomer = (
  c: Omit<Customer, 'id' | 'customerCode'>,
  ctx: MasterDataContextBundle
) => {
  const { customers, setCustomers, enqueueChange, addAudit } = ctx;
  const code = `CUST-${(customers.length + 1).toString().padStart(3, '0')}`;
  const newCust: Customer = { ...c, id: `cust-${Date.now()}`, customerCode: code };
  setCustomers(prev => [...prev, newCust]);
  enqueueChange('customers', 'INSERT', newCust.id, newCust, `নতুন কাস্টমার যুক্ত (${c.shopName})`);
  addAudit('Added Customer / Dealer', 'Customer Master', code, undefined, `${c.shopName} (${c.ownerName})`);
};

export const executeUpdateCustomer = (
  id: string,
  data: Partial<Omit<Customer, 'id' | 'customerCode'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { customers, setCustomers, enqueueChange, addAudit } = ctx;
  const old = customers.find(c => c.id === id);
  if (!old) return fail('Customer not found.');
  setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  enqueueChange('customers', 'UPDATE', id, { ...old, ...data }, `কাস্টমার তথ্য আপডেট (${data.shopName || old.shopName})`);
  addAudit('Updated Customer / Dealer', 'Customer Master', old.customerCode, old.shopName, data.shopName || old.shopName);
  return { success: true };
};

export const executeDeleteCustomer = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { customers, setCustomers, salesInvoices, setCustomerFollowUps, enqueueChange, addAudit } = ctx;
  const cust = customers.find(c => c.id === id);
  if (!cust) return fail('Customer not found.');
  if (salesInvoices.some(s => s.customerId === id)) return fail('Cannot delete: sales invoices exist for this customer. Mark it Suspended/Blocked instead.');
  if (cust.currentDue > 0) return fail(`Cannot delete: outstanding due of ৳ ${cust.currentDue.toLocaleString()}.`);
  setCustomers(prev => prev.filter(c => c.id !== id));
  setCustomerFollowUps(prev => prev.filter(f => f.customerId !== id));
  enqueueChange('customers', 'DELETE', id, null, `কাস্টমার ডিলিট (${cust.shopName})`);
  addAudit('Deleted Customer / Dealer', 'Customer Master', cust.customerCode, cust.shopName);
  return { success: true };
};

// ---- SALESMEN ----
export const executeAddSalesman = (
  sm: Omit<Salesman, 'id' | 'employeeCode'>,
  ctx: MasterDataContextBundle
) => {
  const { salesmen, setSalesmen, enqueueChange, addAudit } = ctx;
  const code = `EMP-SM-${(salesmen.length + 1).toString().padStart(2, '0')}`;
  const newSm: Salesman = { ...sm, id: `sm-${Date.now()}`, employeeCode: code };
  setSalesmen(prev => [...prev, newSm]);
  enqueueChange('salesmen', 'INSERT', newSm.id, newSm, `নতুন সেলসম্যান যুক্ত (${sm.name})`);
  addAudit('Added Salesman', 'Salesman Master', code, undefined, sm.name);
};

export const executeUpdateSalesman = (
  id: string,
  data: Partial<Omit<Salesman, 'id' | 'employeeCode'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { salesmen, setSalesmen, setCustomers, enqueueChange, addAudit } = ctx;
  const old = salesmen.find(s => s.id === id);
  if (!old) return fail('Salesman not found.');
  setSalesmen(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  if (data.name && data.name !== old.name) {
    setCustomers(prev => prev.map(c => (c.salesmanId === id ? { ...c, salesmanName: data.name! } : c)));
  }
  enqueueChange('salesmen', 'UPDATE', id, { ...old, ...data }, `সেলসম্যান তথ্য আপডেট (${data.name || old.name})`);
  addAudit('Updated Salesman', 'Salesman Master', old.employeeCode, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteSalesman = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { salesmen, setSalesmen, salesInvoices, setCustomers, enqueueChange, addAudit } = ctx;
  const sm = salesmen.find(s => s.id === id);
  if (!sm) return fail('Salesman not found.');
  if (salesInvoices.some(s => s.salesmanId === id)) return fail('Cannot delete: sales invoices are attributed to this salesman. Mark them Inactive instead.');
  setSalesmen(prev => prev.filter(s => s.id !== id));
  setCustomers(prev => prev.map(c => (c.salesmanId === id ? { ...c, salesmanId: undefined, salesmanName: undefined } : c)));
  enqueueChange('salesmen', 'DELETE', id, null, `সেলসম্যান ডিলিট (${sm.name})`);
  addAudit('Deleted Salesman', 'Salesman Master', sm.employeeCode, sm.name);
  return { success: true };
};

// ---- WAREHOUSES ----
export const executeAddWarehouse = (
  wh: Omit<Warehouse, 'id' | 'code'>,
  ctx: MasterDataContextBundle
) => {
  const { warehouses, setWarehouses, enqueueChange, addAudit } = ctx;
  const code = `WH-${wh.city.toUpperCase().substring(0, 3)}-${(warehouses.length + 1).toString().padStart(2, '0')}`;
  const newWh: Warehouse = { ...wh, id: `wh-${Date.now()}`, code };
  setWarehouses(prev => [...prev, newWh]);
  enqueueChange('warehouses', 'INSERT', newWh.id, newWh, `নতুন ওয়্যারহাউস যুক্ত (${wh.name})`);
  addAudit('Added Warehouse / Outlet', 'Warehouse Master', code, undefined, wh.name);
};

export const executeUpdateWarehouse = (
  id: string,
  data: Partial<Omit<Warehouse, 'id' | 'code'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { warehouses, setWarehouses, setImeis, enqueueChange, addAudit } = ctx;
  const old = warehouses.find(w => w.id === id);
  if (!old) return fail('Warehouse not found.');
  setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
  if (data.name && data.name !== old.name) {
    setImeis(prev => prev.map(i => (i.warehouseId === id ? { ...i, warehouseName: data.name! } : i)));
  }
  enqueueChange('warehouses', 'UPDATE', id, { ...old, ...data }, `ওয়্যারহাউস তথ্য আপডেট (${data.name || old.name})`);
  addAudit('Updated Warehouse / Outlet', 'Warehouse Master', old.code, old.name, data.name || old.name);
  return { success: true };
};

export const executeDeleteWarehouse = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { warehouses, setWarehouses, imeis, purchaseInvoices, salesInvoices, stockTransfers, enqueueChange, addAudit } = ctx;
  const wh = warehouses.find(w => w.id === id);
  if (!wh) return fail('Warehouse not found.');
  const inUse =
    imeis.some(i => i.warehouseId === id) ||
    purchaseInvoices.some(p => p.warehouseId === id) ||
    salesInvoices.some(s => s.warehouseId === id) ||
    stockTransfers.some(t => t.sourceWarehouseId === id || t.destinationWarehouseId === id);
  if (inUse) return fail('Cannot delete: stock or documents reference this location. Mark it Inactive instead.');
  setWarehouses(prev => prev.filter(w => w.id !== id));
  enqueueChange('warehouses', 'DELETE', id, null, `ওয়্যারহাউস মুছে ফেলা (${wh.name})`);
  addAudit('Deleted Warehouse / Outlet', 'Warehouse Master', wh.code, wh.name);
  return { success: true };
};

// ---- STOCK TRANSFER ----
export const executeTransferStock = (
  data: {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    items: Array<{ productId: string; variantId: string; imeis: string[] }>;
    notes?: string;
  },
  ctx: MasterDataContextBundle
): { success: boolean; transferNo?: string; error?: string } => {
  const {
    warehouses,
    setImeis,
    imeis,
    products,
    stockTransfers,
    setStockTransfers,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  const src = warehouses.find(w => w.id === data.sourceWarehouseId);
  const dest = warehouses.find(w => w.id === data.destinationWarehouseId);
  if (!src || !dest) return { success: false, error: 'Invalid warehouse selection' };

  const transferNo = generateDocNumber('TRF', stockTransfers.length);
  const today = todayStr();
  const allTransferImeis = data.items.flatMap(i => i.imeis);

  // Update each IMEI's current warehouse
  setImeis(prev =>
    prev.map(i => {
      if (allTransferImeis.includes(i.imei1)) {
        return {
          ...i,
          warehouseId: dest.id,
          warehouseName: dest.name,
          history: [
            ...i.history,
            {
              date: `${today} 14:00`,
              action: 'Stock Transferred',
              description: `Transferred from ${src.name} to ${dest.name} (${transferNo})`,
              user: currentUserRole,
              referenceNo: transferNo
            }
          ]
        };
      }
      return i;
    })
  );

  const newTransfer: StockTransfer = {
    id: `trf-${Date.now()}`,
    transferNo,
    sourceWarehouseId: src.id,
    sourceWarehouseName: src.name,
    destinationWarehouseId: dest.id,
    destinationWarehouseName: dest.name,
    transferDate: today,
    items: data.items.map(it => {
      const prod = products.find(p => p.id === it.productId);
      const variant = prod?.variants.find(v => v.id === it.variantId);
      return {
        productId: it.productId,
        productName: prod?.model || 'Product',
        variantId: it.variantId,
        variantDesc: variant ? `${variant.ram}/${variant.storage} - ${variant.color}` : '',
        quantity: it.imeis.length,
        imeis: it.imeis
      };
    }),
    totalQuantity: allTransferImeis.length,
    status: 'Received',
    dispatchedBy: currentUserRole,
    receivedBy: dest.managerName,
    notes: data.notes,
    createdAt: today
  };

  setStockTransfers(prev => [newTransfer, ...prev]);

  enqueueChange('stock_transfers', 'INSERT', newTransfer.id, newTransfer, `স্টক ট্রান্সফার #${transferNo}`);
  allTransferImeis.forEach(imeiNum => {
    const imRecord = imeis.find(i => i.imei1 === imeiNum);
    if (imRecord) {
      enqueueChange('imeis', 'UPDATE', imRecord.id, {
        ...imRecord,
        warehouseId: dest.id,
        warehouseName: dest.name
      }, `IMEI ওয়্যারহাউস পরিবর্তন #${imeiNum}`);
    }
  });

  addAudit('Dispatched Stock Transfer', 'Stock Transfer', transferNo, undefined, `From: ${src.name} To: ${dest.name}, Units: ${allTransferImeis.length}`);
  return { success: true, transferNo };
};

// ---- SALESMAN VISITS ----
export const executeCreateSalesmanVisit = (
  visitData: Omit<SalesmanVisit, 'id'>,
  ctx: MasterDataContextBundle
): { success: boolean } => {
  const { setSalesmanVisits, enqueueChange, addAudit } = ctx;
  const newVisit: SalesmanVisit = {
    ...visitData,
    id: `visit-${Date.now()}`
  };
  setSalesmanVisits(prev => [newVisit, ...prev]);
  enqueueChange('salesman_visits', 'INSERT', newVisit.id, newVisit, `সেলসম্যান ভিজিট রেকর্ড (${newVisit.shopName})`);
  addAudit('Logged Field Sales Visit', 'Field Visits', newVisit.id, undefined, `${visitData.salesmanName} -> ${visitData.shopName}`);
  return { success: true };
};

export const executeUpdateSalesmanVisit = (
  id: string,
  data: Partial<Omit<SalesmanVisit, 'id'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { salesmanVisits, setSalesmanVisits, enqueueChange, addAudit } = ctx;
  const old = salesmanVisits.find(v => v.id === id);
  if (!old) return fail('Visit not found.');
  const updated = { ...old, ...data };
  setSalesmanVisits(prev => prev.map(v => (v.id === id ? updated : v)));
  enqueueChange('salesman_visits', 'UPDATE', id, updated, `ফিল্ড ভিজিট আপডেট (${old.shopName})`);
  addAudit('Updated Field Visit', 'Field Visits', id, undefined, data.outcomeNotes || old.outcomeNotes);
  return { success: true };
};

export const executeDeleteSalesmanVisit = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { salesmanVisits, setSalesmanVisits, enqueueChange, addAudit } = ctx;
  const old = salesmanVisits.find(v => v.id === id);
  if (!old) return fail('Visit not found.');
  setSalesmanVisits(prev => prev.filter(v => v.id !== id));
  enqueueChange('salesman_visits', 'DELETE', id, null, `ফিল্ড ভিজিট ডিলিট (${old.shopName})`);
  addAudit('Deleted Field Visit', 'Field Visits', id, `${old.salesmanName} -> ${old.shopName}`);
  return { success: true };
};

// ---- CUSTOMER FOLLOW-UPS ----
export const executeAddCustomerFollowUp = (
  fupData: Omit<CustomerFollowUp, 'id' | 'updatedAt'>,
  ctx: MasterDataContextBundle
) => {
  const { setCustomerFollowUps, enqueueChange, addAudit } = ctx;
  const newFup: CustomerFollowUp = {
    ...fupData,
    id: `fup-${Date.now()}`,
    updatedAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
  };
  setCustomerFollowUps(prev => [newFup, ...prev]);
  enqueueChange('customer_follow_ups', 'INSERT', newFup.id, newFup, `কাস্টমার ফলো-আপ যুক্ত (${newFup.shopName})`);
  addAudit('Scheduled Customer Follow-up', 'Customer Follow-up', newFup.id, undefined, `${fupData.shopName} (${fupData.purpose})`);
};

export const executeUpdateFollowUp = (
  id: string,
  data: Partial<Omit<CustomerFollowUp, 'id' | 'updatedAt'>>,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { customerFollowUps, setCustomerFollowUps, enqueueChange, addAudit } = ctx;
  const old = customerFollowUps.find(f => f.id === id);
  if (!old) return fail('Follow-up not found.');
  const stamp = new Date().toISOString().replace('T', ' ').substr(0, 16);
  const updated = { ...old, ...data, updatedAt: stamp };
  setCustomerFollowUps(prev => prev.map(f => (f.id === id ? updated : f)));
  enqueueChange('customer_follow_ups', 'UPDATE', id, updated, `ফলো-আপ আপডেট (${old.shopName})`);
  addAudit('Edited Follow-up', 'Customer Follow-up', id, undefined, old.shopName);
  return { success: true };
};

export const executeDeleteFollowUp = (
  id: string,
  ctx: MasterDataContextBundle
): CrudResult => {
  const { customerFollowUps, setCustomerFollowUps, enqueueChange, addAudit } = ctx;
  const old = customerFollowUps.find(f => f.id === id);
  if (!old) return fail('Follow-up not found.');
  setCustomerFollowUps(prev => prev.filter(f => f.id !== id));
  enqueueChange('customer_follow_ups', 'DELETE', id, null, `ফলো-আপ ডিলিট (${old.shopName})`);
  addAudit('Deleted Follow-up', 'Customer Follow-up', id, old.shopName);
  return { success: true };
};

export const executeUpdateFollowUpStatus = (
  id: string,
  status: CustomerFollowUp['status'],
  notes: string | undefined,
  promisedDate: string | undefined,
  ctx: MasterDataContextBundle
) => {
  const { setCustomerFollowUps, enqueueChange, addAudit } = ctx;
  setCustomerFollowUps(prev =>
    prev.map(f => {
      if (f.id === id) {
        const updated = {
          ...f,
          status,
          notes: notes ? `${f.notes} | Update: ${notes}` : f.notes,
          promisedDate: promisedDate || f.promisedDate,
          updatedAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
        };
        enqueueChange('customer_follow_ups', 'UPDATE', id, updated, `ফলো-আপ স্ট্যাটাস আপডেট (${f.shopName})`);
        return updated;
      }
      return f;
    })
  );
  addAudit('Updated Follow-up Status', 'Customer Follow-up', id, undefined, status);
};

// ---- WARRANTY CLAIMS ----
export const executeAddWarrantyClaim = (
  claim: Omit<WarrantyClaim, 'id' | 'rmaNumber'>,
  ctx: MasterDataContextBundle
): { success: boolean; rmaNumber: string } => {
  const { warrantyClaims, setWarrantyClaims, setImeis, imeis, currentUserRole, enqueueChange, addAudit } = ctx;
  const rmaNumber = `RMA-${new Date().getFullYear()}-${(warrantyClaims.length + 1).toString().padStart(4, '0')}`;
  const newClaim: WarrantyClaim = {
    ...claim,
    id: `rma-${Date.now()}`,
    rmaNumber
  };
  setWarrantyClaims(prev => [newClaim, ...prev]);

  setImeis(prev => prev.map(i => {
    if (i.imei1 === claim.imei) {
      return {
        ...i,
        status: 'Warranty' as const,
        history: [
          ...(i.history || []),
          {
            date: new Date().toISOString().replace('T', ' ').substr(0, 16),
            action: 'Warranty Claim Registered',
            description: `RMA ${rmaNumber} created. Issue: ${claim.problemDescription}`,
            user: currentUserRole,
            referenceNo: rmaNumber
          }
        ]
      };
    }
    return i;
  }));

  const imRec = imeis.find(i => i.imei1 === claim.imei);
  if (imRec) {
    enqueueChange('imeis', 'UPDATE', imRec.id, {
      ...imRec,
      status: 'Warranty'
    }, `IMEI ওয়ারেন্টি স্ট্যাটাস #${claim.imei}`);
  }

  enqueueChange('warranty_claims', 'INSERT', newClaim.id, newClaim, `ওয়ারেন্টি ক্লেইম #${rmaNumber}`);
  addAudit(`Created Warranty Claim ${rmaNumber} for IMEI ${claim.imei}`, 'Warranty RMA', rmaNumber);
  return { success: true, rmaNumber };
};

export const executeUpdateWarrantyStatus = (
  id: string,
  status: WarrantyClaim['status'],
  updates: Partial<WarrantyClaim> | undefined,
  ctx: MasterDataContextBundle
) => {
  const { setWarrantyClaims, enqueueChange, addAudit } = ctx;
  setWarrantyClaims(prev => prev.map(c => {
    if (c.id === id) {
      const updated = {
        ...c,
        status,
        ...(updates || {})
      };
      enqueueChange('warranty_claims', 'UPDATE', id, updated, `ওয়ারেন্টি স্ট্যাটাস আপডেট (${c.rmaNumber})`);
      addAudit(`Updated RMA ${c.rmaNumber} status to ${status}`, 'Warranty RMA', c.rmaNumber);
      return updated;
    }
    return c;
  }));
};

// ---- BRAND INCENTIVE SCHEMES ----
export const executeAddBrandIncentiveScheme = (
  scheme: Omit<BrandIncentiveScheme, 'id'>,
  ctx: MasterDataContextBundle
) => {
  const { setBrandIncentives, enqueueChange, addAudit } = ctx;
  const newScheme: BrandIncentiveScheme = {
    ...scheme,
    id: `scheme-${Date.now()}`
  };
  setBrandIncentives(prev => [newScheme, ...prev]);
  enqueueChange('brand_incentive_schemes', 'INSERT', newScheme.id, newScheme, `ব্র্যান্ড ইনসেন্টিভ স্কিম (${scheme.schemeTitle})`);
  addAudit(`Added Brand Incentive Scheme: ${scheme.schemeTitle}`, 'Brand Target Scheme', scheme.brandName);
};

export const executeUpdateBrandIncentiveStatus = (
  id: string,
  status: BrandIncentiveScheme['claimStatus'],
  creditNoteNo: string | undefined,
  ctx: MasterDataContextBundle
) => {
  const { setBrandIncentives, enqueueChange, addAudit } = ctx;
  setBrandIncentives(prev => prev.map(s => {
    if (s.id === id) {
      const updated = {
        ...s,
        claimStatus: status,
        supplierCreditNoteNo: creditNoteNo || s.supplierCreditNoteNo
      };
      enqueueChange('brand_incentive_schemes', 'UPDATE', id, updated, `ইনসেন্টিভ স্ট্যাটাস আপডেট (${s.schemeTitle})`);
      return updated;
    }
    return s;
  }));
  addAudit(`Updated Brand Incentive Status to ${status}`, 'Brand Target Scheme', id);
};

// ---- BULK IMPORT DATA ----
export const executeBulkImportData = (
  entityType: 'customers' | 'suppliers' | 'products' | 'imeis',
  rows: any[],
  ctx: MasterDataContextBundle
): { success: boolean; count: number } => {
  const {
    customers,
    setCustomers,
    suppliers,
    setSuppliers,
    products,
    setProducts,
    warehouses,
    brands,
    setImeis,
    currentUser,
    currentUserRole,
    enqueueChange,
    addAudit
  } = ctx;

  let count = 0;
  if (entityType === 'customers') {
    const newCusts: Customer[] = rows.map((r, idx) => ({
      id: `cust-imp-${Date.now()}-${idx}`,
      customerCode: `CUST-${(customers.length + idx + 1).toString().padStart(3, '0')}`,
      shopName: r.shopName || 'Imported Dealer',
      ownerName: r.ownerName || '',
      mobile: r.mobile || '01700-000000',
      address: r.address || '',
      area: r.area || 'Dhaka',
      district: r.district || 'Dhaka',
      creditLimit: parseFloat(r.creditLimit) || 200000,
      allowedDueDays: parseInt(r.allowedDueDays) || 15,
      customerType: 'Wholesale Dealer',
      openingBalance: parseFloat(r.openingBalance) || 0,
      currentDue: parseFloat(r.openingBalance) || 0,
      status: 'Active'
    }));
    setCustomers(prev => [...prev, ...newCusts]);
    newCusts.forEach(c => enqueueChange('customers', 'INSERT', c.id, c, `ইম্পোর্টকৃত ডিলার (${c.shopName})`));
    count = newCusts.length;
  } else if (entityType === 'suppliers') {
    const newSups: Supplier[] = rows.map((r, idx) => ({
      id: `sup-imp-${Date.now()}-${idx}`,
      supplierCode: `SUP-${(suppliers.length + idx + 1).toString().padStart(3, '0')}`,
      name: r.name || 'Imported Supplier',
      companyName: r.companyName || '',
      contactPerson: r.contactPerson || '',
      mobile: r.mobile || '',
      email: r.email || '',
      address: r.address || '',
      district: r.district || 'Dhaka',
      taxVatNumber: r.taxVatNumber || '',
      tradeLicense: r.tradeLicense || '',
      openingBalance: parseFloat(r.openingBalance) || 0,
      creditLimit: parseFloat(r.creditLimit) || 10000000,
      paymentTermsDays: parseInt(r.paymentTermsDays) || 15,
      currentDue: parseFloat(r.openingBalance) || 0,
      bankInfo: r.bankInfo || '',
      status: 'Active'
    }));
    setSuppliers(prev => [...prev, ...newSups]);
    newSups.forEach(s => enqueueChange('suppliers', 'INSERT', s.id, s, `ইম্পোর্টকৃত সাপ্লায়ার (${s.name})`));
    count = newSups.length;
  } else if (entityType === 'products') {
    const newProds: Product[] = rows.map((r, idx) => ({
      id: `prod-imp-${Date.now()}-${idx}`,
      brandId: brands[0]?.id || 'brand-1',
      brandName: r.brandName || brands[0]?.name || 'Samsung',
      model: r.model || 'Imported Handset',
      category: 'Smartphone',
      networkRegion: 'Official BD / BTRC Approved',
      warrantyPeriodMonths: 12,
      description: r.description || 'Imported product catalog',
      variants: [
        {
          id: `var-imp-${Date.now()}-${idx}`,
          sku: r.sku || `SKU-IMP-${idx}`,
          ram: r.ram || '8GB',
          storage: r.storage || '128GB',
          color: r.color || 'Black',
          purchasePrice: parseFloat(r.purchasePrice) || 20000,
          dealerPrice: parseFloat(r.dealerPrice) || 23000,
          wholesalePrice: parseFloat(r.dealerPrice) || 23000,
          retailPrice: parseFloat(r.retailPrice) || 25000,
          minSellingPrice: parseFloat(r.dealerPrice) || 22000,
          maxDiscount: 1000,
          reorderLevel: 5,
          currentStock: 0
        }
      ],
      status: 'Active'
    }));
    setProducts(prev => [...prev, ...newProds]);
    newProds.forEach(p => enqueueChange('products', 'INSERT', p.id, p, `ইম্পোর্টকৃত পণ্য (${p.model})`));
    count = newProds.length;
  } else if (entityType === 'imeis') {
    const firstProd = products[0];
    const firstWh = warehouses[0];
    const firstSup = suppliers[0];
    const newImeis: IMEIRecord[] = rows.map((r, idx) => {
      const prod = products.find(p => p.model.toLowerCase() === (r.model || '').toLowerCase()) || firstProd;
      const brand = r.brandName || prod?.brandName || 'Brand';
      const model = r.model || prod?.model || 'Imported Phone';
      const ram = r.ram || prod?.variants[0]?.ram || '8GB';
      const storage = r.storage || prod?.variants[0]?.storage || '128GB';
      const color = r.color || prod?.variants[0]?.color || 'Black';
      return {
        id: `imei-imp-${Date.now()}-${idx}`,
        imei1: (r.imei1 || `8600000000${idx}`).trim(),
        imei2: (r.imei2 || '').trim(),
        serialNumber: r.serialNumber || `SN-${idx}`,
        productId: prod?.id || 'prod-1',
        productName: model,
        variantId: prod?.variants[0]?.id || 'var-1',
        variantDesc: `${ram}/${storage} - ${color}`,
        brandName: brand,
        purchaseCost: parseFloat(r.purchaseCost) || 20000,
        purchaseInvoiceNo: `IMP-INV-${Date.now()}`,
        purchaseDate: todayStr(),
        warehouseId: firstWh?.id || 'wh-1',
        warehouseName: firstWh?.name || 'Central Warehouse',
        supplierId: firstSup?.id || 'sup-1',
        supplierName: firstSup?.name || 'Supplier Importer',
        status: 'In Stock' as const,
        condition: 'Brand New' as const,
        history: [
          {
            date: new Date().toISOString().replace('T', ' ').substr(0, 16),
            action: 'Bulk Inward Imported',
            description: 'Imported via CSV Data Import Hub',
            user: currentUser?.name || currentUserRole
          }
        ]
      };
    });
    setImeis(prev => [...prev, ...newImeis]);
    newImeis.forEach(i => enqueueChange('imeis', 'INSERT', i.id, i, `ইম্পোর্টকৃত আইএমইআই (${i.imei1})`));
    count = newImeis.length;
  }
  addAudit(`Bulk Imported ${count} ${entityType}`, 'Bulk Import', 'IMPORT', undefined, `Added ${count} records`);
  return { success: true, count };
};

// ---- SMS NOTIFICATIONS ----
export const executeSendSmsNotification = (
  sms: Omit<SmsLog, 'id' | 'sentAt' | 'status'>,
  ctx: MasterDataContextBundle
): { success: boolean } => {
  const { setSmsLogs, enqueueChange, addAudit } = ctx;
  const newSms: SmsLog = {
    ...sms,
    id: `sms-${Date.now()}`,
    sentAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
    status: 'Delivered'
  };
  setSmsLogs(prev => [newSms, ...prev]);
  enqueueChange('sms_logs', 'INSERT', newSms.id, newSms, `এসএমএস লগ (${sms.recipientPhone})`);
  addAudit(`Dispatched SMS to ${sms.recipientPhone}`, 'SMS Gateway', sms.recipientName);
  return { success: true };
};
