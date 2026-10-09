import React from 'react';
import { Minus, Square, Copy, X, Columns2, Code2 } from 'lucide-react';
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

  // On mobile/tablet, render directly in standard responsive mode
  if (!isDesktop) {
    return (
      <div className={`h-full w-full overflow-y-auto bg-[#1e1e1e] text-[#d4d4d4] ${className}`}>
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
          : 'p-0.5 bg-[#18181b]'
      }`}
    >
      <div
        className={`flex-1 flex flex-col bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden border border-[#3f3f46] ${
          isMaximized ? 'rounded-none' : 'rounded-xs shadow-md'
        } ${className}`}
      >
        {/* Visual Studio Document / Tool Window Header */}
        <div className="h-7 bg-[#2d2d30] text-[#cccccc] flex items-center justify-between px-2.5 border-b border-[#3f3f46] shrink-0 select-none text-[11.5px] font-mono">
          {/* Title & Icon */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-4 h-4 rounded-xs bg-[#007acc]/20 border border-[#007acc]/40 flex items-center justify-center text-[#9cdcfe] text-[10px] shrink-0">
              {icon || <Code2 className="w-3 h-3 text-[#007acc]" />}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-white truncate">
                {title}
              </span>
              {subtitle && (
                <span className="hidden lg:inline text-[10.5px] text-[#858585] truncate">
                  - {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Visual Studio Window Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Split View 50-50 Button */}
            <button
              type="button"
              onClick={() => toggleSplitView()}
              className={`h-5 w-5 rounded-xs flex items-center justify-center transition cursor-pointer ${
                isSplitView
                  ? 'bg-[#007acc] text-white'
                  : 'hover:bg-[#38383c] text-[#858585] hover:text-white'
              }`}
              title={isSplitView ? 'Exit Split View' : 'Side-by-Side 50/50 Split View'}
            >
              <Columns2 className="w-3 h-3" />
            </button>

            {/* Minimize Button */}
            <button
              type="button"
              onClick={() => minimizeWindow(id)}
              className="h-5 w-5 rounded-xs hover:bg-[#38383c] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
              title="Minimize to Status Bar"
            >
              <Minus className="w-3 h-3" />
            </button>

            {/* Maximize / Restore Button */}
            <button
              type="button"
              onClick={() => toggleMaximizeWindow(id)}
              className="h-5 w-5 rounded-xs hover:bg-[#38383c] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isMaximized ? (
                <Copy className="w-2.5 h-2.5" />
              ) : (
                <Square className="w-2.5 h-2.5" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="h-5 w-5 rounded-xs hover:bg-[#a80000] flex items-center justify-center text-[#858585] hover:text-white transition cursor-pointer"
              title="Close Document (Ctrl+F4)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1e1e1e] text-[#d4d4d4]">
          {children}
        </div>
      </div>
    </div>
  );
};
