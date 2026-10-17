import React, { useEffect, useRef, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Smartphone,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
  Database,
  Settings
} from 'lucide-react';
import { getSupabaseConfig, hasSupabaseConfigBeenSaved, saveSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const {
    login,
    isPasswordRecovery,
    requestPasswordReset,
    completePasswordRecovery
  } = useERP();

  const [email, setEmail] = useState(() => localStorage.getItem('firoza-login-email') || '');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('firoza-login-email')));
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetRequest, setIsResetRequest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(() => !hasSupabaseConfigBeenSaved());
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);
  const [isSavingSupabaseConfig, setIsSavingSupabaseConfig] = useState(false);
  const secretSequence = useRef('');

  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const handleSecretSequence = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat) return;

      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      )) {
        secretSequence.current = '';
        return;
      }

      if (!/^\d$/.test(event.key)) {
        secretSequence.current = '';
        return;
      }
      secretSequence.current = `${secretSequence.current}${event.key}`.slice(-4);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        secretSequence.current = '';
      }, 2000);

      if (secretSequence.current === '1122') {
        secretSequence.current = '';
        setShowSupabaseConfig(true);
      }
    };

    window.addEventListener('keydown', handleSecretSequence);
    return () => {
      window.removeEventListener('keydown', handleSecretSequence);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

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
      } else if (!isResetRequest && !isPasswordRecovery) {
        if (rememberMe) localStorage.setItem('firoza-login-email', email);
        else localStorage.removeItem('firoza-login-email');
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
    <main className="relative flex min-h-screen min-h-[100svh] flex-col items-center overflow-x-hidden bg-[linear-gradient(180deg,#174c49_0%,#568a78_52%,#e5d7b8_100%)] px-4 pb-8 font-sans text-white">
      <header className="absolute left-[5.5%] top-[6.5%] z-20 drop-shadow-sm">
        <h1 className="text-lg font-extrabold tracking-[0.08em] sm:text-2xl">FIROZA ENTERPRISE</h1>
        <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-white/90 sm:text-sm">ERP DASHBOARD</p>
      </header>

      <svg
        aria-hidden="true"
        viewBox="0 0 1200 390"
        preserveAspectRatio="xMidYMax meet"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[38vh] min-h-[230px] w-full"
      >
        <g fill="#d7c7a5" opacity="0.36">
          <rect x="155" y="139" width="28" height="218" rx="12" />
          <rect x="190" y="108" width="28" height="249" rx="12" />
          <rect x="225" y="77" width="28" height="280" rx="12" />
          <rect x="260" y="121" width="28" height="236" rx="12" />
          <rect x="295" y="154" width="28" height="203" rx="12" />
          <rect x="875" y="126" width="28" height="231" rx="12" />
          <rect x="910" y="97" width="28" height="260" rx="12" />
          <rect x="945" y="123" width="28" height="234" rx="12" />
          <rect x="980" y="160" width="28" height="197" rx="12" />
        </g>
        <g fill="none" stroke="#e7dcc2" strokeWidth="7" opacity="0.78">
          <circle cx="335" cy="177" r="27" />
          <circle cx="866" cy="215" r="47" />
          <path d="M866 168a47 47 0 0 1 43 28l-43 19z" fill="#e7dcc2" stroke="none" />
          <path d="M866 215l-30 36a47 47 0 0 1-17-52" fill="#a7c4a7" stroke="none" />
          <path d="M530 225v-47m0 0c-20-19-31 2-10 7l20 4c20 4 10 26-10 7z" />
        </g>
        <ellipse cx="600" cy="349" rx="470" ry="20" fill="#244744" opacity="0.38" />
        <text
          x="600"
          y="337"
          textAnchor="middle"
          fill="#fffdf5"
          fontFamily="Arial, sans-serif"
          fontSize="174"
          fontWeight="900"
          letterSpacing="-9"
        >
          FIROZA
        </text>
        <g stroke="#22313d" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(196 220)">
            <circle cx="0" cy="0" r="11" fill="#f0c49b" stroke="none" />
            <path d="M0 14l-3 49m-1-34-21 23m23-22 20 15m-20 18-14 38m15-38 14 38" fill="none" />
            <path d="M-12 15h22l8 17h-36z" fill="#078f79" stroke="none" />
          </g>
          <g transform="translate(376 305)">
            <circle cx="0" cy="0" r="9" fill="#e9b88e" stroke="none" />
            <path d="M0 13v41m0-24-17 16m17-16 16 13m-16 11-12 29m12-29 13 29" fill="none" />
            <path d="M-10 14h20l7 15h-34z" fill="#d4c29e" stroke="none" />
          </g>
          <g transform="translate(741 238)">
            <circle cx="0" cy="0" r="10" fill="#efc298" stroke="none" />
            <path d="M0 13v49m0-27-18 17m18-17 20 16m-20 11-12 35m12-35 14 35" fill="none" />
            <path d="M-11 14h21l9 18h-38z" fill="#f7f1df" stroke="none" />
          </g>
          <g transform="translate(991 306)">
            <circle cx="0" cy="0" r="9" fill="#eabe97" stroke="none" />
            <path d="M0 13v39m0-22-16 11m16-11 16 10m-16 12-12 28m12-28 14 28" fill="none" />
            <path d="M-10 14h20l6 14h-32z" fill="#a7c4a7" stroke="none" />
          </g>
        </g>
      </svg>

      <section className="relative z-10 mt-[19vh] w-full max-w-[402px] rounded-[20px] border border-[#d7c7a5] bg-[#164b49] px-7 pb-6 pt-10 shadow-[0_20px_48px_-20px_rgba(22,57,52,0.5)]">
        {errorMessage && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-white/50 bg-red-950/20 p-2.5 text-xs text-white">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div role="status" className="mb-4 rounded-lg border border-white/50 bg-white/10 p-2.5 text-xs font-semibold text-white">
            {successMessage}
          </div>
        )}

        {(!hasSupabaseConfigBeenSaved() || showSupabaseConfig) && (
          <section className="mb-4 rounded-lg border border-white/30 bg-[#103d3d] p-3">
            <button
              type="button"
              onClick={() => setShowSupabaseConfig(open => !open)}
              className="flex w-full items-center justify-between text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2"><Database className="h-4 w-4" />Supabase connection</span>
              <Settings className="h-4 w-4" />
            </button>
            {showSupabaseConfig && (
              <div className="mt-3 space-y-2.5">
                <p className="text-[11px] leading-relaxed text-white/85">
                  Supabase Project URL ও publishable/anon key দিন। Service-role key এখানে দেবেন না।
                </p>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={event => setSupabaseUrl(event.target.value)}
                  placeholder="https://your-project.supabase.co"
                  aria-label="Supabase Project URL"
                  className="w-full rounded-lg border border-[#e7dcc2]/80 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/65 focus:outline-hidden focus:ring-2 focus:ring-[#d7c7a5]"
                />
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={event => setSupabaseAnonKey(event.target.value)}
                  placeholder="Supabase publishable / anon key"
                  aria-label="Supabase publishable or anon key"
                  autoComplete="off"
                  className="w-full rounded-lg border border-[#e7dcc2]/80 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/65 focus:outline-hidden focus:ring-2 focus:ring-[#d7c7a5]"
                />
                {supabaseConfigError && <p role="alert" className="text-[11px] font-semibold text-white">{supabaseConfigError}</p>}
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  disabled={isSavingSupabaseConfig || !supabaseUrl.trim() || !supabaseAnonKey.trim()}
                  className="w-full rounded-lg bg-[#e2d4b3] px-3 py-2 text-xs font-bold text-[#244744] hover:bg-[#eee4cf] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingSupabaseConfig ? 'সংযোগ যাচাই হচ্ছে...' : 'সংযোগ যাচাই করে সেভ করুন'}
                </button>
              </div>
            )}
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {!isPasswordRecovery && (
            <label className="sr-only" htmlFor="login-email">Email address</label>
          )}
          {!isPasswordRecovery && (
            <input
              id="login-email"
              type="email"
              value={email}
              autoComplete="username"
              onChange={event => {
                setEmail(event.target.value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              placeholder="username@firozaenterprise.com"
              aria-label="Email address"
              required
              className="h-[44px] w-full rounded-[9px] border-2 border-[#e7dcc2]/90 bg-transparent px-[18px] text-xs text-white outline-none placeholder:text-white/70 focus:border-[#e2d4b3] focus:ring-2 focus:ring-[#e2d4b3]/40"
            />
          )}

          {!isResetRequest && !isPasswordRecovery && (
            <div>
              <label className="sr-only" htmlFor="login-password">Secret key</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  onChange={event => {
                    setPassword(event.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Secret key..."
                  aria-label="Secret key"
                  required
                  className="h-[44px] w-full rounded-[9px] border-2 border-[#e7dcc2]/90 bg-transparent px-[18px] pr-12 text-xs text-white outline-none placeholder:text-white/70 focus:border-[#e2d4b3] focus:ring-2 focus:ring-[#e2d4b3]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {isPasswordRecovery && (
            <input
              type="password"
              value={newPassword}
              autoComplete="new-password"
              minLength={6}
              onChange={event => setNewPassword(event.target.value)}
              placeholder="New secret key..."
              aria-label="New password"
              required
              className="h-[44px] w-full rounded-[9px] border-2 border-[#e7dcc2]/90 bg-transparent px-[18px] text-xs text-white outline-none placeholder:text-white/70 focus:border-[#e2d4b3] focus:ring-2 focus:ring-[#e2d4b3]/40"
            />
          )}

          {isResetRequest && (
            <p className="text-xs leading-relaxed text-white/90">
              {isPasswordRecovery ? 'Choose a new password for your account.' : 'Enter your account email and we will send password reset instructions.'}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            {!isResetRequest && !isPasswordRecovery ? (
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-white/85">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={event => setRememberMe(event.target.checked)}
                  className="h-5 w-5 cursor-pointer accent-[#e2d4b3]"
                />
                Remember me
              </label>
            ) : <span />}
            <button
              type="submit"
              disabled={isLoading}
              className="min-w-[118px] rounded-[10px] border-2 border-[#f4ead5] bg-[#e2d4b3] px-5 py-1.5 text-sm font-bold text-[#244744] shadow-sm transition hover:bg-[#eee4cf] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Please wait...' : isPasswordRecovery ? 'Update key' : isResetRequest ? 'Send link' : 'Let me in'}
            </button>
          </div>

          {!isPasswordRecovery && !isResetRequest && (
            <button
              type="button"
              onClick={() => {
                setIsResetRequest(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="-mt-2 text-left text-[11px] text-white/80 underline-offset-2 hover:text-white hover:underline"
            >
              Help! Can&apos;t remember my password
            </button>
          )}
          {isResetRequest && (
            <button
              type="button"
              onClick={() => {
                setIsResetRequest(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-left text-[11px] text-white/80 underline-offset-2 hover:text-white hover:underline"
            >
              Back to sign in
            </button>
          )}
        </form>
      </section>
      <p className="sr-only">FIROZA ENTERPRISE authorized access only.</p>
    </main>
  );
};
