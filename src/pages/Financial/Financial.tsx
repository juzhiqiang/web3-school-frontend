import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useTokenSwap } from '../../hooks/useTokenSwap'
import { useTransactionHistory } from '../../hooks/useTransactionHistory'
import TransactionHistory from '../../components/TransactionHistory/TransactionHistory'
import RewardHistory from '../../components/RewardHistory/RewardHistory'
import { ArrowRightLeft, Coins, TrendingUp, Wallet, Activity, DollarSign, BarChart3 } from 'lucide-react'

function Financial() {
  const { isConnected, address, balance, refetchBalance } = useWeb3()
  const { userTokenBalance, exchangeRate } = useTokenSwap(refetchBalance)
  const { summary: transactionSummary } = useTransactionHistory()

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">财务仪表板</h1>
          <p className="text-gray-600 mt-1">管理您的数字资产和交易记录</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Wallet className="h-4 w-4" />
          <span>{address && `${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">ETH余额</h3>
              <p className="text-2xl font-bold">
                {balance ? `${parseFloat(balance).toFixed(4)}` : '0.0000'}
              </p>
              <p className="text-blue-100 text-sm">以太坊</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">一灯币余额</h3>
              <p className="text-2xl font-bold">
                {parseFloat(userTokenBalance).toFixed(2)}
              </p>
              <p className="text-yellow-100 text-sm">YiDeng Token</p>
            </div>
            <Coins className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">交易总量</h3>
              <p className="text-2xl font-bold">
                {transactionSummary.totalVolumeETH}
              </p>
              <p className="text-green-100 text-sm">累计ETH交易量</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">总交易数</h3>
              <p className="text-2xl font-bold">{transactionSummary.totalTransactions}</p>
              <p className="text-purple-100 text-sm">历史交易记录</p>
            </div>
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>
      
      {/* 代币兑换快速入口 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
              <Coins className="h-6 w-6 text-blue-600" />
              <span>一灯币兑换中心</span>
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
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">安全便捷</p>
                <p className="text-xs text-gray-500">双向兑换</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 奖励历史组件 */}
      <div className="mb-8">
        <RewardHistory />
      </div>
      
      {/* 交易历史组件 */}
      <TransactionHistory />
    </div>
  )
}

export default Financial