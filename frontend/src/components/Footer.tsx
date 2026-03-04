import React from 'react';
import { NeuralTerminal } from './NeuralTerminal';

/**
 * @title AOXC Neural OS - Forensic Footer
 * @notice Static bottom container for the neural console and system logs.
 */
export const Footer = () => {
  return (
    <footer className="shrink-0 z-20 border-t border-white/5 bg-black/50 backdrop-blur-md">
      {/* NeuralTerminal bileşeni tüm sistem günlüklerini burada işler */}
      <NeuralTerminal />
      
      {/* Opsiyonel: Buraya küçük bir versiyon bilgisi veya kurumsal kimlik eklenebilir */}
      <div className="absolute bottom-1 right-4 opacity-10 pointer-events-none">
        <span className="text-[8px] font-mono uppercase tracking-[0.3em]">AOXC_UNIT_v2.5</span>
      </div>
    </footer>
  );
};
