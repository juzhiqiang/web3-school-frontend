import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { COURSE_CONTRACT_CONFIG } from '../../config/courseContract';
import { getYiDengTokenAddress } from '../../config/yidengToken';
import { Play, RefreshCw } from 'lucide-react';

const ContractTestPanel: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [testAmount, setTestAmount] = useState('1');

  // 查询合约所有者
  const { data: contractOwner, refetch: refetchOwner } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'owner',
    enabled: isConnected,
  });

  // 查询一灯币合约地址
  const { data: ydTokenFromContract } = useReadContract({
    address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
    abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
    functionName: 'ydToken',
    enabled: isConnected,
  });

  // 测试合约充值
  const handleTestFunding = async () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      const amountInWei = parseEther(testAmount);
      
      writeContract({
        address: COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`,
        abi: COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
        functionName: 'fundContract',
        args: [amountInWei],
      });

      toast.loading(`正在测试充值 ${testAmount} 一灯币...`, { id: 'test-funding' });
    } catch (error: any) {
      console.error('测试充值失败:', error);
      toast.error('测试充值失败: ' + error.message);
    }
  };

  if (!isConnected) {
    return null;
  }

  const isOwner = contractOwner && address && 
    contractOwner.toString().toLowerCase() === address.toLowerCase();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-blue-900 mb-3">合约测试面板</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <p><strong>合约地址:</strong></p>
          <p className="font-mono text-blue-700 break-all">
            {COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS}
          </p>
          
          <p><strong>合约所有者:</strong></p>
          <p className="font-mono text-blue-700">
            {contractOwner ? contractOwner.toString() : '加载中...'}
          </p>
          
          <p><strong>当前用户:</strong></p>
          <p className="font-mono text-blue-700">{address}</p>
          
          <p><strong>是否为所有者:</strong> 
            <span className={isOwner ? 'text-green-600' : 'text-red-600'}>
              {isOwner ? ' ✅ 是' : ' ❌ 否'}
            </span>
          </p>
        </div>
        
        <div className="space-y-2">
          <p><strong>合约中的一灯币地址:</strong></p>
          <p className="font-mono text-blue-700 break-all">
            {ydTokenFromContract ? ydTokenFromContract.toString() : '加载中...'}
          </p>
          
          <p><strong>配置中的一灯币地址:</strong></p>
          <p className="font-mono text-blue-700 break-all">
            {chainId ? getYiDengTokenAddress(chainId) : '未知网络'}
          </p>
          
          <p><strong>地址匹配:</strong>
            <span className={
              ydTokenFromContract && chainId && 
              ydTokenFromContract.toString().toLowerCase() === getYiDengTokenAddress(chainId).toLowerCase()
                ? 'text-green-600' : 'text-red-600'
            }>
              {ydTokenFromContract && chainId && 
               ydTokenFromContract.toString().toLowerCase() === getYiDengTokenAddress(chainId).toLowerCase()
                ? ' ✅ 匹配' : ' ❌ 不匹配'}
            </span>
          </p>
        </div>
      </div>

      {isOwner && (
        <div className="mt-4 border-t border-blue-200 pt-3">
          <p className="text-sm font-medium text-blue-900 mb-2">测试充值功能:</p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-24 px-2 py-1 text-sm border border-blue-300 rounded"
              placeholder="金额"
            />
            <button
              onClick={handleTestFunding}
              disabled={isPending}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              测试充值
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTestPanel;