# Web3 School Frontend

一个基于区块链的去中心化教育平台前端应用，使用 React + TypeScript + Vite 构建。

## 🆕 最新功能

### 一灯币兑换系统
- **双向兑换**: ETH ↔ 一灯币 (YD)
- **本地测试网支持**: Hardhat/Ganache 本地开发环境
- **实时定价**: 动态兑换率和手续费显示
- **安全保障**: 滑点保护、授权管理、余额验证

## 功能特性

### 🎓 核心功能
- **课程市场**: 浏览和购买 Web3 相关课程
- **课程创建**: 教育者可以创建课程并设定价格
- **用户中心**: 管理个人资料和已购买的课程
- **代币兑换**: 一灯币与ETH的双向兑换系统

### 🔐 Web3 集成
- **钱包连接**: 支持 MetaMask 等主流钱包
- **多网络支持**: 主网、Sepolia测试网、本地测试网
- **智能合约**: 与代币兑换、课程NFT、市场合约交互
- **代币经济**: 一灯币(YD)生态系统

### 💰 代币兑换功能
- **安全兑换**: 基于智能合约的代币交易
- **实时计算**: 动态兑换率和手续费计算
- **滑点保护**: 防止价格滑点造成损失
- **授权管理**: ERC20代币授权机制

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **Web3**: Wagmi + Viem + RainbowKit
- **路由**: React Router DOM
- **状态管理**: React Context + Hooks
- **图标**: Lucide React
- **通知**: React Hot Toast

## 支持的网络

### 生产网络
- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Polygon**, **Optimism**, **Arbitrum**, **Base**

### 本地测试网络
- **Hardhat Network** (Chain ID: 31337) - http://127.0.0.1:8545
- **Ganache** (Chain ID: 1337) - http://127.0.0.1:7545

## 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn
- MetaMask 浏览器插件

### 1. 安装依赖
```bash
yarn install
# 或
npm install
```

### 2. 环境配置
复制并配置环境变量：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 基本配置
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# 本地开发（可选）
VITE_ENABLE_LOCALHOST=true
VITE_LOCAL_CONTRACT_ADDRESS=0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0
```

### 3. 启动开发服务器
```bash
yarn dev
# 或
npm run dev
```

访问 http://localhost:5173

## 本地测试网络设置

### 使用Hardhat进行本地开发

1. **启动Hardhat网络**
   ```bash
   npx hardhat node
   ```

2. **部署合约**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **配置MetaMask**
   - 网络名称: Hardhat Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - 货币符号: ETH

4. **导入测试账户**
   ```
   私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   🪙 YDToken: 0x3C816e095bc0BfC4C272f6E118D4308CD811E77E
💱 YiDengTokenSwap: 0x6B31cF03e32CD7aCb1b6D6ad9D32651D43F86dBC
📚 CourseManager: 0xFB44007b2660D8750b5F6083d9e983ad5f34eF3c

测试
🪙 YDToken: 0x0114c7581Aa89eb017A775DEB7407fC2dA1e986c
💱 YiDengTokenSwap: 0x374aFE014E74198Cd1BaC25F8C6D5Bc629eC4EFC
📚 CourseManager: 0x7D336A8d1fe78F7589CD7df534876887a640BEf9
   ```

详细设置请参考 [LOCAL_TESTNET_SETUP.md](./LOCAL_TESTNET_SETUP.md)

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   └── common/         # 通用组件
├── contexts/           # React Context
├── hooks/             # 自定义 Hooks
│   └── useTokenSwap.ts # 代币兑换hook
├── pages/             # 页面组件
│   ├── CourseListing/ # 课程列表
│   ├── CreateCourse/  # 创建课程
│   ├── TokenSwap/     # 代币兑换页面
│   ├── Financial/     # 理财中心
│   └── Profile/       # 个人中心
├── config/            # 配置文件
│   ├── web3.ts        # Web3网络配置
│   └── tokenSwap.ts   # 代币兑换配置
└── utils/             # 工具函数
```

## 主要页面

### 🏠 课程市场 (`/`)
- 浏览所有可用课程
- 按分类、价格筛选
- 课程搜索功能

### 🔄 代币兑换 (`/token-swap`)
- ETH ↔ 一灯币双向兑换
- 实时兑换率显示
- 滑点保护设置
- 流动性池状态监控
- 网络状态指示器

### ➕ 创建课程 (`/create-course`)
- 填写课程信息
- 设置价格和分类
- 铸造课程 NFT

