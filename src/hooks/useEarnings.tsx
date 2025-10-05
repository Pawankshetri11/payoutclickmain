import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EarningsData {
  todayEarning: number;
  weekEarning: number;
  monthEarning: number;
  balance: number;
  totalEarned: number;
  pendingPayments: number;
}

export function useEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    todayEarning: 0,
    weekEarning: 0,
    monthEarning: 0,
    balance: 0,
    totalEarned: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Fetch real earnings from approved tasks
      const { data: approvedTasks, error } = await supabase
        .from('tasks')
        .select('amount, approved_at')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;

      // Current month earnings (not yet in balance)
      const todayEarning = (approvedTasks || [])
        .filter(t => new Date(t.approved_at || '') >= today)
        .reduce((sum, t) => sum + t.amount, 0);

      const weekEarning = (approvedTasks || [])
        .filter(t => new Date(t.approved_at || '') >= weekAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthEarning = (approvedTasks || [])
        .filter(t => new Date(t.approved_at || '') >= monthStart)
        .reduce((sum, t) => sum + t.amount, 0);

      // Balance = earnings from previous months (available for withdrawal)
      const balance = (approvedTasks || [])
        .filter(t => new Date(t.approved_at || '') <= previousMonthEnd)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalEarned = (approvedTasks || []).reduce((sum, t) => sum + t.amount, 0);

      // Get pending tasks
      const { data: pendingTasks } = await supabase
        .from('tasks')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const pendingPayments = (pendingTasks || []).reduce((sum, t) => sum + t.amount, 0);

      setEarnings({
        todayEarning,
        weekEarning,
        monthEarning,
        balance,
        totalEarned,
        pendingPayments,
      });
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current date is in withdrawal period (26-31)
  const isWithdrawalPeriod = () => {
    const today = new Date().getDate();
    return today >= 26 && today <= 31;
  };

  // Calculate balance based on month earnings
  const calculateBalance = (monthEarnings: number) => {
    // Balance is the accumulated earnings for the month
    // Available for withdrawal during 26-30
    return monthEarnings;
  };

  useEffect(() => {
    fetchEarnings();
  }, [user]);

  return {
    earnings,
    loading,
    isWithdrawalPeriod: isWithdrawalPeriod(),
    refetch: fetchEarnings,
  };
}
