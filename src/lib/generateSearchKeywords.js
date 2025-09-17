import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate smart search keywords using LLM for better resource discovery
 * @param {string} conversationContext - The chat conversation context
 * @param {string} videoContent - The video content/description
 * @returns {Promise<Object>} - Structured search keywords
 */

export async function generateSearchKeywords(conversationContext, videoContent = '') {
  try {
    const prompt = `
Based on this conversation and video content, generate 3-5 specific search keywords that would help find the most relevant resources.

Conversation Context: "${conversationContext}"
${videoContent ? `Video Content: "${videoContent}"` : ''}

Generate keywords in this exact JSON format. Only return valid JSON, no other text:

{
  "primary_keywords": ["keyword1", "keyword2", "keyword3"],
  "secondary_keywords": ["related1", "related2"],
  "search_queries": [
    "specific search phrase 1",
    "specific search phrase 2",
    "specific search phrase 3"
  ],
  "context": "Brief explanation of what these keywords are looking for"
}

Focus on:
- Specific terms, names, concepts mentioned in the conversation
- Technical terms or industry-specific language
- Popular search terms people would use for this topic
- Both broad and specific keywords for different types of resources

Examples:
- If discussing "Inception movie analysis" → ["Inception", "Christopher Nolan", "dream logic", "movie analysis", "Inception explained"]
- If discussing "machine learning tutorial" → ["machine learning", "AI tutorial", "ML basics", "artificial intelligence", "ML for beginners"]
- If discussing "cooking techniques" → ["cooking methods", "culinary techniques", "chef tips", "cooking tutorial", "kitchen skills"]

Return only the JSON object, no other text.
`;

    console.log('Generating keywords with Groq LLM...');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates search keywords. Always respond with valid JSON only, no other text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log('LLM response for keywords:', response);

    // Try to parse the JSON response
    let keywords;
    try {
      keywords = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      throw new Error('Invalid JSON response from LLM');
    }

    if (!keywords.primary_keywords || !Array.isArray(keywords.primary_keywords)) {
      throw new Error('Invalid keyword structure from LLM');
    }

    return {
      success: true,
      keywords: keywords,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating search keywords:', error);
    
    // Fallback to basic keyword extraction
    return {
      success: false,
      error: error.message,
      keywords: generateFallbackKeywords(conversationContext, videoContent),
      fallback: true
    };
  }
}

/**
 * Generate fallback keywords when LLM is not available
 * @param {string} conversationContext - The chat conversation context
 * @param {string} videoContent - The video content
 * @returns {Object} - Fallback keywords
 */
export function generateFallbackKeywords(conversationContext, videoContent = '') {
  const combinedText = (conversationContext + ' ' + videoContent).toLowerCase();
  
  // Extract common words and filter out stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'video', 'content', 'explained', 'asked', 'user', 'ai', 'explained', 'discussion', 'conversation'];
  
  // Extract meaningful phrases and words
  const words = combinedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .filter(word => !word.match(/^(user|ai|asked|explained|discussion|conversation)$/i))
    .slice(0, 15);

  // Look for specific patterns in the conversation
  const patterns = {
    movie: /(movie|film|cinema|director|actor|actress|plot|story|scene)/gi,
    tech: /(technology|software|programming|code|algorithm|machine|learning|ai|artificial|intelligence)/gi,
    science: /(science|physics|chemistry|biology|research|study|experiment)/gi,
    tutorial: /(tutorial|guide|how|to|learn|teaching|instruction)/gi,
    analysis: /(analysis|review|critique|examination|study|research)/gi
  };

  let context = 'General discussion';
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(combinedText)) {
      context = `${category} related content`;
      break;
    }
  }

  // Extract potential proper nouns (capitalized words)
  const properNouns = combinedText
    .match(/\b[A-Z][a-z]+\b/g) || [];
  
  // Combine meaningful words with proper nouns
  const allKeywords = [...new Set([...properNouns, ...words])].slice(0, 8);

  return {
    primary_keywords: allKeywords.slice(0, 5),
    secondary_keywords: allKeywords.slice(5, 8),
    search_queries: [
      allKeywords.slice(0, 3).join(' '),
      allKeywords.slice(0, 2).join(' ') + ' tutorial',
      allKeywords.slice(0, 2).join(' ') + ' analysis'
    ],
    context: context
  };
}

/**
 * Generate smart search keywords from video transcription only
 * @param {string} videoTranscript - The video transcript content
 * @param {string} videoTitle - The video title
 * @returns {Promise<Object>} - Structured search keywords
 */

