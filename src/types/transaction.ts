// 交易类型定义
export type TransactionType = 'buy_tokens' | 'sell_tokens' | 'course_purchase' | 'course_sale' | 'token_transfer'
export type TransactionStatus = 'pending' | 'success' | 'failed'
export type TransactionDirection = 'in' | 'out'

export interface Transaction {
  id: string
  hash: string
  timestamp: number
  blockNumber: number
  type: TransactionType
  status: TransactionStatus
  
  // 交易金额信息
  ethAmount?: string  // ETH数量
  tokenAmount?: string  // 代币数量
  usdValue?: string  // 美元价值（可选）
  
  // 交易方向和地址
  from: string
  to: string
  direction: TransactionDirection  // 对于当前钱包来说是收入还是支出
  
  // 交易详细信息
  description: string  // 交易描述
  fee?: string  // 手续费
  courseId?: string  // 如果是课程相关交易
  courseName?: string  // 课程名称
  
  // 网络信息
  networkName: string
  chainId: number
}

export interface TransactionSummary {
  totalTransactions: number
  totalVolumeETH: string
  totalVolumeTokens: string
  totalFees: string
  
  // 按类型分组的统计
  buyTransactions: number
  sellTransactions: number
  courseTransactions: number
  
  // 最近交易时间
  lastTransactionTime?: number
}

export interface TransactionFilter {
  type?: TransactionType[]
  status?: TransactionStatus[]
  timeRange?: {
    start: number
    end: number
  }
  minAmount?: string
  maxAmount?: string
}

// 分页参数
export interface TransactionPagination {
  page: number
  limit: number
  total: number
}