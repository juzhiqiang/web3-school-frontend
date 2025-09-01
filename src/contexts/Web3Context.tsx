import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { formatEther } from 'viem'

interface Web3ContextType {
  isConnected: boolean
  address: string | undefined
  balance: string | null
  disconnect: () => void
  isLoading: boolean
}

const Web3Context = createContext<Web3ContextType | null>(null)

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount()
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}` | undefined,
  })
  const { disconnect } = useDisconnect()
  
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (balanceData) {
      setBalance(formatEther(balanceData.value))
    } else {
      setBalance(null)
    }
  }, [balanceData])

  const value: Web3ContextType = {
    isConnected,
    address,
    balance,
    disconnect,
    isLoading: balanceLoading,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export default Web3Context
