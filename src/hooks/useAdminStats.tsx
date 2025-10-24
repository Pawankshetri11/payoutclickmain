import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  todayRevenue: number;
  tasksCompleted: number;
  pendingReviews: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeJobs: 0,
    totalEarnings: 0,
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
        .gt('vacancy', 0);

      // Fetch total earnings (sum of all completed earnings)
      const { data: earnings } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .eq('status', 'completed');

      const totalEarnings = earnings?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch pending withdrawals using raw query
      const { data: withdrawals } = await (supabase as any)
        .from('withdrawals')
        .select('amount')
        .eq('status', 'pending');

      const pendingWithdrawals = withdrawals?.reduce((sum: number, w: any) => sum + w.amount, 0) || 0;

      // Fetch today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayEarnings } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const todayRevenue = todayEarnings?.reduce((sum, t) => sum + t.amount, 0) || 0;

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
        totalEarnings,
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
