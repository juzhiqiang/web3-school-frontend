# 一灯币支付系统集成

## 🪙 一灯币支付概述

现在课程只能使用一灯币(YD Token)进行购买，完全替代ETH支付系统。

## ✨ 新增功能

### 1. 一灯币价格设定
- **价格范围**: 1 - 10,000 YD
- **默认价格**: 100 YD  
- **实时验证**: 自动检查价格合理性
- **收益计算**: 自动计算平台手续费和创作者收益

### 2. 余额显示与检查
- **实时余额**: 显示用户当前一灯币余额
- **余额验证**: 购买前自动检查余额充足性
- **自动刷新**: 交易后自动更新余额显示

### 3. 智能合约集成准备
- **代币授权**: 自动处理ERC-20代币授权流程
- **合约调用**: 预留课程购买合约接口
- **交易状态**: 完整的交易状态跟踪

## 🏗️ 架构变更

### 新增配置文件
- `src/config/yidengToken.ts` - 一灯币专用配置
- `src/hooks/useYiDengToken.ts` - 一灯币余额和操作Hook
- `src/components/common/CoursePurchase.tsx` - 课程购买组件

### 更新的文件
- `src/contexts/Web3Context.tsx` - 添加一灯币余额跟踪
- `src/types/course.ts` - 更新为一灯币价格类型
- `src/pages/CreateCourse/CreateCourse.tsx` - 集成一灯币定价

## 💰 支付流程

### 创作者发布课程
1. 设置课程基本信息
2. 输入一灯币价格（1-10,000 YD）
3. 系统自动计算收益分配：
   - 平台手续费：2.5%
   - 创作者收益：97.5%
4. 发布课程到区块链

### 学员购买课程
1. 查看课程详情和一灯币价格
2. 检查钱包一灯币余额
3. 如需要，先授权代币给课程合约
4. 执行购买交易
5. 获得课程访问权限

## 🔧 技术实现

### 一灯币合约交互
```typescript
// 检查余额
const balance = await tokenContract.balanceOf(userAddress);

// 授权代币
const approveTx = await tokenContract.approve(courseContract, amount);

// 购买课程
const purchaseTx = await courseContract.purchaseCourse(courseId, amount);
```

### 价格验证
```typescript
import { validateYiDengAmount, formatYiDengAmount } from '../config/yidengToken';

const validation = validateYiDengAmount('100');
if (!validation.isValid) {
  console.error(validation.error);
}
```

### 收益计算
```typescript
import { calculatePlatformFee, calculateCreatorRevenue } from '../config/yidengToken';

const fee = calculatePlatformFee('100'); // 2.5 YD
const revenue = calculateCreatorRevenue('100'); // 97.5 YD
```

## 🚀 使用示例

### 1. 创建课程（一灯币定价）
```tsx
import CreateCourse from './pages/CreateCourse/CreateCourse';

// 组件会自动显示一灯币余额和价格设置
<CreateCourse />
```

### 2. 购买课程
```tsx
import { CoursePurchase } from './components/common';

<CoursePurchase 
  course={courseData}
  onPurchaseSuccess={() => {
    // 购买成功后的处理
  }}
/>
```

### 3. 检查用户余额
```tsx
import { useYiDengToken } from './hooks/useYiDengToken';

const { balance, hasEnoughBalance } = useYiDengToken();
const canPurchase = hasEnoughBalance('100'); // 检查是否能购买100 YD的课程
```

## ⚙️ 环境配置

### 1. 复制环境变量文件
```bash
cp .env.example .env.local
```

### 2. 配置合约地址
```env
# 一灯币合约地址
VITE_YIDENG_TOKEN_ADDRESS_MAINNET=0x你的主网合约地址
VITE_YIDENG_TOKEN_ADDRESS_SEPOLIA=0x你的测试网合约地址
VITE_YIDENG_TOKEN_ADDRESS_LOCAL=0x你的本地合约地址

# 课程购买合约地址
VITE_COURSE_CONTRACT_ADDRESS_MAINNET=0x课程合约主网地址
VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA=0x课程合约测试网地址
VITE_COURSE_CONTRACT_ADDRESS_LOCAL=0x课程合约本地地址
```

## 🔒 安全特性

### 1. 价格验证
- 最小/最大价格限制
- 数值格式验证
- 恶意输入防护

### 2. 余额检查
- 购买前余额验证
- 实时余额更新
- 不足余额提醒

### 3. 授权管理
- 最小授权原则
- 交易前授权检查
- 授权状态跟踪

### 4. 交易安全
- Gas费估算
- 交易状态监控
- 错误处理和回滚

## 🔮 智能合约集成

### 课程创建合约示例
```solidity
// CourseFactory.sol
contract CourseFactory {
    IERC20 public yidengToken;
    uint256 public platformFeeRate = 250; // 2.5%
    
    struct Course {
        string title;
        string description;
        uint256 price; // YD amount
        address instructor;
        bool active;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    
    function createCourse(
        string memory title,
        string memory description, 
        uint256 price
    ) external returns (uint256) {
        // 创建课程逻辑
    }
    
    function purchaseCourse(uint256 courseId) external {
        Course memory course = courses[courseId];
        require(course.active, "Course not active");
        require(!hasPurchased[msg.sender][courseId], "Already purchased");
        
        // 转账一灯币
        yidengToken.transferFrom(msg.sender, address(this), course.price);
        
        // 分配收益
        uint256 platformFee = course.price * platformFeeRate / 10000;
        uint256 creatorRevenue = course.price - platformFee;
        
        yidengToken.transfer(course.instructor, creatorRevenue);
        
        hasPurchased[msg.sender][courseId] = true;
    }
}
```

## 📊 数据统计

### 收益分析
- 课程总销售额（YD）
- 平台手续费收入（YD）
- 创作者总收益（YD）
- 学员购买分析

### 使用统计
- 一灯币交易量
- 热门课程排行
- 价格分布分析
- 用户留存率

## 🎯 后续优化建议

### 1. 功能增强
- [ ] 批量购买优惠
- [ ] 会员订阅制度
- [ ] 课程打包销售
- [ ] 限时折扣活动

### 2. 用户体验
- [ ] 价格转换显示（YD ⇄ USD）
- [ ] 购买历史查询
- [ ] 收益提现功能
- [ ] 移动端优化

### 3. 安全提升
- [ ] 多重签名钱包支持
- [ ] 冷钱包集成
- [ ] 交易监控告警
- [ ] 反欺诈检测

现在您的Web3学校平台完全基于一灯币支付系统！🎉
