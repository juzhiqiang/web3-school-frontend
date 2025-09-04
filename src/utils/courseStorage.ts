import type { Course } from '../types/courseTypes';

// 本地存储前缀
const COURSE_PREFIX = 'course_';
const PURCHASE_PREFIX = 'purchase_';

// 课程本地存储工具类
export class CourseStorage {
  
  // 保存课程数据到localStorage
  static saveCourse(course: Course): void {
    try {
      const courseKey = `${COURSE_PREFIX}${course.id}`;
      localStorage.setItem(courseKey, JSON.stringify({
        ...course,
        createdAt: course.createdAt || new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      console.error('保存课程失败:', error);
      throw new Error('保存课程数据失败');
    }
  }

  // 从localStorage获取课程数据
  static getCourse(courseId: string): Course | null {
    try {
      const courseKey = `${COURSE_PREFIX}${courseId}`;
      const courseData = localStorage.getItem(courseKey);
      
      if (!courseData) {
        return null;
      }

      const course = JSON.parse(courseData);
      // 确保日期字段是Date对象
      if (course.createdAt) {
        course.createdAt = new Date(course.createdAt);
      }
      if (course.updatedAt) {
        course.updatedAt = new Date(course.updatedAt);
      }

      return course;
    } catch (error) {
      console.error('获取课程失败:', error);
      return null;
    }
  }

  // 获取指定创作者的所有课程ID
  static getCreatorCourseIds(creatorAddress: string): string[] {
    try {
      const courseIds: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith(COURSE_PREFIX)) {
          const courseData = localStorage.getItem(key);
          if (courseData) {
            const course = JSON.parse(courseData);
            if (course.instructorAddress === creatorAddress) {
              courseIds.push(course.id);
            }
          }
        }
      }

      return courseIds;
    } catch (error) {
      console.error('获取创作者课程失败:', error);
      return [];
    }
  }

  // 获取所有课程
  static getAllCourses(): Course[] {
    try {
      const courses: Course[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith(COURSE_PREFIX)) {
          const courseData = localStorage.getItem(key);
          if (courseData) {
            const course = JSON.parse(courseData);
            // 确保日期字段是Date对象
            if (course.createdAt) {
              course.createdAt = new Date(course.createdAt);
            }
            if (course.updatedAt) {
              course.updatedAt = new Date(course.updatedAt);
            }
            courses.push(course);
          }
        }
      }

      // 按创建时间倒序排列
      return courses.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('获取所有课程失败:', error);
      return [];
    }
  }

  // 删除课程
  static deleteCourse(courseId: string): boolean {
    try {
      const courseKey = `${COURSE_PREFIX}${courseId}`;
      localStorage.removeItem(courseKey);
      return true;
    } catch (error) {
      console.error('删除课程失败:', error);
      return false;
    }
  }

  // 更新课程
  static updateCourse(courseId: string, updates: Partial<Course>): boolean {
    try {
      const existingCourse = this.getCourse(courseId);
      if (!existingCourse) {
        return false;
      }

      const updatedCourse = {
        ...existingCourse,
        ...updates,
        updatedAt: new Date()
      };

      this.saveCourse(updatedCourse);
      return true;
    } catch (error) {
      console.error('更新课程失败:', error);
      return false;
    }
  }

  // 记录课程购买
  static recordPurchase(courseId: string, buyerAddress: string, transactionData?: any): void {
    try {
      const purchaseKey = `${PURCHASE_PREFIX}${buyerAddress}_${courseId}`;
      const purchaseData = {
        courseId,
        buyerAddress,
        purchaseDate: new Date(),
        ...transactionData
      };
      localStorage.setItem(purchaseKey, JSON.stringify(purchaseData));
    } catch (error) {
      console.error('记录购买失败:', error);
      throw new Error('记录购买数据失败');
    }
  }

  // 检查是否已购买课程
  static hasPurchased(courseId: string, buyerAddress: string): boolean {
    try {
      const purchaseKey = `${PURCHASE_PREFIX}${buyerAddress}_${courseId}`;
      return localStorage.getItem(purchaseKey) !== null;
    } catch (error) {
      console.error('检查购买状态失败:', error);
      return false;
    }
  }

  // 获取用户购买的课程ID列表
  static getPurchasedCourseIds(userAddress: string): string[] {
    try {
      const courseIds: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith(`${PURCHASE_PREFIX}${userAddress}_`)) {
          const purchaseData = localStorage.getItem(key);
          if (purchaseData) {
            const purchase = JSON.parse(purchaseData);
            courseIds.push(purchase.courseId);
          }
        }
      }

      return courseIds;
    } catch (error) {
      console.error('获取购买课程失败:', error);
      return [];
    }
  }

  // 清除所有课程数据（仅用于开发/测试）
  static clearAllCourses(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(COURSE_PREFIX) || key?.startsWith(PURCHASE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('清除课程数据失败:', error);
    }
  }
}

// 便捷的导出函数
export const saveCourse = CourseStorage.saveCourse;
export const getCourse = CourseStorage.getCourse;
export const getCreatorCourseIds = CourseStorage.getCreatorCourseIds;
export const getAllCourses = CourseStorage.getAllCourses;
export const deleteCourse = CourseStorage.deleteCourse;
export const updateCourse = CourseStorage.updateCourse;
export const recordPurchase = CourseStorage.recordPurchase;
export const hasPurchased = CourseStorage.hasPurchased;
export const getPurchasedCourseIds = CourseStorage.getPurchasedCourseIds;
export const clearAllCourses = CourseStorage.clearAllCourses;