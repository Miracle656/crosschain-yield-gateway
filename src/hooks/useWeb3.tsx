import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export const useWeb3 = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof (window as any).ethereum === 'undefined') {
      alert('Please install MetaMask or use Push Universal Wallet!');
      return;
    }

    try {
      setIsConnecting(true);
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const userSigner = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userSigner);

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setContract(contractInstance);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
  };

  useEffect(() => {
    if (typeof (window as any).ethereum !== 'undefined') {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        (window as any).ethereum.removeAllListeners('accountsChanged');
        (window as any).ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    provider,
    signer,
    account,
    contract,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  };
};
