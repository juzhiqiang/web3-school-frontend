import { useState, useEffect, useMemo } from 'react'
import { 
  useAccount, 
  useChainId, 
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi'
import { parseEther, parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'

import {
  UNISWAP_CONFIG,
  getWETHToken,
  getUSDTToken,
  getRouterAddress,
  UNISWAP_ERROR_MESSAGES,
} from '../config/uniswap'

// Uniswap V2 Router ABI
const UNISWAP_V2_ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactETHForTokens',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForETH',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 ABI
const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// 最大授权金额
const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export function useUniswapETHUSDT() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isLoading, setIsLoading] = useState(false)
  const [slippage, setSlippage] = useState<number>(UNISWAP_CONFIG.DEFAULT_SLIPPAGE)
  const [swapType, setSwapType] = useState<'eth-to-usdt' | 'usdt-to-eth'>('eth-to-usdt')
  const [inputAmount, setInputAmount] = useState('')

  // 获取路由器地址
  const routerAddress = useMemo(() => {
    try {
      return getRouterAddress(chainId)
    } catch {
      return undefined
    }
  }, [chainId])

  // 获取代币实例
  const wethToken = useMemo(() => {
    try {
      return getWETHToken(chainId)
    } catch {
      return undefined
    }
  }, [chainId])

  const usdtToken = useMemo(() => {
    try {
      return getUSDTToken(chainId)
    } catch {
      return undefined
    }
  }, [chainId])

  // 读取USDT余额
  const { data: usdtBalance, refetch: refetchUSDTBalance } = useReadContract({
    address: usdtToken?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!usdtToken?.address && !!address,
      retry: 3,
      retryDelay: 1000
    }
  })

  // 读取USDT授权额度
  const { data: usdtAllowance, refetch: refetchUSDTAllowance } = useReadContract({
    address: usdtToken?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && routerAddress 
      ? [address, routerAddress as `0x${string}`] 
      : undefined,
    query: { 
      enabled: !!usdtToken?.address && !!address && !!routerAddress,
      refetchInterval: 3000,
    },
  })

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // 格式化USDT余额
  const formatUSDTBalance = (): string => {
    if (!usdtBalance || !usdtToken) return '0'
    try {
      return formatUnits(usdtBalance, usdtToken.decimals)
    } catch (error) {
      return '0'
    }
  }

  // 获取 ETH -> USDT 汇率
  const { data: ethToUsdtAmounts } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: inputAmount && wethToken && usdtToken && parseFloat(inputAmount) > 0 && swapType === 'eth-to-usdt'
      ? [
          parseEther(inputAmount),
          [wethToken.address as `0x${string}`, usdtToken.address as `0x${string}`]
        ]
      : undefined,
    query: {
      enabled: !!routerAddress && !!wethToken && !!usdtToken && !!inputAmount && parseFloat(inputAmount) > 0 && swapType === 'eth-to-usdt',
      retry: 3,
      retryDelay: 1000
    }
  })

  // 获取 USDT -> ETH 汇率
  const { data: usdtToEthAmounts } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: inputAmount && wethToken && usdtToken && parseFloat(inputAmount) > 0 && swapType === 'usdt-to-eth'
      ? [
          parseUnits(inputAmount, usdtToken.decimals),
          [usdtToken.address as `0x${string}`, wethToken.address as `0x${string}`]
        ]
      : undefined,
    query: {
      enabled: !!routerAddress && !!wethToken && !!usdtToken && !!inputAmount && parseFloat(inputAmount) > 0 && swapType === 'usdt-to-eth',
      retry: 3,
      retryDelay: 1000
    }
  })

  // 调试信息
  useEffect(() => {
    console.log('Uniswap V2 Debug:', {
      routerAddress,
      wethToken: wethToken?.address,
      usdtToken: usdtToken?.address,
      inputAmount,
      swapType,
      chainId,
      ethToUsdtAmounts,
      usdtToEthAmounts
    })
  }, [routerAddress, wethToken, usdtToken, inputAmount, swapType, chainId, ethToUsdtAmounts, usdtToEthAmounts])

  // 计算输出金额 - 使用分离的汇率查询
  const calculateSwapAmount = (amount: string, isETHToUSDT: boolean): string => {
    if (!amount || parseFloat(amount) <= 0) {
      return '0'
    }
    
    // 选择对应方向的汇率数据
    const relevantAmounts = isETHToUSDT ? ethToUsdtAmounts : usdtToEthAmounts
    
    // 如果有真实的Uniswap数据，使用它
    if (relevantAmounts && Array.isArray(relevantAmounts) && relevantAmounts.length >= 2) {
      try {
        const outputAmount = relevantAmounts[1]
        if (isETHToUSDT) {
          return formatUnits(outputAmount, usdtToken?.decimals || 6)
        } else {
          return formatUnits(outputAmount, 18)
        }
      } catch (error) {
        console.error('格式化Uniswap输出失败:', error)
      }
    }
    
    // 回退到模拟汇率（用于测试网或流动性不足的情况）
    try {
      const mockETHUSDTRate = 2500 // 假设1 ETH = 2500 USDT
      
      if (isETHToUSDT) {
        // ETH -> USDT
        const usdtAmount = parseFloat(amount) * mockETHUSDTRate
        const fee = usdtAmount * (UNISWAP_CONFIG.FEE_RATE / 1000000) // 0.3%手续费
        return (usdtAmount - fee).toFixed(6)
      } else {
        // USDT -> ETH
        const ethAmount = parseFloat(amount) / mockETHUSDTRate
        const fee = ethAmount * (UNISWAP_CONFIG.FEE_RATE / 1000000) // 0.3%手续费
        return (ethAmount - fee).toFixed(18)
      }
    } catch (error) {
      console.error('计算交换金额失败:', error)
      return '0'
    }
  }

  // 检查是否需要授权USDT
  const needsUSDTApproval = (amount: string): boolean => {
    if (!usdtAllowance || !amount || !usdtToken) {
      console.log('需要授权USDT - 缺少数据:', { usdtAllowance, amount, usdtToken: !!usdtToken })
      return true
    }
    
    try {
      const amountInWei = parseUnits(amount, usdtToken.decimals)
      const currentAllowance = BigInt(usdtAllowance.toString())
      const needsApproval = currentAllowance < amountInWei
      
      console.log('USDT授权检查:', {
        amount,
        amountInWei: amountInWei.toString(),
        currentAllowance: currentAllowance.toString(),
        decimals: usdtToken.decimals,
        needsApproval
      })
      
      return needsApproval
    } catch (error) {
      console.error('检查USDT授权状态失败:', error)
      return true
    }
  }

  // 授权USDT
  const approveUSDT = async (amount: string = MAX_UINT256) => {
    if (!isConnected || !address || !usdtToken?.address || !routerAddress) {
      console.error('授权前置条件检查失败:', {
        isConnected,
        address,
        usdtTokenAddress: usdtToken?.address,
        routerAddress,
        chainId
      })
      toast.error(UNISWAP_ERROR_MESSAGES.NETWORK_NOT_SUPPORTED)
      return
    }

    try {
      setIsLoading(true)
      
      // 处理授权金额
      let approvalAmount: bigint
      if (amount === MAX_UINT256) {
        // 使用最大uint256值进行无限授权
        approvalAmount = BigInt(MAX_UINT256)
      } else {
        // 使用指定金额
        approvalAmount = parseUnits(amount, usdtToken.decimals)
      }
      
      console.log('USDT授权参数:', {
        usdtAddress: usdtToken.address,
        routerAddress,
        approvalAmount: approvalAmount.toString(),
        decimals: usdtToken.decimals,
        chainId,
        isNetworkSupported
      })

      // 检查网络支持
      if (!isNetworkSupported) {
        throw new Error(`不支持的网络: ${chainId}`)
      }
      
      await writeContract({
        address: usdtToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [routerAddress as `0x${string}`, approvalAmount],
      })

      toast.success('USDT授权交易已提交，等待确认...')
    } catch (err: any) {
      console.error('USDT授权失败:', err)
      
      // 提供更详细的错误信息
      if (err.message?.includes('User rejected')) {
        toast.error('用户拒绝了授权交易')
      } else if (err.message?.includes('insufficient funds')) {
        toast.error('账户ETH余额不足支付gas费用')
      } else if (err.message?.includes('contract')) {
        toast.error(`合约调用失败: 请检查USDT合约地址是否正确 (${usdtToken?.address})`)
      } else {
        toast.error(`授权失败: ${err.message || '未知错误'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ETH换USDT (使用V2)
  const swapETHForUSDT = async (ethAmount: string) => {
    if (!isConnected || !address || !routerAddress || !wethToken || !usdtToken) {
      toast.error(UNISWAP_ERROR_MESSAGES.NETWORK_NOT_SUPPORTED)
      return
    }

    try {
      setIsLoading(true)
      setSwapType('eth-to-usdt')
      setInputAmount(ethAmount)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟后过期
      const amountIn = parseEther(ethAmount)
      
      // 等待价格计算完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const expectedUSDT = calculateSwapAmount(ethAmount, true)
      const minAmountOut = parseUnits(
        (parseFloat(expectedUSDT) * (1 - slippage / 100)).toFixed(6),
        usdtToken.decimals
      )

      const path = [wethToken.address as `0x${string}`, usdtToken.address as `0x${string}`]

      await writeContract({
        address: routerAddress as `0x${string}`,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [minAmountOut, path, address, BigInt(deadline)],
        value: amountIn,
      })

      toast.success('ETH换USDT交易已提交，等待确认...')
    } catch (err: any) {
      console.error('ETH换USDT失败:', err)
      toast.error(`交换失败: ${err.message || UNISWAP_ERROR_MESSAGES.TRANSACTION_FAILED}`)
    } finally {
      setIsLoading(false)
    }
  }

  // USDT换ETH (使用V2)
  const swapUSDTForETH = async (usdtAmount: string) => {
    if (!isConnected || !address || !routerAddress || !wethToken || !usdtToken) {
      toast.error(UNISWAP_ERROR_MESSAGES.NETWORK_NOT_SUPPORTED)
      return
    }

    if (needsUSDTApproval(usdtAmount)) {
      toast.error(UNISWAP_ERROR_MESSAGES.APPROVAL_REQUIRED)
      return
    }

    try {
      setIsLoading(true)
      setSwapType('usdt-to-eth')
      setInputAmount(usdtAmount)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟后过期
      const amountIn = parseUnits(usdtAmount, usdtToken.decimals)
      
      // 等待价格计算完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const expectedETH = calculateSwapAmount(usdtAmount, false)
      const minAmountOut = parseEther(
        (parseFloat(expectedETH) * (1 - slippage / 100)).toFixed(18)
      )

      const path = [usdtToken.address as `0x${string}`, wethToken.address as `0x${string}`]

      await writeContract({
        address: routerAddress as `0x${string}`,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [amountIn, minAmountOut, path, address, BigInt(deadline)],
      })

      toast.success('USDT换ETH交易已提交，等待确认...')
    } catch (err: any) {
      console.error('USDT换ETH失败:', err)
      toast.error(`交换失败: ${err.message || UNISWAP_ERROR_MESSAGES.TRANSACTION_FAILED}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 刷新数据
  const refetchAll = () => {
    refetchUSDTBalance()
    refetchUSDTAllowance()
  }

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed) {
      toast.success('🎉 交易已确认！余额将在几秒钟内更新')
      // 延迟刷新以确保区块链数据同步
      setTimeout(() => {
        refetchAll()
      }, 2000)
    }
  }, [isConfirmed])

  // 检查是否支持当前网络
  const isNetworkSupported = UNISWAP_CONFIG.SUPPORTED_CHAINS.includes(chainId as any)

  return {
    // 网络信息
    chainId,
    routerAddress,
    isNetworkSupported,
    
    // 代币信息
    wethToken,
    usdtToken,
    usdtBalance: formatUSDTBalance(),
    usdtAllowance: usdtAllowance ? formatUnits(usdtAllowance, usdtToken?.decimals || 6) : '0',

    // 汇率数据状态
    ethToUsdtAmounts,
    usdtToEthAmounts,

    // 计算函数
    calculateSwapAmount,
    
    // 交易函数
    swapETHForUSDT,
    swapUSDTForETH,
    approveUSDT,
    needsUSDTApproval,
    
    // 设置
    slippage,
    setSlippage,
    
    // 状态
    isLoading: isLoading || isPending || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error,
    
    // 刷新函数
    refetchAll,
    refetchUSDTBalance,
    refetchUSDTAllowance,
  }
}