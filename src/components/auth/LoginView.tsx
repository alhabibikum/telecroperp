import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Building,
  KeyRound,
  Shield,
  AlertTriangle,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { demoUsers, users, login, loginAsDemoUser } = useERP();

  const [email, setEmail] = useState('admin@telecorp.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে।');
    }
  };

  const handleInstantAdminLogin = () => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = loginAsDemoUser('user-admin');
      setIsLoading(false);
      if (res && !res.success) {
        setErrorMessage(res.error || 'প্রবেশ ব্যর্থ হয়েছে।');
      }
    }, 100);
  };

  const handleSelectDemoRole = (user: (typeof demoUsers)[0]) => {
    setEmail(user.email);
    setPassword(user.password || 'admin');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background ambient Apple-style glow spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Modal Card */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/40 z-10">
        
        {/* Left Presentation Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glossy sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-black text-2xl tracking-tight leading-tight flex items-center gap-1.5">
                  TeleCorp
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200">
                    ERP
                  </span>
                </div>
                <div className="text-xs text-blue-200 font-medium">Distribution & Retail Suite</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-xl font-black leading-snug">
                বাংলাদেশ মোবাইল হ্যান্ডসেট ডিস্ট্রিবিউশন প্ল্যাটফর্ম
              </h2>
              <p className="text-xs text-blue-100/85 leading-relaxed">
                মাল্টি-ব্র্যান্ড আইএমইআই (IMEI) লাইফসাইকেল ট্র্যাকিং, পাইকারি সেলস, রিটেইল পিওএস, কুরিয়ার চালান ও আর্থিক অডিট প্ল্যাটফর্ম।
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-blue-100 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">15-Digit Serialized Dual-IMEI Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Real-Time Due Ageing & Credit Limits</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">BTRC TAC & ISO Compliant Invoicing</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 text-[11px] text-blue-200/80 flex items-center justify-between relative z-10">
            <span className="font-semibold">ISO 9001:2026 Certified</span>
            <span className="font-mono bg-white/15 px-2 py-0.5 rounded-lg border border-white/20">v3.8.5 Enterprise</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-white/80">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">অপারেটর সাইন-ইন (Sign In)</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">নিচের ১-ক্লিক বাটনে চাপ দিয়ে সরাসরি প্রবেশ করুন</p>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Instant 1-Click Super Admin Login Hero Button */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_8px_25px_rgba(79,70,229,0.35)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-200">
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
                    দ্রুত ১-ক্লিক সুপার অ্যাডমিন প্রবেশ
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    Aminul Islam (Super Admin)
                  </div>
                  <div className="text-[11px] text-blue-100/90 font-medium">
                    পাসওয়ার্ড ছাড়া সরাসরি সম্পূর্ণ সিস্টেমে ঢুকুন
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstantAdminLogin}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-white hover:bg-blue-50 active:scale-95 text-blue-700 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-extrabold text-rose-800">লগইন ত্রুটি (Authentication Failed)</div>
                  <div className="font-medium text-rose-700 mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল বা আইডি (Email Address)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="admin@telecorp.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">পাসওয়ার্ড (PIN / Password)</label>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    রোল পাসওয়ার্ড দিন
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <span>সাইন-ইন করুন (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                অ্যাকাউন্ট অনুযায়ী টেস্ট লগইন (১-ক্লিক সুইচ):
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                All Roles Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    handleSelectDemoRole(u);
                    loginAsDemoUser(u.id);
                  }}
                  className="p-2 text-left rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xs active:scale-95 transition-all group text-xs cursor-pointer"
                  title={`Email: ${u.email} | Pass: ${u.password}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1 bg-white rounded-xl shadow-2xs border border-slate-100 shrink-0">{u.avatar}</span>
                    <div className="truncate min-w-0">
                      <div className="font-black text-slate-900 group-hover:text-blue-700 truncate text-[11px]">
                        {u.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold truncate">{u.role}</div>
                      <div className="text-[9px] text-blue-600 font-mono">pw: {u.password}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
