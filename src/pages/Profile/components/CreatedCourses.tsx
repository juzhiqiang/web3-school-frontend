import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../../../contexts/Web3Context'
import { BookOpen, Edit3, Eye, TrendingUp, Users, DollarSign } from 'lucide-react'

const CreatedCourses: React.FC = () => {
  const { authorCourses, userProfile } = useWeb3()

  if (!userProfile?.isAuthor || authorCourses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {!userProfile?.isAuthor ? '成为课程作者' : '您还没有创建任何课程'}
        </h3>
        <p className="text-gray-600 mb-6">
          {!userProfile?.isAuthor 
            ? '分享您的知识，创建课程并获得收益'
            : '开始创建您的第一门课程，分享您的专业知识'
          }
        </p>
        <Link
          to="/create-course"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span>创建课程</span>
        </Link>
      </div>
    )
  }

  // Mock earnings data
  const totalEarnings = authorCourses.reduce((sum, course) => {
    return sum + (parseFloat(course.price) * (course.studentsCount || 0))
  }, 0)

  return (
    <div className="space-y-6">
      {/* Author Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          作者统计
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {authorCourses.length}
            </div>
            <div className="text-sm text-blue-700">创建课程</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {authorCourses.reduce((sum, course) => sum + (course.studentsCount || 0), 0)}
            </div>
            <div className="text-sm text-green-700">学生总数</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-purple-700">总收益 (ETH)</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {authorCourses.length > 0 
                ? (authorCourses.reduce((sum, course) => sum + (course.rating || 5), 0) / authorCourses.length).toFixed(1)
                : '5.0'
              }
            </div>
            <div className="text-sm text-yellow-700">平均评分</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {authorCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Course Header */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-white opacity-80" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs font-medium text-green-600">已发布</span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-900">
                    {course.studentsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">学生</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600">
                    {course.price}
                  </div>
                  <div className="text-xs text-gray-500">ETH</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-yellow-600">
                    {course.rating || 5.0}
                  </div>
                  <div className="text-xs text-gray-500">评分</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/course/${course.id}/edit`}
                  className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>编辑</span>
                </Link>
                
                <Link
                  to={`/course/${course.id}/analytics`}
                  className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>统计</span>
                </Link>
              </div>

              {/* Earnings */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">课程收益:</span>
                  <span className="font-medium text-green-600">
                    {(parseFloat(course.price) * (course.studentsCount || 0)).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CreatedCourses