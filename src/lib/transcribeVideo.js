// src/lib/transcribeWithWhisper.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';
import { transcribeWithAssemblyAI } from './assemblyai';
import { chunkTranscript } from './chunkTranscript';
import { storeChunks } from './vectorDB';

// Helper: Download file from URL to tmp/
async function downloadFile(url, outputPath) {
  console.log('TranscribeVideo: Downloading file from:', url);
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
      console.log('TranscribeVideo: File downloaded successfully to:', outputPath);
      resolve();
    });
    writer.on('error', (error) => {
      console.error('TranscribeVideo: Download error:', error);
      reject(error);
    });
  });
}

export async function transcribeVideo(videoUrl, videoId) {
  console.log('TranscribeVideo: Starting transcription process for video ID:', videoId);
  
  // Check environment variables
  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.error('TranscribeVideo: ASSEMBLYAI_API_KEY is not set');
    throw new Error('AssemblyAI API key is not configured');
  }
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('TranscribeVideo: HUGGINGFACE_API_KEY is not set');
    throw new Error('HuggingFace API key is not configured');
  }
  
  console.log('TranscribeVideo: Environment variables checked successfully');
  
  try {
    // 1. Download video from Supabase Storage
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const localPath = path.join(tmpDir, `${videoId}_${Date.now()}.mp4`);
    
    console.log('TranscribeVideo: Will download to:', localPath);
    
    try {
      await downloadFile(videoUrl, localPath);
    } catch (downloadError) {
      console.error('TranscribeVideo: Failed to download video:', downloadError);
      throw new Error('Failed to download video file: ' + downloadError.message);
    }

    // 2. Transcribe with AssemblyAI
    console.log('TranscribeVideo: Starting AssemblyAI transcription');
    let transcript;
    try {
      transcript = await transcribeWithAssemblyAI(localPath, process.env.ASSEMBLYAI_API_KEY);
      console.log('TranscribeVideo: Transcription completed, length:', transcript.length);
    } catch (transcriptionError) {
      console.error('TranscribeVideo: Transcription failed:', transcriptionError);
      // Clean up local file
      try { fs.unlinkSync(localPath); } catch (e) {}
      throw new Error('Transcription failed: ' + transcriptionError.message);
    }

    // 3. Delete the local file
    try {
      fs.unlinkSync(localPath);
      console.log('TranscribeVideo: Local file cleaned up');
    } catch (cleanupError) {
      console.warn('TranscribeVideo: Failed to cleanup local file:', cleanupError);
    }

    // 4. Save transcript to DB
    console.log('TranscribeVideo: Saving transcript to database');
    const { data, error } = await supabase
      .from('transcripts')
      .insert([{ video_id: videoId, transcript }]);
    
    if (error) {
      console.error('TranscribeVideo: Database error:', error);
      throw new Error('Failed to save transcript: ' + error.message);
    }

    console.log('TranscribeVideo: Transcript saved to database');

    // 5. Create chunks and store in vector DB
    try {
      console.log('TranscribeVideo: Creating transcript chunks');
      const chunks = chunkTranscript(transcript);
      console.log('TranscribeVideo: Created', chunks.length, 'chunks');
      await storeChunks(chunks, videoId);
      console.log('TranscribeVideo: Chunks stored in vector DB');
    } catch (chunkError) {
      console.error('TranscribeVideo: Failed to create chunks:', chunkError);
      // Don't fail the whole process if chunking fails
    }

    console.log('TranscribeVideo: Transcription process completed successfully for video ID:', videoId);
    return { success: true, transcript: transcript.substring(0, 100) + '...', videoId };
    
  } catch (err) {
    console.error('TranscribeVideo: Unexpected error for video ID', videoId, ':', err);
    throw err;
  }
}