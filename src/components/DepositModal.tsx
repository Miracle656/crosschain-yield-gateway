import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ethers } from 'ethers';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: number | null;
}

export const DepositModal = ({ isOpen, onClose, strategyId }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { contract, account } = useWeb3();

  const handleDeposit = async () => {
    if (!contract || !account || !strategyId || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const amountInWei = ethers.parseEther(amount);
      
      const tx = await contract.depositWithNativeToken(
        strategyId,
        0, // minPRC20Amount - set to 0 for now
        { value: amountInWei }
      );
      
      toast.success('Transaction submitted!');
      await tx.wait();
      toast.success('Deposit successful!');
      
      setAmount('');
      onClose();
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Deposit to Strategy</DialogTitle>
          <DialogDescription>
            Enter the amount you want to deposit. Minimum deposit requirements apply.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <Button
            onClick={handleDeposit}
            disabled={isLoading || !amount}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Deposit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
