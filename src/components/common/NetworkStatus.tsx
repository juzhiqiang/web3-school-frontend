import React from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { AlertTriangle, Wifi } from 'lucide-react'
import { isTestNetwork, getNetworkName, TESTNET_WARNING } from '../../utils/contracts'

const NetworkStatus: React.FC = () => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  if (!isConnected || !chain) {
    return null
  }

  const isTestNet = isTestNetwork(chain.id)
  const networkName = getNetworkName(chain.id)

  return (
    <div className="fixed top-20 right-4 z-50">
      {isTestNet && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-sm">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {TESTNET_WARNING.title}
              </h4>
              <p className="text-xs text-yellow-700 mt-1">
                {TESTNET_WARNING.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <Wifi className={`w-4 h-4 ${isTestNet ? 'text-yellow-500' : 'text-green-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            {networkName}
          </span>
          <div className={`w-2 h-2 rounded-full ${isTestNet ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus
