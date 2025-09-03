import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { formatEther } from 'viem'

interface UserProfile {
  name: string
  avatar?: string
}

interface Web3ContextType {
  isConnected: boolean
  address: string | undefined
  balance: string | null
  disconnect: () => void
  isLoading: boolean
  userProfile: UserProfile | null
  refetchBalance: () => void
}

const Web3Context = createContext<Web3ContextType | null>(null)

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount()
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  })
  const { disconnect } = useDisconnect()
  
  const [balance, setBalance] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // 刷新ETH余额的函数
  const refetchBalance = async () => {
    console.log('🔄 刷新ETH余额...')
    try {
      await refetchBalanceData()
    } catch (error) {
      console.error('刷新ETH余额失败:', error)
    }
  }

  useEffect(() => {
    if (balanceData) {
      setBalance(formatEther(balanceData.value))
    } else {
      setBalance(null)
    }
  }, [balanceData])

  useEffect(() => {
    if (isConnected && address) {
      // 模拟用户资料，实际项目中可以从后端获取
      setUserProfile({
        name: `用户${address.slice(-4)}`,
        avatar: undefined
      })
    } else {
      setUserProfile(null)
    }
  }, [isConnected, address])

  const value: Web3ContextType = {
    isConnected,
    address,
    balance,
    disconnect,
    isLoading: balanceLoading,
    userProfile,
    refetchBalance,
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
