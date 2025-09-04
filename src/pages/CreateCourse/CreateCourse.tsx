import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { PlusCircle, X, Upload, AlertCircle, CheckCircle, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCourseContract, CreateCourseFormData, CourseLesson } from '../../hooks/useCourseContract';
import { YIDENG_REWARDS } from '../../config/contract';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  rewardAmount?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, courseId, rewardAmount = YIDENG_REWARDS.CREATE_COURSE }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToMyCourses = () => {
    navigate('/profile/courses');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            课程创建成功！
          </h3>
          
          <div className="mb-4 space-y-2">
            {courseId && (
              <p className="text-sm text-gray-600">
                课程ID: <span className="font-mono text-blue-600">#{courseId}</span>
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-orange-600 bg-orange-50 rounded-lg p-3">
              <Coins className="h-5 w-5" />
              <span className="font-medium">恭喜获得 {rewardAmount} 一灯币奖励！</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            您的课程已成功上链并发布到平台。学员现在可以购买和学习您的课程了。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoToMyCourses}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              查看我的课程
            </button>
            <button
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              继续创建
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createCourse, isCreating, createError } = useCourseContract();

  // 表单状态
  const [formData, setFormData] = useState<CreateCourseFormData>({
    title: '',
    description: '',
    detailedDescription: '',
    price: '',
    duration: '',
    lessons: [],
    tags: [],
  });

  // UI状态
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState<string>();

  // 处理表单输入
  const handleInputChange = useCallback((field: keyof CreateCourseFormData, value: string | string[] | CourseLesson[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 添加课程
  const addLesson = useCallback(() => {
    const newLesson: CourseLesson = {
      id: Date.now().toString(),
      title: '',
      videoUrl: '',
      duration: '',
      description: '',
    };
    
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
  }, []);

  // 更新课程
  const updateLesson = useCallback((index: number, field: keyof CourseLesson, value: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }));
  }, []);

  // 删除课程
  const removeLesson = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  }, []);

  // 添加标签
  const addTag = useCallback(() => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  }, [currentTag, formData.tags]);

  // 删除标签
  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 表单验证
  const validateForm = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('请输入课程标题');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('请输入课程简介');
      return false;
    }
    if (!formData.detailedDescription.trim()) {
      toast.error('请输入课程详细描述');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('请输入有效的课程价格');
      return false;
    }
    if (!formData.duration.trim()) {
      toast.error('请输入课程时长');
      return false;
    }
    if (formData.lessons.length === 0) {
      toast.error('请至少添加一节课程');
      return false;
    }
    
    // 验证每个课程
    for (const lesson of formData.lessons) {
      if (!lesson.title.trim()) {
        toast.error('所有课程都需要标题');
        return false;
      }
      if (!lesson.videoUrl.trim()) {
        toast.error('所有课程都需要视频链接');
        return false;
      }
    }
    
    return true;
  }, [formData]);

  // 提交创建课程
  const handleSubmit = useCallback(async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await createCourse(formData);
      
      // 模拟课程创建成功
      const courseId = Date.now().toString();
      setCreatedCourseId(courseId);
      
      // 保存课程数据到本地存储
      const courseData = {
        ...formData,
        id: courseId,
        instructorAddress: address,
        createdAt: new Date(),
      };
      
      localStorage.setItem(`course_${courseId}`, JSON.stringify(courseData));
      
      toast.success('课程创建成功！获得一灯币奖励！');
      setShowSuccessModal(true);
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        detailedDescription: '',
        price: '',
        duration: '',
        lessons: [],
        tags: [],
      });
      
    } catch (error) {
      console.error('Create course failed:', error);
    }
  }, [isConnected, validateForm, formData, createCourse, address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">需要连接钱包</h3>
          <p className="text-gray-600 mb-4">请先连接您的钱包来创建课程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">创建新课程</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Coins className="h-4 w-4 text-orange-500" />
                <span>完成创建奖励 {YIDENG_REWARDS.CREATE_COURSE} 一灯币</span>
              </div>
            </div>
          </div>

          <form className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  课程标题 *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入课程标题..."
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  课程价格 (ETH) *
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.01"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  课程时长 *
                </label>
                <input
                  type="text"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：5小时30分钟"
                />
              </div>
            </div>

            {/* 课程描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                课程简介 *
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="简要描述课程内容..."
              />
            </div>

            <div>
              <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700">
                详细描述 *
              </label>
              <textarea
                id="detailedDescription"
                rows={6}
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="详细描述课程内容、学习目标、适合人群等..."
              />
            </div>

            {/* 课程标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="添加标签..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 课程列表 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  课程内容 *
                </label>
                <button
                  type="button"
                  onClick={addLesson}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  添加课程
                </button>
              </div>

              <div className="space-y-4">
                {formData.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">第 {index + 1} 课</h4>
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          课程标题 *
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="block w-full text-sm border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="课程标题..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          视频时长
                        </label>
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                          className="block w-full text-sm border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例：15分钟"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        视频链接 *
                      </label>
                      <input
                        type="url"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                        className="block w-full text-sm border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        课程描述
                      </label>
                      <textarea
                        rows={2}
                        value={lesson.description}
                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                        className="block w-full text-sm border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="课程内容描述..."
                      />
                    </div>
                  </div>
                ))}
                
                {formData.lessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>还没有添加课程内容</p>
                    <p className="text-sm">点击"添加课程"开始创建</p>
                  </div>
                )}
              </div>
            </div>

            {/* 错误显示 */}
            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">创建失败:</span>
                  <span>{createError}</span>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>创建中...</span>
                  </>
                ) : (
                  <span>创建课程</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 成功模态框 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        courseId={createdCourseId}
        rewardAmount={YIDENG_REWARDS.CREATE_COURSE}
      />
    </div>
  );
};

export default CreateCourse;