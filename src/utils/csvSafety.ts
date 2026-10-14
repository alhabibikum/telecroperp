export const escapeSpreadsheetFormula = (value: unknown): string => {
  if (typeof value === 'number') return String(value);
  const text = String(value);
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r]/.test(text)
    ? `'${text}`
    : text;
};

export const csvCell = (value: unknown): string =>
  `"${escapeSpreadsheetFormula(value).replace(/"/g, '""')}"`;
