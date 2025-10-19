import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, Calendar } from 'lucide-react';
import { ethers } from 'ethers';

interface Position {
  positionId: bigint;
  strategyId: bigint;
  user: string;
  depositedAmount: bigint;
  shares: bigint;
  depositTimestamp: bigint;
  isActive: boolean;
}

interface PositionCardProps {
  position: Position;
  onWithdraw: (positionId: number) => void;
}

export const PositionCard = ({ position, onWithdraw }: PositionCardProps) => {
  const formatAmount = (amount: bigint) => {
    return ethers.formatEther(amount);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-foreground">Position #{position.positionId.toString()}</h4>
            <p className="text-sm text-muted-foreground">Strategy #{position.strategyId.toString()}</p>
          </div>
          <Badge variant={position.isActive ? "default" : "secondary"}>
            {position.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Deposited</span>
            <span className="font-semibold">{formatAmount(position.depositedAmount)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Shares</span>
            <span className="font-semibold">{position.shares.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deposit Date</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(position.depositTimestamp)}
            </div>
          </div>
        </div>

        {position.isActive && (
          <Button
            onClick={() => onWithdraw(Number(position.positionId))}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        )}
      </div>
    </Card>
  );
};
