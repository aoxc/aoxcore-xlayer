import React from 'react';
import { Pulse } from './Pulse';

interface HeaderProps {
  isOnline: boolean;
  latency: number;
}

/**
 * @title AOXC Neural OS - Header Engine
 * @notice Fixed-position telemetry and pulse synchronization bar.
 */
export const Header: React.FC<HeaderProps> = ({ isOnline, latency }) => {
  return (
    <header className="shrink-0 z-[60] relative">
      {/* Pulse bileşeni ağ durumunu görselleştirir */}
      <Pulse isOnline={isOnline} latency={latency} />
      
      {/* İsteğe bağlı: Buraya AOXC Logosu veya global bir arama barı eklenebilir */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-cyan-500/5 to-transparent h-1" />
    </header>
  );
};
