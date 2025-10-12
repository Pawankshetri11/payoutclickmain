import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { addHours, addMinutes } from 'date-fns';

export interface AvailableReviewProfile {
  id: string;
  title: string;
  description?: string;
  review_text?: string;
  review_image?: string;
  business_link?: string;
  profile_lock_minutes: number;
  global_lock_minutes: number;
  status: 'available' | 'locked_by_you' | 'locked_by_others' | 'completed' | 'on_cooldown';
  locked_by?: string;
  unlocks_at?: Date;
  blockedByOwnInProgress?: boolean;
}

export function useAvailableReviewProfiles(jobId: string) {
  const { user } = useAuth();
  const { getSetting } = useSystemSettings();
  const [profiles, setProfiles] = useState<AvailableReviewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [inProgressProfile, setInProgressProfile] = useState<string | null>(null);

  const fetchAvailableProfiles = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) setLoading(true);

      // Cleanup expired locks first
      try {
        await (supabase as any).rpc('cleanup_expired_locks');
      } catch (e) {
        console.log('Cleanup function not available, skipping');
      }

      // Get job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('review_profiles')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      const reviewProfileIds = (jobData as any)?.review_profiles || [];
      if (reviewProfileIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Check for in-progress submission
      const { data: inProgressSubmission } = await (supabase as any)
        .from('user_review_submissions')
        .select('profile_id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      // Use a local variable so mapping below sees the immediate state
      const currentInProgressProfileId = inProgressSubmission?.profile_id ?? null;
      setInProgressProfile(currentInProgressProfileId);

      // Get all user's completed submissions (to hide already reviewed profiles)
      const { data: userSubmissions } = await (supabase as any)
        .from('user_review_submissions')
        .select('profile_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const completedProfileIds = userSubmissions?.map((s: any) => s.profile_id) || [];

      // Check user's global cooldown
      const { data: latestCompleted } = await (supabase as any)
        .from('user_review_submissions')
        .select('global_unlocks_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      const userGlobalCooldown = latestCompleted?.global_unlocks_at 
        ? new Date(latestCompleted.global_unlocks_at)
        : null;
      const isUserOnGlobalCooldown = userGlobalCooldown && userGlobalCooldown > new Date();
      
      if (isUserOnGlobalCooldown) {
        setLockedUntil(userGlobalCooldown);
      } else {
        setLockedUntil(null);
      }

      // Get all locks (profiles being reviewed by users)
      const { data: allLocks } = await (supabase as any)
        .from('profile_locks')
        .select('profile_id, user_id, expires_at, locked_at')
        .gt('expires_at', new Date().toISOString());

      // Fetch profile details with last_reviewed_at
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('review_profiles')
        .select('id, name, profile_url, cooldown_minutes, last_reviewed_at, global_lock_minutes')
        .in('id', reviewProfileIds)
        .eq('is_active', true);
      
      console.log('Fetched profiles data:', profilesData);

      if (profilesError) throw profilesError;

      // Map profiles with their status
      const mappedProfiles = profilesData
        ?.map((p: any) => {
          // Profile-level cooldown (affects ALL users) - using MINUTES from database
          const cooldownMinutes = p.cooldown_minutes ?? 1440; // Default 24 hours = 1440 minutes
          const profileCooldownExpiry = p.last_reviewed_at 
            ? addMinutes(new Date(p.last_reviewed_at), cooldownMinutes)
            : null;
          const isProfileOnGlobalCooldown = profileCooldownExpiry && profileCooldownExpiry > new Date();

          // User already reviewed this profile (hide permanently for this user)
          const hasUserReviewedThisProfile = completedProfileIds.includes(p.id);

          // Profile is locked by a user (during review)
          const profileLock = allLocks?.find((l: any) => l.profile_id === p.id);
          const isLockedByThisUser = profileLock && profileLock.user_id === user.id;
          const isLockedByAnotherUser = profileLock && profileLock.user_id !== user.id;
          
          // Check if user has another profile in progress
          const userHasInProgressProfile = !!currentInProgressProfileId && currentInProgressProfileId !== p.id;

          let status: AvailableReviewProfile['status'] = 'available';
          let unlocks_at: Date | undefined;
          let blockedByOwnInProgress = false;

          // PRIORITY: Ensure the in-progress profile is always continue-able
          if (currentInProgressProfileId === p.id) {
            status = 'locked_by_you';
          } else if (userHasInProgressProfile) {
            // User has a different profile in progress - block all others
            status = 'locked_by_others';
            blockedByOwnInProgress = true;
          } else if (hasUserReviewedThisProfile) {
            status = 'completed'; // User already reviewed - hide permanently
          } else if (isProfileOnGlobalCooldown) {
            status = 'on_cooldown'; // Profile cooldown affects ALL users
            unlocks_at = profileCooldownExpiry as Date;
          } else if (isUserOnGlobalCooldown) {
            status = 'locked_by_others'; // User's global cooldown blocks all profiles
            unlocks_at = userGlobalCooldown as Date;
          } else if (isLockedByAnotherUser) {
            const selectionLockMinutes = getSetting('profile_selection_lock_minutes', 30);
            const expiresAt = new Date(profileLock.expires_at);
            const lockedAt = profileLock.locked_at ? new Date(profileLock.locked_at) : null;
            const minutesLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 60000);
            const durationMinutes = lockedAt ? Math.round((expiresAt.getTime() - lockedAt.getTime()) / 60000) : null;
            const isLikelyCooldownLock = durationMinutes !== null && Math.abs(durationMinutes - cooldownMinutes) <= 1;
            if (isProfileOnGlobalCooldown || isLikelyCooldownLock || minutesLeft > selectionLockMinutes) {
              status = 'on_cooldown';
              unlocks_at = expiresAt;
            } else {
              status = 'locked_by_others';
            }
          } else if (isLockedByThisUser) {
            // Fallback: if lock table shows your lock but inProgressProfile wasn't resolved
            status = 'locked_by_you';
          }

          return {
            id: p.id,
            title: p.name,
            description: null,
            business_link: p.profile_url,
            profile_lock_minutes: cooldownMinutes,
            global_lock_minutes: p.global_lock_minutes ?? getSetting('global_review_lock_minutes', 60),
            status,
            unlocks_at,
            blockedByOwnInProgress
          };
        })
        // Filter out completed profiles (user already reviewed them)
        .filter((p: AvailableReviewProfile) => p.status !== 'completed') || [];


      setProfiles(mappedProfiles);
    } catch (error: any) {
      console.error('Error fetching available profiles:', error);
      toast.error('Failed to load review profiles');
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = async (profileId: string) => {
    if (!user) return;

    try {
      // FIRST: Check if user already has ANY profile in progress
      const { data: userInProgress } = await (supabase as any)
        .from('user_review_submissions')
        .select('profile_id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (userInProgress) {
        toast.error('You already have a review in progress. Complete or cancel it first.');
        await fetchAvailableProfiles(false);
        return;
      }

      const profile = profiles.find(p => p.id === profileId);
      if (!profile) {
        toast.error('Profile not found');
        return;
      }

      // Check if profile is available
      if (profile.status !== 'available') {
        toast.error('This profile is not available for selection');
        await fetchAvailableProfiles(false);
        return;
      }

      // Clean up any expired locks for this profile first
      await (supabase as any)
        .from('profile_locks')
        .delete()
        .eq('profile_id', profileId)
        .lt('expires_at', new Date().toISOString());

      // Double-check if someone else locked it just now
      const { data: existingLock, error: checkError } = await (supabase as any)
        .from('profile_locks')
        .select('user_id, expires_at')
        .eq('profile_id', profileId)
        .maybeSingle();

      console.log('Existing lock check:', { existingLock, checkError, profileId });

      if (existingLock) {
        const isExpired = new Date(existingLock.expires_at) <= new Date();
        if (isExpired) {
          // Delete expired lock and retry
          await (supabase as any)
            .from('profile_locks')
            .delete()
            .eq('profile_id', profileId);
        } else {
          toast.error('Another user just selected this profile');
          await fetchAvailableProfiles(false);
          return;
        }
      }

      // Lock expires when the user is expected to complete the review (short reservation window)
      const lockExpiresAt = addMinutes(new Date(), getSetting('profile_selection_lock_minutes', 30));

      // Lock this profile for all users (during review)
      const { error: lockError } = await (supabase as any)
        .from('profile_locks')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          expires_at: lockExpiresAt.toISOString(),
          locked_at: new Date().toISOString()
        });

      if (lockError) {
        console.error('Lock error details:', {
          error: lockError,
          code: lockError.code,
          message: lockError.message,
          details: lockError.details,
          hint: lockError.hint
        });
        
        // Check if it's a unique constraint violation
        if (lockError.code === '23505') {
          toast.error('This profile was just selected by another user. Please try a different profile.');
        } else {
          toast.error('Failed to lock profile: ' + (lockError.message || 'Unknown error'));
        }
        
        await fetchAvailableProfiles(false);
        return;
      }

      // Get already used review IDs for this profile
      const { data: usedReviews } = await (supabase as any)
        .from('user_review_submissions')
        .select('review_id')
        .eq('profile_id', profileId)
        .not('review_id', 'is', null);

      const usedReviewIds = usedReviews?.map((s: any) => s.review_id) || [];

      // Pick an unused review for this user
      let reviewQuery = (supabase as any)
        .from('reviews')
        .select('id')
        .eq('profile_id', profileId)
        .eq('status', 'active');

      // Exclude already used reviews
      if (usedReviewIds.length > 0) {
        reviewQuery = reviewQuery.not('id', 'in', `(${usedReviewIds.join(',')})`);
      }

      const { data: pickedReview } = await reviewQuery
        .limit(1)
        .maybeSingle();

      // Create user submission record with in_progress status and persisted review_id
      const { error: submissionError } = await (supabase as any)
        .from('user_review_submissions')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          review_id: pickedReview?.id || null,
          status: 'in_progress',
          global_unlocks_at: null  // Will be set on completion
        });

      if (submissionError) {
        console.error('Submission error details:', {
          error: submissionError,
          code: submissionError.code,
          message: submissionError.message,
          details: submissionError.details
        });
        
        // Rollback the lock
        await (supabase as any)
          .from('profile_locks')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profileId);
        
        toast.error('Failed to start review: ' + (submissionError.message || 'Unknown error'));
        return;
      }

      setInProgressProfile(profileId);
      toast.success('Profile locked! Complete your review.');
      await fetchAvailableProfiles(false);
      return profile;
    } catch (error: any) {
      console.error('Error selecting profile:', error);
      toast.error('Failed to select profile');
      throw error;
    }
  };

  const completeReview = async (profileId: string, taskId: string) => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      const profile = profiles.find(p => p.id === profileId);
      
      // Calculate global cooldown expiry time (starts NOW after submission)
      // Prefer per-profile setting; then in-memory setting; finally 60
      let globalMinutes: number | undefined = Number((profile as any)?.global_lock_minutes);
      if (!Number.isFinite(globalMinutes)) {
        const inMemory = Number(getSetting('global_review_lock_minutes', NaN));
        if (Number.isFinite(inMemory)) globalMinutes = inMemory;
      }
      if (!Number.isFinite(globalMinutes)) {
        const profileCooldown = Number((profile as any)?.profile_lock_minutes);
        if (Number.isFinite(profileCooldown)) globalMinutes = profileCooldown;
      }
      if (!Number.isFinite(globalMinutes)) {
        globalMinutes = 60;
      }
      const minutesSafe = Math.max(1, Math.floor(globalMinutes as number));
      const globalUnlocksAt = addMinutes(new Date(), minutesSafe);

      // Update user_review_submissions to completed status with global cooldown
      await (supabase as any)
        .from('user_review_submissions')
        .update({
          status: 'completed',
          task_id: taskId,
          completed_at: now,
          global_unlocks_at: globalUnlocksAt.toISOString()  // Start global cooldown NOW
        })
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      // Log completion in completed_reviews (drives usage tracking + admin visibility)
      await (supabase as any)
        .from('completed_reviews')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          task_id: taskId
        });

      // Update profile's last_reviewed_at to start profile cooldown for ALL users
      const { error: profileCooldownError } = await (supabase as any)
        .from('review_profiles')
        .update({ 
          last_reviewed_at: now,
          updated_at: now
        })
        .eq('id', profileId);

      // Convert reservation lock into a cooldown lock visible to everyone by extending expiry
      // We don't have UPDATE policy on profile_locks, so perform delete + insert with new expiry
      await (supabase as any)
        .from('profile_locks')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      const cooldownMinutes = profile?.profile_lock_minutes || 1440; // Default 1440 minutes (24 hours)
      const cooldownUnlocksAt = addMinutes(new Date(), cooldownMinutes);

      const { error: cooldownLockError } = await (supabase as any)
        .from('profile_locks')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          expires_at: cooldownUnlocksAt.toISOString(),
          locked_at: now
        });

      if (profileCooldownError) {
        console.warn('Failed to set last_reviewed_at; relying on cooldown lock only:', profileCooldownError);
      }
      if (cooldownLockError) {
        console.warn('Failed to create cooldown lock; cooldown may rely only on last_reviewed_at:', cooldownLockError);
      }

      toast.success('Review completed successfully!');
      fetchAvailableProfiles();
    } catch (error: any) {
      console.error('Error completing review:', error);
      toast.error('Failed to complete review');
      throw error;
    }
  };

  const cancelSelection = async (profileId: string) => {
    if (!user) return;

    try {
      // Remove profile lock
      await (supabase as any)
        .from('profile_locks')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      // Delete in_progress submission
      await (supabase as any)
        .from('user_review_submissions')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .eq('status', 'in_progress');

      toast.success('Selection cancelled');
      fetchAvailableProfiles();
    } catch (error: any) {
      console.error('Error cancelling selection:', error);
      toast.error('Failed to cancel selection');
      throw error;
    }
  };

  useEffect(() => {
    if (!user || !jobId) return;

    fetchAvailableProfiles();
    
    // Set up real-time subscription for profile locks
    const channel = supabase
      .channel('profile-locks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_locks'
        },
        () => {
          // Refresh profiles when any lock changes
          fetchAvailableProfiles(false);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_review_submissions'
        },
        () => {
          // Refresh when submissions change
          fetchAvailableProfiles(false);
        }
      )
      .subscribe();
    
    // Refresh profiles every 30 seconds to update timers
    const interval = setInterval(() => fetchAvailableProfiles(false), 30000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, jobId]);

  return {
    profiles,
    loading,
    lockedUntil,
    inProgressProfile,
    selectProfile,
    completeReview,
    cancelSelection,
    refetch: fetchAvailableProfiles
  };
}
