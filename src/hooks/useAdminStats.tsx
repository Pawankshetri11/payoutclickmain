import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalDeposits: number;
  pendingWithdrawals: number;
  todayRevenue: number;
  tasksCompleted: number;
  pendingReviews: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeJobs: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    todayRevenue: 0,
    tasksCompleted: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active jobs
      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total deposits (sum of all completed transactions)
      const { data: deposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .eq('status', 'completed');

      const totalDeposits = deposits?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch pending withdrawals
      const { data: withdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'pending');

      const pendingWithdrawals = withdrawals?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const todayRevenue = todayTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch tasks completed (approved status)
      const { count: tasksCompleted } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch pending reviews
      const { count: pendingReviews } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: totalUsers || 0,
        activeJobs: activeJobs || 0,
        totalDeposits,
        pendingWithdrawals,
        todayRevenue,
        tasksCompleted: tasksCompleted || 0,
        pendingReviews: pendingReviews || 0,
      });
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
