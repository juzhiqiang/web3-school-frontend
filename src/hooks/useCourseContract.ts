import React, { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';
import { YIDENG_REWARDS } from '../config/contract';
import type { 
  Course, 
  CourseLesson, 
  CreateCourseFormData, 
  UseCourseContractResult 
} from '../types/courseTypes';
import { getCourse, getCreatorCourseIds, hasPurchased } from '../utils/courseStorage';

export const useCourseContract = (): UseCourseContractResult => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 创建课程
  const createCourse = useCallback(async (courseData: CreateCourseFormData) => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      
      // 将一灯币价格转换为wei单位（18位小数）
      const priceInWei = parseEther(courseData.price);
      // 学员完成课程奖励金额（给学员的奖励，不是创建者奖励）
      const courseCompletionRewardInWei = parseEther(YIDENG_REWARDS.COMPLETE_COURSE);
      
      console.log('🚀 准备创建课程:', {
        courseId: courseData.courseId,
        title: courseData.title,
        price: courseData.price,
        priceInWei: priceInWei.toString(),
        courseCompletionRewardInWei: courseCompletionRewardInWei.toString(),
        creatorAddress: address
      });
      
      // 调用智能合约创建课程
      writeContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'createCourse',
        args: [
          courseData.courseId || '', // courseId (string)
          courseData.courseId || '', // uuid (string) - 使用相同的UUID
          courseData.title, // title (string)
          courseCompletionRewardInWei, // rewardAmount (uint256) - 给学员完成课程的奖励
          priceInWei, // price (uint256)
        ],
      });

      toast.loading('正在创建课程和发放奖励...', { id: 'create-course' });
      
    } catch (err: any) {
      console.error('Create course error:', err);
      const errorMessage = err?.message || '创建课程失败';
      setCreateError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [address, writeContract]);

  // 获取单个课程信息
  const getCourseInfo = useCallback(async (courseId: string): Promise<Course | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用存储工具类获取课程信息
      const course = getCourse(courseId);
      return course;
      
    } catch (err: any) {
      console.error('Get course error:', err);
      const errorMessage = err?.message || '获取课程信息失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取创作者的课程列表
  const getCreatorCoursesInfo = useCallback(async (creatorAddress: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用存储工具类获取创作者课程列表
      const courseIds = getCreatorCourseIds(creatorAddress);
      return courseIds;
      
    } catch (err: any) {
      console.error('Get creator courses error:', err);
      const errorMessage = err?.message || '获取创作者课程失败';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 购买课程（注册课程）
  const purchaseCourse = useCallback(async (courseId: string, price: string): Promise<{ success: boolean; hash?: string }> => {
    if (!address) {
      toast.error('请先连接钱包');
      return { success: false };
    }

    try {
      setIsPurchasing(true);
      setError(null);
      
      console.log('准备调用合约 enrollInCourse:', {
        contractAddress: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS,
        courseId,
        userAddress: address,
        price
      });
      
      // 先检查课程是否存在于合约中
      console.log('正在检查课程是否存在于合约中...');
      const courseExists = await checkCourseExistsInContract(courseId);
      
      if (!courseExists) {
        const errorMessage = `课程 ${courseId} 不存在于区块链合约中，无法购买。请联系课程创建者先在区块链上发布课程。`;
        console.error(errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false };
      }
      
      console.log('课程存在于合约中，继续购买流程...');
      
      // 新合约中使用enrollInCourse函数
      writeContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'enrollInCourse',
        args: [courseId], // 使用string类型的courseId
      });

      console.log('合约调用已提交，等待执行结果...');
      
      // 返回成功状态，hash将通过wagmi的机制获取
      return { success: true, hash: undefined }; // hash会在writeContract成功后通过wagmi状态获取
      
    } catch (err: any) {
      console.error('Purchase course error:', err);
      console.error('Error details:', {
        name: err?.name,
        message: err?.message,
        cause: err?.cause,
        code: err?.code,
        data: err?.data
      });
      
      let errorMessage = '购买课程失败';
      
      // 解析具体错误原因
      if (err?.message) {
        const message = err.message.toLowerCase();
        if (message.includes('course does not exist')) {
          errorMessage = '课程不存在，可能未在区块链上创建';
        } else if (message.includes('already enrolled')) {
          errorMessage = '您已经注册了这门课程';
        } else if (message.includes('insufficient allowance')) {
          errorMessage = '一灯币授权不足，请先进行授权';
        } else if (message.includes('insufficient balance')) {
          errorMessage = '一灯币余额不足';
        } else if (message.includes('course not active')) {
          errorMessage = '课程未激活';
        } else if (message.includes('internal json-rpc error')) {
          errorMessage = '合约执行失败：可能是课程不存在或其他合约条件未满足';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setIsPurchasing(false);
    }
  }, [address, writeContract]);

  // 检查课程是否在合约中存在（新增调试功能）
  const checkCourseExistsInContract = useCallback(async (courseId: string): Promise<boolean> => {
    if (!publicClient) return false;
    
    try {
      setIsLoading(true);
      
      console.log('检查课程是否存在于合约中:', courseId);
      
      // 尝试获取课程信息
      const courseData = await publicClient.readContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'getCourse',
        args: [courseId],
      });
      
      console.log('合约中的课程数据:', courseData);
      
      // 如果课程存在，courseData应该不为空且courseId不为空字符串
      return courseData && courseData.courseId && courseData.courseId !== '';
      
    } catch (err: any) {
      console.error('检查课程存在性失败:', err);
      console.log('课程可能不存在于合约中:', courseId);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  // 检查是否已购买课程
  const hasPurchasedCourse = useCallback(async (courseId: string): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // 使用存储工具类检查购买记录
      return hasPurchased(courseId, address);
    } catch (err) {
      console.error('Check purchase status error:', err);
      return false;
    }
  }, [address]);

  // 获取课程统计
  const getCourseStats = useCallback(async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 模拟从合约获取统计数据
      const stats = {
        totalSales: '0',
        totalRevenue: '0',
        studentCount: '0',
      };
      
      return stats;
    } catch (err: any) {
      console.error('Get course stats error:', err);
      const errorMessage = err?.message || '获取课程统计失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 提取收益（新合约中使用withdrawTokens）
  const withdrawEarnings = useCallback(async (amount: string) => { // 改为金额参数
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError(null);
      
      const amountInWei = parseEther(amount);
      
      writeContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'withdrawTokens',
        args: [amountInWei], // 使用金额而不是courseId
      });

      toast.loading('正在提取收益...', { id: 'withdraw-earnings' });
      
    } catch (err: any) {
      console.error('Withdraw earnings error:', err);
      const errorMessage = err?.message || '提取收益失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsWithdrawing(false);
    }
  }, [address, writeContract]);

  // 监听交易状态
  React.useEffect(() => {
    if (isSuccess) {
      // 不再显示通用成功消息，让组件自己处理
      // 只处理非创建课程的操作
      toast.success('操作成功！', { id: 'purchase-course' });
      toast.success('提取成功！', { id: 'withdraw-earnings' });
    }
  }, [isSuccess]);

  React.useEffect(() => {
    if (contractError) {
      const errorMessage = contractError.message || '交易失败';
      setError(errorMessage);
      setCreateError(errorMessage);
      toast.error(errorMessage, { 
        id: 'create-course'
      });
      toast.error(errorMessage, { 
        id: 'purchase-course' 
      });
      toast.error(errorMessage, { 
        id: 'withdraw-earnings' 
      });
    }
  }, [contractError]);

  return {
    isLoading: isLoading || isPending || isConfirming,
    error,
    
    createCourse,
    isCreating: isCreating || isPending || isConfirming,
    createError,
    isCreateSuccess: isSuccess, // 添加创建成功状态
    
    getCourse: getCourseInfo,
    getCreatorCourses: getCreatorCoursesInfo,
    
    purchaseCourse,
    isPurchasing: isPurchasing || isPending || isConfirming,
    purchaseHash: hash, // 暴露交易哈希
    isPurchaseConfirming: isConfirming, // 暴露交易确认状态
    isPurchaseSuccess: isSuccess, // 暴露交易成功状态
    
    hasPurchasedCourse,
    checkCourseExistsInContract, // 新增调试功能
    getCourseStats,
    
    withdrawEarnings,
    isWithdrawing: isWithdrawing || isPending || isConfirming,
  };
};

// 获取我的课程列表的Hook
export const useMyCoursesContract = () => {
  const { address } = useAccount();
  
  const { data: creatorCourseIds } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getAuthorCourses', // 新合约中的函数名
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: purchasedCourseIds } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getStudentCourses', // 新合约中的函数名
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return {
    creatorCourseIds: creatorCourseIds as string[] | undefined, // 新合约返回string[]
    purchasedCourseIds: purchasedCourseIds as string[] | undefined, // 新合约返回string[]
  };
};

// 课程详情的Hook
export const useCourseDetails = (courseId: string | undefined) => {
  const { data: courseData, isLoading, error } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getCourse',
    args: courseId ? [courseId] : undefined, // 使用string类型，不是BigInt
    enabled: !!courseId,
  });

  const { data: courseStats } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getCourseStats',
    args: courseId ? [courseId] : undefined, // 使用string类型，不是BigInt
    enabled: !!courseId,
  });

  return {
    courseData,
    courseStats,
    isLoading,
    error,
  };
};