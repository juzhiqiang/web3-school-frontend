import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useYiDengToken } from '../../hooks/useYiDengToken';
import type { Course } from '../../types/course';
import { 
  formatYiDengAmount, 
  calculatePlatformFee
} from '../../config/yidengToken';
import { 
  Coins, ShoppingCart, AlertTriangle, CheckCircle, 
  Loader2, Wallet, Users, Clock, BookOpen 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CoursePurchaseProps {
  course: Course;
  onPurchaseSuccess?: () => void;
}

export const CoursePurchase: React.FC<CoursePurchaseProps> = ({ 
  course, 
  onPurchaseSuccess 
}) => {
  const { isConnected, address } = useWeb3();
  const { 
    balance: ydBalance, 
    hasEnoughBalance, 
    approveToken, 
    refetchBalance 
  } = useYiDengToken();

  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const platformFee = calculatePlatformFee(course.price);
  const hasBalance = hasEnoughBalance(course.price);

  useEffect(() => {
    checkTokenAllowance();
  }, [address, course.price]);

  const checkTokenAllowance = async () => {
    if (!address || !course.price) return;
    
    try {
      // 这里需要获取课程合约地址来检查授权额度
      // const courseContractAddress = getCourseContractAddress(chainId);
      // const currentAllowance = await checkAllowance(courseContractAddress);
      
      // 暂时模拟检查授权
      const currentAllowance = '0'; // 假设需要授权
      setAllowance(currentAllowance);
      setNeedsApproval(parseFloat(currentAllowance) < parseFloat(course.price));
    } catch (error) {
      console.error('检查授权失败:', error);
    }
  };

  const handleApproveToken = async () => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    setIsLoading(true);
    try {
      // 获取课程合约地址进行授权
      // const courseContractAddress = getCourseContractAddress(chainId);
      const courseContractAddress = '0x1234567890123456789012345678901234567890'; // 临时地址
      
      const success = await approveToken(courseContractAddress, course.price);
      if (success) {
        setNeedsApproval(false);
        setAllowance(course.price);
      }
    } catch (error) {
      console.error('授权失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCourse = async () => {
    if (!address || !isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!hasBalance) {
      toast.error(`余额不足，需要 ${formatYiDengAmount(course.price)} YD`);
      return;
    }

    setIsPurchasing(true);
    try {
      console.log('购买课程:', {
        courseId: course.id,
        price: course.price,
        buyer: address
      });

      // TODO: 集成智能合约购买逻辑
      // const courseContract = new ethers.Contract(courseContractAddress, courseABI, signer);
      // const tx = await courseContract.purchaseCourse(
      //   course.id,
      //   ethers.parseUnits(course.price, 18)
      // );
      // await tx.wait();

      // 模拟购买交易
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('课程购买成功！您现在可以开始学习了');
      
      // 刷新余额
      await refetchBalance();
      
      // 调用成功回调
      onPurchaseSuccess?.();
      
    } catch (error) {
      console.error('购买失败:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          toast.error('用户取消了交易');
        } else if (error.message.includes('insufficient funds')) {
          toast.error('余额不足');
        } else {
          toast.error(`购买失败: ${error.message}`);
        }
      } else {
        toast.error('购买失败，请重试');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-900">连接钱包购买</h3>
            <p className="text-sm text-yellow-700">请连接您的钱包以购买此课程</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">课程价格</h3>
            <p className="text-sm text-gray-600">使用一灯币购买</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {formatYiDengAmount(course.price)} YD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance & Purchase Info */}
      <div className="p-6 space-y-4">
        {/* User Balance */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Wallet className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700">您的一灯币余额</span>
          </div>
          <div className="text-right">
            {ydBalance ? (
              <span className={`font-semibold ${hasBalance ? 'text-green-600' : 'text-red-600'}`}>
                {formatYiDengAmount(ydBalance)} YD
              </span>
            ) : (
              <span className="text-gray-400">加载中...</span>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">课程价格</span>
            <span className="font-medium">{formatYiDengAmount(course.price)} YD</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>平台手续费 (2.5%)</span>
            <span>{platformFee} YD</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>创作者收益</span>
            <span>{formatYiDengAmount(parseFloat(course.price) - parseFloat(platformFee))} YD</span>
          </div>
        </div>

        {/* Warnings */}
        {!hasBalance && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-900">余额不足</p>
                <p className="text-sm text-red-700">
                  需要 {formatYiDengAmount(course.price)} YD，当前余额 {ydBalance ? formatYiDengAmount(ydBalance) : '0'} YD
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Actions */}
        <div className="space-y-3">
          {needsApproval && hasBalance && (
            <button
              onClick={handleApproveToken}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>授权中...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>授权一灯币</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handlePurchaseCourse}
            disabled={!hasBalance || needsApproval || isPurchasing || isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>购买中...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {!hasBalance 
                    ? '余额不足' 
                    : needsApproval 
                    ? '需要先授权' 
                    : '立即购买'
                  }
                </span>
              </>
            )}
          </button>
        </div>

        {/* Course Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <BookOpen className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-600">{course.lessons.length} 章节</p>
            </div>
            {course.duration && (
              <div>
                <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <p className="text-gray-600">{course.duration}</p>
              </div>
            )}
            <div>
              <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-600">{course.studentCount || 0} 学员</p>
            </div>
          </div>
        </div>

        {/* Purchase Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">购买后您将获得：</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 永久访问所有课程内容</li>
            <li>• 高清视频无限制观看</li>
            <li>• 课程资料下载权限</li>
            <li>• 学习进度跟踪</li>
            <li>• 完成证书（NFT）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchase;
