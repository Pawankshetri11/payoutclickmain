import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function WithdrawalMethodNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [hasWithdrawalMethod, setHasWithdrawalMethod] = useState(true);

  useEffect(() => {
    const checkWithdrawalMethod = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Check if user has bank details in profile (cast to any to access new fields)
      const profile = data as any;
      const hasMethod = profile?.bank_account_number && profile?.bank_name;
      setHasWithdrawalMethod(!!hasMethod);
    };

    checkWithdrawalMethod();

    const dismissedNotifications = localStorage.getItem('dismissed_notifications');
    if (dismissedNotifications) {
      setDismissed(JSON.parse(dismissedNotifications).includes('withdrawal_method'));
    }
  }, [user]);

  if (dismissed || hasWithdrawalMethod) return null;

  const handleDismiss = () => {
    const dismissedNotifications = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    dismissedNotifications.push('withdrawal_method');
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedNotifications));
    setDismissed(true);
  };

  return (
    <Alert className="mb-4 border-primary bg-primary/10">
      <Wallet className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center justify-between">
        <span>Setup Withdrawal Method</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Add your withdrawal method to easily withdraw your earnings.</p>
        <Button size="sm" onClick={() => navigate('/user/complete-kyc')}>
          Add Withdrawal Method
        </Button>
      </AlertDescription>
    </Alert>
  );
}