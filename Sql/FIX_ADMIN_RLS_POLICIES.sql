-- ====================================================
-- FIX ADMIN ACCESS TO VIEW ALL PROFILES
-- Run this in Supabase SQL Editor
-- ====================================================

-- First, create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
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

-- Drop existing policies on profiles if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new policies for profiles table
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 4: Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 5: Admins can insert profiles (for add user feature)
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- ====================================================
-- INSTRUCTIONS:
-- ====================================================
-- After running this script, you need to:
-- 
-- 1. Find your admin user's ID from auth.users table:
--    SELECT id, email FROM auth.users;
--
-- 2. Insert admin role for your user:
--    INSERT INTO public.user_roles (user_id, role)
--    VALUES ('YOUR_USER_ID_HERE', 'admin');
--
-- Example:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('12345678-1234-1234-1234-123456789abc', 'admin');
-- ====================================================

-- View to check who has admin access (optional)
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'admin';

-- Grant view access
GRANT SELECT ON public.admin_users TO authenticated;
