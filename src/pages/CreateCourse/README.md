# CreateCourse 组件功能说明

## 概述

优化后的 CreateCourse 组件提供了完整的课程创建功能，包括多步骤表单、富文本编辑、章节管理等高级功能。

## 新增功能

### 1. 多步骤表单设计
- **步骤1：基本信息** - 课程名称、简介、价格、时长、缩略图、标签
- **步骤2：详细描述** - 使用富文本编辑器编写课程详情
- **步骤3：课程章节** - 管理课程的各个章节和视频
- **步骤4：预览确认** - 预览所有信息并确认发布

### 2. 课程基本信息 ✨
- **课程名称输入** - 支持课程标题设置
- **课程简介** - 简要描述课程内容和目标
- **价格设置** - ETH价格输入，支持小数点后三位
- **课程时长** - 预计学习时长
- **课程缩略图** - 图片上传功能，支持预览
- **标签系统** - 智能标签输入，包含预设建议

### 3. 富文本编辑器 📝
- 支持基本格式：粗体、斜体、下划线
- 列表功能：有序列表、无序列表
- 标题层级：H1、H2、H3
- 引用块格式
- 快捷键支持：Ctrl+B/I/U
- 自动保存内容

### 4. 章节管理系统 🎥
- **添加章节** - 支持无限制添加课程章节
- **章节信息** - 每节包含名称、视频URL、时长、描述
- **视频URL验证** - 支持YouTube、Vimeo等主流平台
- **章节编辑** - 实时编辑章节信息
- **章节排序** - 拖拽或按钮方式调整章节顺序
- **章节删除** - 安全删除不需要的章节

### 5. 智能验证系统 🔍
- **步骤验证** - 每步都有完整性验证
- **实时反馈** - 输入错误时即时提示
- **URL验证** - 自动检查视频地址有效性
- **文件大小检查** - 图片上传大小限制
- **Gas费估算** - 智能合约交互费用预估

### 6. 用户体验优化 🚀
- **进度指示器** - 清晰显示当前进度
- **进度摘要** - 实时显示完成状态
- **响应式设计** - 适配桌面和移动设备
- **加载状态** - 提交过程中的加载动画
- **错误处理** - 友好的错误提示和处理

## 组件架构

### 新增文件结构
```
src/
├── types/
│   └── course.ts                    # 课程相关类型定义
├── components/
│   └── common/
│       ├── RichTextEditor.tsx       # 富文本编辑器
│       ├── LessonManager.tsx        # 章节管理组件
│       └── TagInput.tsx            # 标签输入组件
├── hooks/
│   └── useCourseCreation.ts        # 课程创建逻辑Hook
└── pages/
    └── CreateCourse/
        └── CreateCourse.tsx        # 主要表单组件 (已优化)
```

### 类型定义
- `Course` - 完整课程数据结构
- `CourseLesson` - 课程章节数据结构  
- `CreateCourseFormData` - 表单数据类型

## 使用方法

### 1. 基本使用
```tsx
import CreateCourse from './pages/CreateCourse/CreateCourse';

function App() {
  return <CreateCourse />;
}
```

### 2. Hook使用
```tsx
import { useCourseCreation } from './hooks/useCourseCreation';

const { isSubmitting, submitCourse, validateCourseData } = useCourseCreation();
```

### 3. 独立组件使用
```tsx
// 富文本编辑器
import RichTextEditor from './components/common/RichTextEditor';

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="请输入内容..."
/>

// 章节管理
import LessonManager from './components/common/LessonManager';

<LessonManager
  lessons={lessons}
  onLessonsChange={setLessons}
/>

// 标签输入
import TagInput from './components/common/TagInput';

<TagInput
  tags={tags}
  onTagsChange={setTags}
  maxTags={10}
/>
```

## 功能特性

### 表单验证规则
- 课程名称：必填
- 课程简介：必填
- 课程价格：必填，数值，≤ 10 ETH
- 详细描述：必填，富文本格式
- 章节数量：至少1个
- 视频URL：必须有效的URL格式

### 支持的视频平台
- YouTube (youtube.com, youtu.be)
- Vimeo (vimeo.com)  
- Wistia (wistia.com)
- 直接视频文件 (.mp4, .webm)

### 文件上传限制
- 图片格式：JPG, PNG, GIF
- 文件大小：≤ 5MB
- 自动预览功能

## 未来扩展

### 待集成功能
- [ ] 智能合约集成 (ethers.js)
- [ ] IPFS存储支持
- [ ] 视频上传到去中心化存储
- [ ] NFT证书生成
- [ ] 课程收益分配
- [ ] 学员进度跟踪

### 可选优化
- [ ] 拖拽上传文件
- [ ] 批量章节导入
- [ ] 课程模板功能
- [ ] 自动保存草稿
- [ ] 协作编辑功能

## 技术依赖

### 已使用的依赖
- `lucide-react` - 图标库
- `react-hot-toast` - 通知提示
- `ethers` - Web3集成 (待完善)

### 建议添加的依赖
```json
{
  "@tiptap/react": "^2.1.0",           // 更强大的富文本编辑器
  "@tiptap/starter-kit": "^2.1.0",     // Tiptap基础包
  "react-beautiful-dnd": "^13.1.1",    // 拖拽排序功能
  "react-dropzone": "^14.2.3",         // 拖拽上传文件
  "zod": "^3.22.4"                     // 表单验证库
}
```

## API集成示例

### 智能合约集成
```typescript
// 在useCourseCreation.ts中添加
import { ethers } from 'ethers';

const createCourseOnChain = async (courseData: Course) => {
  const contract = new ethers.Contract(
    process.env.VITE_COURSE_CONTRACT_ADDRESS,
    courseContractABI,
    signer
  );

  const tx = await contract.createCourse(
    courseData.title,
    courseData.description,
    ethers.parseEther(courseData.price),
    JSON.stringify({
      detailedDescription: courseData.detailedDescription,
      lessons: courseData.lessons,
      tags: courseData.tags
    })
  );

  return await tx.wait();
};
```

### IPFS存储集成
```typescript
import { create } from 'ipfs-http-client';

const uploadToIPFS = async (data: any) => {
  const ipfs = create({ url: 'https://ipfs.infura.io:5001' });
  const result = await ipfs.add(JSON.stringify(data));
  return result.path;
};
```

## 注意事项

1. **富文本内容安全** - 使用 `dangerouslySetInnerHTML` 时需要对内容进行清理
2. **文件上传安全** - 验证文件类型和大小
3. **Gas费估算** - 根据网络状况动态计算
4. **错误处理** - 完善的用户反馈机制
5. **数据持久化** - 考虑添加本地草稿保存功能

## 开发指南

### 运行开发环境
```bash
npm install
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```
