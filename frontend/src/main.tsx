import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

// CSS & Configurations
import './index.css';
import './i18n';

// Core Application
import App from './App.tsx';

/**
 * @title AOXC Neural OS Entry Point
 * @notice Global error boundaries and React root initialization.
 * @dev Implements strict kernel monitoring for runtime panics.
 */

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // AOXC Audit logging for critical runtime failures
    console.error("AOXCORE_CRITICAL_LOG:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#030303] text-red-500 p-8 font-mono flex flex-col items-center justify-center z-[10000]">
          <div className="max-w-2xl w-full border border-red-500/30 p-8 bg-red-950/5 rounded-[2.5rem] shadow-[0_0_100px_rgba(239,68,68,0.1)] backdrop-blur-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center animate-pulse">
                <span className="text-2xl">!</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">SYSTEM_KERNEL_PANIC</h1>
                <p className="text-[10px] text-red-400/50 uppercase tracking-[0.3em]">Critical Execution Halt</p>
              </div>
            </div>
            
            <p className="text-red-400/80 mb-6 text-xs leading-relaxed border-l-2 border-red-500/20 pl-4">
              An unrecoverable error has been detected in the AOXCORE runtime. 
              Forensic data has been logged to the neural console.
            </p>
            
            <pre className="bg-black/60 p-5 rounded-2xl border border-white/5 text-[9px] overflow-x-auto text-red-400/70 scrollbar-hide max-h-[200px]">
              <code>{this.state.error?.stack || this.state.error?.toString()}</code>
            </pre>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 transition-all active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
              >
                REBOOT_KERNEL
              </button>
              
              <button 
                onClick={() => window.location.href = "mailto:aoxcdao@gmail.com"}
                className="px-8 py-4 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all"
              >
                REPORT_TO_DAO
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-[9px] text-white/10 uppercase tracking-[0.8em] font-black">
            AOXC // Neural Shield Active
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * @notice Forensic Promise Auditing
 * Modern event listener approach for better browser compatibility.
 */
window.addEventListener('unhandledrejection', (event) => {
  console.warn("AUDIT_LOG [Warning]: Unhandled Neural Link Rejection ->", event.reason);
});

// Root Mounting Protocol
const container = document.getElementById('root');

if (!container) {
  throw new Error("AOXCORE_BOOT_FAILURE: Root container (id='root') was not found in DOM.");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
