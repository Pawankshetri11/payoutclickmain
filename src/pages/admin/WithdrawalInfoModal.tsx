import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Mail, Phone, Calendar, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function WithdrawalInfoModal({ open, onOpenChange, user }: WithdrawalInfoModalProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && open) {
      fetchWithdrawalData();
    }
  }, [user, open]);

  const fetchWithdrawalData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [txRes, wdRes, pmRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, amount, status, created_at, description')
          .eq('user_id', user.user_id)
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('withdrawals')
          .select('id, amount, status, created_at, payment_method')
          .eq('user_id', user.user_id)
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.user_id)
      ]);

      const txList = (txRes.data || []).map((t: any) => ({
        id: t.id,
        amount: Math.abs(t.amount),
        status: t.status,
        created_at: t.created_at,
        method: 'Transaction',
        type: 'transaction'
      }));

      const wdList = (wdRes.data || []).map((w: any) => ({
        id: w.id,
        amount: Math.abs(w.amount),
        status: w.status,
        created_at: w.created_at,
        method: w.payment_method || 'Bank Transfer',
        type: 'withdrawal'
      }));

      const combined = [...txList, ...wdList].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setWithdrawals(combined);
      setPaymentMethods(pmRes.data || []);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdrawal Information - {user.name}
          </DialogTitle>
          <DialogDescription>View user's withdrawal history and payment methods</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{user.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-bold text-primary">₹{user.balance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </h3>
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment methods added</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/50">
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {method.method_type.toUpperCase()}
                        {method.is_default && <Badge className="bg-primary/10 text-primary">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.method_type === 'bank' && `${method.bank_name} - ${method.account_number}`}
                        {method.method_type === 'upi' && method.upi_id}
                        {method.method_type === 'paytm' && method.paytm_number}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal History */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Withdrawal History</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No withdrawals yet</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/50">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">₹{withdrawal.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
