import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, FileText, Mail, Phone, CreditCard, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: any;
  onApprove?: () => void;
  onReject?: () => void;
}

export function WithdrawalDetailsModal({ 
  open, 
  onOpenChange, 
  withdrawal,
  onApprove,
  onReject 
}: WithdrawalDetailsModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (withdrawal && open) {
      fetchWithdrawalDetails();
    }
  }, [withdrawal, open]);

  const fetchWithdrawalDetails = async () => {
    if (!withdrawal) return;
    
    setLoading(true);
    try {
      // Fetch payment method details
      const { data: pmData } = await (supabase as any)
        .from('payment_methods')
        .select('*')
        .eq('user_id', withdrawal.user_id)
        .eq('is_default', true)
        .single();
      
      if (pmData) {
        setPaymentMethod(pmData);
      }

      // Screenshot feature removed - column doesn't exist in schema
    } catch (error) {
      console.error('Error fetching withdrawal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!withdrawal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdrawal Request Details
          </DialogTitle>
          <DialogDescription>Complete information about this withdrawal request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Withdrawal Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Request ID:</span>
                <span className="font-mono text-xs">{withdrawal.id.substring(0, 16)}...</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium">{withdrawal.profiles?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{withdrawal.profiles?.email || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-primary text-lg">₹{withdrawal.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Requested:</span>
                <span className="font-medium">{new Date(withdrawal.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(withdrawal.status)}
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading payment details...</p>
            </div>
          ) : paymentMethod ? (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h3>
              <div className="p-4 border border-border/50 rounded-lg bg-background/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Method Type:</span>
                    <span className="font-medium uppercase">{paymentMethod.method_type}</span>
                  </div>
                  {paymentMethod.method_type === 'bank' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Bank Name:</span>
                        <span className="font-medium">{paymentMethod.bank_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Number:</span>
                        <span className="font-mono">{paymentMethod.account_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">IFSC Code:</span>
                        <span className="font-mono">{paymentMethod.ifsc_code}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Holder:</span>
                        <span className="font-medium">{paymentMethod.account_holder_name}</span>
                      </div>
                    </>
                  )}
                  {paymentMethod.method_type === 'upi' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">UPI ID:</span>
                      <span className="font-mono">{paymentMethod.upi_id}</span>
                    </div>
                  )}
                  {paymentMethod.method_type === 'paytm' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paytm Number:</span>
                      <span className="font-mono">{paymentMethod.paytm_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-warning">No payment method found for this user.</p>
            </div>
          )}


          {/* Actions */}
          {withdrawal.status === 'pending' && onApprove && onReject && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button 
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => {
                  onApprove();
                  onOpenChange(false);
                }}
              >
                Approve Withdrawal
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onReject();
                  onOpenChange(false);
                }}
              >
                Reject Request
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
