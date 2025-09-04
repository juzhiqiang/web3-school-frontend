import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useYiDengToken } from '../../hooks/useYiDengToken';
import type { CreateCourseFormData, CourseLesson } from '../../types/course';
import { 
  formatYiDengAmount, 
  validateYiDengAmount, 
  calculatePlatformFee, 
  calculateCreatorRevenue,
  YIDENG_TOKEN_CONFIG 
} from '../../config/yidengToken';
import RichTextEditor from '../../components/common/RichTextEditor';
import LessonManager from '../../components/common/LessonManager';
import TagInput from '../../components/common/TagInput';
import { 
  Save, Eye, AlertCircle, BookOpen, DollarSign, 
  Users, Clock, Star, Coins, Wallet, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';

function CreateCourse() {
  const { isConnected, address, ydBalance } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCourseFormData>({
    title: '',
    description: '',
    detailedDescription: '',
    price: YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.DEFAULT_PRICE,
    duration: '',
    lessons: [],
    tags: []
  });

  const [thumbnail, setThumbnail] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  const totalSteps = 4;

  const handleInputChange = (field: keyof CreateCourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 实时验证价格
    if (field === 'price') {
      const validation = validateYiDengAmount(value);
      setPriceError(validation.error || '');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.price && !priceError);
      case 2:
        return !!formData.detailedDescription;
      case 3:
        return formData.lessons.length > 0;
      case 4:
        return true;
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
      // 创建课程数据，包含创建者地址
      const courseData = {
        ...formData,
        instructorAddress: address,
        platformFee: calculatePlatformFee(formData.price),
        creatorRevenue: calculateCreatorRevenue(formData.price),
      };

      console.log('创建课程:', courseData);
      
      // TODO: 集成智能合约创建课程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('课程创建成功！');
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        detailedDescription: '',
        price: YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.DEFAULT_PRICE,
        duration: '',
        lessons: [],
        tags: []
      });
      setCurrentStep(1);
      setThumbnail('');
      setPriceError('');
      
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

  const renderTokenBalanceCard = () => (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Coins className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">一灯币余额</h3>
            <p className="text-sm text-gray-600">用于课程定价和购买</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-600">
            {ydBalance ? formatYiDengAmount(ydBalance) : '0'} YD
          </p>
          <p className="text-xs text-gray-500">当前余额</p>
        </div>
      </div>
    </div>
  );

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

            {renderTokenBalanceCard()}

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
                  课程价格 (一灯币) *
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                  <input
                    type="number"
                    step="1"
                    min={YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MIN_PRICE}
                    max={YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MAX_PRICE}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      priceError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="100"
                    required
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">YD</div>
                </div>
                
                {priceError && (
                  <p className="text-xs text-red-600 mt-1">{priceError}</p>
                )}
                
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>• 平台手续费: {calculatePlatformFee(formData.price || '0')} YD (2.5%)</p>
                  <p>• 您的收益: {calculateCreatorRevenue(formData.price || '0')} YD</p>
                  <p>• 价格范围: {YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MIN_PRICE} - {formatYiDengAmount(YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MAX_PRICE)} YD</p>
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

            {/* 一灯币支付说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">关于一灯币支付</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    学员将使用一灯币(YD)购买您的课程。平台收取2.5%手续费，其余收益归您所有。
                  </p>
                </div>
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
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      {formatYiDengAmount(formData.price)} YD
                    </span>
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

              {/* Revenue Breakdown */}
              <div className="px-6 py-4 bg-orange-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">收益分配</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">课程价格</p>
                    <p className="font-semibold text-lg text-orange-600">
                      {formatYiDengAmount(formData.price)} YD
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">平台手续费 (2.5%)</p>
                    <p className="font-semibold text-lg text-gray-500">
                      -{calculatePlatformFee(formData.price)} YD
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">您的收益</p>
                    <p className="font-semibold text-lg text-green-600">
                      {calculateCreatorRevenue(formData.price)} YD
                    </p>
                  </div>
                </div>
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
          <div className={`${formData.price && !priceError ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 价格设置: {formData.price && !priceError ? `${formatYiDengAmount(formData.price)} YD` : '待设置'}
          </div>
          <div className={`${formData.detailedDescription ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 详细描述: {formData.detailedDescription ? '已完成' : '待完成'}
          </div>
          <div className={`${formData.lessons.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 章节内容: {formData.lessons.length > 0 ? `${formData.lessons.length}个章节` : '待添加'}
          </div>
        </div>
      </div>

      {/* Token Balance Warning */}
      {ydBalance && parseFloat(ydBalance) === 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Wallet className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">一灯币余额不足</h4>
              <p className="text-sm text-yellow-700">
                您当前的一灯币余额为0。虽然创建课程免费，但学员需要一灯币来购买您的课程。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;
