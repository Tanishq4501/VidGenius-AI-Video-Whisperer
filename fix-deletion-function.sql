-- Create a function to delete video and all related data
-- This function will bypass RLS and handle the deletion properly

CREATE OR REPLACE FUNCTION delete_video_and_related_data(video_id_param INTEGER, user_id_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    video_exists BOOLEAN;
    deletion_success BOOLEAN := TRUE;
BEGIN
    -- First, verify the video exists and belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM videos 
        WHERE id = video_id_param 
        AND user_id = user_id_param
    ) INTO video_exists;
    
    IF NOT video_exists THEN
        RAISE EXCEPTION 'Video not found or access denied';
    END IF;
    
    -- Delete messages (if any)
    DELETE FROM messages WHERE video_id = video_id_param;
    
    -- Delete embeddings (if any)
    DELETE FROM embeddings WHERE video_id = video_id_param;
    
    -- Delete transcripts (if any)
    DELETE FROM transcripts WHERE video_id = video_id_param;
    
    -- Finally, delete the video
    DELETE FROM videos WHERE id = video_id_param AND user_id = user_id_param;
    
    -- Check if video was actually deleted
    IF NOT FOUND THEN
        deletion_success := FALSE;
    END IF;
    
    RETURN deletion_success;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return false
        RAISE LOG 'Error deleting video %: %', video_id_param, SQLERRM;
        RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_video_and_related_data(INTEGER, TEXT) TO authenticated;

-- Test the function (optional - remove this after testing)
-- SELECT delete_video_and_related_data(15, 'user_2zltJhxXoQHcjKjcIBHBwYpCfjn'); 