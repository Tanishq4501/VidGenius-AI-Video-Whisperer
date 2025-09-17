import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Verify Delete API: Checking video ID:', videoId);

    // Check authentication
    let userId;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log('Verify Delete API: Auth successful, userId:', userId);
    } catch (authError) {
      console.error('Verify Delete API: Auth failed:', authError);
      return res.status(401).json({ error: 'Auth failed', details: authError.message });
    }

    // Check if video still exists
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, filename, user_id')
      .eq('id', videoId)
      .single();

    if (videoError && videoError.code === 'PGRST116') {
      // Video not found - successfully deleted
      console.log('Verify Delete API: Video not found - successfully deleted');
      res.status(200).json({
        success: true,
        message: 'Video successfully deleted',
        videoExists: false,
        videoId: videoId
      });
    } else if (videoError) {
      console.error('Verify Delete API: Error checking video:', videoError);
      res.status(500).json({ error: 'Error checking video', details: videoError.message });
    } else if (video) {
      // Video still exists
      console.log('Verify Delete API: Video still exists:', video);
      res.status(200).json({
        success: false,
        message: 'Video still exists in database',
        videoExists: true,
        video: video,
        belongsToUser: video.user_id === userId
      });
    }

  } catch (error) {
    console.error('Verify Delete API: Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
} 