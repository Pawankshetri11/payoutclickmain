-- Fix completed_tasks count for user pkr994223@gmail.com
-- Count approved tasks and update the profile

-- First, let's see the current state
SELECT 
  p.user_id,
  p.email,
  p.completed_tasks as current_count,
  COUNT(t.id) as actual_approved_tasks
FROM profiles p
LEFT JOIN tasks t ON t.user_id = p.user_id AND t.status = 'approved'
WHERE p.email = 'pkr994223@gmail.com'
GROUP BY p.user_id, p.email, p.completed_tasks;

-- Update the completed_tasks count based on actual approved tasks
UPDATE profiles
SET completed_tasks = (
  SELECT COUNT(*)
  FROM tasks
  WHERE tasks.user_id = profiles.user_id
  AND tasks.status = 'approved'
)
WHERE email = 'pkr994223@gmail.com';

-- Verify the update
SELECT 
  p.user_id,
  p.email,
  p.completed_tasks as updated_count,
  COUNT(t.id) as actual_approved_tasks
FROM profiles p
LEFT JOIN tasks t ON t.user_id = p.user_id AND t.status = 'approved'
WHERE p.email = 'pkr994223@gmail.com'
GROUP BY p.user_id, p.email, p.completed_tasks;
