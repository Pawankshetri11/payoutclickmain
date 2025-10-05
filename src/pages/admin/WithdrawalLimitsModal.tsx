import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, DollarSign, Clock, Percent } from "lucide-react";
import { toast } from "sonner";

interface WithdrawalLimitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalLimitsModal({ open, onOpenChange }: WithdrawalLimitsModalProps) {
  const [limits, setLimits] = useState({
    minAmount: "100",
    maxAmount: "10000",
    dailyLimit: "50000",
    weeklyLimit: "200000",
    monthlyLimit: "500000",
    processingFee: "10",
    processingTime: "24",
  });

  const handleSaveLimits = async () => {
    try {
      // Mock save - in real app would update in database
      console.log("Updating withdrawal limits:", limits);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Withdrawal limits updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating limits:", error);
      toast.error("Failed to update withdrawal limits");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Withdrawal Limits & Settings
          </DialogTitle>
          <DialogDescription>
            Configure withdrawal limits and processing settings for all users
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Amount Limits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount Limits
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Withdrawal (₹)</Label>
              <Input
                id="minAmount"
                type="number"
                value={limits.minAmount}
                onChange={(e) => setLimits({...limits, minAmount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Per Transaction (₹)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={limits.maxAmount}
                onChange={(e) => setLimits({...limits, maxAmount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyLimit">Daily Limit (₹)</Label>
              <Input
                id="dailyLimit"
                type="number"
                value={limits.dailyLimit}
                onChange={(e) => setLimits({...limits, dailyLimit: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyLimit">Weekly Limit (₹)</Label>
              <Input
                id="weeklyLimit"
                type="number"
                value={limits.weeklyLimit}
                onChange={(e) => setLimits({...limits, weeklyLimit: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">Monthly Limit (₹)</Label>
              <Input
                id="monthlyLimit"
                type="number"
                value={limits.monthlyLimit}
                onChange={(e) => setLimits({...limits, monthlyLimit: e.target.value})}
              />
            </div>
          </div>

          {/* Processing Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Processing Settings
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="processingFee">Company Fee (%)</Label>
              <Input
                id="processingFee"
                type="number"
                value={limits.processingFee}
                onChange={(e) => setLimits({...limits, processingFee: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Fee deducted from all withdrawals
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingTime">Processing Time (hours)</Label>
              <Input
                id="processingTime"
                type="number"
                value={limits.processingTime}
                onChange={(e) => setLimits({...limits, processingTime: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Standard processing time for withdrawals
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-3">Current Settings Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min/Max Amount:</span>
                  <span className="font-medium">₹{limits.minAmount} - ₹{limits.maxAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Limit:</span>
                  <span className="font-medium">₹{limits.dailyLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Fee:</span>
                  <span className="font-medium">{limits.processingFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">{limits.processingTime} hours</span>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Settings</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span>Require KYC verification for withdrawals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span>Send email notifications for withdrawals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Auto-approve withdrawals under ₹1000</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveLimits}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}