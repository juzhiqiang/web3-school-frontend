import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Star, BookOpen, Coins, Shield, CreditCard, CheckCircle } from 'lucide-react'
import { getAllCourses } from '../../utils/courseStorage'
import { initializeSampleCourses } from '../../utils/courseDataInit'
import { useWeb3 } from '../../contexts/Web3Context'
import type { Course } from '../../types/courseTypes'
import toast from 'react-hot-toast'

function CourseListing() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { ydBalance } = useWeb3()

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
          <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              余额: {formatPrice(ydBalance)} YD
            </span>
          </div>
        )}
      </div>

      {/* 课程统计 */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
              {courses.reduce((sum, course) => sum + parseFloat(course.price), 0).toFixed(0)}
            </div>
            <div className="text-purple-100">YD 总价值</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
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
              
              {/* 余额不足提示 */}
              {ydBalance && !canAfford(course.price) && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  余额不足
                </div>
              )}

              {/* 免费预览课程标识 */}
              {course.lessons && course.lessons.some(lesson => lesson.isPreview) && (
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(course.price)} YD
                  </span>
                </div>
                <Link
                  to={`/course/${course.id}`}
                  className="px-6 py-2 rounded-md transition-colors font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={(e) => {
                    if (ydBalance && !canAfford(course.price)) {
                      // 不阻止链接，让用户进入详情页查看购买流程
                      toast.info(`注意：余额不足，需要 ${formatPrice(course.price)} YD`)
                    }
                  }}
                >
                  查看详情
                </Link>
              </div>

              {/* 余额不足时的额外提示 */}
              {ydBalance && !canAfford(course.price) && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-red-600">
                    需要 {formatPrice((parseFloat(course.price) - parseFloat(ydBalance)).toString())} YD
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
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
                连接钱包查看余额
              </p>
            </div>
            <p className="text-yellow-700 text-sm">
              连接钱包后可以查看您的一灯币余额，并购买感兴趣的课程
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
              点击购买按钮，使用一灯币支付课程费用
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800">3. 开始学习</h4>
            <p className="text-sm text-gray-600">
              购买成功后即可访问所有课程内容
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>使用一灯币 (YD) 购买课程</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseListing
