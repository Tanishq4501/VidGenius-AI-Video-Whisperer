import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication with retry logic for Clerk refresh
  let userId;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      if (userId) {
        console.log('History API: Auth successful on attempt', retryCount + 1);
        break;
      } else {
        console.log('History API: No userId found, attempt', retryCount + 1);
        retryCount++;
        if (retryCount < maxRetries) {
          // Wait a bit before retrying (Clerk might be refreshing)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (authError) {
      console.log('History API: Auth error on attempt', retryCount + 1, ':', authError.message);
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.error('History API: All auth attempts failed');
        return res.status(401).json({ 
          error: 'Authentication failed after retries', 
          details: authError.message 
        });
      }
    }
  }
  
  if (!userId) {
    console.error('History API: No userId found after all retries');
    return res.status(401).json({ error: 'Unauthorized - No user ID after retries' });
  }

  try {
    const { search, type, status, sort, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    console.log('History API: Fetching videos for user:', userId);
    console.log('History API: Filters:', { search, type, status, sort, page });

    // Simple approach: get all user's videos first
    let { data: videos, error } = await supabase
      .from('videos')
      .select('id, filename, url, uploaded_at, user_id')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('History API: Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch videos' });
    }

    // Apply filters in JavaScript (simpler and more reliable)
    if (search) {
      videos = videos.filter(video => 
        video.filename && video.filename.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type === 'youtube') {
      videos = videos.filter(video => 
        video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))
      );
    } else if (type === 'uploaded') {
      videos = videos.filter(video => 
        video.url && !video.url.includes('youtube.com') && !video.url.includes('youtu.be')
      );
    }

    // Get total count before pagination
    const totalCount = videos.length;

    // Apply sorting
    if (sort === 'oldest') {
      videos.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
    } else if (sort === 'az') {
      videos.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''));
    } else if (sort === 'za') {
      videos.sort((a, b) => (b.filename || '').localeCompare(a.filename || ''));
    }
    // Default is already sorted by most recent

    // Apply pagination
    videos = videos.slice(offset, offset + limit);

    if (error) {
      console.error('History API: Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch videos' });
    }

    console.log('History API: Found', videos?.length, 'videos');

    // For each video, get additional data (questions asked, last activity)
    const videosWithDetails = await Promise.all(
      videos.map(async (video) => {
        try {
          // Get questions asked count
          const { count: questionsCount, error: questionsError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('video_id', video.id)
            .eq('user_id', userId)
            .eq('role', 'user');

          if (questionsError) {
            console.error('History API: Error getting questions count for video', video.id, ':', questionsError);
          }

          // Get last activity (last message timestamp)
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from('messages')
            .select('created_at')
            .eq('video_id', video.id)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastMessageError && lastMessageError.code !== 'PGRST116') {
            console.error('History API: Error getting last message for video', video.id, ':', lastMessageError);
          }

          // Format last activity
          let lastActivity = 'N/A';
          if (lastMessage?.created_at) {
            const lastDate = new Date(lastMessage.created_at);
            const now = new Date();
            const diffMs = now - lastDate;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
              lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
              lastActivity = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
              lastActivity = 'Just now';
            }
          }

          return {
            ...video,
            questions_asked: questionsCount || 0,
            last_activity: lastActivity,
            // Assume completed if uploaded_at exists
            status: video.uploaded_at ? 'completed' : 'processing'
          };
        } catch (error) {
          console.error('History API: Error processing video', video.id, ':', error);
          // Return basic video data if there's an error
          return {
            ...video,
            questions_asked: 0,
            last_activity: 'N/A',
            status: video.uploaded_at ? 'completed' : 'processing'
          };
        }
      })
    );

    console.log('History API: Returning', videosWithDetails.length, 'videos with details');

    res.status(200).json({
      videos: videosWithDetails,
      total: totalCount || 0,
      page: parseInt(page),
      totalPages: Math.ceil((totalCount || 0) / limit)
    });

  } catch (error) {
    console.error('History API: Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 