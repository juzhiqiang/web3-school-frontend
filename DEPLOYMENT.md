# Web3 School 前端部署指南

## 🚀 快速开始

### 1. 环境准备
- Node.js 16+ 
- npm 或 yarn
- MetaMask 浏览器插件

### 2. 安装依赖
```bash
# 克隆仓库
git clone https://github.com/juzhiqiang/web3-school-frontend.git
cd web3-school-frontend

# 安装依赖
npm install
# 或
yarn install
```

### 3. 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置必要的环境变量：

#### 🔑 WalletConnect Project ID
- 访问 https://cloud.walletconnect.com/
- 创建新项目，获取 Project ID
- 在 `.env.local` 中设置 `VITE_WALLETCONNECT_PROJECT_ID`

#### 📝 智能合约地址
部署智能合约后，将合约地址填入：
```env
VITE_YD_TOKEN_ADDRESS=0x你的YD代币合约地址
VITE_COURSE_NFT_ADDRESS=0x你的课程NFT合约地址  
VITE_COURSE_MARKETPLACE_ADDRESS=0x你的课程市场合约地址
```

### 4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:5173

## 📦 生产环境部署

### 构建项目
```bash
npm run build
# 或  
yarn build
```

构建文件将生成在 `dist/` 目录中。

### 部署选项

#### 1. Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### 2. Netlify 部署
- 连接 GitHub 仓库
- 构建命令：`npm run build`
- 发布目录：`dist`

#### 3. IPFS 部署
```bash
# 安装 IPFS
npm install -g ipfs

# 添加构建文件到 IPFS
ipfs add -r dist/
```

## 🔧 功能配置

### MetaMask 网络配置
确保 MetaMask 已添加以下网络：
- Ethereum Mainnet
- Sepolia Testnet (测试用)
- Polygon (可选)
- BSC (可选)

### 智能合约部署
需要部署以下合约：
1. **YD Token** - ERC20 代币合约
2. **Course NFT** - ERC721 课程 NFT 合约  
3. **Course Marketplace** - 课程市场合约

### IPFS 配置
- 课程内容存储在 IPFS
- 可使用 Pinata 或 Infura IPFS 服务
- 配置 `VITE_IPFS_GATEWAY` 环境变量

## 🧪 测试

### 运行测试
```bash
npm run test
# 或
yarn test
```

### 测试覆盖率
```bash
npm run test:coverage
# 或
yarn test:coverage
```

## 📋 功能检查清单

部署前请确认以下功能正常：

### ✅ 基础功能
- [ ] MetaMask 连接
- [ ] 网络切换
- [ ] 钱包余额显示

### ✅ 课程功能  
- [ ] 课程列表加载
- [ ] 课程搜索筛选
- [ ] 课程详情显示
- [ ] 课程创建(作者)
- [ ] 课程购买

### ✅ DeFi 功能
- [ ] YD → ETH 兑换
- [ ] ETH → USDT 兑换  
- [ ] USDT 质押到 AAVE
- [ ] 质押收益查看

### ✅ 个人中心
- [ ] 个人资料编辑
- [ ] MetaMask 签名验证
- [ ] 已购课程查看
- [ ] 已创建课程管理

## 🐛 常见问题

### 1. MetaMask 连接失败
- 检查是否安装 MetaMask
- 确认网络配置正确
- 清除浏览器缓存

### 2. 交易失败
- 检查 Gas 费设置
- 确认合约地址正确
- 验证代币余额充足

### 3. IPFS 加载慢
- 更换 IPFS 网关
- 使用 CDN 加速
- 本地 IPFS 节点

### 4. 构建错误
- 检查 Node.js 版本
- 清除 node_modules 重新安装
- 验证环境变量配置

## 🔒 安全注意事项

### 环境变量安全
- 不要提交 `.env.local` 到版本控制
- API 密钥使用服务器端代理
- 生产环境使用 HTTPS

### 智能合约安全
- 合约部署前进行安全审计
- 使用多重签名钱包
- 设置合理的权限控制

### 前端安全
- 输入数据验证
- XSS 防护
- CSRF 保护

## 📞 技术支持

如遇问题，请通过以下方式获取帮助：
- 📧 Email: support@web3school.io
- 💬 Discord: https://discord.gg/web3school
- 📚 文档: https://docs.web3school.io
- 🐛 Issues: https://github.com/juzhiqiang/web3-school-frontend/issues

---
**Web3 School** - 让区块链教育更加去中心化和有价值 🚀
