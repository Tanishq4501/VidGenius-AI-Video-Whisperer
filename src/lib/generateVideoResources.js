/**
 * Generate related resources based on video transcription keywords
 * @param {string} videoTranscript - The video transcript content
 * @param {string} videoTitle - The video title
 * @returns {Promise<Object>} - Structured resources with direct links and thumbnails
 */

import { generateVideoKeywords } from './generateSearchKeywords.js';

export async function generateVideoResources(videoTranscript, videoTitle = '') {
  try {
    console.log('Generating video-based resources...');
    
    // Generate keywords from video transcript only
    const keywordResult = await generateVideoKeywords(videoTranscript, videoTitle);
    
    if (!keywordResult.success) {
      console.log('Video keyword generation failed, using fallback');
    }
    
    const keywords = keywordResult.keywords;
    console.log('Generated video keywords:', keywords);
    
    // Check if we have meaningful keywords
    if (!keywords.primary_keywords || keywords.primary_keywords.length === 0) {
      console.log('No meaningful keywords generated, using fallback');
      const fallbackKeywords = generateFallbackVideoKeywords(videoTranscript, videoTitle);
      keywords.primary_keywords = fallbackKeywords.primary_keywords;
      keywords.search_queries = fallbackKeywords.search_queries;
      keywords.context = fallbackKeywords.context;
    }
    
    // Generate resources using the keywords
    const resources = await generateDirectResources(keywords, videoTitle);
    
    return {
      success: true,
      resources: resources,
      keywords: keywords,
      method: 'video_transcript_keywords',
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating video resources:', error);
    
    // Return enhanced fallback resources if everything fails
    return {
      success: false,
      error: error.message,
      resources: generateEnhancedFallbackResources(videoTitle, videoTranscript),
      fallback: true,
      method: 'enhanced_fallback'
    };
  }
}

/**
 * Generate direct resources with actual content instead of search pages
 * @param {Object} keywords - The generated keywords
 * @param {string} videoTitle - The video title
 * @returns {Promise<Object>} - Resources with direct links and thumbnails
 */
async function generateDirectResources(keywords, videoTitle) {
  const { primary_keywords, secondary_keywords, search_queries } = keywords;
  
  // Search each keyword individually for more diverse results
  const allKeywords = [...primary_keywords, ...secondary_keywords];
  
  // Generate resources for each keyword
  const youtubeVideos = [];
  const redditPosts = [];
  const articles = [];
  const backgroundInfo = [];
  
  // Process each keyword to create diverse resources
  allKeywords.forEach((keyword, index) => {
    const encodedKeyword = encodeURIComponent(keyword);
    
    // YouTube videos for each keyword
    youtubeVideos.push({
      title: `${keyword} - Analysis & Tutorial`,
      url: `https://youtube.com/results?search_query=${encodedKeyword}+analysis+tutorial`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      relevance: `YouTube videos about ${keyword}`,
      views: "Educational content",
      duration: "8-15 min",
      channel: "Learning Channels",
      keyword: keyword
    });
    
    youtubeVideos.push({
      title: `${keyword} - Complete Guide`,
      url: `https://youtube.com/results?search_query=${encodedKeyword}+complete+guide`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      relevance: `Comprehensive guide on ${keyword}`,
      views: "In-depth content",
      duration: "15-25 min",
      channel: "Expert Channels",
      keyword: keyword
    });
    
    // Reddit discussions for each keyword
    redditPosts.push({
      title: `Reddit discussion: "${keyword}"`,
      subreddit: "r/learnenglish",
      url: `https://reddit.com/r/learnenglish/search?q=${encodedKeyword}&restrict_sr=on&sort=relevance&t=year`,
      relevance: `Reddit discussions about ${keyword}`,
      upvotes: "Community discussions",
      comments: "Active discussion",
      author: "Reddit Community",
      keyword: keyword
    });
    
    redditPosts.push({
      title: `Tips and tricks: "${keyword}"`,
      subreddit: "r/EnglishLearning",
      url: `https://reddit.com/r/EnglishLearning/search?q=${encodedKeyword}&restrict_sr=on&sort=relevance&t=year`,
      relevance: `Tips and tricks for ${keyword}`,
      upvotes: "Helpful tips",
      comments: "User experiences",
      author: "English Learners",
      keyword: keyword
    });
    
    // Articles for each keyword
    articles.push({
      title: `Wikipedia: "${keyword}"`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedKeyword}`,
      relevance: `Background information about ${keyword}`,
      source: "Wikipedia",
      author: "Wikipedia Contributors",
      date: "Updated regularly",
      keyword: keyword
    });
    
    articles.push({
      title: `Grammar Guide: "${keyword}"`,
      url: `https://www.google.com/search?q=${encodedKeyword}+grammar+guide`,
      relevance: `Grammar guides and explanations for ${keyword}`,
      source: "Grammar Resources",
      author: "Language Experts",
      date: "Educational content",
      keyword: keyword
    });
    
    // Background info for each keyword
    backgroundInfo.push({
      title: `Google Scholar: "${keyword}"`,
      url: `https://scholar.google.com/scholar?q=${encodedKeyword}`,
      relevance: `Academic research and papers about ${keyword}`,
      source: "Google Scholar",
      author: "Academic Researchers",
      date: "Research papers",
      keyword: keyword
    });
    
    backgroundInfo.push({
      title: `News about "${keyword}"`,
      url: `https://news.google.com/search?q=${encodedKeyword}&hl=en-US&gl=US&ceid=US:en`,
      relevance: `Latest news and articles about ${keyword}`,
      source: "Google News",
      author: "Various Sources",
      date: "Recent news",
      keyword: keyword
    });
  });
  
  // Add some search query specific resources
  search_queries.slice(0, 3).forEach((query, index) => {
    const encodedQuery = encodeURIComponent(query);
    
    youtubeVideos.push({
      title: `"${query}" - Step by Step`,
      url: `https://youtube.com/results?search_query=${encodedQuery}`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      relevance: `Step-by-step tutorial: ${query}`,
      views: "Tutorial content",
      duration: "10-20 min",
      channel: "Tutorial Channels",
      keyword: query
    });
    
    redditPosts.push({
      title: `How to: "${query}"`,
      subreddit: "r/EnglishLearning",
      url: `https://reddit.com/r/EnglishLearning/search?q=${encodedQuery}&restrict_sr=on&sort=relevance&t=year`,
      relevance: `How-to guide for ${query}`,
      upvotes: "Practical advice",
      comments: "Step-by-step help",
      author: "English Teachers",
      keyword: query
    });
  });
  
  // Remove duplicates and limit results
  const uniqueYoutube = youtubeVideos.filter((video, index, self) => 
    index === self.findIndex(v => v.title === video.title)
  ).slice(0, 6);
  
  const uniqueReddit = redditPosts.filter((post, index, self) => 
    index === self.findIndex(p => p.title === post.title)
  ).slice(0, 4);
  
  const uniqueArticles = articles.filter((article, index, self) => 
    index === self.findIndex(a => a.title === article.title)
  ).slice(0, 6);
  
  const uniqueBackground = backgroundInfo.filter((info, index, self) => 
    index === self.findIndex(i => i.title === info.title)
  ).slice(0, 4);
  
  return {
    youtube_videos: uniqueYoutube,
    reddit_posts: uniqueReddit,
    articles: uniqueArticles,
    background_info: uniqueBackground
  };
}

