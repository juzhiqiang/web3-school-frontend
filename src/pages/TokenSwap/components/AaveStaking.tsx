import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Info,
  Bug,
} from 'lucide-react';
import { useAave } from '../../../hooks/useAave';
import { useWeb3 } from '../../../contexts/Web3Context';

interface AaveStakingProps {
  onRefresh?: () => void;
}

const AaveStaking: React.FC<AaveStakingProps> = ({ onRefresh }) => {
  const { isConnected } = useWeb3();
  const {
    isNetworkSupported,
    aaveConfig,
    usdtBalance,
    aUsdtBalance,
    allowance,
    depositData,
    userData,
    isLoading,
    isConfirmed,
    transactionHash,
    needsApproval,
    hasEnoughBalance,
    hasEnoughATokenBalance,
    approveUsdt,
    supplyUsdt,
    withdrawUsdt,
    refetchAll,
    calculateExpectedReturn,
    formatNumber,
    debugUsdtBalance, // 添加调试函数
  } = useAave();

  const [activeTab, setActiveTab] = useState<'stake' | 'withdraw'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // 新增调试面板状态

  // 重置表单
  const resetForm = () => {
    setStakeAmount('');
    setWithdrawAmount('');
  };

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed) {
      resetForm();
      if (onRefresh) {
        onRefresh();
      }
    }
  }, [isConfirmed, onRefresh]);

  // 处理最大值点击
  const handleMaxClick = (type: 'stake' | 'withdraw') => {
    if (type === 'stake') {
      setStakeAmount(parseFloat(usdtBalance).toFixed(6));
    } else {
      setWithdrawAmount(parseFloat(aUsdtBalance).toFixed(6));
    }
  };

  // 处理调试按钮点击
  const handleDebugClick = async () => {
    console.log('🐛 开始调试USDT余额...');
    if (debugUsdtBalance) {
      await debugUsdtBalance();
    } else {
      console.error('❌ debugUsdtBalance 函数不可用');
    }
  };

  // 获取按钮配置
  const getStakeButtonConfig = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return {
        text: '请输入质押金额',
        disabled: true,
        className: 'bg-gray-400',
        action: undefined,
      };
    }

    if (!hasEnoughBalance(stakeAmount)) {
      return {
        text: 'USDT余额不足',
        disabled: true,
        className: 'bg-red-400',
        action: undefined,
      };
    }

    if (needsApproval(stakeAmount)) {
      return {
        text: '授权USDT (一次性)',
        disabled: false,
        className: 'bg-yellow-600 hover:bg-yellow-700',
        action: () => approveUsdt(stakeAmount),
      };
    }

    return {
      text: '质押到AAVE',
      disabled: false,
      className: 'bg-green-600 hover:bg-green-700',
      action: () => supplyUsdt(stakeAmount),
    };
  };

  const getWithdrawButtonConfig = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return {
        text: '请输入提取金额',
        disabled: true,
        className: 'bg-gray-400',
        action: undefined,
      };
    }

    if (!hasEnoughATokenBalance(withdrawAmount)) {
      return {
        text: '余额不足',
        disabled: true,
        className: 'bg-red-400',
        action: undefined,
      };
    }

    return {
      text: '提取USDT',
      disabled: false,
      className: 'bg-blue-600 hover:bg-blue-700',
      action: () => withdrawUsdt(withdrawAmount),
    };
  };

  const stakeButtonConfig = getStakeButtonConfig();
  const withdrawButtonConfig = getWithdrawButtonConfig();

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">AAVE理财</h3>
          <p className="text-gray-600">请先连接钱包以使用AAVE理财功能</p>
        </div>
      </div>
    );
  }

  if (!isNetworkSupported) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                网络不支持
              </h4>
              <p className="text-sm text-yellow-700">
                当前网络不支持AAVE协议。请切换到以太坊主网、Polygon或其他支持的网络。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold">AAVE理财</h3>
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {aaveConfig?.name}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 调试按钮 */}
          <button
            onClick={handleDebugClick}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="调试USDT余额获取"
          >
            <Bug className="h-5 w-5" />
          </button>
          {/* 刷新按钮 */}
          <button
            onClick={() => {
              refetchAll();
              if (onRefresh) onRefresh();
            }}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="刷新AAVE数据"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 调试信息面板 */}
      <div className="mb-6">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center space-x-1"
        >
          <Bug className="h-4 w-4" />
          <span>调试信息</span>
          <span>{showDebug ? '▲' : '▼'}</span>
        </button>

        {showDebug && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <h4 className="font-semibold text-red-800 mb-2">USDT余额调试</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">当前USDT余额:</span>
                  <p className="font-mono bg-white px-2 py-1 rounded">{usdtBalance || '获取中...'}</p>
                </div>
                <div>
                  <span className="text-gray-600">网络支持状态:</span>
                  <p className={`font-mono px-2 py-1 rounded ${isNetworkSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isNetworkSupported ? '✅ 支持' : '❌ 不支持'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">USDT合约地址:</span>
                  <p className="font-mono bg-white px-2 py-1 rounded text-xs break-all">
                    {aaveConfig?.usdtAddress || '未获取'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">链ID:</span>
                  <p className="font-mono bg-white px-2 py-1 rounded">
                    {aaveConfig?.chainId || '未获取'}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleDebugClick}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  运行余额调试
                </button>
                <p className="text-xs text-red-600 mt-1">
                  点击按钮查看控制台详细调试信息
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 余额信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">USDT余额</span>
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatNumber(usdtBalance)} USDT
          </p>
          {usdtBalance === '0' && (
            <p className="text-xs text-red-500 mt-1">⚠️ 余额为0，请检查</p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">质押余额</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-lg font-bold text-green-600">
            {formatNumber(aUsdtBalance)} aUSDT
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">年化收益率</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600">
            {depositData.apy}%
          </p>
        </div>
      </div>

      {/* 收益信息 */}
      {parseFloat(aUsdtBalance) > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">预期收益计算</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">日收益</p>
              <p className="text-sm font-bold text-green-600">
                +{calculateExpectedReturn(aUsdtBalance, 1)} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">月收益</p>
              <p className="text-sm font-bold text-green-600">
                +{calculateExpectedReturn(aUsdtBalance, 30)} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">年收益</p>
              <p className="text-sm font-bold text-green-600">
                +{calculateExpectedReturn(aUsdtBalance, 365)} USDT
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 操作选项卡 */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'stake'
              ? 'bg-white shadow-sm text-green-600 font-medium'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>质押理财</span>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'withdraw'
              ? 'bg-white shadow-sm text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" />
          <span>提取收益</span>
        </button>
      </div>

      {/* 质押界面 */}
      {activeTab === 'stake' && (
        <div className="space-y-4">
          {/* 输入框 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                质押金额
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">可用:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatNumber(usdtBalance)} USDT
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                step="any"
                min="0"
                disabled={!isNetworkSupported}
                className="flex-1 text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 disabled:opacity-50"
              />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">USDT</span>
                <button
                  onClick={() => handleMaxClick('stake')}
                  disabled={!isNetworkSupported}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  最大
                </button>
              </div>
            </div>
          </div>

          {/* 预期收益显示 */}
          {stakeAmount && parseFloat(stakeAmount) > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                预期收益 (年化{depositData.apy}%)
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs text-green-700">
                <div className="text-center">
                  <p className="text-gray-600">日收益</p>
                  <p className="font-bold">
                    +{calculateExpectedReturn(stakeAmount, 1)} USDT
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">月收益</p>
                  <p className="font-bold">
                    +{calculateExpectedReturn(stakeAmount, 30)} USDT
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">年收益</p>
                  <p className="font-bold">
                    +{calculateExpectedReturn(stakeAmount, 365)} USDT
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 授权状态提示 */}
          {stakeAmount && parseFloat(stakeAmount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">授权状态:</span>
                <span
                  className={`font-medium ${
                    needsApproval(stakeAmount)
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {needsApproval(stakeAmount) ? '需要授权' : '已授权'}
                </span>
              </div>
              {needsApproval(stakeAmount) ? (
                <p className="text-xs text-yellow-600 mt-1">
                  质押USDT前需要先授权AAVE协议使用您的代币（一次性授权，之后无需重复）
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1">
                  ✅ 已授权，可以直接进行质押
                </p>
              )}
            </div>
          )}

          {/* 质押按钮 */}
          <button
            onClick={stakeButtonConfig.action}
            disabled={stakeButtonConfig.disabled || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${stakeButtonConfig.className} text-white`}
          >
            {isLoading ? '处理中...' : stakeButtonConfig.text}
          </button>
        </div>
      )}

      {/* 提取界面 */}
      {activeTab === 'withdraw' && (
        <div className="space-y-4">
          {parseFloat(aUsdtBalance) <= 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                暂无质押资产
              </h4>
              <p className="text-gray-500">
                您还没有在AAVE中质押任何USDT，先去质押一些资产开始赚取收益吧！
              </p>
            </div>
          ) : (
            <>
              {/* 输入框 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    提取金额
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">可提取:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatNumber(aUsdtBalance)} USDT
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    min="0"
                    disabled={!isNetworkSupported}
                    className="flex-1 text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 disabled:opacity-50"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">USDT</span>
                    <button
                      onClick={() => handleMaxClick('withdraw')}
                      disabled={!isNetworkSupported}
                      className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      全部
                    </button>
                  </div>
                </div>
              </div>

              {/* 提取按钮 */}
              <button
                onClick={withdrawButtonConfig.action}
                disabled={withdrawButtonConfig.disabled || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${withdrawButtonConfig.className} text-white`}
              >
                {isLoading ? '处理中...' : withdrawButtonConfig.text}
              </button>
            </>
          )}
        </div>
      )}

      {/* 高级信息 */}
      <div className="mt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center space-x-1"
        >
          <span>高级信息</span>
          <span>{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">总抵押价值:</span>
                <p className="font-semibold">${formatNumber(userData.totalCollateral, 2)}</p>
              </div>
              <div>
                <span className="text-gray-500">健康系数:</span>
                <p className={`font-semibold ${
                  parseFloat(userData.healthFactor) > 2 
                    ? 'text-green-600' 
                    : parseFloat(userData.healthFactor) > 1.5 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {parseFloat(userData.healthFactor) > 100 ? '∞' : formatNumber(userData.healthFactor, 2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">AAVE池地址:</span>
                <p className="font-mono text-xs">
                  {aaveConfig?.poolAddress.slice(0, 6)}...{aaveConfig?.poolAddress.slice(-4)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">当前授权额度:</span>
                <p className="font-semibold">{formatNumber(allowance)} USDT</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 交易状态 */}
      {transactionHash && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">
              {isConfirmed ? '交易已确认' : '交易已提交'}
            </span>
          </div>
          <p className="text-xs text-blue-600 break-all">
            交易哈希: {transactionHash}
          </p>
          <p className="text-xs text-blue-500 mt-1">网络: {aaveConfig?.name}</p>
          {!isConfirmed && (
            <p className="text-xs text-blue-500 mt-1">等待区块确认中...</p>
          )}
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">AAVE理财说明:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>质押USDT到AAVE协议可获得稳定的利息收益</li>
              <li>收益率会根据市场供需情况实时调整</li>
              <li>您可以随时提取本金和收益，无锁定期</li>
              <li>质押资产受AAVE协议安全保障</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AaveStaking;