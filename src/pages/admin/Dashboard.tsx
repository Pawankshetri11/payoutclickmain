import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStats } from "@/hooks/useAdminStats";
import {
  Users,
  Briefcase,
  CreditCard,
  ArrowDownToLine,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";

const Dashboard = () => {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </Button>
        </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
           <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
           <Users className="h-8 w-8 mb-4 opacity-90" />
           <h3 className="text-2xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</h3>
           <p className="text-blue-100 text-sm">Total Users</p>
         </div>
         
         <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
           <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
           <Briefcase className="h-8 w-8 mb-4 opacity-90" />
           <h3 className="text-2xl font-bold mb-1">{stats.activeJobs.toLocaleString()}</h3>
           <p className="text-emerald-100 text-sm">Active Jobs</p>
         </div>
         
         <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
           <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
           <CreditCard className="h-8 w-8 mb-4 opacity-90" />
           <h3 className="text-2xl font-bold mb-1">₹{stats.totalDeposits.toLocaleString()}</h3>
           <p className="text-purple-100 text-sm">Total Deposits</p>
         </div>
         
         <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
           <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
           <ArrowDownToLine className="h-8 w-8 mb-4 opacity-90" />
           <h3 className="text-2xl font-bold mb-1">₹{stats.pendingWithdrawals.toLocaleString()}</h3>
           <p className="text-orange-100 text-sm">Pending Withdrawals</p>
         </div>
       </div>

       {/* Quick Insights */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-green-600">Today's Revenue</p>
                 <p className="text-2xl font-bold text-green-700">₹{stats.todayRevenue.toLocaleString()}</p>
               </div>
               <TrendingUp className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
         
         <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-blue-600">Tasks Completed</p>
                 <p className="text-2xl font-bold text-blue-700">{stats.tasksCompleted.toLocaleString()}</p>
               </div>
               <CheckCircle className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
         
         <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-amber-600">Pending Reviews</p>
                 <p className="text-2xl font-bold text-amber-700">{stats.pendingReviews.toLocaleString()}</p>
               </div>
               <Clock className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
       </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                action: "New user registration",
                user: "john.doe@example.com",
                time: "2 minutes ago",
                status: "success",
              },
              {
                action: "Job submission",
                user: "Design project #1247",
                time: "5 minutes ago",
                status: "pending",
              },
              {
                action: "Withdrawal request",
                user: "₹500.00 - jane.smith",
                time: "10 minutes ago",
                status: "warning",
              },
              {
                action: "Support ticket",
                user: "Ticket #4821",
                time: "15 minutes ago",
                status: "error",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-success/10 text-success' :
                    activity.status === 'pending' ? 'bg-warning/10 text-warning' :
                    activity.status === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {activity.status === 'success' && <CheckCircle className="h-4 w-4" />}
                    {activity.status === 'pending' && <Clock className="h-4 w-4" />}
                    {activity.status === 'warning' && <AlertCircle className="h-4 w-4" />}
                    {activity.status === 'error' && <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-success">Server Status</span>
                  <Badge variant="outline" className="border-success text-success">Online</Badge>
                </div>
                <p className="text-xs text-success/80 mt-1">All systems operational</p>
              </div>
              
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warning">Database</span>
                  <Badge variant="outline" className="border-warning text-warning">Warning</Badge>
                </div>
                <p className="text-xs text-warning/80 mt-1">High load detected</p>
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-success">API Status</span>
                  <Badge variant="outline" className="border-success text-success">Healthy</Badge>
                </div>
                <p className="text-xs text-success/80 mt-1">Response time: 120ms</p>
              </div>

              <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-info">Backup</span>
                  <Badge variant="outline" className="border-info text-info">Completed</Badge>
                </div>
                <p className="text-xs text-info/80 mt-1">Last: 2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;