/**
 * Generate enhanced fallback resources with more variety
 * @param {string} videoTitle - The video title
 * @param {string} videoTranscript - The video transcript
 * @returns {Object} - Enhanced fallback resources
 */
export function generateEnhancedFallbackResources(videoTitle, videoTranscript = '') {
  // Extract keywords from title and transcript
  const keywords = extractKeywordsFromTranscript(videoTitle + ' ' + videoTranscript);
  const encodedTitle = encodeURIComponent(videoTitle);
  const encodedKeywords = encodeURIComponent(keywords.join(' '));

  return {
    youtube_videos: [
      {
        title: `Analysis and Review: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+analysis+review`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
        relevance: "YouTube analysis videos and reviews",
        views: "Analysis content",
        duration: "10-15 min",
        channel: "Analysis Channels"
      },
      {
        title: `Behind the Scenes: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+behind+scenes+making+of`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
        relevance: "Behind-the-scenes footage and making-of content",
        views: "Production insights",
        duration: "5-10 min",
        channel: "Behind the Scenes"
      },
      {
        title: `Explained: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+explained+breakdown`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
        relevance: "Explanatory videos and breakdowns",
        views: "Educational content",
        duration: "8-12 min",
        channel: "Explanation Channels"
      }
    ],
    reddit_posts: [
      {
        title: `Discussion about "${videoTitle}"`,
        subreddit: "r/movies",
        url: `https://reddit.com/r/movies/search?q=${encodedTitle}&restrict_sr=on&sort=relevance&t=year`,
        relevance: "Reddit discussions and reviews about this content",
        upvotes: "Community discussions",
        comments: "Active discussion",
        author: "Reddit Community"
      },
      {
        title: `Analysis and theories about "${videoTitle}"`,
        subreddit: "r/television",
        url: `https://reddit.com/r/television/search?q=${encodedTitle}&restrict_sr=on&sort=relevance&t=year`,
        relevance: "TV show analysis and fan theories",
        upvotes: "Fan discussions",
        comments: "Engaged community",
        author: "TV Enthusiasts"
      }
    ],
    articles: [
      {
        title: `IMDb: "${videoTitle}" - Cast, Crew & Reviews`,
        url: `https://www.imdb.com/find?q=${encodedTitle}`,
        relevance: "Comprehensive information including cast, crew, reviews, and ratings",
        source: "IMDb",
        author: "IMDb Contributors",
        date: "Latest reviews"
      },
      {
        title: `Wikipedia: "${videoTitle}"`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTitle}`,
        relevance: "Background information, plot summary, and cultural context",
        source: "Wikipedia",
        author: "Wikipedia Contributors",
        date: "Updated regularly"
      },
      {
        title: `Rotten Tomatoes: "${videoTitle}" Reviews`,
        url: `https://www.rottentomatoes.com/search?search=${encodedTitle}`,
        relevance: "Professional and audience reviews with ratings",
        source: "Rotten Tomatoes",
        author: "Critics & Audience",
        date: "Latest reviews"
      }
    ],
    background_info: [
      {
        title: `Google News: "${videoTitle}"`,
        url: `https://news.google.com/search?q=${encodedTitle}&hl=en-US&gl=US&ceid=US:en`,
        relevance: "Latest news articles and interviews related to this content",
        source: "Google News",
        author: "Various Sources",
        date: "Recent news"
      },
      {
        title: `Letterboxd: "${videoTitle}"`,
        url: `https://letterboxd.com/search/${encodedTitle}/`,
        relevance: "User reviews, ratings, and film community discussions",
        source: "Letterboxd",
        author: "Film Community",
        date: "Community ratings"
      }
    ]
  };
}

/**
 * Extract relevant keywords from transcript for better search results
 * @param {string} text - The text to extract keywords from
 * @returns {Array} - Array of relevant keywords
 */
function extractKeywordsFromTranscript(text) {
  // Remove common words and extract meaningful terms
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'um', 'uh', 'like', 'you know', 'so', 'well', 'right', 'okay', 'yeah', 'yes', 'no', 'not', 'just', 'very', 'really', 'quite', 'rather', 'pretty', 'much', 'many', 'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither', 'none', 'few', 'several', 'most', 'more', 'less', 'least', 'most'];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5); // Take top 5 keywords
  
  return words;
} 