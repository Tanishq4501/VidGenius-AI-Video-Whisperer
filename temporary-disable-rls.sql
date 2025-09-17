-- Temporarily disable RLS on all tables to test deletion functionality
-- WARNING: This removes security restrictions - only use for testing!

-- Disable RLS on videos table
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on messages table
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transcripts table
ALTER TABLE transcripts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on embeddings table
ALTER TABLE embeddings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('videos', 'messages', 'transcripts', 'embeddings')
ORDER BY tablename;

-- To re-enable RLS later, run the fix-videos-rls.sql file 