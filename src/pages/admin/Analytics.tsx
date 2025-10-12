import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, DollarSign, TrendingUp, CheckCircle, Clock, Activity } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import UserEarningsTable from "@/components/admin/UserEarningsTable";
import TaskEarningsTable from "@/components/admin/TaskEarningsTable";

const Analytics = () => {
  const { userStats, taskStats, userEarnings, taskEarnings, loading, refetch } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground">Complete platform analytics with user and task performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Details</TabsTrigger>
          <TabsTrigger value="tasks">Task Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-success">All registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₹{userStats.totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-success">Combined earnings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. per User</CardTitle>
                <TrendingUp className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₹{userStats.averagePerUser.toFixed(2)}</div>
                <p className="text-xs text-warning">Average earnings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                <Activity className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userStats.activeToday}</div>
                <p className="text-xs text-info">New signups today</p>
              </CardContent>
            </Card>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{taskStats.totalTasks.toLocaleString()}</div>
                <p className="text-xs text-success">All submissions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Task Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₹{taskStats.taskEarnings.toFixed(2)}</div>
                <p className="text-xs text-success">Total paid out</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{taskStats.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-success">Approval rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
                <Clock className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{taskStats.avgCompletionTime.toFixed(1)} min</div>
                <p className="text-xs text-warning">Average time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>User Earnings Details</CardTitle>
              <p className="text-sm text-muted-foreground">View detailed earnings, tasks, and dates for each user</p>
            </CardHeader>
            <CardContent>
              <UserEarningsTable userEarnings={userEarnings} onUserDeleted={refetch} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Task Performance Details</CardTitle>
              <p className="text-sm text-muted-foreground">View detailed task performance, user engagement, and earnings</p>
            </CardHeader>
            <CardContent>
              <TaskEarningsTable taskEarnings={taskEarnings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
