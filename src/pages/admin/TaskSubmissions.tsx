import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Code,
  Image as ImageIcon
} from "lucide-react";

interface TaskSubmission {
  id: string;
  job_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submission_code?: string; // deprecated, use submitted_code from DB
  submitted_code?: string;
  submitted_image?: string;
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  profiles?: {
    name: string;
    email: string;
  };
  jobs?: {
    title: string;
    type: string;
  };
  completed_reviews?: Array<{
    review_profiles?: {
      name: string;
      platform: string;
    };
  }>;
}

const TaskSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskSubmission | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
    
    // Subscribe to realtime updates for tasks and jobs
    const tasksChannel = supabase
      .channel('task-submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    const jobsChannel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  // Reset job filter if the selected job no longer exists (e.g., after job deletion)
  useEffect(() => {
    if (selectedJobId !== 'all' && !tasks.some((t) => t.job_id === selectedJobId)) {
      setSelectedJobId('all');
    }
  }, [tasks]);
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks with user profiles and job details
      const { data: tasksData, error: tasksError } = await (supabase as any)
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch all user profiles
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('user_id, name, email');

      // Fetch all jobs
      const { data: jobsData } = await (supabase as any)
        .from('jobs')
        .select('id, title, type');

      // Fetch review profiles (for name/url mapping)
      const { data: reviewProfilesData } = await (supabase as any)
        .from('review_profiles')
        .select('id, name, profile_url');

      // Fetch completed_reviews with profile_id and task_id
      const { data: completedReviewsData } = await (supabase as any)
        .from('completed_reviews')
        .select('task_id, profile_id');

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map((p: any) => [p.user_id, p]) || []);
      const jobsMap = new Map(jobsData?.map((j: any) => [j.id, j]) || []);
      const reviewProfilesMap = new Map<string, any>(reviewProfilesData?.map((rp: any) => [rp.id, rp]) || []);
      const completedReviewsMap = new Map<string, any[]>();
      
      completedReviewsData?.forEach((cr: any) => {
        const rp = reviewProfilesMap.get(cr.profile_id) as any;
        if (!completedReviewsMap.has(cr.task_id)) {
          completedReviewsMap.set(cr.task_id, []);
        }
        if (rp) {
          completedReviewsMap.get(cr.task_id)?.push({
            review_profiles: {
              name: rp.name,
              platform: rp.profile_url
            }
          });
        }
      });

      // Combine data
      const enrichedTasks = tasksData?.map((task: any) => ({
        ...task,
        profiles: profilesMap.get(task.user_id) || null,
        jobs: jobsMap.get(task.job_id) || null,
        completed_reviews: completedReviewsMap.get(task.id) || []
      })) || [];

      setTasks(enrichedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load task submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    setActionLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update task status
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'approved',
          admin_notes: adminNotes,
          approved_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Credit earnings to user balance
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', task.user_id)
        .single();

      if (profileFetchError) throw profileFetchError;

      const newBalance = ((profile as any).balance || 0) + task.amount;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance
        })
        .eq('user_id', task.user_id);

      if (profileError) throw profileError;

      // Update job completed count
      const { data: jobData } = await supabase
        .from('jobs')
        .select('completed')
        .eq('id', task.job_id)
        .single();

      if (jobData) {
        await supabase
          .from('jobs')
          .update({ completed: ((jobData as any).completed || 0) + 1 })
          .eq('id', task.job_id);
      }

      toast.success('Task approved and earnings credited!');
      setViewModalOpen(false);
      setAdminNotes("");
      fetchTasks();
    } catch (error: any) {
      console.error('Error approving task:', error);
      toast.error('Failed to approve task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (taskId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'rejected',
          admin_notes: adminNotes || 'Task did not meet requirements'
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task rejected');
      setViewModalOpen(false);
      setAdminNotes("");
      fetchTasks();
    } catch (error: any) {
      console.error('Error rejecting task:', error);
      toast.error('Failed to reject task');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredByJob = selectedJobId === 'all' ? tasks : tasks.filter(t => t.job_id === selectedJobId);
  const filteredTasks = filteredByJob.filter(task => {
    const matchesSearch = 
      task.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const approvedTasks = filteredTasks.filter(t => t.status === 'approved');
  const rejectedTasks = filteredTasks.filter(t => t.status === 'rejected');
  const allTasks = filteredTasks;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            Task Submissions
          </h1>
          <p className="text-muted-foreground">Review and approve user task submissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-xl font-bold text-warning">{pendingTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold text-success">{approvedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold text-destructive">{rejectedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {Array.from(new Map(tasks.map(t => [t.job_id, t.jobs?.title || 'Unknown Job'])).entries()).map(([id, title]) => (
                <SelectItem key={id} value={id}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>Task Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({allTasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedTasks.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedTasks.length})</TabsTrigger>
            </TabsList>
            
            {['all', 'pending', 'approved', 'rejected'].map((status) => {
              const statusTasks = status === 'all' ? allTasks :
                                 status === 'pending' ? pendingTasks : 
                                 status === 'approved' ? approvedTasks : rejectedTasks;
              
              return (
                <TabsContent key={status} value={status}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Review Profile</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </TableCell>
                        </TableRow>
                      ) : statusTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No {status === 'all' ? '' : status} tasks found
                          </TableCell>
                        </TableRow>
                      ) : (
                        statusTasks.map((task) => {
                          const reviewProfile = task.completed_reviews?.[0]?.review_profiles;
                          const isReviewJob = task.jobs?.type === 'review';
                          
                          return (
                            <TableRow key={task.id} className="hover:bg-accent/50">
                              <TableCell>
                                <div>
                                  <div className="font-medium">{task.profiles?.name || 'Unknown User'}</div>
                                  <div className="text-xs text-muted-foreground">{task.profiles?.email || 'No email'}</div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{task.jobs?.title || 'Unknown Job'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {task.jobs?.type === 'code' ? (
                                    <>
                                      <Code className="h-3 w-3" />
                                      <span className="text-xs">Code</span>
                                    </>
                                  ) : task.jobs?.type === 'review' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">Review</span>
                                    </>
                                  ) : (
                                    <>
                                      <ImageIcon className="h-3 w-3" />
                                      <span className="text-xs">Image</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {isReviewJob && reviewProfile ? (
                                  <div className="text-sm">
                                    <div className="font-medium">{reviewProfile.name}</div>
                                    <div className="text-xs text-muted-foreground">{reviewProfile.platform}</div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="font-medium text-success">₹{task.amount}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(task.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{getStatusBadge(task.status)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setAdminNotes(task.admin_notes || "");
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* View Task Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Submission Details</DialogTitle>
            <DialogDescription>
              Review and approve or reject this task submission
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm font-medium">{selectedTask.profiles?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTask.profiles?.email}</p>
                </div>
                <div>
                  <Label>Job</Label>
                  <p className="text-sm font-medium">{selectedTask.jobs?.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium text-success">₹{selectedTask.amount}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                </div>
              </div>

              {selectedTask.submitted_code && (
                <div>
                  <Label>Submitted Code</Label>
                  <p className="text-sm font-medium p-2 bg-muted rounded">{selectedTask.submitted_code}</p>
                </div>
              )}

              {selectedTask.submitted_image && (
                <div>
                  <Label>Submitted Image</Label>
                  <img 
                    src={selectedTask.submitted_image} 
                    alt="Task submission" 
                    className="max-w-full rounded-lg border border-border mt-2"
                  />
                </div>
              )}

              {selectedTask.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="text-sm p-2 bg-muted rounded">{selectedTask.admin_notes}</p>
                </div>
              )}

              {selectedTask.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="admin-notes"
                      placeholder="Add notes about this submission..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setViewModalOpen(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(selectedTask.id)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleApprove(selectedTask.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Processing...' : 'Approve & Credit'}
                    </Button>
                  </div>
                </>
              )}

              {selectedTask.status !== 'pending' && (
                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskSubmissions;
