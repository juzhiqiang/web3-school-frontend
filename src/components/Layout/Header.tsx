import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWeb3 } from '../../contexts/Web3Context'
import { BookOpen, User, PlusCircle, TrendingUp, ArrowRightLeft } from 'lucide-react'
import { ethers } from 'ethers'
import { getSignedName } from '../../utils/signatureUtils'

const Header: React.FC = () => {
  const location = useLocation()
  const { isConnected, address } = useWeb3()
  const [currentName, setCurrentName] = useState<string | null>(null)

  // 请求登录签名验证
  const requestLoginSignature = async (address: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        // 生成待签名消息
        const message = `
        请求修改用户资料，当前用户地址: ${address}
        时间戳: ${Date.now()}
        `
        
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
    }
  }, [isConnected, address])


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
    </header>
  )
}

export default Header
