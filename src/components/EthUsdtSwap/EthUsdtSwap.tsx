import { useState, useEffect } from 'react'
import { ArrowUpDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useWeb3 } from '../../contexts/Web3Context'
import { useUniswapETHUSDT } from '../../hooks/useUniswapETHUSDT'
import { ERROR_MESSAGES } from '../../config/tokenSwap'
import toast from 'react-hot-toast'

interface EthUsdtSwapProps {
  onRefresh?: () => void
}

function EthUsdtSwap({ onRefresh }: EthUsdtSwapProps) {
  const { balance, networkName } = useWeb3()
  
  // Uniswap hook
  const {
    isNetworkSupported: isUniswapSupported,
    usdtBalance,
    calculateSwapAmount: calculateUniswapAmount,
    swapETHForUSDT,
    swapUSDTForETH,
    approveUSDT,
    needsUSDTApproval,
    slippage: uniswapSlippage,
    setSlippage: setUniswapSlippage,
    isLoading: isUniswapLoading,
    isConfirmed: isUniswapConfirmed,
    transactionHash: uniswapHash,
    refetchAll: refetchUniswap
  } = useUniswapETHUSDT()
  
  const [uniswapMode, setUniswapMode] = useState<'eth-to-usdt' | 'usdt-to-eth'>('eth-to-usdt')
  const [inputAmount, setInputAmount] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 计算输出金额
  const outputAmount = calculateUniswapAmount(inputAmount, uniswapMode === 'eth-to-usdt')
  
  // 重置表单
  const resetForm = () => {
    setInputAmount('')
  }
  
  // 监听交易确认
  useEffect(() => {
    if (isUniswapConfirmed) {
      toast.success('🎉 ETH-USDT兑换已确认！正在更新余额...')
      resetForm()
      
      // 通知父组件刷新
      if (onRefresh) {
        onRefresh()
      }
      
      setTimeout(() => {
        toast.success('✅ ETH和USDT余额已更新完成！')
      }, 3000)
    }
  }, [isUniswapConfirmed, onRefresh])
  
  // 切换兑换模式
  const toggleSwapMode = () => {
    setUniswapMode(prev => prev === 'eth-to-usdt' ? 'usdt-to-eth' : 'eth-to-usdt')
    setInputAmount('')
  }
  
  // 处理最大值
  const handleMaxClick = () => {
    if (uniswapMode === 'eth-to-usdt') {
      if (balance) {
        // 留出一些ETH作为gas费用
        const maxAmount = Math.max(0, parseFloat(balance) - 0.01)
        setInputAmount(maxAmount.toFixed(6))
      }
    } else {
      setInputAmount(parseFloat(usdtBalance).toFixed(6))
    }
  }
  
  // 检查输入有效性
  const isValidInput = (): boolean => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return false
    
    if (uniswapMode === 'eth-to-usdt') {
      return balance ? parseFloat(inputAmount) <= parseFloat(balance) : false
    } else {
      return parseFloat(inputAmount) <= parseFloat(usdtBalance)
    }
  }
  
  // 处理兑换
  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    
    if (!isValidInput()) {
      toast.error(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
      return
    }
    
    console.log('🚀 开始Uniswap兑换操作:', {
      mode: uniswapMode,
      inputAmount,
      slippage: uniswapSlippage,
      userETHBalance: balance,
      userUSDTBalance: usdtBalance
    })
    
    if (uniswapMode === 'eth-to-usdt') {
      await swapETHForUSDT(inputAmount)
    } else {
      await swapUSDTForETH(inputAmount)
    }
  }
  
  // 处理USDT授权
  const handleUSDTApprove = async () => {
    if (!inputAmount) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    
    await approveUSDT()
    toast.success('USDT授权交易已提交，等待确认后即可进行兑换')
  }
  
  // 获取按钮配置
  const getButtonConfig = () => {
    if (!isUniswapSupported) {
      return {
        text: '当前网络不支持Uniswap',
        disabled: true,
        className: 'bg-red-400',
        action: undefined
      }
    }
    
    if (isUniswapLoading) {
      return { text: '处理中...', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      return { text: '请输入金额', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!isValidInput()) {
      return { text: '余额不足', disabled: true, className: 'bg-red-400' }
    }
    
    // Uniswap兑换逻辑
    if (uniswapMode === 'usdt-to-eth') {
      const needsAuth = needsUSDTApproval(inputAmount)
      
      if (needsAuth) {
        return {
          text: '授权USDT (一次性)',
          disabled: false,
          className: 'bg-yellow-600 hover:bg-yellow-700',
          action: handleUSDTApprove
        }
      } else {
        return {
          text: 'USDT换ETH',
          disabled: false,
          className: 'bg-purple-600 hover:bg-purple-700',
          action: handleSwap
        }
      }
    } else {
      return {
        text: 'ETH换USDT',
        disabled: false,
        className: 'bg-green-600 hover:bg-green-700',
        action: handleSwap
      }
    }
  }
  
  const buttonConfig = getButtonConfig()
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">ETH-USDT 兑换</h2>
        <button
          onClick={() => {
            refetchUniswap()
            toast.success('🔄 正在刷新Uniswap数据...')
          }}
          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
          title="刷新Uniswap数据"
        >
          <RefreshCw className={`h-5 w-5 ${isUniswapLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!isUniswapSupported && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">网络不支持</h4>
              <p className="text-sm text-red-700">
                当前网络 ({networkName}) 不支持Uniswap ETH-USDT兑换功能。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 兑换模式选择 */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setUniswapMode('eth-to-usdt')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            uniswapMode === 'eth-to-usdt'
              ? 'bg-white shadow-sm text-green-600 font-medium'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ETH 换 USDT
        </button>
        <button
          onClick={() => setUniswapMode('usdt-to-eth')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            uniswapMode === 'usdt-to-eth'
              ? 'bg-white shadow-sm text-purple-600 font-medium'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          USDT 换 ETH
        </button>
      </div>
      
      {/* 输入框 */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              {uniswapMode === 'eth-to-usdt' ? '支付' : '出售'}
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">余额: </span>
              <span className="text-sm font-semibold text-blue-600">
                {uniswapMode === 'eth-to-usdt'
                  ? (balance ? `${parseFloat(balance).toFixed(6)} ETH` : '0 ETH')
                  : `${parseFloat(usdtBalance).toFixed(6)} USDT`}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              step="any"
              min="0"
              disabled={!isUniswapSupported}
              className="flex-1 text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 disabled:opacity-50"
            />
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">
                {uniswapMode === 'eth-to-usdt' ? 'ETH' : 'USDT'}
              </span>
              <button
                onClick={handleMaxClick}
                disabled={!isUniswapSupported}
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
            disabled={!isUniswapSupported}
            className="bg-white border border-gray-200 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpDown className="h-5 w-5 text-gray-500 group-hover:text-purple-500 transition-colors" />
          </button>
        </div>
        
        {/* 输出框 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              预计获得
            </label>
            {inputAmount && isUniswapSupported && (
              <span className="text-xs text-gray-500">基于当前汇率</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 text-2xl font-bold text-gray-900">
              {outputAmount && isUniswapSupported ? parseFloat(outputAmount).toFixed(6) : '0.0'}
            </div>
            <span className="font-medium text-gray-700">
              {uniswapMode === 'eth-to-usdt' ? 'USDT' : 'ETH'}
            </span>
          </div>
        </div>
      </div>
      
      {/* USDT换ETH模式授权提示 */}
      {inputAmount && parseFloat(inputAmount) > 0 && uniswapMode === 'usdt-to-eth' && isUniswapSupported && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">USDT授权状态:</span>
            <span className={`font-medium ${needsUSDTApproval(inputAmount) ? 'text-yellow-600' : 'text-green-600'}`}>
              {needsUSDTApproval(inputAmount) ? '需要授权' : '已授权'}
            </span>
          </div>
          {needsUSDTApproval(inputAmount) ? (
            <p className="text-xs text-yellow-600 mt-1">
              使用USDT换ETH前需要先授权Uniswap合约使用您的USDT（一次性授权，之后无需重复）
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-1">
              ✅ USDT已授权，可以直接进行兑换
            </p>
          )}
        </div>
      )}
      
      {/* 交易详情 */}
      {inputAmount && parseFloat(inputAmount) > 0 && isUniswapSupported && (
        <div className="mt-4 bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800 mb-2">交易详情</h4>
          <div className="text-xs text-purple-700 space-y-1">
            <div className="flex justify-between">
              <span>交易对</span>
              <span>ETH/USDT</span>
            </div>
            <div className="flex justify-between">
              <span>滑点容差</span>
              <span>{uniswapSlippage}%</span>
            </div>
            <div className="flex justify-between">
              <span>交易平台</span>
              <span>Uniswap V3</span>
            </div>
            <div className="flex justify-between">
              <span>网络</span>
              <span>{networkName}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 高级设置 */}
      {isUniswapSupported && (
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
                滑点容差: {uniswapSlippage}%
              </label>
              <input
                type="range"
                min={0.1}
                max={5.0}
                step="0.1"
                value={uniswapSlippage}
                onChange={(e) => setUniswapSlippage(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>5.0%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Uniswap交易具有价格波动风险，建议设置适当的滑点容差
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 兑换按钮 */}
      <div className="mt-6">
        <button
          onClick={buttonConfig.action}
          disabled={buttonConfig.disabled}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonConfig.className} text-white`}
        >
          {buttonConfig.text}
        </button>
      </div>
      
      {/* 交易状态 */}
      {uniswapHash && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">
              {isUniswapConfirmed ? '交易已确认' : '交易已提交'}
            </span>
          </div>
          <p className="text-xs text-purple-600 break-all">
            交易哈希: {uniswapHash}
          </p>
          <p className="text-xs text-purple-500 mt-1">
            网络: {networkName}
          </p>
          <p className="text-xs text-purple-500 mt-1">
            交易类型: Uniswap ETH-USDT
          </p>
          {!isUniswapConfirmed && (
            <p className="text-xs text-purple-500 mt-1">等待区块确认中...</p>
          )}
        </div>
      )}
      
      {/* 注意事项 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-medium text-yellow-800 mb-1">ETH-USDT兑换提示</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 使用Uniswap V3进行去中心化兑换</li>
              <li>• 兑换价格根据市场实时浮动</li>
              <li>• USDT换ETH需要先授权合约使用USDT</li>
              <li>• 建议设置合适的滑点容差以避免交易失败</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EthUsdtSwap