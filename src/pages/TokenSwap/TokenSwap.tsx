import { useState, useEffect } from 'react'
import { ArrowUpDown, Coins, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff, Wallet } from 'lucide-react'
import { useWeb3 } from '../../contexts/Web3Context'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import { useUniswapETHUSDT } from '../../hooks/useUniswapETHUSDT'
import { TOKEN_SWAP_CONFIG, ERROR_MESSAGES } from '../../config/tokenSwap'
import toast from 'react-hot-toast'
import TokenSwapTip from './components/tip'
import YdToEthExchangePool from './components/YdToEthExchangePool'

function TokenSwap() {
  const { isConnected, address, balance, refetchBalance } = useWeb3()
  const {
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
    allowance,
    mintAndDepositTestTokens,
    depositETHToContract,
  } = useTokenSwap(refetchBalance)
  
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
  
  const [swapType, setSwapType] = useState<'yideng' | 'uniswap'>('yideng')
  const [swapMode, setSwapMode] = useState<'buy' | 'sell'>('buy')
  const [uniswapMode, setUniswapMode] = useState<'eth-to-usdt' | 'usdt-to-eth'>('eth-to-usdt')
  const [inputAmount, setInputAmount] = useState('')
  const [slippage, setSlippage] = useState<number>(TOKEN_SWAP_CONFIG.DEFAULT_SLIPPAGE)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 计算输出金额
  const outputAmount = swapType === 'yideng' 
    ? (swapMode === 'buy' 
        ? calculateTokensForETH(inputAmount)
        : calculateETHForTokens(inputAmount))
    : calculateUniswapAmount(inputAmount, uniswapMode === 'eth-to-usdt')
  
  // 重置表单
  const resetForm = () => {
    setInputAmount('')
  }
  
  // 监听交易确认
  useEffect(() => {
    if (isConfirmed || isUniswapConfirmed) {
      toast.success('🎉 兑换已确认！正在更新所有余额...')
      resetForm()
      
      // 额外延迟刷新以确保用户看到最新余额
      setTimeout(() => {
        toast.success('✅ ETH和代币余额已更新完成！')
      }, 3000)
    }
  }, [isConfirmed, isUniswapConfirmed])
  
  // 切换兑换模式
  const toggleSwapMode = () => {
    if (swapType === 'yideng') {
      setSwapMode(prev => prev === 'buy' ? 'sell' : 'buy')
    } else {
      setUniswapMode(prev => prev === 'eth-to-usdt' ? 'usdt-to-eth' : 'eth-to-usdt')
    }
    setInputAmount('')
  }
  
  // 处理最大值
  const handleMaxClick = () => {
    if (swapType === 'yideng') {
      if (swapMode === 'buy') {
        if (balance) {
          // 留出一些ETH作为gas费用
          const maxAmount = Math.max(0, parseFloat(balance) - 0.01)
          setInputAmount(maxAmount.toFixed(6))
        }
      } else {
        setInputAmount(parseFloat(userTokenBalance).toFixed(6))
      }
    } else {
      // Uniswap模式
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
  }
  
  // 检查输入有效性
  const isValidInput = (): boolean => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return false
    
    if (swapType === 'yideng') {
      if (swapMode === 'buy') {
        return balance ? parseFloat(inputAmount) <= parseFloat(balance) : false
      } else {
        return hasEnoughBalance(inputAmount, 'token')
      }
    } else {
      // Uniswap模式
      if (uniswapMode === 'eth-to-usdt') {
        return balance ? parseFloat(inputAmount) <= parseFloat(balance) : false
      } else {
        return parseFloat(inputAmount) <= parseFloat(usdtBalance)
      }
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
    
    if (swapType === 'yideng') {
      if (!isContractAvailable) {
        toast.error(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED)
        return
      }
      
      console.log('🚀 开始YiDeng兑换操作:', {
        mode: swapMode,
        inputAmount,
        slippage,
        userETHBalance: balance,
        userTokenBalance,
        contractETHBalance,
        contractTokenBalance
      })
      
      if (swapMode === 'buy') {
        await buyTokens(inputAmount, slippage)
      } else {
        await sellTokens(inputAmount, slippage)
      }
    } else {
      // Uniswap兑换
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
  }
  
  // 修复：改进的授权处理函数
  const handleApprove = async () => {
    if (!inputAmount) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    
    console.log('🔐 开始授权操作:', {
      tokenAmount: inputAmount,
      contractAddress,
      userTokenBalance,
      currentAllowance: allowance
    })
    
    await approveTokens(inputAmount)
    
    // 授权提交后给用户提示
    toast.success('授权交易已提交，等待确认后即可进行兑换')
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
  
  // 关键修复：改进按钮状态逻辑
  const getButtonConfig = () => {
    const currentIsLoading = swapType === 'yideng' ? isLoading : isUniswapLoading
    
    if (swapType === 'yideng' && !isContractAvailable) {
      return { 
        text: `合约未部署到${networkName}`, 
        disabled: true, 
        className: 'bg-red-400',
        action: undefined
      }
    }
    
    if (swapType === 'uniswap' && !isUniswapSupported) {
      return {
        text: '当前网络不支持Uniswap',
        disabled: true,
        className: 'bg-red-400',
        action: undefined
      }
    }
    
    if (currentIsLoading) {
      return { text: '处理中...', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      return { text: '请输入金额', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!isValidInput()) {
      return { text: '余额不足', disabled: true, className: 'bg-red-400' }
    }
    
    if (swapType === 'yideng') {
      // YiDeng兑换逻辑
      if (swapMode === 'sell') {
        const needsAuth = needsApproval(inputAmount)
        
        if (needsAuth) {
          return { 
            text: '授权一灯币 (一次性)', 
            disabled: false, 
            className: 'bg-yellow-600 hover:bg-yellow-700',
            action: handleApprove
          }
        } else {
          return {
            text: '出售一灯币',
            disabled: false,
            className: 'bg-red-600 hover:bg-red-700',
            action: handleSwap
          }
        }
      } else {
        return {
          text: '购买一灯币',
          disabled: false,
          className: 'bg-blue-600 hover:bg-blue-700',
          action: handleSwap
        }
      }
    } else {
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

        {/* 标题和刷新按钮 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold">一灯币兑换</h1>
            <button
              onClick={() => {
                refetchAll()
                refetchUniswap()
                toast.success('🔄 正在刷新数据...')
              }}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="手动刷新所有数据"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-600 mb-6">安全、快速的代币兑换服务</p>
        </div>

        {/* 用户余额卡片 */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-1">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-blue-600" />
                <span>我的账户余额</span>
                {isLoading && (
                  <RefreshCw className={`h-4 w-4 text-blue-500 animate-spin`} />
                )}
              </h3>
              <div className="text-sm text-gray-500">
                {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* ETH 余额 */}
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
                </div>
                <div className="text-sm font-medium text-gray-600">ETH</div>
                <div className="text-xs text-gray-500 mt-1">
                  以太坊
                </div>
              </div>
              
              {/* 一灯币余额 */}
              <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {parseFloat(userTokenBalance).toFixed(2)}
                </div>
                <div className="text-sm font-medium text-gray-600">YD</div>
                <div className="text-xs text-gray-500 mt-1">
                  一灯币
                </div>
              </div>

              {/* USDT 余额 */}
              <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {parseFloat(usdtBalance).toFixed(2)}
                </div>
                <div className="text-sm font-medium text-gray-600">USDT</div>
                <div className="text-xs text-gray-500 mt-1">
                  稳定币
                </div>
              </div>
            </div>
            
            {/* 余额总览提示 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span>🔄 支持双向兑换</span>
                <span>⚡ 实时更新</span>
                <span>🔒 安全可靠</span>
              </div>
            </div>
          </div>
        </div>

        {/* 兑换率和手续费信息 */}
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
        
        {/* 合约不可用提示 */}
        {!isContractAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">合约不可用</h4>
                <p className="text-sm text-red-700">
                  一灯币兑换合约尚未部署到当前网络 ({networkName})。
                  {isLocalNetwork && '请确保在Ganache网络中部署了合约，并设置正确的合约地址。'}
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
          {/* 兑换类型选择 */}
          <div className="flex mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-1">
            <button
              onClick={() => setSwapType('yideng')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                swapType === 'yideng'
                  ? 'bg-white shadow-sm text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              一灯币兑换
            </button>
            <button
              onClick={() => setSwapType('uniswap')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                swapType === 'uniswap'
                  ? 'bg-white shadow-sm text-purple-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Uniswap ETH-USDT
            </button>
          </div>

          {/* 兑换模式选择 */}
          {swapType === 'yideng' ? (
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
          ) : (
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
          )}
          
          {/* 输入框 */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {swapType === 'yideng' 
                    ? (swapMode === 'buy' ? '支付' : '出售')
                    : (uniswapMode === 'eth-to-usdt' ? '支付' : '出售')
                  }
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    余额: 
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {swapType === 'yideng' 
                      ? (swapMode === 'buy' 
                          ? (balance ? `${parseFloat(balance).toFixed(6)} ETH` : '0 ETH')
                          : `${parseFloat(userTokenBalance).toFixed(6)} YD`)
                      : (uniswapMode === 'eth-to-usdt'
                          ? (balance ? `${parseFloat(balance).toFixed(6)} ETH` : '0 ETH')
                          : `${parseFloat(usdtBalance).toFixed(6)} USDT`)
                    }
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
                  disabled={swapType === 'yideng' ? !isContractAvailable : !isUniswapSupported}
                  className="flex-1 text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 disabled:opacity-50"
                />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">
                    {swapType === 'yideng' 
                      ? (swapMode === 'buy' ? 'ETH' : 'YD')
                      : (uniswapMode === 'eth-to-usdt' ? 'ETH' : 'USDT')
                    }
                  </span>
                  <button
                    onClick={handleMaxClick}
                    disabled={swapType === 'yideng' ? !isContractAvailable : !isUniswapSupported}
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
                disabled={swapType === 'yideng' ? !isContractAvailable : !isUniswapSupported}
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
                {inputAmount && ((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) && (
                  <span className="text-xs text-gray-500">
                    {swapType === 'yideng' ? '扣除手续费后' : '基于当前汇率'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 text-2xl font-bold text-gray-900">
                  {outputAmount && ((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) ? parseFloat(outputAmount).toFixed(6) : '0.0'}
                </div>
                <span className="font-medium text-gray-700">
                  {swapType === 'yideng' 
                    ? (swapMode === 'buy' ? 'YD' : 'ETH')
                    : (uniswapMode === 'eth-to-usdt' ? 'USDT' : 'ETH')
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* 授权状态提示 */}
          {inputAmount && parseFloat(inputAmount) > 0 && (
            <>
              {/* YiDeng 出售模式授权提示 */}
              {swapType === 'yideng' && swapMode === 'sell' && isContractAvailable && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">授权状态:</span>
                    <span className={`font-medium ${needsApproval(inputAmount) ? 'text-yellow-600' : 'text-green-600'}`}>
                      {needsApproval(inputAmount) ? '需要授权' : '已授权'}
                    </span>
                  </div>
                  {needsApproval(inputAmount) ? (
                    <p className="text-xs text-yellow-600 mt-1">
                      出售一灯币前需要先授权合约使用您的代币（一次性授权，之后无需重复）
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ 已授权，可以直接进行兑换
                    </p>
                  )}
                </div>
              )}
              
              {/* Uniswap USDT换ETH模式授权提示 */}
              {swapType === 'uniswap' && uniswapMode === 'usdt-to-eth' && isUniswapSupported && (
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
            </>
          )}
          
          {/* 交易详情 */}
          {inputAmount && parseFloat(inputAmount) > 0 && ((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">交易详情</h4>
              <div className="text-xs text-blue-700 space-y-1">
                {swapType === 'yideng' ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
                <div className="flex justify-between">
                  <span>网络</span>
                  <span>{networkName}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 高级设置 */}
          {((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) && (
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
                    滑点容差: {swapType === 'yideng' ? slippage : uniswapSlippage}%
                  </label>
                  <input
                    type="range"
                    min={swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE : 0.1}
                    max={swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE : 5.0}
                    step="0.1"
                    value={swapType === 'yideng' ? slippage : uniswapSlippage}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (swapType === 'yideng') {
                        setSlippage(value)
                      } else {
                        setUniswapSlippage(value)
                      }
                    }}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE : 0.1}%</span>
                    <span>{swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE : 5.0}%</span>
                  </div>
                  {swapType === 'uniswap' && (
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Uniswap交易具有价格波动风险，建议设置适当的滑点容差
                    </p>
                  )}
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
          {((transactionHash && swapType === 'yideng') || (uniswapHash && swapType === 'uniswap')) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {(swapType === 'yideng' && isConfirmed) || (swapType === 'uniswap' && isUniswapConfirmed) ? '交易已确认' : '交易已提交'}
                </span>
              </div>
              <p className="text-xs text-blue-600 break-all">
                交易哈希: {swapType === 'yideng' ? transactionHash : uniswapHash}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                网络: {networkName}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                交易类型: {swapType === 'yideng' ? '一灯币兑换' : 'Uniswap ETH-USDT'}
              </p>
              {!((swapType === 'yideng' && isConfirmed) || (swapType === 'uniswap' && isUniswapConfirmed)) && (
                <p className="text-xs text-blue-500 mt-1">等待区块确认中...</p>
              )}
            </div>
          )}
        </div>
        
        {/* 合约资金库存状态 */}
        <YdToEthExchangePool/>
        
        {/* 注意事项 */}
        <TokenSwapTip isLocalNetwork={isLocalNetwork}/>
      </div>
    </div>
  )
}

export default TokenSwap