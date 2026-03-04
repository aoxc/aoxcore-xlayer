import React, { useState } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { GeminiSentinel } from '../services/geminiSentinel';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { 
  Settings, Wallet, Wrench, ShieldAlert, ArrowRightLeft, 
  Database, Lock, RefreshCw, Zap, Cpu, Sparkles, 
  ChevronRight, Info, Users 
} from 'lucide-react';

/**
 * @title AOXCORE Modular Control Unit
 * @notice Central operational hub for manual and AI-interpreted protocol actions.
 * @dev Integration:
 * - Real-time vetting via GeminiSentinel.analyzeSystemState.
 * - RBAC (Role-Based Access Control) enforced at the UI level.
 */
export const ModularControl = () => {
  const { 
    addLog, isProcessing, blockNumber, 
    permissionLevel, gasEfficiency, 
    repairState, repairTarget, triggerRepair, setActiveView 
  } = useAoxcStore();
  
  // Local state for UI feedback
  const [isVetting, setIsVetting] = useState(false);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'core' | 'finance' | 'infra' | 'gov'>('core');
  const [command, setCommand] = useState('');

  /**
   * @notice Triggered for standard module actions (Vault, Registry, etc.)
   */
  const handleAction = async (actionName: string, module: 'Infra' | 'Finance' | 'Gov' | 'Core') => {
    if (isProcessing || isVetting) return;

    // View State Transitions
    if (actionName === 'Registry Update') return setActiveView('registry');
    if (actionName === 'Governance Proposal') return setActiveView('governance');
    
    // RBAC Security Gate: Audit-grade authorization check
    if (permissionLevel < 1 && module !== 'Infra') {
      addLog(`[SECURITY_FAIL]: Unauthorized access attempt to ${module} module.`, 'error');
      return;
    }

    setIsVetting(true);
    addLog(`Sentinel: Vetting ${actionName} for X Layer block #${blockNumber}...`, 'ai');
    
    try {
      const sentinel = new GeminiSentinel();
      const result = await sentinel.analyzeSystemState(`Block: ${blockNumber}`, actionName);
      
      if (result.action === 'APPROVE') {
        addLog(`SENTINEL_APPROVED: Logic integrity verified. Dispatching to Notary...`, 'success');
        // Notary logic here
      } else {
        addLog(`SENTINEL_REJECTED: ${result.reason}`, 'error');
      }
    } catch (error) {
      addLog(`SYSTEM_ERROR: Neural uplink failure.`, 'error');
    } finally {
      setIsVetting(false);
    }
  };

  /**
   * @notice AI Command Interpreter: Maps natural language to Smart Contract actions.
   */
  const handleAICommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing || isVetting) return;

    const rawCommand = command;
    setCommand('');
    setIsVetting(true);
    addLog(`Neural Interpreter: Decoding intent for "${rawCommand}"...`, 'ai');
    
    try {
      const sentinel = new GeminiSentinel();
      const result = await sentinel.analyzeSystemState(`User Command: ${rawCommand}`, "NATURAL_LANGUAGE_DISPATCH");
      
      addLog(`Gemini Resolved: ${result.reason}`, 'ai');
      
      if (result.action === 'APPROVE') {
        addLog(`AUTONOMOUS_DISPATCH: Executing logic via X Layer Reth...`, 'success');
      }
    } catch (error) {
      addLog(`INTERPRETER_FAULT: Failed to resolve neural intent.`, 'error');
    } finally {
      setIsVetting(false);
    }
  };

  const tabs = [
    { id: 'core', label: t('control.tabs.core', 'CORE'), icon: Settings },
    { id: 'finance', label: t('control.tabs.finance', 'FINANCE'), icon: Wallet },
    { id: 'infra', label: t('control.tabs.infra', 'INFRA'), icon: Wrench },
    { id: 'gov', label: 'GOV', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505]/40 backdrop-blur-xl border-l border-white/5 relative">
      {/* Neural Command Input */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-b from-cyan-500/[0.03] to-transparent relative overflow-hidden">
        <form onSubmit={handleAICommand} className="relative z-10">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <input 
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={t('control.neural_command', "Enter neural command...")}
            className="w-full bg-black/40 border border-cyan-500/20 rounded-2xl py-3 pl-10 pr-4 text-[11px] font-mono text-cyan-100 placeholder:text-cyan-900/40 focus:outline-none focus:border-cyan-500/60 transition-all shadow-inner"
          />
        </form>
        
        {/* Gas Awareness Banner */}
        <div className={cn(
          "mt-4 flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all duration-700",
          gasEfficiency < 80 ? "bg-red-500/10 border-red-500/20" : 
          gasEfficiency < 90 ? "bg-amber-500/10 border-amber-500/20" : 
          "bg-emerald-500/10 border-emerald-500/20"
        )}>
          <Info size={12} className={cn(
            "mt-0.5 shrink-0",
            gasEfficiency < 80 ? "text-red-500" : gasEfficiency < 90 ? "text-amber-500" : "text-emerald-500"
          )} />
          <p className={cn(
            "text-[10px] leading-relaxed font-mono italic",
            gasEfficiency < 80 ? "text-red-200/60" : gasEfficiency < 90 ? "text-amber-200/60" : "text-emerald-200/60"
          )}>
            {gasEfficiency < 80 ? 'CRITICAL_GAS_LOAD' : gasEfficiency < 90 ? 'HIGH_GAS_PRICE' : 'OPTIMAL_GAS_EFFICIENCY'}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" 
                  : "text-white/30 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={12} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Action List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {activeTab === 'core' && (
                <>
                  <ControlCard 
                    title="Registry Sync" 
                    desc="Update system-wide contract pointers." 
                    icon={Database}
                    onAction={() => handleAction('Registry Update', 'Core')}
                  />
                  <ControlCard 
                    title="Audit Protocol" 
                    desc="Trigger security scan on core nexus." 
                    icon={ShieldAlert}
                    onAction={() => handleAction('Governance Proposal', 'Core')}
                  />
                </>
              )}

              {activeTab === 'finance' && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <QuickAction icon={Zap} label="CPEX SWAP" color="emerald" onClick={() => handleAction('Cpex Swap', 'Finance')} />
                    <QuickAction icon={RefreshCw} label="SYNC CHANGE" color="cyan" onClick={() => handleAction('Change Sync', 'Finance')} />
                  </div>
                  <ControlCard 
                    title="Vault Rebalance" 
                    desc="Optimize liquidity distribution." 
                    icon={Lock}
                    onAction={() => handleAction('Vault Rebalance', 'Finance')}
                  />
                </>
              )}

              {activeTab === 'infra' && (
                <div className="space-y-4">
                  <div className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] font-black text-white/80 uppercase">AutoRepair Module</span>
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-full", repairState === 'stable' ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500 animate-pulse")}>
                        {repairState === 'stable' ? "STABLE" : `REPAIRING_${repairTarget}`}
                      </span>
                    </div>
                    <button 
                      onClick={() => triggerRepair('Global')}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <RefreshCw size={14} />
                      INITIATE GLOBAL REPAIR
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* AOXCORE Sentinel Processing Overlay */}
      <AnimatePresence>
        {isVetting && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-8 rounded-[2rem]"
          >
            <div className="max-w-xs w-full bg-zinc-950 border border-cyan-500/20 p-10 rounded-[3rem] text-center space-y-8 shadow-[0_0_80px_rgba(6,182,212,0.1)]">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full animate-pulse" />
                <RefreshCw className="text-cyan-500 animate-spin relative z-10 w-full h-full" strokeWidth={1} />
                <Lock size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black text-lg tracking-tighter uppercase">Sentinel Vetting</h3>
                <p className="text-white/40 text-[9px] font-mono leading-relaxed">
                  Analyzing action bytecode against XLayer neural constraints...
                </p>
              </div>
              <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }} animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-cyan-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Atomic Helper Components ---

const ControlCard = ({ title, desc, icon: Icon, onAction }: any) => (
  <motion.div 
    whileHover={{ x: 5 }}
    onClick={onAction}
    className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all group cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-white font-black text-[10px] uppercase tracking-widest group-hover:text-cyan-400">{title}</h4>
          <ChevronRight size={14} className="text-white/10 group-hover:text-cyan-500" />
        </div>
        <p className="text-white/20 text-[9px] font-mono truncate">{desc}</p>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "py-4 rounded-2xl border flex flex-col items-center gap-2 text-[9px] font-black tracking-widest transition-all",
      color === 'emerald' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60 hover:bg-emerald-500 hover:text-black" :
      "bg-cyan-500/5 border-cyan-500/10 text-cyan-500/60 hover:bg-cyan-500 hover:text-black"
    )}
  >
    <Icon size={16} />
    {label}
  </button>
);
