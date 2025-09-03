import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'
import { getContractAddress, isLocalNetwork, getNetworkName, ERROR_MESSAGES } from '../config/tokenSwap'

// 合约ABI（根据合约代码生成）
const TOKEN_SWAP_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_tokenAddress", "type": "address"},
      {"internalType": "uint256", "name": "_rate", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "minTokenAmount", "type": "uint256"}],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "minETHAmount", "type": "uint256"}
    ],
    "name": "sellTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "ethAmount", "type": "uint256"}],
    "name": "calculateTokensForETH",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenAmount", "type": "uint256"}],
    "name": "calculateETHForTokenSale",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFeeRates",
    "outputs": [
      {"internalType": "uint256", "name": "buyFee", "type": "uint256"},
      {"internalType": "uint256", "name": "sellFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getETHBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "yiDengToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "ethAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}
    ],
    "name": "TokensPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "ethAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}
    ],
    "name": "TokensSold",
    "type": "event"
  }
] as const

// ERC20 ABI (用于代币相关操作)
const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export function useTokenSwap() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isLoading, setIsLoading] = useState(false)
  const [contractAddress, setContractAddress] = useState<string>()
  
  // 获取当前网络的合约地址
  useEffect(() => {
    try {
      const addr = getContractAddress(chainId)
      setContractAddress(addr)
    } catch (error) {
      console.warn(`不支持的网络 ${chainId}:`, error)
      setContractAddress(undefined)
    }
  }, [chainId])
  
  // 获取兑换率
  const { data: exchangeRate, refetch: refetchRate } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'rate',
    query: { enabled: !!contractAddress }
  })
  
  // 获取手续费率
  const { data: feeRates, refetch: refetchFees } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getFeeRates',
    query: { enabled: !!contractAddress }
  })
  
  // 获取合约中的代币余额
  const { data: contractTokenBalance, refetch: refetchContractTokenBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getTokenBalance',
    query: { enabled: !!contractAddress }
  })
  
  // 获取合约中的ETH余额
  const { data: contractETHBalance, refetch: refetchContractETHBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getETHBalance',
    query: { enabled: !!contractAddress }
  })
  
  // 获取一灯币合约地址
  const { data: yiDengTokenAddress } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'yiDengToken',
    query: { enabled: !!contractAddress }
  })
  
  // 获取用户的一灯币余额
  const { data: userTokenBalance, refetch: refetchUserTokenBalance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!yiDengTokenAddress && !!address }
  })
  
  // 获取用户对合约的授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && yiDengTokenAddress && contractAddress ? [address, contractAddress as `0x${string}`] : undefined,
    query: { enabled: !!yiDengTokenAddress && !!address && !!contractAddress }
  })
  
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  
  // 刷新所有数据
  const refetchAll = () => {
    refetchRate()
    refetchFees()
    refetchContractTokenBalance()
    refetchContractETHBalance()
    refetchUserTokenBalance()
    refetchAllowance()
  }
  
  // 监听交易确认，刷新数据
  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed])
  
  // 计算购买代币数量
  const calculateTokensForETH = (ethAmount: string): string => {
    if (!exchangeRate || !ethAmount || !contractAddress) return '0'
    try {
      const ethInWei = parseEther(ethAmount)
      const grossTokens = ethInWei * BigInt(exchangeRate.toString())
      const fee = feeRates ? (grossTokens * BigInt(feeRates[0].toString())) / BigInt(10000) : BigInt(0)
      const netTokens = grossTokens - fee
      return formatUnits(netTokens, 18)
    } catch {
      return '0'
    }
  }
  
  // 计算出售代币可获得的ETH
  const calculateETHForTokens = (tokenAmount: string): string => {
    if (!exchangeRate || !tokenAmount || !contractAddress) return '0'
    try {
      const tokensInWei = parseUnits(tokenAmount, 18)
      const grossETH = tokensInWei / BigInt(exchangeRate.toString())
      const fee = feeRates ? (grossETH * BigInt(feeRates[1].toString())) / BigInt(10000) : BigInt(0)
      const netETH = grossETH - fee
      return formatEther(netETH)
    } catch {
      return '0'
    }
  }
  
  // 购买代币
  const buyTokens = async (ethAmount: string, slippage: number = 1) => {
    if (!isConnected || !address || !exchangeRate || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return
    }
    
    try {
      setIsLoading(true)
      const expectedTokens = calculateTokensForETH(ethAmount)
      const minTokenAmount = parseUnits(
        (parseFloat(expectedTokens) * (1 - slippage / 100)).toFixed(18),
        18
      )
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: 'buyTokens',
        args: [minTokenAmount],
        value: parseEther(ethAmount),
      })
      
      const networkName = getNetworkName(chainId)
      toast.success(`购买交易已提交到 ${networkName}`)
    } catch (err: any) {
      console.error('购买代币失败:', err)
      toast.error(`购买失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 授权代币
  const approveTokens = async (amount: string) => {
    if (!isConnected || !address || !yiDengTokenAddress || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return
    }
    
    try {
      setIsLoading(true)
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, parseUnits(amount, 18)],
      })
      
      toast.success('授权交易已提交')
    } catch (err: any) {
      console.error('授权失败:', err)
      toast.error(`授权失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 出售代币
  const sellTokens = async (tokenAmount: string, slippage: number = 1) => {
    if (!isConnected || !address || !exchangeRate || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return
    }
    
    try {
      setIsLoading(true)
      const expectedETH = calculateETHForTokens(tokenAmount)
      const minETHAmount = parseEther(
        (parseFloat(expectedETH) * (1 - slippage / 100)).toFixed(18)
      )
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: 'sellTokens',
        args: [parseUnits(tokenAmount, 18), minETHAmount],
      })
      
      const networkName = getNetworkName(chainId)
      toast.success(`出售交易已提交到 ${networkName}`)
    } catch (err: any) {
      console.error('出售代币失败:', err)
      toast.error(`出售失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 检查是否需要授权
  const needsApproval = (tokenAmount: string): boolean => {
    if (!allowance || !tokenAmount) return false
    try {
      const amountInWei = parseUnits(tokenAmount, 18)
      return BigInt(allowance.toString()) < amountInWei
    } catch {
      return false
    }
  }
  
  // 检查用户余额是否足够
  const hasEnoughBalance = (amount: string, type: 'token' | 'eth'): boolean => {
    if (!amount) return false
    try {
      if (type === 'token') {
        const amountInWei = parseUnits(amount, 18)
        return userTokenBalance ? BigInt(userTokenBalance.toString()) >= amountInWei : false
      }
      // ETH余额检查需要从Web3Context获取
      return true // 简化处理，实际应该检查ETH余额
    } catch {
      return false
    }
  }
  
  // 检查合约是否可用
  const isContractAvailable = (): boolean => {
    return !!contractAddress && !!exchangeRate
  }
  
  return {
    // 网络信息
    chainId,
    contractAddress,
    networkName: getNetworkName(chainId),
    isLocalNetwork: isLocalNetwork(chainId),
    isContractAvailable: isContractAvailable(),
    
    // 合约状态
    exchangeRate: exchangeRate ? Number(exchangeRate) : 0,
    feeRates: feeRates ? {
      buyFee: Number(feeRates[0]) / 100, // 转换为百分比
      sellFee: Number(feeRates[1]) / 100
    } : { buyFee: 1, sellFee: 1 },
    contractTokenBalance: contractTokenBalance ? formatUnits(contractTokenBalance, 18) : '0',
    contractETHBalance: contractETHBalance ? formatEther(contractETHBalance) : '0',
    
    // 用户状态
    userTokenBalance: userTokenBalance ? formatUnits(userTokenBalance, 18) : '0',
    allowance: allowance ? formatUnits(allowance, 18) : '0',
    yiDengTokenAddress,
    
    // 计算函数
    calculateTokensForETH,
    calculateETHForTokens,
    
    // 交易函数
    buyTokens,
    sellTokens,
    approveTokens,
    needsApproval,
    hasEnoughBalance,
    refetchAll,
    
    // 加载状态
    isLoading: isLoading || isPending || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error,
  }
}
