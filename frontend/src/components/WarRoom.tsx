import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import { 
  Shield, TrendingUp, Users, MessageSquare, Bug, Brain, 
  Zap, ChevronRight, Activity, Fingerprint, Loader2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useAoxcStore } from '../store/useAoxcStore';
// DİKKAT: Tree yapına göre dosya adı 'xlayer' olmalı, 'xlayerEngine' değil.
import { debugTrace } from '../services/xlayer'; 

/**
 * @title AOXC Strategic War Room v2.5
 * @notice Forensic decision tracking and AI-driven governance simulation.
 */

const pastDecisions = [
  { id: '1', title: 'Vault Yield Strategy v2', status: 'Passed', risk: 12, impact: 'Positive', date: '2026-02-15', txHash: '0xabc...123' },
  { id: '2', title: 'Emergency Brake Activation', status: 'Executed', risk: 85, impact: 'Critical', date: '2026-02-20', txHash: '0xdef...456' },
  { id: '3', title: 'Asset Factory Mint Limit', status: 'Active', risk: 42, impact: 'Positive', date: '2026-03-01', txHash: '0x789...012' },
];

export const WarRoom = () => {
  const [selectedProposal, setSelectedProposal] = useState(pastDecisions[2]);
  const { t } = useTranslation();
  const { addLog, blockNumber } = useAoxcStore();
  const [isDebugging, setIsDebugging] = useState(false);

  /**
   * @notice X Layer üzerinde adli takip (Forensic Trace) başlatır.
   */
  const handleDebug = async () => {
    setIsDebugging(true);
    addLog(`Sentinel: Initiating forensic trace for BLK #${blockNumber}...`, "ai");
    
    try {
      const result = await debugTrace(selectedProposal.txHash);
      if (result) {
        // Sonuç objesinin yapısına göre gasUsed bilgisini çekiyoruz
        addLog(`TRACE_SUCCESS: Gas used: ${result.gas || 'N/A'} | Trace completed.`, "success");
      } else {
        addLog("TRACE_FAILED: RPC node congestion or non-standard permissions.", "error");
      }
    } catch (e) {
      addLog("TRACE_CRITICAL: Uplink severed during trace.", "error");
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#030303] relative font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.02)_0%,transparent_50%)] pointer-events-none" />

      {/* LEFT: STRATEGIC HISTORY */}
      <aside className="w-full lg:w-[380px] border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-xl relative z-10 shrink-0">
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3 mb-2">
             <Activity size={14} className="text-cyan-500 animate-pulse" />
             <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Decision_Log</h2>
          </div>
          <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold leading-none">Archived Governance Stream</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {pastDecisions.map((decision) => (
            <motion.div 
              key={decision.id}
              whileHover={{ x: 5 }}
              onClick={() => setSelectedProposal(decision)}
              className={cn(
                "p-5 rounded-[1.5rem] border transition-all cursor-pointer group relative overflow-hidden",
                selectedProposal.id === decision.id 
                  ? "bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)]" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-bold text-white/20">{decision.date}</span>
                <span className={cn(
                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                  decision.status === 'Passed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                )}>{decision.status}</span>
              </div>
              <h3 className="text-[11px] font-black text-white/70 group-hover:text-white transition-colors uppercase tracking-tight leading-snug">
                {decision.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* RIGHT: NEURAL IMPACT PREDICTION */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-black/60 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-black text-xs uppercase tracking-[0.4em]">Neural_Simulation_Matrix</h2>
            <div className="flex items-center gap-2">
               <Fingerprint size={10} className="text-cyan-500/50" />
               <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold italic leading-none">
                 Analyzing: {selectedProposal.txHash}
               </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <Brain size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Sentinel_Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImpactCard title="Liquidity Flux" value="+12.4%" icon={TrendingUp} color="emerald" />
            <ImpactCard title="Neural Risk" value={`${selectedProposal.risk}%`} icon={Shield} color={selectedProposal.risk > 50 ? "rose" : "cyan"} />
            <ImpactCard title="Node Expansion" value="+2.1k" icon={Users} color="emerald" />
          </div>

          {/* AI Narrative Analysis */}
          <section className="relative group">
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] space-y-6 relative z-10 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <MessageSquare className="text-cyan-500" size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">AuditVoice Reasoning</h3>
                    <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Protocol Intelligence v4.2</span>
                 </div>
              </div>
              <p className="text-[11px] text-cyan-100/60 leading-relaxed font-mono border-l-2 border-cyan-500/30 pl-6 py-2 italic">
                "Based on the {selectedProposal.title} manifest, simulation confirms the Risk Score of {selectedProposal.risk} is within the acceptable 
                parameters for block #{blockNumber}. Forecast predicts capital efficiency linked to vector {selectedProposal.id}."
              </p>
            </div>
          </section>

          {/* Progress Bars */}
          <section className="space-y-6 pb-12">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Simulation_Engine_Output</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProgressBar label="System Stability" value={92} color="emerald" />
              <ProgressBar label="Capital Utilization" value={78} color="cyan" />
              <ProgressBar label="Governance Participation" value={64} color="blue" />
              <ProgressBar label="Network Throughput" value={88} color="emerald" />
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row gap-4 shrink-0">
          <button className="flex-1 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <Zap size={14} />
            {t('war_room.run_simulation', 'Relaunch Simulation')}
          </button>
          <button 
            onClick={handleDebug}
            disabled={isDebugging}
            className={cn(
              "px-8 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-black text-rose-500 hover:bg-rose-500 hover:text-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50",
              isDebugging && "animate-pulse"
            )}
          >
            {isDebugging ? <Loader2 className="animate-spin" size={14} /> : <Bug size={16} />}
            {isDebugging ? "Analyzing_Trace..." : "Debug_Trace_Transaction"}
          </button>
        </div>
      </main>
    </div>
  );
};

// --- Atomic Helpers ---
const ImpactCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4 group hover:border-white/10 transition-all">
    <div className={cn(
      "p-3 w-fit rounded-2xl border",
      color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
      color === 'rose' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
      "bg-cyan-500/10 border-cyan-500/20 text-cyan-500"
    )}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="space-y-1">
      <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">{title}</span>
      <h4 className={cn(
        "text-2xl font-black tabular-nums tracking-tighter",
        color === 'emerald' ? "text-emerald-400" : color === 'rose' ? "text-rose-400" : "text-cyan-400"
      )}>{value}</h4>
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black px-1">
      <span className="text-white/20 uppercase tracking-widest">{label}</span>
      <span className={cn(color === 'emerald' ? "text-emerald-400" : "text-cyan-400")}>{value}%</span>
    </div>
    <div className="w-full bg-white/[0.03] h-1 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5 }}
        className={cn(
          "h-full rounded-full",
          color === 'emerald' ? "bg-emerald-500" : color === 'cyan' ? "bg-cyan-500" : "bg-blue-500"
        )}
      />
    </div>
  </div>
);
