import React from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Clock, Shield, Globe, Menu, PanelRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

/**
 * @title AOXC Pulse: Neural Telemetry Bar
 * @notice Real-time synchronization display for X Layer blockchain and AI state.
 * @dev Audit Standards: 
 * - Explicit Prop Interfaces to resolve TS2322.
 * - Reactive Network Load indicators via Zustand.
 */

// FIX: TS2322 hatasını önlemek için App.tsx'den gelen propları tanımlıyoruz
interface PulseProps {
  isOnline?: boolean;
  latency?: number;
}

export const Pulse = ({ isOnline = true, latency = 0 }: PulseProps) => {
  const { 
    blockNumber, 
    epochTime, 
    networkLoad, 
    networkStatus,
    toggleMobileMenu, 
    toggleRightPanel 
  } = useAoxcStore();
  
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="h-16 border-b border-white/5 bg-[#030303]/80 backdrop-blur-2xl flex items-center justify-between px-6 relative overflow-hidden z-[100]">
      {/* Visual Identity: Neural link aura */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />
      
      {/* LEFT: Branding and Core Metadata */}
      <div className="flex items-center gap-4 md:gap-10 relative z-10">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2.5 bg-white/5 text-white/60 hover:text-cyan-400 rounded-xl transition-all"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h1 className="text-white font-mono font-black tracking-tighter text-xl leading-none uppercase italic group cursor-default">
              AOXC<span className="text-cyan-500 group-hover:animate-pulse">OS</span>
            </h1>
            <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[8px] text-cyan-400 font-black tracking-widest uppercase">
              L2_RETH_X1
            </div>
          </div>
          <p className="text-white/20 text-[9px] font-mono uppercase tracking-[0.3em] font-bold mt-1.5">
            Neural Infrastructure
          </p>
        </div>

        <div className="hidden lg:block h-8 w-px bg-white/5" />

        {/* Real-time Telemetry Grid */}
        <div className="hidden md:flex items-center gap-10 font-mono">
          <TelemetryItem 
            label="Block Height" 
            value={`#${blockNumber.toLocaleString()}`} 
            color="text-cyan-400"
            animateKey={blockNumber}
          />
          <TelemetryItem 
            label="Network Load" 
            value={networkLoad || `${latency}ms`} 
            icon={<Activity size={10} className="text-blue-500" />}
          />
          <TelemetryItem 
            label="AI Sentinel" 
            value={isOnline && networkStatus === 'healthy' ? "ACTIVE" : "RECOVERING"} 
            icon={<Shield size={10} className={isOnline && networkStatus === 'healthy' ? "text-purple-500" : "text-amber-500"} />}
          />
        </div>
      </div>

      {/* RIGHT: Controls and Time Epoch */}
      <div className="flex items-center gap-3 md:gap-8 relative z-10">
        
        {/* Language & UI Control Group */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-cyan-500 hover:text-black rounded-xl transition-all group"
          >
            <Globe size={12} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {i18n.language.toUpperCase()}
            </span>
          </button>
          
          <button 
            onClick={toggleRightPanel}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Toggle Notification Panel"
          >
            <PanelRight size={18} />
          </button>
        </div>

        {/* Global Epoch Display */}
        <div className="hidden sm:flex flex-col items-end font-mono">
          <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Protocol Epoch</span>
          <div className="flex items-center gap-2.5 text-cyan-500/80 font-black tabular-nums text-sm">
            <Clock size={12} className="text-white/20" />
            <AnimatePresence mode="wait">
              <motion.span
                key={epochTime}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {epochTime}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Sync Status Glow */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_12px_currentColor]",
            isOnline && networkStatus === 'healthy' ? "text-cyan-500 bg-cyan-500 animate-pulse" : "text-rose-500 bg-rose-500"
          )} />
          <span className="text-[10px] text-cyan-500 font-mono font-black tracking-[0.2em]">
            {isOnline && networkStatus === 'healthy' ? 'UPLINK_STABLE' : 'LINK_DEGRADED'}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Atomic Helper Component ---
const TelemetryItem = ({ label, value, icon, color = "text-white/70", animateKey }: any) => (
  <div className="flex flex-col">
    <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">{label}</span>
    <div className="flex items-center gap-2">
      {icon}
      <motion.span 
        key={animateKey}
        initial={animateKey ? { opacity: 0.5, y: 2 } : {}}
        animate={animateKey ? { opacity: 1, y: 0 } : {}}
        className={cn("text-xs font-black tracking-tighter tabular-nums", color)}
      >
        {value}
      </motion.span>
    </div>
  </div>
);
