import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
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
  Heart
} from 'lucide-react'

interface CourseDetailsProps {
  preview?: boolean
  learn?: boolean
  details?: boolean
}

function CourseDetails({ preview, learn, details }: CourseDetailsProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isConnected } = useWeb3()
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [isEnrolled, setIsEnrolled] = useState(false)

  // 模拟课程数据
  const courseData = {
    id: id || '1',
    title: '区块链基础入门',
    description: '这是一门全面的区块链入门课程，专为零基础学员设计。通过本课程，你将系统性地学习区块链的核心概念、技术原理和实际应用。课程内容涵盖了从比特币的诞生背景到以太坊智能合约的开发，从加密货币的工作机制到DeFi生态系统的运作模式。',
    instructor: 'Alice Chen',
    instructorBio: '区块链技术专家，拥有5年以上智能合约开发经验，曾参与多个DeFi项目的架构设计。',
    price: '0.1',
    originalPrice: '0.15',
    duration: '10小时',
    students: 156,
    rating: 4.8,
    reviews: 42,
    level: '初级',
    language: '中文',
    lastUpdated: '2024年12月',
    image: 'https://via.placeholder.com/800x450?text=区块链基础入门课程',
    highlights: [
      '零基础友好，循序渐进',
      '理论与实践相结合',
      '提供实际项目案例',
      '终身学习支持',
      '讲师在线答疑'
    ],
    requirements: [
      '具备基本的计算机操作能力',
      '对新技术有学习兴趣',
      '无需编程基础'
    ],
    whatYouWillLearn: [
      '理解区块链的基本概念和工作原理',
      '掌握比特币和以太坊的技术架构',
      '了解智能合约的概念和应用',
      '熟悉主流加密货币和DeFi协议',
      '具备基础的区块链投资知识'
    ],
    lessons: [
      { 
        id: 1, 
        title: '区块链技术概述', 
        duration: '45分钟', 
        description: '了解区块链的基本概念、发展历史和核心特征',
        videoUrl: 'https://example.com/lesson1.mp4',
        isPreview: true 
      },
      { 
        id: 2, 
        title: '比特币的诞生与原理', 
        duration: '60分钟', 
        description: '深入了解比特币的创造背景、技术原理和运作机制',
        videoUrl: 'https://example.com/lesson2.mp4',
        isPreview: false 
      },
      { 
        id: 3, 
        title: '以太坊和智能合约', 
        duration: '75分钟', 
        description: '学习以太坊平台和智能合约的基础知识',
        videoUrl: 'https://example.com/lesson3.mp4',
        isPreview: false 
      },
      { 
        id: 4, 
        title: '加密货币钱包使用', 
        duration: '40分钟', 
        description: '掌握各种类型钱包的使用方法和安全注意事项',
        videoUrl: 'https://example.com/lesson4.mp4',
        isPreview: false 
      },
      { 
        id: 5, 
        title: 'DeFi生态系统入门', 
        duration: '90分钟', 
        description: '探索去中心化金融的各种应用和投资机会',
        videoUrl: 'https://example.com/lesson5.mp4',
        isPreview: false 
      }
    ]
  }

  const handleEnroll = () => {
    if (!isConnected) {
      alert('请先连接您的钱包')
      return
    }
    // 这里添加购买课程的逻辑
    console.log('购买课程:', courseData.id)
    setIsEnrolled(true)
  }

  const canAccessLesson = (lesson: any) => {
    return lesson.isPreview || isEnrolled
  }

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
                  src={courseData.image}
                  alt={courseData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110">
                    <Play className="w-8 h-8 text-blue-600" />
                  </button>
                </div>
                {!canAccessLesson(courseData.lessons[selectedLesson]) && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    需要购买
                  </div>
                )}
              </div>
              
              {/* 当前播放课程信息 */}
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-2">
                  {courseData.lessons[selectedLesson]?.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {courseData.lessons[selectedLesson]?.description}
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
                  <span className="font-medium">{courseData.rating}</span>
                  <span className="text-gray-500">({courseData.reviews} 评价)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{courseData.students} 名学生</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{courseData.duration}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                {courseData.description}
              </p>

              {/* 课程亮点 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">课程亮点</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courseData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学习收获 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">你将学到什么</h3>
                <div className="space-y-3">
                  {courseData.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 课程要求 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">课程要求</h3>
                <div className="space-y-2">
                  {courseData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 讲师信息 */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">关于讲师</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {courseData.instructor.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{courseData.instructor}</h4>
                    <p className="text-gray-600">{courseData.instructorBio}</p>
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
                  <span className="text-3xl font-bold text-blue-600">{courseData.price} ETH</span>
                  <span className="text-lg text-gray-500 line-through">{courseData.originalPrice} ETH</span>
                </div>
                <p className="text-green-600 font-medium">限时优惠 33% 折扣</p>
              </div>
              
              {isEnrolled ? (
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium mb-4">
                  ✓ 已购买
                </button>
              ) : (
                <button 
                  onClick={handleEnroll}
                  className={`w-full py-3 px-4 rounded-md font-medium mb-4 transition-colors ${
                    isConnected 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  disabled={!isConnected}
                >
                  {isConnected ? '立即购买' : '请先连接钱包'}
                </button>
              )}
              
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors mb-6">
                免费预览
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">讲师</span>
                  <span className="font-medium">{courseData.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程时长</span>
                  <span className="font-medium">{courseData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">学生人数</span>
                  <span className="font-medium">{courseData.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">课程等级</span>
                  <span className="font-medium">{courseData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">授课语言</span>
                  <span className="font-medium">{courseData.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新</span>
                  <span className="font-medium">{courseData.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* 课程目录 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">课程目录</h3>
              <div className="space-y-2">
                {courseData.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      selectedLesson === index 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLesson(index)}
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
                  <span>{courseData.lessons.length} 个课时</span>
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
