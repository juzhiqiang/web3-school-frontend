import type { Address } from 'viem'
import type { ethers } from 'ethers'

// 网络配置类型
export interface NetworkConfig {
  name: string
  rpcUrl: string
  explorerUrl: string
  isLocal: boolean
}

// 代币信息类型
export interface TokenInfo {
  address: Address
  name: string
  symbol: string
  decimals: number
  chainId: number
}

// 交易状态类型
export type TransactionStatus = 'idle' | 'pending' | 'confirmed' | 'failed'

// 兑换类型
export type SwapType = 'yideng' | 'uniswap'
export type SwapMode = 'buy' | 'sell'
export type UniswapMode = 'eth-to-usdt' | 'usdt-to-eth'

// 按钮配置类型
export interface ButtonConfig {
  text: string
  disabled: boolean
  className: string
  action?: () => void | Promise<void>
}

// 费率信息类型
export interface FeeRates {
  buyFee: number
  sellFee: number
}

// 余额信息类型
export interface BalanceInfo {
  eth: string
  token: string
  usdt: string
}

// 合约状态类型
export interface ContractStatus {
  isAvailable: boolean
  address?: Address
  ethBalance: string
  tokenBalance: string
}

// 兑换参数类型
export interface SwapParams {
  amount: string
  slippage: number
  mode: SwapMode | UniswapMode
  type: SwapType
}

// 授权状态类型
export interface ApprovalStatus {
  isApproved: boolean
  allowance: bigint
  spender: Address
}

// 交易信息类型
export interface TransactionInfo {
  hash?: string
  status: TransactionStatus
  timestamp?: number
  type: string
  amount?: string
  token?: string
}

// 错误类型
export interface Web3Error {
  code: number
  message: string
  details?: string
}

// 兑换结果类型
export interface SwapResult {
  success: boolean
  hash?: string
  error?: Web3Error
  outputAmount?: string
}

// Hook 返回值类型 - 添加 provider 和 signer
export interface UseWeb3Return {
  isConnected: boolean
  address?: Address
  balance?: string
  chainId?: number
  isLoading: boolean
  error?: Web3Error
  refetchBalance: () => Promise<void>
  // 新增的 provider 和 signer
  provider?: ethers.BrowserProvider
  signer?: ethers.JsonRpcSigner
}

export interface UseTokenSwapReturn {
  contractAddress?: Address
  networkName: string
  isLocalNetwork: boolean
  isContractAvailable: boolean
  exchangeRate: number
  feeRates: FeeRates
  contractTokenBalance: string
  contractETHBalance: string
  userTokenBalance: string
  calculateTokensForETH: (ethAmount: string) => string
  calculateETHForTokens: (tokenAmount: string) => string
  buyTokens: (ethAmount: string, slippage: number) => Promise<SwapResult>
  sellTokens: (tokenAmount: string, slippage: number) => Promise<SwapResult>
  approveTokens: (amount: string) => Promise<SwapResult>
  needsApproval: (amount: string) => boolean
  hasEnoughBalance: (amount: string, type: 'eth' | 'token') => boolean
  isLoading: boolean
  isConfirmed: boolean
  transactionHash?: string
  refetchAll: () => Promise<void>
  allowance: string
  mintAndDepositTestTokens: (amount: string) => Promise<SwapResult>
  depositETHToContract: (amount: string) => Promise<SwapResult>
}