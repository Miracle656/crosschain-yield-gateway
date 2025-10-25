import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import React from 'react';

const walletConfig = {
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
};

export function PushWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <PushUniversalWalletProvider config={walletConfig}>
      {children}
    </PushUniversalWalletProvider>
  );
}