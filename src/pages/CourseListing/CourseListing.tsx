import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Star, BookOpen, Coins, Shield, CreditCard, CheckCircle, Lock } from 'lucide-react'
import { getAllCourses, hasPurchased } from '../../utils/courseStorage'
import { initializeSampleCourses } from '../../utils/courseDataInit'
import { useWeb3 } from '../../contexts/Web3Context'
import { useCoursePurchase } from '../../hooks/useCoursePurchase'
import type { Course } from '../../types/courseTypes'
import toast from 'react-hot-toast'

function CourseListing() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [purchasingCourse, setPurchasingCourse] = useState<string | null>(null)
  const [approvingCourse, setApprovingCourse] = useState<string | null>(null)
  const { isConnected, address, ydBalance, addTokenToWallet } = useWeb3()
  const { 
    isPurchasing, 
    isApproving, 
    purchaseCourse, 
    checkAllowance, 
    needsApproval,
    approveCourse
  } = useCoursePurchase()

  // 监听购买状态变化，清理本地状态
  useEffect(() => {
    // 如果不再是购买中状态，清理本地购买状态
    if (!isPurchasing && purchasingCourse) {
      const timer = setTimeout(() => {
        setPurchasingCourse(null)
      }, 2000) // 给一点时间让用户看到状态变化
      
      return () => clearTimeout(timer)
    }
  }, [isPurchasing, purchasingCourse])

  // 从本地缓存加载课程数据
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true)
      try {
        // 初始化示例课程数据（如果本地没有数据的话）
        initializeSampleCourses()
        
        // 获取本地存储的所有课程
        const cachedCourses = getAllCourses()
        setCourses(cachedCourses)
        
        console.log(`加载了 ${cachedCourses.length} 门课程`)
      } catch (error) {
        console.error('加载课程数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  // 检查特定课程的授权状态
  useEffect(() => {
    const checkCourseAllowances = async () => {
      if (!isConnected || !address || courses.length === 0) return
      
      for (const course of courses) {
        await checkAllowance(course.price)
      }
    }
    
    checkCourseAllowances()
  }, [courses, isConnected, address, checkAllowance])

  // 检查用户是否已购买课程
  const hasUserPurchased = (courseId: string) => {
    if (!address) return false
    return hasPurchased(courseId, address)
  }

  // 检查用户是否为课程创建者
  const isUserCreator = (course: Course) => {
    if (!address) return false
    return course.instructorAddress?.toLowerCase() === address.toLowerCase()
  }

  // 检查用户是否可以访问课程（已购买或是创建者）
  const canUserAccessCourse = (course: Course) => {
    return hasUserPurchased(course.id) || isUserCreator(course)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '初级': return 'bg-green-100 text-green-800'
      case '中级': return 'bg-yellow-100 text-yellow-800'
      case '高级': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: string) => {
    const priceNum = parseFloat(price)
    if (isNaN(priceNum)) return '0'
    return priceNum.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const canAfford = (price: string) => {
    if (!ydBalance) return false
    const ydBalanceNum = parseFloat(ydBalance)
    const priceNum = parseFloat(price)
    return ydBalanceNum >= priceNum
  }

  const handleCourseAction = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('请先连接钱包')
      return
    }

    // 如果用户可以访问课程（已购买或是创建者），直接跳转到详情页
    if (canUserAccessCourse(course)) {
      if (isUserCreator(course)) {
        toast.success('进入您创建的课程')
      }
      window.location.href = `/course/${course.id}`
      return
    }

    // 检查余额
    if (!canAfford(course.price)) {
      toast.error(`余额不足，需要 ${formatPrice(course.price)} YD，当前余额 ${formatPrice(ydBalance || '0')} YD`)
      return
    }

    // 如果需要授权，提示用户先点击授权按钮
    if (needsApproval) {
      toast.error('请先点击授权按钮授权一灯币')
      return
    }

    // 开始购买流程（已授权）
    setPurchasingCourse(course.id)
    
    try {
      const success = await purchaseCourse(course.id, course.price)
      if (success) {
        // 交易已提交，但不要立即跳转
        // 等待 useTransactionPurchase 中的成功监听器触发
        toast.success('交易已提交，等待区块链确认...', { 
          id: 'purchase-pending' 
        })
      }
    } catch (error) {
      console.error('购买失败:', error)
      setPurchasingCourse(null)
    }
    // 注意：不在这里设置 setPurchasingCourse(null)，让它在交易确认后再清理
  }

  const getButtonText = (course: Course) => {
    const isPurchased = hasUserPurchased(course.id)
    const isCreator = isUserCreator(course)
    const isCurrentlyPurchasing = purchasingCourse === course.id

    if (!isConnected) return '请先连接钱包'
    if (isCreator) return '进入管理'
    if (isPurchased) return '进入学习'
    if (isCurrentlyPurchasing) {
      if (isApproving) return '授权中...'
      if (isPurchasing) return '购买中...'
    }
    if (!canAfford(course.price)) return '余额不足'
    
    // 如果需要授权，显示"请先授权"
    if (needsApproval) return '请先授权'
    
    // 已授权，可以直接购买
    return '立即购买'
  }

  const getButtonStyle = (course: Course) => {
    const isPurchased = hasUserPurchased(course.id)
    const isCreator = isUserCreator(course)
    const isCurrentlyPurchasing = purchasingCourse === course.id
    const canAccess = isPurchased || isCreator
    const isDisabled = !isConnected || (!canAccess && !canAfford(course.price)) || isCurrentlyPurchasing

    if (isCreator) {
      return 'bg-purple-600 text-white hover:bg-purple-700'
    }
    
    if (isPurchased) {
      return 'bg-green-600 text-white hover:bg-green-700'
    }
    
    if (isDisabled) {
      return 'bg-gray-400 text-white cursor-not-allowed'
    }
    
    return 'bg-blue-600 text-white hover:bg-blue-700'
  }

  const handleAddToWallet = async () => {
    const success = await addTokenToWallet()
    if (success) {
      toast.success('一灯币已添加到钱包！')
    } else {
      toast.error('添加代币到钱包失败')
    }
  }

  // 处理单独的授权操作
  const handleApprove = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isConnected) {
      toast.error('请先连接钱包')
      return
    }

    setApprovingCourse(course.id)
    
    try {
      const success = await approveCourse(course.price)
      if (success) {
        // 重新检查授权状态
        await checkAllowance(course.price)
      }
    } catch (error) {
      console.error('授权失败:', error)
    } finally {
      setApprovingCourse(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载课程中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Web3课程市场
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          发现优质的Web3课程，用一灯币购买，掌握区块链技术，开启去中心化世界的学习之旅
        </p>
        
        {/* 显示用户的一灯币余额 */}
        {ydBalance && (
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                余额: {formatPrice(ydBalance)} YD
              </span>
            </div>
            <button
              onClick={handleAddToWallet}
              className="inline-flex items-center space-x-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium transition-colors"
              title="添加一灯币到钱包"
            >
              <span>添加到钱包</span>
            </button>
          </div>
        )}
      </div>

      {/* 课程统计 */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{courses.length}</div>
            <div className="text-blue-100">门课程</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">
              {courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
            </div>
            <div className="text-green-100">名学员</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">
              {address ? courses.filter(course => isUserCreator(course)).length : 0}
            </div>
            <div className="text-purple-100">我创建的</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">
              {address ? courses.filter(course => hasUserPurchased(course.id)).length : 0}
            </div>
            <div className="text-orange-100">已购买</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const isPurchased = hasUserPurchased(course.id)
          const isCreator = isUserCreator(course)
          const isCurrentlyPurchasing = purchasingCourse === course.id
          
          return (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={course.thumbnailHash || `https://via.placeholder.com/400x200?text=${encodeURIComponent(course.title)}`} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.difficulty || course.level || '初级')}`}>
                    {course.difficulty || course.level || '初级'}
                  </span>
                </div>
                
                {/* 课程状态标识 */}
                {isCreator ? (
                  <div className="absolute top-4 left-4 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>我的课程</span>
                  </div>
                ) : isPurchased ? (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>已购买</span>
                  </div>
                ) : (
                  <>
                    {/* 余额不足提示 */}
                    {ydBalance && !canAfford(course.price) && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        余额不足
                      </div>
                    )}
                    
                    {/* 需要购买标识 */}
                    {canAfford(course.price) && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>需要购买</span>
                      </div>
                    )}
                  </>
                )}

                {/* 免费预览课程标识 */}
                {course.lessons && course.lessons.some(lesson => lesson.isPreview) && (
                  <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    含免费预览
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    讲师: {course.instructorName || '匿名讲师'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {course.rating || '5.0'}
                    </span>
                    {course.reviews && (
                      <span className="text-xs text-gray-400">({course.reviews})</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 课程标签 */}
                {course.tags && course.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{course.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* 价格显示 */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)} YD
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮区域 */}
                  <div className="space-y-2">
                    {/* 如果需要授权且余额足够，显示授权按钮 */}
                    {!isCreator && !isPurchased && canAfford(course.price) && needsApproval && (
                      <button
                        onClick={(e) => handleApprove(course, e)}
                        disabled={approvingCourse === course.id}
                        className="w-full py-2 px-4 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        {approvingCourse === course.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>授权中...</span>
                          </div>
                        ) : (
                          `授权 ${formatPrice(course.price)} YD`
                        )}
                      </button>
                    )}

                    {/* 主操作按钮 */}
                    <button
                      onClick={(e) => handleCourseAction(course, e)}
                      disabled={
                        !isConnected || 
                        (!canUserAccessCourse(course) && !canAfford(course.price)) || 
                        isCurrentlyPurchasing ||
                        (!canUserAccessCourse(course) && canAfford(course.price) && needsApproval)
                      }
                      className={`w-full py-3 px-4 rounded-md transition-colors font-medium ${getButtonStyle(course)}`}
                    >
                      {isCurrentlyPurchasing && (isApproving || isPurchasing) ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{getButtonText(course)}</span>
                        </div>
                      ) : (
                        getButtonText(course)
                      )}
                    </button>
                  </div>

                  {/* 余额不足时的额外提示 */}
                  {ydBalance && !canAfford(course.price) && !canUserAccessCourse(course) && (
                    <div className="text-center">
                      <p className="text-xs text-red-600">
                        还需要 {formatPrice((parseFloat(course.price) - parseFloat(ydBalance)).toString())} YD
                      </p>
                    </div>
                  )}

                  {/* 授权提示 */}
                  {!canUserAccessCourse(course) && canAfford(course.price) && needsApproval && (
                    <div className="text-center">
                      <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        💡 需要先授权一灯币给课程合约才能购买
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 空状态提示 */}
      {courses.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">暂无课程</h3>
          <p className="text-gray-500 mb-4">目前还没有发布的课程，请稍后再来查看。</p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>💡 您可以创建自己的课程与大家分享知识</p>
            <p>🔗 课程数据存储在浏览器本地缓存中</p>
          </div>
        </div>
      )}
      
      {/* 如果没有连接钱包的提示 */}
      {!ydBalance && (
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                连接钱包开始购买课程
              </p>
            </div>
            <p className="text-yellow-700 text-sm">
              连接钱包后可以查看余额并购买课程
            </p>
          </div>
        </div>
      )}

      {/* 购买说明 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-6 text-center">一灯币课程购买流程</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">1. 授权代币</h4>
            <p className="text-sm text-gray-600">
              首次购买需要授权一灯币给课程合约，这是安全的标准流程
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">2. 确认购买</h4>
            <p className="text-sm text-gray-600">
              授权完成后，点击购买使用一灯币支付课程费用
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">3. 开始学习</h4>
            <p className="text-sm text-gray-600">
              购买成功后即可进入课程详情页面开始学习
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>购买后才能进入课程详情页面</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseListing
