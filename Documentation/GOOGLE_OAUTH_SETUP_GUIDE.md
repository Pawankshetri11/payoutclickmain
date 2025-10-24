# Google OAuth Setup Guide

This guide will walk you through setting up Google authentication for your PayoutClick application.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter a project name (e.g., "PayoutClick Auth")
4. Click **Create**

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: PayoutClick (or your app name)
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
5. Under **Authorized domains**, add:
   - `supabase.co` (or your custom domain if you have one)
6. Click **Save and Continue**

### Configure Scopes

1. On the **Scopes** screen, click **Add or Remove Scopes**
2. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
3. Click **Update** → **Save and Continue**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. Select **Application type**: **Web application**
4. Configure the OAuth client:

### Name
- Enter a name: "PayoutClick Web Client"

### Authorized JavaScript Origins
Add these URLs:
- `http://localhost:5173` (for local development)
- `https://<YOUR_PROJECT_ID>.supabase.co`
- Your production domain (if deployed)

### Authorized Redirect URIs
Add this URL:
- `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`

**Important**: Replace `<YOUR_PROJECT_ID>` with your actual Supabase project ID.

5. Click **Create**
6. **Save your credentials**:
   - Copy the **Client ID**
   - Copy the **Client Secret**

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable Google authentication
6. Enter your credentials:
   - **Client ID**: Paste the Client ID from Google Cloud
   - **Client Secret**: Paste the Client Secret from Google Cloud
7. Click **Save**

## Step 5: Configure Site URL and Redirect URLs

**CRITICAL**: This step is required for authentication to work properly.

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set the following:

### Site URL
- **Development**: `http://localhost:5173`
- **Production**: `https://yourdomain.com`

### Redirect URLs
Add all URLs where users can be redirected after authentication:
- `http://localhost:5173/**`
- `https://<YOUR_PROJECT_ID>.lovable.app/**`
- `https://yourdomain.com/**` (if you have a custom domain)

## Step 6: Test the Integration

1. Go to your application's login page
2. Click **Continue with Google**
3. You should be redirected to Google's sign-in page
4. After successful authentication, you should be redirected back to your app

## Troubleshooting

### Error: "requested path is invalid"
- Check that your Site URL and Redirect URLs are correctly set in Supabase
- Make sure the redirect URL in your code matches one of the authorized redirect URIs

### Error: "redirect_uri_mismatch"
- Verify that the redirect URI in Google Cloud Console matches your Supabase callback URL exactly
- The format should be: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`

### Google sign-in button doesn't work
- Check browser console for errors
- Verify that your Client ID and Secret are correctly entered in Supabase
- Make sure the OAuth consent screen is published

### Users can't access certain features
- Check that you're requesting the correct scopes in the OAuth consent screen
- Ensure your app handles user profile data correctly

## Production Checklist

Before deploying to production:

- [ ] OAuth consent screen is published
- [ ] Production domain is added to Authorized JavaScript Origins
- [ ] Production callback URL is added to Authorized Redirect URIs
- [ ] Site URL in Supabase is set to production domain
- [ ] All production redirect URLs are added in Supabase
- [ ] Test sign-in flow in production environment

## Security Best Practices

1. **Never expose Client Secret**: Keep it secure in Supabase, never in frontend code
2. **Use HTTPS**: Always use HTTPS in production
3. **Review permissions**: Only request necessary scopes
4. **Monitor usage**: Regularly check Google Cloud Console for suspicious activity
5. **Rotate credentials**: Periodically rotate your Client ID and Secret

## Additional Resources

- [Supabase Google Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:

1. Check the console logs in your browser
2. Review Supabase auth logs
3. Verify all URLs and credentials
4. Consult the troubleshooting section above

For more help, contact your development team or refer to the official documentation links provided.
