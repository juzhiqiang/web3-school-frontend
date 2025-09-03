import React, { useState } from 'react'
import { Settings, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import toast from 'react-hot-toast'

interface DevToolsProps {
  isVisible: boolean
  onToggle: () => void
}

function DevTools({ isVisible, onToggle }: DevToolsProps) {
  const {
    chainId,
    contractAddress,
    networkName,
    isLocalNetwork,
    exchangeRate,
    feeRates,
    yiDengTokenAddress,
    contractTokenBalance,
    contractETHBalance,
  } = useTokenSwap()
  
  const [showDetails, setShowDetails] = useState(false)
  
  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label}已复制到剪贴板`)
    }).catch(() => {
      toast.error('复制失败')
    })
  }
  
  // 生成区块浏览器链接
  const getExplorerUrl = (address: string, type: 'address' | 'tx' = 'address') => {
    if (chainId === 1337) return `http://localhost:7545`
    if (chainId === 11155111) return `https://sepolia.etherscan.io/${type}/${address}`
    if (chainId === 1) return `https://etherscan.io/${type}/${address}`
    return '#'
  }
  
  if (!isLocalNetwork && process.env.NODE_ENV === 'production') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 开发工具按钮 */}
      <button
        onClick={onToggle}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors mb-2"
        title="开发工具"
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {/* 开发工具面板 */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border p-4 w-80 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">开发工具</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* 基本信息 */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">当前网络</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{networkName}</span>
                {isLocalNetwork && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    本地
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Chain ID</label>
              <p className="text-sm font-mono">{chainId}</p>
            </div>
            
            {contractAddress && (
              <div>
                <label className="text-xs text-gray-500">兑换合约地址</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">
                    {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contractAddress, '合约地址')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <a
                    href={getExplorerUrl(contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
            
            {yiDengTokenAddress && (
              <div>
                <label className="text-xs text-gray-500">代币合约地址</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">
                    {yiDengTokenAddress.slice(0, 6)}...{yiDengTokenAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(yiDengTokenAddress, '代币地址')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 详细信息 */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <label className="text-xs text-gray-500">兑换率</label>
                <p className="text-sm">1 ETH = {exchangeRate.toLocaleString()} YD</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">手续费率</label>
                <p className="text-sm">买入 {feeRates.buyFee}% / 卖出 {feeRates.sellFee}%</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">合约余额</label>
                <div className="text-sm">
                  <p>ETH: {parseFloat(contractETHBalance).toFixed(6)}</p>
                  <p>YD: {parseFloat(contractTokenBalance).toFixed(2)}</p>
                </div>
              </div>
              
              {isLocalNetwork && (
                <div className="bg-blue-50 rounded p-3 mt-4">
                  <p className="text-xs text-blue-700 mb-2">快速测试命令:</p>
                  <div className="text-xs font-mono text-blue-800 space-y-1">
                    <p>npx hardhat node</p>
                    <p>npx hardhat run scripts/deploy.js --network localhost</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DevTools
