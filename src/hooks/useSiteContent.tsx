import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SupportPageContent {
  email: string;
  phone: string;
  telegram: string;
  telegram_link: string;
}

export function useSiteContent(pageKey: string) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content' as any)
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) {
        console.error('Error fetching site content:', error);
        setContent(getDefaultContent(pageKey));
        return;
      }
      
      setContent((data as any)?.content || getDefaultContent(pageKey));
    } catch (error: any) {
      console.error('Error fetching site content:', error);
      setContent(getDefaultContent(pageKey));
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (newContent: any) => {
    try {
      const { data: existing } = await supabase
        .from('site_content' as any)
        .select('id')
        .eq('page_key', pageKey)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('site_content' as any)
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
            updated_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq('page_key', pageKey);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_content' as any)
          .insert({
            page_key: pageKey,
            content: newContent,
            updated_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      toast.success('Content updated successfully!');
      setContent(newContent);
      await fetchContent();
    } catch (error: any) {
      console.error('Error updating site content:', error);
      toast.error('Failed to update content');
    }
  };

  useEffect(() => {
    fetchContent();
  }, [pageKey]);

  return {
    content,
    loading,
    updateContent,
    refetch: fetchContent
  };
}

function getDefaultContent(pageKey: string): any {
  const defaults: Record<string, any> = {
    support_page: {
      email: 'support@example.com',
      phone: '+91 98765 43210',
      telegram: '@YourSupportBot',
      telegram_link: 'https://t.me/YourSupportBot'
    }
  };

  return defaults[pageKey] || {};
}
