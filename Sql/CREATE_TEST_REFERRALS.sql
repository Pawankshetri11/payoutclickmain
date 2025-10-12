-- Script to create test referral data
-- This will help you test the referral system

-- First, let's see what users exist
-- You need to replace these UUIDs with actual user IDs from your database

-- Example: If you want user A to refer user B
-- UPDATE profiles 
-- SET referred_by = 'USER_A_ID'
-- WHERE user_id = 'USER_B_ID';

-- Then create a referral record
-- INSERT INTO referrals (referrer_id, referred_id, status, commission_rate, total_commission_earned)
-- VALUES ('USER_A_ID', 'USER_B_ID', 'active', 0.10, 0);

-- To test with your current user (user_id: eeaeaca1-b825-4b35-aded-ccb109e70251)
-- Create another test user first, then run:

-- Step 1: Create a test referred user (run this in Supabase SQL editor)
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'testreferred@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Get the created user ID and use it below
-- Replace 'NEW_USER_ID' with the actual UUID

INSERT INTO profiles (user_id, name, email, balance, total_earnings, status)
VALUES (
  'NEW_USER_ID',
  'Test Referred User',
  'testreferred@example.com',
  0,
  500,
  'active'
);

-- Link to your referrer
UPDATE profiles 
SET referred_by = 'eeaeaca1-b825-4b35-aded-ccb109e70251'
WHERE user_id = 'NEW_USER_ID';

-- Create referral record
INSERT INTO referrals (referrer_id, referred_id, status, commission_rate, total_commission_earned)
VALUES (
  'eeaeaca1-b825-4b35-aded-ccb109e70251',
  'NEW_USER_ID',
  'active',
  0.10,
  50
);

-- Create a commission transaction
INSERT INTO transactions (user_id, type, amount, description, status)
VALUES (
  'eeaeaca1-b825-4b35-aded-ccb109e70251',
  'earning',
  50,
  'Referral commission from withdrawal',
  'completed'
);
*/

-- Instructions:
-- 1. Go to your Supabase project
-- 2. Open SQL Editor
-- 3. Copy the code inside /* */ above
-- 4. Replace 'NEW_USER_ID' with the actual UUID generated
-- 5. Run the script
