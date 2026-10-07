import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  History,
  ShieldCheck,
  Search,
  User,
  Clock,
  Filter
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filtered = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const modules = Array.from(new Set(auditLogs.map(l => l.module)));

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              System Audit Trail & Security Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of every financial entry, IMEI movement, price change, and authorization
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono">
          Total Logged Actions: {auditLogs.length}
        </span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, reference #, user, before/after values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
        >
          <option value="All">All Functional Modules</option>
          {modules.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Responsible User</th>
                <th className="p-3">Module</th>
                <th className="p-3">Event Action</th>
                <th className="p-3 font-mono">Ref Doc #</th>
                <th className="p-3">Audit Details & Delta</th>
                <th className="p-3">Client IP & Loc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.user}</div>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold border border-blue-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">
                    {log.module}
                  </td>
                  <td className="p-3 font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="p-3 font-mono text-blue-700 font-bold">
                    {log.referenceNo}
                  </td>
                  <td className="p-3 text-slate-600 max-w-sm">
                    {log.oldValue && (
                      <div className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mb-0.5">
                        Old: {log.oldValue}
                      </div>
                    )}
                    {log.newValue && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        New: {log.newValue}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">
                    {log.ipAddress || '103.220.198.42'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
