import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method?: string;
  payment_method?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export function useWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('withdrawals')
        .select(`
          *,
          profiles!withdrawals_user_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const normalized = (data || []).map((w: any) => ({
        ...w,
        method: w.method || w.payment_method || 'Bank Transfer',
      }));
      setWithdrawals(normalized as any);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await (supabase as any)
        .from('withdrawals')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Withdrawal ${status} successfully!`);
      await fetchWithdrawals();
    } catch (error: any) {
      console.error('Error updating withdrawal:', error);
      toast.error(error?.message || 'Failed to update withdrawal');
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return {
    withdrawals,
    loading,
    updateWithdrawalStatus,
    refetch: fetchWithdrawals,
  };
}
