-- =============================================
-- ADD DUMMY WITHDRAWAL FOR USER (SAFE LOOKUP)
-- Run this to add a test withdrawal entry
-- Looks up the user by email from public.profiles first, then auth.users
-- =============================================

DO $$
DECLARE
  v_email text := 'pkr994223@gmail.com'; -- change if needed
  v_amount numeric := 500.00;            -- change amount if needed
  v_user_id uuid;
  v_auth_user_exists boolean;
BEGIN
  -- MUST find user in auth.users (required for foreign key)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  -- Check if user exists in auth.users
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users for email: %. Please create account first.', v_email;
  END IF;

  -- Verify user also has a profile
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = v_user_id
  ) INTO v_auth_user_exists;

  IF NOT v_auth_user_exists THEN
    RAISE WARNING 'User % exists in auth.users but not in profiles. Creating profile...', v_user_id;
    
    INSERT INTO public.profiles (id, user_id, email, name)
    VALUES (v_user_id, v_user_id, v_email, 'Test User')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Insert dummy withdrawal transaction
  INSERT INTO public.transactions (
    id,
    user_id,
    type,
    amount,
    status,
    method,
    description,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'withdrawal',
    v_amount,
    'pending',
    'UPI',
    'Test withdrawal request (dummy)',
    NOW()
  );

  RAISE NOTICE 'Dummy withdrawal added successfully for user: %', v_user_id;
END $$;

-- Verify the insertion
SELECT 
  t.id,
  t.user_id,
  p.email,
  p.name,
  t.type,
  t.amount,
  t.status,
  t.method,
  t.created_at
FROM public.transactions t
LEFT JOIN public.profiles p ON p.id = t.user_id
WHERE p.email = 'pkr994223@gmail.com'
AND t.type = 'withdrawal'
ORDER BY t.created_at DESC
LIMIT 5;
