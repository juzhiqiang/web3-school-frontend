import { useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Coins
} from 'lucide-react'
import type { Transaction, TransactionFilter, TransactionType } from '../../types/transaction'
import { useTransactionHistory } from '../../hooks/useTransactionHistory'

interface TransactionRowProps {
  transaction: Transaction
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: TransactionType, direction: Transaction['direction']) => {
    if (type === 'buy_tokens') {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    }
    if (type === 'sell_tokens') {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    return direction === 'in' 
      ? <ArrowDownLeft className="h-4 w-4 text-green-500" />
      : <ArrowUpRight className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'success': return '成功'
      case 'pending': return '处理中'
      case 'failed': return '失败'
      default: return '未知'
    }
  }

  const getTypeText = (type: TransactionType) => {
    switch (type) {
      case 'buy_tokens': return '购买一灯币'
      case 'sell_tokens': return '出售一灯币'
      case 'course_purchase': return '购买课程'
      case 'course_sale': return '课程销售'
      case 'token_transfer': return '代币转账'
      default: return '其他交易'
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          {getTransactionIcon(transaction.type, transaction.direction)}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getTypeText(transaction.type)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(transaction.timestamp)}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          {transaction.ethAmount && (
            <div className={`font-medium ${transaction.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.direction === 'in' ? '+' : '-'}{parseFloat(transaction.ethAmount).toFixed(4)} ETH
            </div>
          )}
          {transaction.tokenAmount && (
            <div className={`text-xs ${transaction.direction === 'out' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.direction === 'out' ? '+' : '-'}{parseFloat(transaction.tokenAmount).toFixed(2)} YD
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
          {getStatusText(transaction.status)}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.fee && `${parseFloat(transaction.fee).toFixed(6)} YD`}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.networkName}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <a
          href={`https://etherscan.io/tx/${transaction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center justify-end space-x-1"
        >
          <ExternalLink className="h-3 w-3" />
          <span>查看</span>
        </a>
      </td>
    </tr>
  )
}

interface TransactionHistoryProps {
  className?: string
}

export default function TransactionHistory({ className = '' }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<TransactionFilter>({})
  const [showFilter, setShowFilter] = useState(false)
  
  const { 
    transactions, 
    summary, 
    isLoading, 
    error, 
    pagination,
    nextPage,
    prevPage,
    refresh 
  } = useTransactionHistory(filter)

  const handleRefresh = () => {
    refresh()
  }

  const resetFilter = () => {
    setFilter({})
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">获取交易历史失败</div>
          <div className="text-gray-500 text-sm mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* 标题和操作栏 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">交易历史</h2>
            <p className="text-sm text-gray-500 mt-1">
              共 {summary.totalTransactions} 笔交易，总交易量 {summary.totalVolumeETH} ETH
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="过滤器"
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
              title="刷新"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.buyTransactions}</div>
            <div className="text-xs text-gray-500">购买交易</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.sellTransactions}</div>
            <div className="text-xs text-gray-500">出售交易</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalVolumeTokens}</div>
            <div className="text-xs text-gray-500">代币交易量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.totalFees}</div>
            <div className="text-xs text-gray-500">总手续费 (YD)</div>
          </div>
        </div>
      </div>

      {/* 过滤器 */}
      {showFilter && (
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <select 
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              value={filter.type?.[0] || ''}
              onChange={(e) => setFilter(prev => ({
                ...prev,
                type: e.target.value ? [e.target.value as TransactionType] : undefined
              }))}
            >
              <option value="">所有类型</option>
              <option value="buy_tokens">购买一灯币</option>
              <option value="sell_tokens">出售一灯币</option>
            </select>
            
            <button
              onClick={resetFilter}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              重置过滤器
            </button>
          </div>
        </div>
      )}

      {/* 交易表格 */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-500">正在加载交易历史...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无交易记录</p>
            <p className="text-gray-400 text-sm mt-2">
              完成第一笔代币兑换后，交易记录将显示在这里
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交易类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手续费
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  网络
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  详情
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {transactions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={prevPage}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={nextPage}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> 条，
                共 <span className="font-medium">{pagination.total}</span> 条记录
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={prevPage}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {pagination.page}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}