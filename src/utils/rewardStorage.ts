// 奖励记录管理工具类
import { YIDENG_REWARDS } from '../config/contract';

// 奖励类型枚举
export const RewardType = {
  CREATE_COURSE: 'CREATE_COURSE',
  COMPLETE_COURSE: 'COMPLETE_COURSE', 
  FIRST_PURCHASE: 'FIRST_PURCHASE',
  REVIEW_COURSE: 'REVIEW_COURSE',
} as const;

export type RewardTypeValue = typeof RewardType[keyof typeof RewardType];

// 奖励记录接口
export interface RewardRecord {
  id: string;
  userAddress: string;
  type: RewardTypeValue;
  amount: string; // 奖励金额（一灯币）
  description: string; // 奖励描述
  relatedId?: string; // 相关ID（如courseId）
  transactionHash?: string; // 交易哈希
  timestamp: Date;
  claimed: boolean; // 是否已领取
}

// 本地存储前缀
const REWARD_PREFIX = 'reward_';
const USER_REWARDS_PREFIX = 'user_rewards_';

// 奖励记录工具类
export class RewardStorage {
  
  // 创建奖励记录
  static createReward(
    userAddress: string,
    type: RewardType,
    relatedId?: string,
    transactionHash?: string
  ): RewardRecord {
    const rewardId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reward: RewardRecord = {
      id: rewardId,
      userAddress,
      type,
      amount: YIDENG_REWARDS[type],
      description: RewardStorage.getRewardDescription(type, relatedId),
      relatedId,
      transactionHash,
      timestamp: new Date(),
      claimed: !!transactionHash, // 如果有交易哈希则认为已领取
    };

    return reward;
  }

  // 保存奖励记录
  static saveReward(reward: RewardRecord): void {
    try {
      // 保存单个奖励记录
      const rewardKey = `${REWARD_PREFIX}${reward.id}`;
      localStorage.setItem(rewardKey, JSON.stringify(reward));

      // 更新用户奖励列表
      const userRewardsKey = `${USER_REWARDS_PREFIX}${reward.userAddress}`;
      const existingRewards = RewardStorage.getUserRewards(reward.userAddress);
      const updatedRewards = [...existingRewards, reward.id];
      localStorage.setItem(userRewardsKey, JSON.stringify(updatedRewards));

    } catch (error) {
      console.error('保存奖励记录失败:', error);
      throw new Error('保存奖励记录失败');
    }
  }

  // 记录创建课程奖励
  static recordCreateCourseReward(
    userAddress: string,
    courseId: string,
    transactionHash?: string
  ): RewardRecord {
    const reward = RewardStorage.createReward(
      userAddress,
      RewardType.CREATE_COURSE,
      courseId,
      transactionHash
    );
    
    RewardStorage.saveReward(reward);
    return reward;
  }

  // 记录完成课程奖励
  static recordCompleteCourseReward(
    userAddress: string,
    courseId: string,
    transactionHash?: string
  ): RewardRecord {
    const reward = RewardStorage.createReward(
      userAddress,
      RewardType.COMPLETE_COURSE,
      courseId,
      transactionHash
    );
    
    RewardStorage.saveReward(reward);
    return reward;
  }

  // 记录首次购买奖励
  static recordFirstPurchaseReward(
    userAddress: string,
    courseId: string,
    transactionHash?: string
  ): RewardRecord {
    const reward = RewardStorage.createReward(
      userAddress,
      RewardType.FIRST_PURCHASE,
      courseId,
      transactionHash
    );
    
    RewardStorage.saveReward(reward);
    return reward;
  }

  // 记录评价课程奖励
  static recordReviewCourseReward(
    userAddress: string,
    courseId: string,
    transactionHash?: string
  ): RewardRecord {
    const reward = RewardStorage.createReward(
      userAddress,
      RewardType.REVIEW_COURSE,
      courseId,
      transactionHash
    );
    
    RewardStorage.saveReward(reward);
    return reward;
  }

  // 获取单个奖励记录
  static getReward(rewardId: string): RewardRecord | null {
    try {
      const rewardKey = `${REWARD_PREFIX}${rewardId}`;
      const rewardData = localStorage.getItem(rewardKey);
      
      if (!rewardData) {
        return null;
      }

      const reward = JSON.parse(rewardData);
      reward.timestamp = new Date(reward.timestamp);
      return reward;
    } catch (error) {
      console.error('获取奖励记录失败:', error);
      return null;
    }
  }

  // 获取用户的奖励ID列表
  static getUserRewards(userAddress: string): string[] {
    try {
      const userRewardsKey = `${USER_REWARDS_PREFIX}${userAddress}`;
      const rewardsData = localStorage.getItem(userRewardsKey);
      
      if (!rewardsData) {
        return [];
      }

      return JSON.parse(rewardsData);
    } catch (error) {
      console.error('获取用户奖励列表失败:', error);
      return [];
    }
  }

