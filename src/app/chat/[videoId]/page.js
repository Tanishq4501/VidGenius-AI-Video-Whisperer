'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import ChatInterface from '../../../components/chat-interface'
import ChatHeader from '../../../components/chat-header'

export default function ChatPage({ params }) {
  const [videoId, setVideoId] = useState(null)
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  console.log('ChatPage: User loaded:', isLoaded)
  console.log('ChatPage: User:', user)
  console.log('ChatPage: User ID:', user?.id)

  useEffect(() => {
    // Handle async params
    const getVideoId = async () => {
      const resolvedParams = await params
      setVideoId(resolvedParams.videoId)
    }
    getVideoId()
    
    // Set minimum loading time of 3 seconds
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 3000)
    
    return () => clearTimeout(minLoadingTimer)
  }, [params])

  useEffect(() => {
    if (!videoId || !isLoaded) return
    
    if (!user) {
      console.log('ChatPage: No user, redirecting to sign-in')
      router.push('/sign-in')
      return
    }
    
    console.log('ChatPage: User authenticated, fetching video data')
    // Fetch video data
    fetchVideoData()
  }, [videoId, isLoaded, user, router])

  const fetchVideoData = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoData(data)
      } else {
        // If video doesn't exist, redirect to upload
        router.push('/upload')
      }
    } catch (error) {
      console.error('Error fetching video data:', error)
      router.push('/upload')
    } finally {
      // Only set loading to false if minimum loading time has passed
      if (minLoadingComplete) {
        setLoading(false)
      } else {
        // Wait for minimum loading time to complete
        setTimeout(() => {
          setLoading(false)
        }, 3000 - (Date.now() - (Date.now() - 3000)))
      }
    }
  }

  if (loading || !isLoaded || !minLoadingComplete) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 max-w-md w-full mx-4">
            {/* Logo and Brand */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ClipExplain</h2>
              <p className="text-gray-600 text-sm">Preparing your chat experience</p>
            </div>

            {/* Elegant Loading Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Main spinner */}
                <div className="w-12 h-12 border-3 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-indigo-400/30 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-6">
              <p className="text-gray-700 font-medium">
                {!isLoaded ? 'Authenticating user...' : 'Loading chat interface...'}
              </p>
            </div>

            {/* Elegant Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out" style={{width: '75%'}}></div>
            </div>

            {/* Subtle Loading Dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-8 h-8 border border-indigo-300 rounded-lg"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border border-violet-300 rounded-full"></div>
              <div className="absolute top-1/2 right-6 w-4 h-4 border border-purple-300 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!videoData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Video not found</p>
            <button 
              onClick={() => router.push('/upload')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload a Video
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ChatHeader videoData={videoData} />
      <ChatInterface videoId={videoId} videoData={videoData} />
    </div>
  )
}
