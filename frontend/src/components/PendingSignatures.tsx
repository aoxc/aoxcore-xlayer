import React, { useState } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, Clock, UserCheck, AlertTriangle, 
  Fingerprint, RefreshCw, Key, Database, Zap 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

/**
 * @title AOXC Multi-sig Pending Operations
 * @notice Manages transactions requiring multi-operator consensus before on-chain commitment.
 * @dev Audit Standards:
 * - Real-time signature threshold tracking.
 * - Multi-layered state reconciliation for X Layer Reth nodes.
 */

export const PendingSignatures = () => {
  const { pendingTransactions, approvePendingTx, isProcessing } = useAoxcStore();
  const { t } = useTranslation();
  const [localProcessing, setLocalProcessing] = useState<string | null>(null);

  /**
   * @notice Triggers cryptographic signing via Wallet & Sentinel vetting.
   * @param id Transaction unique identifier.
   */
  const handleSign = async (id: string) => {
    setLocalProcessing(id);
    try {
      // Store trigger includes Gemini Sentinel vetting and Wallet signature logic
      await approvePendingTx(id);
    } finally {
      setLocalProcessing(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050505] relative">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-amber-500/[0.04] to-transparent pointer-events-none" />

      {/* Header Area */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
        <div className="flex flex-col">
          <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            {t('pending.title', 'Awaiting Consensus')}
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <Key size={10} className="text-white/20" />
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Protocol Multi-sig v2.1 // Secure_Relay: ACTIVE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Network_Priority</span>
              <span className="text-[9px] font-bold text-amber-500/60 uppercase">High_Performance</span>
           </div>
           <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 px-5 py-2 rounded-2xl">
             <Shield size={14} className="text-amber-500" />
             <span className="text-[10px] font-black text-amber-500 font-mono tracking-tighter">
               THRESHOLD: 3/5 SIGNERS
             </span>
           </div>
        </div>
      </div>

      {/* Transaction Stream */}
      <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {pendingTransactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="h-64 flex flex-col items-center justify-center text-white/10 gap-6 border border-dashed border-white/5 rounded-[3rem]"
            >
              <div className="w-24 h-24 bg-white/[0.01] rounded-full flex items-center justify-center border border-white/5">
                <CheckCircle size={48} className="opacity-5" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] italic">{t('pending.empty', 'Zero Pending Authorizations')}</p>
            </motion.div>
          ) : (
            pendingTransactions.map((tx) => (
              <motion.div 
                key={tx.id} 
                layout
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-[#080808]/80 border border-white/5 rounded-[3rem] p-8 space-y-8 transition-all hover:border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
              >
                {/* Visual Glow Pulse */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-amber-500/[0.05] transition-all duration-1000" />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                         {tx.module === 'Finance' ? <Zap size={18} className="text-amber-500" /> : <Database size={18} className="text-amber-500" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest leading-none mb-1">
                          {tx.module}_SUBSYSTEM
                        </span>
                        <h3 className="text-white font-black text-2xl tracking-tighter uppercase leading-none">{tx.operation}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 px-4 py-2 bg-black/40 rounded-xl border border-white/5 w-fit">
                      <Fingerprint size={14} className="text-cyan-500/50" />
                      <span className="text-[10px] font-mono text-white/40 tracking-wider">HASH: {tx.id.slice(0, 16)}...</span>
                    </div>
                  </div>

                  {/* Consensus Logic Visualization */}
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Consensus_Weight</span>
                    <div className="flex gap-2 p-3 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
                      {Array.from({ length: tx.requiredSignatures }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          animate={i < tx.currentSignatures ? { 
                            scale: [1, 1.4, 1],
                            boxShadow: ["0 0 0px transparent", "0 0 15px #f59e0b", "0 0 0px transparent"]
                          } : {}}
                          transition={{ repeat: i < tx.currentSignatures ? Infinity : 0, duration: 2 }}
                          className={cn(
                            "w-3 h-3 rounded-full transition-all duration-1000",
                            i < tx.currentSignatures 
                              ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                              : "bg-white/5 border border-white/10"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Payload Decoder */}
                
                <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4 relative group/code overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Payload_Manifest</span>
                    <AlertTriangle size={12} className="text-amber-500/40 opacity-0 group-hover/code:opacity-100 transition-all duration-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto scrollbar-hide">
                    <pre className="text-[11px] font-mono text-amber-200/40 leading-relaxed break-all whitespace-pre-wrap">
                      {JSON.stringify(tx.details || { method: tx.operation, params: [] }, null, 2)}
                    </pre>
                  </div>
                  {/* Subtle Scanline for code box */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                </div>

                {/* Interaction Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-amber-500/60">
                      <Clock size={16} className="animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">
                        {tx.currentSignatures}/{tx.requiredSignatures} SIGNATURES COLLECTED
                      </span>
                    </div>
                    <div className="hidden md:block h-6 w-px bg-white/5" />
                    <div className="hidden md:block text-[10px] text-white/20 font-black uppercase tracking-widest">
                      TTL: ~3.4 HOURS REMAINING
                    </div>
                  </div>

                  <button
                    onClick={() => handleSign(tx.id)}
                    disabled={isProcessing || localProcessing === tx.id}
                    className={cn(
                      "w-full sm:w-auto group relative flex items-center justify-center gap-4 px-12 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500",
                      isProcessing || localProcessing === tx.id
                        ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                        : "bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] active:scale-95"
                    )}
                  >
                    {localProcessing === tx.id ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        COMMITTING_SIG...
                      </>
                    ) : (
                      <>
                        <UserCheck size={18} strokeWidth={2.5} />
                        {t('pending.sign_button', 'AUTHORIZE_TRANSACTION')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Forensic Warning Footer */}
      <div className="p-5 bg-[#0a0a0a] border-t border-white/5 flex justify-center items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/[0.01] animate-pulse" />
        <AlertTriangle size={14} className="text-amber-500/40 relative z-10" />
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] relative z-10">
          Neural OS // Forensic Audit Shield: ACTIVE
        </span>
      </div>
    </div>
  );
};
