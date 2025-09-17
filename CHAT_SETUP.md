# Chat Interface Setup Guide

## Overview
The chat interface allows users to ask questions about their uploaded videos and get AI-powered responses based on the video transcript.

## Features
- Real-time chat interface with video context
- Message history persistence
- Suggested questions for quick interaction
- Loading states and error handling
- Responsive design matching the wireframe

## Database Setup

### 1. Create Messages Table
Run the following SQL in your Supabase SQL editor:

```sql
-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_video_id ON messages(video_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see messages for videos they own
CREATE POLICY "Users can view messages for their videos" ON messages
    FOR SELECT USING (
        video_id IN (
            SELECT id FROM videos WHERE user_id = auth.uid()
        )
    );

-- Create policy to allow users to insert messages for their videos
CREATE POLICY "Users can insert messages for their videos" ON messages
    FOR INSERT WITH CHECK (
        video_id IN (
            SELECT id FROM videos WHERE user_id = auth.uid()
        )
    );
```

## Environment Variables
Make sure you have the following environment variables set:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Components Structure

### Main Components:
1. **ChatPage** (`src/app/chat/[videoId]/page.js`)
   - Main chat page that handles video data fetching and routing
   - Manages loading and error states

2. **ChatHeader** (`src/components/chat-header.jsx`)
   - Header with video Q&A branding and user controls
   - Integrates with Clerk authentication

3. **ChatInterface** (`src/components/chat-interface.jsx`)
   - Main chat container with video info, messages, and input
   - Handles message sending and loading states

4. **ChatMessage** (`src/components/chat-message.jsx`)
   - Individual message component for user and AI messages
   - Displays timestamps and proper styling

5. **ChatInput** (`src/components/chat-input.jsx`)
   - Input form with send button and additional controls
   - Handles Enter key submission

### API Endpoints:
- **GET /api/chat/[videoId]** - Fetch chat history
- **POST /api/chat/[videoId]** - Send new message and get AI response

## Usage Flow

1. User uploads a video or submits YouTube link
2. Video gets processed (transcription, embeddings)
3. User is redirected to processing page
4. After processing, user is redirected to chat page
5. User can ask questions about the video content
6. AI responds based on the video transcript
7. Chat history is persisted in the database

## Styling
The interface uses custom Tailwind colors defined in `tailwind.config.js`:
- `primary`: #6366f1 (Indigo)
- `primary-dark`: #4f46e5 (Darker indigo)
- `accent`: #10b981 (Emerald)
- `user-msg`: #6366f1 (User message background)
- `ai-msg`: #ffffff (AI message background)

## Security
- All chat endpoints require authentication via Clerk
- Users can only access messages for videos they own
- Row Level Security (RLS) is enabled on the messages table
- Input validation and sanitization is implemented

## Testing
1. Upload a video or submit a YouTube link
2. Wait for processing to complete
3. Navigate to the chat page
4. Try asking questions about the video content
5. Verify that responses are relevant to the video transcript
6. Check that chat history persists between sessions 