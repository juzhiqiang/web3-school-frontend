import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { TOKEN_SWAP_CONFIG } from '../config/tokenSwap';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';

export interface TransactionRecord {
  hash: string;
  type: string;
  status: string;
  amount: string;
  token: string;
  timestamp: number;
  description: string;
  blockNumber?: number;
}

export interface UseTransactionHistoryResult {
  transactions: TransactionRecord[];
  isLoading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
  getTransactionDetails: (hash: string) => Promise<TransactionRecord | null>;
}

export const useTransactionHistory = (): UseTransactionHistoryResult => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取交易历史
  const refreshHistory = useCallback(async () => {
    if (!address || !publicClient) {
      setTransactions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const allTransactions: TransactionRecord[] = [];
      
      // 获取代币兑换交易
      try {
        const swapLogs = await publicClient.getLogs({
          address: TOKEN_SWAP_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
          fromBlock: 'earliest',
          toBlock: 'latest',
        });
        
        for (const log of swapLogs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            
            allTransactions.push({
              hash: log.transactionHash,
              type: '代币兑换',
              status: '成功',
              amount: '0', // 需要解析具体金额
              token: 'YD',
              timestamp: Number(block.timestamp) * 1000,
              description: '代币兑换交易',
              blockNumber: Number(log.blockNumber),
            });
          } catch (logError) {
            console.warn('处理兑换日志失败:', logError);
          }
        }
      } catch (swapError) {
        console.warn('获取兑换交易失败:', swapError);
      }
      
      // 获取课程购买交易
      try {
        const courseLogs = await publicClient.getLogs({
          address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
          fromBlock: 'earliest',
          toBlock: 'latest',
        });
        
        for (const log of courseLogs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            
            allTransactions.push({
              hash: log.transactionHash,
              type: '课程购买',
              status: '成功',
              amount: '0', // 需要解析具体金额
              token: 'YD',
              timestamp: Number(block.timestamp) * 1000,
              description: '课程购买交易',
              blockNumber: Number(log.blockNumber),
            });
          } catch (logError) {
            console.warn('处理课程日志失败:', logError);
          }
        }
      } catch (courseError) {
        console.warn('获取课程交易失败:', courseError);
      }
      
      // 按时间戳降序排序
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);
      
    } catch (err: any) {
      console.error('获取交易历史失败:', err);
      const errorMessage = err?.message || '获取交易历史失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  // 获取单个交易详情
  const getTransactionDetails = useCallback(async (hash: string): Promise<TransactionRecord | null> => {
    if (!publicClient) return null;
    
    try {
      const transaction = await publicClient.getTransaction({ hash: hash as `0x${string}` });
      const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
      
      if (!transaction || !receipt) return null;
      
      const block = await publicClient.getBlock({ blockNumber: transaction.blockNumber! });
      
      return {
        hash: transaction.hash,
        type: '未知',
        status: receipt.status === 'success' ? '成功' : '失败',
        amount: formatEther(transaction.value),
        token: 'ETH',
        timestamp: Number(block.timestamp) * 1000,
        description: '交易详情',
        blockNumber: Number(transaction.blockNumber),
      };
    } catch (error) {
      console.error('获取交易详情失败:', error);
      return null;
    }
  }, [publicClient]);

  // 监听地址变化
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    transactions,
    isLoading,
    error,
    refreshHistory,
    getTransactionDetails,
  };
};

export default useTransactionHistory;
