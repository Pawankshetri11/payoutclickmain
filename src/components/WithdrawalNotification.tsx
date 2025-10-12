import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Calendar, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WithdrawalNotification() {
  // Get current date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  
  // Check if we're in the withdrawal period (26-31)
  const isWithdrawalPeriod = currentDay >= 26 && currentDay <= 31;

  if (!isWithdrawalPeriod) {
    return null;
  }

  return (
    <Alert className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 shadow-glow mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/20">
          <Bell className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Withdrawal Period Active
            </h4>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {currentMonth} {currentDay}
            </Badge>
          </div>
          <AlertDescription className="text-sm space-y-2">
            <p className="text-foreground">
              We're currently in the withdrawal processing window (26th-31st of the month).
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Submit your withdrawal request to have it processed</li>
              <li>Processing time: 1-3 business days</li>
              <li>You'll receive a confirmation email once processed</li>
              <li>New requests will be included in this cycle if submitted before {currentDay === 31 ? 'today' : `${31}st`}</li>
            </ul>
            <div className="flex items-start gap-2 mt-3 p-3 bg-info/10 rounded-lg border border-info/20">
              <Info className="h-4 w-4 text-info mt-0.5" />
              <p className="text-xs text-info">
                Next withdrawal period: {currentDay < 31 ? 'Continues until 31st' : '26th of next month'}
              </p>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
