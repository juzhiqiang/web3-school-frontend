import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trash2, Edit, Save, X, Plus, Play } from 'lucide-react';
import type { CourseLesson } from '../../types/courseTypes';

interface LessonManagerProps {
  lessons: CourseLesson[];
  onLessonsChange: (lessons: CourseLesson[]) => void;
  isReadOnly?: boolean;
}

interface EditingLesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  description: string;
  isPreview: boolean;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  lessons,
  onLessonsChange,
  isReadOnly = false
}) => {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLesson, setNewLesson] = useState<EditingLesson>({
    id: '',
    title: '',
    videoUrl: '',
    duration: '',
    description: '',
    isPreview: false
  });

  // 开始编辑课程
  const startEditing = useCallback((lesson: CourseLesson) => {
    setEditingLessonId(lesson.id.toString());
    setEditingLesson({
      id: lesson.id.toString(),
      title: lesson.title,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      description: lesson.description || '',
      isPreview: lesson.isPreview || false
    });
  }, []);

  // 保存编辑
  const saveEdit = useCallback(() => {
    if (!editingLesson) return;

    const updatedLessons = lessons.map(lesson => 
      lesson.id.toString() === editingLessonId 
        ? {
            ...lesson,
            title: editingLesson.title,
            videoUrl: editingLesson.videoUrl,
            duration: editingLesson.duration,
            description: editingLesson.description,
            isPreview: editingLesson.isPreview
          }
        : lesson
    );
    
    onLessonsChange(updatedLessons);
    setEditingLessonId(null);
    setEditingLesson(null);
  }, [editingLesson, editingLessonId, lessons, onLessonsChange]);

  // 取消编辑
  const cancelEdit = useCallback(() => {
    setEditingLessonId(null);
    setEditingLesson(null);
  }, []);

  // 删除课程
  const deleteLesson = useCallback((lessonId: string | number) => {
    const updatedLessons = lessons.filter(lesson => lesson.id !== lessonId);
    onLessonsChange(updatedLessons);
  }, [lessons, onLessonsChange]);

  // 添加新课程
  const addNewLesson = useCallback(() => {
    if (!newLesson.title.trim()) {
      alert('请填写课程标题');
      return;
    }

    const lessonToAdd: CourseLesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      videoUrl: newLesson.videoUrl,
      duration: newLesson.duration,
      description: newLesson.description,
      isPreview: newLesson.isPreview
    };

    onLessonsChange([...lessons, lessonToAdd]);
    
    // 重置新课程表单
    setNewLesson({
      id: '',
      title: '',
      videoUrl: '',
      duration: '',
      description: '',
      isPreview: false
    });
    setIsAddingNew(false);
  }, [newLesson, lessons, onLessonsChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">课程列表</h3>
        {!isReadOnly && (
          <Button
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加课程
          </Button>
        )}
      </div>

      {/* 添加新课程表单 */}
      {isAddingNew && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">添加新课程</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="课程标题"
              value={newLesson.title}
              onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="视频URL"
              value={newLesson.videoUrl}
              onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
            />
            <Input
              placeholder="课程时长 (例如: 10分钟)"
              value={newLesson.duration}
              onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
            />
            <Textarea
              placeholder="课程描述"
              value={newLesson.description}
              onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="new-preview"
                checked={newLesson.isPreview}
                onChange={(e) => setNewLesson(prev => ({ ...prev, isPreview: e.target.checked }))}
              />
              <label htmlFor="new-preview" className="text-sm">免费预览</label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addNewLesson} size="sm">
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingNew(false)}
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 课程列表 */}
      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            暂无课程，请添加课程内容
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="relative">
              <CardContent className="p-4">
                {editingLessonId === lesson.id.toString() ? (
                  // 编辑模式
                  <div className="space-y-4">
                    <Input
                      value={editingLesson?.title || ''}
                      onChange={(e) => setEditingLesson(prev => 
                        prev ? { ...prev, title: e.target.value } : null
                      )}
                    />
                    <Input
                      placeholder="视频URL"
                      value={editingLesson?.videoUrl || ''}
                      onChange={(e) => setEditingLesson(prev => 
                        prev ? { ...prev, videoUrl: e.target.value } : null
                      )}
                    />
                    <Input
                      placeholder="课程时长"
                      value={editingLesson?.duration || ''}
                      onChange={(e) => setEditingLesson(prev => 
                        prev ? { ...prev, duration: e.target.value } : null
                      )}
                    />
                    <Textarea
                      placeholder="课程描述"
                      value={editingLesson?.description || ''}
                      onChange={(e) => setEditingLesson(prev => 
                        prev ? { ...prev, description: e.target.value } : null
                      )}
                      rows={3}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`preview-${lesson.id}`}
                        checked={editingLesson?.isPreview || false}
                        onChange={(e) => setEditingLesson(prev => 
                          prev ? { ...prev, isPreview: e.target.checked } : null
                        )}
                      />
                      <label htmlFor={`preview-${lesson.id}`} className="text-sm">免费预览</label>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={saveEdit} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} size="sm">
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 显示模式
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{index + 1}. {lesson.title}</h4>
                          {lesson.isPreview && (
                            <Badge variant="outline" className="text-xs">
                              免费预览
                            </Badge>
                          )}
                        </div>
                        {lesson.duration && (
                          <p className="text-sm text-gray-600 mb-1">
                            时长: {lesson.duration}
                          </p>
                        )}
                        {lesson.description && (
                          <p className="text-sm text-gray-700 mb-2">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.videoUrl && (
                          <div className="flex items-center space-x-2">
                            <Play className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600">
                              视频链接已设置
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {!isReadOnly && (
                        <div className="flex space-x-1 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(lesson)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonManager;