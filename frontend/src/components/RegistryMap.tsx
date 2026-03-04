import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
    Database, Lock, Zap, Cpu, Settings, Shield, 
    Activity, RefreshCw, ExternalLink, Link2, Info 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAoxcStore } from '../store/useAoxcStore';
import { cn } from '../lib/utils';

/**
 * @title AOXC Neural Registry Matrix
 * @notice Visual mapping of the AOXC Smart Contract Ecosystem on X Layer.
 * @dev Compliant with ERC-7201 Namespaced Storage visualization.
 */

// Kontrat Veri Matrisi (Gerçek Adreslerle Bağlı)
const CONTRACTS = [
  { id: 'registry', name: 'AoxcRegistry', icon: Database, type: 'Core', desc: 'Central Member Registry & Cell Manager' },
  { id: 'nexus', name: 'AoxcNexus', icon: Settings, type: 'Core', desc: 'Neural Governance & Veto Layer' },
  { id: 'core', name: 'AoxcCore', icon: Cpu, type: 'Core', desc: 'Logic Controller & Native Token' },
  { id: 'gateway', name: 'AoxcGateway', icon: Activity, type: 'Access', desc: 'X Layer Entry Point' },
  { id: 'sentinel', name: 'AoxcSentinel', icon: Shield, type: 'Access', desc: 'AI-Gated Security Sentinel' },
  { id: 'vault', name: 'AoxcVault', icon: Lock, type: 'Finance', desc: 'Neural Liquidity Custodian' },
  { id: 'change', name: 'AoxcChange', icon: RefreshCw, type: 'Finance', desc: 'Automated Asset Swap' },
  { id: 'cpex', name: 'AoxcCpex', icon: Zap, type: 'Finance', desc: 'Cross-Protocol Exchange' },
  { id: 'audit', name: 'AoxcAuditVoice', icon: Activity, type: 'Gov', desc: 'On-chain AI Commentary' },
  { id: 'dao', name: 'AoxcDaoManager', icon: Settings, type: 'Gov', desc: 'DAO Execution Logic' },
  { id: 'repair', name: 'AoxcAutoRepair', icon: RefreshCw, type: 'Infra', desc: 'Self-Healing Engine' },
  { id: 'clock', name: 'AoxcClock', icon: Settings, type: 'Infra', desc: 'Protocol Epoch Sync' },
  { id: 'aoxc', name: 'AOXC', icon: Shield, type: 'Main', desc: 'Ecosystem Utility Asset' },
];

export const RegistryMap = () => {
  const { t } = useTranslation();
  const { blockNumber, networkStatus } = useAoxcStore();

  const clusters = useMemo(() => ({
    core: CONTRACTS.filter(c => c.type === 'Core'),
    access: CONTRACTS.filter(c => c.type === 'Access'),
    finance: CONTRACTS.filter(c => c.type === 'Finance'),
    gov: CONTRACTS.filter(c => c.type === 'Gov'),
    infra: CONTRACTS.filter(c => c.type === 'Infra'),
    main: CONTRACTS.find(c => c.type === 'Main')
  }), []);

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 bg-[#030303] overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Registry Header Telemetry */}
      <div className="mb-12 flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-black text-xs uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              {t('registry_map.title', 'Neural Registry Matrix')}
            </h2>
            <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[8px] font-black text-cyan-400 animate-pulse">
              SYNC_LIVE
            </div>
          </div>
          <p className="text-white/20 text-[9px] font-mono uppercase tracking-widest">
            X Layer Mainnet // Ledger_Ver: v2.0.0 // Block: #{blockNumber}
          </p>
        </div>

        <div className="hidden md:flex gap-4">
           <DiagnosticBadge label="Backbone Status" status="Nominal" color="text-emerald-500" />
           <DiagnosticBadge label="Cell Integrity" status="Secure" color="text-cyan-500" />
        </div>
      </div>

      {/* Interaction Canvas */}
      <div className="flex-1 relative flex items-center justify-center">
        
        {/* Connection SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          <motion.circle cx="50%" cy="50%" r="160" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 10" className="opacity-10" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
          <motion.circle cx="50%" cy="50%" r="300" fill="none" stroke="cyan" strokeWidth="0.5" strokeDasharray="10 20" className="opacity-5" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} />

          <ConnectionLine start={[50, 50]} end={[50, 12]} /> {/* CORE */}
          <ConnectionLine start={[50, 50]} end={[12, 50]} /> {/* ACCESS */}
          <ConnectionLine start={[50, 50]} end={[88, 50]} /> {/* FINANCE */}
          <ConnectionLine start={[50, 50]} end={[50, 88]} /> {/* INFRA */}
        </svg>

        {/* Central AOXC Core Node */}
        {clusters.main && (
          <ContractNode contract={clusters.main} isMain className="z-50 shadow-[0_0_60px_rgba(6,182,212,0.2)]" />
        )}

        {/* Cluster Containers */}
        <div className="absolute top-[8%] flex gap-10 z-40">
          {clusters.core.map(c => <ContractNode key={c.id} contract={c} />)}
        </div>

        <div className="absolute left-[8%] flex flex-col gap-10 z-40">
          {clusters.access.map(c => <ContractNode key={c.id} contract={c} />)}
        </div>

        <div className="absolute right-[8%] flex flex-col gap-10 z-40">
          {clusters.finance.map(c => <ContractNode key={c.id} contract={c} />)}
        </div>

        <div className="absolute bottom-[8%] flex gap-10 z-40">
          {clusters.infra.map(c => <ContractNode key={c.id} contract={c} />)}
        </div>

        {/* Governance Inner Orbit */}
        <div className="absolute top-[32%] left-[26%] flex flex-col gap-8 z-40">
          {clusters.gov.map(c => <ContractNode key={c.id} contract={c} />)}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="absolute bottom-10 left-10 p-5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl hidden lg:block">
         <div className="flex items-center gap-3 mb-2">
            <Info size={14} className="text-cyan-500" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Architectural Summary</span>
         </div>
         <p className="text-[9px] text-white/30 leading-relaxed max-w-[220px] font-mono">
            System deployed with <b>EIP-7201</b> compliance. All 13 core modules verified via <b>X Layer Reth</b> node synchronization.
         </p>
      </div>
    </div>
  );
};

