import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PushChain } from '@pushchain/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { toast } from 'sonner';

export const useWeb3 = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [pushChainClient, setPushChainClient] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Connect to Push Chain RPC
      const pushProvider = new ethers.JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
      
      // Check if user has a wallet (MetaMask, etc)
      if (typeof (window as any).ethereum !== 'undefined') {
        // Use user's existing wallet
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await browserProvider.send('eth_requestAccounts', []);
        const userSigner = await browserProvider.getSigner();
        
        // Convert to Universal Signer for Push Chain
        const universalSigner = await PushChain.utils.signer.toUniversal(userSigner);
        
        // Initialize Push Chain client
        const client = await PushChain.initialize(universalSigner, {
          network: PushChain.CONSTANTS.PUSH_NETWORK.TESTNET,
        });

        // Create contract instance with Push Chain provider
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userSigner);

        setProvider(browserProvider);
        setSigner(userSigner);
        setAccount(accounts[0]);
        setContract(contractInstance);
        setPushChainClient(client);
        
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Please install MetaMask or a Web3 wallet!');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setPushChainClient(null);
    toast.info('Wallet disconnected');
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
    pushChainClient,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  };
};
