import React, { useState, useEffect } from 'react'
import { ArrowUpDown, Coins, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useWeb3 } from '../../contexts/Web3Context'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import toast from 'react-hot-toast'

function TokenSwap() {
  const { isConnected, address } = useWeb3()
  const {
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
    isLoading,
    isConfirmed,
    transactionHash,
  } = useTokenSwap()
  
  const [swapMode, setSwapMode] = useState<'buy' | 'sell'>('buy')
  const [inputAmount, setInputAmount] = useState('')
  const [slippage, setSlippage] = useState(1) // 默认1%滑点
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
      // 这里可以设置用户ETH余额，暂时设为空
      setInputAmount('')
    } else {
      setInputAmount(parseFloat(userTokenBalance).toFixed(6))
    }
  }
  
  // 处理兑换
  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error('请输入有效金额')
      return
    }
    
    if (swapMode === 'buy') {
      await buyTokens(inputAmount, slippage)
    } else {
      // 检查是否需要授权
      if (needsApproval(inputAmount)) {
        toast.error('请先授权代币')
        return
      }
      await sellTokens(inputAmount, slippage)
    }
  }
  
  // 处理授权
  const handleApprove = async () => {
    if (!inputAmount) {
      toast.error('请输入金额')
      return
    }
    await approveTokens(inputAmount)
  }
  
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
        {/* 标题和统计信息 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">一灯币兑换</h1>
          <p className="text-gray-600 mb-6">安全、快速的代币兑换服务</p>
          
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
        </div>
        
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
                  余额: {swapMode === 'buy' ? 'ETH' : parseFloat(userTokenBalance).toFixed(6)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 text-2xl font-bold bg-transparent border-none outline-none"
                />
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{swapMode === 'buy' ? 'ETH' : 'YD'}</span>
                  <button
                    onClick={handleMaxClick}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
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
                className="bg-white border border-gray-200 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <ArrowUpDown className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
            
            {/* 输出框 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {swapMode === 'buy' ? '获得' : '获得'}
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 text-2xl font-bold text-gray-900">
                  {outputAmount ? parseFloat(outputAmount).toFixed(6) : '0.0'}
                </div>
                <span className="font-medium">{swapMode === 'buy' ? 'YD' : 'ETH'}</span>
              </div>
            </div>
          </div>
          
          {/* 高级设置 */}
          <div className="mt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 hover:text-gray-800 mb-2"
            >
              高级设置 {showAdvanced ? '▲' : '▼'}
            </button>
            
            {showAdvanced && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  滑点容差: {slippage}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* 兑换按钮 */}
          <div className="mt-6">
            {swapMode === 'sell' && inputAmount && needsApproval(inputAmount) ? (
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '授权中...' : '授权一灯币'}
              </button>
            ) : (
              <button
                onClick={handleSwap}
                disabled={isLoading || !inputAmount || parseFloat(inputAmount) <= 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  swapMode === 'buy'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isLoading 
                  ? '交易中...' 
                  : `${swapMode === 'buy' ? '购买' : '出售'}一灯币`
                }
              </button>
            )}
          </div>
          
          {/* 交易状态 */}
          {transactionHash && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">交易已提交</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 break-all">
                交易哈希: {transactionHash}
              </p>
            </div>
          )}
        </div>
        
        {/* 用户余额信息 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">我的余额</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">一灯币 (YD)</span>
                <span className="font-medium">{parseFloat(userTokenBalance).toFixed(6)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">流动性池状态</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">池中ETH</span>
                <span className="font-medium">{parseFloat(contractETHBalance).toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">池中YD</span>
                <span className="font-medium">{parseFloat(contractTokenBalance).toFixed(2)} YD</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 注意事项 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">重要提示</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• 交易需要支付gas费用</li>
                <li>• 出售代币前需要先授权合约</li>
                <li>• 价格可能因市场波动而变化</li>
                <li>• 建议设置合适的滑点容差以防交易失败</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSwap
