# 本地测试网络配置指南

## 概述

本项目支持连接到本地测试网络（Hardhat/Ganache），方便开发者在本地环境中测试一灯币兑换功能。

## 支持的本地网络

### 1. Hardhat Network
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **默认端口**: 8545

### 2. Ganache
- **Chain ID**: 1337
- **RPC URL**: http://127.0.0.1:7545
- **默认端口**: 7545

## 环境配置

### 1. 启用本地网络
在 `.env` 文件中设置：
```env
VITE_ENABLE_LOCALHOST=true
VITE_LOCAL_CONTRACT_ADDRESS=0x你的合约地址
```

### 2. 完整环境变量
```env
# 启用本地网络
VITE_ENABLE_LOCALHOST=true

# 本地合约地址（部署后替换为实际地址）
VITE_LOCAL_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Hardhat配置
VITE_HARDHAT_RPC_URL=http://127.0.0.1:8545
VITE_HARDHAT_CHAIN_ID=31337

# Ganache配置  
VITE_GANACHE_RPC_URL=http://127.0.0.1:7545
VITE_GANACHE_CHAIN_ID=1337
```

## 快速设置步骤

### 使用Hardhat

1. **启动Hardhat网络**
   ```bash
   npx hardhat node
   ```

2. **部署合约**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **获取合约地址**
   部署成功后，复制输出的合约地址到 `VITE_LOCAL_CONTRACT_ADDRESS`

4. **连接MetaMask**
   - 网络名称: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - 货币符号: ETH

### 使用Ganache

1. **启动Ganache**
   ```bash
   ganache-cli -p 7545 -i 1337
   ```
   或使用Ganache GUI

2. **部署合约**
   ```bash
   truffle migrate --network development
   ```

3. **连接MetaMask**
   - 网络名称: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - 货币符号: ETH

## MetaMask网络添加

### 添加Hardhat网络
1. 打开MetaMask
2. 点击网络下拉菜单
3. 选择"添加网络"
4. 填入以下信息：
   - **网络名称**: Hardhat Localhost
   - **新RPC URL**: http://127.0.0.1:8545
   - **链ID**: 31337
   - **货币符号**: ETH

### 添加Ganache网络
1. 打开MetaMask
2. 点击网络下拉菜单  
3. 选择"添加网络"
4. 填入以下信息：
   - **网络名称**: Ganache
   - **新RPC URL**: http://127.0.0.1:7545
   - **链ID**: 1337
   - **货币符号**: ETH

## 导入测试账户

### Hardhat默认账户
Hardhat会提供20个测试账户，每个账户有10000 ETH。复制私钥到MetaMask：

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Ganache账户
启动Ganache后，界面会显示可用的测试账户和私钥。

## 合约部署示例

### Hardhat部署脚本 (deploy.js)
```javascript
const { ethers } = require("hardhat");

async function main() {
  // 部署YiDeng Token
  const YiDengToken = await ethers.getContractFactory("YiDengToken");
  const yiDengToken = await YiDengToken.deploy();
  await yiDengToken.deployed();
  
  console.log("YiDeng Token deployed to:", yiDengToken.address);
  
  // 部署TokenSwap合约
  const TokenSwap = await ethers.getContractFactory("YiDengTokenSwap");
  const tokenSwap = await TokenSwap.deploy(yiDengToken.address, 1000); // 1 ETH = 1000 YD
  await tokenSwap.deployed();
  
  console.log("TokenSwap deployed to:", tokenSwap.address);
  
  // 向合约转移一些代币用于流动性
  await yiDengToken.transfer(tokenSwap.address, ethers.utils.parseEther("1000000"));
  
  console.log("Setup complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## 故障排除

### 常见问题

1. **合约地址错误**
   - 确保 `VITE_LOCAL_CONTRACT_ADDRESS` 设置了正确的地址
   - 检查合约是否成功部署

2. **网络连接失败**
   - 确认本地网络正在运行
   - 检查端口是否正确（8545或7545）
   - 确认防火墙没有阻止连接

3. **MetaMask连接问题**
   - 重启MetaMask
   - 清除MetaMask活动和nonce
   - 确认选择了正确的网络

4. **交易失败**
   - 检查账户ETH余额是否足够支付gas费
   - 确认合约中有足够的代币流动性
   - 检查滑点设置是否合理

### 调试技巧

1. **查看控制台日志**
   ```bash
   # 开发模式运行
   npm run dev
   ```

2. **检查网络状态**
   在代币兑换页面查看网络状态指示器

3. **使用浏览器开发工具**
   检查Network标签页中的API调用和错误

## 测试流程

### 完整测试步骤

1. **环境准备**
   ```bash
   # 启动本地网络
   npx hardhat node
   
   # 部署合约
   npx hardhat run scripts/deploy.js --network localhost
   
   # 启动前端
   npm run dev
   ```

2. **钱包设置**
   - 添加本地网络到MetaMask
   - 导入测试账户
   - 确认余额显示正确

3. **测试兑换功能**
   - 测试购买一灯币
   - 测试授权代币
   - 测试出售一灯币
   - 验证余额更新

4. **验证交易**
   - 检查交易哈希
   - 确认余额变化
   - 验证事件日志

## 生产部署注意事项

在生产环境中部署时：

1. **禁用本地网络**
   ```env
   VITE_ENABLE_LOCALHOST=false
   ```

2. **设置正确的合约地址**
   ```env
   VITE_MAINNET_YD_TOKEN_SWAP_ADDRESS=0x实际主网合约地址
   VITE_SEPOLIA_YD_TOKEN_SWAP_ADDRESS=0x实际测试网合约地址
   ```

3. **配置RPC节点**
   使用Infura、Alchemy等服务提供商的RPC URL

4. **安全检查**
   - 移除或注释掉敏感的环境变量
   - 确认合约已通过安全审计
   - 验证前端代码中没有硬编码的私钥或敏感信息
