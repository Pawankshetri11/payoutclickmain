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
    method: "",
    accountId: "",
  });

  const [currentBalance, setCurrentBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState<string>("");

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance, kyc_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setCurrentBalance(data?.balance || 0);
      setKycStatus(data?.kyc_status || 'pending');
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };
  const minWithdrawal = 100;
  const maxWithdrawal = 10000;

  const withdrawalMethods = [
    {
      id: "bank_1",
      type: "Bank Transfer",
      name: "HDFC Bank ****1234",
      icon: CreditCard,
      fee: "2%",
      processingTime: "1-2 business days",
    },
    {
      id: "paypal_1", 
      type: "PayPal",
      name: "john***@email.com",
      icon: DollarSign,
      fee: "3%",
      processingTime: "Instant",
    },
  ];

  const recentWithdrawals = [
    {
      id: "WTH-001",
      amount: 500,
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-10",
      netAmount: 450,
    },
    {
      id: "WTH-002", 
      amount: 300,
      method: "PayPal",
      status: "pending",
      date: "2024-01-15",
      netAmount: 270,
    },
  ];

  const calculateFees = (amount: number, method: string) => {
    const methodData = withdrawalMethods.find(m => m.id === method);
    if (!methodData) return { fee: 0, netAmount: amount };

    // Base withdrawal fee (10% company commission)
    const companyFee = amount * 0.10;
    
    // Additional processing fee based on method
    const processingFeeRate = methodData.fee === "2%" ? 0.02 : 0.03;
    const processingFee = amount * processingFeeRate;
    
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

    if (!withdrawalForm.method) {
      toast.error("Please select a withdrawal method");
      return;
    }

    try {
      // Calculate fees
      const fees = calculateFees(amount, withdrawalForm.method);
      
      if (!user) {
        toast.error("Please log in to submit withdrawal request");
        return;
      }
      
      // For now use mock submission since withdrawals table doesn't exist yet
      // TODO: Create withdrawals table in Supabase schema
      console.log("Submitting withdrawal:", {
        user_id: user.id,
        amount: amount,
        method: withdrawalForm.method,
        account_id: withdrawalForm.accountId || selectedMethod?.name,
        company_fee: fees.companyFee,
        processing_fee: fees.processingFee,
        total_fee: fees.totalFee,
        net_amount: fees.netAmount,
        status: 'pending',
        requested_at: new Date().toISOString()
      });

      toast.success("Withdrawal request submitted successfully! It will be processed within 1-2 business days.");
      
      // Reset form
      setWithdrawalForm({
        amount: "",
        method: "",
        accountId: "",
      });
      
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

  const selectedMethod = withdrawalMethods.find(m => m.id === withdrawalForm.method);
  const amount = parseFloat(withdrawalForm.amount) || 0;
  const fees = selectedMethod ? calculateFees(amount, withdrawalForm.method) : null;

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
                <Label htmlFor="method">Withdrawal Method</Label>
                <Select value={withdrawalForm.method} onValueChange={(value) => setWithdrawalForm({...withdrawalForm, method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    {withdrawalMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4" />
                          {method.name} ({method.fee} fee)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMethod && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedMethod.type} • Processing time: {selectedMethod.processingTime}
                  </AlertDescription>
                </Alert>
              )}

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
                      <span className="text-muted-foreground">Processing Fee ({selectedMethod.fee}):</span>
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
                disabled={!amount || amount < minWithdrawal || amount > currentBalance || !withdrawalForm.method}
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
          {recentWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ArrowDownToLine className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{withdrawal.id}</p>
                      <p className="text-sm text-muted-foreground">{withdrawal.method} • {withdrawal.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{withdrawal.amount}</p>
                      <p className="text-sm text-muted-foreground">Net: ₹{withdrawal.netAmount}</p>
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