// Common components exports
export { default as RichTextEditor } from './RichTextEditor';
export { default as LessonManager } from './LessonManager';
export { default as TagInput } from './TagInput';
export { default as CoursePurchase } from './CoursePurchase';

// Re-export types for convenience
export type { CourseLesson, Course, CreateCourseFormData, CoursePurchase as CoursePurchaseType } from '../../types/course';
