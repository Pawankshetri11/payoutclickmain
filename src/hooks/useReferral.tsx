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

      // Get all profiles that have this user as referred_by
      const { data: referredByProfiles } = await (supabase as any)
        .from('profiles')
        .select('user_id, name, email, created_at, total_earnings, status')
        .eq('referred_by', user.id);
      
      console.log('📊 Profiles with referred_by:', referredByProfiles);

      // Use referredByProfiles directly since we already have all the data
      const referredProfiles = referredByProfiles || [];

      console.log('📊 Referred profiles details:', referredProfiles);

      // Build referral list with proper commission tracking
      const myReferrals = referredProfiles.map((profile: any) => {
        const refRow = ((referralRows as any[]) || []).find((r: any) => r.referred_id === profile.user_id);
        return { 
          referred_id: profile.user_id,
          referrer_id: user.id,
          status: refRow?.status || profile.status || 'active',
          total_commission_earned: refRow?.total_commission_earned || 0,
          created_at: refRow?.created_at || profile.created_at,
          name: profile.name,
          email: profile.email,
          total_earnings: profile.total_earnings
        };
      });

      // Fetch commission transactions earned BY this user (as referrer)
      const { data: commissionTxns, error: txnError } = await supabase
        .from('transactions')
        .select('id, user_id, amount, description, type, status, created_at')
        .eq('user_id', user.id)
        .eq('type', 'earning')
        .ilike('description', '%referral commission%');

      if (txnError && txnError.code !== 'PGRST116') {
        console.error('Error fetching commission transactions:', txnError);
      }

      const txnSum = (commissionTxns || []).reduce((sum, txn) => sum + txn.amount, 0);
      const totalCommissionEarned = txnSum > 0 
        ? txnSum 
        : ((myReferrals as any[]) || []).reduce((sum: number, r: any) => sum + (r.total_commission_earned || 0), 0);
      
      console.log('💰 Total commission earned by referrer:', totalCommissionEarned);
      console.log('💰 Commission transactions:', commissionTxns);

      // For each referral, calculate their individual commission contribution
      const referralList: ReferralData[] = await Promise.all(
        ((myReferrals as any[]) || []).map(async (r: any) => {
          const referredUserId = r.referred_id;
          const referredUserEmail = r.email;
          
          // Get commission earned FROM this specific referred user's withdrawals
          // Commission description includes the referred user's email
          const { data: referredCommissions } = await supabase
            .from('transactions')
            .select('amount, created_at')
            .eq('user_id', user.id)
            .eq('type', 'earning')
            .ilike('description', `%${referredUserEmail}%`);
          
          console.log(`💰 Fetching commissions for ${referredUserEmail}:`, referredCommissions);
          
          // Sum up commissions from this referred user
          const individualCommission = (referredCommissions || []).reduce((sum, txn) => sum + txn.amount, 0);
          
          console.log(`💰 Total commission from ${r.name || 'Unknown'} (${referredUserEmail}):`, individualCommission);
          
          return {
            id: referredUserId || `${user.id}-${Math.random().toString(36).slice(2,8)}`,
            referrer_id: r.referrer_id || user.id,
            referred_id: referredUserId,
            status: (r.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
            created_at: r.created_at,
            total_commission_earned: individualCommission || r.total_commission_earned || 0,
            name: r.name || 'Unknown User',
            email: r.email || 'No Email',
            joinDate: new Date(r.created_at || Date.now()).toLocaleDateString(),
            totalEarnings: r.total_earnings || 0,
            commissionEarned: individualCommission || r.total_commission_earned || 0
          };
        })
      );

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

  // This function is no longer needed - commission is handled in ApproveWithdrawalModal
  const processReferralCommission = async (
    withdrawalAmount: number,
    referrerId: string | null,
    refereeId: string
  ) => {
    // Legacy function - kept for compatibility but not used
    return {
      netAmount: withdrawalAmount * 0.8,
      referralCommission: referrerId ? withdrawalAmount * 0.10 : 0,
      companyCommission: referrerId ? withdrawalAmount * 0.10 : withdrawalAmount * 0.20,
    };
  };

  const resolveReferrer = async (sanitized: string) => {
    try {
      // Use edge function to resolve referral code (has service role access)
      console.log('🔍 Calling resolve-referral edge function for:', sanitized);
      
      const { data, error } = await supabase.functions.invoke('resolve-referral', {
        body: { code: sanitized }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        return { data: null, error };
      }

      console.log('✅ Edge function response:', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('💥 Exception calling edge function:', e);
      return { data: null, error: e };
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

      // Wait for profile to be created (with retries)
      let existingProfile: any = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      console.log('⏳ Waiting for profile to be created...');
      
      while (attempts < maxAttempts) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (profile) {
          existingProfile = profile;
          console.log('✅ Profile found:', profile);
          break;
        }
        
        attempts++;
        console.log(`⏳ Profile not found yet, attempt ${attempts}/${maxAttempts}...`);
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
      }

      if (!existingProfile) {
        console.error('❌ Profile not found after retries');
        toast.error('Profile not ready. Please try again.');
        return false;
      }

      if (existingProfile.referred_by) {
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
      console.log('📝 Updating profile with referred_by:', referrerId);
      const { data: updateData, error: profileError } = await supabase
        .from('profiles')
        .update({ referred_by: referrerId } as any)
        .eq('user_id', userId)
        .select();

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        toast.error('Failed to update profile with referral info');
        return false;
      }
      
      console.log('✅ Profile updated successfully:', updateData);
      toast.success('Referral code applied successfully!');
      await fetchReferralData(); // Refresh data
      return true;
    } catch (error: any) {
      console.error('💥 Error applying referral code:', error);
      toast.error('Failed to apply referral code');
      return false;
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  // Realtime updates for referral-related changes
  useEffect(() => {
    if (!user) return;
    const channel = (supabase as any)
      .channel('referral-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload: any) => {
        if (payload?.new?.user_id === user.id || (payload?.old?.user_id === user.id)) {
          fetchReferralData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => fetchReferralData())
      .subscribe();
    return () => {
      (supabase as any).removeChannel(channel);
    };
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