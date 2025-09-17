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
    // Fetch user's videos count
    const { count: videosCount, error: videosError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (videosError) {
      console.error('Error fetching videos count:', videosError)
      return res.status(500).json({ error: 'Failed to fetch videos count' })
    }

    // Fetch user's messages count (total conversations)
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (messagesError) {
      console.error('Error fetching messages count:', messagesError)
      return res.status(500).json({ error: 'Failed to fetch messages count' })
    }

    // Calculate total runtime (estimate based on video count)
    // Since we don't store actual duration, we'll estimate based on average video length
    const estimatedTotalRuntime = videosCount * 5 // Assume average 5 minutes per video
    const hours = Math.floor(estimatedTotalRuntime / 60)
    const minutes = estimatedTotalRuntime % 60
    const totalRuntime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    // Calculate insights found (estimate based on messages)
    const insightsFound = messagesCount * 3 // Assume 3 insights per conversation

    // Calculate average rating (placeholder - could be implemented later)
    const averageRating = 4.8 // Placeholder value

    const stats = {
      videosAnalyzed: videosCount || 0,
      totalRuntime: totalRuntime,
      insightsFound: insightsFound || 0,
      averageRating: averageRating
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Error in user stats API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 