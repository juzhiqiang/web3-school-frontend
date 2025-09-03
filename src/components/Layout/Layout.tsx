import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'
import NetworkStatus from '../common/NetworkStatus'
import DevTools from '../common/DevTools'

const Layout: React.FC = () => {
  const [showDevTools, setShowDevTools] = useState(false)
  const isDevelopment = import.meta.env.MODE === 'development'
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NetworkStatus />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* 开发工具 - 仅在开发环境显示 */}
      {isDevelopment && (
        <DevTools 
          isVisible={showDevTools}
          onToggle={() => setShowDevTools(!showDevTools)}
        />
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default Layout