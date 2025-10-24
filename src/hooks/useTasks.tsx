import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Task {
  id: string;
  job_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  submitted_code?: string;
  submitted_image?: string;
  admin_notes?: string;
  submitted_at: string;
  approved_at?: string;
  created_at: string;
  jobs?: {
    title: string;
    type: 'code' | 'image' | 'review';
    category: string;
  };
  review_profile?: {
    name: string;
    profile_url?: string;
  };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          jobs (
            title,
            type,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const taskIds = (data || []).map((t: any) => t.id);

      // Map completed review -> profile for these tasks
      let tasksWithProfiles = data || [];
      if (taskIds.length > 0) {
        const { data: crData } = await (supabase as any)
          .from('completed_reviews')
          .select('task_id, profile_id')
          .in('task_id', taskIds);

        const profileIds = Array.from(new Set((crData || []).map((r: any) => r.profile_id)));
        let profilesMap = new Map<string, any>();
        if (profileIds.length > 0) {
          const { data: rpData } = await (supabase as any)
            .from('review_profiles')
            .select('id, name, profile_url')
            .in('id', profileIds);
          profilesMap = new Map((rpData || []).map((p: any) => [p.id, p]));
        }

        const crByTask = new Map<string, any>();
        (crData || []).forEach((r: any) => crByTask.set(r.task_id, r));

        tasksWithProfiles = (data || []).map((t: any) => {
          const cr = crByTask.get(t.id);
          const rp = cr ? profilesMap.get(cr.profile_id) : null;
          return {
            ...t,
            review_profile: rp ? { name: rp.name, profile_url: rp.profile_url } : undefined,
          };
        });
      }

      setTasks(tasksWithProfiles as any);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (jobId: string, amount: number, submissionData: { code?: string; image?: string; proof_image?: string }) => {
    if (!user) return;

    try {
      // Check user's submission count for this job
      const { data: userSubmissions, error: countError } = await supabase
        .from('tasks')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id);

      if (countError) throw countError;

      // Check job's submission limit
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      const submissionLimit = (jobData as any).submission_limit_per_user || 1;
      const currentSubmissions = (userSubmissions || []).length;

      if (currentSubmissions >= submissionLimit) {
        toast.error(`You have reached the submission limit (${submissionLimit}) for this job!`);
        throw new Error('Submission limit reached');
      }

      if (jobData.completed >= jobData.vacancy) {
        toast.error('This job is already full!');
        throw new Error('Job vacancy exceeded');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          job_id: jobId,
          user_id: user.id,
          amount,
          submitted_code: submissionData.code,
          submitted_image: submissionData.image || submissionData.proof_image,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update job completion count
      await (supabase as any).rpc('increment_job_completed', { job_id: jobId });

      toast.success('Task submitted successfully!');
      fetchTasks();
      return data;
    } catch (error: any) {
      console.error('Error submitting task:', error);
      if (!error.message.includes('Submission limit') && !error.message.includes('already full')) {
        toast.error('Failed to submit task');
      }
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    submitTask,
    refetch: fetchTasks
  };
}