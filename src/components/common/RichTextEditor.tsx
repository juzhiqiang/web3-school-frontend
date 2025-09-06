import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Eye,
  Edit
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  minHeight = 200
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  // 移除未使用的 isToolbarVisible 变量
  // const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 格式化文本
  const formatText = useCallback((format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let newValue = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '**粗体文本**';
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '*斜体文本*';
        break;
      case 'underline':
        formattedText = selectedText ? `<u>${selectedText}</u>` : '<u>下划线文本</u>';
        break;
      case 'list':
        formattedText = selectedText ? `\n- ${selectedText}` : '\n- 列表项';
        break;
      case 'ordered-list':
        formattedText = selectedText ? `\n1. ${selectedText}` : '\n1. 列表项';
        break;
      case 'link':
        formattedText = selectedText ? `[${selectedText}](链接地址)` : '[链接文本](链接地址)';
        break;
      default:
        return;
    }

    newValue = value.substring(0, start) + formattedText + value.substring(end);
    newCursorPos = start + formattedText.length;

    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange]);

  // 渲染 Markdown 预览（简单版本）
  const renderPreview = useCallback((text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/* 工具栏 */}
        <div className="border-b p-3 flex items-center space-x-2 bg-gray-50">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('bold')}
              disabled={isPreviewMode}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('italic')}
              disabled={isPreviewMode}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('underline')}
              disabled={isPreviewMode}
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('list')}
              disabled={isPreviewMode}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('ordered-list')}
              disabled={isPreviewMode}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('link')}
              disabled={isPreviewMode}
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                预览
              </>
            )}
          </Button>
        </div>

        {/* 编辑器内容区域 */}
        <div className="relative">
          {isPreviewMode ? (
            // 预览模式
            <div 
              className="p-4 prose max-w-none"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ 
                __html: value ? renderPreview(value) : '<p class="text-gray-500">暂无内容</p>' 
              }}
            />
          ) : (
            // 编辑模式
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0"
              style={{ minHeight }}
            />
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t p-2 text-xs text-gray-500 bg-gray-50">
          支持 Markdown 格式：**粗体**、*斜体*、[链接](地址)、- 列表
        </div>
      </CardContent>
    </Card>
  );
};

export default RichTextEditor;