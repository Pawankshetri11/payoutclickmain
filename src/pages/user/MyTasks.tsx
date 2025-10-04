import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Smartphone,
  Globe,
  Gamepad2,
  MessageSquare,
  Calendar,
  Timer,
  Upload,
  Eye,
  AlertCircle
} from "lucide-react";

export default function MyTasks() {
  const myTasks = [
    {
      id: 1,
      title: "Write Google Review for Restaurant",
      description: "Visit the restaurant and write an honest review",
      category: "review",
      reward: 25,
      status: "in-progress",
      progress: 75,
      startedAt: "2024-01-15",
      deadline: "2024-01-17",
      icon: Star,
      nextStep: "Submit review screenshot"
    },
    {
      id: 2,
      title: "Install Shopping App",
      description: "Download and try the shopping app",
      category: "app",
      reward: 35,
      status: "completed",
      progress: 100,
      startedAt: "2024-01-14",
      completedAt: "2024-01-14",
      icon: Smartphone,
      paidAmount: 35
    },
    {
      id: 3,
      title: "Website Survey",
      description: "Complete survey about online shopping",
      category: "survey",
      reward: 20,
      status: "completed",
      progress: 100,
      startedAt: "2024-01-13",
      completedAt: "2024-01-13",
      icon: Globe,
      paidAmount: 20
    },
    {
      id: 4,
      title: "Play Mobile Game",
      description: "Reach level 5 in the mobile game",
      category: "game",
      reward: 50,
      status: "pending",
      progress: 0,
      startedAt: "2024-01-16",
      deadline: "2024-01-23",
      icon: Gamepad2,
      nextStep: "Download and start playing"
    },
    {
      id: 5,
      title: "Social Media Follow",
      description: "Follow business accounts",
      category: "social",
      reward: 15,
      status: "rejected",
      progress: 100,
      startedAt: "2024-01-12",
      rejectedAt: "2024-01-13",
      icon: MessageSquare,
      rejectionReason: "Did not follow all required accounts"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "in-progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "rejected": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Clock;
      case "pending": return Timer;
      case "rejected": return XCircle;
      default: return AlertCircle;
    }
  };

  const tasksByStatus = {
    all: myTasks,
    pending: myTasks.filter(t => t.status === 'pending'),
    "in-progress": myTasks.filter(t => t.status === 'in-progress'),
    completed: myTasks.filter(t => t.status === 'completed'),
    rejected: myTasks.filter(t => t.status === 'rejected'),
  };

  const totalEarnings = myTasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.reward, 0);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your task progress and earnings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{tasksByStatus.completed.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{tasksByStatus["in-progress"].length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Timer className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{tasksByStatus.pending.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">₹{totalEarnings}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-1">
          <TabsTrigger value="all" className="text-xs md:text-sm">All ({tasksByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs md:text-sm">Pending ({tasksByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs md:text-sm hidden md:inline-flex">In Progress ({tasksByStatus["in-progress"].length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs md:text-sm">Done ({tasksByStatus.completed.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs md:text-sm hidden md:inline-flex">Rejected ({tasksByStatus.rejected.length})</TabsTrigger>
        </TabsList>

        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {tasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <Card key={task.id} className="bg-card/50 backdrop-blur border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <task.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription className="mt-1">{task.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">₹{task.reward}</div>
                            {task.paidAmount && (
                              <div className="text-xs text-green-500">Paid: ₹{task.paidAmount}</div>
                            )}
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(task.status)} flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      {task.status !== 'rejected' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}

                      {/* Task Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started: {new Date(task.startedAt).toLocaleDateString()}
                        </div>
                        {task.deadline && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Next Step or Status Info */}
                      {task.nextStep && task.status === 'in-progress' && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-sm text-blue-600 font-medium">Next Step:</p>
                          <p className="text-sm text-blue-600">{task.nextStep}</p>
                        </div>
                      )}

                      {task.rejectionReason && task.status === 'rejected' && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-600 font-medium">Rejection Reason:</p>
                          <p className="text-sm text-red-600">{task.rejectionReason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {task.status === 'in-progress' && (
                          <>
                            <Button size="sm" className="gap-2">
                              <Upload className="h-4 w-4" />
                              Submit Proof
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </>
                        )}
                        {task.status === 'pending' && (
                          <Button size="sm" className="gap-2">
                            Continue Task
                          </Button>
                        )}
                        {task.status === 'rejected' && (
                          <Button size="sm" variant="outline">
                            Retry Task
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {tasks.length === 0 && (
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No tasks found</p>
                      <p className="text-sm">No tasks with status "{status}" at the moment.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}