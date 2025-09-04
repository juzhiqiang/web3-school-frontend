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
  price: string; // 价格单位：一灯币 (YiDeng Token)
  duration: string;
  lessons: CourseLesson[];
  instructor?: string;
  instructorAddress?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalRevenue?: string; // 总收益（一灯币）
  studentCount?: number;
  platformFee?: string; // 平台手续费（一灯币）
  creatorRevenue?: string; // 创作者实际收益（一灯币）
}

export interface CreateCourseFormData {
  title: string;
  description: string;
  detailedDescription: string;
  price: string; // 价格单位：一灯币 (YiDeng Token)
  duration: string;
  lessons: CourseLesson[];
  tags: string[];
  courseId?: string;
}

// 课程购买相关类型
export interface CoursePurchase {
  courseId: string;
  buyerAddress: string;
  price: string; // 购买价格（一灯币）
  platformFee: string; // 平台手续费（一灯币）
  creatorRevenue: string; // 创作者收益（一灯币）
  transactionHash: string;
  purchaseDate: Date;
}

// 课程收益统计
export interface CourseEarnings {
  courseId: string;
  totalSales: number;
  totalRevenue: string; // 总收益（一灯币）
  platformFeeCollected: string; // 平台手续费收入（一灯币）
  creatorEarnings: string; // 创作者收益（一灯币）
  averagePrice: string; // 平均价格（一灯币）
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
  withdrawEarnings: (amount: string) => Promise<void>; // 改为金额参数
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