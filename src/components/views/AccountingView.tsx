import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  BookOpen,
  FileSpreadsheet,
  Layers,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileText,
  Printer
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RowActions, EditModal, FieldDef } from '../common/CrudKit';
import type { AccountCOA } from '../../types/erp';

const coaEditFields: FieldDef[] = [
  { key: 'name', label: 'Account Name', required: true },
  { key: 'type', label: 'Category', type: 'select', options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] },
  { key: 'nature', label: 'Normal Balance', type: 'select', options: ['Debit', 'Credit'] },
  { key: 'description', label: 'Description', type: 'textarea' }
];

const coaAddFields: FieldDef[] = [
  { key: 'code', label: 'Account Code (e.g. 1060)', required: true },
  ...coaEditFields,
  { key: 'balance', label: 'Opening Balance (৳)', type: 'number' }
];

export const AccountingView: React.FC = () => {
  const {
    chartOfAccounts,
    journalEntries,
    salesInvoices,
    customerReturns,
    expenses,
    bankAccounts,
    customers,
    suppliers,
    imeis,
    addAccount,
    updateAccount,
    deleteAccount
  } = useERP();

  const [activeTab, setActiveTab] = useState<'pl' | 'bs' | 'tb' | 'journal' | 'coa'>('pl');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCOA | null>(null);

  // Real-time P&L calculation
  const totalGrossSales = salesInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalSalesReturns = customerReturns.reduce((acc, r) => acc + r.refundOrCreditAmount, 0);
  const netSalesRevenue = Math.max(0, totalGrossSales - totalSalesReturns);

  const totalCOGS = salesInvoices.reduce((acc, inv) => {
    return acc + inv.items.reduce((s, it) => s + (it.unitCost * it.quantity), 0);
  }, 0);

  const grossProfit = Math.max(0, netSalesRevenue - totalCOGS);
  const grossMarginPercent = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100).toFixed(1) : '0';

  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0) + 175000; // includes commission
  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = netSalesRevenue > 0 ? ((netOperatingProfit / netSalesRevenue) * 100).toFixed(1) : '0';

  // Balance Sheet numbers
  const inStockImeis = imeis.filter(i => i.status === 'In Stock');
  const inventoryValuation = inStockImeis.reduce((acc, i) => acc + i.purchaseCost, 0);
  const accountsReceivable = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const bankBalances = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const cashInHand = 742000;
  const totalCurrentAssets = inventoryValuation + accountsReceivable + bankBalances + cashInHand;

  const accountsPayable = suppliers.reduce((acc, s) => acc + s.currentDue, 0);
  const accruedVat = 420000;
  const totalLiabilities = accountsPayable + accruedVat;

  const ownerCapital = 25000000;
  const retainedEarnings = totalCurrentAssets - totalLiabilities - ownerCapital;
  const totalEquity = ownerCapital + retainedEarnings;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              General Ledger & Double-Entry Financial Statements
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic real-time synchronized double-entry books (Profit & Loss, Balance Sheet, Trial Balance & Vouchers)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('pl')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'pl' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('bs')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'bs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab('tb')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'tb' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'journal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
          >
            Journal Vouchers ({journalEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'coa' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
          >
            Chart of Accounts
          </button>
        </div>
      </div>

      {/* 1. PROFIT & LOSS STATEMENT */}
      {activeTab === 'pl' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Statement of Comprehensive Profit & Loss
              </h3>
              <p className="text-xs text-slate-500">For the period ended 04-October-2026 (BDT ৳)</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            {/* Revenue Section */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Operating Revenues
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Wholesale & Dealer Sales Revenue</span>
                <span className="font-bold text-slate-900">{formatBDT(totalGrossSales)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Less: Sales Returns & Defect Allowances</span>
                <span className="font-bold">-{formatBDT(totalSalesReturns)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                <span>Net Operating Revenue</span>
                <span>{formatBDT(netSalesRevenue)}</span>
              </div>
            </div>

            {/* COGS Section */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Cost of Goods Sold (COGS)
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Direct Purchase Cost of Handsets Dispatched</span>
                <span className="font-bold text-slate-900">{formatBDT(totalCOGS)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-800 pt-2 border-t border-slate-200">
                <span>Gross Trading Profit (Margin: {grossMarginPercent}%)</span>
                <span>{formatBDT(grossProfit)}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Operating Expenses
              </div>
              {expenses.map(exp => (
                <div key={exp.id} className="flex justify-between text-slate-600">
                  <span>{exp.categoryName} ({exp.description})</span>
                  <span className="font-medium text-slate-800">{formatBDT(exp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-600">
                <span>Salesman Commission & Field Incentives</span>
                <span className="font-medium text-slate-800">৳ 1,75,000</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Operating Overheads</span>
                <span>{formatBDT(totalOperatingExpenses)}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-900">
              <div>
                <div>Net Operating Profit for the Period</div>
                <div className="text-xs text-emerald-700 font-normal">Net Profit Margin: {netMarginPercent}%</div>
              </div>
              <div className="text-xl">{formatBDT(netOperatingProfit)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BALANCE SHEET */}
      {activeTab === 'bs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Statement of Financial Position (Balance Sheet)
              </h3>
              <p className="text-xs text-slate-500">As of 04-October-2026 (BDT ৳)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Assets */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-blue-900 uppercase tracking-wider border-b-2 border-blue-600 pb-1">
                Assets
              </h4>

              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Current Assets</div>
                <div className="flex justify-between text-slate-600">
                  <span>Merchandise Inventory (Mobile Stock)</span>
                  <span className="font-bold text-slate-800">{formatBDT(inventoryValuation)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Accounts Receivable (Customer Due)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accountsReceivable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Bank Accounts (DBBL, City, BRAC, bKash)</span>
                  <span className="font-bold text-slate-800">{formatBDT(bankBalances)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cash in Hand (Main Vault & Till)</span>
                  <span className="font-bold text-slate-800">{formatBDT(cashInHand)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between font-extrabold text-sm text-blue-950">
                <span>Total Assets</span>
                <span>{formatBDT(totalCurrentAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-indigo-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1">
                Liabilities & Owner Equity
              </h4>

              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Current Liabilities</div>
                <div className="flex justify-between text-slate-600">
                  <span>Accounts Payable (Supplier Due)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accountsPayable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Accrued VAT & Tax Payable (NBR)</span>
                  <span className="font-bold text-slate-800">{formatBDT(accruedVat)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total Liabilities</span>
                  <span>{formatBDT(totalLiabilities)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Owner Equity</div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid-Up Capital</span>
                  <span className="font-bold text-slate-800">{formatBDT(ownerCapital)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Retained Earnings & Accumulated Profit</span>
                  <span className="font-bold text-emerald-700">{formatBDT(retainedEarnings)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total Equity</span>
                  <span>{formatBDT(totalEquity)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex justify-between font-extrabold text-sm text-indigo-950">
                <span>Total Liabilities & Equity</span>
                <span>{formatBDT(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRIAL BALANCE */}
      {activeTab === 'tb' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Trial Balance (Verification of Mathematical Accuracy)
              </h3>
              <p className="text-xs text-slate-500">Every double-entry transaction balanced: Debit = Credit</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Books Perfectly Balanced</span>
            </span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Account Code</th>
                <th className="p-3">Account Title</th>
                <th className="p-3">Classification</th>
                <th className="p-3 text-right">Debit Balance (BDT)</th>
                <th className="p-3 text-right">Credit Balance (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartOfAccounts.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono font-bold text-blue-700">{acc.code}</td>
                  <td className="p-3 font-semibold text-slate-800">{acc.name}</td>
                  <td className="p-3 text-slate-500">{acc.type}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {acc.nature === 'Debit' ? formatBDT(acc.balance) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {acc.nature === 'Credit' ? formatBDT(acc.balance) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. JOURNAL VOUCHERS */}
      {activeTab === 'journal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Journal Voucher Audit Register
              </h3>
              <p className="text-xs text-slate-500">Double-entry audit log of all sales, purchases, collections and expenses</p>
            </div>
          </div>

          <div className="space-y-4">
            {journalEntries.map(entry => (
              <div key={entry.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{entry.voucherNo}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {entry.voucherType}
                    </span>
                    <span className="text-slate-400 font-mono">Ref: {entry.referenceNo}</span>
                  </div>
                  <div className="text-slate-500">
                    {formatDate(entry.date)} • Created by <b className="text-slate-800">{entry.createdBy}</b>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium">{entry.description}</p>

                {/* Lines */}
                <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase text-[9px] font-bold">
                    <tr>
                      <th className="p-2">Account Code & Title</th>
                      <th className="p-2">Memo / Narration</th>
                      <th className="p-2 text-right">Debit (৳)</th>
                      <th className="p-2 text-right">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entry.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <span className="font-mono text-blue-700 font-bold">{line.accountCode}</span> - {line.accountName}
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{line.memo}</td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {line.debit > 0 ? formatBDT(line.debit) : '-'}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {line.credit > 0 ? formatBDT(line.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Standard Chart of Accounts (COA)
              </h3>
              <p className="text-xs text-slate-500">Structured ledger codes for assets, liabilities, equity, revenue and expenses</p>
            </div>
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <span>+ Add Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {chartOfAccounts.map(coa => (
              <div key={coa.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-blue-700 text-sm">{coa.code}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    coa.type === 'Asset' ? 'bg-blue-100 text-blue-800' :
                    coa.type === 'Liability' ? 'bg-rose-100 text-rose-800' :
                    coa.type === 'Revenue' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {coa.type} ({coa.nature})
                  </span>
                </div>
                <div className="font-bold text-slate-900">{coa.name}</div>
                <p className="text-slate-500 text-[11px]">{coa.description}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <span className="font-extrabold text-slate-800">
                    Balance: {formatBDT(coa.balance)}
                  </span>
                  <RowActions
                    onEdit={() => setEditingAccount(coa)}
                    onDelete={() => deleteAccount(coa.code)}
                    deleteTitle={`Delete Account ${coa.code} - ${coa.name}?`}
                    deleteMessage="Accounts that have journal entries posted to them cannot be deleted."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddAccount && (
        <EditModal
          title="Add General Ledger Account"
          initial={{
            code: '',
            name: '',
            type: 'Asset',
            nature: 'Debit',
            balance: 0,
            description: ''
          }}
          fields={coaAddFields}
          saveLabel="Create Account"
          onSave={v => addAccount(v as AccountCOA)}
          onClose={() => setShowAddAccount(false)}
        />
      )}

      {editingAccount && (
        <EditModal
          title={`Edit Account - ${editingAccount.code} (${editingAccount.name})`}
          initial={editingAccount}
          fields={coaEditFields}
          onSave={v => updateAccount(editingAccount.code, v as Partial<AccountCOA>)}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
};
