import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star,
  Wallet,
  Trophy,
  Target,
  Calendar,
  DollarSign,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileStatsCard } from "@/components/user/MobileStatsCard";
import { useEarnings } from "@/hooks/useEarnings";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTasks } from "@/hooks/useTasks";

export default function UserDashboard() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { tasks, loading: tasksLoading } = useTasks();
  const { earnings, loading: earningsLoading, isWithdrawalPeriod } = useEarnings();

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  if (profileLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // New earnings-based stats
  const earningsStats = [
    {
      title: "Today's Earning",
      value: `₹${earnings.todayEarning.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
      change: "Today's tasks"
    },
    {
      title: "7 Day Earning",
      value: `₹${earnings.weekEarning.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "Last 7 days"
    },
    {
      title: "Month Earning",
      value: `₹${earnings.monthEarning.toFixed(2)}`,
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
      change: "This month"
    },
    {
      title: "Balance",
      value: `₹${earnings.balance.toFixed(2)}`,
      icon: Wallet,
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: isWithdrawalPeriod ? "Available now (26-30)" : "Available 26-30",
      highlight: isWithdrawalPeriod
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {isMobile && (
        <MobileStatsCard 
          balance={profile?.balance || 0}
          totalEarnings={profile?.total_earnings || 0}
          completedTasks={profile?.completed_tasks || 0}
          level={profile?.level || 'Bronze'}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Here's your dashboard overview</p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-center bg-gradient-primary text-primary-foreground border-0">
          <Star className="h-4 w-4 mr-1" />
          {profile?.level || 'Bronze'} Member
        </Badge>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {earningsStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-all ${stat.highlight ? 'ring-2 ring-warning/50 shadow-glow' : ''}`}
          >
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-xs text-muted-foreground mt-1 ${stat.highlight ? 'text-warning font-medium' : ''}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-2 md:p-3 rounded-full ${stat.bgColor} self-start md:self-auto`}>
                  <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdrawal Alert */}
      {isWithdrawalPeriod && (
        <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Wallet className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Withdrawal Period Active!</h3>
                  <p className="text-sm text-primary-foreground/90">
                    You can now withdraw your balance. Available until day 30 of this month.
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center md:text-left">
                <p>Withdrawals are processed automatically by admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading tasks...</p>
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tasks yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/user/tasks')}
                >
                  Browse Tasks
                </Button>
              </div>
            ) : (
              <>
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{task.jobs?.title || 'Task'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(task.submitted_at || task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.status === 'approved' ? 'default' : 
                          task.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className={
                          task.status === 'approved' ? 'bg-gradient-success text-success-foreground' : ''
                        }
                      >
                        {task.status}
                      </Badge>
                      <span className="font-medium text-primary">₹{task.amount}</span>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/user/my-tasks')}
                >
                  View All Tasks
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start bg-gradient-primary" 
              size="lg"
              onClick={() => navigate('/user/tasks')}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Browse Available Tasks
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/user/earnings')}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              View Earnings Report
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/user/withdrawal-methods')}
            >
              <Wallet className="h-5 w-5 mr-2" />
              Payment Methods
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/user/kyc')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Complete KYC Verification
            </Button>
          </CardContent>
        </Card>
      </div>

      {isMobile && (
        <Card className="bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-primary-foreground" />
            <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
            <p className="text-primary-foreground/80 mb-4">
              Complete {5 - ((profile?.completed_tasks || 0) % 5)} more tasks to reach the next level
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/user/tasks')}
            >
              Find New Tasks
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}