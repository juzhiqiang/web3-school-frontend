// AAVE V3 配置文件
export const AAVE_CONFIG = {
  // 支持的网络
  SUPPORTED_NETWORKS: {
    1: 'mainnet',
    11155111: 'sepolia',
    1337: 'ganache',
  },

  // 主网配置
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    // AAVE V3 Pool 合约地址
    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    // AAVE V3 Pool Data Provider
    poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    // USDT 代币地址
    usdtAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    // aUSDT 代币地址 (利息代币)
    aUsdtAddress: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a',
    // 区块浏览器
    explorerUrl: 'https://etherscan.io',
  },

  SEPOLIA: {
    chainId: 137,
    name: 'Polygon',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    aUsdtAddress: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    explorerUrl: 'https://polygonscan.com',
  },

  // Arbitrum 配置
  ARBITRUM: {
    chainId: 42161,
    name: 'Arbitrum One',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    usdtAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    aUsdtAddress: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    explorerUrl: 'https://arbiscan.io',
  },

  // 测试网络配置
  GANACHE: {
    chainId: 5,
    name: 'Goerli Testnet',
    poolAddress: '0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6',
    poolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
    usdtAddress: '0x65aFADD39029741B3b8f0756952C74678c9cEC93', // Goerli USDT
    aUsdtAddress: '0x73258E6FB96ecAc8a979826d503B45803a382d68',
    explorerUrl: 'https://goerli.etherscan.io',
  },

  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_NOT_SUPPORTED: '当前网络不支持AAVE协议',
    INSUFFICIENT_BALANCE: 'USDT余额不足',
    INSUFFICIENT_ALLOWANCE: '需要先授权USDT给AAVE协议',
    INVALID_AMOUNT: '请输入有效的金额',
    TRANSACTION_FAILED: '交易失败，请重试',
    APPROVAL_FAILED: '授权失败，请重试',
    SUPPLY_FAILED: '质押失败，请重试',
    WITHDRAW_FAILED: '提取失败，请重试',
    NO_DEPOSITS: '您没有任何AAVE存款',
    AMOUNT_EXCEEDS_BALANCE: '提取金额超过可用余额',
  },

  // 默认配置
  DEFAULT_REFERRAL_CODE: 0,
  MIN_HEALTH_FACTOR: 1.5, // 最低健康系数
  DEFAULT_SLIPPAGE: 0.5, // 默认滑点 0.5%
  
  // 利率模式
  INTEREST_RATE_MODE: {
    STABLE: 1,
    VARIABLE: 2,
  },
};

// AAVE Pool ABI - 仅包含我们需要的方法
export const AAVE_POOL_ABI = [
  // 供应/质押
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' },
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // 提取
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // 获取用户账户数据
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// AAVE Data Provider ABI - 用于获取储备数据
export const AAVE_DATA_PROVIDER_ABI = [
  // 获取储备代币地址
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveTokensAddresses',
    outputs: [
      { name: 'aTokenAddress', type: 'address' },
      { name: 'stableDebtTokenAddress', type: 'address' },
      { name: 'variableDebtTokenAddress', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // 获取用户储备数据
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserReserveData',
    outputs: [
      { name: 'currentATokenBalance', type: 'uint256' },
      { name: 'currentStableDebt', type: 'uint256' },
      { name: 'currentVariableDebt', type: 'uint256' },
      { name: 'principalStableDebt', type: 'uint256' },
      { name: 'scaledVariableDebt', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'stableRateLastUpdated', type: 'uint40' },
      { name: 'usageAsCollateralEnabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // 获取储备数据
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      { name: 'unbacked', type: 'uint256' },
      { name: 'accruedToTreasuryScaled', type: 'uint128' },
      { name: 'totalAToken', type: 'uint128' },
      { name: 'totalStableDebt', type: 'uint128' },
      { name: 'totalVariableDebt', type: 'uint128' },
      { name: 'liquidityRate', type: 'uint128' },
      { name: 'variableBorrowRate', type: 'uint128' },
      { name: 'stableBorrowRate', type: 'uint128' },
      { name: 'averageStableBorrowRate', type: 'uint128' },
      { name: 'liquidityIndex', type: 'uint128' },
      { name: 'variableBorrowIndex', type: 'uint128' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// ERC20 ABI for USDT
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// 根据链ID获取配置
export const getAaveConfig = (chainId: number) => {
  switch (chainId) {
    case 1:
      return AAVE_CONFIG.MAINNET;
    case 5:
      return AAVE_CONFIG.GOERLI;
    case 137:
      return AAVE_CONFIG.POLYGON;
    case 42161:
      return AAVE_CONFIG.ARBITRUM;
    default:
      return null;
  }
};

// 检查网络是否支持AAVE
export const isAaveSupported = (chainId: number): boolean => {
  return chainId in AAVE_CONFIG.SUPPORTED_NETWORKS;
};

// 格式化数字为可读格式
export const formatNumber = (value: string | number, decimals: number = 6): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(decimals);
};

// 格式化利率 (从 Ray 单位转换为百分比)
export const formatApy = (rayRate: string): string => {
  // AAVE使用Ray单位 (1e27)，需要转换为年利率百分比
  const rate = parseFloat(rayRate) / 1e27;
  const apy = rate * 100;
  return apy.toFixed(2);
};
