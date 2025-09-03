import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import { ArrowRightLeft, Coins, TrendingUp } from 'lucide-react'

function Financial() {
  const { isConnected, address, balance } = useWeb3()
  const { userTokenBalance, exchangeRate } = useTokenSwap()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p>请先连接您的钱包以查看财务信息。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">财务仪表板</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">ETH余额</h3>
          <p className="text-2xl font-bold text-green-600">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '加载中...'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">一灯币余额</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {parseFloat(userTokenBalance).toFixed(2)} YD
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">总收入</h3>
          <p className="text-2xl font-bold text-blue-600">0.00 ETH</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">已售课程</h3>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
      </div>
      
      {/* 代币兑换快速入口 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
              <Coins className="h-6 w-6 text-blue-600" />
              <span>一灯币兑换</span>
            </h2>
            <p className="text-gray-600 mb-4">
              当前兑换率: 1 ETH = {exchangeRate.toLocaleString()} YD
            </p>
            <div className="flex space-x-4">
              <Link
                to="/token-swap"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>开始兑换</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">便捷兑换</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">交易历史</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">暂无交易记录</p>
        </div>
      </div>
    </div>
  )
}

export default Financial