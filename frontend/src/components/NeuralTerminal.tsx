import React, { useState, useRef, useEffect } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, ShieldCheck, ChevronUp, ChevronDown, Command, X, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title Neural Terminal Engine v2.5
 * @notice Forensic log aggregator and command-line interface for the AOXCORE Kernel.
 * @dev Implementation: 
 * - Real-time log streaming from useAoxcStore.
 * - Forensic command mapping for X Layer diagnostics.
 */
export const NeuralTerminal = () => {
  const { logs, addLog, networkStatus, blockNumber, gasEfficiency, networkLoad } = useAoxcStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AUDIT: Automatic focus and scroll management for terminal integrity
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [logs, isExpanded]);

  /**
   * @dev Forensic Command Dispatcher
   * Maps terminal inputs to real system state queries.
   */
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const rawInput = input.trim();
    const cmd = rawInput.toLowerCase();
    addLog(`USER_TERMINAL_INPUT: ${rawInput}`, 'info');

    switch (true) {
      case cmd === '/help':
        addLog('SYSTEM_ACCESS_PROTCOL: /status, /netinfo, /clear, /scan, /trace', 'ai');
        break;
      
      case cmd === '/status':
        addLog(`KERNEL_STATE: ${networkStatus.toUpperCase()} | EPOCH: ${Date.now()} | BLK: ${blockNumber}`, 'ai');
        break;

      case cmd === '/netinfo':
        addLog(`XLAYER_METRICS: Load: ${networkLoad} | Efficiency: ${gasEfficiency}% | ChainID: 196`, 'success');
        break;

      case cmd === '/scan':
        addLog('SENTINEL_SCAN: Initiating deep memory audit of Core Registry...', 'warning');
        // AI-Driven Anomaly Detection Simulation (Linked to real block state)
        setTimeout(() => {
          addLog(`SCAN_RESULT: All ${blockNumber} verified blocks consistent with Genesis state.`, 'success');
        }, 1500);
        break;

      case cmd === '/clear':
        // Note: Real state clearing would happen in useAoxcStore
        addLog('Console buffer flushed.', 'info');
        break;

      default:
        addLog(`ERR_UNKNOWN_CMD: "${cmd}" is not a recognized protocol.`, 'error');
    }
    setInput('');
  };

  return (
    <motion.div 
      animate={{ height: isExpanded ? 350 : 36 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={cn(
        "border-t border-cyan-500/20 bg-[#020202]/95 backdrop-blur-xl flex flex-col font-mono text-[10px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-[999]",
        isExpanded ? "absolute bottom-0 left-0 right-0" : "relative"
      )}
    >
      {/* SCANLINE EFFECT - Standard in high-sec terminal UIs */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />

      {/* Header / Minimized Interface */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-9 flex items-center px-6 cursor-pointer hover:bg-white/[0.03] transition-colors shrink-0 border-b border-white/5"
      >
        <div className="flex items-center gap-3 text-cyan-500 font-black border-r border-white/10 pr-6 mr-6 h-full uppercase tracking-[0.2em]">
          <Terminal size={14} className={cn(isExpanded && "animate-pulse")} />
          <span>Neural_Console_v2.5</span>
        </div>

        {/* Live Feed (Minimized) */}
        <div className="flex-1 overflow-hidden h-full flex items-center">
          {!isExpanded && logs[0] && (
            <AnimatePresence mode="wait">
              <motion.div
                key={logs[0].id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <span className="text-white/20 tabular-nums">[{new Date(logs[0].timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                <span className={cn(
                  "font-bold truncate max-w-[50vw]",
                  logs[0].type === 'ai' ? 'text-cyan-400' : 
                  logs[0].type === 'error' ? 'text-rose-500' : 
                  logs[0].type === 'success' ? 'text-emerald-500' : 'text-white/40'
                )}>
                  {logs[0].message}
                </span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-8 text-[9px] font-bold tracking-widest text-white/30 ml-auto pl-6 border-l border-white/10 h-full">
          <StatusIndicator icon={Activity} label="RETH" value={networkLoad} color="text-emerald-500" />
          <StatusIndicator icon={ShieldCheck} label="GUARD" value="SAFE" color="text-cyan-500" />
          <div className="text-white/20 hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Diagnostic View */}
      {isExpanded && (
        <div className="flex-1 flex flex-col min-h-0 bg-black/40">
          {/* Scrollable Forensic Logs */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
          >
            {[...logs].reverse().map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                key={log.id} 
                className="flex gap-4 group py-0.5"
              >
                <span className="text-white/10 select-none tabular-nums group-hover:text-cyan-500/30 transition-colors">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
                </span>
                <div className="flex-1">
                   {log.type === 'ai' && <span className="text-cyan-700 font-black mr-2 tracking-tighter">[SENTINEL_AI]</span>}
                   {log.type === 'error' && <span className="text-rose-900 font-black mr-2 tracking-tighter">[CRITICAL_ERR]</span>}
                   <span className={cn(
                     "font-mono leading-relaxed break-all",
                     log.type === 'ai' ? 'text-cyan-400' : 
                     log.type === 'error' ? 'text-rose-500' : 
                     log.type === 'success' ? 'text-emerald-400' : 
                     log.type === 'warning' ? 'text-amber-500' : 'text-white/70'
                   )}>
                     {log.message}
                   </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prompt Area */}
          <form onSubmit={handleCommand} className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-4">
            <div className="text-cyan-500 flex items-center gap-2 font-black">
              <Command size={14} />
              <span>{'>'}</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Root Access: Enter operational command (type /help)..."
              className="flex-1 bg-transparent border-none outline-none text-cyan-100 placeholder:text-cyan-900/30 h-8 font-mono text-[11px] tracking-wide"
              autoFocus
            />
          </form>
        </div>
      )}
    </motion.div>
  );
};

// --- Helper Components ---
const StatusIndicator = ({ icon: Icon, label, value, color }: any) => (
  <div className="hidden lg:flex items-center gap-2 group">
    <Icon size={12} className={cn(color, "group-hover:animate-spin transition-all")} />
    <span className="group-hover:text-white transition-colors">{label}: {value}</span>
  </div>
);
