-- Fix RLS policies for videos table and related tables
-- This script will ensure proper DELETE permissions for authenticated users

-- 1. Enable RLS on videos table if not already enabled
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies on videos table
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Allow authenticated users" ON videos;

-- 3. Create comprehensive policies for videos table
-- Policy for SELECT (read)
CREATE POLICY "Users can view their own videos" ON videos
    FOR SELECT USING (
        user_id = auth.uid()::text
    );

-- Policy for INSERT
CREATE POLICY "Users can insert their own videos" ON videos
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text
    );

-- Policy for UPDATE
CREATE POLICY "Users can update their own videos" ON videos
    FOR UPDATE USING (
        user_id = auth.uid()::text
    ) WITH CHECK (
        user_id = auth.uid()::text
    );

-- Policy for DELETE
CREATE POLICY "Users can delete their own videos" ON videos
    FOR DELETE USING (
        user_id = auth.uid()::text
    );

-- 4. Fix messages table policies (if needed)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages for their videos" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their videos" ON messages;
DROP POLICY IF EXISTS "Users can update messages for their videos" ON messages;
DROP POLICY IF EXISTS "Users can delete messages for their videos" ON messages;

-- Messages policies
CREATE POLICY "Users can view messages for their videos" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = messages.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert messages for their videos" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = messages.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update messages for their videos" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = messages.video_id 
            AND videos.user_id = auth.uid()::text
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = messages.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete messages for their videos" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = messages.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

-- 5. Fix transcripts table policies
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transcripts for their videos" ON transcripts;
DROP POLICY IF EXISTS "Users can insert transcripts for their videos" ON transcripts;
DROP POLICY IF EXISTS "Users can update transcripts for their videos" ON transcripts;
DROP POLICY IF EXISTS "Users can delete transcripts for their videos" ON transcripts;

-- Transcripts policies
CREATE POLICY "Users can view transcripts for their videos" ON transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = transcripts.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert transcripts for their videos" ON transcripts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = transcripts.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update transcripts for their videos" ON transcripts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = transcripts.video_id 
            AND videos.user_id = auth.uid()::text
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = transcripts.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete transcripts for their videos" ON transcripts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = transcripts.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

-- 6. Fix embeddings table policies
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view embeddings for their videos" ON embeddings;
DROP POLICY IF EXISTS "Users can insert embeddings for their videos" ON embeddings;
DROP POLICY IF EXISTS "Users can update embeddings for their videos" ON embeddings;
DROP POLICY IF EXISTS "Users can delete embeddings for their videos" ON embeddings;

-- Embeddings policies
CREATE POLICY "Users can view embeddings for their videos" ON embeddings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = embeddings.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert embeddings for their videos" ON embeddings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = embeddings.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update embeddings for their videos" ON embeddings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = embeddings.video_id 
            AND videos.user_id = auth.uid()::text
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = embeddings.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete embeddings for their videos" ON embeddings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = embeddings.video_id 
            AND videos.user_id = auth.uid()::text
        )
    );

-- 7. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('videos', 'messages', 'transcripts', 'embeddings')
ORDER BY tablename, policyname; 