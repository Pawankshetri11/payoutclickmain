-- =============================================
-- FIX KYC BUCKET VISIBILITY + POLICIES
-- Run this in your SQL editor to resolve 404 "Bucket not found"
-- =============================================

-- 1) Ensure the bucket exists and is PUBLIC
UPDATE storage.buckets
SET public = true
WHERE id = 'kyc-documents';

-- 2) Recreate RLS policies for kyc-documents (idempotent)
-- Note: Public buckets still benefit from explicit SELECT policy
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Public can view KYC documents" ON storage.objects;
CREATE POLICY "Public can view KYC documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kyc-documents');

-- 3) Verify
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'kyc-documents';
