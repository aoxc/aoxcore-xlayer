import React, { useState, useMemo, useEffect } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, FileText, X, ArrowRight, Activity, 
  Lock, AlertTriangle, Cpu, RefreshCw 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { analyzeTransaction } from '../services/aiBridge';

/**
 * @title AOXC Contract Notary (Forensic Hub)
 * @notice Final verification layer using AI Simulation before on-chain commitment.
 * @dev Integration: X Layer (EVM) + Gemini 1.5 Flash.
 */
export const ContractNotary = () => {
  const { 
    activeNotary, 
    setActiveNotary, 
    addLog, 
    blockNumber,
    networkStatus,
    addNotification
  } = useAoxcStore() as any; // Casting to any if interfaces are still evolving
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<any>(null);
  const { t } = useTranslation();

  // İşlem detaylarını AI ile simüle et (Bileşen mount olduğunda başlar)
  useEffect(() => {
    const runSimulation = async () => {
      if (activeNotary && !aiVerdict) {
        try {
          const result = await analyzeTransaction({
            to: activeNotary.target || "0x",
            data: activeNotary.details?.calldata || "0x",
            value: activeNotary.details?.value || "0"
          });
          setAiVerdict(result);
        } catch (error) {
          console.error("SIMULATION_FAULT:", error);
        }
      }
    };
    runSimulation();
  }, [activeNotary, aiVerdict]);

  if (!activeNotary) return null;

  /**
   * @notice Final Authorization Handler
   * @dev Routes transaction to either DAO Multi-sig or direct Execution.
   */
  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // 1. AI SECURITY GATE
      if (aiVerdict?.verdict === 'REJECTED') {
        addLog(`CRITICAL: Transaction blocked by Sentinel AI reasoning.`, 'error');
        addNotification("Security Block: AI detected high risk.", "error");
        setIsProcessing(false);
        return;
      }

      // 2. MULTI-SIG LOGIC (Governance Check)
      const requiresGovernance = 
        activeNotary.module === 'Gov' || 
        activeNotary.module === 'Finance' ||
        activeNotary.operation.toLowerCase().includes('vault');

      if (requiresGovernance) {
        // Dispatch to PendingSignatures pool
        addLog(`DAO_UPLINK: ${activeNotary.operation} moved to Multi-sig queue.`, 'ai');
        addNotification("Consensus Required: Sent to Multi-sig pool.", "warning");
      } else {
        // Direct Execution Simulation
        addLog(`NOTARIZED: ${activeNotary.operation} committed to block #${blockNumber}.`, 'success');
        addNotification("Success: Transaction notarized and committed.", "success");
      }

      // Close Notary after 1.5s delay for visual feedback
      setTimeout(() => {
        setActiveNotary(null);
        setAiVerdict(null);
      }, 1500);

    } catch (error: any) {
      addLog(`TX_ERROR: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-2xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] relative"
      >
        {/* Forensic Background Scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-cyan-500/10 rounded-[1.2rem] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <FileText className="text-cyan-400" size={24} />
            </div>
            <div>
              <h2 className="font-mono font-black text-xs uppercase tracking-[0.4em] text-white/90 leading-none mb-2">Contract_Notary_v4</h2>
              <p className="text-[9px] text-white/20 font-mono font-bold tracking-widest uppercase italic">
                Uplink: XLayer_Mainnet // Kernel: {blockNumber}
              </p>
            </div>
          </div>
          <button onClick={() => setActiveNotary(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all group">
            <X size={20} className="text-white/20 group-hover:text-white" />
          </button>
        </div>

        {/* Workflow Image Integration */}
        

        {/* Core Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto relative z-10">
          
          {/* Left: Transaction Manifesto */}
          <div className="flex-1 p-10 space-y-10 border-b lg:border-b-0 lg:border-r border-white/5">
            <section className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                <Cpu size={12} /> Operation_Manifest
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">{activeNotary.operation}</h3>
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-500/30 rounded-full" />
                <p className="text-amber-400/90 text-[13px] font-mono leading-relaxed bg-amber-500/[0.03] p-6 rounded-[2rem] border border-amber-500/10 italic">
                  "{activeNotary.humanTranslation || 'No semantic translation available.'}"
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DataField label="Module Origin" value={activeNotary.module} highlight />
              <DataField label="Security Tier" value={activeNotary.operation.includes('Vault') ? 'Level_4 (Critical)' : 'Level_2 (Standard)'} />
              
              <div className="col-span-1 md:col-span-2 space-y-3">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Payload_Calldata_Dump</span>
                <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 font-mono text-[11px] text-white/40 break-all max-h-40 overflow-y-auto scrollbar-hide shadow-inner leading-relaxed">
                  {JSON.stringify(activeNotary.details, null, 2)}
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Sentinel Analysis */}
          <div className="w-full lg:w-[400px] p-10 bg-white/[0.01] flex flex-col gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Sentinel_Verdict</span>
                {!aiVerdict && <RefreshCw size={16} className="animate-spin text-cyan-500/40" />}
              </div>

              {aiVerdict ? (
                <div className={cn(
                  "p-8 rounded-[2.5rem] border flex flex-col gap-5 relative overflow-hidden transition-all duration-700",
                  aiVerdict.verdict === 'VERIFIED' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", aiVerdict.verdict === 'VERIFIED' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                      {aiVerdict.verdict === 'VERIFIED' ? <Shield size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <span className={cn("font-black text-2xl uppercase tracking-tighter", aiVerdict.verdict === 'VERIFIED' ? "text-emerald-400" : "text-rose-400")}>
                      {aiVerdict.verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 font-mono leading-relaxed italic border-l border-white/10 pl-4">
                    {aiVerdict.aiCommentary}
                  </p>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[11px] font-mono">
                    <span className="text-white/20 font-black uppercase">Risk_Index:</span>
                    <span className={cn("font-black", aiVerdict.riskScore > 50 ? "text-rose-500" : "text-emerald-500")}>
                      {aiVerdict.riskScore}/100
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10 gap-4">
                  <RefreshCw className="text-cyan-500/20 animate-spin" size={32} strokeWidth={1} />
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] animate-pulse italic text-center px-6">
                    Simulating EVM Execution & Neural Context...
                  </span>
                </div>
              )}
            </div>

            {/* Path Visualizer */}
            <div className="space-y-6">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Execution_Propagation</span>
               <div className="relative pl-8 space-y-8 border-l border-white/10 ml-2">
                  <PathStep label="Sentinel Guard" status="Active_Monitoring" active />
                  <PathStep label="Neural Bridge" status="Verdict_Received" active={!!aiVerdict} />
                  <PathStep label="XLayer Relay" status={isProcessing ? "Broadcasting..." : "Idle_Awaiting"} active={isProcessing} />
               </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 border-t border-white/5 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-10">
            <MetricBox label="Node Status" value="Healthy" color="text-emerald-500" pulse />
            <div className="h-10 w-px bg-white/5" />
            <MetricBox label="Gas Forecast" value={`${aiVerdict?.simulatedGas || '---'} Units`} color="text-cyan-400" />
          </div>

          <button
            onClick={handleConfirm}
            disabled={isProcessing || !aiVerdict}
            className={cn(
              "w-full md:w-auto px-16 py-6 rounded-2xl font-mono font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500",
              isProcessing || !aiVerdict
                ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                : aiVerdict.verdict === 'REJECTED' 
                  ? "bg-rose-900/20 text-rose-500 border border-rose-500/30 cursor-not-allowed"
                  : "bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_50px_rgba(6,182,212,0.4)]"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-4">
                <RefreshCw size={18} className="animate-spin" /> Committing_To_Ledger...
              </div>
            ) : aiVerdict?.verdict === 'REJECTED' ? (
              "Access Denied by Sentinel"
            ) : (
              <div className="flex items-center gap-4">
                Execute Transaction <ArrowRight size={18} strokeWidth={3} />
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Atomic Helper Components ---

const DataField = ({ label, value, highlight }: any) => (
  <div className="space-y-2">
    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</span>
    <p className={cn("text-base font-mono font-black tracking-tight", highlight ? "text-cyan-400 underline underline-offset-8 decoration-cyan-500/30" : "text-white/80")}>{value}</p>
  </div>
);

const PathStep = ({ label, status, active }: any) => (
  <div className="relative">
    <div className={cn(
      "absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-700",
      active ? "bg-cyan-500 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]" : "bg-transparent border-white/10"
    )} />
    <div className="flex flex-col">
      <span className={cn("text-[11px] font-black uppercase tracking-wider", active ? "text-white" : "text-white/20")}>{label}</span>
      <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">{status}</span>
    </div>
  </div>
);

const MetricBox = ({ label, value, color, pulse }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest leading-none">{label}</span>
    <div className="flex items-center gap-3">
      {pulse && <div className={cn("w-2 h-2 rounded-full", color, "animate-pulse")} />}
      <span className={cn("text-xs font-mono font-black uppercase", color)}>{value}</span>
    </div>
  </div>
);
