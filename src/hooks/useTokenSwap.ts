import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useWeb3 } from '../contexts/Web3Context';
import { TOKEN_SWAP_CONFIG } from '../config/contract';
import toast from 'react-hot-toast';

export interface UseTokenSwapResult {
  // ETH to YD swap
  swapETHForYD: (ethAmount: string) => Promise<boolean>;
  // YD to ETH swap
  swapYDForETH: (ydAmount: string) => Promise<boolean>;
  // Get exchange rates
  getETHToYDRate: () => Promise<string>;
  getYDToETHRate: () => Promise<string>;
  // States
  isSwapping: boolean;
  swapError: string | null;
  // Test functions
  testSwapFunction: () => Promise<void>;
}

export const useTokenSwap = (): UseTokenSwapResult => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { refetchEthBalance, refetchYdBalance } = useWeb3();
  
  // Swap contracts
  const { writeContract: swapWrite, data: swapHash, error: swapContractError, isPending: isSwapPending } = useWriteContract();
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapHash });
  
  // States
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [currentSwapType, setCurrentSwapType] = useState<'eth-to-yd' | 'yd-to-eth' | null>(null);

  // Get ETH to YD exchange rate
  const getETHToYDRate = useCallback(async (): Promise<string> => {
    if (!publicClient) return '0';
    
    try {
      const rate = await publicClient.readContract({
        address: TOKEN_SWAP_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: TOKEN_SWAP_CONFIG.CONTRACT_ABI,
        functionName: 'getETHToYDRate',
        args: [],
      });
      
      return formatEther(rate as bigint);
    } catch (error) {
      console.error('获取ETH到YD汇率失败:', error);
      return '0';
    }
  }, [publicClient]);

  // Get YD to ETH exchange rate
  const getYDToETHRate = useCallback(async (): Promise<string> => {
    if (!publicClient) return '0';
    
    try {
      const rate = await publicClient.readContract({
        address: TOKEN_SWAP_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: TOKEN_SWAP_CONFIG.CONTRACT_ABI,
        functionName: 'getYDToETHRate',
        args: [],
      });
      
      return formatEther(rate as bigint);
    } catch (error) {
      console.error('获取YD到ETH汇率失败:', error);
      return '0';
    }
  }, [publicClient]);

  // Swap ETH for YD
  const swapETHForYD = useCallback(async (ethAmount: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    try {
      setIsSwapping(true);
      setSwapError(null);
      setCurrentSwapType('eth-to-yd');
      
      const ethAmountWei = parseEther(ethAmount);
      
      swapWrite({
        address: TOKEN_SWAP_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: TOKEN_SWAP_CONFIG.CONTRACT_ABI,
        functionName: 'swapETHForYD',
        args: [],
        value: ethAmountWei,
      });

      toast.loading('正在兑换ETH为YD...', { id: 'swap-eth-yd' });
      return true;
      
    } catch (err: any) {
      console.error('ETH to YD swap error:', err);
      const errorMessage = err?.message || '兑换失败';
      setSwapError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSwapping(false);
    }
  }, [address, swapWrite]);

  // Swap YD for ETH
  const swapYDForETH = useCallback(async (ydAmount: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    try {
      setIsSwapping(true);
      setSwapError(null);
      setCurrentSwapType('yd-to-eth');
      
      const ydAmountWei = parseEther(ydAmount);
      
      swapWrite({
        address: TOKEN_SWAP_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: TOKEN_SWAP_CONFIG.CONTRACT_ABI,
        functionName: 'swapYDForETH',
        args: [ydAmountWei],
      });

      toast.loading('正在兑换YD为ETH...', { id: 'swap-yd-eth' });
      return true;
      
    } catch (err: any) {
      console.error('YD to ETH swap error:', err);
      const errorMessage = err?.message || '兑换失败';
      setSwapError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSwapping(false);
    }
  }, [address, swapWrite]);

  // Test swap function
  const testSwapFunction = useCallback(async () => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      toast.loading('测试兑换功能...', { id: 'test-swap' });
      
      // Test with a small amount
      const testAmount = '0.001';
      const success = await swapETHForYD(testAmount);
      
      if (success) {
        toast.success('兑换功能测试成功！', { id: 'test-swap' });
      } else {
        toast.error('兑换功能测试失败', { id: 'test-swap' });
      }
    } catch (error) {
      console.error('Test swap error:', error);
      toast.error('测试兑换功能失败', { id: 'test-swap' });
    }
  }, [address, swapETHForYD]);

  // Monitor transaction status
  useEffect(() => {
    if (isSwapSuccess && currentSwapType) {
      const successMessage = currentSwapType === 'eth-to-yd' ? 'ETH兑换YD成功！' : 'YD兑换ETH成功！';
      toast.success(successMessage);
      
      // Refresh balances
      setTimeout(() => {
        refetchEthBalance();
        refetchYdBalance();
      }, 2000);
      
      setCurrentSwapType(null);
    }
  }, [isSwapSuccess, currentSwapType, refetchEthBalance, refetchYdBalance]);

  useEffect(() => {
    if (swapContractError) {
      const errorMessage = swapContractError.message || '兑换失败';
      setSwapError(errorMessage);
      toast.error(errorMessage);
      setCurrentSwapType(null);
    }
  }, [swapContractError]);

  return {
    swapETHForYD,
    swapYDForETH,
    getETHToYDRate,
    getYDToETHRate,
    isSwapping: isSwapping || isSwapPending || isSwapConfirming,
    swapError,
    testSwapFunction,
  };
};

export default useTokenSwap;