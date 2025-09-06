import { formatUnits, parseUnits } from 'viem'
import type { Address } from 'viem'

/**
 * 格式化以太坊地址，显示前6位和后4位
 */
export const formatAddress = (address: Address | string): string => {
  if (!address) return ''
  const addr = address.toString()
  if (addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * 格式化代币数量
 */
export const formatTokenAmount = (
  amount: bigint | string,
  decimals: number = 18,
  precision: number = 6
): string => {
  try {
    const formatted = formatUnits(BigInt(amount), decimals)
    const num = parseFloat(formatted)
    
    if (num === 0) return '0'
    if (num < 0.000001) return '< 0.000001'
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    })
  } catch {
    return '0'
  }
}

/**
 * 格式化ETH数量
 */
export const formatETH = (
  amount: bigint | string,
  precision: number = 6
): string => {
  return formatTokenAmount(amount, 18, precision)
}

/**
 * 解析代币数量为bigint
 */
export const parseTokenAmount = (
  amount: string,
  decimals: number = 18
): bigint => {
  try {
    if (!amount || amount === '0') return 0n
    return parseUnits(amount, decimals)
  } catch {
    return 0n
  }
}

/**
 * 格式化百分比
 */
export const formatPercentage = (
  value: number,
  precision: number = 2
): string => {
  return `${value.toFixed(precision)}%`
}

/**
 * 格式化交易哈希
 */
export const formatTransactionHash = (hash: string): string => {
  if (!hash) return ''
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

/**
 * 验证以太坊地址格式
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * 验证数量输入
 */
export const isValidAmount = (amount: string): boolean => {
  if (!amount) return false
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0 && isFinite(num)
}

/**
 * 格式化时间戳
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString()
}

/**
 * 计算价格影响
 */
export const calculatePriceImpact = (
  inputAmount: string,
  outputAmount: string,
  exchangeRate: number
): number => {
  try {
    const input = parseFloat(inputAmount)
    const output = parseFloat(outputAmount)
    const expected = input * exchangeRate
    
    if (expected === 0) return 0
    
    const impact = Math.abs((expected - output) / expected) * 100
    return Math.min(impact, 100)
  } catch {
    return 0
  }
}

/**
 * 格式化网络名称
 */
export const formatNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    1337: 'Ganache',
    137: 'Polygon',
    10: 'Optimism',
    42161: 'Arbitrum',
    8453: 'Base'
  }
  
  return networks[chainId] || `Unknown (${chainId})`
}

/**
 * 安全的数字转换
 */
export const safeParseFloat = (value: string | number): number => {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) || !isFinite(num) ? 0 : num
  } catch {
    return 0
  }
}

/**
 * 截断小数位数
 */
export const truncateDecimals = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals)
  return Math.floor(value * factor) / factor
}