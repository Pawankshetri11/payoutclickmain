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

  // Generate consistent referral code from user ID (no random part)
  const generateReferralCode = (userId: string) => {
    // Use full user ID without hyphens for consistent code
    const userPart = userId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `REF${userPart}`;
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

      // Fetch referred users data from profiles table
      const { data: referredProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('referred_by', 'is', null);

      if (profilesError && profilesError.code !== 'PGRST116') {
        console.error('Error fetching referred users:', profilesError);
      }

      // Filter to only users referred by current user
      const myReferrals = (referredProfiles || []).filter((p: any) => 
        p.referred_by === user.id
      );

      // Fetch commission transactions for this user
      const { data: commissionTxns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'earning')
        .ilike('description', '%referral commission%');

      if (txnError && txnError.code !== 'PGRST116') {
        console.error('Error fetching commission transactions:', txnError);
      }

      const totalCommissionEarned = (commissionTxns || []).reduce((sum, txn) => sum + txn.amount, 0);

      // Build referral list with commission data
      const referralList: ReferralData[] = myReferrals.map((profile: any) => ({
        id: profile.id,
        referrer_id: user.id,
        referred_id: profile.user_id,
        status: (profile.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
        created_at: profile.created_at,
        total_commission_earned: 0, // TODO: Calculate from withdrawals
        name: profile.name,
        email: profile.email,
        joinDate: new Date(profile.created_at).toLocaleDateString(),
        totalEarnings: profile.total_earnings || 0,
        commissionEarned: 0 // TODO: Calculate from withdrawals
      }));

      setReferralStats({
        totalReferrals: referralList.length,
        activeReferrals: referralList.filter(r => r.status === 'active').length,
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
    referrerId: string | null,
    refereeId: string
  ) => {
    try {
      // If user has referrer: User gets 80%, Referrer gets 10%, Company gets 10%
      // If no referrer: User gets 80%, Company gets 20%
      const referralCommission = referrerId ? withdrawalAmount * 0.10 : 0; // 10% to referrer if exists
      const companyCommission = referrerId ? withdrawalAmount * 0.10 : withdrawalAmount * 0.20; // 10% or 20%
      const netAmount = withdrawalAmount - referralCommission - companyCommission;

      // Only process referral commission if referrer exists
      if (referrerId && referralCommission > 0) {
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
          .maybeSingle();

        if (profile) {
          const newBalance = (profile.balance || 0) + referralCommission;
          await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('user_id', referrerId);
        }
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
      // Validate format - should be REF + 8 chars
      if (!code.startsWith('REF') || code.length !== 11) {
        return false;
      }

      // Extract the 8-char prefix from code
      const codePrefix = code.substring(3, 11).toLowerCase();

      // Check if any user exists whose ID (without hyphens) starts with this prefix
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id');

      if (error || !data) return false;

      // Find a user whose ID matches the prefix
      const matchingUser = data.find(profile => {
        const userIdWithoutHyphens = profile.user_id.replace(/-/g, '').toLowerCase();
        return userIdWithoutHyphens.startsWith(codePrefix);
      });

      return !!matchingUser;
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

      // Extract the 8-char prefix from code
      const codePrefix = referralCode.substring(3, 11).toLowerCase();
      
      // Find the referrer's full user ID
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id');

      if (profilesError || !allProfiles) {
        toast.error('Failed to validate referral code');
        return false;
      }

      const referrerProfile = allProfiles.find(profile => {
        const userIdWithoutHyphens = profile.user_id.replace(/-/g, '').toLowerCase();
        return userIdWithoutHyphens.startsWith(codePrefix);
      });

      if (!referrerProfile) {
        toast.error('Invalid referral code');
        return false;
      }

      const referrerId = referrerProfile.user_id;
      const userId = newUserId || user?.id;

      if (!userId) {
        toast.error('User not authenticated');
        return false;
      }

      // Can't refer yourself
      if (referrerId === userId) {
        toast.error('You cannot use your own referral code');
        return false;
      }

      // Check if user already has a referrer
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