# Database Migration Instructions

## Run This Migration in Your Supabase Dashboard

To set up all required database tables for your application, follow these steps:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Copy and Run the SQL Script

Copy the entire SQL script below and paste it into the SQL Editor, then click "Run":

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type public.app_role as enum ('admin', 'user');
create type public.withdrawal_status as enum ('pending', 'approved', 'rejected', 'processing', 'completed');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.referral_status as enum ('active', 'inactive');

-- User Roles Table (CRITICAL FOR SECURITY)
create table if not exists public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  balance decimal(10, 2) default 0,
  total_earned decimal(10, 2) default 0,
  kyc_status text default 'pending',
  kyc_document_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Categories Table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamp with time zone default now()
);

-- Jobs Table
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  category text not null,
  amount decimal(10, 2) not null,
  vacancy integer not null default 1,
  completed integer default 0,
  image_url text,
  requirements text[] default array[]::text[],
  codes text[] default array[]::text[],
  approval_required boolean default true,
  status text default 'active',
  created_by text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Task Submissions Table
create table if not exists public.task_submissions (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  submission_data jsonb not null,
  proof_url text,
  status text default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Withdrawals Table
create table if not exists public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  method text not null,
  account_details jsonb not null,
  status withdrawal_status default 'pending',
  company_fee decimal(10, 2) default 0,
  processing_fee decimal(10, 2) default 0,
  referral_commission decimal(10, 2) default 0,
  net_amount decimal(10, 2) not null,
  admin_notes text,
  processed_by uuid references auth.users(id),
  processed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Referrals Table
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references auth.users(id) on delete cascade not null,
  referee_id uuid references auth.users(id) on delete cascade not null,
  referral_code text not null,
  status referral_status default 'active',
  total_commission_earned decimal(10, 2) default 0,
  created_at timestamp with time zone default now(),
  unique(referrer_id, referee_id)
);

