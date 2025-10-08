-- Update review system to support multiple reviews per profile
-- Step 1: Create review_type enum
DO $$ BEGIN
    CREATE TYPE review_type AS ENUM ('image_text', 'text_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  type review_type NOT NULL,
  review_text TEXT,
  review_image TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view active reviews"
  ON reviews FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email LIKE '%@admin.com'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Add review_count column to review_profiles for easy tracking
ALTER TABLE review_profiles 
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update review count
CREATE OR REPLACE FUNCTION update_profile_review_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE review_profiles 
    SET review_count = review_count + 1 
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE review_profiles 
    SET review_count = review_count - 1 
    WHERE id = OLD.profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update review count
DROP TRIGGER IF EXISTS trigger_update_review_count ON reviews;
CREATE TRIGGER trigger_update_review_count
  AFTER INSERT OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_review_count();

-- Note: Keep review_text and review_image columns in review_profiles for backward compatibility
-- They can be removed later after migration is complete
