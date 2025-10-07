import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  profile_id: string;
  type: 'image_text' | 'text_only';
  review_text?: string;
  review_image?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useReviews(profileId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      let query = (supabase as any).from('reviews').select('*');
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      // Use secure edge function to bypass RLS with admin verification
      const { data, error } = await (supabase as any).functions.invoke('admin-create-review', {
        body: review,
      });

      if (error || (data && data.error)) throw (error || new Error(data.error));
      toast.success('Review created successfully!');
      fetchReviews();
      return data?.review || data;
    } catch (error: any) {
      console.error('Error creating review:', error);
      toast.error('Failed to create review');
      throw error;
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { error } = await (supabase as any)
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Review updated successfully!');
      fetchReviews();
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [profileId]);

  return {
    reviews,
    loading,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews
  };
}
