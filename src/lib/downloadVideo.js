import fetch from 'node-fetch';
import fs from 'fs';

export async function downloadVideo(url, outputPath) {
    const res = await fetch(url);
    if (!res.ok){
        throw new Error(`Failed to download video: ${res.statusText}`);
    }

    const fileStream = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish",resolve);
    })
}