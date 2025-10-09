# Review System Migration Guide

## Overview
This guide explains the new review system implementation with profile locking, timers, and bulk upload features.

## What Changed

### 1. Database Schema Updates
- **New Table: `user_review_submissions`** - Tracks which users reviewed which profiles and their timers
- **New Table: `profile_locks`** - Real-time locking mechanism to prevent multiple users from working on same profile
- **Updated `jobs` table** - Added `review_profiles` column (UUID array) to link jobs with profiles
- **Fixed RLS policies** - Resolved permission issues for reviews and storage buckets

### 2. Timer System
- **Profile Lock Timer**: When a user selects a profile, it's locked for all users for X hours (configurable per profile)
- **Global Lock Timer**: After selecting a profile, user can't see other profiles for X minutes (configurable per profile)
- **One-time Reviews**: Each user can only review a profile once

### 3. Admin Features
- **Bulk Upload**: Admin can upload multiple text-only reviews at once (one per line)
- **Review Management**: Admin can edit and delete reviews
- **Profile Selection**: When creating review-type jobs, admin selects which profiles to include

### 4. User Flow
1. User opens a review-type job
2. Sees list of available profiles (excluding completed ones and locked ones)
3. Selects a profile → Profile locks for all users, other profiles lock for this user
4. User reviews the business and uploads proof image
5. Submits task → Profile lock releases, timers activate

## Migration Steps

### Step 1: Run SQL Migration
Execute the `FIX_REVIEW_SYSTEM_COMPLETE.sql` file in your Supabase SQL editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `FIX_REVIEW_SYSTEM_COMPLETE.sql`
4. Run the query
5. Verify all tables and policies were created successfully

### Step 2: Verify Changes
Check these in Supabase:

**Tables Created:**
- `user_review_submissions`
- `profile_locks`

**Functions Created:**
- `cleanup_expired_locks()`
- `is_profile_available_for_user()`

**RLS Policies Fixed:**
- Reviews table policies (insert, update, delete for admins)
- Storage bucket policies (task-submissions)

### Step 3: Update Existing Jobs (if any)
If you have existing review-type jobs, you'll need to add the `review_profiles` array:

```sql
UPDATE jobs 
SET review_profiles = ARRAY['profile-id-1', 'profile-id-2']::UUID[]
WHERE type = 'review' 
AND id = 'your-job-id';
```

## Testing Checklist

### Admin Tests
- [ ] Create a review profile
- [ ] Add reviews to the profile (single and bulk upload)
- [ ] Edit a review
- [ ] Delete a review
- [ ] Create a review-type job and select profiles
- [ ] Edit a job and change selected profiles

### User Tests
- [ ] View available review profiles in a job
- [ ] Select a profile (should lock it)
- [ ] Try accessing other profiles (should be locked due to global timer)
- [ ] Complete review and submit proof image
- [ ] Verify you can't review the same profile again
- [ ] Wait for global timer to expire and access other profiles

## Troubleshooting

### "new row violates row-level security policy" errors
- Make sure you ran the SQL migration completely
- Verify your admin account has email ending with `@admin.com`
- Check that RLS policies were created correctly

### Profile not locking
- Verify `profile_locks` table exists
- Check that `expires_at` column has future timestamps
- Make sure the profile locking logic in `useAvailableReviewProfiles` hook is working

### Reviews not showing
- Verify reviews have `status = 'active'`
- Check that the profile has reviews linked to it
- Make sure `review_profiles.is_active = true`

## Key Features

### Bulk Upload
- Navigate to Review Profiles → Select Profile → Manage Reviews
- Click "Bulk Upload"
- Enter review texts (one per line)
- All reviews are created as text-only type

### Timer Configuration
- **profile_lock_hours**: How long the profile stays locked after selection
- **global_lock_minutes**: How long other profiles stay hidden after user selects one

### Profile Locking Logic
```
User A selects Profile X:
1. Profile X is locked for ALL users for profile_lock_hours
2. ALL other profiles are hidden from User A for global_lock_minutes
3. User A must complete review within timer period
4. After completion, User A can never review Profile X again
5. Other users can review Profile X after profile_lock_hours expires
```

## Database Schema Reference

### user_review_submissions
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- profile_id: UUID (FK to review_profiles)
- task_id: UUID (FK to tasks)
- review_id: UUID (FK to reviews)
- status: TEXT ('in_progress' | 'completed')
- proof_image: TEXT
- profile_unlocks_at: TIMESTAMP
- global_unlocks_at: TIMESTAMP
- created_at: TIMESTAMP
- completed_at: TIMESTAMP
- UNIQUE(user_id, profile_id)
```

### profile_locks
```sql
- id: UUID (PK)
- profile_id: UUID (FK to review_profiles)
- user_id: UUID (FK to auth.users)
- locked_at: TIMESTAMP
- expires_at: TIMESTAMP
- UNIQUE(profile_id, user_id)
```

## Support

If you encounter any issues:
1. Check console logs for detailed error messages
2. Verify all SQL migrations ran successfully
3. Ensure your admin account has the correct email format
4. Check that all required tables and policies exist
