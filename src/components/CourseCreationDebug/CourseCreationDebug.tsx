import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Coins, Eye, RefreshCw } from 'lucide-react';
import { useRewardTracking } from '../../hooks/useRewardTracking';
import { useContractFunding } from '../../hooks/useContractFunding';
import { useAccount } from 'wagmi';
import { YIDENG_REWARDS } from '../../config/contract';

const CourseCreationDebug: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { address, isConnected } = useAccount();
  const { 
    recentRewards, 
    isListening, 
    isLoadingHistory,
    fetchRecentRewardEvents, 
    contractTokenBalance 
  } = useRewardTracking();
  const { contractBalance, needsFunding, isContractManager } = useContractFunding();

  if (!isConnected) return null;

  const contractBalanceNum = parseFloat(contractTokenBalance);
  const requiredReward = parseFloat(YIDENG_REWARDS.CREATE_COURSE);
  const canPayReward = contractBalanceNum >= requiredReward;
  const isManager = isContractManager();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>课程创建调试信息</span>
          {!canPayReward && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          {/* 合约状态 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">合约状态</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-600">合约余额</span>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{contractTokenBalance} YD</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-600">奖励发放状态</span>
                <div className="flex items-center space-x-2">
                  {canPayReward ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${canPayReward ? 'text-green-600' : 'text-red-600'}`}>
                    {canPayReward ? '正常' : '余额不足'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-600">事件监听</span>
                <div className="flex items-center space-x-2">
                  {isListening ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${isListening ? 'text-green-600' : 'text-red-600'}`}>
                    {isListening ? '正常' : '未启动'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-600">管理员权限</span>
                <div className="flex items-center space-x-2">
                  {isManager ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`font-medium ${isManager ? 'text-green-600' : 'text-gray-500'}`}>
                    {isManager ? '是' : '否'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 奖励配置 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">奖励配置</h4>
            <div className="p-3 bg-blue-50 rounded border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">创建课程奖励</span>
                  <div className="font-medium text-blue-600">{YIDENG_REWARDS.CREATE_COURSE} YD</div>
                </div>
                <div>
                  <span className="text-gray-600">完成课程奖励</span>
                  <div className="font-medium text-blue-600">{YIDENG_REWARDS.COMPLETE_COURSE} YD</div>
                </div>
              </div>
            </div>
          </div>

          {/* 最近奖励事件 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">
                最近奖励事件 ({recentRewards.length})
              </h4>
              <button
                onClick={() => {
                  console.log('🔄 手动刷新奖励事件...');
                  fetchRecentRewardEvents();
                }}
                disabled={isLoadingHistory}
                className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                {isLoadingHistory ? '加载中...' : '刷新'}
              </button>
            </div>
            
            {isLoadingHistory ? (
              <div className="p-3 bg-blue-50 rounded text-sm text-blue-600 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                正在加载奖励事件历史记录...
              </div>
            ) : recentRewards.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentRewards.slice(0, 8).map((reward, index) => (
                  <div 
                    key={`${reward.transactionHash}-${reward.uuid}`} 
                    className={`p-3 border rounded text-xs ${ 
                      reward.instructor.toLowerCase() === address?.toLowerCase() 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {reward.instructor.slice(0, 8)}...{reward.instructor.slice(-6)}
                        {reward.instructor.toLowerCase() === address?.toLowerCase() && (
                          <span className="ml-1 text-green-600 font-bold">(您)</span>
                        )}
                      </span>
                      <span className="text-green-600 font-medium">{reward.rewardAmount} YD</span>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>课程ID:</span>
                        <span className="font-mono text-xs">{reward.uuid.slice(0, 12)}...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>区块高度:</span>
                        <span>#{reward.blockNumber}</span>
                      </div>
                      {reward.transactionHash && (
                        <div className="flex items-center justify-between">
                          <span>交易哈希:</span>
                          <span className="font-mono text-xs">{reward.transactionHash.slice(0, 8)}...{reward.transactionHash.slice(-6)}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {reward.timestamp ? new Date(reward.timestamp).toLocaleString() : '时间未知'}
                      </div>
                    </div>
                  </div>
                ))}
                {recentRewards.length > 8 && (
                  <div className="text-center text-xs text-gray-500">
                    还有 {recentRewards.length - 8} 条记录...
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                <div className="text-center">
                  <p>暂无奖励事件记录</p>
                  <p className="text-xs mt-1">创建课程后，奖励事件将显示在这里</p>
                </div>
              </div>
            )}
          </div>

          {/* 诊断建议 */}
          {!canPayReward && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="text-sm font-semibold text-red-800 mb-1">诊断建议</h4>
              <div className="text-sm text-red-700">
                <p>• 合约余额不足以发放创建课程奖励</p>
                <p>• 需要 {requiredReward} YD，当前仅有 {contractBalanceNum} YD</p>
                {isManager && <p>• 作为管理员，您可以使用上方的充值功能</p>}
                {!isManager && <p>• 请联系合约管理员进行充值</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCreationDebug;