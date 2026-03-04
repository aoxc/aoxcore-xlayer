import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAoxcStore } from '../store/useAoxcStore';
import { AlertCircle, CheckCircle2, Info, XCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXC Neural Toaster System
 * @notice Temporary notification hub for real-time protocol feedback.
 * @dev Integration: Listens to the global notification stream in useAoxcStore.
 */

export const Toaster = () => {
  const { notifications, setNotifications } = useAoxcStore() as any;

  // AUDIT: Auto-dismiss logic to prevent UI clutter
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        // En eski bildirimi listeden çıkar
        setNotifications((prev: any) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, setNotifications]);

  const icons = {
    info: <Info size={16} className="text-cyan-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />,
    error: <XCircle size={16} className="text-rose-500" />,
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    ai: <ShieldAlert size={16} className="text-purple-500" />
  };

  return (
    <div className="fixed top-24 right-8 z-[9999] flex flex-col gap-4 pointer-events-none max-w-md w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((n: any) => (
          <motion.div
            key={n.id}
            layout
            initial={{ x: 120, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 120, opacity: 0, scale: 0.8 }}
            className={cn(
              "relative p-5 rounded-[1.5rem] border bg-[#080808]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-5 pointer-events-auto group overflow-hidden",
              n.type === 'info' ? "border-cyan-500/20 shadow-cyan-500/5" :
              n.type === 'warning' ? "border-amber-500/20 shadow-amber-500/5" :
              n.type === 'error' ? "border-rose-500/20 shadow-rose-500/5" :
              "border-emerald-500/20 shadow-emerald-500/5"
            )}
          >
            {/* AUDIT: Real-time life-cycle indicator */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className={cn(
                "absolute bottom-0 left-0 h-1 opacity-40",
                n.type === 'info' ? "bg-cyan-500" :
                n.type === 'warning' ? "bg-amber-500" :
                n.type === 'error' ? "bg-rose-500" :
                "bg-emerald-500"
              )}
            />

            {/* Neural Pulse Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            {/* Icon Block */}
            <div className={cn(
              "p-3 rounded-2xl shrink-0 shadow-inner",
              n.type === 'info' ? "bg-cyan-500/10" :
              n.type === 'warning' ? "bg-amber-500/10" :
              n.type === 'error' ? "bg-rose-500/10" :
              "bg-emerald-500/10"
            )}>
              {icons[n.type as keyof typeof icons] || icons.info}
            </div>
            
            {/* Content block */}
            <div className="flex flex-col flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-4">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] font-mono",
                  n.type === 'info' ? "text-cyan-400" :
                  n.type === 'warning' ? "text-amber-400" :
                  n.type === 'error' ? "text-rose-400" :
                  "text-emerald-400"
                )}>
                  {n.type}_UPLINK
                </span>
                <span className="text-[8px] text-white/20 font-mono font-bold tracking-widest uppercase italic">
                  Block_Live
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed mt-2 font-mono font-medium">
                {n.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
