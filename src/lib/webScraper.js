/**
 * Web data utilities backed by official APIs when available
 */

import { JSDOM } from 'jsdom';

/**
 * Fetch Reddit posts using Reddit's JSON API
 * @param {string} query - Search query
 * @param {string} subreddit - Subreddit to search in
 * @returns {Promise<Array>} - Array of Reddit posts
 */
export async function fetchRedditPosts(query, subreddit = 'movies') {
  try {
    const token = await getRedditAccessToken();
    if (!token) {
      // Fallback to public endpoint if OAuth is not configured
      return fetchRedditPublic(query, subreddit);
    }

    const url = `https://oauth.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&t=year&limit=5`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': redditUserAgent(),
      }
    });

    if (!response.ok) {
      console.warn('Reddit OAuth search failed, status:', response.status);
      return fetchRedditPublic(query, subreddit);
    }

    const data = await response.json();
    if (!data?.data?.children) return [];

    return data.data.children.slice(0, 5).map(({ data: p }) => ({
      title: p.title,
      subreddit: `r/${p.subreddit}`,
      url: `https://reddit.com${p.permalink}`,
      relevance: p.selftext ? truncate(p.selftext, 180) : `Reddit discussion in r/${p.subreddit}`,
      upvotes: formatNumber(p.score),
      score: Number(p.score) || 0,
      comments: Number(p.num_comments) || 0,
      author: p.author
    }));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}

async function fetchRedditPublic(query, subreddit) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&t=year&limit=5`;
    const response = await fetch(url, { headers: { 'User-Agent': redditUserAgent() } });
    if (!response.ok) return [];
    const data = await response.json();
    if (!data?.data?.children) return [];
    return data.data.children.slice(0, 5).map(({ data: p }) => ({
      title: p.title,
      subreddit: `r/${p.subreddit}`,
      url: `https://reddit.com${p.permalink}`,
      relevance: p.selftext ? truncate(p.selftext, 180) : `Reddit discussion in r/${p.subreddit}`,
      upvotes: formatNumber(p.score),
      score: Number(p.score) || 0,
      comments: Number(p.num_comments) || 0,
      author: p.author
    }));
  } catch (e) {
    return [];
  }
}

function redditUserAgent() {
  return `ClipExplain/1.0 (by u/${process.env.REDDIT_USERNAME || 'anonymous'})`;
}

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret) return null;

  try {
    // Prefer script (password) grant if username/password are provided
    const params = new URLSearchParams();
    if (username && password) {
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);
    } else {
      params.append('grant_type', 'client_credentials');
      params.append('scope', 'read');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': redditUserAgent(),
      },
      body: params.toString(),
    });
    if (!response.ok) {
      console.warn('Reddit token fetch failed:', response.status);
      return null;
    }
    const json = await response.json();
    return json.access_token || null;
  } catch (e) {
    console.warn('Reddit token error:', e);
    return null;
  }
}

/**
 * Fetch YouTube videos using YouTube Data API (requires API key)
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of YouTube videos
 */
export async function fetchYouTubeVideos(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Fallback to search URLs if no API key
    return [
      {
        title: `YouTube: ${query}`,
        url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`,
        relevance: 'YouTube search results',
        views: 'Unknown'
      }
    ];
  }

  try {
    // First: search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);
    const searchJson = await searchRes.json();
    const items = searchJson.items || [];
    if (items.length === 0) return [];

    const videoIds = items.map((i) => i.id.videoId).filter(Boolean).join(',');

    // Second: fetch details (duration, stats)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) throw new Error(`YouTube details error: ${detailsRes.status}`);
    const detailsJson = await detailsRes.json();
    const byId = new Map(detailsJson.items.map((v) => [v.id, v]));

    return items.map((i) => {
      const id = i.id.videoId;
      const det = byId.get(id);
      const title = det?.snippet?.title || i.snippet?.title || 'YouTube Video';
      const channel = det?.snippet?.channelTitle || i.snippet?.channelTitle;
      const thumb = det?.snippet?.thumbnails?.high?.url || det?.snippet?.thumbnails?.default?.url || i.snippet?.thumbnails?.high?.url;
      const duration = parseYouTubeDuration(det?.contentDetails?.duration || '');
      const viewCount = Number(det?.statistics?.viewCount || 0);
      return {
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        relevance: det?.snippet?.description ? truncate(det.snippet.description, 180) : 'YouTube video',
        views: formatNumber(viewCount),
        viewCount,
        duration,
        channel,
        thumbnail: thumb
      };
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

/**
 * Fetch Wikipedia articles
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of Wikipedia articles
 */
export async function fetchWikipediaArticles(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return [{
        title: data.title,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        relevance: data.extract || "Wikipedia article with background information",
        source: "Wikipedia"
      }];
    } else {
      // Fallback to search
      return [{
        title: `Wikipedia: "${query}"`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        relevance: "Wikipedia search results for background information",
        source: "Wikipedia"
      }];
    }
  } catch (error) {
    console.error('Error fetching Wikipedia articles:', error);
    return [];
  }
}

/**
 * Fetch IMDb information
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of IMDb entries
 */
export async function fetchIMDbInfo(query) {
  try {
    // IMDb doesn't have a public API, so we return search URLs
    return [{
      title: `IMDb: "${query}"`,
      url: `https://www.imdb.com/find?q=${encodeURIComponent(query)}`,
      relevance: "IMDb search results for cast, crew, reviews, and ratings",
      source: "IMDb"
    }];
  } catch (error) {
    console.error('Error fetching IMDb info:', error);
    return [];
  }
}

