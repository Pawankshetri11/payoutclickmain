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
    type: 'code' | 'image';
    category: string;
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
      setTasks(data || []);
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
      toast.error('Failed to submit task');
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