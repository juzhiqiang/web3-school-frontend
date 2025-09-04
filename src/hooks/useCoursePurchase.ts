import { useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useYiDengToken } from './useYiDengToken';
import { useTransactionPurchase } from './useTransactionPurchase';
import { getCourseContractAddress } from '../config/yidengToken';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

export interface UseCoursePurchaseResult {
  isPurchasing: boolean;
  isApproving: boolean;
  error: string | null;
  purchaseCourse: (courseId: string, price: string) => Promise<boolean>;
  checkAllowance: (price: string) => Promise<boolean>;
  needsApproval: boolean;
  approveCourse: (price: string) => Promise<boolean>; // 新增单独授权功能
}

export const useCoursePurchase = (): UseCoursePurchaseResult => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { ydBalance } = useWeb3();
  const { approveToken, checkAllowance: checkTokenAllowance } = useYiDengToken();
  const { purchaseCourseWithVerification, isPurchasing: isTransactionPurchasing, error: purchaseError } = useTransactionPurchase();

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

  // 单独的授权功能
  const approveCourse = useCallback(async (price: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    setError(null);
    setIsApproving(true);

    try {
      const courseContractAddress = getCourseContractAddress(chainId);
      toast(`正在授权 ${price} YD 给课程合约...`, { 
        duration: 3000,
        icon: 'ℹ️'
      });
      
      const approveSuccess = await approveToken(courseContractAddress, price);
      
      if (approveSuccess) {
        toast.success('授权成功！现在可以购买课程了');
        // 重新检查授权状态
        await checkAllowance(price);
        return true;
      } else {
        toast.error('授权失败，请重试');
        return false;
      }
    } catch (err: any) {
      console.error('授权失败:', err);
      const errorMessage = err?.message || '授权失败，请重试';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [address, chainId, approveToken, checkAllowance]);

  // 购买课程（使用交易验证机制）
  const purchaseCourse = useCallback(async (courseId: string, price: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    setError(null);

    try {
      // 1. 检查一灯币余额是否足够
      const ydBalanceNum = parseFloat(ydBalance || '0');
      const priceNum = parseFloat(price);
      
      console.log(`余额检查: 当前余额 ${ydBalance} YD, 课程价格 ${price} YD`);
      
      if (ydBalanceNum < priceNum) {
        const shortfall = priceNum - ydBalanceNum;
        toast.error(`余额不足，还需要 ${shortfall.toFixed(2)} YD`);
        return false;
      }

      // 2. 检查授权额度
      const hasEnoughAllowance = await checkAllowance(price);
      
      if (!hasEnoughAllowance) {
        toast.error('授权额度不足，请先进行授权');
        return false;
      }

      // 3. 使用新的交易验证购买机制
      return await purchaseCourseWithVerification(courseId, price);
      
    } catch (err: any) {
      console.error('购买课程流程失败:', err);
      const errorMessage = err?.message || '购买失败，请重试';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [
    address, 
    ydBalance, 
    checkAllowance, 
    purchaseCourseWithVerification
  ]);

  return {
    isPurchasing: isTransactionPurchasing,
    isApproving,
    error: error || purchaseError,
    purchaseCourse,
    checkAllowance,
    needsApproval,
    approveCourse, // 单独授权功能
  };
};

export default useCoursePurchase;
