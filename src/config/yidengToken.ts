// 一灯币 (YiDeng Token) 配置
export const YIDENG_TOKEN_CONFIG = {
  // 继承 token swap 配置
  TOKEN_SYMBOL: "YD",
  TOKEN_NAME: "一灯币",
  TOKEN_DECIMALS: 18,
  
  // 课程购买相关配置
  COURSE_PAYMENT: {
    MIN_PRICE: "1",      // 最低课程价格 1 YD
    MAX_PRICE: "10000",  // 最高课程价格 10,000 YD  
    DEFAULT_PRICE: "100", // 默认课程价格 100 YD
  },

  // 平台手续费配置
  PLATFORM_FEE: {
    RATE: 250,          // 2.5% (250/10000)
    BASIS_POINTS: 10000,
  },

  // 合约地址（从 tokenSwap 配置继承）
  CONTRACT_ADDRESSES: {
    1: "0x150Bd46b19B8C5fb27cB53924000998bAd363e72",
    11155111: "0x150Bd46b19B8C5fb27cB53924000998bAd363e72", 
    1337: "0x150Bd46b19B8C5fb27cB53924000998bAd363e72",
  } as const,

  // 课程合约地址（新增，专门用于课程购买）
  COURSE_CONTRACT_ADDRESSES: {
    1: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_MAINNET,
    11155111: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA,
    1337: import.meta.env.VITE_COURSE_CONTRACT_ADDRESS_LOCAL,
  } as const,

  // 支持的网络
  SUPPORTED_CHAINS: [1, 11155111, 1337],
} as const;

// 获取一灯币合约地址
export const getYiDengTokenAddress = (chainId: number): string => {
  const address = YIDENG_TOKEN_CONFIG.CONTRACT_ADDRESSES[
    chainId as keyof typeof YIDENG_TOKEN_CONFIG.CONTRACT_ADDRESSES
  ];
  
  if (!address) {
    throw new Error(`一灯币合约未部署在网络 ${chainId}`);
  }
  
  return address;
};

// 获取课程合约地址
export const getCourseContractAddress = (chainId: number): string => {
  const address = YIDENG_TOKEN_CONFIG.COURSE_CONTRACT_ADDRESSES[
    chainId as keyof typeof YIDENG_TOKEN_CONFIG.COURSE_CONTRACT_ADDRESSES
  ];
  
  if (!address) {
    // 如果没有配置环境变量，返回默认地址
    console.warn(`课程合约未配置在网络 ${chainId}，使用默认地址`);
    return "0x1234567890123456789012345678901234567890";
  }
  
  return address;
};

// 格式化一灯币金额显示
export const formatYiDengAmount = (amount: string | number, decimals: number = 2): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('zh-CN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals 
  });
};

// 验证一灯币金额
export const validateYiDengAmount = (amount: string): { isValid: boolean; error?: string } => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { isValid: false, error: '请输入有效的数字金额' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: '金额必须大于0' };
  }
  
  const minPrice = parseFloat(YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MIN_PRICE);
  const maxPrice = parseFloat(YIDENG_TOKEN_CONFIG.COURSE_PAYMENT.MAX_PRICE);
  
  if (num < minPrice) {
    return { isValid: false, error: `课程价格不能低于 ${minPrice} YD` };
  }
  
  if (num > maxPrice) {
    return { isValid: false, error: `课程价格不能超过 ${formatYiDengAmount(maxPrice)} YD` };
  }
  
  return { isValid: true };
};

// 计算平台手续费
export const calculatePlatformFee = (price: string): string => {
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) return '0';
  
  const feeRate = YIDENG_TOKEN_CONFIG.PLATFORM_FEE.RATE / YIDENG_TOKEN_CONFIG.PLATFORM_FEE.BASIS_POINTS;
  return (priceNum * feeRate).toFixed(2);
};

// 计算创作者收益
export const calculateCreatorRevenue = (price: string): string => {
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) return '0';
  
  const fee = parseFloat(calculatePlatformFee(price));
  return (priceNum - fee).toFixed(2);
};

export default YIDENG_TOKEN_CONFIG;
