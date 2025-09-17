import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateResponse(userMessage, transcript, chatHistory = []) {
  try {
    console.log('LLM: Starting response generation')
    console.log('LLM: User message:', userMessage)
    console.log('LLM: Transcript length:', transcript.length)
    console.log('LLM: Chat history length:', chatHistory.length)
    
    // Build conversation messages array
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant that answers questions about video content based on the provided transcript. 
        
        Here is the transcript of the video:
        ${transcript}
        
        Use this transcript to answer questions. If a question cannot be answered from the transcript, politely say so.
        Keep your responses conversational and engaging. You can reference previous parts of the conversation when relevant.
        
        Keep your responses concise and focused.`
      }
    ]

    // Add chat history to the conversation (only last few messages for context)
    if (chatHistory.length > 0) {
      console.log('LLM: Adding chat history for context:', chatHistory.length, 'messages')
      chatHistory.forEach((msg, index) => {
        console.log(`LLM: History message ${index + 1}:`, msg.role, '-', msg.content.substring(0, 50) + '...')
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    })

    console.log('LLM: Sending request to Groq API with', messages.length, 'total messages')
    console.log('LLM: Message breakdown: 1 system +', chatHistory.length, 'history + 1 current =', messages.length)
    
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 2048, // Reduced from 4096 to keep responses more focused
    })

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time."
    console.log('LLM: Response received, length:', response.length)
    return response
  } catch (error) {
    console.error('LLM: Error generating response:', error)
    console.error('LLM: Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response
    })
    throw error // Re-throw to let the API handle it
  }
}