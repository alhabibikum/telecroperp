export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonthsToDate(dateString: string, monthsToAdd: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match || !Number.isInteger(monthsToAdd)) {
    throw new RangeError('Expected a valid YYYY-MM-DD date and an integer month offset.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = (targetYear: number, targetMonth: number): number => {
    if (targetMonth === 2) {
      return targetYear % 4 === 0 && (targetYear % 100 !== 0 || targetYear % 400 === 0) ? 29 : 28;
    }
    return [4, 6, 9, 11].includes(targetMonth) ? 30 : 31;
  };

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError('Expected a valid YYYY-MM-DD date and an integer month offset.');
  }

  const monthIndex = year * 12 + month - 1 + monthsToAdd;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12 + 1;
  if (targetYear < 0 || targetYear > 9999) {
    throw new RangeError('Month offset moves the date outside the supported year range.');
  }
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));

  return `${String(targetYear).padStart(4, '0')}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}
