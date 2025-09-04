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
  price: string; // In ETH
  duration: string;
  lessons: CourseLesson[];
  instructor?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCourseFormData {
  title: string;
  description: string;
  detailedDescription: string;
  price: string;
  duration: string;
  lessons: CourseLesson[];
  tags: string[];
}
