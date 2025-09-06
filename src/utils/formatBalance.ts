/**
 * 格式化余额显示的工具函数
 */

/**
 * 格式化显示余额，保留合适的小数位数
 * @param balance - 余额字符串
 * @param decimals - 小数位数，默认为4
 * @returns 格式化后的余额字符串
 */
export function formatDisplayBalance(balance: string, decimals: number = 4): string {
  if (!balance || balance === '0' || balance === '') {
    return '0';
  }

  try {
    const num = parseFloat(balance);
    
    if (isNaN(num)) {
      return '0';
    }

    // 如果数值很小，显示更多小数位
    if (num < 0.001) {
      return num.toFixed(6);
    }
    
    // 如果数值较小，显示4位小数
    if (num < 1) {
      return num.toFixed(decimals);
    }
    
    // 如果数值较大，显示2位小数
    if (num < 1000) {
      return num.toFixed(2);
    }
    
    // 对于很大的数值，使用千分位分隔符
    if (num >= 1000) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }
    
    return num.toString();
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
}

/**
 * 格式化代币余额，带单位
 * @param balance - 余额字符串
 * @param symbol - 代币符号
 * @param decimals - 小数位数
 * @returns 格式化后的余额字符串，包含单位
 */
export function formatTokenBalance(balance: string, symbol: string, decimals: number = 4): string {
  const formattedBalance = formatDisplayBalance(balance, decimals);
  return `${formattedBalance} ${symbol}`;
}

/**
 * 格式化价格显示
 * @param price - 价格字符串
 * @param currency - 货币符号，默认为 'YD'
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: string, currency: string = 'YD'): string {
  const formattedPrice = formatDisplayBalance(price, 2);
  return `${formattedPrice} ${currency}`;
}

/**
 * 格式化百分比
 * @param value - 数值
 * @param decimals - 小数位数，默认为2
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * 截断长字符串（如地址）
 * @param str - 要截断的字符串
 * @param start - 开始保留的字符数，默认为6
 * @param end - 结尾保留的字符数，默认为4
 * @returns 截断后的字符串
 */
export function truncateString(str: string, start: number = 6, end: number = 4): string {
  if (!str || str.length <= start + end) {
    return str;
  }
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

/**
 * 格式化钱包地址显示
 * @param address - 钱包地址
 * @returns 格式化后的地址字符串
 */
export function formatAddress(address: string): string {
  return truncateString(address, 6, 4);
}

/**
 * 格式化交易哈希显示
 * @param hash - 交易哈希
 * @returns 格式化后的哈希字符串
 */
export function formatTxHash(hash: string): string {
  return truncateString(hash, 8, 6);
}

/**
 * 将Wei转换为Ether格式的字符串
 * @param wei - Wei数量（字符串或数字）
 * @param decimals - 小数位数，默认为18
 * @returns Ether格式的字符串
 */
export function weiToEther(wei: string | number, decimals: number = 18): string {
  try {
    const weiNum = typeof wei === 'string' ? parseFloat(wei) : wei;
    if (isNaN(weiNum)) {
      return '0';
    }
    const ether = weiNum / Math.pow(10, decimals);
    return ether.toString();
  } catch (error) {
    console.error('Error converting wei to ether:', error);
    return '0';
  }
}

/**
 * 将Ether转换为Wei格式的字符串
 * @param ether - Ether数量（字符串或数字）
 * @param decimals - 小数位数，默认为18
 * @returns Wei格式的字符串
 */
export function etherToWei(ether: string | number, decimals: number = 18): string {
  try {
    const etherNum = typeof ether === 'string' ? parseFloat(ether) : ether;
    if (isNaN(etherNum)) {
      return '0';
    }
    const wei = etherNum * Math.pow(10, decimals);
    return Math.floor(wei).toString();
  } catch (error) {
    console.error('Error converting ether to wei:', error);
    return '0';
  }
}
