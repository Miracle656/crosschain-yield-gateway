import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ethers } from "ethers";
import { usePushWalletContext, usePushChainClient, usePushChain } from "@pushchain/ui-kit";
import { toast } from "sonner";
import { Loader2, Info, CheckCircle2, ArrowRight } from "lucide-react";
import { BRIDGEABLE_TOKENS, getAvailableTokensForChain } from "@/lib/bridgeTokens";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BridgeModal = ({ isOpen, onClose }: BridgeModalProps) => {
  const { universalAccount } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain();
  const account = universalAccount?.address;

  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [ueaAddress, setUeaAddress] = useState<string | null>(null); // ✅ Add UEA state

  // ✅ Get UEA address
  useEffect(() => {
    const getUEAAddress = async () => {
      if (!account || !universalAccount || !PushChain) return;

      try {
        const chainInfo = universalAccount.chain || '';
        const [namespace, chainId] = chainInfo.split(':');
        const isPushChainDirect = chainId === '42101' || chainId === '111557560';

        if (isPushChainDirect) {
          setUeaAddress(account);
          console.log("✅ On PushChain, using account:", account);
        } else {
          console.log("🔍 Getting UEA for external chain...");
          
          // Check cache first
          const cacheKey = `uea_${chainInfo}_${account}`;
          const cachedUEA = localStorage.getItem(cacheKey);
          
          if (cachedUEA) {
            setUeaAddress(cachedUEA);
            console.log("✅ Using cached UEA:", cachedUEA);
          } else {
            const universalAccountObj = {
              chain: universalAccount.chain,
              address: account
            };

            const executorInfo = await PushChain.utils.account.convertOriginToExecutor(
              universalAccountObj,
              { onlyCompute: false }
            );
            
            setUeaAddress(executorInfo.address);
            localStorage.setItem(cacheKey, executorInfo.address);
            console.log("✅ Got UEA:", executorInfo.address);
            console.log("Is deployed:", executorInfo.exists);
          }
        }
      } catch (error) {
        console.error("Error getting UEA address:", error);
        setUeaAddress(account);
      }
    };

    getUEAAddress();
  }, [account, universalAccount, PushChain]);

  // Get available tokens for current chain
  useEffect(() => {
    if (universalAccount?.chain) {
      const tokens = getAvailableTokensForChain(universalAccount.chain);
      setAvailableTokens(tokens);
      
      if (tokens.length > 0 && !selectedToken) {
        setSelectedToken(tokens[0].symbol);
      }
    }
  }, [universalAccount?.chain]);

  const isPushChain = universalAccount?.chain?.includes('42101') || universalAccount?.chain?.includes('111557560');

  // ✅ Fix balance fetching - Use CURRENT chain's RPC, not Push Chain
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !selectedToken || !universalAccount) return;

      const token = availableTokens.find(t => t.symbol === selectedToken);
      if (!token) return;

      try {
        // ✅ Get RPC for the CURRENT chain (not Push Chain)
        let rpcUrl = "";
        const chainInfo = universalAccount.chain || '';
        
        if (chainInfo.includes('11155111')) {
          // Ethereum Sepolia
          rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`; // Use your own Alchemy key
        } else if (chainInfo.includes('421614')) {
          // Arbitrum Sepolia
          rpcUrl = `https://arb-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        } else if (chainInfo.includes('84532')) {
          // Base Sepolia
          rpcUrl = `https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        } else if (chainInfo.includes('97')) {
          // BNB Testnet
          rpcUrl = `https://bnb-testnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        } else if (chainInfo.includes('solana')) {
          // Solana - handle separately
          console.log("Solana balance fetching not implemented yet");
          setBalance("0");
          return;
        } else {
          console.warn("Unknown chain, using fallback RPC");
          rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        if (token.mechanism === "native") {
          // ✅ For native tokens, fetch from CURRENT wallet address
          const bal = await provider.getBalance(account);
          setBalance(ethers.formatUnits(bal, token.decimals));
          console.log(`Native balance: ${ethers.formatUnits(bal, token.decimals)} ${token.symbol}`);
        } else {
          // ✅ For ERC20 tokens, fetch from CURRENT wallet address
          const erc20ABI = ["function balanceOf(address) view returns (uint256)"];
          const contract = new ethers.Contract(token.address, erc20ABI, provider);
          const bal = await contract.balanceOf(account);
          setBalance(ethers.formatUnits(bal, token.decimals));
          console.log(`ERC20 balance: ${ethers.formatUnits(bal, token.decimals)} ${token.symbol}`);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("0");
      }
    };

    fetchBalance();
  }, [account, selectedToken, availableTokens, universalAccount]);

  const handleBridge = async () => {
    if (!account || !amount || !pushChainClient || !selectedToken || !ueaAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    const token = availableTokens.find(t => t.symbol === selectedToken);
    if (!token) {
      toast.error("Token not found");
      return;
    }

    try {
      setIsLoading(true);

      const amountInSmallestUnit = ethers.parseUnits(amount, token.decimals);

      console.log("Bridging:", {
        token: token.symbol,
        amount: amount,
        amountInSmallestUnit: amountInSmallestUnit.toString(),
        fromChain: universalAccount?.chain,
        toAddress: ueaAddress, // ✅ Using UEA
      });

      // ✅ Send to UEA address on Push Chain
      const tx = await pushChainClient.universal.sendTransaction({
        to: ueaAddress, // ✅ FIXED: Use UEA instead of origin account
        funds: {
          amount: amountInSmallestUnit,
          token: pushChainClient.moveable.token[token.symbol],
        },
      });

      toast.success("Bridge transaction submitted!");
      console.log("Transaction hash:", tx.hash);

      await tx.wait();
      
      toast.success(`Successfully bridged ${amount} ${token.symbol} to Push Chain!`);
      toast.info(`Tokens will arrive at: ${ueaAddress}`);
      
      setAmount("");
      onClose();
    } catch (error: any) {
      console.error("Bridge error:", error);
      
      if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient balance for bridging + gas fees");
      } else if (error.message?.includes("user rejected")) {
        toast.error("Transaction rejected");
      } else {
        toast.error(error.message || "Bridge failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    const token = availableTokens.find(t => t.symbol === selectedToken);
    if (!token) return;

    // ✅ Leave more for gas if it's native token
    if (token.mechanism === "native") {
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01); // Leave 0.01 for gas
      setAmount(maxAmount.toString());
    } else {
      setAmount(balance);
    }
  };

  // Show loading while getting UEA
  if (!ueaAddress && !isPushChain && universalAccount) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Bridge to Push Chain</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your Push Chain address...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isPushChain) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Bridge Tokens</DialogTitle>
            <DialogDescription>
              Transfer tokens to Push Chain from other networks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                You're already on Push Chain! To bridge tokens, please connect from:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Ethereum Sepolia</li>
                  <li>Solana Devnet</li>
                  <li>Arbitrum Sepolia</li>
                  <li>Base Sepolia</li>
                  <li>BNB Testnet</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (availableTokens.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Bridge Tokens</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No bridgeable tokens available for your current network. Please switch to a supported network.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="gradient-text">Bridge to Push Chain</DialogTitle>
          <DialogDescription>
            Transfer tokens from {availableTokens[0]?.chainName} to Push Chain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Route Display */}
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-semibold">{availableTokens[0]?.chainName}</p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-primary mx-2" />

            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-semibold">Push Chain</p>
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary/50 border-border/50 pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={setMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
              >
                MAX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {parseFloat(balance).toFixed(6)} {selectedToken}
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-semibold">✅ Official Push Chain Bridge</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Processing time: 2-5 minutes</li>
                  <li>Tokens will appear in your Push Chain wallet</li>
                  <li>Small gas fee applies on source chain</li>
                  <li>Outbound bridging coming soon!</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Bridge Button */}
          <Button
            onClick={handleBridge}
            disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balance)}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging...
              </>
            ) : (
              `Bridge ${selectedToken} to Push Chain`
            )}
          </Button>

          {/* Recipient Info */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Recipient Address (Push Chain UEA):</p>
            <p className="text-xs font-mono break-all">{ueaAddress}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};