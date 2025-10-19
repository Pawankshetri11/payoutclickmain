-- ================================================================
-- COMPREHENSIVE DATA CLEANUP SCRIPT
-- This script removes ALL user data EXCEPT admin accounts
-- WARNING: This is IRREVERSIBLE. Backup your database first!
-- ================================================================

-- Step 1: Identify admin users (adjust the condition based on your admin identification)
-- This script assumes admins are identified by a user_roles table with role = 'admin'
-- If you use a different method, modify this accordingly

-- Step 2: Delete all referral relationships (except those involving admins)
DELETE FROM referrals 
WHERE referrer_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
)
AND referred_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 3: Delete all transactions for non-admin users
DELETE FROM transactions 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 4: Delete all withdrawal requests for non-admin users
DELETE FROM withdrawals 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 5: Delete all task submissions for non-admin users
DELETE FROM task_submissions 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 6: Delete all user tasks for non-admin users
DELETE FROM user_tasks 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 7: Delete all review profiles for non-admin users
DELETE FROM review_profiles 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 8: Delete all profile locks for non-admin users
DELETE FROM profile_locks 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 9: Reset profiles for non-admin users (clear balance, earnings, etc.)
UPDATE profiles 
SET 
  balance = 0,
  total_earnings = 0,
  total_withdrawn = 0,
  kyc_status = 'not_submitted',
  kyc_submitted_at = NULL,
  kyc_data = NULL,
  bank_name = NULL,
  bank_account_number = NULL,
  bank_account_type = NULL,
  bank_routing_number = NULL,
  bank_account_holder = NULL,
  referred_by = NULL,
  payment_methods = NULL
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 10: Delete all non-admin user profiles
DELETE FROM profiles 
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 11: Delete all non-admin users from auth.users
-- CAUTION: This will permanently delete user accounts
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Step 12: Optionally reset auto-increment sequences (if using serial IDs)
-- This ensures new data starts from fresh IDs
-- Uncomment if needed:
-- ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE withdrawals_id_seq RESTART WITH 1;

-- Verification Queries (run these to verify the cleanup)
-- SELECT COUNT(*) as remaining_users FROM auth.users;
-- SELECT COUNT(*) as remaining_profiles FROM profiles;
-- SELECT COUNT(*) as remaining_transactions FROM transactions;
-- SELECT COUNT(*) as remaining_withdrawals FROM withdrawals;
-- SELECT COUNT(*) as remaining_referrals FROM referrals;
-- SELECT COUNT(*) as admin_users FROM user_roles WHERE role = 'admin';

-- ================================================================
-- CLEANUP COMPLETE
-- All user data has been removed except admin accounts
-- ================================================================
