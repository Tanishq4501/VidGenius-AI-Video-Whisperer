import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';
import {transcribeWithAssemblyAI} from "../../lib/assemblyai";
import {chunkTranscript} from '../../lib/chunkTranscript';
import {storeChunks} from '../../lib/vectorDB';

// Helper: Download file from URL to tmp/
async function downloadFile(url, outputPath) {
  console.log('Transcribe API: Downloading file from:', url);
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({ 
    url, 
    method: 'GET', 
    responseType: 'stream',
    timeout: 30000 // 30 second timeout
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log('Transcribe API: File downloaded successfully to:', outputPath);
      resolve();
    });
    writer.on('error', (error) => {
      console.error('Transcribe API: Download error:', error);
      reject(error);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('Transcribe API: Starting transcription process');
    const { videoUrl, videoId } = req.body;

    if (!videoUrl || !videoId) {
      return res.status(400).json({ error: 'videoUrl and videoId are required' });
    }

    console.log('Transcribe API: Processing video ID:', videoId, 'URL:', videoUrl);

    // 1. Download video from Supabase Storage
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const localPath = path.join(tmpDir, `${videoId}_${Date.now()}.mp4`);
    
    try {
      await downloadFile(videoUrl, localPath);
    } catch (downloadError) {
      console.error('Transcribe API: Failed to download video:', downloadError);
      return res.status(500).json({ error: 'Failed to download video file' });
    }

    // 2. Transcribe with AssemblyAI
    console.log('Transcribe API: Starting AssemblyAI transcription');
    let transcript;
    try {
      transcript = await transcribeWithAssemblyAI(localPath, process.env.ASSEMBLYAI_API_KEY);
      console.log('Transcribe API: Transcription completed, length:', transcript.length);
    } catch (transcriptionError) {
      console.error('Transcribe API: Transcription failed:', transcriptionError);
      // Clean up local file
      try { fs.unlinkSync(localPath); } catch (e) {}
      return res.status(500).json({ error: 'Transcription failed: ' + transcriptionError.message });
    }

    // 3. Delete the local file
    try {
      fs.unlinkSync(localPath);
      console.log('Transcribe API: Local file cleaned up');
    } catch (cleanupError) {
      console.warn('Transcribe API: Failed to cleanup local file:', cleanupError);
    }

    // 4. Save transcript to DB
    console.log('Transcribe API: Saving transcript to database');
    const { data, error } = await supabase
      .from('transcripts')
      .insert([{ video_id: videoId, transcript }]);
    
    if (error) {
      console.error('Transcribe API: Database error:', error);
      throw new Error('Failed to save transcript: ' + error.message);
    }

    console.log('Transcribe API: Transcript saved to database');

    // 5. Create chunks and store in vector DB
    try {
      console.log('Transcribe API: Creating transcript chunks');
      const chunks = chunkTranscript(transcript);
      await storeChunks(chunks, videoId);
      console.log('Transcribe API: Chunks stored in vector DB');
    } catch (chunkError) {
      console.error('Transcribe API: Failed to create chunks:', chunkError);
      // Don't fail the whole process if chunking fails
    }

    console.log('Transcribe API: Transcription process completed successfully');
    res.status(200).json({ 
      success: true, 
      transcript: transcript.substring(0, 100) + '...',
      videoId 
    });
  } catch (err) {
    console.error('Transcribe API: Unexpected error:', err);
    res.status(500).json({ error: 'Transcription failed: ' + err.message });
  }
}