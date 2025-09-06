import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Gift, CheckCircle, Trophy, BookOpen, Star, ShoppingCart, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnChainRewards } from '../../hooks/useOnChainRewards';

const RewardHistory: React.FC = () => {
  const { address } = useAccount();
  const { rewards, stats, loading, error, refreshRewards } = useOnChainRewards();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 计算分页数据
  const { paginatedRewards, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedRewards: rewards.slice(startIndex, endIndex),
      totalPages: Math.ceil(rewards.length / itemsPerPage)
    };
  }, [rewards, currentPage, itemsPerPage]);

  // 重置到第一页（当数据刷新时）
  const handleRefreshRewards = () => {
    setCurrentPage(1);
    refreshRewards();
  };

  if (!address) {
    return null;
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'create_course':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'complete_course':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'first_purchase':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />;
      case 'review_course':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Gift className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'create_course':
        return '创建课程';
      case 'complete_course':
        return '完成课程';
      case 'first_purchase':
        return '首次购买';
      case 'review_course':
        return '评价课程';
      default:
        return '未知奖励';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Gift className="h-6 w-6 text-orange-500" />
          <span>链上奖励记录</span>
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">总奖励数量</p>
            <p className="text-2xl font-bold text-orange-600">{stats.totalRewards}</p>
          </div>
          <button
            onClick={handleRefreshRewards}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <span className="font-medium">加载失败:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 奖励统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
          <p className="text-lg font-bold text-orange-600">{formatAmount(stats.totalAmount)}</p>
          <p className="text-sm text-orange-700">累计奖励 (YD)</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <p className="text-lg font-bold text-blue-600">{stats.createCourseRewards}</p>
          <p className="text-sm text-blue-700">创建课程</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
          <p className="text-lg font-bold text-green-600">{stats.completeCourseRewards}</p>
          <p className="text-sm text-green-700">完成课程</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
          <p className="text-lg font-bold text-purple-600">{formatAmount(stats.createCourseAmount)}</p>
          <p className="text-sm text-purple-700">创建奖励 (YD)</p>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">正在加载链上数据...</span>
        </div>
      )}

      {/* 奖励列表 */}
      {!loading && (
        <div className="space-y-3">
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>暂无链上奖励记录</p>
              <p className="text-sm">创建课程、完成学习等活动将获得一灯币奖励</p>
            </div>
          ) : (
            <>
              {paginatedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getRewardIcon(reward.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{reward.description}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{getRewardTypeLabel(reward.type)}</span>
                        <span>{formatDate(reward.timestamp)}</span>
                        <a
                          href={`https://etherscan.io/tx/${reward.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          交易哈希: {reward.transactionHash.slice(0, 10)}...
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-orange-600">+{formatAmount(reward.amount)}</p>
                      <p className="text-sm text-gray-600">一灯币</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">已发放</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    共 {rewards.length} 条记录，第 {currentPage} / {totalPages} 页
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      上一页
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 数据说明 */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>数据来源于区块链，实时同步智能合约奖励发放记录</p>
      </div>
    </div>
  );
};

export default RewardHistory;