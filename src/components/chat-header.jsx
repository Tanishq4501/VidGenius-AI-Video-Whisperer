'use client'

import { useRouter } from 'next/navigation'
import { UserButton } from "@clerk/nextjs"
import Link from 'next/link'
import Image from 'next/image'
import { useUserPlan } from '../hooks/useUserPlan'

const ChatHeader = ({ videoData }) => {
  const router = useRouter()
  const { userPlan, isPro } = useUserPlan()

  const getVideoType = (url) => {
    if (!url) return 'Uploaded File';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube Video';
    return 'Uploaded File';
  };

  const getThumbnail = (videoData) => {
    if (!videoData?.url) return '/clip.jpeg';
    
    // Check if it's a YouTube video
    if (videoData.url.includes('youtube.com') || videoData.url.includes('youtu.be')) {
      // Extract YouTube video ID
      const match = videoData.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/);
      const id = match ? match[1] : null;
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '/clip.jpeg';
    }
    
    // For uploaded videos, use a default thumbnail
    return '/clip.jpeg';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 svg-inline--fa fa-brain" aria-hidden="true" focusable="false"
                     data-prefix="fas" data-icon="brain" role="img" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 512 512" data-fa-i2svg="">
                  <path fill="white"
                        d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ClipExplain</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/upload" className="text-gray-600 hover:text-indigo-500 cursor-pointer">
                Dashboard
              </Link>
              <Link href="/history" className="text-gray-600 hover:text-indigo-500 cursor-pointer">
                History
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Video Info */}
            {videoData && (
              <div className="hidden lg:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={getThumbnail(videoData)}
                    alt={videoData?.filename || 'Video thumbnail'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/clip.jpeg';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {videoData.filename || 'Video'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getVideoType(videoData.url)} • {videoData?.uploaded_at ? new Date(videoData.uploaded_at).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/upload')}
                className="px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Upload New</span>
              </button>
              
              {videoData?.url && (
                <a 
                  href={videoData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M320 0c17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/>
                  </svg>
                  <span className="hidden sm:inline">View Video</span>
                </a>
              )}
            </div>
            
            {/* Plan Badge */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isPro 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
            
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default ChatHeader 