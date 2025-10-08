-- Create storage bucket for withdrawal proof screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('withdrawal-proofs', 'withdrawal-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for withdrawal-proofs bucket
CREATE POLICY "Admins can upload withdrawal proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'withdrawal-proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can view withdrawal proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'withdrawal-proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Public can view withdrawal proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'withdrawal-proofs');
