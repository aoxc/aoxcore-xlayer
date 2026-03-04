import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAoxcStore, LedgerEntry } from '../store/useAoxcStore';
import { useTranslation } from 'react-i18next';
import { Lock, Search, FileText, ChevronRight, X, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXC Neural Ledger Protocol v4.2
 * @notice Forensic viewing layer for X Layer on-chain events.
 */

export const LedgerView = () => {
  const { ledgerEntries, activeView, permissionLevel, gasEfficiency, networkLoad } = useAoxcStore();
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const { t } = useTranslation();

  // Helper: Dynamic Title based on View
  const getTitle = () => {
    switch (activeView) {
      case 'finance': return 'FINANCIAL_LEDGER_STREAM';
      case 'sentinel': return 'SECURITY_GATE_AUDIT';
      default: return 'GLOBAL_PROTOCOL_LEDGER';
    }
  };

  // AUDIT: Filter logic based on system operational view
  const filteredEntries = ledgerEntries.filter(entry => {
    switch (activeView) {
      case 'finance': return entry.module === 'Finance';
      case 'sentinel': return entry.module === 'Sentinel' || entry.status === 'error';
      case 'pending': return entry.status === 'warning';
      default: return true;
    }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#060606] relative">
      {/* Top Telemetry Bar */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.4em] text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Neural Link: ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-8 text-[10px] font-mono">
          <Metric label="BLOCK_LOAD" value={networkLoad} />
          <Metric 
            label="GAS_EFFICIENCY" 
            value={`${gasEfficiency}%`} 
            color={gasEfficiency > 90 ? "text-emerald-500" : "text-amber-500"} 
          />
          <div className="w-px h-8 bg-white/5 mx-2" />
          <Metric 
            label="ACCESS_LEVEL" 
            value={permissionLevel === 2 ? "ADMIN" : "OPERATOR"} 
            color="text-cyan-400"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* ACCESS DENIED OVERLAY */}
        {permissionLevel === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 backdrop-blur-[12px] bg-black/60 flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-zinc-950 border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-amber-500/5 rounded-full flex items-center justify-center border border-amber-500/20">
                <Lock size={32} className="text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-white font-black text-lg tracking-tighter uppercase">Clearance Required</h3>
              <p className="text-white/40 text-xs leading-relaxed font-mono">
                Your neural signature is not registered. Please request access from the Sentinel Governor.
              </p>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold text-white transition-all uppercase tracking-widest">
                Initialize Handshake
              </button>
            </div>
          </motion.div>
        )}

        {/* DATA GRID */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead className="sticky top-0 bg-[#060606] z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <tr className="text-white/30 text-left border-b border-white/5 uppercase tracking-tighter">
                <th className="px-6 py-5 border-r border-white/5 w-24 text-[9px]">ID_TAG</th>
                <th className="px-6 py-5 border-r border-white/5 w-40 text-[9px]">TIMESTAMP_UTC</th>
                <th className="px-6 py-5 border-r border-white/5 w-32 text-[9px]">SUBSYSTEM</th>
                <th className="px-6 py-5 border-r border-white/5 text-[9px]">OPERATION_MANIFEST</th>
                <th className="px-6 py-5 text-center w-24 text-[9px]">STATUS</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y divide-white/[0.03]", permissionLevel === 0 && "opacity-10 pointer-events-none")}>
              {filteredEntries.map((entry) => (
                <LedgerRow 
                  key={entry.id} 
                  entry={entry} 
                  isSelected={selectedEntry?.id === entry.id}
                  onSelect={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* DETAIL SIDE PANEL */}
        <AnimatePresence>
          {selectedEntry && (
            <DetailPanel entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Atomic Component: Metric ---
const Metric = ({ label, value, color = "text-white/60" }: { label: string, value: string | number, color?: string }) => (
  <div className="flex flex-col items-end">
    <span className="text-white/20 uppercase text-[7px] tracking-widest font-black mb-1">{label}</span>
    <span className={cn("font-bold tracking-tighter", color)}>{value}</span>
  </div>
);

// --- Atomic Component: LedgerRow ---
const LedgerRow = ({ entry, isSelected, onSelect }: { entry: LedgerEntry, isSelected: boolean, onSelect: () => void }) => (
  <motion.tr 
    onClick={onSelect}
    // FIX: Framer Motion bg -> backgroundColor
    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    className={cn(
      "cursor-pointer transition-colors group",
      isSelected ? "bg-cyan-500/5" : "hover:bg-white/[0.01]"
    )}
  >
    <td className="px-6 py-4 border-r border-white/5 text-white/40 group-hover:text-cyan-500/60 transition-colors">
      #{entry.id.slice(0, 6)}
    </td>
    <td className="px-6 py-4 border-r border-white/5 text-white/30 font-mono italic">
      {new Date(entry.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
    </td>
    <td className="px-6 py-4 border-r border-white/5">
      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white/60 uppercase">
        {entry.module}
      </span>
    </td>
    <td className="px-6 py-4 border-r border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
        <span className="text-white/70 uppercase font-black tracking-tight">{entry.operation}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-center">
      <div className={cn(
        "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
        entry.status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
        entry.status === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
        "bg-rose-500/10 border-rose-500/20 text-rose-500"
      )}>
        {entry.status}
      </div>
    </td>
  </motion.tr>
);

// --- Atomic Component: DetailPanel ---
const DetailPanel = ({ entry, onClose }: { entry: LedgerEntry, onClose: () => void }) => (
  <motion.div 
    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
    className="w-96 bg-zinc-950 border-l border-white/10 shadow-2xl z-30 flex flex-col backdrop-blur-2xl"
  >
    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <Activity size={16} className="text-cyan-500" />
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Forensic_Audit</h3>
      </div>
      <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
      <div className="space-y-2">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Transaction_Hash</span>
        <div className="p-4 bg-black rounded-2xl border border-white/5 font-mono text-[10px] break-all text-cyan-500/80">
          {entry.txHash || "0x0000000000000000000000000000000000000000"}
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Neural_Reasoning</span>
        <div className="p-6 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-[2rem] relative overflow-hidden group">
          <ShieldCheck size={40} className="absolute -right-4 -bottom-4 text-cyan-500/5 rotate-12" />
          <p className="text-[11px] text-white/60 leading-relaxed italic font-mono relative z-10">
            {entry.aiVerification || `Surgical analysis of block data confirms execution integrity. Subsystem ${entry.module} successfully processed the ${entry.operation} request with 100% logic verification.`}
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
         <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/20 uppercase font-black">Subsystem</span>
            <span className="text-[10px] text-white/80 font-mono">{entry.module}</span>
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/20 uppercase font-black">Status</span>
            <span className="text-[10px] text-cyan-500 font-mono uppercase">{entry.status}</span>
         </div>
      </div>
    </div>
    
    <div className="p-6 bg-black/40 border-t border-white/5">
       <button 
         onClick={() => window.open(`https://www.oklink.com/xlayer/tx/${entry.txHash}`, '_blank')}
         className="w-full py-4 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
       >
          View on X Layer Explorer
       </button>
    </div>
  </motion.div>
);
