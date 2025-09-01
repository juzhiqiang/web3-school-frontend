import React, { useState } from 'react'
import { useWeb3 } from '../../contexts/Web3Context'
import { User, Edit3, BookOpen, TrendingUp } from 'lucide-react'

function Profile() {
  const { isConnected, address, balance } = useWeb3()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Web3学习者',
    bio: '对区块链技术和去中心化教育充满热情。',
    avatar: '',
    email: 'user@example.com'
  })

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p>请先连接您的钱包以查看个人资料。</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setIsEditing(false)
    // 保存个人资料逻辑
    console.log('保存个人资料:', profileData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 个人资料头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b-2 border-white text-white placeholder-gray-200"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  )}
                  <p className="opacity-90">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? '保存' : '编辑'}</span>
              </button>
            </div>
          </div>

          {/* 个人资料内容 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 个人信息 */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">关于我</h3>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">联系信息</h3>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">我的课程</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">DeFi入门指南</h4>
                      <p className="text-sm text-gray-600">创建于2周前 • 15名学生</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">智能合约开发实战</h4>
                      <p className="text-sm text-gray-600">创建于1个月前 • 8名学生</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 统计侧边栏 */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">钱包余额</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '加载中...'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">创建课程</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">学生总数</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">23</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">总收入</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">1.25 ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
