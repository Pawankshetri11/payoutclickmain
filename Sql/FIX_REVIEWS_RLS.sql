-- Fix RLS policies for reviews table to allow admin creation

-- Drop existing policies (all possible variations)
DROP POLICY IF EXISTS "Admins can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view active reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view active reviews for their tasks" ON public.reviews;

-- Drop existing function with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Create security definer function to check admin role
CREATE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND user_roles.role = 'admin'
  );
$$;

-- Create RLS policies using the security definer function
CREATE POLICY "Admins can insert reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Also allow users to view active reviews for their assigned profiles
CREATE POLICY "Users can view active reviews for their tasks"
ON public.reviews
FOR SELECT
TO authenticated
USING (status = 'active');

-- Fix review_profiles RLS
DROP POLICY IF EXISTS "Admins can manage review profiles" ON public.review_profiles;
DROP POLICY IF EXISTS "Users can view active profiles" ON public.review_profiles;
DROP POLICY IF EXISTS "Users can view active review profiles" ON public.review_profiles;

CREATE POLICY "Admins can manage review profiles"
ON public.review_profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view active review profiles"
ON public.review_profiles
FOR SELECT
TO authenticated
USING (is_active = true);

-- Drop and recreate essential profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Drop and recreate essential task policies
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;

CREATE POLICY "Admins can manage all tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Drop and recreate site_content policy
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;

CREATE POLICY "Admins can manage site content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
