-- =============================================
-- ADD DUMMY WITHDRAWAL - COMPLETE FIX
-- This version ensures user exists and creates proper withdrawal
-- =============================================

DO $$ 
DECLARE
  v_email text := 'pkr994223@gmail.com'; -- Change to your test email
  v_amount numeric := 500.00;
  v_user_id uuid;
  v_profile_exists boolean;
  v_payment_method_id uuid;
BEGIN
  -- Step 1: Find user in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found for email: %. Please sign up first!', v_email;
  END IF;

  RAISE NOTICE 'Found user ID: %', v_user_id;

  -- Step 2: Ensure profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = v_user_id
  ) INTO v_profile_exists;

  IF NOT v_profile_exists THEN
    RAISE NOTICE 'Creating profile for user...';
    
    INSERT INTO public.profiles (id, user_id, email, name, balance)
    VALUES (v_user_id, v_user_id, v_email, 'Test User', 1000.00)
    ON CONFLICT (id) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        email = EXCLUDED.email,
        balance = GREATEST(profiles.balance, 1000.00);
  ELSE
    -- Update balance to ensure user has funds
    UPDATE public.profiles
    SET balance = GREATEST(balance, 1000.00)
    WHERE id = v_user_id;
  END IF;

  -- Step 3: Ensure payment method exists
  SELECT id INTO v_payment_method_id
  FROM public.payment_methods
  WHERE user_id = v_user_id
  AND method_type = 'UPI'
  LIMIT 1;

  IF v_payment_method_id IS NULL THEN
    RAISE NOTICE 'Creating payment method...';
    
    INSERT INTO public.payment_methods (user_id, method_type, details, is_verified)
    VALUES (
      v_user_id,
      'UPI',
      jsonb_build_object('upi_id', 'test@upi', 'name', 'Test User'),
      true
    )
    RETURNING id INTO v_payment_method_id;
  END IF;

  -- Step 4: Create withdrawal transaction
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    status,
    method,
    description,
    created_at
  ) VALUES (
    v_user_id,
    'withdrawal',
    v_amount,
    'pending',
    'UPI',
    'Test withdrawal request (dummy data)',
    NOW()
  );

  RAISE NOTICE '✅ Successfully created dummy withdrawal for user: %', v_user_id;
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '💰 Amount: ₹%', v_amount;
  RAISE NOTICE '📊 Status: pending';

END $$;

-- Verify the results
SELECT 
  t.id,
  t.user_id,
  p.email,
  p.name,
  p.balance,
  t.type,
  t.amount,
  t.status,
  t.method,
  t.created_at
FROM public.transactions t
JOIN public.profiles p ON p.id = t.user_id
WHERE p.email = 'pkr994223@gmail.com'
AND t.type = 'withdrawal'
ORDER BY t.created_at DESC
LIMIT 5;
