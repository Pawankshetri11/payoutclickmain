-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admins full access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public read access to active jobs" ON public.jobs;

-- Create policy for admins to have full access
CREATE POLICY "Allow admins full access to jobs"
ON public.jobs
FOR ALL
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

-- Create policy for public to read active jobs (for user panel)
CREATE POLICY "Allow public read access to active jobs"
ON public.jobs
FOR SELECT
USING (vacancy > 0);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'jobs';
