# 环境变量配置与错误修复

## 🚨 常见错误修复

### 1. process is not defined 错误
已修复：将 `process.env` 改为 `import.meta.env`（Vite 专用语法）

### 2. 环境变量配置步骤

#### 步骤1：创建环境变量文件
```bash
# 在项目根目录创建 .env.local 文件
cp .env.example .env.local
```

#### 步骤2：配置合约地址
编辑 `.env.local` 文件：

```env
# 一灯币合约地址（使用您的实际合约地址）
VITE_YIDENG_TOKEN_ADDRESS_MAINNET=0x3AEc18B0101d56a75f788a6C1F24eF4D5661888d
VITE_YIDENG_TOKEN_ADDRESS_SEPOLIA=0x3AEc18B0101d56a75f788a6C1F24eF4D5661888d
VITE_YIDENG_TOKEN_ADDRESS_LOCAL=0x3AEc18B0101d56a75f788a6C1F24eF4D5661888d

# 课程合约地址（需要部署课程购买合约后填入）
VITE_COURSE_CONTRACT_ADDRESS_MAINNET=0x1234567890123456789012345678901234567890
VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA=0x1234567890123456789012345678901234567890
VITE_COURSE_CONTRACT_ADDRESS_LOCAL=0x1234567890123456789012345678901234567890
```

#### 步骤3：重启开发服务器
```bash
npm run dev
```

## 🔧 修复内容

### 1. yidengToken.ts
- ✅ 将 `process.env` 改为 `import.meta.env`
- ✅ 添加默认值处理，避免未定义错误
- ✅ 增加错误处理和警告信息
- ✅ 改进金额格式化和验证

### 2. vite-env.d.ts
- ✅ 添加完整的环境变量类型定义
- ✅ 支持 TypeScript 智能提示
- ✅ 确保类型安全

### 3. 默认行为
- 🔄 如果环境变量未配置，使用默认合约地址
- ⚠️ 显示警告信息，提示配置环境变量
- 🛡️ 防止应用因配置问题崩溃

## 🎯 配置验证

### 检查环境变量是否生效
在浏览器控制台运行：
```javascript
console.log('环境变量配置:', {
  tokenMainnet: import.meta.env.VITE_YIDENG_TOKEN_ADDRESS_MAINNET,
  courseMainnet: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_MAINNET
});
```

### 验证一灯币配置
```javascript
import { getYiDengTokenAddress } from './config/yidengToken';
console.log('一灯币合约地址:', getYiDengTokenAddress(11155111));
```

## 🚀 现在可以正常运行

所有环境变量错误都已修复：
- ✅ `process is not defined` 错误已解决
- ✅ 环境变量正确配置
- ✅ TypeScript 类型支持
- ✅ 默认值兜底机制

运行 `npm run dev` 应该不会再出现环境变量相关的错误了！
