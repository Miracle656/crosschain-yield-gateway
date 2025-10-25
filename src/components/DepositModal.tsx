import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ethers } from "ethers";
import { usePushWalletContext, usePushChainClient } from "@pushchain/ui-kit";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { usePushChain } from "@pushchain/ui-kit";

// ✅ Define available tokens
const TOKENS = {
  NATIVE: {
    symbol: "PC",
    name: "Push Chain Native",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  PSOL: {
    symbol: "pSOL",
    name: "Wrapped Solana",
    address: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed",
    decimals: 9, // ⚠️ Important!
  },
  PETH: {
    symbol: "pETH",
    name: "Wrapped Ethereum",
    address: "0x2971824Db68229D087931155C2b8bB820B275809",
    decimals: 18,
  },
  "USDC.eth": {
    symbol: "USDC",
    name: "USD Coin (Ethereum)",
    address: "0x387b9C8Db60E74999aAAC5A2b7825b400F12d68E",
    decimals: 6,
  },
  "USDT.eth": {
    symbol: "USDT",
    name: "Tether (Ethereum)",
    address: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
    decimals: 6,
  },
};

// ✅ ERC20 ABI for approve and balanceOf
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: number | null;
  onSuccess?: () => void;
}

export const DepositModal = ({
  isOpen,
  onClose,
  strategyId,
  onSuccess,
}: DepositModalProps) => {
  const { universalAccount } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
   const { PushChain } = usePushChain(); // ✅ Add this

  const account = universalAccount?.address;
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("NATIVE");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleDeposit = async () => {
  if (!account || strategyId === null || !amount) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    setIsLoading(true);

    const token = TOKENS[selectedToken as keyof typeof TOKENS];
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    if (selectedToken === "NATIVE") {
      // Native token deposit
      const amountInWei = BigInt(ethers.parseEther(amount.toString()));

      const data = contractInterface.encodeFunctionData(
        "depositWithNativeToken",
        [BigInt(strategyId), BigInt(0)]
      );

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
        value: amountInWei,
      });

      toast.success("Transaction submitted!");
      const receipt = await tx.wait();
      
      // ✅ Cache UEA properly using SDK
      const chainInfo = universalAccount?.chain || '';
      const [namespace, chainId] = chainInfo.split(':');
      const isPushChain = chainId === '111557560';
      
      if (!isPushChain && account) {
        try {
          const universalAccountObj = {
            chain: universalAccount!.chain!,
            address: account
          };

          const executorInfo = await PushChain.utils.account.convertOriginToExecutor(
            universalAccountObj,
            { onlyCompute: false }
          );

          const cacheKey = `uea_${chainInfo}_${account}`;
          localStorage.setItem(cacheKey, executorInfo.address);
          console.log(`✅ Cached UEA ${executorInfo.address} for ${chainInfo}`);
        } catch (error) {
          console.error("Error caching UEA:", error);
        }
      }
      
      toast.success("Deposit successful!");
    } else {
      // PRC20 token deposit
      const amountInTokenUnits = ethers.parseUnits(amount, token.decimals);

      // Check and approve if needed
      const erc20Interface = new ethers.Interface(ERC20_ABI);
      
      const allowanceData = erc20Interface.encodeFunctionData("allowance", [
        account,
        CONTRACT_ADDRESS,
      ]);
      
      const provider = new ethers.JsonRpcProvider(
        'https://evm.rpc-testnet-donut-node1.push.org/'
      );
      
      const allowanceResult = await provider.call({
        to: token.address,
        data: allowanceData,
      });
      
      const currentAllowance = BigInt(allowanceResult);
      
      if (currentAllowance < amountInTokenUnits) {
  setIsApproving(true);
  toast.info("Approving token spend...");
  
  const approveData = erc20Interface.encodeFunctionData("approve", [
    CONTRACT_ADDRESS,
    amountInTokenUnits * BigInt(2), // ✅ Approve extra to avoid multiple approvals
  ]);

  const approveTx = await pushChainClient.universal.sendTransaction({
    to: token.address,
    data: approveData,
  });

  await approveTx.wait();
  
  // ✅ Wait a bit for approval to propagate
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  toast.success("Approval successful!");
  setIsApproving(false);
}

      // Now deposit
      const depositData = contractInterface.encodeFunctionData("deposit", [
        BigInt(strategyId),
        amountInTokenUnits,
      ]);

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: depositData,
      });

      toast.success("Transaction submitted!");
      const receipt = await tx.wait();
      
      // ✅ Cache UEA
      const chainInfo = universalAccount?.chain || '';
      const [namespace, chainId] = chainInfo.split(':');
      const isPushChain = chainId === '111557560';
      
      if (!isPushChain && receipt.from) {
        const cacheKey = `uea_${chainInfo}_${account}`;
        localStorage.setItem(cacheKey, receipt.from);
        console.log(`Cached UEA ${receipt.from} for ${chainInfo}`);
      }
      
      toast.success("Deposit successful!");
    }

    setAmount("");
    onClose();

    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error("Deposit error:", error);
    toast.error(error.message || "Deposit failed");
  } finally {
    setIsLoading(false);
    setIsApproving(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            Deposit to Strategy
          </DialogTitle>
          <DialogDescription>
            Choose a token and enter the amount you want to deposit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ✅ Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOKENS).map(([key, token]) => (
                  <SelectItem key={key} value={key}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ✅ Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ({TOKENS[selectedToken as keyof typeof TOKENS].symbol})
            </Label>
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

          {/* ✅ Deposit Button */}
          <Button
            onClick={handleDeposit}
            disabled={isLoading || isApproving || !amount}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Deposit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};