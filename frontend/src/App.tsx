import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // motion eklendi, hata giderildi.

// 1. Kapsayıcı Yapı (Layouts)
import { MainLayout } from './layouts/MainLayout';

// 2. Çekirdek Bileşenler (Components - Alphabetical)
import { AoxcanInterface } from './components/AoxcanInterface';
import { BootSequence } from './components/BootSequence';
import { ContractNotary } from './components/ContractNotary';
import { LedgerView } from './components/LedgerView';
import { ModularControl } from './components/ModularControl';
import { NeuralAnalytics } from './components/NeuralAnalytics';
import { NotificationCenter } from './components/NotificationCenter';
import { PendingSignatures } from './components/PendingSignatures';
import { RegistryMap } from './components/RegistryMap';
import { SentinelChat } from './components/SentinelChat';
import { SkeletonView } from './components/SkeletonView';
import { Toaster } from './components/Toaster';
import { UpgradePanel } from './components/UpgradePanel';
import { WarRoom } from './components/WarRoom';

// 3. Veri ve Sistem Katmanı (Hooks & Store)
import { useAoxcClock } from './hooks/useAoxcClock';
import { useAoxcStore } from './store/useAoxcStore';

/**
 * @title AOXC Neural OS v2.5 - Main Kernel
 * @notice Merkezi orkestratör: Durum yönetimi, telemetri ve adli UI kontrolü.
 */

const API_CONFIG = {
  ENDPOINT: "https://aoxcore.com/api/status.php",
  HEARTBEAT_INTERVAL: 5000, 
  TIMEOUT: 4000 
};

export default function App() {
  // --- 1. INITIALIZATION ---
  useAoxcClock(); 
  const { 
    activeView, 
    isMobileMenuOpen, 
    isRightPanelOpen, 
    toggleMobileMenu, 
    addLog, 
    syncNetwork 
  } = useAoxcStore();

  // --- 2. STATES ---
  const [bootComplete, setBootComplete] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- 3. SYSTEM AUDIT LOGIC ---
  const performSystemAudit = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const startTime = performance.now();
    
    try {
      await syncNetwork();

      const response = await fetch(API_CONFIG.ENDPOINT, { 
        cache: 'no-store',
        signal: controller.signal,
        headers: { 
          'X-AOXC-AUDIT': 'TRUE',
          'X-AOXC-Identity': '@AOXCDAO',
          'X-AOXC-Agent': 'Neural-OS-v2.5'
        }
      });

      if (!response.ok) throw new Error("LINK_CORRUPTED");

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setIsOnline(true);
      setIsSimulating(false);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setIsOnline(true); 
      setIsSimulating(true);
      setLatency(12);
      addLog(`SYSTEM_NOTICE: Autonomous Simulation Mode Active`, "warning");
    }
  }, [syncNetwork, addLog]);

  useEffect(() => {
    const pulseTimer = setInterval(performSystemAudit, API_CONFIG.HEARTBEAT_INTERVAL);
    performSystemAudit(); 
    
    return () => {
      clearInterval(pulseTimer);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [performSystemAudit]);

  // --- 4. INTERFACE ROUTER ---
  const ActiveInterface = useMemo(() => {
    return (
      <Suspense fallback={<SkeletonView />}>
        {(() => {
          switch (activeView) {
            case 'pending': return <PendingSignatures />;
            case 'registry': return <RegistryMap />;
            case 'governance': return <WarRoom />;
            case 'analytics': return <NeuralAnalytics />;
            case 'aoxcan': return <AoxcanInterface />;
            case 'notifications': return <NotificationCenter />;
            case 'finance': return <LedgerView />; 
            default: return <LedgerView />;
          }
        })()}
      </Suspense>
    );
  }, [activeView]);

  // --- 5. RENDER ---
  return (
    <MainLayout 
      isOnline={isOnline} 
      latency={latency}
      isMobileMenuOpen={isMobileMenuOpen}
      toggleMobileMenu={toggleMobileMenu}
      isRightPanelOpen={isRightPanelOpen}
      rightPanelContent={<ModularControl />}
    >
      <AnimatePresence mode="wait">
        {!bootComplete && (
          <BootSequence onComplete={() => setBootComplete(true)} />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col h-full"
        >
          {ActiveInterface}
        </motion.div>
      </main>

      <Toaster />
      <ContractNotary />
      <UpgradePanel />
      <SentinelChat />
      <NotificationCenter />
    </MainLayout>
  );
}
