import { Course } from '../types/courseTypes';
import { saveCourse, getAllCourses } from './courseStorage';

// 示例课程数据
const sampleCourses: Course[] = [
  {
    id: 'course_1',
    title: '区块链基础入门',
    description: '从零开始学习区块链技术，了解比特币、以太坊的工作原理，掌握智能合约基础知识。',
    detailedDescription: '这是一门全面的区块链入门课程，专为零基础学员设计。通过本课程，你将系统性地学习区块链的核心概念、技术原理和实际应用。课程内容涵盖了从比特币的诞生背景到以太坊智能合约的开发，从加密货币的工作机制到DeFi生态系统的运作模式。\n\n课程特色：\n• 零基础友好，循序渐进的学习路径\n• 理论与实践相结合，提供真实案例分析\n• 配备完整的学习资料和作业练习\n• 讲师在线答疑，学习社群支持',
    price: '10',
    duration: '10小时',
    difficulty: '初级',
    instructorName: 'Alice Chen',
    instructorAddress: '0x1234567890123456789012345678901234567890',
    instructorBio: '区块链技术专家，拥有5年以上智能合约开发经验，曾参与多个DeFi项目的架构设计。',
    rating: 4.8,
    reviews: 42,
    enrollmentCount: 156,
    language: '中文',
    thumbnailHash: 'https://via.placeholder.com/800x450?text=区块链基础入门课程&bg=4F46E5&color=white',
    tags: ['区块链', '比特币', '以太坊', '智能合约', '入门'],
    createdAt: new Date('2024-01-15'),
    lessons: [
      { 
        id: 1, 
        title: '区块链技术概述', 
        duration: '45分钟', 
        description: '了解区块链的基本概念、发展历史和核心特征',
        videoUrl: 'https://example.com/lesson1.mp4',
        isPreview: true 
      },
      { 
        id: 2, 
        title: '比特币的诞生与原理', 
        duration: '60分钟', 
        description: '深入了解比特币的创造背景、技术原理和运作机制',
        videoUrl: 'https://example.com/lesson2.mp4',
        isPreview: false 
      },
      { 
        id: 3, 
        title: '以太坊和智能合约', 
        duration: '75分钟', 
        description: '学习以太坊平台和智能合约的基础知识',
        videoUrl: 'https://example.com/lesson3.mp4',
        isPreview: false 
      }
    ]
  },
  {
    id: 'course_2',
    title: 'DeFi协议深入解析',
    description: '深入学习去中心化金融协议，包括Uniswap、Compound、Aave等主流DeFi应用。',
    detailedDescription: '本课程将带你深入DeFi的核心世界，系统学习主流去中心化金融协议的工作原理和使用方法。\n\n你将学会：\n• Uniswap自动化做市商原理\n• Compound借贷协议机制\n• Aave闪电贷技术\n• 流动性挖矿策略\n• DeFi风险管理',
    price: '25',
    duration: '15小时',
    difficulty: '中级',
    instructorName: 'Bob Li',
    instructorAddress: '0x2345678901234567890123456789012345678901',
    instructorBio: 'DeFi协议专家，参与过多个知名DeFi项目的设计与开发，拥有丰富的智能合约安全审计经验。',
    rating: 4.9,
    reviews: 28,
    enrollmentCount: 89,
    language: '中文',
    thumbnailHash: 'https://via.placeholder.com/800x450?text=DeFi协议深入解析&bg=059669&color=white',
    tags: ['DeFi', 'Uniswap', 'Compound', 'Aave', '流动性'],
    createdAt: new Date('2024-02-01'),
    lessons: [
      { 
        id: 1, 
        title: 'DeFi生态系统概述', 
        duration: '30分钟', 
        description: 'DeFi的发展历程和生态全景',
        isPreview: true 
      },
      { 
        id: 2, 
        title: 'Uniswap深度解析', 
        duration: '90分钟', 
        description: '自动化做市商原理和实践',
        isPreview: false 
      },
      { 
        id: 3, 
        title: 'Compound借贷协议', 
        duration: '75分钟', 
        description: '去中心化借贷的核心机制',
        isPreview: false 
      }
    ]
  },
  {
    id: 'course_3',
    title: '智能合约开发实战',
    description: '从零开始学习Solidity编程，开发和部署你的第一个智能合约。',
    detailedDescription: '这是一门实践导向的智能合约开发课程，从Solidity基础语法开始，逐步深入到复杂的DApp开发。\n\n课程包含：\n• Solidity语言基础\n• 智能合约设计模式\n• 安全最佳实践\n• 测试和部署\n• 实际项目开发',
    price: '50',
    duration: '20小时',
    difficulty: '高级',
    instructorName: 'Carol Wang',
    instructorAddress: '0x3456789012345678901234567890123456789012',
    instructorBio: '资深Solidity开发者，区块链安全专家，拥有多年智能合约开发和安全审计经验。',
    rating: 4.7,
    reviews: 35,
    enrollmentCount: 234,
    language: '中文',
    thumbnailHash: 'https://via.placeholder.com/800x450?text=智能合约开发实战&bg=DC2626&color=white',
    tags: ['Solidity', '智能合约', '开发', '编程', '实战'],
    createdAt: new Date('2024-02-15'),
    lessons: [
      { 
        id: 1, 
        title: 'Solidity开发环境搭建', 
        duration: '20分钟', 
        description: '配置开发环境和工具',
        isPreview: true 
      },
      { 
        id: 2, 
        title: 'Solidity基础语法', 
        duration: '120分钟', 
        description: '学习Solidity编程语法',
        isPreview: false 
      },
      { 
        id: 3, 
        title: '智能合约设计模式', 
        duration: '90分钟', 
        description: '掌握常用的设计模式',
        isPreview: false 
      }
    ]
  },
  {
    id: 'course_4',
    title: 'NFT项目开发指南',
    description: '学习如何创建、发布和营销你自己的NFT项目，包含完整的技术和商业策略。',
    detailedDescription: 'NFT已成为数字经济的重要组成部分。本课程将教你如何从技术和商业两个维度成功创建NFT项目。\n\n内容涵盖：\n• NFT技术原理和标准\n• 智能合约开发\n• 前端界面设计\n• 营销和社区建设\n• 法律合规考虑',
    price: '30',
    duration: '12小时',
    difficulty: '中级',
    instructorName: 'David Zhou',
    instructorAddress: '0x4567890123456789012345678901234567890123',
    instructorBio: 'NFT项目创始人，成功运营过多个NFT项目，在数字艺术和区块链交叉领域有深入研究。',
    rating: 4.6,
    reviews: 18,
    enrollmentCount: 67,
    language: '中文',
    thumbnailHash: 'https://via.placeholder.com/800x450?text=NFT项目开发指南&bg=7C3AED&color=white',
    tags: ['NFT', '数字艺术', '创业', '营销', '合约开发'],
    createdAt: new Date('2024-03-01'),
    lessons: [
      { 
        id: 1, 
        title: 'NFT技术基础', 
        duration: '25分钟', 
        description: 'NFT的技术原理和应用场景',
        isPreview: true 
      },
      { 
        id: 2, 
        title: 'NFT合约开发', 
        duration: '100分钟', 
        description: '开发自己的NFT智能合约',
        isPreview: false 
      },
      { 
        id: 3, 
        title: '项目启动与营销', 
        duration: '80分钟', 
        description: 'NFT项目的启动和推广策略',
        isPreview: false 
      }
    ]
  },
  {
    id: 'course_5',
    title: 'Web3前端开发实践',
    description: '学习如何构建与区块链交互的现代Web应用，掌握Web3.js、ethers.js等核心技术。',
    detailedDescription: '随着Web3的兴起，前端开发者需要掌握与区块链交互的新技能。本课程将教你如何构建现代化的DApp前端。\n\n核心技术栈：\n• React + TypeScript\n• ethers.js / Web3.js\n• MetaMask集成\n• IPFS文件存储\n• 响应式设计',
    price: '35',
    duration: '18小时',
    difficulty: '中级',
    instructorName: 'Emma Zhang',
    instructorAddress: '0x5678901234567890123456789012345678901234',
    instructorBio: '全栈开发工程师，专注于Web3前端技术，拥有多个成功DApp项目经验。',
    rating: 4.8,
    reviews: 22,
    enrollmentCount: 145,
    language: '中文',
    thumbnailHash: 'https://via.placeholder.com/800x450?text=Web3前端开发实践&bg=0891B2&color=white',
    tags: ['Web3', '前端开发', 'React', 'ethers.js', 'DApp'],
    createdAt: new Date('2024-03-10'),
    lessons: [
      { 
        id: 1, 
        title: 'Web3开发环境搭建', 
        duration: '30分钟', 
        description: '配置Web3开发环境和工具',
        isPreview: true 
      },
      { 
        id: 2, 
        title: 'MetaMask集成开发', 
        duration: '90分钟', 
        description: '实现钱包连接和交互',
        isPreview: false 
      },
      { 
        id: 3, 
        title: '智能合约前端集成', 
        duration: '110分钟', 
        description: '前端与智能合约的交互实现',
        isPreview: false 
      }
    ]
  }
];