  // 获取用户的所有奖励记录
  static getUserRewardRecords(userAddress: string): RewardRecord[] {
    const rewardIds = RewardStorage.getUserRewards(userAddress);
    const rewards: RewardRecord[] = [];

    for (const rewardId of rewardIds) {
      const reward = RewardStorage.getReward(rewardId);
      if (reward) {
        rewards.push(reward);
      }
    }

    // 按时间倒序排列
    return rewards.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 获取用户的奖励统计
  static getUserRewardStats(userAddress: string): {
    totalRewards: number;
    totalAmount: string;
    claimedAmount: string;
    unclaimedAmount: string;
    byType: Record<RewardType, { count: number; amount: string }>;
  } {
    const rewards = RewardStorage.getUserRewardRecords(userAddress);
    
    let totalAmount = 0;
    let claimedAmount = 0;
    let unclaimedAmount = 0;
    const byType: Record<RewardType, { count: number; amount: string }> = {
      [RewardType.CREATE_COURSE]: { count: 0, amount: '0' },
      [RewardType.COMPLETE_COURSE]: { count: 0, amount: '0' },
      [RewardType.FIRST_PURCHASE]: { count: 0, amount: '0' },
      [RewardType.REVIEW_COURSE]: { count: 0, amount: '0' },
    };

    for (const reward of rewards) {
      const amount = parseFloat(reward.amount);
      totalAmount += amount;

      if (reward.claimed) {
        claimedAmount += amount;
      } else {
        unclaimedAmount += amount;
      }

      byType[reward.type].count += 1;
      const typeAmount = parseFloat(byType[reward.type].amount) + amount;
      byType[reward.type].amount = typeAmount.toString();
    }

    return {
      totalRewards: rewards.length,
      totalAmount: totalAmount.toString(),
      claimedAmount: claimedAmount.toString(),
      unclaimedAmount: unclaimedAmount.toString(),
      byType,
    };
  }

  // 更新奖励记录的交易哈希（标记为已领取）
  static updateRewardTransactionHash(rewardId: string, transactionHash: string): boolean {
    try {
      const reward = RewardStorage.getReward(rewardId);
      if (!reward) {
        return false;
      }

      reward.transactionHash = transactionHash;
      reward.claimed = true;

      const rewardKey = `${REWARD_PREFIX}${rewardId}`;
      localStorage.setItem(rewardKey, JSON.stringify(reward));
      return true;
    } catch (error) {
      console.error('更新奖励交易哈希失败:', error);
      return false;
    }
  }

  // 获取奖励描述
  private static getRewardDescription(type: RewardType, relatedId?: string): string {
    switch (type) {
      case RewardType.CREATE_COURSE:
        return `创建课程奖励${relatedId ? ` - 课程ID: ${relatedId.slice(0, 8)}...` : ''}`;
      case RewardType.COMPLETE_COURSE:
        return `完成课程奖励${relatedId ? ` - 课程ID: ${relatedId.slice(0, 8)}...` : ''}`;
      case RewardType.FIRST_PURCHASE:
        return `首次购买奖励${relatedId ? ` - 课程ID: ${relatedId.slice(0, 8)}...` : ''}`;
      case RewardType.REVIEW_COURSE:
        return `评价课程奖励${relatedId ? ` - 课程ID: ${relatedId.slice(0, 8)}...` : ''}`;
      default:
        return '未知奖励';
    }
  }

  // 清除用户所有奖励记录（仅用于开发/测试）
  static clearUserRewards(userAddress: string): void {
    try {
      const rewardIds = RewardStorage.getUserRewards(userAddress);
      
      // 删除所有奖励记录
      for (const rewardId of rewardIds) {
        const rewardKey = `${REWARD_PREFIX}${rewardId}`;
        localStorage.removeItem(rewardKey);
      }

      // 删除用户奖励列表
      const userRewardsKey = `${USER_REWARDS_PREFIX}${userAddress}`;
      localStorage.removeItem(userRewardsKey);
    } catch (error) {
      console.error('清除用户奖励记录失败:', error);
    }
  }

  // 清除所有奖励记录（仅用于开发/测试）
  static clearAllRewards(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(REWARD_PREFIX) || key?.startsWith(USER_REWARDS_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('清除所有奖励记录失败:', error);
    }
  }
}

// 便捷的导出函数
export const recordCreateCourseReward = RewardStorage.recordCreateCourseReward;
export const recordCompleteCourseReward = RewardStorage.recordCompleteCourseReward;
export const recordFirstPurchaseReward = RewardStorage.recordFirstPurchaseReward;
export const recordReviewCourseReward = RewardStorage.recordReviewCourseReward;
export const getUserRewardRecords = RewardStorage.getUserRewardRecords;
export const getUserRewardStats = RewardStorage.getUserRewardStats;
export const updateRewardTransactionHash = RewardStorage.updateRewardTransactionHash;
export const clearUserRewards = RewardStorage.clearUserRewards;