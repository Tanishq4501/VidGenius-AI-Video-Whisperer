// Simple test script for YouTube transcript
import { getYoutubeTranscript } from './src/lib/youtube-transcript.js';

async function testTranscript() {
  try {
    // Test with a TED Talk that definitely has captions
    const videoUrl = 'https://www.youtube.com/watch?v=8jPQjjsBbIc'; // TED Talk
    console.log('Testing with:', videoUrl);
    
    const transcript = await getYoutubeTranscript(videoUrl);
    console.log('Success! Transcript length:', transcript.length);
    console.log('First 200 characters:', transcript.substring(0, 200));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTranscript(); 