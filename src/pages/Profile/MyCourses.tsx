import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useCourseContract } from '../../hooks/useCourseContract';
import type { Course } from '../../types/course';
import { formatYiDengAmount } from '../../config/yidengToken';
import { 
  BookOpen, Users, Clock, Coins, 
  Eye, Edit, Trash2, Plus, AlertCircle,
  TrendingUp, Calendar, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function MyCourses() {
  const { isConnected, address } = useWeb3();
  const { getMyCourses, isLoading } = useCourseContract();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载用户创建的课程
  const loadMyCourses = async () => {
    if (!isConnected || !address) {
      setLoadingCourses(false);
      return;
    }

    try {
      setLoadingCourses(true);
      const myCourses = await getMyCourses();
      setCourses(myCourses);
      setError(null);
    } catch (error) {
      console.error('加载我的课程失败:', error);
      setError('加载课程列表失败');
      toast.error('加载课程列表失败');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadMyCourses();
  }, [isConnected, address]);

  // 计算统计数据
  const stats = {
    totalCourses: courses.length,
    totalRevenue: courses.reduce((sum, course) => {
      return sum + parseFloat(course.price || '0');
    }, 0),
    totalStudents: courses.reduce((sum, course) => {
      return sum + (course.studentCount || 0);
    }, 0),
    averageRating: 4.5 // 模拟评分
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p className="text-gray-600">请先连接您的钱包以查看您创建的课程。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的课程</h1>
            <p className="text-gray-600">管理您创建的所有课程</p>
          </div>
          <button
            onClick={() => navigate('/create-course')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>创建新课程</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总课程数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总学员数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总收益</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatYiDengAmount(stats.totalRevenue)} YD
              </p>
            </div>
            <Coins className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均评分</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button
              onClick={loadMyCourses}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingCourses && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">加载课程列表中...</p>
        </div>
      )}

      {/* Courses List */}
      {!loadingCourses && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">还没有创建课程</h3>
              <p className="text-gray-600 mb-6">开始创建您的第一个课程，与学员分享知识</p>
              <button
                onClick={() => navigate('/create-course')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建第一个课程
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => navigate(`/edit-course/${course.id}`)}
                  onView={() => navigate(`/course/${course.id}`)}
                  onDelete={() => handleDeleteCourse(course.id!)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  function handleDeleteCourse(courseId: string) {
    // 实现删除课程逻辑
    toast.error('删除功能暂未实现');
  }
}

// 课程卡片组件
function CourseCard({ 
  course, 
  onEdit, 
  onView, 
  onDelete 
}: {
  course: Course;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Course Info */}
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              {/* Thumbnail placeholder */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      {formatYiDengAmount(course.price)} YD
                    </span>
                  </div>

                  {course.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons?.length || 0} 章节</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentCount || 0} 学员</span>
                  </div>

                  {course.createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(course.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{course.tags.length - 3} 更多
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onView}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="查看课程"
            >
              <Eye size={18} />
            </button>
            
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="编辑课程"
            >
              <Edit size={18} />
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除课程"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Revenue Info */}
        {course.totalRevenue && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>收益: {formatYiDengAmount(course.totalRevenue)} YD</span>
                </div>
                
                {course.platformFee && (
                  <div className="text-gray-500">
                    平台费: {formatYiDengAmount(course.platformFee)} YD
                  </div>
                )}
              </div>
              
              <div className="text-gray-600">
                上链地址: {course.instructorAddress?.slice(0, 6)}...{course.instructorAddress?.slice(-4)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;