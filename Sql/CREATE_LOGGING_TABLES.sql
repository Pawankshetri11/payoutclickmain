-- Create login_logs table to track user login activity
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_name TEXT,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create error_logs table to track system errors
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  page_url TEXT,
  severity TEXT DEFAULT 'error', -- 'error', 'warning', 'critical'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);

-- Enable RLS
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;
DROP POLICY IF EXISTS "System can insert login logs" ON login_logs;
DROP POLICY IF EXISTS "Admins can view all error logs" ON error_logs;
DROP POLICY IF EXISTS "System can insert error logs" ON error_logs;

-- RLS Policies for login_logs (admin only)
CREATE POLICY "Admins can view all login logs"
  ON login_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert login logs"
  ON login_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for error_logs (admin only)
CREATE POLICY "Admins can view all error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert error logs"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to automatically log logins
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get user profile info
  INSERT INTO login_logs (user_id, email, user_name, status)
  SELECT 
    NEW.id,
    NEW.email,
    p.name,
    'success'
  FROM profiles p
  WHERE p.user_id = NEW.id;
  
  RETURN NEW;
END;
$$;


-- Trigger to log successful logins (when last_sign_in_at is updated)
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION log_user_login();

-- Grant necessary permissions
GRANT SELECT ON login_logs TO authenticated;
GRANT INSERT ON login_logs TO authenticated;
GRANT SELECT ON error_logs TO authenticated;
GRANT INSERT ON error_logs TO authenticated;
