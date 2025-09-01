import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Twitter, Github, MessageCircle } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Web3学院
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              去中心化的Web3教育平台，让学习更有价值。通过区块链技术，我们为教育者和学习者创造了一个公平、透明的学习环境。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              快速导航
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  课程市场
                </Link>
              </li>
              <li>
                <Link to="/create-course" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  创建课程
                </Link>
              </li>
              <li>
                <Link to="/financial" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  财务中心
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  个人中心
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              支持
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  帮助中心
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  开发文档
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  联系我们
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  隐私政策
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Web3学院. 保留所有权利.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-xs">
                基于以太坊构建 ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
