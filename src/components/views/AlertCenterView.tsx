import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';

interface AlertCenterViewProps {
  onSelectView: (view: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({ onSelectView }) => {
  const { alerts, markAlertRead, clearAllAlerts } = useERP();
  const [filterType, setFilterType] = useState<string>('All');

  const filtered = alerts.filter(a => filterType === 'All' || a.type === filterType);

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Centralized Enterprise Alert Cockpit
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time automated warnings: Customer credit limit breaches, 30/60/90+ day overdues, low stock thresholds & supplier payables
          </p>
        </div>

        <button
          onClick={clearAllAlerts}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
        >
          Mark All As Read
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['All', 'critical', 'warning', 'reminder', 'info'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
              filterType === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {type === 'critical' ? '🔴 Critical' :
             type === 'warning' ? '🟠 Warning' :
             type === 'reminder' ? '🟡 Reminder' :
             type === 'info' ? '🟢 Info' :
             `All Alerts (${alerts.length})`}
          </button>
        ))}
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filtered.map(al => (
          <div
            key={al.id}
            className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
              al.type === 'critical' ? 'bg-rose-50/50 border-rose-200 shadow-xs' :
              al.type === 'warning' ? 'bg-amber-50/50 border-amber-200' :
              al.type === 'reminder' ? 'bg-blue-50/50 border-blue-200' :
              'bg-white border-slate-200'
            } ${al.read ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {al.type === 'critical' ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                ) : al.type === 'warning' ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : al.type === 'reminder' ? (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center font-bold">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{al.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{al.timestamp}</span>
                  {!al.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{al.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {al.linkModule && (
                <button
                  onClick={() => {
                    markAlertRead(al.id);
                    onSelectView(al.linkModule!);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {!al.read && (
                <button
                  onClick={() => markAlertRead(al.id)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
