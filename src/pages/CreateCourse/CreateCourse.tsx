import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import type { CreateCourseFormData, CourseLesson } from '../../types/course';
import RichTextEditor from '../../components/common/RichTextEditor';
import LessonManager from '../../components/common/LessonManager';
import TagInput from '../../components/common/TagInput';
import { Save, Eye, Upload, AlertCircle, BookOpen, DollarSign, Users, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

function CreateCourse() {
  const { isConnected } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCourseFormData>({
    title: '',
    description: '',
    detailedDescription: '',
    price: '',
    duration: '',
    lessons: [],
    tags: []
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>('');

  const totalSteps = 4;

  const handleInputChange = (field: keyof CreateCourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.price);
      case 2:
        return !!formData.detailedDescription;
      case 3:
        return formData.lessons.length > 0;
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('请完整填写当前步骤的必填信息');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('请完整填写所有必填信息');
      return;
    }

    setIsLoading(true);
    try {
      // 这里添加实际的课程创建逻辑
      console.log('创建课程:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('课程创建成功！');
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        detailedDescription: '',
        price: '',
        duration: '',
        lessons: [],
        tags: []
      });
      setCurrentStep(1);
      setThumbnail('');
      
    } catch (error) {
      console.error('创建课程失败:', error);
      toast.error('创建课程失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p className="text-gray-600">请先连接您的钱包以创建课程。</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
              <p className="text-gray-600">设置您课程的基础信息</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：Web3开发入门课程"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程简介 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="简要描述您的课程内容、学习目标和适用人群..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程价格 (ETH) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预计时长
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例：10小时"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程缩略图
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      支持 JPG、PNG、GIF 格式，最大 5MB
                    </p>
                  </div>
                  {thumbnail && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={thumbnail} 
                        alt="预览" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程标签
                </label>
                <TagInput
                  tags={formData.tags}
                  onTagsChange={(tags) => handleInputChange('tags', tags)}
                  placeholder="添加相关标签..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Star className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">详细介绍</h2>
              <p className="text-gray-600">使用富文本编辑器详细描述您的课程</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程详细描述 *
              </label>
              <RichTextEditor
                value={formData.detailedDescription}
                onChange={(value) => handleInputChange('detailedDescription', value)}
                placeholder="请详细描述课程内容、学习目标、适用人群、先修要求等..."
                className="min-h-[300px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                支持富文本格式，可以添加标题、列表、粗体、斜体等格式
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">课程章节</h2>
              <p className="text-gray-600">添加课程的具体章节和视频内容</p>
            </div>

            <LessonManager
              lessons={formData.lessons}
              onLessonsChange={(lessons) => handleInputChange('lessons', lessons)}
            />

            {formData.lessons.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">还没有添加章节</p>
                <p className="text-gray-400 text-sm">请添加至少一个章节来继续</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">预览与确认</h2>
              <p className="text-gray-600">检查您的课程信息并确认发布</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                {thumbnail && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={thumbnail} 
                      alt={formData.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.title}
                </h1>
                
                <p className="text-gray-600 mb-4">
                  {formData.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <DollarSign size={16} />
                    <span>{formData.price} ETH</span>
                  </div>
                  
                  {formData.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formData.duration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>{formData.lessons.length} 章节</span>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-6">
                {/* Detailed Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">课程详情</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.detailedDescription }}
                  />
                </div>

                {/* Lessons */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">课程章节</h3>
                  <div className="space-y-3">
                    {formData.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.duration && (
                              <span className="text-sm text-gray-500">
                                ({lesson.duration})
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-8">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : isCompleted
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`h-0.5 w-12 transition-all ${
                  stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const stepTitles = [
    '基本信息',
    '详细描述', 
    '课程章节',
    '预览确认'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新课程</h1>
        <p className="text-gray-600">
          步骤 {currentStep} / {totalSteps}: {stepTitles[currentStep - 1]}
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一步
            </button>

            <div className="flex space-x-3">
              {currentStep === totalSteps ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !validateStep(currentStep)}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>创建中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>发布课程</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  下一步
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">进度摘要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className={`${formData.title ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 课程名称: {formData.title ? '已填写' : '待填写'}
          </div>
          <div className={`${formData.price ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 价格设置: {formData.price ? `${formData.price} ETH` : '待设置'}
          </div>
          <div className={`${formData.detailedDescription ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 详细描述: {formData.detailedDescription ? '已完成' : '待完成'}
          </div>
          <div className={`${formData.lessons.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 章节内容: {formData.lessons.length > 0 ? `${formData.lessons.length}个章节` : '待添加'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
