import { testEmbedding } from '../../lib/vectorDB';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const embedding = await testEmbedding();
        res.status(200).json({
            success: true,
            embeddingLength: embedding.length,
            sampleValues: embedding.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}