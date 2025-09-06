// 课程相关的类型定义

export interface CourseLesson {
  id: string | number;
  title: string;
  videoUrl?: string;
  duration?: string;
  description?: string;
  isPreview?: boolean; // 是否为免费预览课程
}

export interface Course {
  id: string;
  title: string;
  description: string;
  detailedDescription: string; // 改为必需字段
  price: string; // 价格单位：一灯币 (YiDeng Token)
  duration: string;
  lessons?: CourseLesson[];
  instructor?: string;
  instructorName?: string; // 讲师姓名
  instructorAddress?: string; // 讲师钱包地址
  instructorBio?: string; // 讲师简介
  tags?: string[];
  thumbnail?: string;
  thumbnailHash?: string; // IPFS hash 或图片URL
  createdAt?: Date;
  updatedAt?: Date;
  totalRevenue?: string; // 总收益（一灯币）
  studentCount?: number;
  enrollmentCount?: number; // 注册学生数量
  platformFee?: string; // 平台手续费（一灯币）
  creatorRevenue?: string; // 创作者实际收益（一灯币）
  difficulty?: string; // 课程难度：初级、中级、高级
  level?: string; // 兼容旧字段
  rating?: number; // 课程评分
  reviews?: number; // 评价数量
  language?: string; // 授课语言
  lastUpdated?: string; // 最后更新时间
  isActive?: boolean; // 课程是否激活
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
  difficulty?: string;
}

// 课程购买相关类型
export interface CoursePurchase {
  courseId: string;
  buyerAddress: string;
  price: string; // 购买价格（一灯币）
  platformFee?: string; // 平台手续费（一灯币）
  creatorRevenue?: string; // 创作者收益（一灯币）
  transactionHash?: string;
  purchaseDate: Date;
  timestamp?: string;
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
  isCreateSuccess: boolean; // 添加创建成功状态
  
  // 获取课程
  getCourse: (courseId: string) => Promise<Course | null>;
  
  // 获取创作者课程列表
  getCreatorCourses: (creatorAddress: string) => Promise<string[]>;
  
  // 购买课程
  purchaseCourse: (courseId: string, price: string) => Promise<{ success: boolean; hash?: string }>;
  isPurchasing: boolean;
  
  // 检查是否已购买
  hasPurchasedCourse: (courseId: string) => Promise<boolean>;
  
  // 获取课程统计
  getCourseStats: (courseId: string) => Promise<{
    totalSales: string;
    totalRevenue: string;
    studentCount: string;
  } | null>;
  
  // 获取作者统计
  getAuthorStats: (authorAddress: string) => Promise<{
    totalStudents: number;
    totalRevenue: string;
    courseCount: number;
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
