import { generateSearchKeywords } from '../../../lib/generateSearchKeywords';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationContext, videoContent } = req.body;

    if (!conversationContext) {
      return res.status(400).json({ 
        error: 'conversationContext is required',
        example: {
          conversationContext: "User asked about the plot of Inception, AI explained the dream logic concept"
        }
      });
    }

    console.log('Generating keywords for context:', conversationContext.substring(0, 100) + '...');
    
    // Call the function directly - it now uses Groq LLM internally
    const result = await generateSearchKeywords(conversationContext, videoContent);

    if (!result.success) {
      console.log('Using fallback keywords');
      return res.status(200).json({
        success: false,
        message: 'Using fallback keyword generation',
        keywords: result.keywords,
        fallback: true,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Keywords generated successfully',
      keywords: result.keywords,
      generatedAt: result.generatedAt
    });

  } catch (error) {
    console.error('Error in generate-keywords API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 