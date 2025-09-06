// 奖励类型枚举
export const RewardType = {
  CREATE_COURSE: 'CREATE_COURSE',
  COMPLETE_COURSE: 'COMPLETE_COURSE', 
  FIRST_PURCHASE: 'FIRST_PURCHASE',
  REVIEW_COURSE: 'REVIEW_COURSE',
} as const;

export type RewardTypeValue = typeof RewardType[keyof typeof RewardType];

// 奖励金额配置
export const REWARD_AMOUNTS = {
  [RewardType.CREATE_COURSE]: '10',
  [RewardType.COMPLETE_COURSE]: '5', 
  [RewardType.FIRST_PURCHASE]: '2',
  [RewardType.REVIEW_COURSE]: '1',
} as const;

// 获取奖励金额
export const getRewardAmount = (type: RewardTypeValue): string => {
  return REWARD_AMOUNTS[type] || '0';
};

// 用户奖励记录接口
export interface UserReward {
  id: string;
  type: RewardTypeValue;
  amount: string;
  description: string;
  timestamp: string;
  transactionHash?: string;
  claimed: boolean;
}

// 获取用户奖励存储键
const getUserRewardKey = (userAddress: string): string => {
  return `user_rewards_${userAddress.toLowerCase()}`;
};

// 获取用户所有奖励
export const getUserRewards = (userAddress: string): UserReward[] => {
  try {
    const key = getUserRewardKey(userAddress);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取用户奖励失败:', error);
    return [];
  }
};

// 添加用户奖励
export const addUserReward = (userAddress: string, reward: UserReward): void => {
  try {
    const key = getUserRewardKey(userAddress);
    const currentRewards = getUserRewards(userAddress);
    
    // 检查是否已存在相同的奖励（防止重复）
    const exists = currentRewards.some(r => 
      r.type === reward.type && 
      r.timestamp === reward.timestamp
    );
    
    if (!exists) {
      currentRewards.unshift(reward); // 新奖励放在前面
      localStorage.setItem(key, JSON.stringify(currentRewards));
    }
  } catch (error) {
    console.error('添加用户奖励失败:', error);
  }
};

// 标记奖励为已领取
export const markRewardAsClaimed = (userAddress: string, rewardId: string): void => {
  try {
    const key = getUserRewardKey(userAddress);
    const currentRewards = getUserRewards(userAddress);
    
    const updatedRewards = currentRewards.map(reward => 
      reward.id === rewardId ? { ...reward, claimed: true } : reward
    );
    
    localStorage.setItem(key, JSON.stringify(updatedRewards));
  } catch (error) {
    console.error('标记奖励已领取失败:', error);
  }
};

// 获取未领取的奖励总额
export const getUnclaimedRewardTotal = (userAddress: string): string => {
  try {
    const rewards = getUserRewards(userAddress);
    const unclaimedRewards = rewards.filter(reward => !reward.claimed);
    
    const total = unclaimedRewards.reduce((sum, reward) => {
      return sum + parseFloat(reward.amount);
    }, 0);
    
    return total.toString();
  } catch (error) {
    console.error('计算未领取奖励总额失败:', error);
    return '0';
  }
};

// 获取特定类型的奖励记录
export const getRewardsByType = (userAddress: string, type: RewardTypeValue): UserReward[] => {
  try {
    const allRewards = getUserRewards(userAddress);
    return allRewards.filter(reward => reward.type === type);
  } catch (error) {
    console.error('获取特定类型奖励失败:', error);
    return [];
  }
};

// 检查用户是否已获得某种类型的奖励
export const hasUserReceivedReward = (userAddress: string, type: RewardTypeValue): boolean => {
  try {
    const rewards = getRewardsByType(userAddress, type);
    return rewards.length > 0;
  } catch (error) {
    console.error('检查用户奖励状态失败:', error);
    return false;
  }
};

// 创建奖励记录
export const createRewardRecord = (
  type: RewardTypeValue,
  description?: string,
  transactionHash?: string
): UserReward => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount: getRewardAmount(type),
    description: description || `获得 ${type} 奖励`,
    timestamp: new Date().toISOString(),
    transactionHash,
    claimed: false,
  };
};

// 清除用户所有奖励记录（危险操作）
export const clearUserRewards = (userAddress: string): void => {
  try {
    const key = getUserRewardKey(userAddress);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('清除用户奖励记录失败:', error);
  }
};

// 导出奖励数据（用于备份）
export const exportUserRewards = (userAddress: string): string => {
  try {
    const rewards = getUserRewards(userAddress);
    return JSON.stringify(rewards, null, 2);
  } catch (error) {
    console.error('导出用户奖励数据失败:', error);
    return '';
  }
};

// 导入奖励数据（用于恢复）
export const importUserRewards = (userAddress: string, rewardsJson: string): boolean => {
  try {
    const rewards = JSON.parse(rewardsJson) as UserReward[];
    
    // 验证数据格式
    if (!Array.isArray(rewards)) {
      throw new Error('Invalid rewards data format');
    }
    
    // 验证每个奖励记录的格式
    rewards.forEach(reward => {
      if (!reward.id || !reward.type || !reward.amount || !reward.timestamp) {
        throw new Error('Invalid reward record format');
      }
    });
    
    const key = getUserRewardKey(userAddress);
    localStorage.setItem(key, JSON.stringify(rewards));
    
    return true;
  } catch (error) {
    console.error('导入用户奖励数据失败:', error);
    return false;
  }
};

// 获取奖励统计信息
export const getRewardStats = (userAddress: string) => {
  try {
    const rewards = getUserRewards(userAddress);
    
    const stats = {
      totalRewards: rewards.length,
      totalAmount: rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0).toString(),
      claimedAmount: rewards
        .filter(reward => reward.claimed)
        .reduce((sum, reward) => sum + parseFloat(reward.amount), 0)
        .toString(),
      unclaimedAmount: getUnclaimedRewardTotal(userAddress),
      rewardsByType: {
        [RewardType.CREATE_COURSE]: getRewardsByType(userAddress, RewardType.CREATE_COURSE).length,
        [RewardType.COMPLETE_COURSE]: getRewardsByType(userAddress, RewardType.COMPLETE_COURSE).length,
        [RewardType.FIRST_PURCHASE]: getRewardsByType(userAddress, RewardType.FIRST_PURCHASE).length,
        [RewardType.REVIEW_COURSE]: getRewardsByType(userAddress, RewardType.REVIEW_COURSE).length,
      },
    };
    
    return stats;
  } catch (error) {
    console.error('获取奖励统计信息失败:', error);
    return {
      totalRewards: 0,
      totalAmount: '0',
      claimedAmount: '0',
      unclaimedAmount: '0',
      rewardsByType: {
        [RewardType.CREATE_COURSE]: 0,
        [RewardType.COMPLETE_COURSE]: 0,
        [RewardType.FIRST_PURCHASE]: 0,
        [RewardType.REVIEW_COURSE]: 0,
      },
    };
  }
};