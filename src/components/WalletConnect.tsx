import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

export const WalletConnect = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, isConnected } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <Button
        onClick={disconnectWallet}
        variant="outline"
        className="gap-2 border-border/50 bg-secondary/50 hover:bg-secondary"
      >
        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        {formatAddress(account)}
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="gap-2 bg-gradient-primary hover:opacity-90 glow-primary"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};