-- Referral Commissions Table
create table if not exists public.referral_commissions (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid references public.referrals(id) on delete cascade not null,
  withdrawal_id uuid references public.withdrawals(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Support Tickets Table
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  message text not null,
  category text not null,
  status ticket_status default 'open',
  priority ticket_priority default 'medium',
  admin_reply text,
  replied_by uuid references auth.users(id),
  replied_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Withdrawal Methods Table
create table if not exists public.withdrawal_methods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  method_type text not null,
  account_details jsonb not null,
  is_default boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Payment Gateways Table
create table if not exists public.payment_gateways (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  type text not null,
  is_active boolean default true,
  config jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add missing columns to existing tables (safe to run multiple times)
alter table public.payment_gateways add column if not exists is_active boolean default true;
alter table public.payment_gateways add column if not exists config jsonb;
alter table public.withdrawals add column if not exists company_fee decimal(10, 2) default 0;
alter table public.withdrawals add column if not exists processing_fee decimal(10, 2) default 0;
alter table public.withdrawals add column if not exists referral_commission decimal(10, 2) default 0;
alter table public.withdrawals add column if not exists net_amount decimal(10, 2);
alter table public.referrals add column if not exists total_commission_earned decimal(10, 2) default 0;
alter table public.support_tickets add column if not exists replied_by uuid references auth.users(id);
alter table public.support_tickets add column if not exists replied_at timestamp with time zone;

-- Enable Row Level Security on all tables
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.jobs enable row level security;
alter table public.task_submissions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.withdrawal_methods enable row level security;
alter table public.payment_gateways enable row level security;

-- Security Definer Function for Role Check (CRITICAL)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own roles" on public.user_roles;
drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Admins can manage roles" on public.user_roles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Anyone can view categories" on public.categories;
drop policy if exists "Admins can manage categories" on public.categories;
drop policy if exists "Anyone can view active jobs" on public.jobs;
drop policy if exists "Admins can manage jobs" on public.jobs;
drop policy if exists "Users can view own submissions" on public.task_submissions;
drop policy if exists "Users can create submissions" on public.task_submissions;
drop policy if exists "Admins can view all submissions" on public.task_submissions;
drop policy if exists "Admins can update submissions" on public.task_submissions;
drop policy if exists "Users can view own withdrawals" on public.withdrawals;
drop policy if exists "Users can create withdrawals" on public.withdrawals;
drop policy if exists "Admins can view all withdrawals" on public.withdrawals;
drop policy if exists "Admins can update withdrawals" on public.withdrawals;
drop policy if exists "Users can view own referrals" on public.referrals;
drop policy if exists "Users can create referrals" on public.referrals;
drop policy if exists "Admins can view all referrals" on public.referrals;
drop policy if exists "Users can view own commissions" on public.referral_commissions;
drop policy if exists "Admins can view all commissions" on public.referral_commissions;
drop policy if exists "Admins can manage commissions" on public.referral_commissions;
drop policy if exists "Users can view own tickets" on public.support_tickets;
drop policy if exists "Users can create tickets" on public.support_tickets;
drop policy if exists "Users can update own tickets" on public.support_tickets;
drop policy if exists "Admins can view all tickets" on public.support_tickets;
drop policy if exists "Admins can update all tickets" on public.support_tickets;
drop policy if exists "Users can view own methods" on public.withdrawal_methods;
drop policy if exists "Users can manage own methods" on public.withdrawal_methods;
drop policy if exists "Anyone can view active gateways" on public.payment_gateways;
drop policy if exists "Admins can manage gateways" on public.payment_gateways;

-- RLS Policies for user_roles
create policy "Users can view own roles" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "Admins can view all roles" on public.user_roles
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all profiles" on public.profiles
  for update using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories
create policy "Anyone can view categories" on public.categories
  for select using (true);

create policy "Admins can manage categories" on public.categories
  for all using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
create policy "Anyone can view active jobs" on public.jobs
  for select using (status = 'active');

create policy "Admins can manage jobs" on public.jobs
  for all using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for task_submissions
create policy "Users can view own submissions" on public.task_submissions
  for select using (auth.uid() = user_id);

create policy "Users can create submissions" on public.task_submissions
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all submissions" on public.task_submissions
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update submissions" on public.task_submissions
  for update using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawals
create policy "Users can view own withdrawals" on public.withdrawals
  for select using (auth.uid() = user_id);

create policy "Users can create withdrawals" on public.withdrawals
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all withdrawals" on public.withdrawals
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update withdrawals" on public.withdrawals
  for update using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
create policy "Users can view own referrals" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "Users can create referrals" on public.referrals
  for insert with check (auth.uid() = referee_id);

create policy "Admins can view all referrals" on public.referrals
  for select using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_commissions
create policy "Users can view own commissions" on public.referral_commissions
  for select using (
    exists (
      select 1 from public.referrals
      where referrals.id = referral_commissions.referral_id
      and referrals.referrer_id = auth.uid()
    )
  );

create policy "Admins can view all commissions" on public.referral_commissions
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage commissions" on public.referral_commissions
  for all using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for support_tickets
create policy "Users can view own tickets" on public.support_tickets
  for select using (auth.uid() = user_id);

create policy "Users can create tickets" on public.support_tickets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tickets" on public.support_tickets
  for update using (auth.uid() = user_id);

create policy "Admins can view all tickets" on public.support_tickets
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all tickets" on public.support_tickets
  for update using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawal_methods
create policy "Users can view own methods" on public.withdrawal_methods
  for select using (auth.uid() = user_id);

create policy "Users can manage own methods" on public.withdrawal_methods
  for all using (auth.uid() = user_id);

-- RLS Policies for payment_gateways
create policy "Anyone can view active gateways" on public.payment_gateways
  for select using (is_active = true);

create policy "Admins can manage gateways" on public.payment_gateways
  for all using (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default user role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_jobs
  before update on public.jobs
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_task_submissions
  before update on public.task_submissions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_withdrawals
  before update on public.withdrawals
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_support_tickets
  before update on public.support_tickets
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_withdrawal_methods
  before update on public.withdrawal_methods
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_payment_gateways
  before update on public.payment_gateways
  for each row execute function public.handle_updated_at();

-- Insert default categories
insert into public.categories (name, description, icon, color) values
  ('Social Media', 'Tasks related to social media engagement', 'Share2', 'text-blue-500'),
  ('Reviews', 'Write reviews and ratings', 'Star', 'text-yellow-500'),
  ('Surveys', 'Complete surveys and questionnaires', 'ClipboardList', 'text-green-500'),
  ('App Testing', 'Test and review mobile applications', 'Smartphone', 'text-purple-500'),
  ('Video Tasks', 'Watch and interact with videos', 'Video', 'text-red-500'),
  ('Data Entry', 'Simple data entry tasks', 'FileText', 'text-gray-500')
on conflict (name) do nothing;
```

### Step 3: Create Your First Admin User

After running the migration, you need to manually create an admin user. Run this SQL query, replacing the UUID with your actual user ID:

```sql
-- First, sign up through your app to create a user account
-- Then find your user ID from the auth.users table
-- Finally, run this to make yourself an admin:

insert into public.user_roles (user_id, role)
values ('YOUR-USER-ID-HERE', 'admin')
on conflict (user_id, role) do nothing;
```

To find your user ID:
1. Go to Authentication → Users in Supabase Dashboard
2. Find your email and copy the UUID
3. Replace 'YOUR-USER-ID-HERE' with your UUID

### Step 4: Verify the Setup

1. Check that all tables were created successfully in the Table Editor
2. Verify RLS policies are enabled on all tables
3. Test logging in with your admin account
4. Confirm you can access the admin panel

---

## Important Notes

- **Security**: Never share your Supabase credentials or admin account
- **Backup**: Always backup your database before running migrations
- **Testing**: Test thoroughly in a development environment first
- **RLS**: Row Level Security is enabled to protect user data

## Need Help?

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify all tables were created successfully
3. Ensure RLS policies are properly configured
4. Check that your user role is set to 'admin'
