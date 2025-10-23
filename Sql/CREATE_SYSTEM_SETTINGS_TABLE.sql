-- Create system_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage settings
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Insert default settings
INSERT INTO public.system_settings (key, value) VALUES
  ('site_name', '"PayoutClick"'),
  ('site_description', '"Complete payout management system"'),
  ('admin_email', '"admin@payoutclick.io"'),
  ('timezone', '"UTC"'),
  ('email_notifications', 'true'),
  ('maintenance_mode', 'false'),
  ('auto_backup', 'true'),
  ('ip_restriction', 'false')
ON CONFLICT (key) DO NOTHING;
