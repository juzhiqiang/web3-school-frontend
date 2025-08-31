import { ethers } from 'ethers'

/**
 * Format wallet address for display
 */
export const formatAddress = (address: string, length = 4): string => {
  if (!address) return ''
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

/**
 * Format token amount for display
 */
export const formatTokenAmount = (
  amount: string | number, 
  decimals = 18, 
  displayDecimals = 4
): string => {
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals)
    const num = parseFloat(formatted)
    return num.toFixed(displayDecimals)
  } catch (error) {
    return '0'
  }
}

/**
 * Parse token amount to wei
 */
export const parseTokenAmount = (amount: string, decimals = 18): string => {
  try {
    return ethers.parseUnits(amount, decimals).toString()
  } catch (error) {
    return '0'
  }
}

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address)
  } catch (error) {
    return false
  }
}

/**
 * Generate a random IPFS hash (for demo purposes)
 */
export const generateMockIPFSHash = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'Qm'
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Convert timestamp to readable date
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculate time ago
 */
export const timeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diffInSeconds = Math.floor((now - timestamp) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return formatDate(timestamp)
  }
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | string, currency = 'USD'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Generate transaction hash (for demo purposes)
 */
export const generateMockTxHash = (): string => {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Get network name by chain ID
 */
export const getNetworkName = (chainId: number): string => {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    56: 'BSC',
    42161: 'Arbitrum One',
    10: 'Optimism'
  }
  return networks[chainId] || `Chain ${chainId}`
}

/**
 * Calculate APY
 */
export const calculateAPY = (principal: number, rate: number, time = 1): number => {
  return principal * Math.pow(1 + rate, time) - principal
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Sleep function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}