import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownToLine,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  Download,
  CreditCard,
  Settings,
} from "lucide-react";
import { WithdrawalLimitsModal } from "./WithdrawalLimitsModal";
import { toast } from "sonner";

const Withdrawals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch withdrawals from Supabase or use mock data
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from withdrawals table when it exists
      // For now use mock data
      setWithdrawals(mockWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const mockWithdrawals = [
    {
      id: "WTH-001247",
      user: "John Doe",
      email: "john.doe@example.com",
      amount: "₹850.00",
      method: "Bank Transfer",
      accountInfo: "**** 1234",
      status: "pending",
      date: "2024-01-15 14:30",
      fee: "₹17.00",
    },
    {
      id: "WTH-001246",
      user: "Jane Smith",
      email: "jane.smith@example.com",
      amount: "₹1,200.00",
      method: "PayPal",
      accountInfo: "jane***@email.com",
      status: "approved",
      date: "2024-01-15 12:15",
      fee: "₹24.00",
    },
    {
      id: "WTH-001245",
      user: "Mike Johnson",
      email: "mike.johnson@example.com",
      amount: "₹500.00",
      method: "Crypto",
      accountInfo: "1A1z***...xY9Z",
      status: "rejected",
      date: "2024-01-14 16:45",
      fee: "₹0.00",
    },
    {
      id: "WTH-001244",
      user: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      amount: "₹750.00",
      method: "Bank Transfer",
      accountInfo: "**** 5678",
      status: "approved",
      date: "2024-01-14 10:20",
      fee: "₹15.00",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "bank transfer":
        return <CreditCard className="h-4 w-4" />;
      case "paypal":
        return <DollarSign className="h-4 w-4" />;
      case "crypto":
        return <ArrowDownToLine className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ArrowDownToLine className="h-8 w-8 text-primary" />
            Withdrawal Management
          </h1>
          <p className="text-muted-foreground">Process and manage all user withdrawal requests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => setLimitsModalOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Limits
          </Button>
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Manual Withdrawal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                <p className="text-xl font-bold text-warning">8</p>
                <p className="text-xs text-muted-foreground">₹12,850.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-xl font-bold text-success">23</p>
                <p className="text-xs text-muted-foreground">₹18,750.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected This Week</p>
                <p className="text-xl font-bold text-destructive">12</p>
                <p className="text-xs text-muted-foreground">₹5,240.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total This Month</p>
                <p className="text-xl font-bold text-primary">₹156K</p>
                <p className="text-xs text-success">Processing fee: ₹780</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Withdrawal Requests</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-background/50 border-border/50"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Withdrawals</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method & Account</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-accent/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{withdrawal.id}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{withdrawal.user}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-lg">
                        {withdrawal.amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(withdrawal.method)}
                          <div>
                            <p className="font-medium">{withdrawal.method}</p>
                            <p className="text-sm text-muted-foreground">{withdrawal.accountInfo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {withdrawal.fee}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          {getStatusBadge(withdrawal.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {withdrawal.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast.info(`Viewing withdrawal details for ${withdrawal.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {withdrawal.status === "pending" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-success hover:text-success"
                                onClick={async () => {
                                  try {
                                    // TODO: Update withdrawal status in database
                                    const updatedWithdrawals = withdrawals.map(w => 
                                      w.id === withdrawal.id ? {...w, status: 'approved'} : w
                                    );
                                    setWithdrawals(updatedWithdrawals);
                                    toast.success(`Withdrawal ${withdrawal.id} approved successfully!`);
                                  } catch (error) {
                                    toast.error('Failed to approve withdrawal');
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={async () => {
                                  try {
                                    // TODO: Update withdrawal status in database
                                    const updatedWithdrawals = withdrawals.map(w => 
                                      w.id === withdrawal.id ? {...w, status: 'rejected'} : w
                                    );
                                    setWithdrawals(updatedWithdrawals);
                                    toast.error(`Withdrawal ${withdrawal.id} rejected`);
                                  } catch (error) {
                                    toast.error('Failed to reject withdrawal');
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Limits Modal */}
      <WithdrawalLimitsModal
        open={limitsModalOpen}
        onOpenChange={setLimitsModalOpen}
      />
    </div>
  );
};

export default Withdrawals;