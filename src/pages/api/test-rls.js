import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('RLS Test API: Starting comprehensive RLS test...');

    // Test 1: Check authentication
    let userId;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log('RLS Test API: Auth successful, userId:', userId);
    } catch (authError) {
      console.error('RLS Test API: Auth failed:', authError);
      return res.status(401).json({ error: 'Auth failed', details: authError.message });
    }

    const tests = {};

    // Test 2: Check videos table RLS status and policies
    console.log('RLS Test API: Testing videos table RLS...');
    try {
      // Skip the RPC call since it's causing webpack issues
      console.log('RLS Test API: Skipping RPC call, testing through operations directly');

      // Test basic operations on videos table
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, filename, user_id')
        .eq('user_id', userId)
        .limit(3);

      tests.videosRead = {
        success: !videosError,
        count: videos?.length || 0,
        error: videosError?.message
      };

      console.log('RLS Test API: Videos read test result:', tests.videosRead);

      // Test update operation
      if (videos && videos.length > 0) {
        const testVideo = videos[0];
        const { data: updateResult, error: updateError } = await supabase
          .from('videos')
          .update({ filename: testVideo.filename }) // No actual change
          .eq('id', testVideo.id)
          .eq('user_id', userId)
          .select();

        tests.videosUpdate = {
          success: !updateError,
          result: updateResult,
          error: updateError?.message
        };

        console.log('RLS Test API: Videos update test result:', tests.videosUpdate);

        // Test delete operation
        const { data: deleteResult, error: deleteError } = await supabase
          .from('videos')
          .delete()
          .eq('id', testVideo.id)
          .eq('user_id', userId)
          .select();

        tests.videosDelete = {
          success: !deleteError,
          result: deleteResult,
          error: deleteError?.message
        };

        console.log('RLS Test API: Videos delete test result:', tests.videosDelete);

        // Verify if the video was actually deleted
        const { data: verifyVideo, error: verifyError } = await supabase
          .from('videos')
          .select('id')
          .eq('id', testVideo.id)
          .single();

        tests.videosVerifyDelete = {
          success: verifyError && verifyError.code === 'PGRST116', // Should be "not found"
          videoExists: !verifyError || verifyError.code !== 'PGRST116',
          error: verifyError?.message
        };

        console.log('RLS Test API: Videos delete verification result:', tests.videosVerifyDelete);
      }

    } catch (videosError) {
      console.error('RLS Test API: Videos table test error:', videosError);
      tests.videosError = videosError.message;
    }

    // Test 3: Check messages table RLS
    console.log('RLS Test API: Testing messages table RLS...');
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, video_id, role')
        .limit(3);

      tests.messagesRead = {
        success: !messagesError,
        count: messages?.length || 0,
        error: messagesError?.message
      };

      console.log('RLS Test API: Messages read test result:', tests.messagesRead);

      // Test messages delete
      if (messages && messages.length > 0) {
        const testMessage = messages[0];
        const { error: deleteError } = await supabase
          .from('messages')
          .delete()
          .eq('id', testMessage.id);

        tests.messagesDelete = {
          success: !deleteError,
          error: deleteError?.message
        };

        console.log('RLS Test API: Messages delete test result:', tests.messagesDelete);
      }

    } catch (messagesError) {
      console.error('RLS Test API: Messages table test error:', messagesError);
      tests.messagesError = messagesError.message;
    }

    // Test 4: Check transcripts table RLS
    console.log('RLS Test API: Testing transcripts table RLS...');
    try {
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('transcripts')
        .select('id, video_id')
        .limit(3);

      tests.transcriptsRead = {
        success: !transcriptsError,
        count: transcripts?.length || 0,
        error: transcriptsError?.message
      };

      console.log('RLS Test API: Transcripts read test result:', tests.transcriptsRead);

      // Test transcripts delete
      if (transcripts && transcripts.length > 0) {
        const testTranscript = transcripts[0];
        const { error: deleteError } = await supabase
          .from('transcripts')
          .delete()
          .eq('id', testTranscript.id);

        tests.transcriptsDelete = {
          success: !deleteError,
          error: deleteError?.message
        };

        console.log('RLS Test API: Transcripts delete test result:', tests.transcriptsDelete);
      }

    } catch (transcriptsError) {
      console.error('RLS Test API: Transcripts table test error:', transcriptsError);
      tests.transcriptsError = transcriptsError.message;
    }

    // Test 5: Check embeddings table RLS
    console.log('RLS Test API: Testing embeddings table RLS...');
    try {
      const { data: embeddings, error: embeddingsError } = await supabase
        .from('embeddings')
        .select('id, video_id')
        .limit(3);

      tests.embeddingsRead = {
        success: !embeddingsError,
        count: embeddings?.length || 0,
        error: embeddingsError?.message
      };

      console.log('RLS Test API: Embeddings read test result:', tests.embeddingsRead);

      // Test embeddings delete
      if (embeddings && embeddings.length > 0) {
        const testEmbedding = embeddings[0];
        const { error: deleteError } = await supabase
          .from('embeddings')
          .delete()
          .eq('id', testEmbedding.id);

        tests.embeddingsDelete = {
          success: !deleteError,
          error: deleteError?.message
        };

        console.log('RLS Test API: Embeddings delete test result:', tests.embeddingsDelete);
      }

    } catch (embeddingsError) {
      console.error('RLS Test API: Embeddings table test error:', embeddingsError);
      tests.embeddingsError = embeddingsError.message;
    }

    console.log('RLS Test API: All tests completed');

    res.status(200).json({
      success: true,
      message: 'RLS test completed',
      tests: tests,
      summary: {
        videosTable: {
          read: tests.videosRead?.success,
          update: tests.videosUpdate?.success,
          delete: tests.videosDelete?.success,
          actuallyDeleted: tests.videosVerifyDelete?.success
        },
        messagesTable: {
          read: tests.messagesRead?.success,
          delete: tests.messagesDelete?.success
        },
        transcriptsTable: {
          read: tests.transcriptsRead?.success,
          delete: tests.transcriptsDelete?.success
        },
        embeddingsTable: {
          read: tests.embeddingsRead?.success,
          delete: tests.embeddingsDelete?.success
        }
      }
    });

  } catch (error) {
    console.error('RLS Test API: Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
} 