export async function generateVideoKeywords(videoTranscript, videoTitle = '') {
  try {
    const prompt = `
Based on this video transcript and title, generate 3-5 specific search keywords that would help find the most relevant resources.

Video Title: "${videoTitle}"
Video Transcript: "${videoTranscript.substring(0, 1000)}..."

Generate keywords in this exact JSON format. Only return valid JSON, no other text:

{
  "primary_keywords": ["keyword1", "keyword2", "keyword3"],
  "secondary_keywords": ["related1", "related2"],
  "search_queries": [
    "specific search phrase 1",
    "specific search phrase 2",
    "specific search phrase 3"
  ],
  "context": "Brief explanation of what these keywords are looking for"
}

Focus on:
- Key concepts, names, and terminology mentioned in the video
- Technical terms or industry-specific language from the transcript
- Popular search terms people would use for this topic
- Both broad and specific keywords for different types of resources

Examples:
- If video discusses "Inception movie analysis" → ["Inception", "Christopher Nolan", "dream logic", "movie analysis", "Inception explained"]
- If video discusses "machine learning tutorial" → ["machine learning", "AI tutorial", "ML basics", "artificial intelligence", "ML for beginners"]
- If video discusses "cooking techniques" → ["cooking methods", "culinary techniques", "chef tips", "cooking tutorial", "kitchen skills"]

Return only the JSON object, no other text.
`;

    console.log('Generating video keywords with Groq LLM...');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates search keywords from video content. Always respond with valid JSON only, no other text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log('LLM response for video keywords:', response);

    // Try to parse the JSON response
    let keywords;
    try {
      keywords = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      throw new Error('Invalid JSON response from LLM');
    }

    if (!keywords.primary_keywords || !Array.isArray(keywords.primary_keywords)) {
      throw new Error('Invalid keyword structure from LLM');
    }

    return {
      success: true,
      keywords: keywords,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating video keywords:', error);
    
    // Fallback to basic keyword extraction from transcript
    return {
      success: false,
      error: error.message,
      keywords: generateFallbackVideoKeywords(videoTranscript, videoTitle),
      fallback: true
    };
  }
}

/**
 * Generate fallback keywords from video transcript when LLM is not available
 * @param {string} videoTranscript - The video transcript
 * @param {string} videoTitle - The video title
 * @returns {Object} - Fallback keywords
 */
export function generateFallbackVideoKeywords(videoTranscript, videoTitle = '') {
  const combinedText = (videoTitle + ' ' + videoTranscript).toLowerCase();
  
  // Extract common words and filter out stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'video', 'content', 'explained', 'asked', 'user', 'ai', 'explained', 'discussion', 'conversation', 'um', 'uh', 'like', 'you know', 'so', 'well', 'right', 'okay', 'yeah', 'yes', 'no', 'not', 'just', 'very', 'really', 'quite', 'rather', 'pretty', 'much', 'many', 'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither', 'none', 'few', 'several', 'most', 'more', 'less', 'least', 'most', 'first', 'last', 'next', 'previous', 'current', 'new', 'old', 'young', 'big', 'small', 'large', 'little', 'high', 'low', 'good', 'bad', 'great', 'terrible', 'amazing', 'awful', 'beautiful', 'ugly', 'nice', 'mean', 'kind', 'cruel', 'happy', 'sad', 'angry', 'excited', 'bored', 'tired', 'awake', 'sleepy', 'hungry', 'thirsty', 'full', 'empty', 'clean', 'dirty', 'wet', 'dry', 'hot', 'cold', 'warm', 'cool', 'light', 'dark', 'bright', 'dim', 'loud', 'quiet', 'soft', 'hard', 'easy', 'difficult', 'simple', 'complex', 'clear', 'confusing', 'obvious', 'hidden', 'visible', 'invisible', 'open', 'closed', 'locked', 'unlocked', 'safe', 'dangerous', 'secure', 'insecure', 'stable', 'unstable', 'fixed', 'broken', 'working', 'broken', 'on', 'off', 'start', 'stop', 'begin', 'end', 'start', 'finish', 'complete', 'incomplete', 'done', 'undone', 'ready', 'not ready', 'available', 'unavailable', 'possible', 'impossible', 'likely', 'unlikely', 'certain', 'uncertain', 'sure', 'unsure', 'definite', 'indefinite', 'exact', 'approximate', 'precise', 'vague', 'specific', 'general', 'particular', 'common', 'rare', 'usual', 'unusual', 'normal', 'abnormal', 'regular', 'irregular', 'standard', 'non-standard', 'typical', 'atypical', 'ordinary', 'extraordinary', 'usual', 'unusual', 'expected', 'unexpected', 'predictable', 'unpredictable', 'reliable', 'unreliable', 'consistent', 'inconsistent', 'constant', 'variable', 'steady', 'unsteady', 'smooth', 'rough', 'even', 'uneven', 'level', 'uneven', 'flat', 'curved', 'straight', 'bent', 'direct', 'indirect', 'forward', 'backward', 'upward', 'downward', 'inward', 'outward', 'left', 'right', 'center', 'middle', 'side', 'top', 'bottom', 'front', 'back', 'inside', 'outside', 'near', 'far', 'close', 'distant', 'nearby', 'remote', 'local', 'global', 'national', 'international', 'domestic', 'foreign', 'home', 'away', 'here', 'there', 'everywhere', 'nowhere', 'somewhere', 'anywhere', 'now', 'then', 'before', 'after', 'during', 'while', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'whence', 'whither', 'hither', 'thither', 'hence', 'thence', 'hereby', 'thereby', 'whereby', 'herein', 'therein', 'wherein', 'hereof', 'thereof', 'whereof', 'hereto', 'thereto', 'whereto', 'herewith', 'therewith', 'wherewith', 'hereupon', 'thereupon', 'whereupon', 'hereafter', 'thereafter', 'whereafter', 'herebefore', 'therebefore', 'wherebefore', 'hereabouts', 'thereabouts', 'whereabouts', 'hereby', 'thereby', 'whereby', 'herein', 'therein', 'wherein', 'hereof', 'thereof', 'whereof', 'hereto', 'thereto', 'whereto', 'herewith', 'therewith', 'wherewith', 'hereupon', 'thereupon', 'whereupon', 'hereafter', 'thereafter', 'whereafter', 'herebefore', 'therebefore', 'wherebefore', 'hereabouts', 'thereabouts', 'whereabouts'];
  
  // Extract meaningful phrases and words
  const words = combinedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .filter(word => !word.match(/^(user|ai|asked|explained|discussion|conversation)$/i))
    .slice(0, 15);

  // Look for specific patterns in the video content
  const patterns = {
    movie: /(movie|film|cinema|director|actor|actress|plot|story|scene)/gi,
    tech: /(technology|software|programming|code|algorithm|machine|learning|ai|artificial|intelligence)/gi,
    science: /(science|physics|chemistry|biology|research|study|experiment)/gi,
    tutorial: /(tutorial|guide|how|to|learn|teaching|instruction)/gi,
    analysis: /(analysis|review|critique|examination|study|research)/gi
  };

  let context = 'Video content discussion';
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(combinedText)) {
      context = `${category} related video content`;
      break;
    }
  }

  // Extract potential proper nouns (capitalized words)
  const properNouns = combinedText
    .match(/\b[A-Z][a-z]+\b/g) || [];
  
  // Combine meaningful words with proper nouns
  const allKeywords = [...new Set([...properNouns, ...words])].slice(0, 8);

  return {
    primary_keywords: allKeywords.slice(0, 5),
    secondary_keywords: allKeywords.slice(5, 8),
    search_queries: [
      allKeywords.slice(0, 3).join(' '),
      allKeywords.slice(0, 2).join(' ') + ' tutorial',
      allKeywords.slice(0, 2).join(' ') + ' analysis'
    ],
    context: context
  };
}

