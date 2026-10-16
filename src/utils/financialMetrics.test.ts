import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateRecordedCOGS } from './financialMetrics';

test('calculates recorded COGS across invoices', () => {
  const result = calculateRecordedCOGS([
    [{ quantity: 2, unitCost: 100 }],
    [{ quantity: 1, unitCost: 250 }]
  ]);

  assert.deepEqual(result, { complete: true, amount: 450 });
});

test('does not report COGS when a line has no recorded cost', () => {
  const result = calculateRecordedCOGS([[{ quantity: 2, unitCost: 0 }]]);

  assert.deepEqual(result, { complete: false, amount: null });
});

test('does not report COGS for invalid quantities or costs', () => {
  assert.equal(calculateRecordedCOGS([[{ quantity: 0, unitCost: 100 }]]).complete, false);
  assert.equal(calculateRecordedCOGS([[{ quantity: 1, unitCost: Number.NaN }]]).amount, null);
});

test('returns zero COGS for no sold lines', () => {
  assert.deepEqual(calculateRecordedCOGS([]), { complete: true, amount: 0 });
});
