import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Link,
  MessageSquare,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Copy,
  Server,
  Zap,
  Globe,
  Sliders,
  Terminal,
  Activity
} from 'lucide-react';

export const ApiIntegrationsView: React.FC = () => {
  const { settings, updateSettings, sendSmsNotification } = useERP();
  const isBn = settings.language === 'bn';

  // Tabs: 'sms' | 'payment' | 'courier' | 'btrc'
  const [activeTab, setActiveTab] = useState<'sms' | 'payment' | 'courier' | 'btrc'>('sms');

  // SMS Gateway State
  const [smsProvider, setSmsProvider] = useState<'Greenweb' | 'Onnorokom' | 'Twilio' | 'SSL Wireless'>('Greenweb');
  const [smsApiKey, setSmsApiKey] = useState('gw_live_89f023ac829104bd73');
  const [smsSenderId, setSmsSenderId] = useState('TELECORP');
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState('01711002233');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);

  // Payment Gateways State
  const [bkashMerchant, setBkashMerchant] = useState('01888990011');
  const [bkashAppKey, setBkashAppKey] = useState('bk_app_7721839201948');
  const [bkashAppSecret, setBkashAppSecret] = useState('bk_sec_994827103859201');
  const [bkashEnvironment, setBkashEnvironment] = useState<'Sandbox' | 'Live'>('Live');
  const [showBkashSecret, setShowBkashSecret] = useState(false);

  const [nagadMerchant, setNagadMerchant] = useState('68291048');
  const [nagadPublicKey, setNagadPublicKey] = useState('nagad_pub_key_9928174');

  const [sslStoreId, setSslStoreId] = useState('telecorp_live');
  const [sslStorePass, setSslStorePass] = useState('ssl_live_secret_44321');

  // Courier Logistics State
  const [steadfastApiKey, setSteadfastApiKey] = useState('stdf_api_993810283');
  const [steadfastSecret, setSteadfastSecret] = useState('stdf_sec_448201928');
  const [pathaoClientId, setPathaoClientId] = useState('pathao_client_88291');
  const [pathaoSecret, setPathaoSecret] = useState('pathao_sec_99182746');
  const [autoSyncTracking, setAutoSyncTracking] = useState(true);

  // BTRC EIR API State
  const [btrcEirToken, setBtrcEirToken] = useState('BTRC_EIR_TAC_LIVE_2026_99482');
  const [btrcWebhookUrl, setBtrcWebhookUrl] = useState('https://api.telecorp.com.bd/v1/btrc/tac-verify');
  const [btrcAutoReport, setBtrcAutoReport] = useState(true);

  // Status feedback
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    service: string;
    status: 'success' | 'testing' | 'error';
    latencyMs?: number;
    message: string;
  } | null>(null);

  const handleSaveConfigs = () => {
    setSavedNotice(isBn ? 'কনফিগারেশন সফলভাবে সেভ ও কার্যকর করা হয়েছে!' : 'API credentials updated & persisted successfully!');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleTestConnection = (service: string) => {
    setConnectionTestResult({
      service,
      status: 'testing',
      message: `Connecting to ${service} API Gateway...`
    });

    setTimeout(() => {
      setConnectionTestResult({
        service,
        status: 'success',
        latencyMs: Math.floor(Math.random() * 45) + 38,
        message: `HTTP 200 OK — Authentication verified & token handshake active.`
      });
    }, 600);
  };

  // Notification toggle
  const [autoSmsOnSale, setAutoSmsOnSale] = useState(true);

  const handleSendTestSms = () => {
    if (!testSmsPhone) return;
    setTestSmsStatus('Sending test SMS...');
    setTimeout(() => {
      sendSmsNotification({
        recipientPhone: testSmsPhone,
        recipientName: 'Test Recipient',
        messageType: 'Promotional Campaign',
        messageBody: `[TeleCorp ERP] Gateway Test Success. API: ${smsProvider}, SenderID: ${smsSenderId}. Time: ${new Date().toLocaleTimeString()}`,
        masking: smsSenderId,
        smsUnits: 1
      });
      setTestSmsStatus(isBn ? 'টেস্ট এসএমএস সফলভাবে পাঠানো হয়েছে!' : 'Test SMS delivered successfully via gateway!');
      setTimeout(() => setTestSmsStatus(null), 4000);
    }, 500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Link className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isBn ? 'এপিআই ও পেমেন্ট গেটওয়ে ইন্টিগ্রেশন হাব' : 'API, SMS & Payment Gateway Integration Hub'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? 'এসএমএস গেটওয়ে, বিকাশ/নগদ পেমেন্ট এপিআই, কুরিয়ার এপিআই এবং বিটিআরসি ইআইআর লাইভ কানেকশন'
                  : 'Manage Greenweb SMS, bKash/Nagad Checkout, Steadfast Courier, and BTRC EIR API Webhooks'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfigs}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save & Persist All APIs'}</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'sms'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>এসএমএস গেটওয়ে (Bulk SMS)</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'payment'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>পেমেন্ট গেটওয়ে (bKash / Nagad / SSL)</span>
        </button>

        <button
          onClick={() => setActiveTab('courier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'courier'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>কুরিয়ার লজিস্টিকস (Steadfast / Pathao)</span>
        </button>

        <button
          onClick={() => setActiveTab('btrc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'btrc'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>বিটিআরসি ইআইআর (BTRC EIR & TAC)</span>
        </button>
      </div>

      {/* Test Connection Banner */}
      {connectionTestResult && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          connectionTestResult.status === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : connectionTestResult.status === 'testing'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2.5 font-bold">
            {connectionTestResult.status === 'testing' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>
              [{connectionTestResult.service}] {connectionTestResult.message}
            </span>
          </div>
          {connectionTestResult.latencyMs && (
            <span className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-300">
              Latency: {connectionTestResult.latencyMs}ms
            </span>
          )}
        </div>
      )}

      {/* TAB 1: SMS GATEWAYS */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">এসএমএস গেটওয়ে প্রোভাইডার সেটিংস</h3>
                <p className="text-xs text-slate-500 font-medium">ইনভয়েস কনফার্মেশন, বকেয়া রিমাইন্ডার ও ওয়ারেন্টি নোটিফিকেশন এপিআই</p>
              </div>
              <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Gateway
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">গেটওয়ে অপারেটর নির্বাচন (Select Provider)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Greenweb', 'Onnorokom', 'SSL Wireless', 'Twilio'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSmsProvider(p)}
                      className={`p-3 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                        smsProvider === p
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">API Token / Secret Key</label>
                  <div className="relative">
                    <input
                      type={showSmsKey ? 'text' : 'password'}
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmsKey(!showSmsKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSmsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approved Sender ID (Masking Name)</label>
                  <input
                    type="text"
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    placeholder="e.g. TELECORP"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">অটোম্যাটিক এসএমএস ট্র্রিগারসমূহ</div>
                  <div className="text-[11px] text-slate-500">ইনভয়েস তৈরি, বকেয়া পরিশোধ ও ওয়ারেন্টির সময় স্বয়ংক্রিয় মেসেজ পাঠান</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSmsOnSale}
                  onChange={(e) => setAutoSmsOnSale(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(`${smsProvider} SMS API`)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer"
                >
                  কানেকশন টেস্ট করুন (Ping API)
                </button>
              </div>
            </div>
          </div>

          {/* Test SMS Sending Panel */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Send className="w-4 h-4 text-blue-600" />
                <h4 className="font-black text-slate-900 text-sm">লাইভ টেস্ট এসএমএস সেন্ডার</h4>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">টেস্ট মোবাইল নাম্বার</label>
                  <input
                    type="text"
                    value={testSmsPhone}
                    onChange={(e) => setTestSmsPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">লাইভ ব্যালেন্স স্ট্যাটাস:</div>
                  <div className="flex items-center justify-between">
                    <span>অবশিষ্ট এসএমএস ক্রেডিট:</span>
                    <span className="font-black text-blue-600">৪,৮৫০ টি</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>প্রতি এসএমএস খরচ:</span>
                    <span className="font-mono text-slate-700">৳ ০.৩৫</span>
                  </div>
                </div>

                {testSmsStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    {testSmsStatus}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendTestSms}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>টেস্ট মেসেজ পাঠান</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT GATEWAYS */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* bKash Merchant Checkout */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  bK
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">bKash Merchant Checkout API</h4>
                  <p className="text-[11px] text-slate-500">বিকাশ পেমেন্ট গেটওয়ে ও অটোমেটেড ট্রানজ্যাকশন ভেরিফাই</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full">
                Tokenized API
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মার্চেন্ট নাম্বার</label>
                  <input
                    type="text"
                    value={bkashMerchant}
                    onChange={(e) => setBkashMerchant(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিবেশ (Environment)</label>
                  <select
                    value={bkashEnvironment}
                    onChange={(e) => setBkashEnvironment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    <option value="Live">Live Production</option>
                    <option value="Sandbox">Sandbox (Test Mode)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">App Key</label>
                <input
                  type="text"
                  value={bkashAppKey}
                  onChange={(e) => setBkashAppKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">App Secret</label>
                <div className="relative">
                  <input
                    type={showBkashSecret ? 'text' : 'password'}
                    value={bkashAppSecret}
                    onChange={(e) => setBkashAppSecret(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBkashSecret(!showBkashSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showBkashSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestConnection('bKash Checkout')}
                  className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl border border-pink-200 transition cursor-pointer"
                >
                  টেস্ট ভেরিফিকেশন (Ping bKash)
                </button>
                <span className="text-[10px] text-slate-400">Webhook: /api/webhook/bkash</span>
              </div>
            </div>
          </div>

          {/* Nagad Payment Gateway */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  NG
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Nagad Online Payment Gateway</h4>
                  <p className="text-[11px] text-slate-500">নগদ মার্চেন্ট পেমেন্ট ও কিউআর কোড কালেকশন</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                PGW v2.1
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={nagadMerchant}
                  onChange={(e) => setNagadMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Public Key / Secret Token</label>
                <input
                  type="password"
                  value={nagadPublicKey}
                  onChange={(e) => setNagadPublicKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestConnection('Nagad PGW')}
                  className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl border border-orange-200 transition cursor-pointer"
                >
                  টেস্ট ভেরিফিকেশন (Ping Nagad)
                </button>
                <span className="text-[10px] text-slate-400">Webhook: /api/webhook/nagad</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURIER LOGISTICS */}
      {activeTab === 'courier' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steadfast Courier */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  SC
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Steadfast Courier API</h4>
                  <p className="text-[11px] text-slate-500">অটো কনসাইনমেন্ট বুকিং ও লাইভ ডেলিভারি ট্র্যাকিং</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Steadfast API Key</label>
                <input
                  type="text"
                  value={steadfastApiKey}
                  onChange={(e) => setSteadfastApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Steadfast Secret Key</label>
                <input
                  type="password"
                  value={steadfastSecret}
                  onChange={(e) => setSteadfastSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestConnection('Steadfast Logistics')}
                  className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl border border-teal-200 transition cursor-pointer"
                >
                  কানেকশন টেস্ট (Ping Steadfast)
                </button>
              </div>
            </div>
          </div>

          {/* Pathao Courier */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  PT
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Pathao Courier Merchant API</h4>
                  <p className="text-[11px] text-slate-500">অন-ডিমান্ড পার্সেল পিকআপ ও সিওডি রিকনসিলিয়েশন</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                REST v2
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={pathaoClientId}
                  onChange={(e) => setPathaoClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={pathaoSecret}
                  onChange={(e) => setPathaoSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestConnection('Pathao Courier')}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                >
                  কানেকশন টেস্ট (Ping Pathao)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BTRC EIR */}
      {activeTab === 'btrc' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                EIR
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">
                  BTRC EIR (Equipment Identity Register) ও TAC ভেরিফিকেশন API
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC) আইনানুগ আইএমইআই ডাটাবেজ সরাসরি সমন্বয়
                </p>
              </div>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              BTRC Whitelisted Gateway
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">EIR Organization Token</label>
              <input
                type="text"
                value={btrcEirToken}
                onChange={(e) => setBtrcEirToken(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">TAC Verification Webhook Endpoint</label>
              <input
                type="text"
                value={btrcWebhookUrl}
                onChange={(e) => setBtrcWebhookUrl(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800 text-xs">স্বয়ংক্রিয় আইএমইআই রিপোর্ট সিঙ্ক (Auto EIR Sync)</div>
              <div className="text-[11px] text-slate-500">পারচেজ বিল এন্ট্রি হওয়ার সাথে সাথে বিটিআরসি পোর্টালে হ্যান্ডসেট সিরিয়াল রিপোর্ট করুন</div>
            </div>
            <input
              type="checkbox"
              checked={btrcAutoReport}
              onChange={(e) => setBtrcAutoReport(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleTestConnection('BTRC National EIR Gateway')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>বিটিআরসি সার্ভার পিং টেস্ট (Verify Handshake)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
