import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../../../contexts/Web3Context'
import { BookOpen, Play, Clock, Star, Users } from 'lucide-react'

const PurchasedCourses: React.FC = () => {
  const { userCourses } = useWeb3()

  if (userCourses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          您还没有购买任何课程
        </h3>
        <p className="text-gray-600 mb-6">
          探索我们的课程市场，开始您的Web3学习之旅
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span>浏览课程</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userCourses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
        >
          {/* Course Image */}
          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-80" />
              </div>
            )}
            
            {/* Progress Badge */}
            <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium">
              已拥有
            </div>
          </div>

          {/* Course Info */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{course.studentsCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration || 0}分钟</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating || 5.0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                to={`/course/${course.id}/learn`}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-center block hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>开始学习</span>
                </div>
              </Link>
              
              <Link
                to={`/course/${course.id}/details`}
                className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium text-center block hover:bg-gray-100 transition-colors border border-gray-200"
              >
                查看详情
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PurchasedCourses