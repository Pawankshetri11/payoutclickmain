-- =============================================
-- ADD DUMMY WITHDRAWAL FOR USER
-- Run this to add a test withdrawal entry
-- =============================================

-- First, find the user ID for pkr994223@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'pkr994223@gmail.com';

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User pkr994223@gmail.com not found. Please create this user first.';
  ELSE
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
      500.00,
      'pending',
      'UPI',
      'Test withdrawal request',
      NOW()
    );

    RAISE NOTICE 'Dummy withdrawal added successfully for user: %', v_user_id;
  END IF;
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
