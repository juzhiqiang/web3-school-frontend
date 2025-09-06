import { useEffect, useState, useCallback } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatUnits, getContract } from 'viem';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';
import { YIDENG_TOKEN_CONFIG } from '../config/yidengToken';

interface RewardEvent {
  instructor: string;
  uuid: string;
  rewardAmount: string;
  transactionHash: string;
  blockNumber: number;
  timestamp?: number;
}

export const useRewardTracking = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [recentRewards, setRecentRewards] = useState<RewardEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 查询历史奖励事件
  const fetchRecentRewardEvents = useCallback(async () => {
    if (!publicClient || !isConnected) return;

    try {
      setIsLoadingHistory(true);

      // 查询最近500个区块的事件（增加范围以确保能找到事件）
      const currentBlock = await publicClient.getBlockNumber();
      // 确保fromBlock不为负数
      const fromBlock = currentBlock > BigInt(500) ? currentBlock - BigInt(500) : BigInt(0);

      console.log(`📊 查询区块范围: ${fromBlock} -> ${currentBlock}`);

      // 使用合约ABI定义的事件结构
      const coursePublishRewardEvent = COURSE_CONTRACT_CONFIG.CONTRACT_ABI.find(
        (item) => item.type === 'event' && item.name === 'CoursePublishReward'
      );

      if (!coursePublishRewardEvent) {
        console.error('❌ 未找到 CoursePublishReward 事件定义');
        return;
      }

      const logs = await publicClient.getLogs({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        event: coursePublishRewardEvent,
        fromBlock,
        toBlock: 'latest',
      });

      console.log(`📊 找到 ${logs.length} 个历史奖励事件`);
      
      if (logs.length > 0) {
        console.log('🔍 事件详情:', logs);
      }

      const rewardEvents = logs.map((log, index) => {
        console.log(`处理第 ${index + 1} 个事件:`, {
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          args: log.args
        });

        const { instructor, uuid, rewardAmount } = log.args as {
          instructor: string;
          uuid: string;
          rewardAmount: any; // wagmi 已处理过的值
        };

        return {
          instructor,
          uuid,
          rewardAmount: rewardAmount?.toString() || '0',
          transactionHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          timestamp: Date.now() - (Number(currentBlock - log.blockNumber) * 12000), // 估算时间戳
        };
      });

      // 按区块号排序，最新的在前
      rewardEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      setRecentRewards(rewardEvents.slice(0, 10)); // 保留最近10条

    } catch (error) {
      // 错误处理
    } finally {
      setIsLoadingHistory(false);
    }
  }, [publicClient, isConnected]);

  // 监听课程发布奖励事件（新事件）
  useWatchContractEvent({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    eventName: 'CoursePublishReward',
    query: { enabled: isConnected },
    onLogs(logs) {
      
      logs.forEach((log, index) => {

        if (log.args) {
          const { instructor, uuid, rewardAmount } = log.args as {
            instructor: string;
            uuid: string;
            rewardAmount: any; // wagmi 已处理过的值
          };
          
          const newRewardEvent: RewardEvent = {
            instructor,
            uuid,
            rewardAmount: rewardAmount?.toString() || '0',
            transactionHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
            timestamp: Date.now(),
          };
          
          // 检查是否已存在（避免重复）
          setRecentRewards(prev => {
            const exists = prev.some(reward => 
              reward.transactionHash === log.transactionHash &&
              reward.uuid === uuid
            );
            
            if (exists) {
              console.log('⚠️ 奖励事件已存在，跳过重复添加');
              return prev;
            }
            
            console.log('✅ 添加新的奖励事件到列表');
            const updatedRewards = [newRewardEvent, ...prev.slice(0, 9)]; // 保留最近10条
            console.log('📋 更新后的奖励列表:', updatedRewards);
            return updatedRewards;
          });
          
          // 如果是当前用户的奖励，可以在这里显示通知
          // if (instructor.toLowerCase() === address?.toLowerCase()) {
          //   显示成功通知
          // }
        // 事件参数为空
        }
      });
    },
    onError(error) {
      // 事件监听错误处理
    }
  });

  // 查询一灯币合约地址
  const { data: ydTokenAddress } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'ydToken',
    query: { enabled: isConnected },
  });

  // 检查课程合约是否有足够的一灯币余额
  const { data: contractTokenBalance } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getContractTokenBalance',
    query: { enabled: isConnected },
  });

  useEffect(() => {
    if (isConnected) {
      setIsListening(true);
      
      // 查询历史事件
      fetchRecentRewardEvents();
    } else {
      setIsListening(false);
      setRecentRewards([]);
    }
  }, [isConnected, fetchRecentRewardEvents]);

  return {
    recentRewards,
    isListening,
    isLoadingHistory,
    fetchRecentRewardEvents, // 暴露手动刷新功能
    ydTokenAddress: ydTokenAddress as string | undefined,
    contractTokenBalance: contractTokenBalance ? formatUnits(contractTokenBalance as bigint, YIDENG_TOKEN_CONFIG.TOKEN_DECIMALS) : '0',
  };
};