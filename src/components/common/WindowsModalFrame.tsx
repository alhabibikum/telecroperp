import React, { useState, useEffect, useRef } from 'react';
import { Minus, Square, Copy, X, FastForward, ShieldAlert } from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';

interface WindowsModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-7xl'
  modalId?: string;
  showSkipButton?: boolean;
}

export const WindowsModalFrame: React.FC<WindowsModalFrameProps> = ({
  isOpen,
  onClose,
  onSkip,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-4xl',
  modalId,
  showSkipButton = true
}) => {
  const effectiveId = modalId || `modal-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const { registerWindow, unregisterWindow, isWindowMinimized, focusWindow, isDesktop, minimizeWindow } = useWindowManager();

  const [isLocalMaximized, setIsLocalMaximized] = useState(false);
  const [shakeNotice, setShakeNotice] = useState(false);
  const shakeTimeoutRef = useRef<any>(null);

  const isMinimized = isWindowMinimized(effectiveId);

  // Register in Window Manager so it shows in the Windows Taskbar only when open
  useEffect(() => {
    if (isOpen) {
      registerWindow({
        id: effectiveId,
        title,
        subtitle,
        icon,
        type: 'dialog',
        isMinimized: false,
        isMaximized: isLocalMaximized,
        onClose,
        onSkip: onSkip || onClose
      });
      return () => {
        unregisterWindow(effectiveId);
      };
    }
  }, [isOpen, effectiveId, isLocalMaximized]);

  if (!isOpen) return null;

  // Handle clicking outside / backdrop: MUST NOT CLOSE!
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing, give tactile visual feedback
    e.preventDefault();
    e.stopPropagation();

    setShakeNotice(true);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeNotice(false);
    }, 2200);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
  };

  return (
    <div
      aria-hidden={isMinimized}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none transition-opacity duration-150 ${
        isMinimized
          ? 'opacity-0 pointer-events-none'
          : 'bg-slate-950/70 backdrop-blur-md opacity-100 pointer-events-auto'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Visual notice popup when user clicks outside in empty space */}
      {shakeNotice && !isMinimized && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-150 transform-gpu">
          <ShieldAlert className="w-4 h-4 shrink-0 text-slate-950 stroke-[2.5]" />
          <span>খালি জায়গায় ক্লিকে উইন্ডোটি বন্ধ হবে না। বন্ধ করতে [✕] বা [স্কিপ] চাপুন।</span>
        </div>
      )}

      {/* Main Window Box */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.2)] flex flex-col border border-slate-300/80 transition-all duration-150 transform-gpu will-change-transform overflow-hidden ${
          isLocalMaximized
            ? 'w-[99vw] h-[calc(100vh-55px)] max-w-none max-h-none rounded-none'
            : `w-full ${maxWidth} max-h-[90vh]`
        } ${shakeNotice ? 'ring-4 ring-amber-400 ring-offset-2 animate-bounce-subtle' : ''}`}
      >
        {/* Windows Titlebar */}
        <div className="h-10 sm:h-11 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between px-3 sm:px-4 border-b border-slate-700/80 shrink-0 select-none">
          {/* Title and Icon */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 text-xs shrink-0">
              {icon || <span className="text-[10px] font-black">🪟</span>}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                {title}
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                সাব-উইন্ডো
              </span>
            </div>
          </div>

          {/* Windows Titlebar Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Skip Button - "সাব-ইউন্ডোকে স্কিপ বাটান চেপে দূর করা বা ক্লোজ করা যাবে" */}
            {showSkipButton && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 rounded text-[11px] font-black transition cursor-pointer active:scale-95 mr-1"
                title="উইন্ডোটি স্কিপ করুন (Skip / Dismiss)"
              >
                <FastForward className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>স্কিপ (Skip)</span>
              </button>
            )}

            {/* Desktop Window Controls: Minimize & Maximize */}
            {isDesktop && (
              <>
                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => minimizeWindow(effectiveId)}
                  className="w-7 h-7 rounded hover:bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                  title="টাস্কবারে মিনিমাইজ করুন (Minimize to Taskbar)"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Maximize / Restore Button */}
                <button
                  type="button"
                  onClick={() => setIsLocalMaximized(prev => !prev)}
                  className="w-7 h-7 rounded hover:bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                  title={isLocalMaximized ? "পূর্বাবস্থায় ফেরান (Restore)" : "ম্যাক্সিমাইজ করুন (Maximize)"}
                >
                  {isLocalMaximized ? (
                    <Copy className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <Square className="w-3 h-3 stroke-[2.5]" />
                  )}
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded hover:bg-rose-600 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer group"
              title="উইন্ডোটি বন্ধ করুন (Close)"
            >
              <X className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden text-slate-800 flex flex-col bg-slate-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};
