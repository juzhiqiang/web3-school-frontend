# Web3 课程创建功能集成

本功能实现了基于区块链的课程创建系统，包括智能合约集成、一灯币奖励机制和个人课程管理。

## 🎯 功能特性

### 1. 区块链课程创建
- ✅ 使用智能合约存储课程数据
- ✅ 课程信息永久上链
- ✅ 合约地址: `0x276Aa34b949Ea8C7b9817f21FA50cdd466211597`
- ✅ 支持富文本课程描述和章节管理

### 2. 一灯币奖励系统
- ✅ 课程创建成功后自动获得 1 个一灯币奖励
- ✅ 自动刷新钱包余额显示奖励
- ✅ 成功提示弹窗展示奖励信息

### 3. 个人中心集成
- ✅ "我的课程" 页面显示所有创建的课程
- ✅ 课程统计数据展示（总数、学员数、收益等）
- ✅ 课程管理操作（查看、编辑、删除）

## 📁 新增文件结构

```
src/
├── config/
│   └── courseContract.ts          # 课程合约配置
├── hooks/
│   └── useCourseContract.ts       # 课程合约 Hook
└── pages/
    ├── CreateCourse/
    │   └── CreateCourse.tsx       # 更新的创建课程组件
    └── Profile/
        └── MyCourses.tsx          # 我的课程管理页面
```

## 🔧 核心功能实现

### 1. 课程合约配置 (`courseContract.ts`)
```typescript
export const COURSE_CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: "0x276Aa34b949Ea8C7b9817f21FA50cdd466211597",
  CREATION_REWARD: "1", // 1 一灯币奖励
  CONTRACT_ABI: [
    // 智能合约 ABI 定义
    "function createCourse(...) external returns (uint256)",
    "function getCourse(uint256) external view returns (...)",
    "function getCoursesByCreator(address) external view returns (uint256[])"
  ]
}
```

### 2. 课程合约 Hook (`useCourseContract.ts`)
主要功能：
- `createCourse()` - 创建课程并上链
- `getMyCourses()` - 获取用户创建的课程列表
- `getCourse()` - 获取单个课程详情
- 自动发送一灯币奖励
- IPFS 内容存储集成

### 3. 更新的创建课程组件
新增功能：
- 区块链集成说明
- 合约地址显示
- 上链进度提示
- 成功后奖励弹窗
- 自动跳转到个人中心

### 4. 我的课程管理页面
功能包括：
- 课程统计卡片
- 课程列表展示
- 收益信息显示
- 区块链地址展示
- 课程管理操作

## 🚀 使用流程

### 创建课程
1. 连接钱包
2. 填写课程基本信息（名称、简介、价格等）
3. 添加详细描述（支持富文本）
4. 添加课程章节
5. 预览并确认信息
6. 点击"发布到区块链"
7. 确认钱包交易
8. 等待交易确认
9. 获得 1 个一灯币奖励

### 查看我的课程
1. 导航到个人中心
2. 点击"我的课程"
3. 查看课程统计数据
4. 管理已创建的课程

## 💰 收益分配

- 课程价格：用户设定（1-10000 YD）
- 平台手续费：2.5%
- 创作者收益：97.5%
- 创建奖励：1 YD

## 🔗 智能合约集成

### 合约函数调用
```typescript
// 创建课程
const tx = await contract.createCourse(
  title,
  description,
  detailedDescription,
  priceWei,
  duration,
  tags,
  ipfsHash
);

// 获取用户课程
const courseIds = await contract.getCoursesByCreator(userAddress);
```

### 事件监听
- `CourseCreated` - 课程创建成功事件
- `RewardSent` - 奖励发放事件

## 📝 数据存储

- **链上数据**：课程基本信息、价格、创建者地址
- **IPFS 存储**：课程详细内容、章节信息、缩略图
- **本地状态**：UI 交互状态、表单数据

## ⚙️ 配置说明

### 环境变量
```env
VITE_COURSE_CONTRACT_ADDRESS_MAINNET=0x276Aa34b949Ea8C7b9817f21FA50cdd466211597
VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA=0x276Aa34b949Ea8C7b9817f21FA50cdd466211597
VITE_COURSE_CONTRACT_ADDRESS_LOCAL=0x276Aa34b949Ea8C7b9817f21FA50cdd466211597
```

### 一灯币配置更新
```typescript
export const YIDENG_TOKEN_CONFIG = {
  // 课程合约地址配置
  COURSE_CONTRACT_ADDRESSES: {
    1: process.env.VITE_COURSE_CONTRACT_ADDRESS_MAINNET,
    11155111: process.env.VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA,
    1337: process.env.VITE_COURSE_CONTRACT_ADDRESS_LOCAL,
  }
}
```

## 🛠️ 开发说明

### 依赖要求
- React 18+
- TypeScript
- ethers.js v6
- wagmi v2
- lucide-react（图标）
- react-hot-toast（消息提示）

### 启动开发
```bash
yarn install
yarn dev
```

### 构建生产版本
```bash
yarn build
```

## 🔍 调试与测试

### 控制台日志
- 创建课程过程中的详细日志
- 合约调用状态
- 交易哈希和确认状态
- IPFS 上传状态

### 错误处理
- 钱包连接检查
- 合约调用错误捕获
- 网络状态检测
- 用户友好的错误提示

## 🚧 待完善功能

1. **IPFS 集成**：完整的 IPFS 上传功能
2. **课程编辑**：更新已创建的课程
3. **课程删除**：从链上标记删除课程
4. **收益管理**：课程销售收益统计
5. **评价系统**：课程评分和评论

## 📄 许可证

本项目遵循 MIT 许可证。

---

**注意**：当前实现为开发版本，实际部署时请确保：
1. 智能合约已正确部署
2. IPFS 服务配置完成
3. 奖励机制的代币授权设置
4. 生产环境的错误监控
