import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Landmark, Wallet, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function WithdrawalMethods() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const hasBankDetails = userProfile?.bank_account_number && userProfile?.bank_name;

  if (loading) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Withdrawal Methods</h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
          Your payment methods for withdrawals
        </p>
      </div>

      {/* Earning Schedule Information */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Automatic Withdrawal Schedule:</strong> Your earnings from the 1st to the end of each month will be added to your balance on the 1st of the following month. 
          You can withdraw your balance between the 26th and 31st of each month. For example, earnings from September 1-30 will be added to your balance on October 1st, 
          and you can withdraw them between October 26-31.
        </AlertDescription>
      </Alert>

      {/* Bank Account Details */}
      {hasBankDetails ? (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Landmark className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Bank Account</CardTitle>
                  <CardDescription>
                    Your registered bank account for withdrawals
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                <p className="text-sm font-medium mt-1">{userProfile?.bank_account_holder || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                <p className="text-sm font-medium font-mono mt-1">****{userProfile?.bank_account_number?.slice(-4)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                <p className="text-sm font-medium mt-1">{userProfile?.bank_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Routing/IFSC Code</label>
                <p className="text-sm font-medium font-mono mt-1">{userProfile?.bank_routing_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                <p className="text-sm font-medium capitalize mt-1">{userProfile?.bank_account_type || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Method Added</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Please complete your KYC verification and add your bank details to receive withdrawals.
            </p>
            <Button onClick={() => window.location.href = '/user/complete-kyc'}>
              Complete KYC Verification
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
          <CardDescription>Platform withdrawal policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal Amount</Label>
              <Input id="minWithdrawal" value="$10.00" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWithdrawal">Maximum Withdrawal Amount</Label>
              <Input id="maxWithdrawal" value="$5,000.00" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processingTime">Processing Time</Label>
            <Input id="processingTime" value="1-3 business days" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdrawalFee">Withdrawal Fee</Label>
            <Input id="withdrawalFee" value="2.5% or $2.50 minimum" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}