import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
Based on the following context and question, return a JSON object with arrays of direct resource links (Reddit, YouTube, articles, background info) relevant to the topic.
For each resource, include: "title", "url", and a short "relevance" description.
Return the result in this exact JSON format, and nothing else:
{
  "reddit_posts": [
    { "title": "...", "url": "...", "relevance": "..." }
  ],
  "youtube_videos": [
    { "title": "...", "url": "...", "relevance": "..." }
  ],
  "articles": [
    { "title": "...", "url": "...", "relevance": "..." }
  ],
  "background_info": [
    { "title": "...", "url": "...", "relevance": "..." }
  ]
}
Context: "${context || ''}"
Question: "${question}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text.trim();
    // Remove Markdown code block if present
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }

    let resources;
    try {
      resources = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ error: 'Gemini did not return valid JSON', raw: text });
    }

    return res.status(200).json({
      success: true,
      resources,
      method: 'gemini_links',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message || 'Gemini API error' });
  }
} 