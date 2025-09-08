// Web3学校平台智能合约ABI
export const WEB3_SCHOOL_CONTRACT_ABI = [
  // 创建课程
  {
    "inputs": [
      { "name": "_title", "type": "string" },
      { "name": "_description", "type": "string" },
      { "name": "_price", "type": "uint256" },
      { "name": "_duration", "type": "string" },
      { "name": "_lessonsData", "type": "string" } // JSON格式的课程数据
    ],
    "name": "createCourse",
    "outputs": [{ "name": "courseId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // 获取课程信息
  {
    "inputs": [{ "name": "_courseId", "type": "uint256" }],
    "name": "getCourse",
    "outputs": [
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "price", "type": "uint256" },
      { "name": "duration", "type": "string" },
      { "name": "creator", "type": "address" },
      { "name": "createdAt", "type": "uint256" },
      { "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // 购买课程
  {
    "inputs": [{ "name": "_courseId", "type": "uint256" }],
    "name": "purchaseCourse",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  // 奖励一灯币
  {
    "inputs": [
      { "name": "_recipient", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "rewardYiDengCoin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // 获取创作者的课程列表
  {
    "inputs": [{ "name": "_creator", "type": "address" }],
    "name": "getCreatorCourses",
    "outputs": [{ "name": "courseIds", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },

  // 获取用户购买的课程
  {
    "inputs": [{ "name": "_user", "type": "address" }],
    "name": "getUserPurchasedCourses",
    "outputs": [{ "name": "courseIds", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },

  // 检查用户是否购买了课程
  {
    "inputs": [
      { "name": "_user", "type": "address" },
      { "name": "_courseId", "type": "uint256" }
    ],
    "name": "hasPurchasedCourse",
    "outputs": [{ "name": "purchased", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },

  // 获取课程统计
  {
    "inputs": [{ "name": "_courseId", "type": "uint256" }],
    "name": "getCourseStats",
    "outputs": [
      { "name": "totalSales", "type": "uint256" },
      { "name": "totalRevenue", "type": "uint256" },
      { "name": "studentCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // 提取创作者收益
  {
    "inputs": [{ "name": "_courseId", "type": "uint256" }],
    "name": "withdrawEarnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // 获取平台统计
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      { "name": "totalCourses", "type": "uint256" },
      { "name": "totalSales", "type": "uint256" },
      { "name": "totalRevenue", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // 事件定义
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "courseId", "type": "uint256" },
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": false, "name": "title", "type": "string" },
      { "indexed": false, "name": "price", "type": "uint256" }
    ],
    "name": "CourseCreated",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "courseId", "type": "uint256" },
      { "indexed": true, "name": "buyer", "type": "address" },
      { "indexed": false, "name": "price", "type": "uint256" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "CoursePurchased",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "recipient", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "reason", "type": "string" }
    ],
    "name": "YiDengCoinRewarded",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": true, "name": "courseId", "type": "uint256" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "EarningsWithdrawn",
    "type": "event"
  }
] as const;


// 一灯币奖励配置
export const YIDENG_REWARDS = {
  CREATE_COURSE: '10', // 创建课程奖励10一灯币
  COMPLETE_COURSE: '5', // 完成课程奖励5一灯币
  FIRST_PURCHASE: '2', // 首次购买奖励2一灯币
  REVIEW_COURSE: '1', // 评价课程奖励1一灯币
} as const;

// 平台费率配置
export const PLATFORM_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 10, // 10% 平台手续费
  MIN_COURSE_PRICE: '0.001', // 最低课程价格 0.001 ETH
  MAX_COURSE_PRICE: '10', // 最高课程价格 10 ETH
} as const;