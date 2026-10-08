import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { playScanSuccessBeep, playScanWarningBeep } from '../../utils/barcodeScannerUtils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => string;
  showSuccess: (messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => string;
  showError: (messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => string;
  showWarning: (messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => string;
  showInfo: (messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => string;
  showLoading: (messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((type: ToastType, title: string, description?: string, duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = { id, type, title, description, duration };

    // Audio feedback
    if (type === 'success') {
      playScanSuccessBeep();
    } else if (type === 'error' || type === 'warning') {
      playScanWarningBeep();
    }

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 at once

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  const parseToastArgs = useCallback((
    type: ToastType,
    messageOrTitle: string,
    descriptionOrOptions?: string | ToastOptions,
    customDuration?: number
  ) => {
    let realTitle = messageOrTitle;
    let realDesc: string | undefined = undefined;
    let duration = customDuration ?? (type === 'error' ? 5000 : type === 'warning' ? 4500 : 3500);

    if (typeof descriptionOrOptions === 'object' && descriptionOrOptions !== null) {
      realTitle = descriptionOrOptions.title || messageOrTitle;
      realDesc = descriptionOrOptions.title ? messageOrTitle : undefined;
      if (descriptionOrOptions.duration !== undefined) {
        duration = descriptionOrOptions.duration;
      }
    } else if (typeof descriptionOrOptions === 'string') {
      realTitle = messageOrTitle;
      realDesc = descriptionOrOptions;
    }

    return showToast(type, realTitle, realDesc, duration);
  }, [showToast]);

  const showSuccess = useCallback((messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => {
    return parseToastArgs('success', messageOrTitle, descriptionOrOptions, duration ?? 3500);
  }, [parseToastArgs]);

  const showError = useCallback((messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => {
    return parseToastArgs('error', messageOrTitle, descriptionOrOptions, duration ?? 5000);
  }, [parseToastArgs]);

  const showWarning = useCallback((messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => {
    return parseToastArgs('warning', messageOrTitle, descriptionOrOptions, duration ?? 4500);
  }, [parseToastArgs]);

  const showInfo = useCallback((messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => {
    return parseToastArgs('info', messageOrTitle, descriptionOrOptions, duration ?? 3500);
  }, [parseToastArgs]);

  const showLoading = useCallback((messageOrTitle: string, descriptionOrOptions?: string | ToastOptions, duration?: number) => {
    return parseToastArgs('loading', messageOrTitle, descriptionOrOptions, duration ?? 0);
  }, [parseToastArgs]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        dismissToast,
        clearAllToasts
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
      role="region"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-950/90 text-white border-emerald-500/50 shadow-emerald-950/40',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
                badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              };
            case 'error':
              return {
                bg: 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/40',
                icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
                badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              };
            case 'warning':
              return {
                bg: 'bg-amber-950/95 text-white border-amber-500/50 shadow-amber-950/40',
                icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
                badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              };
            case 'loading':
              return {
                bg: 'bg-slate-900/95 text-white border-blue-500/50 shadow-slate-950/40',
                icon: <Loader2 className="w-5 h-5 text-blue-400 shrink-0 animate-spin" />,
                badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              };
            case 'info':
            default:
              return {
                bg: 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/40',
                icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
                badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              };
          }
        };

        const style = getStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${style.bg}`}
          >
            <div className="mt-0.5">{style.icon}</div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold leading-snug tracking-tight text-white line-clamp-2">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
