import React from 'react';
import { Minus, Square, Copy, X, Columns2 } from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';

interface WindowsWindowFrameProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const WindowsWindowFrame: React.FC<WindowsWindowFrameProps> = ({
  id,
  title,
  subtitle,
  icon,
  children,
  onClose,
  className = ''
}) => {
  const {
    isDesktop,
    isWindowMinimized,
    isWindowMaximized,
    minimizeWindow,
    toggleMaximizeWindow,
    closeWindow,
    isSplitView,
    toggleSplitView
  } = useWindowManager();

  const isMinimized = isWindowMinimized(id);
  const isMaximized = isWindowMaximized(id);

  const handleClose = () => {
    if (onClose) onClose();
    else closeWindow(id);
  };

  if (!isDesktop) {
    return (
      <div className={`h-full w-full overflow-y-auto bg-[#f0f0f0] dark:bg-[#1e1e1e] text-[#000000] dark:text-[#ffffff] ${className}`}>
        {children}
      </div>
    );
  }

  if (isMinimized) {
    return null;
  }

  return (
    <div
      className={`h-full flex flex-col transition-all duration-100 ${
        isMaximized
          ? 'w-full'
          : 'p-0.5 bg-[#d0d0d0] dark:bg-[#141414]'
      }`}
    >
      <div
        className={`flex-1 flex flex-col bg-[#f0f0f0] dark:bg-[#1e1e1e] text-[#000000] dark:text-[#ffffff] overflow-hidden border border-[#7f9db9] dark:border-[#3f3f46] ${className}`}
      >
        {/* Classic Windows Titlebar */}
        <div className="h-6.5 bg-gradient-to-r from-[#0055ea] via-[#104a7b] to-[#002d62] dark:from-[#1b3864] dark:to-[#2b579a] text-white flex items-center justify-between px-2 shrink-0 select-none text-[11.5px] font-bold">
          {/* Title & Icon */}
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <span className="text-xs shrink-0">🗔</span>
            <span className="truncate">{title}</span>
            {subtitle && (
              <span className="hidden lg:inline text-[10.5px] font-normal text-[#cce8ff] truncate">
                - {subtitle}
              </span>
            )}
          </div>

          {/* Windows Titlebar Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleSplitView()}
              className="w-5 h-4.5 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] border border-[#707070] flex items-center justify-center transition cursor-pointer"
              title="Split 50/50 View"
            >
              <Columns2 className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              onClick={() => minimizeWindow(id)}
              className="w-5 h-4.5 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] border border-[#707070] flex items-center justify-center transition cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              onClick={() => toggleMaximizeWindow(id)}
              className="w-5 h-4.5 bg-[#e1e1e1] hover:bg-[#ffffff] text-[#000000] border border-[#707070] flex items-center justify-center transition cursor-pointer"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Copy className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-6 h-4.5 bg-[#e81123] hover:bg-[#f1707a] text-white border border-[#b80c1b] flex items-center justify-center font-bold text-[11px] transition cursor-pointer"
              title="Close (Ctrl+F4)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f0f0f0] dark:bg-[#1e1e1e] p-1">
          {children}
        </div>
      </div>
    </div>
  );
};
