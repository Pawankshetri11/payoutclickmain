-- Create task-submissions storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload task submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own task submissions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task submissions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete task submissions" ON storage.objects;

-- Policy: Allow authenticated users to upload their own task submissions
CREATE POLICY "Users can upload task submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own submissions
CREATE POLICY "Users can view their own task submissions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow admins to read all task submissions
CREATE POLICY "Admins can view all task submissions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-submissions' AND
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE email = 'admin@payoutclick.io'
  )
);

-- Policy: Allow admins to delete task submissions
CREATE POLICY "Admins can delete task submissions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-submissions' AND
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE email = 'admin@payoutclick.io'
  )
);

-- Verify bucket creation
SELECT id, name, public FROM storage.buckets WHERE id = 'task-submissions';
