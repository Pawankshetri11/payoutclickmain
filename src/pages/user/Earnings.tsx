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
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Earnings() {
  const navigate = useNavigate();
  const earningsData = {
    totalEarned: 1250,
    currentBalance: 750,
    withdrawn: 500,
    pendingPayments: 125,
    thisMonth: 650,
    lastMonth: 480,
    growthRate: 35.4
  };

  const transactions = [
    {
      id: 1,
      type: "earning",
      title: "Google Review Task",
      amount: 25,
      date: "2024-01-16",
      status: "completed",
      category: "review",
      icon: Star
    },
    {
      id: 2,
      type: "earning",
      title: "App Installation",
      amount: 35,
      date: "2024-01-15",
      status: "completed",
      category: "app",
      icon: Smartphone
    },
    {
      id: 3,
      type: "withdrawal",
      title: "Bank Transfer",
      amount: -200,
      date: "2024-01-14",
      status: "completed",
      category: "withdrawal",
      icon: CreditCard
    },
    {
      id: 4,
      type: "earning",
      title: "Website Survey",
      amount: 20,
      date: "2024-01-14",
      status: "completed",
      category: "survey",
      icon: Globe
    },
    {
      id: 5,
      type: "earning",
      title: "Game Task",
      amount: 50,
      date: "2024-01-13",
      status: "pending",
      category: "game",
      icon: Gamepad2
    },
    {
      id: 6,
      type: "earning",
      title: "Social Media Task",
      amount: 15,
      date: "2024-01-12",
      status: "completed",
      category: "social",
      icon: MessageSquare
    },
    {
      id: 7,
      type: "withdrawal",
      title: "PayPal Transfer",
      amount: -300,
      date: "2024-01-10",
      status: "completed",
      category: "withdrawal",
      icon: CreditCard
    },
  ];

  const monthlyData = [
    { month: "Aug", earnings: 320 },
    { month: "Sep", earnings: 445 },
    { month: "Oct", earnings: 380 },
    { month: "Nov", earnings: 520 },
    { month: "Dec", earnings: 480 },
    { month: "Jan", earnings: 650 },
  ];

  const categoryEarnings = [
    { category: "Reviews", amount: 375, percentage: 30, icon: Star, color: "text-warning" },
    { category: "App Install", amount: 315, percentage: 25.2, icon: Smartphone, color: "text-primary" },
    { category: "Surveys", amount: 250, percentage: 20, icon: Globe, color: "text-success" },
    { category: "Games", amount: 200, percentage: 16, icon: Gamepad2, color: "text-accent" },
    { category: "Social Media", amount: 110, percentage: 8.8, icon: MessageSquare, color: "text-info" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

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
              Earnings by Category
            </CardTitle>
            <CardDescription>Your earnings breakdown by task type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryEarnings.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <category.icon className={`h-4 w-4 ${category.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{category.category}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">₹{category.amount}</p>
                </div>
              </div>
            ))}
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
              <div className="p-3 md:p-4 rounded-lg bg-info/10 border border-info/30">
                <h4 className="font-medium text-info mb-2 text-sm md:text-base">Automatic Withdrawals</h4>
                <p className="text-xs md:text-sm text-info/80">
                  Withdrawals are now processed automatically by the admin. Your funds will be transferred to your registered payment method.
                </p>
              </div>
              
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
                Payments are processed every Friday. Minimum withdrawal amount is ₹100.
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="earnings">Earnings Only</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${transaction.type === 'earning' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <transaction.icon className={`h-4 w-4 ${transaction.type === 'earning' ? 'text-success' : 'text-destructive'}`} />
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
                      <p className={`text-sm font-medium ${transaction.type === 'earning' ? 'text-success' : 'text-destructive'}`}>
                        {transaction.type === 'earning' ? '+' : ''}₹{Math.abs(transaction.amount)}
                      </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="earnings" className="mt-6">
              <div className="space-y-3">
                {transactions.filter(t => t.type === 'earning').map((transaction) => (
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
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-6">
              <div className="space-y-3">
                {transactions.filter(t => t.type === 'withdrawal').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-destructive/10">
                       <transaction.icon className="h-4 w-4 text-destructive" />
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
                        <p className="text-sm font-medium text-destructive">₹{Math.abs(transaction.amount)}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}