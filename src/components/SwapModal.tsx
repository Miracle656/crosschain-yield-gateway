// @ts-ignore
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
import { ethers } from "ethers";
import { usePushWalletContext, usePushChainClient } from "@pushchain/ui-kit";
import { toast } from "sonner";
import { Loader2, ArrowDownUp } from "lucide-react";
import { usePushChain } from "@pushchain/ui-kit";
import { getSwapRoute } from "@/lib/swapRoutes";

// Token definitions
const TOKENS = {
  PC: {
    symbol: "PC",
    name: "Push Chain Native",
    address: "NATIVE",
    decimals: 18,
  },
  WPC: {
    symbol: "WPC",
    name: "Wrapped Push Coin",
    address: "0xE17DD2E0509f99E9ee9469Cf6634048Ec5a3ADe9",
    decimals: 18,
  },
  PSOL: {
    symbol: "PSOL",
    name: "Wrapped Solana",
    address: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed",
    decimals: 18,
  },
  PETH: {
    symbol: "PETH",
    name: "Wrapped Ethereum",
    address: "0x2971824Db68229D087931155C2b8bB820B275809",
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x387b9C8Db60E74999aAAC5A2b7825b400F12d68E",
    decimals: 6,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    address: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
    decimals: 6,
  },
};

const SWAP_ROUTER = "0x5D548bB9E305AAe0d6dc6e6fdc3ab419f6aC0037";
const WPC_ADDRESS = "0xE17DD2E0509f99E9ee9469Cf6634048Ec5a3ADe9";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

