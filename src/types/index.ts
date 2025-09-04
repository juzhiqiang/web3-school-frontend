// 类型导入导出索引文件
export * from './course';
export * from './courseTypes';

// 重新导出所有课程相关类型
export type {
  CourseLesson,
  Course,
  CreateCourseFormData,
  CoursePurchase,
  CourseEarnings,
} from './courseTypes';

export type {
  UseCourseContractResult,
} from './courseTypes';