import { useState } from 'react';
import type { CreateCourseFormData, Course } from '../types/courseTypes';
import toast from 'react-hot-toast';

interface UseCourseCreationResult {
  isSubmitting: boolean;
  submitCourse: (data: CreateCourseFormData) => Promise<boolean>;
  validateCourseData: (data: CreateCourseFormData) => { isValid: boolean; errors: string[] };
  estimateGasCost: (data: CreateCourseFormData) => Promise<string>;
}

export const useCourseCreation = (): UseCourseCreationResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCourseData = (data: CreateCourseFormData) => {
    const errors: string[] = [];

    // Basic validation
    if (!data.title.trim()) {
      errors.push('课程标题不能为空');
    }

    if (!data.description.trim()) {
      errors.push('课程简介不能为空');
    }

    if (!data.detailedDescription.trim()) {
      errors.push('课程详细描述不能为空');
    }

    // Price validation
    const price = parseFloat(data.price);
    if (!data.price || isNaN(price) || price <= 0) {
      errors.push('请输入有效的课程价格');
    }

    if (price > 10) {
      errors.push('课程价格不能超过10 ETH');
    }

    // Lessons validation
    if (data.lessons.length === 0) {
      errors.push('至少需要添加一个课程章节');
    }

    // Validate each lesson
    data.lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) {
        errors.push(`第${index + 1}节课程标题不能为空`);
      }

      if (!lesson.videoUrl.trim()) {
        errors.push(`第${index + 1}节视频地址不能为空`);
      }

      // Basic URL validation
      try {
        new URL(lesson.videoUrl);
      } catch {
        errors.push(`第${index + 1}节视频地址格式无效`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const estimateGasCost = async (data: CreateCourseFormData): Promise<string> => {
    // This would integrate with your smart contract to estimate gas costs
    // For now, return a mock estimate
    const baseGas = 150000; // Base gas for course creation
    const lessonGas = data.lessons.length * 50000; // Additional gas per lesson
    const totalGas = baseGas + lessonGas;
    
    // Mock gas price (in Gwei)
    const gasPrice = 20;
    const estimatedCost = (totalGas * gasPrice) / 1e9; // Convert to ETH
    
    return estimatedCost.toFixed(6);
  };

  const submitCourse = async (data: CreateCourseFormData): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Validate data
      const validation = validateCourseData(data);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return false;
      }

      // Estimate gas cost
      const gasCost = await estimateGasCost(data);
      console.log(`Estimated gas cost: ${gasCost} ETH`);

      // Create course object
      const courseData: Course = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        detailedDescription: data.detailedDescription,
        price: data.price,
        duration: data.duration,
        lessons: data.lessons,
        tags: data.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Integrate with smart contract
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // const tx = await contract.createCourse(
      //   courseData.title,
      //   courseData.description,
      //   ethers.utils.parseEther(courseData.price),
      //   JSON.stringify({
      //     detailedDescription: courseData.detailedDescription,
      //     lessons: courseData.lessons,
      //     tags: courseData.tags
      //   })
      // );
      // await tx.wait();

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Course created successfully:', courseData);
      toast.success('课程创建成功！');
      
      return true;
    } catch (error) {
      console.error('Failed to create course:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          toast.error('用户取消了交易');
        } else if (error.message.includes('insufficient funds')) {
          toast.error('余额不足以支付交易费用');
        } else {
          toast.error(`创建课程失败: ${error.message}`);
        }
      } else {
        toast.error('创建课程失败，请重试');
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitCourse,
    validateCourseData,
    estimateGasCost
  };
};

export default useCourseCreation;
