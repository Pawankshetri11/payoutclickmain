import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
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
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: status === 'approved' ? 'completed' : 'failed' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Withdrawal ${status} successfully!`);
      await fetchWithdrawals();
    } catch (error: any) {
      console.error('Error updating withdrawal:', error);
      toast.error('Failed to update withdrawal');
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
