import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { YIDENG_TOKEN_CONFIG, COURSE_CONTRACT_CONFIG } from '../config/contract';
import toast from 'react-hot-toast';

export interface UseYiDengTokenResult {
  // Token operations
  approve: (spender: string, amount: string) => Promise<boolean>;
  checkAndRequestApproval: (amount: string) => Promise<boolean>;
  getAllowance: (owner: string, spender: string) => Promise<string>;
  getBalance: (address: string) => Promise<string>;
  
  // States
  isApproving: boolean;
  approvalError: string | null;
  
  // Current user states
  balance: string;
  allowanceForCourse: string;
}

export const useYiDengToken = (): UseYiDengTokenResult => {
  const { address } = useAccount();
  
  // Contract hooks
  const { writeContract: approveWrite, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  
  // States
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [allowanceForCourse, setAllowanceForCourse] = useState('0');

  // Read contract data
  const { data: contractBalance } = useReadContract({
    address: YIDENG_TOKEN_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: YIDENG_TOKEN_CONFIG.CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: contractAllowance } = useReadContract({
    address: YIDENG_TOKEN_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: YIDENG_TOKEN_CONFIG.CONTRACT_ABI,
    functionName: 'allowance',
    args: address ? [address, COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Approve tokens
  const approve = useCallback(async (spender: string, amount: string): Promise<boolean> => {
    if (!address) {
      toast.error('请先连接钱包');
      return false;
    }

    try {
      setIsApproving(true);
      setApprovalError(null);
      
      const amountWei = parseEther(amount);
      
      const contract = {
        address: YIDENG_TOKEN_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: YIDENG_TOKEN_CONFIG.CONTRACT_ABI,
      };
      
      // 通过writeContract调用approve函数
      approveWrite({
        ...contract,
        functionName: 'approve',
        args: [spender as `0x${string}`, amountWei],
      });

      toast.loading('正在授权代币...', { id: 'token-approval' });
      return true;
      
    } catch (err: any) {
      console.error('Token approval error:', err);
      const errorMessage = err?.message || '授权失败';
      setApprovalError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [address, approveWrite]);

  // Check and request approval if needed
  const checkAndRequestApproval = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const currentAllowance = await getAllowance(address, COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS);
      const requiredAmount = parseFloat(amount);
      const currentAllowanceAmount = parseFloat(currentAllowance);
      
      if (currentAllowanceAmount >= requiredAmount) {
        return true; // Already approved
      }
      
      // Need to approve
      toast.info('需要授权代币，请确认授权交易');
      return await approve(COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS, amount);
      
    } catch (error) {
      console.error('Check approval error:', error);
      return false;
    }
  }, [address, approve]);

  // Get allowance
  const getAllowance = useCallback(async (owner: string, spender: string): Promise<string> => {
    try {
      // This would typically use a read contract call
      // For now, return the stored allowance
      return allowanceForCourse;
    } catch (error) {
      console.error('Get allowance error:', error);
      return '0';
    }
  }, [allowanceForCourse]);

  // Get balance
  const getBalance = useCallback(async (userAddress: string): Promise<string> => {
    try {
      // This would typically use a read contract call
      // For now, return the stored balance
      return balance;
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }, [balance]);

  // Update balance and allowance from contract reads
  useEffect(() => {
    if (contractBalance) {
      setBalance(formatEther(contractBalance as bigint));
    }
  }, [contractBalance]);

  useEffect(() => {
    if (contractAllowance) {
      setAllowanceForCourse(formatEther(contractAllowance as bigint));
    }
  }, [contractAllowance]);

  // Monitor approval success
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('代币授权成功！', { id: 'token-approval' });
      setApprovalError(null);
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    if (approveError) {
      const errorMessage = approveError.message || '授权失败';
      setApprovalError(errorMessage);
      toast.error(errorMessage, { id: 'token-approval' });
    }
  }, [approveError]);

  return {
    approve,
    checkAndRequestApproval,
    getAllowance,
    getBalance,
    isApproving: isApproving || isApprovePending || isApproveConfirming,
    approvalError,
    balance,
    allowanceForCourse,
  };
};

export default useYiDengToken;