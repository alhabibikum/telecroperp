import React, { useState, useRef, useEffect } from 'react';
import { Minimize2, FastForward } from 'lucide-react';

interface FullScreenSkipButtonProps {
  isVisible: boolean;
  onSkip: () => void;
}

export const FullScreenSkipButton: React.FC<FullScreenSkipButtonProps> = () => {
  return null;
};

  const startHold = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setIsHolding(false);
        setProgress(0);
        onSkip();
      }
    }, 25);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <div
      className="fixed top-2.5 right-20 sm:right-28 z-50 flex items-center select-none animate-in fade-in slide-in-from-top-2 duration-300"
      role="region"
      aria-label="ফুলস্ক্রিন স্কিপ কন্ট্রোল"
    >
      <div
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className="relative group overflow-hidden flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 text-white shadow-2xl backdrop-blur-md border border-white/20 cursor-pointer transition-all active:scale-95 text-xs font-bold ring-1 ring-black/40"
        title="ফুলস্ক্রিন থেকে বের হতে ১ সেকেন্ড চেপে ধরে রাখুন (Hold 1s to Exit Fullscreen)"
      >
        {/* Progress Fill Background */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 opacity-70 transition-all pointer-events-none"
          style={{ width: `${progress}%` }}
        />

        {/* Circular Mini Progress Ring */}
        <div className="relative z-10 w-4 h-4 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-600/70 stroke-current"
              strokeWidth="4"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-teal-400 stroke-current transition-all duration-75"
              strokeDasharray={`${progress}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>

        {/* Action Text */}
        <span className="relative z-10 text-[11px] font-black tracking-tight whitespace-nowrap flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 text-teal-400" />
          <span>{isHolding ? `স্কিপ হচ্ছে... ${progress}%` : 'স্কিপ (চেপে রাখুন)'}</span>
        </span>

        {/* Shortcut Hint badge */}
        <kbd className="relative z-10 text-[9px] px-1 py-0.5 rounded bg-white/20 font-mono text-slate-200">
          F11
        </kbd>
      </div>
    </div>
  );
};
