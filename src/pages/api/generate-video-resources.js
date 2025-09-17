import { generateVideoResources } from '../../lib/generateVideoResources';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoTitle, videoTranscript } = req.body;

    if (!videoTranscript) {
      return res.status(400).json({ 
        error: 'videoTranscript is required',
        example: {
          videoTranscript: "This is the transcript content from the video..."
        }
      });
    }

    console.log('Generating video resources for transcript:', videoTranscript.substring(0, 100) + '...');
    
    // Call the video-based resource generation function
    const result = await generateVideoResources(videoTranscript, videoTitle);

    if (!result.success) {
      console.log('Using fallback video resources');
      return res.status(200).json({
        success: false,
        message: 'Using fallback video resource generation',
        resources: result.resources,
        fallback: true,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Video resources generated successfully',
      resources: result.resources,
      keywords: result.keywords,
      generatedAt: result.generatedAt
    });

  } catch (error) {
    console.error('Error in generate-video-resources API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 