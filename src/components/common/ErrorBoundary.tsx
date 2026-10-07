import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full min-h-[350px] flex items-center justify-center p-6 bg-slate-900/5 backdrop-blur-xs select-none">
          <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                রিকভারি প্রটেকশন • Safe Recovery
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                {this.props.fallbackTitle || 'মডিউলে সাময়িক বিভ্রাট ঘটেছে'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                উইন্ডোটি লোড করার সময় একটি অপ্রত্যাশিত সমস্যা হয়েছে। আপনার পূর্বের সংরক্ষিত ডাটা সুরক্ষিত রয়েছে।
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">কারিগরি বিবরণ:</span>
                <p className="font-mono text-[11px] text-rose-700 break-all line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-black text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                title="ড্যাশবোর্ডে ফিরে যান"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>ড্যাশবোর্ড</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