/**
 * Fetch news articles using NewsAPI (requires API key)
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of news articles
 */
export async function fetchNewsArticles(query) {
  const cseKey = process.env.GOOGLE_CSE_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  const newsApiKey = process.env.NEWSAPI_KEY;

  try {
    if (cseKey && cseId) {
      const url = `https://www.googleapis.com/customsearch/v1?key=${cseKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=6`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CSE error: ${res.status}`);
      const json = await res.json();
      const items = json.items || [];
      return items.slice(0, 6).map((it) => ({
        title: it.title,
        url: it.link,
        relevance: it.snippet,
        source: extractDomain(it.link),
        date: it.pagemap?.metatags?.[0]?.['article:published_time'] || undefined,
      }));
    }

    if (newsApiKey) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=6&language=en&sortBy=relevancy&apiKey=${newsApiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
      const json = await res.json();
      const arts = json.articles || [];
      return arts.slice(0, 6).map((a) => ({
        title: a.title,
        url: a.url,
        relevance: a.description || a.content || '',
        source: a.source?.name || extractDomain(a.url),
        date: a.publishedAt,
        author: a.author || undefined,
      }));
    }

    // Fallback to Google News search page link
    return [{
      title: `News: "${query}"`,
      url: `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
      relevance: 'Latest news articles and interviews',
      source: 'Google News'
    }];
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
}

/**
 * Generate resources using web scraping (alternative to AI)
 * @param {string} videoTitle - The video title
 * @param {string} videoContent - The video content
 * @returns {Promise<Object>} - Structured resources object
 */
export async function generateScrapedResources(videoTitle, videoContent = '') {
  try {
    const query = videoTitle;
    
    // Fetch resources from various sources
    const [redditPosts, youtubeVideos, wikipediaArticles, imdbInfo, newsArticles] = await Promise.allSettled([
      fetchRedditPosts(query, 'movies'),
      fetchYouTubeVideos(query),
      fetchWikipediaArticles(query),
      fetchIMDbInfo(query),
      fetchNewsArticles(query)
    ]);

    return {
      success: true,
      resources: {
        reddit_posts: redditPosts.status === 'fulfilled' ? redditPosts.value : [],
        youtube_videos: youtubeVideos.status === 'fulfilled' ? youtubeVideos.value : [],
        articles: [
          ...(imdbInfo.status === 'fulfilled' ? imdbInfo.value : []),
          ...(newsArticles.status === 'fulfilled' ? newsArticles.value : [])
        ],
        background_info: wikipediaArticles.status === 'fulfilled' ? wikipediaArticles.value : []
      },
      generatedAt: new Date().toISOString(),
      method: 'web_scraping'
    };
  } catch (error) {
    console.error('Error generating scraped resources:', error);
    return {
      success: false,
      error: error.message,
      resources: {
        reddit_posts: [],
        youtube_videos: [],
        articles: [],
        background_info: []
      }
    };
  }
}

/**
 * Format numbers for display (e.g., 1000 -> 1k)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
} 

function truncate(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'Website';
  }
}

function parseYouTubeDuration(iso) {
  // ISO8601 duration like PT1H2M10S
  if (!iso || typeof iso !== 'string') return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  const parts = [];
  if (h) parts.push(String(h));
  parts.push(String(h ? m.toString().padStart(2, '0') : m));
  parts.push(String(s).padStart(2, '0'));
  return parts.join(':');
}