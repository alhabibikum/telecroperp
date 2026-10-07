import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Printer,
  FileText,
  Building,
  CheckCircle,
  Smartphone,
  MessageCircle
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { WindowsModalFrame } from '../common/WindowsModalFrame';
import { shareInvoiceViaWhatsApp } from '../../utils/whatsappUtils';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNo: string;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoiceNo
}) => {
  const { salesInvoices, settings } = useERP();

  if (!isOpen) return null;

  const invoice = salesInvoices.find(i => i.invoiceNo === invoiceNo);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!invoice) return;
    shareInvoiceViaWhatsApp({
      invoiceNo: invoice.invoiceNo,
      customerName: invoice.customerName,
      mobile: (invoice as any).customerMobile || (invoice as any).mobile || '',
      totalAmount: invoice.grandTotal,
      paidAmount: invoice.paidAmount,
      dueAmount: invoice.dueAmount,
      items: invoice.items?.map(it => ({
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice
      })),
      date: invoice.invoiceDate
    });
  };

  if (!invoice) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-md w-full text-center">
          <p className="text-sm text-slate-700">Invoice {invoiceNo} not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <WindowsModalFrame
      isOpen={isOpen}
      onClose={onClose}
      onSkip={onClose}
      modalId={`invoice-print-${invoice.invoiceNo}`}
      title={`ট্যাক্স ইনভয়েস প্রিন্ট ও প্রিভিউ: ${invoice.invoiceNo}`}
      subtitle="TeleCorp Official Tax Invoice"
      icon={<Printer className="w-4 h-4 text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between print:hidden">
        <span className="text-xs font-bold text-slate-700">
          প্রিন্ট অথবা পিডিএফ কপি সেভ করুন
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
            title="গ্রাহকের হোয়াটসঅ্যাপে মেমো পাঠান (Send Invoice via WhatsApp)"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপে পাঠান (WhatsApp)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / সেভ PDF (Ctrl+P)</span>
          </button>
        </div>
      </div>

        {/* Printable Invoice Document */}
        <div className="p-8 bg-white text-slate-800 max-h-[85vh] overflow-y-auto print:p-0 print:max-h-none">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📱</span>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {settings.companyName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                {settings.companyAddress}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Phone: {settings.companyPhone} • Email: {settings.companyEmail}
              </p>
              <p className="text-xs font-mono font-semibold text-blue-700 mt-1">
                {settings.vatTaxNumber}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest rounded">
                {invoice.invoiceType === 'Wholesale' ? 'COMMERCIAL TAX INVOICE' : 'RETAIL POS CASH MEMO'}
              </span>
              <div className="font-mono text-base font-extrabold text-slate-900 mt-2">
                {invoice.invoiceNo}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Date: <b>{formatDate(invoice.invoiceDate)}</b>
              </div>
              <div className="text-xs text-slate-600">
                Payment Due: <b>{formatDate(invoice.dueDate)}</b>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-2 gap-8 my-6 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                Billed To (Customer / Dealer):
              </div>
              <div className="text-sm font-black text-slate-900">{invoice.customerName}</div>
              <div className="text-slate-600 mt-0.5">Contact: {invoice.customerPhone}</div>
              {invoice.salesmanName && (
                <div className="text-slate-600 mt-1">
                  Sales Officer: <span className="font-semibold text-slate-800">{invoice.salesmanName}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                Dispatch Details:
              </div>
              <div>Dispatch Facility: <span className="font-semibold">{invoice.warehouseName}</span></div>
              <div className="mt-1">
                Payment Terms: <span className="font-semibold">Net {invoice.invoiceType === 'Wholesale' ? '30 Days Credit' : 'Immediate Cash/POS'}</span>
              </div>
              <div className="mt-1">
                Status: <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border border-slate-200 mb-6">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5 w-12 text-center">#</th>
                <th className="p-2.5">Item Model & Specs</th>
                <th className="p-2.5">Registered Serial / IMEI 1 Numbers</th>
                <th className="p-2.5 text-center w-16">Qty</th>
                <th className="p-2.5 text-right w-24">Unit Rate</th>
                <th className="p-2.5 text-right w-28">Total (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">{item.variantDesc}</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-blue-700">
                    {item.imeiList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.imeiList.map(im => (
                          <span key={im} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {im}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No IMEIs tagged</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="p-2.5 text-right font-medium">{formatBDT(item.unitPrice)}</td>
                  <td className="p-2.5 text-right font-extrabold text-slate-900">
                    {formatBDT(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Settlement */}
          <div className="flex justify-end mb-8 text-xs">
            <div className="w-72 space-y-2 border border-slate-200 p-4 rounded-xl bg-slate-50/60">
              <div className="flex justify-between text-slate-600">
                <span>Sub-Total:</span>
                <span className="font-bold text-slate-800">{formatBDT(invoice.subTotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Special Dealer Discount:</span>
                  <span className="font-bold">-{formatBDT(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span>{formatBDT(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1">
                <span>Amount Paid:</span>
                <span>{formatBDT(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-extrabold text-sm pt-2 border-t border-slate-300">
                <span>Balance Due:</span>
                <span>{formatBDT(invoice.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Receipts Breakdown */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-6 p-3 rounded-lg border border-slate-200 bg-slate-50/40 text-xs">
              <div className="font-bold text-slate-700 mb-1">Settlement Transactions:</div>
              {invoice.payments.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-600">
                  <span>• Mode: <b>{p.method}</b> {p.transactionRef ? `(Ref: ${p.transactionRef})` : ''}</span>
                  <span className="font-bold text-slate-800">{formatBDT(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">Terms & Conditions:</div>
            <p>1. Official Bangladesh Warranty covers factory defects through brand authorized care centers.</p>
            <p>2. Goods once sold can only be returned if sealed condition is maintained or authorized by management.</p>
            <p>3. Outstanding balance must be settled within the agreed due date.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-16 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Prepared By (Accounts)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Customer Signature & Stamp
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                Authorized Officer
              </div>
            </div>
          </div>
        </div>
    </WindowsModalFrame>
  );
};
