-- Fix Review System with Complete User Tracking and Timers
-- This script fixes RLS policies and creates the complete review submission system

-- Step 1: Fix reviews table RLS policies
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

CREATE POLICY "Admins can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

CREATE POLICY "Admins can update reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

-- Step 2: Fix task-submissions storage bucket policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own task submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own task submissions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task submissions" ON storage.objects;

-- Create new policies for task-submissions bucket
CREATE POLICY "Authenticated users can upload task submissions"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'task-submissions');

CREATE POLICY "Users can view their own task submissions"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all task submissions"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-submissions' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

CREATE POLICY "Admins can delete task submissions"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'task-submissions' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

-- Step 3: Create user_review_submissions table
CREATE TABLE IF NOT EXISTS user_review_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  proof_image TEXT,
  profile_unlocks_at TIMESTAMP WITH TIME ZONE,
  global_unlocks_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, profile_id)
);

-- Enable RLS
ALTER TABLE user_review_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_review_submissions
CREATE POLICY "Users can view their own submissions"
  ON user_review_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own submissions"
  ON user_review_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions"
  ON user_review_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions"
  ON user_review_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

-- Step 4: Create profile_locks table for real-time locking
CREATE TABLE IF NOT EXISTS profile_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(profile_id, user_id)
);

-- Enable RLS
ALTER TABLE profile_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_locks
CREATE POLICY "Anyone can view active locks"
  ON profile_locks FOR SELECT
  TO authenticated
  USING (expires_at > NOW());

CREATE POLICY "Users can create their own locks"
  ON profile_locks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own locks"
  ON profile_locks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 5: Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM profile_locks WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 6: Function to check if profile is available for user
CREATE OR REPLACE FUNCTION is_profile_available_for_user(
  p_profile_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_completed BOOLEAN;
  v_global_locked BOOLEAN;
  v_profile_locked BOOLEAN;
BEGIN
  -- Check if user already completed this profile
  SELECT EXISTS(
    SELECT 1 FROM user_review_submissions
    WHERE user_id = p_user_id 
    AND profile_id = p_profile_id
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has global lock active
  SELECT EXISTS(
    SELECT 1 FROM user_review_submissions
    WHERE user_id = p_user_id 
    AND global_unlocks_at > NOW()
  ) INTO v_global_locked;
  
  IF v_global_locked THEN
    RETURN FALSE;
  END IF;
  
  -- Check if profile is locked by any user
  SELECT EXISTS(
    SELECT 1 FROM profile_locks
    WHERE profile_id = p_profile_id 
    AND expires_at > NOW()
  ) INTO v_profile_locked;
  
  IF v_profile_locked THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_user_id ON user_review_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_profile_id ON user_review_submissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_global_unlock ON user_review_submissions(user_id, global_unlocks_at);
CREATE INDEX IF NOT EXISTS idx_profile_locks_profile_id ON profile_locks(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_locks_expires_at ON profile_locks(expires_at);

-- Step 8: Add review_profiles column to jobs table if not exists
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS review_profiles UUID[];

-- Cleanup expired locks periodically would need a cron job or be done on query
-- For now, create a function that gets called when fetching available profiles
