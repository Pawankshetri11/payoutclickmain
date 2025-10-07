# Google OAuth Setup Instructions

## Database Setup

Run this SQL in your Supabase SQL Editor to create the OAuth settings table:

```sql
-- Create OAuth settings table
create table if not exists public.oauth_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  client_id text,
  client_secret text,
  enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint valid_provider check (provider in ('google', 'facebook', 'github'))
);

-- Enable RLS
alter table public.oauth_settings enable row level security;

-- Only admins can view and modify OAuth settings
create policy "Only admins can manage OAuth settings"
  on public.oauth_settings
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Insert default Google OAuth entry
insert into public.oauth_settings (provider, enabled)
values ('google', false)
on conflict (provider) do nothing;

-- Create updated_at trigger
create or replace function public.update_oauth_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger oauth_settings_updated_at
  before update on public.oauth_settings
  for each row
  execute function public.update_oauth_settings_updated_at();
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Choose "Web application"
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - Your production domain
7. Add Authorized redirect URIs:
   - `${window.location.origin}/`
   - Your Supabase project URL callback
8. Copy the Client ID and Client Secret

## Supabase Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set the Site URL to your application URL
3. Add redirect URLs:
   - Your preview URL
   - Your production domain

## Admin Panel Configuration

1. Navigate to Admin → Settings → OAuth tab
2. Paste the Google Client ID
3. Paste the Google Client Secret
4. Enable Google Login
5. Click "Save OAuth Settings"

## Testing

1. Users can now see "Continue with Google" on the login page
2. Test the login flow to ensure it works correctly
