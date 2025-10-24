-- Fix completed_tasks count for ALL users
-- Count approved tasks and update all profiles

-- First, let's see the current state for all users
SELECT 
  p.user_id,
  p.email,
  p.completed_tasks as current_count,
  COUNT(t.id) as actual_approved_tasks
FROM profiles p
LEFT JOIN tasks t ON t.user_id = p.user_id AND t.status = 'approved'
GROUP BY p.user_id, p.email, p.completed_tasks
ORDER BY p.email;

-- Update the completed_tasks count based on actual approved tasks for ALL users
UPDATE profiles
SET completed_tasks = COALESCE((
  SELECT COUNT(*)
  FROM tasks
  WHERE tasks.user_id = profiles.user_id
  AND tasks.status = 'approved'
), 0);

-- Verify the update for all users
SELECT 
  p.user_id,
  p.email,
  p.completed_tasks as updated_count,
  COUNT(t.id) as actual_approved_tasks
FROM profiles p
LEFT JOIN tasks t ON t.user_id = p.user_id AND t.status = 'approved'
GROUP BY p.user_id, p.email, p.completed_tasks
ORDER BY p.email;
