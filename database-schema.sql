-- Add user_id column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS user_id uuid;

-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    user_id uuid,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_video_id ON messages(video_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see messages for their videos
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