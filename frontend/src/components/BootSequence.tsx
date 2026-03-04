import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Cpu, Globe, Zap, Database } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXC Neural Boot Loader
 * @notice System initialization sequence with X Layer network handshake.
 * @dev Audit Standards: Validates terminal state and visual integrity before UI mount.
 */

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // AOXC ve X Layer odaklı özelleştirilmiş boot logları
  const bootLines = [
    "AUTHENTICATING AOXCORE KERNEL...",
    "MAPPING X LAYER GATEWAY [196:MAINNET]...",
    "LOADING AOXCAN NEURAL MODULES...",
    "INITIALIZING SENTINEL GUARD PROTOCOLS...",
    "CONNECTING TO REFINED STORAGE ABSTRACTION...",
    "FETCHING REGISTRY SCHEMA FROM CHAIN...",
    "CALIBRATING AI AUDIT VOICE CHANNELS...",
    "STABILIZING LIQUIDITY VAULT INTERFACES...",
    "SYSTEM BREATHING ACTIVE. WELCOME OPERATOR."
  ];

  useEffect(() => {
    let currentStep = 0;
    
    // Değişken hız simülasyonu: Gerçek yükleme hissi verir
    const processStep = () => {
      if (currentStep >= bootLines.length) {
        setTimeout(onComplete, 1000);
        return;
      }

      setSteps(prev => [...prev, bootLines[currentStep]]);
      setProgress(((currentStep + 1) / bootLines.length) * 100);
      currentStep++;

      // Son adımlarda "derinlemesine kontrol" hissi için gecikmeyi artır
      const nextDelay = currentStep > bootLines.length - 3 ? 600 : 180;
      setTimeout(processStep, nextDelay);
    };

    const timer = setTimeout(processStep, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center font-mono text-cyan-500 overflow-hidden"
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "circIn" }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-50" />
      
      <div className="w-full max-w-lg p-10 relative z-10">
        {/* Central Animated Icon */}
        <div className="flex items-center justify-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping" />
            <div className="w-24 h-24 border-2 border-cyan-500/30 rounded-full flex items-center justify-center bg-cyan-950/20 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)]">
              <ShieldCheck size={40} className="text-cyan-400" />
            </div>
            
            {/* Orbiting Icons */}
            <OrbitIcon icon={Zap} delay={0} rotation={0} />
            <OrbitIcon icon={Cpu} delay={1} rotation={120} />
            <OrbitIcon icon={Database} delay={2} rotation={240} />
          </motion.div>
        </div>

        {/* Diagnostic Lines */}
        <div className="space-y-3 mb-10 min-h-[220px] bg-black/40 p-6 rounded-lg border border-white/5 backdrop-blur-md">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] md:text-xs flex items-center gap-4"
            >
              <span className="text-cyan-900 font-bold">[{new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}]</span>
              <span className={cn(
                "tracking-widest",
                i === steps.length - 1 ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-cyan-500/60"
              )}>
                {step}
              </span>
            </motion.div>
          ))}
          {steps.length < bootLines.length && (
            <motion.span 
              animate={{ opacity: [0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-cyan-500 ml-14"
            />
          )}
        </div>

        {/* Advanced Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cyan-500/40">
            <span>Neural Link Stability</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-cyan-950/50 rounded-full p-[2px] border border-cyan-500/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-between text-[9px] text-cyan-900 uppercase font-bold">
          <span>AOXCORE-OS // KERNEL_X1</span>
          <span className="animate-pulse">Handshaking with X-Layer...</span>
        </div>
      </div>
    </motion.div>
  );
};

const OrbitIcon = ({ icon: Icon, delay, rotation }: any) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear", delay }}
    className="absolute inset-[-20px] pointer-events-none"
    style={{ rotate: rotation }}
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 p-1.5 bg-black border border-cyan-500/40 rounded-md text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
      <Icon size={12} />
    </div>
  </motion.div>
);
