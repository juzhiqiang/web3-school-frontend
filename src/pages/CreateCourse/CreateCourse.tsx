import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, X, Upload, AlertCircle, CheckCircle, Coins, Image, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCourseContract } from '../../hooks/useCourseContract';
import { YIDENG_REWARDS } from '../../config/contract';
import { COURSE_CONTRACT_CONFIG } from '../../config/courseContract';
import { saveCourse } from '../../utils/courseStorage';
import { validateYiDengAmount } from '../../config/yidengToken';
import { recordCreateCourseReward } from '../../utils/rewardStorage';
import ContractFundingWarning from '../../components/ContractFundingWarning/ContractFundingWarning';
import { useRewardTracking } from '../../hooks/useRewardTracking';

// 直接定义类型以避免导入问题
interface CourseLesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

interface CreateCourseFormData {
  title: string;
  description: string;
  detailedDescription: string;
  price: string;
  duration: string;
  lessons: CourseLesson[];
  tags: string[];
  thumbnailFile?: File;
  thumbnailPreview?: string;
}

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
    navigate(`/course/${courseId}`);
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
              查看课程详情
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
  const publicClient = usePublicClient();
  const { createCourse, isCreating, createError, isCreateSuccess } = useCourseContract();
  const { contractTokenBalance } = useRewardTracking();

  // 表单状态
  const [formData, setFormData] = useState<CreateCourseFormData>({
    title: '',
    description: '',
    detailedDescription: '',
    price: '',
    duration: '',
    lessons: [],
    tags: [],
    thumbnailFile: undefined,
    thumbnailPreview: undefined,
  });

  // UI状态
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState<string>();
  const [actualRewardAmount, setActualRewardAmount] = useState<string>(); // 存储实际奖励金额

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
      id: uuidv4(),
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

  // 处理封面图上传
  const handleThumbnailUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 文件类型验证
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('请选择 JPG、PNG 或 WebP 格式的图片');
        return;
      }

      // 文件大小验证 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('图片大小不能超过 5MB');
        return;
      }

      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: previewUrl
      }));

      toast.success('封面图片上传成功');
    }
  }, []);

  // 移除封面图
  const removeThumbnail = useCallback(() => {
    // 释放之前的预览URL
    if (formData.thumbnailPreview) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }

    setFormData(prev => ({
      ...prev,
      thumbnailFile: undefined,
      thumbnailPreview: undefined
    }));

    toast.success('已移除封面图片');
  }, [formData.thumbnailPreview]);

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
    // 验证一灯币价格
    const priceValidation = validateYiDengAmount(formData.price);
    if (!priceValidation.isValid) {
      toast.error(priceValidation.error || '请输入有效的课程价格');
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
      // 生成UUID作为课程ID
      const courseId = uuidv4();
      
      // 处理封面图
      let thumbnailHash = '';
      if (formData.thumbnailFile) {
        // 这里应该上传到 IPFS 或其他存储服务
        // 为演示目的，我们使用 base64 编码存储在本地
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = () => {
            console.log('reader',reader)
            thumbnailHash = reader.result as string;
            resolve(null);
          };
          reader.readAsDataURL(formData.thumbnailFile);
        });
      }
      
      // 准备课程数据
      const courseData = {
        ...formData,
        id: courseId,
        instructorAddress: address,
        createdAt: new Date(),
         thumbnailHash: thumbnailHash
      };
      
      // 使用工具类保存到localStorage
      saveCourse(courseData);
      
      // 设置课程ID，用于成功后显示
      setCreatedCourseId(courseId);
      
      // 将UUID提供给合约进行创建，不等待结果
      await createCourse({ ...formData, courseId });
      
    } catch (error) {
      // 错误处理在useCourseContract中已经处理
    }
  }, [isConnected, validateForm, formData, createCourse, address]);

  // 检查特定课程的奖励状态
  const checkCourseRewardStatus = useCallback(async (courseId: string, creatorAddress: string) => {
    if (!courseId || !creatorAddress || !publicClient) return null;

    try {
      console.log(`🔍 开始查询课程 ${courseId} 的奖励状态...`);
      
      const contractAddress = COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS as `0x${string}`;
      
      // 获取创建课程奖励事件 (CoursePublishReward)
      const createCourseRewardLogs = await publicClient.getLogs({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'CoursePublishReward',
          inputs: [
            { type: 'address', name: 'instructor', indexed: true },
            { type: 'string', name: 'uuid', indexed: true },
            { type: 'uint256', name: 'rewardAmount', indexed: false }
          ]
        },
        args: {
          instructor: creatorAddress as `0x${string}`,
          uuid: courseId
        },
        fromBlock: 0n,
        toBlock: 'latest'
      });

      console.log(`📊 找到 ${createCourseRewardLogs.length} 个匹配的CoursePublishReward事件`);
      
      // 打印所有事件的详细信息用于调试
      createCourseRewardLogs.forEach((log, index) => {
        if (log.args) {
          const { instructor, uuid, rewardAmount } = log.args;
          console.log(`事件 ${index + 1}:`, {
            instructor: instructor,
            uuid: uuid,
            rewardAmount: rewardAmount?.toString(),
            transactionHash: log.transactionHash,
            blockNumber: Number(log.blockNumber)
          });
        }
      });

      // 查找最新的匹配奖励事件
      if (createCourseRewardLogs.length > 0) {
        const latestLog = createCourseRewardLogs[createCourseRewardLogs.length - 1];
        const { instructor, uuid, rewardAmount } = latestLog.args;

        console.log('🎉 找到匹配的奖励事件!', {
          instructor,
          uuid,
          rewardAmount: rewardAmount?.toString(),
          transactionHash: latestLog.transactionHash,
          blockNumber: Number(latestLog.blockNumber)
        });

        return {
          instructor: instructor as string,
          uuid: uuid as string,
          rewardAmount: rewardAmount?.toString() || '0',
          transactionHash: latestLog.transactionHash,
          blockNumber: Number(latestLog.blockNumber)
        };
      } else {
        console.log('⚠️ 未找到匹配的奖励事件');
        return null;
      }
    } catch (error) {
      console.error('❌ 查询奖励状态失败:', error);
      return null;
    }
  }, [publicClient]);
  // 监听创建课程成功和奖励发放
  useEffect(() => {
    if (isCreateSuccess && createdCourseId && address) {
      console.log('🎉 课程创建成功，开始检查奖励状态...');
      
      // 首次快速检查（2秒后）
      setTimeout(async () => {
        const rewardStatus = await checkCourseRewardStatus(createdCourseId, address);
        
        if (rewardStatus) {
          console.log('✅ 首次检查：找到奖励');
          setActualRewardAmount(rewardStatus.rewardAmount); // 设置实际奖励金额
          toast.success(`课程创建成功！获得 ${rewardStatus.rewardAmount} 一灯币奖励！`);
          setShowSuccessModal(true);
          recordCreateCourseReward(address, createdCourseId);
          return; // 找到奖励，不需要继续等待
        } else {
          console.log('⏳ 首次检查：暂未找到奖励，继续等待...');
        }
      }, 2000);
      
      // 第二次检查（5秒后）
      setTimeout(async () => {
        const rewardStatus = await checkCourseRewardStatus(createdCourseId, address);
        
        if (rewardStatus) {
          console.log('✅ 第二次检查：找到奖励');
          setActualRewardAmount(rewardStatus.rewardAmount); // 设置实际奖励金额
          toast.success(`课程创建成功！获得 ${rewardStatus.rewardAmount} 一灯币奖励！`);
          setShowSuccessModal(true);
          recordCreateCourseReward(address, createdCourseId);
          return; // 找到奖励，不需要继续等待
        } else {
          console.log('⏳ 第二次检查：仍未找到奖励，继续等待...');
        }
      }, 5000);

      // 最终检查（10秒后）
      setTimeout(async () => {
        const rewardStatus = await checkCourseRewardStatus(createdCourseId, address);
        
        if (rewardStatus) {
          console.log('✅ 最终检查：找到奖励');
          setActualRewardAmount(rewardStatus.rewardAmount); // 设置实际奖励金额
          toast.success(`课程创建成功！获得 ${rewardStatus.rewardAmount} 一灯币奖励！`);
          setShowSuccessModal(true);
          recordCreateCourseReward(address, createdCourseId);
        } else {
          console.log('❌ 最终检查：未找到奖励');
          // 分析可能的原因
          let errorMessage = '但是奖励发放失败';
          
          if (parseFloat(contractTokenBalance) < parseFloat(YIDENG_REWARDS.CREATE_COURSE)) {
            errorMessage = `但是奖励发放失败：合约余额不足（当前 ${contractTokenBalance} YD，需要 ${YIDENG_REWARDS.CREATE_COURSE} YD）`;
          } else {
            errorMessage = '但是奖励发放失败：可能是合约权限问题或网络延迟';
          }
          
          toast.success('课程创建成功！');
          toast.error(errorMessage);
          setShowSuccessModal(true);
        }
      }, 10000); // 10秒后最终检查

      // 重置表单
      // 释放之前的预览URL
      if (formData.thumbnailPreview) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
      
      setFormData({
        title: '',
        description: '',
        detailedDescription: '',
        price: '',
        duration: '',
        lessons: [],
        tags: [],
        thumbnailFile: undefined,
        thumbnailPreview: undefined,
      });
    }
  }, [isCreateSuccess, createdCourseId, address, contractTokenBalance, checkCourseRewardStatus, formData.thumbnailPreview]);

  // 组件卸载时清理预览URL
  useEffect(() => {
    return () => {
      if (formData.thumbnailPreview) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
    };
  }, [formData.thumbnailPreview]);

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

          {/* 合约资金警告 */}
          <div className="px-6 pt-6">
            <ContractFundingWarning />
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
                  课程价格 (一灯币) *
                </label>
                <input
                  type="number"
                  id="price"
                  step="1"
                  min="1"
                  max="10000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
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

            {/* 课程封面图 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程封面图
              </label>
              
              {/* 如果没有上传图片，显示上传区域 */}
              {!formData.thumbnailPreview ? (
                <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label 
                    htmlFor="thumbnail-upload" 
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        点击上传封面图
                      </span>
                      <span className="text-gray-500"> 或拖拽图片到此处</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      支持 JPG、PNG、WebP 格式，建议尺寸 800x450，大小不超过 5MB
                    </p>
                  </label>
                </div>
              ) : (
                /* 显示图片预览 */
                <div className="relative inline-block">
                  <div className="relative group">
                    <img
                      src={formData.thumbnailPreview}
                      alt="课程封面预览"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex space-x-2">
                        <label 
                          htmlFor="thumbnail-upload" 
                          className="bg-white text-gray-700 px-3 py-1 rounded text-sm cursor-pointer hover:bg-gray-100"
                        >
                          <Image className="w-4 h-4 inline mr-1" />
                          更换
                        </label>
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p>文件名: {formData.thumbnailFile?.name}</p>
                    <p>大小: {formData.thumbnailFile ? (formData.thumbnailFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</p>
                  </div>
                </div>
              )}
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
        rewardAmount={actualRewardAmount || YIDENG_REWARDS.CREATE_COURSE}
      />
    </div>
  );
};

export default CreateCourse;