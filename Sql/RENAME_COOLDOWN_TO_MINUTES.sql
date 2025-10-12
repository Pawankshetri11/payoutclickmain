-- Rename cooldown_hours to cooldown_minutes in review_profiles table
-- This makes it clear that the cooldown is now in minutes, not hours

-- Rename the column
ALTER TABLE review_profiles 
RENAME COLUMN cooldown_hours TO cooldown_minutes;

-- Update existing data: convert hours to minutes (multiply by 60)
UPDATE review_profiles 
SET cooldown_minutes = cooldown_minutes * 60 
WHERE cooldown_minutes < 100; -- Only convert if it looks like hours (< 100)

-- Add comment to clarify the column
COMMENT ON COLUMN review_profiles.cooldown_minutes IS 'Cooldown period in minutes before a user can review this profile again';
