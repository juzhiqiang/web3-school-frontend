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
  detailedDescription: string; // Rich text content
  price: string; // In YiDeng Token (YD)
  duration: string;
  lessons: CourseLesson[];
  instructor?: string;
  instructorAddress?: string; // 创建者钱包地址
  tags?: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalRevenue?: string; // 总收益（YD）
  studentCount?: number; // 学员数量
  platformFee?: string; // 平台手续费（YD）
  creatorRevenue?: string; // 创作者实际收益（YD）
}

export interface CreateCourseFormData {
  title: string;
  description: string;
  detailedDescription: string;
  price: string; // In YiDeng Token (YD)
  duration: string;
  lessons: CourseLesson[];
  tags: string[];
}

// 课程购买相关类型
export interface CoursePurchase {
  courseId: string;
  buyerAddress: string;
  price: string; // YD amount
  platformFee: string; // YD amount
  creatorRevenue: string; // YD amount
  transactionHash: string;
  purchaseDate: Date;
}

// 课程收益统计
export interface CourseEarnings {
  courseId: string;
  totalSales: number;
  totalRevenue: string; // Total YD earned
  platformFeeCollected: string; // Platform fee in YD
  creatorEarnings: string; // Creator earnings in YD
  averagePrice: string; // Average sale price in YD
}
