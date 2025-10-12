import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserEarningsBreakdown {
  userId: string;
  userName: string;
  userEmail: string;
  totalEarnings: number;
  taskBreakdown: Array<{
    jobTitle: string;
    taskCount: number;
    earned: number;
  }>;
}

interface TaskDetail {
  id: string;
  amount: number;
  jobTitle: string;
  createdAt: string;
  approvedAt: string;
}

interface UserEarningsTableProps {
  userEarnings: UserEarningsBreakdown[];
  onUserDeleted?: () => void;
}

export default function UserEarningsTable({ userEarnings, onUserDeleted }: UserEarningsTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserEarningsBreakdown | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserEarningsBreakdown | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const handleViewDetails = async (user: UserEarningsBreakdown) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, amount, created_at, approved_at, job_id')
        .eq('user_id', user.userId)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });

      if (tasksError) throw tasksError;

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title');

      if (jobsError) throw jobsError;

      const jobMap = new Map(jobsData?.map(j => [j.id, j.title]) || []);

      const details: TaskDetail[] = tasksData?.map((task: any) => ({
        id: task.id,
        amount: task.amount,
        jobTitle: jobMap.get(task.job_id) || 'Unknown',
        createdAt: task.created_at,
        approvedAt: task.approved_at
      })) || [];

      setTaskDetails(details);
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeletingUser(true);
    try {
      // First try to use the edge function
      try {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId: userToDelete.userId }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        toast.success(`User ${userToDelete.userName} deleted successfully`);
        setUserToDelete(null);
        onUserDeleted?.();
        return;
      } catch (funcError) {
        console.warn('Edge function failed, trying database function:', funcError);
      }

      // Fallback to database function
      const { data, error } = await (supabase as any).rpc('delete_user_account', {
        target_user_id: userToDelete.userId
      });

      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error);
      }
      
      toast.success(`User ${userToDelete.userName} deleted successfully`);
      setUserToDelete(null);
      onUserDeleted?.();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
    } finally {
      setDeletingUser(false);
    }
  };

  if (userEarnings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No user earnings data available</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Total Tasks</TableHead>
            <TableHead className="text-right">Total Earned</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userEarnings.map((user) => (
            <TableRow key={user.userId}>
              <TableCell className="font-medium">{user.userName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{user.userEmail}</TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">
                  {user.taskBreakdown.reduce((sum, task) => sum + task.taskCount, 0)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-lg font-bold text-success">₹{user.totalEarnings.toFixed(2)}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(user)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserToDelete(user)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Earnings Details: {selectedUser?.userName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedUser?.userEmail}</p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-success">₹{selectedUser?.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Tasks Completed</p>
                <p className="text-3xl font-bold text-primary">
                  {selectedUser?.taskBreakdown.reduce((sum, task) => sum + task.taskCount, 0)}
                </p>
              </div>
            </div>

            {/* Task Breakdown by Job */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Earnings by Task Type</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Type</TableHead>
                      <TableHead className="text-right">Tasks Completed</TableHead>
                      <TableHead className="text-right">Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUser?.taskBreakdown.map((task, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{task.jobTitle}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{task.taskCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-success font-semibold">
                          ₹{task.earned.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Detailed Task History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Task History with Dates
              </h3>
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task Type</TableHead>
                        <TableHead>Submitted Date</TableHead>
                        <TableHead>Approved Date</TableHead>
                        <TableHead className="text-right">Amount Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskDetails.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.jobTitle}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(task.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(task.approvedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
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
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.userName}</strong> ({userToDelete?.userEmail})?
              This will permanently delete their account, profile, and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deletingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUser ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
