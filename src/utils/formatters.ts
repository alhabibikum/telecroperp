// Currency, Date and Document Numbering Helpers for Bangladesh ERP

export const formatBDT = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '৳ 0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Bangladeshi / Indian numbering format (Lakhs and Crores: 12,34,567)
  const str = absAmount.toString();
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const remaining = str.substring(0, str.length - 3);
    const groups = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      groups.unshift(remaining.substring(start, i));
    }
    result = groups.join(',') + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}৳ ${result}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
};

export type AgeingBucket = 'Current' | '1-7 Days' | '8-15 Days' | '16-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';

export const calculateDueAgeing = (dueDateStr: string): { bucket: AgeingBucket; daysOverdue: number } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 0) {
    return { bucket: 'Current', daysOverdue: 0 };
  } else if (daysOverdue <= 7) {
    return { bucket: '1-7 Days', daysOverdue };
  } else if (daysOverdue <= 15) {
    return { bucket: '8-15 Days', daysOverdue };
  } else if (daysOverdue <= 30) {
    return { bucket: '16-30 Days', daysOverdue };
  } else if (daysOverdue <= 60) {
    return { bucket: '31-60 Days', daysOverdue };
  } else if (daysOverdue <= 90) {
    return { bucket: '61-90 Days', daysOverdue };
  } else {
    return { bucket: '90+ Days', daysOverdue };
  }
};

export const generateDocNumber = (prefix: 'SAL' | 'PUR' | 'REC' | 'TRF' | 'RET' | 'JV' | 'EXP' | 'PAY' | 'MR', count: number): string => {
  const year = new Date().getFullYear();
  const seq = (count + 1).toString().padStart(6, '0');
  return `${prefix}-${year}-${seq}`;
};

export const parseBulkIMEIs = (text: string): { valid: string[]; duplicates: string[]; invalid: string[] } => {
  const tokens = text
    .split(/[\n,;\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const seen = new Set<string>();
  const valid: string[] = [];
  const duplicates: string[] = [];
  const invalid: string[] = [];

  for (const token of tokens) {
    // Standard IMEI is 15 digits
    const isDigitsOnly = /^\d{14,16}$/.test(token);
    if (!isDigitsOnly) {
      invalid.push(token);
    } else if (seen.has(token)) {
      duplicates.push(token);
    } else {
      seen.add(token);
      valid.push(token);
    }
  }

  return { valid, duplicates, invalid };
};
