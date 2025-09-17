import { transcribeVideo } from '../../lib/transcribeVideo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hardcoded values for testing video ID 15
    const videoId = 15;
    const videoUrl = "https://isiqovfvyyovinsegurr.supabase.co/storage/v1/object/public/videos/1752341541916_2025-03-02%2012-13-37.mp4";

    console.log('Manual Transcribe: Starting transcription for video ID:', videoId);
    console.log('Manual Transcribe: Video URL:', videoUrl);

    // Check environment variables
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY is not set' });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not set' });
    }

    console.log('Manual Transcribe: Environment variables OK');

    // Trigger transcription
    const result = await transcribeVideo(videoUrl, videoId);

    console.log('Manual Transcribe: Transcription completed successfully');
    res.status(200).json({ 
      success: true, 
      message: 'Transcription completed for video ID: ' + videoId,
      result 
    });

  } catch (error) {
    console.error('Manual Transcribe: Error:', error);
    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message,
      stack: error.stack 
    });
  }
} 