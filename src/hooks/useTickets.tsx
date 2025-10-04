import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'answered' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export function useTickets(adminView: boolean = false) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('tickets' as any)
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // If user view, only fetch their tickets
      if (!adminView && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      // Don't show error toast if table doesn't exist yet
      if (!error.message?.includes('relation') && !error.message?.includes('does not exist')) {
        toast.error('Failed to load tickets');
      }
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    subject: string;
    message: string;
    priority: string;
    category: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tickets' as any)
        .insert({
          user_id: user.id,
          ...ticketData,
          status: 'pending',
        });

      if (error) throw error;
      
      toast.success('Ticket created successfully!');
      await fetchTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets' as any)
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ticket status updated!');
      await fetchTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user, adminView]);

  return {
    tickets,
    loading,
    createTicket,
    updateTicketStatus,
    refetch: fetchTickets,
  };
}
