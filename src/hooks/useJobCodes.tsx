import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobCode {
  id: string;
  job_id: string;
  code: string;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export function useJobCodes(jobId: string | undefined) {
  const [codes, setCodes] = useState<JobCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = async () => {
    if (!jobId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('job_codes')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes((data as JobCode[]) || []);
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      toast.error('Failed to load codes');
    } finally {
      setLoading(false);
    }
  };

  const saveCodes = async (codeList: string[]) => {
    if (!jobId) return false;

    try {
      const codeInserts = codeList.map(code => ({
        job_id: jobId,
        code: code.trim(),
        used: false
      }));

      const { error } = await (supabase as any)
        .from('job_codes')
        .insert(codeInserts);

      if (error) throw error;
      
      toast.success(`${codeList.length} codes added successfully`);
      await fetchCodes();
      return true;
    } catch (error: any) {
      console.error('Error saving codes:', error);
      toast.error('Failed to save codes: ' + error.message);
      return false;
    }
  };

  const deleteCode = async (codeId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('job_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
      
      toast.success('Code deleted successfully');
      await fetchCodes();
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast.error('Failed to delete code');
    }
  };

  const verifyCode = async (code: string, userId: string) => {
    if (!jobId) return null;

    try {
      const { data, error } = await (supabase as any)
        .rpc('verify_and_use_code', {
          p_code: code,
          p_job_id: jobId,
          p_user_id: userId
        }) as { data: any; error: any };

      if (error) throw error;
      
      const result = data?.[0];
      if (result?.success) {
        toast.success(`Code verified! ₹${result.reward} credited to your account`);
        return result;
      } else {
        toast.error(result?.message || 'Invalid code');
        return null;
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast.error('Failed to verify code');
      return null;
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [jobId]);

  return {
    codes,
    loading,
    fetchCodes,
    saveCodes,
    deleteCode,
    verifyCode
  };
}
