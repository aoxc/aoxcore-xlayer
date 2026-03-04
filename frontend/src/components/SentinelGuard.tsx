import React, { useMemo } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldCheck, ShieldAlert, Lock, 
  Activity, Fingerprint, Eye, Zap 
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXCORE Sentinel Guard Interface
 * @notice Real-time visual monitoring for AoxcSentinel.sol operations.
 * @dev Audit Standards:
 * - Visualizing Surgical Interception events.
 * - Monitoring EIP-712 NeuralPacket validation streams.
 * - Reactive "Bastion Sealed" (Emergency Lock) state indicators.
 */
export const SentinelGuard = () => {
  const { logs, networkStatus, blockNumber } = useAoxcStore();

  // Audit Insight: Get critical security logs separately
  const securityLogs = useMemo(() => 
    logs.filter(l => l.type === 'ai' || l.type === 'error' || l.type === 'warning').slice(0, 15),
    [logs]
  );

  return (
    <div className="flex flex-col h-full bg-[#050505]/60 backdrop-blur-xl border-l border-white/5 font-mono text-[10px] relative overflow-hidden">
      {/* Visual background scanning effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_10px] pointer-events-none" />

      {/* Header: Sentinel Defense Status */}
      <div className="p-5 border-b border-white/5 bg-gradient-to-b from-emerald-500/[0.03] to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={16} className="animate-pulse" />
            <span className="uppercase tracking-[0.3em] font-black text-xs">Sentinel_Guard</span>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded text-[8px] font-bold border",
            networkStatus === 'healthy' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-500 animate-bounce"
          )}>
            {networkStatus === 'healthy' ? 'BASTION_OPEN' : 'BASTION_SEALED'}
          </div>
        </div>

        {/* Real-time Entropy Metrics */}
        <div className="grid grid-cols-2 gap-2 text-white/30 uppercase font-bold text-[8px] tracking-widest">
           <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
              <Zap size={10} className="text-cyan-500" />
              <span>Risk_Thr: 70/100</span>
           </div>
           <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
              <Fingerprint size={10} className="text-purple-500" />
              <span>EIP-712: ACTIVE</span>
           </div>
        </div>
      </div>
      
      {/* Live Interception Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        <div className="flex items-center gap-2 mb-3 text-white/20">
          <Eye size={10} />
          <span className="uppercase font-bold tracking-widest text-[8px]">Neural_Interception_Stream</span>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {securityLogs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-32 flex flex-col items-center justify-center text-white/10"
            >
               <Activity size={24} className="opacity-10 mb-2" />
               <span>NO_THREATS_DETECTED</span>
            </motion.div>
          ) : (
            securityLogs.map((log) => (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={cn(
                  "p-3 rounded-2xl border transition-all relative group overflow-hidden",
                  log.type === 'ai' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-100/70" :
                  log.type === 'warning' ? "bg-amber-500/5 border-amber-500/10 text-amber-100/70" :
                  log.type === 'error' ? "bg-rose-500/5 border-rose-500/10 text-rose-100/70" :
                  "bg-white/5 border-white/5 text-white/40"
                )}
              >
                {/* Glow bar for high severity */}
                {(log.type === 'error' || log.type === 'warning') && (
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    log.type === 'error' ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : "bg-amber-500"
                  )} />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 opacity-40 text-[7px] font-black uppercase">
                       {log.type === 'ai' ? <Sparkles size={8}/> : <ShieldAlert size={8}/>}
                       <span>{log.type}_SIG_VERIFIED</span>
                    </div>
                    <p className="leading-relaxed break-words">{log.message}</p>
                  </div>
                  <span className="opacity-20 text-[8px] font-mono tabular-nums bg-white/5 px-1.5 py-0.5 rounded">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 1 })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Diagnostic Metadata */}
      <div className="p-4 border-t border-white/5 bg-black/40 space-y-2">
        <div className="flex justify-between items-center text-[8px] font-bold text-white/20 uppercase tracking-widest">
           <span>Core_Integrity</span>
           <span className="text-emerald-500">100%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             animate={{ x: ['-100%', '100%'] }} 
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="w-1/3 h-full bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
           />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-white/30">
            <Terminal size={12} className="text-cyan-500" />
            <span className="text-[9px] font-black">AOXC_SENTINEL_v2.5_STABLE</span>
          </div>
          <Lock size={10} className="text-white/10" />
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: Sparkles icon for AI type ---
const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
