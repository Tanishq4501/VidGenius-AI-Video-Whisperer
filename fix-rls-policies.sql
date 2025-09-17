-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages for their videos" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their videos" ON messages;

-- Create improved policies using EXISTS for better performance and reliability
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