-- Function: record_referral_commission
-- Purpose: Safely insert referral commission transactions using SECURITY DEFINER to bypass RLS
-- Run this in your SQL editor, then refresh the app.

CREATE OR REPLACE FUNCTION public.record_referral_commission(
  p_referrer_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Referral commission'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    status,
    description
  ) VALUES (
    p_referrer_id,
    'earning',
    p_amount,
    'completed',
    COALESCE(p_description, 'Referral commission')
  );
END;
$$;

-- Allow authenticated users (admins in app) to call this function
GRANT EXECUTE ON FUNCTION public.record_referral_commission(uuid, numeric, text) TO authenticated;
