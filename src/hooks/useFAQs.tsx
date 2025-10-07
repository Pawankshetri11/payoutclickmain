import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

interface FAQ {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
}

export function useFAQs(adminView: boolean = false) {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('faq_categories' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch FAQs
      let faqQuery = supabase
        .from('faqs' as any)
        .select('*')
        .order('display_order', { ascending: true });

      // If not admin, only show published
      if (!adminView) {
        faqQuery = faqQuery.eq('is_published', true);
      }

      const { data: faqsData, error: faqsError } = await faqQuery;

      if (faqsError) throw faqsError;

      setCategories((categoriesData as any) || []);
      setFaqs((faqsData as any) || []);
    } catch (error: any) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: { name: string; slug: string; display_order: number }) => {
    try {
      const { error } = await supabase
        .from('faq_categories' as any)
        .insert(data);

      if (error) throw error;
      toast.success('Category created successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const updateCategory = async (id: string, data: Partial<FAQCategory>) => {
    try {
      const { error } = await supabase
        .from('faq_categories' as any)
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Category updated successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faq_categories' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Category deleted successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const createFAQ = async (data: Omit<FAQ, 'id'>) => {
    try {
      const { error } = await supabase
        .from('faqs' as any)
        .insert(data);

      if (error) throw error;
      toast.success('FAQ created successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error creating FAQ:', error);
      toast.error('Failed to create FAQ');
    }
  };

  const updateFAQ = async (id: string, data: Partial<FAQ>) => {
    try {
      const { error } = await supabase
        .from('faqs' as any)
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ updated successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ deleted successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminView]);

  return {
    categories,
    faqs,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    refetch: fetchData,
  };
}
