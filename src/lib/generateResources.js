/**
 * Generate related resources for video content using smart keywords
 * @param {string} videoContent - The video content or description
 * @param {string} videoTitle - The video title
 * @param {string} conversationContext - The chat conversation context
 * @returns {Promise<Object>} - Structured resources object
 */

import { generateScrapedResources, fetchRedditPosts, fetchYouTubeVideos, fetchWikipediaArticles, fetchIMDbInfo, fetchNewsArticles } from './webScraper.js';
import { generateSearchKeywords, generateSearchUrls, generateFallbackKeywords } from './generateSearchKeywords.js';

export async function generateRelatedResources(videoContent, videoTitle = '', conversationContext = '') {
  try {
    // First, generate smart keywords from the conversation context
    console.log('Generating smart keywords from conversation...');
    const keywordResult = await generateSearchKeywords(conversationContext, videoContent);
    
    if (!keywordResult.success) {
      console.log('Keyword generation failed, using fallback');
    }
    
    const keywords = keywordResult.keywords;
    console.log('Generated keywords:', keywords);
    
    // Check if we have meaningful keywords
    if (!keywords.primary_keywords || keywords.primary_keywords.length === 0 || 
        keywords.primary_keywords.every(k => k.toLowerCase() === 'video')) {
      console.log('No meaningful keywords generated, using conversation context directly');
      // Extract keywords directly from conversation context
      const fallbackKeywords = generateFallbackKeywords(conversationContext, videoContent);
      keywords.primary_keywords = fallbackKeywords.primary_keywords;
      keywords.search_queries = fallbackKeywords.search_queries;
      keywords.context = fallbackKeywords.context;
    }
    
    // Aggregate real resources for multiple focused queries
    const contextText = [videoTitle, videoContent, conversationContext]
      .filter(Boolean)
      .join(' ')
      .slice(0, 2000);

    const queries = buildQueriesFromKeywords(keywords, videoTitle);

    // Fetch resources in parallel per query, then flatten
    const perQueryResults = await Promise.all(
      queries.map(async (q) => {
        const [redditMovies, redditTelevision, yt, wiki, imdb, news] = await Promise.all([
          fetchRedditPosts(q, 'movies'),
          fetchRedditPosts(q, 'television'),
          fetchYouTubeVideos(q),
          fetchWikipediaArticles(q),
          fetchIMDbInfo(q),
          fetchNewsArticles(q),
        ]);

        return {
          reddit: [...redditMovies, ...redditTelevision],
          youtube: yt,
          articles: [...imdb, ...news],
          background: wiki,
        };
      })
    );

    // Flatten and dedupe by URL
    const combined = combineAndDedupe(perQueryResults);

    // Score and re-rank against context and keywords
    const ranked = rankResources(combined, keywords, contextText);

    // If everything is empty, fallback to search URLs
    if (
      ranked.reddit_posts.length === 0 &&
      ranked.youtube_videos.length === 0 &&
      ranked.articles.length === 0 &&
      ranked.background_info.length === 0
    ) {
      const searchUrls = generateSearchUrls(keywords);
      return {
        success: true,
        resources: {
          reddit_posts: [
            { title: 'Reddit', subreddit: 'r/movies', url: searchUrls.reddit.movies, relevance: 'Search results' },
            { title: 'Reddit', subreddit: 'r/television', url: searchUrls.reddit.television, relevance: 'Search results' },
          ],
          youtube_videos: [
            { title: 'YouTube Analysis', url: searchUrls.youtube.analysis, relevance: 'Search results' },
            { title: 'YouTube Tutorial', url: searchUrls.youtube.tutorial, relevance: 'Search results' },
          ],
          articles: [
            { title: 'Google', url: searchUrls.articles.google, relevance: 'Search results', source: 'Google' },
            { title: 'News', url: searchUrls.articles.news, relevance: 'Search results', source: 'Google News' },
          ],
          background_info: [
            { title: 'Wikipedia', url: searchUrls.background.wikipedia, relevance: 'Search results', source: 'Wikipedia' },
            { title: 'IMDb', url: searchUrls.background.imdb, relevance: 'Search results', source: 'IMDb' },
          ],
        },
        keywords,
        method: 'smart_keywords_search_urls',
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      resources: ranked,
      keywords,
      method: 'smart_keywords_scraped_ranked',
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Error generating resources:', error);
    
    // Try web scraping as fallback
    try {
      console.log('Keyword generation failed, trying web scraping...');
      const scrapedResult = await generateScrapedResources(videoTitle, videoContent);
      
      if (scrapedResult.success) {
        return {
          ...scrapedResult,
          fallback: true,
          originalError: error.message,
          method: 'web_scraping_fallback'
        };
      }
    } catch (scrapingError) {
      console.error('Web scraping fallback also failed:', scrapingError);
    }
    
    // Return enhanced fallback resources if everything fails
    return {
      success: false,
      error: error.message,
      resources: generateEnhancedFallbackResources(videoTitle, videoContent),
      fallback: true,
      method: 'enhanced_fallback'
    };
  }
}

// Build a set of focused search queries from keywords and title
function buildQueriesFromKeywords(keywords, videoTitle = '') {
  const base = [];
  if (videoTitle) base.push(videoTitle);
  if (Array.isArray(keywords.primary_keywords)) base.push(...keywords.primary_keywords);
  if (Array.isArray(keywords.search_queries)) base.push(...keywords.search_queries);
  // Deduplicate and keep concise
  return [...new Set(base.map((q) => String(q).trim()).filter(Boolean))].slice(0, 6);
}

// Combine and deduplicate results by URL
function combineAndDedupe(perQueryResults) {
  const byUrl = new Map();

  const addAll = (items, type) => {
    items.forEach((it) => {
      const url = it.url || '';
      if (!url) return;
      if (!byUrl.has(url)) {
        byUrl.set(url, { ...it, _type: type });
      }
    });
  };

  perQueryResults.forEach((r) => {
    addAll(r.reddit || [], 'reddit');
    addAll(r.youtube || [], 'youtube');
    addAll(r.articles || [], 'article');
    addAll(r.background || [], 'background');
  });

  const all = Array.from(byUrl.values());
  return all;
}

// Lightweight keyword scoring to rank resources against context
function rankResources(allItems, keywords, contextText) {
  const primary = (keywords.primary_keywords || []).map((k) => k.toLowerCase());
  const secondary = (keywords.secondary_keywords || []).map((k) => k.toLowerCase());

  const score = (item) => {
    const text = [item.title, item.relevance, item.subreddit, item.source]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    let s = 0;
    primary.forEach((k) => {
      if (text.includes(k)) s += 3;
      if (contextText.toLowerCase().includes(k)) s += 1;
    });
    secondary.forEach((k) => {
      if (text.includes(k)) s += 1;
    });
    // Type weighting
    if (item._type === 'background') s += 1;
    if (item._type === 'article') s += 2;
    if (item._type === 'reddit') s += 2;
    if (item._type === 'youtube') s += 2;
    // Social proof if available
    if (typeof item.upvotes === 'number') s += Math.min(5, Math.floor(item.upvotes / 1000));
    return s;
  };

  const sorted = [...allItems].sort((a, b) => score(b) - score(a));

  const reddit_posts = sorted.filter((i) => i._type === 'reddit').slice(0, 5);
  const youtube_videos = sorted.filter((i) => i._type === 'youtube').slice(0, 6);
  const articles = sorted.filter((i) => i._type === 'article').slice(0, 6);
  const background_info = sorted.filter((i) => i._type === 'background').slice(0, 4);

  return { reddit_posts, youtube_videos, articles, background_info };
}

/**
 * Generate enhanced fallback resources with more variety and intelligence
 * @param {string} videoTitle - The video title
 * @param {string} videoContent - The video content/description
 * @returns {Object} - Enhanced fallback resources
 */
export function generateEnhancedFallbackResources(videoTitle, videoContent = '') {
  // Extract keywords from title and content
  const keywords = extractKeywords(videoTitle + ' ' + videoContent);
  const encodedTitle = encodeURIComponent(videoTitle);
  const encodedKeywords = encodeURIComponent(keywords.join(' '));

  return {
    reddit_posts: [
      {
        title: `Discussion about "${videoTitle}"`,
        subreddit: "r/movies",
        url: `https://reddit.com/r/movies/search?q=${encodedTitle}&restrict_sr=on&sort=relevance&t=year`,
        relevance: "Reddit discussions and reviews about this content",
        upvotes: "Community discussions"
      },
      {
        title: `Analysis and theories about "${videoTitle}"`,
        subreddit: "r/television",
        url: `https://reddit.com/r/television/search?q=${encodedTitle}&restrict_sr=on&sort=relevance&t=year`,
        relevance: "TV show analysis and fan theories",
        upvotes: "Fan discussions"
      },
      {
        title: `Behind the scenes: "${videoTitle}"`,
        subreddit: "r/filmmakers",
        url: `https://reddit.com/r/filmmakers/search?q=${encodedKeywords}&restrict_sr=on&sort=relevance&t=year`,
        relevance: "Technical discussions and behind-the-scenes content",
        upvotes: "Industry insights"
      }
    ],
    youtube_videos: [
      {
        title: `Analysis and Review: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+analysis+review`,
        relevance: "YouTube analysis videos and reviews",
        views: "Analysis content"
      },
      {
        title: `Behind the Scenes: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+behind+scenes+making+of`,
        relevance: "Behind-the-scenes footage and making-of content",
        views: "Production insights"
      },
      {
        title: `Explained: "${videoTitle}"`,
        url: `https://youtube.com/results?search_query=${encodedTitle}+explained+breakdown`,
        relevance: "Explanatory videos and breakdowns",
        views: "Educational content"
      }
    ],
    articles: [
      {
        title: `IMDb: "${videoTitle}" - Cast, Crew & Reviews`,
        url: `https://www.imdb.com/find?q=${encodedTitle}`,
        relevance: "Comprehensive information including cast, crew, reviews, and ratings",
        source: "IMDb"
      },
      {
        title: `Rotten Tomatoes: "${videoTitle}" Reviews`,
        url: `https://www.rottentomatoes.com/search?search=${encodedTitle}`,
        relevance: "Professional and audience reviews with ratings",
        source: "Rotten Tomatoes"
      },
      {
        title: `Metacritic: "${videoTitle}" Critic Reviews`,
        url: `https://www.metacritic.com/search/${encodedTitle}`,
        relevance: "Aggregated critic scores and detailed reviews",
        source: "Metacritic"
      }
    ],
    background_info: [
      {
        title: `Wikipedia: "${videoTitle}"`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTitle}`,
        relevance: "Background information, plot summary, and cultural context",
        source: "Wikipedia"
      },
      {
        title: `Google News: "${videoTitle}"`,
        url: `https://news.google.com/search?q=${encodedTitle}&hl=en-US&gl=US&ceid=US:en`,
        relevance: "Latest news articles and interviews related to this content",
        source: "Google News"
      },
      {
        title: `Letterboxd: "${videoTitle}"`,
        url: `https://letterboxd.com/search/${encodedTitle}/`,
        relevance: "User reviews, ratings, and film community discussions",
        source: "Letterboxd"
      }
    ]
  };
}

/**
 * Extract relevant keywords from text for better search results
 * @param {string} text - The text to extract keywords from
 * @returns {Array} - Array of relevant keywords
 */
function extractKeywords(text) {
  // Remove common words and extract meaningful terms
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5); // Take top 5 keywords
  
  return words;
}

/**
 * Generate a simple resource suggestion when API fails (legacy function)
 * @param {string} videoTitle - The video title
 * @returns {Object} - Fallback resources
 */
export function generateFallbackResources(videoTitle) {
  return generateEnhancedFallbackResources(videoTitle);
} 