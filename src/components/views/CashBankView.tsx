import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Wallet,
  Building,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { formatBDT, formatDateTime } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { BankAccount } from '../../types/erp';

const bankFields: FieldDef[] = [
  { key: 'bankName', label: 'Bank / Gateway Name', required: true },
  { key: 'branch', label: 'Branch Name' },
  { key: 'accountName', label: 'Account Holder Name', required: true },
  { key: 'accountNumber', label: 'Account / Wallet Number', required: true },
  {
    key: 'accountType',
    label: 'Account Category',
    type: 'select',
    options: ['Current', 'Savings', 'MFS Merchant (bKash/Nagad)']
  },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
];

const newBankFields: FieldDef[] = [
  ...bankFields,
  { key: 'openingBalance', label: 'Opening Balance (৳)', type: 'number', required: true }
];

export const CashBankView: React.FC = () => {
  const { bankAccounts, cashTransactions, chartOfAccounts, reconcileBankTransaction, addBankAccount, updateBankAccount, deleteBankAccount } = useERP();

  const [activeTab, setActiveTab] = useState<'bank' | 'cash'>('bank');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);

  const totalBankFunds = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalCashIn = cashTransactions.filter(c => c.type === 'Cash In').reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'Cash Out').reduce((acc, c) => acc + c.amount, 0);
  const openingVault = chartOfAccounts.find(a => a.code === '1000')?.balance ?? 685000;
  const currentCashInHand = openingVault + totalCashIn - totalCashOut;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cash Book & Multi-Bank Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Vault cash book, commercial current accounts (DBBL, City, BRAC) and MFS merchant gateways (bKash/Nagad)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'bank' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Account</span>
            </button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'bank' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Bank Accounts ({bankAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'cash' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Daily Cash Book
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Liquid Bank Balances</div>
          <div className="text-xl font-black text-slate-900 mt-1">{formatBDT(totalBankFunds)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Cash in Hand (Main Vault & Till)</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatBDT(currentCashInHand)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-500 uppercase font-semibold text-[10px]">Total Liquid Solvency</div>
          <div className="text-xl font-black text-blue-700 mt-1">{formatBDT(totalBankFunds + currentCashInHand)}</div>
        </div>
      </div>

      {activeTab === 'bank' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{b.bankName}</h3>
                    <div className="text-xs text-slate-500">{b.branch}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {b.accountType}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">{b.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-medium text-slate-700">{b.accountName}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Current Ledger Balance:</span>
                    <span className="font-extrabold text-sm text-emerald-700">{formatBDT(b.currentBalance)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Reconciliation: <b className="text-emerald-700">Reconciled</b></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => reconcileBankTransaction(b.id, `REC-${Date.now()}`)}
                      className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Match</span>
                    </button>
                    <RowActions
                      onEdit={() => setEditing(b)}
                      onDelete={() => deleteBankAccount(b.id)}
                      deleteTitle={`Delete bank account ${b.bankName}?`}
                      deleteMessage="Bank accounts with recorded transactions or non-zero balances cannot be deleted; mark them Inactive instead."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Daily Cash Book Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Daily Cash Book Log & Movement Statement
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Opening Balance: <b>{formatBDT(openingVault)}</b> • Inflows: <b>{formatBDT(totalCashIn)}</b> • Outflows: <b>{formatBDT(totalCashOut)}</b>
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Closing Cash in Vault</div>
              <div className="text-base font-extrabold text-emerald-700">{formatBDT(currentCashInHand)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description & Reference</th>
                  <th className="p-3">Responsible User</th>
                  <th className="p-3 text-right">Inflow (Cash In)</th>
                  <th className="p-3 text-right">Outflow (Cash Out)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                      {tx.date}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.type === 'Cash In' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {tx.category}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{tx.description}</div>
                      <div className="font-mono text-[10px] text-blue-600 font-semibold">{tx.referenceNo}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {tx.performedBy}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-700">
                      {tx.type === 'Cash In' ? formatBDT(tx.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-extrabold text-rose-700">
                      {tx.type === 'Cash Out' ? formatBDT(tx.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <EditModal
          title="Add New Commercial Bank / Gateway Account"
          initial={{
            bankName: '',
            branch: '',
            accountName: '',
            accountNumber: '',
            accountType: 'Current',
            openingBalance: 0,
            status: 'Active'
          }}
          fields={newBankFields}
          saveLabel="Save Account"
          onSave={v => addBankAccount(v as any)}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editing && (
        <EditModal
          title={`Edit Account - ${editing.bankName}`}
          initial={editing}
          fields={bankFields}
          onSave={v => updateBankAccount(editing.id, v as Partial<BankAccount>)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
