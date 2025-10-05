import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownToLine,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useReferral } from "@/hooks/useReferral";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WithdrawalNotification } from "@/components/WithdrawalNotification";
import { useNavigate } from "react-router-dom";

export default function WithdrawalRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { processReferralCommission } = useReferral();
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    paymentMethodId: "",
  });

  const [currentBalance, setCurrentBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState<string>("");
  const [userWithdrawals, setUserWithdrawals] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchUserWithdrawals();
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_methods' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods((data as any) || []);
      
      // Auto-select default method
      const defaultMethod = (data as any)?.find((m: any) => m.is_default);
      if (defaultMethod) {
        setWithdrawalForm(prev => ({ ...prev, paymentMethodId: defaultMethod.id }));
      }
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance, kyc_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      const balance = data?.balance || 0;
      setCurrentBalance(balance);
      setKycStatus(data?.kyc_status || 'pending');
      
      // Auto-populate amount with current balance
      if (balance > 0) {
        setWithdrawalForm(prev => ({ ...prev, amount: balance.toString() }));
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserWithdrawals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserWithdrawals(data || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
    }
  };
  const minWithdrawal = 100;
  const maxWithdrawal = 10000;

  const calculateFees = (amount: number) => {
    // Base withdrawal fee (10% company commission)
    const companyFee = amount * 0.10;
    
    // Processing fee (2%)
    const processingFee = amount * 0.02;
    
    const totalFee = companyFee + processingFee;
    const netAmount = amount - totalFee;

    return {
      companyFee,
      processingFee,
      totalFee,
      netAmount,
    };
  };

  const handleSubmitWithdrawal = async () => {
    // Check KYC status first
    if (kycStatus !== 'verified') {
      toast.error("Please complete KYC verification to withdraw funds", {
        action: {
          label: "Complete KYC",
          onClick: () => navigate("/user/complete-kyc")
        }
      });
      return;
    }

    const amount = parseFloat(withdrawalForm.amount);
    
    if (!amount || amount < minWithdrawal || amount > maxWithdrawal) {
      toast.error(`Amount must be between ₹${minWithdrawal} and ₹${maxWithdrawal}`);
      return;
    }

    if (amount > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!withdrawalForm.paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      // Calculate fees
      const fees = calculateFees(amount);
      
      // Get selected payment method details
      const selectedMethod = paymentMethods.find(m => m.id === withdrawalForm.paymentMethodId);
      
      if (!user) {
        toast.error("Please log in to submit withdrawal request");
        return;
      }
      
      // Create withdrawal transaction
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: amount,
          payment_method_id: withdrawalForm.paymentMethodId,
          status: 'pending',
          description: `Withdrawal request - ${selectedMethod?.method_type}`
        });

      if (insertError) throw insertError;

      // Deduct from user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: currentBalance - amount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success("Withdrawal request submitted successfully! It will be processed within 1-2 business days.");
      
      // Refresh data
      await fetchUserData();
      await fetchUserWithdrawals();
      
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal request: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedMethod = paymentMethods.find(m => m.id === withdrawalForm.paymentMethodId);
  const amount = parseFloat(withdrawalForm.amount) || 0;
  const fees = amount > 0 ? calculateFees(amount) : null;

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <ArrowDownToLine className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          Withdraw Money
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
          Request a withdrawal from your earnings
        </p>
      </div>

      {/* KYC Warning */}
      {kycStatus !== 'verified' && (
        <Alert className="mb-6 border-warning bg-warning/10">
          <ShieldAlert className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            <strong>KYC Verification Required!</strong> You must complete KYC verification before you can withdraw funds.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-warning hover:text-warning/80"
              onClick={() => navigate("/user/complete-kyc")}
            >
              Complete KYC Now →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Withdrawal Notification */}
      <WithdrawalNotification />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Withdrawal Request</CardTitle>
              <CardDescription>
                Minimum withdrawal: ₹{minWithdrawal} | Maximum: ₹{maxWithdrawal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                  min={minWithdrawal}
                  max={Math.min(maxWithdrawal, currentBalance)}
                />
                <p className="text-sm text-muted-foreground">
                  Available balance: ₹{currentBalance}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={withdrawalForm.paymentMethodId} onValueChange={(value) => setWithdrawalForm({...withdrawalForm, paymentMethodId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          {method.is_default && "⭐ "}
                          {method.method_type.toUpperCase()}
                          {method.method_type === 'bank' && ` - ${method.bank_name}`}
                          {method.method_type === 'upi' && ` - ${method.upi_id}`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {paymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No payment methods found. <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/user/withdrawal-methods')}>Add one now</Button>
                  </p>
                )}
              </div>

              {fees && amount > 0 && (
                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <h4 className="font-semibold text-foreground mb-3">Fee Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Withdrawal Amount:</span>
                      <span className="font-medium">₹{amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Fee (10%):</span>
                      <span className="text-destructive">-₹{fees.companyFee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Fee (2%):</span>
                      <span className="text-destructive">-₹{fees.processingFee?.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>You Will Receive:</span>
                        <span className="text-success">₹{fees.netAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmitWithdrawal}
                disabled={!amount || amount < minWithdrawal || amount > currentBalance || !withdrawalForm.paymentMethodId}
                className="w-full"
              >
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">₹{currentBalance}</div>
                <p className="text-sm text-muted-foreground mt-1">Available for withdrawal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Withdrawal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Amount:</span>
                <span className="font-medium">₹{minWithdrawal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Amount:</span>
                <span className="font-medium">₹{maxWithdrawal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-medium">1-2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company Fee:</span>
                <span className="font-medium">10%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Withdrawals */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant mt-8">
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
          <CardDescription>Your withdrawal history</CardDescription>
        </CardHeader>
        <CardContent>
          {userWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {userWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ArrowDownToLine className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{withdrawal.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.method || 'Bank Transfer'} • {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{withdrawal.amount}</p>
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowDownToLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No withdrawals yet</h3>
              <p className="text-muted-foreground">
                Your withdrawal history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}