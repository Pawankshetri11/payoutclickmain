-- ====================================================
-- CREATE ADMIN ACCOUNT FOR PRODUCTION
-- Email: admin@payoutclick.io
-- Password: 4Amtech@1@
-- ====================================================

-- PREREQUISITE: Run DATABASE_SETUP_COMPLETE.sql first!

-- ====================================================
-- STEP 1: Create Admin User in Supabase Dashboard
-- ====================================================

-- Go to Supabase Dashboard > Authentication > Users
-- Click "Add User" or "Invite User"
-- Enter:
--   Email: admin@payoutclick.io
--   Password: 4Amtech@1@
--   Auto Confirm User: YES (check this box!)
-- Click "Create User" or "Send Invitation"

-- ====================================================
-- STEP 2: Get the User ID
-- ====================================================

-- Run this to find the admin user ID:
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@payoutclick.io';

-- Copy the 'id' value from the result

-- ====================================================
-- STEP 3: Assign Admin Role
-- ====================================================

-- Replace 'PASTE_USER_ID_HERE' with the actual user ID from Step 2
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ====================================================
-- STEP 4: Verify Admin Setup
-- ====================================================

-- Check if admin role was assigned correctly:
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@payoutclick.io';

-- You should see:
-- - email: admin@payoutclick.io
-- - email_confirmed_at: should have a timestamp (not null)
-- - role: admin
-- - role_assigned_at: should have a timestamp

-- ====================================================
-- STEP 5: Test Admin Login
-- ====================================================

-- Now you can log in at: /admin/login
-- Email: admin@payoutclick.io
-- Password: 4Amtech@1@

-- ====================================================
-- TROUBLESHOOTING
-- ====================================================

-- If login fails, check:

-- 1. Is email confirmed?
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@payoutclick.io';
-- If email_confirmed_at is NULL, update it:
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'admin@payoutclick.io';

-- 2. Does admin role exist?
SELECT * FROM public.user_roles WHERE role = 'admin';
-- If no results, run Step 3 again with correct user ID

-- 3. Check if user_roles table exists:
SELECT table_name FROM information_schema.tables WHERE table_name = 'user_roles';
-- If no results, run DATABASE_SETUP_COMPLETE.sql first
