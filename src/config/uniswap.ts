// Uniswap配置文件
import { Token } from '@uniswap/sdk-core'

export const UNISWAP_CONFIG = {
  // Uniswap V3 Router地址
  ROUTER_ADDRESSES: {
    // 主网
    1: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    // Sepolia测试网
    11155111: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    // Ganache本地网络 - 使用主网地址作为默认（需要fork主网或者部署本地路由器）
    1337: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  } as const,

  // Uniswap V3 Factory地址
  FACTORY_ADDRESSES: {
    1: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    11155111: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    1337: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  } as const,

  // 交易手续费等级
  FEE_TIERS: {
    LOWEST: 100,    // 0.01%
    LOW: 500,       // 0.05%
    MEDIUM: 3000,   // 0.3%
    HIGH: 10000,    // 1%
  } as const,

  // 默认滑点设置
  DEFAULT_SLIPPAGE: 0.5,  // 0.5%
  MAX_SLIPPAGE: 5,        // 5%
  MIN_SLIPPAGE: 0.1,      // 0.1%

  // 支持的网络
  SUPPORTED_CHAINS: [1, 11155111, 1337], // mainnet, sepolia, ganache
} as const

// WETH合约地址
export const WETH_ADDRESSES: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  1337: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

// USDT合约地址
export const USDT_ADDRESSES: Record<number, string> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',        // 主网USDT
  11155111: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',   // Sepolia测试网USDT
  1337: '0xdAC17F958D2ee523a2206206994597C13D831ec7',     // 本地使用主网地址
}

// 创建Token实例的辅助函数
export const createToken = (chainId: number, address: string, decimals: number, symbol: string, name?: string) => {
  return new Token(chainId, address, decimals, symbol, name)
}

// 获取WETH Token实例
export const getWETHToken = (chainId: number): Token => {
  const address = WETH_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return createToken(chainId, address, 18, 'WETH', 'Wrapped Ether')
}

// 获取USDT Token实例
export const getUSDTToken = (chainId: number): Token => {
  const address = USDT_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return createToken(chainId, address, 6, 'USDT', 'Tether USD')
}

// 获取Router地址
export const getRouterAddress = (chainId: number): string => {
  const address = UNISWAP_CONFIG.ROUTER_ADDRESSES[chainId as keyof typeof UNISWAP_CONFIG.ROUTER_ADDRESSES]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return address
}

// 获取Factory地址
export const getFactoryAddress = (chainId: number): string => {
  const address = UNISWAP_CONFIG.FACTORY_ADDRESSES[chainId as keyof typeof UNISWAP_CONFIG.FACTORY_ADDRESSES]
  if (!address) {
    throw new Error(`不支持的网络: ${chainId}`)
  }
  return address
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