import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Trash2, Star, CreditCard, Smartphone, DollarSign, Bitcoin, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PaymentMethod {
  id: string;
  method_type: 'bank' | 'upi' | 'paypal' | 'crypto';
  is_default: boolean;
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  routing_number?: string;
  account_type?: string;
  upi_id?: string;
  paypal_email?: string;
  crypto_wallet_address?: string;
  crypto_network?: string;
}

export default function WithdrawalMethods() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMethod, setNewMethod] = useState({
    method_type: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    upi_id: '',
    paypal_email: '',
    crypto_wallet_address: '',
    crypto_network: '',
  });

  useEffect(() => {
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
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!user) return;
    
    if (!newMethod.method_type) {
      toast.error('Please select a payment method type');
      return;
    }

    // Validate based on method type
    if (newMethod.method_type === 'bank' && (!newMethod.bank_name || !newMethod.account_number || !newMethod.account_holder)) {
      toast.error('Please fill all bank details');
      return;
    }
    if (newMethod.method_type === 'upi' && !newMethod.upi_id) {
      toast.error('Please enter UPI ID');
      return;
    }
    if (newMethod.method_type === 'paypal' && !newMethod.paypal_email) {
      toast.error('Please enter PayPal email');
      return;
    }
    if (newMethod.method_type === 'crypto' && (!newMethod.crypto_wallet_address || !newMethod.crypto_network)) {
      toast.error('Please fill all crypto details');
      return;
    }

    try {
      // If this is the first method, make it default
      const isFirstMethod = paymentMethods.length === 0;

      const { error } = await supabase
        .from('payment_methods' as any)
        .insert({
          user_id: user.id,
          method_type: newMethod.method_type,
          is_default: isFirstMethod,
          bank_name: newMethod.bank_name || null,
          account_holder: newMethod.account_holder || null,
          account_number: newMethod.account_number || null,
          routing_number: newMethod.routing_number || null,
          account_type: newMethod.account_type || null,
          upi_id: newMethod.upi_id || null,
          paypal_email: newMethod.paypal_email || null,
          crypto_wallet_address: newMethod.crypto_wallet_address || null,
          crypto_network: newMethod.crypto_network || null,
        });

      if (error) throw error;

      toast.success('Payment method added successfully');
      setShowAddDialog(false);
      setNewMethod({
        method_type: '',
        bank_name: '',
        account_holder: '',
        account_number: '',
        routing_number: '',
        account_type: '',
        upi_id: '',
        paypal_email: '',
        crypto_wallet_address: '',
        crypto_network: '',
      });
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user) return;
    
    try {
      // Unset all defaults first
      await supabase
        .from('payment_methods' as any)
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set the selected one as default
      const { error } = await supabase
        .from('payment_methods' as any)
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;

      toast.success('Default payment method updated');
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default method');
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods' as any)
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      toast.success('Payment method deleted');
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank': return <CreditCard className="h-5 w-5" />;
      case 'upi': return <Smartphone className="h-5 w-5" />;
      case 'paypal': return <DollarSign className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          Withdrawal Methods
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your payment methods for withdrawals
        </p>
      </div>

      {/* Earning Schedule Info */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Earning & Withdrawal Schedule:</strong><br/>
          Your earnings from the 1st to the end of each month will be added to your balance on the 1st of the following month. 
          You can withdraw your balance between the 26th and 31st of each month.
          <br/>
          <span className="text-muted-foreground text-xs mt-1 block">
            Example: September earnings (Sep 1-30) → Added to balance on Oct 1 → Available for withdrawal Oct 26-31
          </span>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Payment Methods</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new withdrawal method to your account
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method Type</Label>
                <Select value={newMethod.method_type} onValueChange={(value) => setNewMethod({...newMethod, method_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMethod.method_type === 'bank' && (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="Enter bank name"
                      value={newMethod.bank_name}
                      onChange={(e) => setNewMethod({...newMethod, bank_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input
                      placeholder="Enter account holder name"
                      value={newMethod.account_holder}
                      onChange={(e) => setNewMethod({...newMethod, account_holder: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Enter account number"
                      value={newMethod.account_number}
                      onChange={(e) => setNewMethod({...newMethod, account_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Routing Number / IFSC</Label>
                    <Input
                      placeholder="Enter routing/IFSC code"
                      value={newMethod.routing_number}
                      onChange={(e) => setNewMethod({...newMethod, routing_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select value={newMethod.account_type} onValueChange={(value) => setNewMethod({...newMethod, account_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {newMethod.method_type === 'upi' && (
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input
                    placeholder="example@upi"
                    value={newMethod.upi_id}
                    onChange={(e) => setNewMethod({...newMethod, upi_id: e.target.value})}
                  />
                </div>
              )}

              {newMethod.method_type === 'paypal' && (
                <div className="space-y-2">
                  <Label>PayPal Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={newMethod.paypal_email}
                    onChange={(e) => setNewMethod({...newMethod, paypal_email: e.target.value})}
                  />
                </div>
              )}

              {newMethod.method_type === 'crypto' && (
                <>
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="Enter wallet address"
                      value={newMethod.crypto_wallet_address}
                      onChange={(e) => setNewMethod({...newMethod, crypto_wallet_address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select value={newMethod.crypto_network} onValueChange={(value) => setNewMethod({...newMethod, crypto_network: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="usdt-trc20">USDT (TRC20)</SelectItem>
                        <SelectItem value="usdt-erc20">USDT (ERC20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button onClick={handleAddMethod} className="w-full">
                Add Payment Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.is_default ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(method.method_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {method.method_type.toUpperCase()}
                      </CardTitle>
                      {method.is_default && (
                        <Badge variant="default" className="mt-1">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {method.method_type === 'bank' && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Bank:</span>
                        <p className="font-medium">{method.bank_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Account Holder:</span>
                        <p className="font-medium">{method.account_holder}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Account Number:</span>
                        <p className="font-medium">****{method.account_number?.slice(-4)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Routing:</span>
                        <p className="font-medium">{method.routing_number}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{method.account_type}</p>
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
                      <span className="text-muted-foreground">PayPal Email:</span>
                      <p className="font-medium">{method.paypal_email}</p>
                    </div>
                  )}
                  {method.method_type === 'crypto' && (
                    <>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Wallet Address:</span>
                        <p className="font-medium break-all">{method.crypto_wallet_address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <p className="font-medium uppercase">{method.crypto_network}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method to start receiving withdrawals
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
