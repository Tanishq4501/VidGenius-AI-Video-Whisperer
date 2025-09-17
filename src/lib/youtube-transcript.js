import { transcribeWithAssemblyAI } from './assemblyai';
import fs from 'fs';
import path from 'path';

export async function getYoutubeTranscript(videoUrl) {
    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Invalid video URL');
        }

        console.log('Attempting to get transcript for video ID:', videoId);
        
        // Try multiple approaches
        let transcript = null;
        
        // Approach 1: Try to get transcript directly from YouTube page
        try {
            transcript = await getTranscriptFromPage(videoId);
            if (transcript) {
                console.log('Successfully extracted transcript from YouTube page');
                return transcript;
            }
        } catch (error1) {
            console.log('Direct transcript extraction failed, trying AssemblyAI...');
        }
        
        // Approach 2: Use AssemblyAI (fallback)
        if (!process.env.ASSEMBLYAI_API_KEY) {
            throw new Error('AssemblyAI API key is missing. Please add ASSEMBLYAI_API_KEY to your environment variables.');
        }

        console.log('Downloading YouTube audio for video ID:', videoId);
        
        // Download audio from YouTube with timeout
        const audioPath = await Promise.race([
            downloadYouTubeAudio(videoId),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Audio download timeout (5 minutes)')), 5 * 60 * 1000)
            )
        ]);
        
        try {
            // Transcribe with AssemblyAI with timeout
            console.log('Transcribing with AssemblyAI...');
            transcript = await Promise.race([
                transcribeWithAssemblyAI(audioPath, process.env.ASSEMBLYAI_API_KEY),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Transcription timeout (10 minutes)')), 10 * 60 * 1000)
                )
            ]);
            
            // Clean up: Delete the audio file
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
                console.log('Audio file deleted:', audioPath);
            }
            
            return transcript;
        } catch (transcriptionError) {
            // Clean up on error too
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
                console.log('Audio file deleted after error:', audioPath);
            }
            throw transcriptionError;
        }
        
    } catch (error) {
        console.error('YouTube transcript error:', error);
        throw new Error(`Failed to get transcript: ${error.message}`);
    }
}

async function getTranscriptFromPage(videoId) {
    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch YouTube page');
        }
        
        const html = await response.text();
        
        // Look for transcript data in the page
        const transcriptMatch = html.match(/"captions":\s*({[^}]+})/);
        if (transcriptMatch) {
            // Try to extract transcript from captions
            const captionsData = JSON.parse(transcriptMatch[1]);
            if (captionsData && captionsData.playerCaptionsTracklistRenderer) {
                const tracks = captionsData.playerCaptionsTracklistRenderer.captionTracks;
                if (tracks && tracks.length > 0) {
                    // Get the first available transcript
                    const transcriptUrl = tracks[0].baseUrl;
                    const transcriptResponse = await fetch(transcriptUrl);
                    const transcriptXml = await transcriptResponse.text();
                    return parseTranscriptXml(transcriptXml);
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting transcript from page:', error);
        return null;
    }
}

function parseTranscriptXml(xml) {
    try {
        // Simple XML parsing for transcript
        const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g);
        if (textMatches) {
            return textMatches
                .map(match => match.replace(/<text[^>]*>([^<]+)<\/text>/, '$1'))
                .join(' ');
        }
        return null;
    } catch (error) {
        console.error('XML parsing error:', error);
        return null;
    }
}

async function downloadYouTubeAudio(videoId) {
    try {
        // Try multiple ytdl packages
        let ytdl;
        
        try {
            // Try @distube/ytdl-core first (more reliable)
            const ytdlModule = await import('@distube/ytdl-core');
            ytdl = ytdlModule.default;
            console.log('Using @distube/ytdl-core');
        } catch (error1) {
            try {
                // Fallback to original ytdl-core
                const ytdlModule = await import('ytdl-core');
                ytdl = ytdlModule.default;
                console.log('Using original ytdl-core');
            } catch (error2) {
                throw new Error('No ytdl package available. Please install: npm install @distube/ytdl-core');
            }
        }
        
        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const audioPath = path.join(tmpDir, `${videoId}.mp3`);
        
        return new Promise((resolve, reject) => {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            console.log('Starting download from:', videoUrl);
            
            // Try different options to avoid the "Could not extract functions" error
            const stream = ytdl(videoUrl, {
                quality: 'highestaudio',
                filter: 'audioonly',
                format: 'mp3',
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });
            
            const writeStream = fs.createWriteStream(audioPath);
            
            stream.pipe(writeStream);
            
            // Add progress logging
            stream.on('progress', (chunkLength, downloaded, total) => {
                const percent = (downloaded / total * 100).toFixed(2);
                console.log(`Download progress: ${percent}% (${downloaded}/${total} bytes)`);
            });
            
            writeStream.on('finish', () => {
                console.log('Audio downloaded successfully:', audioPath);
                console.log('File size:', fs.statSync(audioPath).size, 'bytes');
                resolve(audioPath);
            });
            
            writeStream.on('error', (error) => {
                console.error('Write stream error:', error);
                reject(new Error(`Failed to save audio file: ${error.message}`));
            });
            
            stream.on('error', (error) => {
                console.error('Download stream error:', error);
                reject(new Error(`Failed to download audio: ${error.message}`));
            });
        });
        
    } catch (error) {
        console.error('ytdl-core import error:', error);
        throw new Error('ytdl-core package not available. Please install it with: npm install @distube/ytdl-core');
    }
}

export function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}
