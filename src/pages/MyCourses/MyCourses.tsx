import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';
import { formatEther } from 'viem';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Calendar, 
  Eye, 
  Edit3, 
  BarChart3,
  PlusCircle,
  Coins,
  AlertCircle 
} from 'lucide-react';
import { Course } from '../../types/course';
import { useMyCoursesContract, useCourseContract } from '../../hooks/useCourseContract';

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { creatorCourseIds } = useMyCoursesContract();
  const { getCourse, getCourseStats } = useCourseContract();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStats, setCourseStats] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState('0');
  const [totalStudents, setTotalStudents] = useState(0);

  // 加载我的课程数据
  useEffect(() => {
    const loadMyCourses = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        const loadedCourses: Course[] = [];
        const stats = new Map();
        let earnings = 0;
        let students = 0;

        // 从本地存储加载课程（实际应用中应该从区块链或后端加载）
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('course_')) {
            const courseData = JSON.parse(localStorage.getItem(key) || '{}');
            if (courseData.instructorAddress === address) {
              loadedCourses.push(courseData);
              
              // 获取课程统计（这里模拟数据）
              const courseStats = await getCourseStats(courseData.id);
              if (courseStats) {
                stats.set(courseData.id, courseStats);
                earnings += parseFloat(courseStats.totalRevenue);
                students += parseInt(courseStats.studentCount);
              } else {
                // 模拟统计数据
                const mockStats = {
                  totalSales: Math.floor(Math.random() * 50).toString(),
                  totalRevenue: (Math.random() * 5).toFixed(3),
                  studentCount: Math.floor(Math.random() * 100).toString(),
                };
                stats.set(courseData.id, mockStats);
                earnings += parseFloat(mockStats.totalRevenue);
                students += parseInt(mockStats.studentCount);
              }
            }
          }
        }

        setCourses(loadedCourses);
        setCourseStats(stats);
        setTotalEarnings(earnings.toFixed(3));
        setTotalStudents(students);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyCourses();
  }, [address, getCourseStats]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">需要连接钱包</h3>
          <p className="text-gray-600">请先连接您的钱包来查看您的课程</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的课程</h1>
            <p className="text-gray-600 mt-2">管理和查看您发布的所有课程</p>
          </div>
          <Link
            to="/create-course"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            创建新课程
          </Link>
        </div>

        {/* 统计概览 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">概览统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">发布课程</p>
                  <p className="text-2xl font-bold text-blue-900">{courses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">总学员数</p>
                  <p className="text-2xl font-bold text-green-900">{totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">总收益 (ETH)</p>
                  <p className="text-2xl font-bold text-yellow-900">{totalEarnings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有发布课程</h3>
            <p className="text-gray-600 mb-6">
              开始创建您的第一个课程，分享知识并获得收益。
            </p>
            <Link
              to="/create-course"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              创建第一个课程
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const stats = courseStats.get(course.id!);
              
              return (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* 课程缩略图 */}
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  
                  {/* 课程信息 */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {course.price} ETH
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    {/* 课程标签 */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{course.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* 统计数据 */}
                    <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">学员</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {stats?.studentCount || '0'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">收益 (ETH)</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {stats?.totalRevenue || '0'}
                        </p>
                      </div>
                    </div>
                    
                    {/* 发布日期 */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>发布于 {formatDate(course.createdAt!)}</span>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </button>
                      <button
                        onClick={() => navigate(`/course/${course.id}/analytics`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        统计
                      </button>
                      <button
                        onClick={() => navigate(`/course/${course.id}/edit`)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 页面底部提示 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">创建更多课程，获得更多奖励！</h3>
              <p className="text-blue-700 mt-1">
                每创建一个课程可获得 10 一灯币奖励，课程被购买后还能获得持续收益。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;