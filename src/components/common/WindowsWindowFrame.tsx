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
      className={`h-full flex flex-col transition-all duration-150 ${
        isMaximized ? 'w-full p-0' : 'p-2'
      }`}
    >
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-[#131c2e] text-slate-800 dark:text-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl ${className}`}
      >
        {/* Apple macOS Frosted Window Header */}
        <div className="h-10 px-4 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 select-none">
          {/* Left: macOS Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="traffic-light-close group"
              title="Close Window (Ctrl+W / Esc)"
            >
              <span className="opacity-0 group-hover:opacity-100 font-bold leading-none">✕</span>
            </button>
            <button
              type="button"
              onClick={() => minimizeWindow(id)}
              className="traffic-light-min group"
              title="Minimize Window"
            >
              <span className="opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
            </button>
            <button
              type="button"
              onClick={() => toggleMaximizeWindow(id)}
              className="traffic-light-zoom group"
              title={isMaximized ? 'Restore Window' : 'Zoom Window'}
            >
              <span className="opacity-0 group-hover:opacity-100 font-bold leading-none">⤢</span>
            </button>
          </div>

          {/* Center: Title & Subtitle */}
          <div className="flex items-center gap-2 min-w-0 px-2">
            {icon && <span className="text-sm shrink-0">{icon}</span>}
            <span className="font-semibold text-xs tracking-tight text-slate-800 dark:text-slate-200 truncate">
              {title}
            </span>
            {subtitle && (
              <span className="hidden md:inline text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate">
                • {subtitle}
              </span>
            )}
          </div>

          {/* Right: Window Layout Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleSplitView()}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                isSplitView
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Split 50/50 View"
            >
              <Columns2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc]/60 dark:bg-[#0b0f19]/60 p-2 sm:p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
