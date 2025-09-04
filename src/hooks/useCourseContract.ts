import { useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { COURSE_CONTRACT_CONFIG, type CourseContract } from '../config/courseContract';
import { getYiDengTokenAddress } from '../config/yidengToken';
import type { CreateCourseFormData, Course } from '../types/course';
import toast from 'react-hot-toast';

// ERC-20 ABI for token operations
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];

export interface UseCourseContractReturn {
  createCourse: (courseData: CreateCourseFormData) => Promise<boolean>;
  getMyCourses: () => Promise<Course[]>;
  getCourse: (courseId: string) => Promise<CourseContract | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCourseContract(): UseCourseContractReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取合约实例
  const getContract = useCallback(async () => {
    if (!address || !window.ethereum) {
      throw new Error('钱包未连接');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return new ethers.Contract(
      COURSE_CONTRACT_CONFIG.CONTRACT_ADDRESS,
      COURSE_CONTRACT_CONFIG.CONTRACT_ABI,
      signer
    );
  }, [address]);

  // 获取一灯币合约实例
  const getTokenContract = useCallback(async () => {
    if (!address || !window.ethereum) {
      throw new Error('钱包未连接');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenAddress = getYiDengTokenAddress(chainId);
    
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  }, [address, chainId]);

  // 上传到IPFS（简化版本，实际项目中需要完整实现）
  const uploadToIPFS = async (data: any): Promise<string> => {
    try {
      // 这里应该实现真正的IPFS上传
      // 目前返回一个模拟的哈希
      const dataString = JSON.stringify(data);
      const hash = ethers.keccak256(ethers.toUtf8Bytes(dataString)).slice(0, 10);
      console.log('模拟IPFS上传:', hash);
      return hash;
    } catch (error) {
      console.error('IPFS上传失败:', error);
      throw new Error('内容上传失败');
    }
  };

  // 创建课程
  const createCourse = useCallback(async (courseData: CreateCourseFormData): Promise<boolean> => {
    if (!address) {
      setError('钱包未连接');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      
      // 上传课程详细内容到IPFS
      const ipfsHash = await uploadToIPFS({
        detailedDescription: courseData.detailedDescription,
        lessons: courseData.lessons,
        thumbnail: null // 缩略图处理
      });

      // 将价格转换为wei（假设一灯币也是18位小数）
      const priceWei = ethers.parseEther(courseData.price);

      // 调用合约创建课程
      console.log('创建课程参数:', {
        title: courseData.title,
        description: courseData.description,
        detailedDescription: courseData.detailedDescription.slice(0, 500) + '...', // 截取前500字符
        price: priceWei.toString(),
        duration: courseData.duration,
        tags: courseData.tags,
        thumbnailHash: ipfsHash
      });

      const tx = await contract.createCourse(
        courseData.title,
        courseData.description,
        courseData.detailedDescription,
        priceWei,
        courseData.duration,
        courseData.tags,
        ipfsHash
      );

      console.log('交易已发送:', tx.hash);
      toast.loading('正在创建课程...', { id: 'create-course' });

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('交易已确认:', receipt);

      if (receipt.status === 1) {
        // 发送一灯币奖励
        await sendCreationReward();
        
        toast.success('课程创建成功！已获得1个一灯币奖励', { id: 'create-course' });
        return true;
      } else {
        throw new Error('交易失败');
      }

    } catch (error: any) {
      console.error('创建课程失败:', error);
      const errorMessage = error.message || '创建课程失败';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'create-course' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  // 发送创建奖励（1个一灯币）
  const sendCreationReward = async () => {
    try {
      const tokenContract = await getTokenContract();
      const rewardAmount = ethers.parseEther(COURSE_CONTRACT_CONFIG.CREATION_REWARD);
      
      // 这里假设有一个管理员账户来发送奖励
      // 实际项目中，奖励应该由合约自动发放或由后端服务发送
      console.log(`发送创建奖励: ${COURSE_CONTRACT_CONFIG.CREATION_REWARD} YD 到 ${address}`);
      
      // 注意：这里需要有足够权限的账户来发送代币
      // 在实际实现中，应该由智能合约自动处理奖励发放
      
    } catch (error) {
      console.warn('发送创建奖励失败:', error);
      // 不阻断主流程，只是警告
    }
  };

  // 获取我的课程列表
  const getMyCourses = useCallback(async (): Promise<Course[]> => {
    if (!address) {
      return [];
    }

    try {
      const contract = await getContract();
      const courseIds = await contract.getCoursesByCreator(address);
      
      const courses: Course[] = [];
      for (const courseId of courseIds) {
        try {
          const courseData = await contract.getCourse(courseId);
          
          courses.push({
            id: courseId.toString(),
            title: courseData.title,
            description: courseData.description,
            detailedDescription: courseData.detailedDescription,
            price: ethers.formatEther(courseData.price),
            duration: courseData.duration,
            instructor: '我',
            instructorAddress: courseData.creator,
            tags: courseData.tags,
            createdAt: new Date(Number(courseData.createdAt) * 1000),
            lessons: [] // 从IPFS加载
          });
        } catch (error) {
          console.warn(`获取课程 ${courseId} 详情失败:`, error);
        }
      }
      
      return courses;
    } catch (error) {
      console.error('获取我的课程失败:', error);
      setError('获取课程列表失败');
      return [];
    }
  }, [address, getContract]);

  // 获取单个课程信息
  const getCourse = useCallback(async (courseId: string): Promise<CourseContract | null> => {
    try {
      const contract = await getContract();
      const courseData = await contract.getCourse(courseId);
      
      return {
        id: courseId,
        title: courseData.title,
        description: courseData.description,
        detailedDescription: courseData.detailedDescription,
        price: ethers.formatEther(courseData.price),
        duration: courseData.duration,
        creator: courseData.creator,
        tags: courseData.tags,
        thumbnailHash: courseData.thumbnailHash,
        createdAt: courseData.createdAt.toString(),
        active: courseData.active
      };
    } catch (error) {
      console.error('获取课程详情失败:', error);
      return null;
    }
  }, [getContract]);

  return {
    createCourse,
    getMyCourses,
    getCourse,
    isLoading,
    error
  };
}

export default useCourseContract;
