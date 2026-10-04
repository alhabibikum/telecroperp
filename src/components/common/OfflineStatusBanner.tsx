import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const OfflineStatusBanner: React.FC = () => {
  const { isOnline, pendingSyncCount, isSyncing, triggerManualSync } = useERP();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setBannerDismissed(false);
    } else if (wasOffline) {
      // Transitioned from offline to online
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Back online floating notification
  if (showOnlineToast) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>{isSyncing ? 'অফলাইন পরিবর্তন সিঙ্ক হচ্ছে...' : 'ইন্টারনেট পুনঃসংযুক্ত (Online Synced)'}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isSyncing
                ? 'অফলাইনে করা পরিবর্তনসমূহ ক্লাউডে আপডেট করা হচ্ছে...'
                : 'সকল অফলাইন এন্ট্রি ও ক্লাউড ডাটাবেজ সফলভাবে সিঙ্ক ও আপডেট হয়েছে।'}
            </p>
          </div>
          <button
            onClick={() => setShowOnlineToast(false)}
            className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active Offline Alert Bar
  if (!isOnline && !bannerDismissed) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md relative z-40">
        <div className="flex items-center gap-2.5 max-w-4xl">
          <div className="p-1 bg-amber-700/60 rounded-lg">
            <WifiOff className="w-4 h-4 text-amber-100 animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-extrabold uppercase tracking-wide bg-amber-800/80 px-2 py-0.5 rounded text-[10px]">
              অফলাইন মোড
            </span>
            <span className="font-medium text-amber-50">
              ইন্টারনেট সংযোগ বিচ্ছিন্ন। সফটওয়্যারটি সম্পূর্ণ কার্যকর রয়েছে।
              {pendingSyncCount > 0 ? (
                <b className="ml-1 bg-amber-900/60 px-2 py-0.5 rounded-full text-white font-black">
                  {pendingSyncCount}টি নতুন পরিবর্তন সংরক্ষিত (অটো-সিঙ্ক বাকি)
                </b>
              ) : (
                ' সকল নতুন সেলস, কালেকশন, এডিট ও ডিলিট ব্রাউজারে সুরক্ষিত থাকবে এবং ইন্টারনেট ফিরলেই সিঙ্ক হবে।'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="hidden sm:flex items-center gap-1 bg-amber-700/60 hover:bg-amber-800 px-2.5 py-1 rounded-md text-[11px] font-bold transition text-amber-100"
            title="পুনরায় নেটওয়ার্ক চেক করুন"
          >
            <RefreshCw className="w-3 h-3" />
            <span>চেক করুন</span>
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-amber-200 hover:text-white p-1 rounded hover:bg-amber-700/50 transition"
            title="হাইড করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
