import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendManualEmailParams {
  recipients: string[];
  subject: string;
  content: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  variables: string[];
  is_active: boolean;
}

export function useEmailSystem() {
  const [loading, setLoading] = useState(false);

  const sendManualEmail = async ({ recipients, subject, content }: SendManualEmailParams) => {
    setLoading(true);
    try {
      const promises = recipients.map(async (email) => {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: email,
            subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                  <h1 style="color: white; margin: 0;">PayoutClick</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                  ${content}
                </div>
                <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
                  This email was sent by PayoutClick administration.
                </div>
              </div>
            `,
            type: 'manual'
          }
        });

        if (error) throw error;
      });

      await Promise.all(promises);
      toast.success(`Email sent successfully to ${recipients.length} recipient(s)`);
    } catch (error: any) {
      console.error('Error sending manual email:', error);
      toast.error('Failed to send email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendWithdrawalEmail = async (withdrawalData: {
    userEmail: string;
    userName: string;
    amount: number;
    status: 'approved' | 'rejected';
    withdrawalId: string;
    rejectionReason?: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('send-withdrawal-email', {
        body: withdrawalData
      });

      if (error) throw error;
      toast.success('Withdrawal notification sent');
    } catch (error: any) {
      console.error('Error sending withdrawal email:', error);
      toast.error('Failed to send withdrawal notification');
    }
  };

  const sendKYCEmail = async (kycData: {
    userEmail: string;
    userName: string;
    status: 'verified' | 'rejected';
    rejectionReason?: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('send-kyc-email', {
        body: kycData
      });

      if (error) throw error;
      toast.success('KYC notification sent');
    } catch (error: any) {
      console.error('Error sending KYC email:', error);
      toast.error('Failed to send KYC notification');
    }
  };

  const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
    try {
      // Since email_templates table doesn't exist in current schema, return mock data
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'welcome',
          subject: 'Welcome to PayoutClick!',
          html_content: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining PayoutClick.</p>',
          variables: ['userName'],
          is_active: true
        },
        {
          id: '2',
          name: 'task_completed',
          subject: 'Task Completed Successfully',
          html_content: '<h1>Great job {{userName}}!</h1><p>Task: {{taskTitle}}</p><p>Earnings: ${{amount}}</p>',
          variables: ['userName', 'taskTitle', 'amount'],
          is_active: true
        }
      ];
      return mockTemplates;
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  };

  const getEmailLogs = async () => {
    try {
      // Since email_logs table doesn't exist in current schema, return mock data
      const mockLogs = [
        {
          id: '1',
          recipient: 'user@example.com',
          subject: 'Welcome to PayoutClick!',
          type: 'welcome',
          status: 'sent',
          sent_at: new Date().toISOString()
        }
      ];
      return mockLogs;
    } catch (error: any) {
      console.error('Error fetching email logs:', error);
      return [];
    }
  };

  return {
    sendManualEmail,
    sendWithdrawalEmail,
    sendKYCEmail,
    getEmailTemplates,
    getEmailLogs,
    loading
  };
}