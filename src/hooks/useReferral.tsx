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
      // Fetch user's referrals from database
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) throw error;

      // Generate referral code if user doesn't have one
      const code = generateReferralCode(user.id);
      setReferralCode(code);

      // Calculate stats from fetched data
      const totalReferrals = referrals?.length || 0;
      const activeReferrals = referrals?.filter(r => r.status === 'active').length || 0;
      const totalCommissionEarned = referrals?.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0) || 0;

      setReferralStats({
        totalReferrals,
        activeReferrals,
        totalCommissionEarned,
        pendingCommission: 0,
      });
      setReferredUsers(referrals || []);
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

      // Update referral commission in database
      const { error } = await supabase
        .from('referrals')
        .update({ 
          total_commission_earned: supabase.raw(`total_commission_earned + ${referralCommission}`)
        })
        .eq('referrer_id', referrerId)
        .eq('referred_id', refereeId);

      if (error) throw error;

      // Add commission to referrer's balance
      await supabase.rpc('add_balance', {
        user_id: referrerId,
        amount: referralCommission
      });
      
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
      // Validate format
      if (!code.startsWith('REF') || code.length !== 16) {
        return false;
      }

      // Extract user ID from code
      const userId = code.substring(3, 11).toLowerCase();

      // Check if user exists
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

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

      // Check if user already has a referrer
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('user_id', userId)
        .single();

      if ((existingProfile as any)?.referred_by) {
        toast.error('You have already used a referral code');
        return false;
      }

      // Create referral relationship in database
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: userId,
          status: 'active',
          commission_rate: 0.10
        });

      if (referralError) {
        console.error('Error creating referral:', referralError);
        throw referralError;
      }

      // Update user profile with referral info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ referred_by: referrerId } as any)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
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