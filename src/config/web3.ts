import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains'
import { defineChain } from 'viem'

// 定义Ganache网络 (端口7545)
export const ganache = defineChain({
  id: 1337,
  name: 'Ganache',
  network: 'ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:7545'],
    },
    public: {
      http: ['http://127.0.0.1:7545'],
    },
  },
  blockExplorers: {
    default: { name: 'Ganache Explorer', url: 'http://localhost:7545' },
  },
  testnet: true,
})

// 根据环境决定使用的链
const getChains = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  const enableLocalhost = import.meta.env.VITE_ENABLE_LOCALHOST === 'true'
  
  const baseChains = [mainnet, sepolia, polygon, optimism, arbitrum, base]
  
  if (isDevelopment && enableLocalhost) {
    return [ ganache, ...baseChains]
  }
  
  return baseChains
}

export const config = getDefaultConfig({
  appName: 'Web3 School',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: getChains() as readonly [typeof mainnet, ...typeof baseChains],
  ssr: false, // If your dApp uses server side rendering (SSR)
})

// 网络配置映射
export const NETWORK_CONFIG = {
  [ganache.id]: {
    name: 'Ganache',
    rpcUrl: 'http://127.0.0.1:7545',
    explorerUrl: 'http://localhost:7545',
    isLocal: true,
  },
  [sepolia.id]: {
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
    isLocal: false,
  },
  [mainnet.id]: {
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    isLocal: false,
  },
} as const
