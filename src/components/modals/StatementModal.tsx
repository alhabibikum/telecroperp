import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Printer,
  FileText,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'customer' | 'supplier';
  entityId: string;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId
}) => {
  const { customers, suppliers, salesInvoices, purchaseInvoices, cashTransactions, settings } = useERP();

  if (!isOpen) return null;

  const customer = entityType === 'customer' ? customers.find(c => c.id === entityId) : null;
  const supplier = entityType === 'supplier' ? suppliers.find(s => s.id === entityId) : null;

  const entityName = customer ? customer.shopName : supplier ? supplier.name : 'Statement';
  const entityContact = customer ? `${customer.ownerName} (${customer.mobile})` : supplier ? `${supplier.contactPerson} (${supplier.mobile})` : '';

  // Ledger entries builder
  const ledgerRows: Array<{
    date: string;
    docNo: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }> = [];

  let runningBalance = customer ? customer.openingBalance : supplier ? supplier.openingBalance : 0;

  if (customer) {
    // Opening balance row
    ledgerRows.push({
      date: '2026-08-01',
      docNo: 'OB-2026',
      description: 'Opening Due Balance Brought Forward',
      debit: customer.openingBalance,
      credit: 0,
      balance: runningBalance
    });

    // Invoices for this customer
    const invoices = salesInvoices.filter(i => i.customerId === customer.id);
    invoices.forEach(inv => {
      runningBalance += inv.grandTotal;
      ledgerRows.push({
        date: inv.invoiceDate,
        docNo: inv.invoiceNo,
        description: `Wholesale Invoice (${inv.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')})`,
        debit: inv.grandTotal,
        credit: 0,
        balance: runningBalance
      });

      if (inv.paidAmount > 0) {
        runningBalance -= inv.paidAmount;
        ledgerRows.push({
          date: inv.invoiceDate,
          docNo: `REC-${inv.invoiceNo.replace('SAL-', '')}`,
          description: `Payment received at invoice issue`,
          debit: 0,
          credit: inv.paidAmount,
          balance: runningBalance
        });
      }
    });
  } else if (supplier) {
    // Supplier purchases
    const purchases = purchaseInvoices.filter(p => p.supplierId === supplier.id);
    purchases.forEach(pur => {
      runningBalance += pur.grandTotal;
      ledgerRows.push({
        date: pur.purchaseDate,
        docNo: pur.invoiceNo,
        description: `Handset Consignment Inward`,
        debit: 0,
        credit: pur.grandTotal,
        balance: runningBalance
      });

      if (pur.paidAmount > 0) {
        runningBalance -= pur.paidAmount;
        ledgerRows.push({
          date: pur.purchaseDate,
          docNo: `PAY-${pur.invoiceNo.replace('PUR-', '')}`,
          description: `Payment disbursed`,
          debit: pur.paidAmount,
          credit: 0,
          balance: runningBalance
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden border border-slate-200">
        {/* Actions bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">
              Official Account Statement: {entityName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 bg-white text-slate-800 max-h-[85vh] overflow-y-auto print:p-0 print:max-h-none text-xs">
          {/* Company Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">{settings.companyName}</h1>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">{settings.companyAddress}</p>
              <p className="text-[11px] text-slate-600 font-mono">{settings.vatTaxNumber}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-extrabold uppercase rounded">
                ACCOUNT STATEMENT
              </span>
              <div className="text-[11px] text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          {/* Party Details */}
          <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <div className="text-slate-500 uppercase text-[10px] font-bold">Party Name / Account:</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">{entityName}</div>
              <div className="text-slate-600">{entityContact}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Current Closing Balance:</div>
              <div className="text-base font-black text-rose-700 mt-0.5">
                {formatBDT(customer ? customer.currentDue : supplier ? supplier.currentDue : 0)}
              </div>
            </div>
          </div>

          {/* Transactions Statement Table */}
          <table className="w-full text-left border border-slate-200 mb-6">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Doc Ref #</th>
                <th className="p-2.5">Transaction Particulars</th>
                <th className="p-2.5 text-right">Debit (৳)</th>
                <th className="p-2.5 text-right">Credit (৳)</th>
                <th className="p-2.5 text-right">Running Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-2.5 font-mono text-slate-600">{formatDate(row.date)}</td>
                  <td className="p-2.5 font-mono text-blue-700 font-bold">{row.docNo}</td>
                  <td className="p-2.5 text-slate-800">{row.description}</td>
                  <td className="p-2.5 text-right font-medium">{row.debit > 0 ? formatBDT(row.debit) : '-'}</td>
                  <td className="p-2.5 text-right font-medium">{row.credit > 0 ? formatBDT(row.credit) : '-'}</td>
                  <td className="p-2.5 text-right font-black text-slate-900">{formatBDT(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-16 pt-16 text-center">
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
              Accounts Department Signature
            </div>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
              Customer / Supplier Acceptance Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
