/// <reference types="vite/client" />

/**
 * @title AOXC Neural OS - Environment & Global Definitions
 * @notice Global type safety for X Layer integration and Vite environment variables.
 * @dev This file resolves TS2339 errors for 'env' and 'ethereum'.
 */

interface ImportMetaEnv {
  // Web3 & Contract Addresses
  readonly VITE_AOXC_REGISTRY_ADDR: string;
  readonly VITE_AOXC_CORE_ADDR: string;
  readonly VITE_AOXC_NEXUS_ADDR: string;
  readonly VITE_AOXC_SENTINEL_ADDR: string;
  readonly VITE_AOXC_VAULT_ADDR: string;
  
  // AI Integration
  readonly VITE_GEMINI_API_KEY: string;
  
  // Network Config
  readonly VITE_XLAYER_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * @dev EIP-1193 Standard for Browser Wallets (OKX Wallet, MetaMask)
 */
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isOKXWallet?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    autoRefreshOnNetworkChange?: boolean;
  };
}

/**
 * @dev Custom modules for non-TS assets if needed
 */
declare module "*.sol" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const value: any;
  export default value;
}
