import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  balance: number;
  total_earnings: number;
  completed_tasks: number;
  level: string;
  status: 'active' | 'pending' | 'suspended';
  kyc_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      console.log('Updating user:', userId, 'with updates:', updates);
      
      // Remove id and user_id from updates as they should not be updated
      const { id, user_id, created_at, ...safeUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);
      toast.success('User updated successfully!');
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    await updateUser(userId, { status: status as any });
  };

  const updateKYCStatus = async (userId: string, kycStatus: string) => {
    await updateUser(userId, { kyc_status: kycStatus as any });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updateUser,
    updateUserStatus,
    updateKYCStatus,
    refetch: fetchUsers,
  };
}
