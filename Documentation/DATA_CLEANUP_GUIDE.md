# Complete Data Cleanup Guide

## ⚠️ WARNING
This cleanup will **PERMANENTLY DELETE** all user data except admin accounts. This action is **IRREVERSIBLE**. Make sure you have:
1. Backed up your database
2. Verified your admin accounts
3. Understood the consequences

## Prerequisites

### 1. Verify Admin Users Exist
Before cleanup, you MUST verify that admin users are properly identified in the database.

Run this SQL script in Supabase SQL Editor:
```sql
-- File: Sql/VERIFY_ADMIN_USERS.sql
```

This will show:
- List of all admin users
- Total users vs admin users
- How many users will be deleted

**CRITICAL**: If no admin users are found, DO NOT proceed. Create admin accounts first using `Sql/COMPLETE_ADMIN_SETUP.sql`

### 2. Backup Your Database
In Supabase Dashboard:
1. Go to Database → Backups
2. Create a manual backup
3. Wait for confirmation

## Cleanup Process

### Step 1: Edge Functions Deployment
The `supabase/config.toml` has been updated to include all edge functions:
- ✅ `delete-user`
- ✅ `admin-create-review`
- ✅ `impersonate-user`
- ✅ `resolve-referral` (NEW - fixes CORS error)
- ✅ `resolve-referrals`
- ✅ `send-email` (NEW)
- ✅ `send-kyc-email` (NEW)
- ✅ `send-withdrawal-email` (NEW)

These will auto-deploy when you save the code. Wait 1-2 minutes for deployment.

### Step 2: Run Data Cleanup

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `Sql/CLEAN_ALL_DATA_EXCEPT_ADMIN.sql`
4. Paste and execute
5. Wait for completion (may take 1-2 minutes)

### Step 3: Verify Cleanup

Run these verification queries:
```sql
SELECT COUNT(*) as remaining_users FROM auth.users;
SELECT COUNT(*) as remaining_profiles FROM profiles;
SELECT COUNT(*) as remaining_transactions FROM transactions;
SELECT COUNT(*) as remaining_withdrawals FROM withdrawals;
SELECT COUNT(*) as remaining_referrals FROM referrals;
SELECT COUNT(*) as admin_users FROM user_roles WHERE role = 'admin';
```

Expected results:
- `remaining_users` = number of admin accounts
- `admin_users` = number of admin accounts
- All other counts should match admin count or be 0

## What Gets Deleted

### User Data
- ❌ All non-admin user accounts
- ❌ All non-admin profiles
- ❌ User balances and earnings
- ❌ KYC data and documents
- ❌ Bank account information

### Activity Data
- ❌ All referral relationships
- ❌ All transactions (earnings, withdrawals)
- ❌ All withdrawal requests
- ❌ All task submissions
- ❌ All user tasks
- ❌ All review profiles
- ❌ All profile locks

### What Gets Preserved
- ✅ Admin user accounts
- ✅ Admin profiles
- ✅ System settings
- ✅ Job templates (tasks)
- ✅ Categories
- ✅ FAQs
- ✅ Site content
- ✅ Payment gateway settings

## Post-Cleanup Actions

1. **Test Admin Login**: Verify you can still log in with admin account
2. **Test User Registration**: Create a new test user to verify system works
3. **Test Referral System**: 
   - New user should get a referral code
   - Applying referral codes should work
4. **Test Commission**: When new users make withdrawals, verify commission calculation

## Troubleshooting

### Issue: No admin users found
**Solution**: Run `Sql/COMPLETE_ADMIN_SETUP.sql` to create an admin account first

### Issue: Cleanup script fails with foreign key errors
**Solution**: The script is ordered to respect foreign key constraints. If it fails:
1. Check which table caused the error
2. Manually delete records from that table first
3. Re-run the cleanup script

### Issue: Some data remains after cleanup
**Solution**: Run the verification queries to identify which tables still have data, then manually clean them

### Issue: Edge functions still not visible in Supabase
**Solution**: 
1. Check `supabase/config.toml` is properly formatted
2. Wait 2-3 minutes for deployment
3. Check Supabase Dashboard → Edge Functions
4. Look for deployment logs in the Functions tab

## Referral System Fix Details

### Problems Fixed:
1. **CORS Error**: `resolve-referral` function now properly configured
2. **Missing Functions**: Email notification functions now deployed
3. **Test Data**: Dummy referral data removed
4. **Commission Processing**: Will work correctly after cleanup

### Commission Flow:
```
User Withdrawal → Admin Approves → 
  ↓
If user has referrer:
  - User gets: 80%
  - Referrer gets: 10% (commission)
  - Company gets: 10%
  
If no referrer:
  - User gets: 80%
  - Company gets: 20%
```

### Verification:
1. Create 2 test users (User A, User B)
2. User A shares referral code
3. User B applies referral code during signup
4. User B earns money and requests withdrawal
5. Admin approves withdrawal
6. Check User A's balance - should receive 10% commission
7. Check transactions table - should show commission record

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check console logs in browser (F12 → Console)
3. Verify RLS policies are enabled
4. Ensure admin role is properly configured

---

**Last Updated**: 2025-10-12
**Script Version**: 1.0
**Safety Level**: ⚠️ CRITICAL - Requires backup
