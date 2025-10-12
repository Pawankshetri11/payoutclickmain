-- Fix Review Locking System - Complete RLS and Table Setup
-- Run this to ensure profile_locks and user_review_submissions are working correctly

-- Step 1: Ensure tables exist with correct structure
CREATE TABLE IF NOT EXISTS profile_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_review_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  proof_image TEXT,
  profile_unlocks_at TIMESTAMP WITH TIME ZONE,
  global_unlocks_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, profile_id)
);

-- Step 2: Enable RLS
ALTER TABLE profile_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_review_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can create their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can delete their own locks" ON profile_locks;
DROP POLICY IF EXISTS "Users can update their own locks" ON profile_locks;

DROP POLICY IF EXISTS "Users can view their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON user_review_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON user_review_submissions;

-- Step 4: Create correct RLS policies for profile_locks
-- Anyone authenticated can view all locks (to check availability)
CREATE POLICY "Authenticated users can view locks"
  ON profile_locks FOR SELECT
  TO authenticated
  USING (true);

-- Users can only create locks for themselves
CREATE POLICY "Users can create their own locks"
  ON profile_locks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own locks
CREATE POLICY "Users can delete their own locks"
  ON profile_locks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 5: Create correct RLS policies for user_review_submissions
-- Anyone authenticated can view all submissions (to check global cooldown)
CREATE POLICY "Authenticated users can view submissions"
  ON user_review_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON user_review_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own submissions
CREATE POLICY "Users can update their own submissions"
  ON user_review_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own in-progress submissions (for cancellation)
CREATE POLICY "Users can delete their own in-progress submissions"
  ON user_review_submissions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'in_progress');

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_locks_profile_id ON profile_locks(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_locks_user_id ON profile_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_locks_expires_at ON profile_locks(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_review_submissions_user_id ON user_review_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_profile_id ON user_review_submissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_status ON user_review_submissions(status);
CREATE INDEX IF NOT EXISTS idx_user_review_submissions_global_unlock ON user_review_submissions(user_id, global_unlocks_at);

-- Step 7: Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM profile_locks WHERE expires_at <= NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_locks() TO authenticated;
