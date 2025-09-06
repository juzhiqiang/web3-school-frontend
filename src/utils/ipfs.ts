/**
 * IPFS 相关工具函数
 */

// IPFS 网关配置
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * 上传文件到 IPFS
 * 注意：这是一个简化的实现，实际项目中需要配置真实的 IPFS 节点或服务
 * @param file - 要上传的文件
 * @returns Promise<string> - IPFS 哈希
 */
export async function uploadToIPFS(file: File): Promise<string> {
  // 这里使用模拟的 IPFS 上传
  // 在实际项目中，您需要：
  // 1. 配置 IPFS 节点（如 Infura、Pinata、自建节点等）
  // 2. 使用相应的 API 进行上传
  
  try {
    console.log('模拟上传文件到 IPFS:', file.name);
    
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成模拟的 IPFS 哈希
    const mockHash = generateMockIPFSHash();
    
    console.log('文件上传成功，IPFS 哈希:', mockHash);
    return mockHash;
  } catch (error) {
    console.error('IPFS 上传失败:', error);
    throw new Error('文件上传失败');
  }
}

/**
 * 从 IPFS 获取文件 URL
 * @param hash - IPFS 哈希
 * @param gatewayIndex - 网关索引，默认为 0
 * @returns 文件 URL
 */
export function getIPFSUrl(hash: string, gatewayIndex: number = 0): string {
  if (!hash) {
    return '';
  }
  
  // 移除可能的 'ipfs://' 前缀
  const cleanHash = hash.replace('ipfs://', '');
  
  // 确保使用有效的网关索引
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  
  return `${gateway}${cleanHash}`;
}

/**
 * 验证 IPFS 哈希格式
 * @param hash - 要验证的哈希
 * @returns 是否为有效的 IPFS 哈希
 */
export function isValidIPFSHash(hash: string): boolean {
  if (!hash) {
    return false;
  }
  
  // 移除可能的 'ipfs://' 前缀
  const cleanHash = hash.replace('ipfs://', '');
  
  // IPFS v0 哈希 (Qm开头，46字符)
  const v0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  
  // IPFS v1 哈希 (baf开头)
  const v1Regex = /^baf[a-z0-9]{56,}$/;
  
  return v0Regex.test(cleanHash) || v1Regex.test(cleanHash);
}

/**
 * 生成模拟的 IPFS 哈希（仅用于开发和测试）
 * @returns 模拟的 IPFS 哈希
 */
function generateMockIPFSHash(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let hash = 'Qm';
  
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return hash;
}

/**
 * 上传 JSON 数据到 IPFS
 * @param data - 要上传的 JSON 数据
 * @returns Promise<string> - IPFS 哈希
 */
export async function uploadJSONToIPFS(data: any): Promise<string> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'data.json', { type: 'application/json' });
    
    return await uploadToIPFS(file);
  } catch (error) {
    console.error('JSON 上传到 IPFS 失败:', error);
    throw new Error('JSON 数据上传失败');
  }
}

/**
 * 从 IPFS 获取 JSON 数据
 * @param hash - IPFS 哈希
 * @returns Promise<any> - 解析后的 JSON 数据
 */
export async function getJSONFromIPFS(hash: string): Promise<any> {
  try {
    const url = getIPFSUrl(hash);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('从 IPFS 获取 JSON 失败:', error);
    throw new Error('获取数据失败');
  }
}

/**
 * 获取文件大小（字节）
 * @param file - 文件对象
 * @returns 文件大小的可读格式
 */
export function formatFileSize(file: File): string {
  const bytes = file.size;
  
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 验证文件类型
 * @param file - 文件对象
 * @param allowedTypes - 允许的文件类型数组
 * @returns 是否为允许的文件类型
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const baseType = type.slice(0, -2);
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });
}

/**
 * 压缩图片文件
 * @param file - 图片文件
 * @param maxWidth - 最大宽度
 * @param maxHeight - 最大高度
 * @param quality - 压缩质量 (0-1)
 * @returns Promise<File> - 压缩后的文件
 */
export function compressImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('不是图片文件'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}
