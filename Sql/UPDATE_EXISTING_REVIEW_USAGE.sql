-- Update existing reviews that have been used to mark them as used

-- Mark reviews as used based on completed_reviews
UPDATE public.reviews r
SET 
  is_used = TRUE,
  times_used = (
    SELECT COUNT(*)
    FROM public.completed_reviews cr
    WHERE cr.profile_id = r.profile_id
  ),
  last_used_at = (
    SELECT MAX(created_at)
    FROM public.completed_reviews cr
    WHERE cr.profile_id = r.profile_id
  )
WHERE r.profile_id IN (
  SELECT DISTINCT profile_id 
  FROM public.completed_reviews
)
AND r.status = 'active';

-- Verify the update
SELECT 
  r.id,
  r.profile_id,
  r.is_used,
  r.times_used,
  r.last_used_at,
  r.status
FROM public.reviews r
WHERE r.is_used = TRUE
ORDER BY r.times_used DESC;
