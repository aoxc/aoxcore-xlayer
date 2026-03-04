import React from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, XCircle, Trash2, Bell, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * @title AOXC Notification Center
 * @notice Aggregates protocol-level alerts, Sentinel findings, and network status updates.
 * @dev Audit Standards:
 * - Real-time state management for notification lifecycle.
 * - Severity-based visual coding (Error, Warning, Success, Info).
 * - Direct link to store for state synchronization.
 */

export const NotificationCenter = () => {
  // Store'dan gerçek bildirimleri ve silme fonksiyonunu (varsa) alıyoruz
  const { notifications, setNotifications } = useAoxcStore() as any; 
  const { t } = useTranslation();

  /**
   * @notice Removes a specific alert from the system state.
   * @dev In an Audit context, dismissed critical errors should still be kept in on-chain logs.
   */
  const clearNotification = (id: string) => {
    const updatedNotifications = notifications.filter((n: any) => n.id !== id);
    // Store'u doğrudan güncellemek için (Store'da bu fonksiyonu tanımlamalıyız)
    useAoxcStore.setState({ notifications: updatedNotifications });
  };

  /**
   * @notice Clears all non-error notifications.
   */
  const clearAll = () => {
    const onlyErrors = notifications.filter((n: any) => n.type === 'error');
    useAoxcStore.setState({ notifications: onlyErrors });
  };

  const icons = {
    info: <Info size={16} className="text-cyan-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />,
    error: <XCircle size={16} className="text-rose-500" />,
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden font-mono relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/5 blur-[80px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h2 className="text-white font-black text-sm uppercase tracking-[0.3em] flex items-center gap-3">
            <Bell size={18} className={cn(notifications.length > 0 && "animate-bounce text-cyan-500")} />
            {t('notifications.title', 'System Alerts')}
          </h2>
          <p className="text-white/20 text-[9px] mt-1 uppercase tracking-widest font-bold">
            Neural_Stream // Active Handlers: {notifications.length}
          </p>
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={clearAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
          >
            Flush Buffer
          </button>
        )}
      </div>

      {/* Notification Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <div className="w-20 h-20 bg-cyan-500/5 rounded-full flex items-center justify-center border border-cyan-500/10">
                <ShieldAlert size={32} className="text-cyan-900" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">All Systems Nominal</p>
                <p className="text-[10px] text-white/10 mt-1 uppercase">No active threats detected in X Layer</p>
              </div>
            </motion.div>
          ) : (
            notifications.map((n: any) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-5 rounded-[1.5rem] border bg-[#0a0a0a] flex items-start gap-5 group transition-all relative overflow-hidden",
                  n.type === 'error' ? "border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]" :
                  n.type === 'warning' ? "border-amber-500/20" :
                  "border-white/5 shadow-inner"
                )}
              >
                {/* Visual indicator for type */}
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 shadow-lg",
                  n.type === 'error' ? "bg-rose-500/10 border border-rose-500/20" :
                  n.type === 'warning' ? "bg-amber-500/10 border border-amber-500/20" :
                  "bg-cyan-500/10 border border-cyan-500/20"
                )}>
                  {icons[n.type as keyof typeof icons]}
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em]",
                      n.type === 'error' ? "text-rose-500" :
                      n.type === 'warning' ? "text-amber-500" :
                      "text-cyan-500"
                    )}>
                      {n.type}_LOG
                    </span>
                    <span className="text-[9px] text-white/20 font-mono font-bold">
                      [{new Date(n.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 1 })}]
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-mono font-medium">
                    {n.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button 
                  onClick={() => clearNotification(n.id)}
                  className="p-2 text-white/10 hover:text-white hover:bg-white/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Diagnostic */}
      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center opacity-30 select-none">
        <span className="text-[8px] font-black uppercase tracking-widest text-white">Kernel Alert Dispatcher</span>
        <span className="text-[8px] font-mono text-cyan-500">v4.2.1-SECURE</span>
      </div>
    </div>
  );
};
