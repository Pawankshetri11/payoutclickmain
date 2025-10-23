import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Briefcase, Users as UsersIcon, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskEarningsBreakdown {
  jobId: string;
  jobTitle: string;
  totalEarnings: number;
  totalTasks: number;
  userBreakdown: Array<{
    userName: string;
    userEmail: string;
    taskCount: number;
    earned: number;
  }>;
}

interface UserTaskDetail {
  userId: string;
  userName: string;
  userEmail: string;
  tasks: Array<{
    id: string;
    amount: number;
    createdAt: string;
    approvedAt: string;
  }>;
}

interface TaskEarningsTableProps {
  taskEarnings: TaskEarningsBreakdown[];
}

export default function TaskEarningsTable({ taskEarnings }: TaskEarningsTableProps) {
  const [selectedTask, setSelectedTask] = useState<TaskEarningsBreakdown | null>(null);
  const [userTaskDetails, setUserTaskDetails] = useState<UserTaskDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (task: TaskEarningsBreakdown) => {
    setSelectedTask(task);
    setLoadingDetails(true);
    
    try {
      // Fetch tasks separately
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, user_id, amount, created_at, approved_at')
        .eq('job_id', task.jobId)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch profiles separately - use user_id field to match tasks
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (profilesError) throw profilesError;

      // Create profile map using user_id as key
      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Group by user
      const userMap = new Map<string, UserTaskDetail>();
      tasksData?.forEach((taskData: any) => {
        const userId = taskData.user_id;
        const profile = profileMap.get(userId);
        const userName = profile?.name || 'Unknown User';
        const userEmail = profile?.email || 'No email';

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            userName,
            userEmail,
            tasks: []
          });
        }

        userMap.get(userId)!.tasks.push({
          id: taskData.id,
          amount: taskData.amount,
          createdAt: taskData.created_at,
          approvedAt: taskData.approved_at
        });
      });

      setUserTaskDetails(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (taskEarnings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No task earnings data available</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task/Job Title</TableHead>
            <TableHead className="text-right">Total Completions</TableHead>
            <TableHead className="text-right">Unique Users</TableHead>
            <TableHead className="text-right">Total Paid</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taskEarnings.map((task) => (
            <TableRow key={task.jobId}>
              <TableCell className="font-medium">{task.jobTitle}</TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{task.totalTasks}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{task.userBreakdown.length}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-lg font-bold text-success">₹{task.totalEarnings.toFixed(2)}</span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(task)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Task Performance: {selectedTask?.jobTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-success">₹{selectedTask?.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-primary">{selectedTask?.totalTasks}</p>
              </div>
              <div className="bg-gradient-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Unique Users</p>
                <p className="text-3xl font-bold text-warning">{selectedTask?.userBreakdown.length}</p>
              </div>
            </div>

            {/* User Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                User Performance Summary
              </h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Tasks Completed</TableHead>
                      <TableHead className="text-right">Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTask?.userBreakdown.map((user, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.userEmail}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{user.taskCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-success font-semibold">
                          ₹{user.earned.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Complete Task Timeline by User
              </h3>
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTaskDetails.map((userDetail) => (
                    <div key={userDetail.userId} className="border border-border rounded-lg p-4">
                      <div className="mb-3 pb-2 border-b border-border">
                        <h4 className="font-semibold text-foreground">{userDetail.userName}</h4>
                        <p className="text-sm text-muted-foreground">{userDetail.userEmail}</p>
                        <p className="text-sm text-primary mt-1">
                          {userDetail.tasks.length} task{userDetail.tasks.length !== 1 ? 's' : ''} completed
                        </p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Submitted Date</TableHead>
                            <TableHead>Approved Date</TableHead>
                            <TableHead className="text-right">Amount Earned</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetail.tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(task.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(task.approvedAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell className="text-right text-success font-semibold">
                                ₹{task.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
