import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAoxcStore, StatusColor } from '../store/useAoxcStore';
import { cn } from '../lib/utils';
import { Activity, ShieldAlert, Zap, Cpu, Globe } from 'lucide-react';

/**
 * @title AOXC Neural Status Matrix v2.5
 * @notice Global telemetry bar visualizing the health of cross-chain modules.
 * @dev Data sourced from useAoxcStore, synced with X Layer contract events.
 */

const colorMap: Record<StatusColor, string> = {
  green: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
  yellow: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]',
  orange: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]',
  red: 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse',
  blue: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
};

export const StatusMatrix = () => {
  const { statusMatrix, networkStatus, blockNumber } = useAoxcStore();
  const { t } = useTranslation();

  // Audit Insight: Mapping icons to modules for forensic clarity
  const panels = useMemo(() => [
    { key: 'core', label: t('status_matrix.core', 'CORE_NEXUS'), color: statusMatrix.core, icon: Cpu },
    { key: 'access', label: t('status_matrix.access', 'SENTINEL_GATE'), color: networkStatus === 'critical' ? 'red' : statusMatrix.access, icon: ShieldAlert },
    { key: 'finance', label: t('status_matrix.finance', 'VAULT_FLUX'), color: statusMatrix.finance, icon: Zap },
    { key: 'infra', label: t('status_matrix.infra', 'AUTO_REPAIR'), color: statusMatrix.infra, icon: Activity },
    { key: 'gov', label: t('status_matrix.gov', 'NEURAL_DAO'), color: statusMatrix.gov, icon: Globe },
  ], [statusMatrix, networkStatus, t]);

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 bg-[#050505]/60 border-b border-white/5 backdrop-blur-2xl z-50 overflow-x-auto scrollbar-hide">
      {/* Matrix Identification */}
      <div className="hidden lg:flex flex-col border-r border-white/10 pr-6 mr-3">
         <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">Neural_Matrix</span>
         <span className="text-[7px] font-mono text-white/20 uppercase">BLK: #{blockNumber}</span>
      </div>

      <AnimatePresence mode="popLayout">
        {panels.map((panel) => (
          <motion.div 
            key={panel.key}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl group relative overflow-hidden transition-all hover:bg-white/[0.05] hover:border-white/10"
          >
            {/* Holographic Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Module Icon Overlay */}
            <panel.icon size={12} className="text-white/10 absolute -right-1 -bottom-1 rotate-12 group-hover:text-white/20 transition-all duration-700" />

            <div className="flex flex-col relative z-10 min-w-[80px]">
              <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 group-hover:text-white/50 transition-colors">
                {panel.label}
              </span>
              
              <div className="flex items-center gap-2.5">
                <motion.div 
                  animate={{ 
                    scale: panel.color === 'red' ? [1, 1.3, 1] : 1,
                    boxShadow: panel.color === 'red' ? [
                      '0 0 5px rgba(244,63,94,0.5)',
                      '0 0 15px rgba(244,63,94,0.8)',
                      '0 0 5px rgba(244,63,94,0.5)'
                    ] : 'none'
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn("w-1.5 h-1.5 rounded-full transition-all duration-700", colorMap[panel.color as StatusColor])} 
                />
                
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest tabular-nums",
                  panel.color === 'green' ? "text-emerald-400" :
                  panel.color === 'yellow' ? "text-amber-400" :
                  panel.color === 'orange' ? "text-orange-400" :
                  panel.color === 'red' ? "text-rose-500" :
                  "text-cyan-400"
                )}>
                  {t(`status_matrix.states.${panel.color}`, panel.color.toUpperCase())}
                </span>
              </div>
            </div>

            {/* Micro-Telemetry (Simulated based on status) */}
            <div className="hidden sm:flex flex-col items-end border-l border-white/5 pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="text-[6px] font-mono text-white/20 uppercase font-bold">Latency</span>
               <span className="text-[8px] font-mono text-cyan-500/50">
                  {panel.color === 'red' ? 'ERR_TMO' : panel.color === 'orange' ? '124ms' : '12ms'}
               </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Global Status Glow */}
      <div className="ml-auto flex items-center gap-4 pl-6 border-l border-white/10">
        <div className="flex flex-col items-end">
           <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Protocol_Uplink</span>
           <span className="text-[9px] font-mono text-emerald-500/60 font-bold italic">STABLE_DIFFUSION_v2</span>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full animate-pulse" />
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative z-10 border border-black/50" />
        </div>
      </div>
    </div>
  );
};
