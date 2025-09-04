# Web3 School Frontend - 课程市场一灯币购买功能

## 功能概述

本次更新完善了课程市场的一灯币购买功能，实现了完整的课程购买流程。

## 主要功能

### 1. 课程列表展示
- ✅ 从本地缓存读取课程数据
- ✅ 显示用户一灯币余额
- ✅ 显示课程价格（一灯币单位）
- ✅ 余额不足时的视觉提示
- ✅ 自动初始化示例课程数据

### 2. 完整购买流程
- ✅ **第一步：授权 (approve)** - 授权一灯币给课程合约
- ✅ **第二步：购买** - 使用一灯币支付课程费用
- ✅ **第三步：访问控制** - 只有购买后才能查看完整课程内容

### 3. 用户体验优化
- ✅ 购买进度指示器
- ✅ 实时余额检查
- ✅ 详细的错误提示
- ✅ 购买状态跟踪
- ✅ Toast 通知系统

## 技术实现

### 新增文件
1. **`src/hooks/useCoursePurchase.ts`** - 课程购买流程管理
2. **`src/components/PurchaseStepIndicator/PurchaseStepIndicator.tsx`** - 购买进度指示器
3. **`src/utils/courseDataInit.ts`** - 课程数据初始化工具

### 修改文件
1. **`src/pages/CourseListing/CourseListing.tsx`** - 从缓存读取课程，显示余额
2. **`src/pages/CourseDetails/CourseDetails.tsx`** - 完整的购买流程和访问控制
3. **`src/config/yidengToken.ts`** - 添加课程合约地址和工具函数
4. **`src/types/courseTypes.ts`** - 完善课程数据类型定义
5. **`src/App.tsx`** - 添加 Toast 通知组件

## 购买流程详解

### 1. 授权阶段 (Approve)
```typescript
// 检查当前授权额度
const allowance = await checkTokenAllowance(courseContractAddress);

// 如果授权不足，请求用户授权
if (allowanceNum < priceNum) {
  await approveToken(courseContractAddress, price);
}
```

### 2. 购买阶段 (Purchase)
```typescript
// 调用课程合约的购买函数
await enrollInCourse(courseId, price);

// 记录购买到本地缓存
recordPurchase(courseId, address, purchaseData);
```

### 3. 访问控制
```typescript
// 检查是否可以访问课程内容
const canAccessLesson = (lesson) => {
  return lesson.isPreview || isEnrolled;
};
```

## 智能合约集成

### 使用的合约地址
- **一灯币合约**: `0x651EFdE2d1FC77c2F247B6fe42c09648caB69882`
- **课程管理合约**: `0xea6e47911B5f76B81B2a18E8C674380372295f9C`

### 主要合约函数
- `approve(spender, amount)` - 授权代币
- `enrollInCourse(courseId)` - 购买课程
- `getAllCourseIds()` - 获取所有课程ID
- `getStudentCourses(student)` - 获取学生购买的课程

## 数据存储策略

### 本地缓存结构
```
localStorage:
  course_[id] -> Course 课程数据
  purchase_[address]_[courseId] -> Purchase 购买记录
```

### 示例课程
系统自动初始化5门示例课程：
1. 区块链基础入门 (10 YD)
2. DeFi协议深入解析 (25 YD)
3. 智能合约开发实战 (50 YD)
4. NFT项目开发指南 (30 YD)
5. Web3前端开发实践 (35 YD)

## 用户界面特性

### 课程列表页面
- 余额显示和不足提示
- 课程卡片优化设计
- 购买流程说明
- 响应式布局

### 课程详情页面
- 视频播放器（模拟）
- 购买进度指示器
- 实时余额检查
- 章节访问控制
- 免费预览功能

## 安全特性

1. **授权机制**: 用户需要先授权代币才能购买
2. **余额检查**: 实时检查用户一灯币余额
3. **访问控制**: 未购买用户无法访问付费内容
4. **错误处理**: 完善的错误提示和重试机制
5. **状态管理**: 防止重复购买和状态混乱

## 开发说明

### 环境要求
- Node.js 16+
- 支持 MetaMask 或其他 Web3 钱包
- 一灯币代币合约已部署

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 测试购买流程
1. 连接 MetaMask 钱包
2. 确保有足够的一灯币余额
3. 浏览课程列表，选择课程
4. 查看课程详情，点击购买
5. 授权一灯币给课程合约
6. 确认购买交易
7. 购买完成后可访问所有课程内容

## 注意事项

1. **网络配置**: 确保连接正确的区块链网络
2. **合约地址**: 验证一灯币和课程合约地址正确
3. **Gas 费用**: 购买过程需要支付网络 Gas 费用
4. **浏览器缓存**: 课程数据存储在浏览器本地，清除缓存会丢失数据
5. **钱包授权**: 每次授权只针对特定金额，大额购买可能需要重新授权

## 故障排除

### 常见问题
1. **授权失败**: 检查网络连接和钱包状态
2. **购买失败**: 确认余额充足且授权正确
3. **课程不显示**: 检查本地缓存和网络连接
4. **无法访问**: 确认已完成购买流程

### 开发调试
```javascript
// 重置课程数据（开发用）
import { resetCourseData } from './src/utils/courseDataInit';
resetCourseData();

// 查看本地存储
console.log('Courses:', getAllCourses());
console.log('Purchases:', getPurchasedCourseIds(address));
```

## 更新日志

### v1.0.0 (2025-09-04)
- ✅ 实现一灯币授权和购买流程
- ✅ 添加本地缓存课程数据读取
- ✅ 完善用户界面和体验
- ✅ 添加购买进度指示器
- ✅ 实现访问控制机制

---

**注意**: 此功能需要连接支持的区块链网络并拥有一灯币代币才能正常使用购买功能。
