import type { Address } from 'viem'

// 合约地址映射
export const CONTRACT_ADDRESSES = {
  YIDENG_TOKEN: {
    MAINNET: import.meta.env.VITE_YIDENG_TOKEN_ADDRESS_MAINNET as Address,
    SEPOLIA: import.meta.env.VITE_YIDENG_TOKEN_ADDRESS_SEPOLIA as Address,
    LOCAL: import.meta.env.VITE_YIDENG_TOKEN_ADDRESS_LOCAL as Address,
  },
  COURSE_CONTRACT: {
    MAINNET: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_MAINNET as Address,
    SEPOLIA: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA as Address,
    LOCAL: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_LOCAL as Address,
  },
} as const

// 网络链ID
export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  GANACHE: 1337,
  POLYGON: 137,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  BASE: 8453,
} as const

// 代币精度
export const TOKEN_DECIMALS = {
  ETH: 18,
  YIDENG: 18,
  USDT: 6,
  USDC: 6,
} as const

// 默认配置
export const DEFAULT_CONFIG = {
  SLIPPAGE: 0.5, // 0.5%
  MAX_SLIPPAGE: 5.0, // 5%
  MIN_SLIPPAGE: 0.1, // 0.1%
  GAS_LIMIT_MULTIPLIER: 1.2, // 20% gas limit buffer
  POLLING_INTERVAL: 5000, // 5 seconds
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
} as const

// 错误代码
export const ERROR_CODES = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  INSUFFICIENT_FUNDS: -32000,
  EXECUTION_REVERTED: -32603,
} as const

// 交易类型
export const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  TRANSFER: 'transfer',
  SWAP: 'swap',
  BUY_COURSE: 'buy_course',
  CREATE_COURSE: 'create_course',
  CLAIM_REWARD: 'claim_reward',
  MINT: 'mint',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
} as const

// 状态常量
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const

// 本地存储键
export const STORAGE_KEYS = {
  RECENT_TRANSACTIONS: 'web3_school_recent_transactions',
  USER_PREFERENCES: 'web3_school_user_preferences',
  COURSE_PROGRESS: 'web3_school_course_progress',
  WALLET_CONNECTION: 'web3_school_wallet_connection',
} as const

// API 端点
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.web3school.com',
  COURSES: '/api/courses',
  TRANSACTIONS: '/api/transactions',
  REWARDS: '/api/rewards',
  USERS: '/api/users',
} as const

// IPFS 配置
export const IPFS_CONFIG = {
  GATEWAY: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  PINATA_API: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
} as const

// 功能开关
export const FEATURE_FLAGS = {
  COURSE_CREATION: import.meta.env.VITE_ENABLE_COURSE_CREATION === 'true',
  TOKEN_PAYMENTS: import.meta.env.VITE_ENABLE_TOKEN_PAYMENTS === 'true',
  NFT_CERTIFICATES: import.meta.env.VITE_ENABLE_NFT_CERTIFICATES === 'true',
} as const

// 正则表达式
export const REGEX = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
  NUMBER_INPUT: /^\d*\.?\d*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// 消息模板
export const MESSAGES = {
  TRANSACTION_SUBMITTED: '交易已提交，等待确认...',
  TRANSACTION_CONFIRMED: '交易已确认！',
  TRANSACTION_FAILED: '交易失败，请重试',
  APPROVAL_REQUIRED: '需要先授权代币使用',
  INSUFFICIENT_BALANCE: '余额不足',
  NETWORK_SWITCH_REQUIRED: '请切换到正确的网络',
  WALLET_NOT_CONNECTED: '请先连接钱包',
  COURSE_PURCHASED: '课程购买成功！',
  COURSE_CREATED: '课程创建成功！',
  REWARD_CLAIMED: '奖励领取成功！',
} as const