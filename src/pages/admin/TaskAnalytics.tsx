import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const TaskAnalytics = () => {
  const { taskStats, loading } = useAnalytics();

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
        <h2 className="text-3xl font-bold text-foreground">Task Analytics</h2>
        <p className="text-muted-foreground">Monitor task performance, completion rates, and earnings</p>
      </div>

      {/* Key Metrics Cards */}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{taskStats.avgCompletionTime.toFixed(1)} min</div>
            <p className="text-xs text-warning">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Task Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="text-lg font-bold text-foreground">{taskStats.totalTasks}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-lg font-bold text-success">{taskStats.completionRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: `${taskStats.completionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Earnings & Timing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Paid Out</span>
                <span className="text-lg font-bold text-success">₹{taskStats.taskEarnings.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-warning" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Completion Time</span>
                <span className="text-lg font-bold text-info">{taskStats.avgCompletionTime.toFixed(1)} min</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-info" style={{ width: `${Math.min(taskStats.avgCompletionTime / 30 * 100, 100)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Task Stats */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>Detailed Task Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-primary">
                <Briefcase className="h-5 w-5" />
                <span className="font-semibold">Task Volume</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Submissions</span>
                  <span className="font-medium text-foreground">{taskStats.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-medium text-success">{Math.round(taskStats.totalTasks * taskStats.completionRate / 100)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Quality Metrics</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approval Rate</span>
                  <span className="font-medium text-success">{taskStats.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Time</span>
                  <span className="font-medium text-info">{taskStats.avgCompletionTime.toFixed(1)} min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-success">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Financial Impact</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-foreground">₹{taskStats.taskEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Task Avg</span>
                  <span className="font-medium text-warning">
                    ₹{taskStats.totalTasks > 0 ? (taskStats.taskEarnings / taskStats.totalTasks).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAnalytics;