import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
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
  ArrowLeft,
  Share2,
  Heart
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
  const { address } = useWeb3()
  
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 工具函数
  const formatPrice = (price: string) => {
    return formatYiDengAmount(price, 2)
  }

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
          toast.error('课程不存在或已被删除')
          navigate('/')
          return
        }

        setCourseData(course)
        
        // 检查是否已购买和是否为创建者
        if (address) {
          const purchased = hasPurchased(id, address)
          const creator = course.instructorAddress?.toLowerCase() === address.toLowerCase()
          
          setIsEnrolled(purchased)
          setIsCreator(creator)
          
          console.log(`课程 ${id} 状态:`, {
            purchased,
            creator,
            canAccess: purchased || creator
          })
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

  // 如果正在加载，显示加载状态
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

  // 显示完整课程内容（用户已购买）
  const lessons = courseData.lessons || [
    { 
      id: '1', 
      title: '课程介绍', 
      duration: '15分钟', 
      description: '了解课程内容和学习目标',
      isPreview: true,
      videoUrl: courseData.lessons?.[0]?.videoUrl // 使用实际的视频URL，如果存在的话
    },
    { 
      id: '2', 
      title: '基础理论', 
      duration: '45分钟', 
      description: '学习核心理论知识',
      isPreview: false,
      videoUrl: courseData.lessons?.[1]?.videoUrl
    },
    { 
      id: '3', 
      title: '实践应用', 
      duration: '60分钟', 
      description: '动手实践项目',
      isPreview: false,
      videoUrl: courseData.lessons?.[2]?.videoUrl
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
                {lessons[selectedLesson]?.videoUrl ? (
                  <video 
                    key={lessons[selectedLesson].id} // Force re-render when lesson changes
                    src={lessons[selectedLesson].videoUrl}
                    poster={courseData.thumbnailHash || `https://via.placeholder.com/800x450?text=${encodeURIComponent(lessons[selectedLesson].title)}`}
                    className="w-full h-full object-cover"
                    controls
                    onPlay={() => {
                      toast.success(`正在播放：${lessons[selectedLesson].title}`)
                    }}
                  />
                ) : (
                  <>
                    <img 
                      src={courseData.thumbnailHash || `https://via.placeholder.com/800x450?text=${encodeURIComponent(lessons[selectedLesson]?.title || courseData.title)}`}
                      alt={lessons[selectedLesson]?.title || courseData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <button 
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110"
                        onClick={() => {
                          toast.info(`${lessons[selectedLesson]?.title || '当前课程'} 暂无视频内容`)
                        }}
                      >
                        <Play className="w-8 h-8 text-blue-600" />
                      </button>
                    </div>
                  </>
                )}
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium">
                  {isCreator ? (
                    <div className="bg-purple-500 text-white flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>我的课程</span>
                    </div>
                  ) : (
                    <div className="bg-green-500 text-white flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>已购买</span>
                    </div>
                  )}
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
                {isCreator ? (
                  <>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-600">我的课程</span>
                    </div>
                    <p className="text-gray-600">您是这门课程的创建者</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">已购买</span>
                    </div>
                    <p className="text-gray-600">享受完整学习体验</p>
                  </>
                )}
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
                      if (lesson.videoUrl) {
                        toast.success(`切换到课程：${lesson.title}`)
                      } else {
                        toast.info(`切换到课程：${lesson.title}（暂无视频）`)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {lesson.videoUrl ? (
                          <Play className="w-5 h-5 text-blue-500" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate text-gray-900">
                            {lesson.title}
                          </p>
                          {lesson.videoUrl && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                              视频
                            </span>
                          )}
                        </div>
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
                <div className="mt-2 text-xs text-center p-2 rounded">
                  {isCreator ? (
                    <div className="text-purple-600 bg-purple-50">
                      👑 作为创建者，您拥有完全访问权限
                    </div>
                  ) : (
                    <div className="text-green-600 bg-green-50">
                      🎉 恭喜！您可以观看所有课程内容
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 学习进度 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">学习进度</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完成进度</span>
                  <span className="text-sm font-medium">0/{lessons.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-0"></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  开始学习来记录您的进度
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
