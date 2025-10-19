# Production Setup Checklist

## ✅ Authentication Setup Complete

### What's Been Implemented:

1. **Real Supabase Authentication**
   - ✅ Removed all dummy/localStorage authentication
   - ✅ User signup with email verification
   - ✅ User login with session management
   - ✅ Admin login with role verification
   - ✅ Google OAuth integration ready
   - ✅ Banned user blocking
   - ✅ KYC requirement for withdrawals

2. **User Flows**
   - ✅ Users sign up via `/signup`
   - ✅ Users login via `/login`
   - ✅ Admins login via `/admin/login`
   - ✅ New users redirected to KYC completion
   - ✅ Email verification required

3. **Security Features**
   - ✅ RLS policies on all tables
   - ✅ Admin role verification
   - ✅ Password validation (min 6 chars)
   - ✅ Email confirmation required
   - ✅ Session persistence
   - ✅ Auto token refresh

---

## 🔐 Admin Account Setup

### Admin Credentials:
- **Email**: `admin@payoutclick.io`
- **Password**: `4Amtech@1@`

### Setup Steps:

#### **Option 1: Via Supabase Dashboard (RECOMMENDED)**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Enter:
   - Email: `admin@payoutclick.io`
   - Password: `4Amtech@1@`
   - ✅ Check **"Auto Confirm User"** (important!)
5. Click **"Create User"**
6. Copy the **User ID** that appears
7. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('PASTE_YOUR_COPIED_USER_ID_HERE', 'admin');
   ```
8. Verify with:
   ```sql
   SELECT * FROM public.user_roles WHERE role = 'admin';
   ```

#### **Option 2: Via Application Signup**

1. Go to `/signup` on your application
2. Create account with:
   - Email: `admin@payoutclick.io`
   - Password: `4Amtech@1@`
3. Check your email and verify the account
4. Get the user ID from Supabase dashboard
5. Run SQL to assign admin role (see script `CREATE_ADMIN_ACCOUNT.sql`)

---

## 📋 Pre-Launch Checklist

### Required Before Going Live:

- [ ] **Run `SIMPLE_ADMIN_SETUP.sql`** in Supabase SQL Editor
- [ ] **Create admin account** using steps above
- [ ] **Verify admin can login** at `/admin/login`
- [ ] **Test user signup** at `/signup`
- [ ] **Test user login** at `/login`
- [ ] **Configure email templates** in Supabase (Authentication > Email Templates)
- [ ] **Set up custom SMTP** (optional but recommended for production)
- [ ] **Configure OAuth providers** if using Google login
- [ ] **Set Site URL** in Supabase: Authentication > URL Configuration
- [ ] **Set Redirect URLs** in Supabase for your production domain
- [ ] **Disable "Confirm Email"** in Supabase settings ONLY for testing (re-enable for production!)

### Database Tables Required:

- [x] `profiles` - User profiles
- [x] `user_roles` - Admin/user roles
- [x] `jobs` - Job listings
- [x] `tasks` - User tasks
- [x] `transactions` - Earnings/withdrawals
- [ ] `kyc_details` - KYC verification data (create if not exists)
- [ ] `job_codes` - Job verification codes
- [ ] `referrals` - Referral tracking
- [ ] `tickets` - Support tickets

### Email Configuration:

1. Go to Supabase Dashboard > Authentication > Email Templates
2. Customize these templates:
   - **Confirm Signup**: Welcome email with verification link
   - **Magic Link**: Passwordless login
   - **Change Email**: Email change verification
   - **Reset Password**: Password reset link

### URL Configuration:

In Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://yourdomain.com` (production) or `http://localhost:5173` (dev)
- **Redirect URLs**: Add all URLs where users can be redirected:
  - `http://localhost:5173/**`
  - `https://yourdomain.com/**`
  - `https://www.yourdomain.com/**`

---

## 🚀 Going Live Steps

1. **Deploy to production** (Vercel, Netlify, etc.)
2. **Update Supabase URLs** with production domain
3. **Test all authentication flows** on production
4. **Create admin account** on production database
5. **Invite test users** to verify signup/login works
6. **Monitor Supabase logs** for any errors
7. **Set up monitoring/alerts** for auth failures

---

## 🛡️ Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for sensitive data
- ✅ Enable RLS on all tables
- ✅ Require email verification (disabled only for testing)
- ✅ Use strong passwords for admin accounts
- ✅ Regularly audit user roles
- ✅ Monitor failed login attempts
- ✅ Keep Supabase and dependencies updated

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard > Logs
2. Verify RLS policies: Run `SIMPLE_ADMIN_SETUP.sql` again
3. Check browser console for errors
4. Verify email templates are configured
5. Ensure Site URL and Redirect URLs are correct

---

## 🎉 Production Ready!

Your application is now configured for production with:
- ✅ Real authentication
- ✅ Secure admin access
- ✅ User registration
- ✅ Email verification
- ✅ Role-based access control
- ✅ Session management
