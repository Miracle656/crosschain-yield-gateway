import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Coins, Lock } from 'lucide-react';
import { ethers } from 'ethers';

interface Strategy {
  strategyId: bigint;
  protocolName: string;
  sourceChain: string;
  prc20Token: string;
  apy: bigint;
  tvl: bigint;
  minDeposit: bigint;
  isActive: boolean;
}

interface StrategyCardProps {
  strategy: Strategy;
  onDeposit: (strategyId: number) => void;
}

export const StrategyCard = ({ strategy, onDeposit }: StrategyCardProps) => {
  const formatAPY = (apy: bigint) => {
    return (Number(apy) / 100).toFixed(2);
  };

  const formatTVL = (tvl: bigint) => {
    const value = Number(ethers.formatEther(tvl));
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatMinDeposit = (amount: bigint) => {
    return ethers.formatEther(amount);
  };

  return (
    <Card className="glass-card p-6 transition-all hover:scale-[1.01] hover:shadow-xl">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">{strategy.protocolName}</h3>
            <Badge variant="secondary" className="mt-2">
              {strategy.sourceChain}
            </Badge>
          </div>
          <div className="rounded-lg bg-accent/10 px-3 py-1">
            <p className="text-xs text-muted-foreground">APY</p>
            <p className="text-lg font-bold text-accent">{formatAPY(strategy.apy)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">TVL</p>
              <p className="font-semibold">{formatTVL(strategy.tvl)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Min Deposit</p>
              <p className="font-semibold">{formatMinDeposit(strategy.minDeposit)} ETH</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onDeposit(Number(strategy.strategyId))}
          disabled={!strategy.isActive}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Deposit
        </Button>
      </div>
    </Card>
  );
};
