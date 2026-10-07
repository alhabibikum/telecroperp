import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface WindowItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  type: 'view' | 'dialog';
  isMinimized: boolean;
  isMaximized: boolean;
  onClose?: () => void;
  onSkip?: () => void;
}

interface WindowManagerContextType {
  isDesktop: boolean;
  windows: WindowItem[];
  activeWindowId: string | null;
  registerWindow: (win: WindowItem) => void;
  unregisterWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMinimizeWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  skipWindow: (id: string) => void;
  minimizeAll: () => void;
  restoreAll: () => void;
  isWindowMinimized: (id: string) => boolean;
  isWindowMaximized: (id: string) => boolean;
  isSplitView: boolean;
  splitWindowIds: [string, string] | null;
  toggleSplitView: (secondWindowId?: string) => void;
  closeSplitView: () => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  React.useEffect(() => {
    const handleResize = () => {
      const isLg = window.innerWidth >= 1024;
      setIsDesktop(prev => (prev !== isLg ? isLg : prev));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [splitWindowIds, setSplitWindowIds] = useState<[string, string] | null>(null);

  const toggleSplitView = useCallback((secondWindowId?: string) => {
    setIsSplitView(prev => {
      if (prev) {
        setSplitWindowIds(null);
        return false;
      }
      const primary = activeWindowId || 'dashboard';
      const secondary = secondWindowId || (primary === 'dashboard' ? 'wholesale-sales' : 'dashboard');
      setSplitWindowIds([primary, secondary]);
      return true;
    });
  }, [activeWindowId]);

  const closeSplitView = useCallback(() => {
    setIsSplitView(false);
    setSplitWindowIds(null);
  }, []);

  const registerWindow = useCallback((win: WindowItem) => {
    setWindows(prev => {
      const idx = prev.findIndex(w => w.id === win.id);
      if (idx >= 0) {
        const existing = prev[idx];
        if (
          existing.title === win.title &&
          existing.subtitle === win.subtitle &&
          existing.isMinimized === win.isMinimized &&
          existing.isMaximized === win.isMaximized &&
          existing.onClose === win.onClose &&
          existing.onSkip === win.onSkip
        ) {
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...win };
        return updated;
      }
      return [...prev, win];
    });
    if (!win.isMinimized) {
      setActiveWindowId(curr => (curr !== win.id ? win.id : curr));
    }
  }, []);

  const unregisterWindow = useCallback((id: string) => {
    setWindows(prev => {
      if (!prev.some(w => w.id === id)) return prev;
      return prev.filter(w => w.id !== id);
    });
    setActiveWindowId(curr => (curr === id ? null : curr));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: false } : w))
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId(curr => (curr === id ? null : curr));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: true, isMinimized: false } : w))
    );
    setActiveWindowId(id);
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: false, isMinimized: false } : w))
    );
    setActiveWindowId(id);
  }, []);

  const toggleMinimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextMin = !w.isMinimized;
          if (!nextMin) setActiveWindowId(id);
          else if (activeWindowId === id) setActiveWindowId(null);
          return { ...w, isMinimized: nextMin };
        }
        return w;
      })
    );
  }, [activeWindowId]);

  const toggleMaximizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, isMaximized: !w.isMaximized, isMinimized: false };
        }
        return w;
      })
    );
    setActiveWindowId(id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    const win = windows.find(w => w.id === id);
    if (win?.onClose) {
      win.onClose();
    }
    unregisterWindow(id);
  }, [windows, unregisterWindow]);

  const skipWindow = useCallback((id: string) => {
    const win = windows.find(w => w.id === id);
    if (win?.onSkip) {
      win.onSkip();
    } else if (win?.onClose) {
      win.onClose();
    }
    unregisterWindow(id);
  }, [windows, unregisterWindow]);

  const minimizeAll = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
  }, []);

  const restoreAll = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: false })));
  }, []);

  const isWindowMinimized = useCallback(
    (id: string) => {
      const win = windows.find(w => w.id === id);
      return win ? win.isMinimized : false;
    },
    [windows]
  );

  const isWindowMaximized = useCallback(
    (id: string) => {
      const win = windows.find(w => w.id === id);
      return win ? win.isMaximized : false;
    },
    [windows]
  );

  const value = useMemo(
    () => ({
      isDesktop,
      windows,
      activeWindowId,
      registerWindow,
      unregisterWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      toggleMinimizeWindow,
      toggleMaximizeWindow,
      closeWindow,
      skipWindow,
      minimizeAll,
      restoreAll,
      isWindowMinimized,
      isWindowMaximized,
      isSplitView,
      splitWindowIds,
      toggleSplitView,
      closeSplitView
    }),
    [
      isDesktop,
      windows,
      activeWindowId,
      registerWindow,
      unregisterWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      toggleMinimizeWindow,
      toggleMaximizeWindow,
      closeWindow,
      skipWindow,
      minimizeAll,
      restoreAll,
      isWindowMinimized,
      isWindowMaximized,
      isSplitView,
      splitWindowIds,
      toggleSplitView,
      closeSplitView
    ]
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = () => {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return ctx;
};
