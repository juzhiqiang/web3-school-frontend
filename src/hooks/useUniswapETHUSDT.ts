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

  // 获取交易汇率（使用Uniswap V2 Router的getAmountsOut函数）
  const { data: ethToUsdtAmounts } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: wethToken && usdtToken ? [
      parseEther('1'), // 1 ETH
      [wethToken.address as `0x${string}`, usdtToken.address as `0x${string}`]
    ] : undefined,
    query: {
      enabled: !!routerAddress && !!wethToken && !!usdtToken,
      refetchInterval: 30000, // 30秒刷新一次汇率
    }
  })

  const { data: usdtToEthAmounts } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: usdtToken && wethToken ? [
      parseUnits('1000', 6), // 1000 USDT
      [usdtToken.address as `0x${string}`, wethToken.address as `0x${string}`]
    ] : undefined,
    query: {
      enabled: !!routerAddress && !!wethToken && !!usdtToken,
      refetchInterval: 30000, // 30秒刷新一次汇率
    }
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

  // 计算交易价格（使用真实的Uniswap V2汇率）
  const calculateSwapAmount = (inputAmount: string, isETHToUSDT: boolean): string => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return '0'
    
    try {
      if (isETHToUSDT && ethToUsdtAmounts && ethToUsdtAmounts.length > 1) {
        // ETH -> USDT
        const ethAmountWei = parseEther(inputAmount)
        const oneEthInUSDT = ethToUsdtAmounts[1] // getAmountsOut返回的第二个值是输出代币数量
        const expectedUSDT = (ethAmountWei * oneEthInUSDT) / parseEther('1')
        return formatUnits(expectedUSDT, usdtToken?.decimals || 6)
      } else if (!isETHToUSDT && usdtToEthAmounts && usdtToEthAmounts.length > 1) {
        // USDT -> ETH
        const usdtAmountWei = parseUnits(inputAmount, usdtToken?.decimals || 6)
        const oneThousandUSDTInETH = usdtToEthAmounts[1]
        const expectedETH = (usdtAmountWei * oneThousandUSDTInETH) / parseUnits('1000', 6)
        return formatUnits(expectedETH, 18)
      } else {
        // 回退到静态汇率（如果无法获取实时汇率）
        const mockETHUSDTRate = 2500
        
        if (isETHToUSDT) {
          const usdtAmount = parseFloat(inputAmount) * mockETHUSDTRate
          return usdtAmount.toFixed(6)
        } else {
          const ethAmount = parseFloat(inputAmount) / mockETHUSDTRate
          return ethAmount.toFixed(18)
        }
      }
    } catch (error) {
      console.error('计算交换金额失败:', error)
      return '0'
    }
  }

  // 检查是否需要授权USDT
  const needsUSDTApproval = (amount: string): boolean => {
    if (!usdtAllowance || !amount || !usdtToken) return true
    
    try {
      const amountInWei = parseUnits(amount, usdtToken.decimals)
      const currentAllowance = BigInt(usdtAllowance.toString())
      return currentAllowance < amountInWei
    } catch (error) {
      return true
    }
  }

  // 授权USDT
  const approveUSDT = async (amount: string = MAX_UINT256) => {
    if (!isConnected || !address || !usdtToken?.address || !routerAddress) {
      toast.error(UNISWAP_ERROR_MESSAGES.NETWORK_NOT_SUPPORTED)
      return
    }

    try {
      setIsLoading(true)
      
      await writeContract({
        address: usdtToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [routerAddress as `0x${string}`, parseUnits(amount === MAX_UINT256 ? amount : amount, usdtToken.decimals)],
      })

      toast.success('USDT授权交易已提交，等待确认...')
    } catch (err: any) {
      console.error('USDT授权失败:', err)
      toast.error(`授权失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // ETH换USDT (使用Uniswap V2)
  const swapETHForUSDT = async (ethAmount: string) => {
    if (!isConnected || !address || !routerAddress || !wethToken || !usdtToken) {
      toast.error(UNISWAP_ERROR_MESSAGES.NETWORK_NOT_SUPPORTED)
      return
    }

    try {
      setIsLoading(true)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟后过期
      const amountIn = parseEther(ethAmount)
      const expectedUSDT = calculateSwapAmount(ethAmount, true)
      const minAmountOut = parseUnits(
        (parseFloat(expectedUSDT) * (1 - slippage / 100)).toFixed(6),
        usdtToken.decimals
      )

      // Uniswap V2 交易路径：ETH -> USDT
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

  // USDT换ETH (使用Uniswap V2)
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
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟后过期
      const amountIn = parseUnits(usdtAmount, usdtToken.decimals)
      const expectedETH = calculateSwapAmount(usdtAmount, false)
      const minAmountOut = parseEther(
        (parseFloat(expectedETH) * (1 - slippage / 100)).toFixed(18)
      )

      // Uniswap V2 交易路径：USDT -> ETH
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