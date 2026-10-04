import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Receipt,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { PaymentMethodType, PaymentAllocationItem } from '../../types/erp';

interface DueCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  onSuccessCollection?: (collectionNo: string) => void;
}

export const DueCollectionModal: React.FC<DueCollectionModalProps> = ({
  isOpen,
  onClose,
  initialCustomerId,
  onSuccessCollection
}) => {
  const {
    customers,
    salesInvoices,
    bankAccounts,
    salesmen,
    collectCustomerPayment
  } = useERP();

  const [customerId, setCustomerId] = useState<string>(initialCustomerId || customers[0]?.id || '');
  const [collectionAmount, setCollectionAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [collectorSalesmanId, setCollectorSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [allocationMode, setAllocationMode] = useState<'Auto' | 'Manual'>('Auto');

  // Manual allocations map
  const [allocations, setAllocations] = useState<PaymentAllocationItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialCustomerId) setCustomerId(initialCustomerId);
  }, [initialCustomerId]);

  const selectedCustomer = customers.find(c => c.id === customerId);

  // Unpaid invoices for this customer sorted oldest first (FIFO)
  const customerInvoices = salesInvoices
    .filter(inv => inv.customerId === customerId && inv.dueAmount > 0)
    .sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());

  // Re-compute allocations whenever collectionAmount or customer or mode changes
  useEffect(() => {
    if (allocationMode === 'Auto') {
      let remainingToAllocate = collectionAmount;
      const autoAllocated: PaymentAllocationItem[] = customerInvoices.map(inv => {
        const canAllocate = Math.min(remainingToAllocate, inv.dueAmount);
        remainingToAllocate = Math.max(0, remainingToAllocate - canAllocate);
        return {
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          invoiceDate: inv.invoiceDate,
          originalDue: inv.dueAmount,
          allocatedAmount: canAllocate,
          remainingDue: inv.dueAmount - canAllocate
        };
      });
      setAllocations(autoAllocated);
    }
  }, [collectionAmount, customerId, allocationMode, salesInvoices]);

  if (!isOpen) return null;

  const totalAllocated = allocations.reduce((acc, a) => acc + a.allocatedAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomer) {
      setErrorMsg('Please select a customer.');
      return;
    }

    if (collectionAmount <= 0) {
      setErrorMsg('Collection amount must be greater than zero.');
      return;
    }

    if (collectionAmount > selectedCustomer.currentDue) {
      setErrorMsg(`Payment amount (৳ ${collectionAmount.toLocaleString()}) cannot exceed customer outstanding due (৳ ${selectedCustomer.currentDue.toLocaleString()}).`);
      return;
    }

    const result = collectCustomerPayment({
      customerId: selectedCustomer.id,
      amount: collectionAmount,
      paymentMethod,
      bankAccountId: paymentMethod !== 'Cash' ? bankAccountId : undefined,
      transactionRef: transactionRef || undefined,
      collectorSalesmanId: collectorSalesmanId || undefined,
      allocations,
      notes
    });

    if (result.success && result.collectionNo) {
      if (onSuccessCollection) onSuccessCollection(result.collectionNo);
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white/90 backdrop-blur-3xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] w-full max-w-4xl my-auto overflow-hidden border border-white/60 animate-in zoom-in-95 duration-200">
        {/* Top Glossy Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-yellow-500/50 to-emerald-500/40 pointer-events-none z-10" />

        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 bg-white/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Customer Due Collection & Multi-Invoice Allocation
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Receive customer payments and automatically adjust outstanding invoices (FIFO or Manual)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-white/40 backdrop-blur-md">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top row: Customer, Amount, Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Dealer / Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.shopName} (Due: {formatBDT(c.currentDue)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount to Collect (৳) *
              </label>
              <input
                type="number"
                min="100"
                max={selectedCustomer?.currentDue || 10000000}
                value={collectionAmount}
                onChange={(e) => setCollectionAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allocation Strategy
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAllocationMode('Auto')}
                  className={`flex-1 py-1 rounded-md transition ${allocationMode === 'Auto' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'}`}
                >
                  Auto (Oldest First)
                </button>
                <button
                  type="button"
                  onClick={() => setAllocationMode('Manual')}
                  className={`flex-1 py-1 rounded-md transition ${allocationMode === 'Manual' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'}`}
                >
                  Manual Pick
                </button>
              </div>
            </div>
          </div>

          {/* Customer Due Summary Banner */}
          {selectedCustomer && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{selectedCustomer.shopName}</span>
                <span className="text-slate-600 ml-2">Total Outstanding Due: <b>{formatBDT(selectedCustomer.currentDue)}</b></span>
              </div>
              <div className="text-amber-800 font-bold">
                Remaining Due After Collection: {formatBDT(Math.max(0, selectedCustomer.currentDue - collectionAmount))}
              </div>
            </div>
          )}

          {/* Invoice Allocation Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Outstanding Invoices & Payment Allocation Breakdown
            </h3>

            {customerInvoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                This customer has no outstanding unpaid invoices in the system.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Invoice Date</th>
                      <th className="p-3">Original Due</th>
                      <th className="p-3">Allocated Now</th>
                      <th className="p-3">Remaining Due</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((alloc, idx) => (
                      <tr key={alloc.invoiceId || idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-blue-700">{alloc.invoiceNo}</td>
                        <td className="p-3 text-slate-600">{formatDate(alloc.invoiceDate)}</td>
                        <td className="p-3 font-semibold text-slate-800">{formatBDT(alloc.originalDue)}</td>
                        <td className="p-3">
                          {allocationMode === 'Auto' ? (
                            <span className="font-bold text-emerald-700">{formatBDT(alloc.allocatedAmount)}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={alloc.originalDue}
                              value={alloc.allocatedAmount}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setAllocations(prev =>
                                  prev.map((a, i) =>
                                    i === idx
                                      ? {
                                          ...a,
                                          allocatedAmount: val,
                                          remainingDue: Math.max(0, a.originalDue - val)
                                        }
                                      : a
                                  )
                                );
                              }}
                              className="w-28 p-1 text-xs border border-slate-300 rounded font-bold text-emerald-700"
                            />
                          )}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{formatBDT(alloc.remainingDue)}</td>
                        <td className="p-3 text-center">
                          {alloc.allocatedAmount >= alloc.originalDue ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              Fully Cleared
                            </span>
                          ) : alloc.allocatedAmount > 0 ? (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              Partial Adjusted
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Method & Depositing */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="Bank Transfer">Bank Transfer (NPSB/BEFTN)</option>
                <option value="Cash">Cash in Hand</option>
                <option value="bKash">bKash Merchant</option>
                <option value="Nagad">Nagad Merchant</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {paymentMethod !== 'Cash' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposited Bank Account
                </label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bankName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collecting Field Officer
              </label>
              <select
                value={collectorSalesmanId}
                onChange={(e) => setCollectorSalesmanId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="">Direct Office Deposit</option>
                {salesmen.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction / Cheque Ref #
              </label>
              <input
                type="text"
                placeholder="e.g. BEFTN-112299"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl -mx-6 -mb-6 p-6">
            <div className="text-xs text-slate-500 font-medium">
              * Generates Money Receipt Voucher (Dr. Cash/Bank, Cr. Accounts Receivable).
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/80 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Collect ৳ {collectionAmount.toLocaleString()} & Issue Receipt
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
