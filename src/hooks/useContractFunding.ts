import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { COURSE_CONTRACT_CONFIG } from '../config/courseContract';
import { YIDENG_REWARDS } from '../config/contract';

export const useContractFunding = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [needsFunding, setNeedsFunding] = useState(false);
  const [contractBalance, setContractBalance] = useState<string>('0');

  // 查询合约一灯币余额
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'getContractTokenBalance',
    enabled: isConnected,
  });

  // 更新合约余额状态
  useEffect(() => {
    if (balanceData) {
      const balance = formatEther(balanceData as bigint);
      setContractBalance(balance);
      
      // 检查是否需要充值
      // 计算一次创建课程奖励需要的金额
      const rewardAmount = parseFloat(YIDENG_REWARDS.CREATE_COURSE);
      const currentBalance = parseFloat(balance);
      
      // 如果余额少于10倍奖励金额，则需要充值
      const minRequiredBalance = rewardAmount * 10;
      
      if (currentBalance < minRequiredBalance) {
        setNeedsFunding(true);
        console.warn(`课程合约一灯币余额不足: ${balance} YD，建议充值至少 ${minRequiredBalance} YD`);
      } else {
        setNeedsFunding(false);
      }
    }
  }, [balanceData]);

  // 为合约充值
  const fundContract = async (amount: string) => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      const amountInWei = parseEther(amount);
      
      writeContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'fundContract',
        args: [amountInWei],
      });

      toast.loading('正在为课程合约充值...', { id: 'fund-contract' });
      
    } catch (error: any) {
      console.error('合约充值失败:', error);
      toast.error('合约充值失败: ' + error.message);
    }
  };

  // 建议充值金额（基于当前奖励配置）
  const getSuggestedFundingAmount = (): string => {
    const rewardAmount = parseFloat(YIDENG_REWARDS.CREATE_COURSE);
    // 建议充值50倍的奖励金额，确保可以支持多次课程创建
    return (rewardAmount * 50).toString();
  };

  // 检查是否为合约管理员（这里简化处理，实际应该查询合约owner）
  const isContractManager = (): boolean => {
    // 这里可以添加具体的管理员地址检查逻辑
    // 或者查询合约的owner函数
    return true; // 暂时返回true，允许所有用户看到充值提醒
  };

  return {
    contractBalance,
    needsFunding,
    fundContract,
    getSuggestedFundingAmount,
    isContractManager,
    isFunding: isPending,
    refetchBalance,
  };
};