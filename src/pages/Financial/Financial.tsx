import React from 'react'
import { useWeb3 } from '../../contexts/Web3Context'

function Financial() {
  const { isConnected, address, balance } = useWeb3()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to view financial information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Wallet Balance</h3>
          <p className="text-2xl font-bold text-green-600">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <p className="text-2xl font-bold text-blue-600">0.00 ETH</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Courses Sold</h3>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No transactions yet.</p>
        </div>
      </div>
    </div>
  )
}

export default Financial