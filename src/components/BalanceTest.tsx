import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatUnits } from 'viem'
import { TestTube, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

// 简化的ERC20 ABI，只包含balanceOf
const SIMPLE_ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view", 
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 兑换合约ABI，只包含获取代币地址的功能
const SWAP_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "yiDengToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface BalanceTestProps {
  swapContractAddress?: string
  userAddress?: string
}

function BalanceTest({ swapContractAddress, userAddress }: BalanceTestProps) {
  const [manualTokenAddress, setManualTokenAddress] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const { address } = useAccount()
  const chainId = useChainId()
  
  const currentUserAddress = userAddress || address
  
  // 从兑换合约获取一灯币地址
  const { data: tokenAddressFromContract, error: tokenAddressError } = useReadContract({
    address: swapContractAddress as `0x${string}`,
    abi: SWAP_CONTRACT_ABI,
    functionName: 'yiDengToken',
    query: { enabled: !!swapContractAddress }
  })
  
  // 测试代币基本信息
  const { data: tokenName } = useReadContract({
    address: (tokenAddressFromContract || manualTokenAddress) as `0x${string}`,
    abi: SIMPLE_ERC20_ABI,
    functionName: 'name',
    query: { enabled: !!(tokenAddressFromContract || manualTokenAddress) }
  })
  
  const { data: tokenSymbol } = useReadContract({
    address: (tokenAddressFromContract || manualTokenAddress) as `0x${string}`,
    abi: SIMPLE_ERC20_ABI,
    functionName: 'symbol',
    query: { enabled: !!(tokenAddressFromContract || manualTokenAddress) }
  })
  
  const { data: tokenDecimals } = useReadContract({
    address: (tokenAddressFromContract || manualTokenAddress) as `0x${string}`,
    abi: SIMPLE_ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!(tokenAddressFromContract || manualTokenAddress) }
  })
  
  // 测试用户余额
  const { data: userBalance, error: balanceError, refetch: refetchBalance } = useReadContract({
    address: (tokenAddressFromContract || manualTokenAddress) as `0x${string}`,
    abi: SIMPLE_ERC20_ABI,
    functionName: 'balanceOf',
    args: currentUserAddress ? [currentUserAddress] : undefined,
    query: { 
      enabled: !!(tokenAddressFromContract || manualTokenAddress) && !!currentUserAddress,
      retry: 3
    }
  })
  
  const runFullTest = () => {
    const results = []
    
    // 基础信息测试
    results.push({
      test: '网络信息',
      status: 'info',
      data: {
        chainId,
        userAddress: currentUserAddress,
        swapContract: swapContractAddress
      }
    })
    
    // 代币合约地址获取测试
    results.push({
      test: '一灯币合约地址获取',
      status: tokenAddressFromContract ? 'success' : 'error',
      data: {
        address: tokenAddressFromContract,
        error: tokenAddressError?.message
      }
    })
    
    // 代币信息测试
    if (tokenAddressFromContract || manualTokenAddress) {
      results.push({
        test: '代币合约信息',
        status: tokenName && tokenSymbol ? 'success' : 'warning',
        data: {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals?.toString()
        }
      })
      
      // 余额测试
      results.push({
        test: '用户余额查询',
        status: userBalance !== undefined ? 'success' : 'error',
        data: {
          rawBalance: userBalance?.toString(),
          formattedBalance: userBalance ? formatUnits(userBalance, tokenDecimals || 18) : 'N/A',
          error: balanceError?.message
        }
      })
    }
    
    setTestResults(results)
    
    // 输出到控制台
    console.group('🧪 一灯币余额完整测试')
    results.forEach(result => {
      console.log(`${result.test}:`, result.data)
    })
    console.groupEnd()
  }
  
  useEffect(() => {
    if (swapContractAddress && currentUserAddress) {
      runFullTest()
    }
  }, [swapContractAddress, currentUserAddress, tokenAddressFromContract, userBalance])
  
  return (
    <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <TestTube className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-900">一灯币余额测试工具</h3>
        <button
          onClick={runFullTest}
          className="ml-auto bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 flex items-center space-x-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>重新测试</span>
        </button>
      </div>
      
      {/* 手动输入代币地址进行测试 */}
      <div className="mb-4 bg-gray-50 rounded p-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          手动输入一灯币合约地址测试：
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualTokenAddress}
            onChange={(e) => setManualTokenAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={runFullTest}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            测试
          </button>
        </div>
      </div>
      
      {/* 当前状态显示 */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">从合约获取的地址:</span>
            <div className="font-mono text-xs break-all text-blue-600">
              {tokenAddressFromContract || '未获取到'}
            </div>
          </div>
          <div>
            <span className="text-gray-600">当前用户地址:</span>
            <div className="font-mono text-xs break-all text-green-600">
              {currentUserAddress || '未连接'}
            </div>
          </div>
        </div>
        
        {/* 代币信息 */}
        {(tokenAddressFromContract || manualTokenAddress) && (
          <div className="bg-blue-50 rounded p-3">
            <div className="text-sm font-medium text-blue-800 mb-2">代币合约信息</div>
            <div className="space-y-1 text-xs">
              <div>名称: {tokenName || '获取中...'}</div>
              <div>符号: {tokenSymbol || '获取中...'}</div>
              <div>精度: {tokenDecimals?.toString() || '获取中...'}</div>
            </div>
          </div>
        )}
        
        {/* 余额信息 */}
        {currentUserAddress && (tokenAddressFromContract || manualTokenAddress) && (
          <div className="bg-green-50 rounded p-3">
            <div className="text-sm font-medium text-green-800 mb-2">余额查询结果</div>
            <div className="space-y-1 text-xs">
              <div>原始余额: {userBalance?.toString() || '获取中...'}</div>
              <div>格式化余额: {userBalance ? formatUnits(userBalance, tokenDecimals || 18) : '获取中...'}</div>
              {balanceError && (
                <div className="text-red-600">错误: {balanceError.message}</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 测试结果 */}
      {testResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">测试结果:</h4>
          {testResults.map((result, index) => (
            <div key={index} className={`flex items-start space-x-2 p-2 rounded text-xs ${
              result.status === 'success' ? 'bg-green-50 text-green-800' :
              result.status === 'error' ? 'bg-red-50 text-red-800' :
              'bg-yellow-50 text-yellow-800'
            }`}>
              {result.status === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5" /> :
               result.status === 'error' ? <AlertTriangle className="h-4 w-4 mt-0.5" /> :
               <AlertTriangle className="h-4 w-4 mt-0.5" />}
              <div className="flex-1">
                <div className="font-medium">{result.test}</div>
                <pre className="mt-1 text-xs whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BalanceTest