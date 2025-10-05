import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  user_name: string;
  amount: number;
  status: string;
  created_at: string;
  method: string;
}

export function useAdminReports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      // Fetch withdrawals
      const { data: withdrawals, error } = await (supabase as any)
        .from('withdrawals')
        .select(`
          id,
          amount,
          status,
          created_at,
          payment_method,
          profiles!withdrawals_user_id_fkey (name)
        `)
        .order('created_at', { ascending: false})
        .limit(50);

      if (error) throw error;

      const formattedTransactions = (withdrawals || []).map((w: any) => ({
        id: w.id,
        type: 'Withdrawal',
        user_name: w.profiles?.name || 'Unknown',
        amount: w.amount,
        status: w.status,
        created_at: w.created_at,
        method: w.payment_method || 'Bank Transfer'
      }));

      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    refetch: fetchTransactions
  };
}