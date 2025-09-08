import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';

// 链上奖励记录接口
export interface OnChainRewardRecord {
  id: string;
  userAddress: string;
  type: 'create_course' | 'complete_course';
  amount: string; // 奖励金额（一灯币）
  description: string;
  courseId?: string;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: Date;
  claimed: boolean;
}

// 奖励统计接口
export interface RewardStats {
  totalRewards: number;
  totalAmount: string;
  createCourseRewards: number;
  completeCourseRewards: number;
  createCourseAmount: string;
  completeCourseAmount: string;
}

export const useOnChainRewards = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [rewards, setRewards] = useState<OnChainRewardRecord[]>([]);
  const [stats, setStats] = useState<RewardStats>({
    totalRewards: 0,
    totalAmount: '0',
    createCourseRewards: 0,
    completeCourseRewards: 0,
    createCourseAmount: '0',
    completeCourseAmount: '0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchRewards = async () => {
    if (!address || !publicClient) return;

    try {
      setLoading(true);
      setError(null);

      const contractAddress = COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`;
      const allRewards: OnChainRewardRecord[] = [];
      // 获取创建课程奖励事件 (CoursePublishReward)
      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock = latestBlock - 8000n
      try {
        const createCourseRewardLogs = await publicClient.getLogs({
          address: contractAddress,
          event: {
            type: 'event',
            name: 'CoursePublishReward',
            inputs: [
              { type: 'address', name: 'instructor', indexed: true },
              { type: 'string', name: 'uuid', indexed: true },
              { type: 'uint256', name: 'rewardAmount', indexed: false }
            ]
          },
          args: {
            instructor: address
          },
          fromBlock: fromBlock,
          toBlock: 'latest'
        });

        for (const log of createCourseRewardLogs) {
          const { instructor, uuid, rewardAmount } = log.args;
          
          // 获取区块信息以获取时间戳
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          allRewards.push({
            id: `${log.transactionHash}-${log.logIndex}`,
            userAddress: instructor as string,
            type: 'create_course',
            amount: rewardAmount?.toString() || '0',
            description: `创建课程奖励 - 课程ID: ${(uuid as string).slice(0, 8)}...`,
            courseId: uuid as string,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date(Number(block.timestamp) * 1000),
            claimed: true, // 链上事件表示已经发放
          });
        }
      } catch (err) {
        console.warn('获取创建课程奖励失败:', err);
      }

      // 获取完成课程奖励事件 (CourseCompleted)
      try {
        const completeCourseRewardLogs = await publicClient.getLogs({
          address: contractAddress,
          event: {
            type: 'event',
            name: 'CourseCompleted',
            inputs: [
              { type: 'address', name: 'student', indexed: true },
              { type: 'string', name: 'courseId', indexed: true },
              { type: 'uint256', name: 'rewardAmount', indexed: false }
            ]
          },
          args: {
            student: address
          },
          fromBlock: 0n,
          toBlock: 'latest'
        });

        for (const log of completeCourseRewardLogs) {
          const { student, courseId, rewardAmount } = log.args;
          
          // 获取区块信息以获取时间戳
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          allRewards.push({
            id: `${log.transactionHash}-${log.logIndex}`,
            userAddress: student as string,
            type: 'complete_course',
            amount: rewardAmount?.toString() || '0',
            description: `完成课程奖励 - 课程ID: ${(courseId as string).slice(0, 8)}...`,
            courseId: courseId as string,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date(Number(block.timestamp) * 1000),
            claimed: true, // 链上事件表示已经发放
          });
        }
      } catch (err) {
        console.warn('获取完成课程奖励失败:', err);
      }

      // 按时间倒序排序
      allRewards.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // 计算统计数据
      const newStats: RewardStats = {
        totalRewards: allRewards.length,
        totalAmount: '0',
        createCourseRewards: 0,
        completeCourseRewards: 0,
        createCourseAmount: '0',
        completeCourseAmount: '0',
      };

      let totalAmount = 0;
      let createCourseAmount = 0;
      let completeCourseAmount = 0;

      for (const reward of allRewards) {
        const amount = parseFloat(reward.amount);
        totalAmount += amount;

        if (reward.type === 'create_course') {
          newStats.createCourseRewards++;
          createCourseAmount += amount;
        } else if (reward.type === 'complete_course') {
          newStats.completeCourseRewards++;
          completeCourseAmount += amount;
        }
      }

      newStats.totalAmount = totalAmount.toString();
      newStats.createCourseAmount = createCourseAmount.toString();
      newStats.completeCourseAmount = completeCourseAmount.toString();

      setRewards(allRewards);
      setStats(newStats);

    } catch (err: any) {
      console.error('获取链上奖励数据失败:', err);
      setError(err.message || '获取奖励数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 当地址变化时重新获取数据
  useEffect(() => {
    if (address && publicClient) {
      fetchRewards();
    } else {
      setRewards([]);
      setStats({
        totalRewards: 0,
        totalAmount: '0',
        createCourseRewards: 0,
        completeCourseRewards: 0,
        createCourseAmount: '0',
        completeCourseAmount: '0',
      });
    }
  }, [address, publicClient]);

  // 手动刷新数据
  const refreshRewards = () => {
    fetchRewards();
  };

  return {
    rewards,
    stats,
    loading,
    error,
    refreshRewards,
  };
};