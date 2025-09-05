import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWeb3 } from '../../contexts/Web3Context'
import { BookOpen, User, PlusCircle, TrendingUp, ArrowRightLeft, Edit2, X } from 'lucide-react'
import { ethers } from 'ethers'
import { 
  signMessage, 
  createNameMessage, 
  saveSignedName, 
  getSignedName, 
  type SignedName 
} from '../../utils/signatureUtils'

const Header: React.FC = () => {
  const location = useLocation()
  const { isConnected, address } = useWeb3()
  const [showNameModal, setShowNameModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentName, setCurrentName] = useState<string | null>(null)

  // 请求登录签名验证
  const requestLoginSignature = async (address: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        
        // 生成待签名消息
        const message = `I am requesting to change my name. User address: ${address}`
        
        try {
          // 请求用户签名
          const signature = await signer.signMessage(message)
          console.log('Signed Message:', signature)
          
          // 保存登录状态
          const loginData = {
            address,
            signature,
            message,
            timestamp: Date.now()
          }
          
          localStorage.setItem(`login_${address.toLowerCase()}`, JSON.stringify(loginData))
          
          console.log('✅ 登录签名验证完成')
          
          // 检查是否有已保存的用户名
          const signedName = getSignedName(address)
          if (signedName) {
            setCurrentName(signedName.name)
          } else {
            setCurrentName(null)
          }
        } catch (error) {
          console.error('Error signing message:', error)
        }
      }
    } catch (error) {
      console.error('登录签名失败:', error)
      // 如果用户取消签名，可能需要断开连接
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      // 检查是否已经有登录签名
      const loginData = localStorage.getItem(`login_${address.toLowerCase()}`)
      if (loginData) {
        // 已有登录签名，检查用户名
        const signedName = getSignedName(address)
        setCurrentName(signedName?.name || null)
      } else {
        // 没有登录签名，请求签名
        requestLoginSignature(address)
      }
    } else {
      setCurrentName(null)
      setShowNameModal(false)
    }
  }, [isConnected, address])

  const handleEditName = () => {
    setNewName(currentName || '')
    setShowNameModal(true)
  }

  const handleCancelName = () => {
    // 如果是首次连接且没有用户名，给出提示
    if (!currentName) {
      const confirmed = window.confirm('建议设置用户名以获得更好的体验。确定要跳过吗？')
      if (!confirmed) return
    }
    
    setShowNameModal(false)
    setNewName('')
  }

  const handleSaveName = async () => {
    if (!newName.trim() || !address) return

    setIsLoading(true)
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        
        const timestamp = Date.now()
        const message = createNameMessage(newName.trim(), address, timestamp)
        const signature = await signMessage(message, signer)
        
        const signedName: SignedName = {
          name: newName.trim(),
          signature,
          address: address,
          timestamp
        }
        
        saveSignedName(signedName)
        setCurrentName(newName.trim())
        setShowNameModal(false)
        setNewName('')
      }
    } catch (error) {
      console.error('保存名称失败:', error)
      alert('保存名称失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const navItems = [
    { path: '/', label: '课程市场', icon: BookOpen },
    { path: '/create-course', label: '创建课程', icon: PlusCircle, requiresConnection: true },
    { path: '/token-swap', label: '代币兑换', icon: ArrowRightLeft, requiresConnection: true },
    { path: '/financial', label: '财务中心', icon: TrendingUp, requiresConnection: true },
    { path: '/profile', label: '个人中心', icon: User, requiresConnection: true },
  ]

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Web3学院
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              const isDisabled = item.requiresConnection && !isConnected
              
              return (
                <Link
                  key={item.path}
                  to={isDisabled ? '#' : item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault()
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Connect Button */}
          <div className="flex items-center space-x-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated')

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            连接钱包
                          </button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                          >
                            切换网络
                          </button>
                        )
                      }

                      return (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={openChainModal}
                            style={{ display: 'flex', alignItems: 'center' }}
                            type="button"
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? '链图标'}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </button>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              {currentName || account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                            
                            {account?.address && (
                              <button
                                onClick={handleEditName}
                                type="button"
                                className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                title="编辑用户名"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
      
      {/* Name Edit Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑用户名</h3>
              <button
                onClick={handleCancelName}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
                disabled={isLoading}
              />
            </div>
            
            <div className="text-xs text-gray-500 mb-4">
              <p>• 用户名将通过MetaMask签名验证</p>
              <p>• 签名后的用户名将保存在本地存储</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelName}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                onClick={handleSaveName}
                disabled={!newName.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '签名中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
