import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { ethers } from 'ethers'
import { getYiDengTokenAddress } from '../config/yidengToken'
import type { UseWeb3Return } from '../types/web3'

interface UserProfile {
  name: string
  avatar?: string
}

interface Web3ContextType extends UseWeb3Return {
  userProfile: UserProfile | null
  ydBalance: string | null
  refetchYdBalance: () => Promise<void>
  addTokenToWallet: () => Promise<boolean>
}

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | Record<string, any> }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

const Web3Context = createContext<Web3ContextType | null>(null)

interface Web3ProviderProps {
  children: React.ReactNode
}

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
] as const;

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalanceData } = useBalance({
    address: address as Address | undefined,
  })
  const { disconnect } = useDisconnect()
  
  const [balance, setBalance] = useState<string | null>(null)
  const [ydBalance, setYdBalance] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ code: number; message: string } | undefined>()

  // 获取一灯币余额
  const fetchYdBalance = async (): Promise<void> => {
    if (!address || !isConnected) {
      setYdBalance(null)
      return
    }

    try {
      setError(undefined)
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
          const [balanceWei, decimals] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.decimals()
          ])
          
          const balanceFormatted = ethers.formatUnits(balanceWei, decimals)
          setYdBalance(balanceFormatted)
          console.log(`一灯币余额: ${balanceFormatted} YD`)
        } catch (contractError: any) {
          console.error('调用一灯币合约失败:', contractError)
          setYdBalance('0')
          setError({ code: contractError.code || -1, message: contractError.message || '合约调用失败' })
        }
      }
    } catch (error: any) {
      console.error('获取一灯币余额失败:', error)
      setYdBalance('0')
      setError({ code: error.code || -1, message: error.message || '获取余额失败' })
    }
  }

  // 刷新ETH余额的函数
  const refetchBalance = async (): Promise<void> => {
    console.log('🔄 刷新ETH余额...')
    try {
      setIsLoading(true)
      setError(undefined)
      await refetchBalanceData()
    } catch (error: any) {
      console.error('刷新ETH余额失败:', error)
      setError({ code: error.code || -1, message: error.message || '刷新失败' })
    } finally {
      setIsLoading(false)
    }
  }

  // 刷新一灯币余额的函数
  const refetchYdBalance = async (): Promise<void> => {
    console.log('🔄 刷新一灯币余额...')
    await fetchYdBalance()
  }

  // 添加一灯币到钱包
  const addTokenToWallet = async (): Promise<boolean> => {
    if (!window.ethereum || !chainId) {
      console.error('钱包未连接或链ID不可用')
      return false
    }

    try {
      const tokenAddress = getYiDengTokenAddress(chainId)
      
      const success = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: 'YD',
            decimals: 18,
            image: '', // 可以添加代币图标URL
          },
        },
      })

      if (success) {
        console.log('✅ 一灯币已添加到钱包')
        return true
      } else {
        console.log('❌ 用户取消添加代币到钱包')
        return false
      }
    } catch (error: any) {
      console.error('添加代币到钱包失败:', error)
      setError({ code: error.code || -1, message: error.message || '添加代币失败' })
      return false
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
      setError(undefined)
    }
  }, [isConnected, address, chainId])

  const value: Web3ContextType = {
    isConnected,
    address: address as Address | undefined,
    balance,
    chainId,
    isLoading: balanceLoading || isLoading,
    error,
    refetchBalance,
    
    // 额外的上下文特定属性
    ydBalance,
    disconnect,
    userProfile,
    refetchYdBalance,
    addTokenToWallet,
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
