-- ====================================================
-- CREATE ADMIN ACCOUNT FOR PRODUCTION
-- Email: admin@payoutclick.io
-- Password: 4Amtech@1@
-- ====================================================

-- IMPORTANT: Run this AFTER you've:
-- 1. Created the account via Supabase Dashboard or Auth API
-- 2. Or signed up through the application

-- Step 1: Find the user ID for admin@payoutclick.io
-- Run this first to get the user_id:
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@payoutclick.io';

-- Step 2: Insert admin role (Replace YOUR_USER_ID with the actual ID from step 1)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify admin access
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@payoutclick.io';

-- ====================================================
-- ALTERNATIVE: Create admin account directly via SQL
-- (Only if you want to create via SQL instead of signup)
-- ====================================================

-- Note: This approach requires access to Supabase service_role key
-- It's BETTER to create the account via the signup page or Supabase Dashboard
-- Then just assign the admin role using the steps above

-- ====================================================
-- MANUAL STEPS (RECOMMENDED):
-- ====================================================

-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" 
-- 3. Enter:
--    Email: admin@payoutclick.io
--    Password: 4Amtech@1@
--    Auto Confirm: YES (check this box)
-- 4. Click "Create User"
-- 5. Copy the User ID
-- 6. Run this SQL with the copied ID:

/*
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_ID_HERE', 'admin');
*/

-- 7. Verify by running:
/*
SELECT * FROM public.user_roles WHERE role = 'admin';
*/
