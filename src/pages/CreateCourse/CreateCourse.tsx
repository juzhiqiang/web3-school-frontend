import React, { useState } from 'react'
import { useWeb3 } from '../../contexts/Web3Context'

function CreateCourse() {
  const { isConnected } = useWeb3()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 课程创建逻辑
    console.log('创建课程:', formData)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">连接您的钱包</h2>
          <p>请先连接您的钱包以创建课程。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">创建新课程</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">课程标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="输入课程标题"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">课程描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            placeholder="描述您的课程内容和学习目标"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">价格 (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="0.1"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">时长 (小时)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="10"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          创建课程
        </button>
      </form>
    </div>
  )
}

export default CreateCourse
