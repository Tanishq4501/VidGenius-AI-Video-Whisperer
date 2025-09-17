import { supabase } from '/src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Get video data
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, filename, url, uploaded_at')
      .eq('id', videoId)
      .single();

    if (videoError) {
      console.error('Video fetch error:', videoError);
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get transcript data
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('transcript')
      .eq('video_id', videoId)
      .limit(1)
      .single();

    res.status(200).json({
      ...video,
      transcript: transcript?.transcript || null,
      transcriptLength: transcript?.transcript?.length || 0
    });

  } catch (error) {
    console.error('Video API error:', error);
    res.status(500).json({ error: error.message });
  }
} 