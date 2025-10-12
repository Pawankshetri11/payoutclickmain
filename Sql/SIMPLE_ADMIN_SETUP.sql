-- ====================================================
-- SIMPLE ADMIN SETUP - Run each section one at a time
-- ====================================================

-- STEP 1: Create user_roles table
-- ====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


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


-- STEP 3: Drop old policies
-- ====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;


-- STEP 4: Create new policies
-- ====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));


-- STEP 5: Grant permissions
-- ====================================================
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
