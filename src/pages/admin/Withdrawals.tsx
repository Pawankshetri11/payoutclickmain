import { useState, useEffect } from "react";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ApproveWithdrawalModal } from "@/components/admin/ApproveWithdrawalModal";
import { WithdrawalInfoModal } from "./WithdrawalInfoModal";
import { WithdrawalDetailsModal } from "./WithdrawalDetailsModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Withdrawals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalInfoModalOpen, setWithdrawalInfoModalOpen] = useState(false);
  const [selectedUserForInfo, setSelectedUserForInfo] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedWithdrawalForDetails, setSelectedWithdrawalForDetails] = useState<any>(null);
  const { withdrawals, loading, refetch } = useWithdrawals();
  const { users, loading: usersLoading } = useUsers();

  // Calculate stats from real data
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    pendingAmount: withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0),
    approvedToday: withdrawals.filter(w => {
      const isApproved = w.status === 'approved';
      const isToday = new Date(w.created_at).toDateString() === new Date().toDateString();
      return isApproved && isToday;
    }).length,
    approvedTodayAmount: withdrawals
      .filter(w => {
        const isApproved = w.status === 'approved';
        const isToday = new Date(w.created_at).toDateString() === new Date().toDateString();
        return isApproved && isToday;
      })
      .reduce((sum, w) => sum + w.amount, 0),
    rejectedThisWeek: withdrawals.filter(w => {
      const isRejected = w.status === 'rejected';
      const isThisWeek = new Date(w.created_at) >= weekAgo;
      return isRejected && isThisWeek;
    }).length,
    rejectedThisWeekAmount: withdrawals
      .filter(w => {
        const isRejected = w.status === 'rejected';
        const isThisWeek = new Date(w.created_at) >= weekAgo;
        return isRejected && isThisWeek;
      })
      .reduce((sum, w) => sum + w.amount, 0),
    totalThisMonth: withdrawals.filter(w => new Date(w.created_at) >= monthStart).length,
    totalThisMonthAmount: withdrawals
      .filter(w => new Date(w.created_at) >= monthStart)
      .reduce((sum, w) => sum + w.amount, 0),
  };

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

  const handleApproveClick = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setApproveModalOpen(true);
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast.success('Withdrawal rejected');
      refetch();
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleInstantWithdrawal = async (userId: string, amount: number) => {
    try {
      // Validate KYC + Balance
      const { data: profile, error: pErr } = await (supabase as any)
        .from('profiles')
        .select('kyc_status, balance')
        .eq('user_id', userId)
        .maybeSingle();
      if (pErr) throw pErr;
      const balance = Number(profile?.balance || 0);
      if (!profile || profile.kyc_status !== 'verified') {
        toast.error('User KYC not verified. Skipping.');
        return;
      }
      if (balance < 100 || balance < Number(amount || 0)) {
        toast.error('User has insufficient balance (min ₹100).');
        return;
      }

      // Get default payment method (optional)
      const { data: pm } = await (supabase as any)
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      // Create a withdrawal REQUEST (pending) – no balance deduction here
      const { error: wdErr } = await (supabase as any)
        .from('withdrawals')
        .insert({
          user_id: userId,
          amount: Number(amount || 0),
          status: 'pending',
          payment_method: pm?.method_type || null,
        });
      if (wdErr) throw wdErr;

      toast.success('Instant withdrawal request created');
      refetch();
    } catch (error: any) {
      console.error('Error creating instant withdrawal request:', error);
      toast.error(error?.message || 'Failed to create withdrawal request');
    }
  };
  const handleBulkWithdrawal = async () => {
    const eligible = users.filter(u => u.balance >= 100 && u.kyc_status === 'verified');
    
    if (eligible.length === 0) {
      toast.error('No eligible users (KYC verified with balance ≥ ₹100).');
      return;
    }

    let created = 0;
    let skipped = 0;

    try {
      for (const user of eligible) {
        const amount = Number(user.balance || 0);
        if (amount < 100) { skipped++; continue; }

        // Fetch default payment method (optional)
        const { data: pm } = await (supabase as any)
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('is_default', true)
          .maybeSingle();

        // Create pending withdrawal request
        const { error: wdErr } = await (supabase as any)
          .from('withdrawals')
          .insert({
            user_id: user.user_id,
            amount: amount,
            status: 'pending',
            payment_method: pm?.method_type || null,
          });
        if (wdErr) { skipped++; continue; }

        created++;
      }

      if (created > 0) {
        toast.success(`Created ${created} withdrawal requests. Skipped ${skipped}.`);
        refetch();
      } else {
        toast.error('No withdrawal requests created.');
      }
    } catch (error: any) {
      console.error('Error creating bulk withdrawals:', error);
      toast.error('Failed to create bulk withdrawals');
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
                <p className="text-xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">₹{stats.pendingAmount.toFixed(2)}</p>
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
                <p className="text-xl font-bold text-success">{stats.approvedToday}</p>
                <p className="text-xs text-muted-foreground">₹{stats.approvedTodayAmount.toFixed(2)}</p>
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
                <p className="text-xl font-bold text-destructive">{stats.rejectedThisWeek}</p>
                <p className="text-xs text-muted-foreground">₹{stats.rejectedThisWeekAmount.toFixed(2)}</p>
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
                <p className="text-xl font-bold text-primary">{stats.totalThisMonth}</p>
                <p className="text-xs text-muted-foreground">₹{stats.totalThisMonthAmount.toFixed(2)}</p>
                <p className="text-xs text-success">Fee: ₹{(stats.totalThisMonthAmount * 0.20).toFixed(2)}</p>
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
             <TabsList className="grid w-full grid-cols-5">
               <TabsTrigger value="all">All Withdrawals</TabsTrigger>
               <TabsTrigger value="pending">Pending</TabsTrigger>
               <TabsTrigger value="approved">Approved</TabsTrigger>
               <TabsTrigger value="rejected">Rejected</TabsTrigger>
               <TabsTrigger value="with_balance">With Balance</TabsTrigger>
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
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading withdrawals...</p>
                      </TableCell>
                    </TableRow>
                  ) : withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">No withdrawals found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="hover:bg-accent/50">
                        <TableCell>
                          <p className="font-medium text-foreground">{withdrawal.id.substring(0, 10)}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{withdrawal.profiles?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary text-lg">
                          ₹{withdrawal.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon((withdrawal as any).method || (withdrawal as any).payment_method || 'bank')}
                            <div>
                              <p className="font-medium">{(withdrawal as any).method || (withdrawal as any).payment_method || 'Bank Transfer'}</p>
                              <p className="text-sm text-muted-foreground">***</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          ₹{(withdrawal.amount * 0.20).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{(withdrawal.amount * 0.80).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(withdrawal.status)}
                            {getStatusBadge(withdrawal.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(withdrawal.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedWithdrawalForDetails(withdrawal);
                                setDetailsModalOpen(true);
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
                                  onClick={() => handleApproveClick(withdrawal)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleReject(withdrawal.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Pending */}
            <TabsContent value="pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method & Account</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.filter(w=>w.status==='pending').map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-accent/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{withdrawal.id.substring(0, 10)}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{withdrawal.profiles?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-lg">₹{withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon((withdrawal as any).method || (withdrawal as any).payment_method || 'bank')}
                          <div>
                            <p className="font-medium">{(withdrawal as any).method || (withdrawal as any).payment_method || 'Bank Transfer'}</p>
                            <p className="text-sm text-muted-foreground">***</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">₹{(withdrawal.amount * 0.20).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₹{(withdrawal.amount * 0.80).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          {getStatusBadge(withdrawal.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(withdrawal.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedWithdrawalForDetails(withdrawal); setDetailsModalOpen(true); }}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-success hover:text-success" onClick={() => handleApproveClick(withdrawal)}>Approve</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleReject(withdrawal.id)}>Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Approved */}
            <TabsContent value="approved" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method & Account</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.filter(w=>w.status==='approved').map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-accent/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{withdrawal.id.substring(0, 10)}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{withdrawal.profiles?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-lg">₹{withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon((withdrawal as any).method || (withdrawal as any).payment_method || 'bank')}
                          <div>
                            <p className="font-medium">{(withdrawal as any).method || (withdrawal as any).payment_method || 'Bank Transfer'}</p>
                            <p className="text-sm text-muted-foreground">***</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">₹{(withdrawal.amount * 0.20).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₹{(withdrawal.amount * 0.80).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          {getStatusBadge(withdrawal.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(withdrawal.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedWithdrawalForDetails(withdrawal); setDetailsModalOpen(true); }}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Rejected */}
            <TabsContent value="rejected" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method & Account</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.filter(w=>w.status==='rejected').map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-accent/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{withdrawal.id.substring(0, 10)}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{withdrawal.profiles?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-lg">₹{withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon((withdrawal as any).method || (withdrawal as any).payment_method || 'bank')}
                          <div>
                            <p className="font-medium">{(withdrawal as any).method || (withdrawal as any).payment_method || 'Bank Transfer'}</p>
                            <p className="text-sm text-muted-foreground">***</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">₹{(withdrawal.amount * 0.20).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₹{(withdrawal.amount * 0.80).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          {getStatusBadge(withdrawal.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(withdrawal.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedWithdrawalForDetails(withdrawal); setDetailsModalOpen(true); }}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* With Balance Tab */
            }
            <TabsContent value="with_balance" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={handleBulkWithdrawal}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Create Bulk Withdrawal for All
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                      </TableCell>
                    </TableRow>
                  ) : users.filter(u => u.balance > 0).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No users with balance found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users
                      .filter(u => u.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .map((user) => (
                        <TableRow key={user.id} className="hover:bg-accent/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{user.email}</p>
                              <p className="text-sm text-muted-foreground">{user.phone || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-primary text-lg">
                            ₹{user.balance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForInfo(user);
                                  setWithdrawalInfoModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-primary hover:opacity-90"
                                onClick={() => handleInstantWithdrawal(user.user_id, user.balance)}
                              >
                                Instant Withdrawal
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
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

      {/* Approve Withdrawal Modal */}
      {selectedWithdrawal && (
        <ApproveWithdrawalModal
          open={approveModalOpen}
          onOpenChange={setApproveModalOpen}
          withdrawal={selectedWithdrawal}
          onSuccess={refetch}
        />
      )}

      {/* Withdrawal Info Modal */}
      {selectedUserForInfo && (
        <WithdrawalInfoModal
          open={withdrawalInfoModalOpen}
          onOpenChange={setWithdrawalInfoModalOpen}
          user={selectedUserForInfo}
        />
      )}

      {/* Withdrawal Details Modal */}
      {selectedWithdrawalForDetails && (
        <WithdrawalDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          withdrawal={selectedWithdrawalForDetails}
          onApprove={() => handleApproveClick(selectedWithdrawalForDetails)}
          onReject={() => handleReject(selectedWithdrawalForDetails.id)}
        />
      )}
    </div>
  );
};


export default Withdrawals;