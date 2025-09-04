/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 一灯币合约地址
  readonly VITE_YIDENG_TOKEN_ADDRESS_MAINNET: string
  readonly VITE_YIDENG_TOKEN_ADDRESS_SEPOLIA: string
  readonly VITE_YIDENG_TOKEN_ADDRESS_LOCAL: string
  
  // 课程合约地址
  readonly VITE_COURSE_CONTRACT_ADDRESS_MAINNET: string
  readonly VITE_COURSE_CONTRACT_ADDRESS_SEPOLIA: string
  readonly VITE_COURSE_CONTRACT_ADDRESS_LOCAL: string
  
  // 本地网络配置
  readonly VITE_ENABLE_LOCALHOST: string
  readonly VITE_LOCAL_RPC_URL: string
  
  // API配置
  readonly VITE_API_BASE_URL: string
  readonly VITE_IPFS_GATEWAY: string
  
  // 功能开关
  readonly VITE_ENABLE_COURSE_CREATION: string
  readonly VITE_ENABLE_TOKEN_PAYMENTS: string
  readonly VITE_ENABLE_NFT_CERTIFICATES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
