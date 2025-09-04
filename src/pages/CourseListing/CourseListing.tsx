import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Star, BookOpen, Coins } from 'lucide-react'
import { getAllCourses } from '../../utils/courseStorage'
import { useWeb3 } from '../../contexts/Web3Context'
import type { Course } from '../../types/courseTypes'

function CourseListing() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { ydBalance } = useWeb3()

  // 从本地缓存加载课程数据
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true)
      try {
        // 获取本地存储的所有课程
        const cachedCourses = getAllCourses()
        
        // 如果本地没有课程数据，创建一些示例课程
        if (cachedCourses.length === 0) {
          // 这里可以添加一些默认课程数据或者从远程API获取
          console.log('本地缓存中没有课程数据')
        }
        
        setCourses(cachedCourses)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
              <img 
                src={course.thumbnailHash || `https://via.placeholder.com/400x200?text=${encodeURIComponent(course.title)}`} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.difficulty || '初级')}`}>
                  {course.difficulty || '初级'}
                </span>
              </div>
              
              {/* 余额不足提示 */}
              {!canAfford(course.price) && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  余额不足
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(course.price)} YD
                  </span>
                </div>
                <Link
                  to={`/course/${course.id}`}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    canAfford(course.price)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (!canAfford(course.price)) {
                      e.preventDefault()
                      toast.error(`余额不足，需要 ${formatPrice(course.price)} YD`)
                    }
                  }}
                >
                  {canAfford(course.price) ? '查看详情' : '余额不足'}
                </Link>
              </div>
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
          <p className="text-sm text-gray-400">
            提示：课程数据从本地缓存读取，您可以先创建一些课程。
          </p>
        </div>
      )}
      
      {/* 如果没有连接钱包的提示 */}
      {!ydBalance && (
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800">
              请先连接钱包查看您的一灯币余额
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseListing
