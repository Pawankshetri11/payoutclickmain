import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export interface AvailableReviewProfile {
  id: string;
  title: string;
  description?: string;
  review_text?: string;
  review_image?: string;
  business_link?: string;
  profile_lock_hours: number;
  global_lock_minutes: number;
}

export function useAvailableReviewProfiles(jobId: string) {
  const { user } = useAuth();
  const { getSetting } = useSystemSettings();
  const [profiles, setProfiles] = useState<AvailableReviewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const fetchAvailableProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Cleanup expired locks first (optional, ignore errors)
      try {
        await (supabase as any).rpc('cleanup_expired_locks');
      } catch (e) {
        // Ignore cleanup errors
      }

      // Get job details to know which profiles to show
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

      // Check if user has any active global lock
      const { data: userSubmissions, error: submissionError } = await (supabase as any)
        .from('user_review_submissions')
        .select('global_unlocks_at')
        .eq('user_id', user.id)
        .gt('global_unlocks_at', new Date().toISOString())
        .order('global_unlocks_at', { ascending: false })
        .limit(1);

      if (submissionError && submissionError.code !== 'PGRST116') throw submissionError;

      if (userSubmissions && userSubmissions.length > 0) {
        setLockedUntil(new Date(userSubmissions[0].global_unlocks_at));
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Get profiles that user has already completed
      const { data: completedSubmissions, error: completedError } = await (supabase as any)
        .from('user_review_submissions')
        .select('profile_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (completedError && completedError.code !== 'PGRST116') throw completedError;

      const completedProfileIds = completedSubmissions?.map((r: any) => r.profile_id) || [];

      // Get profiles that are currently locked by other users
      const { data: lockedProfiles, error: lockedError } = await (supabase as any)
        .from('profile_locks')
        .select('profile_id')
        .neq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (lockedError && lockedError.code !== 'PGRST116') throw lockedError;

      const lockedProfileIds = lockedProfiles?.map((l: any) => l.profile_id) || [];

      // Filter available profiles
      const availableProfileIds = reviewProfileIds.filter(
        (id: string) => !completedProfileIds.includes(id) && !lockedProfileIds.includes(id)
      );

      if (availableProfileIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Fetch profile details
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('review_profiles')
        .select('id, name, profile_url, cooldown_hours')
        .in('id', availableProfileIds)
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Map to expected format
      const mappedProfiles = profilesData?.map((p: any) => ({
        id: p.id,
        title: p.name,
        description: null,
        business_link: p.profile_url,
        profile_lock_hours: p.cooldown_hours ?? 24,
        global_lock_minutes: getSetting('global_review_lock_minutes', 60)
      })) || [];

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

      // Create profile lock that expires after profile_lock_hours
      const profileExpiresAt = new Date();
      profileExpiresAt.setHours(profileExpiresAt.getHours() + profile.profile_lock_hours);

      // Lock this profile for all users
      await (supabase as any)
        .from('profile_locks')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          expires_at: profileExpiresAt.toISOString()
        });

      // Create user submission record with in_progress status and timers
      const globalUnlocksAt = new Date();
      globalUnlocksAt.setMinutes(globalUnlocksAt.getMinutes() + profile.global_lock_minutes);

      const profileUnlocksAt = new Date();
      profileUnlocksAt.setHours(profileUnlocksAt.getHours() + profile.profile_lock_hours);

      await (supabase as any)
        .from('user_review_submissions')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          status: 'in_progress',
          global_unlocks_at: globalUnlocksAt.toISOString(),
          profile_unlocks_at: profileUnlocksAt.toISOString()
        });

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
      // Update user_review_submissions to completed status
      await (supabase as any)
        .from('user_review_submissions')
        .update({
          status: 'completed',
          task_id: taskId,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      // Remove the profile lock (allow others to access after timer expires)
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

  useEffect(() => {
    fetchAvailableProfiles();
  }, [user, jobId]);

  return {
    profiles,
    loading,
    lockedUntil,
    selectProfile,
    completeReview,
    refetch: fetchAvailableProfiles
  };
}
