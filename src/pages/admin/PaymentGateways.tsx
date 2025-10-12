import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Smartphone,
  Building2,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2,
  QrCode,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentGateways = () => {
  const { toast } = useToast();
  const [activeGateways, setActiveGateways] = useState({
    upi: true,
    manual: true,
    razorpay: false,
    paytm: false,
    phonepe: false,
    googlepay: false
  });

  const paymentMethods = [
    {
      id: 1,
      name: "UPI QR Code",
      type: "upi",
      icon: QrCode,
      enabled: true,
      config: {
        merchantId: "test@upi",
        displayName: "PayoutClick"
      }
    },
    {
      id: 2,
      name: "Manual Payment",
      type: "manual",
      icon: IndianRupee,
      enabled: true,
      config: {
        bankAccount: "1234567890",
        ifscCode: "HDFC0001234",
        accountHolder: "PayoutClick Pvt Ltd"
      }
    },
    {
      id: 3,
      name: "Razorpay",
      type: "razorpay",
      icon: CreditCard,
      enabled: false,
      config: {
        keyId: "rzp_test_...",
        keySecret: "••••••••••••"
      }
    },
    {
      id: 4,
      name: "Paytm",
      type: "paytm",
      icon: Smartphone,
      enabled: false,
      config: {
        merchantId: "PAYTM_...",
        merchantKey: "••••••••••••"
      }
    }
  ];

  const recentTransactions = [
    {
      id: "TXN001",
      user: "John Doe",
      method: "UPI",
      amount: 150,
      status: "completed",
      timestamp: "2024-01-15 14:30:00",
      gatewayRef: "UPI123456789"
    },
    {
      id: "TXN002",
      user: "Jane Smith",
      method: "Manual",
      amount: 250,
      status: "pending",
      timestamp: "2024-01-15 13:45:00",
      gatewayRef: "MAN987654321"
    },
    {
      id: "TXN003",
      user: "Mike Johnson",
      method: "Razorpay",
      amount: 500,
      status: "failed",
      timestamp: "2024-01-15 12:15:00",
      gatewayRef: "RZP789123456"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case "failed":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleToggleGateway = (gateway: string, enabled: boolean) => {
    setActiveGateways(prev => ({
      ...prev,
      [gateway]: enabled
    }));
    
    toast({
      title: enabled ? "Gateway Enabled" : "Gateway Disabled",
      description: `${gateway.toUpperCase()} payment method has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Payment Gateways
          </h1>
          <p className="text-muted-foreground">Manage payment methods and gateway configurations</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Active Gateways</p>
                <p className="text-xl font-bold text-success">
                  {Object.values(activeGateways).filter(Boolean).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Volume</p>
                <p className="text-xl font-bold text-primary">₹12,847</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-warning">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold text-info">97.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gateways">Payment Methods</TabsTrigger>
          <TabsTrigger value="upi-config">UPI Configuration</TabsTrigger>
          <TabsTrigger value="manual-config">Manual Payments</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="bg-gradient-card border-border/50 shadow-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <method.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                        <CardDescription className="capitalize">{method.type} payment</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={(checked) => handleToggleGateway(method.type, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(method.config).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* UPI Configuration */}
        <TabsContent value="upi-config" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                UPI QR Code Configuration
              </CardTitle>
              <CardDescription>
                Configure UPI payment settings and QR code generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input 
                      id="upi-id" 
                      placeholder="merchant@upi" 
                      defaultValue="payoutclick@paytm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant-name">Merchant Name</Label>
                    <Input 
                      id="merchant-name" 
                      placeholder="Your Business Name" 
                      defaultValue="PayoutClick"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant-code">Merchant Code (Optional)</Label>
                    <Input 
                      id="merchant-code" 
                      placeholder="MERCHANT123"
                      defaultValue="PAYOUT001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auto-amount">Enable Auto Amount Detection</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-amount" defaultChecked />
                      <span className="text-sm text-muted-foreground">
                        Automatically include amount in QR code
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">QR Code Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      Save configuration to generate QR code
                    </p>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-success hover:bg-success/90">
                Save UPI Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Payment Configuration */}
        <TabsContent value="manual-config" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Manual Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure bank details for manual payments and transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-holder">Account Holder Name</Label>
                    <Input 
                      id="account-holder" 
                      placeholder="Account Holder Name"
                      defaultValue="PayoutClick Pvt Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input 
                      id="account-number" 
                      placeholder="1234567890123456"
                      defaultValue="1234567890123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc-code">IFSC Code</Label>
                    <Input 
                      id="ifsc-code" 
                      placeholder="HDFC0001234"
                      defaultValue="HDFC0001234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input 
                      id="bank-name" 
                      placeholder="HDFC Bank"
                      defaultValue="HDFC Bank"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-name">Branch Name</Label>
                    <Input 
                      id="branch-name" 
                      placeholder="Mumbai Main Branch"
                      defaultValue="Mumbai Main Branch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swift-code">SWIFT Code (For International)</Label>
                    <Input 
                      id="swift-code" 
                      placeholder="HDFCINBB"
                      defaultValue="HDFCINBB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-amount">Minimum Amount</Label>
                    <Input 
                      id="min-amount" 
                      type="number"
                      placeholder="100"
                      defaultValue="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processing-time">Processing Time</Label>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="6">6 Hours</SelectItem>
                        <SelectItem value="24">24 Hours</SelectItem>
                        <SelectItem value="72">3 Business Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-instructions">Payment Instructions</Label>
                <Textarea 
                  id="payment-instructions"
                  placeholder="Enter instructions for users making manual payments..."
                  defaultValue="Please transfer the amount to the above bank account and share the transaction screenshot/reference number for verification."
                  rows={3}
                />
              </div>
              <Button className="w-full bg-success hover:bg-success/90">
                Save Bank Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions across all gateways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-accent/50">
                      <TableCell className="font-mono text-sm">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.user}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.method}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        ₹{transaction.amount}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {transaction.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGateways;