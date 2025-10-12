import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileKYCNotification() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedNotifications = localStorage.getItem('dismissed_notifications');
    if (dismissedNotifications) {
      setDismissed(JSON.parse(dismissedNotifications).includes('kyc_profile'));
    }
  }, []);

  if (!profile || dismissed) return null;

  const hasIncompleteKYC = profile.kyc_status === 'pending' || profile.kyc_status === 'rejected';
  const hasIncompleteProfile = !profile.phone || !profile.name;

  if (!hasIncompleteKYC && !hasIncompleteProfile) return null;

  const handleDismiss = () => {
    const dismissedNotifications = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    dismissedNotifications.push('kyc_profile');
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedNotifications));
    setDismissed(true);
  };

  return (
    <Alert className="mb-4 border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertTitle className="flex items-center justify-between">
        <span>Complete Your Profile</span>
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
        <p>
          {hasIncompleteKYC && hasIncompleteProfile && 
            "Please complete your profile details and KYC verification to unlock all features."}
          {hasIncompleteKYC && !hasIncompleteProfile && 
            "Please complete your KYC verification to unlock all features."}
          {!hasIncompleteKYC && hasIncompleteProfile && 
            "Please complete your profile details to get started."}
        </p>
        <div className="flex gap-2 mt-2">
          {hasIncompleteProfile && (
            <Button size="sm" variant="outline" onClick={() => navigate('/user/profile')}>
              Complete Profile
            </Button>
          )}
          {hasIncompleteKYC && (
            <Button size="sm" onClick={() => navigate('/user/complete-kyc')}>
              Complete KYC
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}