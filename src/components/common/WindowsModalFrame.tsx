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
  const { registerWindow, unregisterWindow, isWindowMinimized, isDesktop, minimizeWindow } = useWindowManager();

  const [isLocalMaximized, setIsLocalMaximized] = useState(false);
  const [shakeNotice, setShakeNotice] = useState(false);
  const shakeTimeoutRef = useRef<any>(null);

  const isMinimized = isWindowMinimized(effectiveId);

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

  // Prevent closing when clicking backdrop to protect data entry in long accounting forms
  const handleBackdropClick = (e: React.MouseEvent) => {
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 select-none transition-opacity duration-100 ${
        isMinimized
          ? 'opacity-0 pointer-events-none'
          : 'bg-black/60 opacity-100 pointer-events-auto'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Visual notice popup when user clicks outside */}
      {shakeNotice && !isMinimized && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] bg-amber-500 text-white px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 shadow-xl animate-bounce">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>উইন্ডোর বাইরে ক্লিকে ডাটা হারাবে না। বন্ধ করতে লাল [✕] বোতাম চাপুন।</span>
        </div>
      )}

      {/* Linear & Mercury Enterprise Modal Dialog */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative bg-white dark:bg-[#111726] text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-all overflow-hidden ${
          isLocalMaximized
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : `w-full ${maxWidth} max-h-[90vh]`
        } ${shakeNotice ? 'ring-2 ring-amber-500' : ''}`}
      >
        {/* Clean Enterprise Modal Header */}
        <div className="h-14 px-5 bg-white dark:bg-[#111726] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 select-none">
          {/* Left: Icon, Title and Subtitle */}
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="truncate">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick actions & Close button */}
          <div className="flex items-center gap-2 shrink-0">
            {showSkipButton && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition cursor-pointer"
                title="Skip / Dismiss"
              >
                স্কিপ
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/50 dark:bg-[#0b0f19]/50">
          {children}
        </div>
      </div>
    </div>
  );
};
