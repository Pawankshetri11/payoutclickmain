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

      // For now, use mock data since we need to implement the earnings tracking
      // TODO: Fetch from tasks table where status = 'approved'
      const mockEarnings = {
        todayEarning: 125.50,
        weekEarning: 567.30,
        monthEarning: 1250.00,
        balance: 750.00, // Amount available for withdrawal (26-30 of each month)
        totalEarned: 3450.75,
        pendingPayments: 125.00,
      };

      setEarnings(mockEarnings);
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current date is in withdrawal period (26-30)
  const isWithdrawalPeriod = () => {
    const today = new Date().getDate();
    return today >= 26 && today <= 30;
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
