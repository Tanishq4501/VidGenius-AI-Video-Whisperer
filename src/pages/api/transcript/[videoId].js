import { supabase } from '/src/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  // Check authentication
  let userId;
  try {
    const authResult = getAuth(req);
    userId = authResult.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (authError) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  // Check video ownership
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, user_id')
    .eq('id', videoId)
    .single();

  if (videoError || !video || video.user_id !== userId) {
    return res.status(404).json({ error: 'Video not found or access denied' });
  }

  // Get transcript
  const { data: transcriptData, error: transcriptError } = await supabase
    .from('transcripts')
    .select('transcript')
    .eq('video_id', videoId)
    .single();

  if (transcriptError || !transcriptData) {
    return res.status(404).json({ error: 'Transcript not found' });
  }

  res.status(200).json({ transcript: transcriptData.transcript });
} 