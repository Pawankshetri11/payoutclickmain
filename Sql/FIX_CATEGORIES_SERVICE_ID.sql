-- Add service_id column to job_categories table if it doesn't exist
ALTER TABLE public.job_categories 
ADD COLUMN IF NOT EXISTS service_id TEXT UNIQUE;

-- Create an index on service_id for better performance
CREATE INDEX IF NOT EXISTS idx_job_categories_service_id ON public.job_categories(service_id);

-- Update existing categories to have sequential service_ids
DO $$
DECLARE
  cat_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR cat_record IN 
    SELECT id FROM public.job_categories 
    WHERE service_id IS NULL 
    ORDER BY created_at ASC
  LOOP
    UPDATE public.job_categories 
    SET service_id = 'CAT-' || LPAD(counter::TEXT, 3, '0')
    WHERE id = cat_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
