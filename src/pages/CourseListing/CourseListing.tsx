import React from 'react'

function CourseListing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">课程列表</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 课程卡片将在这里渲染 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">示例课程</h3>
          <p className="text-gray-600 mb-4">这里是课程描述...</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">0.1 ETH</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              查看详情
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">区块链基础</h3>
          <p className="text-gray-600 mb-4">学习区块链的基础知识和原理</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">0.05 ETH</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              查看详情
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">智能合约开发</h3>
          <p className="text-gray-600 mb-4">从零开始学习Solidity智能合约开发</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">0.2 ETH</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseListing
