import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import toast from "react-hot-toast";
import {
  getContractAddress,
  isLocalNetwork,
  getNetworkName,
  ERROR_MESSAGES,
} from "../config/tokenSwap";

// 合约ABI
const TOKEN_SWAP_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_tokenAddress", type: "address" },
      { internalType: "uint256", name: "_rate", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AmountMustBePositive",
    type: "error",
  },
  {
    inputs: [],
    name: "ETHTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ExcessiveSlippage",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientETHBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientTokenBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientUserTokenBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidFeeRate",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRate",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTokenAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenTransferFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "ETHDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "ETHWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "ethAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "tokenAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" }
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ethAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" }
    ],
    name: "TokensSold",
    type: "event",
  },
  {
    inputs: [],
    name: "rate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "yiDengToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [{ internalType: "uint256", name: "minTokenAmount", type: "uint256" }],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenAmount", type: "uint256" },
      { internalType: "uint256", name: "minETHAmount", type: "uint256" }
    ],
    name: "sellTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "getETHBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "getFeeRates",
    outputs: [
      { internalType: "uint256", name: "buyFee", type: "uint256" },
      { internalType: "uint256", name: "sellFee", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
] as const;

// ERC20 ABI
const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// 最大授权金额常量
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export function useTokenSwap() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>();
  const [lastApprovalHash, setLastApprovalHash] = useState<string>();

  // 获取当前网络的合约地址
  useEffect(() => {
    try {
      const addr = getContractAddress(chainId)
      console.log(`🔗 设置合约地址 (${chainId}):`, addr)
      setContractAddress(addr)
    } catch (error) {
      console.warn(`❌ 不支持的网络 ${chainId}:`, error)
      setContractAddress(undefined)
    }
  }, [chainId]);

  // 获取兑换率
  const { data: exchangeRate, refetch: refetchRate, error: rateError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "rate",
    query: { enabled: !!contractAddress },
  });

  // 获取手续费率
  const { data: feeRates, refetch: refetchFees } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getFeeRates",
    query: { enabled: !!contractAddress },
  });

  // 获取合约中的代币余额
  const { data: contractTokenBalance, refetch: refetchContractTokenBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getTokenBalance",
    query: { enabled: !!contractAddress },
  });

  // 获取合约中的ETH余额
  const { data: contractETHBalance, refetch: refetchContractETHBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getETHBalance",
    query: { enabled: !!contractAddress },
  });

  // 获取一灯币合约地址
  const { data: yiDengTokenAddress, refetch: refetchTokenAddress, error: tokenAddressError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'yiDengToken',
    query: { enabled: !!contractAddress }
  })
  
  // 获取用户的一灯币余额
  const { 
    data: userTokenBalance, 
    refetch: refetchUserTokenBalance, 
    error: userBalanceError,
    isLoading: isLoadingUserBalance 
  } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!yiDengTokenAddress && !!address,
      retry: 3,
      retryDelay: 1000
    }
  })
  
  // 获取用户对合约的授权额度 - 关键修复：增加刷新频率
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && yiDengTokenAddress && contractAddress
      ? [address, contractAddress as `0x${string}`]
      : undefined,
    query: { 
      enabled: !!yiDengTokenAddress && !!address && !!contractAddress,
      refetchInterval: 3000, // 每3秒刷新授权状态
    },
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // 刷新所有数据
  const refetchAll = () => {
    console.log('🔄 刷新所有数据...')
    refetchRate()
    refetchFees()
    refetchContractTokenBalance()
    refetchContractETHBalance()
    refetchTokenAddress()
    refetchUserTokenBalance()
    refetchAllowance()
  }
  
  // 监听交易确认，刷新数据
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ 交易已确认，刷新数据...')
      
      // 如果是授权交易，立即多次刷新授权状态
      if (hash === lastApprovalHash) {
        console.log('🔐 授权交易已确认，强制刷新授权状态')
        refetchAllowance()
        setTimeout(() => refetchAllowance(), 1000)
        setTimeout(() => refetchAllowance(), 3000)
        toast.success('授权已完成！现在可以进行兑换操作')
      }
      
      setTimeout(() => refetchAll(), 2000)
    }
  }, [isConfirmed, hash, lastApprovalHash])
  
  // 计算函数
  const calculateTokensForETH = (ethAmount: string): string => {
    if (!exchangeRate || !ethAmount || !contractAddress) return "0";
    try {
      const ethInWei = parseEther(ethAmount);
      const grossTokens = ethInWei * BigInt(exchangeRate.toString());
      const fee = feeRates
        ? (grossTokens * BigInt(feeRates[0].toString())) / BigInt(10000)
        : BigInt(0);
      const netTokens = grossTokens - fee;
      return formatUnits(netTokens, 18);
    } catch (error) {
      console.error("计算代币数量失败:", error);
      return "0";
    }
  }
  
  const calculateETHForTokens = (tokenAmount: string): string => {
    if (!exchangeRate || !tokenAmount || !contractAddress) return "0";
    try {
      const tokensInWei = parseUnits(tokenAmount, 18);
      const grossETH = tokensInWei / BigInt(exchangeRate.toString());
      const fee = feeRates
        ? (grossETH * BigInt(feeRates[1].toString())) / BigInt(10000)
        : BigInt(0);
      const netETH = grossETH - fee;
      return formatEther(netETH);
    } catch (error) {
      console.error("计算ETH数量失败:", error);
      return "0";
    }
  }
  
  // 购买代币函数
  const buyTokens = async (ethAmount: string, slippage: number = 1) => {
    if (!isConnected || !address || !exchangeRate || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    const expectedTokens = calculateTokensForETH(ethAmount);
    const contractTokens = contractTokenBalance ? parseFloat(contractTokenBalance) : 0;
    if (contractTokens < parseFloat(expectedTokens)) {
      toast.error("合约中代币库存不足，请联系管理员");
      return;
    }

    try {
      setIsLoading(true);
      const minTokenAmount = parseUnits(
        (parseFloat(expectedTokens) * (1 - slippage / 100)).toFixed(18),
        18
      );

      console.log("购买参数:", {
        ethAmount,
        expectedTokens,
        minTokenAmount: minTokenAmount.toString(),
        slippage,
        contractAddress,
        userAddress: address
      })
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: "buyTokens",
        args: [minTokenAmount],
        value: parseEther(ethAmount),
      });

      const networkName = getNetworkName(chainId);
      toast.success(`购买交易已提交到 ${networkName}`);
    } catch (err: any) {
      console.error("购买代币失败:", err);
      let errorMessage = "购买失败";
      if (err.message?.includes("InsufficientTokenBalance")) {
        errorMessage = "合约中代币库存不足";
      } else if (err.message?.includes("ExcessiveSlippage")) {
        errorMessage = "滑点过大，请增加滑点容差或稍后重试";
      } else if (err.message?.includes("User rejected")) {
        errorMessage = "用户取消了交易";
      } else if (err.message) {
        errorMessage = `购买失败: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  // 关键修复：改进的授权函数 - 使用无限授权
  const approveTokens = async (amount: string) => {
    if (!isConnected || !address || !yiDengTokenAddress || !contractAddress) {
      toast.error('钱包未连接或合约地址未获取')
      return
    }

    try {
      setIsLoading(true)
      
      // 关键修复：使用最大值授权，用户只需授权一次
      const approvalAmount = BigInt(MAX_UINT256);
      
      console.log('🔐 使用无限授权策略:', {
        tokenAddress: yiDengTokenAddress,
        spender: contractAddress,
        approvalAmount: "MAX_UINT256",
        userAddress: address
      })
      
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, approvalAmount],
      });

      // 获取当前交易哈希，用于跟踪授权交易
      if (hash) {
        setLastApprovalHash(hash);
      }
      
      toast.success("授权交易已提交，等待确认...");
      
    } catch (err: any) {
      console.error("授权失败:", err);
      let errorMessage = "授权失败";
      if (err.message?.includes("User rejected")) {
        errorMessage = "用户取消了授权";
      } else if (err.message) {
        errorMessage = `授权失败: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  // 出售代币函数
  const sellTokens = async (tokenAmount: string, slippage: number = 1) => {
    if (!isConnected || !address || !exchangeRate || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    // 关键修复：在出售前再次检查授权状态
    if (needsApproval(tokenAmount)) {
      toast.error("请先授权一灯币后再进行兑换");
      // 刷新授权状态，防止状态不同步
      refetchAllowance();
      return;
    }

    const expectedETH = calculateETHForTokens(tokenAmount);
    const contractETH = contractETHBalance ? parseFloat(contractETHBalance) : 0;
    if (contractETH < parseFloat(expectedETH)) {
      toast.error("合约中ETH库存不足，请联系管理员");
      return;
    }

    try {
      setIsLoading(true);
      const minETHAmount = parseEther(
        (parseFloat(expectedETH) * (1 - slippage / 100)).toFixed(18)
      )
      
      console.log('🔄 出售参数:', {
        tokenAmount,
        expectedETH,
        minETHAmount: minETHAmount.toString(),
        slippage,
        userTokenBalance: userTokenBalance?.toString(),
        currentAllowance: allowance?.toString(),
        contractAddress,
        userAddress: address
      })
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: "sellTokens",
        args: [parseUnits(tokenAmount, 18), minETHAmount],
      });

      const networkName = getNetworkName(chainId);
      toast.success(`出售交易已提交到 ${networkName}`);
    } catch (err: any) {
      console.error("出售代币失败:", err);
      let errorMessage = "出售失败";
      if (err.message?.includes("InsufficientETHBalance")) {
        errorMessage = "合约中ETH库存不足";
      } else if (err.message?.includes("InsufficientUserTokenBalance")) {
        errorMessage = "您的代币余额不足";
      } else if (err.message?.includes("ExcessiveSlippage")) {
        errorMessage = "滑点过大，请增加滑点容差或稍后重试";
      } else if (err.message?.includes("ERC20: insufficient allowance")) {
        errorMessage = "代币授权不足，请先授权";
        setTimeout(() => refetchAllowance(), 1000);
      } else if (err.message?.includes("User rejected")) {
        errorMessage = "用户取消了交易";
      } else if (err.message) {
        errorMessage = `出售失败: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 关键修复：改进的授权检查逻辑
  const needsApproval = (tokenAmount: string): boolean => {
    if (!allowance || !tokenAmount || !yiDengTokenAddress || !contractAddress) {
      console.log('🔐 授权检查 - 缺少信息，默认需要授权')
      return true;
    }
    
    try {
      const amountInWei = parseUnits(tokenAmount, 18)
      const currentAllowance = BigInt(allowance.toString())
      const needsAuth = currentAllowance < amountInWei
      
      console.log(`🔐 授权检查详情:`, {
        tokenAmount,
        amountInWei: amountInWei.toString(),
        currentAllowance: currentAllowance.toString(),
        needsAuthorization: needsAuth,
        isInfiniteApproval: currentAllowance.toString() === MAX_UINT256
      })
      
      return needsAuth
    } catch (error) {
      console.error('授权检查出错:', error)
      return true;
    }
  };

  // 检查用户余额是否足够
  const hasEnoughBalance = (amount: string, type: "token" | "eth"): boolean => {
    if (!amount) return false;
    try {
      if (type === 'token') {
        const amountInWei = parseUnits(amount, 18)
        const hasBalance = userTokenBalance ? BigInt(userTokenBalance.toString()) >= amountInWei : false
        console.log(`💰 检查代币余额:`, {
          requestedAmount: amount,
          userBalance: userTokenBalance?.toString(),
          hasEnoughBalance: hasBalance
        })
        return hasBalance
      }
      return true;
    } catch {
      return false;
    }
  };

  // 检查合约是否可用
  const isContractAvailable = (): boolean => {
    const available = !!contractAddress && !!exchangeRate
    if (contractAddress && !exchangeRate && rateError) {
      console.error('❌ 合约可达但无法获取兑换率:', rateError)
    }
    return available
  }
  
  // 格式化余额显示
  const formatUserTokenBalance = (): string => {
    if (!userTokenBalance) return '0'
    try {
      const formatted = formatUnits(userTokenBalance, 18)
      return formatted
    } catch (error) {
      console.error('格式化余额失败:', error)
      return '0'
    }
  }

  // 监听授权状态变化，提供调试信息
  useEffect(() => {
    if (allowance) {
      console.log('🔐 授权状态更新:', {
        allowance: allowance.toString(),
        formatted: formatUnits(allowance, 18),
        isInfiniteApproval: allowance.toString() === MAX_UINT256
      })
    }
  }, [allowance])
  
  return {
    // 网络信息
    chainId,
    contractAddress,
    networkName: getNetworkName(chainId),
    isLocalNetwork: isLocalNetwork(chainId),
    isContractAvailable: isContractAvailable(),

    // 合约状态
    exchangeRate: exchangeRate ? Number(exchangeRate) : 0,
    feeRates: feeRates
      ? {
          buyFee: Number(feeRates[0]) / 100,
          sellFee: Number(feeRates[1]) / 100,
        }
      : { buyFee: 1, sellFee: 1 },
    contractTokenBalance: contractTokenBalance
      ? formatUnits(contractTokenBalance, 18)
      : "0",
    contractETHBalance: contractETHBalance
      ? formatEther(contractETHBalance)
      : "0",

    // 用户状态
    userTokenBalance: formatUserTokenBalance(),
    allowance: allowance ? formatUnits(allowance, 18) : '0',
    yiDengTokenAddress,
    
    // 调试信息
    rawUserTokenBalance: userTokenBalance,
    rawAllowance: allowance,
    userBalanceError,
    isLoadingUserBalance,
    
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
  };
}