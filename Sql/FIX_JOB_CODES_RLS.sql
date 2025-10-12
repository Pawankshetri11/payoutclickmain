-- Fix job_codes RLS policies to allow admin insertions

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins full access to job_codes" ON public.job_codes;
DROP POLICY IF EXISTS "Allow users to view unused codes for active jobs" ON public.job_codes;

-- Admin full access (both USING and WITH CHECK for all operations)
CREATE POLICY "Allow admins full access to job_codes"
ON public.job_codes
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE email = 'admin@payoutclick.io'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE email = 'admin@payoutclick.io'
  )
);

-- Users can only view unused codes for active jobs (read only)
CREATE POLICY "Allow users to view unused codes for active jobs"
ON public.job_codes
FOR SELECT
TO authenticated
USING (
  NOT used AND 
  job_id IN (SELECT id FROM public.jobs WHERE vacancy > 0)
);