const WPC_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwapModal = ({ isOpen, onClose }: SwapModalProps) => {
  const { universalAccount } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain(); // ✅ Add this
  const account = universalAccount?.address;

  const [fromToken, setFromToken] = useState("PC");
  const [toToken, setToToken] = useState("PSOL");
  const [amount, setAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});

  // ✅ Add new state for UEA address
  const [ueaAddress, setUeaAddress] = useState<string | null>(null);

  const provider = new ethers.JsonRpcProvider(
    "https://evm.rpc-testnet-donut-node1.push.org/"
  );

  // ✅ Get UEA address when account changes
  useEffect(() => {
    const getUEAAddress = async () => {
      if (!account || !universalAccount) return;

      try {
        const chainInfo = universalAccount.chain || "";
        const [namespace, chainId] = chainInfo.split(":");
        const isPushChainDirect = chainId === "111557560";

        if (isPushChainDirect) {
          // On PushChain, use the account directly
          setUeaAddress(account);
          console.log("✅ On PushChain, using account:", account);
        } else {
          // For external chains, get the UEA
          console.log("🔍 Converting to UEA for", chainInfo);

          const universalAccountObj = {
            chain: universalAccount.chain,
            address: account,
          };

          const executorInfo =
            await PushChain.utils.account.convertOriginToExecutor(
              universalAccountObj,
              { onlyCompute: false }
            );

          console.log("✅ UEA Address:", executorInfo.address);
          console.log("Is deployed:", executorInfo.exists);

          setUeaAddress(executorInfo.address);

          // Cache it
          const cacheKey = `uea_${chainInfo}_${account}`;
          localStorage.setItem(cacheKey, executorInfo.address);
        }
      } catch (error) {
        console.error("Error getting UEA address:", error);
        setUeaAddress(account); // Fallback
      }
    };

    getUEAAddress();
  }, [account, universalAccount, PushChain]);

  // Fetch balances
  useEffect(() => {
    if (account && isOpen) {
      fetchBalances();
    }
  }, [account, isOpen]);

  // Update fetchBalances to use ueaAddress
  const fetchBalances = async () => {
    if (!ueaAddress) return;

    try {
      const newBalances: Record<string, string> = {};

      // ✅ ALWAYS use Push Chain RPC for balances (tokens are on Push Chain)
      const provider = new ethers.JsonRpcProvider(
        "https://evm.rpc-testnet-donut-node1.push.org/"
      );

      // Native PC balance
      const nativeBalance = await provider.getBalance(ueaAddress);
      newBalances.PC = ethers.formatEther(nativeBalance);

      // Token balances
      for (const [key, token] of Object.entries(TOKENS)) {
        if (token.address === "NATIVE") continue;

        try {
          const contract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
          );
          const balance = await contract.balanceOf(ueaAddress);
          newBalances[key] = ethers.formatUnits(balance, token.decimals);
          console.log(
            `${key} balance:`,
            ethers.formatUnits(balance, token.decimals)
          );
        } catch (error) {
          console.error(`Error fetching ${key} balance:`, error);
          newBalances[key] = "0";
        }
      }

      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };
  const handleSwap = async () => {
    if (!account || !amount || !pushChainClient || !ueaAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      const fromTokenData = TOKENS[fromToken as keyof typeof TOKENS];
      const toTokenData = TOKENS[toToken as keyof typeof TOKENS];
      const amountIn = ethers.parseUnits(amount, fromTokenData.decimals);

      const route = getSwapRoute(fromToken, toToken);
      console.log("Swap route:", route);

      // Execute based on route method
      if (route.method === "wrap") {
        await wrapPC(amountIn);
        toast.success("Wrapped PC to WPC!");
      } else if (route.method === "unwrap") {
        await unwrapWPC(amountIn);
        toast.success("Unwrapped WPC to PC!");
      } else if (route.method === "directSwap") {
        // Direct WPC ↔ Token swap
        toast.info("Swapping directly...");
        await directSwap(
          fromTokenData.address,
          toTokenData.address,
          amountIn,
          BigInt(0),
          500 // Always use fee tier 500
        );
        toast.success("Swap successful!");
      } else if (route.method === "multiHop") {
        // Multi-hop swap
        toast.info(`Swapping via ${route.hops.length} hops...`);

        if (fromToken === "PC") {
          // PC → WPC → Token
          await multiHopFromPC(amountIn, toTokenData.address);
        } else if (toToken === "PC") {
          // Token → WPC → PC
          await multiHopSwapToPC(fromTokenData.address, amountIn);
        } else {
          // Token → WPC → Token
          await multiHopSwapTokenToToken(
            fromTokenData.address,
            toTokenData.address,
            amountIn
          );
        }

        toast.success("Multi-hop swap successful!");
      }

      setAmount("");
      fetchBalances();
      onClose();
    } catch (error: any) {
      console.error("Swap error:", error);

      if (error.message?.includes("execution reverted")) {
        toast.error(
          "Swap failed. Pool might have insufficient liquidity or wrong fee tier."
        );
      } else {
        toast.error(error.message || "Swap failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add these helper functions

  const wrapPC = async (amount: bigint) => {
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const data = wpcInterface.encodeFunctionData("deposit");

    const tx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data,
      value: amount,
    });

    toast.info("Wrapping PC to WPC...");
    await tx.wait();
  };

  const unwrapWPC = async (amount: bigint) => {
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const data = wpcInterface.encodeFunctionData("withdraw", [amount]);

    const tx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data,
    });

    toast.info("Unwrapping WPC to PC...");
    await tx.wait();
  };

  // ✅ Multi-hop from PC
  const multiHopFromPC = async (amountIn: bigint, toToken: string) => {
    // Step 1: Wrap PC to WPC
    toast.info("Step 1/3: Wrapping PC to WPC...");
    await wrapPC(amountIn);

    // Step 2: Approve WPC for router
    toast.info("Step 2/3: Approving WPC...");
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const approveData = wpcInterface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      amountIn,
    ]);

    const approveTx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data: approveData,
    });
    await approveTx.wait();

    // Step 3: Swap WPC to target token
    toast.info("Step 3/3: Swapping WPC to target token...");
    await directSwap(WPC_ADDRESS, toToken, amountIn, BigInt(0), 500);
  };

  const multiHopSwapToPC = async (fromToken: string, amountIn: bigint) => {
    // Step 1: Approve source token
    const erc20Interface = new ethers.Interface(ERC20_ABI);
    const approveData = erc20Interface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      amountIn,
    ]);

    const approveTx = await pushChainClient.universal.sendTransaction({
      to: fromToken,
      data: approveData,
    });

    toast.info("Approving token...");
    await approveTx.wait();

    // Step 2: Swap to WPC
    toast.info("Swapping to WPC...");
    await directSwap(fromToken, WPC_ADDRESS, amountIn, BigInt(0));

    // Step 3: Unwrap WPC to PC
    await unwrapWPC(amountIn); // Note: This assumes 1:1, might need to query balance
  };

  const multiHopSwapTokenToToken = async (
    fromToken: string,
    toToken: string,
    amountIn: bigint
  ) => {
    // Step 1: Approve source token
    const erc20Interface = new ethers.Interface(ERC20_ABI);
    const approveData = erc20Interface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      amountIn,
    ]);

    const approveTx = await pushChainClient.universal.sendTransaction({
      to: fromToken,
      data: approveData,
    });

    toast.info("Approving token...");
    await approveTx.wait();

    // Step 2: Swap to WPC
    toast.info("Swapping to WPC...");
    await directSwap(fromToken, WPC_ADDRESS, amountIn, BigInt(0));

    // Step 3: Query WPC balance
    const wpcContract = new ethers.Contract(WPC_ADDRESS, ERC20_ABI, provider);
    const wpcBalance = await wpcContract.balanceOf(ueaAddress);

    // Step 4: Approve WPC
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const approveWPCData = wpcInterface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      wpcBalance,
    ]);

    const approveWPCTx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data: approveWPCData,
    });

    await approveWPCTx.wait();

    // Step 5: Swap WPC to target token
    toast.info("Swapping WPC to target...");
    await directSwap(WPC_ADDRESS, toToken, wpcBalance, BigInt(0));
  };

  const wrapAndSwap = async (
    amountIn: bigint,
    toTokenAddress: string,
    amountOutMin: bigint
  ) => {
    // Step 1: Wrap PC to WPC
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const wrapData = wpcInterface.encodeFunctionData("deposit");

    const wrapTx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data: wrapData,
      value: amountIn,
    });

    toast.info("Wrapping PC to WPC...");
    await wrapTx.wait();

    // Step 2: Approve WPC for swap router
    const approveData = wpcInterface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      amountIn,
    ]);

    const approveTx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data: approveData,
    });

    toast.info("Approving swap...");
    await approveTx.wait();

    // Step 3: Swap WPC to target token
    await directSwap(WPC_ADDRESS, toTokenAddress, amountIn, amountOutMin);
  };

  const swapAndUnwrap = async (
    fromTokenAddress: string,
    amountIn: bigint,
    amountOutMin: bigint
  ) => {
    // Step 1: Approve token for swap
    const erc20Interface = new ethers.Interface(ERC20_ABI);
    const approveData = erc20Interface.encodeFunctionData("approve", [
      SWAP_ROUTER,
      amountIn,
    ]);

    const approveTx = await pushChainClient.universal.sendTransaction({
      to: fromTokenAddress,
      data: approveData,
    });

    toast.info("Approving swap...");
    await approveTx.wait();

    // Step 2: Swap to WPC
    await directSwap(fromTokenAddress, WPC_ADDRESS, amountIn, amountOutMin);

    // Step 3: Unwrap WPC to PC
    const wpcInterface = new ethers.Interface(WPC_ABI);
    const unwrapData = wpcInterface.encodeFunctionData("withdraw", [amountIn]);

    const unwrapTx = await pushChainClient.universal.sendTransaction({
      to: WPC_ADDRESS,
      data: unwrapData,
    });

    toast.info("Unwrapping WPC to PC...");
    await unwrapTx.wait();
  };

  // Update directSwap to use ueaAddress
  const directSwap = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    amountOutMin: bigint,
    feeTier: number = 500 // ✅ Default to 500 (all pools use this)
  ) => {
    if (!ueaAddress) {
      toast.error("UEA address not available");
      return;
    }

    if (tokenIn !== WPC_ADDRESS && tokenIn !== "NATIVE") {
      const erc20Interface = new ethers.Interface(ERC20_ABI);

      const allowanceData = erc20Interface.encodeFunctionData("allowance", [
        ueaAddress,
        SWAP_ROUTER,
      ]);

      try {
        const allowanceResult = await provider.call({
          to: tokenIn,
          data: allowanceData,
        });

        const currentAllowance = BigInt(allowanceResult);

        if (currentAllowance < amountIn) {
          const approveData = erc20Interface.encodeFunctionData("approve", [
            SWAP_ROUTER,
            amountIn,
          ]);

          const approveTx = await pushChainClient.universal.sendTransaction({
            to: tokenIn,
            data: approveData,
          });

          await approveTx.wait();
        }
      } catch (error) {
        console.error("Approval check failed, approving anyway:", error);
        const approveData = erc20Interface.encodeFunctionData("approve", [
          SWAP_ROUTER,
          amountIn,
        ]);

        const approveTx = await pushChainClient.universal.sendTransaction({
          to: tokenIn,
          data: approveData,
        });

        await approveTx.wait();
      }
    }

    // Perform swap
    const swapInterface = new ethers.Interface(SWAP_ROUTER_ABI);
    const params = {
      tokenIn,
      tokenOut,
      fee: feeTier, // ✅ Use 500
      recipient: ueaAddress,
      deadline: Math.floor(Date.now() / 1000) + 600,
      amountIn,
      amountOutMinimum: BigInt(0), // No slippage protection for now
      sqrtPriceLimitX96: 0,
    };

    const swapData = swapInterface.encodeFunctionData("exactInputSingle", [
      params,
    ]);

    const swapTx = await pushChainClient.universal.sendTransaction({
      to: SWAP_ROUTER,
      data: swapData,
      value: tokenIn === "NATIVE" ? amountIn : BigInt(0),
    });

    await swapTx.wait();
  };

  const handleFlipTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount("");
    setEstimatedOutput("");
  };

  // Update the UI to show when UEA is being computed
  if (!ueaAddress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="gradient-text">Swap Tokens</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading account...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Swap Tokens</DialogTitle>
          <DialogDescription>
            Exchange tokens on Push Chain DEX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOKENS).map(([key, token]) => (
                  <SelectItem key={key} value={key} disabled={key === toToken}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
            <p className="text-xs text-muted-foreground">
              Balance: {balances[fromToken] || "0"} {fromToken}
            </p>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFlipTokens}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOKENS).map(([key, token]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    disabled={key === fromToken}
                  >
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="bg-secondary/50 border border-border/50 rounded-md p-3">
              <p className="text-sm text-muted-foreground">
                Estimated: ~{amount || "0"} {toToken}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {balances[toToken] || "0"} {toToken}
            </p>
          </div>

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={isLoading || !amount || fromToken === toToken}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap"
            )}
          </Button>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 1% slippage tolerance</p>
            <p>• 0.05% swap fee</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
