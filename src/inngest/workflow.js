import {inngest} from './inngest'
import {transcibeVideo} from './transcribe'
import {storeTranscript} from './database'

inngest.createFunction('Transcribe Video', {event: 'video.uploaded'}, async({event}) => {
    const transcript = await transcibeVideo(event.data.videoPath);
    await inngest.sent({name:"transcription_complete",data:{transcript,videoId:event.data.videoId}});
});

inngest.createFunction('Store Transcript', {event: 'transcription_complete'}, async({event}) => {
    await storeTranscript(event.data.videoId,event.data.transcript);
});