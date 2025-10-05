-- Add new fields to profiles table for KYC, bank details, and avatar
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_type TEXT CHECK (bank_account_type IN ('savings', 'current')),
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_data JSONB,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Drop existing referrals table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS public.referrals CASCADE;

-- Create referrals table with correct schema
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  total_commission_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals table
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert their own referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for KYC documents and avatars
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('kyc-documents', 'kyc-documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own KYC documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Create indexes for faster referral lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- Add update trigger for referrals
CREATE OR REPLACE FUNCTION public.update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_referrals_updated_at ON public.referrals;

CREATE TRIGGER set_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referrals_updated_at();