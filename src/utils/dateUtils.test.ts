import assert from 'node:assert/strict';
import test from 'node:test';
import { addMonthsToDate, getLocalDateString } from './dateUtils';

test('formats a date using local calendar fields', () => {
  const date = new Date(2026, 9, 17, 0, 5);
  const expected = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  assert.equal(getLocalDateString(date), expected);
});

test('uses the current local date when no date is provided', () => {
  const now = new Date();
  assert.equal(getLocalDateString(), getLocalDateString(now));
});

test('adds calendar months without rolling month-end dates forward', () => {
  assert.equal(addMonthsToDate('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonthsToDate('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonthsToDate('2026-01-31', 2), '2026-03-31');
});

test('rejects invalid date strings and fractional month offsets', () => {
  assert.throws(() => addMonthsToDate('2026-02-30', 1), RangeError);
  assert.throws(() => addMonthsToDate('2026-01-01', 1.5), RangeError);
});
