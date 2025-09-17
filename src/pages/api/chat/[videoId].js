import { supabase } from '/src/lib/supabase'
import { generateResponse } from '/src/lib/llm'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req, res) {
  const { videoId } = req.query

  console.log('Chat API: Request method:', req.method)
  console.log('Chat API: Video ID:', videoId)
  console.log('Chat API: Request headers:', req.headers)

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' })
  }

  // Check authentication
  let userId
  try {
    const authResult = getAuth(req)
    userId = authResult.userId
    console.log('Chat API: Auth result - userId:', userId)
    console.log('Chat API: Request headers:', Object.keys(req.headers))
    console.log('Chat API: Cookie header:', req.headers.cookie ? 'Present' : 'Missing')
    
    if (!userId) {
      console.log('Chat API: No userId found, returning 401')
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } catch (authError) {
    console.error('Chat API: Auth error:', authError)
    return res.status(401).json({ error: 'Authentication failed' })
  }

  if (req.method === 'GET') {
    // Get chat history
    try {
      // Verify the user owns this video
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('id')
        .eq('id', parseInt(videoId))
        .eq('user_id', userId)
        .single()

      if (videoError || !video) {
        return res.status(404).json({ error: 'Video not found or access denied' })
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('video_id', parseInt(videoId))
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return res.status(500).json({ error: 'Failed to fetch messages' })
      }

      res.status(200).json({ messages: messages || [] })
    } catch (error) {
      console.error('Error in GET /api/chat:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Send a new message
    try {
      const { message } = req.body

      if (!message) {
        return res.status(400).json({ error: 'Message is required' })
      }

      // Verify the user owns this video
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('id')
        .eq('id', parseInt(videoId))
        .eq('user_id', userId)
        .single()

      if (videoError || !video) {
        return res.status(404).json({ error: 'Video not found or access denied' })
      }

      // Get video transcript for context
      const { data: transcriptData, error: transcriptError } = await supabase
        .from('transcripts')
        .select('transcript')
        .eq('video_id', parseInt(videoId))
        .single()

      if (transcriptError || !transcriptData) {
        return res.status(404).json({ error: 'Video transcript not found' })
      }

      // Get chat history for context
      const { data: chatHistory, error: historyError } = await supabase
        .from('messages')
        .select('role, content')
        .eq('video_id', parseInt(videoId))
        .order('created_at', { ascending: true })
        .limit(5) // Limit to last 5 messages to avoid context overflow

      if (historyError) {
        console.error('Error fetching chat history:', historyError)
        // Continue without chat history if there's an error
      }

      console.log('Chat history length:', chatHistory?.length || 0)

      // Save user message
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert([{
          video_id: parseInt(videoId),
          user_id: userId,
          role: 'user',
          content: message
        }])

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError)
        return res.status(500).json({ error: 'Failed to save message' })
      }

      // Generate AI response
      console.log('Generating AI response for message:', message)
      console.log('Transcript length:', transcriptData.transcript.length)
      
      let aiResponse
      try {
        aiResponse = await generateResponse(message, transcriptData.transcript, chatHistory || [])
        console.log('AI response generated successfully, length:', aiResponse.length)
        console.log('AI response preview:', aiResponse.substring(0, 100) + '...')
      } catch (llmError) {
        console.error('LLM API error:', llmError)
        throw new Error(`LLM API failed: ${llmError.message}`)
      }

      // Save AI response
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([{
          video_id: parseInt(videoId),
          user_id: userId,
          role: 'assistant',
          content: aiResponse
        }])

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError)
        return res.status(500).json({ error: 'Failed to save AI response' })
      }

      res.status(200).json({ response: aiResponse })
    } catch (error) {
      console.error('Error in POST /api/chat:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        videoId,
        userId
      })
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
} 