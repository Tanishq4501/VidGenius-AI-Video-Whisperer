// src/pages/api/upload.js
import * as formidable from 'formidable';
import fs from 'fs';
import {supabase} from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
    new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Check authentication
  let userId;
  try {
    const authResult = getAuth(req);
    userId = authResult.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (authError) {
    console.error('Auth error:', authError);
    return res.status(401).json({ error: 'Authentication failed' });
  }

  try {
    console.log('Upload API: Starting file upload process');
    
    const { fields, files } = await parseForm(req);
    const file = files.video;

    if (!file) {
      console.log('Upload API: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In formidable v2+, file is an array if multiple: use file[0] if needed
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
    const originalFilename = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
    const mimetype = Array.isArray(file) ? file[0].mimetype : file.mimetype;

    console.log('Upload API: File details:', { originalFilename, mimetype, filePath });

    if (!filePath) {
      console.log('Upload API: File path missing');
      return res.status(400).json({ error: 'File path missing' });
    }

    // Validate file type
    if (!mimetype.startsWith('video/')) {
      console.log('Upload API: Invalid file type:', mimetype);
      return res.status(400).json({ error: 'Invalid file type. Please upload a video file.' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log('Upload API: File read, size:', fileBuffer.length);

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = originalFilename.split('.').pop();
    const uniqueFilename = `${timestamp}_${originalFilename}`;

    // Upload to Supabase Storage
    console.log('Upload API: Uploading to Supabase storage');
    const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(uniqueFilename, fileBuffer, {
          contentType: mimetype,
          upsert: false, // Don't overwrite existing files
        });

    if (storageError) {
      console.error('Upload API: Storage error:', storageError);
      return res.status(500).json({ error: `Storage error: ${storageError.message}` });
    }

    console.log('Upload API: File uploaded to storage successfully');

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(uniqueFilename);

    // Save metadata to DB
    console.log('Upload API: Saving metadata to database');
    const { data, error } = await supabase
        .from('videos')
        .insert([{ 
          filename: originalFilename, 
          url: publicUrlData.publicUrl, 
          user_id: userId,
          uploaded_at: new Date().toISOString()
        }])
        .select();

    if (error) {
      console.error('Upload API: Database error:', error);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    console.log('Upload API: Upload successful, video ID:', data[0].id);

    // Clean up temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn('Upload API: Failed to cleanup temp file:', cleanupError);
    }

    // Trigger transcription process asynchronously
    console.log('Upload API: Triggering transcription process')
    try {
      // Import and call transcription function directly instead of HTTP request
      console.log('Upload API: Importing transcribeVideo function...')
      const { transcribeVideo } = await import('../../lib/transcribeVideo.js')
      console.log('Upload API: transcribeVideo function imported successfully')
      
      // Call transcription in background (don't await to avoid blocking)
      console.log('Upload API: Calling transcribeVideo with URL:', publicUrlData.publicUrl, 'and videoId:', data[0].id)
      transcribeVideo(publicUrlData.publicUrl, data[0].id).then(() => {
        console.log('Upload API: Transcription completed successfully')
      }).catch(error => {
        console.error('Upload API: Transcription failed:', error)
        console.error('Upload API: Transcription error stack:', error.stack)
      })
      
    } catch (transcriptionError) {
      console.error('Upload API: Failed to trigger transcription:', transcriptionError)
      console.error('Upload API: Transcription error stack:', transcriptionError.stack)
      // Don't fail the upload if transcription fails
    }

    res.status(200).json({ 
      message: 'Upload successful', 
      videoId: data[0].id,
      video: data[0] 
    });
  } catch (err) {
    console.error('Upload API: Unexpected error:', err);
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
}