'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProcessingPage({ params }) {
  const [videoId, setVideoId] = useState(null)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [processingStatus, setProcessingStatus] = useState(null)

  useEffect(() => {
    // Handle async params
    const getVideoId = async () => {
      const resolvedParams = await params
      setVideoId(resolvedParams.videoId)
    }
    getVideoId()
  }, [params])

  useEffect(() => {
    if (!videoId) return
    
    // Check status immediately
    checkProcessingStatus()
    
    // Start polling for processing status more frequently
    const statusInterval = setInterval(checkProcessingStatus, 1000)
    
    return () => clearInterval(statusInterval)
  }, [videoId])

  const checkProcessingStatus = async () => {
    try {
      const response = await fetch(`/api/processing-status/${videoId}`)
      if (response.ok) {
        const status = await response.json()
        setProcessingStatus(status)
        setCurrentStep(status.step)
        setProgress(status.progress)
        
        if (status.isComplete) {
          setIsComplete(true)
        }
      }
    } catch (error) {
      console.error('Error checking processing status:', error)
    }
  }

  const redirectToChat = () => {
    router.push(`/chat/${videoId}`)
  }

  if (isComplete) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Complete!</h1>
              <p className="text-gray-600 mb-6">Your video is ready for analysis</p>
              <button 
                onClick={redirectToChat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Video</h1>
            <p className="text-gray-600">This may take a few minutes...</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress < 100 ? 'Processing your video...' : 'Processing complete!'}
            </p>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            <div className={`flex items-center space-x-3 ${currentStep >= 1 ? 'text-gray-700' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep > 1 ? 'bg-green-100' : currentStep === 1 ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
              }`}>
                {currentStep > 1 ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-blue-600">1</span>
                )}
              </div>
              <span className={`font-medium ${currentStep >= 1 ? 'text-gray-700' : 'text-gray-400'}`}>
                Initializing processing
              </span>
              {currentStep === 1 && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>

            <div className={`flex items-center space-x-3 ${currentStep >= 2 ? 'text-gray-700' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep > 2 ? 'bg-green-100' : currentStep === 2 ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
              }`}>
                {currentStep > 2 ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-blue-600">2</span>
                )}
              </div>
              <span className={`font-medium ${currentStep >= 2 ? 'text-gray-700' : 'text-gray-400'}`}>
                Video metadata saved
              </span>
              {currentStep === 2 && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>

            <div className={`flex items-center space-x-3 ${currentStep >= 3 ? 'text-gray-700' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep > 3 ? 'bg-green-100' : currentStep === 3 ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
              }`}>
                {currentStep > 3 ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-blue-600">3</span>
                )}
              </div>
              <span className={`font-medium ${currentStep >= 3 ? 'text-gray-700' : 'text-gray-400'}`}>
                Extracting transcript
              </span>
              {currentStep === 3 && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          {processingStatus?.video && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Processing:</h3>
              <p className="text-sm text-gray-600 break-words">{processingStatus.video.filename}</p>
              {processingStatus.video.url && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500 mb-1">Source:</p>
                  <p className="text-xs text-gray-500 break-all overflow-hidden">{processingStatus.video.url}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 