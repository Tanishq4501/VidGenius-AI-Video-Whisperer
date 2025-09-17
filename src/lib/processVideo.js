import {downloadVideo} from './downloadVideo';
import {transcribeVideo} from './transcribeVideo';

export async function processVideo(localPath) {
    const transcript = await transcribeVideo(localPath);
    return transcript;
}