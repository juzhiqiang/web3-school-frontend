import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { formatEther } from 'viem';
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
  const [recentRewards, setRecentRewards] = useState<RewardEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  // 监听课程发布奖励事件
  useWatchContractEvent({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    eventName: 'CoursePublishReward',
    enabled: isConnected,
    onLogs(logs) {
      console.log('📢 检测到课程发布奖励事件:', logs);
      
      logs.forEach((log) => {
        if (log.args) {
          const { instructor, uuid, rewardAmount } = log.args as {
            instructor: string;
            uuid: string;
            rewardAmount: bigint;
          };
          
          const rewardEvent: RewardEvent = {
            instructor,
            uuid,
            rewardAmount: formatEther(rewardAmount),
            transactionHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
            timestamp: Date.now(),
          };
          
          setRecentRewards(prev => [rewardEvent, ...prev.slice(0, 9)]); // 保留最近10条
          
          // 如果是当前用户的奖励，显示通知
          if (instructor.toLowerCase() === address?.toLowerCase()) {
            console.log(`🎉 恭喜！您获得了 ${formatEther(rewardAmount)} 一灯币课程发布奖励！`);
          }
        }
      });
    },
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
    } else {
      setIsListening(false);
      setRecentRewards([]);
    }
  }, [isConnected]);

  return {
    recentRewards,
    isListening,
    ydTokenAddress: ydTokenAddress as string | undefined,
    contractTokenBalance: contractTokenBalance ? formatEther(contractTokenBalance as bigint) : '0',
  };
};