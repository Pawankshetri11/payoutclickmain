-- Fix profile_locks table schema to ensure proper locking mechanism
-- Run this in your Supabase SQL Editor

-- Drop old locked_until column if it exists (we use expires_at instead)
ALTER TABLE profile_locks 
DROP COLUMN IF EXISTS locked_until;

-- Add locked_at column if it doesn't exist
ALTER TABLE profile_locks 
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop the unique constraint (we'll handle uniqueness in application logic)
ALTER TABLE profile_locks 
DROP CONSTRAINT IF EXISTS profile_locks_profile_id_unique;

-- Drop old constraint name if it exists
ALTER TABLE profile_locks 
DROP CONSTRAINT IF EXISTS profile_locks_profile_id_key;

-- Drop the problematic partial unique index if it exists
DROP INDEX IF EXISTS idx_profile_locks_active_profile;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_locks_expires_at ON profile_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_status ON user_review_submissions(user_id, status);

-- Update cleanup function to be more efficient
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM profile_locks
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if profile is locked
CREATE OR REPLACE FUNCTION is_profile_locked(profile_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profile_locks
    WHERE profile_id = profile_uuid
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for profile_locks to ensure proper access
DROP POLICY IF EXISTS "Anyone can view all locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can view their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can create their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can update their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can delete their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Authenticated users can view locks" ON profile_locks;

CREATE POLICY "Anyone can view all locks"
  ON profile_locks FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own locks"
  ON profile_locks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locks"
  ON profile_locks FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for user_review_submissions
DROP POLICY IF EXISTS "Users can view their own completed reviews" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can create their own completed reviews" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can create their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON user_review_submissions;

CREATE POLICY "Users can view their own submissions"
  ON user_review_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
  ON user_review_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON user_review_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON user_review_submissions FOR DELETE
  USING (auth.uid() = user_id);
