-- Add referred_by column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referred_by uuid REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
  END IF;
END $$;

-- Create payment_dates_config table for storing earning and withdrawal dates
CREATE TABLE IF NOT EXISTS payment_dates_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earnings_start_day integer NOT NULL DEFAULT 1,
  earnings_end_day integer NOT NULL DEFAULT 5,
  withdrawal_start_day integer NOT NULL DEFAULT 26,
  withdrawal_end_day integer NOT NULL DEFAULT 31,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default configuration
INSERT INTO payment_dates_config (earnings_start_day, earnings_end_day, withdrawal_start_day, withdrawal_end_day)
VALUES (1, 5, 26, 31)
ON CONFLICT DO NOTHING;

-- Enable RLS for payment_dates_config
ALTER TABLE payment_dates_config ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage payment dates
CREATE POLICY "Admins can manage payment dates"
ON payment_dates_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow all authenticated users to view payment dates
CREATE POLICY "Users can view payment dates"
ON payment_dates_config
FOR SELECT
TO authenticated
USING (true);

-- Ensure site_content has support links
INSERT INTO site_content (key, value)
VALUES 
  ('support_telegram_link', 'https://t.me/yourcommunity'),
  ('support_telegram_username', '@yourcommunity'),
  ('support_whatsapp_link', 'https://wa.me/1234567890'),
  ('support_privacy_policy_link', '/privacy'),
  ('support_terms_link', '/terms')
ON CONFLICT (key) DO NOTHING;

-- Create function to check if current date is in earnings period
CREATE OR REPLACE FUNCTION is_earnings_period()
RETURNS boolean AS $$
DECLARE
  config RECORD;
  current_day integer;
BEGIN
  SELECT * INTO config FROM payment_dates_config LIMIT 1;
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  
  RETURN current_day >= config.earnings_start_day 
    AND current_day <= config.earnings_end_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if current date is in withdrawal period
CREATE OR REPLACE FUNCTION is_withdrawal_period()
RETURNS boolean AS $$
DECLARE
  config RECORD;
  current_day integer;
BEGIN
  SELECT * INTO config FROM payment_dates_config LIMIT 1;
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  
  RETURN current_day >= config.withdrawal_start_day 
    AND current_day <= config.withdrawal_end_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
