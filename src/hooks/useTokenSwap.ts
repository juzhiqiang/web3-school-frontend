import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'

// YiDengTokenSwap合约地址
const TOKEN_SWAP_CONTRACT_ADDRESS = '0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0' as const

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
  const [isLoading, setIsLoading] = useState(false)
  
  // 获取兑换率
  const { data: exchangeRate } = useReadContract({
    address: TOKEN_SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: 'rate',
  })
  
  // 获取手续费率
  const { data: feeRates } = useReadContract({
    address: TOKEN_SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getFeeRates',
  })
  
  // 获取合约中的代币余额
  const { data: contractTokenBalance } = useReadContract({
    address: TOKEN_SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getTokenBalance',
  })
  
  // 获取合约中的ETH余额
  const { data: contractETHBalance } = useReadContract({
    address: TOKEN_SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: 'getETHBalance',
  })
  
  // 获取一灯币合约地址
  const { data: yiDengTokenAddress } = useReadContract({
    address: TOKEN_SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: 'yiDengToken',
  })
  
  // 获取用户的一灯币余额
  const { data: userTokenBalance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })
  
  // 获取用户对合约的授权额度
  const { data: allowance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && yiDengTokenAddress ? [address, TOKEN_SWAP_CONTRACT_ADDRESS] : undefined,
  })
  
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  
  // 计算购买代币数量
  const calculateTokensForETH = (ethAmount: string): string => {
    if (!exchangeRate || !ethAmount) return '0'
    try {
      const ethInWei = parseEther(ethAmount)
      const grossTokens = ethInWei * BigInt(exchangeRate.toString())
      const fee = feeRates ? (grossTokens * BigInt(feeRates[0].toString())) / BigInt(10000) : BigInt(0)
      const netTokens = grossTokens - fee
      return formatUnits(netTokens, 18) // 假设代币是18位小数
    } catch {
      return '0'
    }
  }
  
  // 计算出售代币可获得的ETH
  const calculateETHForTokens = (tokenAmount: string): string => {
    if (!exchangeRate || !tokenAmount) return '0'
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
    if (!isConnected || !address || !exchangeRate) {
      toast.error('请先连接钱包')
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
        address: TOKEN_SWAP_CONTRACT_ADDRESS,
        abi: TOKEN_SWAP_ABI,
        functionName: 'buyTokens',
        args: [minTokenAmount],
        value: parseEther(ethAmount),
      })
      
      toast.success('购买交易已提交')
    } catch (err: any) {
      console.error('购买代币失败:', err)
      toast.error(`购买失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 授权代币
  const approveTokens = async (amount: string) => {
    if (!isConnected || !address || !yiDengTokenAddress) {
      toast.error('请先连接钱包')
      return
    }
    
    try {
      setIsLoading(true)
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TOKEN_SWAP_CONTRACT_ADDRESS, parseUnits(amount, 18)],
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
    if (!isConnected || !address || !exchangeRate) {
      toast.error('请先连接钱包')
      return
    }
    
    try {
      setIsLoading(true)
      const expectedETH = calculateETHForTokens(tokenAmount)
      const minETHAmount = parseEther(
        (parseFloat(expectedETH) * (1 - slippage / 100)).toFixed(18)
      )
      
      await writeContract({
        address: TOKEN_SWAP_CONTRACT_ADDRESS,
        abi: TOKEN_SWAP_ABI,
        functionName: 'sellTokens',
        args: [parseUnits(tokenAmount, 18), minETHAmount],
      })
      
      toast.success('出售交易已提交')
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
  
  return {
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
    
    // 计算函数
    calculateTokensForETH,
    calculateETHForTokens,
    
    // 交易函数
    buyTokens,
    sellTokens,
    approveTokens,
    needsApproval,
    
    // 加载状态
    isLoading: isLoading || isPending || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error,
  }
}
