# Production Database Setup Guide

## Overview
This guide will help you set up the complete database for your production application. Follow these steps in order.

## Prerequisites
- Access to your Supabase project dashboard
- SQL Editor access in Supabase

---

## Step 1: Run Complete Database Setup

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file `DATABASE_SETUP_COMPLETE.sql`
4. Copy all contents
5. Paste into Supabase SQL Editor
6. Click **Run** or press `Ctrl+Enter`

This will create:
- ✅ User roles system (admin, moderator, user)
- ✅ Profiles table with automatic creation on signup
- ✅ Earnings, withdrawals, jobs, and tasks tables
- ✅ Proper RLS (Row Level Security) policies
- ✅ Database triggers and functions

---

## Step 2: Create Admin Account

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication > Users** in Supabase dashboard
2. Click **"Add User"** or **"Invite User"**
3. Enter:
   - Email: `admin@payoutclick.io`
   - Password: `4Amtech@1@`
   - **Auto Confirm User**: ✅ **Check this box!**
4. Click **"Create User"**
5. Copy the User ID from the users list

### Option B: Via Application Signup

1. Go to your app signup page
2. Sign up with:
   - Email: `admin@payoutclick.io`
   - Password: `4Amtech@1@`
3. Verify email if required
4. Continue to Step 3

---

## Step 3: Assign Admin Role

1. In Supabase SQL Editor, run:
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@payoutclick.io';
```

2. Copy the `id` value

3. Run this query (replace `YOUR_USER_ID` with the copied ID):
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

---

## Step 4: Verify Setup

Run this query to verify everything is working:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.kyc_status,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@payoutclick.io';
```

You should see:
- ✅ User ID
- ✅ Email: admin@payoutclick.io
- ✅ Email confirmed timestamp
- ✅ Profile created
- ✅ Role: admin

---

## Step 5: Test Login

1. Go to `/admin/login`
2. Login with:
   - Email: `admin@payoutclick.io`
   - Password: `4Amtech@1@`
3. You should be redirected to the admin dashboard

---

## Troubleshooting

### "Failed to create user: Database error creating new user"
- Make sure you ran `DATABASE_SETUP_COMPLETE.sql` completely
- Check if the `profiles` table exists:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_name = 'profiles';
  ```
- Check if the trigger exists:
  ```sql
  SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
  ```

### "Admin access denied" or redirected to user dashboard
- Verify admin role is assigned:
  ```sql
  SELECT * FROM public.user_roles WHERE role = 'admin';
  ```
- If no results, repeat Step 3

### Email not confirmed
- Update email confirmation:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = now() 
  WHERE email = 'admin@payoutclick.io';
  ```

### User signup not creating profile
- Check if trigger is working:
  ```sql
  SELECT * FROM public.profiles WHERE id IN (SELECT id FROM auth.users);
  ```
- If profiles are missing, the trigger may have failed. Check Supabase logs.

---

## Additional Configuration

### Disable Email Confirmation for Testing
1. Go to **Authentication > Settings** in Supabase
2. Scroll to **Email Auth**
3. Uncheck **"Confirm email"**
4. Click **Save**

⚠️ **Remember to re-enable this in production!**

### Configure Site URL and Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your production URL
3. Add your production URL to **Redirect URLs**

---

## Next Steps

After completing this setup:
1. ✅ Admin account is ready
2. ✅ Users can sign up normally
3. ✅ All database tables are created
4. ✅ RLS policies are in place
5. ✅ System is production-ready

You can now:
- Create jobs and tasks
- Manage users
- Process withdrawals
- Monitor system analytics

---

## Need Help?

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify all SQL scripts ran successfully
3. Ensure RLS policies are enabled
4. Check authentication settings in Supabase dashboard
