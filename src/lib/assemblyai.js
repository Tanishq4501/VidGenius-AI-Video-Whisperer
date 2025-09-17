import axios from 'axios';
import fs from 'fs';

export async function uploadToAssemblyAI(filePath, apiKey) {
    const response = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        fs.createReadStream(filePath),
        {
            headers: {
                'Authorization': apiKey,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }
    );

    console.log(response.data);
    return response.data.upload_url;
}

export async function requestTranscription(audioUrl, apiKey) {
    const response = await axios({
        method: 'post',
        url: 'https://api.assemblyai.com/v2/transcript',
        headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json'
        },
        data: { audio_url: audioUrl },
    });
    return response.data.id;
}

export async function getTranscription(transcriptId, apiKey, maxRetries = 60) {
    let retries = 0;
    while (retries < maxRetries) {
        const response = await axios({
            method: 'get',
            url: `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            headers: { authorization: `Bearer ${apiKey}` },
        });

        if (response.data.status === 'completed') {
            return response.data.text;
        } else if (response.data.status === 'failed') {
            throw new Error('Transcription failed');
        }

        retries++;
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Transcription timed out');
}

export async function transcribeWithAssemblyAI(filePathOrUrl, apiKey) {
    let audioUrl = filePathOrUrl;

    if (!/^https?:\/\//.test(filePathOrUrl)) {
        // If not a URL, upload the file
        audioUrl = await uploadToAssemblyAI(filePathOrUrl, apiKey);
        console.log(audioUrl);
    }

    const transcriptId = await requestTranscription(audioUrl, apiKey);
    const transcript = await getTranscription(transcriptId, apiKey);
    return transcript;
}