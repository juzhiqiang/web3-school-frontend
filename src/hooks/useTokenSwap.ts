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

// 合约ABI（根据合约代码生成）
const TOKEN_SWAP_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_rate",
        type: "uint256",
      },
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
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ETHDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ETHWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldBuyFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBuyFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldSellFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newSellFee",
        type: "uint256",
      },
    ],
    name: "FeeRateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newRate",
        type: "uint256",
      },
    ],
    name: "RateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "TokensSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "BASIS_POINTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "MAX_FEE_RATE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "buyFeeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "rate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sellFeeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "yiDengToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    stateMutability: "payable",
    type: "receive",
    payable: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minTokenAmount",
        type: "uint256",
      },
    ],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minETHAmount",
        type: "uint256",
      },
    ],
    name: "sellTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_rate",
        type: "uint256",
      },
    ],
    name: "setRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_buyFeeRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_sellFeeRate",
        type: "uint256",
      },
    ],
    name: "setFeeRates",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawTokens",
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
    payable: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "getETHBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "calculateETHForTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
    ],
    name: "calculateTokensForETH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "calculateETHForTokenSale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "getFeeRates",
    outputs: [
      {
        internalType: "uint256",
        name: "buyFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sellFee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "getAccumulatedFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
] as const;

// ERC20 ABI (用于代币相关操作)
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

export function useTokenSwap() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>();

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
  const { data: contractTokenBalance, refetch: refetchContractTokenBalance } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: TOKEN_SWAP_ABI,
      functionName: "getTokenBalance",
      query: { enabled: !!contractAddress },
    });

  // 获取合约中的ETH余额
  const { data: contractETHBalance, refetch: refetchContractETHBalance } =
    useReadContract({
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
  
  // 调试一灯币合约地址获取
  useEffect(() => {
    if (contractAddress) {
      console.log(`🪙 获取一灯币合约地址从兑换合约: ${contractAddress}`)
      if (yiDengTokenAddress) {
        console.log(`✅ 一灯币合约地址: ${yiDengTokenAddress}`)
      } else if (tokenAddressError) {
        console.error(`❌ 获取一灯币合约地址失败:`, tokenAddressError)
      } else {
        console.log(`⏳ 正在获取一灯币合约地址...`)
      }
    }
  }, [contractAddress, yiDengTokenAddress, tokenAddressError])
  
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
  
  // 调试用户一灯币余额获取
  useEffect(() => {
    if (address && yiDengTokenAddress) {
      console.log(`👤 获取用户余额:`, {
        userAddress: address,
        tokenAddress: yiDengTokenAddress,
        isLoading: isLoadingUserBalance
      })
      
      if (userTokenBalance !== undefined) {
        console.log(`💰 用户一灯币余额 (raw):`, userTokenBalance.toString())
        console.log(`💰 用户一灯币余额 (formatted):`, formatUnits(userTokenBalance, 18))
      } else if (userBalanceError) {
        console.error(`❌ 获取用户一灯币余额失败:`, userBalanceError)
      }
    }
  }, [address, yiDengTokenAddress, userTokenBalance, userBalanceError, isLoadingUserBalance])
  
  // 获取用户对合约的授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: yiDengTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && yiDengTokenAddress && contractAddress
        ? [address, contractAddress as `0x${string}`]
        : undefined,
    query: { enabled: !!yiDengTokenAddress && !!address && !!contractAddress },
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

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
      setTimeout(() => {
        refetchAll()
      }, 2000) // 延迟2秒刷新，确保区块链状态更新
    }
  }, [isConfirmed])
  
  // 使用合约的计算函数而非本地计算
  const calculateTokensForETH = (ethAmount: string): string => {
    if (!exchangeRate || !ethAmount || !contractAddress) return "0";
    try {
      // 使用合约的计算逻辑
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
  
  // 使用正确的出售计算逻辑
  const calculateETHForTokens = (tokenAmount: string): string => {
    if (!exchangeRate || !tokenAmount || !contractAddress) return "0";
    try {
      // 使用合约的计算逻辑：先计算总ETH，再扣除手续费
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

    // 检查合约是否有足够的代币
    const expectedTokens = calculateTokensForETH(ethAmount);
    const contractTokens = contractTokenBalance
      ? parseFloat(contractTokenBalance)
      : 0;
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

      // 更详细的错误处理
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
  
  // 授权代币函数
  const approveTokens = async (amount: string) => {
    if (!isConnected || !address || !yiDengTokenAddress || !contractAddress) {
      toast.error('钱包未连接或合约地址未获取')
      console.error('授权失败 - 缺少必要信息:', {
        isConnected,
        address,
        yiDengTokenAddress,
        contractAddress
      })
      return
    }

    try {
      setIsLoading(true)
      
      console.log('🔐 授权参数:', {
        tokenAddress: yiDengTokenAddress,
        spender: contractAddress,
        amount: parseUnits(amount, 18).toString(),
        userAddress: address
      })
      
      await writeContract({
        address: yiDengTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, parseUnits(amount, 18)],
      });

      toast.success("授权交易已提交");
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

    // 检查合约是否有足够的ETH
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

      // 更详细的错误处理
      let errorMessage = "出售失败";
      if (err.message?.includes("InsufficientETHBalance")) {
        errorMessage = "合约中ETH库存不足";
      } else if (err.message?.includes("InsufficientUserTokenBalance")) {
        errorMessage = "您的代币余额不足";
      } else if (err.message?.includes("ExcessiveSlippage")) {
        errorMessage = "滑点过大，请增加滑点容差或稍后重试";
      } else if (err.message?.includes("ERC20: insufficient allowance")) {
        errorMessage = "代币授权不足，请先授权";
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

  // 检查是否需要授权
  const needsApproval = (tokenAmount: string): boolean => {
    if (!allowance || !tokenAmount) return true; // 如果无法获取授权额度，默认需要授权
    try {
      const amountInWei = parseUnits(tokenAmount, 18)
      const needsAuth = BigInt(allowance.toString()) < amountInWei
      console.log(`🔐 检查授权状态:`, {
        tokenAmount,
        allowance: allowance.toString(),
        needsAuthorization: needsAuth
      })
      return needsAuth
    } catch {
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
      // ETH余额检查在组件中处理
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
      console.log(`🪙 格式化一灯币余额:`, {
        raw: userTokenBalance.toString(),
        formatted
      })
      return formatted
    } catch (error) {
      console.error('格式化余额失败:', error)
      return '0'
    }
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
    feeRates: feeRates
      ? {
          buyFee: Number(feeRates[0]) / 100, // 转换为百分比
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
