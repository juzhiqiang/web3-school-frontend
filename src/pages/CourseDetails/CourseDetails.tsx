import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useCoursePurchase } from '../../hooks/useCoursePurchase'
import { getCourse, hasPurchased } from '../../utils/courseStorage'
import { formatYiDengAmount } from '../../config/yidengToken'
import { PurchaseStepIndicator } from '../../components/PurchaseStepIndicator/PurchaseStepIndicator'
import toast from 'react-hot-toast'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  ChevronRight, 
  CheckCircle, 
  Lock,
  ArrowLeft,
  Share2,
  Heart,
  Coins,
  Shield,
  AlertTriangle
} from 'lucide-react'
import type { Course } from '../../types/courseTypes'

interface CourseDetailsProps {
  preview?: boolean
  learn?: boolean
  details?: boolean
}

function CourseDetails({ preview, learn, details }: CourseDetailsProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isConnected, address, ydBalance } = useWeb3()
  const { 
    isPurchasing, 
    isApproving, 
    purchaseCourse, 
    checkAllowance, 
    needsApproval,
    error: purchaseError 
  } = useCoursePurchase()
  
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'checking' | 'approving' | 'purchasing' | 'completed' | 'error'>('idle')
  const [hasAccess, setHasAccess] = useState(false)

  // 工具函数
  const formatPrice = (price: string) => {
    return formatYiDengAmount(price, 2)
  }

  const hasEnoughBalance = () => {
    if (!ydBalance || !courseData) return false
    return parseFloat(ydBalance) >= parseFloat(courseData.price)
  }

  const canAccessLesson = (lesson: any) => {
    return lesson?.isPreview || isEnrolled
  }

  // 加载课程数据和访问权限检查
  useEffect(() => {
    const loadCourseData = async () => {
      if (!id) {
        navigate('/')
        return
      }

      setIsLoading(true)
      try {
        // 从本地缓存获取课程数据
        const course = getCourse(id)
        
        if (!course) {
          toast.error('课程不存在或已被删除')
          navigate('/')
          return
        }

        setCourseData(course)
        
        // 检查是否已购买
        if (address) {
          const purchased = hasPurchased(id, address)
          setIsEnrolled(purchased)
          setHasAccess(purchased)
          console.log(`课程 ${id} 购买状态:`, purchased)
          
          // 如果用户没有购买课程，显示购买提示但不阻止访问（显示购买界面）
          if (!purchased) {
            console.log('用户尚未购买此课程，显示购买界面')
          }
        } else {
          // 用户未连接钱包，显示连接钱包提示
          console.log('用户未连接钱包')
        }
      } catch (error) {
        console.error('加载课程数据失败:', error)
        toast.error('加载课程失败')
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [id, address, navigate])

  // 监听购买状态变化
  useEffect(() => {
    if (isPurchasing) {
      setPurchaseStep('purchasing')
    } else if (isApproving) {
      setPurchaseStep('approving')
    } else if (purchaseStep !== 'completed' && purchaseStep !== 'error') {
      setPurchaseStep('idle')
    }
  }, [isPurchasing, isApproving, purchaseStep])

  // 检查授权状态
  useEffect(() => {
    const checkApproval = async () => {
      if (courseData && !isEnrolled && isConnected && address) {
        setPurchaseStep('checking')
        await checkAllowance(courseData.price)
        setPurchaseStep('idle')
      }
    }
    
    checkApproval()
  }, [courseData, isEnrolled, isConnected, address, checkAllowance])

  const handlePurchase = async () => {
    if (!courseData || !address) {
      toast.error('请先连接钱包')
      return
    }

    // 检查余额
    const ydBalanceNum = parseFloat(ydBalance || '0')
    const priceNum = parseFloat(courseData.price)
    
    if (ydBalanceNum < priceNum) {
      toast.error(`余额不足，需要 ${formatPrice(courseData.price)} YD，当前余额 ${formatPrice(ydBalance || '0')} YD`)
      return
    }

    setPurchaseStep('checking')
    
    try {
      // 执行购买流程
      const success = await purchaseCourse(courseData.id, courseData.price)
      
      if (success) {
        setIsEnrolled(true)
        setHasAccess(true)
        setPurchaseStep('completed')
        toast.success('课程购买成功！现在可以学习了')
        
        // 3秒后重置状态
        setTimeout(() => {
          setPurchaseStep('idle')
        }, 3000)
      } else {
        setPurchaseStep('error')
        setTimeout(() => {
          setPurchaseStep('idle')
        }, 5000)
      }
    } catch (error) {
      console.error('购买流程错误:', error)
      setPurchaseStep('error')
      setTimeout(() => {
        setPurchaseStep('idle')
      }, 5000)
    }
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证访问权限...</p>
        </div>
      </div>
    )
  }

  // 如果课程不存在
  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">课程不存在</h3>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline"
          >
            返回课程列表
          </button>
        </div>
      </div>
    )
  }

  // 如果没有访问权限（未购买），显示购买页面
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 返回按钮 */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回课程列表</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* 课程预览卡片 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="relative">
                <img 
                  src={courseData.thumbnailHash || `https://via.placeholder.com/800x300?text=${encodeURIComponent(courseData.title)}`}
                  alt={courseData.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">需要购买才能访问</h2>
                    <p>购买课程后即可查看完整内容和开始学习</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
                <p className="text-gray-600 mb-6">{courseData.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>{courseData.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span>{courseData.enrollmentCount || 0} 名学生</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span>{courseData.rating || '5.0'} 评分</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 购买区域 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">购买此课程</h2>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Coins className="w-8 h-8 text-blue-600" />
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(courseData.price)} YD
                  </span>
                </div>
                <p className="text-gray-600">使用一灯币购买课程</p>
              </div>

              {/* 当前余额显示 */}
              {ydBalance && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">当前余额</span>
                    <span className={`font-medium ${hasEnoughBalance() ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(ydBalance)} YD
                    </span>
                  </div>
                  {!hasEnoughBalance() && (
                    <div className="mt-2 text-xs text-red-600">
                      还需要 {formatPrice((parseFloat(courseData.price) - parseFloat(ydBalance)).toString())} YD
                    </div>
                  )}
                </div>
              )}

              {/* 购买进度指示器 */}
              <PurchaseStepIndicator 
                currentStep={purchaseStep}
                price={formatPrice(courseData.price)}
                error={purchaseError}
              />

              {/* 购买按钮区域 */}
              <div className="space-y-4">
                {/* 余额不足警告 */}
                {!hasEnoughBalance() && ydBalance && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-red-800 font-medium">余额不足</p>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      请先获取足够的一灯币后再购买课程
                    </p>
                  </div>
                )}

                {/* 连接钱包提醒 */}
                {!isConnected && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">需要连接钱包</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      请先连接您的Web3钱包来购买课程
                    </p>
                  </div>
                )}

                {/* 授权说明 */}
                {needsApproval && hasEnoughBalance() && isConnected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">需要授权</p>
                        <p className="text-xs text-blue-700 mt-1">
                          首次购买需要授权一灯币给课程合约，这是安全的标准流程
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 购买按钮 */}
                <button 
                  onClick={handlePurchase}
                  disabled={!isConnected || isPurchasing || isApproving || !hasEnoughBalance()}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
                    !isConnected 
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : !hasEnoughBalance()
                      ? 'bg-red-400 text-white cursor-not-allowed'
                      : isPurchasing || isApproving
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {!isConnected ? (
                    '请先连接钱包'
                  ) : !hasEnoughBalance() ? (
                    '余额不足'
                  ) : isApproving ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>正在授权...</span>
                    </div>
                  ) : isPurchasing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>正在购买...</span>
                    </div>
                  ) : (
                    `立即购买 (${formatPrice(courseData.price)} YD)`
                  )}
                </button>
              </div>

              {/* 购买说明 */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  购买后您将获得：
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">完整课程内容访问权限</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">所有视频课程和学习资料</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">永久学习权限，随时复习</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">讲师答疑和学习支持</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 用户已购买，显示完整课程内容
  const lessons = courseData.lessons || [
    { 
      id: '1', 
      title: '课程介绍', 
      duration: '15分钟', 
      description: '了解课程内容和学习目标',
      isPreview: true 
    },
    { 
      id: '2', 
      title: '基础理论', 
      duration: '45分钟', 
      description: '学习核心理论知识',
      isPreview: false 
    },
    { 
      id: '3', 
      title: '实践应用', 
      duration: '60分钟', 
      description: '动手实践项目',
      isPreview: false 
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回课程列表</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 视频播放器区域 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-black aspect-video relative group">
                <img 
                  src={courseData.thumbnailHash || `https://via.placeholder.com/800x450?text=${encodeURIComponent(courseData.title)}`}
                  alt={courseData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button 
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110"
                    onClick={() => {
                      toast.success('开始播放课程视频')
                    }}
                  >
                    <Play className="w-8 h-8 text-blue-600" />
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>已购买</span>
                </div>
              </div>
              
              {/* 当前播放课程信息 */}
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-2">
                  {lessons[selectedLesson]?.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {lessons[selectedLesson]?.description}
                </p>
              </div>
            </div>

            {/* 课程介绍 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">{courseData.title}</h1>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-medium">{courseData.rating || '5.0'}</span>
                  {courseData.reviews && (
                    <span className="text-gray-500">({courseData.reviews} 评价)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{courseData.enrollmentCount || 0} 名学生</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{courseData.duration}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                {courseData.description}
              </p>

              {/* 课程详细描述 */}
              {courseData.detailedDescription && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">课程详情</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {courseData.detailedDescription}
                  </p>
                </div>
              )}

              {/* 课程标签 */}
              {courseData.tags && courseData.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">课程标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 讲师信息 */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">关于讲师</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {courseData.instructorName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      {courseData.instructorName || '课程讲师'}
                    </h4>
                    <p className="text-gray-600">
                      {courseData.instructorBio || '经验丰富的区块链技术专家'}
                    </p>
                    {courseData.instructorAddress && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {courseData.instructorAddress.slice(0, 8)}...{courseData.instructorAddress.slice(-6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 学习进度卡片 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">已购买</span>
                </div>
                <p className="text-gray-600">享受完整学习体验</p>
              </div>

              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">讲师</span>
                  <span className="font-medium">{courseData.instructorName || '匿名讲师'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程时长</span>
                  <span className="font-medium">{courseData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">学生人数</span>
                  <span className="font-medium">{courseData.enrollmentCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程等级</span>
                  <span className="font-medium">{courseData.difficulty || '初级'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">购买价格</span>
                  <span className="font-medium text-blue-600">{formatPrice(courseData.price)} YD</span>
                </div>
              </div>
            </div>

            {/* 课程目录 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">课程目录</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      selectedLesson === index 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedLesson(index)
                      toast.success(`正在播放：${lesson.title}`)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Play className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-900">
                          {lesson.title}
                        </p>
                        <p className="text-sm text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>总时长: {courseData.duration}</span>
                  <span>{lessons.length} 个课时</span>
                </div>
                <div className="mt-2 text-xs text-green-600 text-center">
                  🎉 恭喜！您可以观看所有课程内容
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
