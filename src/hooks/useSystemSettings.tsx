import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemSettings {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('system_settings')
        .select('*');

      if (error) throw error;
      
      // Convert array to object for easier access
      const settingsObj: Record<string, any> = {};
      (data || []).forEach((setting: SystemSettings) => {
        settingsObj[setting.key] = setting.value;
      });
      
      setSettings(settingsObj);
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      // Don't show error toast on initial load
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await (supabase as any)
        .from('system_settings')
        .upsert({ 
          key, 
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
      
      toast.success('Setting updated successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const getSetting = (key: string, defaultValue: any = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    getSetting,
    refetch: fetchSettings,
  };
}
