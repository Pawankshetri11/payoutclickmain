-- Create job_codes table
CREATE TABLE IF NOT EXISTS public.job_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT false,
  used_by UUID ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_codes_job_id ON public.job_codes(job_id);
CREATE INDEX IF NOT EXISTS idx_job_codes_code ON public.job_codes(code);
CREATE INDEX IF NOT EXISTS idx_job_codes_used ON public.job_codes(used);

-- Enable RLS
ALTER TABLE public.job_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admins full access to job_codes" ON public.job_codes;
DROP POLICY IF EXISTS "Allow users to view unused codes for active jobs" ON public.job_codes;
DROP POLICY IF EXISTS "Allow users to mark codes as used" ON public.job_codes;

-- Admin full access
CREATE POLICY "Allow admins full access to job_codes"
ON public.job_codes
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE email = 'admin@payoutclick.io'
  )
);

-- Users can only view codes for active jobs (read only)
CREATE POLICY "Allow users to view unused codes for active jobs"
ON public.job_codes
FOR SELECT
USING (
  NOT used AND 
  job_id IN (SELECT id FROM public.jobs WHERE status = 'active')
);

-- Function to verify and use a code
CREATE OR REPLACE FUNCTION public.verify_and_use_code(
  p_code TEXT,
  p_job_id UUID,
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT, reward NUMERIC) AS $$
DECLARE
  v_code_id UUID;
  v_job_reward NUMERIC;
  v_code_used BOOLEAN;
BEGIN
  -- Check if code exists and is unused
  SELECT id, used INTO v_code_id, v_code_used
  FROM public.job_codes
  WHERE code = p_code AND job_id = p_job_id;

  IF v_code_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid code'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  IF v_code_used THEN
    RETURN QUERY SELECT false, 'Code already used'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Get job reward
  SELECT amount INTO v_job_reward
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_job_reward IS NULL THEN
    RETURN QUERY SELECT false, 'Job not found'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Mark code as used (store user_id from auth.users)
  UPDATE public.job_codes
  SET used = true,
      used_by = p_user_id,
      used_at = NOW()
  WHERE id = v_code_id;

  -- Credit user account (profiles.user_id references auth.users.id)
  UPDATE public.profiles
  SET balance = COALESCE(balance, 0) + v_job_reward,
      total_earned = COALESCE(total_earned, 0) + v_job_reward
  WHERE user_id = p_user_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user_id: %', p_user_id;
  END IF;

  -- Increment job completed count
  UPDATE public.jobs
  SET completed = completed + 1
  WHERE id = p_job_id;

  RETURN QUERY SELECT true, 'Code verified successfully'::TEXT, v_job_reward;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in verify_and_use_code: %', SQLERRM;
    RETURN QUERY SELECT false, 'Verification failed: ' || SQLERRM, 0::NUMERIC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_and_use_code TO authenticated;