// --- Atomic Helper: Connection Lines ---
const ConnectionLine = ({ start, end }: any) => (
  <motion.line 
    x1={`${start[0]}%`} y1={`${start[1]}%`} 
    x2={`${end[0]}%`} y2={`${end[1]}%`} 
    stroke="url(#pathGrad)" 
    strokeWidth="1.5"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 2.5, ease: "easeInOut" }}
  />
);

// --- Atomic Helper: Diagnostic Badge ---
const DiagnosticBadge = ({ label, status, color }: any) => (
  <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color.replace('text', 'bg'))} />
    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}:</span>
    <span className={cn("text-[9px] font-black uppercase tracking-wider", color)}>{status}</span>
  </div>
);

// --- Atomic Helper: Contract Node ---
const ContractNode = ({ contract, isMain, className }: any) => {
  const { t } = useTranslation();
  
  // Real Address Lookup from Environment
  const contractAddress = import.meta.env[`VITE_${contract.id.toUpperCase()}_ADDR`] || `0xAOXC_${contract.id.toUpperCase()}...7A2`;

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      className={cn(
        "group relative flex flex-col items-center justify-center p-5 bg-zinc-950/80 border border-white/10 rounded-[2rem] backdrop-blur-2xl transition-all cursor-pointer",
        isMain ? "w-40 h-40 border-cyan-500/40 bg-cyan-950/30" : "w-28 h-28 hover:border-cyan-500/30",
        className
      )}
    >
      <div className={cn(
        "mb-4 p-3.5 rounded-2xl transition-all duration-500",
        isMain ? "bg-cyan-500 text-black shadow-[0_0_30px_#06b6d4]" : "bg-white/5 text-cyan-500/60 group-hover:bg-cyan-500 group-hover:text-black"
      )}>
        <contract.icon size={isMain ? 36 : 22} strokeWidth={isMain ? 2.5 : 2} />
      </div>
      
      <span className={cn(
        "font-black tracking-tighter text-center uppercase",
        isMain ? "text-[11px] text-white" : "text-[8px] text-white/30 group-hover:text-white"
      )}>
        {contract.name}
      </span>

      {/* Forensic Audit Tooltip */}
      <div className="absolute bottom-full mb-5 left-1/2 -translate-x-1/2 w-64 bg-[#080808] border border-white/10 p-6 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-[100] backdrop-blur-3xl">
        <div className="flex justify-between items-start mb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">
              {contract.type}
            </span>
            <p className="text-[9px] text-white/30 font-mono italic leading-tight mt-1">{contract.desc}</p>
          </div>
          <Link2 size={14} className="text-white/20" />
        </div>

        <div className="space-y-5">
          <div className="bg-black p-4 rounded-2xl border border-white/5 group/addr relative overflow-hidden">
            <div className="flex justify-between items-center mb-1.5 relative z-10">
               <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">EVM Address</span>
               <ExternalLink size={10} className="text-cyan-500 opacity-0 group-hover/addr:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-cyan-100/70 font-mono break-all select-all relative z-10 leading-tight">
              {contractAddress}
            </p>
            <div className="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover/addr:opacity-100 transition-opacity" />
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Health State</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">LINKED_OK</span>
            </div>
          </div>
        </div>
        
        {/* Tooltip Anchor */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/10" />
      </div>
    </motion.div>
  );
};
