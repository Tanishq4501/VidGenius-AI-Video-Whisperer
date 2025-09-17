import { transcribeVideo } from '../../lib/transcribeVideo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId, videoUrl } = req.body;

    if (!videoId || !videoUrl) {
      return res.status(400).json({ error: 'videoId and videoUrl are required' });
    }

    console.log('Test Transcribe API: Starting manual transcription for video ID:', videoId);
    console.log('Test Transcribe API: Video URL:', videoUrl);

    // Check environment variables
    console.log('Test Transcribe API: Checking environment variables...');
    console.log('Test Transcribe API: ASSEMBLYAI_API_KEY exists:', !!process.env.ASSEMBLYAI_API_KEY);
    console.log('Test Transcribe API: HUGGINGFACE_API_KEY exists:', !!process.env.HUGGINGFACE_API_KEY);

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY is not set' });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not set' });
    }

    // Trigger transcription
    const result = await transcribeVideo(videoUrl, videoId);

    console.log('Test Transcribe API: Transcription completed successfully');
    res.status(200).json({ 
      success: true, 
      message: 'Transcription completed',
      result 
    });

  } catch (error) {
    console.error('Test Transcribe API: Error:', error);
    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message,
      stack: error.stack 
    });
  }
} 