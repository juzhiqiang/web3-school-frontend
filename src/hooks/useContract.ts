import { usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";

// 由于旧的CONTRACTS和ABIS配置不存在，我们创建简化版本
const SIMPLE_ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
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
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const useERC20Contract = (tokenAddress: string) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!publicClient) return null;

  return getContract({
    address: tokenAddress as `0x${string}`,
    abi: SIMPLE_ERC20_ABI,
    client: walletClient || publicClient,
  });
};

// 简化的token balance hook
export const useTokenBalance = (tokenAddress: string, userAddress?: string) => {
  const contract = useERC20Contract(tokenAddress);

  const getBalance = async () => {
    if (!userAddress || !contract) return "0";
    try {
      const balance = await contract.read.balanceOf([userAddress as `0x${string}`]);
      const decimals = await contract.read.decimals();
      return (Number(balance) / Math.pow(10, decimals)).toString();
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  };

  return { getBalance };
};

export const useTokenApproval = (
  tokenAddress: string,
  spenderAddress: string
) => {
  const contract = useERC20Contract(tokenAddress);

  const approve = async (amount: string) => {
    if (!contract) throw new Error("Contract not initialized");
    try {
      const decimals = await contract.read.decimals();
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
      const hash = await contract.write?.approve([spenderAddress as `0x${string}`, amountInWei]);
      return hash;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  };

  const getAllowance = async (ownerAddress: string) => {
    if (!contract) return "0";
    try {
      const allowance = await contract.read.allowance([
        ownerAddress as `0x${string}`, 
        spenderAddress as `0x${string}`
      ]);
      const decimals = await contract.read.decimals();
      return (Number(allowance) / Math.pow(10, decimals)).toString();
    } catch (error) {
      console.error("Error getting allowance:", error);
      return "0";
    }
  };

  return { approve, getAllowance };
};