import React from 'react';
import { AlertTriangle, Coins, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContractFunding } from '../../hooks/useContractFunding';

const ContractFundingWarning: React.FC = () => {
  const {
    contractBalance,
    needsFunding,
    fundContract,
    getSuggestedFundingAmount,
    isContractManager,
    isFunding,
    refetchBalance,
  } = useContractFunding();

  // 如果不需要充值且不是管理员，不显示警告
  if (!needsFunding && !isContractManager()) {
    return null;
  }

  // 如果需要充值但不是管理员，显示只读信息
  const isManager = isContractManager();

  const handleFundContract = () => {
    if (!isManager) {
      toast.error('只有合约管理员才能进行充值操作');
      return;
    }
    const suggestedAmount = getSuggestedFundingAmount();
    fundContract(suggestedAmount);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            课程合约资金提醒
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              课程合约当前余额：<span className="font-semibold">{parseFloat(contractBalance).toFixed(2)} 一灯币</span>
            </p>
            {needsFunding && (
              <p className="mt-1">
                余额较低，可能影响课程创建奖励发放。建议充值至少 {getSuggestedFundingAmount()} 一灯币。
              </p>
            )}
            {parseFloat(contractBalance) === 0 && (
              <p className="mt-1 text-red-600 font-medium">
                ⚠️ 合约余额为零，无法发放任何奖励！
              </p>
            )}
          </div>
          
          <div className="mt-3 flex items-center space-x-3">
            {isManager ? (
              <button
                onClick={handleFundContract}
                disabled={isFunding}
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFunding ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    充值中...
                  </>
                ) : (
                  <>
                    <Coins className="h-3 w-3 mr-1" />
                    充值 {getSuggestedFundingAmount()} 一灯币
                  </>
                )}
              </button>
            ) : needsFunding ? (
              <div className="inline-flex items-center px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">
                <AlertTriangle className="h-3 w-3 mr-1" />
                需联系管理员充值
              </div>
            ) : null}
            
            <button
              onClick={refetchBalance}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-yellow-700 hover:text-yellow-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              刷新余额
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractFundingWarning;