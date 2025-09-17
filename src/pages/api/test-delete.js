import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test Delete API: Starting test...');

    // Test 1: Check authentication
    let userId;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log('Test Delete API: Auth successful, userId:', userId);
    } catch (authError) {
      console.error('Test Delete API: Auth failed:', authError);
      return res.status(401).json({ error: 'Auth failed', details: authError.message });
    }

    // Test 2: Check if user has videos
    const { data: userVideos, error: videosError } = await supabase
      .from('videos')
      .select('id, filename, url, user_id')
      .eq('user_id', userId)
      .limit(3);

    if (videosError) {
      console.error('Test Delete API: Error fetching user videos:', videosError);
      return res.status(500).json({ error: 'Error fetching videos', details: videosError.message });
    }

    console.log('Test Delete API: Found', userVideos?.length, 'videos for user');

    // Test 3: Check if user can delete their own videos (permissions test)
    if (userVideos && userVideos.length > 0) {
      const testVideo = userVideos[0];
      console.log('Test Delete API: Testing delete permissions for video:', testVideo.id);

      // Test if we can access the video
      const { data: videoCheck, error: checkError } = await supabase
        .from('videos')
        .select('id, filename')
        .eq('id', testVideo.id)
        .eq('user_id', userId)
        .single();

      if (checkError) {
        console.error('Test Delete API: Error checking video access:', checkError);
        return res.status(500).json({ error: 'Error checking video access', details: checkError.message });
      }

      console.log('Test Delete API: Video access check successful:', videoCheck);

      // Test if we can delete messages for this video
      const { error: messagesDeleteError } = await supabase
        .from('messages')
        .delete()
        .eq('video_id', testVideo.id)
        .eq('user_id', userId);

      if (messagesDeleteError) {
        console.error('Test Delete API: Error testing message deletion:', messagesDeleteError);
        return res.status(500).json({ error: 'Error testing message deletion', details: messagesDeleteError.message });
      }

      console.log('Test Delete API: Message deletion test successful');

      // Test if we can delete the video
      const { error: videoDeleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', testVideo.id)
        .eq('user_id', userId);

      if (videoDeleteError) {
        console.error('Test Delete API: Error testing video deletion:', videoDeleteError);
        return res.status(500).json({ error: 'Error testing video deletion', details: videoDeleteError.message });
      }

      console.log('Test Delete API: Video deletion test successful');

      res.status(200).json({
        success: true,
        message: 'Delete functionality test passed',
        testVideo: {
          id: testVideo.id,
          filename: testVideo.filename,
          deleted: true
        },
        userVideosCount: userVideos.length
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No videos to test deletion with',
        userVideosCount: 0
      });
    }

  } catch (error) {
    console.error('Test Delete API: Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
} 