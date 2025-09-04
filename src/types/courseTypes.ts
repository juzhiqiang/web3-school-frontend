// 课程相关的类型定义

export interface CourseLesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  detailedDescription: string;
  price: string;
  duration: string;
  lessons: CourseLesson[];
  instructor?: string;
  instructorAddress?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalRevenue?: string;
  studentCount?: number;
  platformFee?: string;
  creatorRevenue?: string;
}

export interface CreateCourseFormData {
  title: string;
  description: string;
  detailedDescription: string;
  price: string;
  duration: string;
  lessons: CourseLesson[];
  tags: string[];
  courseId?: string;
}

// 课程购买相关类型
export interface CoursePurchase {
  courseId: string;
  buyerAddress: string;
  price: string;
  platformFee: string;
  creatorRevenue: string;
  transactionHash: string;
  purchaseDate: Date;
}

// 课程收益统计
export interface CourseEarnings {
  courseId: string;
  totalSales: number;
  totalRevenue: string;
  platformFeeCollected: string;
  creatorEarnings: string;
  averagePrice: string;
}

// Hook 接口定义
export interface UseCourseContractResult {
  // 状态
  isLoading: boolean;
  error: string | null;
  
  // 创建课程
  createCourse: (courseData: CreateCourseFormData) => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  
  // 获取课程
  getCourse: (courseId: string) => Promise<Course | null>;
  
  // 获取创作者课程列表
  getCreatorCourses: (creatorAddress: string) => Promise<string[]>;
  
  // 购买课程
  purchaseCourse: (courseId: string, price: string) => Promise<void>;
  isPurchasing: boolean;
  
  // 检查是否已购买
  hasPurchasedCourse: (courseId: string) => Promise<boolean>;
  
  // 获取课程统计
  getCourseStats: (courseId: string) => Promise<{
    totalSales: string;
    totalRevenue: string;
    studentCount: string;
  } | null>;
  
  // 提取收益
  withdrawEarnings: (courseId: string) => Promise<void>;
  isWithdrawing: boolean;
}

// 导出所有类型的集合，方便统一导入
export type {
  CourseLesson as Lesson,
  Course as CourseData,
  CreateCourseFormData as FormData,
  CoursePurchase as Purchase,
  CourseEarnings as Earnings,
  UseCourseContractResult as ContractResult,
};

// 默认导出
export default {
  CourseLesson,
  Course,
  CreateCourseFormData,
  CoursePurchase,
  CourseEarnings,
  UseCourseContractResult,
};