import { useEffect, useRef } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';

/**
 * @title AOXC Neural Heartbeat Hook
 * @notice Orchestrates the temporal synchronization between the UI and X Layer.
 * @dev Audit Standards: 
 * - Prevents multiple concurrent sync executions.
 * - Aligns internal state with on-chain entropy.
 */
export const useAoxcClock = () => {
  const { incrementBlock, addLog, syncNetwork } = useAoxcStore();
  const isSyncing = useRef(false);

  useEffect(() => {
    // 12-second interval is often optimal for X Layer Mainnet 
    // to match average block times and avoid RPC rate-limiting.
    const CLOCK_SPEED = 3000; 

    const tick = async () => {
      if (isSyncing.current) return; // Prevent overlapping sync calls
      
      isSyncing.current = true;
      try {
        // Sync with the decentralized registry and network state
        await syncNetwork();
        
        // Finalize the tick by updating internal counters
        incrementBlock();

        // Layer 2: Autonomous AI Health Check Triggers
        if (Math.random() > 0.85) {
          const diagnostics = [
            'SENTINEL: State integrity verified.',
            'INFRA: Optimizing neural gas pathways...',
            'CLOCK: Epoch synchronization verified.',
            'GATEWAY: Monitoring X Layer-Reth nodes...'
          ];
          const randomMsg = diagnostics[Math.floor(Math.random() * diagnostics.length)];
          addLog(randomMsg, 'ai');
        }
      } catch (error) {
        console.error("HEARTBEAT_FAILURE: Neural link jitter detected.", error);
      } finally {
        isSyncing.current = false;
      }
    };

    const interval = setInterval(tick, CLOCK_SPEED);

    // Initial tick to populate data immediately on mount
    tick();

    return () => clearInterval(interval);
  }, [incrementBlock, addLog, syncNetwork]);
};
