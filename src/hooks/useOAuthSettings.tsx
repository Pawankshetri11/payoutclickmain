import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OAuthSettings {
  id: string;
  provider: string;
  client_id: string | null;
  client_secret: string | null;
  enabled: boolean;
}

export function useOAuthSettings() {
  const [settings, setSettings] = useState<OAuthSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('oauth_settings' as any)
        .select('*')
        .eq('provider', 'google')
        .maybeSingle();

      if (error) throw error;
      setSettings((data as any) || null);
    } catch (error: any) {
      console.error('Error fetching OAuth settings:', error);
      toast.error('Failed to load OAuth settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<OAuthSettings>) => {
    try {
      const { error } = await supabase
        .from('oauth_settings' as any)
        .update(updates)
        .eq('provider', 'google');

      if (error) throw error;
      
      toast.success('OAuth settings updated successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error updating OAuth settings:', error);
      toast.error('Failed to update OAuth settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}
