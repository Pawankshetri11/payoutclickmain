import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, DollarSign, Trophy, GamepadIcon, Activity, Eye, Briefcase } from "lucide-react";
import { useState } from "react";

const UserAnalytics = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Dummy data for individual user details
  const getUserDetails = (userName: string) => {
    return {
      name: userName,
      totalEarnings: 12540,
      tasksCompleted: 156,
      gamesPlayed: 89,
      avgTaskEarning: 28.5,
      joinDate: '2024-01-15',
      lastActive: '2024-01-21',
      taskBreakdown: [
        { taskType: 'Data Entry', completed: 45, earnings: 1350, avgEarning: 30 },
        { taskType: 'Content Writing', completed: 23, earnings: 1840, avgEarning: 80 },
        { taskType: 'Image Tagging', completed: 67, earnings: 670, avgEarning: 10 },
        { taskType: 'Survey Completion', completed: 21, earnings: 315, avgEarning: 15 }
      ],
      monthlyProgress: [
        { month: 'Jan', taskEarnings: 2200, gameEarnings: 1800, tasks: 35 },
        { month: 'Feb', taskEarnings: 2800, gameEarnings: 2100, tasks: 42 },
        { month: 'Mar', taskEarnings: 2400, gameEarnings: 1900, tasks: 38 },
        { month: 'Apr', taskEarnings: 3200, gameEarnings: 2300, tasks: 41 }
      ]
    };
  };
  // Dummy data for user earnings over time
  const earningsData = [
    { month: 'Jan', gameEarnings: 2400, taskEarnings: 1800, total: 4200 },
    { month: 'Feb', gameEarnings: 3200, taskEarnings: 2100, total: 5300 },
    { month: 'Mar', gameEarnings: 2800, taskEarnings: 2400, total: 5200 },
    { month: 'Apr', gameEarnings: 3800, taskEarnings: 2200, total: 6000 },
    { month: 'May', gameEarnings: 4200, taskEarnings: 2800, total: 7000 },
    { month: 'Jun', gameEarnings: 3600, taskEarnings: 3200, total: 6800 },
  ];

  // Dummy data for top performers
  const topUsers = [
    { name: 'John Smith', totalEarnings: 12540, gameEarnings: 8200, taskEarnings: 4340, tasksCompleted: 156, gamesPlayed: 89 },
    { name: 'Sarah Johnson', totalEarnings: 11230, gameEarnings: 6800, taskEarnings: 4430, tasksCompleted: 142, gamesPlayed: 67 },
    { name: 'Mike Wilson', totalEarnings: 10890, gameEarnings: 7200, taskEarnings: 3690, tasksCompleted: 128, gamesPlayed: 78 },
    { name: 'Emily Davis', totalEarnings: 9650, gameEarnings: 5400, taskEarnings: 4250, tasksCompleted: 134, gamesPlayed: 45 },
    { name: 'Alex Brown', totalEarnings: 8970, gameEarnings: 6100, taskEarnings: 2870, tasksCompleted: 98, gamesPlayed: 62 },
  ];

  // Dummy data for game vs task earnings distribution
  const earningsDistribution = [
    { name: 'Game Earnings', value: 65, color: '#8884d8' },
    { name: 'Task Earnings', value: 35, color: '#82ca9d' },
  ];

  // Dummy data for user activity by day
  const activityData = [
    { day: 'Mon', activeUsers: 245, newUsers: 12 },
    { day: 'Tue', activeUsers: 289, newUsers: 18 },
    { day: 'Wed', activeUsers: 378, newUsers: 25 },
    { day: 'Thu', activeUsers: 321, newUsers: 15 },
    { day: 'Fri', activeUsers: 456, newUsers: 32 },
    { day: 'Sat', activeUsers: 512, newUsers: 28 },
    { day: 'Sun', activeUsers: 387, newUsers: 19 },
  ];

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
            <div className="text-2xl font-bold text-foreground">12,847</div>
            <p className="text-xs text-success">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹284,592</div>
            <p className="text-xs text-success">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹22.15</div>
            <p className="text-xs text-warning">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3,247</div>
            <p className="text-xs text-info">+8% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings">Earnings Overview</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="distribution">Earnings Distribution</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="gameEarnings" stroke="#8884d8" strokeWidth={2} name="Game Earnings" />
                  <Line type="monotone" dataKey="taskEarnings" stroke="#82ca9d" strokeWidth={2} name="Task Earnings" />
                  <Line type="monotone" dataKey="total" stroke="#ff7300" strokeWidth={2} name="Total Earnings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top Performing Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30 cursor-pointer hover:bg-background/50 transition-colors"
                    onClick={() => {
                      setSelectedUser(getUserDetails(user.name));
                      setIsUserModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.tasksCompleted} tasks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.gamesPlayed} games
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{user.totalEarnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Games: ₹{user.gameEarnings} | Tasks: ₹{user.taskEarnings}
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GamepadIcon className="h-5 w-5 text-primary" />
                Game vs Task Earnings Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={earningsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {earningsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Daily User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
                  <Bar dataKey="newUsers" fill="#82ca9d" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedUser?.name} - Detailed Analytics
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">₹{selectedUser.totalEarnings.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Tasks Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedUser.tasksCompleted}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Games Played</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">{selectedUser.gamesPlayed}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Avg Task Earning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">₹{selectedUser.avgTaskEarning}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Task Breakdown by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.taskBreakdown.map((task: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                          <div>
                            <p className="font-medium text-foreground">{task.taskType}</p>
                            <p className="text-xs text-muted-foreground">{task.completed} completed</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">₹{task.earnings}</p>
                            <p className="text-xs text-muted-foreground">₹{task.avgEarning} avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Monthly Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={selectedUser.monthlyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="taskEarnings" fill="#82ca9d" name="Task Earnings" />
                        <Bar dataKey="gameEarnings" fill="#8884d8" name="Game Earnings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAnalytics;