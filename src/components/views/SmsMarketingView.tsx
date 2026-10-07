import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  Users,
  Settings,
  AlertTriangle,
  SlidersHorizontal,
  RefreshCw,
  Flame,
  Check
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const SmsMarketingView: React.FC = () => {
  const {
    smsLogs,
    customers,
    sendSmsNotification
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<'all' | 'dueOnly' | 'custom'>('all');
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [messageType, setMessageType] = useState<'Promotional Campaign' | 'Due Reminder' | 'Invoice Alert'>('Promotional Campaign');
  const [messageText, setMessageText] = useState('Eid & Puja Special Offer: Flat 2.5% extra cash rebate on purchasing 10+ Samsung Galaxy units this week. Contact TeleCorp Hotlines: 01711-002233.');
  const [maskingName, setMaskingName] = useState('TeleCorp');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Gateway status
  const totalUnitsDispatched = smsLogs.reduce((sum, s) => sum + (s.smsUnits || 1), 0);
  const totalAllocatedCredits = 5000;
  const smsBalance = Math.max(0, totalAllocatedCredits - totalUnitsDispatched);
  const totalDelivered = smsLogs.filter(s => s.status === 'Delivered').length;

  // Auto-trigger toggles
  const [autoInvoiceSms, setAutoInvoiceSms] = useState(true);
  const [autoDueReminderSms, setAutoDueReminderSms] = useState(true);
  const [autoPaymentReceiptSms, setAutoPaymentReceiptSms] = useState(true);
  const [autoWarrantyUpdateSms, setAutoWarrantyUpdateSms] = useState(true);

  const charCount = messageText.length;
  const smsUnits = Math.ceil(charCount / 160) || 1;

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (recipientGroup === 'custom') {
      if (!customPhone) return;
      sendSmsNotification({
        recipientPhone: customPhone,
        recipientName: customName || 'Valued Client',
        messageType,
        messageBody: messageText,
        masking: maskingName,
        smsUnits
      });
      setSuccessToast(`Dispatched message to ${customPhone}!`);
    } else {
      const targetCustomers = recipientGroup === 'dueOnly'
        ? customers.filter(c => c.currentDue > 0)
        : customers;

      targetCustomers.forEach(cust => {
        sendSmsNotification({
          recipientPhone: cust.mobile,
          recipientName: cust.shopName,
          messageType,
          messageBody: messageText.replace('{shop_name}', cust.shopName).replace('{due_amount}', cust.currentDue.toLocaleString()),
          masking: maskingName,
          smsUnits
        });
      });

      setSuccessToast(`Bulk campaign successfully queued for ${targetCustomers.length} mobile dealers!`);
    }

    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredLogs = smsLogs.filter(s =>
    s.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.recipientPhone.includes(searchTerm) ||
    s.messageBody.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-2.5 md:p-3 space-y-2.5 sm:space-y-3 w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Bulk SMS Gateway & Automated Dealer Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ইনভয়েস তৈরি, বকেয়া তাগাদা, পেমেন্ট রসিদ ও ফেস্টিভ্যাল প্রচারণার স্বয়ংক্রিয় এসএমএস অ্যালার্ট
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Gateway Balance</div>
            <div className="text-base font-black text-indigo-600 font-mono">
              {smsBalance.toLocaleString()} Credits
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Gateway Online (Greenweb BD)" />
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total SMS Dispatched</div>
          <div className="text-xl font-black text-slate-900 mt-1">{smsLogs.length} Messages</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all campaigns</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered Successfully
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">{totalDelivered} Delivered</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">100% Delivery rate</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Registered Dealer Audience
          </div>
          <div className="text-xl font-black text-blue-900 mt-1">{customers.length} Shops</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Verified mobile contacts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/50 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-indigo-700 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Sender Masking
          </div>
          <div className="text-xl font-black text-indigo-900 mt-1 font-mono">TeleCorp</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">BTRC Approved Masking</div>
        </div>
      </div>

      {/* Two Column Layout: Automated Trigger Settings & Campaign Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose SMS Campaign */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Broadcast SMS Composer</h3>
            <p className="text-[11px] text-slate-500">Send custom announcements or reminders to dealers</p>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Audience *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientGroup('all')}
                  className={`p-2 rounded-xl border text-center transition ${
                    recipientGroup === 'all'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div>All Dealers</div>
                  <div className="text-[10px] text-slate-400">({customers.length} shops)</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecipientGroup('dueOnly');
                    setMessageText('Dear {shop_name}, your current due with TeleCorp is BDT {due_amount}. Kindly settle via bank deposit to continue smooth delivery.');
                    setMessageType('Due Reminder');
                  }}
                  className={`p-2 rounded-xl border text-center transition ${
                    recipientGroup === 'dueOnly'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div>Overdue Shops</div>
                  <div className="text-[10px] text-slate-400">({customers.filter(c => c.currentDue > 0).length} shops)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientGroup('custom')}
                  className={`p-2 rounded-xl border text-center transition ${
                    recipientGroup === 'custom'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div>Single Number</div>
                  <div className="text-[10px] text-slate-400">Custom recipient</div>
                </button>
              </div>
            </div>

            {recipientGroup === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Telecom"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Message Content *</label>
                <span className="text-[10px] text-slate-400">
                  {charCount} chars ({smsUnits} SMS credit)
                </span>
              </div>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                required
              />
              <div className="text-[10px] text-slate-400 mt-1">
                Supported dynamic tags: <code className="bg-slate-100 px-1 py-0.5 rounded">{"{shop_name}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{"{due_amount}"}</code>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-[11px] text-slate-500">
                Sender Mask: <strong className="font-mono text-indigo-700">{maskingName}</strong>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Campaign</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Automated Trigger Configurations */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Real-Time Event Automation</h3>
            <p className="text-[11px] text-slate-500">Auto-dispatch transactional SMS on ERP actions</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">New Sales Invoice Alert</div>
                <div className="text-[11px] text-slate-500">Auto-send invoice #, BDT amount & items count upon billing</div>
              </div>
              <input
                type="checkbox"
                checked={autoInvoiceSms}
                onChange={(e) => setAutoInvoiceSms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Due Payment Reminder</div>
                <div className="text-[11px] text-slate-500">Weekly automated reminder for dealers with overdue credit</div>
              </div>
              <input
                type="checkbox"
                checked={autoDueReminderSms}
                onChange={(e) => setAutoDueReminderSms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Money Receipt Confirmation</div>
                <div className="text-[11px] text-slate-500">Send receipt acknowledgement with updated remaining balance</div>
              </div>
              <input
                type="checkbox"
                checked={autoPaymentReceiptSms}
                onChange={(e) => setAutoPaymentReceiptSms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Warranty RMA Device Ready</div>
                <div className="text-[11px] text-slate-500">Notify retailer when repaired handset arrives at office</div>
              </div>
              <input
                type="checkbox"
                checked={autoWarrantyUpdateSms}
                onChange={(e) => setAutoWarrantyUpdateSms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SMS Delivery Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider">
            SMS Gateway Dispatched Logs ({smsLogs.length})
          </h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient, phone, body..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs bg-white border rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="p-3">Sent Time</th>
                <th className="p-3">Recipient & Mobile</th>
                <th className="p-3">Message Type</th>
                <th className="p-3">Message Body</th>
                <th className="p-3 text-center">Units</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {log.sentAt}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.recipientName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{log.recipientPhone}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {log.messageType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 max-w-md truncate" title={log.messageBody}>
                    {log.messageBody}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    {log.smsUnits}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
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
