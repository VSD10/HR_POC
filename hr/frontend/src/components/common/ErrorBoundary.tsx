import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in HR Portal:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('hr_admin_requests');
      localStorage.removeItem('hr_auth_token');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#050713] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
          {/* Ambient spatial lighting */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full bg-[#0a0f26]/90 border border-white/15 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold font-display text-white mb-2">
              HR Operations Console Encountered an Issue
            </h2>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              The application encountered an unexpected runtime error during state rendering.
              Your data is safe and synchronized with the backend.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-black/50 border border-rose-500/20 text-left font-mono text-[11px] text-rose-300 max-h-36 overflow-y-auto">
                <span className="font-bold text-rose-200">Error: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-neon-cyan"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/15 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cache & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
