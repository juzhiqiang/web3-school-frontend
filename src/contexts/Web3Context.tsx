import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { ethers } from 'ethers'
import { getYiDengTokenAddress } from '../config/yidengToken'

interface UserProfile {
  name: string
  avatar?: string
}

interface Web3ContextType {
  isConnected: boolean
  address: string | undefined
  balance: string | null
  ydBalance: string | null  // 一灯币余额
  disconnect: () => void
  isLoading: boolean
  userProfile: UserProfile | null
  refetchBalance: () => void
  refetchYdBalance: () => void  // 刷新一灯币余额
}

const Web3Context = createContext<Web3ContextType | null>(null)

interface Web3ProviderProps {
  children: React.ReactNode
}

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  })
  const { disconnect } = useDisconnect()
  
  const [balance, setBalance] = useState<string | null>(null)
  const [ydBalance, setYdBalance] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // 获取一灯币余额
  const fetchYdBalance = async () => {
    if (!address || !isConnected) {
      setYdBalance(null)
      return
    }

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const tokenAddress = getYiDengTokenAddress(chainId)
        
        // 检查合约是否存在
        const code = await provider.getCode(tokenAddress)
        if (code === '0x') {
          console.warn(`一灯币合约未部署在地址: ${tokenAddress}`)
          setYdBalance('0')
          return
        }
        
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
        
        try {
          const balanceWei = await tokenContract.balanceOf(address)
          const decimals = await tokenContract.decimals()
          const balanceFormatted = ethers.formatUnits(balanceWei, decimals)
          
          setYdBalance(balanceFormatted)
          console.log(`一灯币余额: ${balanceFormatted} YD`)
        } catch (contractError: any) {
          console.error('调用一灯币合约失败:', contractError)
          // 如果是合约调用失败，设置余额为0而不是null
          setYdBalance('0')
        }
      }
    } catch (error) {
      console.error('获取一灯币余额失败:', error)
      setYdBalance('0') // 设置为0而不是null，避免UI显示问题
    }
  }

  // 刷新ETH余额的函数
  const refetchBalance = async () => {
    console.log('🔄 刷新ETH余额...')
    try {
      await refetchBalanceData()
    } catch (error) {
      console.error('刷新ETH余额失败:', error)
    }
  }

  // 刷新一灯币余额的函数
  const refetchYdBalance = async () => {
    console.log('🔄 刷新一灯币余额...')
    await fetchYdBalance()
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
      // 获取一灯币余额
      fetchYdBalance()
      
      // 模拟用户资料，实际项目中可以从后端获取
      setUserProfile({
        name: `用户${address.slice(-4)}`,
        avatar: undefined
      })
    } else {
      setUserProfile(null)
      setYdBalance(null)
    }
  }, [isConnected, address, chainId])

  const value: Web3ContextType = {
    isConnected,
    address,
    balance,
    ydBalance,
    disconnect,
    isLoading: balanceLoading,
    userProfile,
    refetchBalance,
    refetchYdBalance,
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
