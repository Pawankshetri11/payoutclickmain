import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

interface ApproveWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: {
    id: string;
    user_id: string;
    amount: number;
  };
  onSuccess: () => void;
}

export function ApproveWithdrawalModal({ open, onOpenChange, withdrawal, onSuccess }: ApproveWithdrawalModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
    }
  };

  const handleApprove = async () => {
    if (!transactionId.trim()) {
      toast.error("Transaction ID is required");
      return;
    }
    if (!paymentMethod) {
      toast.error("Payment method is required");
      return;
    }

    try {
      setUploading(true);
      
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${withdrawal.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('withdrawal-proofs')
          .upload(fileName, screenshotFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('withdrawal-proofs')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          description: `Approved - Transaction ID: ${transactionId}, Method: ${paymentMethod}${screenshotUrl ? ', Proof uploaded' : ''}`
        })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      toast.success('Withdrawal approved successfully!');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setTransactionId("");
      setPaymentMethod("");
      setScreenshotFile(null);
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Withdrawal</DialogTitle>
          <DialogDescription>
            Enter payment details for withdrawal approval (Amount: ₹{withdrawal.amount})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {screenshotFile && (
                <span className="text-sm text-success">✓ {screenshotFile.name}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload proof of payment (max 5MB)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={uploading}>
            {uploading ? 'Processing...' : 'Approve Withdrawal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
