-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank', 'upi', 'paypal', 'crypto')),
  is_default BOOLEAN DEFAULT false,
  
  -- Bank details
  bank_name TEXT,
  account_holder TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_type TEXT,
  
  -- UPI details
  upi_id TEXT,
  
  -- PayPal details
  paypal_email TEXT,
  
  -- Crypto details
  crypto_wallet_address TEXT,
  crypto_network TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can insert their own payment methods"
ON public.payment_methods FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can delete their own payment methods"
ON public.payment_methods FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;
CREATE POLICY "Admins can view all payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.payment_methods(user_id, is_default);

-- Add payment_method_id to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods(id);
