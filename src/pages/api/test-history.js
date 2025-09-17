import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test History API: Starting test...');

    // Test 1: Check authentication
    let userId;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log('Test History API: Auth successful, userId:', userId);
    } catch (authError) {
      console.error('Test History API: Auth failed:', authError);
      return res.status(401).json({ error: 'Auth failed', details: authError.message });
    }

    // Test 2: Check if videos table exists and has data
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, filename, url, uploaded_at, user_id')
      .limit(5);

    if (videosError) {
      console.error('Test History API: Videos table error:', videosError);
      return res.status(500).json({ error: 'Videos table error', details: videosError.message });
    }

    console.log('Test History API: Videos table accessible, found', videos?.length, 'videos');

    // Test 3: Check user's videos
    const { data: userVideos, error: userVideosError } = await supabase
      .from('videos')
      .select('id, filename, url, uploaded_at')
      .eq('user_id', userId)
      .limit(5);

    if (userVideosError) {
      console.error('Test History API: User videos error:', userVideosError);
      return res.status(500).json({ error: 'User videos error', details: userVideosError.message });
    }

    console.log('Test History API: User videos accessible, found', userVideos?.length, 'videos');

    // Test 4: Check messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, video_id, role, created_at')
      .limit(5);

    if (messagesError) {
      console.error('Test History API: Messages table error:', messagesError);
      return res.status(500).json({ error: 'Messages table error', details: messagesError.message });
    }

    console.log('Test History API: Messages table accessible, found', messages?.length, 'messages');

    res.status(200).json({
      success: true,
      auth: { userId },
      tables: {
        videos: { count: videos?.length, sample: videos?.slice(0, 2) },
        userVideos: { count: userVideos?.length, sample: userVideos?.slice(0, 2) },
        messages: { count: messages?.length, sample: messages?.slice(0, 2) }
      }
    });

  } catch (error) {
    console.error('Test History API: Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
} 