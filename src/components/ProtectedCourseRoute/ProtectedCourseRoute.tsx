import React, { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'
import { getCourse, hasPurchased } from '../../utils/courseStorage'
import { Lock, AlertTriangle, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProtectedCourseRouteProps {
  children: React.ReactNode
}

function ProtectedCourseRoute({ children }: ProtectedCourseRouteProps) {
  const { id } = useParams()
  const { isConnected, address } = useWeb3()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [courseExists, setCourseExists] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      // 检查课程是否存在
      const course = getCourse(id)
      if (!course) {
        setCourseExists(false)
        setIsLoading(false)
        toast.error('课程不存在')
        return
      }
      
      setCourseExists(true)

      // 检查用户是否连接钱包
      if (!isConnected || !address) {
        setHasAccess(false)
        setIsLoading(false)
        toast.error('请先连接钱包')
        return
      }

      // 检查用户是否已购买课程
      const purchased = hasPurchased(id, address)
      setHasAccess(purchased)
      setIsLoading(false)

      if (!purchased) {
        toast.error('请先购买课程才能查看详情')
      }
    }

    checkAccess()
  }, [id, isConnected, address])

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证访问权限...</p>
        </div>
      </div>
    )
  }

  // 课程不存在
  if (!courseExists) {
    return <Navigate to="/" replace />
  }

  // 用户未连接钱包
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">需要连接钱包</h2>
          <p className="text-gray-600 mb-6">
            访问课程详情需要连接您的Web3钱包来验证购买状态
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回课程列表
          </button>
        </div>
      </div>
    )
  }

  // 用户未购买课程
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">需要购买课程</h2>
          <p className="text-gray-600 mb-6">
            此课程需要购买后才能访问完整内容。请返回课程列表页面购买课程。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              返回购买课程
            </button>
            <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              购买流程：授权 → 购买 → 访问课程
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 用户已购买，允许访问
  return <>{children}</>
}

export default ProtectedCourseRoute
