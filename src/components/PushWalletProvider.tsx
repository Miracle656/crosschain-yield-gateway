import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import React from 'react';

const walletConfig = {
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  login: {
      email: true,
      google: true,
      wallet: {
        enabled: true,
      },
      appPreview: true,
    },
    modal: {
      loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SPLIT,
      connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
      appPreview: true,
    },
};

const appMetadata = {
    logoUrl:
      'https://pbs.twimg.com/profile_images/1982165334808297472/08Y9xrLw_400x400.jpg',
    title: 'Push Yeild',
    description: 'earn yields across chains with one account—no bridging, no multiple wallets, and low fees.',
  };

export function PushWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <PushUniversalWalletProvider config={walletConfig} app={appMetadata} themeOverrides={{
        dark: {
          '--pw-core-bg-primary-color': '#1F1B24',
          '--pw-core-bg-secondary-color': '#2B2235',
        }
      }} themeMode='dark'>
      {children}
    </PushUniversalWalletProvider>
  );
}