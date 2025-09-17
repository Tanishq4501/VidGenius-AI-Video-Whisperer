import { supabase } from '/src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    console.log('Processing Status API: Checking status for video ID:', videoId);
    
    // Get video and transcript status
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError) {
      console.error('Processing Status API: Video not found:', videoError);
      return res.status(404).json({ error: 'Video not found' });
    }

    console.log('Processing Status API: Video found:', { id: video.id, filename: video.filename });

    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (transcriptError && transcriptError.code !== 'PGRST116') {
      console.error('Processing Status API: Transcript query error:', transcriptError);
    }

    console.log('Processing Status API: Transcript found:', transcript ? 'Yes' : 'No');

    // Determine processing status
    let status = {
      step: 1,
      progress: 0,
      isComplete: false,
      video: video,
      transcript: transcript
    };

    if (video) {
      status.progress = 25; // Video metadata saved
      status.step = 2;
      
      if (transcript && transcript.transcript) {
        status.progress = 100;
        status.step = 4;
        status.isComplete = true;
        console.log('Processing Status API: Processing complete - transcript found');
      } else {
        // Video exists but no transcript yet - processing in progress
        status.progress = 50;
        status.step = 3;
        console.log('Processing Status API: Processing in progress - waiting for transcript');
      }
    }

    console.log('Processing Status API: Returning status:', status);
    res.status(200).json(status);

  } catch (error) {
    console.error('Processing Status API: Error:', error);
    res.status(500).json({ error: 'Failed to get processing status' });
  }
} 