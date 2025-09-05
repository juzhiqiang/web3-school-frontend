import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCourseContract } from './useCourseContract';
import { recordPurchase } from '../utils/courseStorage';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

export interface UseTransactionPurchaseResult {
  purchaseCourseWithVerification: (courseId: string, price: string) => Promise<boolean>;
  isPurchasing: boolean;
  error: string | null;
}

export const useTransactionPurchase = (): UseTransactionPurchaseResult => {
  const { address } = useAccount();
  const { refetchYdBalance } = useWeb3();
  const { 
    purchaseCourse, 
    isPurchasing, 
    purchaseHash, 
    isPurchaseConfirming, 
    isPurchaseSuccess,
    error: contractError 
  } = useCourseContract();

  const [currentPurchase, setCurrentPurchase] = useState<{
    courseId: string;
    price: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 监听交易成功状态
  useEffect(() => {
    if (isPurchaseSuccess && currentPurchase && address && purchaseHash) {
      const { courseId, price } = currentPurchase;
      
      console.log('✅ 交易确认成功，记录购买:', {
        courseId,
        price,
        hash: purchaseHash,
        address
      });

      try {
        // 只有在区块链交易成功确认后才记录购买
        recordPurchase(courseId, address, {
          price,
          transactionHash: purchaseHash,
          timestamp: new Date().toISOString(),
          verified: true // 已通过区块链验证
        });

        toast.success('课程购买成功！正在跳转到课程详情...', { 
          id: 'purchase-success', 
          duration: 5000 
        });

        // 刷新余额
        setTimeout(() => {
          refetchYdBalance();
        }, 3000);

        // 购买成功后跳转到课程详情页
        setTimeout(() => {
          window.location.href = `/course/${courseId}`;
        }, 1500);

        // 清理状态
        setCurrentPurchase(null);
        setError(null);

      } catch (recordError) {
        console.error('记录购买失败:', recordError);
        toast.error('购买记录保存失败');
      }
    }
  }, [isPurchaseSuccess, currentPurchase, address, purchaseHash, refetchYdBalance]);

  // 监听交易失败
  useEffect(() => {
    if (contractError && currentPurchase) {
      console.error('购买交易失败:', contractError);
      console.error('错误详情:', {
        message: contractError.message,
        cause: contractError.cause,
        name: contractError.name
      });
      
      let errorMessage = '支付失败';
      
      // 解析常见的错误类型
      if (contractError.message) {
        const message = contractError.message.toLowerCase();
        if (message.includes('user rejected') || message.includes('user denied')) {
          errorMessage = '您取消了交易';
        } else if (message.includes('insufficient funds')) {
          errorMessage = '支付失败：账户余额不足';
        } else if (message.includes('gas')) {
          errorMessage = '支付失败：交易费不足或Gas估算失败';
        } else if (message.includes('allowance')) {
          errorMessage = '支付失败：代币授权不足，请重新授权';
        } else if (message.includes('transfer amount exceeds')) {
          errorMessage = '支付失败：转账金额超过余额';
        } else if (message.includes('execution reverted')) {
          errorMessage = '支付失败：合约执行被拒绝';
        } else if (message.includes('network')) {
          errorMessage = '支付失败：网络连接问题';
        } else {
          errorMessage = `支付失败: ${contractError.message}`;
        }
      }
      
      toast.error(errorMessage, { 
        id: 'purchase-error',
        duration: 8000 
      });
      setError(errorMessage);
      setCurrentPurchase(null);
    }
  }, [contractError, currentPurchase]);

  const purchaseCourseWithVerification = useCallback(async (
    courseId: string, 
    price: string
  ): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    try {
      setError(null);
      setCurrentPurchase({ courseId, price });

      toast.loading('正在提交购买交易...', { id: 'purchase-tx' });

      // 调用合约购买
      const result = await purchaseCourse(courseId, price);
      
      if (result.success) {
        toast.loading('交易已提交，等待区块链确认...', { id: 'purchase-tx' });
        return true; // 交易成功提交，但还需等待确认
      } else {
        setCurrentPurchase(null);
        toast.error('提交购买交易失败', { id: 'purchase-tx' });
        return false;
      }

    } catch (err: any) {
      console.error('购买课程失败:', err);
      let errorMessage = '支付失败，请重试';
      
      // 解析错误类型
      if (err?.message) {
        const message = err.message.toLowerCase();
        if (message.includes('user rejected') || message.includes('user denied')) {
          errorMessage = '您取消了支付';
        } else if (message.includes('insufficient funds')) {
          errorMessage = '支付失败：余额不足';
        } else if (message.includes('gas')) {
          errorMessage = '支付失败：交易费估算失败';
        } else if (message.includes('network')) {
          errorMessage = '支付失败：网络连接问题';
        } else {
          errorMessage = `支付失败: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setCurrentPurchase(null);
      toast.error(errorMessage, { id: 'purchase-tx' });
      return false;
    }
  }, [address, purchaseCourse]);

  return {
    purchaseCourseWithVerification,
    isPurchasing: isPurchasing || isPurchaseConfirming,
    error: error || contractError?.message || null,
  };
};

export default useTransactionPurchase;