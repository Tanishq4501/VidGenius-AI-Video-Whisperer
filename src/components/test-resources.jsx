'use client'

import { useState } from 'react'

export default function TestResources() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const testResourceGeneration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-resources')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to test resource generation')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const testCustomResourceGeneration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/generate-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoContent: "A scene from Inception where Cobb explains the concept of dream sharing and how they can extract secrets from people's subconscious minds.",
          videoTitle: "Inception - Dream Sharing Explanation"
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to generate resources')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resource Generation Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testResourceGeneration}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test with Sample Data'}
        </button>
        
        <button
          onClick={testCustomResourceGeneration}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Generating...' : 'Test with Custom Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <div className="mb-4">
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
            <p><strong>Message:</strong> {result.message}</p>
            {result.fallback && <p className="text-orange-600"><strong>⚠️ Using fallback resources</strong></p>}
          </div>
          
          {result.resources && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-600">Reddit Posts ({result.resources.reddit_posts?.length || 0})</h4>
                {result.resources.reddit_posts?.map((post, index) => (
                  <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border">
                    <p><strong>{post.title}</strong></p>
                    <p className="text-sm text-gray-600">{post.subreddit} • {post.upvotes}</p>
                    <p className="text-sm">{post.relevance}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600">YouTube Videos ({result.resources.youtube_videos?.length || 0})</h4>
                {result.resources.youtube_videos?.map((video, index) => (
                  <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border">
                    <p><strong>{video.title}</strong></p>
                    <p className="text-sm text-gray-600">{video.views}</p>
                    <p className="text-sm">{video.relevance}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600">Articles ({result.resources.articles?.length || 0})</h4>
                {result.resources.articles?.map((article, index) => (
                  <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border">
                    <p><strong>{article.title}</strong></p>
                    <p className="text-sm text-gray-600">{article.source}</p>
                    <p className="text-sm">{article.relevance}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold text-green-600">Background Info ({result.resources.background_info?.length || 0})</h4>
                {result.resources.background_info?.map((info, index) => (
                  <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border">
                    <p><strong>{info.title}</strong></p>
                    <p className="text-sm text-gray-600">{info.source}</p>
                    <p className="text-sm">{info.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 