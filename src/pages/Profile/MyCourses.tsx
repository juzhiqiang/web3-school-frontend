import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useCourseContract, useMyCoursesContract } from '../../hooks/useCourseContract';
import { 
  getCourse, 
  getCreatorCourseIds, 
  getPurchasedCourseIds, 
  hasPurchased 
} from '../../utils/courseStorage';
import type { Course } from '../../types/course';
import { formatYiDengAmount } from '../../config/yidengToken';
import { 
  BookOpen, Users, Clock, Coins, Eye, Edit, Trash2, Plus, 
  AlertCircle, TrendingUp, Calendar, Star, Play, 
  CheckCircle, Award, BookmarkCheck, GraduationCap,
  Filter, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

// 课程状态枚举
enum CourseStatus {
  CREATED = 'created',      // 我创建的课程
  PURCHASED = 'purchased',  // 我购买的课程
  COMPLETED = 'completed'   // 我完成的课程
}

// 课程卡片数据接口
interface CourseCardData extends Course {
  status: CourseStatus;
  progress?: number;        // 学习进度 (0-100)
  completedAt?: Date;       // 完成时间
  lastAccessedAt?: Date;    // 最后访问时间
  onChainData?: {           // 链上数据
    enrollmentCount?: number;
    totalRevenue?: string;
    isActive?: boolean;
  };
}

// 过滤器类型
type FilterType = 'all' | 'created' | 'purchased' | 'completed';

function MyCourses() {
  const { isConnected, address } = useWeb3();
  const { getCourse: getContractCourse, getCourseStats } = useCourseContract();
  const { creatorCourseIds, purchasedCourseIds } = useMyCoursesContract();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress'>('recent');

  // 统计数据
  const [stats, setStats] = useState({
    createdCount: 0,
    purchasedCount: 0,
    completedCount: 0,
    totalRevenue: 0,
    totalStudents: 0,
    averageRating: 4.5
  });

  // 加载所有课程数据（本地 + 链上）
  const loadAllCourses = async () => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allCourses: CourseCardData[] = [];
      let totalRevenue = 0;
      let totalStudents = 0;

      // 1. 加载我创建的课程（本地数据 + 链上统计）
      const myCreatedCourseIds = getCreatorCourseIds(address);
      console.log('我创建的课程IDs:', myCreatedCourseIds);

      for (const courseId of myCreatedCourseIds) {
        const localCourse = getCourse(courseId);
        if (localCourse) {
          // 尝试获取链上统计数据
          let onChainData = {};
          try {
            const stats = await getCourseStats(courseId);
            if (stats) {
              onChainData = {
                enrollmentCount: parseInt(stats.studentCount || '0'),
                totalRevenue: stats.totalRevenue || '0',
                isActive: true
              };
              totalRevenue += parseFloat(stats.totalRevenue || '0');
              totalStudents += parseInt(stats.studentCount || '0');
            }
          } catch (err) {
            console.log(`课程 ${courseId} 链上数据获取失败，使用本地数据`);
            // 使用本地模拟数据
            onChainData = {
              enrollmentCount: Math.floor(Math.random() * 50),
              totalRevenue: (Math.random() * 5).toFixed(3),
              isActive: true
            };
          }

          allCourses.push({
            ...localCourse,
            status: CourseStatus.CREATED,
            onChainData,
            lastAccessedAt: new Date()
          });
        }
      }

      // 2. 加载我购买的课程（本地数据 + 链上数据）
      const myPurchasedCourseIds = getPurchasedCourseIds(address);
      console.log('我购买的课程IDs:', myPurchasedCourseIds);

      for (const courseId of myPurchasedCourseIds) {
        // 避免重复添加（如果我既是创建者又是购买者）
        if (myCreatedCourseIds.includes(courseId)) {
          continue;
        }

        const localCourse = getCourse(courseId);
        if (localCourse) {
          // 模拟学习进度和完成状态
          const progress = Math.floor(Math.random() * 101);
          const isCompleted = progress === 100;
          
          allCourses.push({
            ...localCourse,
            status: isCompleted ? CourseStatus.COMPLETED : CourseStatus.PURCHASED,
            progress,
            completedAt: isCompleted ? new Date(