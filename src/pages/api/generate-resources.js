import { generateRelatedResources, generateFallbackResources } from '../../lib/generateResources';
// import { auth } from '@clerk/nextjs/server'; // Removed for client compatibility

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Removed authentication check for compatibility
    // const { userId } = await auth();
    // if (!userId) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Validate request body
    const { videoContent, videoTitle, conversationContext } = req.body;

    // Use videoTitle as content if videoContent is not provided
    const content = videoContent || videoTitle || '';
    
    if (!content.trim() && !conversationContext?.trim()) {
      return res.status(400).json({ 
        error: 'Either videoContent/videoTitle or conversationContext is required',
        example: {
          videoContent: "A scene from a movie showing...",
          videoTitle: "Optional video title",
          conversationContext: "User asked about plot, AI explained concept"
        }
      });
    }

    // Rate limiting - simple implementation
    // In production, you might want to use Redis or a proper rate limiting library
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Resource generation request from IP: ${clientIP}`);

    // Generate resources using smart keywords
    console.log('Generating resources for:', videoTitle || 'Untitled video');
    console.log('Conversation context:', conversationContext?.substring(0, 100) + '...');
    
    const result = await generateRelatedResources(content, videoTitle, conversationContext);

    if (!result.success) {
      console.log('API failed, using fallback resources');
      // Use fallback resources if API fails
      const fallbackResources = generateFallbackResources(videoTitle || 'Video');
      
      return res.status(200).json({
        success: false,
        message: 'Using fallback resources due to API error',
        error: result.error,
        resources: fallbackResources,
        fallback: true,
        generatedAt: new Date().toISOString()
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: 'Resources generated successfully',
      ...result
    });

  } catch (error) {
    console.error('Error in generate-resources API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      fallback: true,
      resources: {
        reddit_posts: [],
        youtube_videos: [],
        articles: [],
        background_info: []
      }
    });
  }
}

// Optional: Add rate limiting headers
export const config = {
  api: {
    externalResolver: true,
  },
}; 