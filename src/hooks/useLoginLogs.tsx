import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginLog {
  id: string;
  user_id: string;
  email: string;
  user_name: string | null;
  login_time: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
}

export function useLoginLogs() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('login_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching login logs:', error);
      toast.error('Failed to load login logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('login-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'login_logs'
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
