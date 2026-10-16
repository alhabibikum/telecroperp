import { CrudResult, JournalEntry, CashTransaction } from '../../types/erp';
import { generateDocNumber } from '../../utils/formatters';

export const todayStr = () => new Date().toISOString().split('T')[0];
export const fail = (error: string): CrudResult => ({ success: false, error });
export const ok = (id?: string): CrudResult => ({ success: true, id });

export const reverseJournalsHelper = (
  journalEntries: JournalEntry[],
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>,
  referenceNo: string,
  label: string,
  currentUserRole: string
) => {
  const originals = journalEntries.filter(
    j => j.referenceNo === referenceNo && !j.description.startsWith('REVERSAL')
  );
  if (originals.length === 0) return;
  const today = todayStr();
  const reversals: JournalEntry[] = originals.map((j, idx) => ({
    ...j,
    id: `jv-rev-${Date.now()}-${idx}`,
    voucherNo: generateDocNumber('JV', journalEntries.length + idx),
    date: today,
    voucherType: 'Journal Voucher',
    description: `REVERSAL (${label}): ${j.description}`,
    lines: j.lines.map(l => ({ ...l, debit: l.credit, credit: l.debit, memo: `Reversal - ${l.memo}` })),
    createdBy: currentUserRole as any,
    createdAt: today
  }));
  setJournalEntries(prev => [...reversals, ...prev]);
};

export const pushCashHelper = (
  setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>,
  type: 'Cash In' | 'Cash Out',
  category: CashTransaction['category'],
  amount: number,
  referenceNo: string,
  description: string,
  currentUserRole: string,
  extra?: {
    warehouseId?: string;
    customerId?: string;
    supplierId?: string;
    bankAccountId?: string;
  }
) => {
  setCashTransactions(prev => [
    {
      id: `cash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: `${todayStr()} 12:00`,
      type,
      category,
      amount,
      referenceNo,
      description,
      performedBy: currentUserRole,
      warehouseId: extra?.warehouseId,
      customerId: extra?.customerId,
      supplierId: extra?.supplierId,
      bankAccountId: extra?.bankAccountId
    },
    ...prev
  ]);
};

export const adjustBankHelper = (
  setBankAccounts: React.Dispatch<React.SetStateAction<any[]>>,
  bankAccountId: string | undefined,
  delta: number
) => {
  if (!bankAccountId) return;
  setBankAccounts(prev =>
    prev.map(b => (b.id === bankAccountId ? { ...b, currentBalance: b.currentBalance + delta } : b))
  );
};
