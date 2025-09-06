// YiDeng Token Swap 合约配置
export const TOKEN_SWAP_CONFIG = {
  // 不同网络的合约地址
  CONTRACT_ADDRESSES: {
    // 主网
    1: "0x7Fda3F9367630aDe390135fDA8B87E63592fBcAF",
    // Sepolia测试网
    11155111: "0x7Fda3F9367630aDe390135fDA8B87E63592fBcAF",
    // Ganache本地网络
    1337: "0x7Fda3F9367630aDe390135fDA8B87E63592fBcAF",
  } as const,

  // 代币配置
  TOKEN_DECIMALS: 18,
  TOKEN_SYMBOL: "YD",
  TOKEN_NAME: "一灯币",

  // 默认滑点设置
  DEFAULT_SLIPPAGE: 1, // 1%
  MAX_SLIPPAGE: 5, // 5%
  MIN_SLIPPAGE: 0.1, // 0.1%

  // 手续费相关
  BASIS_POINTS: 10000,

  // 支持的网络（移除Hardhat）
  SUPPORTED_CHAINS: [1, 11155111, 1337], // mainnet, sepolia, ganache

  // 本地网络配置
  LOCAL_NETWORKS: {
    GANACHE: {
      chainId: 1337,
      name: "Ganache",
      rpcUrl: "http://127.0.0.1:7545",
      blockExplorer: "http://localhost:7545",
    },
  },
} as const;

// 合约事件主题
export const CONTRACT_EVENTS = {
  TOKENS_PURCHASED: "TokensPurchased",
  TOKENS_SOLD: "TokensSold",
  RATE_UPDATED: "RateUpdated",
  FEE_RATE_UPDATED: "FeeRateUpdated",
} as const;

// 错误消息映射
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: "余额不足",
  INVALID_AMOUNT: "请输入有效金额",
  TRANSACTION_FAILED: "交易失败",
  APPROVAL_REQUIRED: "需要先授权代币",
  WALLET_NOT_CONNECTED: "请先连接钱包",
  NETWORK_NOT_SUPPORTED: "不支持的网络",
  EXCESSIVE_SLIPPAGE: "滑点过大",
  CONTRACT_NOT_DEPLOYED: "合约未部署在当前网络",
  INSUFFICIENT_CONTRACT_TOKENS: "合约中代币库存不足",
  INSUFFICIENT_CONTRACT_ETH: "合约中ETH库存不足",
} as const;

// 获取当前网络的合约地址
export const getContractAddress = (chainId: number): string => {
  // 处理Ganache本地网络的特殊情况
  if (chainId === 1337) {
    const localAddress = import.meta.env.VITE_LOCAL_CONTRACT_ADDRESS;
    if (localAddress) {
      return localAddress;
    }
  }

  const address =
    TOKEN_SWAP_CONFIG.CONTRACT_ADDRESSES[
      chainId as keyof typeof TOKEN_SWAP_CONFIG.CONTRACT_ADDRESSES
    ];

  if (!address) {
    console.error(`不支持的网络: ${chainId}`);
    throw new Error(`不支持的网络: ${chainId}`);
  }

  console.log(`网络 ${chainId} 合约地址: ${address}`);
  return address;
};

// 检查是否为本地网络
export const isLocalNetwork = (chainId: number): boolean => {
  return chainId === 1337; // 仅Ganache本地网络
};

// 获取网络显示名称
export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "Ethereum 主网";
    case 11155111:
      return "Sepolia 测试网";
    case 1337:
      return "Ganache 本地网络";
    default:
      return `网络 ${chainId}`;
  }
};

// 调试工具函数
export const debugContractInfo = (chainId: number) => {
  console.group(`🔍 合约调试信息 - 网络 ${chainId}`);
  console.log("网络名称:", getNetworkName(chainId));
  console.log("是否本地网络:", isLocalNetwork(chainId));

  try {
    const contractAddress = getContractAddress(chainId);
    console.log("合约地址:", contractAddress);
    console.log("✅ 合约配置正常");
  } catch (error) {
    console.error("❌ 合约配置错误:", error);
  }

  // 显示环境变量（仅本地网络）
  if (isLocalNetwork(chainId)) {
    console.log(
      "本地合约地址环境变量:",
      import.meta.env.VITE_LOCAL_CONTRACT_ADDRESS
    );
    console.log("启用本地网络:", import.meta.env.VITE_ENABLE_LOCALHOST);
  }

  console.groupEnd();
};
