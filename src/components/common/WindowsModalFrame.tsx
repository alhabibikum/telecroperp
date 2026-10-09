import React, { useState, useEffect, useRef } from 'react';
import { Minus, Square, Copy, X, FastForward, ShieldAlert, Code2 } from 'lucide-react';
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

  // Prevent closing when clicking backdrop to prevent data loss in long ERP invoices
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none transition-opacity duration-150 ${
        isMinimized
          ? 'opacity-0 pointer-events-none'
          : 'bg-black/60 backdrop-blur-xs opacity-100 pointer-events-auto'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Notice when clicking outside in empty space */}
      {shakeNotice && !isMinimized && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] bg-[#d83b01] text-white px-3 py-1.5 rounded-xs shadow-2xl font-bold text-xs flex items-center gap-2 border border-[#f48771] animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          <span>উইন্ডোর বাইরে ক্লিকে ডাটা হারাবে না। বন্ধ করতে [✕] চাপুন।</span>
        </div>
      )}

      {/* Main Visual Studio Dialog Window Box */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative bg-[#1e1e1e] text-[#d4d4d4] rounded-xs shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col border border-[#007acc] transition-all duration-150 overflow-hidden ${
          isLocalMaximized
            ? 'w-[99vw] h-[calc(100vh-45px)] max-w-none max-h-none rounded-none'
            : `w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh]`
        } ${shakeNotice ? 'ring-2 ring-[#d83b01]' : ''}`}
      >
        {/* Visual Studio Dialog Titlebar */}
        <div className="h-8 bg-[#2d2d30] text-[#cccccc] flex items-center justify-between px-3 border-b border-[#3f3f46] shrink-0 select-none text-[12px] font-mono">
          {/* Title and Icon */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-4 h-4 rounded-xs bg-[#007acc]/20 border border-[#007acc]/40 flex items-center justify-center text-[#9cdcfe] text-[10px] shrink-0">
              {icon || <Code2 className="w-3 h-3 text-[#007acc]" />}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-white truncate">
                {title}
              </span>
              {subtitle && (
                <span className="hidden md:inline text-[10.5px] text-[#858585] truncate">
                  - {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Dialog Titlebar Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {showSkipButton && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1 px-2 py-0.5 bg-[#252526] hover:bg-[#38383c] text-[#ce9178] border border-[#3f3f46] hover:border-[#d83b01] rounded-xs text-[11px] font-mono font-bold transition cursor-pointer mr-1"
                title="Skip / Dismiss"
              >
                <FastForward className="w-3 h-3" />
                <span>Skip</span>
              </button>
            )}

            {isDesktop && (
              <>
                <button
                  type="button"
                  onClick={() => minimizeWindow(effectiveId)}
                  className="w-5 h-5 rounded-xs hover:bg-[#38383c] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLocalMaximized(prev => !prev)}
                  className="w-5 h-5 rounded-xs hover:bg-[#38383c] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
                  title={isLocalMaximized ? 'Restore' : 'Maximize'}
                >
                  {isLocalMaximized ? (
                    <Copy className="w-2.5 h-2.5" />
                  ) : (
                    <Square className="w-2.5 h-2.5" />
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-5 h-5 rounded-xs hover:bg-[#a80000] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
              title="Close Dialog"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden text-[#d4d4d4] flex flex-col bg-[#1e1e1e]">
          {children}
        </div>
      </div>
    </div>
  );
};
