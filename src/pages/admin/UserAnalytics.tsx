import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const UserAnalytics = () => {
  const { userStats, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        <h2 className="text-3xl font-bold text-foreground">User Analytics</h2>
        <p className="text-muted-foreground">Track user performance, earnings, and engagement metrics</p>
      </div>

      {/* Key Metrics Cards */}
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

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>User Growth Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-lg font-bold text-foreground">{userStats.totalUsers}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Today</span>
                <span className="text-lg font-bold text-success">{userStats.activeToday}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success" 
                  style={{ width: `${userStats.totalUsers > 0 ? (userStats.activeToday / userStats.totalUsers * 100) : 0}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Earnings Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Earnings</span>
                <span className="text-lg font-bold text-success">₹{userStats.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-warning" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average per User</span>
                <span className="text-lg font-bold text-warning">₹{userStats.averagePerUser.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning" 
                  style={{ width: `${userStats.totalEarnings > 0 ? (userStats.averagePerUser / userStats.totalEarnings * 100) : 0}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>Detailed User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="font-semibold">User Metrics</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Registered</span>
                  <span className="font-medium text-foreground">{userStats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Today</span>
                  <span className="font-medium text-success">{userStats.activeToday}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-success">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Earnings Metrics</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned</span>
                  <span className="font-medium text-foreground">₹{userStats.totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per User Avg</span>
                  <span className="font-medium text-warning">₹{userStats.averagePerUser.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-info">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Growth Rate</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Rate</span>
                  <span className="font-medium text-info">
                    {userStats.totalUsers > 0 ? ((userStats.activeToday / userStats.totalUsers) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;