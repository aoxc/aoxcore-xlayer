import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAoxcStore } from '../store/useAoxcStore';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @title Sentinel Cognitive Interface
 * @notice Real-time AI interaction layer synchronized with AoxcSentinel.sol.
 */
export const SentinelChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { chatMessages, addChatMessage, networkStatus, blockNumber } = useAoxcStore();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage(userMsg, 'user');

    try {
      // API Key handling with safety check
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `
        ROLE: Gemini Sentinel AI (AOXC Neural OS Gatekeeper).
        NETWORK_STATE: Block #${blockNumber}, Status: ${networkStatus}.
        SENTINEL_CONTRACT_V: 2.5 (EIP-712 Verified).
        CONTEXT: 35 Contracts across 9 Modules. Specialized in NeuralPackets and Surgical Interception.
        USER_QUERY: "${userMsg}"
        INSTRUCTION: Provide a concise (max 3 sentences), high-techOS response. Reference AoxcSentinel's role in "Bastion Sealing" or "Risk Thresholds" if security is mentioned.
      `;

      const result = await model.generateContent(systemPrompt);
      const aiResponse = result.response.text();
      addChatMessage(aiResponse, 'ai');
    } catch (error) {
      addChatMessage("Neural link degraded. Sentinel is in Bastion mode.", 'ai');
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[1000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-80 h-[480px] bg-[#080808]/95 border border-cyan-500/20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,1)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header: Identity Sync */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Bot size={18} className="text-black" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Sentinel_v2.5</span>
                   <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] text-emerald-500/70 font-bold uppercase">Linked to X-Layer</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* AI Reasoning Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.03)_0%,transparent_100%)]">
              {chatMessages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "p-4 rounded-3xl text-[11px] font-mono leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-cyan-500 text-black font-bold rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-cyan-50/90 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Gate */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/40">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Direct command to Sentinel..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pr-12 text-[10px] font-mono text-cyan-100 placeholder:text-white/10 focus:outline-none focus:border-cyan-500/40 transition-all"
                />
                <button type="submit" className="absolute right-2 p-2 text-cyan-500 hover:text-cyan-400 transition-all">
                  <Send size={16} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-2xl transition-all duration-500 border relative overflow-hidden",
          isOpen ? "bg-zinc-900 border-white/10 rotate-90" : "bg-cyan-500 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
        )}
      >
        {isOpen ? <X className="text-white" /> : <MessageSquare className="text-black" strokeWidth={2.5} />}
        {!isOpen && (
          <div className="absolute inset-0 bg-white/20 animate-pulse opacity-20" />
        )}
      </motion.button>
    </div>
  );
};
