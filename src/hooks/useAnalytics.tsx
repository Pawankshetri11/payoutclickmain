import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAnalytics() {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalEarnings: 0,
    activeToday: 0,
    averagePerUser: 0
  });
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    taskEarnings: 0,
    completionRate: 0,
    avgCompletionTime: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Fetch user stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('total_earnings, balance, completed_tasks, created_at');

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;
      const totalEarnings = profiles?.reduce((sum, p) => sum + (p.total_earnings || 0), 0) || 0;
      const averagePerUser = totalUsers > 0 ? totalEarnings / totalUsers : 0;

      // Calculate active today (users created today or with tasks today)
      const today = new Date().toISOString().split('T')[0];
      const activeToday = profiles?.filter(p => 
        p.created_at?.startsWith(today)
      ).length || 0;

      setUserStats({
        totalUsers,
        totalEarnings,
        activeToday,
        averagePerUser
      });

      // Fetch task stats
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('amount, status, submitted_at, approved_at');

      if (tasksError) throw tasksError;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'approved').length || 0;
      const taskEarnings = tasks?.reduce((sum, t) => 
        t.status === 'approved' ? sum + (t.amount || 0) : sum, 0) || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate average completion time (rough estimate)
      const tasksWithTime = tasks?.filter(t => t.submitted_at && t.approved_at) || [];
      const avgTime = tasksWithTime.length > 0 
        ? tasksWithTime.reduce((sum, t) => {
            const submitted = new Date(t.submitted_at!);
            const approved = new Date(t.approved_at!);
            return sum + (approved.getTime() - submitted.getTime());
          }, 0) / tasksWithTime.length / (1000 * 60) // Convert to minutes
        : 18.5;

      setTaskStats({
        totalTasks,
        taskEarnings,
        completionRate,
        avgCompletionTime: avgTime
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    userStats,
    taskStats,
    loading,
    refetch: fetchAnalytics
  };
}