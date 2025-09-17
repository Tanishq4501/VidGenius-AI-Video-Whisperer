import { supabase } from '../../lib/supabase';
import { getYoutubeTranscript } from '../../lib/youtube-transcript';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Save video metadata to DB first
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert([{ 
        filename: `youtube_${videoId}.mp4`, 
        url: videoUrl,
        user_id: userId
      }])
      .select();

    if (videoError) {
      console.error('Video save error:', videoError);
      return res.status(500).json({ error: 'Failed to save video metadata' });
    }

    const dbVideoId = videoData[0].id;

    // Return immediately with video ID, process transcript in background
    res.status(200).json({ 
      success: true,
      message: 'Video processing started', 
      videoId: dbVideoId,
      videoUrl: videoUrl
    });

    // Process transcript in background (don't await this)
    processTranscriptInBackground(videoUrl, dbVideoId);

  } catch (err) {
    console.error('YouTube upload error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Background processing function
async function processTranscriptInBackground(videoUrl, dbVideoId) {
  try {
    console.log('Starting background transcript processing for video ID:', dbVideoId);
    
    // Get transcript from YouTube using AssemblyAI
    const transcript = await getYoutubeTranscript(videoUrl);
    console.log('YouTube transcript obtained successfully, length:', transcript.length);

    if (!transcript || transcript.trim().length === 0) {
      console.error('No transcript was generated for video ID:', dbVideoId);
      return;
    }

    // Save transcript to DB
    const { error: transcriptError } = await supabase
      .from('transcripts')
      .insert([{ 
        video_id: dbVideoId, 
        transcript: transcript 
      }]);

    if (transcriptError) {
      console.error('Transcript save error:', transcriptError);
      return;
    }

    console.log('Transcript processing completed for video ID:', dbVideoId);
  } catch (error) {
    console.error('Background transcript processing failed for video ID:', dbVideoId, error);
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}
