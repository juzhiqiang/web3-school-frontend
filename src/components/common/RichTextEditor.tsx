import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "请输入详细描述...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: '粗体 (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: '斜体 (Ctrl+I)' },
    { command: 'underline', icon: Underline, title: '下划线 (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: List, title: '无序列表' },
    { command: 'insertOrderedList', icon: ListOrdered, title: '有序列表' },
    { command: 'formatBlock', icon: Quote, title: '引用', value: 'blockquote' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => executeCommand(button.command, button.value)}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title={button.title}
              >
                <IconComponent size={16} />
              </button>
            );
          })}
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="text-sm border-0 bg-transparent"
          >
            <option value="">格式</option>
            <option value="h1">标题 1</option>
            <option value="h2">标题 2</option>
            <option value="h3">标题 3</option>
            <option value="p">正文</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => setIsToolbarVisible(false)}
        className="min-h-[200px] p-4 outline-none prose prose-sm max-w-none"
        style={{ 
          minHeight: '200px',
          lineHeight: '1.6'
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {!value && (
        <div className="absolute top-[60px] left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
