-- =====================================================
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- =====================================================

-- Create job categories table
CREATE TABLE IF NOT EXISTS public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create review profiles table
CREATE TABLE IF NOT EXISTS public.review_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  category_id UUID REFERENCES public.job_categories(id) ON DELETE CASCADE,
  cooldown_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user review cooldowns table
CREATE TABLE IF NOT EXISTS public.user_review_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.review_profiles(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  next_available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Add new columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.job_categories(id),
ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'code_immediate',
ADD COLUMN IF NOT EXISTS review_profile_id UUID REFERENCES public.review_profiles(id);

-- Enable RLS
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_review_cooldowns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.job_categories;
DROP POLICY IF EXISTS "Anyone can view active profiles" ON public.review_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.review_profiles;
DROP POLICY IF EXISTS "Users can view own cooldowns" ON public.user_review_cooldowns;
DROP POLICY IF EXISTS "Users can insert own cooldowns" ON public.user_review_cooldowns;
DROP POLICY IF EXISTS "Admins can view all cooldowns" ON public.user_review_cooldowns;

-- RLS Policies for job_categories
CREATE POLICY "Anyone can view active categories"
  ON public.job_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.job_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for review_profiles
CREATE POLICY "Anyone can view active profiles"
  ON public.review_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage profiles"
  ON public.review_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_review_cooldowns
CREATE POLICY "Users can view own cooldowns"
  ON public.user_review_cooldowns FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cooldowns"
  ON public.user_review_cooldowns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all cooldowns"
  ON public.user_review_cooldowns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default categories
INSERT INTO public.job_categories (name, description, icon) VALUES
  ('Reviews', 'Write reviews for products and services', 'Star'),
  ('App Install', 'Install and test mobile applications', 'Smartphone'),
  ('Website Survey', 'Complete surveys and questionnaires', 'Globe'),
  ('Game Tasks', 'Play games and complete objectives', 'Gamepad2'),
  ('Social Media', 'Social media engagement tasks', 'MessageSquare'),
  ('Photography', 'Take photos and submit for verification', 'Camera'),
  ('Data Entry', 'Enter and verify data', 'FileText'),
  ('General', 'General tasks and activities', 'Briefcase')
ON CONFLICT (name) DO NOTHING;

-- Function to check if profile is available globally
CREATE OR REPLACE FUNCTION public.is_profile_available_globally(profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_reviewed TIMESTAMPTZ;
  cooldown_hours INTEGER;
BEGIN
  SELECT rp.last_reviewed_at, rp.cooldown_hours
  INTO last_reviewed, cooldown_hours
  FROM public.review_profiles rp
  WHERE rp.id = profile_id;
  
  IF last_reviewed IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN (now() >= last_reviewed + (cooldown_hours || ' hours')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can review a profile
CREATE OR REPLACE FUNCTION public.can_user_review_profile(p_user_id UUID, p_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  cooldown_record RECORD;
BEGIN
  -- Check if profile is globally available
  IF NOT public.is_profile_available_globally(p_profile_id) THEN
    RETURN false;
  END IF;
  
  -- Check user-specific cooldown
  SELECT * INTO cooldown_record
  FROM public.user_review_cooldowns
  WHERE user_id = p_user_id AND profile_id = p_profile_id;
  
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  RETURN (now() >= cooldown_record.next_available_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get random available profile for user
CREATE OR REPLACE FUNCTION public.get_random_available_profile(p_user_id UUID, p_category_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  available_profile UUID;
BEGIN
  SELECT rp.id INTO available_profile
  FROM public.review_profiles rp
  WHERE rp.is_active = true
    AND (p_category_id IS NULL OR rp.category_id = p_category_id)
    AND public.can_user_review_profile(p_user_id, rp.id) = true
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN available_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark profile as reviewed
CREATE OR REPLACE FUNCTION public.mark_profile_reviewed(
  p_user_id UUID,
  p_profile_id UUID
)
RETURNS void AS $$
DECLARE
  user_cooldown_hours INTEGER := 48; -- 47-49 hours, using 48 as middle value
BEGIN
  -- Update profile's last_reviewed_at
  UPDATE public.review_profiles
  SET last_reviewed_at = now(),
      updated_at = now()
  WHERE id = p_profile_id;
  
  -- Insert or update user cooldown
  INSERT INTO public.user_review_cooldowns (user_id, profile_id, reviewed_at, next_available_at)
  VALUES (
    p_user_id,
    p_profile_id,
    now(),
    now() + (user_cooldown_hours || ' hours')::INTERVAL
  )
  ON CONFLICT (user_id, profile_id)
  DO UPDATE SET
    reviewed_at = now(),
    next_available_at = now() + (user_cooldown_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_profiles_category ON public.review_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_review_profiles_active ON public.review_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_review_cooldowns_user ON public.user_review_cooldowns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_review_cooldowns_profile ON public.user_review_cooldowns(profile_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_verification_type ON public.jobs(verification_type);
