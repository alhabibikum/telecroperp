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

  // On non-desktop devices (mobile/tablet), render directly in standard responsive mode
  if (!isDesktop) {
    return (
      <div className={`h-full w-full overflow-y-auto ${className}`}>
        {children}
      </div>
    );
  }

  if (isMinimized) {
    return null;
  }

  return (
    <div
      className={`h-full flex flex-col transition-all duration-150 transform-gpu ${
        isMaximized
          ? 'w-full'
          : 'p-0.5 sm:p-1 bg-slate-900/10'
      }`}
    >
      <div
        className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xl border border-slate-300/80 dark:border-slate-800 will-change-transform ${
          isMaximized ? 'rounded-none' : 'rounded-xl shadow-xl'
        } ${className}`}
      >
        {/* Windows OS Titlebar */}
        <div className="h-9 sm:h-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between px-3 sm:px-4 border-b border-slate-700/80 shrink-0 select-none">
          {/* Title & Icon */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <div className="w-5 h-5 rounded bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 text-xs shrink-0">
              {icon || <span className="text-[10px]">🖥️</span>}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                {title}
              </span>
              {subtitle && (
                <span className="hidden lg:inline text-[11px] text-slate-400 truncate">
                  • {subtitle}
                </span>
              )}
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                প্রধান উইন্ডো
              </span>
            </div>
          </div>

          {/* Windows Titlebar Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Minimize Button */}
            <button
              type="button"
              onClick={() => minimizeWindow(id)}
              className="w-7 h-7 rounded hover:bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              title="টাস্কবারে মিনিমাইজ করুন (Minimize to Taskbar)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Maximize / Restore Button */}
            <button
              type="button"
              onClick={() => toggleMaximizeWindow(id)}
              className="w-7 h-7 rounded hover:bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              title={isMaximized ? "রিস্টোর করুন (Restore Window)" : "ম্যাক্সিমাইজ করুন (Maximize Window)"}
            >
              {isMaximized ? (
                <Copy className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <Square className="w-3 h-3 stroke-[2.5]" />
              )}
            </button>

            {/* Snap Assist / Split View 50-50 Button */}
            <button
              type="button"
              onClick={() => toggleSplitView()}
              className={`w-7 h-7 rounded flex items-center justify-center transition cursor-pointer ${
                isSplitView
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title={isSplitView ? "একক ভিউতে ফিরে যান (Exit Split View)" : "স্প্লিট ভিউ (Side-by-Side 50/50 Snap Assist)"}
            >
              <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded hover:bg-rose-600 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer group"
              title="উইন্ডোটি বন্ধ করুন (Close Window)"
            >
              <X className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};
