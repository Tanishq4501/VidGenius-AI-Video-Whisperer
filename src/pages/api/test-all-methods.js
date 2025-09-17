import { generateRelatedResources } from '../../lib/generateResources.js';
import { generateScrapedResources } from '../../lib/webScraper.js';
import { generateEnhancedFallbackResources } from '../../lib/generateResources.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sampleTitle = "Inception";
  const sampleContent = "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.";
  const sampleConversation = "User asked about the dream logic in Inception, AI explained how the different dream levels work";

  try {
    console.log('Testing all resource generation methods...');

    // Test 1: Smart Keyword Generation
    console.log('Testing smart keyword generation...');
    const keywordResult = await generateRelatedResources(sampleContent, sampleTitle, sampleConversation);

    // Test 2: Web Scraping
    console.log('Testing web scraping...');
    const scrapingResult = await generateScrapedResources(sampleTitle, sampleContent);

    // Test 3: Enhanced Fallback
    console.log('Testing enhanced fallback...');
    const fallbackResult = generateEnhancedFallbackResources(sampleTitle, sampleContent);

    const results = {
      timestamp: new Date().toISOString(),
      sample_data: {
        title: sampleTitle,
        content: sampleContent,
        conversation: sampleConversation
      },
      methods: {
        smart_keywords: {
          success: keywordResult.success,
          method: keywordResult.method,
          fallback: keywordResult.fallback,
          error: keywordResult.error,
          resource_count: {
            reddit: keywordResult.resources?.reddit_posts?.length || 0,
            youtube: keywordResult.resources?.youtube_videos?.length || 0,
            articles: keywordResult.resources?.articles?.length || 0,
            background: keywordResult.resources?.background_info?.length || 0
          }
        },
        web_scraping: {
          success: scrapingResult.success,
          method: scrapingResult.method,
          error: scrapingResult.error,
          resource_count: {
            reddit: scrapingResult.resources?.reddit_posts?.length || 0,
            youtube: scrapingResult.resources?.youtube_videos?.length || 0,
            articles: scrapingResult.resources?.articles?.length || 0,
            background: scrapingResult.resources?.background_info?.length || 0
          }
        },
        enhanced_fallback: {
          success: true,
          method: 'enhanced_fallback',
          resource_count: {
            reddit: fallbackResult.reddit_posts?.length || 0,
            youtube: fallbackResult.youtube_videos?.length || 0,
            articles: fallbackResult.articles?.length || 0,
            background: fallbackResult.background_info?.length || 0
          }
        }
      },
      recommendations: {
        best_method: keywordResult?.success ? 'smart_keywords' : 
                    scrapingResult.success ? 'web_scraping' : 'enhanced_fallback',
        note: 'Smart keyword generation uses Groq LLM for context-aware resource discovery'
      }
    };

    return res.status(200).json(results);

  } catch (error) {
    console.error('Error testing methods:', error);
    return res.status(500).json({
      error: 'Error testing resource generation methods',
      message: error.message
    });
  }
} 