// 课程合约配置
export const COURSE_CONTRACT_CONFIG = {
  // 合约地址 - 你提供的合约地址
  CONTRACT_ADDRESS: "0x276Aa34b949Ea8C7b9817f21FA50cdd466211597",
  
  // 课程创建奖励
  CREATION_REWARD: "1", // 1 一灯币奖励
  
  // 合约ABI - 课程相关的函数
  CONTRACT_ABI: [
    // 创建课程
    "function createCourse(string memory title, string memory description, string memory detailedDescription, uint256 price, string memory duration, string[] memory tags, string memory thumbnailHash) external returns (uint256)",
    
    // 获取课程信息
    "function getCourse(uint256 courseId) external view returns (tuple(uint256 id, string title, string description, string detailedDescription, uint256 price, string duration, address creator, string[] tags, string thumbnailHash, uint256 createdAt, bool active))",
    
    // 获取用户创建的课程列表
    "function getCoursesByCreator(address creator) external view returns (uint256[] memory)",
    
    // 课程创建事件
    "event CourseCreated(uint256 indexed courseId, address indexed creator, string title, uint256 price)",
    
    // 奖励发放事件
    "event RewardSent(address indexed recipient, uint256 amount)"
  ]
} as const;

// 课程数据结构
export interface CourseContract {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  price: string;
  duration: string;
  creator: string;
  tags: string[];
  thumbnailHash: string;
  createdAt: string;
  active: boolean;
}

// IPFS配置（用于存储课程内容）
export const IPFS_CONFIG = {
  GATEWAY: "https://ipfs.io/ipfs/",
  // 可以使用Pinata或其他IPFS服务
  API_ENDPOINT: "https://api.pinata.cloud/pinning/pinFileToIPFS"
};

export default COURSE_CONTRACT_CONFIG;
