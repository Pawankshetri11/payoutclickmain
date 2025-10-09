-- Verify and create required storage buckets
-- Run this script to ensure all storage buckets are properly set up

-- Create kyc-documents bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create withdrawal-proofs bucket if not exists  
INSERT INTO storage.buckets (id, name, public)
VALUES ('withdrawal-proofs', 'withdrawal-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('kyc-documents', 'withdrawal-proofs');
