// YiDeng Token Swap 合约配置
export const TOKEN_SWAP_CONFIG = {
  // 合约地址
  CONTRACT_ADDRESS: '0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0' as const,
  
  // 代币配置
  TOKEN_DECIMALS: 18,
  TOKEN_SYMBOL: 'YD',
  TOKEN_NAME: '一灯币',
  
  // 默认滑点设置
  DEFAULT_SLIPPAGE: 1, // 1%
  MAX_SLIPPAGE: 5,     // 5%
  MIN_SLIPPAGE: 0.1,   // 0.1%
  
  // 手续费相关
  BASIS_POINTS: 10000,
  
  // 支持的网络
  SUPPORTED_CHAINS: [1, 11155111], // mainnet, sepolia
} as const

// 合约事件主题
export const CONTRACT_EVENTS = {
  TOKENS_PURCHASED: 'TokensPurchased',
  TOKENS_SOLD: 'TokensSold',
  RATE_UPDATED: 'RateUpdated',
  FEE_RATE_UPDATED: 'FeeRateUpdated',
} as const

// 错误消息映射
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: '余额不足',
  INVALID_AMOUNT: '请输入有效金额',
  TRANSACTION_FAILED: '交易失败',
  APPROVAL_REQUIRED: '需要先授权代币',
  WALLET_NOT_CONNECTED: '请先连接钱包',
  NETWORK_NOT_SUPPORTED: '不支持的网络',
  EXCESSIVE_SLIPPAGE: '滑点过大',
} as const
