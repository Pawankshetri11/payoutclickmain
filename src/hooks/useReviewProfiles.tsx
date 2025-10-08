import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReviewProfile {
  id: string;
  name: string;
  profile_url: string;
  category_id?: string;
  cooldown_hours: number;
  is_active: boolean;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export function useReviewProfiles() {
  const [profiles, setProfiles] = useState<ReviewProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('review_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching review profiles:', error);
      toast.error('Failed to load review profiles');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profile: Omit<ReviewProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('review_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      toast.success('Review profile created successfully!');
      fetchProfiles();
      return data;
    } catch (error: any) {
      console.error('Error creating review profile:', error);
      toast.error('Failed to create review profile');
      throw error;
    }
  };

  const updateProfile = async (id: string, updates: Partial<ReviewProfile>) => {
    try {
      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Review profile updated successfully!');
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating review profile:', error);
      toast.error('Failed to update review profile');
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('review_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review profile deleted successfully!');
      fetchProfiles();
    } catch (error: any) {
      console.error('Error deleting review profile:', error);
      toast.error('Failed to delete review profile');
      throw error;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: fetchProfiles
  };
}
