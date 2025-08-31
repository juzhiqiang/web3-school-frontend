import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { BookOpen, Play, Users, Clock, Star, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CourseDetailsProps {
  preview?: boolean
  learn?: boolean
  details?: boolean
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ preview, learn, details }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { courses, userProfile, purchaseCourse, isLoading, isConnected } = useWeb3()
  const [course, setCourse] = useState(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [completedSections, setCompletedSections] = useState<number[]>([])

  useEffect(() => {
    if (id && courses.length > 0) {
      const foundCourse = courses.find(c => c.id === parseInt(id))
      setCourse(foundCourse || null)
    }
  }, [id, courses])

  const isOwned = course && userProfile?.purchasedCourses.includes(course.id)
  const isAuthor = course && course.author.toLowerCase() === userProfile?.address.toLowerCase()

  const handlePurchase = async () => {
    if (!course || !isConnected) return
    
    const success = await purchaseCourse(course.id)
    if (success) {
      toast.success(`成功购买课程: ${course.title}`)
    }
  }

  const markSectionComplete = (sectionIndex: number) => {
    if (!completedSections.includes(sectionIndex)) {
      setCompletedSections(prev => [...prev, sectionIndex])
      toast.success('章节完成！')
    }
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          课程未找到
        </h2>
        <p className="text-gray-600 mb-8">
          抱歉，请求的课程不存在或已被删除
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回课程市场</span>
        </Link>
      </div>
    )
  }

  // Mock course content for learning mode
  const courseContent = [
    {
      title: '第1章: 介绍和概述',
      content: '欢迎来到Web3世界！在这一章中，我们将介绍区块链的基础概念...',
      duration: '15分钟',
      videoUrl: 'https://example.com/video1.mp4'
    },
    {
      title: '第2章: 智能合约基础',
      content: '智能合约是区块链上的自执行代码，让我们深入了解...',
      duration: '25分钟',
      videoUrl: 'https://example.com/video2.mp4'
    },
    {
      title: '第3章: DeFi协议交互',
      content: '学习如何与去中心化金融协议进行交互...',
      duration: '30分钟',
      videoUrl: 'https://example.com/video3.mp4'
    }
  ]

  // Learning Mode
  if (learn && (isOwned || isAuthor)) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-3">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to={`/course/${course.id}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回课程详情</span>
              </Link>
              
              <div className="text-sm text-gray-500">
                进度: {completedSections.length}/{courseContent.length} 章节
              </div>
            </div>

            {/* Current Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              {/* Video Player Area */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg">视频播放器</p>
                  <p className="text-sm opacity-75">{courseContent[currentSection]?.videoUrl}</p>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {courseContent[currentSection]?.title}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{courseContent[currentSection]?.duration}</span>
                  </div>
                </div>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {courseContent[currentSection]?.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一章
                  </button>
                  
                  <button
                    onClick={() => markSectionComplete(currentSection)}
                    disabled={completedSections.includes(currentSection)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{completedSections.includes(currentSection) ? '已完成' : '标记完成'}</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentSection(Math.min(courseContent.length - 1, currentSection + 1))}
                    disabled={currentSection === courseContent.length - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一章
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Outline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                课程大纲
              </h3>
              
              <div className="space-y-3">
                {courseContent.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSection === index
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {completedSections.includes(index) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            currentSection === index ? 'border-blue-500' : 'border-gray-300'
                          }`} />
                        )}
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{section.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Progress */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>学习进度</span>
                  <span>{Math.round((completedSections.length / courseContent.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSections.length / courseContent.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Course Details/Preview Mode
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回课程市场</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            {/* Hero Image */}
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-20 w-20 text-white opacity-80" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              
              {/* Course Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentsCount || 0} 学生</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 0} 分钟</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating || 5.0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {course.price} ETH
                  </div>
                  {course.level && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.level === 'Beginner'
                        ? 'bg-green-100 text-green-800'
                        : course.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.level === 'Beginner' ? '初级' : 
                       course.level === 'Intermediate' ? '中级' : '高级'}
                    </span>
                  )}
                </div>
                
                {isOwned && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">已拥有</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">课程描述</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>

              {/* Author Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">作者信息</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {course.author.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {course.author.slice(0, 6)}...{course.author.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-500">区块链开发者</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Outline Preview */}
          {!preview && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                课程大纲
              </h3>
              
              <div className="space-y-3">
                {courseContent.map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{section.title}</div>
                        <div className="text-sm text-gray-500">{section.duration}</div>
                      </div>
                    </div>
                    
                    {(isOwned || isAuthor) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            {/* Purchase/Access Actions */}
            <div className="space-y-4 mb-6">
              {isOwned || isAuthor ? (
                <Link
                  to={`/course/${course.id}/learn`}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium text-center block hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>开始学习</span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isLoading || !isConnected}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isLoading ? '购买中...' : `购买课程 - ${course.price} ETH`}
                </button>
              )}
              
              {!isConnected && (
                <div className="text-center text-sm text-gray-500">
                  需要连接钱包才能购买课程
                </div>
              )}
            </div>

            {/* Course Features */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">课程特色</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>永久访问权限</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>高清视频内容</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>实战项目演示</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>社区支持</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>NFT课程证书</span>
                </li>
              </ul>
            </div>

            {/* Course Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">课程统计</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">学生数量:</span>
                  <span className="font-medium">{course.studentsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程时长:</span>
                  <span className="font-medium">{course.duration || 0} 分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">难度等级:</span>
                  <span className="font-medium">
                    {course.level === 'Beginner' ? '初级' : 
                     course.level === 'Intermediate' ? '中级' : '高级'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程评分:</span>
                  <span className="font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating || 5.0}</span>
                  </span>
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