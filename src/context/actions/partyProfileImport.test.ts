import assert from 'node:assert/strict';
import test from 'node:test';
import type { Dispatch, SetStateAction } from 'react';
import type { Customer, Salesman, Supplier } from '../../types/erp';
import {
  executeImportPartyProfiles,
  type PartyProfileImportContext
} from './masterDataActions';

const makeContext = (
  initialCustomers: Customer[] = [],
  initialSuppliers: Supplier[] = [],
  salesmen: Salesman[] = []
) => {
  let customers = initialCustomers;
  let suppliers = initialSuppliers;
  const changes: Array<{ table: string; operation: string }> = [];
  const context: PartyProfileImportContext = {
    customers,
    suppliers,
    salesmen,
    setCustomers: ((update: SetStateAction<Customer[]>) => {
      customers = typeof update === 'function' ? update(customers) : update;
      context.customers = customers;
    }) as Dispatch<SetStateAction<Customer[]>>,
    setSuppliers: ((update: SetStateAction<Supplier[]>) => {
      suppliers = typeof update === 'function' ? update(suppliers) : update;
      context.suppliers = suppliers;
    }) as Dispatch<SetStateAction<Supplier[]>>,
    enqueueChange: (table, operation) => changes.push({ table, operation }),
    addAudit: () => undefined
  };
  return {
    context,
    changes,
    get customers() { return customers; },
    get suppliers() { return suppliers; }
  };
};

test('imports customer and dealer profiles and maps the assigned salesperson', () => {
  const salesman = {
    id: 'sm-1',
    employeeCode: 'EMP-1',
    name: 'Amin',
    mobile: '01700000000',
    email: '',
    address: '',
    joiningDate: '2026-01-01',
    basicSalary: 0,
    commissionType: 'Percentage of Sales',
    commissionRate: 0,
    monthlyTarget: 0,
    currentMonthSales: 0,
    currentMonthCollection: 0,
    assignedArea: 'Dhaka',
    assignedCustomerCount: 0,
    status: 'Active'
  } satisfies Salesman;
  const store = makeContext([], [], [salesman]);
  const result = executeImportPartyProfiles('customers', [{
    shopName: 'Firoza Mobile',
    ownerName: 'Owner',
    mobile: '01700-123456',
    salesmanName: 'Amin',
    openingBalance: 1200
  }], store.context);

  assert.deepEqual(result, { success: true, count: 1 });
  assert.equal(store.customers[0].shopName, 'Firoza Mobile');
  assert.equal(store.customers[0].salesmanId, 'sm-1');
  assert.equal(store.customers[0].openingBalance, 1200);
  assert.equal(store.customers[0].currentDue, 1200);
  assert.deepEqual(store.changes, [{ table: 'customers', operation: 'INSERT' }]);
});

test('updates matching customer profiles without overwriting ledger balances', () => {
  const existing: Customer = {
    id: 'cust-1',
    customerCode: 'CUST-001',
    shopName: 'Old Shop',
    ownerName: 'Owner',
    mobile: '01700123456',
    address: '',
    area: '',
    district: '',
    creditLimit: 1000,
    allowedDueDays: 15,
    customerType: 'Wholesale Dealer',
    openingBalance: 500,
    currentDue: 900,
    status: 'Active'
  };
  const store = makeContext([existing]);
  const result = executeImportPartyProfiles('customers', [{
    customerCode: 'CUST-001',
    shopName: 'Updated Shop',
    mobile: existing.mobile,
    openingBalance: 100
  }], store.context);

  assert.equal(result.success, true);
  assert.equal(store.customers.length, 1);
  assert.equal(store.customers[0].id, existing.id);
  assert.equal(store.customers[0].customerCode, existing.customerCode);
  assert.equal(store.customers[0].shopName, 'Updated Shop');
  assert.equal(store.customers[0].openingBalance, 500);
  assert.equal(store.customers[0].currentDue, 900);
  assert.deepEqual(store.changes, [{ table: 'customers', operation: 'UPDATE' }]);
});

test('imports supplier profiles with opening balance and validates the full file first', () => {
  const store = makeContext();
  const result = executeImportPartyProfiles('suppliers', [{
    name: 'Parts Supply Ltd',
    mobile: '01800123456',
    companyName: 'Parts Supply',
    taxVatNumber: 'BIN-123',
    openingBalance: 2500
  }], store.context);

  assert.equal(result.success, true);
  assert.equal(store.suppliers[0].companyName, 'Parts Supply');
  assert.equal(store.suppliers[0].taxVatNumber, 'BIN-123');
  assert.equal(store.suppliers[0].currentDue, 2500);

  const beforeImport = store.suppliers;
  const invalid = executeImportPartyProfiles('suppliers', [
    { name: 'Valid first row', mobile: '01811111111' },
    { name: 'Invalid amount', mobile: '01822222222', creditLimit: -1 }
  ], store.context);

  assert.equal(invalid.success, false);
  assert.match(invalid.error || '', /Row 3/);
  assert.equal(store.suppliers, beforeImport);
});
