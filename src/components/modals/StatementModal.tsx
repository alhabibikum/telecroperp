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
import { WindowsModalFrame } from '../common/WindowsModalFrame';

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
  const {
    customers,
    suppliers,
    salesInvoices,
    purchaseInvoices,
    customerReturns,
    supplierReturns,
    moneyReceipts,
    settings
  } = useERP();

  if (!isOpen) return null;

  const customer = entityType === 'customer' ? customers.find(c => c.id === entityId) : null;
  const supplier = entityType === 'supplier' ? suppliers.find(s => s.id === entityId) : null;

  const entityName = customer ? customer.shopName : supplier ? supplier.name : 'Statement';
  const entityContact = customer ? `${customer.ownerName} (${customer.mobile})` : supplier ? `${supplier.contactPerson} (${supplier.mobile})` : '';

  interface LedgerRawItem {
    date: string;
    docNo: string;
    description: string;
    debit: number;
    credit: number;
  }

  const rawItems: LedgerRawItem[] = [];
  let initialOpeningBalance = 0;

  if (customer) {
    initialOpeningBalance = customer.openingBalance || 0;

    // 1. Sales Invoices
    const invoices = salesInvoices.filter(i => i.customerId === customer.id);
    invoices.forEach(inv => {
      // Invoice Bill (Debit)
      rawItems.push({
        date: inv.invoiceDate,
        docNo: inv.invoiceNo,
        description: `পাইকারি বিক্রয় চালান (${inv.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')})`,
        debit: inv.grandTotal,
        credit: 0
      });

      // Payments recorded directly inside invoice at creation (if not already captured in moneyReceipts)
      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((p, idx) => {
          const payRef = p.reference || p.transactionRef;
          const isRecordedInMR = (moneyReceipts || []).some(
            mr => (mr.transactionRef === payRef || mr.receiptNo === payRef) && mr.customerId === customer.id
          );
          if (!isRecordedInMR && p.amount > 0) {
            rawItems.push({
              date: p.date || inv.invoiceDate,
              docNo: payRef || `REC-${inv.invoiceNo.replace('SAL-', '')}-${idx + 1}`,
              description: `ইনভয়েস ইস্যুকালীন জমা (${p.method || 'Cash'})`,
              debit: 0,
              credit: p.amount
            });
          }
        });
      } else if (inv.paidAmount > 0) {
        const isRecordedInMR = (moneyReceipts || []).some(
          mr => mr.referenceInvoice === inv.invoiceNo && mr.customerId === customer.id
        );
        if (!isRecordedInMR) {
          rawItems.push({
            date: inv.invoiceDate,
            docNo: `REC-${inv.invoiceNo.replace('SAL-', '')}`,
            description: `ইনভয়েস ইস্যুকালীন নগদ জমা`,
            debit: 0,
            credit: inv.paidAmount
          });
        }
      }
    });

    // 2. Money Receipts (Due Collections)
    const partyReceipts = (moneyReceipts || []).filter(
      mr => mr.customerId === customer.id && mr.status !== 'Voided'
    );
    partyReceipts.forEach(mr => {
      rawItems.push({
        date: mr.date,
        docNo: mr.receiptNo,
        description: `মানি রসিদ আদায় (${mr.paymentMethod})${mr.referenceInvoice ? ` [ইনভয়েস: ${mr.referenceInvoice}]` : ''}${mr.notes ? ` - ${mr.notes}` : ''}`,
        debit: 0,
        credit: mr.amount
      });
    });

    // 3. Customer Returns (Credit to Customer)
    const partyReturns = (customerReturns || []).filter(
      cr => cr.customerId === customer.id && cr.status === 'Approved'
    );
    partyReturns.forEach(cr => {
      rawItems.push({
        date: cr.returnDate || cr.createdAt || '2026-08-01',
        docNo: cr.returnNo,
        description: `পণ্য ফেরত ক্রেডিট (রিটার্ন) - IMEI: ${cr.imei} [কারণ: ${cr.returnReason}]`,
        debit: 0,
        credit: cr.refundOrCreditAmount
      });
    });
  } else if (supplier) {
    initialOpeningBalance = supplier.openingBalance || 0;

    // 1. Supplier Purchases
    const purchases = purchaseInvoices.filter(p => p.supplierId === supplier.id);
    purchases.forEach(pur => {
      rawItems.push({
        date: pur.purchaseDate,
        docNo: pur.invoiceNo,
        description: `হ্যান্ডসেট চালান ইনওয়ার্ড (${pur.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')})`,
        debit: 0,
        credit: pur.grandTotal
      });

      if (pur.paidAmount > 0) {
        rawItems.push({
          date: pur.purchaseDate,
          docNo: `PAY-${pur.invoiceNo.replace('PUR-', '')}`,
          description: `সাপ্লায়ার বিল পরিশোধ`,
          debit: pur.paidAmount,
          credit: 0
        });
      }
    });

    // 2. Supplier Stock Returns (Debit - reduces payable)
    const partySupplierReturns = (supplierReturns || []).filter(
      sr => sr.supplierId === supplier.id && sr.status === 'Completed'
    );
    partySupplierReturns.forEach(sr => {
      rawItems.push({
        date: sr.returnDate || sr.createdAt || '2026-08-01',
        docNo: sr.returnNo,
        description: `সাপ্লায়ারে স্টক ফেরত (রিটার্ন) - IMEI: ${sr.imei} [কারণ: ${sr.returnReason}]`,
        debit: sr.amount,
        credit: 0
      });
    });
  }

  // Sort transactions chronologically
  rawItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Ledger entries builder with running balance
  const ledgerRows: Array<{
    date: string;
    docNo: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }> = [];

  let runningBalance = initialOpeningBalance;

  // Insert Opening Balance at index 0
  ledgerRows.push({
    date: (customer as any)?.joiningDate || (customer as any)?.createdAt || '2026-08-01',
    docNo: 'OB-2026',
    description: customer ? 'প্রারম্ভিক বকেয়া ব্যালেন্স (Opening Balance Brought Forward)' : 'প্রারম্ভিক পাওনা ব্যালেন্স (Opening Balance)',
    debit: customer ? initialOpeningBalance : 0,
    credit: supplier ? initialOpeningBalance : 0,
    balance: runningBalance
  });

  // Calculate Running Balance
  rawItems.forEach(item => {
    if (customer) {
      runningBalance = runningBalance + item.debit - item.credit;
    } else {
      runningBalance = runningBalance + item.credit - item.debit;
    }
    ledgerRows.push({
      ...item,
      balance: runningBalance
    });
  });

  const totalDebits = ledgerRows.reduce((s, r) => s + r.debit, 0);
  const totalCredits = ledgerRows.reduce((s, r) => s + r.credit, 0);

  return (
    <WindowsModalFrame
      isOpen={isOpen}
      onClose={onClose}
      onSkip={onClose}
      modalId={`statement-${entityType}-${entityId}`}
      title={`লেজার স্টেটমেন্ট: ${entityName}`}
      subtitle="Official Account Statement"
      icon={<FileText className="w-4 h-4 text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
        <span className="font-bold text-xs text-slate-800">
          অফিসিয়াল লেজার হিসাব বিবরণী
        </span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>প্রিন্ট স্টেটমেন্ট (Print)</span>
        </button>
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
            <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
              <tr>
                <td colSpan={3} className="p-2.5 text-right uppercase tracking-wider text-[10px] text-slate-600">
                  Total Transactions & Closing Balance:
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">{formatBDT(totalDebits)}</td>
                <td className="p-2.5 text-right font-bold text-slate-900">{formatBDT(totalCredits)}</td>
                <td className="p-2.5 text-right font-black text-rose-700">{formatBDT(runningBalance)}</td>
              </tr>
            </tfoot>
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
    </WindowsModalFrame>
  );
};
