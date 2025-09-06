import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award,
  ChevronRight,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useCourseContract } from '../../hooks/useCourseContract';
import { useTransactionPurchase } from '../../hooks/useTransactionPurchase';
import { useWeb3 } from '../../contexts/Web3Context';
import { formatDisplayBalance } from '../../utils/formatBalance';
import type { Course, CourseLesson } from '../../types/courseTypes';
import { getCourse, hasPurchased } from '../../utils/courseStorage';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { ydBalance } = useWeb3();
  
  const { getCourseStats } = useCourseContract();
  const { purchaseCourseWithVerification, isPurchasing } = useTransactionPurchase();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [courseStats, setCourseStats] = useState<{
    totalSales: string;
    totalRevenue: string;
    studentCount: string;
  } | null>(null);

  // 加载课程信息
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        navigate('/courses');
        return;
      }

      try {
        setIsLoading(true);
        
        // 从本地存储获取课程信息
        const courseData = getCourse(courseId);
        
        if (!courseData) {
          toast.error('课程不存在');
          navigate('/courses');
          return;
        }
        
        setCourse(courseData);
        
        // 检查是否已购买
        if (address) {
          const purchased = hasPurchased(courseId, address);
          setIsPurchased(purchased);
        }
        
        // 获取课程统计
        const stats = await getCourseStats(courseId);
        setCourseStats(stats);
        
      } catch (error) {
        console.error('加载课程失败:', error);
        toast.error('加载课程失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, address, navigate, getCourseStats]);

  // 检查是否可以观看课程
  const canWatchLesson = (lesson: CourseLesson, index: number) => {
    if (!lesson) return false;
    if (lesson.isPreview) return true; // 免费预览
    if (isPurchased) return true; // 已购买
    return false;
  };

  // 播放视频
  const playVideo = (lesson: CourseLesson, index: number) => {
    if (!canWatchLesson(lesson, index)) {
      toast.error('请先购买课程或选择免费预览课程');
      return;
    }
    
    if (!lesson.videoUrl) {
      toast.error('该课程暂未上传视频');
      return;
    }
    
    setCurrentLessonIndex(index);
    // 在这里可以添加视频播放逻辑
    window.open(lesson.videoUrl, '_blank');
  };

  // 购买课程
  const handlePurchase = async () => {
    if (!course || !address) {
      toast.error('请先连接钱包');
      return;
    }

    // 检查余额
    const balance = parseFloat(ydBalance || '0');
    const price = parseFloat(course.price);
    
    if (balance < price) {
      toast.error('一灯币余额不足，请先充值');
      return;
    }

    try {
      const success = await purchaseCourseWithVerification(courseId!, course.price);
      if (success) {
        setIsPurchased(true);
        toast.success('课程购买成功！');
      }
    } catch (error) {
      console.error('购买失败:', error);
      toast.error('购买失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-600">课程不存在</h1>
        <Button onClick={() => navigate('/courses')} className="mt-4">
          返回课程列表
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 课程头部信息 */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.lessons?.length || 0} 课时
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {courseStats?.studentCount || 0} 学员
                    </div>
                    {course.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {course.rating}
                      </div>
                    )}
                  </div>
                </div>
                {course.difficulty && (
                  <Badge variant="outline">{course.difficulty}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {course.thumbnailHash && (
                <div className="mb-6">
                  <img 
                    src={`https://ipfs.io/ipfs/${course.thumbnailHash}`}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 购买卡片 */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>课程价格</span>
                <span className="text-2xl font-bold text-blue-600">
                  {course.price} YD
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPurchased ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">您已拥有此课程</p>
                  <Badge className="mt-2" variant="outline">已购买</Badge>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-2">
                      <span>您的余额:</span>
                      <span className={parseFloat(ydBalance || '0') >= parseFloat(course.price) ? 'text-green-600' : 'text-red-600'}>
                        {formatDisplayBalance(ydBalance || '0')} YD
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePurchase}
                    disabled={!address || isPurchasing || parseFloat(ydBalance || '0') < parseFloat(course.price)}
                    className="w-full"
                  >
                    {isPurchasing ? '购买中...' : '立即购买'}
                  </Button>
                  
                  {parseFloat(ydBalance || '0') < parseFloat(course.price) && (
                    <p className="text-sm text-red-600 text-center">
                      余额不足，请先充值
                    </p>
                  )}
                </>
              )}
              
              <div className="text-xs text-gray-500 text-center">
                购买后可永久学习
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 课程内容 */}
      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">课程目录</TabsTrigger>
          <TabsTrigger value="description">课程介绍</TabsTrigger>
          <TabsTrigger value="reviews">学员评价</TabsTrigger>
        </TabsList>

        {/* 课程目录 */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>课程目录</CardTitle>
            </CardHeader>
            <CardContent>
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                        currentLessonIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => playVideo(lesson, index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                          {canWatchLesson(lesson, index) ? (
                            <Play className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {index + 1}. {lesson.title}
                          </h4>
                          {lesson.description && (
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            {lesson.duration && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {lesson.duration}
                              </span>
                            )}
                            {lesson.isPreview && (
                              <Badge variant="outline" className="text-xs">
                                免费预览
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  暂无课程内容
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 课程介绍 */}
        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>课程介绍</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{course.detailedDescription}</p>
                
                {course.tags && course.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">课程标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {course.instructorName && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">讲师信息</h4>
                    <p><strong>讲师:</strong> {course.instructorName}</p>
                    {course.instructorBio && (
                      <p className="mt-2 text-gray-600">{course.instructorBio}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 学员评价 */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>学员评价</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无评价，成为第一个评价者吧！</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetails;