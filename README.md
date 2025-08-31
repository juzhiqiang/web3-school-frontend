# Web3 School Frontend

一个基于区块链的去中心化教育平台前端应用，使用 React + TypeScript + Vite 构建。

## 功能特性

### 🎓 核心功能
- **课程市场**: 浏览和购买 Web3 相关课程
- **课程创建**: 教育者可以创建课程并设定价格
- **用户中心**: 管理个人资料和已购买的课程
- **理财功能**: YD代币兑换、DeFi质押理财

### 🔐 Web3 集成
- **钱包连接**: 支持 MetaMask 等主流钱包
- **智能合约**: 与课程NFT、市场合约交互
- **代币经济**: YD代币生态系统
- **身份验证**: 基于MetaMask签名的安全验证

### 💰 DeFi 功能
- **代币兑换**: YD → ETH → USDT 兑换链
- **流动性挖矿**: Aave协议质押收益
- **投资组合**: 资产管理和收益追踪

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **Web3**: Wagmi + Viem + RainbowKit
- **路由**: React Router DOM
- **状态管理**: React Context + Hooks
- **图标**: Lucide React
- **通知**: React Hot Toast

## 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn
- MetaMask 浏览器插件

### 安装依赖
```bash
# 使用 yarn
yarn install

# 或使用 npm
npm install
```

### 开发环境
```bash
# 启动开发服务器
yarn dev

# 或
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本
```bash
# 构建
yarn build

# 预览构建结果
yarn preview
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   └── common/         # 通用组件
├── contexts/           # React Context
├── hooks/             # 自定义 Hooks
├── pages/             # 页面组件
│   ├── CourseListing/ # 课程列表
│   ├── CreateCourse/  # 创建课程
│   ├── Financial/     # 理财中心
│   └── Profile/       # 个人中心
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
└── config/            # 配置文件
```

## 主要页面

### 🏠 课程市场 (`/`)
- 浏览所有可用课程
- 按分类、价格筛选
- 课程搜索功能
- 课程预览和购买

### ➕ 创建课程 (`/create-course`)
- 填写课程基本信息
- 设置课程价格和分类
- 上传课程内容到 IPFS
- 铸造课程 NFT

### 💼 理财中心 (`/financial`)
- YD代币余额查看
- 代币兑换功能 (YD→ETH→USDT)
- Aave协议质押
- 收益统计和管理

### 👤 个人中心 (`/profile`)
- 个人资料管理
- 已购买课程列表
- 创建的课程管理
- MetaMask签名验证

## Web3 配置

### 合约地址配置
在 `src/config/web3.ts` 中配置智能合约地址：

```typescript
export const CONTRACTS = {
  YD_TOKEN: '0x...', // YD代币合约
  COURSE_NFT: '0x...', // 课程NFT合约
  COURSE_MARKETPLACE: '0x...', // 课程市场合约
  // ... 其他合约
}
```

### 网络支持
- Ethereum Mainnet
- Sepolia Testnet
- Polygon
- BSC

## 智能合约交互

### 课程相关
- 创建课程 (铸造NFT)
- 购买课程 (转移ETH)
- 验证课程所有权

### DeFi 相关
- ERC20代币转账
- Uniswap代币兑换
- Aave协议质押

## 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 组件采用函数式写法
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规范

### 样式规范
- 使用 Tailwind CSS 工具类
- 组件内部样式模块化
- 响应式设计优先
- 暗色主题支持

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式更新
refactor: 重构
test: 测试
chore: 构建过程或辅助工具的变动
```

## 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### 环境变量
```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系我们

- 项目链接: [https://github.com/juzhiqiang/web3-school-frontend](https://github.com/juzhiqiang/web3-school-frontend)
- 问题反馈: [Issues](https://github.com/juzhiqiang/web3-school-frontend/issues)
- 邮箱: contact@web3school.com

---

### 🚀 开始您的 Web3 教育之旅！

通过这个平台，教育者可以轻松创建和销售课程，学习者可以安全地购买和学习Web3知识，同时享受DeFi带来的理财收益。让我们一起构建去中心化的教育生态系统！