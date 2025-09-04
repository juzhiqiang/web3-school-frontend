import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { getYiDengTokenAddress, formatYiDengAmount } from '../config/yidengToken';
import toast from 'react-hot-toast';

// ERC-20 标准ABI（简化版）
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

interface UseYiDengTokenResult {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  refetchBalance: () => Promise<void>;
  hasEnoughBalance: (amount: string) => boolean;
  approveToken: (spender: string, amount: string) => Promise<boolean>;
  checkAllowance: (spender: string) => Promise<string>;
}

export const useYiDengToken = (): UseYiDengTokenResult => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error('请安装MetaMask或其他Web3钱包');
  };

  const getTokenContract = async () => {
    try {
      const provider = getProvider();
      const tokenAddress = getYiDengTokenAddress(chainId);
      return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (error) {
      console.error('获取代币合约失败:', error);
      throw error;
    }
  };

  const fetchBalance = async (): Promise<void> => {
    if (!address || !isConnected) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getTokenContract();
      const balanceWei = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      const balanceFormatted = ethers.formatUnits(balanceWei, decimals);
      setBalance(balanceFormatted);
      
      console.log(`一灯币余额: ${formatYiDengAmount(balanceFormatted)} YD`);
      
    } catch (error) {
      console.error('获取一灯币余额失败:', error);
      setError('获取余额失败');
      toast.error('获取一灯币余额失败');
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughBalance = (amount: string): boolean => {
    if (!balance) return false;
    const balanceNum = parseFloat(balance);
    const amountNum = parseFloat(amount);
    return balanceNum >= amountNum;
  };

  const approveToken = async (spender: string, amount: string): Promise<boolean> => {
    if (!address || !isConnected) {
      toast.error('请先连接钱包');
      return false;
    }

    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = await getTokenContract();
      const contractWithSigner = contract.connect(signer);

      const decimals = await contract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      console.log(`授权 ${formatYiDengAmount(amount)} YD 给合约: ${spender}`);
      
      const tx = await contractWithSigner.approve(spender, amountWei);
      toast.loading('授权交易进行中...', { id: 'approve' });
      
      await tx.wait();
      toast.success('授权成功！', { id: 'approve' });
      
      return true;
    } catch (error) {
      console.error('授权失败:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          toast.error('用户取消了授权', { id: 'approve' });
        } else {
          toast.error(`授权失败: ${error.message}`, { id: 'approve' });
        }
      } else {
        toast.error('授权失败，请重试', { id: 'approve' });
      }
      
      return false;
    }
  };

  const checkAllowance = async (spender: string): Promise<string> => {
    if (!address || !isConnected) return '0';

    try {
      const contract = await getTokenContract();
      const allowanceWei = await contract.allowance(address, spender);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(allowanceWei, decimals);
    } catch (error) {
      console.error('检查授权额度失败:', error);
      return '0';
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, isConnected, chainId]);

  return {
    balance,
    isLoading,
    error,
    refetchBalance: fetchBalance,
    hasEnoughBalance,
    approveToken,
    checkAllowance
  };
};

export default useYiDengToken;
