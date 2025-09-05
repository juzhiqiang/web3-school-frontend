import { ethers } from 'ethers'

export interface SignedName {
  name: string
  signature: string
  address: string
  timestamp: number
}

export const signMessage = async (message: string, signer: ethers.Signer): Promise<string> => {
  try {
    return await signer.signMessage(message)
  } catch (error) {
    console.error('签名失败:', error)
    throw new Error('签名失败')
  }
}

export const verifySignature = (message: string, signature: string, address: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error('验证签名失败:', error)
    return false
  }
}

export const createNameMessage = (name: string, address: string, timestamp: number): string => {
  return `Web3学院用户名修改确认\n用户名: ${name}\n地址: ${address}\n时间戳: ${timestamp}`
}

export const saveSignedName = (signedName: SignedName): void => {
  const key = `signedName_${signedName.address.toLowerCase()}`
  localStorage.setItem(key, JSON.stringify(signedName))
}

export const getSignedName = (address: string): SignedName | null => {
  const key = `signedName_${address.toLowerCase()}`
  const stored = localStorage.getItem(key)
  if (!stored) return null
  
  try {
    const signedName = JSON.parse(stored) as SignedName
    const message = createNameMessage(signedName.name, signedName.address, signedName.timestamp)
    
    if (verifySignature(message, signedName.signature, signedName.address)) {
      return signedName
    } else {
      localStorage.removeItem(key)
      return null
    }
  } catch (error) {
    console.error('解析签名名称失败:', error)
    localStorage.removeItem(key)
    return null
  }
}

export const removeSignedName = (address: string): void => {
  const key = `signedName_${address.toLowerCase()}`
  localStorage.removeItem(key)
}