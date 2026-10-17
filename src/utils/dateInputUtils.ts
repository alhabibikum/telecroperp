const pad2 = (value: number): string => String(value).padStart(2, '0');

const toIsoDate = (day: number, month: number, year: number): string | null => {
  if (month < 1 || month > 12 || day < 1) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
};

export function parseDateInput(value: string, currentYear = new Date().getFullYear()): string | null {
  const input = value.trim();
  if (!input) return null;

  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input);
  if (isoMatch) {
    return toIsoDate(Number(isoMatch[3]), Number(isoMatch[2]), Number(isoMatch[1]));
  }

  const separatedMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(input);
  if (separatedMatch) {
    const yearText = separatedMatch[3];
    const year = yearText.length === 2
      ? (Number(yearText) <= 69 ? 2000 + Number(yearText) : 1900 + Number(yearText))
      : Number(yearText);
    return toIsoDate(Number(separatedMatch[1]), Number(separatedMatch[2]), year);
  }

  if (!/^\d{6}$|^\d{8}$/.test(input)) return null;

  const day = Number(input.slice(0, 2));
  const month = Number(input.slice(2, 4));
  const yearText = input.slice(4);
  const year = yearText.length === 2
    ? (Number(yearText) <= 69 ? 2000 + Number(yearText) : 1900 + Number(yearText))
    : Number(yearText);
  return toIsoDate(day, month, year || currentYear);
}

export function formatDateInputValue(value?: string): string {
  if (!value) return '';
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!isoMatch || !toIsoDate(Number(isoMatch[3]), Number(isoMatch[2]), Number(isoMatch[1]))) {
    return value;
  }
  return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
}
