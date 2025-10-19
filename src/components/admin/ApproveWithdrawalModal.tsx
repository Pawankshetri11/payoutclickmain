import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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
    payment_method_id?: string;
  };
  onSuccess: () => void;
}

export function ApproveWithdrawalModal({ open, onOpenChange, withdrawal, onSuccess }: ApproveWithdrawalModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userPaymentMethods, setUserPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (withdrawal.user_id) {
      fetchUserPaymentMethods();
    }
  }, [withdrawal.user_id]);

  const fetchUserPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods' as any)
        .select('*')
        .eq('user_id', withdrawal.user_id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setUserPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
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

      // 1) Validate KYC + Balance
      const { data: profile, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('kyc_status, balance, name, email, referred_by')
        .eq('user_id', withdrawal.user_id)
        .maybeSingle();
      if (profileErr) throw profileErr;

      if (!profile || profile.kyc_status !== 'verified') {
        toast.error('KYC not verified. Cannot approve withdrawal.');
        return;
      }
      const currentBalance = Number(profile.balance || 0);
      if (currentBalance < 100 || currentBalance < Number(withdrawal.amount || 0)) {
        toast.error('Insufficient balance (min ₹100 and >= requested amount required).');
        return;
      }

      // 2) Validate payment method belongs to user
      const methodAllowed = userPaymentMethods.some((m) => m.method_type === paymentMethod);
      if (!methodAllowed) {
        toast.error('Selected payment method is not configured by user.');
        return;
      }

      // 3) Calculate commission breakdown
      const withdrawalAmount = Number(withdrawal.amount || 0);
      // Prefer profiles.referred_by, fallback to referrals table
      let referrerId: string | null = (profile as any)?.referred_by || null;
      if (!referrerId) {
        const { data: refRel } = await (supabase as any)
          .from('referrals')
          .select('referrer_id')
          .eq('referred_id', withdrawal.user_id)
          .maybeSingle();
        referrerId = (refRel as any)?.referrer_id || null;
      }
      console.log('[ApproveWithdrawal] user', withdrawal.user_id, 'referrerId', referrerId);
      let referralCommission = 0;
      let companyCommission = 0;
      let userReceives = 0;

      if (referrerId) {
        // User has referrer: User gets 80%, Referrer gets 10%, Company gets 10%
        userReceives = withdrawalAmount * 0.80;
        referralCommission = withdrawalAmount * 0.10;
        companyCommission = withdrawalAmount * 0.10;

        // Fetch referrer's current balance
        const { data: referrerProfile } = await (supabase as any)
          .from('profiles')
          .select('balance, total_earnings')
          .eq('user_id', referrerId)
          .maybeSingle();

        if (referrerProfile) {
          const newBalance = (referrerProfile.balance || 0) + referralCommission;
          const newTotalEarnings = (referrerProfile.total_earnings || 0) + referralCommission;
          
          // Update referrer's balance and earnings
          const { error: updRefProfileErr } = await (supabase as any)
            .from('profiles')
            .update({ 
              balance: newBalance,
              total_earnings: newTotalEarnings
            })
            .eq('user_id', referrerId);
          if (updRefProfileErr) {
            console.error('RLS/profile update error (referrer):', updRefProfileErr);
            throw new Error('Unable to credit referrer (profile update blocked).');
          }

          // Create transaction record for referral commission (include referee email for analytics)
          // Use RPC with SECURITY DEFINER to safely record referral commission
          const { error: refTxnErr } = await (supabase as any)
            .rpc('record_referral_commission', {
              p_referrer_id: referrerId,
              p_amount: referralCommission,
              p_description: `Referral commission from ${profile.email || 'referred user'}`,
            });
          if (refTxnErr) {
            console.error('RPC error (record_referral_commission):', refTxnErr);
            throw new Error('Unable to record referral commission.');
          }
        } else {
          console.warn('Referrer profile not found for', referrerId);
        }
      } else {
        // No referrer: User gets 80%, Company gets 20%
        userReceives = withdrawalAmount * 0.80;
        companyCommission = withdrawalAmount * 0.20;
      }

      // 4) Insert transaction for user withdrawal (deduct from balance)
      const { error: txnErr } = await (supabase as any)
        .from('transactions')
        .insert({
          user_id: withdrawal.user_id,
          type: 'withdrawal',
          amount: -withdrawalAmount,
          status: 'completed',
          method: paymentMethod,
          description: `Withdrawal of ₹${userReceives.toFixed(2)} (after ₹${(withdrawalAmount - userReceives).toFixed(2)} fees) | TXN: ${transactionId}`,
        });
      if (txnErr) throw txnErr;

      // 5) Update withdrawal row
      const { error: wdErr } = await (supabase as any)
        .from('withdrawals')
        .update({
          status: 'approved',
          payment_method: paymentMethod,
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawal.id);
      if (wdErr) throw wdErr;

      // 6) Deduct full withdrawal amount from user's balance
      const { error: balErr } = await (supabase as any)
        .from('profiles')
        .update({ balance: currentBalance - withdrawalAmount })
        .eq('user_id', withdrawal.user_id);
      if (balErr) throw balErr;

      toast.success(`Withdrawal approved! User receives: ₹${userReceives.toFixed(2)} | Referrer: ₹${referralCommission.toFixed(2)} | Company: ₹${companyCommission.toFixed(2)}`);
      onSuccess();
      onOpenChange(false);

      // Reset form
      setTransactionId("");
      setPaymentMethod("");
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error(error?.message || 'Failed to approve withdrawal');
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
            Requested: ₹{withdrawal.amount} | User receives: ₹{(withdrawal.amount * 0.80).toFixed(2)} | Fees (20%): ₹{(withdrawal.amount * 0.20).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Payment Methods */}
          {userPaymentMethods.length > 0 && (
            <div className="space-y-2">
              <Label>User's Payment Methods</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userPaymentMethods.map((method) => (
                  <Card key={method.id} className={method.is_default ? 'border-primary' : ''}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={method.is_default ? 'default' : 'secondary'} className="text-xs">
                          {method.is_default && '⭐ '}
                          {method.method_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {method.method_type === 'bank' && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Bank:</span>
                              <p className="font-medium">{method.bank_name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Holder:</span>
                              <p className="font-medium">{method.account_holder}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Account:</span>
                              <p className="font-medium">{method.account_number}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Routing:</span>
                              <p className="font-medium">{method.routing_number}</p>
                            </div>
                          </>
                        )}
                        {method.method_type === 'upi' && (
                          <div>
                            <span className="text-muted-foreground">UPI ID:</span>
                            <p className="font-medium">{method.upi_id}</p>
                          </div>
                        )}
                        {method.method_type === 'paypal' && (
                          <div>
                            <span className="text-muted-foreground">PayPal:</span>
                            <p className="font-medium">{method.paypal_email}</p>
                          </div>
                        )}
                        {method.method_type === 'crypto' && (
                          <>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Wallet:</span>
                              <p className="font-medium break-all text-xs">{method.crypto_wallet_address}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Network:</span>
                              <p className="font-medium">{method.crypto_network}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
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
