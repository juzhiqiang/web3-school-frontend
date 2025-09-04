import React, { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { 
  WEB3_SCHOOL_CONTRACT_ABI, 
  WEB3_SCHOOL_CONTRACT_ADDRESS,
  YIDENG_REWARDS 
} from '../config/contract';
import { Course, CreateCourseFormData } from '../types/course';

export interface UseCourseContractResult {
  // 状态
  isLoading: boolean;
  error: string | null;
  
  // 创建课程
  createCourse: (courseData: CreateCourseFormData) => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  
  // 获取课程
  getCourse: (courseId: string) => Promise<Course | null>;
  
  // 获取创作者课程列表
  getCreatorCourses: (creatorAddress: string) => Promise<string[]>;
  
  // 购买课程
  purchaseCourse: (courseId: string, price: string) => Promise<void>;
  isPurchasing: boolean;
  
  // 检查是否已购买
  hasPurchasedCourse: (courseId: string) => Promise<boolean>;
  
  // 获取课程统计
  getCourseStats: (courseId: string) => Promise<{
    totalSales: string;
    totalRevenue: string;
    studentCount: string;
  } | null>;
  
  // 提取收益
  withdrawEarnings: (courseId: string) => Promise<void>;
  isWithdrawing: boolean;
}

export const useCourseContract = (): UseCourseContractResult => {
  const { address } = useAccount();
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
      
      // 将课程数据转换为JSON字符串存储
      const lessonsData = JSON.stringify({
        lessons: courseData.lessons,
        tags: courseData.tags,
        detailedDescription: courseData.detailedDescription,
      });

      const priceInWei = parseEther(courseData.price);
      
      // 调用智能合约创建课程
      writeContract({
        address: WEB3_SCHOOL_CONTRACT_ADDRESS,
        abi: WEB3_SCHOOL_CONTRACT_ABI,
        functionName: 'createCourse',
        args: [
          courseData.title,
          courseData.description,
          priceInWei,
          courseData.duration,
          lessonsData,
        ],
      });

      toast.loading('正在创建课程...', { id: 'create-course' });
      
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
  const getCourse = useCallback(async (courseId: string): Promise<Course | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 这里应该调用智能合约的getCourse函数
      // 由于wagmi的useReadContract需要在组件级别使用，这里模拟实现
      const storedCourse = localStorage.getItem(`course_${courseId}`);
      if (storedCourse) {
        return JSON.parse(storedCourse);
      }
      
      return null;
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
  const getCreatorCourses = useCallback(async (creatorAddress: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 从本地存储获取课程列表（实际应用中应该从合约或后端获取）
      const allCourses: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('course_')) {
          const courseData = JSON.parse(localStorage.getItem(key) || '{}');
          if (courseData.instructorAddress === creatorAddress) {
            allCourses.push(courseData.id);
          }
        }
      }
      
      return allCourses;
    } catch (err: any) {
      console.error('Get creator courses error:', err);
      const errorMessage = err?.message || '获取创作者课程失败';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 购买课程
  const purchaseCourse = useCallback(async (courseId: string, price: string) => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      setIsPurchasing(true);
      setError(null);
      
      const priceInWei = parseEther(price);
      
      writeContract({
        address: WEB3_SCHOOL_CONTRACT_ADDRESS,
        abi: WEB3_SCHOOL_CONTRACT_ABI,
        functionName: 'purchaseCourse',
        args: [BigInt(courseId)],
        value: priceInWei,
      });

      toast.loading('正在购买课程...', { id: 'purchase-course' });
      
    } catch (err: any) {
      console.error('Purchase course error:', err);
      const errorMessage = err?.message || '购买课程失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  }, [address, writeContract]);

  // 检查是否已购买课程
  const hasPurchasedCourse = useCallback(async (courseId: string): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // 从本地存储检查购买记录（实际应用中应该从合约查询）
      const purchaseKey = `purchase_${address}_${courseId}`;
      return localStorage.getItem(purchaseKey) !== null;
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

  // 提取收益
  const withdrawEarnings = useCallback(async (courseId: string) => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError(null);
      
      writeContract({
        address: WEB3_SCHOOL_CONTRACT_ADDRESS,
        abi: WEB3_SCHOOL_CONTRACT_ABI,
        functionName: 'withdrawEarnings',
        args: [BigInt(courseId)],
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
      toast.success('操作成功！', { id: 'create-course' });
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
    
    getCourse,
    getCreatorCourses,
    
    purchaseCourse,
    isPurchasing: isPurchasing || isPending || isConfirming,
    
    hasPurchasedCourse,
    getCourseStats,
    
    withdrawEarnings,
    isWithdrawing: isWithdrawing || isPending || isConfirming,
  };
};

// 获取我的课程列表的Hook
export const useMyCoursesContract = () => {
  const { address } = useAccount();
  
  const { data: creatorCourseIds } = useReadContract({
    address: WEB3_SCHOOL_CONTRACT_ADDRESS,
    abi: WEB3_SCHOOL_CONTRACT_ABI,
    functionName: 'getCreatorCourses',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: purchasedCourseIds } = useReadContract({
    address: WEB3_SCHOOL_CONTRACT_ADDRESS,
    abi: WEB3_SCHOOL_CONTRACT_ABI,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return {
    creatorCourseIds: creatorCourseIds as bigint[] | undefined,
    purchasedCourseIds: purchasedCourseIds as bigint[] | undefined,
  };
};

// 课程详情的Hook
export const useCourseDetails = (courseId: string | undefined) => {
  const { data: courseData, isLoading, error } = useReadContract({
    address: WEB3_SCHOOL_CONTRACT_ADDRESS,
    abi: WEB3_SCHOOL_CONTRACT_ABI,
    functionName: 'getCourse',
    args: courseId ? [BigInt(courseId)] : undefined,
    enabled: !!courseId,
  });

  const { data: courseStats } = useReadContract({
    address: WEB3_SCHOOL_CONTRACT_ADDRESS,
    abi: WEB3_SCHOOL_CONTRACT_ABI,
    functionName: 'getCourseStats',
    args: courseId ? [BigInt(courseId)] : undefined,
    enabled: !!courseId,
  });

  return {
    courseData,
    courseStats,
    isLoading,
    error,
  };
};