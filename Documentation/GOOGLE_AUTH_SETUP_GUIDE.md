# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your application.

## Prerequisites

- A Google Cloud account
- Admin access to your application's settings panel
- Access to your Supabase/Lovable Cloud dashboard

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Enter a project name (e.g., "YourApp OAuth")
4. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth Client ID"
3. If prompted, configure the consent screen first:
   - Choose "External" user type
   - Fill in the required app information
   - Add your email as a test user
   - Save and continue through all steps

4. For OAuth Client ID:
   - Application type: **Web application**
   - Name: "YourApp Web Client"
   
5. **Authorized JavaScript origins:**
   - Add: `http://localhost:5173` (for local development)
   - Add: Your production domain (e.g., `https://yourdomain.com`)
   - Add: Your preview URL (e.g., `https://yourapp.lovable.app`)

6. **Authorized redirect URIs:**
   - Add: `http://localhost:5173/`
   - Add: `https://yourdomain.com/`
   - Add: `https://yourapp.lovable.app/`
   - Add: Your Supabase project callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

## Step 4: Configure Supabase/Lovable Cloud

### In Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Google" in the list
4. Enable Google provider
5. Paste your **Client ID** and **Client Secret**
6. Click "Save"

### URL Configuration:

1. Still in Authentication, go to "URL Configuration"
2. Set **Site URL** to your application URL (e.g., `https://yourapp.lovable.app`)
3. Add **Redirect URLs**:
   - Your production domain
   - Your preview URL
   - `http://localhost:5173` (for development)

## Step 5: Configure in Admin Panel

1. Log in to your application's admin panel
2. Navigate to **Admin** → **Settings** → **OAuth** tab
3. Paste your **Google Client ID**
4. Paste your **Google Client Secret**
5. Toggle "Enable Google Login" to **ON**
6. Click "Save OAuth Settings"

## Step 6: Test the Integration

1. Log out of your application
2. Go to the login page
3. You should now see a "Continue with Google" button
4. Click it and test the login flow
5. Ensure you're redirected back to your app after authentication

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Double-check all redirect URIs in Google Cloud Console
- Ensure they match exactly (including trailing slashes)
- Verify your Site URL in Supabase matches your app URL

### Error: "invalid_client"
- Verify you've copied the correct Client ID and Client Secret
- Check there are no extra spaces when pasting
- Try regenerating the credentials in Google Cloud Console

### Google button not showing
- Clear browser cache and cookies
- Check that "Enable Google Login" is toggled ON in admin settings
- Verify OAuth settings are saved properly

### Users can't complete login
- Check Site URL and Redirect URLs in Supabase
- Ensure your domain is added to Authorized JavaScript origins
- Verify email domains are allowed in Google Cloud Console consent screen

## Security Best Practices

1. **Never commit credentials** to your codebase
2. Keep Client Secret secure - only store in admin panel
3. Regularly rotate OAuth credentials
4. Monitor OAuth usage in Google Cloud Console
5. Keep allowed redirect URIs to a minimum
6. Use HTTPS in production

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- Your application documentation at `/Documentation/GOOGLE_OAUTH_SETUP.md`

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Review this guide step-by-step
3. Contact support through your admin panel
