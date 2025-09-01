# Sepolia测试网络配置指南

## 🔧 配置Sepolia测试网络

### 1. 在MetaMask中添加Sepolia网络

Sepolia网络通常已经内置在MetaMask中，如果没有，可以手动添加：

**网络配置信息：**
- 网络名称: `Sepolia Test Network`
- RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- 链ID: `11155111`
- 货币符号: `ETH`
- 区块链浏览器: `https://sepolia.etherscan.io`

### 2. 获取Sepolia测试ETH

**免费获取测试ETH的水龙头：**
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

**使用步骤：**
1. 连接您的MetaMask钱包
2. 确保已切换到Sepolia网络
3. 复制您的钱包地址
4. 在水龙头网站粘贴地址并申请测试ETH
5. 等待几分钟，测试ETH就会到账

### 3. 环境变量配置

在 `.env` 文件中配置您的合约地址：

```env
# Sepolia测试网络合约地址
VITE_SEPOLIA_YD_TOKEN_ADDRESS=0x你的代币合约地址
VITE_SEPOLIA_COURSE_NFT_ADDRESS=0x你的NFT合约地址
VITE_SEPOLIA_COURSE_MARKETPLACE_ADDRESS=0x你的市场合约地址

# Sepolia RPC (可选，使用Infura或其他服务)
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/你的INFURA_KEY
```

### 4. 支持的网络列表

当前配置支持以下网络：
- ✅ **以太坊主网** (Mainnet) - 生产环境
- ✅ **Sepolia测试网** - 开发和测试
- ✅ **Polygon** - 低费用交易
- ✅ **Optimism** - 以太坊L2扩容
- ✅ **Arbitrum** - 以太坊L2扩容  
- ✅ **Base** - Coinbase L2网络

### 5. 网络切换功能

**自动检测：**
- 应用会自动检测当前连接的网络
- 如果连接到测试网络，会显示黄色警告提示
- 支持在钱包中手动切换网络

**测试网络提示：**
- 当连接到Sepolia时，页面右上角会显示"⚠️ 测试网络"提示
- 提醒用户当前是测试环境，交易不会产生真实费用

### 6. 开发建议

**开发阶段：**
1. 首先在Sepolia测试网络上部署和测试合约
2. 使用测试ETH进行所有功能测试
3. 确保所有功能正常后再部署到主网

**注意事项：**
- 测试网络的ETH没有价值，只用于测试
- 合约地址在不同网络上是不同的
- 建议先在测试网络充分测试再上主网

## 🚀 快速开始测试

1. **连接钱包** → 点击"连接钱包"按钮
2. **切换网络** → 在钱包中选择Sepolia测试网络
3. **获取测试ETH** → 使用上述水龙头获取测试币
4. **开始测试** → 现在可以在测试环境中使用所有功能

## 💡 开发提示

- 在开发过程中，建议默认使用Sepolia网络
- 所有智能合约交互都应该支持多网络
- 可以通过 `useChainId()` hook获取当前网络ID
- 使用 `getContractAddress()` 工具函数获取对应网络的合约地址
