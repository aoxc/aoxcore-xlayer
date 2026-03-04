import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAoxcStore } from '../store/useAoxcStore';
import { getGeminiResponse } from '../services/geminiSentinel';
import { Send, Brain, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const AoxcanInterface = () => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'processing' | 'analyzing'>('idle');
  
  // Mesajlar arttığında otomatik en aşağı kaydırmak için Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addChatMessage, chatMessages } = useAoxcStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isThinking]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Önceki konuşmayı kes
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    
    addChatMessage(userMessage, 'user');
    setIsThinking(true);
    setAiState('processing');

    try {
      const state = useAoxcStore.getState();
      const systemContext = {
        blockNumber: state.blockNumber,
        networkLoad: state.networkLoad,
        networkStatus: state.networkStatus,
        statusMatrix: state.statusMatrix
      };

      setAiState('analyzing');
      const aiResponse = await getGeminiResponse(userMessage, systemContext);
      
      addChatMessage(aiResponse, 'ai');
      speak(aiResponse);
      
    } catch (error) {
      addChatMessage("Uplink unstable. Re-routing neural processor...", "ai");
    } finally {
      setIsThinking(false);
      setAiState('idle');
    }
  };

  return (
    /* h-full yerine min-h-0 ve flex-1 kullanımı layout'u korur */
    <div className="flex flex-col h-full min-h-0 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
      
      {/* Header - Fixed Height */}
      <div className="shrink-0 p-5 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Brain className={cn("text-cyan-500 transition-all", isThinking && "animate-pulse scale-110")} size={22} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural_Link_v2.5</h3>
            <span className="text-[9px] font-mono text-cyan-500/50 uppercase tracking-widest italic">
              Status: {aiState === 'idle' ? 'Operational' : 'Thinking...'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Space - Scrollable Area */}
      {/* flex-1 ve overflow-y-auto burada hayati önem taşıyor */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#050505]/30">
        {chatMessages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-[11px] font-mono leading-relaxed shadow-lg",
              msg.role === 'user' 
                ? "bg-cyan-500 text-black font-black rounded-tr-none" 
                : "bg-white/5 border border-white/10 text-cyan-50 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isThinking && (
          <div className="flex items-center gap-3 text-cyan-500/40 animate-pulse pb-4">
            <Loader2 size={12} className="animate-spin" />
            <span className="text-[9px] uppercase tracking-widest font-black">Sentinel is analyzing protocol state...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Console - Fixed Height at Bottom */}
      <form onSubmit={handleSend} className="shrink-0 p-5 bg-black/60 border-t border-white/5">
        <div className="relative flex items-center group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter secure directive..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 pr-14 text-[11px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
          />
          <button 
            type="submit" 
            disabled={isThinking}
            className="absolute right-2 p-3 text-cyan-500 hover:text-cyan-400 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
