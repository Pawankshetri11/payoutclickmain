-- Add kyc_rejection_reason column to profiles table
-- This column stores the reason when admin rejects a KYC submission

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.kyc_rejection_reason IS 'Reason provided by admin when rejecting KYC submission';
