import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [profiles, setProfiles] = useState<AvailableReviewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const fetchAvailableProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

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
      const { data: globalLocks, error: globalLockError } = await (supabase as any)
        .from('profile_locks')
        .select('locked_until')
        .eq('user_id', user.id)
        .gt('locked_until', new Date().toISOString())
        .order('locked_until', { ascending: false })
        .limit(1);

      if (globalLockError) throw globalLockError;

      if (globalLocks && globalLocks.length > 0) {
        setLockedUntil(new Date(globalLocks[0].locked_until));
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Get profiles that user hasn't completed
      const { data: completedReviews, error: completedError } = await (supabase as any)
        .from('completed_reviews')
        .select('profile_id')
        .eq('user_id', user.id);

      if (completedError) throw completedError;

      const completedProfileIds = completedReviews?.map((r: any) => r.profile_id) || [];

      // Get profiles that are not locked by other users
      const { data: lockedProfiles, error: lockedError } = await (supabase as any)
        .from('profile_locks')
        .select('profile_id')
        .neq('user_id', user.id)
        .gt('locked_until', new Date().toISOString());

      if (lockedError) throw lockedError;

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
        .select('*')
        .in('id', availableProfileIds)
        .eq('status', 'active');

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);
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

      // Create profile-specific lock
      const profileLockTime = new Date();
      profileLockTime.setHours(profileLockTime.getHours() + profile.profile_lock_hours);

      await (supabase as any)
        .from('profile_locks')
        .upsert({
          user_id: user.id,
          profile_id: profileId,
          locked_until: profileLockTime.toISOString()
        });

      // Create global lock for other profiles
      const globalLockTime = new Date();
      globalLockTime.setMinutes(globalLockTime.getMinutes() + profile.global_lock_minutes);

      // Lock all other profiles for this user
      const otherProfiles = profiles.filter(p => p.id !== profileId);
      if (otherProfiles.length > 0) {
        await Promise.all(
          otherProfiles.map(p =>
            (supabase as any).from('profile_locks').upsert({
              user_id: user.id,
              profile_id: p.id,
              locked_until: globalLockTime.toISOString()
            })
          )
        );
      }

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
      await (supabase as any).from('completed_reviews').insert({
        user_id: user.id,
        profile_id: profileId,
        task_id: taskId
      });

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
