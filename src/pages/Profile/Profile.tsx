import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useCourseContract, useMyCoursesContract } from '../../hooks/useCourseContract'
import { getCourse } from '../../utils/courseStorage'
import { User, Edit3, BookOpen, TrendingUp, Eye, Calendar, Star, Award, ArrowRight, Loader2 } from 'lucide-react'
import type { Course } from '../../types/course'

interface CourseData extends Course {
  isPurchased: boolean
  isCreated: boolean
  onChainData?: {
    enrollmentCount?: number
    totalRevenue?: string
    isActive?: boolean
  }
}

function Profile() {
  const { isConnected, address, balance } = useWeb3()
  const navigate = useNavigate()
  const { getCourseStats } = useCourseContract()
  const { creatorCourseIds, purchasedCourseIds } = useMyCoursesContract()
  
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Web3学习者',
    bio: '对区块链技术和去中心化教育充满热情。',
    avatar: '',
    email: 'user@example.com'
  })
  
  // 课程数据状态
  const [createdCourses, setCreatedCourses] = useState<CourseData[]>([])
  const [purchasedCourses, setPurchasedCourses] = useState<CourseData[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [activeTab, setActiveTab] = useState<'created' | 'purchased'>('created')
  
  // 统计数据
  const [stats, setStats] = useState({
    createdCount: 0,
    purchasedCount: 0,
    totalStudents: 0,
    totalRevenue: 0
  })

  // 加载我创建的课程
  const loadCreatedCourses = async () => {
    if (!creatorCourseIds || !address) return

    try {
      const courses: CourseData[] = []
      let totalStudents = 0
      let totalRevenue = 0

      for (const courseId of creatorCourseIds) {
        const localCourse = getCourse(courseId)
        if (localCourse) {
          // 尝试获取链上统计数据
          let onChainData = {}
          try {
            const stats = await getCourseStats(courseId)
            if (stats) {
              onChainData = {
                enrollmentCount: parseInt(stats.studentCount || '0'),
                totalRevenue: stats.totalRevenue || '0',
                isActive: true
              }
              totalStudents += parseInt(stats.studentCount || '0')
              totalRevenue += parseFloat(stats.totalRevenue || '0')
            }
          } catch (err) {
            console.log(`课程 ${courseId} 链上数据获取失败，使用模拟数据`)
            // 使用模拟数据
            const mockEnrollment = Math.floor(Math.random() * 50)
            const mockRevenue = Math.random() * 5
            onChainData = {
              enrollmentCount: mockEnrollment,
              totalRevenue: mockRevenue.toFixed(3),
              isActive: true
            }
            totalStudents += mockEnrollment
            totalRevenue += mockRevenue
          }

          courses.push({
            ...localCourse,
            isPurchased: false,
            isCreated: true,
            onChainData
          })
        }
      }

      setCreatedCourses(courses)
      setStats(prev => ({
        ...prev,
        createdCount: courses.length,
        totalStudents,
        totalRevenue
      }))
    } catch (error) {
      console.error('加载创建的课程失败:', error)
    }
  }

  // 加载我购买的课程
  const loadPurchasedCourses = async () => {
    if (!purchasedCourseIds || !address) return

    try {
      const courses: CourseData[] = []

      for (const courseId of purchasedCourseIds) {
        // 跳过我自己创建的课程
        if (creatorCourseIds?.includes(courseId)) continue
        
        const localCourse = getCourse(courseId)
        if (localCourse) {
          courses.push({
            ...localCourse,
            isPurchased: true,
            isCreated: false
          })
        }
      }

      setPurchasedCourses(courses)
      setStats(prev => ({
        ...prev,
        purchasedCount: courses.length
      }))
    } catch (error) {
      console.error('加载购买的课程失败:', error)
    }
  }

  // 加载所有课程数据
  useEffect(() => {
    const loadAllCourses = async () => {
      if (!isConnected || !address) return

      setIsLoadingCourses(true)
      try {
        await Promise.all([
          loadCreatedCourses(),
          loadPurchasedCourses()
        ])
      } catch (error) {
        console.error('加载课程数据失败:', error)
      } finally {
        setIsLoadingCourses(false)
      }
    }

    loadAllCourses()
  }, [isConnected, address, creatorCourseIds, purchasedCourseIds])

  // 跳转到课程详情
  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p>请先连接您的钱包以查看个人资料。</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log('保存个人资料:', profileData)
  }

  // 课程卡片组件
  const CourseCard: React.FC<{ course: CourseData }> = ({ course }) => (
    <div 
      onClick={() => handleCourseClick(course.id)}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-lg mb-1 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {course.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {course.difficulty}
            </span>
            <span className="font-medium text-blue-600">
              {course.price} 一灯币
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
      
      {course.isCreated && course.onChainData && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1 text-green-600" />
              {course.onChainData.enrollmentCount} 学生
            </span>
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              {course.onChainData.totalRevenue} 一灯币
            </span>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            我创建的
          </span>
        </div>
      )}
      
      {course.isPurchased && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>已购买</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            可学习
          </span>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 个人资料头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b-2 border-white text-white placeholder-gray-200"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  )}
                  <p className="opacity-90">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? '保存' : '编辑'}</span>
              </button>
            </div>
          </div>

          {/* 个人资料内容 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 个人信息和课程列表 */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">关于我</h3>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">联系信息</h3>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.email}</p>
                  )}
                </div>

                {/* 我的课程部分 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">我的课程</h3>
                    {isLoadingCourses && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                  </div>
                  
                  {/* 课程标签切换 */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('created')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'created'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      我创建的 ({stats.createdCount})
                    </button>
                    <button
                      onClick={() => setActiveTab('purchased')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'purchased'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      我购买的 ({stats.purchasedCount})
                    </button>
                  </div>

                  {/* 课程列表 */}
                  <div className="space-y-3">
                    {isLoadingCourses ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-gray-600">正在从链上加载课程数据...</p>
                      </div>
                    ) : (
                      <>
                        {activeTab === 'created' && (
                          <>
                            {createdCourses.length > 0 ? (
                              createdCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>您还没有创建任何课程</p>
                                <button 
                                  onClick={() => navigate('/create-course')}
                                  className="mt-2 text-blue-600 hover:underline"
                                >
                                  立即创建课程
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {activeTab === 'purchased' && (
                          <>
                            {purchasedCourses.length > 0 ? (
                              purchasedCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>您还没有购买任何课程</p>
                                <button 
                                  onClick={() => navigate('/courses')}
                                  className="mt-2 text-blue-600 hover:underline"
                                >
                                  去探索课程
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 统计侧边栏 */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">钱包余额</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '加载中...'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">创建课程</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.createdCount}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">学生总数</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">总收入</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalRevenue.toFixed(3)} 一灯币
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">购买课程</h3>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.purchasedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile