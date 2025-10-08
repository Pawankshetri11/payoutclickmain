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
  profile_lock_hours: number;
  global_lock_minutes: number;
  status: 'available' | 'locked_by_you' | 'locked_by_others' | 'completed' | 'on_cooldown';
  locked_by?: string;
  unlocks_at?: Date;
}

export function useAvailableReviewProfiles(jobId: string) {
  const { user } = useAuth();
  const { getSetting } = useSystemSettings();
  const [profiles, setProfiles] = useState<AvailableReviewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [inProgressProfile, setInProgressProfile] = useState<string | null>(null);

  const fetchAvailableProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

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

      if (inProgressSubmission) {
        setInProgressProfile(inProgressSubmission.profile_id);
      } else {
        setInProgressProfile(null);
      }

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
        .select('profile_id, user_id, expires_at')
        .gt('expires_at', new Date().toISOString());

      // Fetch profile details with last_reviewed_at
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('review_profiles')
        .select('id, name, profile_url, cooldown_hours, last_reviewed_at')
        .in('id', reviewProfileIds)
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Map profiles with their status
      const mappedProfiles = profilesData
        ?.map((p: any) => {
          // Profile-level cooldown (affects ALL users)
          const profileCooldownExpiry = p.last_reviewed_at 
            ? addHours(new Date(p.last_reviewed_at), p.cooldown_hours ?? 24)
            : null;
          const isProfileOnGlobalCooldown = profileCooldownExpiry && profileCooldownExpiry > new Date();

          // User already reviewed this profile (hide permanently for this user)
          const hasUserReviewedThisProfile = completedProfileIds.includes(p.id);

          // Profile is locked by a user (during review)
          const profileLock = allLocks?.find((l: any) => l.profile_id === p.id);
          const isLockedByThisUser = profileLock && profileLock.user_id === user.id;
          const isLockedByAnotherUser = profileLock && profileLock.user_id !== user.id;
          
          // Check if user has another profile in progress
          const userHasInProgressProfile = inProgressProfile && inProgressProfile !== p.id;

          let status: AvailableReviewProfile['status'] = 'available';
          let unlocks_at: Date | undefined;

          // Priority order for status
          if (isLockedByThisUser) {
            status = 'locked_by_you'; // User is currently reviewing this
          } else if (userHasInProgressProfile) {
            status = 'locked_by_others'; // User has another profile in progress - block this one
          } else if (hasUserReviewedThisProfile) {
            status = 'completed'; // User already reviewed - hide permanently
          } else if (isProfileOnGlobalCooldown) {
            status = 'on_cooldown'; // Profile cooldown affects ALL users
            unlocks_at = profileCooldownExpiry;
          } else if (isUserOnGlobalCooldown) {
            status = 'locked_by_others'; // User's global cooldown blocks all profiles
            unlocks_at = userGlobalCooldown;
          } else if (isLockedByAnotherUser) {
            status = 'locked_by_others'; // Another user is reviewing this
            unlocks_at = new Date(profileLock.expires_at);
          }

          return {
            id: p.id,
            title: p.name,
            description: null,
            business_link: p.profile_url,
            profile_lock_hours: p.cooldown_hours ?? 24,
            global_lock_minutes: getSetting('global_review_lock_minutes', 60),
            status,
            unlocks_at
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
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      // Lock expires when the user is expected to complete (generous time)
      const lockExpiresAt = addHours(new Date(), profile.profile_lock_hours);

      // Lock this profile for all users (during review)
      await (supabase as any)
        .from('profile_locks')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          expires_at: lockExpiresAt.toISOString()
        });

      // Create user submission record with in_progress status
      // Global cooldown timer will be set when review is SUBMITTED, not now
      await (supabase as any)
        .from('user_review_submissions')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          status: 'in_progress',
          global_unlocks_at: null  // Will be set on completion
        });

      fetchAvailableProfiles();
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
      const globalUnlocksAt = addMinutes(new Date(), profile?.global_lock_minutes || 60);

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

      // Update profile's last_reviewed_at to start profile cooldown for ALL users
      await (supabase as any)
        .from('review_profiles')
        .update({ 
          last_reviewed_at: now,
          updated_at: now
        })
        .eq('id', profileId);

      // Remove the profile lock (profile now enters cooldown)
      await (supabase as any)
        .from('profile_locks')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

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
    fetchAvailableProfiles();
    
    // Refresh profiles every 30 seconds to update timers
    const interval = setInterval(fetchAvailableProfiles, 30000);
    return () => clearInterval(interval);
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
