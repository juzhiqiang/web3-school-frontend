import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Play, Clock } from 'lucide-react';
import { CourseLesson } from '../../types/course';

interface LessonManagerProps {
  lessons: CourseLesson[];
  onLessonsChange: (lessons: CourseLesson[]) => void;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  lessons,
  onLessonsChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState<Partial<CourseLesson>>({
    title: '',
    videoUrl: '',
    duration: '',
    description: ''
  });

  const addLesson = () => {
    if (!newLesson.title || !newLesson.videoUrl) return;

    const lesson: CourseLesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      videoUrl: newLesson.videoUrl,
      duration: newLesson.duration || '',
      description: newLesson.description || ''
    };

    onLessonsChange([...lessons, lesson]);
    setNewLesson({
      title: '',
      videoUrl: '',
      duration: '',
      description: ''
    });
  };

  const updateLesson = (index: number, updatedLesson: CourseLesson) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? updatedLesson : lesson
    );
    onLessonsChange(updatedLessons);
    setEditingIndex(null);
  };

  const deleteLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    onLessonsChange(updatedLessons);
  };

  const moveLesson = (fromIndex: number, toIndex: number) => {
    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, movedLesson);
    onLessonsChange(updatedLessons);
  };

  const isValidVideoUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return ['youtube.com', 'youtu.be', 'vimeo.com', 'wistia.com'].some(domain => 
        urlObj.hostname.includes(domain)
      ) || url.endsWith('.mp4') || url.endsWith('.webm');
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">课程章节</h3>
        <span className="text-sm text-gray-500">{lessons.length} 个章节</span>
      </div>

      {/* Existing Lessons */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            {editingIndex === index ? (
              <EditLessonForm
                lesson={lesson}
                onSave={(updatedLesson) => updateLesson(index, updatedLesson)}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                        第 {index + 1} 节
                      </span>
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Play size={14} />
                        <span>视频</span>
                      </div>
                      {lesson.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{lesson.duration}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {lesson.videoUrl}
                    </p>

                    {lesson.description && (
                      <p className="text-sm text-gray-700 mt-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLesson(index)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Move buttons */}
                <div className="flex space-x-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveLesson(index, index - 1)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      ↑ 上移
                    </button>
                  )}
                  {index < lessons.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveLesson(index, index + 1)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      ↓ 下移
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Lesson */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">添加新章节</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              章节标题 *
            </label>
            <input
              type="text"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：Web3基础概念"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时长
            </label>
            <input
              type="text"
              value={newLesson.duration}
              onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：15分钟"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            视频地址 *
          </label>
          <input
            type="url"
            value={newLesson.videoUrl}
            onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              newLesson.videoUrl && !isValidVideoUrl(newLesson.videoUrl)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="https://www.youtube.com/watch?v=... 或 https://your-server.com/video.mp4"
          />
          {newLesson.videoUrl && !isValidVideoUrl(newLesson.videoUrl) && (
            <p className="text-xs text-red-600 mt-1">
              请输入有效的视频URL（支持YouTube、Vimeo等）
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            章节描述
          </label>
          <textarea
            value={newLesson.description}
            onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="简要描述这节课的内容..."
          />
        </div>

        <button
          type="button"
          onClick={addLesson}
          disabled={!newLesson.title || !newLesson.videoUrl || !isValidVideoUrl(newLesson.videoUrl || '')}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          <span>添加章节</span>
        </button>
      </div>
    </div>
  );
};

interface EditLessonFormProps {
  lesson: CourseLesson;
  onSave: (lesson: CourseLesson) => void;
  onCancel: () => void;
}

const EditLessonForm: React.FC<EditLessonFormProps> = ({
  lesson,
  onSave,
  onCancel
}) => {
  const [editedLesson, setEditedLesson] = useState<CourseLesson>({ ...lesson });

  const handleSave = () => {
    if (!editedLesson.title || !editedLesson.videoUrl) return;
    onSave(editedLesson);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            章节标题
          </label>
          <input
            type="text"
            value={editedLesson.title}
            onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            时长
          </label>
          <input
            type="text"
            value={editedLesson.duration}
            onChange={(e) => setEditedLesson({ ...editedLesson, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          视频地址
        </label>
        <input
          type="url"
          value={editedLesson.videoUrl}
          onChange={(e) => setEditedLesson({ ...editedLesson, videoUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          章节描述
        </label>
        <textarea
          value={editedLesson.description}
          onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default LessonManager;
