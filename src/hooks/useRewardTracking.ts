import { useEffect, useState, useCallback } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther, getContract } from 'viem';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';

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
      console.log('🔍 查询最近的奖励事件...');

      // 查询最近500个区块的事件（增加范围以确保能找到事件）
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - BigInt(500);

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
          rewardAmount: bigint;
        };

        return {
          instructor,
          uuid,
          rewardAmount: formatEther(rewardAmount),
          transactionHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          timestamp: Date.now() - (Number(currentBlock - log.blockNumber) * 12000), // 估算时间戳
        };
      });

      // 按区块号排序，最新的在前
      rewardEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      setRecentRewards(rewardEvents.slice(0, 10)); // 保留最近10条
      
      console.log(`✅ 成功加载 ${rewardEvents.length} 个奖励事件`);

    } catch (error) {
      console.error('❌ 查询历史奖励事件失败:', error);
      console.error('错误详情:', {
        name: error?.name,
        message: error?.message,
        cause: error?.cause
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [publicClient, isConnected]);

  // 监听课程发布奖励事件（新事件）
  useWatchContractEvent({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    eventName: 'CoursePublishReward',
    enabled: isConnected,
    onLogs(logs) {
      console.log('📢 检测到新的课程发布奖励事件:', logs);
      
      logs.forEach((log, index) => {
        console.log(`处理新事件 ${index + 1}:`, {
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          args: log.args
        });

        if (log.args) {
          const { instructor, uuid, rewardAmount } = log.args as {
            instructor: string;
            uuid: string;
            rewardAmount: bigint;
          };
          
          console.log('事件参数解析:', {
            instructor,
            uuid,
            rewardAmount: rewardAmount.toString(),
            formattedAmount: formatEther(rewardAmount)
          });
          
          const newRewardEvent: RewardEvent = {
            instructor,
            uuid,
            rewardAmount: formatEther(rewardAmount),
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
          
          // 如果是当前用户的奖励，显示通知
          if (instructor.toLowerCase() === address?.toLowerCase()) {
            console.log(`🎉 恭喜！您获得了 ${formatEther(rewardAmount)} 一灯币课程发布奖励！`);
          }
        } else {
          console.warn('⚠️ 事件参数为空:', log);
        }
      });
    },
    onError(error) {
      console.error('❌ 事件监听出错:', error);
    }
  });

  // 查询一灯币合约地址
  const { data: ydTokenAddress } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'ydToken',
    enabled: isConnected,
  });

  // 检查课程合约是否有足够的一灯币余额
  const { data: contractTokenBalance } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getContractTokenBalance',
    enabled: isConnected,
  });

  useEffect(() => {
    if (isConnected) {
      setIsListening(true);
      console.log('🎯 开始监听课程奖励事件...');
      
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
    contractTokenBalance: contractTokenBalance ? formatEther(contractTokenBalance as bigint) : '0',
  };
};