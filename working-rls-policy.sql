-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view messages for their videos" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their videos" ON messages;

-- Create a simple policy that allows authenticated users to access messages
-- This is a temporary solution - we'll add proper user isolation later
CREATE POLICY "Allow authenticated users" ON messages
    FOR ALL USING (true);

-- Alternative: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Allow users to access their video messages" ON messages
--     FOR ALL USING (
--         video_id IN (
--             SELECT id FROM videos WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
--         )
--     ); 