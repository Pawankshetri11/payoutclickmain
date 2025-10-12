-- Clear all current profile locks, submissions, and tasks
-- Run this to reset the review system completely

-- Delete all profile locks
DELETE FROM profile_locks;

-- Delete all user review submissions (all statuses)
DELETE FROM user_review_submissions;

-- Delete all tasks
DELETE FROM tasks;

-- Clear all cooldown timers
UPDATE review_profiles SET last_reviewed_at = NULL;
