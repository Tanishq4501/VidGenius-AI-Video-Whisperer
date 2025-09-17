// Test import
try {
  const YoutubeTranscript = require('youtube-transcript-api');
  console.log('Import successful:', typeof YoutubeTranscript);
  console.log('Available methods:', Object.keys(YoutubeTranscript));
} catch (error) {
  console.error('Import failed:', error.message);
} 