import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { StatsCard } from "@/components/StatsCard";
import { StrategyCard } from "@/components/StrategyCard";
import { PositionCard } from "@/components/PositionCard";
import { DepositModal } from "@/components/DepositModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Wallet, DollarSign, Layers, ArrowLeftRight, BrickWall } from "lucide-react";
import { ethers } from "ethers";
import { toast } from "sonner";
import {
  usePushWalletContext,
  usePushChainClient,
  PushUI,
} from "@pushchain/ui-kit";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { Button } from "@/components/ui/button";

// ADD THESE TWO NEW IMPORTS below them:
import { SwapModal } from "@/components/SwapModal";
import { BridgeModal } from "@/components/BridgeModal";
import { usePushChain } from "@pushchain/ui-kit"; // ✅ Add this import


const Index = () => {
  const { connectionStatus, universalAccount } = usePushWalletContext();
  const account = universalAccount?.address;
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain(); // ✅ Add this
  const isConnected =
    connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const [strategies, setStrategies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [totalTVL, setTotalTVL] = useState("0");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  // ADD THESE TWO LINES right after:
const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (universalAccount) {
      console.log("=== WALLET DEBUG ===");
      console.log("Chain:", universalAccount.chain);
      console.log("Address:", universalAccount.address);
      console.log("Is EVM?", universalAccount.chain?.startsWith("eip155"));
      console.log("Is Solana?", universalAccount.chain?.startsWith("solana"));
    }
  }, [universalAccount]);

  const PUSH_CHAIN_RPC = "https://evm.rpc-testnet-donut-node1.push.org/";

  const getProvider = () => {
    return new ethers.JsonRpcProvider(PUSH_CHAIN_RPC);
  };

  const fetchStrategies = async () => {
    if (!account) return;

    try {
      setIsLoading(true);

      const provider = getProvider();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const count = await contract.strategyCount();
      const strategiesData = [];

      // ✅ FIX: Start from 0, not 1
      for (let i = 0n; i < count; i++) {
        // Changed from: i = 1n; i <= count
        const strategy = await contract.getStrategy(i);
        strategiesData.push(strategy);
      }

      setStrategies(strategiesData);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      toast.error("Failed to load strategies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    if (!account || !universalAccount) return;

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      let targetAddress = account;
      
      // ✅ Use PushChain SDK to get UEA
      const chainInfo = universalAccount.chain || '';
      const [namespace, chainId] = chainInfo.split(':');
      
      console.log("Connected chain:", { namespace, chainId, fullChain: chainInfo });
      
      const isPushChainDirect = chainId === '111557560';
      
      if (isPushChainDirect) {
        targetAddress = account;
        console.log("✅ On PushChain directly, using address:", targetAddress);
      } else {
        console.log("🔍 On external chain, getting UEA...");
        
        // Check cache first
        const cacheKey = `uea_${chainInfo}_${account}`;
        const cachedUEA = localStorage.getItem(cacheKey);
        
        if (cachedUEA) {
          targetAddress = cachedUEA;
          console.log("✅ Using cached UEA:", targetAddress);
        } else {
          try {
            // ✅ Use PushChain SDK
            const universalAccountObj = {
              chain: universalAccount.chain,
              address: account
            };

            const executorInfo = await PushChain.utils.account.convertOriginToExecutor(
              universalAccountObj,
              { onlyCompute: false }
            );

            targetAddress = executorInfo.address;
            console.log(`✅ Found UEA ${targetAddress} for ${chainInfo}`);
            console.log("Is deployed:", executorInfo.exists);
            
            // Cache it
            localStorage.setItem(cacheKey, targetAddress);
            
            if (!executorInfo.exists) {
              console.warn("⚠️ UEA not deployed yet. Make a deposit first!");
            }
          } catch (error) {
            console.error("Error getting UEA:", error);
            // Fallback to old method
            const positionCount = await contract.positionCount();
            
            for (let i = 0; i < Number(positionCount); i++) {
              try {
                const position = await contract.getPosition(i);
                const posOriginChain = `${position.originChainNamespace}:${position.originChainId}`;
                
                if (posOriginChain === chainInfo) {
                  const originOwnerHex = ethers.hexlify(position.originOwner).toLowerCase();
                  const accountClean = account.toLowerCase().replace('0x', '');
                  
                  if (originOwnerHex.includes(accountClean)) {
                    targetAddress = position.user;
                    localStorage.setItem(cacheKey, targetAddress);
                    console.log(`✅ Found UEA via fallback: ${targetAddress}`);
                    break;
                  }
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
      }
      
      console.log("📍 Final target address:", targetAddress);
      
      // Fetch positions
      const positionCount = await contract.positionCount();
      const positionsData = [];

      for (let i = 0; i < Number(positionCount); i++) {
        const position = await contract.getPosition(i);
        
        if (position.user.toLowerCase() === targetAddress.toLowerCase()) {
          positionsData.push(position);
          console.log(`✅ Position ${i} belongs to current user`);
        }
      }

      console.log(`📊 Total positions: ${positionsData.length}`);
      setPositions(positionsData);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const debugAllPositions = async () => {
  if (!account) return;
  
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const positionCount = await contract.positionCount();
    console.log("=== ALL POSITIONS IN CONTRACT ===");
    console.log("Currently connected:", {
      address: account,
      chain: universalAccount?.chain
    });
    
    for (let i = 0; i < Number(positionCount); i++) {
      try {
        const position = await contract.getPosition(i);
        
        // ✅ Safely handle originChainId decoding errors
        let originInfo = "N/A";
        try {
          originInfo = `${position.originChainNamespace}:${position.originChainId}`;
        } catch (e) {
          originInfo = `${position.originChainNamespace}:[decode error]`;
        }
        
        console.log(`Position ${i}:`, {
          user: position.user,
          amount: ethers.formatEther(position.depositedAmount),
          strategyId: position.strategyId.toString(),
          origin: originInfo,
          isActive: position.isActive
        });
      } catch (error) {
        console.error(`Error reading position ${i}:`, error);
      }
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
};

  // Call this in useEffect
  useEffect(() => {
    if (account) {
      fetchStrategies();
      fetchTotalTVL();
      debugAllPositions(); // ✅ ADD THIS
    }
  }, [account]);

  const fetchTotalTVL = async () => {
    if (!account) return;

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const tvl = await contract.totalPlatformTVL();
      setTotalTVL(ethers.formatEther(tvl));
    } catch (error) {
      console.error("Error fetching TVL:", error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchStrategies();
      fetchTotalTVL();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchPositions();
    }
  }, [account]);

  const handleDeposit = (strategyId: number) => {
    setSelectedStrategyId(strategyId);
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = async (positionId: number) => {
  if (!account) return;

  try {
    const position = positions.find(
      (p) => Number(p.positionId) === positionId
    );

    if (!position) {
      toast.error("Position not found");
      return;
    }

    const contractInterface = new ethers.Interface(CONTRACT_ABI);
    const data = contractInterface.encodeFunctionData("withdraw", [
      BigInt(positionId),
      BigInt(position.depositedAmount),
    ]);

    const tx = await pushChainClient.universal.sendTransaction({
      to: CONTRACT_ADDRESS,
      data,
    });

    toast.success("Withdrawal submitted!");
    await tx.wait();
    toast.success("Withdrawal successful!");
    fetchPositions();
    fetchTotalTVL();
  } catch (error: any) {
    console.error("Withdraw error:", error);
    toast.error(error.message || "Withdrawal failed");
  }
};

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary" />
            <h1 className="text-2xl font-bold gradient-text">
              DeFi Aggregator
            </h1>
          </div>
          <div className="flex items-center gap-2">
  <Button
    variant="outline"
    onClick={() => setIsSwapModalOpen(true)}
    className="glass-card hidden sm:flex"
    size="sm"
  >
    <ArrowLeftRight className="mr-2 h-4 w-4" />
    Swap
  </Button>
  <Button
    variant="outline"
    onClick={() => setIsBridgeModalOpen(true)}
    className="glass-card hidden sm:flex"
    size="sm"
  >
    <BrickWall className="mr-2 h-4 w-4" />
    Bridge
  </Button>
  <WalletConnect />
</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold gradient-text">
            Maximize Your Yield
          </h2>
          <p className="text-xl text-muted-foreground">
            Cross-chain DeFi strategies powered by Push Chain
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <StatsCard
            title="Total Value Locked"
            value={`$${parseFloat(totalTVL).toFixed(2)}`}
            icon={DollarSign}
            trend="+12.5% this week"
          />
          <StatsCard
            title="Active Strategies"
            value={strategies.filter((s) => s.isActive).length.toString()}
            icon={Layers}
          />
          <StatsCard
            title="Your Positions"
            value={positions.filter((p) => p.isActive).length.toString()}
            icon={Wallet}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger
              value="strategies"
              className="data-[state=active]:bg-primary/20"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Strategies
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="data-[state=active]:bg-primary/20"
            >
              <Wallet className="mr-2 h-4 w-4" />
              My Positions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-12 glass-card rounded-lg p-8">
                <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to view and deposit into yield strategies
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading strategies...</p>
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-lg p-8">
                <p className="text-muted-foreground">
                  No strategies available at the moment
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {strategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.strategyId.toString()}
                    strategy={strategy}
                    onDeposit={handleDeposit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Connect your wallet to view positions
                </p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No positions yet. Start by depositing into a strategy!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positions.map((position) => (
                  <PositionCard
                    key={position.positionId.toString()}
                    position={position}
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedStrategyId(null);
        }}
        strategyId={selectedStrategyId}
        onSuccess={() => {
          // ✅ Refresh positions and TVL after successful deposit
          fetchPositions();
          fetchTotalTVL();
        }}
      />
      {/* ADD THESE TWO NEW MODALS HERE */}
      <SwapModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
      />

      <BridgeModal 
        isOpen={isBridgeModalOpen} 
        onClose={() => setIsBridgeModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
