import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../../../contexts/Web3Context'
import { X, User, Mail, Globe, Twitter, Github, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileEditProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, signMessage, verifySignature, address } = useWeb3()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    twitter: '',
    github: '',
    linkedin: '',
  })
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        twitter: userProfile.socialLinks?.twitter || '',
        github: userProfile.socialLinks?.github || '',
        linkedin: userProfile.socialLinks?.linkedin || '',
      })
    }
  }, [userProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('请输入您的姓名')
      return
    }

    try {
      setIsVerifying(true)

      // Create message for signature verification
      const timestamp = Date.now()
      const message = `更新个人资料 - ${timestamp}\n姓名: ${formData.name}\n时间: ${new Date(timestamp).toISOString()}`
      
      // Request signature from user
      const signature = await signMessage(message)
      
      // Verify signature (in real implementation, this would be done on backend)
      if (!address || !verifySignature(message, signature, address)) {
        toast.error('签名验证失败')
        return
      }

      // Update profile data
      const updatedProfile = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        socialLinks: {
          twitter: formData.twitter.trim() || undefined,
          github: formData.github.trim() || undefined,
          linkedin: formData.linkedin.trim() || undefined,
        }
      }

      // Clean up undefined values
      Object.keys(updatedProfile.socialLinks).forEach(key => {
        if (!updatedProfile.socialLinks[key as keyof typeof updatedProfile.socialLinks]) {
          delete updatedProfile.socialLinks[key as keyof typeof updatedProfile.socialLinks]
        }
      })

      updateUserProfile(updatedProfile)
      toast.success('个人资料更新成功！')
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('更新失败，请重试')
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            编辑个人资料
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入您的姓名"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                个人简介
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="简单介绍一下您自己..."
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">社交链接</h3>
            
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>

            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">安全验证</h4>
            <p className="text-sm text-blue-700">
              为了保证资料安全，系统将要求您通过MetaMask签名确认身份。
              这个操作不会消耗任何Gas费用。
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? '验证中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEdit