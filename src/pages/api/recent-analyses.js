import { supabase } from '../../lib/supabase'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check authentication
  let userId
  try {
    const authResult = getAuth(req)
    userId = authResult.userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } catch (authError) {
    console.error('Auth error:', authError)
    return res.status(401).json({ error: 'Authentication failed' })
  }

  try {
    // Fetch recent videos for the authenticated user
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        filename,
        url,
        uploaded_at
      `)
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(3) // Limit to 3 recent videos

    if (error) {
      console.error('Error fetching recent analyses:', error)
      return res.status(500).json({ error: 'Failed to fetch recent analyses' })
    }

    // Format the data for frontend
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.filename || 'Untitled Video',
      url: video.url,
      createdAt: video.uploaded_at,
      status: 'completed', // Assume all videos are completed since we don't track status
      thumbnail: (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be')))
      ? `https://img.youtube.com/vi/${getYouTubeVideoId(video.url)}/maxresdefault.jpg`
      : '/clip.jpeg',
      duration: null // We don't store duration, so we'll show a placeholder
    }))

    res.status(200).json({ videos: formattedVideos })
  } catch (error) {
    console.error('Error in recent analyses API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
  if (!url) return null
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
} 