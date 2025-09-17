export function chunkTranscript(transcript,chunkSize=500,overlap=50) {
    const words = transcript.split(' ');
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim()) {
            chunks.push({
                text: chunk,
                startIndex: i,
                endIndex: Math.min(i + chunkSize, words.length)
            });
        }
    }

    return chunks;
}