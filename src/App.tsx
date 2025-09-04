import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { config } from './config/web3'
import { Web3Provider } from './contexts/Web3Context'
import Layout from './components/Layout/Layout'
import ProtectedCourseRoute from './components/ProtectedCourseRoute/ProtectedCourseRoute'
import CourseListing from './pages/CourseListing/CourseListing'
import CreateCourse from './pages/CreateCourse/CreateCourse'
import Financial from './pages/Financial/Financial'
import Profile from './pages/Profile/Profile'
import CourseDetails from './pages/CourseDetails/CourseDetails'
import TokenSwap from './pages/TokenSwap/TokenSwap'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Web3Provider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<CourseListing />} />
                  <Route path="create-course" element={<CreateCourse />} />
                  <Route path="financial" element={<Financial />} />
                  <Route path="token-swap" element={<TokenSwap />} />
                  <Route path="profile" element={<Profile />} />
                  
                  {/* 受保护的课程路由 - 需要购买后才能访问 */}
                  <Route 
                    path="course/:id" 
                    element={
                      <ProtectedCourseRoute>
                        <CourseDetails />
                      </ProtectedCourseRoute>
                    } 
                  />
                  <Route 
                    path="course/:id/learn" 
                    element={
                      <ProtectedCourseRoute>
                        <CourseDetails learn />
                      </ProtectedCourseRoute>
                    } 
                  />
                  <Route 
                    path="course/:id/details" 
                    element={
                      <ProtectedCourseRoute>
                        <CourseDetails details />
                      </ProtectedCourseRoute>
                    } 
                  />
                  
                  {/* 预览路由不受保护 - 但CourseDetails内部会处理预览逻辑 */}
                  <Route path="course/:id/preview" element={<CourseDetails preview />} />
                </Route>
              </Routes>
              
              {/* Toast 通知组件 */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 6000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                  loading: {
                    duration: Infinity,
                  },
                }}
              />
            </Router>
          </Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
