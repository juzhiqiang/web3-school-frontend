import { sepolia, mainnet } from 'wagmi/chains'

// 定义合约类型
type ContractType = 'YD_TOKEN' | 'COURSE_NFT' | 'COURSE_MARKETPLACE'

// 合约地址映射
export const CONTRACT_ADDRESSES: Record<number, Record<ContractType, string>> = {
  [mainnet.id]: {
    YD_TOKEN: import.meta.env.VITE_YD_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    COURSE_NFT: import.meta.env.VITE_COURSE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    COURSE_MARKETPLACE: import.meta.env.VITE_COURSE_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  [sepolia.id]: {
    YD_TOKEN: import.meta.env.VITE_SEPOLIA_YD_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    COURSE_NFT: import.meta.env.VITE_SEPOLIA_COURSE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    COURSE_MARKETPLACE: import.meta.env.VITE_SEPOLIA_COURSE_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
  }
}

// 获取当前网络的合约地址
export const getContractAddress = (chainId: number, contractName: ContractType): string => {
  return CONTRACT_ADDRESSES[chainId]?.[contractName] || CONTRACT_ADDRESSES[mainnet.id][contractName]
}

// 网络配置
export const SUPPORTED_CHAINS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
}

// 判断是否为测试网络
export const isTestNetwork = (chainId: number) => {
  return chainId === sepolia.id
}

// 获取网络名称
export const getNetworkName = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return '以太坊主网'
    case sepolia.id:
      return 'Sepolia测试网'
    default:
      return '未知网络'
  }
}

// 测试网络提示
export const TESTNET_WARNING = {
  title: '⚠️ 测试网络',
  message: '您当前连接的是测试网络，所有交易都是模拟的，不会产生真实费用。'
}
