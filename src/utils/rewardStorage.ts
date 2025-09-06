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
  courseId?: string; // 添加课程ID字段
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
      r.timestamp === reward.timestamp &&
      r.courseId === reward.courseId
    );
    
    if (!exists) {
      currentRewards.unshift(reward); // 新奖励放在前面
      localStorage.setItem(key, JSON.stringify(currentRewards));
      console.log('✅ 成功添加奖励记录:', reward);
    } else {
      console.log('⚠️ 奖励记录已存在，跳过添加');
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
  transactionHash?: string,
  courseId?: string
): UserReward => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount: getRewardAmount(type),
    description: description || `获得 ${type} 奖励`,
    timestamp: new Date().toISOString(),
    transactionHash,
    claimed: false,
    courseId,
  };
};

// ===== 专用奖励记录函数 =====

/**
 * 记录创建课程奖励
 * @param userAddress - 用户地址
 * @param courseId - 课程ID
 * @param transactionHash - 交易哈希（可选）
 * @param customAmount - 自定义奖励金额（可选）
 */
export const recordCreateCourseReward = (
  userAddress: string, 
  courseId: string, 
  transactionHash?: string,
  customAmount?: string
): void => {
  try {
    // 检查是否已经为此课程记录过奖励
    const existingRewards = getUserRewards(userAddress);
    const hasCourseReward = existingRewards.some(
      reward => reward.type === RewardType.CREATE_COURSE && reward.courseId === courseId
    );

    if (hasCourseReward) {
      console.log('⚠️ 该课程的创建奖励已经记录过了');
      return;
    }

    const reward = createRewardRecord(
      RewardType.CREATE_COURSE,
      `创建课程「${courseId}」获得奖励`,
      transactionHash,
      courseId
    );

    // 如果提供了自定义金额，使用自定义金额
    if (customAmount) {
      reward.amount = customAmount;
    }

    addUserReward(userAddress, reward);
    console.log('✅ 成功记录创建课程奖励:', reward);
  } catch (error) {
    console.error('记录创建课程奖励失败:', error);
  }
};

/**
 * 记录完成课程奖励
 * @param userAddress - 用户地址
 * @param courseId - 课程ID
 * @param courseName - 课程名称（可选）
 * @param transactionHash - 交易哈希（可选）
 */
export const recordCompleteCourseReward = (
  userAddress: string, 
  courseId: string, 
  courseName?: string,
  transactionHash?: string
): void => {
  try {
    // 检查是否已经为此课程记录过完成奖励
    const existingRewards = getUserRewards(userAddress);
    const hasCompletionReward = existingRewards.some(
      reward => reward.type === RewardType.COMPLETE_COURSE && reward.courseId === courseId
    );

    if (hasCompletionReward) {
      console.log('⚠️ 该课程的完成奖励已经记录过了');
      return;
    }

    const reward = createRewardRecord(
      RewardType.COMPLETE_COURSE,
      `完成课程「${courseName || courseId}」获得奖励`,
      transactionHash,
      courseId
    );

    addUserReward(userAddress, reward);
    console.log('✅ 成功记录完成课程奖励:', reward);
  } catch (error) {
    console.error('记录完成课程奖励失败:', error);
  }
};

/**
 * 记录首次购买奖励
 * @param userAddress - 用户地址
 * @param courseId - 课程ID（可选）
 * @param transactionHash - 交易哈希（可选）
 */
export const recordFirstPurchaseReward = (
  userAddress: string, 
  courseId?: string,
  transactionHash?: string
): void => {
  try {
    // 检查是否已经记录过首次购买奖励
    const existingRewards = getUserRewards(userAddress);
    const hasFirstPurchaseReward = existingRewards.some(
      reward => reward.type === RewardType.FIRST_PURCHASE
    );

    if (hasFirstPurchaseReward) {
      console.log('⚠️ 首次购买奖励已经记录过了');
      return;
    }

    const reward = createRewardRecord(
      RewardType.FIRST_PURCHASE,
      '首次购买课程获得奖励',
      transactionHash,
      courseId
    );

    addUserReward(userAddress, reward);
    console.log('✅ 成功记录首次购买奖励:', reward);
  } catch (error) {
    console.error('记录首次购买奖励失败:', error);
  }
};

/**
 * 记录评价课程奖励
 * @param userAddress - 用户地址
 * @param courseId - 课程ID
 * @param courseName - 课程名称（可选）
 * @param transactionHash - 交易哈希（可选）
 */
export const recordReviewCourseReward = (
  userAddress: string, 
  courseId: string, 
  courseName?: string,
  transactionHash?: string
): void => {
  try {
    // 检查是否已经为此课程记录过评价奖励
    const existingRewards = getUserRewards(userAddress);
    const hasReviewReward = existingRewards.some(
      reward => reward.type === RewardType.REVIEW_COURSE && reward.courseId === courseId
    );

    if (hasReviewReward) {
      console.log('⚠️ 该课程的评价奖励已经记录过了');
      return;
    }

    const reward = createRewardRecord(
      RewardType.REVIEW_COURSE,
      `评价课程「${courseName || courseId}」获得奖励`,
      transactionHash,
      courseId
    );

    addUserReward(userAddress, reward);
    console.log('✅ 成功记录评价课程奖励:', reward);
  } catch (error) {
    console.error('记录评价课程奖励失败:', error);
  }
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

// 获取特定课程的奖励记录
export const getCourseRewards = (userAddress: string, courseId: string): UserReward[] => {
  try {
    const allRewards = getUserRewards(userAddress);
    return allRewards.filter(reward => reward.courseId === courseId);
  } catch (error) {
    console.error('获取课程奖励记录失败:', error);
    return [];
  }
};

// 检查用户是否已为特定课程获得特定类型的奖励
export const hasCourseSpecificReward = (
  userAddress: string, 
  courseId: string, 
  rewardType: RewardTypeValue
): boolean => {
  try {
    const courseRewards = getCourseRewards(userAddress, courseId);
    return courseRewards.some(reward => reward.type === rewardType);
  } catch (error) {
    console.error('检查课程特定奖励失败:', error);
    return false;
  }
};
