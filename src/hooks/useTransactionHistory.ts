import { useState, useEffect, useMemo } from "react";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import { formatEther, formatUnits } from "viem";
import type {
  Transaction,
  TransactionSummary,
  TransactionFilter,
  TransactionPagination,
  TransactionType,
  TransactionStatus,
} from "../types/transaction";
import { getContractAddress, getNetworkName } from "../config/tokenSwap";

// TokenSwap合约的事件ABI
const TOKEN_SWAP_EVENTS = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "TokensSold",
    type: "event",
  },
] as const;

export function useTransactionHistory(filter?: TransactionFilter) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TransactionPagination>({
    page: 1,
    limit: 20,
    total: 0,
  });

  // 获取合约地址
  const contractAddress = useMemo(() => {
    try {
      return getContractAddress(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  // 获取交易历史
  const fetchTransactionHistory = async () => {
    if (!address || !publicClient || !contractAddress) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔍 开始获取交易历史...", {
        userAddress: address,
        contractAddress,
        chainId,
        networkName: getNetworkName(chainId),
      });

      // 获取最新区块号
      const latestBlock = await publicClient.getBlockNumber();
      // 只查最近 8000 个区块
      const fromBlock = latestBlock > 8000n ? latestBlock - 8000n : 0n;
      const toBlock = "latest" as const;

      // 获取购买代币事件
      const purchaseEvents = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          name: "TokensPurchased",
          type: "event",
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "buyer",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "ethAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "tokenAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
          ],
        },
        args: {
          buyer: address,
        },
        fromBlock,
        toBlock,
      });

      // 获取出售代币事件
      const sellEvents = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          name: "TokensSold",
          type: "event",
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "seller",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "tokenAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "ethAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
          ],
        },
        args: {
          seller: address,
        },
        fromBlock,
        toBlock,
      });

      console.log("📊 获取到事件:", {
        购买事件: purchaseEvents.length,
        出售事件: sellEvents.length,
      });

      // 处理购买事件
      const purchaseTransactions: Transaction[] = await Promise.all(
        purchaseEvents.map(async (event) => {
          const block = await publicClient.getBlock({
            blockHash: event.blockHash,
          });
          const transaction = await publicClient.getTransaction({
            hash: event.transactionHash,
          });

          return {
            id: `${event.transactionHash}-${event.logIndex}`,
            hash: event.transactionHash,
            timestamp: Number(block.timestamp) * 1000,
            blockNumber: Number(event.blockNumber),
            type: "buy_tokens" as const,
            status: "success" as const,
            ethAmount: formatEther(event.args.ethAmount || 0n),
            tokenAmount: formatUnits(event.args.tokenAmount || 0n, 18),
            from: address,
            to: contractAddress,
            direction: "out" as const, // ETH流出
            description: `购买一灯币`,
            fee: formatUnits(event.args.fee || 0n, 18),
            networkName: getNetworkName(chainId),
            chainId,
          };
        })
      );

      // 处理出售事件
      const sellTransactions: Transaction[] = await Promise.all(
        sellEvents.map(async (event) => {
          const block = await publicClient.getBlock({
            blockHash: event.blockHash,
          });
          const transaction = await publicClient.getTransaction({
            hash: event.transactionHash,
          });

          return {
            id: `${event.transactionHash}-${event.logIndex}`,
            hash: event.transactionHash,
            timestamp: Number(block.timestamp) * 1000,
            blockNumber: Number(event.blockNumber),
            type: "sell_tokens" as const,
            status: "success" as const,
            ethAmount: formatEther(event.args.ethAmount || 0n),
            tokenAmount: formatUnits(event.args.tokenAmount || 0n, 18),
            from: contractAddress,
            to: address,
            direction: "in" as const, // ETH流入
            description: `出售一灯币`,
            fee: formatUnits(event.args.fee || 0n, 18),
            networkName: getNetworkName(chainId),
            chainId,
          };
        })
      );

      // 合并并按时间排序
      const allTransactions = [
        ...purchaseTransactions,
        ...sellTransactions,
      ].sort((a, b) => b.timestamp - a.timestamp);

      console.log("✅ 交易历史处理完成:", {
        总交易数: allTransactions.length,
        购买交易: purchaseTransactions.length,
        出售交易: sellTransactions.length,
      });

      // 应用过滤器
      const filteredTransactions = applyFilters(allTransactions, filter);

      setTransactions(filteredTransactions);
      setPagination((prev) => ({
        ...prev,
        total: filteredTransactions.length,
      }));
    } catch (err: any) {
      console.error("❌ 获取交易历史失败:", err);
      setError(err.message || "获取交易历史失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 应用过滤器
  const applyFilters = (
    transactions: Transaction[],
    filter?: TransactionFilter
  ): Transaction[] => {
    if (!filter) return transactions;

    return transactions.filter((tx) => {
      // 类型过滤
      if (
        filter.type &&
        filter.type.length > 0 &&
        !filter.type.includes(tx.type)
      ) {
        return false;
      }

      // 状态过滤
      if (
        filter.status &&
        filter.status.length > 0 &&
        !filter.status.includes(tx.status)
      ) {
        return false;
      }

      // 时间范围过滤
      if (filter.timeRange) {
        if (
          tx.timestamp < filter.timeRange.start ||
          tx.timestamp > filter.timeRange.end
        ) {
          return false;
        }
      }

      // 金额过滤
      if (filter.minAmount && tx.ethAmount) {
        if (parseFloat(tx.ethAmount) < parseFloat(filter.minAmount)) {
          return false;
        }
      }
      if (filter.maxAmount && tx.ethAmount) {
        if (parseFloat(tx.ethAmount) > parseFloat(filter.maxAmount)) {
          return false;
        }
      }

      return true;
    });
  };

  // 计算交易统计
  const transactionSummary: TransactionSummary = useMemo(() => {
    const buyTxs = transactions.filter((tx) => tx.type === "buy_tokens");
    const sellTxs = transactions.filter((tx) => tx.type === "sell_tokens");
    const courseTxs = transactions.filter(
      (tx) => tx.type === "course_purchase" || tx.type === "course_sale"
    );

    const totalVolumeETH = transactions
      .reduce(
        (sum, tx) => sum + (tx.ethAmount ? parseFloat(tx.ethAmount) : 0),
        0
      )
      .toFixed(6);

    const totalVolumeTokens = transactions
      .reduce(
        (sum, tx) => sum + (tx.tokenAmount ? parseFloat(tx.tokenAmount) : 0),
        0
      )
      .toFixed(2);

    const totalFees = transactions
      .reduce((sum, tx) => sum + (tx.fee ? parseFloat(tx.fee) : 0), 0)
      .toFixed(6);

    const lastTransaction = transactions[0];

    return {
      totalTransactions: transactions.length,
      totalVolumeETH,
      totalVolumeTokens,
      totalFees,
      buyTransactions: buyTxs.length,
      sellTransactions: sellTxs.length,
      courseTransactions: courseTxs.length,
      lastTransactionTime: lastTransaction?.timestamp,
    };
  }, [transactions]);

  // 分页后的交易
  const paginatedTransactions = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return transactions.slice(startIndex, endIndex);
  }, [transactions, pagination.page, pagination.limit]);

  // 自动获取数据
  useEffect(() => {
    if (address && publicClient && contractAddress) {
      fetchTransactionHistory();
    }
  }, [address, publicClient, contractAddress, filter]);

  // 翻页函数
  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.page * pagination.limit < pagination.total) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  };

  return {
    transactions: paginatedTransactions,
    allTransactions: transactions,
    summary: transactionSummary,
    isLoading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    refresh: fetchTransactionHistory,
  };
}
