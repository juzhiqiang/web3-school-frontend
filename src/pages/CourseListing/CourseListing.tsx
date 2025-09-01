import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Star } from 'lucide-react'

function CourseListing() {
  // 模拟课程数据
  const courses = [
    {
      id: 1,
      title: '区块链基础入门',
      description: '从零开始学习区块链技术，了解比特币、以太坊的工作原理，掌握智能合约基础知识。',
      instructor: 'Alice Chen',
      price: '0.1',
      duration: '10小时',
      students: 156,
      rating: 4.8,
      image: 'https://via.placeholder.com/400x200?text=区块链基础',
      level: '初级'
    },
    {
      id: 2,
      title: 'DeFi协议深入解析',
      description: '深入学习去中心化金融协议，包括Uniswap、Compound、Aave等主流DeFi应用。',
      instructor: 'Bob Li',
      price: '0.15',
      duration: '15小时',
      students: 89,
      rating: 4.9,
      image: 'https://via.placeholder.com/400x200?text=DeFi协议',
      level: '中级'
    },
    {
      id: 3,
      title: '智能合约开发实战',
      description: '从零开始学习Solidity编程，开发和部署你的第一个智能合约。',
      instructor: 'Carol Wang',
      price: '0.2',
      duration: '20小时',
      students: 234,
      rating: 4.7,
      image: 'https://via.placeholder.com/400x200?text=智能合约开发',
      level: '高级'
    },
    {
      id: 4,
      title: 'NFT项目开发指南',
      description: '学习如何创建、发布和营销你自己的NFT项目，包含完整的技术和商业策略。',
      instructor: 'David Zhou',
      price: '0.12',
      duration: '12小时',
      students: 67,
      rating: 4.6,
      image: 'https://via.placeholder.com/400x200?text=NFT项目开发',
      level: '中级'
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case '初级': return 'bg-green-100 text-green-800'
      case '中级': return 'bg-yellow-100 text-yellow-800'
      case '高级': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Web3课程市场
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          发现优质的Web3课程，掌握区块链技术，开启去中心化世界的学习之旅
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">讲师: {course.instructor}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{course.rating}</span>
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
                    <span>{course.students}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{course.price} ETH</span>
                <Link
                  to={`/course/${course.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  查看详情
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 空状态提示 */}
      {courses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">暂无课程</h3>
          <p className="text-gray-500">目前还没有发布的课程，请稍后再来查看。</p>
        </div>
      )}
    </div>
  )
}

export default CourseListing
