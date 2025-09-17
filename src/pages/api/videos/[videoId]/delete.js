import { supabase } from '/src/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication with improved error handling
  let userId;
  let retryCount = 0;
  const maxRetries = 3;
  
  // Log request headers for debugging
  console.log('Delete Video API: Request headers:', {
    authorization: req.headers.authorization ? 'present' : 'missing',
    'x-clerk-auth-token': req.headers['x-clerk-auth-token'] ? 'present' : 'missing',
    cookie: req.headers.cookie ? 'present' : 'missing'
  });
  
  while (retryCount < maxRetries) {
    try {
      const auth = getAuth(req);
      console.log('Delete Video API: Auth object:', {
        userId: auth.userId,
        sessionId: auth.sessionId,
        actor: auth.actor,
        sessionClaims: auth.sessionClaims ? 'present' : 'missing'
      });
      
      userId = auth.userId;
      if (userId) {
        console.log('Delete Video API: Auth successful on attempt', retryCount + 1, 'userId:', userId);
        break;
      } else {
        console.log('Delete Video API: No userId found, attempt', retryCount + 1);
        console.log('Delete Video API: Auth object details:', JSON.stringify(auth, null, 2));
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay
        }
      }
    } catch (authError) {
      console.log('Delete Video API: Auth error on attempt', retryCount + 1, ':', authError.message);
      console.log('Delete Video API: Auth error stack:', authError.stack);
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay
      } else {
        console.error('Delete Video API: All auth attempts failed');
        return res.status(401).json({ 
          error: 'Authentication failed', 
          details: authError.message,
          suggestion: 'Please refresh the page and try again'
        });
      }
    }
  }
  
  if (!userId) {
    console.error('Delete Video API: No userId found after all retries');
    return res.status(401).json({ 
      error: 'Authentication required',
      suggestion: 'Please refresh the page and try again'
    });
  }

  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Delete Video API: Deleting video ID:', videoId, 'for user:', userId);

    // First, verify the video belongs to the user
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, filename, url')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (videoError || !video) {
      console.error('Delete Video API: Video not found or access denied:', videoError);
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    console.log('Delete Video API: Video found, proceeding with deletion:', video);

    // Use the database function to delete video and all related data
    console.log('Delete Video API: Using database function to delete video and related data...');
    
    const { data: deletionResult, error: functionError } = await supabase
      .rpc('delete_video_and_related_data', {
        video_id_param: videoId,
        user_id_param: userId
      });

    if (functionError) {
      console.error('Delete Video API: Database function error:', functionError);
      return res.status(500).json({ 
        error: 'Failed to delete video', 
        details: functionError.message
      });
    }

    if (!deletionResult) {
      console.error('Delete Video API: Database function returned false - deletion failed');
      return res.status(500).json({ 
        error: 'Failed to delete video', 
        details: 'Database function returned false'
      });
    }

    console.log('Delete Video API: Video and all related data deleted successfully via database function');

    // Verify deletion immediately
    console.log('Delete Video API: Verifying deletion...');
    const { data: verifyVideo, error: verifyError } = await supabase
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .single();

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('Delete Video API: Verification successful - video not found (deleted)');
    } else if (verifyError) {
      console.error('Delete Video API: Verification error:', verifyError);
    } else {
      console.error('Delete Video API: Verification failed - video still exists:', verifyVideo);
      return res.status(500).json({ 
        error: 'Video deletion verification failed', 
        details: 'Video still exists after deletion attempt'
      });
    }

    // Log successful deletion
    console.log('Delete Video API: All related data deleted successfully');

    // 5. Delete the video file from storage (if it's an uploaded file)
    if (video.url && !video.url.includes('youtube.com') && !video.url.includes('youtu.be')) {
      try {
        // Extract the file path from the URL
        const urlParts = video.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([fileName]);

        if (storageError) {
          console.error('Delete Video API: Error deleting from storage:', storageError);
        }
      } catch (storageError) {
        console.error('Delete Video API: Error with storage deletion:', storageError);
      }
    }

    console.log('Delete Video API: Successfully deleted video ID:', videoId);

    res.status(200).json({ 
      message: 'Video deleted successfully',
      deletedVideo: {
        id: videoId,
        filename: video.filename
      }
    });

  } catch (error) {
    console.error('Delete Video API: Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 