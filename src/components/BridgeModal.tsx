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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ethers } from "ethers";
import { usePushWalletContext, usePushChainClient } from "@pushchain/ui-kit";
import { toast } from "sonner";
import { Loader2, ExternalLink, Info } from "lucide-react";

const CHAINS = {
  ETHEREUM: {
    name: "Ethereum Sepolia",
    chainId: "11155111",
    namespace: "eip155",
    rpc: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  },
  SOLANA: {
    name: "Solana Devnet",
    chainId: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    namespace: "solana",
  },
  PUSH: {
    name: "Push Chain Testnet",
    chainId: "111557560",
    namespace: "eip155",
    rpc: "https://evm.rpc-testnet-donut-node1.push.org/",
  },
};

const BRIDGEABLE_TOKENS = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    prcAddress: "0x2971824Db68229D087931155C2b8bB820B275809", // PETH on Push
    originChain: "ETHEREUM",
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    prcAddress: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed", // PSOL on Push
    originChain: "SOLANA",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    prcAddress: "0x387b9C8Db60E74999aAAC5A2b7825b400F12d68E",
    originChain: "ETHEREUM",
  },
};

const PRC20_ABI = [
  "function withdraw(bytes calldata to, uint256 amount) external returns (bool)",
  "function withdrawGasFee() external view returns (address gasToken, uint256 gasFee)",
  "function balanceOf(address account) external view returns (uint256)",
];

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BridgeModal = ({ isOpen, onClose }: BridgeModalProps) => {
  const { universalAccount } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const account = universalAccount?.address;

  const [selectedToken, setSelectedToken] = useState("ETH");
  const [direction, setDirection] = useState<"TO_PUSH" | "FROM_PUSH">("TO_PUSH");
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBridge = async () => {
    if (!account || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      if (direction === "TO_PUSH") {
        await bridgeToPush();
      } else {
        await bridgeFromPush();
      }

      toast.success("Bridge transaction submitted!");
      setAmount("");
      setDestinationAddress("");
      onClose();
    } catch (error: any) {
      console.error("Bridge error:", error);
      toast.error(error.message || "Bridge failed");
    } finally {
      setIsLoading(false);
    }
  };

  const bridgeToPush = async () => {
    toast.info(
      "Please use the official Push Chain bridge at bridge.push.org to bridge tokens TO Push Chain",
      { duration: 8000 }
    );
    window.open("https://bridge.push.org", "_blank");
  };

  const bridgeFromPush = async () => {
    if (!pushChainClient) {
      toast.error("Please connect wallet");
      return;
    }

    const token = BRIDGEABLE_TOKENS[selectedToken as keyof typeof BRIDGEABLE_TOKENS];
    const prcInterface = new ethers.Interface(PRC20_ABI);

    // Encode destination address based on chain
    let destinationBytes: string;
    if (token.originChain === "ETHEREUM") {
      // For Ethereum, use the address directly
      destinationBytes = destinationAddress || account!;
    } else if (token.originChain === "SOLANA") {
      // For Solana, encode the base58 address as bytes
      destinationBytes = ethers.hexlify(
        ethers.toUtf8Bytes(destinationAddress || account!)
      );
    } else {
      destinationBytes = destinationAddress || account!;
    }

    const amountInWei = ethers.parseEther(amount);

    // Get gas fee
    const provider = new ethers.JsonRpcProvider(
      "https://evm.rpc-testnet-donut-node1.push.org/"
    );
    const contract = new ethers.Contract(token.prcAddress, PRC20_ABI, provider);
    const [gasToken, gasFee] = await contract.withdrawGasFee();

    toast.info(`Bridge fee: ${ethers.formatEther(gasFee)} tokens`);

    // Perform withdrawal
    const withdrawData = prcInterface.encodeFunctionData("withdraw", [
      destinationBytes,
      amountInWei,
    ]);

    const tx = await pushChainClient.universal.sendTransaction({
      to: token.prcAddress,
      data: withdrawData,
    });

    toast.info("Processing bridge transaction...");
    await tx.wait();
    toast.success(
      `Tokens will arrive at ${token.originChain} in a few minutes`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="gradient-text">Bridge Tokens</DialogTitle>
          <DialogDescription>
            Transfer tokens between Push Chain and other networks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select
              value={direction}
              onValueChange={(val) => setDirection(val as any)}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TO_PUSH">To Push Chain</SelectItem>
                <SelectItem value="FROM_PUSH">From Push Chain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BRIDGEABLE_TOKENS).map(([key, token]) => (
                  <SelectItem key={key} value={key}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          {/* Destination Address (only for FROM_PUSH) */}
          {direction === "FROM_PUSH" && (
            <div className="space-y-2">
              <Label>
                Destination Address (optional - defaults to your wallet)
              </Label>
              <Input
                type="text"
                placeholder={
                  selectedToken === "SOL"
                    ? "Solana address"
                    : "0x... Ethereum address"
                }
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          )}

          {/* Info Alert */}
          {direction === "TO_PUSH" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Bridging TO Push Chain requires using the official Push Chain
                bridge. Click the button below to open it.
              </AlertDescription>
            </Alert>
          )}

          {/* Bridge Button */}
          <Button
            onClick={handleBridge}
            disabled={isLoading || !amount}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : direction === "TO_PUSH" ? (
              <>
                Open Bridge <ExternalLink className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Bridge from Push Chain"
            )}
          </Button>

          {/* Bridge Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Bridge time: 5-15 minutes</p>
            <p>• Small gas fee applies</p>
            <p>• Transactions are irreversible</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};