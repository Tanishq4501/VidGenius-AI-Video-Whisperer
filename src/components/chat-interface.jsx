'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from './chat-message'
import ChatInput from './chat-input'

// Related Resources Sidebar
function RelatedResourcesSidebar({ resources, loading, error, isOpen, onToggle }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          Related Resources
        </h3>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="h-full overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-2"></div>
            <span className="text-indigo-700 font-medium">Updating related resources...</span>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
            Could not load related resources. Please try again later.
          </div>
        )}
        
        {resources && !loading && !error && (
          <div className="space-y-6">
            {/* Keyword Summary */}
            {resources.keywords && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <h4 className="font-medium text-indigo-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Keywords from Your Video
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-indigo-700">Primary:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resources.keywords.primary_keywords?.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  {resources.keywords.secondary_keywords?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-purple-700">Related:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resources.keywords.secondary_keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {resources.reddit_posts && resources.reddit_posts.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#fff"/>
                    <circle cx="12" cy="12" r="10" fill="#ff4500"/>
                    <ellipse cx="8.5" cy="10.5" rx="1.5" ry="2" fill="#fff"/>
                    <ellipse cx="15.5" cy="10.5" rx="1.5" ry="2" fill="#fff"/>
                    <circle cx="8.5" cy="10.5" r=".7" fill="#000"/>
                    <circle cx="15.5" cy="10.5" r=".7" fill="#000"/>
                    <path d="M12 17c-2 0-3.5-1-3.5-1s.5 1.5 3.5 1.5 3.5-1.5 3.5-1.5-1.5 1-3.5 1z" fill="#fff"/>
                  </svg>
                  Reddit Discussions
                </h4>
                <div className="space-y-3">
                  {resources.reddit_posts.map((post, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors">
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-purple-800 hover:underline text-sm line-clamp-2"
                      >
                        {post.title}
                      </a>
                      <div className="text-xs text-purple-600 mt-1">
                        {post.subreddit} • {post.upvotes} • {post.comments}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">by {post.author}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{post.relevance}</div>
                      {post.keyword && (
                        <div className="text-xs text-purple-600 mt-1 font-medium">
                          Related to: {post.keyword}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {resources.youtube_videos && resources.youtube_videos.length > 0 && (
              <div>
                <h4 className="font-medium text-indigo-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a2.994 2.994 0 00-2.112-2.12C19.19 3.5 12 3.5 12 3.5s-7.19 0-9.386.566A2.994 2.994 0 00.502 6.186C0 8.38 0 12 0 12s0 3.62.502 5.814a2.994 2.994 0 002.112 2.12C4.81 20.5 12 20.5 12 20.5s7.19 0 9.386-.566a2.994 2.994 0 002.112-2.12C24 15.62 24 12 24 12s0-3.62-.502-5.814zM9.75 15.02V8.98l6.5 3.02-6.5 3.02z"/>
                  </svg>
                  YouTube Videos
                </h4>
                <div className="space-y-3">
                  {resources.youtube_videos.map((video, index) => (
                    <div key={index} className="bg-indigo-50 rounded-lg p-3 hover:bg-indigo-100 transition-colors">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/160x120/6366f1/ffffff?text=Video';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-medium text-indigo-800 hover:underline text-sm line-clamp-2"
                          >
                            {video.title}
                          </a>
                          <div className="text-xs text-gray-500 mt-1">
                            {video.channel} • {video.duration} • {video.views}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{video.relevance}</div>
                          {video.keyword && (
                            <div className="text-xs text-indigo-600 mt-1 font-medium">
                              Related to: {video.keyword}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {resources.articles && resources.articles.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-2h-2v2zm0-4h2v-4h-2v4z"/>
                  </svg>
                  Articles & Guides
                </h4>
                <div className="space-y-3">
                  {resources.articles.map((article, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-blue-800 hover:underline text-sm line-clamp-2"
                      >
                        {article.title}
                      </a>
                      <div className="text-xs text-blue-600 mt-1">{article.source}</div>
                      <div className="text-xs text-gray-500 mt-1">by {article.author} • {article.date}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{article.relevance}</div>
                      {article.keyword && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          Related to: {article.keyword}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {resources.background_info && resources.background_info.length > 0 && (
              <div>
                <h4 className="font-medium text-violet-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#ede9fe"/>
                    <path d="M12 8v4l3 1" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Research & Background
                </h4>
                <div className="space-y-3">
                  {resources.background_info.map((info, index) => (
                    <div key={index} className="bg-violet-50 rounded-lg p-3 hover:bg-violet-100 transition-colors">
                      <a 
                        href={info.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-violet-800 hover:underline text-sm line-clamp-2"
                      >
                        {info.title}
                      </a>
                      <div className="text-xs text-violet-600 mt-1">{info.source}</div>
                      <div className="text-xs text-gray-500 mt-1">by {info.author} • {info.date}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{info.relevance}</div>
                      {info.keyword && (
                        <div className="text-xs text-violet-600 mt-1 font-medium">
                          Related to: {info.keyword}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Resources Toggle Button
function ResourcesToggleButton({ isOpen, onToggle, hasResources, isLoading }) {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
        isOpen 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
      }`}
      title={isOpen ? 'Close Resources' : 'Open Related Resources'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )}
      {hasResources && !isOpen && !isLoading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
      {isLoading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
      )}
    </button>
  );
}

const ChatInterface = ({ videoId, videoData }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState(null)
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourcesError, setResourcesError] = useState(null)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState(null)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load chat history
    loadChatHistory()
  }, [videoId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const sendMessage = async (messageText) => {
    console.log('ChatInterface: sendMessage called with:', messageText)
    
    if (!messageText.trim()) {
      console.log('ChatInterface: Message is empty, returning')
      return
    }

    console.log('ChatInterface: Creating user message')
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    console.log('ChatInterface: Adding user message to state')
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      console.log('ChatInterface: Making API call to /api/chat/${videoId}')
      
      // Ensure the session is fresh before making the API call
      await window.Clerk?.session?.getToken({ skipCache: true })
      
      const response = await fetch(`/api/chat/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: messageText
        }),
      })

      console.log('ChatInterface: API response status:', response.status)
      console.log('ChatInterface: API response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('ChatInterface: API response data:', data)
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }
        console.log('ChatInterface: Creating AI message:', aiMessage)
        setMessages(prev => [...prev, aiMessage])
      } else {
        console.log('ChatInterface: API response not ok, status:', response.status)
        const errorText = await response.text()
        console.log('ChatInterface: Error response text:', errorText)
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('ChatInterface: Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      console.log('ChatInterface: Setting loading to false')
      setLoading(false)
    }
  }

  // Fetch resources when first assistant message appears
  useEffect(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Update resources every time there's a new assistant message (after a user question)
    if (assistantMessages.length > 0 && userMessages.length > 0) {
      // Get the latest user and assistant messages for context
      const latestUserMessage = userMessages[userMessages.length - 1];
      const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
      
      // Only update if we have both a user question and an assistant response
      // and if we haven't already processed this assistant message
      if (latestUserMessage && latestAssistantMessage && 
          latestAssistantMessage.id !== lastProcessedMessageId) {
        
        setLastProcessedMessageId(latestAssistantMessage.id);
        setResourcesLoading(true);
        setResourcesError(null);
        
        console.log('Updating resources for latest conversation...');
        console.log('Latest user message:', latestUserMessage.content);
        console.log('Latest assistant message:', latestAssistantMessage.content.substring(0, 100) + '...');
        
        // Use video transcript for resource generation instead of chat context
        const requestData = {
          videoTitle: videoData?.filename || videoData?.title || '',
          videoTranscript: videoData?.transcript || ''
        };
        
        console.log('Sending video resource request with data:', requestData);
        
        // If we don't have transcript, try to fetch it
        if (!requestData.videoTranscript) {
          console.log('No transcript in video data, fetching transcript...');
          fetch(`/api/transcript/${videoId}`)
            .then(transcriptResponse => {
              if (transcriptResponse.ok) {
                return transcriptResponse.json();
              }
              throw new Error('Failed to fetch transcript');
            })
            .then(transcriptData => {
              requestData.videoTranscript = transcriptData.transcript || '';
              console.log('Fetched transcript length:', requestData.videoTranscript.length);
              // Now fetch resources with transcript
              return fetchResources(requestData);
            })
            .catch(transcriptError => {
              console.error('Failed to fetch transcript:', transcriptError);
              // Fetch resources without transcript
              return fetchResources(requestData);
            });
        } else {
          // Fetch resources directly
          fetchResources(requestData);
        }
      }
    }
  }, [messages, videoData, lastProcessedMessageId || '', videoId]); // Add videoId to dependencies

  // Helper function to fetch resources
  const fetchResources = (requestData) => {
    fetch('/api/generate-video-resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
      .then(res => {
        console.log('Video Resource API response status:', res.status);
        if (!res.ok) {
          return res.text().then(text => {
            console.error('Video Resource API error response:', text);
            throw new Error(`API error: ${res.status} ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Video Resource API success response:', data);
        setResources(data.resources);
        setResourcesLoading(false);
      })
      .catch(err => {
        console.error('Video Resource API fetch error:', err);
        setResourcesError('Failed to load resources');
        setResourcesLoading(false);
      });
  };

  const suggestedQuestions = [
    "What is this video about?",
    "Can you summarize the key points?",
    "What are the main topics discussed?",
    "How does this relate to the overall theme?"
  ]

  const hasResources = resources && Object.values(resources).some(arr => arr && arr.length > 0)

  return (
    <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
      {/* Main Content Container - moves when sidebar opens */}
      <div className={`transition-all duration-300 ${resourcesOpen ? 'mr-80' : ''}`}>
        {/* Chat Container */}
        <div className="flex-1 flex flex-col mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Chat History</h2>
            <p className="text-sm text-gray-500">Ask questions about the video content</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 px-6 py-4 overflow-y-auto space-y-6 max-h-96 overflow-x-hidden chat-scroll">
            {messages.length === 0 ? (
                <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Ask questions about your video to get started</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 animate-brain-pulse relative">
                  <svg className="w-4 h-4 text-white animate-spin" fill="currentColor" viewBox="0 0 640 512">
                    <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304z"/>
                  </svg>
                  {/* Sparkle effects around the robot */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-sparkle" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute top-1 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-sparkle" style={{animationDelay: '0.6s'}}></div>
                </div>
                <div className="flex-1">
                  <div className="bg-ai-msg border border-gray-200 rounded-lg rounded-tl-none px-4 py-3 max-w-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-thinking-wave"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-thinking-wave" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-thinking-wave" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 font-medium animate-pulse">AI is thinking</span>
                        <span className="text-sm text-emerald-500 font-bold animate-pulse">...</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-full animate-typewriter"></div>
                      </div>
                      <span className="text-xs text-gray-500 animate-pulse">Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput 
            onSendMessage={sendMessage} 
            loading={loading} 
            resourcesToggleButton={
              <ResourcesToggleButton 
                isOpen={resourcesOpen} 
                onToggle={() => setResourcesOpen(!resourcesOpen)} 
                hasResources={hasResources}
                isLoading={resourcesLoading}
              />
            }
          />
        </div>

        {/* Suggested Questions */}
        <div className="mt-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                disabled={loading}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Sidebar */}
      <RelatedResourcesSidebar 
        resources={resources}
        loading={resourcesLoading}
        error={resourcesError}
        isOpen={resourcesOpen}
        onToggle={() => setResourcesOpen(false)}
      />
    </main>
  )
}

export default ChatInterface 