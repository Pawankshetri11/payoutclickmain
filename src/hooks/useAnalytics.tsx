import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserTaskEarning {
  userId: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  taskCount: number;
  totalEarned: number;
}

interface UserEarningsBreakdown {
  userId: string;
  userName: string;
  userEmail: string;
  totalEarnings: number;
  taskBreakdown: Array<{
    jobTitle: string;
    taskCount: number;
    earned: number;
  }>;
}

interface TaskEarningsBreakdown {
  jobId: string;
  jobTitle: string;
  totalEarnings: number;
  totalTasks: number;
  userBreakdown: Array<{
    userName: string;
    userEmail: string;
    taskCount: number;
    earned: number;
  }>;
}

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
  const [userEarnings, setUserEarnings] = useState<UserEarningsBreakdown[]>([]);
  const [taskEarnings, setTaskEarnings] = useState<TaskEarningsBreakdown[]>([]);
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

      // Fetch detailed user-task earnings - fetch separately to avoid FK issues
      const { data: detailedTasks, error: detailedError } = await supabase
        .from('tasks')
        .select('user_id, job_id, amount, status')
        .eq('status', 'approved');

      if (detailedError) {
        console.error('Error fetching detailed tasks:', detailedError);
        throw detailedError;
      }

      console.log('Detailed tasks fetched:', detailedTasks?.length || 0);

      // Fetch all profiles - use user_id instead of id to match tasks
      const { data: allProfiles, error: profilesError2 } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (profilesError2) {
        console.error('Error fetching profiles:', profilesError2);
        throw profilesError2;
      }

      console.log('Profiles fetched:', allProfiles?.length || 0);

      // Fetch all jobs
      const { data: allJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title');

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        throw jobsError;
      }

      console.log('Jobs fetched:', allJobs?.length || 0);

      // Create lookup maps - use user_id as the key
      const profileMap = new Map(allProfiles?.map(p => [p.user_id, p]) || []);
      const jobMap = new Map(allJobs?.map(j => [j.id, j]) || []);

      console.log('Processing tasks...');

      // Group by users
      const userMap = new Map<string, UserEarningsBreakdown>();
      detailedTasks?.forEach((task: any) => {
        const userId = task.user_id;
        const profile = profileMap.get(userId);
        const job = jobMap.get(task.job_id);
        
        if (!profile) {
          console.warn(`Profile not found for user_id: ${userId}`);
          return;
        }
        
        const userName = profile.name || 'Unknown User';
        const userEmail = profile.email || 'No email';
        const jobTitle = job?.title || 'Unknown Job';
        const amount = task.amount || 0;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            userName,
            userEmail,
            totalEarnings: 0,
            taskBreakdown: []
          });
        }

        const user = userMap.get(userId)!;
        user.totalEarnings += amount;

        const existingTask = user.taskBreakdown.find(t => t.jobTitle === jobTitle);
        if (existingTask) {
          existingTask.taskCount++;
          existingTask.earned += amount;
        } else {
          user.taskBreakdown.push({
            jobTitle,
            taskCount: 1,
            earned: amount
          });
        }
      });

      console.log('Users processed:', userMap.size);

      // Group by tasks/jobs
      const taskMap = new Map<string, TaskEarningsBreakdown>();
      detailedTasks?.forEach((task: any) => {
        const jobId = task.job_id;
        const profile = profileMap.get(task.user_id);
        const job = jobMap.get(jobId);
        
        if (!profile) {
          console.warn(`Profile not found for user_id: ${task.user_id}`);
          return;
        }
        
        const jobTitle = job?.title || 'Unknown Job';
        const userName = profile.name || 'Unknown User';
        const userEmail = profile.email || 'No email';
        const amount = task.amount || 0;

        if (!taskMap.has(jobId)) {
          taskMap.set(jobId, {
            jobId,
            jobTitle,
            totalEarnings: 0,
            totalTasks: 0,
            userBreakdown: []
          });
        }

        const taskData = taskMap.get(jobId)!;
        taskData.totalEarnings += amount;
        taskData.totalTasks++;

        const existingUser = taskData.userBreakdown.find(u => u.userEmail === userEmail);
        if (existingUser) {
          existingUser.taskCount++;
          existingUser.earned += amount;
        } else {
          taskData.userBreakdown.push({
            userName,
            userEmail,
            taskCount: 1,
            earned: amount
          });
        }
      });

      console.log('Tasks processed:', taskMap.size);

      const userEarningsArray = Array.from(userMap.values()).sort((a, b) => b.totalEarnings - a.totalEarnings);
      const taskEarningsArray = Array.from(taskMap.values()).sort((a, b) => b.totalEarnings - a.totalEarnings);

      console.log('Final user earnings:', userEarningsArray.length);
      console.log('Final task earnings:', taskEarningsArray.length);

      setUserEarnings(userEarningsArray);
      setTaskEarnings(taskEarningsArray);

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
    userEarnings,
    taskEarnings,
    loading,
    refetch: fetchAnalytics
  };
}