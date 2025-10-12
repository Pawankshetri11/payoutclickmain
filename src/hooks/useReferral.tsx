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

interface ReferrerInfo {
  id: string;
  name: string;
  email: string;
  referralCode: string;
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
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);
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

      // Check if current user has a referrer
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('user_id, name, email, referred_by, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const referredBy = (currentProfile as any)?.referred_by;
      console.log('🔍 Current user profile:', currentProfile);
      console.log('🔍 User referred_by:', referredBy);
      
      if (referredBy) {
        // Fetch referrer info
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .eq('user_id', referredBy)
          .maybeSingle();

        console.log('👤 Referrer profile:', referrerProfile);
        if (referrerProfile) {
          const referrerData = {
            id: referrerProfile.user_id,
            name: referrerProfile.name || 'Unknown',
            email: referrerProfile.email || '',
            referralCode: generateReferralCode(referrerProfile.user_id)
          };
          console.log('✅ Setting referrer info:', referrerData);
          setReferrerInfo(referrerData);
        } else {
          console.log('⚠️ Referrer profile not found for ID:', referredBy);
          setReferrerInfo(null);
        }
      } else {
        console.log('❌ No referrer found for this user');
        setReferrerInfo(null);
      }

      // Fetch referrals for current user from referrals table (more reliable)
      const { data: referralRows, error: referralsError } = await (supabase as any)
        .from('referrals')
        .select('referrer_id, referred_id, status, total_commission_earned, created_at')
        .eq('referrer_id', user.id);

      if (referralsError && referralsError.code !== 'PGRST116') {
        console.error('Error fetching referrals:', referralsError);
      }

      console.log('📊 Referral rows from table:', referralRows);

      // Also get all profiles that have this user as referred_by
      const referredByQuery = await (supabase as any)
        .from('profiles')
        .select('user_id, name, email, created_at, total_earnings, status')
        .eq('referred_by', user.id);
      
      const referredByProfiles = referredByQuery.data;
      console.log('📊 Profiles with referred_by:', referredByProfiles);

      // Combine both sources
      const referredIdsFromTable = ((referralRows as any[]) || []).map((r: any) => r.referred_id).filter(Boolean);
      const referredIdsFromProfiles = ((referredByProfiles as any[]) || []).map((p: any) => p.user_id).filter(Boolean);
      const allReferredIdsSet = new Set([...referredIdsFromTable, ...referredIdsFromProfiles]);
      const referredIds = Array.from(allReferredIdsSet);
      
      let referredProfiles: any[] = [];
      if (referredIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, name, email, created_at, total_earnings, status')
          .in('user_id', referredIds);
        referredProfiles = data || [];
      }

      console.log('📊 Referred profiles details:', referredProfiles);

      const myReferrals = referredIds.map(refId => {
        const refRow = ((referralRows as any[]) || []).find((r: any) => r.referred_id === refId);
        const profile = referredProfiles.find((p: any) => p.user_id === refId) || {};
        return { 
          referred_id: refId,
          referrer_id: user.id,
          status: refRow?.status || 'active',
          total_commission_earned: refRow?.total_commission_earned || 0,
          created_at: refRow?.created_at || profile.created_at,
          profile 
        };
      });

      // Fetch commission transactions for this user
      const { data: commissionTxns, error: txnError } = await supabase
        .from('transactions')
        .select('id, user_id, amount, description, type, status, created_at')
        .eq('user_id', user.id)
        .eq('type', 'earning')
        .ilike('description', '%referral commission%');

      if (txnError && txnError.code !== 'PGRST116') {
        console.error('Error fetching commission transactions:', txnError);
      }

      const totalCommissionEarned = (commissionTxns || []).reduce((sum, txn) => sum + txn.amount, 0);

      // Build referral list with commission data
      const referralList: ReferralData[] = ((myReferrals as any[]) || []).map((r: any) => {
        const profile = r.profile || {};
        return {
          id: r.referred_id || profile.user_id || `${user.id}-${Math.random().toString(36).slice(2,8)}`,
          referrer_id: r.referrer_id || user.id,
          referred_id: r.referred_id || profile.user_id,
          status: (r.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
          created_at: r.created_at || profile.created_at,
          total_commission_earned: r.total_commission_earned || 0,
          name: profile.name || 'Unknown',
          email: profile.email || 'N/A',
          joinDate: new Date((profile.created_at || r.created_at)).toLocaleDateString(),
          totalEarnings: profile.total_earnings || 0,
          commissionEarned: r.total_commission_earned || 0
        };
      });

      console.log('📊 Referral list built:', referralList.length, 'referrals');

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
          .select('balance, total_earnings')
          .eq('user_id', referrerId)
          .maybeSingle();

        if (profile) {
          const newBalance = (profile.balance || 0) + referralCommission;
          const newTotalEarnings = (profile.total_earnings || 0) + referralCommission;
          
          await supabase
            .from('profiles')
            .update({ 
              balance: newBalance,
              total_earnings: newTotalEarnings
            })
            .eq('user_id', referrerId);

          // Create a transaction record for the referral commission
          await supabase
            .from('transactions')
            .insert({
              user_id: referrerId,
              type: 'earning',
              amount: referralCommission,
              description: `Referral commission from withdrawal`,
              status: 'completed'
            });
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

  const resolveReferrer = async (sanitized: string) => {
    try {
      const res1 = await supabase.functions.invoke('resolve-referral', {
        body: { code: sanitized }
      });
      if (!res1.error && res1.data?.referrer_id) return res1;
      const res2 = await supabase.functions.invoke('resolve-referrals', {
        body: { code: sanitized }
      });
      return res2;
    } catch (e) {
      const res2 = await supabase.functions.invoke('resolve-referrals', {
        body: { code: sanitized }
      });
      return res2;
    }
  };

  const validateReferralCode = async (code: string): Promise<boolean> => {
    try {
      const sanitized = code.trim().toUpperCase();
      console.log('🔍 Validating referral code:', sanitized);
      
      // Validate format - should be REF + 8 chars
      if (!sanitized.startsWith('REF') || sanitized.length !== 11) {
        console.log('❌ Invalid format');
        return false;
      }

      // Use edge function to resolve referral code with fallback alias
      const { data: resolveData, error: resolveError } = await resolveReferrer(sanitized);

      if (resolveError) {
        console.error('❌ Error resolving referral code:', resolveError);
        return false;
      }

      const isValid = !!resolveData?.referrer_id;
      console.log('✅ Validation result:', isValid);
      return isValid;
    } catch (error: any) {
      console.error('💥 Exception validating referral code:', error);
      return false;
    }
  };

  const applyReferralCode = async (referralCode: string, newUserId?: string): Promise<boolean> => {
    try {
      const sanitized = referralCode.trim().toUpperCase();
      
      console.log('🎯 Applying referral code:', sanitized);
      
      // Validate format first
      if (!sanitized.startsWith('REF') || sanitized.length !== 11) {
        console.log('❌ Invalid format');
        toast.error('Invalid referral code format. Must be REF + 8 characters');
        return false;
      }

      // Use edge function to resolve referral code
      console.log('🔍 Resolving referral code via edge function...');
      const { data: resolveData, error: resolveError } = await resolveReferrer(sanitized);

      if (resolveError) {
        console.error('❌ Error resolving referral code:', resolveError);
        toast.error('Error validating referral code');
        return false;
      }

      const referrerId = resolveData?.referrer_id;

      if (!referrerId) {
        console.log('❌ No matching user found for code:', sanitized);
        toast.error('Invalid referral code. Please check and try again.');
        return false;
      }

      const userId = newUserId || user?.id;

      console.log('✅ Found referrer:', referrerId, 'for user:', userId);

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
          toast.error('Failed to create referral relationship');
          return false;
        }
      }

      // Update user profile with referral info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ referred_by: referrerId } as any)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error('Failed to update profile with referral info');
        return false;
      }
      
      toast.success('Referral code applied successfully!');
      await fetchReferralData(); // Refresh data
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
    referrerInfo,
    loading,
    processReferralCommission,
    validateReferralCode,
    applyReferralCode,
    refetch: fetchReferralData,
  };
}