/**
 * Use keywords to search for resources across multiple platforms
 * @param {Object} keywords - The generated keywords
 * @returns {Object} - Search URLs for different platforms
 */
export function generateSearchUrls(keywords) {
  const { primary_keywords, search_queries } = keywords;
  const mainQuery = primary_keywords.slice(0, 3).join(' ');
  
  return {
    reddit: {
      movies: `https://reddit.com/r/movies/search?q=${encodeURIComponent(mainQuery)}&restrict_sr=on&sort=relevance&t=year`,
      television: `https://reddit.com/r/television/search?q=${encodeURIComponent(mainQuery)}&restrict_sr=on&sort=relevance&t=year`,
      general: `https://reddit.com/search?q=${encodeURIComponent(mainQuery)}&sort=relevance&t=year`
    },
    youtube: {
      analysis: `https://youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' analysis')}`,
      tutorial: `https://youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' tutorial')}`,
      review: `https://youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' review')}`
    },
    articles: {
      google: `https://www.google.com/search?q=${encodeURIComponent(mainQuery)}`,
      news: `https://news.google.com/search?q=${encodeURIComponent(mainQuery)}&hl=en-US&gl=US&ceid=US:en`
    },
    background: {
      wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(mainQuery)}`,
      imdb: `https://www.imdb.com/find?q=${encodeURIComponent(mainQuery)}`
    }
  };
} 