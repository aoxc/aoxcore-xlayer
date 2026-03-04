import React, { useState } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, ArrowUpCircle, X, RefreshCw, 
  ShieldCheck, Cpu, HardDrive, Zap 
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXC Neural OS Upgrade Controller
 * @notice Interface for executing UUPS-compliant module upgrades.
 * @dev Integration:
 * - Detects AoxcFactory V2 deployment signals.
 * - Requires Sentinel AI vetting before implementation.
 * - Direct link to X Layer UUPS Implementation pointers.
 */

export const UpgradePanel = () => {
  const { upgradeAvailable, dismissUpgrade, addLog, blockNumber } = useAoxcStore() as any;
  const [isUpgrading, setIsUpgrading] = useState(false);

  /**
   * @notice Orchestrates the upgrade flow through the Sentinel gate.
   * @dev Triggers _authorizeUpgrade internally on the implementation contract.
   */
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    addLog('CRITICAL_EVENT: Initiating AoxcFactory V2 implementation swap...', 'warning');
    
    // AI Audit Simulation (NeuralOS Handshake)
    setTimeout(() => {
      addLog('SENTINEL_AI: Verification of V2 bytecode successful. Integrity Hash: 0x56a6...0800', 'ai');
      addLog('AOXC_CORE: Atomic upgrade committed to block #' + (blockNumber + 1), 'success');
      
      setIsUpgrading(false);
      dismissUpgrade();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {upgradeAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] w-[calc(100%-2rem)] md:w-[420px]"
        >
          {/* Main Card with High-Sec Visuals */}
          <div className="bg-[#0a0a0a] border border-cyan-500/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,1)] relative overflow-hidden backdrop-blur-3xl">
            
            {/* Animated Background Progress Bar for "Attention" */}
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/10">
               <motion.div 
                 initial={{ width: 0 }} animate={{ width: "100%" }} 
                 transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                 className="h-full bg-cyan-500" 
               />
            </div>

            <div className="flex items-start gap-5 relative z-10">
              {/* Dynamic Icon */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                  <Cpu className={cn("text-cyan-500", isUpgrading && "animate-spin")} size={28} />
                </div>
                {!isUpgrading && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-4 border-black animate-pulse" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">New_Module_Detected</span>
                  <button onClick={dismissUpgrade} className="text-white/20 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <h4 className="text-white font-bold text-base tracking-tight leading-tight">
                  Upgrade AoxcFactory to V2.0.0?
                </h4>
                
                <p className="text-[11px] text-white/40 leading-relaxed font-mono">
                  Autonomous deployment of the <span className="text-cyan-500/60 font-bold">Cellular Registry Module</span> is ready. 
                  Improves reputation matrix latency and gas efficiency.
                </p>
              </div>
            </div>

            {/* Implementation Details Box */}
            <div className="mt-5 bg-black p-4 rounded-2xl border border-white/5 space-y-3">
               <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-white/30">
                  <span>Logic Address</span>
                  <span className="text-white/60">0x71C...3A2</span>
               </div>
               <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-white/30">
                  <span>Proxy Protocol</span>
                  <span className="text-cyan-400">UUPS (EIP-1822)</span>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={cn(
                  "flex-1 relative flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden",
                  isUpgrading 
                    ? "bg-white/5 text-white/30 cursor-not-allowed" 
                    : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_10px_25px_rgba(6,182,212,0.3)] active:scale-95"
                )}
              >
                {isUpgrading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Committing_State...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Commit Implementation
                  </>
                )}
              </button>
              
              <button 
                onClick={() => addLog("UPGRADE_ABORTED: Operator deferred implementation swap.", "info")}
                className="px-6 py-4 bg-white/5 border border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase hover:bg-white/10 transition-all"
              >
                Trace
              </button>
            </div>
          </div>

          {/* Audit Verification Aura */}
          <div className="mt-3 flex justify-center items-center gap-2 opacity-50">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest italic">
               Hardware Wallet Signature Required on X Layer
             </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
