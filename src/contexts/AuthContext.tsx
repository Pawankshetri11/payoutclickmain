import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle referral code after OAuth signup (defer heavy work)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            let shouldClear = false;
            try {
              const pendingReferralCode = localStorage.getItem('pending_referral_code');
              if (pendingReferralCode) {
                // Check if user profile was just created (within last 10 seconds)
                const { data: profile, error: profileFetchError } = await (supabase as any)
                  .from('profiles')
                  .select('referred_by, created_at')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (profileFetchError) {
                  console.error('❌ Error fetching profile before applying referral:', profileFetchError);
                  return;
                }

                const profileCreatedAt = profile?.created_at ? new Date(profile.created_at).getTime() : 0;
                const now = Date.now();
                const isNewUser = (now - profileCreatedAt) < 10000; // Within 10 seconds

                if (!isNewUser) {
                  console.log('ℹ️ Not a new user, skipping referral application');
                  shouldClear = true;
                  return;
                }

                console.log('🎯 Applying pending referral code after OAuth:', pendingReferralCode);

                if (!(profile as any)?.referred_by) {
                  // Resolve referral code
                  const { data: resolveData, error: resolveError } = await supabase.functions.invoke('resolve-referral', {
                    body: { code: pendingReferralCode }
                  });

                  if (resolveError) {
                    console.error('❌ Error resolving referral code after OAuth:', resolveError);
                  }

                  if (resolveData?.referrer_id && resolveData.referrer_id !== session.user.id) {
                    // Create referral relationship
                    const { error: referralInsertError } = await (supabase as any).from('referrals').insert({
                      referrer_id: resolveData.referrer_id,
                      referred_id: session.user.id,
                      status: 'active',
                      commission_rate: 0.10,
                      total_commission_earned: 0
                    });

                    if (referralInsertError && referralInsertError.code !== '42P01') {
                      console.error('❌ Error creating referral after OAuth:', referralInsertError);
                    }

                    // Update profile
                    const { error: profileUpdateError } = await supabase
                      .from('profiles')
                      .update({ referred_by: resolveData.referrer_id } as any)
                      .eq('user_id', session.user.id);

                    if (profileUpdateError) {
                      console.error('❌ Error updating profile with referrer after OAuth:', profileUpdateError);
                    } else {
                      console.log('✅ Referral code applied successfully after OAuth');
                      shouldClear = true;
                    }
                  } else {
                    console.warn('⚠️ No valid referrer resolved or self-referral attempted. Leaving code for later retry.');
                  }
                } else {
                  console.log('ℹ️ User already has a referrer; skipping referral apply.');
                  shouldClear = true;
                }
              }
            } catch (error) {
              console.error('💥 Exception applying referral code after OAuth:', error);
            } finally {
              if (shouldClear) {
                try { localStorage.removeItem('pending_referral_code'); } catch {}
              }
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}