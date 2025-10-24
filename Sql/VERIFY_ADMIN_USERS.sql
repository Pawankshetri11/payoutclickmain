-- ================================================================
-- VERIFY ADMIN USERS BEFORE CLEANUP
-- Run this script BEFORE running the cleanup to ensure admins are properly identified
-- ================================================================

-- Check if user_roles table exists and has admin users
SELECT 
  ur.user_id,
  ur.role,
  p.name,
  p.email,
  au.email as auth_email
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- Count total users vs admin users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') as users_to_delete;

-- If no results above, check alternative admin identification methods:
-- Method 1: Check if profiles table has an is_admin column
-- SELECT user_id, name, email, is_admin FROM profiles WHERE is_admin = true;

-- Method 2: Check if there's a specific admin email pattern
-- SELECT id, email FROM auth.users WHERE email LIKE '%admin%';

-- ================================================================
-- IMPORTANT: If you don't see any admin users listed above,
-- you MUST create admin user(s) before running the cleanup script!
-- ================================================================
