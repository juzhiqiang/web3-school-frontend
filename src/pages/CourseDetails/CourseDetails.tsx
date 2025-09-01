import React from 'react'
import { useParams } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { BookOpen, Clock, Users, Star, Play } from 'lucide-react'

interface CourseDetailsProps {
  preview?: boolean
  learn?: boolean
  details?: boolean
}

function CourseDetails({ preview, learn, details }: CourseDetailsProps) {
  const { id } = useParams()
  const { isConnected } = useWeb3()

  // 模拟课程数据
  const courseData = {
    id: id || '1',
    title: '区块链基础入门',
    description: '从零开始学习区块链技术，了解比特币、以太坊的工作原理，掌握智能合约基础知识。',
    instructor: 'Alice Chen',
    price: '0.1 ETH',
    duration: '10小时',
    students: 156,
    rating: 4.8,
    lessons: [
      { id: 1, title: '什么是区块链', duration: '30分钟', completed: false },
      { id: 2, title: '比特币的工作原理', duration: '45分钟', completed: false },
      { id: 3, title: '以太坊智能合约', duration: '60分钟', completed: false },
      { id: 4, title: 'DeFi协议介绍', duration: '50分钟', completed: false },
    ]
  }

  const renderContent = () => {
    if (learn) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-6">
              <Play className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">课程内容</h2>
            <p className="text-gray-600 mb-6">{courseData.description}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">课程目录</h3>
            <div className="space-y-3">
              {courseData.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.duration}</p>
                  </div>
                  <Play className="w-4 h-4 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img 
            src="https://via.placeholder.com/800x400?text=课程封面" 
            alt="课程封面"
            className="w-full rounded-lg mb-6"
          />
          <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
          <p className="text-gray-600 mb-6">{courseData.description}</p>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{courseData.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{courseData.students} 名学生</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">{courseData.rating} 评分</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">课程大纲</h2>
            <div className="space-y-3">
              {courseData.lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                    </div>
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-blue-600 mb-2">{courseData.price}</p>
            <p className="text-gray-600">一次性付费，终身学习</p>
          </div>
          
          {isConnected ? (
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors mb-4">
              购买课程
            </button>
          ) : (
            <button className="w-full bg-gray-400 text-white py-3 px-4 rounded-md font-medium cursor-not-allowed mb-4">
              请先连接钱包
            </button>
          )}
          
          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors">
            预览课程
          </button>
          
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">讲师</span>
              <span className="font-medium">{courseData.instructor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">课程时长</span>
              <span className="font-medium">{courseData.duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">学生人数</span>
              <span className="font-medium">{courseData.students}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">课程评分</span>
              <span className="font-medium">{courseData.rating}/5.0</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {renderContent()}
    </div>
  )
}

export default CourseDetails
