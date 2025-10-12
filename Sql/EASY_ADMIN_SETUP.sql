-- ====================================================
-- EASIEST WAY TO CREATE ADMIN USER
-- ====================================================

-- STEP 1: First create a user in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@payoutclick.io
-- Password: 4Amtech@1@
-- ✅ CHECK "Auto Confirm User"
-- Click Create User

-- ====================================================
-- STEP 2: Run this SINGLE query below (it does everything!)
-- ====================================================

-- This will:
-- 1. Find the user by email
-- 2. Make them admin
-- 3. Show you the result

WITH admin_user AS (
  SELECT id, email FROM auth.users 
  WHERE email = 'admin@payoutclick.io'
  LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::text FROM admin_user
ON CONFLICT (user_id, role) DO NOTHING
RETURNING 
  (SELECT email FROM admin_user) as admin_email,
  role,
  created_at;

-- ====================================================
-- That's it! You should see:
-- admin_email: admin@payoutclick.io
-- role: admin
-- created_at: [timestamp]
-- ====================================================

-- Now login at: /admin/login
-- Email: admin@payoutclick.io
-- Password: 4Amtech@1@

-- ====================================================
-- ALTERNATIVE: Make ANY existing user admin
-- ====================================================

-- If you already have a user and want to make them admin,
-- just replace the email below:

-- WITH existing_user AS (
--   SELECT id FROM auth.users 
--   WHERE email = 'your-email@example.com'
--   LIMIT 1
-- )
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::text FROM existing_user
-- ON CONFLICT (user_id, role) DO NOTHING;
