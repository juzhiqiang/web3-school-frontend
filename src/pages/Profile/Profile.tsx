import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { useCourseContract, useMyCoursesContract } from '../../hooks/useCourseContract'
import { getCourse } from '../../utils/courseStorage'
import { User, Edit3, BookOpen, TrendingUp, Calendar, Star, Award, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'
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

// 用户资料接口
interface UserProfile {
  name: string
  bio: string
  avatar: string
  email: string
  address: string
  signature: string
  message: string
  timestamp: number
}

function Profile() {
  const { isConnected, address, balance } = useWeb3()
  const navigate = useNavigate()
  const { getCourseStats, getAuthorStats } = useCourseContract()
  const { creatorCourseIds, purchasedCourseIds } = useMyCoursesContract()
  
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: '',
    email: ''
  })
  const [isSigning, setIsSigning] = useState(false)
  
  // 课程数据状态
  const [createdCourses, setCreatedCourses] = useState<CourseData[]>([])
  const [purchasedCourses, setPurchasedCourses] = useState<CourseData[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [activeTab, setActiveTab] = useState<'created' | 'purchased'>('created')
  const [error, setError] = useState<string | null>(null)
  
  // 统计数据
  const [stats, setStats] = useState({
    createdCount: 0,
    purchasedCount: 0,
    totalStudents: 0,
    totalRevenue: 0
  })

  // 从localStorage加载用户资料
  const loadUserProfile = () => {
    if (!address) return
    
    const key = `userProfile_${address.toLowerCase()}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const userProfile: UserProfile = JSON.parse(stored)
        
        // 验证签名
        const isValid = verifyProfileSignature(userProfile)
        if (isValid) {
          setProfileData({
            name: userProfile.name,
            bio: userProfile.bio,
            avatar: userProfile.avatar,
            email: userProfile.email
          })
        } else {
          console.warn('用户资料签名验证失败，使用默认资料')
          setDefaultProfile()
        }
      } catch (error) {
        console.error('解析用户资料失败:', error)
        setDefaultProfile()
      }
    } else {
      setDefaultProfile()
    }
  }
  
  // 设置默认资料
  const setDefaultProfile = () => {
    setProfileData({
      name: address ? `用户${address.slice(-4)}` : 'Web3学习者',
      bio: '对区块链技术和去中心化教育充满热情。',
      avatar: '',
      email: ''
    })
  }
  
  // 验证资料签名
  const verifyProfileSignature = (userProfile: UserProfile): boolean => {
    try {
      const recoveredAddress = ethers.verifyMessage(userProfile.message, userProfile.signature)
      return recoveredAddress.toLowerCase() === userProfile.address.toLowerCase()
    } catch (error) {
      console.error('签名验证失败:', error)
      return false
    }
  }
  
  // 生成签名消息
  const createProfileMessage = (profile: typeof profileData, address: string, timestamp: number): string => {
    return `更新用户资料确认\n\n用户名: ${profile.name}\n简介: ${profile.bio}\n邮箱: ${profile.email}\n地址: ${address}\n时间戳: ${timestamp}`
  }

  // 加载用户资料
  useEffect(() => {
    if (address) {
      loadUserProfile()
    }
  }, [address])

  // 加载我创建的课程 - 纯链上数据
  const loadCreatedCourses = async () => {
    if (!creatorCourseIds || !address) return

    try {
      const courses: CourseData[] = []
      for (const courseId of creatorCourseIds) {
        const localCourse = getCourse(courseId)
        if (localCourse) {
          // 只使用链上统计数据，不使用模拟数据
          try {
            const stats = await getCourseStats(courseId)
            if (stats) {
              const onChainData = {
                enrollmentCount: parseInt(stats.studentCount || '0'),
                totalRevenue: stats.totalRevenue || '0',
                isActive: true
              }

              courses.push({
                ...localCourse,
                isPurchased: false,
                isCreated: true,
                onChainData
              })
            } else {
              // 如果链上数据获取失败，只添加基础课程信息，不添加统计数据
              console.warn(`课程 ${courseId} 链上统计数据不可用`)
              courses.push({
                ...localCourse,
                isPurchased: false,
                isCreated: true,
                onChainData: {
                  enrollmentCount: 0,
                  totalRevenue: '0',
                  isActive: false
                }
              })
            }
          } catch (err) {
            console.error(`获取课程 ${courseId} 链上数据失败:`, err)
            // 链上数据获取失败时，仍添加课程但标记为不可用
            courses.push({
              ...localCourse,
              isPurchased: false,
              isCreated: true,
              onChainData: {
                enrollmentCount: 0,
                totalRevenue: '0',
                isActive: false
              }
            })
          }
        }
      }

      setCreatedCourses(courses)
      
      // 使用新的getAuthorStats来获取总体统计
      try {
        const authorStats = await getAuthorStats(address)
        if (authorStats) {
          setStats(prev => ({
            ...prev,
            createdCount: authorStats.courseCount,
            totalStudents: authorStats.totalStudents,
            totalRevenue: parseFloat(authorStats.totalRevenue)
          }))
        } else {
          // 如果链上统计获取失败，使用课程数组的长度
          setStats(prev => ({
            ...prev,
            createdCount: courses.length,
            totalStudents: 0,
            totalRevenue: 0
          }))
        }
      } catch (err) {
        console.error('获取作者总体统计失败:', err)
        setStats(prev => ({
          ...prev,
          createdCount: courses.length,
          totalStudents: 0,
          totalRevenue: 0
        }))
      }
    } catch (error) {
      console.error('加载创建的课程失败:', error)
      setError('获取创建的课程数据失败，请检查网络连接或稍后重试')
    }
  }

  // 加载我购买的课程 - 纯链上数据
  const loadPurchasedCourses = async () => {
    if (!purchasedCourseIds || !address) return

    try {
      const courses: CourseData[] = []

      for (const courseId of purchasedCourseIds) {
        // 跳过我自己创建的课程
        if (creatorCourseIds?.includes(courseId)) continue
        
        const localCourse = getCourse(courseId)
        if (localCourse) {
          // 对于购买的课程，我们主要关心课程本身的信息
          // 可以考虑从链上获取学习进度等信息（如果合约支持）
          courses.push({
            ...localCourse,
            isPurchased: true,
            isCreated: false
          })
        } else {
          // 如果本地没有课程信息，说明数据不完整
          console.warn(`购买的课程 ${courseId} 在本地存储中不存在`)
        }
      }

      setPurchasedCourses(courses)
      setStats(prev => ({
        ...prev,
        purchasedCount: courses.length
      }))
    } catch (error) {
      console.error('加载购买的课程失败:', error)
      setError('获取购买的课程数据失败，请检查网络连接或稍后重试')
    }
  }

  // 加载所有课程数据
  useEffect(() => {
    const loadAllCourses = async () => {
      if (!isConnected || !address) return

      setIsLoadingCourses(true)
      setError(null)
      
      try {
        await Promise.all([
          loadCreatedCourses(),
          loadPurchasedCourses()
        ])
      } catch (error) {
        console.error('加载课程数据失败:', error)
        setError('加载课程数据失败，请稍后重试')
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

  // 重新加载数据
  const handleRefresh = () => {
    if (!isConnected || !address) return
    setIsLoadingCourses(true)
    setError(null)
    
    Promise.all([
      loadCreatedCourses(),
      loadPurchasedCourses()
    ]).finally(() => {
      setIsLoadingCourses(false)
    })
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p>请先连接您的钱包以查看个人资料和链上课程数据。</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!address) {
      alert('请先连接钱包')
      return
    }
    
    // 检查必填字段
    if (!profileData.name.trim()) {
      alert('请输入用户名')
      return
    }
    
    setIsSigning(true)
    
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        const timestamp = Date.now()
        const message = createProfileMessage(profileData, address, timestamp)
        
        // 请求用户签名
        const signature = await signer.signMessage(message)
        
        // 创建完整的用户资料对象
        const userProfile: UserProfile = {
          name: profileData.name.trim(),
          bio: profileData.bio.trim(),
          avatar: profileData.avatar,
          email: profileData.email.trim(),
          address: address,
          signature: signature,
          message: message,
          timestamp: timestamp
        }
        
        // 保存到localStorage
        const key = `userProfile_${address.toLowerCase()}`
        localStorage.setItem(key, JSON.stringify(userProfile))
        
        console.log('✅ 用户资料签名并保存成功')
        setIsEditing(false)
        
        // 显示成功消息
        alert('个人资料更新成功！')
      }
    } catch (error) {
      console.error('保存用户资料失败:', error)
      if (error instanceof Error) {
        if (error.message.includes('User denied')) {
          alert('签名被取消，资料未保存')
        } else {
          alert('保存失败，请重试')
        }
      } else {
        alert('保存失败，请重试')
      }
    } finally {
      setIsSigning(false)
    }
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
              {course.price} YD
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
          <div className="flex items-center space-x-2">
            {!course.onChainData.isActive && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                链上数据不可用
              </span>
            )}
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              我创建的
            </span>
          </div>
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
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="text-2xl font-bold bg-transparent border-b-2 border-white text-white placeholder-gray-200 w-full"
                        placeholder="请输入用户名"
                        maxLength={50}
                      />
                      <p className="text-xs opacity-75">修改后需要MetaMask签名验证</p>
                    </div>
                  ) : (
                    <h1 className="text-2xl font-bold">{profileData.name || '未设置用户名'}</h1>
                  )}
                  <p className="opacity-90">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSigning}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>签名中...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? '保存' : '编辑'}</span>
                  </>
                )}
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
                    <div className="space-y-2">
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md resize-none"
                        rows={3}
                        placeholder="介绍一下自己..."
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500">{profileData.bio.length}/200 字符</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">{profileData.bio || '这个人很懒，什么都没留下...'}</p>
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
                      placeholder="your@email.com"
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.email || '未设置邮箱'}</p>
                  )}
                </div>

                {/* 签名状态提示 */}
                {isEditing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800 mb-1">MetaMask签名验证</h4>
                        <p className="text-sm text-blue-600">
                          保存个人资料需要通过MetaMask签名验证身份。签名不会消耗任何费用，只是用于验证您的身份。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 我的课程部分 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">我的课程</h3>
                    <div className="flex items-center space-x-2">
                      {isLoadingCourses && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                      <button
                        onClick={handleRefresh}
                        disabled={isLoadingCourses}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 disabled:opacity-50"
                      >
                        刷新链上数据
                      </button>
                    </div>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 text-sm">{error}</span>
                      <button
                        onClick={handleRefresh}
                        className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
                      >
                        重试
                      </button>
                    </div>
                  )}
                  
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
                        <p className="text-gray-600">正在从区块链加载课程数据...</p>
                        <p className="text-sm text-gray-500 mt-1">这可能需要几秒钟</p>
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
                                <p>您还没有在区块链上创建任何课程</p>
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
                                <p>您还没有在区块链上购买任何课程</p>
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

              {/* 统计侧边栏 - 仅显示链上真实数据 */}
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
                  <p className="text-xs text-gray-500 mt-1">链上数据</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">学生总数</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500 mt-1">链上统计</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">总收入</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalRevenue.toFixed(3)} YD
                  </p>
                  <p className="text-xs text-gray-500 mt-1">链上收入</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">购买课程</h3>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.purchasedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">链上记录</p>
                </div>

                {/* 链上数据状态指示 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium text-sm">区块链数据</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    所有数据均来自区块链智能合约，确保透明和准确性
                  </p>
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