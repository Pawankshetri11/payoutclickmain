-- Add usage tracking to reviews table

-- Add usage tracking columns to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_is_used ON public.reviews(is_used);
CREATE INDEX IF NOT EXISTS idx_reviews_times_used ON public.reviews(times_used);

-- Update function to mark review as used when a user completes it
CREATE OR REPLACE FUNCTION mark_review_as_used()
RETURNS TRIGGER AS $$
DECLARE
  review_profile_id UUID;
BEGIN
  -- Get the profile_id from the completed_reviews record
  review_profile_id := NEW.profile_id;
  
  -- Find an active review for this profile and mark it as used
  -- We'll mark the oldest unused review, or any review if all are already used
  UPDATE public.reviews
  SET 
    is_used = TRUE,
    times_used = COALESCE(times_used, 0) + 1,
    last_used_at = NOW()
  WHERE profile_id = review_profile_id
    AND status = 'active'
    AND id = (
      SELECT id FROM public.reviews 
      WHERE profile_id = review_profile_id 
        AND status = 'active'
      ORDER BY COALESCE(is_used, false), created_at
      LIMIT 1
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on completed_reviews table to mark reviews as used
DROP TRIGGER IF EXISTS trigger_mark_review_used ON public.completed_reviews;
CREATE TRIGGER trigger_mark_review_used
  AFTER INSERT ON public.completed_reviews
  FOR EACH ROW
  EXECUTE FUNCTION mark_review_as_used();

-- Comment to explain the new columns
COMMENT ON COLUMN public.reviews.is_used IS 'Indicates if this review has been assigned to at least one user';
COMMENT ON COLUMN public.reviews.times_used IS 'Number of times this review has been assigned';
COMMENT ON COLUMN public.reviews.last_used_at IS 'Last time this review was assigned to a user';
