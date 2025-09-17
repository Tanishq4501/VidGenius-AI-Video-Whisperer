'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useNotifications } from "../../components/ui/notification-context";
import ConfirmationModal from "../../components/ui/confirmation-modal";
import { useUserPlan } from '../../hooks/useUserPlan';
import UploadHeader from '../../components/upload-header';

const getVideoType = (url) => {
  if (!url) return 'Uploaded File';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube Video';
  return 'Uploaded File';
};

const getThumbnail = (video) => {
  if (getVideoType(video.url) === 'YouTube Video') {
    // Extract YouTube video ID
    const match = video.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/);
    const id = match ? match[1] : null;
    return id
      ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      : '/clip.jpeg';
  }
  return '/clip.jpeg';
};

const getStatus = (video) => {
  if (video.status === 'processing') return { label: 'Processing', color: 'bg-yellow-500' };
  if (video.status === 'failed') return { label: 'Failed', color: 'bg-red-500' };
  return { label: 'Completed', color: 'bg-green-500' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleString();
};

const HistoryList = ({ videos, onContinueChat, onDelete, deletingVideo, onDownloadTranscript }) => (
  <div className="grid gap-4">
    {videos.map((video, index) => {
      const status = getStatus(video);
      return (
        <div 
          key={video.id} 
          className="group rounded-xl p-3 hover:shadow-lg transition-all duration-200 ease-out flex items-center justify-between"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative group/thumbnail flex-shrink-0">
              <div className="relative overflow-hidden rounded-lg shadow-sm">
                <Image
                  className="w-16 h-12 object-cover group-hover/thumbnail:scale-105 transition-transform duration-200"
                  src={getThumbnail(video)}
                  alt={video.title || video.filename || 'Video thumbnail'}
                  width={64}
                  height={48}
                />
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </div>
                )}
                {getVideoType(video.url) === 'YouTube Video' && (
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">
                    <i className="fa-brands fa-youtube" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-white transition-colors duration-200">
                {video.title || video.filename}
              </h3>
              <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-white/70">
                <span className="flex items-center bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                  <i className={getVideoType(video.url) === 'YouTube Video' ? 'fa-brands fa-youtube mr-1 text-red-400' : 'fa-solid fa-upload mr-1 text-indigo-300'} />
                  {getVideoType(video.url)}
                </span>
                <span className="bg-white/10 border border-white/10 text-white px-2 py-0.5 rounded-full font-medium">
                  {formatDate(video.uploaded_at)}
                </span>
                <span className="flex items-center">
                  <div className={`w-2 h-2 ${status.color} rounded-full mr-1 animate-pulse`} />
                  <span className="font-medium text-white/80">{status.label}</span>
                </span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow">
                  {video.questions_asked || 0} Qs
                </span>
                <span className="text-white/60 text-xs">
                  {video.last_activity ? `Last: ${video.last_activity}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <button
              className={`px-3 py-1.5 text-xs ${status.label === 'Processing' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'border border-white/15 bg-white/10 text-white hover:bg-white/15'} rounded-lg transition-all duration-200 flex items-center space-x-1 font-semibold`}
              disabled={status.label === 'Processing'}
              onClick={() => onContinueChat(video)}
            >
              <svg className={status.label === 'Processing' ? 'w-4 h-4 fa-solid fa-spinner fa-spin' : 'w-4 h-4 fa-solid fa-comments'} aria-hidden="true" focusable="false" data-prefix="fas"
                   data-icon="comments" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"
                   data-fa-i2svg="">
                <path fill="currentColor"
                      d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2 0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.3-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9l0 0 0 0-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z"></path>
              </svg>
              <span>{status.label === 'Processing' ? '...' : 'Chat'}</span>
            </button>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              onClick={() => onDownloadTranscript(video)}
              title="Download transcript"
            >
              <svg className="w-4 h-4 svg-inline--fa fa-download" aria-hidden="true" focusable="false"
                   data-prefix="fas"
                   data-icon="download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                   data-fa-i2svg="">
                <path fill="currentColor"
                      d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"></path>
              </svg>
            </button>
            <button 
              className={`p-2 transition-all duration-200 rounded-lg ${
                deletingVideo === video.id 
                  ? 'text-white/40 cursor-not-allowed' 
                  : 'text-white/60 hover:text-red-300 hover:bg-red-400/10'
              }`}
              onClick={() => onDelete(video)}
              disabled={deletingVideo === video.id}
            >
              {deletingVideo === video.id ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 svg-inline--fa fa-trash" aria-hidden="true" focusable="false" data-prefix="fas"
                     data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
                     data-fa-i2svg="">
                  <path fill="currentColor"
                        d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export default function HistoryPage() {
  const {isSignedIn, isLoaded, signOut} = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const { userPlan, isPro } = useUserPlan();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [authError, setAuthError] = useState(false);
  const router = useRouter();

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Add a small delay to ensure Clerk is fully loaded before making API calls
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Small delay to ensure Clerk session is fully established
      const timer = setTimeout(() => {
        console.log('History: Clerk loaded, session established, ready to fetch videos');
      }, 1000); // Increased delay to ensure session is fully ready
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    async function fetchVideos() {
      if (!isSignedIn) return;
      
      setLoading(true);
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const params = new URLSearchParams({
            search,
            type: typeFilter,
            status: statusFilter,
            sort,
            page,
          });
          const res = await fetch(`/api/history?${params.toString()}`);
          
          if (res.status === 401) {
            // Authentication error - might be Clerk refreshing
            retryCount++;
            if (retryCount < maxRetries) {
              console.log('History: Auth error, retrying in 1 second...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            } else {
              console.error('History: Authentication failed after retries');
              setVideos([]);
              setTotal(0);
              setAuthError(true);
              break;
            }
          }
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          setVideos(data.videos || []);
          setTotal(data.total || 0);
          setAuthError(false);
          break; // Success, exit retry loop
          
        } catch (error) {
          console.error('Error fetching videos:', error);
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('History: Fetch error, retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            setVideos([]);
            setTotal(0);
          }
        }
      }
      
      setLoading(false);
    }
    
    fetchVideos();
  }, [search, typeFilter, statusFilter, sort, page, isSignedIn]);

  const onContinueChat = (video) => {
    router.push(`/chat/${video.id}`);
  };
  const onDelete = async (video) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const downloadTranscript = async (video) => {
    try {
      const res = await fetch(`/api/transcript/${video.id}`);
      if (!res.ok) throw new Error('Failed to fetch transcript');
      const data = await res.json();
      if (!data.transcript) {
        showWarning('Transcript not available for this video.');
        return;
      }
      const blob = new Blob([data.transcript], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title || video.filename || 'transcript'}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Transcript downloaded!');
    } catch (err) {
      showError('Failed to download transcript.');
    }
  };

  const testAuthentication = async () => {
    try {
      console.log('History: Testing authentication before delete...');
      const res = await fetch('/api/test-auth');
      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log('History: Authentication test passed, userId:', data.userId);
        return true;
      } else {
        console.error('History: Authentication test failed:', data);
        showError('Authentication failed. Please refresh the page and try again.');
        return false;
      }
    } catch (error) {
      console.error('History: Authentication test error:', error);
      showError('Authentication test failed. Please refresh the page and try again.');
      return false;
    }
  };

  const handleAuthRefresh = async () => {
    try {
      console.log('History: Attempting to refresh authentication...');
      showInfo('Refreshing authentication...');
      
      // Force a page reload to refresh Clerk session
      window.location.reload();
    } catch (error) {
      console.error('History: Auth refresh error:', error);
      showError('Failed to refresh authentication. Please sign out and sign in again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    // Test authentication first
    const authOk = await testAuthentication();
    if (!authOk) {
      setShowDeleteModal(false);
      setVideoToDelete(null);
      return;
    }

    setDeletingVideo(videoToDelete.id);
    setShowDeleteModal(false);
    setVideoToDelete(null);
    console.log('History: Attempting to delete video:', videoToDelete.id, videoToDelete.filename);

    // Add retry logic for authentication issues
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const res = await fetch(`/api/videos/${videoToDelete.id}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('History: Delete response status:', res.status);

        if (res.status === 401) {
          // Authentication error - might be Clerk refreshing
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('History: Auth error on delete, retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            console.error('History: Authentication failed after retries');
            showError('Authentication failed. Please refresh the page and try again.');
            setDeletingVideo(null);
            return;
          }
        }

                if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('History: Delete failed with status:', res.status, 'Error:', errorData);
          throw new Error(`Delete failed: ${res.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await res.json();
        console.log('History: Video deleted successfully:', data);
        
        // Verify the deletion by checking if video still exists
        try {
          const verifyRes = await fetch(`/api/verify-delete?videoId=${videoToDelete.id}`);
          const verifyData = await verifyRes.json();
          console.log('History: Delete verification:', verifyData);
          
          if (verifyData.videoExists) {
            console.error('History: Video still exists in database after deletion!');
            showWarning('Video may not have been fully deleted. Please refresh the page.');
          } else {
            console.log('History: Delete verification successful - video removed from database');
          }
        } catch (verifyError) {
          console.error('History: Error verifying deletion:', verifyError);
        }
        
        // Show success message
        showSuccess(`Video "${videoToDelete.filename || videoToDelete.title}" deleted successfully!`);
        
        // Immediately remove the video from the local state for better UX
        setVideos(prevVideos => prevVideos.filter(v => v.id !== videoToDelete.id));
        setTotal(prevTotal => Math.max(0, prevTotal - 1));
        
        console.log('History: Video removed from local state, video list updated');
        
        // Optionally refresh from server to ensure consistency
        try {
          console.log('History: Refreshing video list from server...');
          const currentParams = new URLSearchParams({
            search,
            type: typeFilter,
            status: statusFilter,
            sort,
            page,
          });
          
          // Add retry logic for refresh
          let refreshRes;
          let refreshRetryCount = 0;
          const refreshMaxRetries = 3;
          
          while (refreshRetryCount < refreshMaxRetries) {
            refreshRes = await fetch(`/api/history?${currentParams.toString()}`);
            
            if (refreshRes.status === 401) {
              refreshRetryCount++;
              if (refreshRetryCount < refreshMaxRetries) {
                console.log('History: Refresh auth error, retrying in 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }
            break;
          }
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            console.log('History: Server refresh successful, videos count:', refreshData.videos?.length);
            // Only update if the server data is different
            if (refreshData.videos?.length !== videos.length - 1) {
              setVideos(refreshData.videos || []);
              setTotal(refreshData.total || 0);
            }
          } else {
            console.error('History: Failed to refresh video list:', refreshRes.status);
          }
        } catch (refreshError) {
          console.error('History: Error refreshing video list:', refreshError);
          // Local state update is already done, so this is not critical
        }
        
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log('History: Delete error, retrying in 1 second...', error.message);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          console.error('History: Delete failed after all retries:', error);
          showError(`Delete failed: ${error.message}`);
          setDeletingVideo(null);
          return;
        }
      }
    }
    setDeletingVideo(null);
  };

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your video history.</p>
          <Link 
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">We couldn't verify your session. Please refresh authentication or sign in again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Refresh Authentication
          </button>
          <Link 
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 ml-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'radial-gradient(1200px 800px at -10% -10%, rgba(99,102,241,0.15), transparent), radial-gradient(1200px 800px at 110% -10%, rgba(168,85,247,0.12), transparent), linear-gradient(180deg, #040128 0%, #0a0733 100%)'
    }}>
      <UploadHeader hideManagePlanButton={false} currentPage="history" />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Video Analysis History</h1>
          <p className="text-white/70">Manage and revisit your analyzed videos</p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl p-6 mb-6" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="pl-12 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 w-full sm:w-72 outline-none hover:shadow-md focus:shadow-lg"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
                />
              </div>
              <select
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="youtube">YouTube Videos</option>
                <option value="uploaded">Uploaded Files</option>
              </select>
              <select
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white/70">Sort by:</span>
              <select
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2 text-white/70">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
              <span>Loading your video history...</span>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-video text-white/50 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
              <p className="text-white/70 mb-6">
                {search || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first video to get started'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!search && typeFilter === 'all' && statusFilter === 'all' && (
                  <Link 
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 border border-white/15 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
                  >
                    <i className="fa-solid fa-upload mr-2"></i>
                    Upload Video
                  </Link>
                )}
                <button
                  onClick={handleAuthRefresh}
                  className="inline-flex items-center px-4 py-2 border border-white/15 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
                >
                  <svg className="w-10 h-10 inline " viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path fill="white"d="M25 38c-7.2 0-13-5.8-13-13 0-3.2 1.2-6.2 3.3-8.6l1.5 1.3C15 19.7 14 22.3 14 25c0 6.1 4.9 11 11 11 1.6 0 3.1-.3 4.6-1l.8 1.8c-1.7.8-3.5 1.2-5.4 1.2z"/><path fill="white" d="M34.7 33.7l-1.5-1.3c1.8-2 2.8-4.6 2.8-7.3 0-6.1-4.9-11-11-11-1.6 0-3.1.3-4.6 1l-.8-1.8c1.7-.8 3.5-1.2 5.4-1.2 7.2 0 13 5.8 13 13 0 3.1-1.2 6.2-3.3 8.6z"/><path fill="white" d="M18 24h-2v-6h-6v-2h8z"/><path fill="white" d="M40 34h-8v-8h2v6h6z"/></svg>                  Refresh Auth
                </button>
              </div>
            </div>
          </div>
        ) : (
          <HistoryList videos={videos} onContinueChat={onContinueChat} onDelete={onDelete} deletingVideo={deletingVideo} onDownloadTranscript={downloadTranscript} />
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-white/70">
            Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total} videos
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <svg className="w-4 h-4 svg-inline--fa fa-chevron-left" aria-hidden="true" focusable="false" data-prefix="fas"
                   data-icon="chevron-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
                   data-fa-i2svg="">
                <path fill="currentColor"
                      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"></path>
              </svg>
            </button>
            {[...Array(Math.ceil(total / 10)).keys()].slice(Math.max(0, page - 2), page + 1).map(i => (
                <button
                    key={i + 1}
                    className={`px-3 py-2 rounded-lg ${page === i + 1 ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'}`}
                    onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
            ))}
            {page < Math.ceil(total / 10) && <span className="px-3 py-2 text-white/60">...</span>}
            {page < Math.ceil(total / 10) && (
              <button
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                onClick={() => setPage(page + 1)}
              >
                {Math.ceil(total / 10)}
              </button>
            )}
            <button
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
              disabled={page === Math.ceil(total / 10)}
              onClick={() => setPage(page + 1)}
            >
              <svg className="w-4 h-4 svg-inline--fa fa-chevron-right" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" data-fa-i2svg=""><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></path></svg>            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 ClipExplain. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVideoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.filename || videoToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
} 