import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useCoursePurchase } from '../../hooks/useCoursePurchase'
import { getCourse, hasPurchased } from '../../utils/courseStorage'
import { formatYiDengAmount } from '../../config/yidengToken'
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
  Shield
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
  const [showApprovalStep, setShowApprovalStep] = useState(false)

  // 加载课程数据
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
          toast.error('课程不存在')
          navigate('/')
          return
        }

        setCourseData(course)
        
        // 检查是否已购买
        if (address) {
          const purchased = hasPurchased(id, address)
          setIsEnrolled(purchased)
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

  // 检查授权状态
  useEffect(() => {
    const checkApproval = async () => {
      if (courseData && !isEnrolled && isConnected) {
        await checkAllowance(courseData.price)
      }
    }
    
    checkApproval()
  }, [courseData, isEnrolled, isConnected, checkAllowance])

  const handlePurchase = async () => {
    if (!courseData || !address) {
      toast.error('请先连接钱包')
      return
    }

    // 检查余额
    const ydBalanceNum = parseFloat(ydBalance || '0')
    const priceNum = parseFloat(courseData.price)
    
    if (ydBalanceNum < priceNum) {
      toast.error(`余额不足，需要 ${formatYiDengAmount(courseData.price)} YD，当前余额 ${formatYiDengAmount(ydBalance || '0')} YD`)
      return
    }

    // 如果需要授权，显示授权步骤说明
    if (needsApproval && !showApprovalStep) {
      setShowApprovalStep(true)
      return
    }

    // 执行购买
    const success = await purchaseCourse(courseData.id, courseData.price)
    if (success) {
      setIsEnrolled(true)
      setShowApprovalStep(false)
      toast.success('课程购买成功！现在可以学习课程了')
    }
  }

  const canAccessLesson = (lesson: any) => {
    return lesson?.isPreview || isEnrolled
  }

  const formatPrice = (price: string) => {
    return formatYiDengAmount(price, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载课程中...</p>
        </div>
      </div>
    )
  }

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

  // 模拟课程章节数据（从缓存的课程数据中获取，如果没有则使用默认）
  const lessons = courseData.lessons || [
    { 
      id: 1, 
      title: '课程介绍', 
      duration: '15分钟', 
      description: '了解课程内容和学习目标',
      isPreview: true 
    },
    { 
      id: 2, 
      title: '基础理论', 
      duration: '45分钟', 
      description: '学习核心理论知识',
      isPreview: false 
    },
    { 
      id: 3, 
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
                  <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110">
                    <Play className="w-8 h-8 text-blue-600" />
                  </button>
                </div>
                {!canAccessLesson(lessons[selectedLesson]) && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    需要购买
                  </div>
                )}
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
                  <span className="text-gray-500">(评价)</span>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 购买卡片 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-6 h-6 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(courseData.price)} YD
                  </span>
                </div>
                <p className="text-gray-600">使用一灯币购买</p>
              </div>

              {/* 当前余额显示 */}
              {ydBalance && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">当前余额</span>
                    <span className="font-medium text-blue-600">
                      {formatPrice(ydBalance)} YD
                    </span>
                  </div>
                </div>
              )}

              {/* 购买状态和按钮 */}
              {isEnrolled ? (
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium mb-4">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  已购买
                </button>
              ) : (
                <div className="space-y-3 mb-4">
                  {/* 授权步骤说明 */}
                  {showApprovalStep && needsApproval && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 mb-1">
                            需要授权步骤
                          </p>
                          <p className="text-sm text-yellow-700 mb-2">
                            首次购买需要授权一灯币给课程合约，这是安全的标准流程。
                          </p>
                          <p className="text-xs text-yellow-600">
                            点击购买按钮将先进行授权，然后完成购买。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 购买按钮 */}
                  <button 
                    onClick={handlePurchase}
                    disabled={!isConnected || isPurchasing || isApproving}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      !isConnected 
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isPurchasing || isApproving
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : parseFloat(ydBalance || '0') < parseFloat(courseData.price)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {!isConnected ? (
                      '请先连接钱包'
                    ) : isApproving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>授权中...</span>
                      </div>
                    ) : isPurchasing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>购买中...</span>
                      </div>
                    ) : parseFloat(ydBalance || '0') < parseFloat(courseData.price) ? (
                      '余额不足'
                    ) : needsApproval && !showApprovalStep ? (
                      '需要授权'
                    ) : (
                      '立即购买'
                    )}
                  </button>

                  {/* 取消授权步骤 */}
                  {showApprovalStep && (
                    <button
                      onClick={() => setShowApprovalStep(false)}
                      className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
                    >
                      取消
                    </button>
                  )}
                </div>
              )}
              
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors mb-6">
                免费预览
              </button>

              {/* 错误提示 */}
              {purchaseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{purchaseError}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
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
                  <span className="text-gray-600">创建时间</span>
                  <span className="font-medium">
                    {courseData.createdAt ? new Date(courseData.createdAt).toLocaleDateString('zh-CN') : '未知'}
                  </span>
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
                      if (canAccessLesson(lesson)) {
                        setSelectedLesson(index)
                      } else {
                        toast.info('请先购买课程才能观看此章节')
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {canAccessLesson(lesson) ? (
                          lesson.isPreview ? (
                            <Play className="w-5 h-5 text-green-500" />
                          ) : (
                            <Play className="w-5 h-5 text-blue-500" />
                          )
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          canAccessLesson(lesson) ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-sm text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.isPreview && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          免费预览
                        </span>
                      )}
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
              </div>
            </div>

            {/* 购买说明 */}
            {!isEnrolled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-3">
                  <Shield className="w-5 h-5 inline mr-2" />
                  购买流程说明
                </h3>
                <div className="space-y-2 text-blue-700">
                  <p className="text-sm">
                    <span className="font-medium">第一步:</span> 确保您有足够的一灯币余额 ({formatPrice(courseData.price)} YD)
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">第二步:</span> 授权一灯币给课程合约（首次购买需要）
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">第三步:</span> 确认购买交易
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">完成:</span> 购买成功后即可观看所有课程内容
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
