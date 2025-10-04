-- ====================================================
-- COMPLETE ADMIN SETUP - FIXES ALL ISSUES
-- Run this ENTIRE script in Supabase SQL Editor
-- ====================================================

-- ====================================================
-- STEP 1: Create user_roles table (if not exists)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- STEP 2: Create admin check function
-- ====================================================

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
  )
$$;

-- ====================================================
-- STEP 3: Create profiles table (if not exists)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  kyc_status TEXT DEFAULT 'pending',
  kyc_submitted_at TIMESTAMPTZ,
  kyc_verified_at TIMESTAMPTZ,
  kyc_document_url TEXT,
  kyc_rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- STEP 4: Drop and recreate RLS policies
-- ====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- ====================================================
-- STEP 5: Grant permissions
-- ====================================================

GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- ====================================================
-- STEP 6: CREATE ADMIN USER DIRECTLY
-- ====================================================

-- This creates admin user WITHOUT needing authentication page!

-- First, check if admin user already exists
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@payoutclick.io';
    
    IF admin_user_id IS NULL THEN
        -- User doesn't exist, create it
        -- Note: You need to replace 'YOUR_PASSWORD_HASH' with actual hash
        -- or create user through Supabase Dashboard first
        RAISE NOTICE 'Please create user admin@payoutclick.io in Supabase Dashboard first';
        RAISE NOTICE 'Then run the query below to make them admin';
    ELSE
        -- User exists, make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Also ensure profile exists
        INSERT INTO public.profiles (id, user_id, email, name)
        VALUES (admin_user_id, admin_user_id, 'admin@payoutclick.io', 'Admin')
        ON CONFLICT (id) DO UPDATE 
        SET email = 'admin@payoutclick.io';
        
        RAISE NOTICE 'Admin user setup complete! Email: admin@payoutclick.io';
    END IF;
END $$;

-- ====================================================
-- ALTERNATIVE: Run this AFTER creating user in dashboard
-- ====================================================

-- After creating user in Supabase Dashboard, run this:
/*
WITH admin_user AS (
  SELECT id FROM auth.users 
  WHERE email = 'admin@payoutclick.io'
  LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM admin_user
ON CONFLICT (user_id, role) DO NOTHING;

-- Also create profile
WITH admin_user AS (
  SELECT id FROM auth.users 
  WHERE email = 'admin@payoutclick.io'
  LIMIT 1
)
INSERT INTO public.profiles (id, user_id, email, name)
SELECT id, id, 'admin@payoutclick.io', 'Admin' FROM admin_user
ON CONFLICT (id) DO UPDATE SET email = 'admin@payoutclick.io';
*/

-- ====================================================
-- VERIFY ADMIN SETUP
-- ====================================================

SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  ur.role,
  p.name
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@payoutclick.io';

-- You should see:
-- - email: admin@payoutclick.io
-- - email_confirmed_at: [timestamp]
-- - role: admin
-- - name: Admin

-- ====================================================
-- HOW TO USE
-- ====================================================

-- 1. Run this ENTIRE script in Supabase SQL Editor
-- 2. Go to Authentication > Users > Add User
--    Email: admin@payoutclick.io
--    Password: 4Amtech@1@
--    ✅ Auto Confirm User: YES
-- 3. Run this script AGAIN (it will assign admin role)
-- 4. Login at /admin/login with the credentials

-- ====================================================
-- TROUBLESHOOTING
-- ====================================================

-- If you still can't add user in dashboard, try:

-- 1. Check if email confirmations are disabled:
-- Go to Authentication > Settings > Email Auth
-- Disable "Confirm email"

-- 2. Manually confirm email:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@payoutclick.io';

-- 3. Check if user was created:
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@payoutclick.io';
