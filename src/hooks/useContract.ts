import { useContract, useProvider, useSigner } from 'wagmi'
import { Contract, ethers } from 'ethers'
import { CONTRACTS, ABIS } from '../config/web3'

export const useERC20Contract = (tokenAddress: string) => {
  const { data: signer } = useSigner()
  const provider = useProvider()
  
  return new Contract(
    tokenAddress,
    ABIS.ERC20,
    signer || provider
  )
}

export const useCourseNFTContract = () => {
  const { data: signer } = useSigner()
  const provider = useProvider()
  
  return new Contract(
    CONTRACTS.COURSE_NFT,
    ABIS.COURSE_NFT,
    signer || provider
  )
}

export const useCourseMarketplaceContract = () => {
  const { data: signer } = useSigner()
  const provider = useProvider()
  
  return new Contract(
    CONTRACTS.COURSE_MARKETPLACE,
    ABIS.COURSE_MARKETPLACE,
    signer || provider
  )
}

export const useUniswapRouterContract = () => {
  const { data: signer } = useSigner()
  const provider = useProvider()
  
  return new Contract(
    CONTRACTS.UNISWAP_ROUTER,
    ABIS.UNISWAP_ROUTER,
    signer || provider
  )
}

export const useAavePoolContract = () => {
  const { data: signer } = useSigner()
  const provider = useProvider()
  
  return new Contract(
    CONTRACTS.AAVE_LENDING_POOL,
    ABIS.AAVE_POOL,
    signer || provider
  )
}

// Custom hooks for contract interactions
export const useTokenBalance = (tokenAddress: string, userAddress?: string) => {
  const contract = useERC20Contract(tokenAddress)
  
  const getBalance = async () => {
    if (!userAddress || !contract) return '0'
    try {
      const balance = await contract.balanceOf(userAddress)
      const decimals = await contract.decimals()
      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error('Error getting token balance:', error)
      return '0'
    }
  }
  
  return { getBalance }
}

export const useTokenApproval = (tokenAddress: string, spenderAddress: string) => {
  const contract = useERC20Contract(tokenAddress)
  
  const approve = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const decimals = await contract.decimals()
      const amountInWei = ethers.parseUnits(amount, decimals)
      const tx = await contract.approve(spenderAddress, amountInWei)
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('Error approving tokens:', error)
      throw error
    }
  }
  
  const getAllowance = async (ownerAddress: string) => {
    if (!contract) return '0'
    try {
      const allowance = await contract.allowance(ownerAddress, spenderAddress)
      const decimals = await contract.decimals()
      return ethers.formatUnits(allowance, decimals)
    } catch (error) {
      console.error('Error getting allowance:', error)
      return '0'
    }
  }
  
  return { approve, getAllowance }
}