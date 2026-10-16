import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, escapeSpreadsheetFormula } from './csvSafety';

test('neutralizes formula-leading spreadsheet text', () => {
  for (const value of ['=1+1', '+cmd', '-1+1', '@SUM(A1:A2)', '  =2+2', '\t=2+2']) {
    assert.equal(escapeSpreadsheetFormula(value), `'${value}`);
  }
});

test('preserves ordinary data and CSV-quotes values safely', () => {
  assert.equal(escapeSpreadsheetFormula('Mobile Shop'), 'Mobile Shop');
  assert.equal(escapeSpreadsheetFormula(-125), '-125');
  assert.equal(csvCell('Shop, "North"'), '"Shop, ""North"""');
  assert.equal(csvCell(125), '"125"');
});
