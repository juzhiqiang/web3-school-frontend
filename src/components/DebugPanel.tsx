import React, { useState } from 'react'
import { Bug, Copy, RefreshCw } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { useTokenSwap } from '../hooks/useTokenSwap'
import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { debugContractInfo } from '../config/tokenSwap'

// 直接测试一灯币余额的组件
function DirectBalanceTest({ tokenAddress, userAddress }: { tokenAddress: string, userAddress: string }) {
  // 直接调用一灯币合约的balanceOf
  const { data: directBalance, error: directError, refetch: refetchDirect } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  })

  return (
    <div className="bg-green-50 rounded p-2 mt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-green-700">直接余额测试</span>
        <button
          onClick={() => refetchDirect()}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          刷新
        </button>
      </div>
      <div className="text-xs space-y-1">
        <div className="break-all">
          <span className="text-gray-600">合约:</span> {tokenAddress}
        </div>
        <div className="break-all">
          <span className="text-gray-600">用户:</span> {userAddress}
        </div>
        <div>
          <span className="text-gray-600">原始余额:</span> {directBalance?.toString() || '无'}
        </div>
        <div>
          <span className="text-gray-600">格式化余额:</span> {directBalance ? formatUnits(directBalance, 18) : '0'}
        </div>
        {directError && (
          <div className="text-red-600 break-words">
            错误: {directError.message}
          </div>
        )}
      </div>
    </div>
  )
}

