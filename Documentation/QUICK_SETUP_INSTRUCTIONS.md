# Quick Setup - 3 Simple Steps

## Step 1: Run Database Setup (1 minute)
1. Open your **Supabase Dashboard**
2. Click **SQL Editor** in the left menu
3. Click **New Query**
4. Copy ALL content from `DATABASE_SETUP_COMPLETE.sql`
5. Paste into the SQL Editor
6. Click **RUN** (bottom right) or press `Ctrl+Enter`

✅ Wait for "Success. No rows returned" message

---

## Step 2: Create Admin User (30 seconds)
1. In Supabase, go to **Authentication** → **Users**
2. Click **Add User** button
3. Fill in:
   - **Email**: `admin@payoutclick.io`
   - **Password**: `4Amtech@1@`
   - **Auto Confirm User**: ✅ **CHECK THIS BOX**
4. Click **Create User**
5. **Copy the User ID** (long UUID string)

---

## Step 3: Make User Admin (30 seconds)
1. Go back to **SQL Editor**
2. Click **New Query**
3. Paste this (replace `PASTE_ID_HERE` with the ID you copied):
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_ID_HERE', 'admin');
```
4. Click **RUN**

✅ You should see "Success. 1 row(s) affected"

---

## Done! 🎉

Now you can:
- **Login as admin**: Go to `/admin/login`
  - Email: `admin@payoutclick.io`
  - Password: `4Amtech@1@`
- **Users can signup**: Regular users can sign up at `/signup`
- All tables, policies, and triggers are ready

---

## Quick Verify (Optional)

Run this in SQL Editor to confirm everything works:
```sql
SELECT 
  u.email,
  ur.role,
  p.name
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@payoutclick.io';
```

You should see:
- email: `admin@payoutclick.io`
- role: `admin`
- Profile created automatically ✅

---

## Need Help?

If you get errors:
- Make sure you ran **Step 1** completely (scroll through all SQL)
- Check that "Auto Confirm User" was checked in Step 2
- Verify you pasted the correct User ID in Step 3

The script is now idempotent - you can run it multiple times without errors!
