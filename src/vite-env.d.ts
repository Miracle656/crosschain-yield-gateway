/// <reference types="vite/client" />

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeAllListeners: (event: string) => void;
      selectedAddress?: string;
    };
  }
}

export {};
