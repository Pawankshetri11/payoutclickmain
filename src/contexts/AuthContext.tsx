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

        // Handle referral code after OAuth signup
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const pendingReferralCode = localStorage.getItem('pending_referral_code');
              if (pendingReferralCode) {
                console.log('🎯 Applying pending referral code after OAuth:', pendingReferralCode);
                
                // Check if user already has a referrer
                const { data: profile } = await (supabase as any)
                  .from('profiles')
                  .select('referred_by')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (!(profile as any)?.referred_by) {
                  // Resolve referral code
                  const { data: resolveData } = await supabase.functions.invoke('resolve-referral', {
                    body: { code: pendingReferralCode }
                  });

                  if (resolveData?.referrer_id && resolveData.referrer_id !== session.user.id) {
                    // Create referral relationship
                    await (supabase as any).from('referrals').insert({
                      referrer_id: resolveData.referrer_id,
                      referred_id: session.user.id,
                      status: 'active',
                      commission_rate: 0.10,
                      total_commission_earned: 0
                    });

                    // Update profile
                    await supabase
                      .from('profiles')
                      .update({ referred_by: resolveData.referrer_id } as any)
                      .eq('user_id', session.user.id);

                    console.log('✅ Referral code applied successfully after OAuth');
                  }
                }
                
                // Clear the pending referral code
                localStorage.removeItem('pending_referral_code');
              }
            } catch (error) {
              console.error('Error applying referral code after OAuth:', error);
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