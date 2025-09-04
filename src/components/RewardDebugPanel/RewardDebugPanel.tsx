import React from 'react';
import { useRewardTracking } from '../../hooks/useRewardTracking';
import { useAccount } from 'wagmi';
import { Activity, Coins, AlertCircle } from 'lucide-react';

const RewardDebugPanel: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { recentRewards, isListening, contractTokenBalance, ydTokenAddress } = useRewardTracking();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-900">奖励系统调试信息</h4>
        <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <p><strong>监听状态:</strong> {isListening ? '✅ 正在监听' : '❌ 未监听'}</p>
          <p><strong>合约余额:</strong> {contractTokenBalance} YD</p>
          <p><strong>一灯币合约:</strong> {ydTokenAddress ? `${ydTokenAddress.slice(0, 6)}...` : '未知'}</p>
        </div>
        <div>
          <p><strong>当前用户:</strong> {address ? `${address.slice(0, 6)}...` : '未连接'}</p>
          <p><strong>最近奖励事件:</strong> {recentRewards.length} 条</p>
        </div>
      </div>

      {recentRewards.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">最近奖励记录:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {recentRewards.slice(0, 3).map((reward, index) => (
              <div key={index} className="text-xs bg-white rounded p-2 flex items-center space-x-2">
                <Coins className="h-3 w-3 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{reward.rewardAmount} YD</span>
                  <span className="ml-2 text-gray-500">给 {reward.instructor.slice(0, 6)}...</span>
                  <span className="ml-2 text-gray-400">课程 {reward.uuid.slice(0, 8)}...</span>
                </div>
                {reward.instructor.toLowerCase() === address?.toLowerCase() && (
                  <span className="text-green-600 text-xs">您的</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parseFloat(contractTokenBalance) === 0 && (
        <div className="mt-3 flex items-start space-x-2 text-xs">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-red-600">
            <p className="font-medium">合约余额为零！</p>
            <p>这会导致奖励发放失败。请联系管理员充值。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardDebugPanel;