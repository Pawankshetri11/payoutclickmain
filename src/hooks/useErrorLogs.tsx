import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace: string | null;
  user_id: string | null;
  user_email: string | null;
  page_url: string | null;
  severity: string;
  created_at: string;
}

export function useErrorLogs() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching error logs:', error);
      toast.error('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('error-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'error_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { logs, loading, refetch: fetchLogs };
}
