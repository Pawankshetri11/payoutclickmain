import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  total_commission_earned: number;
  name?: string;
  email?: string;
  joinDate?: string;
  totalEarnings?: number;
  commissionEarned?: number;
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
  const [referredUsers, setReferredUsers] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate referral code from user ID
  const generateReferralCode = (userId: string) => {
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
      // Generate referral code
      const code = generateReferralCode(user.id);
      setReferralCode(code);

      // Use type assertion to query referrals table
      const { data: referrals, error } = await (supabase as any)
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching referrals:', error);
      }

      // Calculate stats
      const referralList = (referrals || []) as ReferralData[];
      const totalReferrals = referralList.length;
      const activeReferrals = referralList.filter(r => r.status === 'active').length;
      const totalCommissionEarned = referralList.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0);

      setReferralStats({
        totalReferrals,
        activeReferrals,
        totalCommissionEarned,
        pendingCommission: 0,
      });
      setReferredUsers(referralList);
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
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

      // Update referral commission using type assertion
      await (supabase as any)
        .from('referrals')
        .update({ 
          total_commission_earned: referralCommission
        })
        .eq('referrer_id', referrerId)
        .eq('referred_id', refereeId);

      // Fetch current balance and update
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', referrerId)
        .single();

      if (profile) {
        const newBalance = (profile.balance || 0) + referralCommission;
        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('user_id', referrerId);
      }
      
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
      // Validate format
      if (!code.startsWith('REF') || code.length < 11) {
        return false;
      }

      // Extract user ID from code (first 8 chars after REF)
      const userId = code.substring(3, 11).toLowerCase();

      // Check if user exists
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      return !error && !!data;
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      return false;
    }
  };

  const applyReferralCode = async (referralCode: string, newUserId?: string): Promise<boolean> => {
    try {
      const isValid = await validateReferralCode(referralCode);
      
      if (!isValid) {
        toast.error('Invalid referral code');
        return false;
      }

      // Extract referrer ID from code
      const referrerId = referralCode.substring(3, 11).toLowerCase();
      const userId = newUserId || user?.id;

      if (!userId) {
        toast.error('User not authenticated');
        return false;
      }

      // Check if user already has a referrer using type assertion
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile && (existingProfile as any).referred_by) {
        toast.error('You have already used a referral code');
        return false;
      }

      // Create referral relationship using type assertion
      const { error: referralError } = await (supabase as any)
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: userId,
          status: 'active',
          commission_rate: 0.10,
          total_commission_earned: 0
        });

      if (referralError) {
        console.error('Error creating referral:', referralError);
        // Don't throw if table doesn't exist yet
        if (referralError.code !== '42P01') {
          throw referralError;
        }
      }

      // Update user profile with referral info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ referred_by: referrerId } as any)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
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