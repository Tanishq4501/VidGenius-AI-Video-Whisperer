'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useUserPlan } from '../hooks/useUserPlan'
import { motion } from 'framer-motion'

const UploadDashboard = () => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    // Removed explanationStyle state
    const [videoUrl, setVideoUrl] = useState('')
    const [recentAnalyses, setRecentAnalyses] = useState([])
    const [loadingAnalyses, setLoadingAnalyses] = useState(true)
    const [userStats, setUserStats] = useState({
        videosAnalyzed: 0,
        totalRuntime: '0m',
        insightsFound: 0,
        averageRating: 4.8
    })
    const [loadingStats, setLoadingStats] = useState(true)
    const [status, setStatus] = useState('')
    const fileInputRef = useRef(null)
    const { getExplanationCount, fetchUsage, isPro, userPlan } = useUserPlan();

    // Fetch recent analyses and user stats on component mount
    useEffect(() => {
        fetchRecentAnalyses()
        fetchUserStats()
    }, [])

    const fetchRecentAnalyses = async () => {
        try {
            setLoadingAnalyses(true)
            const response = await fetch('/api/recent-analyses', {
                credentials: 'include'
            })
            
            if (response.ok) {
                const data = await response.json()
                setRecentAnalyses(data.videos || [])
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Failed to fetch recent analyses:', response.status, errorData)
            }
        } catch (error) {
            console.error('Error fetching recent analyses:', error)
        } finally {
            setLoadingAnalyses(false)
        }
    }

    const fetchUserStats = async () => {
        try {
            setLoadingStats(true)
            const response = await fetch('/api/user-stats', {
                credentials: 'include'
            })
            
            if (response.ok) {
                const data = await response.json()
                setUserStats(data)
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Failed to fetch user stats:', response.status, errorData)
            }
        } catch (error) {
            console.error('Error fetching user stats:', error)
        } finally {
            setLoadingStats(false)
        }
    }

    const handleAnalysisClick = (videoId) => {
        window.location.href = `/processing/${videoId}`
    }

    const handleFileSelect = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile)
            setStatus('')
        } else {
            setStatus('Please select a valid video file')
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const droppedFile = e.dataTransfer.files[0]
        handleFileSelect(droppedFile)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragOver(false)
    }

    const handleFileUpload = async () => {
        if (!file) return

        // Restrict free plan users from file uploads
        await fetchUsage();
        if (!isPro && userPlan?.plan_type === 'free') {
            setStatus('File uploads are only available on the Pro plan. Please upgrade to Pro or use a YouTube link.');
            return;
        }

        // Check plan usage before upload
        const usage = getExplanationCount();
        if (!isPro && usage.remaining === 0) {
            setStatus('You have reached your free plan limit (3 explanations/month). Upgrade to Pro for unlimited uploads.');
            return;
        }

        setUploading(true)
        setStatus('Uploading video...')

        const formData = new FormData()
        formData.append('video', file)
        // Removed explanationStyle from formData

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Upload successful:', result)
                setFile(null)
                setStatus('Upload successful! Redirecting...')
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                // Redirect to processing page
                window.location.href = `/processing/${result.videoId}`
            } else {
                const error = await response.json()
                console.error('Upload failed:', error)
                setStatus(`Upload failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Upload error:', error)
            setStatus(`Upload error: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleUrlUpload = async () => {
        if (!videoUrl.trim()) {
            setStatus('Please enter a valid video URL')
            return
        }

        // Check plan usage before upload
        await fetchUsage();
        const usage = getExplanationCount();
        if (!isPro && usage.remaining === 0) {
            setStatus('You have reached your free plan limit (3 explanations/month). Upgrade to Pro for unlimited uploads.');
            return;
        }

        setUploading(true)

        try {
            const response = await fetch('/api/youtube-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoUrl: videoUrl
                    // Removed explanationStyle from body
                }),
            })

            if (response.ok) {
                const result = await response.json()
                setVideoUrl('')
                // Redirect immediately to processing page
                window.location.href = `/processing/${result.videoId}`
            } else {
                const error = await response.json()
                console.error('YouTube processing failed:', error.message)
            }
        } catch (error) {
            console.error('YouTube processing error:', error.message)
        } finally {
            setUploading(false)
        }
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)
        
        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
        return `${Math.floor(diffInSeconds / 2592000)} months ago`
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return { text: 'Complete', className: 'bg-green-100 text-green-800' }
            case 'processing':
                return { text: 'Processing', className: 'bg-yellow-100 text-yellow-800' }
            case 'failed':
                return { text: 'Failed', className: 'bg-red-100 text-red-800' }
            default:
                return { text: 'Complete', className: 'bg-green-100 text-green-800' }
        }
    }

    const getDefaultThumbnail = (title) => {
        // Return a placeholder image based on the title or use a default
        return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=200&fit=crop&crop=center'
    }

    return (
        <main id="main-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section id="upload-section" className="mb-10">
                <motion.div
                    className="rounded-2xl p-8"
                    style={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: 'rgba(255, 255, 255, 0.06) 0px 0px 12px 0px inset, rgba(0, 0, 0, 0.25) 0px 8px 24px 0px'
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <h1 className="text-2xl font-bold text-white mb-6">Upload Your Video</h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            id="file-upload-area"
                            className={`rounded-xl p-8 text-center cursor-pointer transition-all border ${
                                dragOver
                                    ? 'border-indigo-400/60 bg-indigo-400/10'
                                    : file
                                        ? 'border-emerald-400/60 bg-emerald-400/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <svg className="mx-auto w-11 h-11 text-white/50 mb-4" fill="currentColor" viewBox="0 0 640 512">
                                <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"/>
                            </svg>
                            <h3 className="text-lg font-medium text-white mb-2">
                                {file ? file.name : 'Drop your video file here'}
                            </h3>
                            <p className="text-white/60 mb-4">
                                {file ? `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'or click to browse (MP4, MOV, AVI up to 500MB)'}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                            {file && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFileUpload();
                                    }}
                                    disabled={uploading}
                                    className="px-6 py-2 rounded-lg font-medium text-white border border-white/15 bg-white/10 hover:bg-white/15 transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Video'}
                                </button>
                            )}
                        </motion.div>

                        <div id="url-input-area" className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Or paste a YouTube/Vimeo URL</h3>
                            <div className="flex space-x-2">
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                                />
                                <motion.button
                                    onClick={handleUrlUpload}
                                    disabled={uploading || !videoUrl.trim()}
                                    className="px-6 py-3 rounded-lg font-medium text-white border border-white/15 bg-white/10 hover:bg-white/15 transition-all disabled:opacity-50"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
                                    </svg>
                                </motion.button>
                            </div>

                            {status && (
                                <div className={`p-3 rounded-lg text-sm ${
                                    status.includes('successful')
                                        ? 'bg-green-400/10 text-green-200 border border-green-400/20'
                                        : status.includes('failed') || status.includes('error')
                                        ? 'bg-red-400/10 text-red-200 border border-red-400/20'
                                        : 'bg-blue-400/10 text-blue-200 border border-blue-400/20'
                                }`}>
                                    {status}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Recent Analyses Section */}
            <section id="recent-analyses" className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Analyses</h2>
                    <Link href="/history" className="text-white/80 hover:text-white font-medium cursor-pointer">View All</Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingAnalyses ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="rounded-xl overflow-hidden animate-pulse" style={{
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div className="w-full h-32 bg-white/10"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                                    <div className="h-3 bg-white/10 rounded mb-3"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="h-6 w-16 bg-white/10 rounded"></div>
                                        <div className="h-5 w-5 bg-white/10 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : recentAnalyses.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 576 512">
                                    <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No analyses yet</h3>
                            <p className="text-white/60">Upload your first video to get started</p>
                        </div>
                    ) : (
                        recentAnalyses.map((analysis, index) => (
                            <div key={analysis.id} id={`analysis-card-${index + 1}`}
                                 className="rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                 style={{
                                     backdropFilter: 'blur(8px)',
                                     backgroundColor: 'rgba(255,255,255,0.06)',
                                     border: '1px solid rgba(255,255,255,0.08)'
                                 }}
                                 onClick={() => handleAnalysisClick(analysis.id)}>
                                <div className="relative">
                                    <img className="w-full h-32 object-cover"
                                         src={analysis.thumbnail || getDefaultThumbnail(analysis.title)}
                                         alt={analysis.title}
                                         onError={(e) => {
                                             e.target.src = getDefaultThumbnail(analysis.title)
                                         }}/>
                                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                        {analysis.duration || '--:--'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-white mb-2 truncate">{analysis.title}</h3>
                                    <p className="text-sm text-white/60 mb-3">Analyzed {formatTimeAgo(analysis.createdAt)}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            analysis.status === 'completed' ? 'bg-green-400/15 text-green-200 border border-green-400/20' :
                                            analysis.status === 'processing' ? 'bg-yellow-400/15 text-yellow-200 border border-yellow-400/20' :
                                            'bg-red-400/15 text-red-200 border border-red-400/20'
                                        }`}>
                                            {getStatusBadge(analysis.status).text}
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAnalysisClick(analysis.id)
                                            }}
                                            className="text-white/80 hover:text-white"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                                                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section id="stats-section">
                <div className="grid md:grid-cols-4 gap-6">
                    <div id="stat-card-1" className="rounded-xl p-6" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-400/15 p-3 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 576 512">
                                        <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"/>
                                    </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{userStats.videosAnalyzed}</p>
                                <p className="text-sm text-white/60">Videos Analyzed</p>
                            </div>
                        </div>
                    </div>

                    <div id="stat-card-2" className="rounded-xl p-6" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center space-x-3">
                            <div className="bg-violet-400/15 p-3 rounded-lg">
                                    <svg className="w-5 h-5 text-violet-300" fill="currentColor" viewBox="0 0 512 512">
                                        <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                                    </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{userStats.totalRuntime}</p>
                                <p className="text-sm text-white/60">Total Runtime</p>
                            </div>
                        </div>
                    </div>

                    <div id="stat-card-3" className="rounded-xl p-6" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center space-x-3">
                            <div className="bg-cyan-400/15 p-3 rounded-lg">
                                    <svg className="w-5 h-5 text-cyan-300" fill="currentColor" viewBox="0 0 384 512">
                                        <path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/>
                                    </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{userStats.insightsFound}</p>
                                <p className="text-sm text-white/60">Insights Found</p>
                            </div>
                        </div>
                    </div>

                    <div id="stat-card-4" className="rounded-xl p-6" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-400/15 p-3 rounded-lg">
                                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                                    </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{userStats.averageRating}</p>
                                <p className="text-sm text-white/60">Avg Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default UploadDashboard
