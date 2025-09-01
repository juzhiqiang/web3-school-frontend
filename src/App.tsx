import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/web3'
import { Web3Provider } from './contexts/Web3Context'
import Layout from './components/Layout/Layout'
import CourseListing from './pages/CourseListing/CourseListing'
import CreateCourse from './pages/CreateCourse/CreateCourse'
import Financial from './pages/Financial/Financial'
import Profile from './pages/Profile/Profile'
import CourseDetails from './pages/CourseDetails/CourseDetails'
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
                  <Route path="profile" element={<Profile />} />
                  <Route path="course/:id" element={<CourseDetails />} />
                  <Route path="course/:id/preview" element={<CourseDetails preview />} />
                  <Route path="course/:id/learn" element={<CourseDetails learn />} />
                  <Route path="course/:id/details" element={<CourseDetails details />} />
                </Route>
              </Routes>
            </Router>
          </Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
