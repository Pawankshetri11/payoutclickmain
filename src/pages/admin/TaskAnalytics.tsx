import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Briefcase, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Eye, Users } from "lucide-react";
import { useState } from "react";

const TaskAnalytics = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Dummy data for individual task details
  const getTaskDetails = (taskTitle: string) => {
    return {
      title: taskTitle,
      totalBudget: 15000,
      spentAmount: 8400,
      remainingBudget: 6600,
      totalCompletions: 280,
      totalEarnings: 8400,
      avgEarningPerUser: 30,
      topPerformers: [
        { name: 'John Smith', completions: 12, earnings: 360, avgTime: '18 min' },
        { name: 'Sarah Johnson', completions: 10, earnings: 300, avgTime: '15 min' },
        { name: 'Mike Wilson', completions: 9, earnings: 270, avgTime: '22 min' },
        { name: 'Emily Davis', completions: 8, earnings: 240, avgTime: '17 min' },
        { name: 'Alex Brown', completions: 7, earnings: 210, avgTime: '20 min' }
      ],
      dailyProgress: [
        { date: '2024-01-15', completions: 45, earnings: 1350 },
        { date: '2024-01-16', completions: 52, earnings: 1560 },
        { date: '2024-01-17', completions: 38, earnings: 1140 },
        { date: '2024-01-18', completions: 41, earnings: 1230 },
        { date: '2024-01-19', completions: 49, earnings: 1470 },
        { date: '2024-01-20', completions: 35, earnings: 1050 },
        { date: '2024-01-21', completions: 20, earnings: 600 }
      ]
    };
  };
  // Dummy data for task completion over time
  const taskCompletionData = [
    { month: 'Jan', completed: 890, inProgress: 156, earnings: 12400 },
    { month: 'Feb', completed: 1240, inProgress: 189, earnings: 16800 },
    { month: 'Mar', completed: 1180, inProgress: 203, earnings: 15600 },
    { month: 'Apr', completed: 1560, inProgress: 178, earnings: 21200 },
    { month: 'May', completed: 1820, inProgress: 234, earnings: 25400 },
    { month: 'Jun', completed: 1650, inProgress: 267, earnings: 23100 },
  ];

  // Dummy data for task categories performance
  const taskCategories = [
    { name: 'Data Entry', completed: 2450, earnings: 34200, avgTime: '15 min', color: '#8884d8' },
    { name: 'Content Writing', completed: 1890, earnings: 52600, avgTime: '45 min', color: '#82ca9d' },
    { name: 'Image Tagging', completed: 3200, earnings: 22400, avgTime: '8 min', color: '#ffc658' },
    { name: 'Survey Completion', completed: 1650, earnings: 18200, avgTime: '12 min', color: '#ff7300' },
    { name: 'Product Review', completed: 980, earnings: 28700, avgTime: '25 min', color: '#8dd1e1' },
  ];

  // Dummy data for top earning tasks
  const topEarningTasks = [
    { title: 'Product Review: Electronics', completions: 156, totalEarnings: 4680, avgEarning: 30, difficulty: 'Medium' },
    { title: 'Content Writing: Blog Posts', completions: 89, totalEarnings: 4450, avgEarning: 50, difficulty: 'Hard' },
    { title: 'Data Entry: Customer Info', completions: 234, totalEarnings: 3510, avgEarning: 15, difficulty: 'Easy' },
    { title: 'Survey: Market Research', completions: 198, totalEarnings: 2970, avgEarning: 15, difficulty: 'Easy' },
    { title: 'Image Tagging: E-commerce', completions: 445, totalEarnings: 2670, avgEarning: 6, difficulty: 'Easy' },
  ];

  // Dummy data for task difficulty distribution
  const difficultyDistribution = [
    { name: 'Easy', value: 45, color: '#82ca9d' },
    { name: 'Medium', value: 35, color: '#ffc658' },
    { name: 'Hard', value: 20, color: '#ff7300' },
  ];

  // Dummy data for hourly task completion
  const hourlyData = [
    { hour: '00:00', tasks: 12 },
    { hour: '02:00', tasks: 8 },
    { hour: '04:00', tasks: 5 },
    { hour: '06:00', tasks: 15 },
    { hour: '08:00', tasks: 45 },
    { hour: '10:00', tasks: 78 },
    { hour: '12:00', tasks: 92 },
    { hour: '14:00', tasks: 85 },
    { hour: '16:00', tasks: 96 },
    { hour: '18:00', tasks: 87 },
    { hour: '20:00', tasks: 65 },
    { hour: '22:00', tasks: 34 },
  ];

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
            <div className="text-2xl font-bold text-foreground">8,247</div>
            <p className="text-xs text-success">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹156,900</div>
            <p className="text-xs text-success">+22% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">87.5%</div>
            <p className="text-xs text-success">+3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18.5 min</div>
            <p className="text-xs text-warning">-5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Task Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="top-tasks">Top Tasks</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Task Completion & Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="fill-muted-foreground" />
                  <YAxis yAxisId="left" className="fill-muted-foreground" />
                  <YAxis yAxisId="right" orientation="right" className="fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="completed" fill="#8884d8" name="Completed Tasks" />
                  <Bar yAxisId="left" dataKey="inProgress" fill="#82ca9d" name="In Progress" />
                  <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#ff7300" strokeWidth={2} name="Earnings (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Task Categories Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30">
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {category.completed} completed
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Avg: {category.avgTime}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{category.earnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total earnings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Task Difficulty Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-tasks" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Top Earning Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEarningTasks.map((task, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30 cursor-pointer hover:bg-background/50 transition-colors"
                    onClick={() => {
                      setSelectedTask(getTaskDetails(task.title));
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.completions} completions
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.difficulty === 'Easy' ? 'border-success text-success' :
                              task.difficulty === 'Medium' ? 'border-warning text-warning' :
                              'border-destructive text-destructive'
                            }`}
                          >
                            {task.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{task.totalEarnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₹{task.avgEarning} avg. per task</p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Hourly Task Completion Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="hour" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="tasks" fill="#8884d8" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {selectedTask?.title} - Detailed Analytics
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">₹{selectedTask.totalBudget.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Amount Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">₹{selectedTask.spentAmount.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Remaining Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">₹{selectedTask.remainingBudget.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">₹{selectedTask.totalEarnings.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTask.topPerformers.map((user: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.completions} completions • {user.avgTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">₹{user.earnings}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Daily Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={selectedTask.dailyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="completions" fill="#8884d8" name="Completions" />
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

export default TaskAnalytics;