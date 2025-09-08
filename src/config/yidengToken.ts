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
    1: "",
    11155111: "0x3C816e095bc0BfC4C272f6E118D4308CD811E77E", 
    1337: "0x0114c7581Aa89eb017A775DEB7407fC2dA1e986c",
  } as const,

  // 课程合约地址（使用courseContract.ts中的地址）
  COURSE_CONTRACT_ADDRESSES: {
    1: "",
    11155111: "0xFB44007b2660D8750b5F6083d9e983ad5f34eF3c",
    1337: "0x7D336A8d1fe78F7589CD7df534876887a640BEf9",
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
    // 使用courseContract.ts中的固定地址作为默认值
    console.warn(`课程合约未配置在网络 ${chainId}，使用默认地址`);
    return "0xFB44007b2660D8750b5F6083d9e983ad5f34eF3c";
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

// 检查用户余额是否足够购买课程
export const canAffordCourse = (userBalance: string | null, coursePrice: string): boolean => {
  if (!userBalance) return false;
  
  const balanceNum = parseFloat(userBalance);
  const priceNum = parseFloat(coursePrice);
  
  return !isNaN(balanceNum) && !isNaN(priceNum) && balanceNum >= priceNum;
};

// 格式化用于显示的价格字符串
export const formatCoursePrice = (price: string): string => {
  return `${formatYiDengAmount(price)} YD`;
};

export default YIDENG_TOKEN_CONFIG;
