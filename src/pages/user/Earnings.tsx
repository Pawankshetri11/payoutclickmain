import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  Wallet,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Smartphone,
  Globe,
  Gamepad2,
  MessageSquare,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEarnings } from "@/hooks/useEarnings";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Code, Image as ImageIcon, Eye } from "lucide-react";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { useState as useStateReact } from "react";

export default function Earnings() {
  const navigate = useNavigate();
  const { earnings, loading } = useEarnings();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [manualWithdrawals, setManualWithdrawals] = useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    // SEO
    document.title = 'Earnings & Payments | PayoutClick';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) (meta as HTMLMetaElement).content = 'Earnings dashboard: total earned, monthly balance transfers, withdrawals 26–31.';

    if (!user) return;
    const load = async () => {
      try {
        const [txRes, wdRes] = await Promise.all([
          supabase
            .from('transactions')
            .select('id, type, amount, status, created_at, description')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100),
          (supabase as any)
            .from('withdrawals')
            .select('id, amount, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)
        ]);

        if (!txRes.error && txRes.data) {
          console.log('[Earnings] loaded transactions:', txRes.data.length);
          setUserTransactions(txRes.data || []);
        } else if (txRes.error) {
          console.error('Error loading transactions:', txRes.error);
        }

        if (!wdRes.error && wdRes.data) {
          console.log('[Earnings] loaded withdrawals:', wdRes.data.length);
          setManualWithdrawals(wdRes.data || []);
        } else if (wdRes.error) {
          console.error('Error loading withdrawals:', wdRes.error);
        }
      } catch (err) {
        console.error('Load earnings data error:', err);
      }
    };
    load();
  }, [user]);

  // Calculate earnings data from real data
  const earningsData = {
    totalEarned: earnings.totalEarned,
    currentBalance: earnings.balance,
    withdrawn: 0, // TODO: Track withdrawals
    pendingPayments: tasks.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0),
    thisMonth: earnings.monthEarning,
    lastMonth: 0, // TODO: Track last month
    growthRate: 0 // TODO: Calculate growth
  };

  // Build all transactions - combine tasks and user transactions
  const taskTransactions = tasks
    .filter(t => t.status === 'approved')
    .map(task => ({
      id: task.id,
      type: 'earning',
      title: task.jobs?.title || 'Task Earning',
      amount: task.amount,
      date: task.approved_at || task.submitted_at || task.created_at,
      status: 'completed',
      category: task.jobs?.category || 'general',
      icon: task.jobs?.type === 'code' ? Code : ImageIcon,
      isNegative: false
    }));

  // Map user transactions from transactions table
  const mappedTransactions = userTransactions
    .filter(tr => {
      const descLower = (tr.description || '').toLowerCase();
      const typeLower = (tr.type || '').toLowerCase();
      // Skip task earnings since they're already in taskTransactions
      return !descLower.includes('task earning') && 
             !descLower.includes('task completed');
    })
    .map(tr => {
      const typeLower = (tr.type || '').toLowerCase();
      const descLower = (tr.description || '').toLowerCase();
      const categoryLower = (tr.category || '').toLowerCase();
      
      // Determine what type of transaction this is
      const isReferralCommission = categoryLower === 'referral' || (typeLower === 'earning' && descLower.includes('referral commission'));
      const isAdminCredit = typeLower === 'earning' && descLower.includes('admin credit');
      const isAdminDebit = typeLower === 'withdrawal' && descLower.includes('admin debit');
      const isWithdrawal = typeLower === 'withdrawal';
      
      // Set display properties
      let title = tr.description || 'Transaction';
      let icon = Wallet;
      let displayType = tr.type;
      let isNegative = false;
      
      if (isReferralCommission) {
        title = 'Referral Commission';
        icon = Users;
        displayType = 'earning';
      } else if (isAdminCredit) {
        title = 'Admin Credit';
        icon = ArrowUpRight;
        displayType = 'earning';
      } else if (isAdminDebit) {
        title = 'Admin Debit';
        icon = ArrowDownRight;
        displayType = 'withdrawal';
        isNegative = true;
      } else if (isWithdrawal) {
        // All withdrawals should be negative, title should just be "Withdrawal"
        title = 'Withdrawal';
        icon = Wallet;
        displayType = 'withdrawal';
        isNegative = true;
      }
      
      return {
        id: tr.id,
        type: displayType,
        title,
        amount: Math.abs(tr.amount),
        date: tr.created_at,
        status: tr.status,
        category: isReferralCommission ? 'referral' : (isAdminCredit ? 'adjustment' : (isAdminDebit ? 'adjustment' : (isWithdrawal ? 'withdrawal' : 'earning'))),
        icon,
        isNegative,
        rawData: tr // Store original data for modal
      };
    });

  // Map legacy/manual withdrawals from withdrawals table
  const manualWithdrawalTransactions = manualWithdrawals.map(w => ({
    id: w.id,
    type: 'withdrawal',
    title: 'Withdrawal',
    amount: Math.abs(w.amount),
    date: w.created_at,
    status: w.status,
    category: 'withdrawal',
    icon: Wallet,
    isNegative: true,
    rawData: w // Store original data for modal
  }));

  const allTransactions = [...taskTransactions, ...mappedTransactions, ...manualWithdrawalTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions by category
  const transactions = allTransactions.slice(0, 10);
  const earningTransactions = allTransactions.filter(t => 
    t.category === 'earning' || t.category === 'task' || t.category === 'adjustment' || t.category === 'general'
  );
  const withdrawalTransactions = allTransactions.filter(t => 
    t.category === 'withdrawal' || t.category === 'debit'
  );
  const referralTransactions = allTransactions.filter(t => 
    t.category === 'referral'
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const recentEarnings = tasks
    .filter(t => t.status === 'approved')
    .sort((a, b) => new Date(b.approved_at || b.created_at).getTime() - new Date(a.approved_at || a.created_at).getTime())
    .slice(0, 5);
  
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Earnings & Payments</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your earnings and manage withdrawals</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">₹{earningsData.totalEarned}</div>
              <p className="text-xs text-muted-foreground hidden md:block">
                <span className="text-success">+{earningsData.growthRate}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Current Balance
              </CardTitle>
              <Wallet className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">₹{earningsData.currentBalance}</div>
              <p className="text-xs text-muted-foreground hidden md:block">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">₹{earningsData.thisMonth}</div>
              <p className="text-xs text-muted-foreground hidden md:block">
                <span className="text-success">+₹{earningsData.thisMonth - earningsData.lastMonth}</span> vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Pending Payments
              </CardTitle>
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">₹{earningsData.pendingPayments}</div>
              <p className="text-xs text-muted-foreground hidden md:block">
                Processing payments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Category Breakdown */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Earnings
            </CardTitle>
            <CardDescription>Your latest task completions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEarnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent earnings yet</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {recentEarnings.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/10">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{task.jobs?.title || 'Task'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(task.approved_at || task.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-success">+₹{task.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your earnings and payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate("/user/withdrawal-methods")}
              >
                View Payment Methods
                <CreditCard className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                Download Statement
                <Download className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                Tax Information
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-3 md:p-4 rounded-lg bg-info/10 border border-info/30">
              <h4 className="font-medium text-info mb-2 text-sm md:text-base">Payment Schedule</h4>
              <p className="text-xs md:text-sm text-info/80">
                Earnings transfer to Balance on the 1st of next month. Withdrawals are processed between 26–31 each month. Minimum withdrawal ₹100.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>All your earnings and withdrawal history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.isNegative 
                      ? 'bg-destructive/10' 
                      : 'bg-success/10'
                  }`}>
                    <transaction.icon className={`h-4 w-4 ${
                      transaction.isNegative 
                        ? 'text-destructive' 
                        : 'text-success'
                    }`} />
                  </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{transaction.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.isNegative 
                          ? 'text-destructive' 
                          : 'text-success'
                      }`}>
                        {transaction.isNegative ? '-' : '+'}₹{Math.abs(transaction.amount)}
                      </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      {(transaction.type === 'withdrawal' || transaction.category === 'adjustment') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="earnings" className="mt-6">
              <div className="space-y-3">
                {earningTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No earnings yet
                  </div>
                ) : (
                  earningTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <transaction.icon className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{transaction.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">+₹{transaction.amount}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        {(transaction.category === 'adjustment' || transaction.category === 'referral') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-6">
              <div className="space-y-3">
                {withdrawalTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No withdrawals yet</p>
                    <p className="text-sm mt-2">Withdrawals are processed automatically by admin</p>
                  </div>
                ) : (
                  withdrawalTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                          <Wallet className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{transaction.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-destructive">-₹{Math.abs(transaction.amount)}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="referrals" className="mt-6">
              <div className="space-y-3">
                {referralTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No referral earnings yet</p>
                    <p className="text-sm mt-2">Invite friends to earn commission</p>
                  </div>
                ) : (
                  referralTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <Users className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{transaction.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">+₹{transaction.amount}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}