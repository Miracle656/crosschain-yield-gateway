import { PushUniversalAccountButton, usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export const WalletConnect = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const handleTransaction = async (functionName: string, args: any[] = []) => {
    if (pushChainClient) {
      try {
        setIsLoading(true);
        const tx = await pushChainClient.universal.sendTransaction({
          to: CONTRACT_ADDRESS,
          data: ethers.utils.defaultAbiCoder.encode(
            CONTRACT_ABI.find(item => item.name === functionName)?.inputs || [],
            args
          ),
          value: BigInt(0),
        });

        setTxHash(tx.hash);
        await tx.wait();
        setIsLoading(false);
        return tx;
      } catch (err) {
        console.error("Transaction error:", err);
        setIsLoading(false);
        throw err;
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <PushUniversalAccountButton />
      {txHash && pushChainClient && (
        <div className="text-sm text-pink-500">
          <a
            href={pushChainClient.explorer.getTransactionUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View Transaction
          </a>
        </div>
      )}
    </div>
  );
};
