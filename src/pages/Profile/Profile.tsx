import React, { useState } from 'react'
import { useWeb3 } from '../../contexts/Web3Context'
import { User, Edit3, BookOpen, TrendingUp } from 'lucide-react'

function Profile() {
  const { isConnected, address, balance } = useWeb3()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Web3 Learner',
    bio: 'Passionate about blockchain technology and decentralized education.',
    avatar: '',
    email: 'user@example.com'
  })

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to view your profile.</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save profile data logic here
    console.log('Saving profile:', profileData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
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
                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
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
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
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
                  <h3 className="text-lg font-semibold mb-3">My Courses</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">Introduction to DeFi</h4>
                      <p className="text-sm text-gray-600">Created 2 weeks ago • 15 students</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">Smart Contract Development</h4>
                      <p className="text-sm text-gray-600">Created 1 month ago • 8 students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Wallet Balance</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Courses Created</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Total Students</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">23</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">Total Earnings</h3>
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
