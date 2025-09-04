import { useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useYiDengToken } from './useYiDengToken';
import { useCourseContract } from './useCourseContract';
import { getCourseContractAddress } from '../config/yidengToken';
import { recordPurchase } from '../utils/courseStorage';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

export interface UseCoursePurchaseResult {
  isPurchasing: boolean;
  isApproving: boolean;
  error: string | null;
  purchaseCourse: (courseId: string, price: string) => Promise<boolean>;
  checkAllowance: (price: string) => Promise<boolean>;
  needsApproval: boolean;
}

export const useCoursePurchase = (): UseCoursePurchaseResult => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { ydBalance, refetchYdBalance } = useWeb3();
  const { approveToken, checkAllowance: checkTokenAllowance } = useYiDengToken();
  const { purchaseCourse: enrollInCourse } = useCourseContract();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);

  // 检查授权额度是否足够
  const checkAllowance = useCallback(async (price: string): Promise<boolean> => {
    try {
      const courseContractAddress = getCourseContractAddress(chainId);
      const allowance = await checkTokenAllowance(courseContractAddress);
      const allowanceNum = parseFloat(allowance);
      const priceNum = parseFloat(price);
      
      const hasEnoughAllowance = allowanceNum >= priceNum;
      setNeedsApproval(!hasEnoughAllowance);
      
      console.log(`授权检查: 当前授权 ${allowance} YD, 需要 ${price} YD, 是否足够: ${hasEnoughAllowance}`);
      
      return hasEnoughAllowance;
    } catch (err) {
      console.error('检查授权额度失败:', err);
      setNeedsApproval(true);
      return false;
    }
  }, [checkTokenAllowance, chainId]);

  // 购买课程（完整流程：检查余额 -> 授权 -> 购买 -> 记录）
  const purchaseCourse = useCallback(async (courseId: string, price: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    setError(null);
    setIsPurchasing(true);

    try {
      // 1. 检查一灯币余额是否足够
      const ydBalanceNum = parseFloat(ydBalance || '0');
      const priceNum = parseFloat(price);
      
      console.log(`余额检查: 当前余额 ${ydBalance} YD, 课程价格 ${price} YD`);
      
      if (ydBalanceNum < priceNum) {
        const shortfall = priceNum - ydBalanceNum;
        toast.error(`余额不足，还需要 ${shortfall.toFixed(2)} YD`);
        setIsPurchasing(false);
        return false;
      }

      // 2. 检查授权额度
      const hasEnoughAllowance = await checkAllowance(price);
      
      if (!hasEnoughAllowance) {
        // 3. 如果授权不够，先进行授权
        setIsApproving(true);
        const courseContractAddress = getCourseContractAddress(chainId);
        
        toast.info(`正在授权 ${price} YD 给课程合约...`, { duration: 3000 });
        
        const approveSuccess = await approveToken(courseContractAddress, price);
        setIsApproving(false);
        
        if (!approveSuccess) {
          setIsPurchasing(false);
          return false;
        }
        
        toast.success('授权成功！正在执行购买...');
        // 授权成功后等待一小段时间确保授权生效
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 4. 执行购买
      toast.loading('正在购买课程...', { id: 'purchasing' });
      
      try {
        await enrollInCourse(courseId, price);
        
        // 5. 购买成功后记录到本地缓存
        recordPurchase(courseId, address, {
          price,
          transactionHash: null, // 可以从合约事件中获取
          timestamp: new Date().toISOString()
        });

        // 6. 刷新余额
        setTimeout(() => {
          refetchYdBalance();
        }, 3000);
        
        toast.success('课程购买成功！现在可以学习了 🎉', { id: 'purchasing', duration: 5000 });
        return true;
        
      } catch (purchaseError) {
        console.error('购买失败:', purchaseError);
        toast.error('购买失败，请重试', { id: 'purchasing' });
        return false;
      }
      
    } catch (err: any) {
      console.error('购买课程流程失败:', err);
      const errorMessage = err?.message || '购买失败，请重试';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsPurchasing(false);
      setIsApproving(false);
    }
  }, [
    address, 
    ydBalance, 
    chainId,
    checkAllowance, 
    approveToken, 
    enrollInCourse, 
    refetchYdBalance
  ]);

  return {
    isPurchasing,
    isApproving,
    error,
    purchaseCourse,
    checkAllowance,
    needsApproval,
  };
};

export default useCoursePurchase;
