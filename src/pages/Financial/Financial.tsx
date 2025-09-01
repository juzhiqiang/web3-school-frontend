import React from 'react'
import { useWeb3 } from '../../contexts/Web3Context'

function Financial() {
  const { isConnected, address, balance } = useWeb3()

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">钱包余额</h3>
          <p className="text-2xl font-bold text-green-600">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '加载中...'}
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
