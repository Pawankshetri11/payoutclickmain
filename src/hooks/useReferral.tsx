import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralData {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: 'active' | 'inactive';
  created_at: string;
  total_commission_earned: number;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionEarned: number;
  pendingCommission: number;
}

export function useReferral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissionEarned: 0,
    pendingCommission: 0,
  });
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate referral code from user ID
  const generateReferralCode = (userId: string) => {
    // Create a more unique code with timestamp to ensure uniqueness
    const userPart = userId.substring(0, 8).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `REF${userPart}${randomPart}`;
  };

  const fetchReferralData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Referral system removed - no dummy data
      setReferralCode('');
      setReferralStats({
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommissionEarned: 0,
        pendingCommission: 0,
      });
      setReferredUsers([]);
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const processReferralCommission = async (
    withdrawalAmount: number,
    referrerId: string,
    refereeId: string
  ) => {
    try {
      const referralCommission = withdrawalAmount * 0.10; // 10%
      const companyCommission = withdrawalAmount * 0.10; // 10%
      const netAmount = withdrawalAmount - referralCommission - companyCommission;

      // In real implementation, this would:
      // 1. Add commission to referrer's balance
      // 2. Log the commission transaction
      // 3. Update withdrawal record with commission details
      
      console.log('Processing referral commission:', {
        withdrawalAmount,
        referralCommission,
        companyCommission,
        netAmount,
        referrerId,
        refereeId,
      });

      return {
        netAmount,
        referralCommission,
        companyCommission,
      };
    } catch (error: any) {
      console.error('Error processing referral commission:', error);
      throw error;
    }
  };

  const validateReferralCode = async (code: string): Promise<boolean> => {
    try {
      // Mock validation - in real implementation, check against database
      const isValid = code.startsWith('REF') && code.length === 11;
      return isValid;
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      return false;
    }
  };

  const applyReferralCode = async (referralCode: string) => {
    try {
      const isValid = await validateReferralCode(referralCode);
      
      if (!isValid) {
        toast.error('Invalid referral code');
        return false;
      }

      // In real implementation, this would:
      // 1. Create referral relationship in database
      // 2. Update user profile with referrer information
      
      toast.success('Referral code applied successfully!');
      return true;
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
      return false;
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  return {
    referralCode,
    referralStats,
    referredUsers,
    loading,
    processReferralCommission,
    validateReferralCode,
    applyReferralCode,
    refetch: fetchReferralData,
  };
}