import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import type { Course } from '../../types/courseTypes';
import { getAllCourses } from '../../utils/courseStorage';
import { formatDisplayBalance } from '../../utils/formatBalance';

const CourseListing: React.FC = () => {
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');

  // 加载课程列表
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const allCourses = getAllCourses();
        setCourses(allCourses);
        setFilteredCourses(allCourses);
      } catch (error) {
        console.error('加载课程列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // 筛选课程
  useEffect(() => {
    let filtered = courses;

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 按难度筛选
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    // 按价格筛选
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(course => {
        const price = parseFloat(course.price);
        switch (selectedPriceRange) {
          case 'free':
            return price === 0;
          case 'low':
            return price > 0 && price <= 10;
          case 'medium':
            return price > 10 && price <= 50;
          case 'high':
            return price > 50;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedDifficulty, selectedPriceRange]);

  // 跳转到课程详情
  const goToCourseDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">探索课程</h1>
        <p className="text-gray-600">发现适合您的优质课程</p>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 难度筛选 */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有难度</option>
              <option value="初级">初级</option>
              <option value="中级">中级</option>
              <option value="高级">高级</option>
            </select>

            {/* 价格筛选 */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有价格</option>
              <option value="free">免费</option>
              <option value="low">1-10 YD</option>
              <option value="medium">11-50 YD</option>
              <option value="high">50+ YD</option>
            </select>

            {/* 筛选按钮 */}
            <Button variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 课程统计 */}
      <div className="mb-6">
        <p className="text-gray-600">
          找到 {filteredCourses.length} 门课程
        </p>
      </div>

      {/* 课程列表 */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无课程</h3>
            <p className="text-gray-500 mb-4">没有找到符合条件的课程</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedDifficulty('all');
              setSelectedPriceRange('all');
            }}>
              清除筛选条件
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => goToCourseDetails(course.id)}
            >
              <CardHeader className="p-0">
                {course.thumbnailHash ? (
                  <img 
                    src={`https://ipfs.io/ipfs/${course.thumbnailHash}`}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                    {course.difficulty && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {course.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {course.description}
                  </p>
                </div>

                {/* 课程信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.lessons?.length || 0} 课时
                    </div>
                  </div>
                  {course.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </div>
                  )}
                </div>

                {/* 标签 */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* 价格和操作 */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-blue-600">
                    {parseFloat(course.price) === 0 ? '免费' : `${formatDisplayBalance(course.price)} YD`}
                  </div>
                  <Button size="sm" className="flex items-center">
                    查看详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseListing;