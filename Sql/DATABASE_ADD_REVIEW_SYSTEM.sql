-- Update job_type enum to include image_only and review
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'image_only';
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'review';

-- Create review_profiles table
CREATE TABLE IF NOT EXISTS review_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  review_text TEXT,
  review_image TEXT,
  business_link TEXT,
  profile_lock_hours INTEGER DEFAULT 1,
  global_lock_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_locks table to track user locks on profiles
CREATE TABLE IF NOT EXISTS profile_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Create completed_reviews table to track completed reviews by users
CREATE TABLE IF NOT EXISTS completed_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Enable RLS
ALTER TABLE review_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_reviews ENABLE ROW LEVEL SECURITY;

-- Ensure required columns exist when table was created previously
ALTER TABLE review_profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  ADD COLUMN IF NOT EXISTS profile_lock_hours INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS global_lock_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- RLS Policies for review_profiles
CREATE POLICY "Anyone can view active review profiles"
  ON review_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage review profiles"
  ON review_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

-- RLS Policies for profile_locks
CREATE POLICY "Users can view their own locks"
  ON profile_locks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locks"
  ON profile_locks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locks"
  ON profile_locks FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for completed_reviews
CREATE POLICY "Users can view their own completed reviews"
  ON completed_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completed reviews"
  ON completed_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_locks_user_id ON profile_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_locks_profile_id ON profile_locks(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_locks_locked_until ON profile_locks(locked_until);
CREATE INDEX IF NOT EXISTS idx_completed_reviews_user_id ON completed_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_reviews_profile_id ON completed_reviews(profile_id);

-- Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM profile_locks
  WHERE locked_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
