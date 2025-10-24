-- Fix RLS policies to allow users to view referrer and referred user profiles
-- Using security definer functions to avoid infinite recursion

-- Step 1: Create security definer function to check if user can view a profile
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User can view their own profile
    SELECT 1 WHERE auth.uid() = _profile_user_id
    
    UNION
    
    -- User can view their referrer's profile
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.referred_by = _profile_user_id
    
    UNION
    
    -- User can view profiles of users they referred
    SELECT 1 
    FROM profiles 
    WHERE profiles.referred_by = auth.uid() 
    AND profiles.user_id = _profile_user_id
  );
$$;

-- Step 2: Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view referrer profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view referred profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Step 3: Create single comprehensive policy using the security definer function
CREATE POLICY "Users can view profiles"
ON profiles FOR SELECT
USING (public.can_view_profile(user_id));

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
