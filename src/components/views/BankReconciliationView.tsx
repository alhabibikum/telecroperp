import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building,
  CreditCard,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const BankReconciliationView: React.FC = () => {
  const {
    bankAccounts,
    bankStatements,
    reconcileStatementEntry,
    cashTransactions
  } = useERP();

  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  const [statementBalance, setStatementBalance] = useState<number>(7420000);

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
  const ledgerBalance = selectedBank?.currentBalance || 0;
  const difference = statementBalance - ledgerBalance;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Bank Statement Reconciliation Module
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare electronic bank statements against system cash transactions to catch unrecorded bank charges, interest, or transit cheques
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="font-semibold text-slate-600">Select Bank Account:</label>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
          >
            {bankAccounts.map(b => (
              <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Balance Reconciliation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 text-[11px] uppercase font-bold">System Ledger Book Balance</span>
            <div className="text-xl font-black text-slate-900 mt-1">{formatBDT(ledgerBalance)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Automated Double-entry Record</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Bank Statement Ending Balance</span>
            <div className="mt-1">
              <input
                type="number"
                value={statementBalance}
                onChange={(e) => setStatementBalance(parseFloat(e.target.value) || 0)}
                className="text-lg font-black text-blue-900 p-1 border border-slate-300 rounded-md w-full bg-white"
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Per actual bank e-statement</div>
          </div>

          <div className={`p-4 rounded-xl border ${
            difference === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <span className="text-[11px] uppercase font-bold">Reconciliation Difference</span>
            <div className="text-xl font-black mt-1">
              {difference === 0 ? '৳ 0 (Reconciled)' : formatBDT(difference)}
            </div>
            <div className="text-[10px] font-semibold mt-0.5">
              {difference === 0 ? '✓ Books match bank statement' : 'Pending matching adjustments'}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Statement Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Electronic Statement Transactions & Clearing Status
          </h3>
          <span className="text-xs text-slate-500 font-mono">Statement Items: {bankStatements.length}</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Transaction Date</th>
              <th className="p-3">Narration / Description</th>
              <th className="p-3">Reference #</th>
              <th className="p-3 text-right">Debit (Payment Out)</th>
              <th className="p-3 text-right">Credit (Deposit In)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Reconciliation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bankStatements.map(st => (
              <tr key={st.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono text-slate-600">{formatDate(st.date)}</td>
                <td className="p-3 font-semibold text-slate-900">{st.description}</td>
                <td className="p-3 font-mono text-blue-700">{st.referenceNo}</td>
                <td className="p-3 text-right font-bold text-rose-700">
                  {st.debit > 0 ? formatBDT(st.debit) : '-'}
                </td>
                <td className="p-3 text-right font-extrabold text-emerald-700">
                  {st.credit > 0 ? formatBDT(st.credit) : '-'}
                </td>
                <td className="p-3 text-center">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    st.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' :
                    st.status === 'Bank Charge' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {st.status}
                  </span>
                </td>
                <td className="p-3 text-center space-x-1">
                  {st.status !== 'Matched' && (
                    <button
                      onClick={() => reconcileStatementEntry(st.id, 'Matched')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition"
                    >
                      Match
                    </button>
                  )}
                  {st.status === 'Unmatched' && (
                    <button
                      onClick={() => reconcileStatementEntry(st.id, 'Bank Charge')}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold transition"
                    >
                      Charge
                    </button>
                  )}
                  {st.status === 'Matched' && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cleared</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
