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

// 完整的合约ABI，包含充值函数
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
  // Events
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
    name: "TokensDeposited",
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
  // View functions
  {
    inputs: [],
    name: "rate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "yiDengToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getETHBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
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
  },
  // Main functions
  {
    inputs: [{ internalType: "uint256", name: "minTokenAmount", type: "uint256" }],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
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
  // Admin functions
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "depositTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// ERC20 ABI，包含铸币函数
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
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// 最大授权金额常量
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export function useTokenSwap(refetchETHBalance?: () => void) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>();
  const [lastApprovalHash, setLastApprovalHash] = useState<string>();

  useEffect(() => {
    try {
      const addr = getContractAddress(chainId)
      setContractAddress(addr)
    } catch (error) {
      setContractAddress(undefined)
    }
  }, [chainId]);

  const { data: exchangeRate, refetch: refetchRate, error: rateError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "rate",
    query: { enabled: !!contractAddress },
  });

  const { data: feeRates, refetch: refetchFees } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getFeeRates",
    query: { enabled: !!contractAddress },
  });

  const { data: contractTokenBalance, refetch: refetchContractTokenBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getTokenBalance",
    query: { enabled: !!contractAddress },
  });

  const { data: contractETHBalance, refetch: refetchContractETHBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: "getETHBalance",
    query: { enabled: !!contractAddress },
  });

  const { data: yiDengTokenAddress, refetch: refetchTokenAddress } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'yiDengToken',
    query: { enabled: !!contractAddress }
  })
  
  const { data: contractOwner } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_SWAP_ABI,
    functionName: 'owner',
    query: { enabled: !!contractAddress }
  })
  
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
  
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && yiDengTokenAddress && contractAddress
      ? [address, contractAddress as `0x${string}`]
      : undefined,
    query: { 
      enabled: !!yiDengTokenAddress && !!address && !!contractAddress,
      refetchInterval: 3000,
    },
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const refetchAll = () => {
    refetchRate()
    refetchFees()
    refetchContractTokenBalance()
    refetchContractETHBalance()
    refetchTokenAddress()
    refetchUserTokenBalance()
    refetchAllowance()
    
    // 刷新ETH余额
    if (refetchETHBalance) {
      refetchETHBalance()
    }
  }
  
  useEffect(() => {
    if (isConfirmed) {
      if (hash === lastApprovalHash) {
        // 授权交易确认
        refetchAllowance()
        setTimeout(() => refetchAllowance(), 1000)
        setTimeout(() => refetchAllowance(), 3000)
        toast.success('授权已完成！现在可以进行兑换操作')
      } else {
        // 兑换交易确认 - 立即刷新所有数据
        toast.success('🎉 兑换成功！余额已更新')
        
        // 立即刷新
        refetchAll()
        
        // 延迟刷新确保数据同步
        setTimeout(() => {
          refetchAll()
        }, 1000)
        
        setTimeout(() => {
          refetchAll()
        }, 3000)
        
        // 额外刷新用户余额（最重要）
        setTimeout(() => {
          refetchUserTokenBalance()
          // 也刷新ETH余额
          if (refetchETHBalance) {
            refetchETHBalance()
          }
        }, 5000)
      }
    }
  }, [isConfirmed, hash, lastApprovalHash])
  
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
      return "0";
    }
  }
  
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

      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: "buyTokens",
        args: [minTokenAmount],
        value: parseEther(ethAmount),
      });

      const networkName = getNetworkName(chainId);
      toast.success(`购买交易已提交到 ${networkName}，等待确认后余额将自动更新`);
    } catch (err: any) {
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
  
  const approveTokens = async (amount: string) => {
    if (!isConnected || !address || !yiDengTokenAddress || !contractAddress) {
      toast.error('钱包未连接或合约地址未获取')
      return
    }

    try {
      setIsLoading(true)
      const approvalAmount = BigInt(MAX_UINT256);
      
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, approvalAmount],
      });

      if (hash) {
        setLastApprovalHash(hash);
      }
      
      toast.success("授权交易已提交，等待确认...");
      
    } catch (err: any) {
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
  
  const sellTokens = async (tokenAmount: string, slippage: number = 1) => {
    if (!isConnected || !address || !exchangeRate || !contractAddress) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (needsApproval(tokenAmount)) {
      toast.error("请先授权一灯币后再进行兑换");
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
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: "sellTokens",
        args: [parseUnits(tokenAmount, 18), minETHAmount],
      });

      const networkName = getNetworkName(chainId);
      toast.success(`出售交易已提交到 ${networkName}，等待确认后余额将自动更新`);
    } catch (err: any) {
      let errorMessage = "出售失败";
      if (err.message?.includes("InsufficientETHBalance")) {
        errorMessage = "合约中ETH库存不足";
      } else if (err.message?.includes("InsufficientUserTokenBalance")) {
        errorMessage = "您的代币余额不足";
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

  // 新增：完整的测试充值函数 - 铸造代币并充值到合约
  const mintAndDepositTestTokens = async (amount: string = "10000") => {
    if (!isConnected || !address || !yiDengTokenAddress || !contractAddress) {
      toast.error('钱包未连接或合约地址未获取')
      return
    }

    try {
      setIsLoading(true)
      const mintAmount = parseUnits(amount, 18)
      
      // 提示用户需要确认多个交易
      toast.success(`开始充值流程：需要确认3个交易`);
      
      // 第一步：铸造代币给当前用户
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [address, mintAmount],
      });

      toast.success(`步骤1完成: 已铸造 ${amount} 一灯币到您的账户`);
      
      // 等待用户确认铸造后，提示下一步
      setTimeout(async () => {
        try {
          // 第二步：授权合约使用用户的代币
          await writeContract({
            address: yiDengTokenAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [contractAddress as `0x${string}`, mintAmount],
          });

          toast.success(`步骤2完成: 已授权合约使用代币`);
          
          // 等待授权确认后，执行最后一步
          setTimeout(async () => {
            try {
              // 第三步：调用合约的depositTokens函数
              await writeContract({
                address: contractAddress as `0x${string}`,
                abi: TOKEN_SWAP_ABI,
                functionName: "depositTokens",
                args: [mintAmount],
              });

              toast.success(`✅ 充值完成！${amount} 一灯币已添加到合约中`);
              
              // 刷新数据
              setTimeout(() => refetchAll(), 2000);
              
            } catch (err: any) {
              toast.error("转移代币到合约失败：" + (err.message || "未知错误"));
            }
          }, 3000); // 等待3秒让授权交易确认
          
        } catch (err: any) {
          toast.error("授权合约失败：" + (err.message || "未知错误"));
        }
      }, 3000); // 等待3秒让铸造交易确认
      
    } catch (err: any) {
      let errorMessage = "铸造代币失败";
      if (err.message?.includes("User rejected")) {
        errorMessage = "用户取消了操作";
      } else if (err.message?.includes("Ownable: caller is not the owner")) {
        errorMessage = "需要合约所有者权限来铸造代币";
      } else if (err.message) {
        errorMessage = `铸造失败: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      // 注意：这里不立即设置loading为false，因为后续还有步骤
      // 实际的loading状态会在最后一步完成时设置
      setTimeout(() => setIsLoading(false), 10000); // 10秒后强制解除loading状态
    }
  }

  // 新增：充值ETH到合约
  const depositETHToContract = async (amount: string = "1") => {
    if (!isConnected || !address || !contractAddress) {
      toast.error('钱包未连接或合约地址未获取')
      return
    }

    try {
      setIsLoading(true)
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: TOKEN_SWAP_ABI,
        functionName: "depositETH",
        args: [],
        value: parseEther(amount),
      });

      toast.success(`✅ 成功充值 ${amount} ETH 到合约！`);
      
      // 刷新数据
      setTimeout(() => refetchAll(), 2000);
      
    } catch (err: any) {
      let errorMessage = "充值ETH失败";
      if (err.message?.includes("User rejected")) {
        errorMessage = "用户取消了充值";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "ETH余额不足";
      } else if (err.message?.includes("Ownable: caller is not the owner")) {
        errorMessage = "需要合约所有者权限";
      } else if (err.message) {
        errorMessage = `充值失败: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const needsApproval = (tokenAmount: string): boolean => {
    if (!allowance || !tokenAmount || !yiDengTokenAddress || !contractAddress) {
      return true;
    }
    
    try {
      const amountInWei = parseUnits(tokenAmount, 18)
      const currentAllowance = BigInt(allowance.toString())
      return currentAllowance < amountInWei
    } catch (error) {
      return true;
    }
  };

  const hasEnoughBalance = (amount: string, type: "token" | "eth"): boolean => {
    if (!amount) return false;
    try {
      if (type === 'token') {
        const amountInWei = parseUnits(amount, 18)
        return userTokenBalance ? BigInt(userTokenBalance.toString()) >= amountInWei : false
      }
      return true;
    } catch {
      return false;
    }
  };

  const isContractAvailable = (): boolean => {
    return !!contractAddress && !!exchangeRate
  }
  
  const formatUserTokenBalance = (): string => {
    if (!userTokenBalance) return '0'
    try {
      return formatUnits(userTokenBalance, 18)
    } catch (error) {
      return '0'
    }
  }

  const isOwner = (): boolean => {
    return !!contractOwner && !!address && contractOwner.toLowerCase() === address.toLowerCase();
  }
  
  return {
    // 网络信息
    chainId,
    contractAddress,
    networkName: getNetworkName(chainId),
    isLocalNetwork: isLocalNetwork(chainId),
    isContractAvailable: isContractAvailable(),
    isOwner: isOwner(),

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
    contractOwner,
    
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

    // 新增：测试充值函数
    mintAndDepositTestTokens,
    depositETHToContract,

    // 加载状态
    isLoading: isLoading || isPending || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error,
  };
}