### 💼 理财中心 (`/financial`)
- 资产余额概览
- 代币兑换快速入口
- 一灯币余额显示
- 交易历史记录

### 👤 个人中心 (`/profile`)
- 个人资料管理
- 已购买课程
- 收益统计

## 智能合约

### 一灯币兑换合约
- **合约地址**: `0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0`
- **功能**: ETH与一灯币的双向兑换
- **特性**: 手续费机制、滑点保护、暂停功能、重入攻击保护

详细信息请参考 [TOKEN_SWAP.md](./TOKEN_SWAP.md)

## 开发工具

### DevTools（开发环境）
在开发环境中，右下角会显示开发工具按钮，提供：
- 当前网络状态监控
- 合约地址快速查看和复制
- 兑换率和手续费实时显示
- 流动性池状态监控
- 区块浏览器快速跳转

### 网络自动检测
应用自动检测并适配不同网络：
- 主网和测试网自动识别
- 本地网络智能检测
- 合约可用性自动验证
- 网络切换提示

## 环境变量

```env
# WalletConnect配置
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# 本地开发配置
VITE_ENABLE_LOCALHOST=true
VITE_LOCAL_CONTRACT_ADDRESS=0x你的本地合约地址

# 网络合约地址配置
VITE_MAINNET_YD_TOKEN_SWAP_ADDRESS=0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0
VITE_SEPOLIA_YD_TOKEN_SWAP_ADDRESS=0x5b8721Cbe813d85706536c08a08e97f3Cc81BFa0

# Hardhat本地网络
VITE_HARDHAT_RPC_URL=http://127.0.0.1:8545
VITE_HARDHAT_CHAIN_ID=31337

# Ganache本地网络
VITE_GANACHE_RPC_URL=http://127.0.0.1:7545
VITE_GANACHE_CHAIN_ID=1337
```

## 构建和部署

### 本地构建
```bash
yarn build
```

### Vercel部署
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署

### 生产环境注意事项
```env
# 生产环境禁用本地网络
VITE_ENABLE_LOCALHOST=false
```

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查MetaMask是否安装
   - 确认选择了正确的网络
   - 刷新页面重试

2. **合约不可用**
   - 确认当前网络支持该合约
   - 检查合约地址配置
   - 验证合约部署状态

3. **本地网络连接问题**
   - 确认本地网络正在运行 (`npx hardhat node`)
   - 检查端口配置 (8545/7545)
   - 验证MetaMask网络设置

4. **代币兑换失败**
   - 检查余额是否足够
   - 确认代币已授权
   - 调整滑点容差
   - 查看开发者控制台错误信息

## 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 组件采用函数式写法
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规范

### 样式规范
- 使用 Tailwind CSS 工具类
- 响应式设计优先
- 组件样式模块化

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

## 测试

### 单元测试
```bash
yarn test
```

### E2E测试
```bash
yarn test:e2e
```

### 本地集成测试
1. 启动本地网络
2. 部署测试合约
3. 运行前端应用
4. 执行完整交易流程

## 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥
2. **合约验证**: 确保合约地址正确且已验证
3. **网络检查**: 验证连接到正确的网络
4. **交易确认**: 仔细检查交易参数
5. **授权管理**: 只授权必要的代币数量

## 性能优化

- 使用React.memo优化组件渲染
- 合理使用useCallback和useMemo
- 异步加载非关键组件
- 图片和资源懒加载

## 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支
3. 编写清晰的提交信息
4. 添加必要的测试
5. 更新相关文档
6. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 相关文档

- [代币兑换功能说明](./TOKEN_SWAP.md)
- [本地测试网络配置](./LOCAL_TESTNET_SETUP.md)
- [Sepolia测试网指南](./SEPOLIA_GUIDE.md)
- [样式指南](./STYLING.md)
- [部署指南](./DEPLOYMENT.md)

## 联系我们

- 项目链接: [https://github.com/juzhiqiang/web3-school-frontend](https://github.com/juzhiqiang/web3-school-frontend)
- 问题反馈: [Issues](https://github.com/juzhiqiang/web3-school-frontend/issues)

---

### 🚀 开始您的 Web3 教育之旅！

通过这个平台，教育者可以轻松创建和销售课程，学习者可以安全地购买和学习Web3知识，同时通过一灯币兑换系统享受去中心化金融的便利。让我们一起构建去中心化的教育生态系统！