// 开发环境调试工具组件
function DebugPanel() {
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
    yiDengTokenAddress,
    allowance,
    rawUserTokenBalance,
    userBalanceError,
    isLoadingUserBalance,
    refetchAll,
  } = useTokenSwap()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [manualTokenAddress, setManualTokenAddress] = useState('')
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log('已复制到剪贴板:', text)
  }
  
  const debugInfo = {
    网络信息: {
      'Chain ID': chainId,
      '网络名称': networkName,
      '是否本地网络': isLocalNetwork,
      '合约可用': isContractAvailable,
    },
    合约地址: {
      '兑换合约': contractAddress,
      '一灯币合约': yiDengTokenAddress,
    },
    合约状态: {
      '兑换率': exchangeRate,
      '购买手续费': `${feeRates.buyFee}%`,
      '出售手续费': `${feeRates.sellFee}%`,
      '合约ETH余额': contractETHBalance,
      '合约代币余额': contractTokenBalance,
    },
    用户状态: {
      '钱包地址': address,
      '已连接': isConnected,
      'ETH余额': balance,
      '一灯币余额(显示)': userTokenBalance,
      '一灯币余额(原始)': rawUserTokenBalance?.toString(),
      '余额加载中': isLoadingUserBalance,
      '余额获取错误': userBalanceError?.message,
      '授权额度': allowance,
    },
    环境变量: {
      'VITE_LOCAL_CONTRACT_ADDRESS': import.meta.env.VITE_LOCAL_CONTRACT_ADDRESS,
      'VITE_ENABLE_LOCALHOST': import.meta.env.VITE_ENABLE_LOCALHOST,
    }
  }
  
  const runDiagnostics = () => {
    console.clear()
    console.log('🔍 开始诊断TokenSwap问题...')
    
    // 运行合约调试信息
    debugContractInfo(chainId)
    
    // 检查基本连接状态
    console.group('📱 钱包连接状态')
    console.log('已连接:', isConnected)
    console.log('地址:', address)
    console.log('ETH余额:', balance)
    console.groupEnd()
    
    // 检查合约状态
    console.group('📄 合约状态')
    console.log('兑换合约地址:', contractAddress)
    console.log('一灯币合约地址:', yiDengTokenAddress)
    console.log('合约可用:', isContractAvailable)
    console.log('兑换率:', exchangeRate)
    console.log('手续费率:', feeRates)
    console.groupEnd()
    
    // 重点检查一灯币余额
    console.group('🪙 一灯币余额详细检查')
    console.log('一灯币合约地址:', yiDengTokenAddress)
    console.log('用户钱包地址:', address)
    console.log('余额加载状态:', isLoadingUserBalance)
    console.log('原始余额数据:', rawUserTokenBalance?.toString())
    console.log('格式化余额:', userTokenBalance)
    console.log('余额获取错误:', userBalanceError)
    
    if (!yiDengTokenAddress) {
      console.error('❌ 无法获取一灯币合约地址，请检查兑换合约是否正确部署')
    }
    if (!address) {
      console.error('❌ 用户地址为空，请检查钱包连接')
    }
    if (userBalanceError) {
      console.error('❌ 获取余额时出错:', userBalanceError)
    }
    if (rawUserTokenBalance === undefined && !isLoadingUserBalance) {
      console.warn('⚠️ 余额数据为undefined且不在加载中，可能是合约调用失败')
    }
    console.groupEnd()
    
    // 检查余额状态
    console.group('💰 所有余额状态')
    console.log('用户ETH余额:', balance)
    console.log('用户YD余额:', userTokenBalance)
    console.log('合约ETH库存:', contractETHBalance)
    console.log('合约YD库存:', contractTokenBalance)
    console.log('用户授权额度:', allowance)
    console.groupEnd()
    
    // 检查潜在问题
    console.group('⚠️ 潜在问题检查')
    if (!isConnected) console.warn('❌ 钱包未连接')
    if (!contractAddress) console.warn('❌ 找不到兑换合约地址')
    if (!yiDengTokenAddress) console.warn('❌ 找不到一灯币合约地址')
    if (!isContractAvailable) console.warn('❌ 合约不可用')
    if (exchangeRate === 0) console.warn('❌ 兑换率为0')
    if (parseFloat(contractTokenBalance) === 0) console.warn('⚠️ 合约中没有代币库存')
    if (parseFloat(contractETHBalance) === 0) console.warn('⚠️ 合约中没有ETH库存')
    if (parseFloat(userTokenBalance) === 0 && !userBalanceError) console.warn('ℹ️ 用户没有一灯币（或余额获取失败）')
    console.groupEnd()
    
    console.log('✅ 诊断完成，请查看上述信息')
  }
  
  // 仅在开发环境显示
  if (import.meta.env.PROD) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border max-w-md">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">调试工具</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {/* 快速操作 */}
            <div className="flex space-x-2">
              <button
                onClick={runDiagnostics}
                className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600"
              >
                运行诊断
              </button>
              <button
                onClick={refetchAll}
                className="flex-1 bg-green-500 text-white text-xs py-2 px-3 rounded hover:bg-green-600 flex items-center justify-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>刷新</span>
              </button>
            </div>
            
            {/* 一灯币余额专项检查 */}
            <div className="bg-yellow-50 rounded p-2">
              <div className="text-xs font-medium text-yellow-700 mb-2">🪙 一灯币余额检查</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>显示余额:</span>
                  <span className="font-mono">{userTokenBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span>原始数据:</span>
                  <span className="font-mono break-all">{rawUserTokenBalance?.toString() || '无'}</span>
                </div>
                <div className="flex justify-between">
                  <span>加载状态:</span>
                  <span>{isLoadingUserBalance ? '🔄 加载中...' : '✅ 已完成'}</span>
                </div>
                <div className="flex justify-between">
                  <span>合约地址:</span>
                  <span className="font-mono text-xs break-all">{yiDengTokenAddress || '未获取'}</span>
                </div>
                {userBalanceError && (
                  <div className="text-red-600 text-xs break-words">
                    ❌ 错误: {userBalanceError.message}
                  </div>
                )}
              </div>
              
              {/* 直接余额测试 */}
              {yiDengTokenAddress && address && (
                <DirectBalanceTest 
                  tokenAddress={yiDengTokenAddress} 
                  userAddress={address} 
                />
              )}
            </div>

            {/* 手动测试区域 */}
            <div className="bg-blue-50 rounded p-2">
              <div className="text-xs font-medium text-blue-700 mb-2">🧪 手动测试</div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="输入一灯币合约地址进行测试"
                  value={manualTokenAddress}
                  onChange={(e) => setManualTokenAddress(e.target.value)}
                  className="w-full text-xs p-1 border rounded"
                />
                {manualTokenAddress && address && (
                  <DirectBalanceTest 
                    tokenAddress={manualTokenAddress} 
                    userAddress={address} 
                  />
                )}
              </div>
            </div>
            
            {/* 调试信息展示 */}
            <div className="space-y-2 text-xs">
              {Object.entries(debugInfo).map(([category, data]) => (
                <div key={category} className="bg-gray-50 rounded p-2">
                  <div className="font-medium text-gray-700 mb-1">{category}</div>
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-0.5">
                      <span className="text-gray-600 text-xs">{key}:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-800 font-mono text-xs break-all max-w-32">
                          {typeof value === 'boolean' ? (value ? '✅' : '❌') : (value || '未设置')}
                        </span>
                        {typeof value === 'string' && value.startsWith('0x') && (
                          <button
                            onClick={() => copyToClipboard(value)}
                            className="text-gray-400 hover:text-gray-600"
                            title="复制地址"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* 常见问题检查 */}
            <div className="bg-red-50 rounded p-2">
              <div className="text-xs font-medium text-red-700 mb-1">常见问题检查</div>
              <div className="space-y-1 text-xs">
                {!isConnected && <div className="text-red-600">❌ 钱包未连接</div>}
                {!contractAddress && <div className="text-red-600">❌ 兑换合约地址未配置</div>}
                {!yiDengTokenAddress && contractAddress && <div className="text-red-600">❌ 无法获取一灯币合约地址</div>}
                {!isContractAvailable && <div className="text-red-600">❌ 合约不可用</div>}
                {exchangeRate === 0 && <div className="text-red-600">❌ 兑换率为0</div>}
                {parseFloat(contractTokenBalance) === 0 && <div className="text-yellow-600">⚠️ 合约YD库存为0</div>}
                {parseFloat(contractETHBalance) === 0 && <div className="text-yellow-600">⚠️ 合约ETH库存为0</div>}
                {userBalanceError && <div className="text-red-600">❌ 一灯币余额获取失败</div>}
                {isLoadingUserBalance && <div className="text-blue-600">🔄 正在加载一灯币余额</div>}
                {yiDengTokenAddress && !userBalanceError && rawUserTokenBalance === undefined && (
                  <div className="text-red-600">❌ 有合约地址但余额为undefined</div>
                )}
                {isConnected && isContractAvailable && yiDengTokenAddress && !userBalanceError && !isLoadingUserBalance && (
                  <div className="text-green-600">✅ 基本检查通过</div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 pt-2 border-t">
              💡 直接余额测试会绕过hook逻辑，直接调用合约
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugPanel