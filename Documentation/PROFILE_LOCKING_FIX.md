# Profile Locking System - Fix Documentation

## Issues Fixed

### 1. Multiple Users Selecting Same Profile
**Problem**: Two users could select the same profile simultaneously.

**Solution**:
- Added double-check in `selectProfile()` to verify no existing lock before creating one
- Added unique constraint on `profile_locks.profile_id` in database
- Implemented real-time synchronization so all users see locks instantly

### 2. Back Button Not Releasing Lock
**Problem**: When user clicked "Back to Profiles", the lock remained active and all profiles showed as available.

**Solution**:
- Updated `handleCancelReview()` to call `cancelSelection()` which properly deletes locks
- Clears all local state (selectedProfile, selectedReview, proofImage)
- Refreshes profile list after cancellation

### 3. Auto-Selection for Other Users
**Problem**: When User A selected a profile, User B would see it auto-selected.

**Solution**:
- Fixed auto-restore logic to only restore if `profile.status === 'locked_by_you'`
- This ensures only the actual user who locked the profile sees it in-progress

## Real-Time Synchronization

Added Supabase real-time subscriptions for:
- `profile_locks` table - All users see when profiles are locked/unlocked
- `user_review_submissions` table - Updates when reviews are started/completed

```typescript
const channel = supabase
  .channel('profile-locks-changes')
  .on('postgres_changes', { event: '*', table: 'profile_locks' }, () => {
    fetchAvailableProfiles(false);
  })
  .on('postgres_changes', { event: '*', table: 'user_review_submissions' }, () => {
    fetchAvailableProfiles(false);
  })
  .subscribe();
```

## Database Changes Required

Run `FIX_PROFILE_LOCKS_SCHEMA.sql` to:
1. Add `locked_at` column to track when lock was created
2. Add unique constraint on `profile_id` (only one lock per profile)
3. Add indexes for faster queries
4. Update RLS policies to allow viewing all locks (needed for real-time updates)
5. Add helper function `is_profile_locked()` for easy checking

## User Flow (Fixed)

### Scenario 1: User A Selects Profile
1. User A clicks profile → `selectProfile()` checks for existing locks
2. If available → creates lock in `profile_locks` and `in_progress` submission
3. Real-time event broadcasts to all users
4. User B's screen refreshes → sees profile as "locked_by_others"
5. User A sees profile as "locked_by_you" and can continue

### Scenario 2: User Goes Back
1. User A clicks "Back to Profiles" → `cancelSelection()` called
2. Deletes from `profile_locks` and `user_review_submissions`
3. Real-time event broadcasts → all users see profile as "available" again
4. User A returns to profile selection with fresh state

### Scenario 3: Simultaneous Selection
1. User A and User B click same profile at exact same time
2. First request creates lock successfully
3. Second request's `selectProfile()` double-checks and finds existing lock
4. Second user gets error: "Another user just selected this profile"
5. Both users' screens refresh to show current state

## Testing Checklist

- [ ] User A selects profile → User B sees it as locked (real-time)
- [ ] User A clicks back → Lock is released and User B sees it available
- [ ] User A has in-progress profile → Only User A sees it auto-restored
- [ ] Two users select same profile simultaneously → Only one succeeds
- [ ] User A completes review → Profile enters cooldown for all users
- [ ] User on global cooldown → Cannot select any profiles

## Error Messages

- **"Another user just selected this profile"** - Someone else locked it first
- **"You already have a review in progress"** - Complete or cancel your current review
- **"This profile is not available for selection"** - Locked or on cooldown
- **"Failed to lock profile. Another user may have selected it."** - Race condition detected
