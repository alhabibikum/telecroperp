import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateInputValue, parseDateInput } from './dateInputUtils';

test('parses compact dates with two-digit and four-digit years', () => {
  assert.equal(parseDateInput('171026'), '2026-10-17');
  assert.equal(parseDateInput('17102026'), '2026-10-17');
});

test('accepts separated and ISO dates', () => {
  assert.equal(parseDateInput('17/10/26'), '2026-10-17');
  assert.equal(parseDateInput('17-10-2026'), '2026-10-17');
  assert.equal(parseDateInput('2026-10-17'), '2026-10-17');
});

test('rejects incomplete and invalid calendar dates', () => {
  assert.equal(parseDateInput('17102'), null);
  assert.equal(parseDateInput('321326'), null);
  assert.equal(parseDateInput('290223'), null);
  assert.equal(parseDateInput(''), null);
});

test('formats ISO values for display without changing empty values', () => {
  assert.equal(formatDateInputValue('2026-10-17'), '17/10/2026');
  assert.equal(formatDateInputValue(''), '');
});
