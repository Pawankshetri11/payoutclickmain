import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";
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
  AlertCircle,
  Code,
  Image as ImageIcon
} from "lucide-react";

export default function MyTasks() {
  const { tasks, loading } = useTasks();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "rejected": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved": return CheckCircle;
      case "pending": return Timer;
      case "rejected": return XCircle;
      default: return AlertCircle;
    }
  };

  const tasksByStatus = {
    all: tasks,
    pending: tasks.filter(t => t.status === 'pending'),
    approved: tasks.filter(t => t.status === 'approved'),
    rejected: tasks.filter(t => t.status === 'rejected'),
  };

  const totalEarnings = tasks
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const getTaskIcon = (type: string) => {
    return type === 'code' ? Code : ImageIcon;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  <p className="text-2xl font-bold text-foreground">{tasksByStatus.approved.length}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
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
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{tasksByStatus.rejected.length}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="all" className="text-xs md:text-sm">All ({tasksByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs md:text-sm">Pending ({tasksByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs md:text-sm">Approved ({tasksByStatus.approved.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs md:text-sm">Rejected ({tasksByStatus.rejected.length})</TabsTrigger>
        </TabsList>

        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {statusTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                const TaskIcon = getTaskIcon(task.jobs?.type || 'code');
                return (
                  <Card key={task.id} className="bg-card/50 backdrop-blur border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between flex-col md:flex-row gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <TaskIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{task.jobs?.title || 'Task'}</CardTitle>
                            <CardDescription className="mt-1">
                              {task.jobs?.category || 'General'}
                              {task.jobs?.type === 'review' && task.review_profile?.name && (
                                <span className="block">Review Profile: {task.review_profile.name}</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">₹{task.amount}</div>
                            {task.status === 'approved' && (
                              <div className="text-xs text-green-500">Approved</div>
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
                      {/* Task Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Submitted: {new Date(task.submitted_at).toLocaleDateString()}
                        </div>
                        {task.approved_at && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Approved: {new Date(task.approved_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Admin Notes */}
                      {task.admin_notes && (
                        <div className={`p-3 rounded-lg border ${
                          task.status === 'rejected' 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <p className={`text-sm font-medium ${
                            task.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {task.status === 'rejected' ? 'Rejection Reason:' : 'Admin Notes:'}
                          </p>
                          <p className={`text-sm ${
                            task.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {task.admin_notes}
                          </p>
                        </div>
                      )}

                      {/* Submission Details */}
                      {task.submitted_image && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Submitted Image:</p>
                          <img 
                            src={task.submitted_image} 
                            alt="Submission" 
                            className="max-w-xs rounded border"
                          />
                        </div>
                      )}
                      {task.submitted_code && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Submitted Code:</p>
                          <p className="font-mono text-sm">{task.submitted_code}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {statusTasks.length === 0 && (
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