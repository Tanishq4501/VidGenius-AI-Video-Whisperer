import { generateRelatedResources, generateFallbackResources } from '../../lib/generateResources';

export default async function handler(req, res) {
  // Only allow GET requests for testing
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sample video content for testing
    const sampleVideoContent = "A dramatic scene from The Dark Knight where Batman interrogates the Joker in a police station. The Joker explains his philosophy about chaos and how he's not a monster, just ahead of the curve. The scene explores themes of order vs chaos, good vs evil, and the psychological battle between Batman and the Joker.";
    const sampleVideoTitle = "The Dark Knight - Joker Interrogation Scene";

    console.log('Testing resource generation with sample data...');
    
    const result = await generateRelatedResources(sampleVideoContent, sampleVideoTitle);

    if (!result.success) {
      console.log('API failed, using fallback resources');
      const fallbackResources = generateFallbackResources(sampleVideoTitle);
      
      return res.status(200).json({
        success: false,
        message: 'Test completed - Using fallback resources due to API error',
        error: result.error,
        testData: {
          videoContent: sampleVideoContent,
          videoTitle: sampleVideoTitle
        },
        resources: fallbackResources,
        fallback: true,
        generatedAt: new Date().toISOString()
      });
    }

    // Return successful test response
    return res.status(200).json({
      success: true,
      message: 'Test completed successfully',
      testData: {
        videoContent: sampleVideoContent,
        videoTitle: sampleVideoTitle
      },
      ...result
    });

  } catch (error) {
    console.error('Error in test-resources API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message,
      testData: {
        videoContent: "Sample content",
        videoTitle: "Sample title"
      },
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