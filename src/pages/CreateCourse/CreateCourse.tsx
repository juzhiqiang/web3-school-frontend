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
    // Course creation logic here
    console.log('Creating course:', formData)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to create a course.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Duration (hours)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Create Course
        </button>
      </form>
    </div>
  )
}

export default CreateCourse