-- Fix RLS policies for transactions table to allow admin operations
-- This allows admins to create transactions for users (withdrawals, payouts, etc.)

-- Note: is_admin function already exists, so we just update the transactions policies

-- 1. Drop existing restrictive policies on transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions or admins can view all" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions or admins can insert for anyone" ON public.transactions;

-- 2. Create new policies that allow admin operations
CREATE POLICY "Users can view own transactions or admins can view all"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can insert own transactions or admins can insert for anyone"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update all transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