// 初始化示例课程数据
export const initializeSampleCourses = (): void => {
  try {
    // 检查是否已有课程数据
    const existingCourses = getAllCourses();
    
    if (existingCourses.length === 0) {
      console.log('正在初始化示例课程数据...');
      
      sampleCourses.forEach(course => {
        saveCourse(course);
      });
      
      console.log(`已添加 ${sampleCourses.length} 门示例课程`);
    } else {
      console.log(`本地已有 ${existingCourses.length} 门课程`);
    }
  } catch (error) {
    console.error('初始化示例课程失败:', error);
  }
};

// 重置课程数据（开发用）
export const resetCourseData = (): void => {
  try {
    // 清除现有数据
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('course_') || key?.startsWith('purchase_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 重新添加示例数据
    sampleCourses.forEach(course => {
      saveCourse(course);
    });
    
    console.log('课程数据已重置');
  } catch (error) {
    console.error('重置课程数据失败:', error);
  }
};

// 获取推荐课程
export const getRecommendedCourses = (limit: number = 3): Course[] => {
  try {
    const allCourses = getAllCourses();
    
    // 按评分和注册人数排序
    return allCourses
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * 0.7 + (a.enrollmentCount || 0) * 0.3;
        const scoreB = (b.rating || 0) * 0.7 + (b.enrollmentCount || 0) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('获取推荐课程失败:', error);
    return [];
  }
};

// 按标签搜索课程
export const searchCoursesByTag = (tag: string): Course[] => {
  try {
    const allCourses = getAllCourses();
    
    return allCourses.filter(course => 
      course.tags?.some(courseTag => 
        courseTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  } catch (error) {
    console.error('搜索课程失败:', error);
    return [];
  }
};

// 按难度筛选课程
export const getCoursesByDifficulty = (difficulty: string): Course[] => {
  try {
    const allCourses = getAllCourses();
    
    return allCourses.filter(course => 
      course.difficulty === difficulty || course.level === difficulty
    );
  } catch (error) {
    console.error('按难度筛选课程失败:', error);
    return [];
  }
};

// 检查课程数据完整性
export const validateCourseData = (course: Course): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!course.id) errors.push('课程ID不能为空');
  if (!course.title) errors.push('课程标题不能为空');
  if (!course.description) errors.push('课程描述不能为空');
  if (!course.price || parseFloat(course.price) <= 0) errors.push('课程价格必须大于0');
  if (!course.duration) errors.push('课程时长不能为空');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  initializeSampleCourses,
  resetCourseData,
  getRecommendedCourses,
  searchCoursesByTag,
  getCoursesByDifficulty,
  validateCourseData,
  sampleCourses
};
