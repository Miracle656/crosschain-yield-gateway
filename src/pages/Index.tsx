import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { StatsCard } from '@/components/StatsCard';
import { StrategyCard } from '@/components/StrategyCard';
import { PositionCard } from '@/components/PositionCard';
import { DepositModal } from '@/components/DepositModal';
import { useWeb3 } from '@/hooks/useWeb3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Wallet, DollarSign, Layers } from 'lucide-react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

const Index = () => {
  const { contract, account, isConnected } = useWeb3();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [totalTVL, setTotalTVL] = useState('0');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStrategies = async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const count = await contract.strategyCount();
      const strategiesData = [];
      
      for (let i = 1n; i <= count; i++) {
        const strategy = await contract.getStrategy(i);
        strategiesData.push(strategy);
      }
      
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast.error('Failed to load strategies');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    if (!contract || !account) return;
    
    try {
      const positionIds = await contract.getUserPositions(account);
      const positionsData = [];
      
      for (const id of positionIds) {
        const position = await contract.getPosition(id);
        positionsData.push(position);
      }
      
      setPositions(positionsData);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchTotalTVL = async () => {
    if (!contract) return;
    
    try {
      const tvl = await contract.totalPlatformTVL();
      setTotalTVL(ethers.formatEther(tvl));
    } catch (error) {
      console.error('Error fetching TVL:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchStrategies();
      fetchTotalTVL();
    }
  }, [contract]);

  useEffect(() => {
    if (contract && account) {
      fetchPositions();
    }
  }, [contract, account]);

  const handleDeposit = (strategyId: number) => {
    setSelectedStrategyId(strategyId);
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = async (positionId: number) => {
    if (!contract) return;
    
    try {
      const position = positions.find(p => Number(p.positionId) === positionId);
      if (!position) return;
      
      const tx = await contract.withdraw(positionId, position.depositedAmount);
      toast.success('Withdrawal submitted!');
      await tx.wait();
      toast.success('Withdrawal successful!');
      fetchPositions();
      fetchTotalTVL();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.error(error.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary" />
            <h1 className="text-2xl font-bold gradient-text">DeFi Aggregator</h1>
          </div>
          <WalletConnect />
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
            value={strategies.filter(s => s.isActive).length.toString()}
            icon={Layers}
          />
          <StatsCard
            title="Your Positions"
            value={positions.filter(p => p.isActive).length.toString()}
            icon={Wallet}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="strategies" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="mr-2 h-4 w-4" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="positions" className="data-[state=active]:bg-primary/20">
              <Wallet className="mr-2 h-4 w-4" />
              My Positions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading strategies...</p>
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No strategies available</p>
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
                <p className="text-muted-foreground">Connect your wallet to view positions</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No positions yet. Start by depositing into a strategy!</p>
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
      />
    </div>
  );
};

export default Index;
