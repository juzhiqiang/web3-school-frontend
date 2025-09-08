// Uniswap V2配置文件
import { Token } from '@uniswap/sdk-core'

type SupportedChainId = 1 | 11155111 | 1337

export const UNISWAP_CONFIG = {
  // Uniswap V2 Router地址
  ROUTER_ADDRESSES: {
    // 主网
    1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    // Sepolia测试网
    11155111: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
    // Ganache本地网络 - 使用主网地址作为默认（需要fork主网或者部署本地路由器）
    1337: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
  } as const satisfies Record<SupportedChainId, string>,

  // Uniswap V2 Factory地址
  FACTORY_ADDRESSES: {
    1: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    11155111: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
    1337: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
  } as const satisfies Record<SupportedChainId, string>,

  // Uniswap V2 固定手续费
  FEE_RATE: 3000,   // 0.3% (V2中固定为0.3%)

  // 默认滑点设置
  DEFAULT_SLIPPAGE: 0.5,  // 0.5%
  MAX_SLIPPAGE: 5,        // 5%
  MIN_SLIPPAGE: 0.1,      // 0.1%

  // 支持的网络
  SUPPORTED_CHAINS: [1, 11155111, 1337] as const, // mainnet, sepolia, ganache
} as const

// WETH合约地址
export const WETH_ADDRESSES: Record<SupportedChainId, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  1337: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
}

// USDT合约地址
export const USDT_ADDRESSES: Record<SupportedChainId, string> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',        // 主网USDT
  11155111: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',   // Sepolia测试网USDT
  1337: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',     // 本地使用主网地址
}

// 创建Token实例的辅助函数
export const createToken = (chainId: number, address: string, decimals: number, symbol: string, name?: string): Token => {
  return new Token(chainId, address, decimals, symbol, name)
}

// 获取WETH Token实例
export const getWETHToken = (chainId: number): Token => {
  const address = WETH_ADDRESSES[chainId as SupportedChainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return createToken(chainId, address, 18, 'WETH', 'Wrapped Ether')
}

// 获取USDT Token实例
export const getUSDTToken = (chainId: number): Token => {
  const address = USDT_ADDRESSES[chainId as SupportedChainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return createToken(chainId, address, 6, 'USDT', 'Tether USD')
}

// 获取Router地址
export const getRouterAddress = (chainId: number): string => {
  const address = UNISWAP_CONFIG.ROUTER_ADDRESSES[chainId as SupportedChainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return address
}

// 获取Factory地址
export const getFactoryAddress = (chainId: number): string => {
  const address = UNISWAP_CONFIG.FACTORY_ADDRESSES[chainId as SupportedChainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return address
}

// 检查网络是否支持
export const isSupportedChain = (chainId: number): chainId is SupportedChainId => {
  return UNISWAP_CONFIG.SUPPORTED_CHAINS.includes(chainId as SupportedChainId)
}

// 错误消息
export const UNISWAP_ERROR_MESSAGES = {
  INSUFFICIENT_LIQUIDITY: '流动性不足',
  PRICE_IMPACT_TOO_HIGH: '价格影响过高',
  SLIPPAGE_EXCEEDED: '超出滑点容忍度',
  TRANSACTION_FAILED: '交易失败',
  APPROVAL_REQUIRED: '需要先授权代币',
  NETWORK_NOT_SUPPORTED: '不支持的网络',
  ROUTE_NOT_FOUND: '无法找到交易路径',
  INSUFFICIENT_BALANCE: '余额不足',
} as const