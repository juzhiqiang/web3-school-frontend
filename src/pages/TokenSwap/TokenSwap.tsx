import React, { useState, useEffect } from 'react'
import { ArrowUpDown, Coins, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useWeb3 } from '../../contexts/Web3Context'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import { TOKEN_SWAP_CONFIG, ERROR_MESSAGES } from '../../config/tokenSwap'
import toast from 'react-hot-toast'

function TokenSwap() {
  const { isConnected, address, balance } = useWeb3()
  const {
    chainId,
    contractAddress,
    networkName,
    isLocalNetwork,
    isContractAvailable,
    exchangeRate,
    feeRates,
    contractTokenBalance,
    contractETHBalance,
    userTokenBalance,
    calculateTokensForETH,
    calculateETHForTokens,
    buyTokens,
    sellTokens,
    approveTokens,
    needsApproval,
    hasEnoughBalance,
    isLoading,
    isConfirmed,
    transactionHash,
    refetchAll,
  } = useTokenSwap()
  
  const [swapMode, setSwapMode] = useState<'buy' | 'sell'>('buy')
  const [inputAmount, setInputAmount] = useState('')
  const [slippage, setSlippage] = useState(TOKEN_SWAP_CONFIG.DEFAULT_SLIPPAGE)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 计算输出金额
  const outputAmount = swapMode === 'buy' 
    ? calculateTokensForETH(inputAmount)
    : calculateETHForTokens(inputAmount)
  
  // 重置表单
  const resetForm = () => {
    setInputAmount('')
  }
  
  // 监听交易确认
  useEffect(() => {
    if (isConfirmed) {
      toast.success('交易已确认！')
      resetForm()
    }
  }, [isConfirmed])
  
  // 切换兑换模式
  const toggleSwapMode = () => {
    setSwapMode(prev => prev === 'buy' ? 'sell' : 'buy')
    setInputAmount('')
  }
  
  // 处理最大值
  const handleMaxClick = () => {
    if (swapMode === 'buy') {
      if (balance) {
        // 留出一些ETH作为gas费用
        const maxAmount = Math.max(0, parseFloat(balance) - 0.01)
        setInputAmount(maxAmount.toFixed(6))
      }
    } else {
      setInputAmount(parseFloat(userTokenBalance).toFixed(6))
    }
  }
  
  // 检查输入有效性
  const isValidInput = (): boolean => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return false
    
    if (swapMode === 'buy') {
      return balance ? parseFloat(inputAmount) <= parseFloat(balance) : false
    } else {
      return hasEnoughBalance(inputAmount, 'token')
    }
  }
  
  // 处理兑换
  const handleSwap = async () => {
    if (!isContractAvailable) {
      toast.error(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED)
      return
    }
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    
    if (!isValidInput()) {
      toast.error(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
      return
    }
    
    if (swapMode === 'buy') {
      await buyTokens(inputAmount, slippage)
    } else {
      // 检查是否需要授权
      if (needsApproval(inputAmount)) {
        toast.error(ERROR_MESSAGES.APPROVAL_REQUIRED)
        return
      }
      await sellTokens(inputAmount, slippage)
    }
  }
  
  // 处理授权
  const handleApprove = async () => {
    if (!inputAmount) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    await approveTokens(inputAmount)
  }
  
  // 获取按钮文本和状态
  const getButtonConfig = () => {
    if (!isContractAvailable) {
      return { 
        text: `合约未部署到${networkName}`, 
        disabled: true, 
        className: 'bg-red-400',
        action: undefined
      }
    }
    
    if (isLoading) {
      return { text: '交易中...', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      return { text: '请输入金额', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!isValidInput()) {
      return { text: '余额不足', disabled: true, className: 'bg-red-400' }
    }
    
    if (swapMode === 'sell' && needsApproval(inputAmount)) {
      return { 
        text: '授权一灯币', 
        disabled: false, 
        className: 'bg-yellow-600 hover:bg-yellow-700',
        action: handleApprove
      }
    }
    
    return {
      text: `${swapMode === 'buy' ? '购买' : '出售'}一灯币`,
      disabled: false,
      className: swapMode === 'buy' 
        ? 'bg-blue-600 hover:bg-blue-700' 
        : 'bg-red-600 hover:bg-red-700',
      action: handleSwap
    }
  }
  
  const buttonConfig = getButtonConfig()
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Coins className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">一灯币兑换</h2>
          <p className="text-gray-600">请先连接您的钱包以开始兑换一灯币。</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 网络状态提示 */}
        <div className="mb-6 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isContractAvailable ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {networkName} {isLocalNetwork && '(本地网络)'}
                </p>
                <p className="text-sm text-gray-600">
                  {isContractAvailable 
                    ? `合约地址: ${contractAddress?.slice(0, 6)}...${contractAddress?.slice(-4)}`
                    : '合约未部署到当前网络'
                  }
                </p>
              </div>
            </div>
            {isLocalNetwork && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                开发环境
              </div>
            )}
          </div>
        </div>

        {/* 标题和统计信息 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold">一灯币兑换</h1>
            <button
              onClick={refetchAll}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">安全、快速的代币兑换服务</p>
          
          {isContractAvailable && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">当前兑换率</span>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-blue-600">
                  1 ETH = {exchangeRate.toLocaleString()} YD
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">手续费率</span>
                  <AlertCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-green-600">
                  买入 {feeRates.buyFee}% / 卖出 {feeRates.sellFee}%
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* 合约不可用提示 */}
        {!isContractAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">合约不可用</h4>
                <p className="text-sm text-red-700">
                  一灯币兑换合约尚未部署到当前网络 ({networkName})。
                  {isLocalNetwork && '请确保在本地网络中部署了合约，或设置正确的合约地址。'}
                </p>
                {isLocalNetwork && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>环境变量配置：VITE_LOCAL_CONTRACT_ADDRESS</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 兑换界面 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* 兑换模式选择 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSwapMode('buy')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                swapMode === 'buy'
                  ? 'bg-white shadow-sm text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              购买一灯币
            </button>
            <button
              onClick={() => setSwapMode('sell')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                swapMode === 'sell'
                  ? 'bg-white shadow-sm text-red-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              出售一灯币
            </button>
          </div>
          
          {/* 输入框 */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {swapMode === 'buy' ? '支付' : '出售'}
                </label>
                <span className="text-xs text-gray-500">
                  余额: {swapMode === 'buy' 
                    ? (balance ? `${parseFloat(balance).toFixed(6)} ETH` : '0 ETH')
                    : `${parseFloat(userTokenBalance).toFixed(6)} YD`
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.0"
                  step="any"
                  min="0"
                  disabled={!isContractAvailable}
                  className="flex-1 text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 disabled:opacity-50"
                />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">
                    {swapMode === 'buy' ? 'ETH' : 'YD'}
                  </span>
                  <button
                    onClick={handleMaxClick}
                    disabled={!isContractAvailable}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    最大
                  </button>
                </div>
              </div>
            </div>
            
            {/* 兑换箭头 */}
            <div className="flex justify-center">
              <button
                onClick={toggleSwapMode}
                disabled={!isContractAvailable}
                className="bg-white border border-gray-200 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpDown className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
            
            {/* 输出框 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  预计获得
                </label>
                {inputAmount && isContractAvailable && (
                  <span className="text-xs text-gray-500">
                    扣除手续费后
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 text-2xl font-bold text-gray-900">
                  {outputAmount && isContractAvailable ? parseFloat(outputAmount).toFixed(6) : '0.0'}
                </div>
                <span className="font-medium text-gray-700">
                  {swapMode === 'buy' ? 'YD' : 'ETH'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 交易详情 */}
          {inputAmount && parseFloat(inputAmount) > 0 && isContractAvailable && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">交易详情</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>兑换率</span>
                  <span>1 ETH = {exchangeRate.toLocaleString()} YD</span>
                </div>
                <div className="flex justify-between">
                  <span>手续费</span>
                  <span>{swapMode === 'buy' ? feeRates.buyFee : feeRates.sellFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span>滑点容差</span>
                  <span>{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>网络</span>
                  <span>{networkName}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 高级设置 */}
          {isContractAvailable && (
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center space-x-1"
              >
                <span>高级设置</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>
              
              {showAdvanced && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    滑点容差: {slippage}%
                  </label>
                  <input
                    type="range"
                    min={TOKEN_SWAP_CONFIG.MIN_SLIPPAGE}
                    max={TOKEN_SWAP_CONFIG.MAX_SLIPPAGE}
                    step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{TOKEN_SWAP_CONFIG.MIN_SLIPPAGE}%</span>
                    <span>{TOKEN_SWAP_CONFIG.MAX_SLIPPAGE}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 兑换按钮 */}
          <div className="mt-6">
            <button
              onClick={buttonConfig.action || handleSwap}
              disabled={buttonConfig.disabled}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonConfig.className} text-white`}
            >
              {buttonConfig.text}
            </button>
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
              <p className="text-xs text-blue-500 mt-1">
                网络: {networkName}
              </p>
              {!isConfirmed && (
                <p className="text-xs text-blue-500 mt-1">等待区块确认中...</p>
              )}
            </div>
          )}
        </div>
        
        {/* 用户余额信息 */}
        {isContractAvailable && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span>我的余额</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ETH</span>
                  <span className="font-medium">
                    {balance ? parseFloat(balance).toFixed(6) : '0.000000'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">一灯币 (YD)</span>
                  <span className="font-medium">
                    {parseFloat(userTokenBalance).toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>流动性池状态</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">池中ETH</span>
                  <span className="font-medium">
                    {parseFloat(contractETHBalance).toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">池中YD</span>
                  <span className="font-medium">
                    {parseFloat(contractTokenBalance).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 注意事项 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">重要提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 交易需要支付网络gas费用</li>
                <li>• 出售代币前需要先授权合约使用您的代币</li>
                <li>• 价格可能因市场波动而变化，建议设置合适的滑点容差</li>
                <li>• 交易一旦提交无法撤销，请仔细确认金额</li>
                {isLocalNetwork && (
                  <li>• 当前使用本地测试网络，交易仅用于测试目的</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSwap