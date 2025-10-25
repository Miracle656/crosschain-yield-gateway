import { usePushWalletContext, usePushChainClient, usePushChain, PushUI } from '@pushchain/ui-kit';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

interface Strategy {
  strategyId: number;
  protocolName: string;
  sourceChain: string;
  prc20Token: string;
  apy: number;
  tvl: number;
  minDeposit: number;
  isActive: boolean;
}

interface ChainData {
  chainHash: string;
  count: number;
  uniqueCount: number;
}

export const YieldStrategies = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [totalTVL, setTotalTVL] = useState("0");
  const [txHash, setTxHash] = useState("");

  const fetchStrategies = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const strategyCount = await contract.strategyCount();
      const strategyPromises = [];
      
      for(let i = 0; i < Number(strategyCount); i++) {
        strategyPromises.push(contract.getStrategy(i));
      }
      
      const results = await Promise.all(strategyPromises);
      setStrategies(results.map(strategy => ({
        strategyId: Number(strategy.strategyId),
        protocolName: strategy.protocolName,
        sourceChain: strategy.sourceChain,
        prc20Token: strategy.prc20Token,
        apy: Number(strategy.apy),
        tvl: Number(strategy.tvl),
        minDeposit: Number(strategy.minDeposit),
        isActive: strategy.isActive
      })));

      // Also fetch TVL and other platform stats
      const tvl = await contract.totalPlatformTVL();
      setTotalTVL(ethers.formatEther(tvl));
      
    } catch (err) {
      console.error("Error fetching strategies:", err);
    }
  };

  const handleDeposit = async (strategyId: number, amount: string) => {
    if (!pushChainClient) return;
    
    setLoading(true);
    try {
      const txData = {
        to: CONTRACT_ADDRESS as `0x${string}`,
        data: pushChainClient.utils.helpers.encodeTxData({
          abi: CONTRACT_ABI,
          functionName: "deposit",
          args: [strategyId, ethers.parseEther(amount)]
        }),
        value: BigInt(0)
      };

      const tx = await pushChainClient.universal.sendTransaction(txData);
      setTxHash(tx.hash);
      await tx.wait();
      await fetchStrategies();
    } catch (err) {
      console.error("Deposit error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-pink-500 mb-6">Yield Strategies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <div 
            key={strategy.strategyId} 
            className="bg-white rounded-lg shadow-md p-6 border border-pink-100"
          >
            <h3 className="text-xl font-semibold text-pink-600 mb-2">
              {strategy.protocolName}
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>Chain: {strategy.sourceChain}</p>
              <p>APY: {strategy.apy}%</p>
              <p>TVL: {ethers.formatEther(strategy.tvl)} ETH</p>
              <p>Min Deposit: {ethers.formatEther(strategy.minDeposit)} ETH</p>
            </div>
            {connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Amount (ETH)"
                  className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <button
                  onClick={() => handleDeposit(strategy.strategyId, depositAmount)}
                  disabled={loading}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};