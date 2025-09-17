
import { HFInference } from '@huggingface/inference';
import {supabase} from './supabase';

export async function generateEmbeddings(text) {
    try {
        // Add validation to ensure we're getting a string
        if (typeof text !== 'string') {
            throw new Error(`Expected string, got ${typeof text}: ${JSON.stringify(text)}`);
        }

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: text
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        // The response is already the embedding array (384 dimensions)
        let embedding = result;

        // Convert to proper array if needed
        if (!Array.isArray(embedding)) {
            embedding = Array.from(embedding);
        }

        return embedding;
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw error;
    }
}

// Store chunks in Supabase pgvector
export async function storeChunks(chunks, videoId) {
    console.log(`Storing ${chunks.length} chunks for video ${videoId}`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
        console.log(`Chunk text: "${chunk.text}"`); // Debug log

        // FIX: Pass chunk.text instead of chunk
        const embedding = await generateEmbeddings(chunk.text);

        const { error } = await supabase
            .from('embeddings')
            .insert({
                video_id: videoId,
                chunk_text: chunk.text,
                embedding: embedding,
                chunk_index: i
            });

        if (error) {
            console.error(`Error storing chunk ${i}:`, error);
            throw error;
        }
    }

    console.log('All chunks stored successfully');
}
export async function retrieveChunks(question,videoId,topK=5){
    const questionEmbedding = await generateEmbeddings(question);
    const {data} = await supabase.rpc('match_embeddings', {
      query_embedding: questionEmbedding,
      match_threshold: 0.0,
      match_count: topK,
        video_id_filter: videoId,
    });

    return data || [];
}

// Add this test function at the end of your vectorDB.js file
export async function testEmbedding() {
    try {
        console.log("Testing Hugging Face embedding...");

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: "Hello world"
                }),
            }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("Raw Hugging Face response length:", result.length);
        console.log("Is array:", Array.isArray(result));

        // The response is already the embedding array, not an array of arrays
        let embedding = result;

        // Convert to proper array if needed
        if (!Array.isArray(embedding)) {
            embedding = Array.from(embedding);
        }

        console.log("✅ Final embedding type:", typeof embedding);
        console.log("✅ Final embedding is array:", Array.isArray(embedding));
        console.log("✅ Embedding length:", embedding.length);
        console.log("✅ First few values:", embedding.slice(0, 5));

        return embedding;
    } catch (error) {
        console.error("❌ Embedding test failed:", error);
        throw error;
    }
}

/*import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('OpenAI embedding error:', error);
        throw error;
    }
}

export async function storeChunks(chunks, videoId) {
    console.log(`Storing ${chunks.length} chunks for video ${videoId}`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);

        const embedding = await generateEmbedding(chunk.text);

        const { error } = await supabase
            .from('embeddings')
            .insert({
                video_id: videoId,
                chunk_text: chunk.text,
                embedding: embedding,
                chunk_index: i
            });

        if (error) {
            console.error(`Error storing chunk ${i}:`, error);
            throw error;
        }
    }

    console.log('All chunks stored successfully');
}

export async function retrieveChunks(question, videoId, topK = 5) {
    const questionEmbedding = await generateEmbedding(question);

    const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: questionEmbedding,
        match_threshold: 0.7,
        match_count: topK,
        video_id_filter: videoId
    });

    if (error) {
        console.error('Error retrieving chunks:', error);
        throw error;
    }

    return data || [];
}*/

