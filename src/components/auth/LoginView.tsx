import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Database,
  Settings
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const {
    login,
    isPasswordRecovery,
    requestPasswordReset,
    completePasswordRecovery
  } = useERP();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetRequest, setIsResetRequest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(() => {
    const config = getSupabaseConfig();
    return !config.url || !config.anonKey;
  });
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);
  const [isSavingSupabaseConfig, setIsSavingSupabaseConfig] = useState(false);

  const handleSaveSupabaseConfig = async () => {
    setSupabaseConfigError(null);
    setIsSavingSupabaseConfig(true);
    try {
      const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      if (!result.success) {
        setSupabaseConfigError(result.message);
        return;
      }
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey, true);
      window.location.reload();
    } catch (error) {
      console.error('Failed to configure Supabase from the login screen:', error);
      setSupabaseConfigError(error instanceof Error ? error.message : 'Supabase configuration পরীক্ষা করা যায়নি।');
    } finally {
      setIsSavingSupabaseConfig(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = isPasswordRecovery
        ? await completePasswordRecovery(newPassword)
        : isResetRequest
          ? await requestPasswordReset(email)
          : await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'লগইন ব্যর্থ হয়েছে।');
      } else if (isResetRequest) {
        setSuccessMessage('অ্যাকাউন্ট থাকলে পাসওয়ার্ড রিসেটের নির্দেশনা ইমেইলে পাঠানো হয়েছে।');
      } else if (isPasswordRecovery) {
        setSuccessMessage('পাসওয়ার্ড আপডেট হয়েছে।');
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে।';
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/40 z-10">
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-black text-2xl tracking-tight leading-tight flex items-center gap-1.5">
                  FIROZA
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
                আইএমইআই ট্র্যাকিং, পাইকারি সেলস, রিটেইল পিওএস, চালান ও হিসাব — পাসওয়ার্ড দিয়ে সাইন-ইন করুন।
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-blue-100 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Role-based access — password required</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Session does not store account passwords</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 text-[11px] text-blue-200/80 flex items-center justify-between relative z-10">
            <span className="font-semibold">Authorized operators only</span>
            <span className="font-mono bg-white/15 px-2 py-0.5 rounded-lg border border-white/20">FIROZA ERP</span>
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-white/80">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {isPasswordRecovery ? 'নতুন পাসওয়ার্ড সেট করুন' : isResetRequest ? 'পাসওয়ার্ড রিসেট' : 'অপারেটর সাইন-ইন'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isPasswordRecovery ? 'আপনার নতুন পাসওয়ার্ড দিন।' : isResetRequest ? 'রিসেট নির্দেশনা পেতে অ্যাকাউন্টের ইমেইল লিখুন।' : 'ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।'}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-extrabold text-rose-800">লগইন ত্রুটি</div>
                  <div className="font-medium text-rose-700 mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {successMessage}
              </div>
            )}

            <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setShowSupabaseConfig(open => !open)}
                className="flex w-full items-center justify-between text-xs font-bold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-700" />
                  Supabase সংযোগ
                </span>
                <Settings className="h-4 w-4" />
              </button>
              {showSupabaseConfig && (
                <div className="mt-3 space-y-2.5">
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    এই ডেস্কটপে সংযোগ কনফিগার করা নেই। Supabase Project URL ও publishable/anon key দিন। Service-role key এখানে দেবেন না।
                  </p>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={event => setSupabaseUrl(event.target.value)}
                    placeholder="https://your-project.supabase.co"
                    aria-label="Supabase Project URL"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={event => setSupabaseAnonKey(event.target.value)}
                    placeholder="Supabase publishable / anon key"
                    aria-label="Supabase publishable or anon key"
                    autoComplete="off"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {supabaseConfigError && (
                    <p role="alert" className="text-[11px] font-semibold text-rose-700">{supabaseConfigError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSupabaseConfig}
                    disabled={isSavingSupabaseConfig || !supabaseUrl.trim() || !supabaseAnonKey.trim()}
                    className="w-full rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingSupabaseConfig ? 'সংযোগ যাচাই হচ্ছে...' : 'সংযোগ যাচাই করে সেভ করুন'}
                  </button>
                </div>
              )}
            </section>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {!isPasswordRecovery && <div>
                <label className="block font-bold text-slate-700 mb-1">ইমেইল</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    placeholder="operator@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition"
                  />
                </div>
              </div>}

              {!isResetRequest && !isPasswordRecovery && <div>
                <label className="block font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    autoComplete="current-password"
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetRequest(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="mt-2 text-[11px] font-bold text-blue-700 hover:text-blue-900"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>}

              {isPasswordRecovery && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={newPassword}
                    autoComplete="new-password"
                    minLength={6}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <span>{isPasswordRecovery ? 'পাসওয়ার্ড আপডেট করুন' : isResetRequest ? 'রিসেট ইমেইল পাঠান' : 'সাইন-ইন করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {isResetRequest && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetRequest(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full text-[11px] font-bold text-slate-600 hover:text-slate-900"
                >
                  সাইন-ইনে ফিরে যান
                </button>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
