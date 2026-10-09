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
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[80] bg-[#ffffcc] text-[#000000] px-3 py-1 font-bold text-xs flex items-center gap-2 border border-[#808080] shadow-md">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#cc0000]" />
          <span>উইন্ডোর বাইরে ক্লিকে ডাটা হারাবে না। বন্ধ করতে [✕] চাপুন।</span>
        </div>
      )}

      {/* Classic Windows Form Dialog Box */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative bg-[#f0f0f0] dark:bg-[#1e1e1e] text-[#000000] dark:text-[#ffffff] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col border-2 border-[#0055ea] dark:border-[#336699] transition-all overflow-hidden ${
          isLocalMaximized
            ? 'w-full h-full max-w-none max-h-none'
            : `w-full ${maxWidth} max-h-[92vh]`
        } ${shakeNotice ? 'ring-2 ring-[#cc0000]' : ''}`}
      >
        {/* Classic Windows Blue Titlebar */}
        <div className="h-7 bg-gradient-to-r from-[#0055ea] via-[#104a7b] to-[#002d62] dark:from-[#1b3864] dark:to-[#2b579a] text-white flex items-center justify-between px-2 shrink-0 select-none text-[12px] font-bold">
          {/* Title and Icon */}
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <span className="text-[12px] shrink-0">🗔</span>
            <span className="truncate">
              {title}
            </span>
            {subtitle && (
              <span className="hidden md:inline font-normal text-[11px] text-[#cce8ff] truncate">
                - {subtitle}
              </span>
            )}
          </div>

          {/* Windows Classic Controls Box */}
          <div className="flex items-center gap-0.5 shrink-0">
            {showSkipButton && (
              <button
                type="button"
                onClick={handleSkip}
                className="h-5 px-2 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] text-[10.5px] font-bold border border-[#707070] transition cursor-pointer mr-1"
                title="Skip / Dismiss"
              >
                Skip
              </button>
            )}

            {isDesktop && (
              <>
                <button
                  type="button"
                  onClick={() => minimizeWindow(effectiveId)}
                  className="w-5 h-5 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] border border-[#707070] flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLocalMaximized(prev => !prev)}
                  className="w-5 h-5 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] border border-[#707070] flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  title={isLocalMaximized ? 'Restore' : 'Maximize'}
                >
                  {isLocalMaximized ? <Copy className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-6 h-5 bg-[#e81123] hover:bg-[#f1707a] text-white border border-[#b80c1b] flex items-center justify-center font-bold text-xs cursor-pointer"
              title="Close Dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-[#f0f0f0] dark:bg-[#1e1e1e] text-[#000000] dark:text-[#ffffff]">
          {children}
        </div>
      </div>
    </div>
  );
};
