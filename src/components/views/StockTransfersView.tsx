import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ArrowRightLeft,
  PlusCircle,
  Building,
  Calendar,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface StockTransfersViewProps {
  onOpenStockTransfer: () => void;
  onOpenIMEILookup: (imei: string) => void;
}

export const StockTransfersView: React.FC<StockTransfersViewProps> = ({
  onOpenStockTransfer,
  onOpenIMEILookup
}) => {
  const { stockTransfers } = useERP();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Inter-Warehouse Stock Transfers
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track movement of serialized handsets between Central Warehouse, Regional Depots, and Retail Outlets
          </p>
        </div>

        <button
          onClick={onOpenStockTransfer}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Initiate Transfer</span>
        </button>
      </div>

      <div className="space-y-4">
        {stockTransfers.map(trf => (
          <div key={trf.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-700 text-sm">{trf.transferNo}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {trf.status}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Date: <b>{formatDate(trf.transferDate)}</b> • Dispatched By: <b>{trf.dispatchedBy}</b>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Source Facility</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{trf.sourceWarehouseName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Destination Facility</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{trf.destinationWarehouseName}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="font-bold text-slate-700">Consigned Devices ({trf.totalQuantity} Units):</span>
              <div className="space-y-2">
                {trf.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{it.productName}</span>
                      <span className="text-slate-500 ml-2">({it.variantDesc})</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {it.imeis.map(im => (
                        <button
                          key={im}
                          onClick={() => onOpenIMEILookup(im)}
                          className="font-mono text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition"
                        >
                          {im}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {trf.notes && (
              <p className="text-[11px] text-slate-500 italic">Notes: {trf.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
